(self["webpackChunkdmeta"] = self["webpackChunkdmeta"] || []).push([["npm.microplugin"],{

/***/ "./node_modules/microplugin/src/microplugin.js":
/*!*****************************************************!*\
  !*** ./node_modules/microplugin/src/microplugin.js ***!
  \*****************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: top-level-this-exports, __webpack_require__, __webpack_exports__, module */
/*! CommonJS bailout: this is used directly at 25:2-6 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
 * microplugin.js
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
	var MicroPlugin = {};

	MicroPlugin.mixin = function(Interface) {
		Interface.plugins = {};

		/**
		 * Initializes the listed plugins (with options).
		 * Acceptable formats:
		 *
		 * List (without options):
		 *   ['a', 'b', 'c']
		 *
		 * List (with options):
		 *   [{'name': 'a', options: {}}, {'name': 'b', options: {}}]
		 *
		 * Hash (with options):
		 *   {'a': { ... }, 'b': { ... }, 'c': { ... }}
		 *
		 * @param {mixed} plugins
		 */
		Interface.prototype.initializePlugins = function(plugins) {
			var i, n, key;
			var self  = this;
			var queue = [];

			self.plugins = {
				names     : [],
				settings  : {},
				requested : {},
				loaded    : {}
			};

			if (utils.isArray(plugins)) {
				for (i = 0, n = plugins.length; i < n; i++) {
					if (typeof plugins[i] === 'string') {
						queue.push(plugins[i]);
					} else {
						self.plugins.settings[plugins[i].name] = plugins[i].options;
						queue.push(plugins[i].name);
					}
				}
			} else if (plugins) {
				for (key in plugins) {
					if (plugins.hasOwnProperty(key)) {
						self.plugins.settings[key] = plugins[key];
						queue.push(key);
					}
				}
			}

			while (queue.length) {
				self.require(queue.shift());
			}
		};

		Interface.prototype.loadPlugin = function(name) {
			var self    = this;
			var plugins = self.plugins;
			var plugin  = Interface.plugins[name];

			if (!Interface.plugins.hasOwnProperty(name)) {
				throw new Error('Unable to find "' +  name + '" plugin');
			}

			plugins.requested[name] = true;
			plugins.loaded[name] = plugin.fn.apply(self, [self.plugins.settings[name] || {}]);
			plugins.names.push(name);
		};

		/**
		 * Initializes a plugin.
		 *
		 * @param {string} name
		 */
		Interface.prototype.require = function(name) {
			var self = this;
			var plugins = self.plugins;

			if (!self.plugins.loaded.hasOwnProperty(name)) {
				if (plugins.requested[name]) {
					throw new Error('Plugin has circular dependency ("' + name + '")');
				}
				self.loadPlugin(name);
			}

			return plugins.loaded[name];
		};

		/**
		 * Registers a plugin.
		 *
		 * @param {string} name
		 * @param {function} fn
		 */
		Interface.define = function(name, fn) {
			Interface.plugins[name] = {
				'name' : name,
				'fn'   : fn
			};
		};
	};

	var utils = {
		isArray: Array.isArray || function(vArg) {
			return Object.prototype.toString.call(vArg) === '[object Array]';
		}
	};

	return MicroPlugin;
}));

