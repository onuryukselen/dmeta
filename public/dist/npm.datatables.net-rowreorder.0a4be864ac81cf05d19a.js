(self["webpackChunkdmeta"] = self["webpackChunkdmeta"] || []).push([["npm.datatables.net-rowreorder"],{

/***/ "./node_modules/datatables.net-rowreorder/js/dataTables.rowReorder.js":
/*!****************************************************************************!*\
  !*** ./node_modules/datatables.net-rowreorder/js/dataTables.rowReorder.js ***!
  \****************************************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: __webpack_require__, __webpack_exports__, module */
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*! RowReorder 1.2.8
 * 2015-2020 SpryMedia Ltd - datatables.net/license
 */

/**
 * @summary     RowReorder
 * @description Row reordering extension for DataTables
 * @version     1.2.8
 * @file        dataTables.rowReorder.js
 * @author      SpryMedia Ltd (www.sprymedia.co.uk)
 * @contact     www.sprymedia.co.uk/contact
 * @copyright   Copyright 2015-2020 SpryMedia Ltd.
 *
 * This source file is free software, available under the following license:
 *   MIT license - http://datatables.net/license/mit
 *
 * This source file is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE. See the license files for details.
 *
 * For details please refer to: http://www.datatables.net
 */

(function( factory ){
	if ( true ) {
		// AMD
		!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery-exposed.js"), __webpack_require__(/*! datatables.net */ "./node_modules/datatables.net/js/jquery.dataTables.js")], __WEBPACK_AMD_DEFINE_RESULT__ = (function ( $ ) {
			return factory( $, window, document );
		}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	}
	else {}
}(function( $, window, document, undefined ) {
'use strict';
var DataTable = $.fn.dataTable;


/**
 * RowReorder provides the ability in DataTables to click and drag rows to
 * reorder them. When a row is dropped the data for the rows effected will be
 * updated to reflect the change. Normally this data point should also be the
 * column being sorted upon in the DataTable but this does not need to be the
 * case. RowReorder implements a "data swap" method - so the rows being
 * reordered take the value of the data point from the row that used to occupy
 * the row's new position.
 *
 * Initialisation is done by either:
 *
 * * `rowReorder` parameter in the DataTable initialisation object
 * * `new $.fn.dataTable.RowReorder( table, opts )` after DataTables
 *   initialisation.
 * 
 *  @class
 *  @param {object} settings DataTables settings object for the host table
 *  @param {object} [opts] Configuration options
 *  @requires jQuery 1.7+
 *  @requires DataTables 1.10.7+
 */
var RowReorder = function ( dt, opts ) {
	// Sanity check that we are using DataTables 1.10 or newer
	if ( ! DataTable.versionCheck || ! DataTable.versionCheck( '1.10.8' ) ) {
		throw 'DataTables RowReorder requires DataTables 1.10.8 or newer';
	}

	// User and defaults configuration object
	this.c = $.extend( true, {},
		DataTable.defaults.rowReorder,
		RowReorder.defaults,
		opts
	);

	// Internal settings
	this.s = {
		/** @type {integer} Scroll body top cache */
		bodyTop: null,

		/** @type {DataTable.Api} DataTables' API instance */
		dt: new DataTable.Api( dt ),

		/** @type {function} Data fetch function */
		getDataFn: DataTable.ext.oApi._fnGetObjectDataFn( this.c.dataSrc ),

		/** @type {array} Pixel positions for row insertion calculation */
		middles: null,

		/** @type {Object} Cached dimension information for use in the mouse move event handler */
		scroll: {},

		/** @type {integer} Interval object used for smooth scrolling */
		scrollInterval: null,

		/** @type {function} Data set function */
		setDataFn: DataTable.ext.oApi._fnSetObjectDataFn( this.c.dataSrc ),

		/** @type {Object} Mouse down information */
		start: {
			top: 0,
			left: 0,
			offsetTop: 0,
			offsetLeft: 0,
			nodes: []
		},

		/** @type {integer} Window height cached value */
		windowHeight: 0,

		/** @type {integer} Document outer height cached value */
		documentOuterHeight: 0,

		/** @type {integer} DOM clone outer height cached value */
		domCloneOuterHeight: 0
	};

	// DOM items
	this.dom = {
		/** @type {jQuery} Cloned row being moved around */
		clone: null,

		/** @type {jQuery} DataTables scrolling container */
		dtScroll: $('div.dataTables_scrollBody', this.s.dt.table().container())
	};

	// Check if row reorder has already been initialised on this table
	var settings = this.s.dt.settings()[0];
	var exisiting = settings.rowreorder;

	if ( exisiting ) {
		return exisiting;
	}

	if ( !this.dom.dtScroll.length ) {
		this.dom.dtScroll = $(this.s.dt.table().container(), 'tbody')
	}

	settings.rowreorder = this;
	this._constructor();
};


$.extend( RowReorder.prototype, {
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Constructor
	 */

	/**
	 * Initialise the RowReorder instance
	 *
	 * @private
	 */
	_constructor: function ()
	{
		var that = this;
		var dt = this.s.dt;
		var table = $( dt.table().node() );

		// Need to be able to calculate the row positions relative to the table
		if ( table.css('position') === 'static' ) {
			table.css( 'position', 'relative' );
		}

		// listen for mouse down on the target column - we have to implement
		// this rather than using HTML5 drag and drop as drag and drop doesn't
		// appear to work on table rows at this time. Also mobile browsers are
		// not supported.
		// Use `table().container()` rather than just the table node for IE8 -
		// otherwise it only works once...
		$(dt.table().container()).on( 'mousedown.rowReorder touchstart.rowReorder', this.c.selector, function (e) {
			if ( ! that.c.enable ) {
				return;
			}

			// Ignore excluded children of the selector
			if ( $(e.target).is(that.c.excludedChildren) ) {
				return true;
			}

			var tr = $(this).closest('tr');
			var row = dt.row( tr );

			// Double check that it is a DataTable row
			if ( row.any() ) {
				that._emitEvent( 'pre-row-reorder', {
					node: row.node(),
					index: row.index()
				} );

				that._mouseDown( e, tr );
				return false;
			}
		} );

		dt.on( 'destroy.rowReorder', function () {
			$(dt.table().container()).off( '.rowReorder' );
			dt.off( '.rowReorder' );
		} );
	},


	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Private methods
	 */
	
	/**
	 * Cache the measurements that RowReorder needs in the mouse move handler
	 * to attempt to speed things up, rather than reading from the DOM.
	 *
	 * @private
	 */
	_cachePositions: function ()
	{
		var dt = this.s.dt;

		// Frustratingly, if we add `position:relative` to the tbody, the
		// position is still relatively to the parent. So we need to adjust
		// for that
		var headerHeight = $( dt.table().node() ).find('thead').outerHeight();

		// Need to pass the nodes through jQuery to get them in document order,
		// not what DataTables thinks it is, since we have been altering the
		// order
		var nodes = $.unique( dt.rows( { page: 'current' } ).nodes().toArray() );
		var middles = $.map( nodes, function ( node, i ) {
			var top = $(node).position().top - headerHeight;

			return (top + top + $(node).outerHeight() ) / 2;
		} );

		this.s.middles = middles;
		this.s.bodyTop = $( dt.table().body() ).offset().top;
		this.s.windowHeight = $(window).height();
		this.s.documentOuterHeight = $(document).outerHeight();
	},


	/**
	 * Clone a row so it can be floated around the screen
	 *
	 * @param  {jQuery} target Node to be cloned
	 * @private
	 */
	_clone: function ( target )
	{
		var dt = this.s.dt;
		var clone = $( dt.table().node().cloneNode(false) )
			.addClass( 'dt-rowReorder-float' )
			.append('<tbody/>')
			.append( target.clone( false ) );

		// Match the table and column widths - read all sizes before setting
		// to reduce reflows
		var tableWidth = target.outerWidth();
		var tableHeight = target.outerHeight();
		var sizes = target.children().map( function () {
			return $(this).width();
		} );

		clone
			.width( tableWidth )
			.height( tableHeight )
			.find('tr').children().each( function (i) {
				this.style.width = sizes[i]+'px';
			} );

		// Insert into the document to have it floating around
		clone.appendTo( 'body' );

		this.dom.clone = clone;
		this.s.domCloneOuterHeight = clone.outerHeight();
	},


	/**
	 * Update the cloned item's position in the document
	 *
	 * @param  {object} e Event giving the mouse's position
	 * @private
	 */
	_clonePosition: function ( e )
	{
		var start = this.s.start;
		var topDiff = this._eventToPage( e, 'Y' ) - start.top;
		var leftDiff = this._eventToPage( e, 'X' ) - start.left;
		var snap = this.c.snapX;
		var left;
		var top = topDiff + start.offsetTop;

		if ( snap === true ) {
			left = start.offsetLeft;
		}
		else if ( typeof snap === 'number' ) {
			left = start.offsetLeft + snap;
		}
		else {
			left = leftDiff + start.offsetLeft;
		}

		if(top < 0) {
			top = 0
		}
		else if(top + this.s.domCloneOuterHeight > this.s.documentOuterHeight) {
			top = this.s.documentOuterHeight - this.s.domCloneOuterHeight;
		}

		this.dom.clone.css( {
			top: top,
			left: left
		} );
	},


	/**
	 * Emit an event on the DataTable for listeners
	 *
	 * @param  {string} name Event name
	 * @param  {array} args Event arguments
	 * @private
	 */
	_emitEvent: function ( name, args )
	{
		this.s.dt.iterator( 'table', function ( ctx, i ) {
			$(ctx.nTable).triggerHandler( name+'.dt', args );
		} );
	},


	/**
	 * Get pageX/Y position from an event, regardless of if it is a mouse or
	 * touch event.
	 *
	 * @param  {object} e Event
	 * @param  {string} pos X or Y (must be a capital)
	 * @private
	 */
	_eventToPage: function ( e, pos )
	{
		if ( e.type.indexOf( 'touch' ) !== -1 ) {
			return e.originalEvent.touches[0][ 'page'+pos ];
		}

		return e[ 'page'+pos ];
	},


	/**
	 * Mouse down event handler. Read initial positions and add event handlers
	 * for the move.
	 *
	 * @param  {object} e      Mouse event
	 * @param  {jQuery} target TR element that is to be moved
	 * @private
	 */
	_mouseDown: function ( e, target )
	{
		var that = this;
		var dt = this.s.dt;
		var start = this.s.start;

		var offset = target.offset();
		start.top = this._eventToPage( e, 'Y' );
		start.left = this._eventToPage( e, 'X' );
		start.offsetTop = offset.top;
		start.offsetLeft = offset.left;
		start.nodes = $.unique( dt.rows( { page: 'current' } ).nodes().toArray() );

		this._cachePositions();
		this._clone( target );
		this._clonePosition( e );

		this.dom.target = target;
		target.addClass( 'dt-rowReorder-moving' );

		$( document )
			.on( 'mouseup.rowReorder touchend.rowReorder', function (e) {
				that._mouseUp(e);
			} )
			.on( 'mousemove.rowReorder touchmove.rowReorder', function (e) {
				that._mouseMove(e);
			} );

		// Check if window is x-scrolling - if not, disable it for the duration
		// of the drag
		if ( $(window).width() === $(document).width() ) {
			$(document.body).addClass( 'dt-rowReorder-noOverflow' );
		}

		// Cache scrolling information so mouse move doesn't need to read.
		// This assumes that the window and DT scroller will not change size
		// during an row drag, which I think is a fair assumption
		var scrollWrapper = this.dom.dtScroll;
		this.s.scroll = {
			windowHeight: $(window).height(),
			windowWidth:  $(window).width(),
			dtTop:        scrollWrapper.length ? scrollWrapper.offset().top : null,
			dtLeft:       scrollWrapper.length ? scrollWrapper.offset().left : null,
			dtHeight:     scrollWrapper.length ? scrollWrapper.outerHeight() : null,
			dtWidth:      scrollWrapper.length ? scrollWrapper.outerWidth() : null
		};
	},


	/**
	 * Mouse move event handler - move the cloned row and shuffle the table's
	 * rows if required.
	 *
	 * @param  {object} e Mouse event
	 * @private
	 */
	_mouseMove: function ( e )
	{
		this._clonePosition( e );

		// Transform the mouse position into a position in the table's body
		var bodyY = this._eventToPage( e, 'Y' ) - this.s.bodyTop;
		var middles = this.s.middles;
		var insertPoint = null;
		var dt = this.s.dt;

		// Determine where the row should be inserted based on the mouse
		// position
		for ( var i=0, ien=middles.length ; i<ien ; i++ ) {
			if ( bodyY < middles[i] ) {
				insertPoint = i;
				break;
			}
		}

		if ( insertPoint === null ) {
			insertPoint = middles.length;
		}

		// Perform the DOM shuffle if it has changed from last time
		if ( this.s.lastInsert === null || this.s.lastInsert !== insertPoint ) {
			var nodes = $.unique( dt.rows( { page: 'current' } ).nodes().toArray() );

			if ( insertPoint > this.s.lastInsert ) {
				this.dom.target.insertAfter( nodes[ insertPoint-1 ] );
			}
			else {
				this.dom.target.insertBefore( nodes[ insertPoint ] );
			}

			this._cachePositions();

			this.s.lastInsert = insertPoint;
		}

		this._shiftScroll( e );
	},


	/**
	 * Mouse up event handler - release the event handlers and perform the
	 * table updates
	 *
	 * @param  {object} e Mouse event
	 * @private
	 */
	_mouseUp: function ( e )
	{
		var that = this;
		var dt = this.s.dt;
		var i, ien;
		var dataSrc = this.c.dataSrc;

		this.dom.clone.remove();
		this.dom.clone = null;

		this.dom.target.removeClass( 'dt-rowReorder-moving' );
		//this.dom.target = null;

		$(document).off( '.rowReorder' );
		$(document.body).removeClass( 'dt-rowReorder-noOverflow' );

		clearInterval( this.s.scrollInterval );
		this.s.scrollInterval = null;

		// Calculate the difference
		var startNodes = this.s.start.nodes;
		var endNodes = $.unique( dt.rows( { page: 'current' } ).nodes().toArray() );
		var idDiff = {};
		var fullDiff = [];
		var diffNodes = [];
		var getDataFn = this.s.getDataFn;
		var setDataFn = this.s.setDataFn;

		for ( i=0, ien=startNodes.length ; i<ien ; i++ ) {
			if ( startNodes[i] !== endNodes[i] ) {
				var id = dt.row( endNodes[i] ).id();
				var endRowData = dt.row( endNodes[i] ).data();
				var startRowData = dt.row( startNodes[i] ).data();

				if ( id ) {
					idDiff[ id ] = getDataFn( startRowData );
				}

				fullDiff.push( {
					node: endNodes[i],
					oldData: getDataFn( endRowData ),
					newData: getDataFn( startRowData ),
					newPosition: i,
					oldPosition: $.inArray( endNodes[i], startNodes )
				} );

				diffNodes.push( endNodes[i] );
			}
		}
		
		// Create event args
		var eventArgs = [ fullDiff, {
			dataSrc:       dataSrc,
			nodes:         diffNodes,
			values:        idDiff,
			triggerRow:    dt.row( this.dom.target ),
			originalEvent: e
		} ];
		
		// Emit event
		this._emitEvent( 'row-reorder', eventArgs );

		var update = function () {
			if ( that.c.update ) {
				for ( i=0, ien=fullDiff.length ; i<ien ; i++ ) {
					var row = dt.row( fullDiff[i].node );
					var rowData = row.data();

					setDataFn( rowData, fullDiff[i].newData );

					// Invalidate the cell that has the same data source as the dataSrc
					dt.columns().every( function () {
						if ( this.dataSrc() === dataSrc ) {
							dt.cell( fullDiff[i].node, this.index() ).invalidate( 'data' );
						}
					} );
				}

				// Trigger row reordered event
				that._emitEvent( 'row-reordered', eventArgs );

				dt.draw( false );
			}
		};

		// Editor interface
		if ( this.c.editor ) {
			// Disable user interaction while Editor is submitting
			this.c.enable = false;

			this.c.editor
				.edit(
					diffNodes,
					false,
					$.extend( {submit: 'changed'}, this.c.formOptions )
				)
				.multiSet( dataSrc, idDiff )
				.one( 'preSubmitCancelled.rowReorder', function () {
					that.c.enable = true;
					that.c.editor.off( '.rowReorder' );
					dt.draw( false );
				} )
				.one( 'submitUnsuccessful.rowReorder', function () {
					dt.draw( false );
				} )
				.one( 'submitSuccess.rowReorder', function () {
					update();
				} )
				.one( 'submitComplete', function () {
					that.c.enable = true;
					that.c.editor.off( '.rowReorder' );
				} )
				.submit();
		}
		else {
			update();
		}
	},


	/**
	 * Move the window and DataTables scrolling during a drag to scroll new
	 * content into view.
	 *
	 * This matches the `_shiftScroll` method used in AutoFill, but only
	 * horizontal scrolling is considered here.
	 *
	 * @param  {object} e Mouse move event object
	 * @private
	 */
	_shiftScroll: function ( e )
	{
		var that = this;
		var dt = this.s.dt;
		var scroll = this.s.scroll;
		var runInterval = false;
		var scrollSpeed = 5;
		var buffer = 65;
		var
			windowY = e.pageY - document.body.scrollTop,
			windowVert,
			dtVert;

		// Window calculations - based on the mouse position in the window,
		// regardless of scrolling
		if ( windowY < $(window).scrollTop() + buffer ) {
			windowVert = scrollSpeed * -1;
		}
		else if ( windowY > scroll.windowHeight + $(window).scrollTop() - buffer ) {
			windowVert = scrollSpeed;
		}

		// DataTables scrolling calculations - based on the table's position in
		// the document and the mouse position on the page
		if ( scroll.dtTop !== null && e.pageY < scroll.dtTop + buffer ) {
			dtVert = scrollSpeed * -1;
		}
		else if ( scroll.dtTop !== null && e.pageY > scroll.dtTop + scroll.dtHeight - buffer ) {
			dtVert = scrollSpeed;
		}

		// This is where it gets interesting. We want to continue scrolling
		// without requiring a mouse move, so we need an interval to be
		// triggered. The interval should continue until it is no longer needed,
		// but it must also use the latest scroll commands (for example consider
		// that the mouse might move from scrolling up to scrolling left, all
		// with the same interval running. We use the `scroll` object to "pass"
		// this information to the interval. Can't use local variables as they
		// wouldn't be the ones that are used by an already existing interval!
		if ( windowVert || dtVert ) {
			scroll.windowVert = windowVert;
			scroll.dtVert = dtVert;
			runInterval = true;
		}
		else if ( this.s.scrollInterval ) {
			// Don't need to scroll - remove any existing timer
			clearInterval( this.s.scrollInterval );
			this.s.scrollInterval = null;
		}

		// If we need to run the interval to scroll and there is no existing
		// interval (if there is an existing one, it will continue to run)
		if ( ! this.s.scrollInterval && runInterval ) {
			this.s.scrollInterval = setInterval( function () {
				// Don't need to worry about setting scroll <0 or beyond the
				// scroll bound as the browser will just reject that.
				if ( scroll.windowVert ) {
					var top = $(document).scrollTop();
					$(document).scrollTop(top + scroll.windowVert);

					if ( top !== $(document).scrollTop() ) {
						var move = parseFloat(that.dom.clone.css("top"));
						that.dom.clone.css("top", move + scroll.windowVert);					
					}
				}

				// DataTables scrolling
				if ( scroll.dtVert ) {
					var scroller = that.dom.dtScroll[0];

					if ( scroll.dtVert ) {
						scroller.scrollTop += scroll.dtVert;
					}
				}
			}, 20 );
		}
	}
} );



/**
 * RowReorder default settings for initialisation
 *
 * @namespace
 * @name RowReorder.defaults
 * @static
 */
RowReorder.defaults = {
	/**
	 * Data point in the host row's data source object for where to get and set
	 * the data to reorder. This will normally also be the sorting column.
	 *
	 * @type {Number}
	 */
	dataSrc: 0,

	/**
	 * Editor instance that will be used to perform the update
	 *
	 * @type {DataTable.Editor}
	 */
	editor: null,

	/**
	 * Enable / disable RowReorder's user interaction
	 * @type {Boolean}
	 */
	enable: true,

	/**
	 * Form options to pass to Editor when submitting a change in the row order.
	 * See the Editor `from-options` object for details of the options
	 * available.
	 * @type {Object}
	 */
	formOptions: {},

	/**
	 * Drag handle selector. This defines the element that when dragged will
	 * reorder a row.
	 *
	 * @type {String}
	 */
	selector: 'td:first-child',

	/**
	 * Optionally lock the dragged row's x-position. This can be `true` to
	 * fix the position match the host table's, `false` to allow free movement
	 * of the row, or a number to define an offset from the host table.
	 *
	 * @type {Boolean|number}
	 */
	snapX: false,

	/**
	 * Update the table's data on drop
	 *
	 * @type {Boolean}
	 */
	update: true,

	/**
	 * Selector for children of the drag handle selector that mouseDown events
	 * will be passed through to and drag will not activate
	 *
	 * @type {String}
	 */
	excludedChildren: 'a'
};


/*
 * API
 */
var Api = $.fn.dataTable.Api;

// Doesn't do anything - work around for a bug in DT... Not documented
Api.register( 'rowReorder()', function () {
	return this;
} );

Api.register( 'rowReorder.enable()', function ( toggle ) {
	if ( toggle === undefined ) {
		toggle = true;
	}

	return this.iterator( 'table', function ( ctx ) {
		if ( ctx.rowreorder ) {
			ctx.rowreorder.c.enable = toggle;
		}
	} );
} );

Api.register( 'rowReorder.disable()', function () {
	return this.iterator( 'table', function ( ctx ) {
		if ( ctx.rowreorder ) {
			ctx.rowreorder.c.enable = false;
		}
	} );
} );


/**
 * Version information
 *
 * @name RowReorder.version
 * @static
 */
RowReorder.version = '1.2.8';


$.fn.dataTable.RowReorder = RowReorder;
$.fn.DataTable.RowReorder = RowReorder;

// Attach a listener to the document which listens for DataTables initialisation
// events so we can automatically initialise
$(document).on( 'init.dt.dtr', function (e, settings, json) {
	if ( e.namespace !== 'dt' ) {
		return;
	}

	var init = settings.oInit.rowReorder;
	var defaults = DataTable.defaults.rowReorder;

	if ( init || defaults ) {
		var opts = $.extend( {}, init, defaults );

		if ( init !== false ) {
			new RowReorder( settings, opts  );
		}
	}
} );


return RowReorder;
}));


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9kbWV0YS8uL25vZGVfbW9kdWxlcy9kYXRhdGFibGVzLm5ldC1yb3dyZW9yZGVyL2pzL2RhdGFUYWJsZXMucm93UmVvcmRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCO0FBQ3hCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsTUFBTSxJQUEwQztBQUNoRDtBQUNBLEVBQUUsaUNBQVEsQ0FBQyxpRkFBUSxFQUFFLGtHQUFnQixDQUFDLG1DQUFFO0FBQ3hDO0FBQ0EsR0FBRztBQUFBLGtHQUFFO0FBQ0w7QUFDQSxNQUFNLEVBaUJKO0FBQ0YsQ0FBQztBQUNEO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSxPQUFPO0FBQ25CLFlBQVksT0FBTztBQUNuQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsNEJBQTRCO0FBQzVCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxhQUFhLFFBQVE7QUFDckI7O0FBRUEsYUFBYSxjQUFjO0FBQzNCOztBQUVBLGFBQWEsU0FBUztBQUN0Qjs7QUFFQSxhQUFhLE1BQU07QUFDbkI7O0FBRUEsYUFBYSxPQUFPO0FBQ3BCLFlBQVk7O0FBRVosYUFBYSxRQUFRO0FBQ3JCOztBQUVBLGFBQWEsU0FBUztBQUN0Qjs7QUFFQSxhQUFhLE9BQU87QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSCxhQUFhLFFBQVE7QUFDckI7O0FBRUEsYUFBYSxRQUFRO0FBQ3JCOztBQUVBLGFBQWEsUUFBUTtBQUNyQjtBQUNBOztBQUVBO0FBQ0E7QUFDQSxhQUFhLE9BQU87QUFDcEI7O0FBRUEsYUFBYSxPQUFPO0FBQ3BCO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNILEVBQUU7OztBQUdGO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0Esa0NBQWtDLGtCQUFrQjtBQUNwRDtBQUNBOztBQUVBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUU7OztBQUdGO0FBQ0E7QUFDQTtBQUNBLGFBQWEsT0FBTztBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTs7QUFFSjtBQUNBOztBQUVBO0FBQ0E7QUFDQSxFQUFFOzs7QUFHRjtBQUNBO0FBQ0E7QUFDQSxhQUFhLE9BQU87QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFD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QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsMEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0EsQ0FBQzs7OztBQUlEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBOztBQUVBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBLGdCQUFnQjs7QUFFaEI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxDQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBRTtBQUNGLENBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUU7QUFDRixDQUFDOzs7QUFHRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBLHlCQUF5Qjs7QUFFekI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDOzs7QUFHRDtBQUNBLENBQUMiLCJmaWxlIjoibnBtLmRhdGF0YWJsZXMubmV0LXJvd3Jlb3JkZXIuMGE0YmU4NjRhYzgxY2YwNWQxOWEuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiEgUm93UmVvcmRlciAxLjIuOFxuICogMjAxNS0yMDIwIFNwcnlNZWRpYSBMdGQgLSBkYXRhdGFibGVzLm5ldC9saWNlbnNlXG4gKi9cblxuLyoqXG4gKiBAc3VtbWFyeSAgICAgUm93UmVvcmRlclxuICogQGRlc2NyaXB0aW9uIFJvdyByZW9yZGVyaW5nIGV4dGVuc2lvbiBmb3IgRGF0YVRhYmxlc1xuICogQHZlcnNpb24gICAgIDEuMi44XG4gKiBAZmlsZSAgICAgICAgZGF0YVRhYmxlcy5yb3dSZW9yZGVyLmpzXG4gKiBAYXV0aG9yICAgICAgU3ByeU1lZGlhIEx0ZCAod3d3LnNwcnltZWRpYS5jby51aylcbiAqIEBjb250YWN0ICAgICB3d3cuc3ByeW1lZGlhLmNvLnVrL2NvbnRhY3RcbiAqIEBjb3B5cmlnaHQgICBDb3B5cmlnaHQgMjAxNS0yMDIwIFNwcnlNZWRpYSBMdGQuXG4gKlxuICogVGhpcyBzb3VyY2UgZmlsZSBpcyBmcmVlIHNvZnR3YXJlLCBhdmFpbGFibGUgdW5kZXIgdGhlIGZvbGxvd2luZyBsaWNlbnNlOlxuICogICBNSVQgbGljZW5zZSAtIGh0dHA6Ly9kYXRhdGFibGVzLm5ldC9saWNlbnNlL21pdFxuICpcbiAqIFRoaXMgc291cmNlIGZpbGUgaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0XG4gKiBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWVxuICogb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgbGljZW5zZSBmaWxlcyBmb3IgZGV0YWlscy5cbiAqXG4gKiBGb3IgZGV0YWlscyBwbGVhc2UgcmVmZXIgdG86IGh0dHA6Ly93d3cuZGF0YXRhYmxlcy5uZXRcbiAqL1xuXG4oZnVuY3Rpb24oIGZhY3RvcnkgKXtcblx0aWYgKCB0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgKSB7XG5cdFx0Ly8gQU1EXG5cdFx0ZGVmaW5lKCBbJ2pxdWVyeScsICdkYXRhdGFibGVzLm5ldCddLCBmdW5jdGlvbiAoICQgKSB7XG5cdFx0XHRyZXR1cm4gZmFjdG9yeSggJCwgd2luZG93LCBkb2N1bWVudCApO1xuXHRcdH0gKTtcblx0fVxuXHRlbHNlIGlmICggdHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICkge1xuXHRcdC8vIENvbW1vbkpTXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocm9vdCwgJCkge1xuXHRcdFx0aWYgKCAhIHJvb3QgKSB7XG5cdFx0XHRcdHJvb3QgPSB3aW5kb3c7XG5cdFx0XHR9XG5cblx0XHRcdGlmICggISAkIHx8ICEgJC5mbi5kYXRhVGFibGUgKSB7XG5cdFx0XHRcdCQgPSByZXF1aXJlKCdkYXRhdGFibGVzLm5ldCcpKHJvb3QsICQpLiQ7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBmYWN0b3J5KCAkLCByb290LCByb290LmRvY3VtZW50ICk7XG5cdFx0fTtcblx0fVxuXHRlbHNlIHtcblx0XHQvLyBCcm93c2VyXG5cdFx0ZmFjdG9yeSggalF1ZXJ5LCB3aW5kb3csIGRvY3VtZW50ICk7XG5cdH1cbn0oZnVuY3Rpb24oICQsIHdpbmRvdywgZG9jdW1lbnQsIHVuZGVmaW5lZCApIHtcbid1c2Ugc3RyaWN0JztcbnZhciBEYXRhVGFibGUgPSAkLmZuLmRhdGFUYWJsZTtcblxuXG4vKipcbiAqIFJvd1Jlb3JkZXIgcHJvdmlkZXMgdGhlIGFiaWxpdHkgaW4gRGF0YVRhYmxlcyB0byBjbGljayBhbmQgZHJhZyByb3dzIHRvXG4gKiByZW9yZGVyIHRoZW0uIFdoZW4gYSByb3cgaXMgZHJvcHBlZCB0aGUgZGF0YSBmb3IgdGhlIHJvd3MgZWZmZWN0ZWQgd2lsbCBiZVxuICogdXBkYXRlZCB0byByZWZsZWN0IHRoZSBjaGFuZ2UuIE5vcm1hbGx5IHRoaXMgZGF0YSBwb2ludCBzaG91bGQgYWxzbyBiZSB0aGVcbiAqIGNvbHVtbiBiZWluZyBzb3J0ZWQgdXBvbiBpbiB0aGUgRGF0YVRhYmxlIGJ1dCB0aGlzIGRvZXMgbm90IG5lZWQgdG8gYmUgdGhlXG4gKiBjYXNlLiBSb3dSZW9yZGVyIGltcGxlbWVudHMgYSBcImRhdGEgc3dhcFwiIG1ldGhvZCAtIHNvIHRoZSByb3dzIGJlaW5nXG4gKiByZW9yZGVyZWQgdGFrZSB0aGUgdmFsdWUgb2YgdGhlIGRhdGEgcG9pbnQgZnJvbSB0aGUgcm93IHRoYXQgdXNlZCB0byBvY2N1cHlcbiAqIHRoZSByb3cncyBuZXcgcG9zaXRpb24uXG4gKlxuICogSW5pdGlhbGlzYXRpb24gaXMgZG9uZSBieSBlaXRoZXI6XG4gKlxuICogKiBgcm93UmVvcmRlcmAgcGFyYW1ldGVyIGluIHRoZSBEYXRhVGFibGUgaW5pdGlhbGlzYXRpb24gb2JqZWN0XG4gKiAqIGBuZXcgJC5mbi5kYXRhVGFibGUuUm93UmVvcmRlciggdGFibGUsIG9wdHMgKWAgYWZ0ZXIgRGF0YVRhYmxlc1xuICogICBpbml0aWFsaXNhdGlvbi5cbiAqIFxuICogIEBjbGFzc1xuICogIEBwYXJhbSB7b2JqZWN0fSBzZXR0aW5ncyBEYXRhVGFibGVzIHNldHRpbmdzIG9iamVjdCBmb3IgdGhlIGhvc3QgdGFibGVcbiAqICBAcGFyYW0ge29iamVjdH0gW29wdHNdIENvbmZpZ3VyYXRpb24gb3B0aW9uc1xuICogIEByZXF1aXJlcyBqUXVlcnkgMS43K1xuICogIEByZXF1aXJlcyBEYXRhVGFibGVzIDEuMTAuNytcbiAqL1xudmFyIFJvd1Jlb3JkZXIgPSBmdW5jdGlvbiAoIGR0LCBvcHRzICkge1xuXHQvLyBTYW5pdHkgY2hlY2sgdGhhdCB3ZSBhcmUgdXNpbmcgRGF0YVRhYmxlcyAxLjEwIG9yIG5ld2VyXG5cdGlmICggISBEYXRhVGFibGUudmVyc2lvbkNoZWNrIHx8ICEgRGF0YVRhYmxlLnZlcnNpb25DaGVjayggJzEuMTAuOCcgKSApIHtcblx0XHR0aHJvdyAnRGF0YVRhYmxlcyBSb3dSZW9yZGVyIHJlcXVpcmVzIERhdGFUYWJsZXMgMS4xMC44IG9yIG5ld2VyJztcblx0fVxuXG5cdC8vIFVzZXIgYW5kIGRlZmF1bHRzIGNvbmZpZ3VyYXRpb24gb2JqZWN0XG5cdHRoaXMuYyA9ICQuZXh0ZW5kKCB0cnVlLCB7fSxcblx0XHREYXRhVGFibGUuZGVmYXVsdHMucm93UmVvcmRlcixcblx0XHRSb3dSZW9yZGVyLmRlZmF1bHRzLFxuXHRcdG9wdHNcblx0KTtcblxuXHQvLyBJbnRlcm5hbCBzZXR0aW5nc1xuXHR0aGlzLnMgPSB7XG5cdFx0LyoqIEB0eXBlIHtpbnRlZ2VyfSBTY3JvbGwgYm9keSB0b3AgY2FjaGUgKi9cblx0XHRib2R5VG9wOiBudWxsLFxuXG5cdFx0LyoqIEB0eXBlIHtEYXRhVGFibGUuQXBpfSBEYXRhVGFibGVzJyBBUEkgaW5zdGFuY2UgKi9cblx0XHRkdDogbmV3IERhdGFUYWJsZS5BcGkoIGR0ICksXG5cblx0XHQvKiogQHR5cGUge2Z1bmN0aW9ufSBEYXRhIGZldGNoIGZ1bmN0aW9uICovXG5cdFx0Z2V0RGF0YUZuOiBEYXRhVGFibGUuZXh0Lm9BcGkuX2ZuR2V0T2JqZWN0RGF0YUZuKCB0aGlzLmMuZGF0YVNyYyApLFxuXG5cdFx0LyoqIEB0eXBlIHthcnJheX0gUGl4ZWwgcG9zaXRpb25zIGZvciByb3cgaW5zZXJ0aW9uIGNhbGN1bGF0aW9uICovXG5cdFx0bWlkZGxlczogbnVsbCxcblxuXHRcdC8qKiBAdHlwZSB7T2JqZWN0fSBDYWNoZWQgZGltZW5zaW9uIGluZm9ybWF0aW9uIGZvciB1c2UgaW4gdGhlIG1vdXNlIG1vdmUgZXZlbnQgaGFuZGxlciAqL1xuXHRcdHNjcm9sbDoge30sXG5cblx0XHQvKiogQHR5cGUge2ludGVnZXJ9IEludGVydmFsIG9iamVjdCB1c2VkIGZvciBzbW9vdGggc2Nyb2xsaW5nICovXG5cdFx0c2Nyb2xsSW50ZXJ2YWw6IG51bGwsXG5cblx0XHQvKiogQHR5cGUge2Z1bmN0aW9ufSBEYXRhIHNldCBmdW5jdGlvbiAqL1xuXHRcdHNldERhdGFGbjogRGF0YVRhYmxlLmV4dC5vQXBpLl9mblNldE9iamVjdERhdGFGbiggdGhpcy5jLmRhdGFTcmMgKSxcblxuXHRcdC8qKiBAdHlwZSB7T2JqZWN0fSBNb3VzZSBkb3duIGluZm9ybWF0aW9uICovXG5cdFx0c3RhcnQ6IHtcblx0XHRcdHRvcDogMCxcblx0XHRcdGxlZnQ6IDAsXG5cdFx0XHRvZmZzZXRUb3A6IDAsXG5cdFx0XHRvZmZzZXRMZWZ0OiAwLFxuXHRcdFx0bm9kZXM6IFtdXG5cdFx0fSxcblxuXHRcdC8qKiBAdHlwZSB7aW50ZWdlcn0gV2luZG93IGhlaWdodCBjYWNoZWQgdmFsdWUgKi9cblx0XHR3aW5kb3dIZWlnaHQ6IDAsXG5cblx0XHQvKiogQHR5cGUge2ludGVnZXJ9IERvY3VtZW50IG91dGVyIGhlaWdodCBjYWNoZWQgdmFsdWUgKi9cblx0XHRkb2N1bWVudE91dGVySGVpZ2h0OiAwLFxuXG5cdFx0LyoqIEB0eXBlIHtpbnRlZ2VyfSBET00gY2xvbmUgb3V0ZXIgaGVpZ2h0IGNhY2hlZCB2YWx1ZSAqL1xuXHRcdGRvbUNsb25lT3V0ZXJIZWlnaHQ6IDBcblx0fTtcblxuXHQvLyBET00gaXRlbXNcblx0dGhpcy5kb20gPSB7XG5cdFx0LyoqIEB0eXBlIHtqUXVlcnl9IENsb25lZCByb3cgYmVpbmcgbW92ZWQgYXJvdW5kICovXG5cdFx0Y2xvbmU6IG51bGwsXG5cblx0XHQvKiogQHR5cGUge2pRdWVyeX0gRGF0YVRhYmxlcyBzY3JvbGxpbmcgY29udGFpbmVyICovXG5cdFx0ZHRTY3JvbGw6ICQoJ2Rpdi5kYXRhVGFibGVzX3Njcm9sbEJvZHknLCB0aGlzLnMuZHQudGFibGUoKS5jb250YWluZXIoKSlcblx0fTtcblxuXHQvLyBDaGVjayBpZiByb3cgcmVvcmRlciBoYXMgYWxyZWFkeSBiZWVuIGluaXRpYWxpc2VkIG9uIHRoaXMgdGFibGVcblx0dmFyIHNldHRpbmdzID0gdGhpcy5zLmR0LnNldHRpbmdzKClbMF07XG5cdHZhciBleGlzaXRpbmcgPSBzZXR0aW5ncy5yb3dyZW9yZGVyO1xuXG5cdGlmICggZXhpc2l0aW5nICkge1xuXHRcdHJldHVybiBleGlzaXRpbmc7XG5cdH1cblxuXHRpZiAoICF0aGlzLmRvbS5kdFNjcm9sbC5sZW5ndGggKSB7XG5cdFx0dGhpcy5kb20uZHRTY3JvbGwgPSAkKHRoaXMucy5kdC50YWJsZSgpLmNvbnRhaW5lcigpLCAndGJvZHknKVxuXHR9XG5cblx0c2V0dGluZ3Mucm93cmVvcmRlciA9IHRoaXM7XG5cdHRoaXMuX2NvbnN0cnVjdG9yKCk7XG59O1xuXG5cbiQuZXh0ZW5kKCBSb3dSZW9yZGVyLnByb3RvdHlwZSwge1xuXHQvKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqXG5cdCAqIENvbnN0cnVjdG9yXG5cdCAqL1xuXG5cdC8qKlxuXHQgKiBJbml0aWFsaXNlIHRoZSBSb3dSZW9yZGVyIGluc3RhbmNlXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfY29uc3RydWN0b3I6IGZ1bmN0aW9uICgpXG5cdHtcblx0XHR2YXIgdGhhdCA9IHRoaXM7XG5cdFx0dmFyIGR0ID0gdGhpcy5zLmR0O1xuXHRcdHZhciB0YWJsZSA9ICQoIGR0LnRhYmxlKCkubm9kZSgpICk7XG5cblx0XHQvLyBOZWVkIHRvIGJlIGFibGUgdG8gY2FsY3VsYXRlIHRoZSByb3cgcG9zaXRpb25zIHJlbGF0aXZlIHRvIHRoZSB0YWJsZVxuXHRcdGlmICggdGFibGUuY3NzKCdwb3NpdGlvbicpID09PSAnc3RhdGljJyApIHtcblx0XHRcdHRhYmxlLmNzcyggJ3Bvc2l0aW9uJywgJ3JlbGF0aXZlJyApO1xuXHRcdH1cblxuXHRcdC8vIGxpc3RlbiBmb3IgbW91c2UgZG93biBvbiB0aGUgdGFyZ2V0IGNvbHVtbiAtIHdlIGhhdmUgdG8gaW1wbGVtZW50XG5cdFx0Ly8gdGhpcyByYXRoZXIgdGhhbiB1c2luZyBIVE1MNSBkcmFnIGFuZCBkcm9wIGFzIGRyYWcgYW5kIGRyb3AgZG9lc24ndFxuXHRcdC8vIGFwcGVhciB0byB3b3JrIG9uIHRhYmxlIHJvd3MgYXQgdGhpcyB0aW1lLiBBbHNvIG1vYmlsZSBicm93c2VycyBhcmVcblx0XHQvLyBub3Qgc3VwcG9ydGVkLlxuXHRcdC8vIFVzZSBgdGFibGUoKS5jb250YWluZXIoKWAgcmF0aGVyIHRoYW4ganVzdCB0aGUgdGFibGUgbm9kZSBmb3IgSUU4IC1cblx0XHQvLyBvdGhlcndpc2UgaXQgb25seSB3b3JrcyBvbmNlLi4uXG5cdFx0JChkdC50YWJsZSgpLmNvbnRhaW5lcigpKS5vbiggJ21vdXNlZG93bi5yb3dSZW9yZGVyIHRvdWNoc3RhcnQucm93UmVvcmRlcicsIHRoaXMuYy5zZWxlY3RvciwgZnVuY3Rpb24gKGUpIHtcblx0XHRcdGlmICggISB0aGF0LmMuZW5hYmxlICkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdC8vIElnbm9yZSBleGNsdWRlZCBjaGlsZHJlbiBvZiB0aGUgc2VsZWN0b3Jcblx0XHRcdGlmICggJChlLnRhcmdldCkuaXModGhhdC5jLmV4Y2x1ZGVkQ2hpbGRyZW4pICkge1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblxuXHRcdFx0dmFyIHRyID0gJCh0aGlzKS5jbG9zZXN0KCd0cicpO1xuXHRcdFx0dmFyIHJvdyA9IGR0LnJvdyggdHIgKTtcblxuXHRcdFx0Ly8gRG91YmxlIGNoZWNrIHRoYXQgaXQgaXMgYSBEYXRhVGFibGUgcm93XG5cdFx0XHRpZiAoIHJvdy5hbnkoKSApIHtcblx0XHRcdFx0dGhhdC5fZW1pdEV2ZW50KCAncHJlLXJvdy1yZW9yZGVyJywge1xuXHRcdFx0XHRcdG5vZGU6IHJvdy5ub2RlKCksXG5cdFx0XHRcdFx0aW5kZXg6IHJvdy5pbmRleCgpXG5cdFx0XHRcdH0gKTtcblxuXHRcdFx0XHR0aGF0Ll9tb3VzZURvd24oIGUsIHRyICk7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblx0XHR9ICk7XG5cblx0XHRkdC5vbiggJ2Rlc3Ryb3kucm93UmVvcmRlcicsIGZ1bmN0aW9uICgpIHtcblx0XHRcdCQoZHQudGFibGUoKS5jb250YWluZXIoKSkub2ZmKCAnLnJvd1Jlb3JkZXInICk7XG5cdFx0XHRkdC5vZmYoICcucm93UmVvcmRlcicgKTtcblx0XHR9ICk7XG5cdH0sXG5cblxuXHQvKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqXG5cdCAqIFByaXZhdGUgbWV0aG9kc1xuXHQgKi9cblx0XG5cdC8qKlxuXHQgKiBDYWNoZSB0aGUgbWVhc3VyZW1lbnRzIHRoYXQgUm93UmVvcmRlciBuZWVkcyBpbiB0aGUgbW91c2UgbW92ZSBoYW5kbGVyXG5cdCAqIHRvIGF0dGVtcHQgdG8gc3BlZWQgdGhpbmdzIHVwLCByYXRoZXIgdGhhbiByZWFkaW5nIGZyb20gdGhlIERPTS5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9jYWNoZVBvc2l0aW9uczogZnVuY3Rpb24gKClcblx0e1xuXHRcdHZhciBkdCA9IHRoaXMucy5kdDtcblxuXHRcdC8vIEZydXN0cmF0aW5nbHksIGlmIHdlIGFkZCBgcG9zaXRpb246cmVsYXRpdmVgIHRvIHRoZSB0Ym9keSwgdGhlXG5cdFx0Ly8gcG9zaXRpb24gaXMgc3RpbGwgcmVsYXRpdmVseSB0byB0aGUgcGFyZW50LiBTbyB3ZSBuZWVkIHRvIGFkanVzdFxuXHRcdC8vIGZvciB0aGF0XG5cdFx0dmFyIGhlYWRlckhlaWdodCA9ICQoIGR0LnRhYmxlKCkubm9kZSgpICkuZmluZCgndGhlYWQnKS5vdXRlckhlaWdodCgpO1xuXG5cdFx0Ly8gTmVlZCB0byBwYXNzIHRoZSBub2RlcyB0aHJvdWdoIGpRdWVyeSB0byBnZXQgdGhlbSBpbiBkb2N1bWVudCBvcmRlcixcblx0XHQvLyBub3Qgd2hhdCBEYXRhVGFibGVzIHRoaW5rcyBpdCBpcywgc2luY2Ugd2UgaGF2ZSBiZWVuIGFsdGVyaW5nIHRoZVxuXHRcdC8vIG9yZGVyXG5cdFx0dmFyIG5vZGVzID0gJC51bmlxdWUoIGR0LnJvd3MoIHsgcGFnZTogJ2N1cnJlbnQnIH0gKS5ub2RlcygpLnRvQXJyYXkoKSApO1xuXHRcdHZhciBtaWRkbGVzID0gJC5tYXAoIG5vZGVzLCBmdW5jdGlvbiAoIG5vZGUsIGkgKSB7XG5cdFx0XHR2YXIgdG9wID0gJChub2RlKS5wb3NpdGlvbigpLnRvcCAtIGhlYWRlckhlaWdodDtcblxuXHRcdFx0cmV0dXJuICh0b3AgKyB0b3AgKyAkKG5vZGUpLm91dGVySGVpZ2h0KCkgKSAvIDI7XG5cdFx0fSApO1xuXG5cdFx0dGhpcy5zLm1pZGRsZXMgPSBtaWRkbGVzO1xuXHRcdHRoaXMucy5ib2R5VG9wID0gJCggZHQudGFibGUoKS5ib2R5KCkgKS5vZmZzZXQoKS50b3A7XG5cdFx0dGhpcy5zLndpbmRvd0hlaWdodCA9ICQod2luZG93KS5oZWlnaHQoKTtcblx0XHR0aGlzLnMuZG9jdW1lbnRPdXRlckhlaWdodCA9ICQoZG9jdW1lbnQpLm91dGVySGVpZ2h0KCk7XG5cdH0sXG5cblxuXHQvKipcblx0ICogQ2xvbmUgYSByb3cgc28gaXQgY2FuIGJlIGZsb2F0ZWQgYXJvdW5kIHRoZSBzY3JlZW5cblx0ICpcblx0ICogQHBhcmFtICB7alF1ZXJ5fSB0YXJnZXQgTm9kZSB0byBiZSBjbG9uZWRcblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9jbG9uZTogZnVuY3Rpb24gKCB0YXJnZXQgKVxuXHR7XG5cdFx0dmFyIGR0ID0gdGhpcy5zLmR0O1xuXHRcdHZhciBjbG9uZSA9ICQoIGR0LnRhYmxlKCkubm9kZSgpLmNsb25lTm9kZShmYWxzZSkgKVxuXHRcdFx0LmFkZENsYXNzKCAnZHQtcm93UmVvcmRlci1mbG9hdCcgKVxuXHRcdFx0LmFwcGVuZCgnPHRib2R5Lz4nKVxuXHRcdFx0LmFwcGVuZCggdGFyZ2V0LmNsb25lKCBmYWxzZSApICk7XG5cblx0XHQvLyBNYXRjaCB0aGUgdGFibGUgYW5kIGNvbHVtbiB3aWR0aHMgLSByZWFkIGFsbCBzaXplcyBiZWZvcmUgc2V0dGluZ1xuXHRcdC8vIHRvIHJlZHVjZSByZWZsb3dzXG5cdFx0dmFyIHRhYmxlV2lkdGggPSB0YXJnZXQub3V0ZXJXaWR0aCgpO1xuXHRcdHZhciB0YWJsZUhlaWdodCA9IHRhcmdldC5vdXRlckhlaWdodCgpO1xuXHRcdHZhciBzaXplcyA9IHRhcmdldC5jaGlsZHJlbigpLm1hcCggZnVuY3Rpb24gKCkge1xuXHRcdFx0cmV0dXJuICQodGhpcykud2lkdGgoKTtcblx0XHR9ICk7XG5cblx0XHRjbG9uZVxuXHRcdFx0LndpZHRoKCB0YWJsZVdpZHRoIClcblx0XHRcdC5oZWlnaHQoIHRhYmxlSGVpZ2h0IClcblx0XHRcdC5maW5kKCd0cicpLmNoaWxkcmVuKCkuZWFjaCggZnVuY3Rpb24gKGkpIHtcblx0XHRcdFx0dGhpcy5zdHlsZS53aWR0aCA9IHNpemVzW2ldKydweCc7XG5cdFx0XHR9ICk7XG5cblx0XHQvLyBJbnNlcnQgaW50byB0aGUgZG9jdW1lbnQgdG8gaGF2ZSBpdCBmbG9hdGluZyBhcm91bmRcblx0XHRjbG9uZS5hcHBlbmRUbyggJ2JvZHknICk7XG5cblx0XHR0aGlzLmRvbS5jbG9uZSA9IGNsb25lO1xuXHRcdHRoaXMucy5kb21DbG9uZU91dGVySGVpZ2h0ID0gY2xvbmUub3V0ZXJIZWlnaHQoKTtcblx0fSxcblxuXG5cdC8qKlxuXHQgKiBVcGRhdGUgdGhlIGNsb25lZCBpdGVtJ3MgcG9zaXRpb24gaW4gdGhlIGRvY3VtZW50XG5cdCAqXG5cdCAqIEBwYXJhbSAge29iamVjdH0gZSBFdmVudCBnaXZpbmcgdGhlIG1vdXNlJ3MgcG9zaXRpb25cblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9jbG9uZVBvc2l0aW9uOiBmdW5jdGlvbiAoIGUgKVxuXHR7XG5cdFx0dmFyIHN0YXJ0ID0gdGhpcy5zLnN0YXJ0O1xuXHRcdHZhciB0b3BEaWZmID0gdGhpcy5fZXZlbnRUb1BhZ2UoIGUsICdZJyApIC0gc3RhcnQudG9wO1xuXHRcdHZhciBsZWZ0RGlmZiA9IHRoaXMuX2V2ZW50VG9QYWdlKCBlLCAnWCcgKSAtIHN0YXJ0LmxlZnQ7XG5cdFx0dmFyIHNuYXAgPSB0aGlzLmMuc25hcFg7XG5cdFx0dmFyIGxlZnQ7XG5cdFx0dmFyIHRvcCA9IHRvcERpZmYgKyBzdGFydC5vZmZzZXRUb3A7XG5cblx0XHRpZiAoIHNuYXAgPT09IHRydWUgKSB7XG5cdFx0XHRsZWZ0ID0gc3RhcnQub2Zmc2V0TGVmdDtcblx0XHR9XG5cdFx0ZWxzZSBpZiAoIHR5cGVvZiBzbmFwID09PSAnbnVtYmVyJyApIHtcblx0XHRcdGxlZnQgPSBzdGFydC5vZmZzZXRMZWZ0ICsgc25hcDtcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHRsZWZ0ID0gbGVmdERpZmYgKyBzdGFydC5vZmZzZXRMZWZ0O1xuXHRcdH1cblxuXHRcdGlmKHRvcCA8IDApIHtcblx0XHRcdHRvcCA9IDBcblx0XHR9XG5cdFx0ZWxzZSBpZih0b3AgKyB0aGlzLnMuZG9tQ2xvbmVPdXRlckhlaWdodCA+IHRoaXMucy5kb2N1bWVudE91dGVySGVpZ2h0KSB7XG5cdFx0XHR0b3AgPSB0aGlzLnMuZG9jdW1lbnRPdXRlckhlaWdodCAtIHRoaXMucy5kb21DbG9uZU91dGVySGVpZ2h0O1xuXHRcdH1cblxuXHRcdHRoaXMuZG9tLmNsb25lLmNzcygge1xuXHRcdFx0dG9wOiB0b3AsXG5cdFx0XHRsZWZ0OiBsZWZ0XG5cdFx0fSApO1xuXHR9LFxuXG5cblx0LyoqXG5cdCAqIEVtaXQgYW4gZXZlbnQgb24gdGhlIERhdGFUYWJsZSBmb3IgbGlzdGVuZXJzXG5cdCAqXG5cdCAqIEBwYXJhbSAge3N0cmluZ30gbmFtZSBFdmVudCBuYW1lXG5cdCAqIEBwYXJhbSAge2FycmF5fSBhcmdzIEV2ZW50IGFyZ3VtZW50c1xuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X2VtaXRFdmVudDogZnVuY3Rpb24gKCBuYW1lLCBhcmdzIClcblx0e1xuXHRcdHRoaXMucy5kdC5pdGVyYXRvciggJ3RhYmxlJywgZnVuY3Rpb24gKCBjdHgsIGkgKSB7XG5cdFx0XHQkKGN0eC5uVGFibGUpLnRyaWdnZXJIYW5kbGVyKCBuYW1lKycuZHQnLCBhcmdzICk7XG5cdFx0fSApO1xuXHR9LFxuXG5cblx0LyoqXG5cdCAqIEdldCBwYWdlWC9ZIHBvc2l0aW9uIGZyb20gYW4gZXZlbnQsIHJlZ2FyZGxlc3Mgb2YgaWYgaXQgaXMgYSBtb3VzZSBvclxuXHQgKiB0b3VjaCBldmVudC5cblx0ICpcblx0ICogQHBhcmFtICB7b2JqZWN0fSBlIEV2ZW50XG5cdCAqIEBwYXJhbSAge3N0cmluZ30gcG9zIFggb3IgWSAobXVzdCBiZSBhIGNhcGl0YWwpXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfZXZlbnRUb1BhZ2U6IGZ1bmN0aW9uICggZSwgcG9zIClcblx0e1xuXHRcdGlmICggZS50eXBlLmluZGV4T2YoICd0b3VjaCcgKSAhPT0gLTEgKSB7XG5cdFx0XHRyZXR1cm4gZS5vcmlnaW5hbEV2ZW50LnRvdWNoZXNbMF1bICdwYWdlJytwb3MgXTtcblx0XHR9XG5cblx0XHRyZXR1cm4gZVsgJ3BhZ2UnK3BvcyBdO1xuXHR9LFxuXG5cblx0LyoqXG5cdCAqIE1vdXNlIGRvd24gZXZlbnQgaGFuZGxlci4gUmVhZCBpbml0aWFsIHBvc2l0aW9ucyBhbmQgYWRkIGV2ZW50IGhhbmRsZXJzXG5cdCAqIGZvciB0aGUgbW92ZS5cblx0ICpcblx0ICogQHBhcmFtICB7b2JqZWN0fSBlICAgICAgTW91c2UgZXZlbnRcblx0ICogQHBhcmFtICB7alF1ZXJ5fSB0YXJnZXQgVFIgZWxlbWVudCB0aGF0IGlzIHRvIGJlIG1vdmVkXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfbW91c2VEb3duOiBmdW5jdGlvbiAoIGUsIHRhcmdldCApXG5cdHtcblx0XHR2YXIgdGhhdCA9IHRoaXM7XG5cdFx0dmFyIGR0ID0gdGhpcy5zLmR0O1xuXHRcdHZhciBzdGFydCA9IHRoaXMucy5zdGFydDtcblxuXHRcdHZhciBvZmZzZXQgPSB0YXJnZXQub2Zmc2V0KCk7XG5cdFx0c3RhcnQudG9wID0gdGhpcy5fZXZlbnRUb1BhZ2UoIGUsICdZJyApO1xuXHRcdHN0YXJ0LmxlZnQgPSB0aGlzLl9ldmVudFRvUGFnZSggZSwgJ1gnICk7XG5cdFx0c3RhcnQub2Zmc2V0VG9wID0gb2Zmc2V0LnRvcDtcblx0XHRzdGFydC5vZmZzZXRMZWZ0ID0gb2Zmc2V0LmxlZnQ7XG5cdFx0c3RhcnQubm9kZXMgPSAkLnVuaXF1ZSggZHQucm93cyggeyBwYWdlOiAnY3VycmVudCcgfSApLm5vZGVzKCkudG9BcnJheSgpICk7XG5cblx0XHR0aGlzLl9jYWNoZVBvc2l0aW9ucygpO1xuXHRcdHRoaXMuX2Nsb25lKCB0YXJnZXQgKTtcblx0XHR0aGlzLl9jbG9uZVBvc2l0aW9uKCBlICk7XG5cblx0XHR0aGlzLmRvbS50YXJnZXQgPSB0YXJnZXQ7XG5cdFx0dGFyZ2V0LmFkZENsYXNzKCAnZHQtcm93UmVvcmRlci1tb3ZpbmcnICk7XG5cblx0XHQkKCBkb2N1bWVudCApXG5cdFx0XHQub24oICdtb3VzZXVwLnJvd1Jlb3JkZXIgdG91Y2hlbmQucm93UmVvcmRlcicsIGZ1bmN0aW9uIChlKSB7XG5cdFx0XHRcdHRoYXQuX21vdXNlVXAoZSk7XG5cdFx0XHR9IClcblx0XHRcdC5vbiggJ21vdXNlbW92ZS5yb3dSZW9yZGVyIHRvdWNobW92ZS5yb3dSZW9yZGVyJywgZnVuY3Rpb24gKGUpIHtcblx0XHRcdFx0dGhhdC5fbW91c2VNb3ZlKGUpO1xuXHRcdFx0fSApO1xuXG5cdFx0Ly8gQ2hlY2sgaWYgd2luZG93IGlzIHgtc2Nyb2xsaW5nIC0gaWYgbm90LCBkaXNhYmxlIGl0IGZvciB0aGUgZHVyYXRpb25cblx0XHQvLyBvZiB0aGUgZHJhZ1xuXHRcdGlmICggJCh3aW5kb3cpLndpZHRoKCkgPT09ICQoZG9jdW1lbnQpLndpZHRoKCkgKSB7XG5cdFx0XHQkKGRvY3VtZW50LmJvZHkpLmFkZENsYXNzKCAnZHQtcm93UmVvcmRlci1ub092ZXJmbG93JyApO1xuXHRcdH1cblxuXHRcdC8vIENhY2hlIHNjcm9sbGluZyBpbmZvcm1hdGlvbiBzbyBtb3VzZSBtb3ZlIGRvZXNuJ3QgbmVlZCB0byByZWFkLlxuXHRcdC8vIFRoaXMgYXNzdW1lcyB0aGF0IHRoZSB3aW5kb3cgYW5kIERUIHNjcm9sbGVyIHdpbGwgbm90IGNoYW5nZSBzaXplXG5cdFx0Ly8gZHVyaW5nIGFuIHJvdyBkcmFnLCB3aGljaCBJIHRoaW5rIGlzIGEgZmFpciBhc3N1bXB0aW9uXG5cdFx0dmFyIHNjcm9sbFdyYXBwZXIgPSB0aGlzLmRvbS5kdFNjcm9sbDtcblx0XHR0aGlzLnMuc2Nyb2xsID0ge1xuXHRcdFx0d2luZG93SGVpZ2h0OiAkKHdpbmRvdykuaGVpZ2h0KCksXG5cdFx0XHR3aW5kb3dXaWR0aDogICQod2luZG93KS53aWR0aCgpLFxuXHRcdFx0ZHRUb3A6ICAgICAgICBzY3JvbGxXcmFwcGVyLmxlbmd0aCA/IHNjcm9sbFdyYXBwZXIub2Zmc2V0KCkudG9wIDogbnVsbCxcblx0XHRcdGR0TGVmdDogICAgICAgc2Nyb2xsV3JhcHBlci5sZW5ndGggPyBzY3JvbGxXcmFwcGVyLm9mZnNldCgpLmxlZnQgOiBudWxsLFxuXHRcdFx0ZHRIZWlnaHQ6ICAgICBzY3JvbGxXcmFwcGVyLmxlbmd0aCA/IHNjcm9sbFdyYXBwZXIub3V0ZXJIZWlnaHQoKSA6IG51bGwsXG5cdFx0XHRkdFdpZHRoOiAgICAgIHNjcm9sbFdyYXBwZXIubGVuZ3RoID8gc2Nyb2xsV3JhcHBlci5vdXRlcldpZHRoKCkgOiBudWxsXG5cdFx0fTtcblx0fSxcblxuXG5cdC8qKlxuXHQgKiBNb3VzZSBtb3ZlIGV2ZW50IGhhbmRsZXIgLSBtb3ZlIHRoZSBjbG9uZWQgcm93IGFuZCBzaHVmZmxlIHRoZSB0YWJsZSdzXG5cdCAqIHJvd3MgaWYgcmVxdWlyZWQuXG5cdCAqXG5cdCAqIEBwYXJhbSAge29iamVjdH0gZSBNb3VzZSBldmVudFxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X21vdXNlTW92ZTogZnVuY3Rpb24gKCBlIClcblx0e1xuXHRcdHRoaXMuX2Nsb25lUG9zaXRpb24oIGUgKTtcblxuXHRcdC8vIFRyYW5zZm9ybSB0aGUgbW91c2UgcG9zaXRpb24gaW50byBhIHBvc2l0aW9uIGluIHRoZSB0YWJsZSdzIGJvZHlcblx0XHR2YXIgYm9keVkgPSB0aGlzLl9ldmVudFRvUGFnZSggZSwgJ1knICkgLSB0aGlzLnMuYm9keVRvcDtcblx0XHR2YXIgbWlkZGxlcyA9IHRoaXMucy5taWRkbGVzO1xuXHRcdHZhciBpbnNlcnRQb2ludCA9IG51bGw7XG5cdFx0dmFyIGR0ID0gdGhpcy5zLmR0O1xuXG5cdFx0Ly8gRGV0ZXJtaW5lIHdoZXJlIHRoZSByb3cgc2hvdWxkIGJlIGluc2VydGVkIGJhc2VkIG9uIHRoZSBtb3VzZVxuXHRcdC8vIHBvc2l0aW9uXG5cdFx0Zm9yICggdmFyIGk9MCwgaWVuPW1pZGRsZXMubGVuZ3RoIDsgaTxpZW4gOyBpKysgKSB7XG5cdFx0XHRpZiAoIGJvZHlZIDwgbWlkZGxlc1tpXSApIHtcblx0XHRcdFx0aW5zZXJ0UG9pbnQgPSBpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAoIGluc2VydFBvaW50ID09PSBudWxsICkge1xuXHRcdFx0aW5zZXJ0UG9pbnQgPSBtaWRkbGVzLmxlbmd0aDtcblx0XHR9XG5cblx0XHQvLyBQZXJmb3JtIHRoZSBET00gc2h1ZmZsZSBpZiBpdCBoYXMgY2hhbmdlZCBmcm9tIGxhc3QgdGltZVxuXHRcdGlmICggdGhpcy5zLmxhc3RJbnNlcnQgPT09IG51bGwgfHwgdGhpcy5zLmxhc3RJbnNlcnQgIT09IGluc2VydFBvaW50ICkge1xuXHRcdFx0dmFyIG5vZGVzID0gJC51bmlxdWUoIGR0LnJvd3MoIHsgcGFnZTogJ2N1cnJlbnQnIH0gKS5ub2RlcygpLnRvQXJyYXkoKSApO1xuXG5cdFx0XHRpZiAoIGluc2VydFBvaW50ID4gdGhpcy5zLmxhc3RJbnNlcnQgKSB7XG5cdFx0XHRcdHRoaXMuZG9tLnRhcmdldC5pbnNlcnRBZnRlciggbm9kZXNbIGluc2VydFBvaW50LTEgXSApO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdHRoaXMuZG9tLnRhcmdldC5pbnNlcnRCZWZvcmUoIG5vZGVzWyBpbnNlcnRQb2ludCBdICk7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuX2NhY2hlUG9zaXRpb25zKCk7XG5cblx0XHRcdHRoaXMucy5sYXN0SW5zZXJ0ID0gaW5zZXJ0UG9pbnQ7XG5cdFx0fVxuXG5cdFx0dGhpcy5fc2hpZnRTY3JvbGwoIGUgKTtcblx0fSxcblxuXG5cdC8qKlxuXHQgKiBNb3VzZSB1cCBldmVudCBoYW5kbGVyIC0gcmVsZWFzZSB0aGUgZXZlbnQgaGFuZGxlcnMgYW5kIHBlcmZvcm0gdGhlXG5cdCAqIHRhYmxlIHVwZGF0ZXNcblx0ICpcblx0ICogQHBhcmFtICB7b2JqZWN0fSBlIE1vdXNlIGV2ZW50XG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfbW91c2VVcDogZnVuY3Rpb24gKCBlIClcblx0e1xuXHRcdHZhciB0aGF0ID0gdGhpcztcblx0XHR2YXIgZHQgPSB0aGlzLnMuZHQ7XG5cdFx0dmFyIGksIGllbjtcblx0XHR2YXIgZGF0YVNyYyA9IHRoaXMuYy5kYXRhU3JjO1xuXG5cdFx0dGhpcy5kb20uY2xvbmUucmVtb3ZlKCk7XG5cdFx0dGhpcy5kb20uY2xvbmUgPSBudWxsO1xuXG5cdFx0dGhpcy5kb20udGFyZ2V0LnJlbW92ZUNsYXNzKCAnZHQtcm93UmVvcmRlci1tb3ZpbmcnICk7XG5cdFx0Ly90aGlzLmRvbS50YXJnZXQgPSBudWxsO1xuXG5cdFx0JChkb2N1bWVudCkub2ZmKCAnLnJvd1Jlb3JkZXInICk7XG5cdFx0JChkb2N1bWVudC5ib2R5KS5yZW1vdmVDbGFzcyggJ2R0LXJvd1Jlb3JkZXItbm9PdmVyZmxvdycgKTtcblxuXHRcdGNsZWFySW50ZXJ2YWwoIHRoaXMucy5zY3JvbGxJbnRlcnZhbCApO1xuXHRcdHRoaXMucy5zY3JvbGxJbnRlcnZhbCA9IG51bGw7XG5cblx0XHQvLyBDYWxjdWxhdGUgdGhlIGRpZmZlcmVuY2Vcblx0XHR2YXIgc3RhcnROb2RlcyA9IHRoaXMucy5zdGFydC5ub2Rlcztcblx0XHR2YXIgZW5kTm9kZXMgPSAkLnVuaXF1ZSggZHQucm93cyggeyBwYWdlOiAnY3VycmVudCcgfSApLm5vZGVzKCkudG9BcnJheSgpICk7XG5cdFx0dmFyIGlkRGlmZiA9IHt9O1xuXHRcdHZhciBmdWxsRGlmZiA9IFtdO1xuXHRcdHZhciBkaWZmTm9kZXMgPSBbXTtcblx0XHR2YXIgZ2V0RGF0YUZuID0gdGhpcy5zLmdldERhdGFGbjtcblx0XHR2YXIgc2V0RGF0YUZuID0gdGhpcy5zLnNldERhdGFGbjtcblxuXHRcdGZvciAoIGk9MCwgaWVuPXN0YXJ0Tm9kZXMubGVuZ3RoIDsgaTxpZW4gOyBpKysgKSB7XG5cdFx0XHRpZiAoIHN0YXJ0Tm9kZXNbaV0gIT09IGVuZE5vZGVzW2ldICkge1xuXHRcdFx0XHR2YXIgaWQgPSBkdC5yb3coIGVuZE5vZGVzW2ldICkuaWQoKTtcblx0XHRcdFx0dmFyIGVuZFJvd0RhdGEgPSBkdC5yb3coIGVuZE5vZGVzW2ldICkuZGF0YSgpO1xuXHRcdFx0XHR2YXIgc3RhcnRSb3dEYXRhID0gZHQucm93KCBzdGFydE5vZGVzW2ldICkuZGF0YSgpO1xuXG5cdFx0XHRcdGlmICggaWQgKSB7XG5cdFx0XHRcdFx0aWREaWZmWyBpZCBdID0gZ2V0RGF0YUZuKCBzdGFydFJvd0RhdGEgKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGZ1bGxEaWZmLnB1c2goIHtcblx0XHRcdFx0XHRub2RlOiBlbmROb2Rlc1tpXSxcblx0XHRcdFx0XHRvbGREYXRhOiBnZXREYXRhRm4oIGVuZFJvd0RhdGEgKSxcblx0XHRcdFx0XHRuZXdEYXRhOiBnZXREYXRhRm4oIHN0YXJ0Um93RGF0YSApLFxuXHRcdFx0XHRcdG5ld1Bvc2l0aW9uOiBpLFxuXHRcdFx0XHRcdG9sZFBvc2l0aW9uOiAkLmluQXJyYXkoIGVuZE5vZGVzW2ldLCBzdGFydE5vZGVzIClcblx0XHRcdFx0fSApO1xuXG5cdFx0XHRcdGRpZmZOb2Rlcy5wdXNoKCBlbmROb2Rlc1tpXSApO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRcblx0XHQvLyBDcmVhdGUgZXZlbnQgYXJnc1xuXHRcdHZhciBldmVudEFyZ3MgPSBbIGZ1bGxEaWZmLCB7XG5cdFx0XHRkYXRhU3JjOiAgICAgICBkYXRhU3JjLFxuXHRcdFx0bm9kZXM6ICAgICAgICAgZGlmZk5vZGVzLFxuXHRcdFx0dmFsdWVzOiAgICAgICAgaWREaWZmLFxuXHRcdFx0dHJpZ2dlclJvdzogICAgZHQucm93KCB0aGlzLmRvbS50YXJnZXQgKSxcblx0XHRcdG9yaWdpbmFsRXZlbnQ6IGVcblx0XHR9IF07XG5cdFx0XG5cdFx0Ly8gRW1pdCBldmVudFxuXHRcdHRoaXMuX2VtaXRFdmVudCggJ3Jvdy1yZW9yZGVyJywgZXZlbnRBcmdzICk7XG5cblx0XHR2YXIgdXBkYXRlID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0aWYgKCB0aGF0LmMudXBkYXRlICkge1xuXHRcdFx0XHRmb3IgKCBpPTAsIGllbj1mdWxsRGlmZi5sZW5ndGggOyBpPGllbiA7IGkrKyApIHtcblx0XHRcdFx0XHR2YXIgcm93ID0gZHQucm93KCBmdWxsRGlmZltpXS5ub2RlICk7XG5cdFx0XHRcdFx0dmFyIHJvd0RhdGEgPSByb3cuZGF0YSgpO1xuXG5cdFx0XHRcdFx0c2V0RGF0YUZuKCByb3dEYXRhLCBmdWxsRGlmZltpXS5uZXdEYXRhICk7XG5cblx0XHRcdFx0XHQvLyBJbnZhbGlkYXRlIHRoZSBjZWxsIHRoYXQgaGFzIHRoZSBzYW1lIGRhdGEgc291cmNlIGFzIHRoZSBkYXRhU3JjXG5cdFx0XHRcdFx0ZHQuY29sdW1ucygpLmV2ZXJ5KCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRpZiAoIHRoaXMuZGF0YVNyYygpID09PSBkYXRhU3JjICkge1xuXHRcdFx0XHRcdFx0XHRkdC5jZWxsKCBmdWxsRGlmZltpXS5ub2RlLCB0aGlzLmluZGV4KCkgKS5pbnZhbGlkYXRlKCAnZGF0YScgKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9ICk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBUcmlnZ2VyIHJvdyByZW9yZGVyZWQgZXZlbnRcblx0XHRcdFx0dGhhdC5fZW1pdEV2ZW50KCAncm93LXJlb3JkZXJlZCcsIGV2ZW50QXJncyApO1xuXG5cdFx0XHRcdGR0LmRyYXcoIGZhbHNlICk7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdC8vIEVkaXRvciBpbnRlcmZhY2Vcblx0XHRpZiAoIHRoaXMuYy5lZGl0b3IgKSB7XG5cdFx0XHQvLyBEaXNhYmxlIHVzZXIgaW50ZXJhY3Rpb24gd2hpbGUgRWRpdG9yIGlzIHN1Ym1pdHRpbmdcblx0XHRcdHRoaXMuYy5lbmFibGUgPSBmYWxzZTtcblxuXHRcdFx0dGhpcy5jLmVkaXRvclxuXHRcdFx0XHQuZWRpdChcblx0XHRcdFx0XHRkaWZmTm9kZXMsXG5cdFx0XHRcdFx0ZmFsc2UsXG5cdFx0XHRcdFx0JC5leHRlbmQoIHtzdWJtaXQ6ICdjaGFuZ2VkJ30sIHRoaXMuYy5mb3JtT3B0aW9ucyApXG5cdFx0XHRcdClcblx0XHRcdFx0Lm11bHRpU2V0KCBkYXRhU3JjLCBpZERpZmYgKVxuXHRcdFx0XHQub25lKCAncHJlU3VibWl0Q2FuY2VsbGVkLnJvd1Jlb3JkZXInLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0dGhhdC5jLmVuYWJsZSA9IHRydWU7XG5cdFx0XHRcdFx0dGhhdC5jLmVkaXRvci5vZmYoICcucm93UmVvcmRlcicgKTtcblx0XHRcdFx0XHRkdC5kcmF3KCBmYWxzZSApO1xuXHRcdFx0XHR9IClcblx0XHRcdFx0Lm9uZSggJ3N1Ym1pdFVuc3VjY2Vzc2Z1bC5yb3dSZW9yZGVyJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdGR0LmRyYXcoIGZhbHNlICk7XG5cdFx0XHRcdH0gKVxuXHRcdFx0XHQub25lKCAnc3VibWl0U3VjY2Vzcy5yb3dSZW9yZGVyJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdHVwZGF0ZSgpO1xuXHRcdFx0XHR9IClcblx0XHRcdFx0Lm9uZSggJ3N1Ym1pdENvbXBsZXRlJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdHRoYXQuYy5lbmFibGUgPSB0cnVlO1xuXHRcdFx0XHRcdHRoYXQuYy5lZGl0b3Iub2ZmKCAnLnJvd1Jlb3JkZXInICk7XG5cdFx0XHRcdH0gKVxuXHRcdFx0XHQuc3VibWl0KCk7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0dXBkYXRlKCk7XG5cdFx0fVxuXHR9LFxuXG5cblx0LyoqXG5cdCAqIE1vdmUgdGhlIHdpbmRvdyBhbmQgRGF0YVRhYmxlcyBzY3JvbGxpbmcgZHVyaW5nIGEgZHJhZyB0byBzY3JvbGwgbmV3XG5cdCAqIGNvbnRlbnQgaW50byB2aWV3LlxuXHQgKlxuXHQgKiBUaGlzIG1hdGNoZXMgdGhlIGBfc2hpZnRTY3JvbGxgIG1ldGhvZCB1c2VkIGluIEF1dG9GaWxsLCBidXQgb25seVxuXHQgKiBob3Jpem9udGFsIHNjcm9sbGluZyBpcyBjb25zaWRlcmVkIGhlcmUuXG5cdCAqXG5cdCAqIEBwYXJhbSAge29iamVjdH0gZSBNb3VzZSBtb3ZlIGV2ZW50IG9iamVjdFxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X3NoaWZ0U2Nyb2xsOiBmdW5jdGlvbiAoIGUgKVxuXHR7XG5cdFx0dmFyIHRoYXQgPSB0aGlzO1xuXHRcdHZhciBkdCA9IHRoaXMucy5kdDtcblx0XHR2YXIgc2Nyb2xsID0gdGhpcy5zLnNjcm9sbDtcblx0XHR2YXIgcnVuSW50ZXJ2YWwgPSBmYWxzZTtcblx0XHR2YXIgc2Nyb2xsU3BlZWQgPSA1O1xuXHRcdHZhciBidWZmZXIgPSA2NTtcblx0XHR2YXJcblx0XHRcdHdpbmRvd1kgPSBlLnBhZ2VZIC0gZG9jdW1lbnQuYm9keS5zY3JvbGxUb3AsXG5cdFx0XHR3aW5kb3dWZXJ0LFxuXHRcdFx0ZHRWZXJ0O1xuXG5cdFx0Ly8gV2luZG93IGNhbGN1bGF0aW9ucyAtIGJhc2VkIG9uIHRoZSBtb3VzZSBwb3NpdGlvbiBpbiB0aGUgd2luZG93LFxuXHRcdC8vIHJlZ2FyZGxlc3Mgb2Ygc2Nyb2xsaW5nXG5cdFx0aWYgKCB3aW5kb3dZIDwgJCh3aW5kb3cpLnNjcm9sbFRvcCgpICsgYnVmZmVyICkge1xuXHRcdFx0d2luZG93VmVydCA9IHNjcm9sbFNwZWVkICogLTE7XG5cdFx0fVxuXHRcdGVsc2UgaWYgKCB3aW5kb3dZID4gc2Nyb2xsLndpbmRvd0hlaWdodCArICQod2luZG93KS5zY3JvbGxUb3AoKSAtIGJ1ZmZlciApIHtcblx0XHRcdHdpbmRvd1ZlcnQgPSBzY3JvbGxTcGVlZDtcblx0XHR9XG5cblx0XHQvLyBEYXRhVGFibGVzIHNjcm9sbGluZyBjYWxjdWxhdGlvbnMgLSBiYXNlZCBvbiB0aGUgdGFibGUncyBwb3NpdGlvbiBpblxuXHRcdC8vIHRoZSBkb2N1bWVudCBhbmQgdGhlIG1vdXNlIHBvc2l0aW9uIG9uIHRoZSBwYWdlXG5cdFx0aWYgKCBzY3JvbGwuZHRUb3AgIT09IG51bGwgJiYgZS5wYWdlWSA8IHNjcm9sbC5kdFRvcCArIGJ1ZmZlciApIHtcblx0XHRcdGR0VmVydCA9IHNjcm9sbFNwZWVkICogLTE7XG5cdFx0fVxuXHRcdGVsc2UgaWYgKCBzY3JvbGwuZHRUb3AgIT09IG51bGwgJiYgZS5wYWdlWSA+IHNjcm9sbC5kdFRvcCArIHNjcm9sbC5kdEhlaWdodCAtIGJ1ZmZlciApIHtcblx0XHRcdGR0VmVydCA9IHNjcm9sbFNwZWVkO1xuXHRcdH1cblxuXHRcdC8vIFRoaXMgaXMgd2hlcmUgaXQgZ2V0cyBpbnRlcmVzdGluZy4gV2Ugd2FudCB0byBjb250aW51ZSBzY3JvbGxpbmdcblx0XHQvLyB3aXRob3V0IHJlcXVpcmluZyBhIG1vdXNlIG1vdmUsIHNvIHdlIG5lZWQgYW4gaW50ZXJ2YWwgdG8gYmVcblx0XHQvLyB0cmlnZ2VyZWQuIFRoZSBpbnRlcnZhbCBzaG91bGQgY29udGludWUgdW50aWwgaXQgaXMgbm8gbG9uZ2VyIG5lZWRlZCxcblx0XHQvLyBidXQgaXQgbXVzdCBhbHNvIHVzZSB0aGUgbGF0ZXN0IHNjcm9sbCBjb21tYW5kcyAoZm9yIGV4YW1wbGUgY29uc2lkZXJcblx0XHQvLyB0aGF0IHRoZSBtb3VzZSBtaWdodCBtb3ZlIGZyb20gc2Nyb2xsaW5nIHVwIHRvIHNjcm9sbGluZyBsZWZ0LCBhbGxcblx0XHQvLyB3aXRoIHRoZSBzYW1lIGludGVydmFsIHJ1bm5pbmcuIFdlIHVzZSB0aGUgYHNjcm9sbGAgb2JqZWN0IHRvIFwicGFzc1wiXG5cdFx0Ly8gdGhpcyBpbmZvcm1hdGlvbiB0byB0aGUgaW50ZXJ2YWwuIENhbid0IHVzZSBsb2NhbCB2YXJpYWJsZXMgYXMgdGhleVxuXHRcdC8vIHdvdWxkbid0IGJlIHRoZSBvbmVzIHRoYXQgYXJlIHVzZWQgYnkgYW4gYWxyZWFkeSBleGlzdGluZyBpbnRlcnZhbCFcblx0XHRpZiAoIHdpbmRvd1ZlcnQgfHwgZHRWZXJ0ICkge1xuXHRcdFx0c2Nyb2xsLndpbmRvd1ZlcnQgPSB3aW5kb3dWZXJ0O1xuXHRcdFx0c2Nyb2xsLmR0VmVydCA9IGR0VmVydDtcblx0XHRcdHJ1bkludGVydmFsID0gdHJ1ZTtcblx0XHR9XG5cdFx0ZWxzZSBpZiAoIHRoaXMucy5zY3JvbGxJbnRlcnZhbCApIHtcblx0XHRcdC8vIERvbid0IG5lZWQgdG8gc2Nyb2xsIC0gcmVtb3ZlIGFueSBleGlzdGluZyB0aW1lclxuXHRcdFx0Y2xlYXJJbnRlcnZhbCggdGhpcy5zLnNjcm9sbEludGVydmFsICk7XG5cdFx0XHR0aGlzLnMuc2Nyb2xsSW50ZXJ2YWwgPSBudWxsO1xuXHRcdH1cblxuXHRcdC8vIElmIHdlIG5lZWQgdG8gcnVuIHRoZSBpbnRlcnZhbCB0byBzY3JvbGwgYW5kIHRoZXJlIGlzIG5vIGV4aXN0aW5nXG5cdFx0Ly8gaW50ZXJ2YWwgKGlmIHRoZXJlIGlzIGFuIGV4aXN0aW5nIG9uZSwgaXQgd2lsbCBjb250aW51ZSB0byBydW4pXG5cdFx0aWYgKCAhIHRoaXMucy5zY3JvbGxJbnRlcnZhbCAmJiBydW5JbnRlcnZhbCApIHtcblx0XHRcdHRoaXMucy5zY3JvbGxJbnRlcnZhbCA9IHNldEludGVydmFsKCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdC8vIERvbid0IG5lZWQgdG8gd29ycnkgYWJvdXQgc2V0dGluZyBzY3JvbGwgPDAgb3IgYmV5b25kIHRoZVxuXHRcdFx0XHQvLyBzY3JvbGwgYm91bmQgYXMgdGhlIGJyb3dzZXIgd2lsbCBqdXN0IHJlamVjdCB0aGF0LlxuXHRcdFx0XHRpZiAoIHNjcm9sbC53aW5kb3dWZXJ0ICkge1xuXHRcdFx0XHRcdHZhciB0b3AgPSAkKGRvY3VtZW50KS5zY3JvbGxUb3AoKTtcblx0XHRcdFx0XHQkKGRvY3VtZW50KS5zY3JvbGxUb3AodG9wICsgc2Nyb2xsLndpbmRvd1ZlcnQpO1xuXG5cdFx0XHRcdFx0aWYgKCB0b3AgIT09ICQoZG9jdW1lbnQpLnNjcm9sbFRvcCgpICkge1xuXHRcdFx0XHRcdFx0dmFyIG1vdmUgPSBwYXJzZUZsb2F0KHRoYXQuZG9tLmNsb25lLmNzcyhcInRvcFwiKSk7XG5cdFx0XHRcdFx0XHR0aGF0LmRvbS5jbG9uZS5jc3MoXCJ0b3BcIiwgbW92ZSArIHNjcm9sbC53aW5kb3dWZXJ0KTtcdFx0XHRcdFx0XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gRGF0YVRhYmxlcyBzY3JvbGxpbmdcblx0XHRcdFx0aWYgKCBzY3JvbGwuZHRWZXJ0ICkge1xuXHRcdFx0XHRcdHZhciBzY3JvbGxlciA9IHRoYXQuZG9tLmR0U2Nyb2xsWzBdO1xuXG5cdFx0XHRcdFx0aWYgKCBzY3JvbGwuZHRWZXJ0ICkge1xuXHRcdFx0XHRcdFx0c2Nyb2xsZXIuc2Nyb2xsVG9wICs9IHNjcm9sbC5kdFZlcnQ7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9LCAyMCApO1xuXHRcdH1cblx0fVxufSApO1xuXG5cblxuLyoqXG4gKiBSb3dSZW9yZGVyIGRlZmF1bHQgc2V0dGluZ3MgZm9yIGluaXRpYWxpc2F0aW9uXG4gKlxuICogQG5hbWVzcGFjZVxuICogQG5hbWUgUm93UmVvcmRlci5kZWZhdWx0c1xuICogQHN0YXRpY1xuICovXG5Sb3dSZW9yZGVyLmRlZmF1bHRzID0ge1xuXHQvKipcblx0ICogRGF0YSBwb2ludCBpbiB0aGUgaG9zdCByb3cncyBkYXRhIHNvdXJjZSBvYmplY3QgZm9yIHdoZXJlIHRvIGdldCBhbmQgc2V0XG5cdCAqIHRoZSBkYXRhIHRvIHJlb3JkZXIuIFRoaXMgd2lsbCBub3JtYWxseSBhbHNvIGJlIHRoZSBzb3J0aW5nIGNvbHVtbi5cblx0ICpcblx0ICogQHR5cGUge051bWJlcn1cblx0ICovXG5cdGRhdGFTcmM6IDAsXG5cblx0LyoqXG5cdCAqIEVkaXRvciBpbnN0YW5jZSB0aGF0IHdpbGwgYmUgdXNlZCB0byBwZXJmb3JtIHRoZSB1cGRhdGVcblx0ICpcblx0ICogQHR5cGUge0RhdGFUYWJsZS5FZGl0b3J9XG5cdCAqL1xuXHRlZGl0b3I6IG51bGwsXG5cblx0LyoqXG5cdCAqIEVuYWJsZSAvIGRpc2FibGUgUm93UmVvcmRlcidzIHVzZXIgaW50ZXJhY3Rpb25cblx0ICogQHR5cGUge0Jvb2xlYW59XG5cdCAqL1xuXHRlbmFibGU6IHRydWUsXG5cblx0LyoqXG5cdCAqIEZvcm0gb3B0aW9ucyB0byBwYXNzIHRvIEVkaXRvciB3aGVuIHN1Ym1pdHRpbmcgYSBjaGFuZ2UgaW4gdGhlIHJvdyBvcmRlci5cblx0ICogU2VlIHRoZSBFZGl0b3IgYGZyb20tb3B0aW9uc2Agb2JqZWN0IGZvciBkZXRhaWxzIG9mIHRoZSBvcHRpb25zXG5cdCAqIGF2YWlsYWJsZS5cblx0ICogQHR5cGUge09iamVjdH1cblx0ICovXG5cdGZvcm1PcHRpb25zOiB7fSxcblxuXHQvKipcblx0ICogRHJhZyBoYW5kbGUgc2VsZWN0b3IuIFRoaXMgZGVmaW5lcyB0aGUgZWxlbWVudCB0aGF0IHdoZW4gZHJhZ2dlZCB3aWxsXG5cdCAqIHJlb3JkZXIgYSByb3cuXG5cdCAqXG5cdCAqIEB0eXBlIHtTdHJpbmd9XG5cdCAqL1xuXHRzZWxlY3RvcjogJ3RkOmZpcnN0LWNoaWxkJyxcblxuXHQvKipcblx0ICogT3B0aW9uYWxseSBsb2NrIHRoZSBkcmFnZ2VkIHJvdydzIHgtcG9zaXRpb24uIFRoaXMgY2FuIGJlIGB0cnVlYCB0b1xuXHQgKiBmaXggdGhlIHBvc2l0aW9uIG1hdGNoIHRoZSBob3N0IHRhYmxlJ3MsIGBmYWxzZWAgdG8gYWxsb3cgZnJlZSBtb3ZlbWVudFxuXHQgKiBvZiB0aGUgcm93LCBvciBhIG51bWJlciB0byBkZWZpbmUgYW4gb2Zmc2V0IGZyb20gdGhlIGhvc3QgdGFibGUuXG5cdCAqXG5cdCAqIEB0eXBlIHtCb29sZWFufG51bWJlcn1cblx0ICovXG5cdHNuYXBYOiBmYWxzZSxcblxuXHQvKipcblx0ICogVXBkYXRlIHRoZSB0YWJsZSdzIGRhdGEgb24gZHJvcFxuXHQgKlxuXHQgKiBAdHlwZSB7Qm9vbGVhbn1cblx0ICovXG5cdHVwZGF0ZTogdHJ1ZSxcblxuXHQvKipcblx0ICogU2VsZWN0b3IgZm9yIGNoaWxkcmVuIG9mIHRoZSBkcmFnIGhhbmRsZSBzZWxlY3RvciB0aGF0IG1vdXNlRG93biBldmVudHNcblx0ICogd2lsbCBiZSBwYXNzZWQgdGhyb3VnaCB0byBhbmQgZHJhZyB3aWxsIG5vdCBhY3RpdmF0ZVxuXHQgKlxuXHQgKiBAdHlwZSB7U3RyaW5nfVxuXHQgKi9cblx0ZXhjbHVkZWRDaGlsZHJlbjogJ2EnXG59O1xuXG5cbi8qXG4gKiBBUElcbiAqL1xudmFyIEFwaSA9ICQuZm4uZGF0YVRhYmxlLkFwaTtcblxuLy8gRG9lc24ndCBkbyBhbnl0aGluZyAtIHdvcmsgYXJvdW5kIGZvciBhIGJ1ZyBpbiBEVC4uLiBOb3QgZG9jdW1lbnRlZFxuQXBpLnJlZ2lzdGVyKCAncm93UmVvcmRlcigpJywgZnVuY3Rpb24gKCkge1xuXHRyZXR1cm4gdGhpcztcbn0gKTtcblxuQXBpLnJlZ2lzdGVyKCAncm93UmVvcmRlci5lbmFibGUoKScsIGZ1bmN0aW9uICggdG9nZ2xlICkge1xuXHRpZiAoIHRvZ2dsZSA9PT0gdW5kZWZpbmVkICkge1xuXHRcdHRvZ2dsZSA9IHRydWU7XG5cdH1cblxuXHRyZXR1cm4gdGhpcy5pdGVyYXRvciggJ3RhYmxlJywgZnVuY3Rpb24gKCBjdHggKSB7XG5cdFx0aWYgKCBjdHgucm93cmVvcmRlciApIHtcblx0XHRcdGN0eC5yb3dyZW9yZGVyLmMuZW5hYmxlID0gdG9nZ2xlO1xuXHRcdH1cblx0fSApO1xufSApO1xuXG5BcGkucmVnaXN0ZXIoICdyb3dSZW9yZGVyLmRpc2FibGUoKScsIGZ1bmN0aW9uICgpIHtcblx0cmV0dXJuIHRoaXMuaXRlcmF0b3IoICd0YWJsZScsIGZ1bmN0aW9uICggY3R4ICkge1xuXHRcdGlmICggY3R4LnJvd3Jlb3JkZXIgKSB7XG5cdFx0XHRjdHgucm93cmVvcmRlci5jLmVuYWJsZSA9IGZhbHNlO1xuXHRcdH1cblx0fSApO1xufSApO1xuXG5cbi8qKlxuICogVmVyc2lvbiBpbmZvcm1hdGlvblxuICpcbiAqIEBuYW1lIFJvd1Jlb3JkZXIudmVyc2lvblxuICogQHN0YXRpY1xuICovXG5Sb3dSZW9yZGVyLnZlcnNpb24gPSAnMS4yLjgnO1xuXG5cbiQuZm4uZGF0YVRhYmxlLlJvd1Jlb3JkZXIgPSBSb3dSZW9yZGVyO1xuJC5mbi5EYXRhVGFibGUuUm93UmVvcmRlciA9IFJvd1Jlb3JkZXI7XG5cbi8vIEF0dGFjaCBhIGxpc3RlbmVyIHRvIHRoZSBkb2N1bWVudCB3aGljaCBsaXN0ZW5zIGZvciBEYXRhVGFibGVzIGluaXRpYWxpc2F0aW9uXG4vLyBldmVudHMgc28gd2UgY2FuIGF1dG9tYXRpY2FsbHkgaW5pdGlhbGlzZVxuJChkb2N1bWVudCkub24oICdpbml0LmR0LmR0cicsIGZ1bmN0aW9uIChlLCBzZXR0aW5ncywganNvbikge1xuXHRpZiAoIGUubmFtZXNwYWNlICE9PSAnZHQnICkge1xuXHRcdHJldHVybjtcblx0fVxuXG5cdHZhciBpbml0ID0gc2V0dGluZ3Mub0luaXQucm93UmVvcmRlcjtcblx0dmFyIGRlZmF1bHRzID0gRGF0YVRhYmxlLmRlZmF1bHRzLnJvd1Jlb3JkZXI7XG5cblx0aWYgKCBpbml0IHx8IGRlZmF1bHRzICkge1xuXHRcdHZhciBvcHRzID0gJC5leHRlbmQoIHt9LCBpbml0LCBkZWZhdWx0cyApO1xuXG5cdFx0aWYgKCBpbml0ICE9PSBmYWxzZSApIHtcblx0XHRcdG5ldyBSb3dSZW9yZGVyKCBzZXR0aW5ncywgb3B0cyAgKTtcblx0XHR9XG5cdH1cbn0gKTtcblxuXG5yZXR1cm4gUm93UmVvcmRlcjtcbn0pKTtcbiJdLCJzb3VyY2VSb290IjoiIn0=