(self["webpackChunkdmeta"] = self["webpackChunkdmeta"] || []).push([["npm.jquery-datatables-checkboxes"],{

/***/ "./node_modules/jquery-datatables-checkboxes/js/dataTables.checkboxes.js":
/*!*******************************************************************************!*\
  !*** ./node_modules/jquery-datatables-checkboxes/js/dataTables.checkboxes.js ***!
  \*******************************************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: __webpack_require__, __webpack_exports__, module */
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*! 
 * jQuery DataTables Checkboxes (https://www.gyrocode.com/projects/jquery-datatables-checkboxes/)
 * Checkboxes extension for jQuery DataTables
 *
 * @version     1.2.12
 * @author      Gyrocode LLC (https://www.gyrocode.com)
 * @copyright   (c) Gyrocode LLC
 * @license     MIT
 */
(function( factory ){
/* eslint-disable */
   if ( true ) {
      // AMD
      !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery-exposed.js"), __webpack_require__(/*! datatables.net */ "./node_modules/datatables.net/js/jquery.dataTables.js")], __WEBPACK_AMD_DEFINE_RESULT__ = (function ( $ ) {
         return factory( $, window, document );
      }).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
   }
   else {}
/* eslint-enable */
}(function( $, window, document ) {
   'use strict';
   var DataTable = $.fn.dataTable;


   /**
   * Checkboxes is an extension for the jQuery DataTables library that provides
   * universal solution for working with checkboxes in a table.
   *
   *  @class
   *  @param {object} settings DataTables settings object for the host table
   *  @requires jQuery 1.7+
   *  @requires DataTables 1.10.8+
   *
   *  @example
   *     $('#example').DataTable({
   *        'columnDefs': [
   *           {
   *              'targets': 0,
   *              'checkboxes': true
   *           }
   *        ]
   *     });
   */
   var Checkboxes = function ( settings ) {
      // Sanity check that we are using DataTables 1.10.8 or newer
      if ( ! DataTable.versionCheck || ! DataTable.versionCheck( '1.10.8' ) ) {
         throw 'DataTables Checkboxes requires DataTables 1.10.8 or newer';
      }

      this.s = {
         dt: new DataTable.Api( settings ),
         columns: [],
         data: [],
         dataDisabled: [],
         ignoreSelect: false
      };

      // Get settings object
      this.s.ctx = this.s.dt.settings()[0];

      // Check if checkboxes have already been initialised on this table
      if ( this.s.ctx.checkboxes ) {
         return;
      }

      settings.checkboxes = this;

      this._constructor();
   };


   Checkboxes.prototype = {
      /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
      * Constructor
      */

      /**
      * Initialise the Checkboxes instance
      *
      * @private
      */
      _constructor: function ()
      {
         var self = this;
         var dt = self.s.dt;
         var ctx = self.s.ctx;
         var hasCheckboxes = false;
         var hasCheckboxesSelectRow = false;

         for(var i = 0; i < ctx.aoColumns.length; i++){
            if (ctx.aoColumns[i].checkboxes){
               var $colHeader = $(dt.column(i).header());

               //
               // INITIALIZATION
               //

               hasCheckboxes = true;

               if(!$.isPlainObject(ctx.aoColumns[i].checkboxes)){
                  ctx.aoColumns[i].checkboxes = {};
               }

               ctx.aoColumns[i].checkboxes = $.extend(
                  {}, Checkboxes.defaults, ctx.aoColumns[i].checkboxes
               );

               //
               // OPTIONS
               //

               var colOptions = {
                  'searchable': false,
                  'orderable': false
               };

               if(ctx.aoColumns[i].sClass === ''){
                  colOptions['className'] = 'dt-checkboxes-cell';
               } else {
                  colOptions['className'] = ctx.aoColumns[i].sClass + ' dt-checkboxes-cell';
               }

               if(ctx.aoColumns[i].sWidthOrig === null){
                  colOptions['width'] = '1%';
               }

               if(ctx.aoColumns[i].mRender === null){
                  colOptions['render'] = function(){
                     return '<input type="checkbox" class="dt-checkboxes" autocomplete="off">';
                  };
               }

               DataTable.ext.internal._fnColumnOptions(ctx, i, colOptions);


               // WORKAROUND: Remove "sorting" class
               $colHeader.removeClass('sorting');

               // WORKAROUND: Detach all event handlers for this column
               $colHeader.off('.dt');

               // If table has data source other than Ajax
               if(ctx.sAjaxSource === null){
                  // WORKAROUND: Invalidate column data
                  var cells = dt.cells('tr', i);
                  cells.invalidate('data');

                  // WORKAROUND: Add required class to existing cells
                  $(cells.nodes()).addClass(colOptions['className']);
               }


               //
               // DATA
               //

               // Initialize object holding data for selected checkboxes
               self.s.data[i] = {};
               self.s.dataDisabled[i] = {};

               // Store column index for easy column selection later
               self.s.columns.push(i);


               //
               // CLASSES
               //

               // If row selection is enabled for this column
               if(ctx.aoColumns[i].checkboxes.selectRow){

                  // If Select extension is enabled
                  if(ctx._select){
                     hasCheckboxesSelectRow = true;

                  // Otherwise, if Select extension is not enabled
                  } else {
                     // Disable row selection for this column
                     ctx.aoColumns[i].checkboxes.selectRow = false;
                  }
               }

               // If "Select all" control is enabled
               if(ctx.aoColumns[i].checkboxes.selectAll){
                  // Save previous HTML content
                  $colHeader.data('html', $colHeader.html());

                  // If "Select all" control markup is provided
                  if(ctx.aoColumns[i].checkboxes.selectAllRender !== null){
                     var selectAllHtml = '';

                     // If "selectAllRender" option is a function
                     if($.isFunction(ctx.aoColumns[i].checkboxes.selectAllRender)){
                        selectAllHtml = ctx.aoColumns[i].checkboxes.selectAllRender();

                     // Otherwise, if "selectAllRender" option is a string
                     } else if(typeof ctx.aoColumns[i].checkboxes.selectAllRender === 'string'){
                        selectAllHtml = ctx.aoColumns[i].checkboxes.selectAllRender;
                     }

                     $colHeader
                        .html(selectAllHtml)
                        .addClass('dt-checkboxes-select-all')
                        .attr('data-col', i);
                  }
               }
            }
         }

         // If table has at least one checkbox column
         if(hasCheckboxes){

            // Load previous state
            self.loadState();

            //
            // EVENT HANDLERS
            //

            var $table = $(dt.table().node());
            var $tableBody = $(dt.table().body());
            var $tableContainer = $(dt.table().container());

            // If there is at least one column that has row selection enabled
            if(hasCheckboxesSelectRow){
               $table.addClass('dt-checkboxes-select');

               // Handle event before row is selected/deselected
               $table.on('user-select.dt.dtCheckboxes', function (e, dt, type, cell , originalEvent){
                  self.onDataTablesUserSelect(e, dt, type, cell , originalEvent);
               });

               // Handle row select/deselect event
               $table.on('select.dt.dtCheckboxes deselect.dt.dtCheckboxes', function(e, api, type, indexes){
                  self.onDataTablesSelectDeselect(e, type, indexes);
               });

               // If displaying of Select extension information is enabled
               if(ctx._select.info){
                  // Disable Select extension information display
                  dt.select.info(false);

                  // Update the table information element with selected item summary
                  //
                  // NOTE: Needed to display correct count of selected rows
                  // when using server-side processing mode
                  $table.on('draw.dt.dtCheckboxes select.dt.dtCheckboxes deselect.dt.dtCheckboxes', function(){
                     self.showInfoSelected();
                  });
               }
            }

            // Handle table draw event
            $table.on('draw.dt.dtCheckboxes', function(e){
               self.onDataTablesDraw(e);
            });

            // Handle checkbox click event
            $tableBody.on('click.dtCheckboxes', 'input.dt-checkboxes', function(e){
               self.onClick(e, this);
            });

            // Handle click on "Select all" control
            $tableContainer.on('click.dtCheckboxes', 'thead th.dt-checkboxes-select-all input[type="checkbox"]', function(e){
               self.onClickSelectAll(e, this);
            });

            // Handle click on heading containing "Select all" control
            $tableContainer.on('click.dtCheckboxes', 'thead th.dt-checkboxes-select-all', function() {
               $('input[type="checkbox"]', this).not(':disabled').trigger('click');
            });

            // If row selection is disabled
            if(!hasCheckboxesSelectRow){
               // Handle click on cell containing checkbox
               $tableContainer.on('click.dtCheckboxes', 'tbody td.dt-checkboxes-cell', function() {
                  $('input[type="checkbox"]', this).not(':disabled').trigger('click');
               });
            }

            // Handle click on label node in heading containing "Select all" control
            // and in cell containing checkbox
            $tableContainer.on('click.dtCheckboxes', 'thead th.dt-checkboxes-select-all label, tbody td.dt-checkboxes-cell label', function(e) {
               // Prevent default behavior
               e.preventDefault();
            });

            // Handle click on "Select all" control in floating fixed header
            $(document).on('click.dtCheckboxes', '.fixedHeader-floating thead th.dt-checkboxes-select-all input[type="checkbox"]', function(e){
               // If FixedHeader is enabled in this instance
               if(ctx._fixedHeader){
                  // If header is floating in this instance
                  if(ctx._fixedHeader.dom['header'].floating){
                     self.onClickSelectAll(e, this);
                  }
               }
            });

            // Handle click on heading containing "Select all" control in floating fixed header
            $(document).on('click.dtCheckboxes', '.fixedHeader-floating thead th.dt-checkboxes-select-all', function() {
               // If FixedHeader is enabled in this instance
               if(ctx._fixedHeader){
                  // If header is floating in this instance
                  if(ctx._fixedHeader.dom['header'].floating){
                     $('input[type="checkbox"]', this).trigger('click');
                  }
               }
            });

            // Handle table initialization event
            $table.on('init.dt.dtCheckboxes', function(){
               // Use delay to handle initialization event
               // because certain extensions (FixedColumns) are initialized
               // only when initialization event is triggered.
               setTimeout(function(){
                   self.onDataTablesInit();
               }, 0);
            });

            // Handle state saving event
            $table.on('stateSaveParams.dt.dtCheckboxes', function (e, settings, data) {
               self.onDataTablesStateSave(e, settings, data);
            });

            // Handle table destroy event
            $table.one('destroy.dt.dtCheckboxes', function(e, settings){
               self.onDataTablesDestroy(e, settings);
            });
         }
      },

      // Handles DataTables initialization event
      onDataTablesInit: function(){
         var self = this;
         var dt = self.s.dt;
         var ctx = self.s.ctx;

         // If server-side processing mode is not enabled
         // NOTE: Needed to avoid duplicate call to updateStateCheckboxes() in onDataTablesDraw()
         if(!ctx.oFeatures.bServerSide){

            // If state saving is enabled
            if(ctx.oFeatures.bStateSave){
               self.updateState();
            }

            // Handle Ajax request completion event
            // NOTE: Needed to update table state 
            // if table is reloaded via ajax.reload() API method
            $(dt.table().node()).on('xhr.dt.dtCheckboxes', function ( e, settings , json, xhr ) {
               self.onDataTablesXhr(e. settings, json, xhr);
            });
         }
      },

      // Handles DataTables user initiated select event
      onDataTablesUserSelect: function ( e, dt, type, cell /*, originalEvent*/ ){
         var self = this;

         var cellIdx = cell.index();
         var rowIdx = cellIdx.row;
         var colIdx = self.getSelectRowColIndex();
         var cellData = dt.cell({ row: rowIdx, column: colIdx }).data();

         // If checkbox in the cell cannot be checked
         if(!self.isCellSelectable(colIdx, cellData)){
            // Prevent row selection
            e.preventDefault();
         }
      },

      // Handles DataTables row select/deselect event
      onDataTablesSelectDeselect: function(e, type, indexes){
         var self = this;
         var dt = self.s.dt;

         if(self.s.ignoreSelect){ return; }

         if(type === 'row'){
            // Get index of the first column that has checkbox and row selection enabled
            var colIdx = self.getSelectRowColIndex();
            if(colIdx !== null){
               var cells = dt.cells(indexes, colIdx);

               self.updateData(cells, colIdx, (e.type === 'select') ? true : false);
               self.updateCheckbox(cells, colIdx, (e.type === 'select') ? true : false);
               self.updateSelectAll(colIdx);
            }
         }
      },

      // Handles DataTables state save event
      onDataTablesStateSave: function (e, settings, data) {
         var self = this;
         var ctx = self.s.ctx;

         // Initialize array holding checkbox state for each column
         data.checkboxes = [];

         // For every column where checkboxes are enabled
         $.each(self.s.columns, function(index, colIdx){
            // If checkbox state saving is enabled
            if(ctx.aoColumns[colIdx].checkboxes.stateSave){
               // Store data associated with this plug-in
               data.checkboxes[colIdx] = self.s.data[colIdx];
            }
         });
      },

      // Handles DataTables destroy event
      onDataTablesDestroy: function(){
         var self = this;
         var dt = self.s.dt;

         // Get table elements
         var $table = $(dt.table().node());
         var $tableBody = $(dt.table().body());
         var $tableContainer = $(dt.table().container());

         // Detach event handlers
         $(document).off('click.dtCheckboxes');
         $tableContainer.off('.dtCheckboxes');
         $tableBody.off('.dtCheckboxes');
         $table.off('.dtCheckboxes');

         // Clear data
         //
         // NOTE: Needed only to reduce memory footprint
         // in case user saves instance of DataTable object.
         self.s.data = {};
         self.s.dataDisabled = {};

         // Remove added elements
         $('.dt-checkboxes-select-all', $table).each(function(index, el){
            $(el)
               .html($(el).data('html'))
               .removeClass('dt-checkboxes-select-all');
         });
      },

      // Handles DataTables draw event
      onDataTablesDraw: function(){
         var self = this;
         var ctx = self.s.ctx;

         // If server-side processing is enabled
         // or deferred render is enabled
         //
         // TODO: it's not optimal to update state of checkboxes
         // for already created rows in deferred rendering mode
         if(ctx.oFeatures.bServerSide || ctx.oFeatures.bDeferRender){
            self.updateStateCheckboxes({ page: 'current', search: 'none' });
         }

         $.each(self.s.columns, function(index, colIdx){
            self.updateSelectAll(colIdx);
         });         
      },

      // Handles DataTables Ajax request completion event
      onDataTablesXhr: function( /* e, settings , json, xhr */ ){
         var self = this;
         var dt = self.s.dt;
         var ctx = self.s.ctx;

         // Get table elements
         var $table = $(dt.table().node());

         // For every column where checkboxes are enabled
         $.each(self.s.columns, function(index, colIdx){
            // Reset data
            self.s.data[colIdx] = {};
            self.s.dataDisabled[colIdx] = {};
         });

         // If state saving is enabled
         if(ctx.oFeatures.bStateSave){
            // Load previous state
            self.loadState();

            // Update table state on next redraw
            $table.one('draw.dt.dtCheckboxes', function(){
               self.updateState();
            });
         }
      },

      // Updates array holding data for selected checkboxes
      updateData: function(cells, colIdx, isSelected){
         var self = this;
         var dt = self.s.dt;
         var ctx = self.s.ctx;

         // If Checkboxes extension is enabled for this column
         if(ctx.aoColumns[colIdx].checkboxes){
            var cellsData = cells.data();
            cellsData.each(function(cellData){
               // If checkbox is checked
               if(isSelected){
                  ctx.checkboxes.s.data[colIdx][cellData] = 1;

               // Otherwise, if checkbox is not checked
               } else {
                  delete ctx.checkboxes.s.data[colIdx][cellData];
               }
            });

            // If state saving is enabled
            if(ctx.oFeatures.bStateSave){
               // If checkbox state saving is enabled
               if(ctx.aoColumns[colIdx].checkboxes.stateSave){
                  // Save state
                  dt.state.save();
               }
            }
         }
      },

      // Updates row selection
      updateSelect: function(selector, isSelected){
         var self = this;
         var dt = self.s.dt;
         var ctx = self.s.ctx;

         // If Select extension is enabled
         if(ctx._select){
            // Disable select event hanlder temporarily
            self.s.ignoreSelect = true;

            if(isSelected){
               dt.rows(selector).select();
            } else {
               dt.rows(selector).deselect();
            }

            // Re-enable select event handler
            self.s.ignoreSelect = false;
         }
      },

      // Updates state of single checkbox
      updateCheckbox: function(cells, colIdx, isSelected){
         var self = this;
         var ctx = self.s.ctx;

         var cellNodes = cells.nodes();
         if(cellNodes.length){
            $('input.dt-checkboxes', cellNodes).not(':disabled').prop('checked', isSelected);

            // If selectCallback is a function
            if($.isFunction(ctx.aoColumns[colIdx].checkboxes.selectCallback)){
               ctx.aoColumns[colIdx].checkboxes.selectCallback(cellNodes, isSelected);
            }
         }
      },

      // Update table state
      updateState: function(){
         var self = this;
         var dt = self.s.dt;
         var ctx = self.s.ctx;

         self.updateStateCheckboxes({ page: 'all', search: 'none' });

         // If FixedColumns extension is enabled
         if(ctx._oFixedColumns){                   
            // Use delay to let FixedColumns construct the header
            // before we update the "Select all" checkbox
            setTimeout(function(){
               // For every column where checkboxes are enabled
               $.each(self.s.columns, function(index, colIdx){
                  self.updateSelectAll(colIdx);
               });
            }, 0);
         }
      },

      // Updates state of multiple checkboxes
      updateStateCheckboxes: function(opts){
         var self = this;
         var dt = self.s.dt;
         var ctx = self.s.ctx;

         // Enumerate all cells
         dt.cells('tr', self.s.columns, opts).every(function(rowIdx, colIdx){
            // Get cell data
            var cellData = this.data();

            // Determine if checkbox in the cell can be selected
            var isCellSelectable = self.isCellSelectable(colIdx, cellData);

            // If checkbox is checked
            if(ctx.checkboxes.s.data[colIdx].hasOwnProperty(cellData)){
               self.updateCheckbox(this, colIdx, true);

               // If row selection is enabled
               // and checkbox can be checked
               if(ctx.aoColumns[colIdx].checkboxes.selectRow && isCellSelectable){
                  self.updateSelect(rowIdx, true);
               }
            }

            // If checkbox is disabled
            if(!isCellSelectable){
               $('input.dt-checkboxes', this.node()).prop('disabled', true);
            }
         });
      },

      // Handles checkbox click event
      onClick: function(e, ctrl){
         var self = this;
         var dt = self.s.dt;
         var ctx = self.s.ctx;

         var cellSelector;

         // Get cell
         var $cell = $(ctrl).closest('td');

         // If cell is in a fixed column using FixedColumns extension
         if($cell.parents('.DTFC_Cloned').length){
            cellSelector = dt.fixedColumns().cellIndex($cell);

         } else {
            cellSelector = $cell;
         }

         var cell    = dt.cell(cellSelector);
         var cellIdx = cell.index();
         var colIdx  = cellIdx.column;

         // If row selection is not enabled
         // NOTE: if row selection is enabled, checkbox selection/deselection
         // would be handled by onDataTablesSelectDeselect event handler instead
         if(!ctx.aoColumns[colIdx].checkboxes.selectRow){
            cell.checkboxes.select(ctrl.checked);

            // Prevent click event from propagating to parent
            e.stopPropagation();

         } else {
            // WORKAROUND:
            // Select extension may keep the row selected
            // when checkbox is unchecked with SHIFT key.
            //
            // We need to update the state of the checkbox AFTER handling
            // select/deselect event from Select extension.
            //
            // Call to setTimeout is needed to let select/deselect event handler
            // update the data first.
            setTimeout(function(){
               // Get cell data
               var cellData = cell.data();

               // Determine whether data is in the list
               var hasData = self.s.data[colIdx].hasOwnProperty(cellData);

               // If state of the checkbox needs to be updated
               if(hasData !== ctrl.checked){
                  self.updateCheckbox(cell, colIdx, hasData);
                  self.updateSelectAll(colIdx);
               }
            }, 0);
         }
      },

      // Handles checkbox click event
      onClickSelectAll: function(e, ctrl){
         var self = this;
         var dt = self.s.dt;
         var ctx = self.s.ctx;

         // Calculate column index
         var colIdx = null;
         var $th = $(ctrl).closest('th');

         // If column is fixed using FixedColumns extension
         if($th.parents('.DTFC_Cloned').length){
            var cellIdx = dt.fixedColumns().cellIndex($th);
            colIdx = cellIdx.column;
         } else {
            colIdx = dt.column($th).index();
         }

         // Indicate that state of "Select all" control has been changed
         $(ctrl).data('is-changed', true);

         dt.column(colIdx, {
            page: (
               (ctx.aoColumns[colIdx].checkboxes && ctx.aoColumns[colIdx].checkboxes.selectAllPages)
                  ? 'all'
                  : 'current'
            ),
            search: 'applied'
         }).checkboxes.select(ctrl.checked);

         // Prevent click event from propagating to parent
         e.stopPropagation();
      },

      // Loads previosly saved sate
      loadState: function () {
         var self = this;
         var dt = self.s.dt;
         var ctx = self.s.ctx;

         // If state saving is enabled
         if(ctx.oFeatures.bStateSave){
            // Retrieve stored state
            var state = dt.state.loaded();

            // For every column where checkboxes are enabled
            $.each(self.s.columns, function(index, colIdx){
               // If state is loaded and contains data for this column
               if(state && state.checkboxes && state.checkboxes.hasOwnProperty(colIdx)){
                  // If checkbox state saving is enabled
                  if(ctx.aoColumns[colIdx].checkboxes.stateSave){
                     // Load previous state
                     self.s.data[colIdx] = state.checkboxes[colIdx];
                  }
               }
            });
         }
      },

      // Updates state of the "Select all" controls
      updateSelectAll: function(colIdx){
         var self = this;
         var dt = self.s.dt;
         var ctx = self.s.ctx;

         // If Checkboxes extension is enabled for this column
         // and "Select all" control is enabled for this column
         if(ctx.aoColumns[colIdx].checkboxes && ctx.aoColumns[colIdx].checkboxes.selectAll){
            var cells = dt.cells('tr', colIdx, {
               page: (
                  (ctx.aoColumns[colIdx].checkboxes.selectAllPages)
                     ? 'all'
                     : 'current'
               ),
               search: 'applied'
            });

            var $tableContainer = dt.table().container();
            var $checkboxesSelectAll = $('.dt-checkboxes-select-all[data-col="' + colIdx + '"] input[type="checkbox"]', $tableContainer);

            var countChecked = 0;
            var countDisabled = 0;
            var cellsData = cells.data();
            $.each(cellsData, function(index, cellData){
               // If checkbox is not disabled
               if(self.isCellSelectable(colIdx, cellData)){
                  if(self.s.data[colIdx].hasOwnProperty(cellData)){ countChecked++; }

               // Otherwise, if checkbox is disabled
               } else {
                  countDisabled++;
               }
            });

            // If FixedHeader is enabled in this instance
            if(ctx._fixedHeader){
               // If header is floating in this instance
               if(ctx._fixedHeader.dom['header'].floating){
                  $checkboxesSelectAll = $('.fixedHeader-floating .dt-checkboxes-select-all[data-col="' + colIdx + '"] input[type="checkbox"]');
               }
            }

            var isSelected;
            var isIndeterminate;

            // If none of the checkboxes are checked
            if (countChecked === 0){
               isSelected      = false;
               isIndeterminate = false;

            // If all of the checkboxes are checked
            } else if ((countChecked + countDisabled) === cellsData.length){
               isSelected      = true;
               isIndeterminate = false;

            // If some of the checkboxes are checked
            } else {
               isSelected      = true;
               isIndeterminate = true;
            }

            var isChanged          = $checkboxesSelectAll.data('is-changed');
            var isSelectedNow      = $checkboxesSelectAll.prop('checked');
            var isIndeterminateNow = $checkboxesSelectAll.prop('indeterminate');

            // If state of "Select all" control has been changed
            if(isChanged || isSelectedNow !== isSelected || isIndeterminateNow !== isIndeterminate){
               // Reset "Select all" control state flag
               $checkboxesSelectAll.data('is-changed', false);

               $checkboxesSelectAll.prop({
                  // NOTE: If checkbox has indeterminate state, 
                  // "checked" property must be set to false.
                  'checked': isIndeterminate ? false : isSelected,
                  'indeterminate': isIndeterminate
               });

               // If selectAllCallback is a function
               if($.isFunction(ctx.aoColumns[colIdx].checkboxes.selectAllCallback)){
                  ctx.aoColumns[colIdx].checkboxes.selectAllCallback($checkboxesSelectAll.closest('th').get(0), isSelected, isIndeterminate);
               }
            }
         }
      },

      // Updates the information element of the DataTable showing information about the
      // items selected. Based on info() method of Select extension.
      showInfoSelected: function(){
         var self = this;
         var dt = self.s.dt;
         var ctx = self.s.ctx;

         if ( ! ctx.aanFeatures.i ) {
            return;
         }

         // Get index of the first column that has checkbox and row selection enabled
         var colIdx = self.getSelectRowColIndex();

         // If there is a column that has checkbox and row selection enabled
         if(colIdx !== null){
            // Count number of selected rows
            var countRows = 0;
            for (var cellData in ctx.checkboxes.s.data[colIdx]){
               if (ctx.checkboxes.s.data[colIdx].hasOwnProperty(cellData)){
                  countRows++;
               }
            }

            var add = function($el, name, num){
               $el.append( $('<span class="select-item"/>').append( dt.i18n(
                  'select.'+name+'s',
                  { _: '%d '+name+'s selected', 0: '', 1: '1 '+name+' selected' },
                  num
               ) ) );
            };

            // Internal knowledge of DataTables to loop over all information elements
            $.each( ctx.aanFeatures.i, function ( i, el ) {
               var $el = $(el);

               var $output  = $('<span class="select-info"/>');
               add($output, 'row', countRows);

               var $existing = $el.children('span.select-info');
               if($existing.length){
                  $existing.remove();
               }

               if($output.text() !== ''){
                  $el.append($output);
               }
            });
         }
      },

      // Determines whether checkbox in the cell can be checked
      isCellSelectable: function(colIdx, cellData){
         var self = this;
         var ctx = self.s.ctx;

         // If data is in the list of disabled elements
         if(ctx.checkboxes.s.dataDisabled[colIdx].hasOwnProperty(cellData)){
            return false;

         // Otherwise, if checkbox can be selected
         } else {
            return true;
         }
      },

      // Gets cell index
      getCellIndex: function(cell){
         var self = this;
         var dt = self.s.dt;
         var ctx = self.s.ctx;

         // If FixedColumns extension is available
         if(ctx._oFixedColumns){
            return dt.fixedColumns().cellIndex(cell);

         } else {
            return dt.cell(cell).index();
         }
      },

      // Gets index of the first column that has checkbox and row selection enabled
      getSelectRowColIndex: function(){
         var self = this;
         var ctx = self.s.ctx;

         var colIdx = null;

         for(var i = 0; i < ctx.aoColumns.length; i++){
            // If Checkboxes extension is enabled
            // and row selection is enabled for this column
            if(ctx.aoColumns[i].checkboxes && ctx.aoColumns[i].checkboxes.selectRow){
               colIdx = i;
               break;
            }
         }

         return colIdx;
      },

      // Updates fixed column if FixedColumns extension is enabled
      // and given column is inside a fixed column
      updateFixedColumn: function(colIdx){
         var self = this;
         var dt = self.s.dt;
         var ctx = self.s.ctx;

         // If FixedColumns extension is enabled
         if(ctx._oFixedColumns){
            var leftCols = ctx._oFixedColumns.s.iLeftColumns;
            var rightCols = ctx.aoColumns.length - ctx._oFixedColumns.s.iRightColumns - 1;

            if (colIdx < leftCols || colIdx > rightCols){
               // Update the data shown in the fixed column
               dt.fixedColumns().update();

               // Use delay to let FixedColumns construct the header
               // before we update the "Select all" checkbox
               setTimeout(function(){
                  // For every column where checkboxes are enabled
                  $.each(self.s.columns, function(index, colIdx){
                     self.updateSelectAll(colIdx);
                  });
               }, 0);
            }
         }
      }
   };


   /**
   * Checkboxes default settings for initialisation
   *
   * @namespace
   * @name Checkboxes.defaults
   * @static
   */
   Checkboxes.defaults = {
      /**
      * Enable / disable checkbox state loading/saving if state saving is enabled globally
      *
      * @type {Boolean}
      * @default `true`
      */
      stateSave: true,

      /**
      * Enable / disable row selection
      *
      * @type {Boolean}
      * @default `false`
      */
      selectRow: false,

      /**
      * Enable / disable "select all" control in the header
      *
      * @type {Boolean}
      * @default `true`
      */
      selectAll: true,

      /**
      * Enable / disable ability to select checkboxes from all pages
      *
      * @type {Boolean}
      * @default `true`
      */
      selectAllPages: true,

      /**
      * Checkbox select/deselect callback
      *
      * @type {Function}
      * @default  `null`
      */
      selectCallback: null,

      /**
      * "Select all" control select/deselect callback
      *
      * @type {Function}
      * @default  `null`
      */
      selectAllCallback: null,

      /**
      * "Select all" control markup
      *
      * @type {mixed}
      * @default `<input type="checkbox">`
      */
      selectAllRender: '<input type="checkbox" autocomplete="off">'
   };


   /*
   * API
   */
   var Api = $.fn.dataTable.Api;

   // Doesn't do anything - work around for a bug in DT... Not documented
   Api.register( 'checkboxes()', function () {
      return this;
   } );

   Api.registerPlural( 'columns().checkboxes.select()', 'column().checkboxes.select()', function ( state ) {
      if(typeof state === 'undefined'){ state = true; }

      return this.iterator( 'column-rows', function ( ctx, colIdx, i, j, rowsIdx ) {
         // If Checkboxes extension is enabled for this column
         if(ctx.aoColumns[colIdx].checkboxes){
            // Prepare a list of all cells
            var selector = [];
            $.each(rowsIdx, function(index, rowIdx){
               selector.push({ row: rowIdx, column: colIdx });
            });

            var cells = this.cells(selector);
            var cellsData = cells.data();

            // Prepare a list of cells that contain checkboxes that can be selected
            var rowsSelectableIdx = [];
            selector = [];
            $.each(cellsData, function(index, cellData){
               // If checkbox in the cell can be selected
               if(ctx.checkboxes.isCellSelectable(colIdx, cellData)){
                  selector.push({ row: rowsIdx[index], column: colIdx });
                  rowsSelectableIdx.push(rowsIdx[index]);
               }
            });

            cells = this.cells(selector);

            ctx.checkboxes.updateData(cells, colIdx, state);
            ctx.checkboxes.updateCheckbox(cells, colIdx, state);

            // If row selection is enabled
            if(ctx.aoColumns[colIdx].checkboxes.selectRow){
               ctx.checkboxes.updateSelect(rowsSelectableIdx, state);
            }

            ctx.checkboxes.updateSelectAll(colIdx);

            ctx.checkboxes.updateFixedColumn(colIdx);
         }
      }, 1 );
   } );

   Api.registerPlural( 'cells().checkboxes.select()', 'cell().checkboxes.select()', function ( state ) {
      if(typeof state === 'undefined'){ state = true; }

      return this.iterator( 'cell', function ( ctx, rowIdx, colIdx ) {
         // If Checkboxes extension is enabled for this column
         if(ctx.aoColumns[colIdx].checkboxes){
            var cells = this.cells([{ row: rowIdx, column: colIdx }]);
            var cellData = this.cell({ row: rowIdx, column: colIdx }).data();

            // If checkbox in the cell can be selected
            if(ctx.checkboxes.isCellSelectable(colIdx, cellData)){
               ctx.checkboxes.updateData(cells, colIdx, state);
               ctx.checkboxes.updateCheckbox(cells, colIdx, state);

               // If row selection is enabled
               if(ctx.aoColumns[colIdx].checkboxes.selectRow){
                  ctx.checkboxes.updateSelect(rowIdx, state);
               }

               ctx.checkboxes.updateSelectAll(colIdx);

               ctx.checkboxes.updateFixedColumn(colIdx);
            }
         }
      }, 1 );
   } );

   Api.registerPlural( 'cells().checkboxes.enable()', 'cell().checkboxes.enable()', function ( state ) {
      if(typeof state === 'undefined'){ state = true; }

      return this.iterator( 'cell', function ( ctx, rowIdx, colIdx ) {
         // If Checkboxes extension is enabled for this column
         if(ctx.aoColumns[colIdx].checkboxes){
            var cell = this.cell({ row: rowIdx, column: colIdx });

            // Get cell data
            var cellData = cell.data();

            // If checkbox should be enabled
            if(state){
               delete ctx.checkboxes.s.dataDisabled[colIdx][cellData];

            // Otherwise, if checkbox should be disabled
            } else {
               ctx.checkboxes.s.dataDisabled[colIdx][cellData] = 1;
            }

            // Determine if cell node is available
            // (deferRender is not enabled or cell has been already created)
            var cellNode = cell.node();
            if(cellNode){
               $('input.dt-checkboxes', cellNode).prop('disabled', !state);
            }

            // If row selection is enabled
            // and checkbox can be checked
            if(ctx.aoColumns[colIdx].checkboxes.selectRow){
               // If data is in the list
               if(ctx.checkboxes.s.data[colIdx].hasOwnProperty(cellData)){
                  // Update selection based on current state:
                  // if checkbox is enabled then select row;
                  // otherwise, deselect row
                  ctx.checkboxes.updateSelect(rowIdx, state);
               }
            }
         }
      }, 1 );
   } );

   Api.registerPlural( 'cells().checkboxes.disable()', 'cell().checkboxes.disable()', function ( state ) {
      if(typeof state === 'undefined'){ state = true; }
      return this.checkboxes.enable(!state);
   } );

   Api.registerPlural( 'columns().checkboxes.deselect()', 'column().checkboxes.deselect()', function ( state ) {
      if(typeof state === 'undefined'){ state = true; }
      return this.checkboxes.select(!state);
   } );

   Api.registerPlural( 'cells().checkboxes.deselect()', 'cell().checkboxes.deselect()', function ( state ) {
      if(typeof state === 'undefined'){ state = true; }
      return this.checkboxes.select(!state);
   } );

   Api.registerPlural( 'columns().checkboxes.deselectAll()', 'column().checkboxes.deselectAll()', function () {
      return this.iterator( 'column', function (ctx, colIdx){
         // If Checkboxes extension is enabled for this column
         if(ctx.aoColumns[colIdx].checkboxes){
            ctx.checkboxes.s.data[colIdx] = {};

            this.column(colIdx).checkboxes.select(false);
         }
      }, 1 );
   } );

   Api.registerPlural( 'columns().checkboxes.selected()', 'column().checkboxes.selected()', function () {
      return this.iterator( 'column-rows', function ( ctx, colIdx, i, j, rowsIdx ) {

         // If Checkboxes extension is enabled for this column
         if(ctx.aoColumns[colIdx].checkboxes){
            var data = [];

            // If server-side processing mode is enabled
            if(ctx.oFeatures.bServerSide){
               $.each(ctx.checkboxes.s.data[colIdx], function(cellData){
                  // If checkbox in the cell can be checked
                  if(ctx.checkboxes.isCellSelectable(colIdx, cellData)){
                     data.push(cellData);
                  }
               });

            // Otherwise, if server-side processing mode is not enabled
            } else {
               // Prepare a list of all cells
               var selector = [];
               $.each(rowsIdx, function(index, rowIdx){
                  selector.push({ row: rowIdx, column: colIdx });
               });

               // Get all cells data
               var cells = this.cells(selector);
               var cellsData = cells.data();

               // Enumerate all cells data
               $.each(cellsData, function(index, cellData){
                  // If checkbox is checked
                  if(ctx.checkboxes.s.data[colIdx].hasOwnProperty(cellData)){
                     // If checkbox in the cell can be selected
                     if(ctx.checkboxes.isCellSelectable(colIdx, cellData)){
                        data.push(cellData);
                     }
                  }
               });
            }

            return data;

         } else {
            return [];
         }
      }, 1 );
   } );


   /**
    * Version information
    *
    * @name Checkboxes.version
    * @static
    */
   Checkboxes.version = '1.2.12';



   $.fn.DataTable.Checkboxes = Checkboxes;
   $.fn.dataTable.Checkboxes = Checkboxes;


   // Attach a listener to the document which listens for DataTables initialisation
   // events so we can automatically initialise
   $(document).on( 'preInit.dt.dtCheckboxes', function (e, settings /*, json */ ) {
      if ( e.namespace !== 'dt' ) {
         return;
      }

      new Checkboxes( settings );
   } );


   return Checkboxes;
}));


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9kbWV0YS8uL25vZGVfbW9kdWxlcy9qcXVlcnktZGF0YXRhYmxlcy1jaGVja2JveGVzL2pzL2RhdGFUYWJsZXMuY2hlY2tib3hlcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVEsSUFBMEM7QUFDbEQ7QUFDQSxNQUFNLGlDQUFRLENBQUMsaUZBQVEsRUFBRSxrR0FBZ0IsQ0FBQyxtQ0FBRTtBQUM1QztBQUNBLE9BQU87QUFBQSxrR0FBRTtBQUNUO0FBQ0EsUUFBUSxFQWlCSjtBQUNKO0FBQ0EsQ0FBQztBQUNEO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFjLE9BQU87QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsdUJBQXVCLDBCQUEwQjtBQUNqRDtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxvQkFBb0I7QUFDcEI7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxnQkFBZ0I7QUFDaEI7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87O0FBRVA7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsT0FBTzs7QUFFUDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87O0FBRVA7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxxQ0FBcUMsOEJBQThCOztBQUVuRTtBQUNBLGdDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCO0FBQ2hCLGFBQWE7QUFDYjtBQUNBLE9BQU87O0FBRVA7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1YsT0FBTzs7QUFFUDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBLFVBQVU7QUFDVjtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUEsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQSxPQUFPOztBQUVQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVB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Ozs7O0FBSUE7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsSUFBSTs7O0FBR0o7QUFDQSxDQUFDIiwiZmlsZSI6Im5wbS5qcXVlcnktZGF0YXRhYmxlcy1jaGVja2JveGVzLjVmMWM3OGE0YzMwNzYxZDUwYzM3LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyohIFxyXG4gKiBqUXVlcnkgRGF0YVRhYmxlcyBDaGVja2JveGVzIChodHRwczovL3d3dy5neXJvY29kZS5jb20vcHJvamVjdHMvanF1ZXJ5LWRhdGF0YWJsZXMtY2hlY2tib3hlcy8pXHJcbiAqIENoZWNrYm94ZXMgZXh0ZW5zaW9uIGZvciBqUXVlcnkgRGF0YVRhYmxlc1xyXG4gKlxyXG4gKiBAdmVyc2lvbiAgICAgMS4yLjEyXHJcbiAqIEBhdXRob3IgICAgICBHeXJvY29kZSBMTEMgKGh0dHBzOi8vd3d3Lmd5cm9jb2RlLmNvbSlcclxuICogQGNvcHlyaWdodCAgIChjKSBHeXJvY29kZSBMTENcclxuICogQGxpY2Vuc2UgICAgIE1JVFxyXG4gKi9cclxuKGZ1bmN0aW9uKCBmYWN0b3J5ICl7XHJcbi8qIGVzbGludC1kaXNhYmxlICovXHJcbiAgIGlmICggdHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kICkge1xyXG4gICAgICAvLyBBTURcclxuICAgICAgZGVmaW5lKCBbJ2pxdWVyeScsICdkYXRhdGFibGVzLm5ldCddLCBmdW5jdGlvbiAoICQgKSB7XHJcbiAgICAgICAgIHJldHVybiBmYWN0b3J5KCAkLCB3aW5kb3csIGRvY3VtZW50ICk7XHJcbiAgICAgIH0gKTtcclxuICAgfVxyXG4gICBlbHNlIGlmICggdHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICkge1xyXG4gICAgICAvLyBDb21tb25KU1xyXG4gICAgICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChyb290LCAkKSB7XHJcbiAgICAgICAgIGlmICggISByb290ICkge1xyXG4gICAgICAgICAgICByb290ID0gd2luZG93O1xyXG4gICAgICAgICB9XHJcblxyXG4gICAgICAgICBpZiAoICEgJCB8fCAhICQuZm4uZGF0YVRhYmxlICkge1xyXG4gICAgICAgICAgICAkID0gcmVxdWlyZSgnZGF0YXRhYmxlcy5uZXQnKShyb290LCAkKS4kO1xyXG4gICAgICAgICB9XHJcblxyXG4gICAgICAgICByZXR1cm4gZmFjdG9yeSggJCwgcm9vdCwgcm9vdC5kb2N1bWVudCApO1xyXG4gICAgICB9O1xyXG4gICB9XHJcbiAgIGVsc2Uge1xyXG4gICAgICAvLyBCcm93c2VyXHJcbiAgICAgIGZhY3RvcnkoIGpRdWVyeSwgd2luZG93LCBkb2N1bWVudCApO1xyXG4gICB9XHJcbi8qIGVzbGludC1lbmFibGUgKi9cclxufShmdW5jdGlvbiggJCwgd2luZG93LCBkb2N1bWVudCApIHtcclxuICAgJ3VzZSBzdHJpY3QnO1xyXG4gICB2YXIgRGF0YVRhYmxlID0gJC5mbi5kYXRhVGFibGU7XHJcblxyXG5cclxuICAgLyoqXHJcbiAgICogQ2hlY2tib3hlcyBpcyBhbiBleHRlbnNpb24gZm9yIHRoZSBqUXVlcnkgRGF0YVRhYmxlcyBsaWJyYXJ5IHRoYXQgcHJvdmlkZXNcclxuICAgKiB1bml2ZXJzYWwgc29sdXRpb24gZm9yIHdvcmtpbmcgd2l0aCBjaGVja2JveGVzIGluIGEgdGFibGUuXHJcbiAgICpcclxuICAgKiAgQGNsYXNzXHJcbiAgICogIEBwYXJhbSB7b2JqZWN0fSBzZXR0aW5ncyBEYXRhVGFibGVzIHNldHRpbmdzIG9iamVjdCBmb3IgdGhlIGhvc3QgdGFibGVcclxuICAgKiAgQHJlcXVpcmVzIGpRdWVyeSAxLjcrXHJcbiAgICogIEByZXF1aXJlcyBEYXRhVGFibGVzIDEuMTAuOCtcclxuICAgKlxyXG4gICAqICBAZXhhbXBsZVxyXG4gICAqICAgICAkKCcjZXhhbXBsZScpLkRhdGFUYWJsZSh7XHJcbiAgICogICAgICAgICdjb2x1bW5EZWZzJzogW1xyXG4gICAqICAgICAgICAgICB7XHJcbiAgICogICAgICAgICAgICAgICd0YXJnZXRzJzogMCxcclxuICAgKiAgICAgICAgICAgICAgJ2NoZWNrYm94ZXMnOiB0cnVlXHJcbiAgICogICAgICAgICAgIH1cclxuICAgKiAgICAgICAgXVxyXG4gICAqICAgICB9KTtcclxuICAgKi9cclxuICAgdmFyIENoZWNrYm94ZXMgPSBmdW5jdGlvbiAoIHNldHRpbmdzICkge1xyXG4gICAgICAvLyBTYW5pdHkgY2hlY2sgdGhhdCB3ZSBhcmUgdXNpbmcgRGF0YVRhYmxlcyAxLjEwLjggb3IgbmV3ZXJcclxuICAgICAgaWYgKCAhIERhdGFUYWJsZS52ZXJzaW9uQ2hlY2sgfHwgISBEYXRhVGFibGUudmVyc2lvbkNoZWNrKCAnMS4xMC44JyApICkge1xyXG4gICAgICAgICB0aHJvdyAnRGF0YVRhYmxlcyBDaGVja2JveGVzIHJlcXVpcmVzIERhdGFUYWJsZXMgMS4xMC44IG9yIG5ld2VyJztcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5zID0ge1xyXG4gICAgICAgICBkdDogbmV3IERhdGFUYWJsZS5BcGkoIHNldHRpbmdzICksXHJcbiAgICAgICAgIGNvbHVtbnM6IFtdLFxyXG4gICAgICAgICBkYXRhOiBbXSxcclxuICAgICAgICAgZGF0YURpc2FibGVkOiBbXSxcclxuICAgICAgICAgaWdub3JlU2VsZWN0OiBmYWxzZVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgLy8gR2V0IHNldHRpbmdzIG9iamVjdFxyXG4gICAgICB0aGlzLnMuY3R4ID0gdGhpcy5zLmR0LnNldHRpbmdzKClbMF07XHJcblxyXG4gICAgICAvLyBDaGVjayBpZiBjaGVja2JveGVzIGhhdmUgYWxyZWFkeSBiZWVuIGluaXRpYWxpc2VkIG9uIHRoaXMgdGFibGVcclxuICAgICAgaWYgKCB0aGlzLnMuY3R4LmNoZWNrYm94ZXMgKSB7XHJcbiAgICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgc2V0dGluZ3MuY2hlY2tib3hlcyA9IHRoaXM7XHJcblxyXG4gICAgICB0aGlzLl9jb25zdHJ1Y3RvcigpO1xyXG4gICB9O1xyXG5cclxuXHJcbiAgIENoZWNrYm94ZXMucHJvdG90eXBlID0ge1xyXG4gICAgICAvKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqXHJcbiAgICAgICogQ29uc3RydWN0b3JcclxuICAgICAgKi9cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAqIEluaXRpYWxpc2UgdGhlIENoZWNrYm94ZXMgaW5zdGFuY2VcclxuICAgICAgKlxyXG4gICAgICAqIEBwcml2YXRlXHJcbiAgICAgICovXHJcbiAgICAgIF9jb25zdHJ1Y3RvcjogZnVuY3Rpb24gKClcclxuICAgICAge1xyXG4gICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgIHZhciBkdCA9IHNlbGYucy5kdDtcclxuICAgICAgICAgdmFyIGN0eCA9IHNlbGYucy5jdHg7XHJcbiAgICAgICAgIHZhciBoYXNDaGVja2JveGVzID0gZmFsc2U7XHJcbiAgICAgICAgIHZhciBoYXNDaGVja2JveGVzU2VsZWN0Um93ID0gZmFsc2U7XHJcblxyXG4gICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgY3R4LmFvQ29sdW1ucy5sZW5ndGg7IGkrKyl7XHJcbiAgICAgICAgICAgIGlmIChjdHguYW9Db2x1bW5zW2ldLmNoZWNrYm94ZXMpe1xyXG4gICAgICAgICAgICAgICB2YXIgJGNvbEhlYWRlciA9ICQoZHQuY29sdW1uKGkpLmhlYWRlcigpKTtcclxuXHJcbiAgICAgICAgICAgICAgIC8vXHJcbiAgICAgICAgICAgICAgIC8vIElOSVRJQUxJWkFUSU9OXHJcbiAgICAgICAgICAgICAgIC8vXHJcblxyXG4gICAgICAgICAgICAgICBoYXNDaGVja2JveGVzID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgICAgIGlmKCEkLmlzUGxhaW5PYmplY3QoY3R4LmFvQ29sdW1uc1tpXS5jaGVja2JveGVzKSl7XHJcbiAgICAgICAgICAgICAgICAgIGN0eC5hb0NvbHVtbnNbaV0uY2hlY2tib3hlcyA9IHt9O1xyXG4gICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICBjdHguYW9Db2x1bW5zW2ldLmNoZWNrYm94ZXMgPSAkLmV4dGVuZChcclxuICAgICAgICAgICAgICAgICAge30sIENoZWNrYm94ZXMuZGVmYXVsdHMsIGN0eC5hb0NvbHVtbnNbaV0uY2hlY2tib3hlc1xyXG4gICAgICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgICAgLy9cclxuICAgICAgICAgICAgICAgLy8gT1BUSU9OU1xyXG4gICAgICAgICAgICAgICAvL1xyXG5cclxuICAgICAgICAgICAgICAgdmFyIGNvbE9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgICAgICAgICdzZWFyY2hhYmxlJzogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICdvcmRlcmFibGUnOiBmYWxzZVxyXG4gICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgaWYoY3R4LmFvQ29sdW1uc1tpXS5zQ2xhc3MgPT09ICcnKXtcclxuICAgICAgICAgICAgICAgICAgY29sT3B0aW9uc1snY2xhc3NOYW1lJ10gPSAnZHQtY2hlY2tib3hlcy1jZWxsJztcclxuICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgY29sT3B0aW9uc1snY2xhc3NOYW1lJ10gPSBjdHguYW9Db2x1bW5zW2ldLnNDbGFzcyArICcgZHQtY2hlY2tib3hlcy1jZWxsJztcclxuICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgaWYoY3R4LmFvQ29sdW1uc1tpXS5zV2lkdGhPcmlnID09PSBudWxsKXtcclxuICAgICAgICAgICAgICAgICAgY29sT3B0aW9uc1snd2lkdGgnXSA9ICcxJSc7XHJcbiAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgIGlmKGN0eC5hb0NvbHVtbnNbaV0ubVJlbmRlciA9PT0gbnVsbCl7XHJcbiAgICAgICAgICAgICAgICAgIGNvbE9wdGlvbnNbJ3JlbmRlciddID0gZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICc8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgY2xhc3M9XCJkdC1jaGVja2JveGVzXCIgYXV0b2NvbXBsZXRlPVwib2ZmXCI+JztcclxuICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgRGF0YVRhYmxlLmV4dC5pbnRlcm5hbC5fZm5Db2x1bW5PcHRpb25zKGN0eCwgaSwgY29sT3B0aW9ucyk7XHJcblxyXG5cclxuICAgICAgICAgICAgICAgLy8gV09SS0FST1VORDogUmVtb3ZlIFwic29ydGluZ1wiIGNsYXNzXHJcbiAgICAgICAgICAgICAgICRjb2xIZWFkZXIucmVtb3ZlQ2xhc3MoJ3NvcnRpbmcnKTtcclxuXHJcbiAgICAgICAgICAgICAgIC8vIFdPUktBUk9VTkQ6IERldGFjaCBhbGwgZXZlbnQgaGFuZGxlcnMgZm9yIHRoaXMgY29sdW1uXHJcbiAgICAgICAgICAgICAgICRjb2xIZWFkZXIub2ZmKCcuZHQnKTtcclxuXHJcbiAgICAgICAgICAgICAgIC8vIElmIHRhYmxlIGhhcyBkYXRhIHNvdXJjZSBvdGhlciB0aGFuIEFqYXhcclxuICAgICAgICAgICAgICAgaWYoY3R4LnNBamF4U291cmNlID09PSBudWxsKXtcclxuICAgICAgICAgICAgICAgICAgLy8gV09SS0FST1VORDogSW52YWxpZGF0ZSBjb2x1bW4gZGF0YVxyXG4gICAgICAgICAgICAgICAgICB2YXIgY2VsbHMgPSBkdC5jZWxscygndHInLCBpKTtcclxuICAgICAgICAgICAgICAgICAgY2VsbHMuaW52YWxpZGF0ZSgnZGF0YScpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgLy8gV09SS0FST1VORDogQWRkIHJlcXVpcmVkIGNsYXNzIHRvIGV4aXN0aW5nIGNlbGxzXHJcbiAgICAgICAgICAgICAgICAgICQoY2VsbHMubm9kZXMoKSkuYWRkQ2xhc3MoY29sT3B0aW9uc1snY2xhc3NOYW1lJ10pO1xyXG4gICAgICAgICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAgICAgICAgLy9cclxuICAgICAgICAgICAgICAgLy8gREFUQVxyXG4gICAgICAgICAgICAgICAvL1xyXG5cclxuICAgICAgICAgICAgICAgLy8gSW5pdGlhbGl6ZSBvYmplY3QgaG9sZGluZyBkYXRhIGZvciBzZWxlY3RlZCBjaGVja2JveGVzXHJcbiAgICAgICAgICAgICAgIHNlbGYucy5kYXRhW2ldID0ge307XHJcbiAgICAgICAgICAgICAgIHNlbGYucy5kYXRhRGlzYWJsZWRbaV0gPSB7fTtcclxuXHJcbiAgICAgICAgICAgICAgIC8vIFN0b3JlIGNvbHVtbiBpbmRleCBmb3IgZWFzeSBjb2x1bW4gc2VsZWN0aW9uIGxhdGVyXHJcbiAgICAgICAgICAgICAgIHNlbGYucy5jb2x1bW5zLnB1c2goaSk7XHJcblxyXG5cclxuICAgICAgICAgICAgICAgLy9cclxuICAgICAgICAgICAgICAgLy8gQ0xBU1NFU1xyXG4gICAgICAgICAgICAgICAvL1xyXG5cclxuICAgICAgICAgICAgICAgLy8gSWYgcm93IHNlbGVjdGlvbiBpcyBlbmFibGVkIGZvciB0aGlzIGNvbHVtblxyXG4gICAgICAgICAgICAgICBpZihjdHguYW9Db2x1bW5zW2ldLmNoZWNrYm94ZXMuc2VsZWN0Um93KXtcclxuXHJcbiAgICAgICAgICAgICAgICAgIC8vIElmIFNlbGVjdCBleHRlbnNpb24gaXMgZW5hYmxlZFxyXG4gICAgICAgICAgICAgICAgICBpZihjdHguX3NlbGVjdCl7XHJcbiAgICAgICAgICAgICAgICAgICAgIGhhc0NoZWNrYm94ZXNTZWxlY3RSb3cgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgLy8gT3RoZXJ3aXNlLCBpZiBTZWxlY3QgZXh0ZW5zaW9uIGlzIG5vdCBlbmFibGVkXHJcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgIC8vIERpc2FibGUgcm93IHNlbGVjdGlvbiBmb3IgdGhpcyBjb2x1bW5cclxuICAgICAgICAgICAgICAgICAgICAgY3R4LmFvQ29sdW1uc1tpXS5jaGVja2JveGVzLnNlbGVjdFJvdyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgIC8vIElmIFwiU2VsZWN0IGFsbFwiIGNvbnRyb2wgaXMgZW5hYmxlZFxyXG4gICAgICAgICAgICAgICBpZihjdHguYW9Db2x1bW5zW2ldLmNoZWNrYm94ZXMuc2VsZWN0QWxsKXtcclxuICAgICAgICAgICAgICAgICAgLy8gU2F2ZSBwcmV2aW91cyBIVE1MIGNvbnRlbnRcclxuICAgICAgICAgICAgICAgICAgJGNvbEhlYWRlci5kYXRhKCdodG1sJywgJGNvbEhlYWRlci5odG1sKCkpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgLy8gSWYgXCJTZWxlY3QgYWxsXCIgY29udHJvbCBtYXJrdXAgaXMgcHJvdmlkZWRcclxuICAgICAgICAgICAgICAgICAgaWYoY3R4LmFvQ29sdW1uc1tpXS5jaGVja2JveGVzLnNlbGVjdEFsbFJlbmRlciAhPT0gbnVsbCl7XHJcbiAgICAgICAgICAgICAgICAgICAgIHZhciBzZWxlY3RBbGxIdG1sID0gJyc7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAvLyBJZiBcInNlbGVjdEFsbFJlbmRlclwiIG9wdGlvbiBpcyBhIGZ1bmN0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgIGlmKCQuaXNGdW5jdGlvbihjdHguYW9Db2x1bW5zW2ldLmNoZWNrYm94ZXMuc2VsZWN0QWxsUmVuZGVyKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdEFsbEh0bWwgPSBjdHguYW9Db2x1bW5zW2ldLmNoZWNrYm94ZXMuc2VsZWN0QWxsUmVuZGVyKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAvLyBPdGhlcndpc2UsIGlmIFwic2VsZWN0QWxsUmVuZGVyXCIgb3B0aW9uIGlzIGEgc3RyaW5nXHJcbiAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZih0eXBlb2YgY3R4LmFvQ29sdW1uc1tpXS5jaGVja2JveGVzLnNlbGVjdEFsbFJlbmRlciA9PT0gJ3N0cmluZycpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RBbGxIdG1sID0gY3R4LmFvQ29sdW1uc1tpXS5jaGVja2JveGVzLnNlbGVjdEFsbFJlbmRlcjtcclxuICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgJGNvbEhlYWRlclxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuaHRtbChzZWxlY3RBbGxIdG1sKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoJ2R0LWNoZWNrYm94ZXMtc2VsZWN0LWFsbCcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCdkYXRhLWNvbCcsIGkpO1xyXG4gICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICB9XHJcblxyXG4gICAgICAgICAvLyBJZiB0YWJsZSBoYXMgYXQgbGVhc3Qgb25lIGNoZWNrYm94IGNvbHVtblxyXG4gICAgICAgICBpZihoYXNDaGVja2JveGVzKXtcclxuXHJcbiAgICAgICAgICAgIC8vIExvYWQgcHJldmlvdXMgc3RhdGVcclxuICAgICAgICAgICAgc2VsZi5sb2FkU3RhdGUoKTtcclxuXHJcbiAgICAgICAgICAgIC8vXHJcbiAgICAgICAgICAgIC8vIEVWRU5UIEhBTkRMRVJTXHJcbiAgICAgICAgICAgIC8vXHJcblxyXG4gICAgICAgICAgICB2YXIgJHRhYmxlID0gJChkdC50YWJsZSgpLm5vZGUoKSk7XHJcbiAgICAgICAgICAgIHZhciAkdGFibGVCb2R5ID0gJChkdC50YWJsZSgpLmJvZHkoKSk7XHJcbiAgICAgICAgICAgIHZhciAkdGFibGVDb250YWluZXIgPSAkKGR0LnRhYmxlKCkuY29udGFpbmVyKCkpO1xyXG5cclxuICAgICAgICAgICAgLy8gSWYgdGhlcmUgaXMgYXQgbGVhc3Qgb25lIGNvbHVtbiB0aGF0IGhhcyByb3cgc2VsZWN0aW9uIGVuYWJsZWRcclxuICAgICAgICAgICAgaWYoaGFzQ2hlY2tib3hlc1NlbGVjdFJvdyl7XHJcbiAgICAgICAgICAgICAgICR0YWJsZS5hZGRDbGFzcygnZHQtY2hlY2tib3hlcy1zZWxlY3QnKTtcclxuXHJcbiAgICAgICAgICAgICAgIC8vIEhhbmRsZSBldmVudCBiZWZvcmUgcm93IGlzIHNlbGVjdGVkL2Rlc2VsZWN0ZWRcclxuICAgICAgICAgICAgICAgJHRhYmxlLm9uKCd1c2VyLXNlbGVjdC5kdC5kdENoZWNrYm94ZXMnLCBmdW5jdGlvbiAoZSwgZHQsIHR5cGUsIGNlbGwgLCBvcmlnaW5hbEV2ZW50KXtcclxuICAgICAgICAgICAgICAgICAgc2VsZi5vbkRhdGFUYWJsZXNVc2VyU2VsZWN0KGUsIGR0LCB0eXBlLCBjZWxsICwgb3JpZ2luYWxFdmVudCk7XHJcbiAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgLy8gSGFuZGxlIHJvdyBzZWxlY3QvZGVzZWxlY3QgZXZlbnRcclxuICAgICAgICAgICAgICAgJHRhYmxlLm9uKCdzZWxlY3QuZHQuZHRDaGVja2JveGVzIGRlc2VsZWN0LmR0LmR0Q2hlY2tib3hlcycsIGZ1bmN0aW9uKGUsIGFwaSwgdHlwZSwgaW5kZXhlcyl7XHJcbiAgICAgICAgICAgICAgICAgIHNlbGYub25EYXRhVGFibGVzU2VsZWN0RGVzZWxlY3QoZSwgdHlwZSwgaW5kZXhlcyk7XHJcbiAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgLy8gSWYgZGlzcGxheWluZyBvZiBTZWxlY3QgZXh0ZW5zaW9uIGluZm9ybWF0aW9uIGlzIGVuYWJsZWRcclxuICAgICAgICAgICAgICAgaWYoY3R4Ll9zZWxlY3QuaW5mbyl7XHJcbiAgICAgICAgICAgICAgICAgIC8vIERpc2FibGUgU2VsZWN0IGV4dGVuc2lvbiBpbmZvcm1hdGlvbiBkaXNwbGF5XHJcbiAgICAgICAgICAgICAgICAgIGR0LnNlbGVjdC5pbmZvKGZhbHNlKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgIC8vIFVwZGF0ZSB0aGUgdGFibGUgaW5mb3JtYXRpb24gZWxlbWVudCB3aXRoIHNlbGVjdGVkIGl0ZW0gc3VtbWFyeVxyXG4gICAgICAgICAgICAgICAgICAvL1xyXG4gICAgICAgICAgICAgICAgICAvLyBOT1RFOiBOZWVkZWQgdG8gZGlzcGxheSBjb3JyZWN0IGNvdW50IG9mIHNlbGVjdGVkIHJvd3NcclxuICAgICAgICAgICAgICAgICAgLy8gd2hlbiB1c2luZyBzZXJ2ZXItc2lkZSBwcm9jZXNzaW5nIG1vZGVcclxuICAgICAgICAgICAgICAgICAgJHRhYmxlLm9uKCdkcmF3LmR0LmR0Q2hlY2tib3hlcyBzZWxlY3QuZHQuZHRDaGVja2JveGVzIGRlc2VsZWN0LmR0LmR0Q2hlY2tib3hlcycsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgIHNlbGYuc2hvd0luZm9TZWxlY3RlZCgpO1xyXG4gICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBIYW5kbGUgdGFibGUgZHJhdyBldmVudFxyXG4gICAgICAgICAgICAkdGFibGUub24oJ2RyYXcuZHQuZHRDaGVja2JveGVzJywgZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgICAgICAgIHNlbGYub25EYXRhVGFibGVzRHJhdyhlKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAvLyBIYW5kbGUgY2hlY2tib3ggY2xpY2sgZXZlbnRcclxuICAgICAgICAgICAgJHRhYmxlQm9keS5vbignY2xpY2suZHRDaGVja2JveGVzJywgJ2lucHV0LmR0LWNoZWNrYm94ZXMnLCBmdW5jdGlvbihlKXtcclxuICAgICAgICAgICAgICAgc2VsZi5vbkNsaWNrKGUsIHRoaXMpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIC8vIEhhbmRsZSBjbGljayBvbiBcIlNlbGVjdCBhbGxcIiBjb250cm9sXHJcbiAgICAgICAgICAgICR0YWJsZUNvbnRhaW5lci5vbignY2xpY2suZHRDaGVja2JveGVzJywgJ3RoZWFkIHRoLmR0LWNoZWNrYm94ZXMtc2VsZWN0LWFsbCBpbnB1dFt0eXBlPVwiY2hlY2tib3hcIl0nLCBmdW5jdGlvbihlKXtcclxuICAgICAgICAgICAgICAgc2VsZi5vbkNsaWNrU2VsZWN0QWxsKGUsIHRoaXMpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIC8vIEhhbmRsZSBjbGljayBvbiBoZWFkaW5nIGNvbnRhaW5pbmcgXCJTZWxlY3QgYWxsXCIgY29udHJvbFxyXG4gICAgICAgICAgICAkdGFibGVDb250YWluZXIub24oJ2NsaWNrLmR0Q2hlY2tib3hlcycsICd0aGVhZCB0aC5kdC1jaGVja2JveGVzLXNlbGVjdC1hbGwnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgJCgnaW5wdXRbdHlwZT1cImNoZWNrYm94XCJdJywgdGhpcykubm90KCc6ZGlzYWJsZWQnKS50cmlnZ2VyKCdjbGljaycpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIC8vIElmIHJvdyBzZWxlY3Rpb24gaXMgZGlzYWJsZWRcclxuICAgICAgICAgICAgaWYoIWhhc0NoZWNrYm94ZXNTZWxlY3RSb3cpe1xyXG4gICAgICAgICAgICAgICAvLyBIYW5kbGUgY2xpY2sgb24gY2VsbCBjb250YWluaW5nIGNoZWNrYm94XHJcbiAgICAgICAgICAgICAgICR0YWJsZUNvbnRhaW5lci5vbignY2xpY2suZHRDaGVja2JveGVzJywgJ3Rib2R5IHRkLmR0LWNoZWNrYm94ZXMtY2VsbCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAkKCdpbnB1dFt0eXBlPVwiY2hlY2tib3hcIl0nLCB0aGlzKS5ub3QoJzpkaXNhYmxlZCcpLnRyaWdnZXIoJ2NsaWNrJyk7XHJcbiAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBIYW5kbGUgY2xpY2sgb24gbGFiZWwgbm9kZSBpbiBoZWFkaW5nIGNvbnRhaW5pbmcgXCJTZWxlY3QgYWxsXCIgY29udHJvbFxyXG4gICAgICAgICAgICAvLyBhbmQgaW4gY2VsbCBjb250YWluaW5nIGNoZWNrYm94XHJcbiAgICAgICAgICAgICR0YWJsZUNvbnRhaW5lci5vbignY2xpY2suZHRDaGVja2JveGVzJywgJ3RoZWFkIHRoLmR0LWNoZWNrYm94ZXMtc2VsZWN0LWFsbCBsYWJlbCwgdGJvZHkgdGQuZHQtY2hlY2tib3hlcy1jZWxsIGxhYmVsJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICAgICAvLyBQcmV2ZW50IGRlZmF1bHQgYmVoYXZpb3JcclxuICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIC8vIEhhbmRsZSBjbGljayBvbiBcIlNlbGVjdCBhbGxcIiBjb250cm9sIGluIGZsb2F0aW5nIGZpeGVkIGhlYWRlclxyXG4gICAgICAgICAgICAkKGRvY3VtZW50KS5vbignY2xpY2suZHRDaGVja2JveGVzJywgJy5maXhlZEhlYWRlci1mbG9hdGluZyB0aGVhZCB0aC5kdC1jaGVja2JveGVzLXNlbGVjdC1hbGwgaW5wdXRbdHlwZT1cImNoZWNrYm94XCJdJywgZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgICAgICAgIC8vIElmIEZpeGVkSGVhZGVyIGlzIGVuYWJsZWQgaW4gdGhpcyBpbnN0YW5jZVxyXG4gICAgICAgICAgICAgICBpZihjdHguX2ZpeGVkSGVhZGVyKXtcclxuICAgICAgICAgICAgICAgICAgLy8gSWYgaGVhZGVyIGlzIGZsb2F0aW5nIGluIHRoaXMgaW5zdGFuY2VcclxuICAgICAgICAgICAgICAgICAgaWYoY3R4Ll9maXhlZEhlYWRlci5kb21bJ2hlYWRlciddLmZsb2F0aW5nKXtcclxuICAgICAgICAgICAgICAgICAgICAgc2VsZi5vbkNsaWNrU2VsZWN0QWxsKGUsIHRoaXMpO1xyXG4gICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAvLyBIYW5kbGUgY2xpY2sgb24gaGVhZGluZyBjb250YWluaW5nIFwiU2VsZWN0IGFsbFwiIGNvbnRyb2wgaW4gZmxvYXRpbmcgZml4ZWQgaGVhZGVyXHJcbiAgICAgICAgICAgICQoZG9jdW1lbnQpLm9uKCdjbGljay5kdENoZWNrYm94ZXMnLCAnLmZpeGVkSGVhZGVyLWZsb2F0aW5nIHRoZWFkIHRoLmR0LWNoZWNrYm94ZXMtc2VsZWN0LWFsbCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAvLyBJZiBGaXhlZEhlYWRlciBpcyBlbmFibGVkIGluIHRoaXMgaW5zdGFuY2VcclxuICAgICAgICAgICAgICAgaWYoY3R4Ll9maXhlZEhlYWRlcil7XHJcbiAgICAgICAgICAgICAgICAgIC8vIElmIGhlYWRlciBpcyBmbG9hdGluZyBpbiB0aGlzIGluc3RhbmNlXHJcbiAgICAgICAgICAgICAgICAgIGlmKGN0eC5fZml4ZWRIZWFkZXIuZG9tWydoZWFkZXInXS5mbG9hdGluZyl7XHJcbiAgICAgICAgICAgICAgICAgICAgICQoJ2lucHV0W3R5cGU9XCJjaGVja2JveFwiXScsIHRoaXMpLnRyaWdnZXIoJ2NsaWNrJyk7XHJcbiAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIC8vIEhhbmRsZSB0YWJsZSBpbml0aWFsaXphdGlvbiBldmVudFxyXG4gICAgICAgICAgICAkdGFibGUub24oJ2luaXQuZHQuZHRDaGVja2JveGVzJywgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgLy8gVXNlIGRlbGF5IHRvIGhhbmRsZSBpbml0aWFsaXphdGlvbiBldmVudFxyXG4gICAgICAgICAgICAgICAvLyBiZWNhdXNlIGNlcnRhaW4gZXh0ZW5zaW9ucyAoRml4ZWRDb2x1bW5zKSBhcmUgaW5pdGlhbGl6ZWRcclxuICAgICAgICAgICAgICAgLy8gb25seSB3aGVuIGluaXRpYWxpemF0aW9uIGV2ZW50IGlzIHRyaWdnZXJlZC5cclxuICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgc2VsZi5vbkRhdGFUYWJsZXNJbml0KCk7XHJcbiAgICAgICAgICAgICAgIH0sIDApO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIC8vIEhhbmRsZSBzdGF0ZSBzYXZpbmcgZXZlbnRcclxuICAgICAgICAgICAgJHRhYmxlLm9uKCdzdGF0ZVNhdmVQYXJhbXMuZHQuZHRDaGVja2JveGVzJywgZnVuY3Rpb24gKGUsIHNldHRpbmdzLCBkYXRhKSB7XHJcbiAgICAgICAgICAgICAgIHNlbGYub25EYXRhVGFibGVzU3RhdGVTYXZlKGUsIHNldHRpbmdzLCBkYXRhKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAvLyBIYW5kbGUgdGFibGUgZGVzdHJveSBldmVudFxyXG4gICAgICAgICAgICAkdGFibGUub25lKCdkZXN0cm95LmR0LmR0Q2hlY2tib3hlcycsIGZ1bmN0aW9uKGUsIHNldHRpbmdzKXtcclxuICAgICAgICAgICAgICAgc2VsZi5vbkRhdGFUYWJsZXNEZXN0cm95KGUsIHNldHRpbmdzKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgIH1cclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8vIEhhbmRsZXMgRGF0YVRhYmxlcyBpbml0aWFsaXphdGlvbiBldmVudFxyXG4gICAgICBvbkRhdGFUYWJsZXNJbml0OiBmdW5jdGlvbigpe1xyXG4gICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgIHZhciBkdCA9IHNlbGYucy5kdDtcclxuICAgICAgICAgdmFyIGN0eCA9IHNlbGYucy5jdHg7XHJcblxyXG4gICAgICAgICAvLyBJZiBzZXJ2ZXItc2lkZSBwcm9jZXNzaW5nIG1vZGUgaXMgbm90IGVuYWJsZWRcclxuICAgICAgICAgLy8gTk9URTogTmVlZGVkIHRvIGF2b2lkIGR1cGxpY2F0ZSBjYWxsIHRvIHVwZGF0ZVN0YXRlQ2hlY2tib3hlcygpIGluIG9uRGF0YVRhYmxlc0RyYXcoKVxyXG4gICAgICAgICBpZighY3R4Lm9GZWF0dXJlcy5iU2VydmVyU2lkZSl7XHJcblxyXG4gICAgICAgICAgICAvLyBJZiBzdGF0ZSBzYXZpbmcgaXMgZW5hYmxlZFxyXG4gICAgICAgICAgICBpZihjdHgub0ZlYXR1cmVzLmJTdGF0ZVNhdmUpe1xyXG4gICAgICAgICAgICAgICBzZWxmLnVwZGF0ZVN0YXRlKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIEhhbmRsZSBBamF4IHJlcXVlc3QgY29tcGxldGlvbiBldmVudFxyXG4gICAgICAgICAgICAvLyBOT1RFOiBOZWVkZWQgdG8gdXBkYXRlIHRhYmxlIHN0YXRlIFxyXG4gICAgICAgICAgICAvLyBpZiB0YWJsZSBpcyByZWxvYWRlZCB2aWEgYWpheC5yZWxvYWQoKSBBUEkgbWV0aG9kXHJcbiAgICAgICAgICAgICQoZHQudGFibGUoKS5ub2RlKCkpLm9uKCd4aHIuZHQuZHRDaGVja2JveGVzJywgZnVuY3Rpb24gKCBlLCBzZXR0aW5ncyAsIGpzb24sIHhociApIHtcclxuICAgICAgICAgICAgICAgc2VsZi5vbkRhdGFUYWJsZXNYaHIoZS4gc2V0dGluZ3MsIGpzb24sIHhocik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICB9XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAvLyBIYW5kbGVzIERhdGFUYWJsZXMgdXNlciBpbml0aWF0ZWQgc2VsZWN0IGV2ZW50XHJcbiAgICAgIG9uRGF0YVRhYmxlc1VzZXJTZWxlY3Q6IGZ1bmN0aW9uICggZSwgZHQsIHR5cGUsIGNlbGwgLyosIG9yaWdpbmFsRXZlbnQqLyApe1xyXG4gICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgICAgICB2YXIgY2VsbElkeCA9IGNlbGwuaW5kZXgoKTtcclxuICAgICAgICAgdmFyIHJvd0lkeCA9IGNlbGxJZHgucm93O1xyXG4gICAgICAgICB2YXIgY29sSWR4ID0gc2VsZi5nZXRTZWxlY3RSb3dDb2xJbmRleCgpO1xyXG4gICAgICAgICB2YXIgY2VsbERhdGEgPSBkdC5jZWxsKHsgcm93OiByb3dJZHgsIGNvbHVtbjogY29sSWR4IH0pLmRhdGEoKTtcclxuXHJcbiAgICAgICAgIC8vIElmIGNoZWNrYm94IGluIHRoZSBjZWxsIGNhbm5vdCBiZSBjaGVja2VkXHJcbiAgICAgICAgIGlmKCFzZWxmLmlzQ2VsbFNlbGVjdGFibGUoY29sSWR4LCBjZWxsRGF0YSkpe1xyXG4gICAgICAgICAgICAvLyBQcmV2ZW50IHJvdyBzZWxlY3Rpb25cclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICB9XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAvLyBIYW5kbGVzIERhdGFUYWJsZXMgcm93IHNlbGVjdC9kZXNlbGVjdCBldmVudFxyXG4gICAgICBvbkRhdGFUYWJsZXNTZWxlY3REZXNlbGVjdDogZnVuY3Rpb24oZSwgdHlwZSwgaW5kZXhlcyl7XHJcbiAgICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgICAgdmFyIGR0ID0gc2VsZi5zLmR0O1xyXG5cclxuICAgICAgICAgaWYoc2VsZi5zLmlnbm9yZVNlbGVjdCl7IHJldHVybjsgfVxyXG5cclxuICAgICAgICAgaWYodHlwZSA9PT0gJ3Jvdycpe1xyXG4gICAgICAgICAgICAvLyBHZXQgaW5kZXggb2YgdGhlIGZpcnN0IGNvbHVtbiB0aGF0IGhhcyBjaGVja2JveCBhbmQgcm93IHNlbGVjdGlvbiBlbmFibGVkXHJcbiAgICAgICAgICAgIHZhciBjb2xJZHggPSBzZWxmLmdldFNlbGVjdFJvd0NvbEluZGV4KCk7XHJcbiAgICAgICAgICAgIGlmKGNvbElkeCAhPT0gbnVsbCl7XHJcbiAgICAgICAgICAgICAgIHZhciBjZWxscyA9IGR0LmNlbGxzKGluZGV4ZXMsIGNvbElkeCk7XHJcblxyXG4gICAgICAgICAgICAgICBzZWxmLnVwZGF0ZURhdGEoY2VsbHMsIGNvbElkeCwgKGUudHlwZSA9PT0gJ3NlbGVjdCcpID8gdHJ1ZSA6IGZhbHNlKTtcclxuICAgICAgICAgICAgICAgc2VsZi51cGRhdGVDaGVja2JveChjZWxscywgY29sSWR4LCAoZS50eXBlID09PSAnc2VsZWN0JykgPyB0cnVlIDogZmFsc2UpO1xyXG4gICAgICAgICAgICAgICBzZWxmLnVwZGF0ZVNlbGVjdEFsbChjb2xJZHgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgIH1cclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8vIEhhbmRsZXMgRGF0YVRhYmxlcyBzdGF0ZSBzYXZlIGV2ZW50XHJcbiAgICAgIG9uRGF0YVRhYmxlc1N0YXRlU2F2ZTogZnVuY3Rpb24gKGUsIHNldHRpbmdzLCBkYXRhKSB7XHJcbiAgICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgICAgdmFyIGN0eCA9IHNlbGYucy5jdHg7XHJcblxyXG4gICAgICAgICAvLyBJbml0aWFsaXplIGFycmF5IGhvbGRpbmcgY2hlY2tib3ggc3RhdGUgZm9yIGVhY2ggY29sdW1uXHJcbiAgICAgICAgIGRhdGEuY2hlY2tib3hlcyA9IFtdO1xyXG5cclxuICAgICAgICAgLy8gRm9yIGV2ZXJ5IGNvbHVtbiB3aGVyZSBjaGVja2JveGVzIGFyZSBlbmFibGVkXHJcbiAgICAgICAgICQuZWFjaChzZWxmLnMuY29sdW1ucywgZnVuY3Rpb24oaW5kZXgsIGNvbElkeCl7XHJcbiAgICAgICAgICAgIC8vIElmIGNoZWNrYm94IHN0YXRlIHNhdmluZyBpcyBlbmFibGVkXHJcbiAgICAgICAgICAgIGlmKGN0eC5hb0NvbHVtbnNbY29sSWR4XS5jaGVja2JveGVzLnN0YXRlU2F2ZSl7XHJcbiAgICAgICAgICAgICAgIC8vIFN0b3JlIGRhdGEgYXNzb2NpYXRlZCB3aXRoIHRoaXMgcGx1Zy1pblxyXG4gICAgICAgICAgICAgICBkYXRhLmNoZWNrYm94ZXNbY29sSWR4XSA9IHNlbGYucy5kYXRhW2NvbElkeF07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgfSk7XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAvLyBIYW5kbGVzIERhdGFUYWJsZXMgZGVzdHJveSBldmVudFxyXG4gICAgICBvbkRhdGFUYWJsZXNEZXN0cm95OiBmdW5jdGlvbigpe1xyXG4gICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgIHZhciBkdCA9IHNlbGYucy5kdDtcclxuXHJcbiAgICAgICAgIC8vIEdldCB0YWJsZSBlbGVtZW50c1xyXG4gICAgICAgICB2YXIgJHRhYmxlID0gJChkdC50YWJsZSgpLm5vZGUoKSk7XHJcbiAgICAgICAgIHZhciAkdGFibGVCb2R5ID0gJChkdC50YWJsZSgpLmJvZHkoKSk7XHJcbiAgICAgICAgIHZhciAkdGFibGVDb250YWluZXIgPSAkKGR0LnRhYmxlKCkuY29udGFpbmVyKCkpO1xyXG5cclxuICAgICAgICAgLy8gRGV0YWNoIGV2ZW50IGhhbmRsZXJzXHJcbiAgICAgICAgICQoZG9jdW1lbnQpLm9mZignY2xpY2suZHRDaGVja2JveGVzJyk7XHJcbiAgICAgICAgICR0YWJsZUNvbnRhaW5lci5vZmYoJy5kdENoZWNrYm94ZXMnKTtcclxuICAgICAgICAgJHRhYmxlQm9keS5vZmYoJy5kdENoZWNrYm94ZXMnKTtcclxuICAgICAgICAgJHRhYmxlLm9mZignLmR0Q2hlY2tib3hlcycpO1xyXG5cclxuICAgICAgICAgLy8gQ2xlYXIgZGF0YVxyXG4gICAgICAgICAvL1xyXG4gICAgICAgICAvLyBOT1RFOiBOZWVkZWQgb25seSB0byByZWR1Y2UgbWVtb3J5IGZvb3RwcmludFxyXG4gICAgICAgICAvLyBpbiBjYXNlIHVzZXIgc2F2ZXMgaW5zdGFuY2Ugb2YgRGF0YVRhYmxlIG9iamVjdC5cclxuICAgICAgICAgc2VsZi5zLmRhdGEgPSB7fTtcclxuICAgICAgICAgc2VsZi5zLmRhdGFEaXNhYmxlZCA9IHt9O1xyXG5cclxuICAgICAgICAgLy8gUmVtb3ZlIGFkZGVkIGVsZW1lbnRzXHJcbiAgICAgICAgICQoJy5kdC1jaGVja2JveGVzLXNlbGVjdC1hbGwnLCAkdGFibGUpLmVhY2goZnVuY3Rpb24oaW5kZXgsIGVsKXtcclxuICAgICAgICAgICAgJChlbClcclxuICAgICAgICAgICAgICAgLmh0bWwoJChlbCkuZGF0YSgnaHRtbCcpKVxyXG4gICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3MoJ2R0LWNoZWNrYm94ZXMtc2VsZWN0LWFsbCcpO1xyXG4gICAgICAgICB9KTtcclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8vIEhhbmRsZXMgRGF0YVRhYmxlcyBkcmF3IGV2ZW50XHJcbiAgICAgIG9uRGF0YVRhYmxlc0RyYXc6IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgICAgdmFyIGN0eCA9IHNlbGYucy5jdHg7XHJcblxyXG4gICAgICAgICAvLyBJZiBzZXJ2ZXItc2lkZSBwcm9jZXNzaW5nIGlzIGVuYWJsZWRcclxuICAgICAgICAgLy8gb3IgZGVmZXJyZWQgcmVuZGVyIGlzIGVuYWJsZWRcclxuICAgICAgICAgLy9cclxuICAgICAgICAgLy8gVE9ETzogaXQncyBub3Qgb3B0aW1hbCB0byB1cGRhdGUgc3RhdGUgb2YgY2hlY2tib3hlc1xyXG4gICAgICAgICAvLyBmb3IgYWxyZWFkeSBjcmVhdGVkIHJvd3MgaW4gZGVmZXJyZWQgcmVuZGVyaW5nIG1vZGVcclxuICAgICAgICAgaWYoY3R4Lm9GZWF0dXJlcy5iU2VydmVyU2lkZSB8fCBjdHgub0ZlYXR1cmVzLmJEZWZlclJlbmRlcil7XHJcbiAgICAgICAgICAgIHNlbGYudXBkYXRlU3RhdGVDaGVja2JveGVzKHsgcGFnZTogJ2N1cnJlbnQnLCBzZWFyY2g6ICdub25lJyB9KTtcclxuICAgICAgICAgfVxyXG5cclxuICAgICAgICAgJC5lYWNoKHNlbGYucy5jb2x1bW5zLCBmdW5jdGlvbihpbmRleCwgY29sSWR4KXtcclxuICAgICAgICAgICAgc2VsZi51cGRhdGVTZWxlY3RBbGwoY29sSWR4KTtcclxuICAgICAgICAgfSk7ICAgICAgICAgXHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAvLyBIYW5kbGVzIERhdGFUYWJsZXMgQWpheCByZXF1ZXN0IGNvbXBsZXRpb24gZXZlbnRcclxuICAgICAgb25EYXRhVGFibGVzWGhyOiBmdW5jdGlvbiggLyogZSwgc2V0dGluZ3MgLCBqc29uLCB4aHIgKi8gKXtcclxuICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgICB2YXIgZHQgPSBzZWxmLnMuZHQ7XHJcbiAgICAgICAgIHZhciBjdHggPSBzZWxmLnMuY3R4O1xyXG5cclxuICAgICAgICAgLy8gR2V0IHRhYmxlIGVsZW1lbnRzXHJcbiAgICAgICAgIHZhciAkdGFibGUgPSAkKGR0LnRhYmxlKCkubm9kZSgpKTtcclxuXHJcbiAgICAgICAgIC8vIEZvciBldmVyeSBjb2x1bW4gd2hlcmUgY2hlY2tib3hlcyBhcmUgZW5hYmxlZFxyXG4gICAgICAgICAkLmVhY2goc2VsZi5zLmNvbHVtbnMsIGZ1bmN0aW9uKGluZGV4LCBjb2xJZHgpe1xyXG4gICAgICAgICAgICAvLyBSZXNldCBkYXRhXHJcbiAgICAgICAgICAgIHNlbGYucy5kYXRhW2NvbElkeF0gPSB7fTtcclxuICAgICAgICAgICAgc2VsZi5zLmRhdGFEaXNhYmxlZFtjb2xJZHhdID0ge307XHJcbiAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgLy8gSWYgc3RhdGUgc2F2aW5nIGlzIGVuYWJsZWRcclxuICAgICAgICAgaWYoY3R4Lm9GZWF0dXJlcy5iU3RhdGVTYXZlKXtcclxuICAgICAgICAgICAgLy8gTG9hZCBwcmV2aW91cyBzdGF0ZVxyXG4gICAgICAgICAgICBzZWxmLmxvYWRTdGF0ZSgpO1xyXG5cclxuICAgICAgICAgICAgLy8gVXBkYXRlIHRhYmxlIHN0YXRlIG9uIG5leHQgcmVkcmF3XHJcbiAgICAgICAgICAgICR0YWJsZS5vbmUoJ2RyYXcuZHQuZHRDaGVja2JveGVzJywgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgc2VsZi51cGRhdGVTdGF0ZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgfVxyXG4gICAgICB9LFxyXG5cclxuICAgICAgLy8gVXBkYXRlcyBhcnJheSBob2xkaW5nIGRhdGEgZm9yIHNlbGVjdGVkIGNoZWNrYm94ZXNcclxuICAgICAgdXBkYXRlRGF0YTogZnVuY3Rpb24oY2VsbHMsIGNvbElkeCwgaXNTZWxlY3RlZCl7XHJcbiAgICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgICAgdmFyIGR0ID0gc2VsZi5zLmR0O1xyXG4gICAgICAgICB2YXIgY3R4ID0gc2VsZi5zLmN0eDtcclxuXHJcbiAgICAgICAgIC8vIElmIENoZWNrYm94ZXMgZXh0ZW5zaW9uIGlzIGVuYWJsZWQgZm9yIHRoaXMgY29sdW1uXHJcbiAgICAgICAgIGlmKGN0eC5hb0NvbHVtbnNbY29sSWR4XS5jaGVja2JveGVzKXtcclxuICAgICAgICAgICAgdmFyIGNlbGxzRGF0YSA9IGNlbGxzLmRhdGEoKTtcclxuICAgICAgICAgICAgY2VsbHNEYXRhLmVhY2goZnVuY3Rpb24oY2VsbERhdGEpe1xyXG4gICAgICAgICAgICAgICAvLyBJZiBjaGVja2JveCBpcyBjaGVja2VkXHJcbiAgICAgICAgICAgICAgIGlmKGlzU2VsZWN0ZWQpe1xyXG4gICAgICAgICAgICAgICAgICBjdHguY2hlY2tib3hlcy5zLmRhdGFbY29sSWR4XVtjZWxsRGF0YV0gPSAxO1xyXG5cclxuICAgICAgICAgICAgICAgLy8gT3RoZXJ3aXNlLCBpZiBjaGVja2JveCBpcyBub3QgY2hlY2tlZFxyXG4gICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICBkZWxldGUgY3R4LmNoZWNrYm94ZXMucy5kYXRhW2NvbElkeF1bY2VsbERhdGFdO1xyXG4gICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgLy8gSWYgc3RhdGUgc2F2aW5nIGlzIGVuYWJsZWRcclxuICAgICAgICAgICAgaWYoY3R4Lm9GZWF0dXJlcy5iU3RhdGVTYXZlKXtcclxuICAgICAgICAgICAgICAgLy8gSWYgY2hlY2tib3ggc3RhdGUgc2F2aW5nIGlzIGVuYWJsZWRcclxuICAgICAgICAgICAgICAgaWYoY3R4LmFvQ29sdW1uc1tjb2xJZHhdLmNoZWNrYm94ZXMuc3RhdGVTYXZlKXtcclxuICAgICAgICAgICAgICAgICAgLy8gU2F2ZSBzdGF0ZVxyXG4gICAgICAgICAgICAgICAgICBkdC5zdGF0ZS5zYXZlKCk7XHJcbiAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICB9XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAvLyBVcGRhdGVzIHJvdyBzZWxlY3Rpb25cclxuICAgICAgdXBkYXRlU2VsZWN0OiBmdW5jdGlvbihzZWxlY3RvciwgaXNTZWxlY3RlZCl7XHJcbiAgICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgICAgdmFyIGR0ID0gc2VsZi5zLmR0O1xyXG4gICAgICAgICB2YXIgY3R4ID0gc2VsZi5zLmN0eDtcclxuXHJcbiAgICAgICAgIC8vIElmIFNlbGVjdCBleHRlbnNpb24gaXMgZW5hYmxlZFxyXG4gICAgICAgICBpZihjdHguX3NlbGVjdCl7XHJcbiAgICAgICAgICAgIC8vIERpc2FibGUgc2VsZWN0IGV2ZW50IGhhbmxkZXIgdGVtcG9yYXJpbHlcclxuICAgICAgICAgICAgc2VsZi5zLmlnbm9yZVNlbGVjdCA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICBpZihpc1NlbGVjdGVkKXtcclxuICAgICAgICAgICAgICAgZHQucm93cyhzZWxlY3Rvcikuc2VsZWN0KCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgIGR0LnJvd3Moc2VsZWN0b3IpLmRlc2VsZWN0KCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIFJlLWVuYWJsZSBzZWxlY3QgZXZlbnQgaGFuZGxlclxyXG4gICAgICAgICAgICBzZWxmLnMuaWdub3JlU2VsZWN0ID0gZmFsc2U7XHJcbiAgICAgICAgIH1cclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8vIFVwZGF0ZXMgc3RhdGUgb2Ygc2luZ2xlIGNoZWNrYm94XHJcbiAgICAgIHVwZGF0ZUNoZWNrYm94OiBmdW5jdGlvbihjZWxscywgY29sSWR4LCBpc1NlbGVjdGVkKXtcclxuICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgICB2YXIgY3R4ID0gc2VsZi5zLmN0eDtcclxuXHJcbiAgICAgICAgIHZhciBjZWxsTm9kZXMgPSBjZWxscy5ub2RlcygpO1xyXG4gICAgICAgICBpZihjZWxsTm9kZXMubGVuZ3RoKXtcclxuICAgICAgICAgICAgJCgnaW5wdXQuZHQtY2hlY2tib3hlcycsIGNlbGxOb2Rlcykubm90KCc6ZGlzYWJsZWQnKS5wcm9wKCdjaGVja2VkJywgaXNTZWxlY3RlZCk7XHJcblxyXG4gICAgICAgICAgICAvLyBJZiBzZWxlY3RDYWxsYmFjayBpcyBhIGZ1bmN0aW9uXHJcbiAgICAgICAgICAgIGlmKCQuaXNGdW5jdGlvbihjdHguYW9Db2x1bW5zW2NvbElkeF0uY2hlY2tib3hlcy5zZWxlY3RDYWxsYmFjaykpe1xyXG4gICAgICAgICAgICAgICBjdHguYW9Db2x1bW5zW2NvbElkeF0uY2hlY2tib3hlcy5zZWxlY3RDYWxsYmFjayhjZWxsTm9kZXMsIGlzU2VsZWN0ZWQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgIH1cclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8vIFVwZGF0ZSB0YWJsZSBzdGF0ZVxyXG4gICAgICB1cGRhdGVTdGF0ZTogZnVuY3Rpb24oKXtcclxuICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgICB2YXIgZHQgPSBzZWxmLnMuZHQ7XHJcbiAgICAgICAgIHZhciBjdHggPSBzZWxmLnMuY3R4O1xyXG5cclxuICAgICAgICAgc2VsZi51cGRhdGVTdGF0ZUNoZWNrYm94ZXMoeyBwYWdlOiAnYWxsJywgc2VhcmNoOiAnbm9uZScgfSk7XHJcblxyXG4gICAgICAgICAvLyBJZiBGaXhlZENvbHVtbnMgZXh0ZW5zaW9uIGlzIGVuYWJsZWRcclxuICAgICAgICAgaWYoY3R4Ll9vRml4ZWRDb2x1bW5zKXsgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIFVzZSBkZWxheSB0byBsZXQgRml4ZWRDb2x1bW5zIGNvbnN0cnVjdCB0aGUgaGVhZGVyXHJcbiAgICAgICAgICAgIC8vIGJlZm9yZSB3ZSB1cGRhdGUgdGhlIFwiU2VsZWN0IGFsbFwiIGNoZWNrYm94XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgLy8gRm9yIGV2ZXJ5IGNvbHVtbiB3aGVyZSBjaGVja2JveGVzIGFyZSBlbmFibGVkXHJcbiAgICAgICAgICAgICAgICQuZWFjaChzZWxmLnMuY29sdW1ucywgZnVuY3Rpb24oaW5kZXgsIGNvbElkeCl7XHJcbiAgICAgICAgICAgICAgICAgIHNlbGYudXBkYXRlU2VsZWN0QWxsKGNvbElkeCk7XHJcbiAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9LCAwKTtcclxuICAgICAgICAgfVxyXG4gICAgICB9LFxyXG5cclxuICAgICAgLy8gVXBkYXRlcyBzdGF0ZSBvZiBtdWx0aXBsZSBjaGVja2JveGVzXHJcbiAgICAgIHVwZGF0ZVN0YXRlQ2hlY2tib3hlczogZnVuY3Rpb24ob3B0cyl7XHJcbiAgICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgICAgdmFyIGR0ID0gc2VsZi5zLmR0O1xyXG4gICAgICAgICB2YXIgY3R4ID0gc2VsZi5zLmN0eDtcclxuXHJcbiAgICAgICAgIC8vIEVudW1lcmF0ZSBhbGwgY2VsbHNcclxuICAgICAgICAgZHQuY2VsbHMoJ3RyJywgc2VsZi5zLmNvbHVtbnMsIG9wdHMpLmV2ZXJ5KGZ1bmN0aW9uKHJvd0lkeCwgY29sSWR4KXtcclxuICAgICAgICAgICAgLy8gR2V0IGNlbGwgZGF0YVxyXG4gICAgICAgICAgICB2YXIgY2VsbERhdGEgPSB0aGlzLmRhdGEoKTtcclxuXHJcbiAgICAgICAgICAgIC8vIERldGVybWluZSBpZiBjaGVja2JveCBpbiB0aGUgY2VsbCBjYW4gYmUgc2VsZWN0ZWRcclxuICAgICAgICAgICAgdmFyIGlzQ2VsbFNlbGVjdGFibGUgPSBzZWxmLmlzQ2VsbFNlbGVjdGFibGUoY29sSWR4LCBjZWxsRGF0YSk7XHJcblxyXG4gICAgICAgICAgICAvLyBJZiBjaGVja2JveCBpcyBjaGVja2VkXHJcbiAgICAgICAgICAgIGlmKGN0eC5jaGVja2JveGVzLnMuZGF0YVtjb2xJZHhdLmhhc093blByb3BlcnR5KGNlbGxEYXRhKSl7XHJcbiAgICAgICAgICAgICAgIHNlbGYudXBkYXRlQ2hlY2tib3godGhpcywgY29sSWR4LCB0cnVlKTtcclxuXHJcbiAgICAgICAgICAgICAgIC8vIElmIHJvdyBzZWxlY3Rpb24gaXMgZW5hYmxlZFxyXG4gICAgICAgICAgICAgICAvLyBhbmQgY2hlY2tib3ggY2FuIGJlIGNoZWNrZWRcclxuICAgICAgICAgICAgICAgaWYoY3R4LmFvQ29sdW1uc1tjb2xJZHhdLmNoZWNrYm94ZXMuc2VsZWN0Um93ICYmIGlzQ2VsbFNlbGVjdGFibGUpe1xyXG4gICAgICAgICAgICAgICAgICBzZWxmLnVwZGF0ZVNlbGVjdChyb3dJZHgsIHRydWUpO1xyXG4gICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIElmIGNoZWNrYm94IGlzIGRpc2FibGVkXHJcbiAgICAgICAgICAgIGlmKCFpc0NlbGxTZWxlY3RhYmxlKXtcclxuICAgICAgICAgICAgICAgJCgnaW5wdXQuZHQtY2hlY2tib3hlcycsIHRoaXMubm9kZSgpKS5wcm9wKCdkaXNhYmxlZCcsIHRydWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgIH0pO1xyXG4gICAgICB9LFxyXG5cclxuICAgICAgLy8gSGFuZGxlcyBjaGVja2JveCBjbGljayBldmVudFxyXG4gICAgICBvbkNsaWNrOiBmdW5jdGlvbihlLCBjdHJsKXtcclxuICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgICB2YXIgZHQgPSBzZWxmLnMuZHQ7XHJcbiAgICAgICAgIHZhciBjdHggPSBzZWxmLnMuY3R4O1xyXG5cclxuICAgICAgICAgdmFyIGNlbGxTZWxlY3RvcjtcclxuXHJcbiAgICAgICAgIC8vIEdldCBjZWxsXHJcbiAgICAgICAgIHZhciAkY2VsbCA9ICQoY3RybCkuY2xvc2VzdCgndGQnKTtcclxuXHJcbiAgICAgICAgIC8vIElmIGNlbGwgaXMgaW4gYSBmaXhlZCBjb2x1bW4gdXNpbmcgRml4ZWRDb2x1bW5zIGV4dGVuc2lvblxyXG4gICAgICAgICBpZigkY2VsbC5wYXJlbnRzKCcuRFRGQ19DbG9uZWQnKS5sZW5ndGgpe1xyXG4gICAgICAgICAgICBjZWxsU2VsZWN0b3IgPSBkdC5maXhlZENvbHVtbnMoKS5jZWxsSW5kZXgoJGNlbGwpO1xyXG5cclxuICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY2VsbFNlbGVjdG9yID0gJGNlbGw7XHJcbiAgICAgICAgIH1cclxuXHJcbiAgICAgICAgIHZhciBjZWxsICAgID0gZHQuY2VsbChjZWxsU2VsZWN0b3IpO1xyXG4gICAgICAgICB2YXIgY2VsbElkeCA9IGNlbGwuaW5kZXgoKTtcclxuICAgICAgICAgdmFyIGNvbElkeCAgPSBjZWxsSWR4LmNvbHVtbjtcclxuXHJcbiAgICAgICAgIC8vIElmIHJvdyBzZWxlY3Rpb24gaXMgbm90IGVuYWJsZWRcclxuICAgICAgICAgLy8gTk9URTogaWYgcm93IHNlbGVjdGlvbiBpcyBlbmFibGVkLCBjaGVja2JveCBzZWxlY3Rpb24vZGVzZWxlY3Rpb25cclxuICAgICAgICAgLy8gd291bGQgYmUgaGFuZGxlZCBieSBvbkRhdGFUYWJsZXNTZWxlY3REZXNlbGVjdCBldmVudCBoYW5kbGVyIGluc3RlYWRcclxuICAgICAgICAgaWYoIWN0eC5hb0NvbHVtbnNbY29sSWR4XS5jaGVja2JveGVzLnNlbGVjdFJvdyl7XHJcbiAgICAgICAgICAgIGNlbGwuY2hlY2tib3hlcy5zZWxlY3QoY3RybC5jaGVja2VkKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFByZXZlbnQgY2xpY2sgZXZlbnQgZnJvbSBwcm9wYWdhdGluZyB0byBwYXJlbnRcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuXHJcbiAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIFdPUktBUk9VTkQ6XHJcbiAgICAgICAgICAgIC8vIFNlbGVjdCBleHRlbnNpb24gbWF5IGtlZXAgdGhlIHJvdyBzZWxlY3RlZFxyXG4gICAgICAgICAgICAvLyB3aGVuIGNoZWNrYm94IGlzIHVuY2hlY2tlZCB3aXRoIFNISUZUIGtleS5cclxuICAgICAgICAgICAgLy9cclxuICAgICAgICAgICAgLy8gV2UgbmVlZCB0byB1cGRhdGUgdGhlIHN0YXRlIG9mIHRoZSBjaGVja2JveCBBRlRFUiBoYW5kbGluZ1xyXG4gICAgICAgICAgICAvLyBzZWxlY3QvZGVzZWxlY3QgZXZlbnQgZnJvbSBTZWxlY3QgZXh0ZW5zaW9uLlxyXG4gICAgICAgICAgICAvL1xyXG4gICAgICAgICAgICAvLyBDYWxsIHRvIHNldFRpbWVvdXQgaXMgbmVlZGVkIHRvIGxldCBzZWxlY3QvZGVzZWxlY3QgZXZlbnQgaGFuZGxlclxyXG4gICAgICAgICAgICAvLyB1cGRhdGUgdGhlIGRhdGEgZmlyc3QuXHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgLy8gR2V0IGNlbGwgZGF0YVxyXG4gICAgICAgICAgICAgICB2YXIgY2VsbERhdGEgPSBjZWxsLmRhdGEoKTtcclxuXHJcbiAgICAgICAgICAgICAgIC8vIERldGVybWluZSB3aGV0aGVyIGRhdGEgaXMgaW4gdGhlIGxpc3RcclxuICAgICAgICAgICAgICAgdmFyIGhhc0RhdGEgPSBzZWxmLnMuZGF0YVtjb2xJZHhdLmhhc093blByb3BlcnR5KGNlbGxEYXRhKTtcclxuXHJcbiAgICAgICAgICAgICAgIC8vIElmIHN0YXRlIG9mIHRoZSBjaGVja2JveCBuZWVkcyB0byBiZSB1cGRhdGVkXHJcbiAgICAgICAgICAgICAgIGlmKGhhc0RhdGEgIT09IGN0cmwuY2hlY2tlZCl7XHJcbiAgICAgICAgICAgICAgICAgIHNlbGYudXBkYXRlQ2hlY2tib3goY2VsbCwgY29sSWR4LCBoYXNEYXRhKTtcclxuICAgICAgICAgICAgICAgICAgc2VsZi51cGRhdGVTZWxlY3RBbGwoY29sSWR4KTtcclxuICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCAwKTtcclxuICAgICAgICAgfVxyXG4gICAgICB9LFxyXG5cclxuICAgICAgLy8gSGFuZGxlcyBjaGVja2JveCBjbGljayBldmVudFxyXG4gICAgICBvbkNsaWNrU2VsZWN0QWxsOiBmdW5jdGlvbihlLCBjdHJsKXtcclxuICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgICB2YXIgZHQgPSBzZWxmLnMuZHQ7XHJcbiAgICAgICAgIHZhciBjdHggPSBzZWxmLnMuY3R4O1xyXG5cclxuICAgICAgICAgLy8gQ2FsY3VsYXRlIGNvbHVtbiBpbmRleFxyXG4gICAgICAgICB2YXIgY29sSWR4ID0gbnVsbDtcclxuICAgICAgICAgdmFyICR0aCA9ICQoY3RybCkuY2xvc2VzdCgndGgnKTtcclxuXHJcbiAgICAgICAgIC8vIElmIGNvbHVtbiBpcyBmaXhlZCB1c2luZyBGaXhlZENvbHVtbnMgZXh0ZW5zaW9uXHJcbiAgICAgICAgIGlmKCR0aC5wYXJlbnRzKCcuRFRGQ19DbG9uZWQnKS5sZW5ndGgpe1xyXG4gICAgICAgICAgICB2YXIgY2VsbElkeCA9IGR0LmZpeGVkQ29sdW1ucygpLmNlbGxJbmRleCgkdGgpO1xyXG4gICAgICAgICAgICBjb2xJZHggPSBjZWxsSWR4LmNvbHVtbjtcclxuICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29sSWR4ID0gZHQuY29sdW1uKCR0aCkuaW5kZXgoKTtcclxuICAgICAgICAgfVxyXG5cclxuICAgICAgICAgLy8gSW5kaWNhdGUgdGhhdCBzdGF0ZSBvZiBcIlNlbGVjdCBhbGxcIiBjb250cm9sIGhhcyBiZWVuIGNoYW5nZWRcclxuICAgICAgICAgJChjdHJsKS5kYXRhKCdpcy1jaGFuZ2VkJywgdHJ1ZSk7XHJcblxyXG4gICAgICAgICBkdC5jb2x1bW4oY29sSWR4LCB7XHJcbiAgICAgICAgICAgIHBhZ2U6IChcclxuICAgICAgICAgICAgICAgKGN0eC5hb0NvbHVtbnNbY29sSWR4XS5jaGVja2JveGVzICYmIGN0eC5hb0NvbHVtbnNbY29sSWR4XS5jaGVja2JveGVzLnNlbGVjdEFsbFBhZ2VzKVxyXG4gICAgICAgICAgICAgICAgICA/ICdhbGwnXHJcbiAgICAgICAgICAgICAgICAgIDogJ2N1cnJlbnQnXHJcbiAgICAgICAgICAgICksXHJcbiAgICAgICAgICAgIHNlYXJjaDogJ2FwcGxpZWQnXHJcbiAgICAgICAgIH0pLmNoZWNrYm94ZXMuc2VsZWN0KGN0cmwuY2hlY2tlZCk7XHJcblxyXG4gICAgICAgICAvLyBQcmV2ZW50IGNsaWNrIGV2ZW50IGZyb20gcHJvcGFnYXRpbmcgdG8gcGFyZW50XHJcbiAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAvLyBMb2FkcyBwcmV2aW9zbHkgc2F2ZWQgc2F0ZVxyXG4gICAgICBsb2FkU3RhdGU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgICB2YXIgZHQgPSBzZWxmLnMuZHQ7XHJcbiAgICAgICAgIHZhciBjdHggPSBzZWxmLnMuY3R4O1xyXG5cclxuICAgICAgICAgLy8gSWYgc3RhdGUgc2F2aW5nIGlzIGVuYWJsZWRcclxuICAgICAgICAgaWYoY3R4Lm9GZWF0dXJlcy5iU3RhdGVTYXZlKXtcclxuICAgICAgICAgICAgLy8gUmV0cmlldmUgc3RvcmVkIHN0YXRlXHJcbiAgICAgICAgICAgIHZhciBzdGF0ZSA9IGR0LnN0YXRlLmxvYWRlZCgpO1xyXG5cclxuICAgICAgICAgICAgLy8gRm9yIGV2ZXJ5IGNvbHVtbiB3aGVyZSBjaGVja2JveGVzIGFyZSBlbmFibGVkXHJcbiAgICAgICAgICAgICQuZWFjaChzZWxmLnMuY29sdW1ucywgZnVuY3Rpb24oaW5kZXgsIGNvbElkeCl7XHJcbiAgICAgICAgICAgICAgIC8vIElmIHN0YXRlIGlzIGxvYWRlZCBhbmQgY29udGFpbnMgZGF0YSBmb3IgdGhpcyBjb2x1bW5cclxuICAgICAgICAgICAgICAgaWYoc3RhdGUgJiYgc3RhdGUuY2hlY2tib3hlcyAmJiBzdGF0ZS5jaGVja2JveGVzLmhhc093blByb3BlcnR5KGNvbElkeCkpe1xyXG4gICAgICAgICAgICAgICAgICAvLyBJZiBjaGVja2JveCBzdGF0ZSBzYXZpbmcgaXMgZW5hYmxlZFxyXG4gICAgICAgICAgICAgICAgICBpZihjdHguYW9Db2x1bW5zW2NvbElkeF0uY2hlY2tib3hlcy5zdGF0ZVNhdmUpe1xyXG4gICAgICAgICAgICAgICAgICAgICAvLyBMb2FkIHByZXZpb3VzIHN0YXRlXHJcbiAgICAgICAgICAgICAgICAgICAgIHNlbGYucy5kYXRhW2NvbElkeF0gPSBzdGF0ZS5jaGVja2JveGVzW2NvbElkeF07XHJcbiAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgfVxyXG4gICAgICB9LFxyXG5cclxuICAgICAgLy8gVXBkYXRlcyBzdGF0ZSBvZiB0aGUgXCJTZWxlY3QgYWxsXCIgY29udHJvbHNcclxuICAgICAgdXBkYXRlU2VsZWN0QWxsOiBmdW5jdGlvbihjb2xJZHgpe1xyXG4gICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgIHZhciBkdCA9IHNlbGYucy5kdDtcclxuICAgICAgICAgdmFyIGN0eCA9IHNlbGYucy5jdHg7XHJcblxyXG4gICAgICAgICAvLyBJZiBDaGVja2JveGVzIGV4dGVuc2lvbiBpcyBlbmFibGVkIGZvciB0aGlzIGNvbHVtblxyXG4gICAgICAgICAvLyBhbmQgXCJTZWxlY3QgYWxsXCIgY29udHJvbCBpcyBlbmFibGVkIGZvciB0aGlzIGNvbHVtblxyXG4gICAgICAgICBpZihjdHguYW9Db2x1bW5zW2NvbElkeF0uY2hlY2tib3hlcyAmJiBjdHguYW9Db2x1bW5zW2NvbElkeF0uY2hlY2tib3hlcy5zZWxlY3RBbGwpe1xyXG4gICAgICAgICAgICB2YXIgY2VsbHMgPSBkdC5jZWxscygndHInLCBjb2xJZHgsIHtcclxuICAgICAgICAgICAgICAgcGFnZTogKFxyXG4gICAgICAgICAgICAgICAgICAoY3R4LmFvQ29sdW1uc1tjb2xJZHhdLmNoZWNrYm94ZXMuc2VsZWN0QWxsUGFnZXMpXHJcbiAgICAgICAgICAgICAgICAgICAgID8gJ2FsbCdcclxuICAgICAgICAgICAgICAgICAgICAgOiAnY3VycmVudCdcclxuICAgICAgICAgICAgICAgKSxcclxuICAgICAgICAgICAgICAgc2VhcmNoOiAnYXBwbGllZCdcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB2YXIgJHRhYmxlQ29udGFpbmVyID0gZHQudGFibGUoKS5jb250YWluZXIoKTtcclxuICAgICAgICAgICAgdmFyICRjaGVja2JveGVzU2VsZWN0QWxsID0gJCgnLmR0LWNoZWNrYm94ZXMtc2VsZWN0LWFsbFtkYXRhLWNvbD1cIicgKyBjb2xJZHggKyAnXCJdIGlucHV0W3R5cGU9XCJjaGVja2JveFwiXScsICR0YWJsZUNvbnRhaW5lcik7XHJcblxyXG4gICAgICAgICAgICB2YXIgY291bnRDaGVja2VkID0gMDtcclxuICAgICAgICAgICAgdmFyIGNvdW50RGlzYWJsZWQgPSAwO1xyXG4gICAgICAgICAgICB2YXIgY2VsbHNEYXRhID0gY2VsbHMuZGF0YSgpO1xyXG4gICAgICAgICAgICAkLmVhY2goY2VsbHNEYXRhLCBmdW5jdGlvbihpbmRleCwgY2VsbERhdGEpe1xyXG4gICAgICAgICAgICAgICAvLyBJZiBjaGVja2JveCBpcyBub3QgZGlzYWJsZWRcclxuICAgICAgICAgICAgICAgaWYoc2VsZi5pc0NlbGxTZWxlY3RhYmxlKGNvbElkeCwgY2VsbERhdGEpKXtcclxuICAgICAgICAgICAgICAgICAgaWYoc2VsZi5zLmRhdGFbY29sSWR4XS5oYXNPd25Qcm9wZXJ0eShjZWxsRGF0YSkpeyBjb3VudENoZWNrZWQrKzsgfVxyXG5cclxuICAgICAgICAgICAgICAgLy8gT3RoZXJ3aXNlLCBpZiBjaGVja2JveCBpcyBkaXNhYmxlZFxyXG4gICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICBjb3VudERpc2FibGVkKys7XHJcbiAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAvLyBJZiBGaXhlZEhlYWRlciBpcyBlbmFibGVkIGluIHRoaXMgaW5zdGFuY2VcclxuICAgICAgICAgICAgaWYoY3R4Ll9maXhlZEhlYWRlcil7XHJcbiAgICAgICAgICAgICAgIC8vIElmIGhlYWRlciBpcyBmbG9hdGluZyBpbiB0aGlzIGluc3RhbmNlXHJcbiAgICAgICAgICAgICAgIGlmKGN0eC5fZml4ZWRIZWFkZXIuZG9tWydoZWFkZXInXS5mbG9hdGluZyl7XHJcbiAgICAgICAgICAgICAgICAgICRjaGVja2JveGVzU2VsZWN0QWxsID0gJCgnLmZpeGVkSGVhZGVyLWZsb2F0aW5nIC5kdC1jaGVja2JveGVzLXNlbGVjdC1hbGxbZGF0YS1jb2w9XCInICsgY29sSWR4ICsgJ1wiXSBpbnB1dFt0eXBlPVwiY2hlY2tib3hcIl0nKTtcclxuICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB2YXIgaXNTZWxlY3RlZDtcclxuICAgICAgICAgICAgdmFyIGlzSW5kZXRlcm1pbmF0ZTtcclxuXHJcbiAgICAgICAgICAgIC8vIElmIG5vbmUgb2YgdGhlIGNoZWNrYm94ZXMgYXJlIGNoZWNrZWRcclxuICAgICAgICAgICAgaWYgKGNvdW50Q2hlY2tlZCA9PT0gMCl7XHJcbiAgICAgICAgICAgICAgIGlzU2VsZWN0ZWQgICAgICA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICBpc0luZGV0ZXJtaW5hdGUgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgIC8vIElmIGFsbCBvZiB0aGUgY2hlY2tib3hlcyBhcmUgY2hlY2tlZFxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKChjb3VudENoZWNrZWQgKyBjb3VudERpc2FibGVkKSA9PT0gY2VsbHNEYXRhLmxlbmd0aCl7XHJcbiAgICAgICAgICAgICAgIGlzU2VsZWN0ZWQgICAgICA9IHRydWU7XHJcbiAgICAgICAgICAgICAgIGlzSW5kZXRlcm1pbmF0ZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgLy8gSWYgc29tZSBvZiB0aGUgY2hlY2tib3hlcyBhcmUgY2hlY2tlZFxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICBpc1NlbGVjdGVkICAgICAgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICBpc0luZGV0ZXJtaW5hdGUgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB2YXIgaXNDaGFuZ2VkICAgICAgICAgID0gJGNoZWNrYm94ZXNTZWxlY3RBbGwuZGF0YSgnaXMtY2hhbmdlZCcpO1xyXG4gICAgICAgICAgICB2YXIgaXNTZWxlY3RlZE5vdyAgICAgID0gJGNoZWNrYm94ZXNTZWxlY3RBbGwucHJvcCgnY2hlY2tlZCcpO1xyXG4gICAgICAgICAgICB2YXIgaXNJbmRldGVybWluYXRlTm93ID0gJGNoZWNrYm94ZXNTZWxlY3RBbGwucHJvcCgnaW5kZXRlcm1pbmF0ZScpO1xyXG5cclxuICAgICAgICAgICAgLy8gSWYgc3RhdGUgb2YgXCJTZWxlY3QgYWxsXCIgY29udHJvbCBoYXMgYmVlbiBjaGFuZ2VkXHJcbiAgICAgICAgICAgIGlmKGlzQ2hhbmdlZCB8fCBpc1NlbGVjdGVkTm93ICE9PSBpc1NlbGVjdGVkIHx8IGlzSW5kZXRlcm1pbmF0ZU5vdyAhPT0gaXNJbmRldGVybWluYXRlKXtcclxuICAgICAgICAgICAgICAgLy8gUmVzZXQgXCJTZWxlY3QgYWxsXCIgY29udHJvbCBzdGF0ZSBmbGFnXHJcbiAgICAgICAgICAgICAgICRjaGVja2JveGVzU2VsZWN0QWxsLmRhdGEoJ2lzLWNoYW5nZWQnLCBmYWxzZSk7XHJcblxyXG4gICAgICAgICAgICAgICAkY2hlY2tib3hlc1NlbGVjdEFsbC5wcm9wKHtcclxuICAgICAgICAgICAgICAgICAgLy8gTk9URTogSWYgY2hlY2tib3ggaGFzIGluZGV0ZXJtaW5hdGUgc3RhdGUsIFxyXG4gICAgICAgICAgICAgICAgICAvLyBcImNoZWNrZWRcIiBwcm9wZXJ0eSBtdXN0IGJlIHNldCB0byBmYWxzZS5cclxuICAgICAgICAgICAgICAgICAgJ2NoZWNrZWQnOiBpc0luZGV0ZXJtaW5hdGUgPyBmYWxzZSA6IGlzU2VsZWN0ZWQsXHJcbiAgICAgICAgICAgICAgICAgICdpbmRldGVybWluYXRlJzogaXNJbmRldGVybWluYXRlXHJcbiAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgLy8gSWYgc2VsZWN0QWxsQ2FsbGJhY2sgaXMgYSBmdW5jdGlvblxyXG4gICAgICAgICAgICAgICBpZigkLmlzRnVuY3Rpb24oY3R4LmFvQ29sdW1uc1tjb2xJZHhdLmNoZWNrYm94ZXMuc2VsZWN0QWxsQ2FsbGJhY2spKXtcclxuICAgICAgICAgICAgICAgICAgY3R4LmFvQ29sdW1uc1tjb2xJZHhdLmNoZWNrYm94ZXMuc2VsZWN0QWxsQ2FsbGJhY2soJGNoZWNrYm94ZXNTZWxlY3RBbGwuY2xvc2VzdCgndGgnKS5nZXQoMCksIGlzU2VsZWN0ZWQsIGlzSW5kZXRlcm1pbmF0ZSk7XHJcbiAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICB9XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAvLyBVcGRhdGVzIHRoZSBpbmZvcm1hdGlvbiBlbGVtZW50IG9mIHRoZSBEYXRhVGFibGUgc2hvd2luZyBpbmZvcm1hdGlvbiBhYm91dCB0aGVcclxuICAgICAgLy8gaXRlbXMgc2VsZWN0ZWQuIEJhc2VkIG9uIGluZm8oKSBtZXRob2Qgb2YgU2VsZWN0IGV4dGVuc2lvbi5cclxuICAgICAgc2hvd0luZm9TZWxlY3RlZDogZnVuY3Rpb24oKXtcclxuICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgICB2YXIgZHQgPSBzZWxmLnMuZHQ7XHJcbiAgICAgICAgIHZhciBjdHggPSBzZWxmLnMuY3R4O1xyXG5cclxuICAgICAgICAgaWYgKCAhIGN0eC5hYW5GZWF0dXJlcy5pICkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgIH1cclxuXHJcbiAgICAgICAgIC8vIEdldCBpbmRleCBvZiB0aGUgZmlyc3QgY29sdW1uIHRoYXQgaGFzIGNoZWNrYm94IGFuZCByb3cgc2VsZWN0aW9uIGVuYWJsZWRcclxuICAgICAgICAgdmFyIGNvbElkeCA9IHNlbGYuZ2V0U2VsZWN0Um93Q29sSW5kZXgoKTtcclxuXHJcbiAgICAgICAgIC8vIElmIHRoZXJlIGlzIGEgY29sdW1uIHRoYXQgaGFzIGNoZWNrYm94IGFuZCByb3cgc2VsZWN0aW9uIGVuYWJsZWRcclxuICAgICAgICAgaWYoY29sSWR4ICE9PSBudWxsKXtcclxuICAgICAgICAgICAgLy8gQ291bnQgbnVtYmVyIG9mIHNlbGVjdGVkIHJvd3NcclxuICAgICAgICAgICAgdmFyIGNvdW50Um93cyA9IDA7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGNlbGxEYXRhIGluIGN0eC5jaGVja2JveGVzLnMuZGF0YVtjb2xJZHhdKXtcclxuICAgICAgICAgICAgICAgaWYgKGN0eC5jaGVja2JveGVzLnMuZGF0YVtjb2xJZHhdLmhhc093blByb3BlcnR5KGNlbGxEYXRhKSl7XHJcbiAgICAgICAgICAgICAgICAgIGNvdW50Um93cysrO1xyXG4gICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHZhciBhZGQgPSBmdW5jdGlvbigkZWwsIG5hbWUsIG51bSl7XHJcbiAgICAgICAgICAgICAgICRlbC5hcHBlbmQoICQoJzxzcGFuIGNsYXNzPVwic2VsZWN0LWl0ZW1cIi8+JykuYXBwZW5kKCBkdC5pMThuKFxyXG4gICAgICAgICAgICAgICAgICAnc2VsZWN0LicrbmFtZSsncycsXHJcbiAgICAgICAgICAgICAgICAgIHsgXzogJyVkICcrbmFtZSsncyBzZWxlY3RlZCcsIDA6ICcnLCAxOiAnMSAnK25hbWUrJyBzZWxlY3RlZCcgfSxcclxuICAgICAgICAgICAgICAgICAgbnVtXHJcbiAgICAgICAgICAgICAgICkgKSApO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgLy8gSW50ZXJuYWwga25vd2xlZGdlIG9mIERhdGFUYWJsZXMgdG8gbG9vcCBvdmVyIGFsbCBpbmZvcm1hdGlvbiBlbGVtZW50c1xyXG4gICAgICAgICAgICAkLmVhY2goIGN0eC5hYW5GZWF0dXJlcy5pLCBmdW5jdGlvbiAoIGksIGVsICkge1xyXG4gICAgICAgICAgICAgICB2YXIgJGVsID0gJChlbCk7XHJcblxyXG4gICAgICAgICAgICAgICB2YXIgJG91dHB1dCAgPSAkKCc8c3BhbiBjbGFzcz1cInNlbGVjdC1pbmZvXCIvPicpO1xyXG4gICAgICAgICAgICAgICBhZGQoJG91dHB1dCwgJ3JvdycsIGNvdW50Um93cyk7XHJcblxyXG4gICAgICAgICAgICAgICB2YXIgJGV4aXN0aW5nID0gJGVsLmNoaWxkcmVuKCdzcGFuLnNlbGVjdC1pbmZvJyk7XHJcbiAgICAgICAgICAgICAgIGlmKCRleGlzdGluZy5sZW5ndGgpe1xyXG4gICAgICAgICAgICAgICAgICAkZXhpc3RpbmcucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgIGlmKCRvdXRwdXQudGV4dCgpICE9PSAnJyl7XHJcbiAgICAgICAgICAgICAgICAgICRlbC5hcHBlbmQoJG91dHB1dCk7XHJcbiAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgIH1cclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8vIERldGVybWluZXMgd2hldGhlciBjaGVja2JveCBpbiB0aGUgY2VsbCBjYW4gYmUgY2hlY2tlZFxyXG4gICAgICBpc0NlbGxTZWxlY3RhYmxlOiBmdW5jdGlvbihjb2xJZHgsIGNlbGxEYXRhKXtcclxuICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgICB2YXIgY3R4ID0gc2VsZi5zLmN0eDtcclxuXHJcbiAgICAgICAgIC8vIElmIGRhdGEgaXMgaW4gdGhlIGxpc3Qgb2YgZGlzYWJsZWQgZWxlbWVudHNcclxuICAgICAgICAgaWYoY3R4LmNoZWNrYm94ZXMucy5kYXRhRGlzYWJsZWRbY29sSWR4XS5oYXNPd25Qcm9wZXJ0eShjZWxsRGF0YSkpe1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgICAgICAvLyBPdGhlcndpc2UsIGlmIGNoZWNrYm94IGNhbiBiZSBzZWxlY3RlZFxyXG4gICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgfVxyXG4gICAgICB9LFxyXG5cclxuICAgICAgLy8gR2V0cyBjZWxsIGluZGV4XHJcbiAgICAgIGdldENlbGxJbmRleDogZnVuY3Rpb24oY2VsbCl7XHJcbiAgICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgICAgdmFyIGR0ID0gc2VsZi5zLmR0O1xyXG4gICAgICAgICB2YXIgY3R4ID0gc2VsZi5zLmN0eDtcclxuXHJcbiAgICAgICAgIC8vIElmIEZpeGVkQ29sdW1ucyBleHRlbnNpb24gaXMgYXZhaWxhYmxlXHJcbiAgICAgICAgIGlmKGN0eC5fb0ZpeGVkQ29sdW1ucyl7XHJcbiAgICAgICAgICAgIHJldHVybiBkdC5maXhlZENvbHVtbnMoKS5jZWxsSW5kZXgoY2VsbCk7XHJcblxyXG4gICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gZHQuY2VsbChjZWxsKS5pbmRleCgpO1xyXG4gICAgICAgICB9XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAvLyBHZXRzIGluZGV4IG9mIHRoZSBmaXJzdCBjb2x1bW4gdGhhdCBoYXMgY2hlY2tib3ggYW5kIHJvdyBzZWxlY3Rpb24gZW5hYmxlZFxyXG4gICAgICBnZXRTZWxlY3RSb3dDb2xJbmRleDogZnVuY3Rpb24oKXtcclxuICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgICB2YXIgY3R4ID0gc2VsZi5zLmN0eDtcclxuXHJcbiAgICAgICAgIHZhciBjb2xJZHggPSBudWxsO1xyXG5cclxuICAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IGN0eC5hb0NvbHVtbnMubGVuZ3RoOyBpKyspe1xyXG4gICAgICAgICAgICAvLyBJZiBDaGVja2JveGVzIGV4dGVuc2lvbiBpcyBlbmFibGVkXHJcbiAgICAgICAgICAgIC8vIGFuZCByb3cgc2VsZWN0aW9uIGlzIGVuYWJsZWQgZm9yIHRoaXMgY29sdW1uXHJcbiAgICAgICAgICAgIGlmKGN0eC5hb0NvbHVtbnNbaV0uY2hlY2tib3hlcyAmJiBjdHguYW9Db2x1bW5zW2ldLmNoZWNrYm94ZXMuc2VsZWN0Um93KXtcclxuICAgICAgICAgICAgICAgY29sSWR4ID0gaTtcclxuICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgfVxyXG5cclxuICAgICAgICAgcmV0dXJuIGNvbElkeDtcclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8vIFVwZGF0ZXMgZml4ZWQgY29sdW1uIGlmIEZpeGVkQ29sdW1ucyBleHRlbnNpb24gaXMgZW5hYmxlZFxyXG4gICAgICAvLyBhbmQgZ2l2ZW4gY29sdW1uIGlzIGluc2lkZSBhIGZpeGVkIGNvbHVtblxyXG4gICAgICB1cGRhdGVGaXhlZENvbHVtbjogZnVuY3Rpb24oY29sSWR4KXtcclxuICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgICB2YXIgZHQgPSBzZWxmLnMuZHQ7XHJcbiAgICAgICAgIHZhciBjdHggPSBzZWxmLnMuY3R4O1xyXG5cclxuICAgICAgICAgLy8gSWYgRml4ZWRDb2x1bW5zIGV4dGVuc2lvbiBpcyBlbmFibGVkXHJcbiAgICAgICAgIGlmKGN0eC5fb0ZpeGVkQ29sdW1ucyl7XHJcbiAgICAgICAgICAgIHZhciBsZWZ0Q29scyA9IGN0eC5fb0ZpeGVkQ29sdW1ucy5zLmlMZWZ0Q29sdW1ucztcclxuICAgICAgICAgICAgdmFyIHJpZ2h0Q29scyA9IGN0eC5hb0NvbHVtbnMubGVuZ3RoIC0gY3R4Ll9vRml4ZWRDb2x1bW5zLnMuaVJpZ2h0Q29sdW1ucyAtIDE7XHJcblxyXG4gICAgICAgICAgICBpZiAoY29sSWR4IDwgbGVmdENvbHMgfHwgY29sSWR4ID4gcmlnaHRDb2xzKXtcclxuICAgICAgICAgICAgICAgLy8gVXBkYXRlIHRoZSBkYXRhIHNob3duIGluIHRoZSBmaXhlZCBjb2x1bW5cclxuICAgICAgICAgICAgICAgZHQuZml4ZWRDb2x1bW5zKCkudXBkYXRlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAvLyBVc2UgZGVsYXkgdG8gbGV0IEZpeGVkQ29sdW1ucyBjb25zdHJ1Y3QgdGhlIGhlYWRlclxyXG4gICAgICAgICAgICAgICAvLyBiZWZvcmUgd2UgdXBkYXRlIHRoZSBcIlNlbGVjdCBhbGxcIiBjaGVja2JveFxyXG4gICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgIC8vIEZvciBldmVyeSBjb2x1bW4gd2hlcmUgY2hlY2tib3hlcyBhcmUgZW5hYmxlZFxyXG4gICAgICAgICAgICAgICAgICAkLmVhY2goc2VsZi5zLmNvbHVtbnMsIGZ1bmN0aW9uKGluZGV4LCBjb2xJZHgpe1xyXG4gICAgICAgICAgICAgICAgICAgICBzZWxmLnVwZGF0ZVNlbGVjdEFsbChjb2xJZHgpO1xyXG4gICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgfSwgMCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgIH07XHJcblxyXG5cclxuICAgLyoqXHJcbiAgICogQ2hlY2tib3hlcyBkZWZhdWx0IHNldHRpbmdzIGZvciBpbml0aWFsaXNhdGlvblxyXG4gICAqXHJcbiAgICogQG5hbWVzcGFjZVxyXG4gICAqIEBuYW1lIENoZWNrYm94ZXMuZGVmYXVsdHNcclxuICAgKiBAc3RhdGljXHJcbiAgICovXHJcbiAgIENoZWNrYm94ZXMuZGVmYXVsdHMgPSB7XHJcbiAgICAgIC8qKlxyXG4gICAgICAqIEVuYWJsZSAvIGRpc2FibGUgY2hlY2tib3ggc3RhdGUgbG9hZGluZy9zYXZpbmcgaWYgc3RhdGUgc2F2aW5nIGlzIGVuYWJsZWQgZ2xvYmFsbHlcclxuICAgICAgKlxyXG4gICAgICAqIEB0eXBlIHtCb29sZWFufVxyXG4gICAgICAqIEBkZWZhdWx0IGB0cnVlYFxyXG4gICAgICAqL1xyXG4gICAgICBzdGF0ZVNhdmU6IHRydWUsXHJcblxyXG4gICAgICAvKipcclxuICAgICAgKiBFbmFibGUgLyBkaXNhYmxlIHJvdyBzZWxlY3Rpb25cclxuICAgICAgKlxyXG4gICAgICAqIEB0eXBlIHtCb29sZWFufVxyXG4gICAgICAqIEBkZWZhdWx0IGBmYWxzZWBcclxuICAgICAgKi9cclxuICAgICAgc2VsZWN0Um93OiBmYWxzZSxcclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAqIEVuYWJsZSAvIGRpc2FibGUgXCJzZWxlY3QgYWxsXCIgY29udHJvbCBpbiB0aGUgaGVhZGVyXHJcbiAgICAgICpcclxuICAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cclxuICAgICAgKiBAZGVmYXVsdCBgdHJ1ZWBcclxuICAgICAgKi9cclxuICAgICAgc2VsZWN0QWxsOiB0cnVlLFxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICogRW5hYmxlIC8gZGlzYWJsZSBhYmlsaXR5IHRvIHNlbGVjdCBjaGVja2JveGVzIGZyb20gYWxsIHBhZ2VzXHJcbiAgICAgICpcclxuICAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cclxuICAgICAgKiBAZGVmYXVsdCBgdHJ1ZWBcclxuICAgICAgKi9cclxuICAgICAgc2VsZWN0QWxsUGFnZXM6IHRydWUsXHJcblxyXG4gICAgICAvKipcclxuICAgICAgKiBDaGVja2JveCBzZWxlY3QvZGVzZWxlY3QgY2FsbGJhY2tcclxuICAgICAgKlxyXG4gICAgICAqIEB0eXBlIHtGdW5jdGlvbn1cclxuICAgICAgKiBAZGVmYXVsdCAgYG51bGxgXHJcbiAgICAgICovXHJcbiAgICAgIHNlbGVjdENhbGxiYWNrOiBudWxsLFxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICogXCJTZWxlY3QgYWxsXCIgY29udHJvbCBzZWxlY3QvZGVzZWxlY3QgY2FsbGJhY2tcclxuICAgICAgKlxyXG4gICAgICAqIEB0eXBlIHtGdW5jdGlvbn1cclxuICAgICAgKiBAZGVmYXVsdCAgYG51bGxgXHJcbiAgICAgICovXHJcbiAgICAgIHNlbGVjdEFsbENhbGxiYWNrOiBudWxsLFxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICogXCJTZWxlY3QgYWxsXCIgY29udHJvbCBtYXJrdXBcclxuICAgICAgKlxyXG4gICAgICAqIEB0eXBlIHttaXhlZH1cclxuICAgICAgKiBAZGVmYXVsdCBgPGlucHV0IHR5cGU9XCJjaGVja2JveFwiPmBcclxuICAgICAgKi9cclxuICAgICAgc2VsZWN0QWxsUmVuZGVyOiAnPGlucHV0IHR5cGU9XCJjaGVja2JveFwiIGF1dG9jb21wbGV0ZT1cIm9mZlwiPidcclxuICAgfTtcclxuXHJcblxyXG4gICAvKlxyXG4gICAqIEFQSVxyXG4gICAqL1xyXG4gICB2YXIgQXBpID0gJC5mbi5kYXRhVGFibGUuQXBpO1xyXG5cclxuICAgLy8gRG9lc24ndCBkbyBhbnl0aGluZyAtIHdvcmsgYXJvdW5kIGZvciBhIGJ1ZyBpbiBEVC4uLiBOb3QgZG9jdW1lbnRlZFxyXG4gICBBcGkucmVnaXN0ZXIoICdjaGVja2JveGVzKCknLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICB9ICk7XHJcblxyXG4gICBBcGkucmVnaXN0ZXJQbHVyYWwoICdjb2x1bW5zKCkuY2hlY2tib3hlcy5zZWxlY3QoKScsICdjb2x1bW4oKS5jaGVja2JveGVzLnNlbGVjdCgpJywgZnVuY3Rpb24gKCBzdGF0ZSApIHtcclxuICAgICAgaWYodHlwZW9mIHN0YXRlID09PSAndW5kZWZpbmVkJyl7IHN0YXRlID0gdHJ1ZTsgfVxyXG5cclxuICAgICAgcmV0dXJuIHRoaXMuaXRlcmF0b3IoICdjb2x1bW4tcm93cycsIGZ1bmN0aW9uICggY3R4LCBjb2xJZHgsIGksIGosIHJvd3NJZHggKSB7XHJcbiAgICAgICAgIC8vIElmIENoZWNrYm94ZXMgZXh0ZW5zaW9uIGlzIGVuYWJsZWQgZm9yIHRoaXMgY29sdW1uXHJcbiAgICAgICAgIGlmKGN0eC5hb0NvbHVtbnNbY29sSWR4XS5jaGVja2JveGVzKXtcclxuICAgICAgICAgICAgLy8gUHJlcGFyZSBhIGxpc3Qgb2YgYWxsIGNlbGxzXHJcbiAgICAgICAgICAgIHZhciBzZWxlY3RvciA9IFtdO1xyXG4gICAgICAgICAgICAkLmVhY2gocm93c0lkeCwgZnVuY3Rpb24oaW5kZXgsIHJvd0lkeCl7XHJcbiAgICAgICAgICAgICAgIHNlbGVjdG9yLnB1c2goeyByb3c6IHJvd0lkeCwgY29sdW1uOiBjb2xJZHggfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdmFyIGNlbGxzID0gdGhpcy5jZWxscyhzZWxlY3Rvcik7XHJcbiAgICAgICAgICAgIHZhciBjZWxsc0RhdGEgPSBjZWxscy5kYXRhKCk7XHJcblxyXG4gICAgICAgICAgICAvLyBQcmVwYXJlIGEgbGlzdCBvZiBjZWxscyB0aGF0IGNvbnRhaW4gY2hlY2tib3hlcyB0aGF0IGNhbiBiZSBzZWxlY3RlZFxyXG4gICAgICAgICAgICB2YXIgcm93c1NlbGVjdGFibGVJZHggPSBbXTtcclxuICAgICAgICAgICAgc2VsZWN0b3IgPSBbXTtcclxuICAgICAgICAgICAgJC5lYWNoKGNlbGxzRGF0YSwgZnVuY3Rpb24oaW5kZXgsIGNlbGxEYXRhKXtcclxuICAgICAgICAgICAgICAgLy8gSWYgY2hlY2tib3ggaW4gdGhlIGNlbGwgY2FuIGJlIHNlbGVjdGVkXHJcbiAgICAgICAgICAgICAgIGlmKGN0eC5jaGVja2JveGVzLmlzQ2VsbFNlbGVjdGFibGUoY29sSWR4LCBjZWxsRGF0YSkpe1xyXG4gICAgICAgICAgICAgICAgICBzZWxlY3Rvci5wdXNoKHsgcm93OiByb3dzSWR4W2luZGV4XSwgY29sdW1uOiBjb2xJZHggfSk7XHJcbiAgICAgICAgICAgICAgICAgIHJvd3NTZWxlY3RhYmxlSWR4LnB1c2gocm93c0lkeFtpbmRleF0pO1xyXG4gICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgY2VsbHMgPSB0aGlzLmNlbGxzKHNlbGVjdG9yKTtcclxuXHJcbiAgICAgICAgICAgIGN0eC5jaGVja2JveGVzLnVwZGF0ZURhdGEoY2VsbHMsIGNvbElkeCwgc3RhdGUpO1xyXG4gICAgICAgICAgICBjdHguY2hlY2tib3hlcy51cGRhdGVDaGVja2JveChjZWxscywgY29sSWR4LCBzdGF0ZSk7XHJcblxyXG4gICAgICAgICAgICAvLyBJZiByb3cgc2VsZWN0aW9uIGlzIGVuYWJsZWRcclxuICAgICAgICAgICAgaWYoY3R4LmFvQ29sdW1uc1tjb2xJZHhdLmNoZWNrYm94ZXMuc2VsZWN0Um93KXtcclxuICAgICAgICAgICAgICAgY3R4LmNoZWNrYm94ZXMudXBkYXRlU2VsZWN0KHJvd3NTZWxlY3RhYmxlSWR4LCBzdGF0ZSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGN0eC5jaGVja2JveGVzLnVwZGF0ZVNlbGVjdEFsbChjb2xJZHgpO1xyXG5cclxuICAgICAgICAgICAgY3R4LmNoZWNrYm94ZXMudXBkYXRlRml4ZWRDb2x1bW4oY29sSWR4KTtcclxuICAgICAgICAgfVxyXG4gICAgICB9LCAxICk7XHJcbiAgIH0gKTtcclxuXHJcbiAgIEFwaS5yZWdpc3RlclBsdXJhbCggJ2NlbGxzKCkuY2hlY2tib3hlcy5zZWxlY3QoKScsICdjZWxsKCkuY2hlY2tib3hlcy5zZWxlY3QoKScsIGZ1bmN0aW9uICggc3RhdGUgKSB7XHJcbiAgICAgIGlmKHR5cGVvZiBzdGF0ZSA9PT0gJ3VuZGVmaW5lZCcpeyBzdGF0ZSA9IHRydWU7IH1cclxuXHJcbiAgICAgIHJldHVybiB0aGlzLml0ZXJhdG9yKCAnY2VsbCcsIGZ1bmN0aW9uICggY3R4LCByb3dJZHgsIGNvbElkeCApIHtcclxuICAgICAgICAgLy8gSWYgQ2hlY2tib3hlcyBleHRlbnNpb24gaXMgZW5hYmxlZCBmb3IgdGhpcyBjb2x1bW5cclxuICAgICAgICAgaWYoY3R4LmFvQ29sdW1uc1tjb2xJZHhdLmNoZWNrYm94ZXMpe1xyXG4gICAgICAgICAgICB2YXIgY2VsbHMgPSB0aGlzLmNlbGxzKFt7IHJvdzogcm93SWR4LCBjb2x1bW46IGNvbElkeCB9XSk7XHJcbiAgICAgICAgICAgIHZhciBjZWxsRGF0YSA9IHRoaXMuY2VsbCh7IHJvdzogcm93SWR4LCBjb2x1bW46IGNvbElkeCB9KS5kYXRhKCk7XHJcblxyXG4gICAgICAgICAgICAvLyBJZiBjaGVja2JveCBpbiB0aGUgY2VsbCBjYW4gYmUgc2VsZWN0ZWRcclxuICAgICAgICAgICAgaWYoY3R4LmNoZWNrYm94ZXMuaXNDZWxsU2VsZWN0YWJsZShjb2xJZHgsIGNlbGxEYXRhKSl7XHJcbiAgICAgICAgICAgICAgIGN0eC5jaGVja2JveGVzLnVwZGF0ZURhdGEoY2VsbHMsIGNvbElkeCwgc3RhdGUpO1xyXG4gICAgICAgICAgICAgICBjdHguY2hlY2tib3hlcy51cGRhdGVDaGVja2JveChjZWxscywgY29sSWR4LCBzdGF0ZSk7XHJcblxyXG4gICAgICAgICAgICAgICAvLyBJZiByb3cgc2VsZWN0aW9uIGlzIGVuYWJsZWRcclxuICAgICAgICAgICAgICAgaWYoY3R4LmFvQ29sdW1uc1tjb2xJZHhdLmNoZWNrYm94ZXMuc2VsZWN0Um93KXtcclxuICAgICAgICAgICAgICAgICAgY3R4LmNoZWNrYm94ZXMudXBkYXRlU2VsZWN0KHJvd0lkeCwgc3RhdGUpO1xyXG4gICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICBjdHguY2hlY2tib3hlcy51cGRhdGVTZWxlY3RBbGwoY29sSWR4KTtcclxuXHJcbiAgICAgICAgICAgICAgIGN0eC5jaGVja2JveGVzLnVwZGF0ZUZpeGVkQ29sdW1uKGNvbElkeCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgfVxyXG4gICAgICB9LCAxICk7XHJcbiAgIH0gKTtcclxuXHJcbiAgIEFwaS5yZWdpc3RlclBsdXJhbCggJ2NlbGxzKCkuY2hlY2tib3hlcy5lbmFibGUoKScsICdjZWxsKCkuY2hlY2tib3hlcy5lbmFibGUoKScsIGZ1bmN0aW9uICggc3RhdGUgKSB7XHJcbiAgICAgIGlmKHR5cGVvZiBzdGF0ZSA9PT0gJ3VuZGVmaW5lZCcpeyBzdGF0ZSA9IHRydWU7IH1cclxuXHJcbiAgICAgIHJldHVybiB0aGlzLml0ZXJhdG9yKCAnY2VsbCcsIGZ1bmN0aW9uICggY3R4LCByb3dJZHgsIGNvbElkeCApIHtcclxuICAgICAgICAgLy8gSWYgQ2hlY2tib3hlcyBleHRlbnNpb24gaXMgZW5hYmxlZCBmb3IgdGhpcyBjb2x1bW5cclxuICAgICAgICAgaWYoY3R4LmFvQ29sdW1uc1tjb2xJZHhdLmNoZWNrYm94ZXMpe1xyXG4gICAgICAgICAgICB2YXIgY2VsbCA9IHRoaXMuY2VsbCh7IHJvdzogcm93SWR4LCBjb2x1bW46IGNvbElkeCB9KTtcclxuXHJcbiAgICAgICAgICAgIC8vIEdldCBjZWxsIGRhdGFcclxuICAgICAgICAgICAgdmFyIGNlbGxEYXRhID0gY2VsbC5kYXRhKCk7XHJcblxyXG4gICAgICAgICAgICAvLyBJZiBjaGVja2JveCBzaG91bGQgYmUgZW5hYmxlZFxyXG4gICAgICAgICAgICBpZihzdGF0ZSl7XHJcbiAgICAgICAgICAgICAgIGRlbGV0ZSBjdHguY2hlY2tib3hlcy5zLmRhdGFEaXNhYmxlZFtjb2xJZHhdW2NlbGxEYXRhXTtcclxuXHJcbiAgICAgICAgICAgIC8vIE90aGVyd2lzZSwgaWYgY2hlY2tib3ggc2hvdWxkIGJlIGRpc2FibGVkXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgIGN0eC5jaGVja2JveGVzLnMuZGF0YURpc2FibGVkW2NvbElkeF1bY2VsbERhdGFdID0gMTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gRGV0ZXJtaW5lIGlmIGNlbGwgbm9kZSBpcyBhdmFpbGFibGVcclxuICAgICAgICAgICAgLy8gKGRlZmVyUmVuZGVyIGlzIG5vdCBlbmFibGVkIG9yIGNlbGwgaGFzIGJlZW4gYWxyZWFkeSBjcmVhdGVkKVxyXG4gICAgICAgICAgICB2YXIgY2VsbE5vZGUgPSBjZWxsLm5vZGUoKTtcclxuICAgICAgICAgICAgaWYoY2VsbE5vZGUpe1xyXG4gICAgICAgICAgICAgICAkKCdpbnB1dC5kdC1jaGVja2JveGVzJywgY2VsbE5vZGUpLnByb3AoJ2Rpc2FibGVkJywgIXN0YXRlKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gSWYgcm93IHNlbGVjdGlvbiBpcyBlbmFibGVkXHJcbiAgICAgICAgICAgIC8vIGFuZCBjaGVja2JveCBjYW4gYmUgY2hlY2tlZFxyXG4gICAgICAgICAgICBpZihjdHguYW9Db2x1bW5zW2NvbElkeF0uY2hlY2tib3hlcy5zZWxlY3RSb3cpe1xyXG4gICAgICAgICAgICAgICAvLyBJZiBkYXRhIGlzIGluIHRoZSBsaXN0XHJcbiAgICAgICAgICAgICAgIGlmKGN0eC5jaGVja2JveGVzLnMuZGF0YVtjb2xJZHhdLmhhc093blByb3BlcnR5KGNlbGxEYXRhKSl7XHJcbiAgICAgICAgICAgICAgICAgIC8vIFVwZGF0ZSBzZWxlY3Rpb24gYmFzZWQgb24gY3VycmVudCBzdGF0ZTpcclxuICAgICAgICAgICAgICAgICAgLy8gaWYgY2hlY2tib3ggaXMgZW5hYmxlZCB0aGVuIHNlbGVjdCByb3c7XHJcbiAgICAgICAgICAgICAgICAgIC8vIG90aGVyd2lzZSwgZGVzZWxlY3Qgcm93XHJcbiAgICAgICAgICAgICAgICAgIGN0eC5jaGVja2JveGVzLnVwZGF0ZVNlbGVjdChyb3dJZHgsIHN0YXRlKTtcclxuICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgIH1cclxuICAgICAgfSwgMSApO1xyXG4gICB9ICk7XHJcblxyXG4gICBBcGkucmVnaXN0ZXJQbHVyYWwoICdjZWxscygpLmNoZWNrYm94ZXMuZGlzYWJsZSgpJywgJ2NlbGwoKS5jaGVja2JveGVzLmRpc2FibGUoKScsIGZ1bmN0aW9uICggc3RhdGUgKSB7XHJcbiAgICAgIGlmKHR5cGVvZiBzdGF0ZSA9PT0gJ3VuZGVmaW5lZCcpeyBzdGF0ZSA9IHRydWU7IH1cclxuICAgICAgcmV0dXJuIHRoaXMuY2hlY2tib3hlcy5lbmFibGUoIXN0YXRlKTtcclxuICAgfSApO1xyXG5cclxuICAgQXBpLnJlZ2lzdGVyUGx1cmFsKCAnY29sdW1ucygpLmNoZWNrYm94ZXMuZGVzZWxlY3QoKScsICdjb2x1bW4oKS5jaGVja2JveGVzLmRlc2VsZWN0KCknLCBmdW5jdGlvbiAoIHN0YXRlICkge1xyXG4gICAgICBpZih0eXBlb2Ygc3RhdGUgPT09ICd1bmRlZmluZWQnKXsgc3RhdGUgPSB0cnVlOyB9XHJcbiAgICAgIHJldHVybiB0aGlzLmNoZWNrYm94ZXMuc2VsZWN0KCFzdGF0ZSk7XHJcbiAgIH0gKTtcclxuXHJcbiAgIEFwaS5yZWdpc3RlclBsdXJhbCggJ2NlbGxzKCkuY2hlY2tib3hlcy5kZXNlbGVjdCgpJywgJ2NlbGwoKS5jaGVja2JveGVzLmRlc2VsZWN0KCknLCBmdW5jdGlvbiAoIHN0YXRlICkge1xyXG4gICAgICBpZih0eXBlb2Ygc3RhdGUgPT09ICd1bmRlZmluZWQnKXsgc3RhdGUgPSB0cnVlOyB9XHJcbiAgICAgIHJldHVybiB0aGlzLmNoZWNrYm94ZXMuc2VsZWN0KCFzdGF0ZSk7XHJcbiAgIH0gKTtcclxuXHJcbiAgIEFwaS5yZWdpc3RlclBsdXJhbCggJ2NvbHVtbnMoKS5jaGVja2JveGVzLmRlc2VsZWN0QWxsKCknLCAnY29sdW1uKCkuY2hlY2tib3hlcy5kZXNlbGVjdEFsbCgpJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICByZXR1cm4gdGhpcy5pdGVyYXRvciggJ2NvbHVtbicsIGZ1bmN0aW9uIChjdHgsIGNvbElkeCl7XHJcbiAgICAgICAgIC8vIElmIENoZWNrYm94ZXMgZXh0ZW5zaW9uIGlzIGVuYWJsZWQgZm9yIHRoaXMgY29sdW1uXHJcbiAgICAgICAgIGlmKGN0eC5hb0NvbHVtbnNbY29sSWR4XS5jaGVja2JveGVzKXtcclxuICAgICAgICAgICAgY3R4LmNoZWNrYm94ZXMucy5kYXRhW2NvbElkeF0gPSB7fTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY29sdW1uKGNvbElkeCkuY2hlY2tib3hlcy5zZWxlY3QoZmFsc2UpO1xyXG4gICAgICAgICB9XHJcbiAgICAgIH0sIDEgKTtcclxuICAgfSApO1xyXG5cclxuICAgQXBpLnJlZ2lzdGVyUGx1cmFsKCAnY29sdW1ucygpLmNoZWNrYm94ZXMuc2VsZWN0ZWQoKScsICdjb2x1bW4oKS5jaGVja2JveGVzLnNlbGVjdGVkKCknLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLml0ZXJhdG9yKCAnY29sdW1uLXJvd3MnLCBmdW5jdGlvbiAoIGN0eCwgY29sSWR4LCBpLCBqLCByb3dzSWR4ICkge1xyXG5cclxuICAgICAgICAgLy8gSWYgQ2hlY2tib3hlcyBleHRlbnNpb24gaXMgZW5hYmxlZCBmb3IgdGhpcyBjb2x1bW5cclxuICAgICAgICAgaWYoY3R4LmFvQ29sdW1uc1tjb2xJZHhdLmNoZWNrYm94ZXMpe1xyXG4gICAgICAgICAgICB2YXIgZGF0YSA9IFtdO1xyXG5cclxuICAgICAgICAgICAgLy8gSWYgc2VydmVyLXNpZGUgcHJvY2Vzc2luZyBtb2RlIGlzIGVuYWJsZWRcclxuICAgICAgICAgICAgaWYoY3R4Lm9GZWF0dXJlcy5iU2VydmVyU2lkZSl7XHJcbiAgICAgICAgICAgICAgICQuZWFjaChjdHguY2hlY2tib3hlcy5zLmRhdGFbY29sSWR4XSwgZnVuY3Rpb24oY2VsbERhdGEpe1xyXG4gICAgICAgICAgICAgICAgICAvLyBJZiBjaGVja2JveCBpbiB0aGUgY2VsbCBjYW4gYmUgY2hlY2tlZFxyXG4gICAgICAgICAgICAgICAgICBpZihjdHguY2hlY2tib3hlcy5pc0NlbGxTZWxlY3RhYmxlKGNvbElkeCwgY2VsbERhdGEpKXtcclxuICAgICAgICAgICAgICAgICAgICAgZGF0YS5wdXNoKGNlbGxEYXRhKTtcclxuICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIC8vIE90aGVyd2lzZSwgaWYgc2VydmVyLXNpZGUgcHJvY2Vzc2luZyBtb2RlIGlzIG5vdCBlbmFibGVkXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgIC8vIFByZXBhcmUgYSBsaXN0IG9mIGFsbCBjZWxsc1xyXG4gICAgICAgICAgICAgICB2YXIgc2VsZWN0b3IgPSBbXTtcclxuICAgICAgICAgICAgICAgJC5lYWNoKHJvd3NJZHgsIGZ1bmN0aW9uKGluZGV4LCByb3dJZHgpe1xyXG4gICAgICAgICAgICAgICAgICBzZWxlY3Rvci5wdXNoKHsgcm93OiByb3dJZHgsIGNvbHVtbjogY29sSWR4IH0pO1xyXG4gICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgIC8vIEdldCBhbGwgY2VsbHMgZGF0YVxyXG4gICAgICAgICAgICAgICB2YXIgY2VsbHMgPSB0aGlzLmNlbGxzKHNlbGVjdG9yKTtcclxuICAgICAgICAgICAgICAgdmFyIGNlbGxzRGF0YSA9IGNlbGxzLmRhdGEoKTtcclxuXHJcbiAgICAgICAgICAgICAgIC8vIEVudW1lcmF0ZSBhbGwgY2VsbHMgZGF0YVxyXG4gICAgICAgICAgICAgICAkLmVhY2goY2VsbHNEYXRhLCBmdW5jdGlvbihpbmRleCwgY2VsbERhdGEpe1xyXG4gICAgICAgICAgICAgICAgICAvLyBJZiBjaGVja2JveCBpcyBjaGVja2VkXHJcbiAgICAgICAgICAgICAgICAgIGlmKGN0eC5jaGVja2JveGVzLnMuZGF0YVtjb2xJZHhdLmhhc093blByb3BlcnR5KGNlbGxEYXRhKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgIC8vIElmIGNoZWNrYm94IGluIHRoZSBjZWxsIGNhbiBiZSBzZWxlY3RlZFxyXG4gICAgICAgICAgICAgICAgICAgICBpZihjdHguY2hlY2tib3hlcy5pc0NlbGxTZWxlY3RhYmxlKGNvbElkeCwgY2VsbERhdGEpKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5wdXNoKGNlbGxEYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGF0YTtcclxuXHJcbiAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBbXTtcclxuICAgICAgICAgfVxyXG4gICAgICB9LCAxICk7XHJcbiAgIH0gKTtcclxuXHJcblxyXG4gICAvKipcclxuICAgICogVmVyc2lvbiBpbmZvcm1hdGlvblxyXG4gICAgKlxyXG4gICAgKiBAbmFtZSBDaGVja2JveGVzLnZlcnNpb25cclxuICAgICogQHN0YXRpY1xyXG4gICAgKi9cclxuICAgQ2hlY2tib3hlcy52ZXJzaW9uID0gJzEuMi4xMic7XHJcblxyXG5cclxuXHJcbiAgICQuZm4uRGF0YVRhYmxlLkNoZWNrYm94ZXMgPSBDaGVja2JveGVzO1xyXG4gICAkLmZuLmRhdGFUYWJsZS5DaGVja2JveGVzID0gQ2hlY2tib3hlcztcclxuXHJcblxyXG4gICAvLyBBdHRhY2ggYSBsaXN0ZW5lciB0byB0aGUgZG9jdW1lbnQgd2hpY2ggbGlzdGVucyBmb3IgRGF0YVRhYmxlcyBpbml0aWFsaXNhdGlvblxyXG4gICAvLyBldmVudHMgc28gd2UgY2FuIGF1dG9tYXRpY2FsbHkgaW5pdGlhbGlzZVxyXG4gICAkKGRvY3VtZW50KS5vbiggJ3ByZUluaXQuZHQuZHRDaGVja2JveGVzJywgZnVuY3Rpb24gKGUsIHNldHRpbmdzIC8qLCBqc29uICovICkge1xyXG4gICAgICBpZiAoIGUubmFtZXNwYWNlICE9PSAnZHQnICkge1xyXG4gICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIG5ldyBDaGVja2JveGVzKCBzZXR0aW5ncyApO1xyXG4gICB9ICk7XHJcblxyXG5cclxuICAgcmV0dXJuIENoZWNrYm94ZXM7XHJcbn0pKTtcclxuIl0sInNvdXJjZVJvb3QiOiIifQ==