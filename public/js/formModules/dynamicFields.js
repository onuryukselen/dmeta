/* eslint-disable */
import { showInfoModal } from './../jsfuncs';
import { getParentCollection } from './crudData';
import { getCollectionTable, getCollectionByName, refreshDataTables } from './../dashboard';

// GLOBAL SCOPE
let $s = { init: false };

//{ data: outData }
// const editableRow = {
//     key: '',
//     value: '',
//     keyType: 'input',
//     valueType: 'input',
//     keyEdit: true,
//     valueEdit: true
//   };
export const insertDynamicFields = (el, settings) => {
  const mainDiv = $(el).closest('div.dynamicFields');
  const mainSettings = mainDiv.data('settings');
  if (settings.clean) {
    el.find('tbody').empty();
  }
  const data = settings.data;
  for (let k = 0; k < data.length; k++) {
    let keyType = data[k].keyType ? data[k].keyType : 'input';
    let valueType = data[k].valueType ? data[k].valueType : 'input';
    let newRow = $('<tr>');
    let keyField = ``;
    let valueField = ``;

    const confirmBtn = `<button class="btn btn-sm btn-secondary editable-click-save" type="button" ><i class="cil-check"> </i></button>`;
    const valueFieldEdit = `
    <div class="input-group mb-3" style="display:none;" >
        <div class="input-group-prepend">
            <button type="button" class="btn btn-outline-secondary dropdown-toggle dropdown-toggle-split" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                <span class="sr-only">Toggle Dropdown</span>
            </button>
            <div class="dropdown-menu">
                <a class="dropdown-item editable-click-change-input" href="#">Text Box</a>
                <a class="dropdown-item editable-click-change-collection" href="#">Collection</a>
            </div>
        </div>
        <input class="form-control dynamicFields" type="text"></input>
        ${confirmBtn}
    </div>`;
    const keyFieldEdit = `
    <div class="input-group mb-3" style="display:none;" >
        <input class="form-control dynamicFields" type="text"></input>
        ${confirmBtn}
    </div>`;

    if (data[k].keyEdit) {
      if (keyType == 'input') {
        keyField = `<a href="#" class="dynamicFields editable-click-input">${data[k].key}</a>
      ${keyFieldEdit}`;
      }
    } else {
      keyField = `${data[k].key}`;
    }
    if (data[k].valueEdit) {
      if (valueType == 'checkbox') {
        valueField = `<input class="dynamicFields" style="margin-left:0rem; margin-top:0.70rem;" type="checkbox" >`;
      } else if (valueType == 'input') {
        valueField = `<a href="#" class="dynamicFields editable-click-input">${data[k].value}</a>
      ${valueFieldEdit}
      `;
      } else if (valueType == 'collection') {
        valueField = `<a href="#" class="dynamicFields editable-click-collection">Select File</a>
      `;
      }
    } else {
      if (valueType == 'checkbox') {
        valueField = `<input class="dynamicFields" style="margin-left:0rem; margin-top:0.70rem;" type="checkbox" >`;
      } else if (valueType == 'collection') {
        valueField = `<a href="#" class="dynamicFields editable-click-collection">Select File</a>
        
      `;
      } else {
        valueField = `${data[k].value}`;
      }
    }

    let cols = '';
    cols += `<td style="width: 35%">${keyField}</td>`;
    cols += `<td style="width: 60%">${valueField}</td>`;
    if (mainSettings.delete) {
      cols += `<td style="width: 5%"><button class="btn btn-sm btn-danger df-delete-row" type="button" ><i class="cil-trash"> </i></button></td>`;
    }
    newRow.append(cols);
    el.find('tbody').append(newRow);
  }
};
//{
//   name: 'out',
//   class: 'customize',
//   insert: false,
//   delete: false
// }
const getDynamicFields = settings => {
  let classText = settings.class ? settings.class : '';
  let name = settings.name ? settings.name : '';
  let addBtn = '';
  if (settings.insert) {
    addBtn = `<button class="btn btn-sm btn-info df-add-row" type="button" >Add</button>`;
  }
  let ret = `
    <div class="dynamicFields ${classText}" nameAttr="${name}">
      <table class="table" style="margin-bottom:0px;">
        <thead></thead>
        <tbody></tbody>
      </table>
      ${addBtn}
    </div>
    `;
  return ret;
};

