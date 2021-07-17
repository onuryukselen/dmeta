(self["webpackChunkdmeta"] = self["webpackChunkdmeta"] || []).push([["npm.datatables.net-colreorder"],{

/***/ "./node_modules/datatables.net-colreorder/js/dataTables.colReorder.js":
/*!****************************************************************************!*\
  !*** ./node_modules/datatables.net-colreorder/js/dataTables.colReorder.js ***!
  \****************************************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: __webpack_require__, __webpack_exports__, module */
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*! ColReorder 1.5.2
 * ©2010-2019 SpryMedia Ltd - datatables.net/license
 */

/**
 * @summary     ColReorder
 * @description Provide the ability to reorder columns in a DataTable
 * @version     1.5.2
 * @file        dataTables.colReorder.js
 * @author      SpryMedia Ltd (www.sprymedia.co.uk)
 * @contact     www.sprymedia.co.uk/contact
 * @copyright   Copyright 2010-2019 SpryMedia Ltd.
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
 * Switch the key value pairing of an index array to be value key (i.e. the old value is now the
 * key). For example consider [ 2, 0, 1 ] this would be returned as [ 1, 2, 0 ].
 *  @method  fnInvertKeyValues
 *  @param   array aIn Array to switch around
 *  @returns array
 */
function fnInvertKeyValues( aIn )
{
	var aRet=[];
	for ( var i=0, iLen=aIn.length ; i<iLen ; i++ )
	{
		aRet[ aIn[i] ] = i;
	}
	return aRet;
}


/**
 * Modify an array by switching the position of two elements
 *  @method  fnArraySwitch
 *  @param   array aArray Array to consider, will be modified by reference (i.e. no return)
 *  @param   int iFrom From point
 *  @param   int iTo Insert point
 *  @returns void
 */
function fnArraySwitch( aArray, iFrom, iTo )
{
	var mStore = aArray.splice( iFrom, 1 )[0];
	aArray.splice( iTo, 0, mStore );
}


/**
 * Switch the positions of nodes in a parent node (note this is specifically designed for
 * table rows). Note this function considers all element nodes under the parent!
 *  @method  fnDomSwitch
 *  @param   string sTag Tag to consider
 *  @param   int iFrom Element to move
 *  @param   int Point to element the element to (before this point), can be null for append
 *  @returns void
 */
function fnDomSwitch( nParent, iFrom, iTo )
{
	var anTags = [];
	for ( var i=0, iLen=nParent.childNodes.length ; i<iLen ; i++ )
	{
		if ( nParent.childNodes[i].nodeType == 1 )
		{
			anTags.push( nParent.childNodes[i] );
		}
	}
	var nStore = anTags[ iFrom ];

	if ( iTo !== null )
	{
		nParent.insertBefore( nStore, anTags[iTo] );
	}
	else
	{
		nParent.appendChild( nStore );
	}
}


/**
 * Plug-in for DataTables which will reorder the internal column structure by taking the column
 * from one position (iFrom) and insert it into a given point (iTo).
 *  @method  $.fn.dataTableExt.oApi.fnColReorder
 *  @param   object oSettings DataTables settings object - automatically added by DataTables!
 *  @param   int iFrom Take the column to be repositioned from this point
 *  @param   int iTo and insert it into this point
 *  @param   bool drop Indicate if the reorder is the final one (i.e. a drop)
 *    not a live reorder
 *  @param   bool invalidateRows speeds up processing if false passed
 *  @returns void
 */
$.fn.dataTableExt.oApi.fnColReorder = function ( oSettings, iFrom, iTo, drop, invalidateRows )
{
	var i, iLen, j, jLen, jen, iCols=oSettings.aoColumns.length, nTrs, oCol;
	var attrMap = function ( obj, prop, mapping ) {
		if ( ! obj[ prop ] || typeof obj[ prop ] === 'function' ) {
			return;
		}

		var a = obj[ prop ].split('.');
		var num = a.shift();

		if ( isNaN( num*1 ) ) {
			return;
		}

		obj[ prop ] = mapping[ num*1 ]+'.'+a.join('.');
	};

	/* Sanity check in the input */
	if ( iFrom == iTo )
	{
		/* Pointless reorder */
		return;
	}

	if ( iFrom < 0 || iFrom >= iCols )
	{
		this.oApi._fnLog( oSettings, 1, "ColReorder 'from' index is out of bounds: "+iFrom );
		return;
	}

	if ( iTo < 0 || iTo >= iCols )
	{
		this.oApi._fnLog( oSettings, 1, "ColReorder 'to' index is out of bounds: "+iTo );
		return;
	}

	/*
	 * Calculate the new column array index, so we have a mapping between the old and new
	 */
	var aiMapping = [];
	for ( i=0, iLen=iCols ; i<iLen ; i++ )
	{
		aiMapping[i] = i;
	}
	fnArraySwitch( aiMapping, iFrom, iTo );
	var aiInvertMapping = fnInvertKeyValues( aiMapping );


	/*
	 * Convert all internal indexing to the new column order indexes
	 */
	/* Sorting */
	for ( i=0, iLen=oSettings.aaSorting.length ; i<iLen ; i++ )
	{
		oSettings.aaSorting[i][0] = aiInvertMapping[ oSettings.aaSorting[i][0] ];
	}

	/* Fixed sorting */
	if ( oSettings.aaSortingFixed !== null )
	{
		for ( i=0, iLen=oSettings.aaSortingFixed.length ; i<iLen ; i++ )
		{
			oSettings.aaSortingFixed[i][0] = aiInvertMapping[ oSettings.aaSortingFixed[i][0] ];
		}
	}

	/* Data column sorting (the column which the sort for a given column should take place on) */
	for ( i=0, iLen=iCols ; i<iLen ; i++ )
	{
		oCol = oSettings.aoColumns[i];
		for ( j=0, jLen=oCol.aDataSort.length ; j<jLen ; j++ )
		{
			oCol.aDataSort[j] = aiInvertMapping[ oCol.aDataSort[j] ];
		}

		// Update the column indexes
		oCol.idx = aiInvertMapping[ oCol.idx ];
	}

	// Update 1.10 optimised sort class removal variable
	$.each( oSettings.aLastSort, function (i, val) {
		oSettings.aLastSort[i].src = aiInvertMapping[ val.src ];
	} );

	/* Update the Get and Set functions for each column */
	for ( i=0, iLen=iCols ; i<iLen ; i++ )
	{
		oCol = oSettings.aoColumns[i];

		if ( typeof oCol.mData == 'number' ) {
			oCol.mData = aiInvertMapping[ oCol.mData ];
		}
		else if ( $.isPlainObject( oCol.mData ) ) {
			// HTML5 data sourced
			attrMap( oCol.mData, '_',      aiInvertMapping );
			attrMap( oCol.mData, 'filter', aiInvertMapping );
			attrMap( oCol.mData, 'sort',   aiInvertMapping );
			attrMap( oCol.mData, 'type',   aiInvertMapping );
		}
	}

	/*
	 * Move the DOM elements
	 */
	if ( oSettings.aoColumns[iFrom].bVisible )
	{
		/* Calculate the current visible index and the point to insert the node before. The insert
		 * before needs to take into account that there might not be an element to insert before,
		 * in which case it will be null, and an appendChild should be used
		 */
		var iVisibleIndex = this.oApi._fnColumnIndexToVisible( oSettings, iFrom );
		var iInsertBeforeIndex = null;

		i = iTo < iFrom ? iTo : iTo + 1;
		while ( iInsertBeforeIndex === null && i < iCols )
		{
			iInsertBeforeIndex = this.oApi._fnColumnIndexToVisible( oSettings, i );
			i++;
		}

		/* Header */
		nTrs = oSettings.nTHead.getElementsByTagName('tr');
		for ( i=0, iLen=nTrs.length ; i<iLen ; i++ )
		{
			fnDomSwitch( nTrs[i], iVisibleIndex, iInsertBeforeIndex );
		}

		/* Footer */
		if ( oSettings.nTFoot !== null )
		{
			nTrs = oSettings.nTFoot.getElementsByTagName('tr');
			for ( i=0, iLen=nTrs.length ; i<iLen ; i++ )
			{
				fnDomSwitch( nTrs[i], iVisibleIndex, iInsertBeforeIndex );
			}
		}

		/* Body */
		for ( i=0, iLen=oSettings.aoData.length ; i<iLen ; i++ )
		{
			if ( oSettings.aoData[i].nTr !== null )
			{
				fnDomSwitch( oSettings.aoData[i].nTr, iVisibleIndex, iInsertBeforeIndex );
			}
		}
	}

	/*
	 * Move the internal array elements
	 */
	/* Columns */
	fnArraySwitch( oSettings.aoColumns, iFrom, iTo );

	// regenerate the get / set functions
	for ( i=0, iLen=iCols ; i<iLen ; i++ ) {
		oSettings.oApi._fnColumnOptions( oSettings, i, {} );
	}

	/* Search columns */
	fnArraySwitch( oSettings.aoPreSearchCols, iFrom, iTo );

	/* Array array - internal data anodes cache */
	for ( i=0, iLen=oSettings.aoData.length ; i<iLen ; i++ )
	{
		var data = oSettings.aoData[i];
		var cells = data.anCells;

		if ( cells ) {
			fnArraySwitch( cells, iFrom, iTo );

			// Longer term, should this be moved into the DataTables' invalidate
			// methods?
			for ( j=0, jen=cells.length ; j<jen ; j++ ) {
				if ( cells[j] && cells[j]._DT_CellIndex ) {
					cells[j]._DT_CellIndex.column = j;
				}
			}
		}

		// For DOM sourced data, the invalidate will reread the cell into
		// the data array, but for data sources as an array, they need to
		// be flipped
		if ( data.src !== 'dom' && $.isArray( data._aData ) ) {
			fnArraySwitch( data._aData, iFrom, iTo );
		}
	}

	/* Reposition the header elements in the header layout array */
	for ( i=0, iLen=oSettings.aoHeader.length ; i<iLen ; i++ )
	{
		fnArraySwitch( oSettings.aoHeader[i], iFrom, iTo );
	}

	if ( oSettings.aoFooter !== null )
	{
		for ( i=0, iLen=oSettings.aoFooter.length ; i<iLen ; i++ )
		{
			fnArraySwitch( oSettings.aoFooter[i], iFrom, iTo );
		}
	}

	if ( invalidateRows || invalidateRows === undefined )
	{
		$.fn.dataTable.Api( oSettings ).rows().invalidate();
	}

	/*
	 * Update DataTables' event handlers
	 */

	/* Sort listener */
	for ( i=0, iLen=iCols ; i<iLen ; i++ )
	{
		$(oSettings.aoColumns[i].nTh).off('.DT');
		this.oApi._fnSortAttachListener( oSettings, oSettings.aoColumns[i].nTh, i );
	}


	/* Fire an event so other plug-ins can update */
	$(oSettings.oInstance).trigger( 'column-reorder.dt', [ oSettings, {
		from: iFrom,
		to: iTo,
		mapping: aiInvertMapping,
		drop: drop,

		// Old style parameters for compatibility
		iFrom: iFrom,
		iTo: iTo,
		aiInvertMapping: aiInvertMapping
	} ] );
};

/**
 * ColReorder provides column visibility control for DataTables
 * @class ColReorder
 * @constructor
 * @param {object} dt DataTables settings object
 * @param {object} opts ColReorder options
 */
var ColReorder = function( dt, opts )
{
	var settings = new $.fn.dataTable.Api( dt ).settings()[0];

	// Ensure that we can't initialise on the same table twice
	if ( settings._colReorder ) {
		return settings._colReorder;
	}

	// Allow the options to be a boolean for defaults
	if ( opts === true ) {
		opts = {};
	}

	// Convert from camelCase to Hungarian, just as DataTables does
	var camelToHungarian = $.fn.dataTable.camelToHungarian;
	if ( camelToHungarian ) {
		camelToHungarian( ColReorder.defaults, ColReorder.defaults, true );
		camelToHungarian( ColReorder.defaults, opts || {} );
	}


	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Public class variables
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

	/**
	 * @namespace Settings object which contains customisable information for ColReorder instance
	 */
	this.s = {
		/**
		 * DataTables settings object
		 *  @property dt
		 *  @type     Object
		 *  @default  null
		 */
		"dt": null,

		/**
		 * Enable flag
		 *  @property dt
		 *  @type     Object
		 *  @default  null
		 */
		"enable": null,

		/**
		 * Initialisation object used for this instance
		 *  @property init
		 *  @type     object
		 *  @default  {}
		 */
		"init": $.extend( true, {}, ColReorder.defaults, opts ),

		/**
		 * Number of columns to fix (not allow to be reordered)
		 *  @property fixed
		 *  @type     int
		 *  @default  0
		 */
		"fixed": 0,

		/**
		 * Number of columns to fix counting from right (not allow to be reordered)
		 *  @property fixedRight
		 *  @type     int
		 *  @default  0
		 */
		"fixedRight": 0,

		/**
		 * Callback function for once the reorder has been done
		 *  @property reorderCallback
		 *  @type     function
		 *  @default  null
		 */
		"reorderCallback": null,

		/**
		 * @namespace Information used for the mouse drag
		 */
		"mouse": {
			"startX": -1,
			"startY": -1,
			"offsetX": -1,
			"offsetY": -1,
			"target": -1,
			"targetIndex": -1,
			"fromIndex": -1
		},

		/**
		 * Information which is used for positioning the insert cusor and knowing where to do the
		 * insert. Array of objects with the properties:
		 *   x: x-axis position
		 *   to: insert point
		 *  @property aoTargets
		 *  @type     array
		 *  @default  []
		 */
		"aoTargets": []
	};


	/**
	 * @namespace Common and useful DOM elements for the class instance
	 */
	this.dom = {
		/**
		 * Dragging element (the one the mouse is moving)
		 *  @property drag
		 *  @type     element
		 *  @default  null
		 */
		"drag": null,

		/**
		 * The insert cursor
		 *  @property pointer
		 *  @type     element
		 *  @default  null
		 */
		"pointer": null
	};

	/* Constructor logic */
	this.s.enable = this.s.init.bEnable;
	this.s.dt = settings;
	this.s.dt._colReorder = this;
	this._fnConstruct();

	return this;
};



$.extend( ColReorder.prototype, {
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Public methods
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

	/**
	 * Enable / disable end user interaction
	 */
	fnEnable: function ( flag )
	{
		if ( flag === false ) {
			return fnDisable();
		}

		this.s.enable = true;
	},

	/**
	 * Disable end user interaction
	 */
	fnDisable: function ()
	{
		this.s.enable = false;
	},

	/**
	 * Reset the column ordering to the original ordering that was detected on
	 * start up.
	 *  @return {this} Returns `this` for chaining.
	 *
	 *  @example
	 *    // DataTables initialisation with ColReorder
	 *    var table = $('#example').dataTable( {
	 *        "sDom": 'Rlfrtip'
	 *    } );
	 *
	 *    // Add click event to a button to reset the ordering
	 *    $('#resetOrdering').click( function (e) {
	 *        e.preventDefault();
	 *        $.fn.dataTable.ColReorder( table ).fnReset();
	 *    } );
	 */
	"fnReset": function ()
	{
		this._fnOrderColumns( this.fnOrder() );

		return this;
	},

	/**
	 * `Deprecated` - Get the current order of the columns, as an array.
	 *  @return {array} Array of column identifiers
	 *  @deprecated `fnOrder` should be used in preference to this method.
	 *      `fnOrder` acts as a getter/setter.
	 */
	"fnGetCurrentOrder": function ()
	{
		return this.fnOrder();
	},

	/**
	 * Get the current order of the columns, as an array. Note that the values
	 * given in the array are unique identifiers for each column. Currently
	 * these are the original ordering of the columns that was detected on
	 * start up, but this could potentially change in future.
	 *  @return {array} Array of column identifiers
	 *
	 *  @example
	 *    // Get column ordering for the table
	 *    var order = $.fn.dataTable.ColReorder( dataTable ).fnOrder();
	 *//**
	 * Set the order of the columns, from the positions identified in the
	 * ordering array given. Note that ColReorder takes a brute force approach
	 * to reordering, so it is possible multiple reordering events will occur
	 * before the final order is settled upon.
	 *  @param {array} [set] Array of column identifiers in the new order. Note
	 *    that every column must be included, uniquely, in this array.
	 *  @return {this} Returns `this` for chaining.
	 *
	 *  @example
	 *    // Swap the first and second columns
	 *    $.fn.dataTable.ColReorder( dataTable ).fnOrder( [1, 0, 2, 3, 4] );
	 *
	 *  @example
	 *    // Move the first column to the end for the table `#example`
	 *    var curr = $.fn.dataTable.ColReorder( '#example' ).fnOrder();
	 *    var first = curr.shift();
	 *    curr.push( first );
	 *    $.fn.dataTable.ColReorder( '#example' ).fnOrder( curr );
	 *
	 *  @example
	 *    // Reverse the table's order
	 *    $.fn.dataTable.ColReorder( '#example' ).fnOrder(
	 *      $.fn.dataTable.ColReorder( '#example' ).fnOrder().reverse()
	 *    );
	 */
	"fnOrder": function ( set, original )
	{
		var a = [], i, ien, j, jen;
		var columns = this.s.dt.aoColumns;

		if ( set === undefined ){
			for ( i=0, ien=columns.length ; i<ien ; i++ ) {
				a.push( columns[i]._ColReorder_iOrigCol );
			}

			return a;
		}

		// The order given is based on the original indexes, rather than the
		// existing ones, so we need to translate from the original to current
		// before then doing the order
		if ( original ) {
			var order = this.fnOrder();

			for ( i=0, ien=set.length ; i<ien ; i++ ) {
				a.push( $.inArray( set[i], order ) );
			}

			set = a;
		}

		this._fnOrderColumns( fnInvertKeyValues( set ) );

		return this;
	},


	/**
	 * Convert from the original column index, to the original
	 *
	 * @param  {int|array} idx Index(es) to convert
	 * @param  {string} dir Transpose direction - `fromOriginal` / `toCurrent`
	 *   or `'toOriginal` / `fromCurrent`
	 * @return {int|array}     Converted values
	 */
	fnTranspose: function ( idx, dir )
	{
		if ( ! dir ) {
			dir = 'toCurrent';
		}

		var order = this.fnOrder();
		var columns = this.s.dt.aoColumns;

		if ( dir === 'toCurrent' ) {
			// Given an original index, want the current
			return ! $.isArray( idx ) ?
				$.inArray( idx, order ) :
				$.map( idx, function ( index ) {
					return $.inArray( index, order );
				} );
		}
		else {
			// Given a current index, want the original
			return ! $.isArray( idx ) ?
				columns[idx]._ColReorder_iOrigCol :
				$.map( idx, function ( index ) {
					return columns[index]._ColReorder_iOrigCol;
				} );
		}
	},


	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Private methods (they are of course public in JS, but recommended as private)
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

	/**
	 * Constructor logic
	 *  @method  _fnConstruct
	 *  @returns void
	 *  @private
	 */
	"_fnConstruct": function ()
	{
		var that = this;
		var iLen = this.s.dt.aoColumns.length;
		var table = this.s.dt.nTable;
		var i;

		/* Columns discounted from reordering - counting left to right */
		if ( this.s.init.iFixedColumns )
		{
			this.s.fixed = this.s.init.iFixedColumns;
		}

		if ( this.s.init.iFixedColumnsLeft )
		{
			this.s.fixed = this.s.init.iFixedColumnsLeft;
		}

		/* Columns discounted from reordering - counting right to left */
		this.s.fixedRight = this.s.init.iFixedColumnsRight ?
			this.s.init.iFixedColumnsRight :
			0;

		/* Drop callback initialisation option */
		if ( this.s.init.fnReorderCallback )
		{
			this.s.reorderCallback = this.s.init.fnReorderCallback;
		}

		/* Add event handlers for the drag and drop, and also mark the original column order */
		for ( i = 0; i < iLen; i++ )
		{
			if ( i > this.s.fixed-1 && i < iLen - this.s.fixedRight )
			{
				this._fnMouseListener( i, this.s.dt.aoColumns[i].nTh );
			}

			/* Mark the original column order for later reference */
			this.s.dt.aoColumns[i]._ColReorder_iOrigCol = i;
		}

		/* State saving */
		this.s.dt.oApi._fnCallbackReg( this.s.dt, 'aoStateSaveParams', function (oS, oData) {
			that._fnStateSave.call( that, oData );
		}, "ColReorder_State" );

		/* An initial column order has been specified */
		var aiOrder = null;
		if ( this.s.init.aiOrder )
		{
			aiOrder = this.s.init.aiOrder.slice();
		}

		/* State loading, overrides the column order given */
		if ( this.s.dt.oLoadedState && typeof this.s.dt.oLoadedState.ColReorder != 'undefined' &&
		  this.s.dt.oLoadedState.ColReorder.length == this.s.dt.aoColumns.length )
		{
			aiOrder = this.s.dt.oLoadedState.ColReorder;
		}

		/* If we have an order to apply - do so */
		if ( aiOrder )
		{
			/* We might be called during or after the DataTables initialisation. If before, then we need
			 * to wait until the draw is done, if after, then do what we need to do right away
			 */
			if ( !that.s.dt._bInitComplete )
			{
				var bDone = false;
				$(table).on( 'draw.dt.colReorder', function () {
					if ( !that.s.dt._bInitComplete && !bDone )
					{
						bDone = true;
						var resort = fnInvertKeyValues( aiOrder );
						that._fnOrderColumns.call( that, resort );
					}
				} );
			}
			else
			{
				var resort = fnInvertKeyValues( aiOrder );
				that._fnOrderColumns.call( that, resort );
			}
		}
		else {
			this._fnSetColumnIndexes();
		}

		// Destroy clean up
		$(table).on( 'destroy.dt.colReorder', function () {
			$(table).off( 'destroy.dt.colReorder draw.dt.colReorder' );

			$.each( that.s.dt.aoColumns, function (i, column) {
				$(column.nTh).off('.ColReorder');
				$(column.nTh).removeAttr('data-column-index');
			} );

			that.s.dt._colReorder = null;
			that.s = null;
		} );
	},


	/**
	 * Set the column order from an array
	 *  @method  _fnOrderColumns
	 *  @param   array a An array of integers which dictate the column order that should be applied
	 *  @returns void
	 *  @private
	 */
	"_fnOrderColumns": function ( a )
	{
		var changed = false;

		if ( a.length != this.s.dt.aoColumns.length )
		{
			this.s.dt.oInstance.oApi._fnLog( this.s.dt, 1, "ColReorder - array reorder does not "+
				"match known number of columns. Skipping." );
			return;
		}

		for ( var i=0, iLen=a.length ; i<iLen ; i++ )
		{
			var currIndex = $.inArray( i, a );
			if ( i != currIndex )
			{
				/* Reorder our switching array */
				fnArraySwitch( a, currIndex, i );

				/* Do the column reorder in the table */
				this.s.dt.oInstance.fnColReorder( currIndex, i, true, false );

				changed = true;
			}
		}

		this._fnSetColumnIndexes();

		// Has anything actually changed? If not, then nothing else to do
		if ( ! changed ) {
			return;
		}

		$.fn.dataTable.Api( this.s.dt ).rows().invalidate();

		/* When scrolling we need to recalculate the column sizes to allow for the shift */
		if ( this.s.dt.oScroll.sX !== "" || this.s.dt.oScroll.sY !== "" )
		{
			this.s.dt.oInstance.fnAdjustColumnSizing( false );
		}

		/* Save the state */
		this.s.dt.oInstance.oApi._fnSaveState( this.s.dt );

		if ( this.s.reorderCallback !== null )
		{
			this.s.reorderCallback.call( this );
		}
	},


	/**
	 * Because we change the indexes of columns in the table, relative to their starting point
	 * we need to reorder the state columns to what they are at the starting point so we can
	 * then rearrange them again on state load!
	 *  @method  _fnStateSave
	 *  @param   object oState DataTables state
	 *  @returns string JSON encoded cookie string for DataTables
	 *  @private
	 */
	"_fnStateSave": function ( oState )
	{
		var i, iLen, aCopy, iOrigColumn;
		var oSettings = this.s.dt;
		var columns = oSettings.aoColumns;

		oState.ColReorder = [];

		/* Sorting */
		if ( oState.aaSorting ) {
			// 1.10.0-
			for ( i=0 ; i<oState.aaSorting.length ; i++ ) {
				oState.aaSorting[i][0] = columns[ oState.aaSorting[i][0] ]._ColReorder_iOrigCol;
			}

			var aSearchCopy = $.extend( true, [], oState.aoSearchCols );

			for ( i=0, iLen=columns.length ; i<iLen ; i++ )
			{
				iOrigColumn = columns[i]._ColReorder_iOrigCol;

				/* Column filter */
				oState.aoSearchCols[ iOrigColumn ] = aSearchCopy[i];

				/* Visibility */
				oState.abVisCols[ iOrigColumn ] = columns[i].bVisible;

				/* Column reordering */
				oState.ColReorder.push( iOrigColumn );
			}
		}
		else if ( oState.order ) {
			// 1.10.1+
			for ( i=0 ; i<oState.order.length ; i++ ) {
				oState.order[i][0] = columns[ oState.order[i][0] ]._ColReorder_iOrigCol;
			}

			var stateColumnsCopy = $.extend( true, [], oState.columns );

			for ( i=0, iLen=columns.length ; i<iLen ; i++ )
			{
				iOrigColumn = columns[i]._ColReorder_iOrigCol;

				/* Columns */
				oState.columns[ iOrigColumn ] = stateColumnsCopy[i];

				/* Column reordering */
				oState.ColReorder.push( iOrigColumn );
			}
		}
	},


	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Mouse drop and drag
	 */

	/**
	 * Add a mouse down listener to a particluar TH element
	 *  @method  _fnMouseListener
	 *  @param   int i Column index
	 *  @param   element nTh TH element clicked on
	 *  @returns void
	 *  @private
	 */
	"_fnMouseListener": function ( i, nTh )
	{
		var that = this;
		$(nTh)
			.on( 'mousedown.ColReorder', function (e) {
				if ( that.s.enable && e.which === 1 ) {
					that._fnMouseDown.call( that, e, nTh );
				}
			} )
			.on( 'touchstart.ColReorder', function (e) {
				if ( that.s.enable ) {
					that._fnMouseDown.call( that, e, nTh );
				}
			} );
	},


	/**
	 * Mouse down on a TH element in the table header
	 *  @method  _fnMouseDown
	 *  @param   event e Mouse event
	 *  @param   element nTh TH element to be dragged
	 *  @returns void
	 *  @private
	 */
	"_fnMouseDown": function ( e, nTh )
	{
		var that = this;

		/* Store information about the mouse position */
		var target = $(e.target).closest('th, td');
		var offset = target.offset();
		var idx = parseInt( $(nTh).attr('data-column-index'), 10 );

		if ( idx === undefined ) {
			return;
		}

		this.s.mouse.startX = this._fnCursorPosition( e, 'pageX' );
		this.s.mouse.startY = this._fnCursorPosition( e, 'pageY' );
		this.s.mouse.offsetX = this._fnCursorPosition( e, 'pageX' ) - offset.left;
		this.s.mouse.offsetY = this._fnCursorPosition( e, 'pageY' ) - offset.top;
		this.s.mouse.target = this.s.dt.aoColumns[ idx ].nTh;//target[0];
		this.s.mouse.targetIndex = idx;
		this.s.mouse.fromIndex = idx;

		this._fnRegions();

		/* Add event handlers to the document */
		$(document)
			.on( 'mousemove.ColReorder touchmove.ColReorder', function (e) {
				that._fnMouseMove.call( that, e );
			} )
			.on( 'mouseup.ColReorder touchend.ColReorder', function (e) {
				that._fnMouseUp.call( that, e );
			} );
	},


	/**
	 * Deal with a mouse move event while dragging a node
	 *  @method  _fnMouseMove
	 *  @param   event e Mouse event
	 *  @returns void
	 *  @private
	 */
	"_fnMouseMove": function ( e )
	{
		var that = this;

		if ( this.dom.drag === null )
		{
			/* Only create the drag element if the mouse has moved a specific distance from the start
			 * point - this allows the user to make small mouse movements when sorting and not have a
			 * possibly confusing drag element showing up
			 */
			if ( Math.pow(
				Math.pow(this._fnCursorPosition( e, 'pageX') - this.s.mouse.startX, 2) +
				Math.pow(this._fnCursorPosition( e, 'pageY') - this.s.mouse.startY, 2), 0.5 ) < 5 )
			{
				return;
			}
			this._fnCreateDragNode();
		}

		/* Position the element - we respect where in the element the click occured */
		this.dom.drag.css( {
			left: this._fnCursorPosition( e, 'pageX' ) - this.s.mouse.offsetX,
			top: this._fnCursorPosition( e, 'pageY' ) - this.s.mouse.offsetY
		} );

		/* Based on the current mouse position, calculate where the insert should go */
		var target;
		var lastToIndex = this.s.mouse.toIndex;
		var cursorXPosiotion = this._fnCursorPosition(e, 'pageX');
		var targetsPrev = function (i) {
			while (i >= 0) {
				i--;

				if (i <= 0) {
					return null;
				}

				if (that.s.aoTargets[i+1].x !== that.s.aoTargets[i].x) {
					return that.s.aoTargets[i];
				}
			}
		};
		var firstNotHidden = function () {
			for (var i=0 ; i<that.s.aoTargets.length-1 ; i++) {
				if (that.s.aoTargets[i].x !== that.s.aoTargets[i+1].x) {
					return that.s.aoTargets[i];
				}
			}
		};
		var lastNotHidden = function () {
			for (var i=that.s.aoTargets.length-1 ; i>0 ; i--) {
				if (that.s.aoTargets[i].x !== that.s.aoTargets[i-1].x) {
					return that.s.aoTargets[i];
				}
			}
		};

        for (var i = 1; i < this.s.aoTargets.length; i++) {
			var prevTarget = targetsPrev(i);
			if (! prevTarget) {
				prevTarget = firstNotHidden();
			}

			var prevTargetMiddle = prevTarget.x + (this.s.aoTargets[i].x - prevTarget.x) / 2;

            if (this._fnIsLtr()) {
                if (cursorXPosiotion < prevTargetMiddle ) {
                    target = prevTarget;
                    break;
                }
            }
            else {
                if (cursorXPosiotion > prevTargetMiddle) {
                    target = prevTarget;
                    break;
                }
            }
		}

        if (target) {
            this.dom.pointer.css('left', target.x);
            this.s.mouse.toIndex = target.to;
        }
        else {
			// The insert element wasn't positioned in the array (less than
			// operator), so we put it at the end
			this.dom.pointer.css( 'left', lastNotHidden().x );
			this.s.mouse.toIndex = lastNotHidden().to;
		}

		// Perform reordering if realtime updating is on and the column has moved
		if ( this.s.init.bRealtime && lastToIndex !== this.s.mouse.toIndex ) {
			this.s.dt.oInstance.fnColReorder( this.s.mouse.fromIndex, this.s.mouse.toIndex );
			this.s.mouse.fromIndex = this.s.mouse.toIndex;

			// Not great for performance, but required to keep everything in alignment
			if ( this.s.dt.oScroll.sX !== "" || this.s.dt.oScroll.sY !== "" )
			{
				this.s.dt.oInstance.fnAdjustColumnSizing( false );
			}

			this._fnRegions();
		}
	},


	/**
	 * Finish off the mouse drag and insert the column where needed
	 *  @method  _fnMouseUp
	 *  @param   event e Mouse event
	 *  @returns void
	 *  @private
	 */
	"_fnMouseUp": function ( e )
	{
		var that = this;

		$(document).off( '.ColReorder' );

		if ( this.dom.drag !== null )
		{
			/* Remove the guide elements */
			this.dom.drag.remove();
			this.dom.pointer.remove();
			this.dom.drag = null;
			this.dom.pointer = null;

			/* Actually do the reorder */
			this.s.dt.oInstance.fnColReorder( this.s.mouse.fromIndex, this.s.mouse.toIndex, true );
			this._fnSetColumnIndexes();

			/* When scrolling we need to recalculate the column sizes to allow for the shift */
			if ( this.s.dt.oScroll.sX !== "" || this.s.dt.oScroll.sY !== "" )
			{
				this.s.dt.oInstance.fnAdjustColumnSizing( false );
			}

			/* Save the state */
			this.s.dt.oInstance.oApi._fnSaveState( this.s.dt );

			if ( this.s.reorderCallback !== null )
			{
				this.s.reorderCallback.call( this );
			}
		}
	},


	/**
	 * Calculate a cached array with the points of the column inserts, and the
	 * 'to' points
	 *  @method  _fnRegions
	 *  @returns void
	 *  @private
	 */
	"_fnRegions": function ()
	{
		var aoColumns = this.s.dt.aoColumns;
        var isLTR = this._fnIsLtr();
		this.s.aoTargets.splice(0, this.s.aoTargets.length);
		var lastBound = $(this.s.dt.nTable).offset().left;

        var aoColumnBounds = [];
        $.each(aoColumns, function (i, column) {
            if (column.bVisible && column.nTh.style.display !== 'none') {
                var nth = $(column.nTh);
				var bound = nth.offset().left;

                if (isLTR) {
                    bound += nth.outerWidth();
                }

                aoColumnBounds.push({
                    index: i,
                    bound: bound
				});

				lastBound = bound;
			}
			else {
                aoColumnBounds.push({
					index: i,
					bound: lastBound
                });
			}
		});

        var firstColumn = aoColumnBounds[0];
		var firstColumnWidth = $(aoColumns[firstColumn.index].nTh).outerWidth();

        this.s.aoTargets.push({
            to: 0,
			x: firstColumn.bound - firstColumnWidth
        });

        for (var i = 0; i < aoColumnBounds.length; i++) {
            var columnBound = aoColumnBounds[i];
            var iToPoint = columnBound.index;

            /* For the column / header in question, we want it's position to remain the same if the
            * position is just to it's immediate left or right, so we only increment the counter for
            * other columns
            */
            if (columnBound.index < this.s.mouse.fromIndex) {
                iToPoint++;
            }

            this.s.aoTargets.push({
				to: iToPoint,
                x: columnBound.bound
            });
        }

		/* Disallow columns for being reordered by drag and drop, counting right to left */
		if ( this.s.fixedRight !== 0 )
		{
			this.s.aoTargets.splice( this.s.aoTargets.length - this.s.fixedRight );
		}

		/* Disallow columns for being reordered by drag and drop, counting left to right */
		if ( this.s.fixed !== 0 )
		{
			this.s.aoTargets.splice( 0, this.s.fixed );
		}
	},


	/**
	 * Copy the TH element that is being drags so the user has the idea that they are actually
	 * moving it around the page.
	 *  @method  _fnCreateDragNode
	 *  @returns void
	 *  @private
	 */
	"_fnCreateDragNode": function ()
	{
		var scrolling = this.s.dt.oScroll.sX !== "" || this.s.dt.oScroll.sY !== "";

		var origCell = this.s.dt.aoColumns[ this.s.mouse.targetIndex ].nTh;
		var origTr = origCell.parentNode;
		var origThead = origTr.parentNode;
		var origTable = origThead.parentNode;
		var cloneCell = $(origCell).clone();

		// This is a slightly odd combination of jQuery and DOM, but it is the
		// fastest and least resource intensive way I could think of cloning
		// the table with just a single header cell in it.
		this.dom.drag = $(origTable.cloneNode(false))
			.addClass( 'DTCR_clonedTable' )
			.append(
				$(origThead.cloneNode(false)).append(
					$(origTr.cloneNode(false)).append(
						cloneCell[0]
					)
				)
			)
			.css( {
				position: 'absolute',
				top: 0,
				left: 0,
				width: $(origCell).outerWidth(),
				height: $(origCell).outerHeight()
			} )
			.appendTo( 'body' );

		this.dom.pointer = $('<div></div>')
			.addClass( 'DTCR_pointer' )
			.css( {
				position: 'absolute',
				top: scrolling ?
					$('div.dataTables_scroll', this.s.dt.nTableWrapper).offset().top :
					$(this.s.dt.nTable).offset().top,
				height : scrolling ?
					$('div.dataTables_scroll', this.s.dt.nTableWrapper).height() :
					$(this.s.dt.nTable).height()
			} )
			.appendTo( 'body' );
	},


	/**
	 * Add a data attribute to the column headers, so we know the index of
	 * the row to be reordered. This allows fast detection of the index, and
	 * for this plug-in to work with FixedHeader which clones the nodes.
	 *  @private
	 */
	"_fnSetColumnIndexes": function ()
	{
		$.each( this.s.dt.aoColumns, function (i, column) {
			$(column.nTh).attr('data-column-index', i);
		} );
	},


	/**
	 * Get cursor position regardless of mouse or touch input
	 * @param  {Event}  e    jQuery Event
	 * @param  {string} prop Property to get
	 * @return {number}      Value
	 */
	_fnCursorPosition: function ( e, prop ) {
		if ( e.type.indexOf('touch') !== -1 ) {
			return e.originalEvent.touches[0][ prop ];
		}
		return e[ prop ];
    },

    _fnIsLtr: function () {
        return $(this.s.dt.nTable).css('direction') !== "rtl";
    }
} );





/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Static parameters
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */


/**
 * ColReorder default settings for initialisation
 *  @namespace
 *  @static
 */
ColReorder.defaults = {
	/**
	 * Predefined ordering for the columns that will be applied automatically
	 * on initialisation. If not specified then the order that the columns are
	 * found to be in the HTML is the order used.
	 *  @type array
	 *  @default null
	 *  @static
	 */
	aiOrder: null,

	/**
	 * ColReorder enable on initialisation
	 *  @type boolean
	 *  @default true
	 *  @static
	 */
	bEnable: true,

	/**
	 * Redraw the table's column ordering as the end user draws the column
	 * (`true`) or wait until the mouse is released (`false` - default). Note
	 * that this will perform a redraw on each reordering, which involves an
	 * Ajax request each time if you are using server-side processing in
	 * DataTables.
	 *  @type boolean
	 *  @default false
	 *  @static
	 */
	bRealtime: true,

	/**
	 * Indicate how many columns should be fixed in position (counting from the
	 * left). This will typically be 1 if used, but can be as high as you like.
	 *  @type int
	 *  @default 0
	 *  @static
	 */
	iFixedColumnsLeft: 0,

	/**
	 * As `iFixedColumnsRight` but counting from the right.
	 *  @type int
	 *  @default 0
	 *  @static
	 */
	iFixedColumnsRight: 0,

	/**
	 * Callback function that is fired when columns are reordered. The `column-
	 * reorder` event is preferred over this callback
	 *  @type function():void
	 *  @default null
	 *  @static
	 */
	fnReorderCallback: null
};



/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Constants
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

/**
 * ColReorder version
 *  @constant  version
 *  @type      String
 *  @default   As code
 */
ColReorder.version = "1.5.2";



/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * DataTables interfaces
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

// Expose
$.fn.dataTable.ColReorder = ColReorder;
$.fn.DataTable.ColReorder = ColReorder;


// Register a new feature with DataTables
if ( typeof $.fn.dataTable == "function" &&
     typeof $.fn.dataTableExt.fnVersionCheck == "function" &&
     $.fn.dataTableExt.fnVersionCheck('1.10.8') )
{
	$.fn.dataTableExt.aoFeatures.push( {
		"fnInit": function( settings ) {
			var table = settings.oInstance;

			if ( ! settings._colReorder ) {
				var dtInit = settings.oInit;
				var opts = dtInit.colReorder || dtInit.oColReorder || {};

				new ColReorder( settings, opts );
			}
			else {
				table.oApi._fnLog( settings, 1, "ColReorder attempted to initialise twice. Ignoring second" );
			}

			return null; /* No node for DataTables to insert */
		},
		"cFeature": "R",
		"sFeature": "ColReorder"
	} );
}
else {
	alert( "Warning: ColReorder requires DataTables 1.10.8 or greater - www.datatables.net/download");
}


// Attach a listener to the document which listens for DataTables initialisation
// events so we can automatically initialise
$(document).on( 'preInit.dt.colReorder', function (e, settings) {
	if ( e.namespace !== 'dt' ) {
		return;
	}

	var init = settings.oInit.colReorder;
	var defaults = DataTable.defaults.colReorder;

	if ( init || defaults ) {
		var opts = $.extend( {}, init, defaults );

		if ( init !== false ) {
			new ColReorder( settings, opts  );
		}
	}
} );


// API augmentation
$.fn.dataTable.Api.register( 'colReorder.reset()', function () {
	return this.iterator( 'table', function ( ctx ) {
		ctx._colReorder.fnReset();
	} );
} );

$.fn.dataTable.Api.register( 'colReorder.order()', function ( set, original ) {
	if ( set ) {
		return this.iterator( 'table', function ( ctx ) {
			ctx._colReorder.fnOrder( set, original );
		} );
	}

	return this.context.length ?
		this.context[0]._colReorder.fnOrder() :
		null;
} );

$.fn.dataTable.Api.register( 'colReorder.transpose()', function ( idx, dir ) {
	return this.context.length && this.context[0]._colReorder ?
		this.context[0]._colReorder.fnTranspose( idx, dir ) :
		idx;
} );

$.fn.dataTable.Api.register( 'colReorder.move()', function( from, to, drop, invalidateRows ) {
	if (this.context.length) {
		this.context[0]._colReorder.s.dt.oInstance.fnColReorder( from, to, drop, invalidateRows );
		this.context[0]._colReorder._fnSetColumnIndexes();
	}
	return this;
} );

$.fn.dataTable.Api.register( 'colReorder.enable()', function( flag ) {
	return this.iterator( 'table', function ( ctx ) {
		if ( ctx._colReorder ) {
			ctx._colReorder.fnEnable( flag );
		}
	} );
} );

$.fn.dataTable.Api.register( 'colReorder.disable()', function() {
	return this.iterator( 'table', function ( ctx ) {
		if ( ctx._colReorder ) {
			ctx._colReorder.fnDisable();
		}
	} );
} );


return ColReorder;
}));


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9kbWV0YS8uL25vZGVfbW9kdWxlcy9kYXRhdGFibGVzLm5ldC1jb2xyZW9yZGVyL2pzL2RhdGFUYWJsZXMuY29sUmVvcmRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCO0FBQ3hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNLElBQTBDO0FBQ2hEO0FBQ0EsRUFBRSxpQ0FBUSxDQUFDLGlGQUFRLEVBQUUsa0dBQWdCLENBQUMsbUNBQUU7QUFDeEM7QUFDQSxHQUFHO0FBQUEsa0dBQUU7QUFDTDtBQUNBLE1BQU0sRUFpQko7QUFDRixDQUFDO0FBQ0Q7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQ0FBaUMsU0FBUztBQUMxQztBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0RBQWdELFNBQVM7QUFDekQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtB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O0FBR0Y7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxjQUFjLFVBQVU7QUFDeEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxJQUFJOztBQUVKO0FBQ0E7QUFDQSxHQUFHO0FBQ0gsRUFBRTs7O0FBR0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLGdDQUFnQyxTQUFTO0FBQ3pDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFFOzs7QUFHRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGNBQWMsNEJBQTRCO0FBQzFDO0FBQ0E7O0FBRUE7O0FBRUEsbUNBQW1DLFNBQVM7QUFDNUM7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYyx3QkFBd0I7QUFDdEM7QUFDQTs7QUFFQTs7QUFFQSxtQ0FBbUMsU0FBUztBQUM1QztBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFFOzs7QUFHRjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0osRUFBRTs7O0FBR0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1REFBdUQ7QUFDdkQ7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0EsSUFBSTtBQUNKLEVBQUU7OztBQUdGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUIsOEJBQThCO0FBQy9DO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlDQUF5QyxNQUFNO0FBQy9DO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsdUJBQXVCLDZCQUE2QjtBQUNwRDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxFQUFFOzs7QUFHRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFFOzs7QUFHRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBLEdBQUc7O0FBRUg7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxTQUFTOztBQUVULHVCQUF1QiwyQkFBMkI7QUFDbEQ7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBRTs7O0FBR0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQSxFQUFFOzs7QUFHRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSCxFQUFFOzs7QUFHRjtBQUNBO0FBQ0EsYUFBYSxNQUFNO0FBQ25CLGFBQWEsT0FBTztBQUNwQixhQUFhLE9BQU87QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQSxDQUFDOzs7Ozs7QUFNRDtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FBSUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FBSUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxlQUFlO0FBQ2YsR0FBRztBQUNIO0FBQ0E7QUFDQSxFQUFFO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0EseUJBQXlCOztBQUV6QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7OztBQUdEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBRTtBQUNGLENBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsQ0FBQzs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQzs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBRTtBQUNGLENBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUU7QUFDRixDQUFDOzs7QUFHRDtBQUNBLENBQUMiLCJmaWxlIjoibnBtLmRhdGF0YWJsZXMubmV0LWNvbHJlb3JkZXIuMTdlM2U5NDViYmY0M2QzODVhZGIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiEgQ29sUmVvcmRlciAxLjUuMlxuICogwqkyMDEwLTIwMTkgU3ByeU1lZGlhIEx0ZCAtIGRhdGF0YWJsZXMubmV0L2xpY2Vuc2VcbiAqL1xuXG4vKipcbiAqIEBzdW1tYXJ5ICAgICBDb2xSZW9yZGVyXG4gKiBAZGVzY3JpcHRpb24gUHJvdmlkZSB0aGUgYWJpbGl0eSB0byByZW9yZGVyIGNvbHVtbnMgaW4gYSBEYXRhVGFibGVcbiAqIEB2ZXJzaW9uICAgICAxLjUuMlxuICogQGZpbGUgICAgICAgIGRhdGFUYWJsZXMuY29sUmVvcmRlci5qc1xuICogQGF1dGhvciAgICAgIFNwcnlNZWRpYSBMdGQgKHd3dy5zcHJ5bWVkaWEuY28udWspXG4gKiBAY29udGFjdCAgICAgd3d3LnNwcnltZWRpYS5jby51ay9jb250YWN0XG4gKiBAY29weXJpZ2h0ICAgQ29weXJpZ2h0IDIwMTAtMjAxOSBTcHJ5TWVkaWEgTHRkLlxuICpcbiAqIFRoaXMgc291cmNlIGZpbGUgaXMgZnJlZSBzb2Z0d2FyZSwgYXZhaWxhYmxlIHVuZGVyIHRoZSBmb2xsb3dpbmcgbGljZW5zZTpcbiAqICAgTUlUIGxpY2Vuc2UgLSBodHRwOi8vZGF0YXRhYmxlcy5uZXQvbGljZW5zZS9taXRcbiAqXG4gKiBUaGlzIHNvdXJjZSBmaWxlIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dFxuICogV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFlcbiAqIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIGxpY2Vuc2UgZmlsZXMgZm9yIGRldGFpbHMuXG4gKlxuICogRm9yIGRldGFpbHMgcGxlYXNlIHJlZmVyIHRvOiBodHRwOi8vd3d3LmRhdGF0YWJsZXMubmV0XG4gKi9cbihmdW5jdGlvbiggZmFjdG9yeSApe1xuXHRpZiAoIHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCApIHtcblx0XHQvLyBBTURcblx0XHRkZWZpbmUoIFsnanF1ZXJ5JywgJ2RhdGF0YWJsZXMubmV0J10sIGZ1bmN0aW9uICggJCApIHtcblx0XHRcdHJldHVybiBmYWN0b3J5KCAkLCB3aW5kb3csIGRvY3VtZW50ICk7XG5cdFx0fSApO1xuXHR9XG5cdGVsc2UgaWYgKCB0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgKSB7XG5cdFx0Ly8gQ29tbW9uSlNcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChyb290LCAkKSB7XG5cdFx0XHRpZiAoICEgcm9vdCApIHtcblx0XHRcdFx0cm9vdCA9IHdpbmRvdztcblx0XHRcdH1cblxuXHRcdFx0aWYgKCAhICQgfHwgISAkLmZuLmRhdGFUYWJsZSApIHtcblx0XHRcdFx0JCA9IHJlcXVpcmUoJ2RhdGF0YWJsZXMubmV0Jykocm9vdCwgJCkuJDtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIGZhY3RvcnkoICQsIHJvb3QsIHJvb3QuZG9jdW1lbnQgKTtcblx0XHR9O1xuXHR9XG5cdGVsc2Uge1xuXHRcdC8vIEJyb3dzZXJcblx0XHRmYWN0b3J5KCBqUXVlcnksIHdpbmRvdywgZG9jdW1lbnQgKTtcblx0fVxufShmdW5jdGlvbiggJCwgd2luZG93LCBkb2N1bWVudCwgdW5kZWZpbmVkICkge1xuJ3VzZSBzdHJpY3QnO1xudmFyIERhdGFUYWJsZSA9ICQuZm4uZGF0YVRhYmxlO1xuXG5cbi8qKlxuICogU3dpdGNoIHRoZSBrZXkgdmFsdWUgcGFpcmluZyBvZiBhbiBpbmRleCBhcnJheSB0byBiZSB2YWx1ZSBrZXkgKGkuZS4gdGhlIG9sZCB2YWx1ZSBpcyBub3cgdGhlXG4gKiBrZXkpLiBGb3IgZXhhbXBsZSBjb25zaWRlciBbIDIsIDAsIDEgXSB0aGlzIHdvdWxkIGJlIHJldHVybmVkIGFzIFsgMSwgMiwgMCBdLlxuICogIEBtZXRob2QgIGZuSW52ZXJ0S2V5VmFsdWVzXG4gKiAgQHBhcmFtICAgYXJyYXkgYUluIEFycmF5IHRvIHN3aXRjaCBhcm91bmRcbiAqICBAcmV0dXJucyBhcnJheVxuICovXG5mdW5jdGlvbiBmbkludmVydEtleVZhbHVlcyggYUluIClcbntcblx0dmFyIGFSZXQ9W107XG5cdGZvciAoIHZhciBpPTAsIGlMZW49YUluLmxlbmd0aCA7IGk8aUxlbiA7IGkrKyApXG5cdHtcblx0XHRhUmV0WyBhSW5baV0gXSA9IGk7XG5cdH1cblx0cmV0dXJuIGFSZXQ7XG59XG5cblxuLyoqXG4gKiBNb2RpZnkgYW4gYXJyYXkgYnkgc3dpdGNoaW5nIHRoZSBwb3NpdGlvbiBvZiB0d28gZWxlbWVudHNcbiAqICBAbWV0aG9kICBmbkFycmF5U3dpdGNoXG4gKiAgQHBhcmFtICAgYXJyYXkgYUFycmF5IEFycmF5IHRvIGNvbnNpZGVyLCB3aWxsIGJlIG1vZGlmaWVkIGJ5IHJlZmVyZW5jZSAoaS5lLiBubyByZXR1cm4pXG4gKiAgQHBhcmFtICAgaW50IGlGcm9tIEZyb20gcG9pbnRcbiAqICBAcGFyYW0gICBpbnQgaVRvIEluc2VydCBwb2ludFxuICogIEByZXR1cm5zIHZvaWRcbiAqL1xuZnVuY3Rpb24gZm5BcnJheVN3aXRjaCggYUFycmF5LCBpRnJvbSwgaVRvIClcbntcblx0dmFyIG1TdG9yZSA9IGFBcnJheS5zcGxpY2UoIGlGcm9tLCAxIClbMF07XG5cdGFBcnJheS5zcGxpY2UoIGlUbywgMCwgbVN0b3JlICk7XG59XG5cblxuLyoqXG4gKiBTd2l0Y2ggdGhlIHBvc2l0aW9ucyBvZiBub2RlcyBpbiBhIHBhcmVudCBub2RlIChub3RlIHRoaXMgaXMgc3BlY2lmaWNhbGx5IGRlc2lnbmVkIGZvclxuICogdGFibGUgcm93cykuIE5vdGUgdGhpcyBmdW5jdGlvbiBjb25zaWRlcnMgYWxsIGVsZW1lbnQgbm9kZXMgdW5kZXIgdGhlIHBhcmVudCFcbiAqICBAbWV0aG9kICBmbkRvbVN3aXRjaFxuICogIEBwYXJhbSAgIHN0cmluZyBzVGFnIFRhZyB0byBjb25zaWRlclxuICogIEBwYXJhbSAgIGludCBpRnJvbSBFbGVtZW50IHRvIG1vdmVcbiAqICBAcGFyYW0gICBpbnQgUG9pbnQgdG8gZWxlbWVudCB0aGUgZWxlbWVudCB0byAoYmVmb3JlIHRoaXMgcG9pbnQpLCBjYW4gYmUgbnVsbCBmb3IgYXBwZW5kXG4gKiAgQHJldHVybnMgdm9pZFxuICovXG5mdW5jdGlvbiBmbkRvbVN3aXRjaCggblBhcmVudCwgaUZyb20sIGlUbyApXG57XG5cdHZhciBhblRhZ3MgPSBbXTtcblx0Zm9yICggdmFyIGk9MCwgaUxlbj1uUGFyZW50LmNoaWxkTm9kZXMubGVuZ3RoIDsgaTxpTGVuIDsgaSsrIClcblx0e1xuXHRcdGlmICggblBhcmVudC5jaGlsZE5vZGVzW2ldLm5vZGVUeXBlID09IDEgKVxuXHRcdHtcblx0XHRcdGFuVGFncy5wdXNoKCBuUGFyZW50LmNoaWxkTm9kZXNbaV0gKTtcblx0XHR9XG5cdH1cblx0dmFyIG5TdG9yZSA9IGFuVGFnc1sgaUZyb20gXTtcblxuXHRpZiAoIGlUbyAhPT0gbnVsbCApXG5cdHtcblx0XHRuUGFyZW50Lmluc2VydEJlZm9yZSggblN0b3JlLCBhblRhZ3NbaVRvXSApO1xuXHR9XG5cdGVsc2Vcblx0e1xuXHRcdG5QYXJlbnQuYXBwZW5kQ2hpbGQoIG5TdG9yZSApO1xuXHR9XG59XG5cblxuLyoqXG4gKiBQbHVnLWluIGZvciBEYXRhVGFibGVzIHdoaWNoIHdpbGwgcmVvcmRlciB0aGUgaW50ZXJuYWwgY29sdW1uIHN0cnVjdHVyZSBieSB0YWtpbmcgdGhlIGNvbHVtblxuICogZnJvbSBvbmUgcG9zaXRpb24gKGlGcm9tKSBhbmQgaW5zZXJ0IGl0IGludG8gYSBnaXZlbiBwb2ludCAoaVRvKS5cbiAqICBAbWV0aG9kICAkLmZuLmRhdGFUYWJsZUV4dC5vQXBpLmZuQ29sUmVvcmRlclxuICogIEBwYXJhbSAgIG9iamVjdCBvU2V0dGluZ3MgRGF0YVRhYmxlcyBzZXR0aW5ncyBvYmplY3QgLSBhdXRvbWF0aWNhbGx5IGFkZGVkIGJ5IERhdGFUYWJsZXMhXG4gKiAgQHBhcmFtICAgaW50IGlGcm9tIFRha2UgdGhlIGNvbHVtbiB0byBiZSByZXBvc2l0aW9uZWQgZnJvbSB0aGlzIHBvaW50XG4gKiAgQHBhcmFtICAgaW50IGlUbyBhbmQgaW5zZXJ0IGl0IGludG8gdGhpcyBwb2ludFxuICogIEBwYXJhbSAgIGJvb2wgZHJvcCBJbmRpY2F0ZSBpZiB0aGUgcmVvcmRlciBpcyB0aGUgZmluYWwgb25lIChpLmUuIGEgZHJvcClcbiAqICAgIG5vdCBhIGxpdmUgcmVvcmRlclxuICogIEBwYXJhbSAgIGJvb2wgaW52YWxpZGF0ZVJvd3Mgc3BlZWRzIHVwIHByb2Nlc3NpbmcgaWYgZmFsc2UgcGFzc2VkXG4gKiAgQHJldHVybnMgdm9pZFxuICovXG4kLmZuLmRhdGFUYWJsZUV4dC5vQXBpLmZuQ29sUmVvcmRlciA9IGZ1bmN0aW9uICggb1NldHRpbmdzLCBpRnJvbSwgaVRvLCBkcm9wLCBpbnZhbGlkYXRlUm93cyApXG57XG5cdHZhciBpLCBpTGVuLCBqLCBqTGVuLCBqZW4sIGlDb2xzPW9TZXR0aW5ncy5hb0NvbHVtbnMubGVuZ3RoLCBuVHJzLCBvQ29sO1xuXHR2YXIgYXR0ck1hcCA9IGZ1bmN0aW9uICggb2JqLCBwcm9wLCBtYXBwaW5nICkge1xuXHRcdGlmICggISBvYmpbIHByb3AgXSB8fCB0eXBlb2Ygb2JqWyBwcm9wIF0gPT09ICdmdW5jdGlvbicgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dmFyIGEgPSBvYmpbIHByb3AgXS5zcGxpdCgnLicpO1xuXHRcdHZhciBudW0gPSBhLnNoaWZ0KCk7XG5cblx0XHRpZiAoIGlzTmFOKCBudW0qMSApICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdG9ialsgcHJvcCBdID0gbWFwcGluZ1sgbnVtKjEgXSsnLicrYS5qb2luKCcuJyk7XG5cdH07XG5cblx0LyogU2FuaXR5IGNoZWNrIGluIHRoZSBpbnB1dCAqL1xuXHRpZiAoIGlGcm9tID09IGlUbyApXG5cdHtcblx0XHQvKiBQb2ludGxlc3MgcmVvcmRlciAqL1xuXHRcdHJldHVybjtcblx0fVxuXG5cdGlmICggaUZyb20gPCAwIHx8IGlGcm9tID49IGlDb2xzIClcblx0e1xuXHRcdHRoaXMub0FwaS5fZm5Mb2coIG9TZXR0aW5ncywgMSwgXCJDb2xSZW9yZGVyICdmcm9tJyBpbmRleCBpcyBvdXQgb2YgYm91bmRzOiBcIitpRnJvbSApO1xuXHRcdHJldHVybjtcblx0fVxuXG5cdGlmICggaVRvIDwgMCB8fCBpVG8gPj0gaUNvbHMgKVxuXHR7XG5cdFx0dGhpcy5vQXBpLl9mbkxvZyggb1NldHRpbmdzLCAxLCBcIkNvbFJlb3JkZXIgJ3RvJyBpbmRleCBpcyBvdXQgb2YgYm91bmRzOiBcIitpVG8gKTtcblx0XHRyZXR1cm47XG5cdH1cblxuXHQvKlxuXHQgKiBDYWxjdWxhdGUgdGhlIG5ldyBjb2x1bW4gYXJyYXkgaW5kZXgsIHNvIHdlIGhhdmUgYSBtYXBwaW5nIGJldHdlZW4gdGhlIG9sZCBhbmQgbmV3XG5cdCAqL1xuXHR2YXIgYWlNYXBwaW5nID0gW107XG5cdGZvciAoIGk9MCwgaUxlbj1pQ29scyA7IGk8aUxlbiA7IGkrKyApXG5cdHtcblx0XHRhaU1hcHBpbmdbaV0gPSBpO1xuXHR9XG5cdGZuQXJyYXlTd2l0Y2goIGFpTWFwcGluZywgaUZyb20sIGlUbyApO1xuXHR2YXIgYWlJbnZlcnRNYXBwaW5nID0gZm5JbnZlcnRLZXlWYWx1ZXMoIGFpTWFwcGluZyApO1xuXG5cblx0Lypcblx0ICogQ29udmVydCBhbGwgaW50ZXJuYWwgaW5kZXhpbmcgdG8gdGhlIG5ldyBjb2x1bW4gb3JkZXIgaW5kZXhlc1xuXHQgKi9cblx0LyogU29ydGluZyAqL1xuXHRmb3IgKCBpPTAsIGlMZW49b1NldHRpbmdzLmFhU29ydGluZy5sZW5ndGggOyBpPGlMZW4gOyBpKysgKVxuXHR7XG5cdFx0b1NldHRpbmdzLmFhU29ydGluZ1tpXVswXSA9IGFpSW52ZXJ0TWFwcGluZ1sgb1NldHRpbmdzLmFhU29ydGluZ1tpXVswXSBdO1xuXHR9XG5cblx0LyogRml4ZWQgc29ydGluZyAqL1xuXHRpZiAoIG9TZXR0aW5ncy5hYVNvcnRpbmdGaXhlZCAhPT0gbnVsbCApXG5cdHtcblx0XHRmb3IgKCBpPTAsIGlMZW49b1NldHRpbmdzLmFhU29ydGluZ0ZpeGVkLmxlbmd0aCA7IGk8aUxlbiA7IGkrKyApXG5cdFx0e1xuXHRcdFx0b1NldHRpbmdzLmFhU29ydGluZ0ZpeGVkW2ldWzBdID0gYWlJbnZlcnRNYXBwaW5nWyBvU2V0dGluZ3MuYWFTb3J0aW5nRml4ZWRbaV1bMF0gXTtcblx0XHR9XG5cdH1cblxuXHQvKiBEYXRhIGNvbHVtbiBzb3J0aW5nICh0aGUgY29sdW1uIHdoaWNoIHRoZSBzb3J0IGZvciBhIGdpdmVuIGNvbHVtbiBzaG91bGQgdGFrZSBwbGFjZSBvbikgKi9cblx0Zm9yICggaT0wLCBpTGVuPWlDb2xzIDsgaTxpTGVuIDsgaSsrIClcblx0e1xuXHRcdG9Db2wgPSBvU2V0dGluZ3MuYW9Db2x1bW5zW2ldO1xuXHRcdGZvciAoIGo9MCwgakxlbj1vQ29sLmFEYXRhU29ydC5sZW5ndGggOyBqPGpMZW4gOyBqKysgKVxuXHRcdHtcblx0XHRcdG9Db2wuYURhdGFTb3J0W2pdID0gYWlJbnZlcnRNYXBwaW5nWyBvQ29sLmFEYXRhU29ydFtqXSBdO1xuXHRcdH1cblxuXHRcdC8vIFVwZGF0ZSB0aGUgY29sdW1uIGluZGV4ZXNcblx0XHRvQ29sLmlkeCA9IGFpSW52ZXJ0TWFwcGluZ1sgb0NvbC5pZHggXTtcblx0fVxuXG5cdC8vIFVwZGF0ZSAxLjEwIG9wdGltaXNlZCBzb3J0IGNsYXNzIHJlbW92YWwgdmFyaWFibGVcblx0JC5lYWNoKCBvU2V0dGluZ3MuYUxhc3RTb3J0LCBmdW5jdGlvbiAoaSwgdmFsKSB7XG5cdFx0b1NldHRpbmdzLmFMYXN0U29ydFtpXS5zcmMgPSBhaUludmVydE1hcHBpbmdbIHZhbC5zcmMgXTtcblx0fSApO1xuXG5cdC8qIFVwZGF0ZSB0aGUgR2V0IGFuZCBTZXQgZnVuY3Rpb25zIGZvciBlYWNoIGNvbHVtbiAqL1xuXHRmb3IgKCBpPTAsIGlMZW49aUNvbHMgOyBpPGlMZW4gOyBpKysgKVxuXHR7XG5cdFx0b0NvbCA9IG9TZXR0aW5ncy5hb0NvbHVtbnNbaV07XG5cblx0XHRpZiAoIHR5cGVvZiBvQ29sLm1EYXRhID09ICdudW1iZXInICkge1xuXHRcdFx0b0NvbC5tRGF0YSA9IGFpSW52ZXJ0TWFwcGluZ1sgb0NvbC5tRGF0YSBdO1xuXHRcdH1cblx0XHRlbHNlIGlmICggJC5pc1BsYWluT2JqZWN0KCBvQ29sLm1EYXRhICkgKSB7XG5cdFx0XHQvLyBIVE1MNSBkYXRhIHNvdXJjZWRcblx0XHRcdGF0dHJNYXAoIG9Db2wubURhdGEsICdfJywgICAgICBhaUludmVydE1hcHBpbmcgKTtcblx0XHRcdGF0dHJNYXAoIG9Db2wubURhdGEsICdmaWx0ZXInLCBhaUludmVydE1hcHBpbmcgKTtcblx0XHRcdGF0dHJNYXAoIG9Db2wubURhdGEsICdzb3J0JywgICBhaUludmVydE1hcHBpbmcgKTtcblx0XHRcdGF0dHJNYXAoIG9Db2wubURhdGEsICd0eXBlJywgICBhaUludmVydE1hcHBpbmcgKTtcblx0XHR9XG5cdH1cblxuXHQvKlxuXHQgKiBNb3ZlIHRoZSBET00gZWxlbWVudHNcblx0ICovXG5cdGlmICggb1NldHRpbmdzLmFvQ29sdW1uc1tpRnJvbV0uYlZpc2libGUgKVxuXHR7XG5cdFx0LyogQ2FsY3VsYXRlIHRoZSBjdXJyZW50IHZpc2libGUgaW5kZXggYW5kIHRoZSBwb2ludCB0byBpbnNlcnQgdGhlIG5vZGUgYmVmb3JlLiBUaGUgaW5zZXJ0XG5cdFx0ICogYmVmb3JlIG5lZWRzIHRvIHRha2UgaW50byBhY2NvdW50IHRoYXQgdGhlcmUgbWlnaHQgbm90IGJlIGFuIGVsZW1lbnQgdG8gaW5zZXJ0IGJlZm9yZSxcblx0XHQgKiBpbiB3aGljaCBjYXNlIGl0IHdpbGwgYmUgbnVsbCwgYW5kIGFuIGFwcGVuZENoaWxkIHNob3VsZCBiZSB1c2VkXG5cdFx0ICovXG5cdFx0dmFyIGlWaXNpYmxlSW5kZXggPSB0aGlzLm9BcGkuX2ZuQ29sdW1uSW5kZXhUb1Zpc2libGUoIG9TZXR0aW5ncywgaUZyb20gKTtcblx0XHR2YXIgaUluc2VydEJlZm9yZUluZGV4ID0gbnVsbDtcblxuXHRcdGkgPSBpVG8gPCBpRnJvbSA/IGlUbyA6IGlUbyArIDE7XG5cdFx0d2hpbGUgKCBpSW5zZXJ0QmVmb3JlSW5kZXggPT09IG51bGwgJiYgaSA8IGlDb2xzIClcblx0XHR7XG5cdFx0XHRpSW5zZXJ0QmVmb3JlSW5kZXggPSB0aGlzLm9BcGkuX2ZuQ29sdW1uSW5kZXhUb1Zpc2libGUoIG9TZXR0aW5ncywgaSApO1xuXHRcdFx0aSsrO1xuXHRcdH1cblxuXHRcdC8qIEhlYWRlciAqL1xuXHRcdG5UcnMgPSBvU2V0dGluZ3MublRIZWFkLmdldEVsZW1lbnRzQnlUYWdOYW1lKCd0cicpO1xuXHRcdGZvciAoIGk9MCwgaUxlbj1uVHJzLmxlbmd0aCA7IGk8aUxlbiA7IGkrKyApXG5cdFx0e1xuXHRcdFx0Zm5Eb21Td2l0Y2goIG5UcnNbaV0sIGlWaXNpYmxlSW5kZXgsIGlJbnNlcnRCZWZvcmVJbmRleCApO1xuXHRcdH1cblxuXHRcdC8qIEZvb3RlciAqL1xuXHRcdGlmICggb1NldHRpbmdzLm5URm9vdCAhPT0gbnVsbCApXG5cdFx0e1xuXHRcdFx0blRycyA9IG9TZXR0aW5ncy5uVEZvb3QuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3RyJyk7XG5cdFx0XHRmb3IgKCBpPTAsIGlMZW49blRycy5sZW5ndGggOyBpPGlMZW4gOyBpKysgKVxuXHRcdFx0e1xuXHRcdFx0XHRmbkRvbVN3aXRjaCggblRyc1tpXSwgaVZpc2libGVJbmRleCwgaUluc2VydEJlZm9yZUluZGV4ICk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0LyogQm9keSAqL1xuXHRcdGZvciAoIGk9MCwgaUxlbj1vU2V0dGluZ3MuYW9EYXRhLmxlbmd0aCA7IGk8aUxlbiA7IGkrKyApXG5cdFx0e1xuXHRcdFx0aWYgKCBvU2V0dGluZ3MuYW9EYXRhW2ldLm5UciAhPT0gbnVsbCApXG5cdFx0XHR7XG5cdFx0XHRcdGZuRG9tU3dpdGNoKCBvU2V0dGluZ3MuYW9EYXRhW2ldLm5UciwgaVZpc2libGVJbmRleCwgaUluc2VydEJlZm9yZUluZGV4ICk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Lypcblx0ICogTW92ZSB0aGUgaW50ZXJuYWwgYXJyYXkgZWxlbWVudHNcblx0ICovXG5cdC8qIENvbHVtbnMgKi9cblx0Zm5BcnJheVN3aXRjaCggb1NldHRpbmdzLmFvQ29sdW1ucywgaUZyb20sIGlUbyApO1xuXG5cdC8vIHJlZ2VuZXJhdGUgdGhlIGdldCAvIHNldCBmdW5jdGlvbnNcblx0Zm9yICggaT0wLCBpTGVuPWlDb2xzIDsgaTxpTGVuIDsgaSsrICkge1xuXHRcdG9TZXR0aW5ncy5vQXBpLl9mbkNvbHVtbk9wdGlvbnMoIG9TZXR0aW5ncywgaSwge30gKTtcblx0fVxuXG5cdC8qIFNlYXJjaCBjb2x1bW5zICovXG5cdGZuQXJyYXlTd2l0Y2goIG9TZXR0aW5ncy5hb1ByZVNlYXJjaENvbHMsIGlGcm9tLCBpVG8gKTtcblxuXHQvKiBBcnJheSBhcnJheSAtIGludGVybmFsIGRhdGEgYW5vZGVzIGNhY2hlICovXG5cdGZvciAoIGk9MCwgaUxlbj1vU2V0dGluZ3MuYW9EYXRhLmxlbmd0aCA7IGk8aUxlbiA7IGkrKyApXG5cdHtcblx0XHR2YXIgZGF0YSA9IG9TZXR0aW5ncy5hb0RhdGFbaV07XG5cdFx0dmFyIGNlbGxzID0gZGF0YS5hbkNlbGxzO1xuXG5cdFx0aWYgKCBjZWxscyApIHtcblx0XHRcdGZuQXJyYXlTd2l0Y2goIGNlbGxzLCBpRnJvbSwgaVRvICk7XG5cblx0XHRcdC8vIExvbmdlciB0ZXJtLCBzaG91bGQgdGhpcyBiZSBtb3ZlZCBpbnRvIHRoZSBEYXRhVGFibGVzJyBpbnZhbGlkYXRlXG5cdFx0XHQvLyBtZXRob2RzP1xuXHRcdFx0Zm9yICggaj0wLCBqZW49Y2VsbHMubGVuZ3RoIDsgajxqZW4gOyBqKysgKSB7XG5cdFx0XHRcdGlmICggY2VsbHNbal0gJiYgY2VsbHNbal0uX0RUX0NlbGxJbmRleCApIHtcblx0XHRcdFx0XHRjZWxsc1tqXS5fRFRfQ2VsbEluZGV4LmNvbHVtbiA9IGo7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBGb3IgRE9NIHNvdXJjZWQgZGF0YSwgdGhlIGludmFsaWRhdGUgd2lsbCByZXJlYWQgdGhlIGNlbGwgaW50b1xuXHRcdC8vIHRoZSBkYXRhIGFycmF5LCBidXQgZm9yIGRhdGEgc291cmNlcyBhcyBhbiBhcnJheSwgdGhleSBuZWVkIHRvXG5cdFx0Ly8gYmUgZmxpcHBlZFxuXHRcdGlmICggZGF0YS5zcmMgIT09ICdkb20nICYmICQuaXNBcnJheSggZGF0YS5fYURhdGEgKSApIHtcblx0XHRcdGZuQXJyYXlTd2l0Y2goIGRhdGEuX2FEYXRhLCBpRnJvbSwgaVRvICk7XG5cdFx0fVxuXHR9XG5cblx0LyogUmVwb3NpdGlvbiB0aGUgaGVhZGVyIGVsZW1lbnRzIGluIHRoZSBoZWFkZXIgbGF5b3V0IGFycmF5ICovXG5cdGZvciAoIGk9MCwgaUxlbj1vU2V0dGluZ3MuYW9IZWFkZXIubGVuZ3RoIDsgaTxpTGVuIDsgaSsrIClcblx0e1xuXHRcdGZuQXJyYXlTd2l0Y2goIG9TZXR0aW5ncy5hb0hlYWRlcltpXSwgaUZyb20sIGlUbyApO1xuXHR9XG5cblx0aWYgKCBvU2V0dGluZ3MuYW9Gb290ZXIgIT09IG51bGwgKVxuXHR7XG5cdFx0Zm9yICggaT0wLCBpTGVuPW9TZXR0aW5ncy5hb0Zvb3Rlci5sZW5ndGggOyBpPGlMZW4gOyBpKysgKVxuXHRcdHtcblx0XHRcdGZuQXJyYXlTd2l0Y2goIG9TZXR0aW5ncy5hb0Zvb3RlcltpXSwgaUZyb20sIGlUbyApO1xuXHRcdH1cblx0fVxuXG5cdGlmICggaW52YWxpZGF0ZVJvd3MgfHwgaW52YWxpZGF0ZVJvd3MgPT09IHVuZGVmaW5lZCApXG5cdHtcblx0XHQkLmZuLmRhdGFUYWJsZS5BcGkoIG9TZXR0aW5ncyApLnJvd3MoKS5pbnZhbGlkYXRlKCk7XG5cdH1cblxuXHQvKlxuXHQgKiBVcGRhdGUgRGF0YVRhYmxlcycgZXZlbnQgaGFuZGxlcnNcblx0ICovXG5cblx0LyogU29ydCBsaXN0ZW5lciAqL1xuXHRmb3IgKCBpPTAsIGlMZW49aUNvbHMgOyBpPGlMZW4gOyBpKysgKVxuXHR7XG5cdFx0JChvU2V0dGluZ3MuYW9Db2x1bW5zW2ldLm5UaCkub2ZmKCcuRFQnKTtcblx0XHR0aGlzLm9BcGkuX2ZuU29ydEF0dGFjaExpc3RlbmVyKCBvU2V0dGluZ3MsIG9TZXR0aW5ncy5hb0NvbHVtbnNbaV0ublRoLCBpICk7XG5cdH1cblxuXG5cdC8qIEZpcmUgYW4gZXZlbnQgc28gb3RoZXIgcGx1Zy1pbnMgY2FuIHVwZGF0ZSAqL1xuXHQkKG9TZXR0aW5ncy5vSW5zdGFuY2UpLnRyaWdnZXIoICdjb2x1bW4tcmVvcmRlci5kdCcsIFsgb1NldHRpbmdzLCB7XG5cdFx0ZnJvbTogaUZyb20sXG5cdFx0dG86IGlUbyxcblx0XHRtYXBwaW5nOiBhaUludmVydE1hcHBpbmcsXG5cdFx0ZHJvcDogZHJvcCxcblxuXHRcdC8vIE9sZCBzdHlsZSBwYXJhbWV0ZXJzIGZvciBjb21wYXRpYmlsaXR5XG5cdFx0aUZyb206IGlGcm9tLFxuXHRcdGlUbzogaVRvLFxuXHRcdGFpSW52ZXJ0TWFwcGluZzogYWlJbnZlcnRNYXBwaW5nXG5cdH0gXSApO1xufTtcblxuLyoqXG4gKiBDb2xSZW9yZGVyIHByb3ZpZGVzIGNvbHVtbiB2aXNpYmlsaXR5IGNvbnRyb2wgZm9yIERhdGFUYWJsZXNcbiAqIEBjbGFzcyBDb2xSZW9yZGVyXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7b2JqZWN0fSBkdCBEYXRhVGFibGVzIHNldHRpbmdzIG9iamVjdFxuICogQHBhcmFtIHtvYmplY3R9IG9wdHMgQ29sUmVvcmRlciBvcHRpb25zXG4gKi9cbnZhciBDb2xSZW9yZGVyID0gZnVuY3Rpb24oIGR0LCBvcHRzIClcbntcblx0dmFyIHNldHRpbmdzID0gbmV3ICQuZm4uZGF0YVRhYmxlLkFwaSggZHQgKS5zZXR0aW5ncygpWzBdO1xuXG5cdC8vIEVuc3VyZSB0aGF0IHdlIGNhbid0IGluaXRpYWxpc2Ugb24gdGhlIHNhbWUgdGFibGUgdHdpY2Vcblx0aWYgKCBzZXR0aW5ncy5fY29sUmVvcmRlciApIHtcblx0XHRyZXR1cm4gc2V0dGluZ3MuX2NvbFJlb3JkZXI7XG5cdH1cblxuXHQvLyBBbGxvdyB0aGUgb3B0aW9ucyB0byBiZSBhIGJvb2xlYW4gZm9yIGRlZmF1bHRzXG5cdGlmICggb3B0cyA9PT0gdHJ1ZSApIHtcblx0XHRvcHRzID0ge307XG5cdH1cblxuXHQvLyBDb252ZXJ0IGZyb20gY2FtZWxDYXNlIHRvIEh1bmdhcmlhbiwganVzdCBhcyBEYXRhVGFibGVzIGRvZXNcblx0dmFyIGNhbWVsVG9IdW5nYXJpYW4gPSAkLmZuLmRhdGFUYWJsZS5jYW1lbFRvSHVuZ2FyaWFuO1xuXHRpZiAoIGNhbWVsVG9IdW5nYXJpYW4gKSB7XG5cdFx0Y2FtZWxUb0h1bmdhcmlhbiggQ29sUmVvcmRlci5kZWZhdWx0cywgQ29sUmVvcmRlci5kZWZhdWx0cywgdHJ1ZSApO1xuXHRcdGNhbWVsVG9IdW5nYXJpYW4oIENvbFJlb3JkZXIuZGVmYXVsdHMsIG9wdHMgfHwge30gKTtcblx0fVxuXG5cblx0LyogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKlxuXHQgKiBQdWJsaWMgY2xhc3MgdmFyaWFibGVzXG5cdCAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICovXG5cblx0LyoqXG5cdCAqIEBuYW1lc3BhY2UgU2V0dGluZ3Mgb2JqZWN0IHdoaWNoIGNvbnRhaW5zIGN1c3RvbWlzYWJsZSBpbmZvcm1hdGlvbiBmb3IgQ29sUmVvcmRlciBpbnN0YW5jZVxuXHQgKi9cblx0dGhpcy5zID0ge1xuXHRcdC8qKlxuXHRcdCAqIERhdGFUYWJsZXMgc2V0dGluZ3Mgb2JqZWN0XG5cdFx0ICogIEBwcm9wZXJ0eSBkdFxuXHRcdCAqICBAdHlwZSAgICAgT2JqZWN0XG5cdFx0ICogIEBkZWZhdWx0ICBudWxsXG5cdFx0ICovXG5cdFx0XCJkdFwiOiBudWxsLFxuXG5cdFx0LyoqXG5cdFx0ICogRW5hYmxlIGZsYWdcblx0XHQgKiAgQHByb3BlcnR5IGR0XG5cdFx0ICogIEB0eXBlICAgICBPYmplY3Rcblx0XHQgKiAgQGRlZmF1bHQgIG51bGxcblx0XHQgKi9cblx0XHRcImVuYWJsZVwiOiBudWxsLFxuXG5cdFx0LyoqXG5cdFx0ICogSW5pdGlhbGlzYXRpb24gb2JqZWN0IHVzZWQgZm9yIHRoaXMgaW5zdGFuY2Vcblx0XHQgKiAgQHByb3BlcnR5IGluaXRcblx0XHQgKiAgQHR5cGUgICAgIG9iamVjdFxuXHRcdCAqICBAZGVmYXVsdCAge31cblx0XHQgKi9cblx0XHRcImluaXRcIjogJC5leHRlbmQoIHRydWUsIHt9LCBDb2xSZW9yZGVyLmRlZmF1bHRzLCBvcHRzICksXG5cblx0XHQvKipcblx0XHQgKiBOdW1iZXIgb2YgY29sdW1ucyB0byBmaXggKG5vdCBhbGxvdyB0byBiZSByZW9yZGVyZWQpXG5cdFx0ICogIEBwcm9wZXJ0eSBmaXhlZFxuXHRcdCAqICBAdHlwZSAgICAgaW50XG5cdFx0ICogIEBkZWZhdWx0ICAwXG5cdFx0ICovXG5cdFx0XCJmaXhlZFwiOiAwLFxuXG5cdFx0LyoqXG5cdFx0ICogTnVtYmVyIG9mIGNvbHVtbnMgdG8gZml4IGNvdW50aW5nIGZyb20gcmlnaHQgKG5vdCBhbGxvdyB0byBiZSByZW9yZGVyZWQpXG5cdFx0ICogIEBwcm9wZXJ0eSBmaXhlZFJpZ2h0XG5cdFx0ICogIEB0eXBlICAgICBpbnRcblx0XHQgKiAgQGRlZmF1bHQgIDBcblx0XHQgKi9cblx0XHRcImZpeGVkUmlnaHRcIjogMCxcblxuXHRcdC8qKlxuXHRcdCAqIENhbGxiYWNrIGZ1bmN0aW9uIGZvciBvbmNlIHRoZSByZW9yZGVyIGhhcyBiZWVuIGRvbmVcblx0XHQgKiAgQHByb3BlcnR5IHJlb3JkZXJDYWxsYmFja1xuXHRcdCAqICBAdHlwZSAgICAgZnVuY3Rpb25cblx0XHQgKiAgQGRlZmF1bHQgIG51bGxcblx0XHQgKi9cblx0XHRcInJlb3JkZXJDYWxsYmFja1wiOiBudWxsLFxuXG5cdFx0LyoqXG5cdFx0ICogQG5hbWVzcGFjZSBJbmZvcm1hdGlvbiB1c2VkIGZvciB0aGUgbW91c2UgZHJhZ1xuXHRcdCAqL1xuXHRcdFwibW91c2VcIjoge1xuXHRcdFx0XCJzdGFydFhcIjogLTEsXG5cdFx0XHRcInN0YXJ0WVwiOiAtMSxcblx0XHRcdFwib2Zmc2V0WFwiOiAtMSxcblx0XHRcdFwib2Zmc2V0WVwiOiAtMSxcblx0XHRcdFwidGFyZ2V0XCI6IC0xLFxuXHRcdFx0XCJ0YXJnZXRJbmRleFwiOiAtMSxcblx0XHRcdFwiZnJvbUluZGV4XCI6IC0xXG5cdFx0fSxcblxuXHRcdC8qKlxuXHRcdCAqIEluZm9ybWF0aW9uIHdoaWNoIGlzIHVzZWQgZm9yIHBvc2l0aW9uaW5nIHRoZSBpbnNlcnQgY3Vzb3IgYW5kIGtub3dpbmcgd2hlcmUgdG8gZG8gdGhlXG5cdFx0ICogaW5zZXJ0LiBBcnJheSBvZiBvYmplY3RzIHdpdGggdGhlIHByb3BlcnRpZXM6XG5cdFx0ICogICB4OiB4LWF4aXMgcG9zaXRpb25cblx0XHQgKiAgIHRvOiBpbnNlcnQgcG9pbnRcblx0XHQgKiAgQHByb3BlcnR5IGFvVGFyZ2V0c1xuXHRcdCAqICBAdHlwZSAgICAgYXJyYXlcblx0XHQgKiAgQGRlZmF1bHQgIFtdXG5cdFx0ICovXG5cdFx0XCJhb1RhcmdldHNcIjogW11cblx0fTtcblxuXG5cdC8qKlxuXHQgKiBAbmFtZXNwYWNlIENvbW1vbiBhbmQgdXNlZnVsIERPTSBlbGVtZW50cyBmb3IgdGhlIGNsYXNzIGluc3RhbmNlXG5cdCAqL1xuXHR0aGlzLmRvbSA9IHtcblx0XHQvKipcblx0XHQgKiBEcmFnZ2luZyBlbGVtZW50ICh0aGUgb25lIHRoZSBtb3VzZSBpcyBtb3ZpbmcpXG5cdFx0ICogIEBwcm9wZXJ0eSBkcmFnXG5cdFx0ICogIEB0eXBlICAgICBlbGVtZW50XG5cdFx0ICogIEBkZWZhdWx0ICBudWxsXG5cdFx0ICovXG5cdFx0XCJkcmFnXCI6IG51bGwsXG5cblx0XHQvKipcblx0XHQgKiBUaGUgaW5zZXJ0IGN1cnNvclxuXHRcdCAqICBAcHJvcGVydHkgcG9pbnRlclxuXHRcdCAqICBAdHlwZSAgICAgZWxlbWVudFxuXHRcdCAqICBAZGVmYXVsdCAgbnVsbFxuXHRcdCAqL1xuXHRcdFwicG9pbnRlclwiOiBudWxsXG5cdH07XG5cblx0LyogQ29uc3RydWN0b3IgbG9naWMgKi9cblx0dGhpcy5zLmVuYWJsZSA9IHRoaXMucy5pbml0LmJFbmFibGU7XG5cdHRoaXMucy5kdCA9IHNldHRpbmdzO1xuXHR0aGlzLnMuZHQuX2NvbFJlb3JkZXIgPSB0aGlzO1xuXHR0aGlzLl9mbkNvbnN0cnVjdCgpO1xuXG5cdHJldHVybiB0aGlzO1xufTtcblxuXG5cbiQuZXh0ZW5kKCBDb2xSZW9yZGVyLnByb3RvdHlwZSwge1xuXHQvKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqXG5cdCAqIFB1YmxpYyBtZXRob2RzXG5cdCAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICovXG5cblx0LyoqXG5cdCAqIEVuYWJsZSAvIGRpc2FibGUgZW5kIHVzZXIgaW50ZXJhY3Rpb25cblx0ICovXG5cdGZuRW5hYmxlOiBmdW5jdGlvbiAoIGZsYWcgKVxuXHR7XG5cdFx0aWYgKCBmbGFnID09PSBmYWxzZSApIHtcblx0XHRcdHJldHVybiBmbkRpc2FibGUoKTtcblx0XHR9XG5cblx0XHR0aGlzLnMuZW5hYmxlID0gdHJ1ZTtcblx0fSxcblxuXHQvKipcblx0ICogRGlzYWJsZSBlbmQgdXNlciBpbnRlcmFjdGlvblxuXHQgKi9cblx0Zm5EaXNhYmxlOiBmdW5jdGlvbiAoKVxuXHR7XG5cdFx0dGhpcy5zLmVuYWJsZSA9IGZhbHNlO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZXNldCB0aGUgY29sdW1uIG9yZGVyaW5nIHRvIHRoZSBvcmlnaW5hbCBvcmRlcmluZyB0aGF0IHdhcyBkZXRlY3RlZCBvblxuXHQgKiBzdGFydCB1cC5cblx0ICogIEByZXR1cm4ge3RoaXN9IFJldHVybnMgYHRoaXNgIGZvciBjaGFpbmluZy5cblx0ICpcblx0ICogIEBleGFtcGxlXG5cdCAqICAgIC8vIERhdGFUYWJsZXMgaW5pdGlhbGlzYXRpb24gd2l0aCBDb2xSZW9yZGVyXG5cdCAqICAgIHZhciB0YWJsZSA9ICQoJyNleGFtcGxlJykuZGF0YVRhYmxlKCB7XG5cdCAqICAgICAgICBcInNEb21cIjogJ1JsZnJ0aXAnXG5cdCAqICAgIH0gKTtcblx0ICpcblx0ICogICAgLy8gQWRkIGNsaWNrIGV2ZW50IHRvIGEgYnV0dG9uIHRvIHJlc2V0IHRoZSBvcmRlcmluZ1xuXHQgKiAgICAkKCcjcmVzZXRPcmRlcmluZycpLmNsaWNrKCBmdW5jdGlvbiAoZSkge1xuXHQgKiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHQgKiAgICAgICAgJC5mbi5kYXRhVGFibGUuQ29sUmVvcmRlciggdGFibGUgKS5mblJlc2V0KCk7XG5cdCAqICAgIH0gKTtcblx0ICovXG5cdFwiZm5SZXNldFwiOiBmdW5jdGlvbiAoKVxuXHR7XG5cdFx0dGhpcy5fZm5PcmRlckNvbHVtbnMoIHRoaXMuZm5PcmRlcigpICk7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblxuXHQvKipcblx0ICogYERlcHJlY2F0ZWRgIC0gR2V0IHRoZSBjdXJyZW50IG9yZGVyIG9mIHRoZSBjb2x1bW5zLCBhcyBhbiBhcnJheS5cblx0ICogIEByZXR1cm4ge2FycmF5fSBBcnJheSBvZiBjb2x1bW4gaWRlbnRpZmllcnNcblx0ICogIEBkZXByZWNhdGVkIGBmbk9yZGVyYCBzaG91bGQgYmUgdXNlZCBpbiBwcmVmZXJlbmNlIHRvIHRoaXMgbWV0aG9kLlxuXHQgKiAgICAgIGBmbk9yZGVyYCBhY3RzIGFzIGEgZ2V0dGVyL3NldHRlci5cblx0ICovXG5cdFwiZm5HZXRDdXJyZW50T3JkZXJcIjogZnVuY3Rpb24gKClcblx0e1xuXHRcdHJldHVybiB0aGlzLmZuT3JkZXIoKTtcblx0fSxcblxuXHQvKipcblx0ICogR2V0IHRoZSBjdXJyZW50IG9yZGVyIG9mIHRoZSBjb2x1bW5zLCBhcyBhbiBhcnJheS4gTm90ZSB0aGF0IHRoZSB2YWx1ZXNcblx0ICogZ2l2ZW4gaW4gdGhlIGFycmF5IGFyZSB1bmlxdWUgaWRlbnRpZmllcnMgZm9yIGVhY2ggY29sdW1uLiBDdXJyZW50bHlcblx0ICogdGhlc2UgYXJlIHRoZSBvcmlnaW5hbCBvcmRlcmluZyBvZiB0aGUgY29sdW1ucyB0aGF0IHdhcyBkZXRlY3RlZCBvblxuXHQgKiBzdGFydCB1cCwgYnV0IHRoaXMgY291bGQgcG90ZW50aWFsbHkgY2hhbmdlIGluIGZ1dHVyZS5cblx0ICogIEByZXR1cm4ge2FycmF5fSBBcnJheSBvZiBjb2x1bW4gaWRlbnRpZmllcnNcblx0ICpcblx0ICogIEBleGFtcGxlXG5cdCAqICAgIC8vIEdldCBjb2x1bW4gb3JkZXJpbmcgZm9yIHRoZSB0YWJsZVxuXHQgKiAgICB2YXIgb3JkZXIgPSAkLmZuLmRhdGFUYWJsZS5Db2xSZW9yZGVyKCBkYXRhVGFibGUgKS5mbk9yZGVyKCk7XG5cdCAqLy8qKlxuXHQgKiBTZXQgdGhlIG9yZGVyIG9mIHRoZSBjb2x1bW5zLCBmcm9tIHRoZSBwb3NpdGlvbnMgaWRlbnRpZmllZCBpbiB0aGVcblx0ICogb3JkZXJpbmcgYXJyYXkgZ2l2ZW4uIE5vdGUgdGhhdCBDb2xSZW9yZGVyIHRha2VzIGEgYnJ1dGUgZm9yY2UgYXBwcm9hY2hcblx0ICogdG8gcmVvcmRlcmluZywgc28gaXQgaXMgcG9zc2libGUgbXVsdGlwbGUgcmVvcmRlcmluZyBldmVudHMgd2lsbCBvY2N1clxuXHQgKiBiZWZvcmUgdGhlIGZpbmFsIG9yZGVyIGlzIHNldHRsZWQgdXBvbi5cblx0ICogIEBwYXJhbSB7YXJyYXl9IFtzZXRdIEFycmF5IG9mIGNvbHVtbiBpZGVudGlmaWVycyBpbiB0aGUgbmV3IG9yZGVyLiBOb3RlXG5cdCAqICAgIHRoYXQgZXZlcnkgY29sdW1uIG11c3QgYmUgaW5jbHVkZWQsIHVuaXF1ZWx5LCBpbiB0aGlzIGFycmF5LlxuXHQgKiAgQHJldHVybiB7dGhpc30gUmV0dXJucyBgdGhpc2AgZm9yIGNoYWluaW5nLlxuXHQgKlxuXHQgKiAgQGV4YW1wbGVcblx0ICogICAgLy8gU3dhcCB0aGUgZmlyc3QgYW5kIHNlY29uZCBjb2x1bW5zXG5cdCAqICAgICQuZm4uZGF0YVRhYmxlLkNvbFJlb3JkZXIoIGRhdGFUYWJsZSApLmZuT3JkZXIoIFsxLCAwLCAyLCAzLCA0XSApO1xuXHQgKlxuXHQgKiAgQGV4YW1wbGVcblx0ICogICAgLy8gTW92ZSB0aGUgZmlyc3QgY29sdW1uIHRvIHRoZSBlbmQgZm9yIHRoZSB0YWJsZSBgI2V4YW1wbGVgXG5cdCAqICAgIHZhciBjdXJyID0gJC5mbi5kYXRhVGFibGUuQ29sUmVvcmRlciggJyNleGFtcGxlJyApLmZuT3JkZXIoKTtcblx0ICogICAgdmFyIGZpcnN0ID0gY3Vyci5zaGlmdCgpO1xuXHQgKiAgICBjdXJyLnB1c2goIGZpcnN0ICk7XG5cdCAqICAgICQuZm4uZGF0YVRhYmxlLkNvbFJlb3JkZXIoICcjZXhhbXBsZScgKS5mbk9yZGVyKCBjdXJyICk7XG5cdCAqXG5cdCAqICBAZXhhbXBsZVxuXHQgKiAgICAvLyBSZXZlcnNlIHRoZSB0YWJsZSdzIG9yZGVyXG5cdCAqICAgICQuZm4uZGF0YVRhYmxlLkNvbFJlb3JkZXIoICcjZXhhbXBsZScgKS5mbk9yZGVyKFxuXHQgKiAgICAgICQuZm4uZGF0YVRhYmxlLkNvbFJlb3JkZXIoICcjZXhhbXBsZScgKS5mbk9yZGVyKCkucmV2ZXJzZSgpXG5cdCAqICAgICk7XG5cdCAqL1xuXHRcImZuT3JkZXJcIjogZnVuY3Rpb24gKCBzZXQsIG9yaWdpbmFsIClcblx0e1xuXHRcdHZhciBhID0gW10sIGksIGllbiwgaiwgamVuO1xuXHRcdHZhciBjb2x1bW5zID0gdGhpcy5zLmR0LmFvQ29sdW1ucztcblxuXHRcdGlmICggc2V0ID09PSB1bmRlZmluZWQgKXtcblx0XHRcdGZvciAoIGk9MCwgaWVuPWNvbHVtbnMubGVuZ3RoIDsgaTxpZW4gOyBpKysgKSB7XG5cdFx0XHRcdGEucHVzaCggY29sdW1uc1tpXS5fQ29sUmVvcmRlcl9pT3JpZ0NvbCApO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gYTtcblx0XHR9XG5cblx0XHQvLyBUaGUgb3JkZXIgZ2l2ZW4gaXMgYmFzZWQgb24gdGhlIG9yaWdpbmFsIGluZGV4ZXMsIHJhdGhlciB0aGFuIHRoZVxuXHRcdC8vIGV4aXN0aW5nIG9uZXMsIHNvIHdlIG5lZWQgdG8gdHJhbnNsYXRlIGZyb20gdGhlIG9yaWdpbmFsIHRvIGN1cnJlbnRcblx0XHQvLyBiZWZvcmUgdGhlbiBkb2luZyB0aGUgb3JkZXJcblx0XHRpZiAoIG9yaWdpbmFsICkge1xuXHRcdFx0dmFyIG9yZGVyID0gdGhpcy5mbk9yZGVyKCk7XG5cblx0XHRcdGZvciAoIGk9MCwgaWVuPXNldC5sZW5ndGggOyBpPGllbiA7IGkrKyApIHtcblx0XHRcdFx0YS5wdXNoKCAkLmluQXJyYXkoIHNldFtpXSwgb3JkZXIgKSApO1xuXHRcdFx0fVxuXG5cdFx0XHRzZXQgPSBhO1xuXHRcdH1cblxuXHRcdHRoaXMuX2ZuT3JkZXJDb2x1bW5zKCBmbkludmVydEtleVZhbHVlcyggc2V0ICkgKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXG5cblx0LyoqXG5cdCAqIENvbnZlcnQgZnJvbSB0aGUgb3JpZ2luYWwgY29sdW1uIGluZGV4LCB0byB0aGUgb3JpZ2luYWxcblx0ICpcblx0ICogQHBhcmFtICB7aW50fGFycmF5fSBpZHggSW5kZXgoZXMpIHRvIGNvbnZlcnRcblx0ICogQHBhcmFtICB7c3RyaW5nfSBkaXIgVHJhbnNwb3NlIGRpcmVjdGlvbiAtIGBmcm9tT3JpZ2luYWxgIC8gYHRvQ3VycmVudGBcblx0ICogICBvciBgJ3RvT3JpZ2luYWxgIC8gYGZyb21DdXJyZW50YFxuXHQgKiBAcmV0dXJuIHtpbnR8YXJyYXl9ICAgICBDb252ZXJ0ZWQgdmFsdWVzXG5cdCAqL1xuXHRmblRyYW5zcG9zZTogZnVuY3Rpb24gKCBpZHgsIGRpciApXG5cdHtcblx0XHRpZiAoICEgZGlyICkge1xuXHRcdFx0ZGlyID0gJ3RvQ3VycmVudCc7XG5cdFx0fVxuXG5cdFx0dmFyIG9yZGVyID0gdGhpcy5mbk9yZGVyKCk7XG5cdFx0dmFyIGNvbHVtbnMgPSB0aGlzLnMuZHQuYW9Db2x1bW5zO1xuXG5cdFx0aWYgKCBkaXIgPT09ICd0b0N1cnJlbnQnICkge1xuXHRcdFx0Ly8gR2l2ZW4gYW4gb3JpZ2luYWwgaW5kZXgsIHdhbnQgdGhlIGN1cnJlbnRcblx0XHRcdHJldHVybiAhICQuaXNBcnJheSggaWR4ICkgP1xuXHRcdFx0XHQkLmluQXJyYXkoIGlkeCwgb3JkZXIgKSA6XG5cdFx0XHRcdCQubWFwKCBpZHgsIGZ1bmN0aW9uICggaW5kZXggKSB7XG5cdFx0XHRcdFx0cmV0dXJuICQuaW5BcnJheSggaW5kZXgsIG9yZGVyICk7XG5cdFx0XHRcdH0gKTtcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHQvLyBHaXZlbiBhIGN1cnJlbnQgaW5kZXgsIHdhbnQgdGhlIG9yaWdpbmFsXG5cdFx0XHRyZXR1cm4gISAkLmlzQXJyYXkoIGlkeCApID9cblx0XHRcdFx0Y29sdW1uc1tpZHhdLl9Db2xSZW9yZGVyX2lPcmlnQ29sIDpcblx0XHRcdFx0JC5tYXAoIGlkeCwgZnVuY3Rpb24gKCBpbmRleCApIHtcblx0XHRcdFx0XHRyZXR1cm4gY29sdW1uc1tpbmRleF0uX0NvbFJlb3JkZXJfaU9yaWdDb2w7XG5cdFx0XHRcdH0gKTtcblx0XHR9XG5cdH0sXG5cblxuXHQvKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqXG5cdCAqIFByaXZhdGUgbWV0aG9kcyAodGhleSBhcmUgb2YgY291cnNlIHB1YmxpYyBpbiBKUywgYnV0IHJlY29tbWVuZGVkIGFzIHByaXZhdGUpXG5cdCAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICovXG5cblx0LyoqXG5cdCAqIENvbnN0cnVjdG9yIGxvZ2ljXG5cdCAqICBAbWV0aG9kICBfZm5Db25zdHJ1Y3Rcblx0ICogIEByZXR1cm5zIHZvaWRcblx0ICogIEBwcml2YXRlXG5cdCAqL1xuXHRcIl9mbkNvbnN0cnVjdFwiOiBmdW5jdGlvbiAoKVxuXHR7XG5cdFx0dmFyIHRoYXQgPSB0aGlzO1xuXHRcdHZhciBpTGVuID0gdGhpcy5zLmR0LmFvQ29sdW1ucy5sZW5ndGg7XG5cdFx0dmFyIHRhYmxlID0gdGhpcy5zLmR0Lm5UYWJsZTtcblx0XHR2YXIgaTtcblxuXHRcdC8qIENvbHVtbnMgZGlzY291bnRlZCBmcm9tIHJlb3JkZXJpbmcgLSBjb3VudGluZyBsZWZ0IHRvIHJpZ2h0ICovXG5cdFx0aWYgKCB0aGlzLnMuaW5pdC5pRml4ZWRDb2x1bW5zIClcblx0XHR7XG5cdFx0XHR0aGlzLnMuZml4ZWQgPSB0aGlzLnMuaW5pdC5pRml4ZWRDb2x1bW5zO1xuXHRcdH1cblxuXHRcdGlmICggdGhpcy5zLmluaXQuaUZpeGVkQ29sdW1uc0xlZnQgKVxuXHRcdHtcblx0XHRcdHRoaXMucy5maXhlZCA9IHRoaXMucy5pbml0LmlGaXhlZENvbHVtbnNMZWZ0O1xuXHRcdH1cblxuXHRcdC8qIENvbHVtbnMgZGlzY291bnRlZCBmcm9tIHJlb3JkZXJpbmcgLSBjb3VudGluZyByaWdodCB0byBsZWZ0ICovXG5cdFx0dGhpcy5zLmZpeGVkUmlnaHQgPSB0aGlzLnMuaW5pdC5pRml4ZWRDb2x1bW5zUmlnaHQgP1xuXHRcdFx0dGhpcy5zLmluaXQuaUZpeGVkQ29sdW1uc1JpZ2h0IDpcblx0XHRcdDA7XG5cblx0XHQvKiBEcm9wIGNhbGxiYWNrIGluaXRpYWxpc2F0aW9uIG9wdGlvbiAqL1xuXHRcdGlmICggdGhpcy5zLmluaXQuZm5SZW9yZGVyQ2FsbGJhY2sgKVxuXHRcdHtcblx0XHRcdHRoaXMucy5yZW9yZGVyQ2FsbGJhY2sgPSB0aGlzLnMuaW5pdC5mblJlb3JkZXJDYWxsYmFjaztcblx0XHR9XG5cblx0XHQvKiBBZGQgZXZlbnQgaGFuZGxlcnMgZm9yIHRoZSBkcmFnIGFuZCBkcm9wLCBhbmQgYWxzbyBtYXJrIHRoZSBvcmlnaW5hbCBjb2x1bW4gb3JkZXIgKi9cblx0XHRmb3IgKCBpID0gMDsgaSA8IGlMZW47IGkrKyApXG5cdFx0e1xuXHRcdFx0aWYgKCBpID4gdGhpcy5zLmZpeGVkLTEgJiYgaSA8IGlMZW4gLSB0aGlzLnMuZml4ZWRSaWdodCApXG5cdFx0XHR7XG5cdFx0XHRcdHRoaXMuX2ZuTW91c2VMaXN0ZW5lciggaSwgdGhpcy5zLmR0LmFvQ29sdW1uc1tpXS5uVGggKTtcblx0XHRcdH1cblxuXHRcdFx0LyogTWFyayB0aGUgb3JpZ2luYWwgY29sdW1uIG9yZGVyIGZvciBsYXRlciByZWZlcmVuY2UgKi9cblx0XHRcdHRoaXMucy5kdC5hb0NvbHVtbnNbaV0uX0NvbFJlb3JkZXJfaU9yaWdDb2wgPSBpO1xuXHRcdH1cblxuXHRcdC8qIFN0YXRlIHNhdmluZyAqL1xuXHRcdHRoaXMucy5kdC5vQXBpLl9mbkNhbGxiYWNrUmVnKCB0aGlzLnMuZHQsICdhb1N0YXRlU2F2ZVBhcmFtcycsIGZ1bmN0aW9uIChvUywgb0RhdGEpIHtcblx0XHRcdHRoYXQuX2ZuU3RhdGVTYXZlLmNhbGwoIHRoYXQsIG9EYXRhICk7XG5cdFx0fSwgXCJDb2xSZW9yZGVyX1N0YXRlXCIgKTtcblxuXHRcdC8qIEFuIGluaXRpYWwgY29sdW1uIG9yZGVyIGhhcyBiZWVuIHNwZWNpZmllZCAqL1xuXHRcdHZhciBhaU9yZGVyID0gbnVsbDtcblx0XHRpZiAoIHRoaXMucy5pbml0LmFpT3JkZXIgKVxuXHRcdHtcblx0XHRcdGFpT3JkZXIgPSB0aGlzLnMuaW5pdC5haU9yZGVyLnNsaWNlKCk7XG5cdFx0fVxuXG5cdFx0LyogU3RhdGUgbG9hZGluZywgb3ZlcnJpZGVzIHRoZSBjb2x1bW4gb3JkZXIgZ2l2ZW4gKi9cblx0XHRpZiAoIHRoaXMucy5kdC5vTG9hZGVkU3RhdGUgJiYgdHlwZW9mIHRoaXMucy5kdC5vTG9hZGVkU3RhdGUuQ29sUmVvcmRlciAhPSAndW5kZWZpbmVkJyAmJlxuXHRcdCAgdGhpcy5zLmR0Lm9Mb2FkZWRTdGF0ZS5Db2xSZW9yZGVyLmxlbmd0aCA9PSB0aGlzLnMuZHQuYW9Db2x1bW5zLmxlbmd0aCApXG5cdFx0e1xuXHRcdFx0YWlPcmRlciA9IHRoaXMucy5kdC5vTG9hZGVkU3RhdGUuQ29sUmVvcmRlcjtcblx0XHR9XG5cblx0XHQvKiBJZiB3ZSBoYXZlIGFuIG9yZGVyIHRvIGFwcGx5IC0gZG8gc28gKi9cblx0XHRpZiAoIGFpT3JkZXIgKVxuXHRcdHtcblx0XHRcdC8qIFdlIG1pZ2h0IGJlIGNhbGxlZCBkdXJpbmcgb3IgYWZ0ZXIgdGhlIERhdGFUYWJsZXMgaW5pdGlhbGlzYXRpb24uIElmIGJlZm9yZSwgdGhlbiB3ZSBuZWVkXG5cdFx0XHQgKiB0byB3YWl0IHVudGlsIHRoZSBkcmF3IGlzIGRvbmUsIGlmIGFmdGVyLCB0aGVuIGRvIHdoYXQgd2UgbmVlZCB0byBkbyByaWdodCBhd2F5XG5cdFx0XHQgKi9cblx0XHRcdGlmICggIXRoYXQucy5kdC5fYkluaXRDb21wbGV0ZSApXG5cdFx0XHR7XG5cdFx0XHRcdHZhciBiRG9uZSA9IGZhbHNlO1xuXHRcdFx0XHQkKHRhYmxlKS5vbiggJ2RyYXcuZHQuY29sUmVvcmRlcicsIGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRpZiAoICF0aGF0LnMuZHQuX2JJbml0Q29tcGxldGUgJiYgIWJEb25lIClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRiRG9uZSA9IHRydWU7XG5cdFx0XHRcdFx0XHR2YXIgcmVzb3J0ID0gZm5JbnZlcnRLZXlWYWx1ZXMoIGFpT3JkZXIgKTtcblx0XHRcdFx0XHRcdHRoYXQuX2ZuT3JkZXJDb2x1bW5zLmNhbGwoIHRoYXQsIHJlc29ydCApO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSApO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZVxuXHRcdFx0e1xuXHRcdFx0XHR2YXIgcmVzb3J0ID0gZm5JbnZlcnRLZXlWYWx1ZXMoIGFpT3JkZXIgKTtcblx0XHRcdFx0dGhhdC5fZm5PcmRlckNvbHVtbnMuY2FsbCggdGhhdCwgcmVzb3J0ICk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0dGhpcy5fZm5TZXRDb2x1bW5JbmRleGVzKCk7XG5cdFx0fVxuXG5cdFx0Ly8gRGVzdHJveSBjbGVhbiB1cFxuXHRcdCQodGFibGUpLm9uKCAnZGVzdHJveS5kdC5jb2xSZW9yZGVyJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0JCh0YWJsZSkub2ZmKCAnZGVzdHJveS5kdC5jb2xSZW9yZGVyIGRyYXcuZHQuY29sUmVvcmRlcicgKTtcblxuXHRcdFx0JC5lYWNoKCB0aGF0LnMuZHQuYW9Db2x1bW5zLCBmdW5jdGlvbiAoaSwgY29sdW1uKSB7XG5cdFx0XHRcdCQoY29sdW1uLm5UaCkub2ZmKCcuQ29sUmVvcmRlcicpO1xuXHRcdFx0XHQkKGNvbHVtbi5uVGgpLnJlbW92ZUF0dHIoJ2RhdGEtY29sdW1uLWluZGV4Jyk7XG5cdFx0XHR9ICk7XG5cblx0XHRcdHRoYXQucy5kdC5fY29sUmVvcmRlciA9IG51bGw7XG5cdFx0XHR0aGF0LnMgPSBudWxsO1xuXHRcdH0gKTtcblx0fSxcblxuXG5cdC8qKlxuXHQgKiBTZXQgdGhlIGNvbHVtbiBvcmRlciBmcm9tIGFuIGFycmF5XG5cdCAqICBAbWV0aG9kICBfZm5PcmRlckNvbHVtbnNcblx0ICogIEBwYXJhbSAgIGFycmF5IGEgQW4gYXJyYXkgb2YgaW50ZWdlcnMgd2hpY2ggZGljdGF0ZSB0aGUgY29sdW1uIG9yZGVyIHRoYXQgc2hvdWxkIGJlIGFwcGxpZWRcblx0ICogIEByZXR1cm5zIHZvaWRcblx0ICogIEBwcml2YXRlXG5cdCAqL1xuXHRcIl9mbk9yZGVyQ29sdW1uc1wiOiBmdW5jdGlvbiAoIGEgKVxuXHR7XG5cdFx0dmFyIGNoYW5nZWQgPSBmYWxzZTtcblxuXHRcdGlmICggYS5sZW5ndGggIT0gdGhpcy5zLmR0LmFvQ29sdW1ucy5sZW5ndGggKVxuXHRcdHtcblx0XHRcdHRoaXMucy5kdC5vSW5zdGFuY2Uub0FwaS5fZm5Mb2coIHRoaXMucy5kdCwgMSwgXCJDb2xSZW9yZGVyIC0gYXJyYXkgcmVvcmRlciBkb2VzIG5vdCBcIitcblx0XHRcdFx0XCJtYXRjaCBrbm93biBudW1iZXIgb2YgY29sdW1ucy4gU2tpcHBpbmcuXCIgKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRmb3IgKCB2YXIgaT0wLCBpTGVuPWEubGVuZ3RoIDsgaTxpTGVuIDsgaSsrIClcblx0XHR7XG5cdFx0XHR2YXIgY3VyckluZGV4ID0gJC5pbkFycmF5KCBpLCBhICk7XG5cdFx0XHRpZiAoIGkgIT0gY3VyckluZGV4IClcblx0XHRcdHtcblx0XHRcdFx0LyogUmVvcmRlciBvdXIgc3dpdGNoaW5nIGFycmF5ICovXG5cdFx0XHRcdGZuQXJyYXlTd2l0Y2goIGEsIGN1cnJJbmRleCwgaSApO1xuXG5cdFx0XHRcdC8qIERvIHRoZSBjb2x1bW4gcmVvcmRlciBpbiB0aGUgdGFibGUgKi9cblx0XHRcdFx0dGhpcy5zLmR0Lm9JbnN0YW5jZS5mbkNvbFJlb3JkZXIoIGN1cnJJbmRleCwgaSwgdHJ1ZSwgZmFsc2UgKTtcblxuXHRcdFx0XHRjaGFuZ2VkID0gdHJ1ZTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHR0aGlzLl9mblNldENvbHVtbkluZGV4ZXMoKTtcblxuXHRcdC8vIEhhcyBhbnl0aGluZyBhY3R1YWxseSBjaGFuZ2VkPyBJZiBub3QsIHRoZW4gbm90aGluZyBlbHNlIHRvIGRvXG5cdFx0aWYgKCAhIGNoYW5nZWQgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0JC5mbi5kYXRhVGFibGUuQXBpKCB0aGlzLnMuZHQgKS5yb3dzKCkuaW52YWxpZGF0ZSgpO1xuXG5cdFx0LyogV2hlbiBzY3JvbGxpbmcgd2UgbmVlZCB0byByZWNhbGN1bGF0ZSB0aGUgY29sdW1uIHNpemVzIHRvIGFsbG93IGZvciB0aGUgc2hpZnQgKi9cblx0XHRpZiAoIHRoaXMucy5kdC5vU2Nyb2xsLnNYICE9PSBcIlwiIHx8IHRoaXMucy5kdC5vU2Nyb2xsLnNZICE9PSBcIlwiIClcblx0XHR7XG5cdFx0XHR0aGlzLnMuZHQub0luc3RhbmNlLmZuQWRqdXN0Q29sdW1uU2l6aW5nKCBmYWxzZSApO1xuXHRcdH1cblxuXHRcdC8qIFNhdmUgdGhlIHN0YXRlICovXG5cdFx0dGhpcy5zLmR0Lm9JbnN0YW5jZS5vQXBpLl9mblNhdmVTdGF0ZSggdGhpcy5zLmR0ICk7XG5cblx0XHRpZiAoIHRoaXMucy5yZW9yZGVyQ2FsbGJhY2sgIT09IG51bGwgKVxuXHRcdHtcblx0XHRcdHRoaXMucy5yZW9yZGVyQ2FsbGJhY2suY2FsbCggdGhpcyApO1xuXHRcdH1cblx0fSxcblxuXG5cdC8qKlxuXHQgKiBCZWNhdXNlIHdlIGNoYW5nZSB0aGUgaW5kZXhlcyBvZiBjb2x1bW5zIGluIHRoZSB0YWJsZSwgcmVsYXRpdmUgdG8gdGhlaXIgc3RhcnRpbmcgcG9pbnRcblx0ICogd2UgbmVlZCB0byByZW9yZGVyIHRoZSBzdGF0ZSBjb2x1bW5zIHRvIHdoYXQgdGhleSBhcmUgYXQgdGhlIHN0YXJ0aW5nIHBvaW50IHNvIHdlIGNhblxuXHQgKiB0aGVuIHJlYXJyYW5nZSB0aGVtIGFnYWluIG9uIHN0YXRlIGxvYWQhXG5cdCAqICBAbWV0aG9kICBfZm5TdGF0ZVNhdmVcblx0ICogIEBwYXJhbSAgIG9iamVjdCBvU3RhdGUgRGF0YVRhYmxlcyBzdGF0ZVxuXHQgKiAgQHJldHVybnMgc3RyaW5nIEpTT04gZW5jb2RlZCBjb29raWUgc3RyaW5nIGZvciBEYXRhVGFibGVzXG5cdCAqICBAcHJpdmF0ZVxuXHQgKi9cblx0XCJfZm5TdGF0ZVNhdmVcIjogZnVuY3Rpb24gKCBvU3RhdGUgKVxuXHR7XG5cdFx0dmFyIGksIGlMZW4sIGFDb3B5LCBpT3JpZ0NvbHVtbjtcblx0XHR2YXIgb1NldHRpbmdzID0gdGhpcy5zLmR0O1xuXHRcdHZhciBjb2x1bW5zID0gb1NldHRpbmdzLmFvQ29sdW1ucztcblxuXHRcdG9TdGF0ZS5Db2xSZW9yZGVyID0gW107XG5cblx0XHQvKiBTb3J0aW5nICovXG5cdFx0aWYgKCBvU3RhdGUuYWFTb3J0aW5nICkge1xuXHRcdFx0Ly8gMS4xMC4wLVxuXHRcdFx0Zm9yICggaT0wIDsgaTxvU3RhdGUuYWFTb3J0aW5nLmxlbmd0aCA7IGkrKyApIHtcblx0XHRcdFx0b1N0YXRlLmFhU29ydGluZ1tpXVswXSA9IGNvbHVtbnNbIG9TdGF0ZS5hYVNvcnRpbmdbaV1bMF0gXS5fQ29sUmVvcmRlcl9pT3JpZ0NvbDtcblx0XHRcdH1cblxuXHRcdFx0dmFyIGFTZWFyY2hDb3B5ID0gJC5leHRlbmQoIHRydWUsIFtdLCBvU3RhdGUuYW9TZWFyY2hDb2xzICk7XG5cblx0XHRcdGZvciAoIGk9MCwgaUxlbj1jb2x1bW5zLmxlbmd0aCA7IGk8aUxlbiA7IGkrKyApXG5cdFx0XHR7XG5cdFx0XHRcdGlPcmlnQ29sdW1uID0gY29sdW1uc1tpXS5fQ29sUmVvcmRlcl9pT3JpZ0NvbDtcblxuXHRcdFx0XHQvKiBDb2x1bW4gZmlsdGVyICovXG5cdFx0XHRcdG9TdGF0ZS5hb1NlYXJjaENvbHNbIGlPcmlnQ29sdW1uIF0gPSBhU2VhcmNoQ29weVtpXTtcblxuXHRcdFx0XHQvKiBWaXNpYmlsaXR5ICovXG5cdFx0XHRcdG9TdGF0ZS5hYlZpc0NvbHNbIGlPcmlnQ29sdW1uIF0gPSBjb2x1bW5zW2ldLmJWaXNpYmxlO1xuXG5cdFx0XHRcdC8qIENvbHVtbiByZW9yZGVyaW5nICovXG5cdFx0XHRcdG9TdGF0ZS5Db2xSZW9yZGVyLnB1c2goIGlPcmlnQ29sdW1uICk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGVsc2UgaWYgKCBvU3RhdGUub3JkZXIgKSB7XG5cdFx0XHQvLyAxLjEwLjErXG5cdFx0XHRmb3IgKCBpPTAgOyBpPG9TdGF0ZS5vcmRlci5sZW5ndGggOyBpKysgKSB7XG5cdFx0XHRcdG9TdGF0ZS5vcmRlcltpXVswXSA9IGNvbHVtbnNbIG9TdGF0ZS5vcmRlcltpXVswXSBdLl9Db2xSZW9yZGVyX2lPcmlnQ29sO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgc3RhdGVDb2x1bW5zQ29weSA9ICQuZXh0ZW5kKCB0cnVlLCBbXSwgb1N0YXRlLmNvbHVtbnMgKTtcblxuXHRcdFx0Zm9yICggaT0wLCBpTGVuPWNvbHVtbnMubGVuZ3RoIDsgaTxpTGVuIDsgaSsrIClcblx0XHRcdHtcblx0XHRcdFx0aU9yaWdDb2x1bW4gPSBjb2x1bW5zW2ldLl9Db2xSZW9yZGVyX2lPcmlnQ29sO1xuXG5cdFx0XHRcdC8qIENvbHVtbnMgKi9cblx0XHRcdFx0b1N0YXRlLmNvbHVtbnNbIGlPcmlnQ29sdW1uIF0gPSBzdGF0ZUNvbHVtbnNDb3B5W2ldO1xuXG5cdFx0XHRcdC8qIENvbHVtbiByZW9yZGVyaW5nICovXG5cdFx0XHRcdG9TdGF0ZS5Db2xSZW9yZGVyLnB1c2goIGlPcmlnQ29sdW1uICk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXG5cblx0LyogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKlxuXHQgKiBNb3VzZSBkcm9wIGFuZCBkcmFnXG5cdCAqL1xuXG5cdC8qKlxuXHQgKiBBZGQgYSBtb3VzZSBkb3duIGxpc3RlbmVyIHRvIGEgcGFydGljbHVhciBUSCBlbGVtZW50XG5cdCAqICBAbWV0aG9kICBfZm5Nb3VzZUxpc3RlbmVyXG5cdCAqICBAcGFyYW0gICBpbnQgaSBDb2x1bW4gaW5kZXhcblx0ICogIEBwYXJhbSAgIGVsZW1lbnQgblRoIFRIIGVsZW1lbnQgY2xpY2tlZCBvblxuXHQgKiAgQHJldHVybnMgdm9pZFxuXHQgKiAgQHByaXZhdGVcblx0ICovXG5cdFwiX2ZuTW91c2VMaXN0ZW5lclwiOiBmdW5jdGlvbiAoIGksIG5UaCApXG5cdHtcblx0XHR2YXIgdGhhdCA9IHRoaXM7XG5cdFx0JChuVGgpXG5cdFx0XHQub24oICdtb3VzZWRvd24uQ29sUmVvcmRlcicsIGZ1bmN0aW9uIChlKSB7XG5cdFx0XHRcdGlmICggdGhhdC5zLmVuYWJsZSAmJiBlLndoaWNoID09PSAxICkge1xuXHRcdFx0XHRcdHRoYXQuX2ZuTW91c2VEb3duLmNhbGwoIHRoYXQsIGUsIG5UaCApO1xuXHRcdFx0XHR9XG5cdFx0XHR9IClcblx0XHRcdC5vbiggJ3RvdWNoc3RhcnQuQ29sUmVvcmRlcicsIGZ1bmN0aW9uIChlKSB7XG5cdFx0XHRcdGlmICggdGhhdC5zLmVuYWJsZSApIHtcblx0XHRcdFx0XHR0aGF0Ll9mbk1vdXNlRG93bi5jYWxsKCB0aGF0LCBlLCBuVGggKTtcblx0XHRcdFx0fVxuXHRcdFx0fSApO1xuXHR9LFxuXG5cblx0LyoqXG5cdCAqIE1vdXNlIGRvd24gb24gYSBUSCBlbGVtZW50IGluIHRoZSB0YWJsZSBoZWFkZXJcblx0ICogIEBtZXRob2QgIF9mbk1vdXNlRG93blxuXHQgKiAgQHBhcmFtICAgZXZlbnQgZSBNb3VzZSBldmVudFxuXHQgKiAgQHBhcmFtICAgZWxlbWVudCBuVGggVEggZWxlbWVudCB0byBiZSBkcmFnZ2VkXG5cdCAqICBAcmV0dXJucyB2b2lkXG5cdCAqICBAcHJpdmF0ZVxuXHQgKi9cblx0XCJfZm5Nb3VzZURvd25cIjogZnVuY3Rpb24gKCBlLCBuVGggKVxuXHR7XG5cdFx0dmFyIHRoYXQgPSB0aGlzO1xuXG5cdFx0LyogU3RvcmUgaW5mb3JtYXRpb24gYWJvdXQgdGhlIG1vdXNlIHBvc2l0aW9uICovXG5cdFx0dmFyIHRhcmdldCA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJ3RoLCB0ZCcpO1xuXHRcdHZhciBvZmZzZXQgPSB0YXJnZXQub2Zmc2V0KCk7XG5cdFx0dmFyIGlkeCA9IHBhcnNlSW50KCAkKG5UaCkuYXR0cignZGF0YS1jb2x1bW4taW5kZXgnKSwgMTAgKTtcblxuXHRcdGlmICggaWR4ID09PSB1bmRlZmluZWQgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dGhpcy5zLm1vdXNlLnN0YXJ0WCA9IHRoaXMuX2ZuQ3Vyc29yUG9zaXRpb24oIGUsICdwYWdlWCcgKTtcblx0XHR0aGlzLnMubW91c2Uuc3RhcnRZID0gdGhpcy5fZm5DdXJzb3JQb3NpdGlvbiggZSwgJ3BhZ2VZJyApO1xuXHRcdHRoaXMucy5tb3VzZS5vZmZzZXRYID0gdGhpcy5fZm5DdXJzb3JQb3NpdGlvbiggZSwgJ3BhZ2VYJyApIC0gb2Zmc2V0LmxlZnQ7XG5cdFx0dGhpcy5zLm1vdXNlLm9mZnNldFkgPSB0aGlzLl9mbkN1cnNvclBvc2l0aW9uKCBlLCAncGFnZVknICkgLSBvZmZzZXQudG9wO1xuXHRcdHRoaXMucy5tb3VzZS50YXJnZXQgPSB0aGlzLnMuZHQuYW9Db2x1bW5zWyBpZHggXS5uVGg7Ly90YXJnZXRbMF07XG5cdFx0dGhpcy5zLm1vdXNlLnRhcmdldEluZGV4ID0gaWR4O1xuXHRcdHRoaXMucy5tb3VzZS5mcm9tSW5kZXggPSBpZHg7XG5cblx0XHR0aGlzLl9mblJlZ2lvbnMoKTtcblxuXHRcdC8qIEFkZCBldmVudCBoYW5kbGVycyB0byB0aGUgZG9jdW1lbnQgKi9cblx0XHQkKGRvY3VtZW50KVxuXHRcdFx0Lm9uKCAnbW91c2Vtb3ZlLkNvbFJlb3JkZXIgdG91Y2htb3ZlLkNvbFJlb3JkZXInLCBmdW5jdGlvbiAoZSkge1xuXHRcdFx0XHR0aGF0Ll9mbk1vdXNlTW92ZS5jYWxsKCB0aGF0LCBlICk7XG5cdFx0XHR9IClcblx0XHRcdC5vbiggJ21vdXNldXAuQ29sUmVvcmRlciB0b3VjaGVuZC5Db2xSZW9yZGVyJywgZnVuY3Rpb24gKGUpIHtcblx0XHRcdFx0dGhhdC5fZm5Nb3VzZVVwLmNhbGwoIHRoYXQsIGUgKTtcblx0XHRcdH0gKTtcblx0fSxcblxuXG5cdC8qKlxuXHQgKiBEZWFsIHdpdGggYSBtb3VzZSBtb3ZlIGV2ZW50IHdoaWxlIGRyYWdnaW5nIGEgbm9kZVxuXHQgKiAgQG1ldGhvZCAgX2ZuTW91c2VNb3ZlXG5cdCAqICBAcGFyYW0gICBldmVudCBlIE1vdXNlIGV2ZW50XG5cdCAqICBAcmV0dXJucyB2b2lkXG5cdCAqICBAcHJpdmF0ZVxuXHQgKi9cblx0XCJfZm5Nb3VzZU1vdmVcIjogZnVuY3Rpb24gKCBlIClcblx0e1xuXHRcdHZhciB0aGF0ID0gdGhpcztcblxuXHRcdGlmICggdGhpcy5kb20uZHJhZyA9PT0gbnVsbCApXG5cdFx0e1xuXHRcdFx0LyogT25seSBjcmVhdGUgdGhlIGRyYWcgZWxlbWVudCBpZiB0aGUgbW91c2UgaGFzIG1vdmVkIGEgc3BlY2lmaWMgZGlzdGFuY2UgZnJvbSB0aGUgc3RhcnRcblx0XHRcdCAqIHBvaW50IC0gdGhpcyBhbGxvd3MgdGhlIHVzZXIgdG8gbWFrZSBzbWFsbCBtb3VzZSBtb3ZlbWVudHMgd2hlbiBzb3J0aW5nIGFuZCBub3QgaGF2ZSBhXG5cdFx0XHQgKiBwb3NzaWJseSBjb25mdXNpbmcgZHJhZyBlbGVtZW50IHNob3dpbmcgdXBcblx0XHRcdCAqL1xuXHRcdFx0aWYgKCBNYXRoLnBvdyhcblx0XHRcdFx0TWF0aC5wb3codGhpcy5fZm5DdXJzb3JQb3NpdGlvbiggZSwgJ3BhZ2VYJykgLSB0aGlzLnMubW91c2Uuc3RhcnRYLCAyKSArXG5cdFx0XHRcdE1hdGgucG93KHRoaXMuX2ZuQ3Vyc29yUG9zaXRpb24oIGUsICdwYWdlWScpIC0gdGhpcy5zLm1vdXNlLnN0YXJ0WSwgMiksIDAuNSApIDwgNSApXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdHRoaXMuX2ZuQ3JlYXRlRHJhZ05vZGUoKTtcblx0XHR9XG5cblx0XHQvKiBQb3NpdGlvbiB0aGUgZWxlbWVudCAtIHdlIHJlc3BlY3Qgd2hlcmUgaW4gdGhlIGVsZW1lbnQgdGhlIGNsaWNrIG9jY3VyZWQgKi9cblx0XHR0aGlzLmRvbS5kcmFnLmNzcygge1xuXHRcdFx0bGVmdDogdGhpcy5fZm5DdXJzb3JQb3NpdGlvbiggZSwgJ3BhZ2VYJyApIC0gdGhpcy5zLm1vdXNlLm9mZnNldFgsXG5cdFx0XHR0b3A6IHRoaXMuX2ZuQ3Vyc29yUG9zaXRpb24oIGUsICdwYWdlWScgKSAtIHRoaXMucy5tb3VzZS5vZmZzZXRZXG5cdFx0fSApO1xuXG5cdFx0LyogQmFzZWQgb24gdGhlIGN1cnJlbnQgbW91c2UgcG9zaXRpb24sIGNhbGN1bGF0ZSB3aGVyZSB0aGUgaW5zZXJ0IHNob3VsZCBnbyAqL1xuXHRcdHZhciB0YXJnZXQ7XG5cdFx0dmFyIGxhc3RUb0luZGV4ID0gdGhpcy5zLm1vdXNlLnRvSW5kZXg7XG5cdFx0dmFyIGN1cnNvclhQb3Npb3Rpb24gPSB0aGlzLl9mbkN1cnNvclBvc2l0aW9uKGUsICdwYWdlWCcpO1xuXHRcdHZhciB0YXJnZXRzUHJldiA9IGZ1bmN0aW9uIChpKSB7XG5cdFx0XHR3aGlsZSAoaSA+PSAwKSB7XG5cdFx0XHRcdGktLTtcblxuXHRcdFx0XHRpZiAoaSA8PSAwKSB7XG5cdFx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAodGhhdC5zLmFvVGFyZ2V0c1tpKzFdLnggIT09IHRoYXQucy5hb1RhcmdldHNbaV0ueCkge1xuXHRcdFx0XHRcdHJldHVybiB0aGF0LnMuYW9UYXJnZXRzW2ldO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fTtcblx0XHR2YXIgZmlyc3ROb3RIaWRkZW4gPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRmb3IgKHZhciBpPTAgOyBpPHRoYXQucy5hb1RhcmdldHMubGVuZ3RoLTEgOyBpKyspIHtcblx0XHRcdFx0aWYgKHRoYXQucy5hb1RhcmdldHNbaV0ueCAhPT0gdGhhdC5zLmFvVGFyZ2V0c1tpKzFdLngpIHtcblx0XHRcdFx0XHRyZXR1cm4gdGhhdC5zLmFvVGFyZ2V0c1tpXTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH07XG5cdFx0dmFyIGxhc3ROb3RIaWRkZW4gPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRmb3IgKHZhciBpPXRoYXQucy5hb1RhcmdldHMubGVuZ3RoLTEgOyBpPjAgOyBpLS0pIHtcblx0XHRcdFx0aWYgKHRoYXQucy5hb1RhcmdldHNbaV0ueCAhPT0gdGhhdC5zLmFvVGFyZ2V0c1tpLTFdLngpIHtcblx0XHRcdFx0XHRyZXR1cm4gdGhhdC5zLmFvVGFyZ2V0c1tpXTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH07XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCB0aGlzLnMuYW9UYXJnZXRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgcHJldlRhcmdldCA9IHRhcmdldHNQcmV2KGkpO1xuXHRcdFx0aWYgKCEgcHJldlRhcmdldCkge1xuXHRcdFx0XHRwcmV2VGFyZ2V0ID0gZmlyc3ROb3RIaWRkZW4oKTtcblx0XHRcdH1cblxuXHRcdFx0dmFyIHByZXZUYXJnZXRNaWRkbGUgPSBwcmV2VGFyZ2V0LnggKyAodGhpcy5zLmFvVGFyZ2V0c1tpXS54IC0gcHJldlRhcmdldC54KSAvIDI7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLl9mbklzTHRyKCkpIHtcbiAgICAgICAgICAgICAgICBpZiAoY3Vyc29yWFBvc2lvdGlvbiA8IHByZXZUYXJnZXRNaWRkbGUgKSB7XG4gICAgICAgICAgICAgICAgICAgIHRhcmdldCA9IHByZXZUYXJnZXQ7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChjdXJzb3JYUG9zaW90aW9uID4gcHJldlRhcmdldE1pZGRsZSkge1xuICAgICAgICAgICAgICAgICAgICB0YXJnZXQgPSBwcmV2VGFyZ2V0O1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cdFx0fVxuXG4gICAgICAgIGlmICh0YXJnZXQpIHtcbiAgICAgICAgICAgIHRoaXMuZG9tLnBvaW50ZXIuY3NzKCdsZWZ0JywgdGFyZ2V0LngpO1xuICAgICAgICAgICAgdGhpcy5zLm1vdXNlLnRvSW5kZXggPSB0YXJnZXQudG87XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG5cdFx0XHQvLyBUaGUgaW5zZXJ0IGVsZW1lbnQgd2Fzbid0IHBvc2l0aW9uZWQgaW4gdGhlIGFycmF5IChsZXNzIHRoYW5cblx0XHRcdC8vIG9wZXJhdG9yKSwgc28gd2UgcHV0IGl0IGF0IHRoZSBlbmRcblx0XHRcdHRoaXMuZG9tLnBvaW50ZXIuY3NzKCAnbGVmdCcsIGxhc3ROb3RIaWRkZW4oKS54ICk7XG5cdFx0XHR0aGlzLnMubW91c2UudG9JbmRleCA9IGxhc3ROb3RIaWRkZW4oKS50bztcblx0XHR9XG5cblx0XHQvLyBQZXJmb3JtIHJlb3JkZXJpbmcgaWYgcmVhbHRpbWUgdXBkYXRpbmcgaXMgb24gYW5kIHRoZSBjb2x1bW4gaGFzIG1vdmVkXG5cdFx0aWYgKCB0aGlzLnMuaW5pdC5iUmVhbHRpbWUgJiYgbGFzdFRvSW5kZXggIT09IHRoaXMucy5tb3VzZS50b0luZGV4ICkge1xuXHRcdFx0dGhpcy5zLmR0Lm9JbnN0YW5jZS5mbkNvbFJlb3JkZXIoIHRoaXMucy5tb3VzZS5mcm9tSW5kZXgsIHRoaXMucy5tb3VzZS50b0luZGV4ICk7XG5cdFx0XHR0aGlzLnMubW91c2UuZnJvbUluZGV4ID0gdGhpcy5zLm1vdXNlLnRvSW5kZXg7XG5cblx0XHRcdC8vIE5vdCBncmVhdCBmb3IgcGVyZm9ybWFuY2UsIGJ1dCByZXF1aXJlZCB0byBrZWVwIGV2ZXJ5dGhpbmcgaW4gYWxpZ25tZW50XG5cdFx0XHRpZiAoIHRoaXMucy5kdC5vU2Nyb2xsLnNYICE9PSBcIlwiIHx8IHRoaXMucy5kdC5vU2Nyb2xsLnNZICE9PSBcIlwiIClcblx0XHRcdHtcblx0XHRcdFx0dGhpcy5zLmR0Lm9JbnN0YW5jZS5mbkFkanVzdENvbHVtblNpemluZyggZmFsc2UgKTtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5fZm5SZWdpb25zKCk7XG5cdFx0fVxuXHR9LFxuXG5cblx0LyoqXG5cdCAqIEZpbmlzaCBvZmYgdGhlIG1vdXNlIGRyYWcgYW5kIGluc2VydCB0aGUgY29sdW1uIHdoZXJlIG5lZWRlZFxuXHQgKiAgQG1ldGhvZCAgX2ZuTW91c2VVcFxuXHQgKiAgQHBhcmFtICAgZXZlbnQgZSBNb3VzZSBldmVudFxuXHQgKiAgQHJldHVybnMgdm9pZFxuXHQgKiAgQHByaXZhdGVcblx0ICovXG5cdFwiX2ZuTW91c2VVcFwiOiBmdW5jdGlvbiAoIGUgKVxuXHR7XG5cdFx0dmFyIHRoYXQgPSB0aGlzO1xuXG5cdFx0JChkb2N1bWVudCkub2ZmKCAnLkNvbFJlb3JkZXInICk7XG5cblx0XHRpZiAoIHRoaXMuZG9tLmRyYWcgIT09IG51bGwgKVxuXHRcdHtcblx0XHRcdC8qIFJlbW92ZSB0aGUgZ3VpZGUgZWxlbWVudHMgKi9cblx0XHRcdHRoaXMuZG9tLmRyYWcucmVtb3ZlKCk7XG5cdFx0XHR0aGlzLmRvbS5wb2ludGVyLnJlbW92ZSgpO1xuXHRcdFx0dGhpcy5kb20uZHJhZyA9IG51bGw7XG5cdFx0XHR0aGlzLmRvbS5wb2ludGVyID0gbnVsbDtcblxuXHRcdFx0LyogQWN0dWFsbHkgZG8gdGhlIHJlb3JkZXIgKi9cblx0XHRcdHRoaXMucy5kdC5vSW5zdGFuY2UuZm5Db2xSZW9yZGVyKCB0aGlzLnMubW91c2UuZnJvbUluZGV4LCB0aGlzLnMubW91c2UudG9JbmRleCwgdHJ1ZSApO1xuXHRcdFx0dGhpcy5fZm5TZXRDb2x1bW5JbmRleGVzKCk7XG5cblx0XHRcdC8qIFdoZW4gc2Nyb2xsaW5nIHdlIG5lZWQgdG8gcmVjYWxjdWxhdGUgdGhlIGNvbHVtbiBzaXplcyB0byBhbGxvdyBmb3IgdGhlIHNoaWZ0ICovXG5cdFx0XHRpZiAoIHRoaXMucy5kdC5vU2Nyb2xsLnNYICE9PSBcIlwiIHx8IHRoaXMucy5kdC5vU2Nyb2xsLnNZICE9PSBcIlwiIClcblx0XHRcdHtcblx0XHRcdFx0dGhpcy5zLmR0Lm9JbnN0YW5jZS5mbkFkanVzdENvbHVtblNpemluZyggZmFsc2UgKTtcblx0XHRcdH1cblxuXHRcdFx0LyogU2F2ZSB0aGUgc3RhdGUgKi9cblx0XHRcdHRoaXMucy5kdC5vSW5zdGFuY2Uub0FwaS5fZm5TYXZlU3RhdGUoIHRoaXMucy5kdCApO1xuXG5cdFx0XHRpZiAoIHRoaXMucy5yZW9yZGVyQ2FsbGJhY2sgIT09IG51bGwgKVxuXHRcdFx0e1xuXHRcdFx0XHR0aGlzLnMucmVvcmRlckNhbGxiYWNrLmNhbGwoIHRoaXMgKTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cblxuXHQvKipcblx0ICogQ2FsY3VsYXRlIGEgY2FjaGVkIGFycmF5IHdpdGggdGhlIHBvaW50cyBvZiB0aGUgY29sdW1uIGluc2VydHMsIGFuZCB0aGVcblx0ICogJ3RvJyBwb2ludHNcblx0ICogIEBtZXRob2QgIF9mblJlZ2lvbnNcblx0ICogIEByZXR1cm5zIHZvaWRcblx0ICogIEBwcml2YXRlXG5cdCAqL1xuXHRcIl9mblJlZ2lvbnNcIjogZnVuY3Rpb24gKClcblx0e1xuXHRcdHZhciBhb0NvbHVtbnMgPSB0aGlzLnMuZHQuYW9Db2x1bW5zO1xuICAgICAgICB2YXIgaXNMVFIgPSB0aGlzLl9mbklzTHRyKCk7XG5cdFx0dGhpcy5zLmFvVGFyZ2V0cy5zcGxpY2UoMCwgdGhpcy5zLmFvVGFyZ2V0cy5sZW5ndGgpO1xuXHRcdHZhciBsYXN0Qm91bmQgPSAkKHRoaXMucy5kdC5uVGFibGUpLm9mZnNldCgpLmxlZnQ7XG5cbiAgICAgICAgdmFyIGFvQ29sdW1uQm91bmRzID0gW107XG4gICAgICAgICQuZWFjaChhb0NvbHVtbnMsIGZ1bmN0aW9uIChpLCBjb2x1bW4pIHtcbiAgICAgICAgICAgIGlmIChjb2x1bW4uYlZpc2libGUgJiYgY29sdW1uLm5UaC5zdHlsZS5kaXNwbGF5ICE9PSAnbm9uZScpIHtcbiAgICAgICAgICAgICAgICB2YXIgbnRoID0gJChjb2x1bW4ublRoKTtcblx0XHRcdFx0dmFyIGJvdW5kID0gbnRoLm9mZnNldCgpLmxlZnQ7XG5cbiAgICAgICAgICAgICAgICBpZiAoaXNMVFIpIHtcbiAgICAgICAgICAgICAgICAgICAgYm91bmQgKz0gbnRoLm91dGVyV2lkdGgoKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBhb0NvbHVtbkJvdW5kcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgaW5kZXg6IGksXG4gICAgICAgICAgICAgICAgICAgIGJvdW5kOiBib3VuZFxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRsYXN0Qm91bmQgPSBib3VuZDtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuICAgICAgICAgICAgICAgIGFvQ29sdW1uQm91bmRzLnB1c2goe1xuXHRcdFx0XHRcdGluZGV4OiBpLFxuXHRcdFx0XHRcdGJvdW5kOiBsYXN0Qm91bmRcbiAgICAgICAgICAgICAgICB9KTtcblx0XHRcdH1cblx0XHR9KTtcblxuICAgICAgICB2YXIgZmlyc3RDb2x1bW4gPSBhb0NvbHVtbkJvdW5kc1swXTtcblx0XHR2YXIgZmlyc3RDb2x1bW5XaWR0aCA9ICQoYW9Db2x1bW5zW2ZpcnN0Q29sdW1uLmluZGV4XS5uVGgpLm91dGVyV2lkdGgoKTtcblxuICAgICAgICB0aGlzLnMuYW9UYXJnZXRzLnB1c2goe1xuICAgICAgICAgICAgdG86IDAsXG5cdFx0XHR4OiBmaXJzdENvbHVtbi5ib3VuZCAtIGZpcnN0Q29sdW1uV2lkdGhcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhb0NvbHVtbkJvdW5kcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIGNvbHVtbkJvdW5kID0gYW9Db2x1bW5Cb3VuZHNbaV07XG4gICAgICAgICAgICB2YXIgaVRvUG9pbnQgPSBjb2x1bW5Cb3VuZC5pbmRleDtcblxuICAgICAgICAgICAgLyogRm9yIHRoZSBjb2x1bW4gLyBoZWFkZXIgaW4gcXVlc3Rpb24sIHdlIHdhbnQgaXQncyBwb3NpdGlvbiB0byByZW1haW4gdGhlIHNhbWUgaWYgdGhlXG4gICAgICAgICAgICAqIHBvc2l0aW9uIGlzIGp1c3QgdG8gaXQncyBpbW1lZGlhdGUgbGVmdCBvciByaWdodCwgc28gd2Ugb25seSBpbmNyZW1lbnQgdGhlIGNvdW50ZXIgZm9yXG4gICAgICAgICAgICAqIG90aGVyIGNvbHVtbnNcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICBpZiAoY29sdW1uQm91bmQuaW5kZXggPCB0aGlzLnMubW91c2UuZnJvbUluZGV4KSB7XG4gICAgICAgICAgICAgICAgaVRvUG9pbnQrKztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5zLmFvVGFyZ2V0cy5wdXNoKHtcblx0XHRcdFx0dG86IGlUb1BvaW50LFxuICAgICAgICAgICAgICAgIHg6IGNvbHVtbkJvdW5kLmJvdW5kXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG5cdFx0LyogRGlzYWxsb3cgY29sdW1ucyBmb3IgYmVpbmcgcmVvcmRlcmVkIGJ5IGRyYWcgYW5kIGRyb3AsIGNvdW50aW5nIHJpZ2h0IHRvIGxlZnQgKi9cblx0XHRpZiAoIHRoaXMucy5maXhlZFJpZ2h0ICE9PSAwIClcblx0XHR7XG5cdFx0XHR0aGlzLnMuYW9UYXJnZXRzLnNwbGljZSggdGhpcy5zLmFvVGFyZ2V0cy5sZW5ndGggLSB0aGlzLnMuZml4ZWRSaWdodCApO1xuXHRcdH1cblxuXHRcdC8qIERpc2FsbG93IGNvbHVtbnMgZm9yIGJlaW5nIHJlb3JkZXJlZCBieSBkcmFnIGFuZCBkcm9wLCBjb3VudGluZyBsZWZ0IHRvIHJpZ2h0ICovXG5cdFx0aWYgKCB0aGlzLnMuZml4ZWQgIT09IDAgKVxuXHRcdHtcblx0XHRcdHRoaXMucy5hb1RhcmdldHMuc3BsaWNlKCAwLCB0aGlzLnMuZml4ZWQgKTtcblx0XHR9XG5cdH0sXG5cblxuXHQvKipcblx0ICogQ29weSB0aGUgVEggZWxlbWVudCB0aGF0IGlzIGJlaW5nIGRyYWdzIHNvIHRoZSB1c2VyIGhhcyB0aGUgaWRlYSB0aGF0IHRoZXkgYXJlIGFjdHVhbGx5XG5cdCAqIG1vdmluZyBpdCBhcm91bmQgdGhlIHBhZ2UuXG5cdCAqICBAbWV0aG9kICBfZm5DcmVhdGVEcmFnTm9kZVxuXHQgKiAgQHJldHVybnMgdm9pZFxuXHQgKiAgQHByaXZhdGVcblx0ICovXG5cdFwiX2ZuQ3JlYXRlRHJhZ05vZGVcIjogZnVuY3Rpb24gKClcblx0e1xuXHRcdHZhciBzY3JvbGxpbmcgPSB0aGlzLnMuZHQub1Njcm9sbC5zWCAhPT0gXCJcIiB8fCB0aGlzLnMuZHQub1Njcm9sbC5zWSAhPT0gXCJcIjtcblxuXHRcdHZhciBvcmlnQ2VsbCA9IHRoaXMucy5kdC5hb0NvbHVtbnNbIHRoaXMucy5tb3VzZS50YXJnZXRJbmRleCBdLm5UaDtcblx0XHR2YXIgb3JpZ1RyID0gb3JpZ0NlbGwucGFyZW50Tm9kZTtcblx0XHR2YXIgb3JpZ1RoZWFkID0gb3JpZ1RyLnBhcmVudE5vZGU7XG5cdFx0dmFyIG9yaWdUYWJsZSA9IG9yaWdUaGVhZC5wYXJlbnROb2RlO1xuXHRcdHZhciBjbG9uZUNlbGwgPSAkKG9yaWdDZWxsKS5jbG9uZSgpO1xuXG5cdFx0Ly8gVGhpcyBpcyBhIHNsaWdodGx5IG9kZCBjb21iaW5hdGlvbiBvZiBqUXVlcnkgYW5kIERPTSwgYnV0IGl0IGlzIHRoZVxuXHRcdC8vIGZhc3Rlc3QgYW5kIGxlYXN0IHJlc291cmNlIGludGVuc2l2ZSB3YXkgSSBjb3VsZCB0aGluayBvZiBjbG9uaW5nXG5cdFx0Ly8gdGhlIHRhYmxlIHdpdGgganVzdCBhIHNpbmdsZSBoZWFkZXIgY2VsbCBpbiBpdC5cblx0XHR0aGlzLmRvbS5kcmFnID0gJChvcmlnVGFibGUuY2xvbmVOb2RlKGZhbHNlKSlcblx0XHRcdC5hZGRDbGFzcyggJ0RUQ1JfY2xvbmVkVGFibGUnIClcblx0XHRcdC5hcHBlbmQoXG5cdFx0XHRcdCQob3JpZ1RoZWFkLmNsb25lTm9kZShmYWxzZSkpLmFwcGVuZChcblx0XHRcdFx0XHQkKG9yaWdUci5jbG9uZU5vZGUoZmFsc2UpKS5hcHBlbmQoXG5cdFx0XHRcdFx0XHRjbG9uZUNlbGxbMF1cblx0XHRcdFx0XHQpXG5cdFx0XHRcdClcblx0XHRcdClcblx0XHRcdC5jc3MoIHtcblx0XHRcdFx0cG9zaXRpb246ICdhYnNvbHV0ZScsXG5cdFx0XHRcdHRvcDogMCxcblx0XHRcdFx0bGVmdDogMCxcblx0XHRcdFx0d2lkdGg6ICQob3JpZ0NlbGwpLm91dGVyV2lkdGgoKSxcblx0XHRcdFx0aGVpZ2h0OiAkKG9yaWdDZWxsKS5vdXRlckhlaWdodCgpXG5cdFx0XHR9IClcblx0XHRcdC5hcHBlbmRUbyggJ2JvZHknICk7XG5cblx0XHR0aGlzLmRvbS5wb2ludGVyID0gJCgnPGRpdj48L2Rpdj4nKVxuXHRcdFx0LmFkZENsYXNzKCAnRFRDUl9wb2ludGVyJyApXG5cdFx0XHQuY3NzKCB7XG5cdFx0XHRcdHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuXHRcdFx0XHR0b3A6IHNjcm9sbGluZyA/XG5cdFx0XHRcdFx0JCgnZGl2LmRhdGFUYWJsZXNfc2Nyb2xsJywgdGhpcy5zLmR0Lm5UYWJsZVdyYXBwZXIpLm9mZnNldCgpLnRvcCA6XG5cdFx0XHRcdFx0JCh0aGlzLnMuZHQublRhYmxlKS5vZmZzZXQoKS50b3AsXG5cdFx0XHRcdGhlaWdodCA6IHNjcm9sbGluZyA/XG5cdFx0XHRcdFx0JCgnZGl2LmRhdGFUYWJsZXNfc2Nyb2xsJywgdGhpcy5zLmR0Lm5UYWJsZVdyYXBwZXIpLmhlaWdodCgpIDpcblx0XHRcdFx0XHQkKHRoaXMucy5kdC5uVGFibGUpLmhlaWdodCgpXG5cdFx0XHR9IClcblx0XHRcdC5hcHBlbmRUbyggJ2JvZHknICk7XG5cdH0sXG5cblxuXHQvKipcblx0ICogQWRkIGEgZGF0YSBhdHRyaWJ1dGUgdG8gdGhlIGNvbHVtbiBoZWFkZXJzLCBzbyB3ZSBrbm93IHRoZSBpbmRleCBvZlxuXHQgKiB0aGUgcm93IHRvIGJlIHJlb3JkZXJlZC4gVGhpcyBhbGxvd3MgZmFzdCBkZXRlY3Rpb24gb2YgdGhlIGluZGV4LCBhbmRcblx0ICogZm9yIHRoaXMgcGx1Zy1pbiB0byB3b3JrIHdpdGggRml4ZWRIZWFkZXIgd2hpY2ggY2xvbmVzIHRoZSBub2Rlcy5cblx0ICogIEBwcml2YXRlXG5cdCAqL1xuXHRcIl9mblNldENvbHVtbkluZGV4ZXNcIjogZnVuY3Rpb24gKClcblx0e1xuXHRcdCQuZWFjaCggdGhpcy5zLmR0LmFvQ29sdW1ucywgZnVuY3Rpb24gKGksIGNvbHVtbikge1xuXHRcdFx0JChjb2x1bW4ublRoKS5hdHRyKCdkYXRhLWNvbHVtbi1pbmRleCcsIGkpO1xuXHRcdH0gKTtcblx0fSxcblxuXG5cdC8qKlxuXHQgKiBHZXQgY3Vyc29yIHBvc2l0aW9uIHJlZ2FyZGxlc3Mgb2YgbW91c2Ugb3IgdG91Y2ggaW5wdXRcblx0ICogQHBhcmFtICB7RXZlbnR9ICBlICAgIGpRdWVyeSBFdmVudFxuXHQgKiBAcGFyYW0gIHtzdHJpbmd9IHByb3AgUHJvcGVydHkgdG8gZ2V0XG5cdCAqIEByZXR1cm4ge251bWJlcn0gICAgICBWYWx1ZVxuXHQgKi9cblx0X2ZuQ3Vyc29yUG9zaXRpb246IGZ1bmN0aW9uICggZSwgcHJvcCApIHtcblx0XHRpZiAoIGUudHlwZS5pbmRleE9mKCd0b3VjaCcpICE9PSAtMSApIHtcblx0XHRcdHJldHVybiBlLm9yaWdpbmFsRXZlbnQudG91Y2hlc1swXVsgcHJvcCBdO1xuXHRcdH1cblx0XHRyZXR1cm4gZVsgcHJvcCBdO1xuICAgIH0sXG5cbiAgICBfZm5Jc0x0cjogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gJCh0aGlzLnMuZHQublRhYmxlKS5jc3MoJ2RpcmVjdGlvbicpICE9PSBcInJ0bFwiO1xuICAgIH1cbn0gKTtcblxuXG5cblxuXG4vKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICpcbiAqIFN0YXRpYyBwYXJhbWV0ZXJzXG4gKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICovXG5cblxuLyoqXG4gKiBDb2xSZW9yZGVyIGRlZmF1bHQgc2V0dGluZ3MgZm9yIGluaXRpYWxpc2F0aW9uXG4gKiAgQG5hbWVzcGFjZVxuICogIEBzdGF0aWNcbiAqL1xuQ29sUmVvcmRlci5kZWZhdWx0cyA9IHtcblx0LyoqXG5cdCAqIFByZWRlZmluZWQgb3JkZXJpbmcgZm9yIHRoZSBjb2x1bW5zIHRoYXQgd2lsbCBiZSBhcHBsaWVkIGF1dG9tYXRpY2FsbHlcblx0ICogb24gaW5pdGlhbGlzYXRpb24uIElmIG5vdCBzcGVjaWZpZWQgdGhlbiB0aGUgb3JkZXIgdGhhdCB0aGUgY29sdW1ucyBhcmVcblx0ICogZm91bmQgdG8gYmUgaW4gdGhlIEhUTUwgaXMgdGhlIG9yZGVyIHVzZWQuXG5cdCAqICBAdHlwZSBhcnJheVxuXHQgKiAgQGRlZmF1bHQgbnVsbFxuXHQgKiAgQHN0YXRpY1xuXHQgKi9cblx0YWlPcmRlcjogbnVsbCxcblxuXHQvKipcblx0ICogQ29sUmVvcmRlciBlbmFibGUgb24gaW5pdGlhbGlzYXRpb25cblx0ICogIEB0eXBlIGJvb2xlYW5cblx0ICogIEBkZWZhdWx0IHRydWVcblx0ICogIEBzdGF0aWNcblx0ICovXG5cdGJFbmFibGU6IHRydWUsXG5cblx0LyoqXG5cdCAqIFJlZHJhdyB0aGUgdGFibGUncyBjb2x1bW4gb3JkZXJpbmcgYXMgdGhlIGVuZCB1c2VyIGRyYXdzIHRoZSBjb2x1bW5cblx0ICogKGB0cnVlYCkgb3Igd2FpdCB1bnRpbCB0aGUgbW91c2UgaXMgcmVsZWFzZWQgKGBmYWxzZWAgLSBkZWZhdWx0KS4gTm90ZVxuXHQgKiB0aGF0IHRoaXMgd2lsbCBwZXJmb3JtIGEgcmVkcmF3IG9uIGVhY2ggcmVvcmRlcmluZywgd2hpY2ggaW52b2x2ZXMgYW5cblx0ICogQWpheCByZXF1ZXN0IGVhY2ggdGltZSBpZiB5b3UgYXJlIHVzaW5nIHNlcnZlci1zaWRlIHByb2Nlc3NpbmcgaW5cblx0ICogRGF0YVRhYmxlcy5cblx0ICogIEB0eXBlIGJvb2xlYW5cblx0ICogIEBkZWZhdWx0IGZhbHNlXG5cdCAqICBAc3RhdGljXG5cdCAqL1xuXHRiUmVhbHRpbWU6IHRydWUsXG5cblx0LyoqXG5cdCAqIEluZGljYXRlIGhvdyBtYW55IGNvbHVtbnMgc2hvdWxkIGJlIGZpeGVkIGluIHBvc2l0aW9uIChjb3VudGluZyBmcm9tIHRoZVxuXHQgKiBsZWZ0KS4gVGhpcyB3aWxsIHR5cGljYWxseSBiZSAxIGlmIHVzZWQsIGJ1dCBjYW4gYmUgYXMgaGlnaCBhcyB5b3UgbGlrZS5cblx0ICogIEB0eXBlIGludFxuXHQgKiAgQGRlZmF1bHQgMFxuXHQgKiAgQHN0YXRpY1xuXHQgKi9cblx0aUZpeGVkQ29sdW1uc0xlZnQ6IDAsXG5cblx0LyoqXG5cdCAqIEFzIGBpRml4ZWRDb2x1bW5zUmlnaHRgIGJ1dCBjb3VudGluZyBmcm9tIHRoZSByaWdodC5cblx0ICogIEB0eXBlIGludFxuXHQgKiAgQGRlZmF1bHQgMFxuXHQgKiAgQHN0YXRpY1xuXHQgKi9cblx0aUZpeGVkQ29sdW1uc1JpZ2h0OiAwLFxuXG5cdC8qKlxuXHQgKiBDYWxsYmFjayBmdW5jdGlvbiB0aGF0IGlzIGZpcmVkIHdoZW4gY29sdW1ucyBhcmUgcmVvcmRlcmVkLiBUaGUgYGNvbHVtbi1cblx0ICogcmVvcmRlcmAgZXZlbnQgaXMgcHJlZmVycmVkIG92ZXIgdGhpcyBjYWxsYmFja1xuXHQgKiAgQHR5cGUgZnVuY3Rpb24oKTp2b2lkXG5cdCAqICBAZGVmYXVsdCBudWxsXG5cdCAqICBAc3RhdGljXG5cdCAqL1xuXHRmblJlb3JkZXJDYWxsYmFjazogbnVsbFxufTtcblxuXG5cbi8qICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKlxuICogQ29uc3RhbnRzXG4gKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICovXG5cbi8qKlxuICogQ29sUmVvcmRlciB2ZXJzaW9uXG4gKiAgQGNvbnN0YW50ICB2ZXJzaW9uXG4gKiAgQHR5cGUgICAgICBTdHJpbmdcbiAqICBAZGVmYXVsdCAgIEFzIGNvZGVcbiAqL1xuQ29sUmVvcmRlci52ZXJzaW9uID0gXCIxLjUuMlwiO1xuXG5cblxuLyogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqXG4gKiBEYXRhVGFibGVzIGludGVyZmFjZXNcbiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKi9cblxuLy8gRXhwb3NlXG4kLmZuLmRhdGFUYWJsZS5Db2xSZW9yZGVyID0gQ29sUmVvcmRlcjtcbiQuZm4uRGF0YVRhYmxlLkNvbFJlb3JkZXIgPSBDb2xSZW9yZGVyO1xuXG5cbi8vIFJlZ2lzdGVyIGEgbmV3IGZlYXR1cmUgd2l0aCBEYXRhVGFibGVzXG5pZiAoIHR5cGVvZiAkLmZuLmRhdGFUYWJsZSA9PSBcImZ1bmN0aW9uXCIgJiZcbiAgICAgdHlwZW9mICQuZm4uZGF0YVRhYmxlRXh0LmZuVmVyc2lvbkNoZWNrID09IFwiZnVuY3Rpb25cIiAmJlxuICAgICAkLmZuLmRhdGFUYWJsZUV4dC5mblZlcnNpb25DaGVjaygnMS4xMC44JykgKVxue1xuXHQkLmZuLmRhdGFUYWJsZUV4dC5hb0ZlYXR1cmVzLnB1c2goIHtcblx0XHRcImZuSW5pdFwiOiBmdW5jdGlvbiggc2V0dGluZ3MgKSB7XG5cdFx0XHR2YXIgdGFibGUgPSBzZXR0aW5ncy5vSW5zdGFuY2U7XG5cblx0XHRcdGlmICggISBzZXR0aW5ncy5fY29sUmVvcmRlciApIHtcblx0XHRcdFx0dmFyIGR0SW5pdCA9IHNldHRpbmdzLm9Jbml0O1xuXHRcdFx0XHR2YXIgb3B0cyA9IGR0SW5pdC5jb2xSZW9yZGVyIHx8IGR0SW5pdC5vQ29sUmVvcmRlciB8fCB7fTtcblxuXHRcdFx0XHRuZXcgQ29sUmVvcmRlciggc2V0dGluZ3MsIG9wdHMgKTtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHR0YWJsZS5vQXBpLl9mbkxvZyggc2V0dGluZ3MsIDEsIFwiQ29sUmVvcmRlciBhdHRlbXB0ZWQgdG8gaW5pdGlhbGlzZSB0d2ljZS4gSWdub3Jpbmcgc2Vjb25kXCIgKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIG51bGw7IC8qIE5vIG5vZGUgZm9yIERhdGFUYWJsZXMgdG8gaW5zZXJ0ICovXG5cdFx0fSxcblx0XHRcImNGZWF0dXJlXCI6IFwiUlwiLFxuXHRcdFwic0ZlYXR1cmVcIjogXCJDb2xSZW9yZGVyXCJcblx0fSApO1xufVxuZWxzZSB7XG5cdGFsZXJ0KCBcIldhcm5pbmc6IENvbFJlb3JkZXIgcmVxdWlyZXMgRGF0YVRhYmxlcyAxLjEwLjggb3IgZ3JlYXRlciAtIHd3dy5kYXRhdGFibGVzLm5ldC9kb3dubG9hZFwiKTtcbn1cblxuXG4vLyBBdHRhY2ggYSBsaXN0ZW5lciB0byB0aGUgZG9jdW1lbnQgd2hpY2ggbGlzdGVucyBmb3IgRGF0YVRhYmxlcyBpbml0aWFsaXNhdGlvblxuLy8gZXZlbnRzIHNvIHdlIGNhbiBhdXRvbWF0aWNhbGx5IGluaXRpYWxpc2VcbiQoZG9jdW1lbnQpLm9uKCAncHJlSW5pdC5kdC5jb2xSZW9yZGVyJywgZnVuY3Rpb24gKGUsIHNldHRpbmdzKSB7XG5cdGlmICggZS5uYW1lc3BhY2UgIT09ICdkdCcgKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0dmFyIGluaXQgPSBzZXR0aW5ncy5vSW5pdC5jb2xSZW9yZGVyO1xuXHR2YXIgZGVmYXVsdHMgPSBEYXRhVGFibGUuZGVmYXVsdHMuY29sUmVvcmRlcjtcblxuXHRpZiAoIGluaXQgfHwgZGVmYXVsdHMgKSB7XG5cdFx0dmFyIG9wdHMgPSAkLmV4dGVuZCgge30sIGluaXQsIGRlZmF1bHRzICk7XG5cblx0XHRpZiAoIGluaXQgIT09IGZhbHNlICkge1xuXHRcdFx0bmV3IENvbFJlb3JkZXIoIHNldHRpbmdzLCBvcHRzICApO1xuXHRcdH1cblx0fVxufSApO1xuXG5cbi8vIEFQSSBhdWdtZW50YXRpb25cbiQuZm4uZGF0YVRhYmxlLkFwaS5yZWdpc3RlciggJ2NvbFJlb3JkZXIucmVzZXQoKScsIGZ1bmN0aW9uICgpIHtcblx0cmV0dXJuIHRoaXMuaXRlcmF0b3IoICd0YWJsZScsIGZ1bmN0aW9uICggY3R4ICkge1xuXHRcdGN0eC5fY29sUmVvcmRlci5mblJlc2V0KCk7XG5cdH0gKTtcbn0gKTtcblxuJC5mbi5kYXRhVGFibGUuQXBpLnJlZ2lzdGVyKCAnY29sUmVvcmRlci5vcmRlcigpJywgZnVuY3Rpb24gKCBzZXQsIG9yaWdpbmFsICkge1xuXHRpZiAoIHNldCApIHtcblx0XHRyZXR1cm4gdGhpcy5pdGVyYXRvciggJ3RhYmxlJywgZnVuY3Rpb24gKCBjdHggKSB7XG5cdFx0XHRjdHguX2NvbFJlb3JkZXIuZm5PcmRlciggc2V0LCBvcmlnaW5hbCApO1xuXHRcdH0gKTtcblx0fVxuXG5cdHJldHVybiB0aGlzLmNvbnRleHQubGVuZ3RoID9cblx0XHR0aGlzLmNvbnRleHRbMF0uX2NvbFJlb3JkZXIuZm5PcmRlcigpIDpcblx0XHRudWxsO1xufSApO1xuXG4kLmZuLmRhdGFUYWJsZS5BcGkucmVnaXN0ZXIoICdjb2xSZW9yZGVyLnRyYW5zcG9zZSgpJywgZnVuY3Rpb24gKCBpZHgsIGRpciApIHtcblx0cmV0dXJuIHRoaXMuY29udGV4dC5sZW5ndGggJiYgdGhpcy5jb250ZXh0WzBdLl9jb2xSZW9yZGVyID9cblx0XHR0aGlzLmNvbnRleHRbMF0uX2NvbFJlb3JkZXIuZm5UcmFuc3Bvc2UoIGlkeCwgZGlyICkgOlxuXHRcdGlkeDtcbn0gKTtcblxuJC5mbi5kYXRhVGFibGUuQXBpLnJlZ2lzdGVyKCAnY29sUmVvcmRlci5tb3ZlKCknLCBmdW5jdGlvbiggZnJvbSwgdG8sIGRyb3AsIGludmFsaWRhdGVSb3dzICkge1xuXHRpZiAodGhpcy5jb250ZXh0Lmxlbmd0aCkge1xuXHRcdHRoaXMuY29udGV4dFswXS5fY29sUmVvcmRlci5zLmR0Lm9JbnN0YW5jZS5mbkNvbFJlb3JkZXIoIGZyb20sIHRvLCBkcm9wLCBpbnZhbGlkYXRlUm93cyApO1xuXHRcdHRoaXMuY29udGV4dFswXS5fY29sUmVvcmRlci5fZm5TZXRDb2x1bW5JbmRleGVzKCk7XG5cdH1cblx0cmV0dXJuIHRoaXM7XG59ICk7XG5cbiQuZm4uZGF0YVRhYmxlLkFwaS5yZWdpc3RlciggJ2NvbFJlb3JkZXIuZW5hYmxlKCknLCBmdW5jdGlvbiggZmxhZyApIHtcblx0cmV0dXJuIHRoaXMuaXRlcmF0b3IoICd0YWJsZScsIGZ1bmN0aW9uICggY3R4ICkge1xuXHRcdGlmICggY3R4Ll9jb2xSZW9yZGVyICkge1xuXHRcdFx0Y3R4Ll9jb2xSZW9yZGVyLmZuRW5hYmxlKCBmbGFnICk7XG5cdFx0fVxuXHR9ICk7XG59ICk7XG5cbiQuZm4uZGF0YVRhYmxlLkFwaS5yZWdpc3RlciggJ2NvbFJlb3JkZXIuZGlzYWJsZSgpJywgZnVuY3Rpb24oKSB7XG5cdHJldHVybiB0aGlzLml0ZXJhdG9yKCAndGFibGUnLCBmdW5jdGlvbiAoIGN0eCApIHtcblx0XHRpZiAoIGN0eC5fY29sUmVvcmRlciApIHtcblx0XHRcdGN0eC5fY29sUmVvcmRlci5mbkRpc2FibGUoKTtcblx0XHR9XG5cdH0gKTtcbn0gKTtcblxuXG5yZXR1cm4gQ29sUmVvcmRlcjtcbn0pKTtcbiJdLCJzb3VyY2VSb290IjoiIn0=