/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9kbWV0YS8uL25vZGVfbW9kdWxlcy9taWNyb3BsdWdpbi9zcmMvbWljcm9wbHVnaW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtFQUFrRTtBQUNsRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLEtBQUssSUFBMEM7QUFDL0MsRUFBRSxvQ0FBTyxPQUFPO0FBQUE7QUFBQTtBQUFBO0FBQUEsa0dBQUM7QUFDakIsRUFBRSxNQUFNLEVBSU47QUFDRixDQUFDO0FBQ0Q7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUyx5QkFBeUIsR0FBRyx5QkFBeUI7QUFDOUQ7QUFDQTtBQUNBLFFBQVEsTUFBTSxNQUFNLFFBQVEsTUFBTSxRQUFRO0FBQzFDO0FBQ0EsYUFBYSxNQUFNO0FBQ25CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGtCQUFrQjtBQUNsQixrQkFBa0I7QUFDbEI7QUFDQTs7QUFFQTtBQUNBLG1DQUFtQyxPQUFPO0FBQzFDO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0Esa0ZBQWtGO0FBQ2xGO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsYUFBYSxPQUFPO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGFBQWEsT0FBTztBQUNwQixhQUFhLFNBQVM7QUFDdEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsQ0FBQyxHIiwiZmlsZSI6Im5wbS5taWNyb3BsdWdpbi5kM2JlYmFmMjc1N2U3MmVjNWU3MS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogbWljcm9wbHVnaW4uanNcbiAqIENvcHlyaWdodCAoYykgMjAxMyBCcmlhbiBSZWF2aXMgJiBjb250cmlidXRvcnNcbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpOyB5b3UgbWF5IG5vdCB1c2UgdGhpc1xuICogZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXQ6XG4gKiBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlIGRpc3RyaWJ1dGVkIHVuZGVyXG4gKiB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GXG4gKiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC4gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2VcbiAqIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmQgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKlxuICogQGF1dGhvciBCcmlhbiBSZWF2aXMgPGJyaWFuQHRoaXJkcm91dGUuY29tPlxuICovXG5cbihmdW5jdGlvbihyb290LCBmYWN0b3J5KSB7XG5cdGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcblx0XHRkZWZpbmUoZmFjdG9yeSk7XG5cdH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG5cdH0gZWxzZSB7XG5cdFx0cm9vdC5NaWNyb1BsdWdpbiA9IGZhY3RvcnkoKTtcblx0fVxufSh0aGlzLCBmdW5jdGlvbigpIHtcblx0dmFyIE1pY3JvUGx1Z2luID0ge307XG5cblx0TWljcm9QbHVnaW4ubWl4aW4gPSBmdW5jdGlvbihJbnRlcmZhY2UpIHtcblx0XHRJbnRlcmZhY2UucGx1Z2lucyA9IHt9O1xuXG5cdFx0LyoqXG5cdFx0ICogSW5pdGlhbGl6ZXMgdGhlIGxpc3RlZCBwbHVnaW5zICh3aXRoIG9wdGlvbnMpLlxuXHRcdCAqIEFjY2VwdGFibGUgZm9ybWF0czpcblx0XHQgKlxuXHRcdCAqIExpc3QgKHdpdGhvdXQgb3B0aW9ucyk6XG5cdFx0ICogICBbJ2EnLCAnYicsICdjJ11cblx0XHQgKlxuXHRcdCAqIExpc3QgKHdpdGggb3B0aW9ucyk6XG5cdFx0ICogICBbeyduYW1lJzogJ2EnLCBvcHRpb25zOiB7fX0sIHsnbmFtZSc6ICdiJywgb3B0aW9uczoge319XVxuXHRcdCAqXG5cdFx0ICogSGFzaCAod2l0aCBvcHRpb25zKTpcblx0XHQgKiAgIHsnYSc6IHsgLi4uIH0sICdiJzogeyAuLi4gfSwgJ2MnOiB7IC4uLiB9fVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHttaXhlZH0gcGx1Z2luc1xuXHRcdCAqL1xuXHRcdEludGVyZmFjZS5wcm90b3R5cGUuaW5pdGlhbGl6ZVBsdWdpbnMgPSBmdW5jdGlvbihwbHVnaW5zKSB7XG5cdFx0XHR2YXIgaSwgbiwga2V5O1xuXHRcdFx0dmFyIHNlbGYgID0gdGhpcztcblx0XHRcdHZhciBxdWV1ZSA9IFtdO1xuXG5cdFx0XHRzZWxmLnBsdWdpbnMgPSB7XG5cdFx0XHRcdG5hbWVzICAgICA6IFtdLFxuXHRcdFx0XHRzZXR0aW5ncyAgOiB7fSxcblx0XHRcdFx0cmVxdWVzdGVkIDoge30sXG5cdFx0XHRcdGxvYWRlZCAgICA6IHt9XG5cdFx0XHR9O1xuXG5cdFx0XHRpZiAodXRpbHMuaXNBcnJheShwbHVnaW5zKSkge1xuXHRcdFx0XHRmb3IgKGkgPSAwLCBuID0gcGx1Z2lucy5sZW5ndGg7IGkgPCBuOyBpKyspIHtcblx0XHRcdFx0XHRpZiAodHlwZW9mIHBsdWdpbnNbaV0gPT09ICdzdHJpbmcnKSB7XG5cdFx0XHRcdFx0XHRxdWV1ZS5wdXNoKHBsdWdpbnNbaV0pO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRzZWxmLnBsdWdpbnMuc2V0dGluZ3NbcGx1Z2luc1tpXS5uYW1lXSA9IHBsdWdpbnNbaV0ub3B0aW9ucztcblx0XHRcdFx0XHRcdHF1ZXVlLnB1c2gocGx1Z2luc1tpXS5uYW1lKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSBpZiAocGx1Z2lucykge1xuXHRcdFx0XHRmb3IgKGtleSBpbiBwbHVnaW5zKSB7XG5cdFx0XHRcdFx0aWYgKHBsdWdpbnMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuXHRcdFx0XHRcdFx0c2VsZi5wbHVnaW5zLnNldHRpbmdzW2tleV0gPSBwbHVnaW5zW2tleV07XG5cdFx0XHRcdFx0XHRxdWV1ZS5wdXNoKGtleSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdHdoaWxlIChxdWV1ZS5sZW5ndGgpIHtcblx0XHRcdFx0c2VsZi5yZXF1aXJlKHF1ZXVlLnNoaWZ0KCkpO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHRJbnRlcmZhY2UucHJvdG90eXBlLmxvYWRQbHVnaW4gPSBmdW5jdGlvbihuYW1lKSB7XG5cdFx0XHR2YXIgc2VsZiAgICA9IHRoaXM7XG5cdFx0XHR2YXIgcGx1Z2lucyA9IHNlbGYucGx1Z2lucztcblx0XHRcdHZhciBwbHVnaW4gID0gSW50ZXJmYWNlLnBsdWdpbnNbbmFtZV07XG5cblx0XHRcdGlmICghSW50ZXJmYWNlLnBsdWdpbnMuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCdVbmFibGUgdG8gZmluZCBcIicgKyAgbmFtZSArICdcIiBwbHVnaW4nKTtcblx0XHRcdH1cblxuXHRcdFx0cGx1Z2lucy5yZXF1ZXN0ZWRbbmFtZV0gPSB0cnVlO1xuXHRcdFx0cGx1Z2lucy5sb2FkZWRbbmFtZV0gPSBwbHVnaW4uZm4uYXBwbHkoc2VsZiwgW3NlbGYucGx1Z2lucy5zZXR0aW5nc1tuYW1lXSB8fCB7fV0pO1xuXHRcdFx0cGx1Z2lucy5uYW1lcy5wdXNoKG5hbWUpO1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBJbml0aWFsaXplcyBhIHBsdWdpbi5cblx0XHQgKlxuXHRcdCAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG5cdFx0ICovXG5cdFx0SW50ZXJmYWNlLnByb3RvdHlwZS5yZXF1aXJlID0gZnVuY3Rpb24obmFtZSkge1xuXHRcdFx0dmFyIHNlbGYgPSB0aGlzO1xuXHRcdFx0dmFyIHBsdWdpbnMgPSBzZWxmLnBsdWdpbnM7XG5cblx0XHRcdGlmICghc2VsZi5wbHVnaW5zLmxvYWRlZC5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuXHRcdFx0XHRpZiAocGx1Z2lucy5yZXF1ZXN0ZWRbbmFtZV0pIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ1BsdWdpbiBoYXMgY2lyY3VsYXIgZGVwZW5kZW5jeSAoXCInICsgbmFtZSArICdcIiknKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRzZWxmLmxvYWRQbHVnaW4obmFtZSk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBwbHVnaW5zLmxvYWRlZFtuYW1lXTtcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogUmVnaXN0ZXJzIGEgcGx1Z2luLlxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcblx0XHQgKiBAcGFyYW0ge2Z1bmN0aW9ufSBmblxuXHRcdCAqL1xuXHRcdEludGVyZmFjZS5kZWZpbmUgPSBmdW5jdGlvbihuYW1lLCBmbikge1xuXHRcdFx0SW50ZXJmYWNlLnBsdWdpbnNbbmFtZV0gPSB7XG5cdFx0XHRcdCduYW1lJyA6IG5hbWUsXG5cdFx0XHRcdCdmbicgICA6IGZuXG5cdFx0XHR9O1xuXHRcdH07XG5cdH07XG5cblx0dmFyIHV0aWxzID0ge1xuXHRcdGlzQXJyYXk6IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24odkFyZykge1xuXHRcdFx0cmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2QXJnKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcblx0XHR9XG5cdH07XG5cblx0cmV0dXJuIE1pY3JvUGx1Z2luO1xufSkpOyJdLCJzb3VyY2VSb290IjoiIn0=