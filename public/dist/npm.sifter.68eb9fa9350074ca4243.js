(self["webpackChunkdmeta"] = self["webpackChunkdmeta"] || []).push([["npm.sifter"],{

/***/ "./node_modules/sifter/sifter.js":
/*!***************************************!*\
  !*** ./node_modules/sifter/sifter.js ***!
  \***************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: top-level-this-exports, __webpack_require__, __webpack_exports__, module */
/*! CommonJS bailout: this is used directly at 25:2-6 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
 * sifter.js
 * Copyright (c) 2013 Brian Reavis & contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this
 * file except in compliance with the License. You may obtain a copy of the License at:
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF
 * ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 *
 * @author Brian Reavis <brian@thirdroute.com>
 */

(function(root, factory) {
	if (true) {
		!(__WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
		__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
		(__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) :
		__WEBPACK_AMD_DEFINE_FACTORY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else {}
}(this, function() {

	/**
	 * Textually searches arrays and hashes of objects
	 * by property (or multiple properties). Designed
	 * specifically for autocomplete.
	 *
	 * @constructor
	 * @param {array|object} items
	 * @param {object} items
	 */
	var Sifter = function(items, settings) {
		this.items = items;
		this.settings = settings || {diacritics: true};
	};

	/**
	 * Splits a search string into an array of individual
	 * regexps to be used to match results.
	 *
	 * @param {string} query
	 * @returns {array}
	 */
	Sifter.prototype.tokenize = function(query) {
		query = trim(String(query || '').toLowerCase());
		if (!query || !query.length) return [];

		var i, n, regex, letter;
		var tokens = [];
		var words = query.split(/ +/);

		for (i = 0, n = words.length; i < n; i++) {
			regex = escape_regex(words[i]);
			if (this.settings.diacritics) {
				for (letter in DIACRITICS) {
					if (DIACRITICS.hasOwnProperty(letter)) {
						regex = regex.replace(new RegExp(letter, 'g'), DIACRITICS[letter]);
					}
				}
			}
			tokens.push({
				string : words[i],
				regex  : new RegExp(regex, 'i')
			});
		}

		return tokens;
	};

	/**
	 * Iterates over arrays and hashes.
	 *
	 * ```
	 * this.iterator(this.items, function(item, id) {
	 *    // invoked for each item
	 * });
	 * ```
	 *
	 * @param {array|object} object
	 */
	Sifter.prototype.iterator = function(object, callback) {
		var iterator;
		if (is_array(object)) {
			iterator = Array.prototype.forEach || function(callback) {
				for (var i = 0, n = this.length; i < n; i++) {
					callback(this[i], i, this);
				}
			};
		} else {
			iterator = function(callback) {
				for (var key in this) {
					if (this.hasOwnProperty(key)) {
						callback(this[key], key, this);
					}
				}
			};
		}

		iterator.apply(object, [callback]);
	};

	/**
	 * Returns a function to be used to score individual results.
	 *
	 * Good matches will have a higher score than poor matches.
	 * If an item is not a match, 0 will be returned by the function.
	 *
	 * @param {object|string} search
	 * @param {object} options (optional)
	 * @returns {function}
	 */
	Sifter.prototype.getScoreFunction = function(search, options) {
		var self, fields, tokens, token_count, nesting;

		self        = this;
		search      = self.prepareSearch(search, options);
		tokens      = search.tokens;
		fields      = search.options.fields;
		token_count = tokens.length;
		nesting     = search.options.nesting;

		/**
		 * Calculates how close of a match the
		 * given value is against a search token.
		 *
		 * @param {mixed} value
		 * @param {object} token
		 * @return {number}
		 */
		var scoreValue = function(value, token) {
			var score, pos;

			if (!value) return 0;
			value = String(value || '');
			pos = value.search(token.regex);
			if (pos === -1) return 0;
			score = token.string.length / value.length;
			if (pos === 0) score += 0.5;
			return score;
		};

		/**
		 * Calculates the score of an object
		 * against the search query.
		 *
		 * @param {object} token
		 * @param {object} data
		 * @return {number}
		 */
		var scoreObject = (function() {
			var field_count = fields.length;
			if (!field_count) {
				return function() { return 0; };
			}
			if (field_count === 1) {
				return function(token, data) {
					return scoreValue(getattr(data, fields[0], nesting), token);
				};
			}
			return function(token, data) {
				for (var i = 0, sum = 0; i < field_count; i++) {
					sum += scoreValue(getattr(data, fields[i], nesting), token);
				}
				return sum / field_count;
			};
		})();

		if (!token_count) {
			return function() { return 0; };
		}
		if (token_count === 1) {
			return function(data) {
				return scoreObject(tokens[0], data);
			};
		}

		if (search.options.conjunction === 'and') {
			return function(data) {
				var score;
				for (var i = 0, sum = 0; i < token_count; i++) {
					score = scoreObject(tokens[i], data);
					if (score <= 0) return 0;
					sum += score;
				}
				return sum / token_count;
			};
		} else {
			return function(data) {
				for (var i = 0, sum = 0; i < token_count; i++) {
					sum += scoreObject(tokens[i], data);
				}
				return sum / token_count;
			};
		}
	};

	/**
	 * Returns a function that can be used to compare two
	 * results, for sorting purposes. If no sorting should
	 * be performed, `null` will be returned.
	 *
	 * @param {string|object} search
	 * @param {object} options
	 * @return function(a,b)
	 */
	Sifter.prototype.getSortFunction = function(search, options) {
		var i, n, self, field, fields, fields_count, multiplier, multipliers, get_field, implicit_score, sort;

		self   = this;
		search = self.prepareSearch(search, options);
		sort   = (!search.query && options.sort_empty) || options.sort;

		/**
		 * Fetches the specified sort field value
		 * from a search result item.
		 *
		 * @param  {string} name
		 * @param  {object} result
		 * @return {mixed}
		 */
		get_field = function(name, result) {
			if (name === '$score') return result.score;
			return getattr(self.items[result.id], name, options.nesting);
		};

		// parse options
		fields = [];
		if (sort) {
			for (i = 0, n = sort.length; i < n; i++) {
				if (search.query || sort[i].field !== '$score') {
					fields.push(sort[i]);
				}
			}
		}

		// the "$score" field is implied to be the primary
		// sort field, unless it's manually specified
		if (search.query) {
			implicit_score = true;
			for (i = 0, n = fields.length; i < n; i++) {
				if (fields[i].field === '$score') {
					implicit_score = false;
					break;
				}
			}
			if (implicit_score) {
				fields.unshift({field: '$score', direction: 'desc'});
			}
		} else {
			for (i = 0, n = fields.length; i < n; i++) {
				if (fields[i].field === '$score') {
					fields.splice(i, 1);
					break;
				}
			}
		}

		multipliers = [];
		for (i = 0, n = fields.length; i < n; i++) {
			multipliers.push(fields[i].direction === 'desc' ? -1 : 1);
		}

		// build function
		fields_count = fields.length;
		if (!fields_count) {
			return null;
		} else if (fields_count === 1) {
			field = fields[0].field;
			multiplier = multipliers[0];
			return function(a, b) {
				return multiplier * cmp(
					get_field(field, a),
					get_field(field, b)
				);
			};
		} else {
			return function(a, b) {
				var i, result, a_value, b_value, field;
				for (i = 0; i < fields_count; i++) {
					field = fields[i].field;
					result = multipliers[i] * cmp(
						get_field(field, a),
						get_field(field, b)
					);
					if (result) return result;
				}
				return 0;
			};
		}
	};

	/**
	 * Parses a search query and returns an object
	 * with tokens and fields ready to be populated
	 * with results.
	 *
	 * @param {string} query
	 * @param {object} options
	 * @returns {object}
	 */
	Sifter.prototype.prepareSearch = function(query, options) {
		if (typeof query === 'object') return query;

		options = extend({}, options);

		var option_fields     = options.fields;
		var option_sort       = options.sort;
		var option_sort_empty = options.sort_empty;

		if (option_fields && !is_array(option_fields)) options.fields = [option_fields];
		if (option_sort && !is_array(option_sort)) options.sort = [option_sort];
		if (option_sort_empty && !is_array(option_sort_empty)) options.sort_empty = [option_sort_empty];

		return {
			options : options,
			query   : String(query || '').toLowerCase(),
			tokens  : this.tokenize(query),
			total   : 0,
			items   : []
		};
	};

	/**
	 * Searches through all items and returns a sorted array of matches.
	 *
	 * The `options` parameter can contain:
	 *
	 *   - fields {string|array}
	 *   - sort {array}
	 *   - score {function}
	 *   - filter {bool}
	 *   - limit {integer}
	 *
	 * Returns an object containing:
	 *
	 *   - options {object}
	 *   - query {string}
	 *   - tokens {array}
	 *   - total {int}
	 *   - items {array}
	 *
	 * @param {string} query
	 * @param {object} options
	 * @returns {object}
	 */
	Sifter.prototype.search = function(query, options) {
		var self = this, value, score, search, calculateScore;
		var fn_sort;
		var fn_score;

		search  = this.prepareSearch(query, options);
		options = search.options;
		query   = search.query;

		// generate result scoring function
		fn_score = options.score || self.getScoreFunction(search);

		// perform search and sort
		if (query.length) {
			self.iterator(self.items, function(item, id) {
				score = fn_score(item);
				if (options.filter === false || score > 0) {
					search.items.push({'score': score, 'id': id});
				}
			});
		} else {
			self.iterator(self.items, function(item, id) {
				search.items.push({'score': 1, 'id': id});
			});
		}

		fn_sort = self.getSortFunction(search, options);
		if (fn_sort) search.items.sort(fn_sort);

		// apply limits
		search.total = search.items.length;
		if (typeof options.limit === 'number') {
			search.items = search.items.slice(0, options.limit);
		}

		return search;
	};

	// utilities
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	var cmp = function(a, b) {
		if (typeof a === 'number' && typeof b === 'number') {
			return a > b ? 1 : (a < b ? -1 : 0);
		}
		a = asciifold(String(a || ''));
		b = asciifold(String(b || ''));
		if (a > b) return 1;
		if (b > a) return -1;
		return 0;
	};

	var extend = function(a, b) {
		var i, n, k, object;
		for (i = 1, n = arguments.length; i < n; i++) {
			object = arguments[i];
			if (!object) continue;
			for (k in object) {
				if (object.hasOwnProperty(k)) {
					a[k] = object[k];
				}
			}
		}
		return a;
	};

	/**
	 * A property getter resolving dot-notation
	 * @param  {Object}  obj     The root object to fetch property on
	 * @param  {String}  name    The optionally dotted property name to fetch
	 * @param  {Boolean} nesting Handle nesting or not
	 * @return {Object}          The resolved property value
	 */
	var getattr = function(obj, name, nesting) {
	    if (!obj || !name) return;
	    if (!nesting) return obj[name];
	    var names = name.split(".");
	    while(names.length && (obj = obj[names.shift()]));
	    return obj;
	};

	var trim = function(str) {
		return (str + '').replace(/^\s+|\s+$|/g, '');
	};

	var escape_regex = function(str) {
		return (str + '').replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1');
	};

	var is_array = Array.isArray || (typeof $ !== 'undefined' && $.isArray) || function(object) {
		return Object.prototype.toString.call(object) === '[object Array]';
	};

	var DIACRITICS = {
		'a': '[aḀḁĂăÂâǍǎȺⱥȦȧẠạÄäÀàÁáĀāÃãÅåąĄÃąĄ]',
		'b': '[b␢βΒB฿𐌁ᛒ]',
		'c': '[cĆćĈĉČčĊċC̄c̄ÇçḈḉȻȼƇƈɕᴄＣｃ]',
		'd': '[dĎďḊḋḐḑḌḍḒḓḎḏĐđD̦d̦ƉɖƊɗƋƌᵭᶁᶑȡᴅＤｄð]',
		'e': '[eÉéÈèÊêḘḙĚěĔĕẼẽḚḛẺẻĖėËëĒēȨȩĘęᶒɆɇȄȅẾếỀềỄễỂểḜḝḖḗḔḕȆȇẸẹỆệⱸᴇＥｅɘǝƏƐε]',
		'f': '[fƑƒḞḟ]',
		'g': '[gɢ₲ǤǥĜĝĞğĢģƓɠĠġ]',
		'h': '[hĤĥĦħḨḩẖẖḤḥḢḣɦʰǶƕ]',
		'i': '[iÍíÌìĬĭÎîǏǐÏïḮḯĨĩĮįĪīỈỉȈȉȊȋỊịḬḭƗɨɨ̆ᵻᶖİiIıɪＩｉ]',
		'j': '[jȷĴĵɈɉʝɟʲ]',
		'k': '[kƘƙꝀꝁḰḱǨǩḲḳḴḵκϰ₭]',
		'l': '[lŁłĽľĻļĹĺḶḷḸḹḼḽḺḻĿŀȽƚⱠⱡⱢɫɬᶅɭȴʟＬｌ]',
		'n': '[nŃńǸǹŇňÑñṄṅŅņṆṇṊṋṈṉN̈n̈ƝɲȠƞᵰᶇɳȵɴＮｎŊŋ]',
		'o': '[oØøÖöÓóÒòÔôǑǒŐőŎŏȮȯỌọƟɵƠơỎỏŌōÕõǪǫȌȍՕօ]',
		'p': '[pṔṕṖṗⱣᵽƤƥᵱ]',
		'q': '[qꝖꝗʠɊɋꝘꝙq̃]',
		'r': '[rŔŕɌɍŘřŖŗṘṙȐȑȒȓṚṛⱤɽ]',
		's': '[sŚśṠṡṢṣꞨꞩŜŝŠšŞşȘșS̈s̈]',
		't': '[tŤťṪṫŢţṬṭƮʈȚțṰṱṮṯƬƭ]',
		'u': '[uŬŭɄʉỤụÜüÚúÙùÛûǓǔŰűŬŭƯưỦủŪūŨũŲųȔȕ∪]',
		'v': '[vṼṽṾṿƲʋꝞꝟⱱʋ]',
		'w': '[wẂẃẀẁŴŵẄẅẆẇẈẉ]',
		'x': '[xẌẍẊẋχ]',
		'y': '[yÝýỲỳŶŷŸÿỸỹẎẏỴỵɎɏƳƴ]',
		'z': '[zŹźẐẑŽžŻżẒẓẔẕƵƶ]'
	};

	var asciifold = (function() {
		var i, n, k, chunk;
		var foreignletters = '';
		var lookup = {};
		for (k in DIACRITICS) {
			if (DIACRITICS.hasOwnProperty(k)) {
				chunk = DIACRITICS[k].substring(2, DIACRITICS[k].length - 1);
				foreignletters += chunk;
				for (i = 0, n = chunk.length; i < n; i++) {
					lookup[chunk.charAt(i)] = k;
				}
			}
		}
		var regexp = new RegExp('[' +  foreignletters + ']', 'g');
		return function(str) {
			return str.replace(regexp, function(foreignletter) {
				return lookup[foreignletter];
			}).toLowerCase();
		};
	})();


	// export
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	return Sifter;
}));



/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9kbWV0YS8uL25vZGVfbW9kdWxlcy9zaWZ0ZXIvc2lmdGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrRUFBa0U7QUFDbEU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxLQUFLLElBQTBDO0FBQy9DLEVBQUUsb0NBQU8sT0FBTztBQUFBO0FBQUE7QUFBQTtBQUFBLGtHQUFDO0FBQ2pCLEVBQUUsTUFBTSxFQUlOO0FBQ0YsQ0FBQzs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLGFBQWE7QUFDekIsWUFBWSxPQUFPO0FBQ25CO0FBQ0E7QUFDQTtBQUNBLCtCQUErQjtBQUMvQjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVksT0FBTztBQUNuQixjQUFjO0FBQ2Q7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBLCtCQUErQixPQUFPO0FBQ3RDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLFlBQVksYUFBYTtBQUN6QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0NBQW9DLE9BQU87QUFDM0M7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLGNBQWM7QUFDMUIsWUFBWSxPQUFPO0FBQ25CLGNBQWM7QUFDZDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FB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LE9BQU87QUFDcEIsYUFBYSxPQUFPO0FBQ3BCLGFBQWEsUUFBUTtBQUNyQixhQUFhLE9BQU87QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw4Q0FBOEM7QUFDOUM7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUNBQWlDLE9BQU87QUFDeEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBLEVBQUU7OztBQUdGO0FBQ0E7O0FBRUE7QUFDQSxDQUFDIiwiZmlsZSI6Im5wbS5zaWZ0ZXIuNjhlYjlmYTkzNTAwNzRjYTQyNDMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIHNpZnRlci5qc1xuICogQ29weXJpZ2h0IChjKSAyMDEzIEJyaWFuIFJlYXZpcyAmIGNvbnRyaWJ1dG9yc1xuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7IHlvdSBtYXkgbm90IHVzZSB0aGlzXG4gKiBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdDpcbiAqIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmUgZGlzdHJpYnV0ZWQgdW5kZXJcbiAqIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUywgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0ZcbiAqIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZVxuICogZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZCBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqXG4gKiBAYXV0aG9yIEJyaWFuIFJlYXZpcyA8YnJpYW5AdGhpcmRyb3V0ZS5jb20+XG4gKi9cblxuKGZ1bmN0aW9uKHJvb3QsIGZhY3RvcnkpIHtcblx0aWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuXHRcdGRlZmluZShmYWN0b3J5KTtcblx0fSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcblx0fSBlbHNlIHtcblx0XHRyb290LlNpZnRlciA9IGZhY3RvcnkoKTtcblx0fVxufSh0aGlzLCBmdW5jdGlvbigpIHtcblxuXHQvKipcblx0ICogVGV4dHVhbGx5IHNlYXJjaGVzIGFycmF5cyBhbmQgaGFzaGVzIG9mIG9iamVjdHNcblx0ICogYnkgcHJvcGVydHkgKG9yIG11bHRpcGxlIHByb3BlcnRpZXMpLiBEZXNpZ25lZFxuXHQgKiBzcGVjaWZpY2FsbHkgZm9yIGF1dG9jb21wbGV0ZS5cblx0ICpcblx0ICogQGNvbnN0cnVjdG9yXG5cdCAqIEBwYXJhbSB7YXJyYXl8b2JqZWN0fSBpdGVtc1xuXHQgKiBAcGFyYW0ge29iamVjdH0gaXRlbXNcblx0ICovXG5cdHZhciBTaWZ0ZXIgPSBmdW5jdGlvbihpdGVtcywgc2V0dGluZ3MpIHtcblx0XHR0aGlzLml0ZW1zID0gaXRlbXM7XG5cdFx0dGhpcy5zZXR0aW5ncyA9IHNldHRpbmdzIHx8IHtkaWFjcml0aWNzOiB0cnVlfTtcblx0fTtcblxuXHQvKipcblx0ICogU3BsaXRzIGEgc2VhcmNoIHN0cmluZyBpbnRvIGFuIGFycmF5IG9mIGluZGl2aWR1YWxcblx0ICogcmVnZXhwcyB0byBiZSB1c2VkIHRvIG1hdGNoIHJlc3VsdHMuXG5cdCAqXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBxdWVyeVxuXHQgKiBAcmV0dXJucyB7YXJyYXl9XG5cdCAqL1xuXHRTaWZ0ZXIucHJvdG90eXBlLnRva2VuaXplID0gZnVuY3Rpb24ocXVlcnkpIHtcblx0XHRxdWVyeSA9IHRyaW0oU3RyaW5nKHF1ZXJ5IHx8ICcnKS50b0xvd2VyQ2FzZSgpKTtcblx0XHRpZiAoIXF1ZXJ5IHx8ICFxdWVyeS5sZW5ndGgpIHJldHVybiBbXTtcblxuXHRcdHZhciBpLCBuLCByZWdleCwgbGV0dGVyO1xuXHRcdHZhciB0b2tlbnMgPSBbXTtcblx0XHR2YXIgd29yZHMgPSBxdWVyeS5zcGxpdCgvICsvKTtcblxuXHRcdGZvciAoaSA9IDAsIG4gPSB3b3Jkcy5sZW5ndGg7IGkgPCBuOyBpKyspIHtcblx0XHRcdHJlZ2V4ID0gZXNjYXBlX3JlZ2V4KHdvcmRzW2ldKTtcblx0XHRcdGlmICh0aGlzLnNldHRpbmdzLmRpYWNyaXRpY3MpIHtcblx0XHRcdFx0Zm9yIChsZXR0ZXIgaW4gRElBQ1JJVElDUykge1xuXHRcdFx0XHRcdGlmIChESUFDUklUSUNTLmhhc093blByb3BlcnR5KGxldHRlcikpIHtcblx0XHRcdFx0XHRcdHJlZ2V4ID0gcmVnZXgucmVwbGFjZShuZXcgUmVnRXhwKGxldHRlciwgJ2cnKSwgRElBQ1JJVElDU1tsZXR0ZXJdKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHRva2Vucy5wdXNoKHtcblx0XHRcdFx0c3RyaW5nIDogd29yZHNbaV0sXG5cdFx0XHRcdHJlZ2V4ICA6IG5ldyBSZWdFeHAocmVnZXgsICdpJylcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdHJldHVybiB0b2tlbnM7XG5cdH07XG5cblx0LyoqXG5cdCAqIEl0ZXJhdGVzIG92ZXIgYXJyYXlzIGFuZCBoYXNoZXMuXG5cdCAqXG5cdCAqIGBgYFxuXHQgKiB0aGlzLml0ZXJhdG9yKHRoaXMuaXRlbXMsIGZ1bmN0aW9uKGl0ZW0sIGlkKSB7XG5cdCAqICAgIC8vIGludm9rZWQgZm9yIGVhY2ggaXRlbVxuXHQgKiB9KTtcblx0ICogYGBgXG5cdCAqXG5cdCAqIEBwYXJhbSB7YXJyYXl8b2JqZWN0fSBvYmplY3Rcblx0ICovXG5cdFNpZnRlci5wcm90b3R5cGUuaXRlcmF0b3IgPSBmdW5jdGlvbihvYmplY3QsIGNhbGxiYWNrKSB7XG5cdFx0dmFyIGl0ZXJhdG9yO1xuXHRcdGlmIChpc19hcnJheShvYmplY3QpKSB7XG5cdFx0XHRpdGVyYXRvciA9IEFycmF5LnByb3RvdHlwZS5mb3JFYWNoIHx8IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG5cdFx0XHRcdGZvciAodmFyIGkgPSAwLCBuID0gdGhpcy5sZW5ndGg7IGkgPCBuOyBpKyspIHtcblx0XHRcdFx0XHRjYWxsYmFjayh0aGlzW2ldLCBpLCB0aGlzKTtcblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0aXRlcmF0b3IgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuXHRcdFx0XHRmb3IgKHZhciBrZXkgaW4gdGhpcykge1xuXHRcdFx0XHRcdGlmICh0aGlzLmhhc093blByb3BlcnR5KGtleSkpIHtcblx0XHRcdFx0XHRcdGNhbGxiYWNrKHRoaXNba2V5XSwga2V5LCB0aGlzKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0aXRlcmF0b3IuYXBwbHkob2JqZWN0LCBbY2FsbGJhY2tdKTtcblx0fTtcblxuXHQvKipcblx0ICogUmV0dXJucyBhIGZ1bmN0aW9uIHRvIGJlIHVzZWQgdG8gc2NvcmUgaW5kaXZpZHVhbCByZXN1bHRzLlxuXHQgKlxuXHQgKiBHb29kIG1hdGNoZXMgd2lsbCBoYXZlIGEgaGlnaGVyIHNjb3JlIHRoYW4gcG9vciBtYXRjaGVzLlxuXHQgKiBJZiBhbiBpdGVtIGlzIG5vdCBhIG1hdGNoLCAwIHdpbGwgYmUgcmV0dXJuZWQgYnkgdGhlIGZ1bmN0aW9uLlxuXHQgKlxuXHQgKiBAcGFyYW0ge29iamVjdHxzdHJpbmd9IHNlYXJjaFxuXHQgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyAob3B0aW9uYWwpXG5cdCAqIEByZXR1cm5zIHtmdW5jdGlvbn1cblx0ICovXG5cdFNpZnRlci5wcm90b3R5cGUuZ2V0U2NvcmVGdW5jdGlvbiA9IGZ1bmN0aW9uKHNlYXJjaCwgb3B0aW9ucykge1xuXHRcdHZhciBzZWxmLCBmaWVsZHMsIHRva2VucywgdG9rZW5fY291bnQsIG5lc3Rpbmc7XG5cblx0XHRzZWxmICAgICAgICA9IHRoaXM7XG5cdFx0c2VhcmNoICAgICAgPSBzZWxmLnByZXBhcmVTZWFyY2goc2VhcmNoLCBvcHRpb25zKTtcblx0XHR0b2tlbnMgICAgICA9IHNlYXJjaC50b2tlbnM7XG5cdFx0ZmllbGRzICAgICAgPSBzZWFyY2gub3B0aW9ucy5maWVsZHM7XG5cdFx0dG9rZW5fY291bnQgPSB0b2tlbnMubGVuZ3RoO1xuXHRcdG5lc3RpbmcgICAgID0gc2VhcmNoLm9wdGlvbnMubmVzdGluZztcblxuXHRcdC8qKlxuXHRcdCAqIENhbGN1bGF0ZXMgaG93IGNsb3NlIG9mIGEgbWF0Y2ggdGhlXG5cdFx0ICogZ2l2ZW4gdmFsdWUgaXMgYWdhaW5zdCBhIHNlYXJjaCB0b2tlbi5cblx0XHQgKlxuXHRcdCAqIEBwYXJhbSB7bWl4ZWR9IHZhbHVlXG5cdFx0ICogQHBhcmFtIHtvYmplY3R9IHRva2VuXG5cdFx0ICogQHJldHVybiB7bnVtYmVyfVxuXHRcdCAqL1xuXHRcdHZhciBzY29yZVZhbHVlID0gZnVuY3Rpb24odmFsdWUsIHRva2VuKSB7XG5cdFx0XHR2YXIgc2NvcmUsIHBvcztcblxuXHRcdFx0aWYgKCF2YWx1ZSkgcmV0dXJuIDA7XG5cdFx0XHR2YWx1ZSA9IFN0cmluZyh2YWx1ZSB8fCAnJyk7XG5cdFx0XHRwb3MgPSB2YWx1ZS5zZWFyY2godG9rZW4ucmVnZXgpO1xuXHRcdFx0aWYgKHBvcyA9PT0gLTEpIHJldHVybiAwO1xuXHRcdFx0c2NvcmUgPSB0b2tlbi5zdHJpbmcubGVuZ3RoIC8gdmFsdWUubGVuZ3RoO1xuXHRcdFx0aWYgKHBvcyA9PT0gMCkgc2NvcmUgKz0gMC41O1xuXHRcdFx0cmV0dXJuIHNjb3JlO1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBDYWxjdWxhdGVzIHRoZSBzY29yZSBvZiBhbiBvYmplY3Rcblx0XHQgKiBhZ2FpbnN0IHRoZSBzZWFyY2ggcXVlcnkuXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0ge29iamVjdH0gdG9rZW5cblx0XHQgKiBAcGFyYW0ge29iamVjdH0gZGF0YVxuXHRcdCAqIEByZXR1cm4ge251bWJlcn1cblx0XHQgKi9cblx0XHR2YXIgc2NvcmVPYmplY3QgPSAoZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgZmllbGRfY291bnQgPSBmaWVsZHMubGVuZ3RoO1xuXHRcdFx0aWYgKCFmaWVsZF9jb3VudCkge1xuXHRcdFx0XHRyZXR1cm4gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuXHRcdFx0fVxuXHRcdFx0aWYgKGZpZWxkX2NvdW50ID09PSAxKSB7XG5cdFx0XHRcdHJldHVybiBmdW5jdGlvbih0b2tlbiwgZGF0YSkge1xuXHRcdFx0XHRcdHJldHVybiBzY29yZVZhbHVlKGdldGF0dHIoZGF0YSwgZmllbGRzWzBdLCBuZXN0aW5nKSwgdG9rZW4pO1xuXHRcdFx0XHR9O1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKHRva2VuLCBkYXRhKSB7XG5cdFx0XHRcdGZvciAodmFyIGkgPSAwLCBzdW0gPSAwOyBpIDwgZmllbGRfY291bnQ7IGkrKykge1xuXHRcdFx0XHRcdHN1bSArPSBzY29yZVZhbHVlKGdldGF0dHIoZGF0YSwgZmllbGRzW2ldLCBuZXN0aW5nKSwgdG9rZW4pO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBzdW0gLyBmaWVsZF9jb3VudDtcblx0XHRcdH07XG5cdFx0fSkoKTtcblxuXHRcdGlmICghdG9rZW5fY291bnQpIHtcblx0XHRcdHJldHVybiBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG5cdFx0fVxuXHRcdGlmICh0b2tlbl9jb3VudCA9PT0gMSkge1xuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKGRhdGEpIHtcblx0XHRcdFx0cmV0dXJuIHNjb3JlT2JqZWN0KHRva2Vuc1swXSwgZGF0YSk7XG5cdFx0XHR9O1xuXHRcdH1cblxuXHRcdGlmIChzZWFyY2gub3B0aW9ucy5jb25qdW5jdGlvbiA9PT0gJ2FuZCcpIHtcblx0XHRcdHJldHVybiBmdW5jdGlvbihkYXRhKSB7XG5cdFx0XHRcdHZhciBzY29yZTtcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDAsIHN1bSA9IDA7IGkgPCB0b2tlbl9jb3VudDsgaSsrKSB7XG5cdFx0XHRcdFx0c2NvcmUgPSBzY29yZU9iamVjdCh0b2tlbnNbaV0sIGRhdGEpO1xuXHRcdFx0XHRcdGlmIChzY29yZSA8PSAwKSByZXR1cm4gMDtcblx0XHRcdFx0XHRzdW0gKz0gc2NvcmU7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIHN1bSAvIHRva2VuX2NvdW50O1xuXHRcdFx0fTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKGRhdGEpIHtcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDAsIHN1bSA9IDA7IGkgPCB0b2tlbl9jb3VudDsgaSsrKSB7XG5cdFx0XHRcdFx0c3VtICs9IHNjb3JlT2JqZWN0KHRva2Vuc1tpXSwgZGF0YSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIHN1bSAvIHRva2VuX2NvdW50O1xuXHRcdFx0fTtcblx0XHR9XG5cdH07XG5cblx0LyoqXG5cdCAqIFJldHVybnMgYSBmdW5jdGlvbiB0aGF0IGNhbiBiZSB1c2VkIHRvIGNvbXBhcmUgdHdvXG5cdCAqIHJlc3VsdHMsIGZvciBzb3J0aW5nIHB1cnBvc2VzLiBJZiBubyBzb3J0aW5nIHNob3VsZFxuXHQgKiBiZSBwZXJmb3JtZWQsIGBudWxsYCB3aWxsIGJlIHJldHVybmVkLlxuXHQgKlxuXHQgKiBAcGFyYW0ge3N0cmluZ3xvYmplY3R9IHNlYXJjaFxuXHQgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9uc1xuXHQgKiBAcmV0dXJuIGZ1bmN0aW9uKGEsYilcblx0ICovXG5cdFNpZnRlci5wcm90b3R5cGUuZ2V0U29ydEZ1bmN0aW9uID0gZnVuY3Rpb24oc2VhcmNoLCBvcHRpb25zKSB7XG5cdFx0dmFyIGksIG4sIHNlbGYsIGZpZWxkLCBmaWVsZHMsIGZpZWxkc19jb3VudCwgbXVsdGlwbGllciwgbXVsdGlwbGllcnMsIGdldF9maWVsZCwgaW1wbGljaXRfc2NvcmUsIHNvcnQ7XG5cblx0XHRzZWxmICAgPSB0aGlzO1xuXHRcdHNlYXJjaCA9IHNlbGYucHJlcGFyZVNlYXJjaChzZWFyY2gsIG9wdGlvbnMpO1xuXHRcdHNvcnQgICA9ICghc2VhcmNoLnF1ZXJ5ICYmIG9wdGlvbnMuc29ydF9lbXB0eSkgfHwgb3B0aW9ucy5zb3J0O1xuXG5cdFx0LyoqXG5cdFx0ICogRmV0Y2hlcyB0aGUgc3BlY2lmaWVkIHNvcnQgZmllbGQgdmFsdWVcblx0XHQgKiBmcm9tIGEgc2VhcmNoIHJlc3VsdCBpdGVtLlxuXHRcdCAqXG5cdFx0ICogQHBhcmFtICB7c3RyaW5nfSBuYW1lXG5cdFx0ICogQHBhcmFtICB7b2JqZWN0fSByZXN1bHRcblx0XHQgKiBAcmV0dXJuIHttaXhlZH1cblx0XHQgKi9cblx0XHRnZXRfZmllbGQgPSBmdW5jdGlvbihuYW1lLCByZXN1bHQpIHtcblx0XHRcdGlmIChuYW1lID09PSAnJHNjb3JlJykgcmV0dXJuIHJlc3VsdC5zY29yZTtcblx0XHRcdHJldHVybiBnZXRhdHRyKHNlbGYuaXRlbXNbcmVzdWx0LmlkXSwgbmFtZSwgb3B0aW9ucy5uZXN0aW5nKTtcblx0XHR9O1xuXG5cdFx0Ly8gcGFyc2Ugb3B0aW9uc1xuXHRcdGZpZWxkcyA9IFtdO1xuXHRcdGlmIChzb3J0KSB7XG5cdFx0XHRmb3IgKGkgPSAwLCBuID0gc29ydC5sZW5ndGg7IGkgPCBuOyBpKyspIHtcblx0XHRcdFx0aWYgKHNlYXJjaC5xdWVyeSB8fCBzb3J0W2ldLmZpZWxkICE9PSAnJHNjb3JlJykge1xuXHRcdFx0XHRcdGZpZWxkcy5wdXNoKHNvcnRbaV0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gdGhlIFwiJHNjb3JlXCIgZmllbGQgaXMgaW1wbGllZCB0byBiZSB0aGUgcHJpbWFyeVxuXHRcdC8vIHNvcnQgZmllbGQsIHVubGVzcyBpdCdzIG1hbnVhbGx5IHNwZWNpZmllZFxuXHRcdGlmIChzZWFyY2gucXVlcnkpIHtcblx0XHRcdGltcGxpY2l0X3Njb3JlID0gdHJ1ZTtcblx0XHRcdGZvciAoaSA9IDAsIG4gPSBmaWVsZHMubGVuZ3RoOyBpIDwgbjsgaSsrKSB7XG5cdFx0XHRcdGlmIChmaWVsZHNbaV0uZmllbGQgPT09ICckc2NvcmUnKSB7XG5cdFx0XHRcdFx0aW1wbGljaXRfc2NvcmUgPSBmYWxzZTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0aWYgKGltcGxpY2l0X3Njb3JlKSB7XG5cdFx0XHRcdGZpZWxkcy51bnNoaWZ0KHtmaWVsZDogJyRzY29yZScsIGRpcmVjdGlvbjogJ2Rlc2MnfSk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGZvciAoaSA9IDAsIG4gPSBmaWVsZHMubGVuZ3RoOyBpIDwgbjsgaSsrKSB7XG5cdFx0XHRcdGlmIChmaWVsZHNbaV0uZmllbGQgPT09ICckc2NvcmUnKSB7XG5cdFx0XHRcdFx0ZmllbGRzLnNwbGljZShpLCAxKTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdG11bHRpcGxpZXJzID0gW107XG5cdFx0Zm9yIChpID0gMCwgbiA9IGZpZWxkcy5sZW5ndGg7IGkgPCBuOyBpKyspIHtcblx0XHRcdG11bHRpcGxpZXJzLnB1c2goZmllbGRzW2ldLmRpcmVjdGlvbiA9PT0gJ2Rlc2MnID8gLTEgOiAxKTtcblx0XHR9XG5cblx0XHQvLyBidWlsZCBmdW5jdGlvblxuXHRcdGZpZWxkc19jb3VudCA9IGZpZWxkcy5sZW5ndGg7XG5cdFx0aWYgKCFmaWVsZHNfY291bnQpIHtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH0gZWxzZSBpZiAoZmllbGRzX2NvdW50ID09PSAxKSB7XG5cdFx0XHRmaWVsZCA9IGZpZWxkc1swXS5maWVsZDtcblx0XHRcdG11bHRpcGxpZXIgPSBtdWx0aXBsaWVyc1swXTtcblx0XHRcdHJldHVybiBmdW5jdGlvbihhLCBiKSB7XG5cdFx0XHRcdHJldHVybiBtdWx0aXBsaWVyICogY21wKFxuXHRcdFx0XHRcdGdldF9maWVsZChmaWVsZCwgYSksXG5cdFx0XHRcdFx0Z2V0X2ZpZWxkKGZpZWxkLCBiKVxuXHRcdFx0XHQpO1xuXHRcdFx0fTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKGEsIGIpIHtcblx0XHRcdFx0dmFyIGksIHJlc3VsdCwgYV92YWx1ZSwgYl92YWx1ZSwgZmllbGQ7XG5cdFx0XHRcdGZvciAoaSA9IDA7IGkgPCBmaWVsZHNfY291bnQ7IGkrKykge1xuXHRcdFx0XHRcdGZpZWxkID0gZmllbGRzW2ldLmZpZWxkO1xuXHRcdFx0XHRcdHJlc3VsdCA9IG11bHRpcGxpZXJzW2ldICogY21wKFxuXHRcdFx0XHRcdFx0Z2V0X2ZpZWxkKGZpZWxkLCBhKSxcblx0XHRcdFx0XHRcdGdldF9maWVsZChmaWVsZCwgYilcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdGlmIChyZXN1bHQpIHJldHVybiByZXN1bHQ7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIDA7XG5cdFx0XHR9O1xuXHRcdH1cblx0fTtcblxuXHQvKipcblx0ICogUGFyc2VzIGEgc2VhcmNoIHF1ZXJ5IGFuZCByZXR1cm5zIGFuIG9iamVjdFxuXHQgKiB3aXRoIHRva2VucyBhbmQgZmllbGRzIHJlYWR5IHRvIGJlIHBvcHVsYXRlZFxuXHQgKiB3aXRoIHJlc3VsdHMuXG5cdCAqXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBxdWVyeVxuXHQgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9uc1xuXHQgKiBAcmV0dXJucyB7b2JqZWN0fVxuXHQgKi9cblx0U2lmdGVyLnByb3RvdHlwZS5wcmVwYXJlU2VhcmNoID0gZnVuY3Rpb24ocXVlcnksIG9wdGlvbnMpIHtcblx0XHRpZiAodHlwZW9mIHF1ZXJ5ID09PSAnb2JqZWN0JykgcmV0dXJuIHF1ZXJ5O1xuXG5cdFx0b3B0aW9ucyA9IGV4dGVuZCh7fSwgb3B0aW9ucyk7XG5cblx0XHR2YXIgb3B0aW9uX2ZpZWxkcyAgICAgPSBvcHRpb25zLmZpZWxkcztcblx0XHR2YXIgb3B0aW9uX3NvcnQgICAgICAgPSBvcHRpb25zLnNvcnQ7XG5cdFx0dmFyIG9wdGlvbl9zb3J0X2VtcHR5ID0gb3B0aW9ucy5zb3J0X2VtcHR5O1xuXG5cdFx0aWYgKG9wdGlvbl9maWVsZHMgJiYgIWlzX2FycmF5KG9wdGlvbl9maWVsZHMpKSBvcHRpb25zLmZpZWxkcyA9IFtvcHRpb25fZmllbGRzXTtcblx0XHRpZiAob3B0aW9uX3NvcnQgJiYgIWlzX2FycmF5KG9wdGlvbl9zb3J0KSkgb3B0aW9ucy5zb3J0ID0gW29wdGlvbl9zb3J0XTtcblx0XHRpZiAob3B0aW9uX3NvcnRfZW1wdHkgJiYgIWlzX2FycmF5KG9wdGlvbl9zb3J0X2VtcHR5KSkgb3B0aW9ucy5zb3J0X2VtcHR5ID0gW29wdGlvbl9zb3J0X2VtcHR5XTtcblxuXHRcdHJldHVybiB7XG5cdFx0XHRvcHRpb25zIDogb3B0aW9ucyxcblx0XHRcdHF1ZXJ5ICAgOiBTdHJpbmcocXVlcnkgfHwgJycpLnRvTG93ZXJDYXNlKCksXG5cdFx0XHR0b2tlbnMgIDogdGhpcy50b2tlbml6ZShxdWVyeSksXG5cdFx0XHR0b3RhbCAgIDogMCxcblx0XHRcdGl0ZW1zICAgOiBbXVxuXHRcdH07XG5cdH07XG5cblx0LyoqXG5cdCAqIFNlYXJjaGVzIHRocm91Z2ggYWxsIGl0ZW1zIGFuZCByZXR1cm5zIGEgc29ydGVkIGFycmF5IG9mIG1hdGNoZXMuXG5cdCAqXG5cdCAqIFRoZSBgb3B0aW9uc2AgcGFyYW1ldGVyIGNhbiBjb250YWluOlxuXHQgKlxuXHQgKiAgIC0gZmllbGRzIHtzdHJpbmd8YXJyYXl9XG5cdCAqICAgLSBzb3J0IHthcnJheX1cblx0ICogICAtIHNjb3JlIHtmdW5jdGlvbn1cblx0ICogICAtIGZpbHRlciB7Ym9vbH1cblx0ICogICAtIGxpbWl0IHtpbnRlZ2VyfVxuXHQgKlxuXHQgKiBSZXR1cm5zIGFuIG9iamVjdCBjb250YWluaW5nOlxuXHQgKlxuXHQgKiAgIC0gb3B0aW9ucyB7b2JqZWN0fVxuXHQgKiAgIC0gcXVlcnkge3N0cmluZ31cblx0ICogICAtIHRva2VucyB7YXJyYXl9XG5cdCAqICAgLSB0b3RhbCB7aW50fVxuXHQgKiAgIC0gaXRlbXMge2FycmF5fVxuXHQgKlxuXHQgKiBAcGFyYW0ge3N0cmluZ30gcXVlcnlcblx0ICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnNcblx0ICogQHJldHVybnMge29iamVjdH1cblx0ICovXG5cdFNpZnRlci5wcm90b3R5cGUuc2VhcmNoID0gZnVuY3Rpb24ocXVlcnksIG9wdGlvbnMpIHtcblx0XHR2YXIgc2VsZiA9IHRoaXMsIHZhbHVlLCBzY29yZSwgc2VhcmNoLCBjYWxjdWxhdGVTY29yZTtcblx0XHR2YXIgZm5fc29ydDtcblx0XHR2YXIgZm5fc2NvcmU7XG5cblx0XHRzZWFyY2ggID0gdGhpcy5wcmVwYXJlU2VhcmNoKHF1ZXJ5LCBvcHRpb25zKTtcblx0XHRvcHRpb25zID0gc2VhcmNoLm9wdGlvbnM7XG5cdFx0cXVlcnkgICA9IHNlYXJjaC5xdWVyeTtcblxuXHRcdC8vIGdlbmVyYXRlIHJlc3VsdCBzY29yaW5nIGZ1bmN0aW9uXG5cdFx0Zm5fc2NvcmUgPSBvcHRpb25zLnNjb3JlIHx8IHNlbGYuZ2V0U2NvcmVGdW5jdGlvbihzZWFyY2gpO1xuXG5cdFx0Ly8gcGVyZm9ybSBzZWFyY2ggYW5kIHNvcnRcblx0XHRpZiAocXVlcnkubGVuZ3RoKSB7XG5cdFx0XHRzZWxmLml0ZXJhdG9yKHNlbGYuaXRlbXMsIGZ1bmN0aW9uKGl0ZW0sIGlkKSB7XG5cdFx0XHRcdHNjb3JlID0gZm5fc2NvcmUoaXRlbSk7XG5cdFx0XHRcdGlmIChvcHRpb25zLmZpbHRlciA9PT0gZmFsc2UgfHwgc2NvcmUgPiAwKSB7XG5cdFx0XHRcdFx0c2VhcmNoLml0ZW1zLnB1c2goeydzY29yZSc6IHNjb3JlLCAnaWQnOiBpZH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0c2VsZi5pdGVyYXRvcihzZWxmLml0ZW1zLCBmdW5jdGlvbihpdGVtLCBpZCkge1xuXHRcdFx0XHRzZWFyY2guaXRlbXMucHVzaCh7J3Njb3JlJzogMSwgJ2lkJzogaWR9KTtcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdGZuX3NvcnQgPSBzZWxmLmdldFNvcnRGdW5jdGlvbihzZWFyY2gsIG9wdGlvbnMpO1xuXHRcdGlmIChmbl9zb3J0KSBzZWFyY2guaXRlbXMuc29ydChmbl9zb3J0KTtcblxuXHRcdC8vIGFwcGx5IGxpbWl0c1xuXHRcdHNlYXJjaC50b3RhbCA9IHNlYXJjaC5pdGVtcy5sZW5ndGg7XG5cdFx0aWYgKHR5cGVvZiBvcHRpb25zLmxpbWl0ID09PSAnbnVtYmVyJykge1xuXHRcdFx0c2VhcmNoLml0ZW1zID0gc2VhcmNoLml0ZW1zLnNsaWNlKDAsIG9wdGlvbnMubGltaXQpO1xuXHRcdH1cblxuXHRcdHJldHVybiBzZWFyY2g7XG5cdH07XG5cblx0Ly8gdXRpbGl0aWVzXG5cdC8vIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC1cblxuXHR2YXIgY21wID0gZnVuY3Rpb24oYSwgYikge1xuXHRcdGlmICh0eXBlb2YgYSA9PT0gJ251bWJlcicgJiYgdHlwZW9mIGIgPT09ICdudW1iZXInKSB7XG5cdFx0XHRyZXR1cm4gYSA+IGIgPyAxIDogKGEgPCBiID8gLTEgOiAwKTtcblx0XHR9XG5cdFx0YSA9IGFzY2lpZm9sZChTdHJpbmcoYSB8fCAnJykpO1xuXHRcdGIgPSBhc2NpaWZvbGQoU3RyaW5nKGIgfHwgJycpKTtcblx0XHRpZiAoYSA+IGIpIHJldHVybiAxO1xuXHRcdGlmIChiID4gYSkgcmV0dXJuIC0xO1xuXHRcdHJldHVybiAwO1xuXHR9O1xuXG5cdHZhciBleHRlbmQgPSBmdW5jdGlvbihhLCBiKSB7XG5cdFx0dmFyIGksIG4sIGssIG9iamVjdDtcblx0XHRmb3IgKGkgPSAxLCBuID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IG47IGkrKykge1xuXHRcdFx0b2JqZWN0ID0gYXJndW1lbnRzW2ldO1xuXHRcdFx0aWYgKCFvYmplY3QpIGNvbnRpbnVlO1xuXHRcdFx0Zm9yIChrIGluIG9iamVjdCkge1xuXHRcdFx0XHRpZiAob2JqZWN0Lmhhc093blByb3BlcnR5KGspKSB7XG5cdFx0XHRcdFx0YVtrXSA9IG9iamVjdFtrXTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gYTtcblx0fTtcblxuXHQvKipcblx0ICogQSBwcm9wZXJ0eSBnZXR0ZXIgcmVzb2x2aW5nIGRvdC1ub3RhdGlvblxuXHQgKiBAcGFyYW0gIHtPYmplY3R9ICBvYmogICAgIFRoZSByb290IG9iamVjdCB0byBmZXRjaCBwcm9wZXJ0eSBvblxuXHQgKiBAcGFyYW0gIHtTdHJpbmd9ICBuYW1lICAgIFRoZSBvcHRpb25hbGx5IGRvdHRlZCBwcm9wZXJ0eSBuYW1lIHRvIGZldGNoXG5cdCAqIEBwYXJhbSAge0Jvb2xlYW59IG5lc3RpbmcgSGFuZGxlIG5lc3Rpbmcgb3Igbm90XG5cdCAqIEByZXR1cm4ge09iamVjdH0gICAgICAgICAgVGhlIHJlc29sdmVkIHByb3BlcnR5IHZhbHVlXG5cdCAqL1xuXHR2YXIgZ2V0YXR0ciA9IGZ1bmN0aW9uKG9iaiwgbmFtZSwgbmVzdGluZykge1xuXHQgICAgaWYgKCFvYmogfHwgIW5hbWUpIHJldHVybjtcblx0ICAgIGlmICghbmVzdGluZykgcmV0dXJuIG9ialtuYW1lXTtcblx0ICAgIHZhciBuYW1lcyA9IG5hbWUuc3BsaXQoXCIuXCIpO1xuXHQgICAgd2hpbGUobmFtZXMubGVuZ3RoICYmIChvYmogPSBvYmpbbmFtZXMuc2hpZnQoKV0pKTtcblx0ICAgIHJldHVybiBvYmo7XG5cdH07XG5cblx0dmFyIHRyaW0gPSBmdW5jdGlvbihzdHIpIHtcblx0XHRyZXR1cm4gKHN0ciArICcnKS5yZXBsYWNlKC9eXFxzK3xcXHMrJHwvZywgJycpO1xuXHR9O1xuXG5cdHZhciBlc2NhcGVfcmVnZXggPSBmdW5jdGlvbihzdHIpIHtcblx0XHRyZXR1cm4gKHN0ciArICcnKS5yZXBsYWNlKC8oWy4/KiteJFtcXF1cXFxcKCl7fXwtXSkvZywgJ1xcXFwkMScpO1xuXHR9O1xuXG5cdHZhciBpc19hcnJheSA9IEFycmF5LmlzQXJyYXkgfHwgKHR5cGVvZiAkICE9PSAndW5kZWZpbmVkJyAmJiAkLmlzQXJyYXkpIHx8IGZ1bmN0aW9uKG9iamVjdCkge1xuXHRcdHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqZWN0KSA9PT0gJ1tvYmplY3QgQXJyYXldJztcblx0fTtcblxuXHR2YXIgRElBQ1JJVElDUyA9IHtcblx0XHQnYSc6ICdbYeG4gOG4gcSCxIPDgsOix43Hjsi64rGlyKbIp+G6oOG6ocOEw6TDgMOgw4HDocSAxIHDg8Ojw4XDpcSFxITDg8SFxIRdJyxcblx0XHQnYic6ICdbYuKQos6yzpJC4Li/8JCMgeGbkl0nLFxuXHRcdCdjJzogJ1tjxIbEh8SIxInEjMSNxIrEi0PMhGPMhMOHw6fhuIjhuInIu8i8xofGiMmV4bSE77yj772DXScsXG5cdFx0J2QnOiAnW2TEjsSP4biK4biL4biQ4biR4biM4biN4biS4biT4biO4biPxJDEkUTMpmTMpsaJyZbGismXxovGjOG1reG2geG2kcih4bSF77yk772Ew7BdJyxcblx0XHQnZSc6ICdbZcOJw6nDiMOow4rDquG4mOG4mcSaxJvElMSV4bq84bq94bia4bib4bq64bq7xJbEl8OLw6vEksSTyKjIqcSYxJnhtpLJhsmHyITIheG6vuG6v+G7gOG7geG7hOG7heG7guG7g+G4nOG4neG4luG4l+G4lOG4lciGyIfhurjhurnhu4bhu4fisbjhtIfvvKXvvYXJmMedxo/GkM61XScsXG5cdFx0J2YnOiAnW2bGkcaS4bie4bifXScsXG5cdFx0J2cnOiAnW2fJouKCssekx6XEnMSdxJ7En8SixKPGk8mgxKDEoV0nLFxuXHRcdCdoJzogJ1toxKTEpcSmxKfhuKjhuKnhupbhupbhuKThuKXhuKLhuKPJpsqwx7bGlV0nLFxuXHRcdCdpJzogJ1tpw43DrcOMw6zErMStw47DrsePx5DDj8Ov4biu4bivxKjEqcSuxK/EqsSr4buI4buJyIjIiciKyIvhu4rhu4vhuKzhuK3Gl8moyajMhuG1u+G2lsSwaUnEscmq77yp772JXScsXG5cdFx0J2onOiAnW2rIt8S0xLXJiMmJyp3Jn8qyXScsXG5cdFx0J2snOiAnW2vGmMaZ6p2A6p2B4biw4bixx6jHqeG4suG4s+G4tOG4tc66z7Digq1dJyxcblx0XHQnbCc6ICdbbMWBxYLEvcS+xLvEvMS5xLrhuLbhuLfhuLjhuLnhuLzhuL3huLrhuLvEv8WAyL3GmuKxoOKxoeKxosmryazhtoXJrci0yp/vvKzvvYxdJyxcblx0XHQnbic6ICdbbsWDxYTHuMe5xYfFiMORw7HhuYThuYXFhcWG4bmG4bmH4bmK4bmL4bmI4bmJTsyIbsyIxp3Jssigxp7htbDhtofJs8i1ybTvvK7vvY7FisWLXScsXG5cdFx0J28nOiAnW2/DmMO4w5bDtsOTw7PDksOyw5TDtMeRx5LFkMWRxY7Fj8iuyK/hu4zhu43Gn8m1xqDGoeG7juG7j8WMxY3DlcO1x6rHq8iMyI3VldaFXScsXG5cdFx0J3AnOiAnW3DhuZThuZXhuZbhuZfisaPhtb3GpMal4bWxXScsXG5cdFx0J3EnOiAnW3HqnZbqnZfKoMmKyYvqnZjqnZlxzINdJyxcblx0XHQncic6ICdbcsWUxZXJjMmNxZjFmcWWxZfhuZjhuZnIkMiRyJLIk+G5muG5m+KxpMm9XScsXG5cdFx0J3MnOiAnW3PFmsWb4bmg4bmh4bmi4bmj6p6o6p6pxZzFncWgxaHFnsWfyJjImVPMiHPMiF0nLFxuXHRcdCd0JzogJ1t0xaTFpeG5quG5q8WixaPhuazhua3GrsqIyJrIm+G5sOG5seG5ruG5r8asxq1dJyxcblx0XHQndSc6ICdbdcWsxa3JhMqJ4buk4bulw5zDvMOaw7rDmcO5w5vDu8eTx5TFsMWxxazFrcavxrDhu6bhu6fFqsWrxajFqcWyxbPIlMiV4oiqXScsXG5cdFx0J3YnOiAnW3bhubzhub3hub7hub/GssqL6p2e6p2f4rGxyotdJyxcblx0XHQndyc6ICdbd+G6guG6g+G6gOG6gcW0xbXhuoThuoXhuobhuofhuojhuoldJyxcblx0XHQneCc6ICdbeOG6jOG6jeG6iuG6i8+HXScsXG5cdFx0J3knOiAnW3nDncO94buy4buzxbbFt8W4w7/hu7jhu7nhuo7huo/hu7Thu7XJjsmPxrPGtF0nLFxuXHRcdCd6JzogJ1t6xbnFuuG6kOG6kcW9xb7Fu8W84bqS4bqT4bqU4bqVxrXGtl0nXG5cdH07XG5cblx0dmFyIGFzY2lpZm9sZCA9IChmdW5jdGlvbigpIHtcblx0XHR2YXIgaSwgbiwgaywgY2h1bms7XG5cdFx0dmFyIGZvcmVpZ25sZXR0ZXJzID0gJyc7XG5cdFx0dmFyIGxvb2t1cCA9IHt9O1xuXHRcdGZvciAoayBpbiBESUFDUklUSUNTKSB7XG5cdFx0XHRpZiAoRElBQ1JJVElDUy5oYXNPd25Qcm9wZXJ0eShrKSkge1xuXHRcdFx0XHRjaHVuayA9IERJQUNSSVRJQ1Nba10uc3Vic3RyaW5nKDIsIERJQUNSSVRJQ1Nba10ubGVuZ3RoIC0gMSk7XG5cdFx0XHRcdGZvcmVpZ25sZXR0ZXJzICs9IGNodW5rO1xuXHRcdFx0XHRmb3IgKGkgPSAwLCBuID0gY2h1bmsubGVuZ3RoOyBpIDwgbjsgaSsrKSB7XG5cdFx0XHRcdFx0bG9va3VwW2NodW5rLmNoYXJBdChpKV0gPSBrO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHZhciByZWdleHAgPSBuZXcgUmVnRXhwKCdbJyArICBmb3JlaWdubGV0dGVycyArICddJywgJ2cnKTtcblx0XHRyZXR1cm4gZnVuY3Rpb24oc3RyKSB7XG5cdFx0XHRyZXR1cm4gc3RyLnJlcGxhY2UocmVnZXhwLCBmdW5jdGlvbihmb3JlaWdubGV0dGVyKSB7XG5cdFx0XHRcdHJldHVybiBsb29rdXBbZm9yZWlnbmxldHRlcl07XG5cdFx0XHR9KS50b0xvd2VyQ2FzZSgpO1xuXHRcdH07XG5cdH0pKCk7XG5cblxuXHQvLyBleHBvcnRcblx0Ly8gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLVxuXG5cdHJldHVybiBTaWZ0ZXI7XG59KSk7XG5cbiJdLCJzb3VyY2VSb290IjoiIn0=