const bindEventHandlers = () => {
  $(document).on('click', `button.df-add-row`, async function(e) {
    const mainDiv = $(this).closest('div.dynamicFields');
    const editableRow = {
      key: 'editable key',
      value: 'editable value',
      keyType: 'input',
      valueType: 'input',
      keyEdit: true,
      valueEdit: true
    };
    let data = [];
    data.push(editableRow);
    insertDynamicFields(mainDiv, { clean: false, data: data });
  });
  $(document).on('click', `button.df-delete-row`, async function(e) {
    $(this)
      .closest('tr')
      .remove();
  });
  $(document).on('click', `a.editable-click-input`, async function(e) {
    e.preventDefault();
    const val = $(this).text();
    $(this).css('display', 'none');
    $(this)
      .next()
      .find('input')
      .val(val);
    $(this)
      .next()
      .css('display', 'flex');
  });
  $(document).on('click', `button.editable-click-save`, async function(e) {
    e.preventDefault();
    const valueDiv = $(this).prev();
    const val = valueDiv.val();
    if (val) {
      $(this)
        .closest('.input-group')
        .css('display', 'none');
      $(this)
        .closest('td')
        .find('a.dynamicFields')
        .text(val)
        .css('display', 'inline');
      valueDiv.val('');
    } else {
      showInfoModal('Please enter a value.');
    }
  });

  $(document).on('click', `.editable-click-change-input`, function(e) {
    e.preventDefault();
    $(this)
      .closest('td')
      .find('a.dynamicFields')
      .addClass('editable-click-input')
      .removeClass('editable-click-collection');
  });
  $(document).on('click', `.editable-click-change-collection`, function(e) {
    e.preventDefault();
    $(this)
      .closest('.input-group')
      .find('input.dynamicFields')
      .val('Select File');
    $(this)
      .closest('td')
      .find('a.dynamicFields')
      .addClass('editable-click-collection')
      .removeClass('editable-click-input');
  });
  $(document).on('click', `a.editable-click-collection`, async function(e) {
    e.preventDefault();
    const selectBtn = this;
    const oldSelectedFiles = $(selectBtn).data('selected');
    const mainDiv = $(this).closest('div.dynamicFields');
    const mainSettings = mainDiv.data('settings');
    const projectID = mainSettings.projectID;
    let fileCollID = '';
    const fileCollData = getCollectionByName('file', projectID);
    if (fileCollData && fileCollData[0] && fileCollData[0]._id) fileCollID = fileCollData[0]._id;
    if (!fileCollID) {
      showInfoModal('File collection is not available in the project.');
      return;
    }
    const collTable = getCollectionTable(fileCollID, 'modal');
    const tableID = `modal-${fileCollID}`;
    $('#crudModalTitle').text(`Select Files`);
    $('#crudModalYes').text('Select');
    $('#crudModalBody').empty();
    $('#crudModalBody').append(collTable);
    $('#crudModal').off();
    await refreshDataTables(tableID, fileCollID, 'file', projectID);

    $('#crudModal').on('show.coreui.modal', function(e) {
      const table = $(`#${tableID}`).DataTable();
      table.column(0).checkboxes.deselect();
      if (oldSelectedFiles && oldSelectedFiles.length) {
        const indexes = table
          .rows(function(idx, data, node) {
            return oldSelectedFiles.includes(data._id);
          })
          .indexes();
        table.cells(indexes, 0).checkboxes.select();
      }
    });

    $('#crudModal').on('click', '#crudModalYes', function(e) {
      e.preventDefault();
      const table = $(`#${tableID}`).DataTable();
      const tableData = table.rows().data();
      const rows_selected = table.column(0).checkboxes.selected();
      const selectedData = tableData.filter(f => rows_selected.indexOf(f._id) >= 0);

      let selectedFileIDs = [];
      for (let k = 0; k < selectedData.length; k++) {
        selectedFileIDs.push(selectedData[k]._id);
      }

      if (rows_selected.length === 0) {
        showInfoModal('Please click checkboxes to select items.');
      } else if (rows_selected.length > 0) {
        if (rows_selected.length === 1) {
          $(selectBtn).text(`${rows_selected.length} file selected`);
        } else {
          $(selectBtn).text(`${rows_selected.length} files selected`);
        }
        $(selectBtn).data('selected', selectedFileIDs);
        $('#crudModal').modal('hide');
      }
    });
    $('#crudModal').modal('show');
  });
};

export const createDynamicFields = (el, settings) => {
  // bind global event binders
  if (!$s.init) {
    bindEventHandlers();
    $s.init = true;
  }
  const dynamicDiv = getDynamicFields(settings);
  const dynamicDivEl = $(dynamicDiv);
  dynamicDivEl.data('settings', settings);
  $(el).after(dynamicDivEl);
  $(el).css('display', 'none');
  $(el).addClass('customized');
  return dynamicDivEl;
};
