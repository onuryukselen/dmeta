/* eslint-disable */
import axios from 'axios';
import XLSX from 'xlsx';
import moment from 'moment';
const JSON5 = require('json5');
import { saveAs } from 'file-saver';

import {
  getCleanDivId,
  showInfoModal,
  createFormObj,
  convertFormObj,
  getUpdatedFields,
  showFormError,
  fillFormByName,
  prepareMultiUpdateModal,
  prepareClickToActivateModal,
  groupArrayOfObj,
  hideFormError,
  getDropdownFields
} from './jsfuncs';
import {
  getFieldsDiv,
  prepRunForm,
  prepOntologyDropdown,
  prepReferenceDropdown,
  getFormElement,
  getFormRow,
  createSelectizeMultiField
} from './formModules/crudData';
import { prepFileForm, convertFileFormObj } from './formModules/fileForm';
import { prepDataPerms } from './formModules/dataPerms';
import { refreshTreeView } from './treeView';
import Handsontable from 'handsontable';

// GLOBAL SCOPE
let $s = { data: {}, tableData: {}, handsontables: {}, compare: {}, dropzone: '', formNum: 0 };

const ajaxCall = async (method, url) => {
  console.log(method, url);
  try {
    const res = await axios({
      method,
      url
    });
    return res.data.data.data;
  } catch (err) {
    //console.log(err);
    return '';
  }
};

const getTableHeaders = collID => {
  let ret = '';
  ret += `<th></th>`; // for checkboxes
  // ret += `<th>DID</th>`;
  for (var i = 0; i < $s.fields.length; i++) {
    if ($s.fields[i].collectionID == collID && $s.fields[i].label && $s.fields[i].hidden !== true)
      ret += `<th>${$s.fields[i].label}</th>`;
  }
  // ret += `<th>ID</th>`;
  ret += `<th>Permission</th>`;
  return ret;
};

export const showInfoInDiv = (textID, text) => {
  //true if modal is open
  const oldText = $(textID).html();
  let newText = '';
  if (oldText.length) {
    newText = oldText + '<br/>' + text;
  } else {
    newText = text;
  }
  $(textID).html(newText);
};

const getErrorDiv = () => {
  return '<p style="background-color:#e211112b;" id="crudModalError"></p>';
};

const getProjectDataObj = projectID => {
  if (!projectID) return '';
  const projectData = $s.projects.filter(field => field._id === projectID);
  if (projectData && projectData[0]) return projectData[0];
  return '';
};

const makeReadOnlyUpdate = hot => {
  const data = hot.getData();
  for (let n = 0; n < data.length; n++) {
    hot.setCellMeta(n, 0, 'readOnly', true);
    hot.setCellMeta(n, 1, 'readOnly', true);
  }
};

const getExcelColumns = collid => {
  const datatable = $(`#${collid}`).DataTable();
  let columnsObj = datatable.init().columns;
  let selColumns = [];
  for (let i = 0; i < columnsObj.length; i++) {
    if (i === 0 && columnsObj[i].mData == '_id') continue; // skip first column for checkboxes
    if (columnsObj[i].mData == 'perms') continue;
    selColumns.push(columnsObj[i].mData);
  }
  return selColumns;
};

// highlight imported and updated table data
const makeUpdatedTableData = (tableID, projectid) => {
  let identifierName = '';
  let identifierIndex = '';
  let collName = '';
  let collid = '';
  const hot = $s.handsontables[tableID];
  const data = hot.getData();

  // 1. get header and detect indentifier column
  const header = hot.getColHeader();
  for (let k = 0; k < header.length; k++) {
    if (k == 0 || k == 1) continue; // Skip Update status and update log columns
    const headerSplit = header[k].split('.');
    if (headerSplit[0] && headerSplit[1]) {
      collName = headerSplit[0];
      const collData = $s.collections.filter(c => c.name == collName && c.projectID == projectid);
      if (collData && collData[0] && collData[0]._id) {
        collid = collData[0]._id;
        const identifierData = $s.fields.filter(f => f.collectionID == collid && f.identifier);
        if (identifierData && identifierData[0] && identifierData[0].name) {
          identifierName = identifierData[0].name;
          identifierIndex = k;
          break;
        }
      }
    }
  }
  if (!identifierName) {
    showInfoModal('Identifier Column Not Found.');
    return;
  }

  const fields = $s.fields.filter(f => f.collectionID === collid);
  const fieldsArr = fields.map(f => f.name);
  const excelData = prepExcelData(projectid, collid, fieldsArr, collName, 'object', 'short');
  for (let r = 0; r < data.length; r++) {
    let existingDataFound = false;
    const rowData = data[r];
    const identifierValue = rowData[identifierIndex];
    // 2. based on identifier column check existing data
    if (identifierValue && excelData) {
      const existingData = excelData.filter(d => d[identifierName] == identifierValue);
      if (existingData && existingData[0]) {
        existingDataFound = true;
        for (let c = 0; c < header.length; c++) {
          if (c == 0 || c == 1 || c == identifierIndex) continue;
          const key = header[c].replace(`${collName}.`, '');
          let value = rowData[c];
          if (rowData[c] === null) {
            value = '';
          }

          if (value === '' && existingData[0][key] === undefined) continue;
          if (value === '' && existingData[0][key] === null) continue;
          if (existingData[0][key] == value) continue;
          hot.setCellMeta(r, c, 'className', 'bg-yellow');
        }
      }
      // if existingDataFound not found, then heightlight all of them
      if (!existingDataFound) {
        for (let c = 0; c < rowData.length; c++) {
          if (c === 0 || c === 1) continue;
          hot.setCellMeta(r, c, 'className', 'bg-yellow');
        }
      }
    }
  }

  hot.render();
};

const createHandsonTable = (tableID, header, statusExcelData) => {
  $(`#${tableID}`).css('display', 'block');
  const isHandsonTableInit = $(`#${tableID}`).hasClass('handsontable');
  if (!isHandsonTableInit) {
    const container = document.getElementById(tableID);
    const hot = new Handsontable(container, {
      data: statusExcelData,
      colHeaders: header,
      width: '100%',
      height: 500,
      rowHeaders: true,
      stretchH: 'all',
      contextMenu: true,
      columnSorting: {
        indicator: true,
        headerAction: true
      },
      afterChange: changes => {
        if (changes) {
          changes.forEach(([row, prop, oldValue, newValue]) => {
            if (oldValue === null) oldValue = '';
            if (oldValue != newValue) {
              hot.setCellMeta(row, prop, 'className', 'bg-yellow');
              hot.render();
            }
          });
        }
      },
      afterCreateCol: () => {
        hot.render();
      },
      afterCreateRow: () => {
        makeReadOnlyUpdate(hot, statusExcelData);
        hot.render();
      },
      afterRemoveRow: () => {
        hot.render();
      },
      afterRemoveCol: () => {
        hot.render();
      }
    });
    // hot.alter('insert_col', 0, 2);
    // hot.setDataAtCell(0, 0, 'Update Status');
    // cellProperties.readOnly;
    //cellPropertiesID = $("#example1grid").handsontable('getCellMeta',i,j);
    //cellPropertiesID.readOnly = value;
    makeReadOnlyUpdate(hot, statusExcelData);
    hot.render();
    $s.handsontables[tableID] = hot;
  }
};

const getExcelNavbar = (collId, tabs) => {
  let header = '<ul class="nav nav-tabs" role="tablist" style="margin-top: 10px;">';
  let content = '<div class="tab-content">';
  let k = 0;
  for (var i = 0; i < tabs.length; i++) {
    k++;
    const cleanTabName = getCleanDivId(`${collId}_${tabs[i]}`);
    const tabID = 'excelTab_' + cleanTabName;
    const active = k === 1 ? 'active' : '';
    const excelId = `import-spreadsheet-${collId}-${i}`;
    const headerLi = `
      <li class="nav-item">
          <a class="nav-link ${active} excel-tabs" excelId="${excelId}" data-toggle="tab" href="#${tabID}" aria-expanded="true">${tabs[i]}</a>
      </li>`;
    header += headerLi;
    const excelTable = getExcelTable(excelId);
    const contentDiv = `
      <div role="tabpanel" class="tab-pane ${active}" excelId="${excelId}" searchtab="true" id="${tabID}">
          ${excelTable}
        </div>`;
    content += contentDiv;
  }
  header += `</ul>`;
  content += `</div>`;

  let ret = '';
  ret += '<div>';
  ret += header;
  ret += content;
  ret += '</div>';
  return ret;
};

const getRefCollIdentifiers = (projectID, collid) => {
  let projectName = '';
  const projectData = $s.projects.filter(p => p._id == projectID);
  if (projectData && projectData[0] && projectData[0].name) projectName = projectData[0].name;
  const collFields = getFieldsOfCollection(collid);
  let refFields = []; // ref field names
  let refCollectionIDs = []; // extract from ref data
  let refCollIdentifiers = []; // use  from ref data

  for (let i = 0; i < collFields.length; i++) {
    if (collFields[i].ref) {
      let refCollectionID = '';
      let refFieldIdent = '';
      refFields.push(collFields[i].name);
      if (collFields[i].ref.startsWith(projectName + '_')) {
        const refColName = collFields[i].ref.replace(new RegExp('^' + projectName + '_'), '');
        if (refColName) {
          const refCoData = $s.collections.filter(c => c.name == refColName);
          if (refCoData && refCoData[0] && refCoData[0]._id) {
            refCollectionID = refCoData[0]._id;
            const refFieldIdenData = $s.fields.filter(
              f => f.collectionID == refCollectionID && f.identifier
            );
            if (refFieldIdenData && refFieldIdenData[0] && refFieldIdenData[0].name) {
              refFieldIdent = refFieldIdenData[0].name;
            }
          }
        }
        refCollectionIDs.push(refCollectionID);
        refCollIdentifiers.push(refFieldIdent);
      }
    }
  }
  return { refFields, refCollectionIDs, refCollIdentifiers };
};

const getKeyValueExcel = (
  cleanHeader,
  rowData,
  refFields,
  refCollectionIDs,
  refCollIdentifiers
) => {
  let key = '';
  let value = '';
  // find reference columns and get their ids
  console.log('refFields', refFields);
  console.log('refCollectionIDs', refCollectionIDs);
  console.log('refCollIdentifiers', refCollIdentifiers);
  if (refFields.indexOf(cleanHeader) > -1) {
    const refIndex = refFields.indexOf(cleanHeader);
    const refCollectionID = refCollectionIDs[refIndex];
    const refCollIdentifier = refCollIdentifiers[refIndex];
    key = cleanHeader;
    value = rowData;
    console.log('key', key);
    console.log('value', value);
    // get _id info
    if (refCollectionID) {
      const collData = $s.data[refCollectionID];
      console.log('collData', collData);

      const selData = collData.filter(d => d[refCollIdentifier] == rowData);
      if (selData && selData[0] && selData[0]._id) {
        key = cleanHeader;
        value = selData[0]._id;
      }
    }
  } else {
    key = cleanHeader;
    if (rowData === null) {
      value = '';
    } else {
      value = rowData;
    }
  }
  return { key, value };
};
const syncTableData = async (tableID, collid, collName, projectid) => {
  const hot = $s.handsontables[tableID];
  const data = hot.getData();
  const header = hot.getColHeader();
  const { projectPart } = getProjectData(projectid);
  // identifierAndNamingPatterns
  const updateOnInsert = $s.fields.filter(
    f => (f.identifier || f.namingPattern) && f.collectionID == collid
  );
  const { refFields, refCollectionIDs, refCollIdentifiers } = getRefCollIdentifiers(
    projectid,
    collid
  );
  for (let i = 0; i < data.length; i++) {
    let updatedObj = {};
    let insertObj = {};
    const rowData = data[i];
    let updtCheck = false;
    for (let k = 0; k < header.length; k++) {
      if (k == 0 || k == 1) continue; // Skip Update status and update log columns
      const rowProperties = hot.getCellMeta(i, k);
      if (rowProperties.className && rowProperties.className == 'bg-yellow') {
        updtCheck = true;
      }
    }

    if (updtCheck) {
      for (let k = 0; k < header.length; k++) {
        if (k == 0 || k == 1) continue; // Skip Update status and update log columns
        const rowProperties = hot.getCellMeta(i, k);
        const cleanHeader = header[k].replace(`${collName}.`, '');
        const { key, value } = getKeyValueExcel(
          cleanHeader,
          rowData[k],
          refFields,
          refCollectionIDs,
          refCollIdentifiers
        );
        if (key != '_id' && key != 'DID' && value) insertObj[key] = value;

        if (
          key != '_id' &&
          key != 'DID' &&
          rowProperties.className &&
          rowProperties.className == 'bg-yellow'
        ) {
          updatedObj[key] = value;
        }
      }
      console.log('updtCheck', i, updtCheck, updatedObj, insertObj);

      try {
        if (!$.isEmptyObject(updatedObj)) {
          const rowID = getExcelRowID(collid, collName, header, rowData);
          // update document
          let res;
          if (rowID) {
            res = await excelCrudCall(
              'PATCH',
              `/api/v1/${projectPart}data/${collName}/${rowID}`,
              updatedObj,
              collid,
              i
            );
            // insert new document
          } else {
            res = await excelCrudCall(
              'POST',
              `/api/v1/${projectPart}data/${collName}`,
              insertObj,
              collid,
              i
            );
          }
          // update _id and DID, perms columns
          console.log(res);
          const newID = res._id;
          const newDID = res.DID;
          const newPerms = res.perms;
          const indexID = header.indexOf(`${collName}._id`);
          const indexDID = header.indexOf(`${collName}.DID`);
          const indexPerms = header.indexOf(`${collName}.perms`);
          if (indexID != -1 && newID) hot.setDataAtCell(i, indexID, newID);
          if (indexDID != -1 && newDID) hot.setDataAtCell(i, indexDID, newDID);
          if (indexPerms != -1 && newPerms) {
            if (typeof newPerms === 'object' && newPerms !== null) {
              hot.setDataAtCell(i, indexPerms, JSON.stringify(newPerms));
            } else {
              hot.setDataAtCell(i, indexPerms, newPerms);
            }
          }
          // update identifier and namingpattern columns
          for (let m = 0; m < updateOnInsert.length; m++) {
            let fieldName = updateOnInsert[m].name;
            if (fieldName && res[fieldName]) {
              const newData = res[fieldName];
              const indexData = header.indexOf(`${collName}.${fieldName}`);
              if (indexData != -1 && newData) {
                hot.setDataAtCell(i, indexData, newData);
              }
            }
          }
        }
      } catch (err) {
        console.log(err);
      } finally {
        const status = $s.compare[collid][i].status;
        const log = $s.compare[collid][i].log;
        hot.setDataAtCell(i, 0, status);
        hot.setDataAtCell(i, 1, log);
        if (status == 'updated' || status == 'inserted') {
          for (let n = 0; n < header.length; n++) {
            hot.setCellMeta(i, n, 'className', '');
          }
        } else {
          hot.setCellMeta(i, 0, 'className', '');
          hot.setCellMeta(i, 1, 'className', '');
        }
        hot.render();
      }
    }
  }
};

const addStatusColumns = data => {
  let ret = [];
  for (let i = 0; i < data.length; i++) {
    let newArr = [];
    if (i == 0) {
      newArr.push('Update Status', 'Update Log');
    } else {
      newArr.push('', '');
    }
    newArr = newArr.concat(data[i]);
    ret.push(newArr);
  }
  return ret;
};

const addEmptyRows = (data, numRows) => {
  const numOfColumns = data[0].length;
  if (numOfColumns) {
    let emptyRow = [];
    for (let i = 0; i < numOfColumns; i++) {
      emptyRow.push('');
    }
    for (let i = 0; i < numRows; i++) {
      data.push(emptyRow);
    }
  }
  return data;
};
const createDropzone = (id, buttonID, destroy) => {
  if (destroy) {
    $(`#${id}`)[0].dropzone.destroy();
    $(`#${id}`).off();
  }
  if (!$(`#${id}`)[0].dropzone) {
    $(`#${id}`).dropzone({
      paramName: 'file', // The name that will be used to transfer the file
      maxFilesize: 30, // MB
      // maxFiles: 1,
      createImageThumbnails: false,
      dictDefaultMessage:
        'Drop your Excel file here or <button type="button" style="margin-left:4px;" class="btn btn-light" >Select File </button>',
      accept: function(file, done) {
        $s.dropzone = file.name;
        done();
      },
      init: function() {
        this.on('complete', function(file) {
          if (this.getUploadingFiles().length === 0 && this.getQueuedFiles().length === 0) {
            $(`#${buttonID}`).css('display', 'inline-block');
          }
        });
      }
    });
  }
};

const getExcelRowID = (collid, collName, header, rowData) => {
  let id = '';
  let idField = '';
  // search for ${collName}_id, or ${collName}.DID
  // get identifier field of collection
  const identifierField = $s.fields.filter(f => f.collectionID == collid && f.identifier);
  if (identifierField && identifierField[0] && identifierField[0].name) {
    idField = identifierField[0].name;
    const idFieldIndex = header.indexOf(`${collName}.${idField}`);
    if (idFieldIndex != -1 && rowData[idFieldIndex]) {
      const data = $s.data[collid];
      const selData = data.filter(d => d[idField] == rowData[idFieldIndex]);
      if (selData && selData[0] && selData[0]._id) return selData[0]._id;
    }
  }

  return id;
};

const excelCrudCall = async (method, url, data, tableID, rowIdx) => {
  if (!$s.compare[tableID]) $s.compare[tableID] = {};
  if (!$s.compare[tableID][rowIdx]) {
    $s.compare[tableID][rowIdx] = { req: '', res: '', log: '', status: '' };
  }

  try {
    Object.keys(data).forEach(key => {
      if (
        data[key] &&
        $.type(data[key]) === 'string' &&
        (data[key].charAt(0) == '{' || data[key].charAt(0) == '[')
      ) {
        data[key] = JSON5.parse(data[key]);
      }
    });
  } catch {
    console.log('Format error', data);
    $s.compare[tableID][rowIdx].log = 'Format error in json data.';
    $s.compare[tableID][rowIdx].status = 'error';
    return '';
  }
  try {
    $s.compare[tableID][rowIdx].req = data;
    const res = await axios({
      method,
      url,
      data
    });
    $s.compare[tableID][rowIdx].res = res.data.data.data;
    if (method == 'POST' && res.data.status == 'success') {
      $s.compare[tableID][rowIdx].status = 'inserted';
    } else if (method == 'PATCH' && res.data.status == 'success') {
      $s.compare[tableID][rowIdx].status = 'updated';
    } else {
      $s.compare[tableID][rowIdx].status = res.data.status;
    }
    $s.compare[tableID][rowIdx].log = '';
    return res.data.data.data;
  } catch (err) {
    $s.compare[tableID][rowIdx].log = err;
    if (err.response && err.response.data && err.response.data.message) {
      $s.compare[tableID][rowIdx].log = err.response.data.message;
    }
    $s.compare[tableID][rowIdx].status = 'error';
    console.log(err);
    return '';
  }
};

const getCollDropdown = (projectID, projectName, collectionID, collectionName, insert, update) => {
  const collRef = projectName ? `${projectName}_${collectionName}` : collectionName;
  let skip = '';
  if (!insert && !update) skip = `skip="skip"`;
  let collDropdown = `<select ${skip} class="form-control form-event-collection data-reference" projectID="${projectID}" collectionID="${collectionID}" collectionName="${collectionName}" ref="${collRef}">`;
  if (insert || update) {
    collDropdown += `<option value="" >  --- Choose to Update Item ---  </option>`;
  } else {
    collDropdown += `<option value="" >  --- Select ---  </option>`;
  }
  collDropdown += `</select>`;
  return { collDropdown, collRef };
};

const activateAllForm = (formId, find) => {
  const formValues = $(formId).find(find);
  for (var i = 0; i < formValues.length; i++) {
    if ($(formValues[i]).siblings('.multi-value').length) {
      $(formValues[i])
        .siblings('.multi-value')
        .trigger('click');
    }
  }
};

const getEventFormGroupDiv = (
  formID,
  collLabel,
  collDropdown,
  showCollectionDropdown,
  multiple,
  fieldCheck
) => {
  let ret = '';
  let multipleButton = '';
  let fieldsetClass = 'scheduler-border';
  let legendMargin = 'margin-bottom:30px;';
  if (!fieldCheck) {
    fieldsetClass = 'scheduler-border-top';
    legendMargin = '';
  }
  if (multiple) {
    multipleButton = `<button style="margin-left:5px;" class="btn btn-sm btn-pill btn-primary multiple-event-form" type="button">
    <i class="cil-plus"> </i>
    </button>`;
  }
  if (showCollectionDropdown) {
    ret = `
      <form class="form-horizontal" id="${formID}">
        <fieldset class="${fieldsetClass}">
          <legend class="scheduler-border" style="width:70%; ${legendMargin}">  
          <div class="row">
            <label class="col-md-4 col-form-label">${collLabel}</label>
            <div class="col-md-8">
              ${collDropdown}
            </div>
          </div>
        </legend>`;
  } else {
    ret = `
      <form class="form-horizontal" id="${formID}">
        <fieldset class="${fieldsetClass}">
          <legend class="scheduler-border" style="width:auto; ${legendMargin}">  
          <div>
            ${collLabel}
            <div style="display:none;" class="col-md-8">
              ${collDropdown}
            </div>
            ${multipleButton}
          </div>
        </legend>`;
  }
  return ret;
};

const refreshEventForm = async (projectID, eventID) => {
  $(`#event-form-div-${projectID}`).css('display', 'block');
  $(`#event-form-${projectID}`).empty();
  let allDataRefs = [];
  const projectData = $s.projects.filter(p => p._id === projectID);
  const eventData = $s.events.filter(e => e._id === eventID);
  if (projectData[0] && eventData[0] && eventData[0].fields) {
    const rawFields = eventData[0].fields;
    const groupByCollection = groupArrayOfObj('collectionID');
    const groupedFields = groupByCollection(rawFields);
    const keys = Object.keys(groupedFields);
    for (let k = 0; k < keys.length; k++) {
      let div = '';
      const collectionID = keys[k];
      const group = groupedFields[collectionID];
      const col = $s.collections.filter(p => p._id === collectionID);
      const collLabel = col[0].label;
      const collectionName = col[0].name;
      const projectName = projectData[0].name ? projectData[0].name : '';

      let insert = false;
      let update = false;
      let multiple = false;
      let fieldCheck = false;
      if (group[0].insert) insert = true;
      if (group[0].update) update = true;
      if (group[0].multiple) multiple = true;
      if (group[0].field) fieldCheck = true;

      const { collDropdown, collRef } = getCollDropdown(
        projectID,
        projectName,
        collectionID,
        collectionName,
        insert,
        update
      );
      const formID = `form-event-${projectID}-${collectionID}-${k}`;
      const errorDiv = `<p style="background-color:#e211112b;" class="crudError" id="crudModalError-${projectID}-${collectionID}"></p>`;
      let showCollectionDropdown = update || (!insert && !update);
      if (allDataRefs.includes(collRef)) showCollectionDropdown = false;
      allDataRefs.push(collRef);

      div += getEventFormGroupDiv(
        formID,
        collLabel,
        collDropdown,
        showCollectionDropdown,
        multiple,
        fieldCheck
      );

      for (let i = 0; i < group.length; i++) {
        let field = {};
        let label = '';
        const fieldId = group[i].field;
        if (fieldId) {
          const fieldData = $s.fields.filter(f => f._id === fieldId);
          field = fieldData[0];
          if (field) label = field.label;
          if (field && label) {
            const element = await getFormElement(field, projectData[0], $s);
            const refField = $(element).attr('ref');
            let copiedField = $.extend(true, {}, field);
            if (allDataRefs.includes(refField)) copiedField.hide = true;
            if (refField) allDataRefs.push(refField);
            div += getFormRow(element, label, copiedField);
          }
        }
      }
      div += `</fieldset></form>`;
      $(`#event-form-${projectID}`).append(errorDiv);
      $(`#event-form-${projectID}`).append(div);
      const dropdownElement = $(`#${formID}`).find('.form-event-collection')[0];
      const fieldsOfCollection = $s.fields.filter(f => f.collectionID === collectionID);
      createSelectizeMultiField(dropdownElement, $s.data[collectionID], fieldsOfCollection);
      prepOntologyDropdown(`#${formID}`, {}, $s);
      prepReferenceDropdown(`#${formID}`, $s);
      if (collectionName == 'run') prepRunForm(`#${formID}`, {}, $s, projectID);
      if (collectionName == 'file') prepFileForm(`#${formID}`, {}, $s, projectID);
      prepareClickToActivateModal(`#${formID}`, '', 'input, select', {});
      activateAllForm(`#${formID}`, 'input, select');
    }
  }
};

const convertRunFormObj = formObj => {
  if (formObj.out) {
    const outputs = formObj.out;
    Object.keys(outputs).forEach((k, i) => {
      if (outputs[k]) {
        outputs[k] = {};
      } else {
        delete outputs[k];
      }
    });
  }
  return formObj;
};

const saveDataEventForm = async (type, formID, collID, collName, projectID, oldData) => {
  const formValues = $(formID).find('input,select');
  const requiredValues = formValues.filter('[required]');
  const requiredFields = $.map(requiredValues, function(el) {
    return $(el).attr('name');
  });
  let formObj, stop, method, id;
  if (type === 'update') {
    method = 'PATCH';
    id = oldData._id;
    [formObj, stop] = createFormObj(formValues, requiredFields, true, 'undefined');
    formObj = convertFormObj(formObj);
    formObj = getUpdatedFields(oldData, formObj); // get only updated fields:
  } else if (type === 'insert') {
    method = 'POST';
    id = '';
    [formObj, stop] = createFormObj(formValues, requiredFields, true, false);
    formObj = convertFormObj(formObj);
    if (stop === false && collName == 'run') formObj = convertRunFormObj(formObj);
    // convertFileFormObjL converts object to array
    if (stop === false && collName == 'file') formObj = convertFileFormObj(formObj);
  }

  if (stop === false && collName) {
    let success;
    if (Array.isArray(formObj)) {
      for (let i = 0; i < formObj.length; i++) {
        success = await crudAjaxRequest(
          'data',
          method,
          id,
          projectID,
          collName,
          formObj[i],
          formValues,
          `#crudModalError-${projectID}-${collID}`
        );
        if (!success) {
          refreshDataTables(collID, collID, collName, projectID);
          break;
        }
        if (success && formObj.length - 1 === i) {
          refreshDataTables(collID, collID, collName, projectID);
        }
      }
    } else {
      success = await crudAjaxRequest(
        'data',
        method,
        id,
        projectID,
        collName,
        formObj,
        formValues,
        `#crudModalError-${projectID}-${collID}`
      );
      if (success) {
        refreshDataTables(collID, collID, collName, projectID);
      }
    }
  }
  return success;
};

const refreshCollectionDiv = async (projectID, collectionID, dry) => {
  const collectionData = $s.collections.filter(c => c._id === collectionID);
  if (collectionData && collectionData[0]) {
    const collectionLabel = collectionData[0]['label'];
    const collectionName = collectionData[0]['name'];
    const tableID = collectionID;
    const colTable = getCollectionTable(collectionID, 'default');
    const colExcelTable = getExcelTable(`spreadsheet-${collectionID}`);
    const colDropzone = getDropzoneTable(collectionID, projectID);
    const crudButtons = getCrudButtons(collectionID, collectionLabel, collectionName, projectID, {
      excel: true,
      delBtn: true
    });
    const outerDiv = `#collection-outerdiv-${collectionID}-${projectID}`;
    const isEmptyDiv = $(outerDiv).html() === '';
    if (isEmptyDiv) {
      $(outerDiv).append(`${crudButtons}${colTable}${colExcelTable}${colDropzone}`);
      await refreshDataTables(tableID, tableID, collectionName, projectID);
    }
    if (!dry) {
      $(`.collection-outerdiv[projectID="${projectID}"]`).css('display', 'none');
      $(outerDiv).css('display', 'inline');
    }
    $($.fn.dataTable.tables(true))
      .DataTable()
      .columns.adjust();
  }
};

const refreshCollDataDropdown = (projectID, collectionID) => {
  const collectionData = $s.collections.filter(c => c._id === collectionID);
  const projectData = $s.projects.filter(p => p._id === projectID);
  if (collectionData && collectionData[0] && projectData && projectData[0]) {
    const collectionName = collectionData[0]['name'];
    const projectName = projectData[0]['name'];
    const collRef = `${projectName}_${collectionName}`;
    let dataDropdown = `<select class="form-control tree-view-data" projectID="${projectID}" collectionID="${collectionID}" collectionName="${collectionName}" ref="${collRef}">
    <option value="" >  --- Select ---  </option></select>`;
    $(`#tree-view-data-${projectID}`)
      .empty()
      .append(dataDropdown);
  }
  const dropdownElement = $(`#tree-view-data-${projectID}`).find('select')[0];
  const fieldsOfCollection = $s.fields.filter(f => f.collectionID === collectionID);
  createSelectizeMultiField(dropdownElement, $s.data[collectionID], fieldsOfCollection);
};

export const deleteDataModal = async (button, selectedRows, callback) => {
  $('#crudModalError').empty();
  const collID = $(button).attr('collID');
  const collLabel = $(button).attr('collLabel');
  const collName = $(button).attr('collName');
  const projectID = $(button).attr('projectID');
  const table = $(`#${collID}`).DataTable();
  const tableData = table.rows().data();
  let rows_selected = [];
  if (selectedRows) {
    rows_selected = selectedRows;
  } else {
    rows_selected = table.column(0).checkboxes.selected();
  }
  const selectedData = tableData.filter(f => rows_selected.indexOf(f._id) >= 0);
  const items = selectedData.length === 1 ? `the item?` : `${selectedData.length} items?`;
  $('#crudModalTitle').text(`Remove ${collLabel}`);
  $('#crudModalYes').text('Remove');
  $('#crudModalBody').empty();
  $('#crudModalBody').append(getErrorDiv());
  $('#crudModalBody').append(`<p>Are you sure you want to delete ${items}</p>`);
  $('#crudModal').off();
  $('#crudModal').on('click', '#crudModalYes', async function(e) {
    e.preventDefault();
    for (var i = 0; i < selectedData.length; i++) {
      const success = await crudAjaxRequest(
        'data',
        'DELETE',
        selectedData[i]._id,
        projectID,
        collName,
        {},
        {},
        '#crudModalError'
      );
      if (!success) {
        refreshDataTables(collID, collID, collName, projectID);
        break;
      }
      if (success && selectedData.length - 1 === i) {
        await refreshDataTables(collID, collID, collName, projectID);
        if (callback) callback($s);
        $('#crudModal').modal('hide');
      }
    }
  });
  if (selectedData.length === 0) {
    showInfoModal('Please click checkboxes to delete items.');
  } else if (selectedData.length > 0) {
    $('#crudModal').modal('show');
  }
};

export const insertDataModal = async (button, clickToActivateModal, callbackOnSuccess) => {
  $('#crudModalError').empty();
  const collID = $(button).attr('collID');
  const collLabel = $(button).attr('collLabel');
  const collName = $(button).attr('collName');
  const projectID = $(button).attr('projectID');
  const collectionFields = await getFieldsDiv(collID, getProjectDataObj(projectID));
  $('#crudModalTitle').text(`Insert ${collLabel}`);
  $('#crudModalYes').text('Save');
  $('#crudModalBody').empty();
  $('#crudModalBody').append(getErrorDiv());
  $('#crudModalBody').append(collectionFields);
  $('#crudModal').off();
  if (collName == 'run') prepRunForm('#crudModal', {}, $s, projectID);
  if (collName == 'file') prepFileForm('#crudModal', {}, $s, projectID);
  prepReferenceDropdown('#crudModal', $s);
  prepOntologyDropdown('#crudModal', {}, $s);
  await prepDataPerms('#crudModal', {});
  if (clickToActivateModal) {
    prepareClickToActivateModal('#crudModal', '#crudModalBody', 'input, select', {});
  }

  $('#crudModal').on('click', '#crudModalYes', async function(e) {
    e.preventDefault();
    $('#crudModalError').empty();
    const formValues = $('#crudModal').find('input,select');
    const requiredValues = formValues.filter('[required]');
    const requiredFields = $.map(requiredValues, function(el) {
      return $(el).attr('name');
    });
    let [formObj, stop] = createFormObj(formValues, requiredFields, true, true);
    formObj = convertFormObj(formObj);
    if (stop === false && collName == 'run') formObj = convertRunFormObj(formObj);
    if (stop === false && collName == 'file') formObj = convertFileFormObj(formObj);

    if (stop === false && collName) {
      let success;
      if (Array.isArray(formObj)) {
        for (let i = 0; i < formObj.length; i++) {
          success = await crudAjaxRequest(
            'data',
            'POST',
            '',
            projectID,
            collName,
            formObj[i],
            formValues,
            '#crudModalError'
          );
          if (!success) {
            refreshDataTables(collID, collID, collName, projectID);
            break;
          }
          if (success && formObj.length - 1 === i) {
            await refreshDataTables(collID, collID, collName, projectID);
            if (callbackOnSuccess) callbackOnSuccess($s, collID, success);
            $('#crudModal').modal('hide');
          }
        }
      } else {
        success = await crudAjaxRequest(
          'data',
          'POST',
          '',
          projectID,
          collName,
          formObj,
          formValues,
          '#crudModalError'
        );
        if (success) {
          console.log(success);
          await refreshDataTables(collID, collID, collName, projectID);
          if (callbackOnSuccess) callbackOnSuccess($s, collID, success);
          $('#crudModal').modal('hide');
        }
      }
    }
  });
  $('#crudModal').modal('show');
};

export const editDataModal = async (button, selectedRows, callback) => {
  const collID = $(button).attr('collID');
  const collLabel = $(button).attr('collLabel');
  const collName = $(button).attr('collName');
  const projectID = $(button).attr('projectID');
  const collectionFields = await getFieldsDiv(collID, getProjectDataObj(projectID));
  $('#crudModalTitle').text(`Edit ${collLabel}`);
  $('#crudModalYes').text('Save');
  $('#crudModalBody').empty();
  $('#crudModalBody').append(getErrorDiv());
  $('#crudModalBody').append(collectionFields);
  $('#crudModal').off();
  const table = $(`#${collID}`).DataTable();
  const tableData = table.rows().data();
  let rows_selected = [];
  if (selectedRows) {
    rows_selected = selectedRows;
  } else {
    rows_selected = table.column(0).checkboxes.selected();
  }
  const selectedData = tableData.filter(f => rows_selected.indexOf(f._id) >= 0);
  console.log('selectedData', selectedData);
  $('#crudModal').on('show.coreui.modal', async function(e) {
    fillFormByName('#crudModal', 'input, select', selectedData[0], true);
    prepReferenceDropdown('#crudModal', $s);
    // if (collName == 'run') prepRunForm('#crudModal', selectedData[0], $s, projectID);
    prepOntologyDropdown('#crudModal', selectedData[0], $s);
    await prepDataPerms('#crudModal', selectedData[0]);
    if (rows_selected.length > 1) {
      prepareMultiUpdateModal('#crudModal', '#crudModalBody', 'input, select');
    } else {
      prepareClickToActivateModal('#crudModal', '#crudModalBody', 'input, select', selectedData[0]);
    }
  });

  $('#crudModal').on('click', '#crudModalYes', async function(e) {
    e.preventDefault();
    $('#crudModalError').empty();
    const formValues = $('#crudModal').find('input,select');
    const requiredValues = formValues.filter('[required]');
    const requiredFields = $.map(requiredValues, function(el) {
      return $(el).attr('name');
    });
    let formObj, stop;
    if (rows_selected.length > 1) {
      [formObj, stop] = createFormObj(formValues, requiredFields, true, true);
    } else {
      [formObj, stop] = createFormObj(formValues, requiredFields, true, 'undefined');
    }
    formObj = convertFormObj(formObj);
    // get only updated fields:
    if (rows_selected.length === 1) {
      formObj = getUpdatedFields(selectedData[0], formObj);
    }
    if (stop === false && collName) {
      for (var i = 0; i < selectedData.length; i++) {
        const success = await crudAjaxRequest(
          'data',
          'PATCH',
          selectedData[i]._id,
          projectID,
          collName,
          formObj,
          formValues,
          '#crudModalError'
        );
        if (!success) {
          refreshDataTables(collID, collID, collName, projectID);
          break;
        }
        if (success && selectedData.length - 1 === i) {
          await refreshDataTables(collID, collID, collName, projectID);
          if (callback) callback($s);
          $('#crudModal').modal('hide');
        }
      }
    }
  });

  if (rows_selected.length === 0) {
    showInfoModal('Please click checkboxes to edit items.');
  } else if (rows_selected.length > 0) {
    $('#crudModal').modal('show');
  }
};

const prepExcelData = (projectID, collid, selColumns, collName, format, fieldType) => {
  let reOrderedData = [];
  const { refFields, refCollectionIDs, refCollIdentifiers } = getRefCollIdentifiers(
    projectID,
    collid
  );
  const data = $s.data[collid];
  const collFields = getFieldsOfCollection(collid);
  let dateFields = []; // date field names
  for (var i = 0; i < collFields.length; i++) {
    if (collFields[i].type == 'Date') dateFields.push(collFields[i].name);
  }

  for (let i = 0; i < data.length; i++) {
    let newObj = {};
    for (let k = 0; k < selColumns.length; k++) {
      const col = selColumns[k];
      let fields = '';
      if (fieldType == 'short') {
        fields = col;
      } else if (fieldType == 'long') {
        fields = `${collName}.${col}`;
      }
      if (refFields.includes(col)) {
        newObj[fields] = '';
        const refIndex = refFields.indexOf(col);
        const refCollectionID = refCollectionIDs[refIndex];
        const refCollIdentifier = refCollIdentifiers[refIndex];
        if (data[i][col] && data[i][col]._id && $s.data[refCollectionID]) {
          const refData = $s.data[refCollectionID].filter(d => d._id == data[i][col]._id);
          if (refData && refData[0] && refData[0][refCollIdentifier]) {
            newObj[fields] = refData[0][refCollIdentifier];
          }
        }
      } else if (dateFields.includes(col) && data[i][col]) {
        const timestamp = Date.parse(data[i][col]);
        if (isNaN(timestamp) == false) {
          newObj[fields] = moment(data[i][col])
            .utc()
            .format('YYYY-MM-DD');
        } else {
          console.log('not valid timestamp', data[i][col]);
          newObj[fields] = data[i][col];
        }
      } else if (
        (typeof data[i][col] === 'object' && data[i][col] !== null) ||
        Array.isArray(data[i][col])
      ) {
        newObj[fields] = JSON.stringify(data[i][col]);
      } else {
        newObj[fields] = data[i][col];
      }
    }
    reOrderedData.push(newObj);
  }
  if (format === 'array') {
    let arrayData = [];
    const header = Object.keys(reOrderedData[0]);
    arrayData.push(header);
    for (let i = 0; i < reOrderedData.length; i++) {
      let newArr = [];
      for (let h = 0; h < header.length; h++) {
        newArr.push(reOrderedData[i][header[h]]);
      }
      arrayData.push(newArr);
    }
    reOrderedData = arrayData;
  }
  return reOrderedData;
};

const bindEventHandlers = () => {
  //================= TREE VIEW TAB =================
  $(document).on('change', `select.tree-view-collection`, function(e) {
    const projectID = $(this).attr('projectID');
    const collectionID = $(this).val();
    if (collectionID) {
      refreshCollDataDropdown(projectID, collectionID);
    }
  });
  $(document).on('change', `select.tree-view-data`, function(e) {
    const projectID = $(this).attr('projectID');
    const collectionID = $(`#tree-view-collection-${projectID}`).val();
    const dataID = $(this).val();
    if (collectionID && dataID) {
      refreshTreeView(projectID, $s, true, { collectionID, dataID });
    }
  });

  //================= COLLECTIONS TAB  =============
  $(document).on('change', `select.select-collection`, async function(e) {
    const projectID = $(this).attr('projectID');
    const collectionID = $(this).val();
    if (collectionID) {
      await refreshCollectionDiv(projectID, collectionID, false);
    }
  });
  // ================= EVENTS  =================
  $(document).on('click', 'button.multiple-event-form', function(e) {
    const form = $(this).closest('form');
    const formID = form.attr('id');
    $s.formNum++;
    const newFormNum = $s.formNum;
    const restForm = formID.substring(0, formID.lastIndexOf('-') + 1);
    const newFormId = `${restForm}${newFormNum}`;
    form
      .clone()
      .prop('id', newFormId)
      .insertAfter(form);
  });

  // sync .data-reference dropdowns on change for event forms
  $(document).on('change', 'select.data-reference', function(e) {
    const ref = $(this).attr('ref');
    const projectID = $(this).attr('projectID');
    const collectionName = $(this).attr('collectionName');
    const collectionID = $(this).attr('collectionID');
    const selValue = this.value;
    console.log(`changed to ${this.value}`, this);
    const allDataRefs = $(`select.data-reference[ref="${ref}"]`)
      .not(this)
      .val(selValue);
    for (let i = 0; i < allDataRefs.length; i++) {
      if ($(allDataRefs[i]).hasClass('selectized'))
        $(allDataRefs[i])[0].selectize.setValue(selValue, true);
      if ($(allDataRefs[i]).hasClass('form-event-collection')) $(allDataRefs[i]).trigger('change');
    }

    // filter data-reference rows based in child relationships.
    // Later get data from api/v1/tree/${project}
    console.log(collectionID);
    if (collectionID) {
      const projectName = $s.projects.filter(p => p._id === projectID)[0].name;
      let childCollections = [];
      const refFields = $s.fields.filter(f => f.ref == `${projectName}_${collectionName}`);
      for (let i = 0; i < refFields.length; i++) {
        childCollections.push({ _id: refFields[i].collectionID });
      }
      console.log(`childCollections for ${collectionID}`, childCollections);
      console.log(`refFields for ${collectionID}`, refFields);
      for (let i = 0; i < childCollections.length; i++) {
        const childCollectionID = childCollections[i]._id;
        console.log(`ref:${ref} childCollectionID:${childCollectionID}`);
        const allChildDataRefs = $(`select.data-reference[collectionID="${childCollectionID}"]`);
        console.log(allChildDataRefs);
        const oldData = $s.data[childCollectionID];
        if (oldData) {
          const newData = oldData.filter(
            o => o[`${collectionName}_id`] && o[`${collectionName}_id`]['_id'] == selValue
          );
          console.log(oldData);
          console.log(newData);
          for (let k = 0; k < allChildDataRefs.length; k++) {
            console.log('allChildDataRefs', allChildDataRefs[k]);
            if (allChildDataRefs[k].selectize) {
              var selectize = allChildDataRefs[k].selectize;
              var oldSelectizeVal = selectize.getValue();
              selectize.clear();
              selectize.clearOptions();
              selectize.load(function(callback) {
                callback(newData);
              });
              selectize.setValue(oldSelectizeVal, true);
            }
          }
        }
      }
    }
  });
  $(document).on('change', `select.form-event-collection`, async function(e) {
    const collectionID = $(this).attr('collectionID');
    const projectID = $(this).attr('projectID');
    const formID = `#${$(this)
      .closest('form')
      .attr('id')}`;
    const selItem = $(this).val();
    if (selItem) {
      const data = $s.tableData[collectionID].filter(i => i._id == selItem);
      if (data && data[0]) {
        fillFormByName(formID, 'input, select', data[0], true);
        prepReferenceDropdown(formID, $s);
        // prepRunForm(formID, data[0], $s, projectID);
        prepOntologyDropdown(formID, data[0], $s);
        // trigger change of filled .data-reference dropdowns
        const allDataRefs = $(formID).find('select.data-reference');
        for (let i = 0; i < allDataRefs.length; i++) {
          const nameAttr = $(allDataRefs[i]).attr('name');
          if (nameAttr && data[0][nameAttr]) $(allDataRefs[i]).trigger('change');
        }
      }
    }
  });

  $(document).on('click', `button.event-reset-btn`, async function(e) {
    const projectID = $(this).attr('projectID');
    const allForms = $(`#event-form-${projectID}`).find('form');
    for (let i = 0; i < allForms.length; i++) {
      const collDropdown = $(allForms[i]).find('select.form-event-collection');
      const collID = collDropdown.attr('collectionID');
      $(`#crudModalError-${projectID}-${collID}`).empty();
      const isFormSuccess = $(allForms[i])
        .find('fieldset.scheduler-border')
        .hasClass('success');
      const isFormErr = $(allForms[i])
        .find('fieldset.scheduler-border')
        .hasClass('error');
      if (isFormSuccess)
        $(allForms[i])
          .find('fieldset.scheduler-border')
          .removeClass('success');
      if (isFormErr)
        $(allForms[i])
          .find('fieldset.scheduler-border')
          .removeClass('error');
      const formValues = $(allForms[i]).find('select, input');
      hideFormError(formValues);
    }
  });

  $(document).on('click', `button.event-new-btn`, async function(e) {
    $(this).css('display', 'none');
    $(this)
      .siblings('button.event-save-btn')
      .css('display', 'block');
    $(this)
      .siblings('button.event-reset-btn')
      .trigger('click');
  });
  $(document).on('click', `button.event-save-btn`, async function(e) {
    console.log('save');
    spinnerButton(this, 'loading');
    const projectID = $(this).attr('projectID');
    const allForms = $(`#event-form-${projectID}`).find('form');
    let errorExist = false;
    for (let i = 0; i < allForms.length; i++) {
      const isFormSuccess = $(allForms[i])
        .find('fieldset.scheduler-border')
        .hasClass('success');
      if (isFormSuccess) continue;
      const formID = $(allForms[i]).attr('id');
      const collDropdown = $(allForms[i]).find('select.form-event-collection');
      const selData = collDropdown.val();
      const skip = collDropdown.attr('skip');
      if (skip) continue;
      const collID = collDropdown.attr('collectionID');
      const collName = collDropdown.attr('collectionName');
      $(`#crudModalError-${projectID}-${collID}`).empty();
      let type = '';
      let oldData = '';
      if (selData) {
        type = 'update';
        oldData = $s.tableData[collID].filter(i => i._id == selData)[0];
      } else {
        type = 'insert';
      }
      const success = await saveDataEventForm(
        type,
        `#${formID}`,
        collID,
        collName,
        projectID,
        oldData
      );
      console.log('ret', success);
      if (success) {
        $(allForms[i])
          .find('fieldset.scheduler-border')
          .removeClass('error')
          .addClass('success');
      } else {
        errorExist = true;
        $(allForms[i])
          .find('fieldset.scheduler-border')
          .addClass('error');
      }
    }
    spinnerButton(this, 'reset');
    if (!errorExist) {
      $(this).css('display', 'none');
      $(this)
        .siblings('button.event-new-btn')
        .css('display', 'block');
    }
  });

  $(document).on('change', `select.select-event`, async function(e) {
    const projectID = $(this).attr('projectID');
    const eventID = $(this).val();
    if (eventID) {
      await refreshEventForm(projectID, eventID);
    } else {
      $(`#event-form-div-${projectID}`).css('display', 'none');
    }
  });
  // ================= EDIT BUTTON =================
  $(document).on('shown.coreui.tab', `.excel-tabs[data-toggle="tab"]`, async function(e) {
    const excelId = $(this).attr('excelId');
    const hot = $s.handsontables[excelId];
    hot.render();
  });

  $(document).on('click', `button.edit-data`, async function(e) {
    await editDataModal(this);
  });

  $(document).on('click', `button.export-excel-data`, async function(e) {
    const collid = $(this).attr('collid');
    const colllabel = $(this).attr('colllabel');
    const collName = $(this).attr('collname');
    const projectID = $(this).attr('projectID');
    const rowData = datatable
      .rows({ order: 'applied' })
      .data()
      .toArray();
    const selColumns = getExcelColumns(collid);
    const excelData = prepExcelData(projectID, collid, selColumns, collName, 'object', 'long');
    if (excelData && excelData[0]) {
      const wb = XLSX.utils.book_new();
      wb.SheetNames.push(colllabel);
      let ws;
      let headers;
      if (headers) {
        rowData.unshift(headers);
        ws = XLSX.utils.json_to_sheet(excelData, { skipHeader: true });
      } else {
        ws = XLSX.utils.json_to_sheet(excelData);
      }
      ws['!cols'] = [];
      for (let i = 0; i < Object.keys(excelData[0]).length; i++) {
        ws['!cols'].push({ width: 25 });
      }
      wb.Sheets[colllabel] = ws;
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
      function s2ab(s) {
        var buf = new ArrayBuffer(s.length);
        var view = new Uint8Array(buf);
        for (var i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff;
        return buf;
      }
      saveAs(new Blob([s2ab(wbout)], { type: 'application/octet-stream' }), `${colllabel}.xlsx`);
    }
  });

  // ================= Edit-excel-data =================
  $(document).on('click', `button.reset-import-excel-data`, async function(e) {
    const collid = $(this).attr('collid');
    const importTableID = `import-spreadsheet-div-${collid}`;
    const importTableButID = `load-excel-table-${collid}`;
    $(`#${importTableID}`).empty();
    $(`#${importTableButID}`).css('display', 'inline-block');
    const dropzoneId = `excelUpload-${collid}`;
    $(`#${dropzoneId}`).css('display', 'block');
    createDropzone(dropzoneId, importTableButID, true);
  });
  $(document).on('click', `button.cancel-excel-data`, async function(e) {
    const collid = $(this).attr('collid');
    const tableID = `spreadsheet-${collid}`;
    const importTableID = `import-spreadsheet-div-${collid}`;
    const importTableButID = `load-excel-table-${collid}`;
    $(`#${tableID}`).css('display', 'none');
    $(`#${importTableID}`).css('display', 'none');
    $(`#${importTableButID}`).css('display', 'none');
    $(this)
      .closest('.collection-outerdiv')
      .find('.dropzone')
      .css('display', 'none');
    $(this)
      .siblings('button.edit-excel-data')
      .css('display', 'inline-block');
    $(this)
      .siblings('button.save-excel-data')
      .css('display', 'none');
    $(this)
      .siblings('button.save-import-excel-data')
      .css('display', 'none');
    $(this)
      .siblings('button.reset-import-excel-data')
      .css('display', 'none');
    $(this)
      .siblings('button.export-excel-data')
      .css('display', 'inline-block');
    $(this)
      .siblings('button.import-excel-data')
      .css('display', 'inline-block');
    $(this)
      .siblings('button.insert-data')
      .css('display', 'inline-block');
    $(this)
      .siblings('button.edit-data')
      .css('display', 'inline-block');
    $(this)
      .siblings('button.delete-data')
      .css('display', 'inline-block');

    $(this).css('display', 'none');
    $(this)
      .closest('.collection-outerdiv')
      .find('.table-responsive')
      .css('display', 'block');
    $($.fn.dataTable.tables(true))
      .DataTable()
      .columns.adjust();
  });

  // ================= Save-excel-data =================

  $(document).on('click', `button.save-import-excel-data`, async function(e) {
    const collid = $(this).attr('collid');
    const projectID = $(this).attr('projectID');
    const importedDiv = `#import-spreadsheet-div-${collid}`;
    // find active tab
    const activeTab = $(`${importedDiv} ul.nav-tabs li a.active.excel-tabs`);
    const tableID = activeTab.attr('excelid');
    if (!tableID || !$s.handsontables[tableID]) {
      showInfoModal('Please load excel file to import data.');
    } else {
      const hot = $s.handsontables[tableID];
      const header = hot.getColHeader();
      if (header) {
        // skip first two columns
        const columnName = header[2];
        const splitted = columnName.split('.');
        if (splitted.length !== 2) {
          showInfoModal(
            'Header format is not recognized. Collection name and field name should separated with dot symbol. e.g. exp.name, series.name'
          );
        } else {
          const collName = splitted[0];
          const coll = getCollectionByName(collName, projectID);
          if (!coll || !coll[0] || !coll[0]._id) {
            showInfoModal(`Collection (${collectionName}) not found.`);
          } else {
            const collectionID = coll[0]._id;
            const projectid = coll[0].projectID;
            await syncTableData(tableID, collectionID, collName, projectid);
            refreshDataTables(collid, collid, collName, projectid);
          }
        }
      }
    }
  });
  $(document).on('click', `button.save-excel-data`, async function(e) {
    const collid = $(this).attr('collid');
    const collName = $(this).attr('collname');
    const projectid = $(this).attr('projectid');
    const tableID = `spreadsheet-${collid}`;
    // format checker -> only one collection should be defined.
    await syncTableData(tableID, collid, collName, projectid);
    refreshDataTables(collid, collid, collName, projectid);
  });

  $(document).on('click', `button.import-excel-data`, async function(e) {
    const collid = $(this).attr('collid');
    $(`#import-spreadsheet-div-${collid}`).css('display', 'block');
    $(this)
      .closest('.collection-outerdiv')
      .find('.table-responsive')
      .css('display', 'none');
    $(this)
      .closest('.collection-outerdiv')
      .find('.dropzone')
      .css('display', 'block');

    $(this).css('display', 'none');
    $(this)
      .siblings('button.insert-data')
      .css('display', 'none');
    $(this)
      .siblings('button.export-excel-data')
      .css('display', 'none');
    $(this)
      .siblings('button.edit-excel-data')
      .css('display', 'none');
    $(this)
      .siblings('button.cancel-excel-data')
      .css('display', 'inline-block');
    $(this)
      .siblings('button.save-excel-data')
      .css('display', 'none');
    $(this)
      .siblings('button.save-import-excel-data')
      .css('display', 'inline-block');
    $(this)
      .siblings('button.reset-import-excel-data')
      .css('display', 'inline-block');
    $(this)
      .siblings('button.edit-data')
      .css('display', 'none');
    $(this)
      .siblings('button.delete-data')
      .css('display', 'none');

    const dropzoneId = `excelUpload-${collid}`;
    const buttonID = `load-excel-table-${collid}`;
    const isTableLoaded = $(`#import-spreadsheet-div-${collid}`).html();
    if (!$(`#${dropzoneId}`)[0].dropzone) {
      createDropzone(dropzoneId, buttonID, false);
    } else if (isTableLoaded) {
      $(`#${dropzoneId}`).css('display', 'none');
    } else {
      $(`#${buttonID}`).css('display', 'inline-block');
    }
  });

  $(document).on('click', `button.load-excel-table`, async function(e) {
    const collid = $(this).attr('collid');
    const projectid = $(this).attr('projectid');
    const dropzoneId = `excelUpload-${collid}`;
    const buttonID = `load-excel-table-${collid}`;

    $(`#${dropzoneId}`).css('display', 'none');
    if ($s.dropzone) {
      $(`#${buttonID}`).css('display', 'none');
      // 1. get excel data
      const res = await axios({
        method: 'POST',
        url: '/api/v1/misc/readExcelUpload',
        data: { filename: $s.dropzone }
      });
      console.log(res);
      if (res && res.data && res.data.data) {
        // 2. create tabs
        const tabData = res.data.data;
        const tabs = Object.keys(tabData);
        const excelNavbar = getExcelNavbar(collid, tabs);
        // 3. insert excel tables
        $(`#import-spreadsheet-div-${collid}`).empty();
        $(`#import-spreadsheet-div-${collid}`).append(excelNavbar);
        // 4. load excel tables
        for (let i = 0; i < tabs.length; i++) {
          const statusExcelData = addStatusColumns(tabData[tabs[i]]);
          let header = statusExcelData.shift();
          const tableID = `import-spreadsheet-${collid}-${i}`;
          createHandsonTable(tableID, header, statusExcelData);
          makeUpdatedTableData(tableID, projectid);
        }
      }
    }
  });

  $(document).on('click', `button.edit-excel-data`, async function(e) {
    const collid = $(this).attr('collid');
    const collName = $(this).attr('collname');
    const projectID = $(this).attr('projectID');
    const selColumns = getExcelColumns(collid);
    const excelData = prepExcelData(projectID, collid, selColumns, collName, 'array', 'long');
    const statExcelData = addStatusColumns(excelData);
    const statusExcelData = addEmptyRows(statExcelData, 100);
    console.log(statExcelData);
    console.log(statusExcelData);

    let header = statusExcelData.shift();
    $(this)
      .closest('.collection-outerdiv')
      .find('.table-responsive')
      .css('display', 'none');
    $(this)
      .closest('.collection-outerdiv')
      .find('.dropzone')
      .css('display', 'none');

    $(this).css('display', 'none');
    $(this)
      .siblings('button.insert-data')
      .css('display', 'none');
    $(this)
      .siblings('button.export-excel-data')
      .css('display', 'none');
    $(this)
      .siblings('button.import-excel-data')
      .css('display', 'none');
    $(this)
      .siblings('button.cancel-excel-data')
      .css('display', 'inline-block');
    $(this)
      .siblings('button.save-excel-data')
      .css('display', 'inline-block');
    $(this)
      .siblings('button.save-import-excel-data')
      .css('display', 'none');
    $(this)
      .siblings('button.reset-import-excel-data')
      .css('display', 'none');
    $(this)
      .siblings('button.edit-data')
      .css('display', 'none');
    $(this)
      .siblings('button.delete-data')
      .css('display', 'none');

    const tableID = `spreadsheet-${collid}`;
    createHandsonTable(tableID, header, statusExcelData);
  });

  // ================= INSERT BUTTON =================

  $(document).on('click', `button.insert-data`, async function(e) {
    await insertDataModal(this, true);
  });

  // ================= DELETE BUTTON =================

  $(document).on('click', `button.delete-data`, async function(e) {
    await deleteDataModal(this);
  });
};

export const getCrudButtons = (collID, collLabel, collName, projectID, settings) => {
  const data = `collLabel="${collLabel}" collID="${collID}" projectID="${projectID}" collName="${collName}"`;
  let tableBut = '';
  let dbEditorBut = '';
  let childRefBut = '';
  let delBtn = '';
  let refreshIdentifierBut = '';
  if (settings.refreshIdentifier) {
    refreshIdentifierBut = `
    <button class="btn btn-primary refresh-namingPattern-data" type="button" data-toggle="tooltip" data-placement="bottom" title="Refresh Naming Patterns" ${data}>
      <i class="cil-badge"> </i>
    </button>`;
  }
  if (settings.dbEditor) {
    dbEditorBut = `
    <button class="btn btn-primary edit-field-data" type="button" data-toggle="tooltip" data-placement="bottom" title="Transfer Fields Data" ${data}>
      <i class="cil-cut"> </i>
    </button>`;
  }
  if (settings.childRef) {
    childRefBut = `
    <button class="btn btn-primary insert-child-ref" type="button" data-toggle="tooltip" data-placement="bottom" title="Insert Reference Field" ${data}><i class="cil-sitemap"> </i></button>`;
  }

  if (settings.excel) {
    tableBut = `
    <button class="btn btn-primary edit-excel-data" type="button" data-toggle="tooltip" data-placement="bottom" title="Edit in Spreadsheet" ${data}>
      <i class="cil-view-module"> </i>
    </button>
    <button style="display:none;" class="btn btn-primary cancel-excel-data" type="button" data-toggle="tooltip" data-placement="bottom" title="Show Table Format" ${data}>
      <i class="cil-arrow-thick-left"> </i>
    </button>
    <button style="display:none;" class="btn btn-primary save-excel-data" type="button" data-toggle="tooltip" data-placement="bottom" title="Save Changes in Spreadsheet Format" ${data}>
      <i class="cil-save"> </i>
    </button>
    <button class="btn btn-primary export-excel-data" type="button" data-toggle="tooltip" data-placement="bottom" title="Download as Excel File" ${data}>
      <i class="cil-arrow-circle-bottom"> </i>
    </button>
    <button class="btn btn-primary import-excel-data" type="button" data-toggle="tooltip" data-placement="bottom" title="Import as Excel File" ${data}>
      <i class="cil-arrow-thick-to-left"> </i>
    </button>
    <button style="display:none;" class="btn btn-primary save-import-excel-data" type="button" data-toggle="tooltip" data-placement="bottom" title="Save Imported Excel Data" ${data}>
      <i class="cil-save"> </i>
    </button>
    <button style="display:none;" class="btn btn-primary reset-import-excel-data" type="button" data-toggle="tooltip" data-placement="bottom" title="New Import (Reset)" ${data}>
      <i class="cil-x-circle"> </i>
    </button>
    `;
  }
  if (settings.delBtn) {
    delBtn = `<button class="btn btn-primary delete-data" type="button" data-toggle="tooltip" data-placement="bottom" title="Delete" ${data}>
  <i class="cil-trash"> </i>
</button>`;
  }

  const ret = `
  <div class="row" style="margin-top: 20px;">
    <div class="col-sm-12">
      <button class="btn btn-primary insert-data" type="button" data-toggle="tooltip" data-placement="bottom" title="Insert" ${data}>
        <i class="cil-plus"> </i>
      </button>
      <button class="btn btn-primary edit-data" type="button" data-toggle="tooltip" data-placement="bottom" title="Edit" ${data}>
        <i class="cil-pencil"> </i>
      </button>
      ${delBtn}
      ${tableBut}
      ${childRefBut}
      ${dbEditorBut}
      ${refreshIdentifierBut}
    </div>
  </div>`;
  return ret;
};

const getDropzoneTable = (collID, projectID) => {
  const ret = `
  <form id="excelUpload-${collID}" action="/api/v1/misc/fileUpload" method="post" enctype="multipart/form-data" class="dropzone" style="display:none;">
    <div class="fallback ">
      <input name="file" type="file" />
    </div>
  </form>
  <button style="margin-top:5px; float:right; display:none;" id="load-excel-table-${collID}" class="btn btn-primary load-excel-table" projectid="${projectID}" collID="${collID}" type="button"> Load Table </button>
  <div id="import-spreadsheet-div-${collID}"></div>`;
  return ret;
};

const getExcelTable = id => {
  const ret = `
  <div style="height:100%; overflow:hidden; margin-top:10px;">
    <div id="${id}">
    </div>
  </div>`;
  return ret;
};

export const getCollectionTable = (collID, type) => {
  const headers = getTableHeaders(collID);
  let tableID = collID;
  if (type == 'modal') tableID = `modal-${collID}`;
  const ret = `
  <div class="table-responsive" style="overflow-x:auto; width:100%; ">
    <table id="${tableID}" class="table table-striped" style='white-space: nowrap; width:100%;' cellspacing="0" >
        <thead>
            <tr>
            ${headers}
            </tr>
        <tbody>
        </tbody>
    </thead>
    </table>
  </div>`;
  return ret;
};

const getFieldsOfCollection = collectionID => {
  return $s.fields.filter(field => field.collectionID === collectionID && field.hidden !== true);
};

export const getCollectionByName = (collectionName, projectID) => {
  if (projectID) {
    return $s.collections.filter(col => col.name === collectionName && col.projectID === projectID);
  } else {
    return $s.collections.filter(col => col.name === collectionName && !col.projectID);
  }
};

const getProjectData = projectID => {
  const project = $s.projects.filter(item => item.id === projectID);
  const projectName = project[0] && project[0].name ? project[0].name : '';
  const projectPart = projectName ? `projects/${projectName}/` : '';
  return { projectName, projectPart };
};

export const crudAjaxRequest = async (
  targetCollection,
  method,
  id,
  projectID,
  collName,
  formObj,
  formValues,
  errorDiv
) => {
  let url = '';
  const idsPart = id ? `/${id}` : '';
  if (targetCollection == 'data') {
    const { projectPart } = getProjectData(projectID);
    url = `/api/v1/${projectPart}data/${collName}${idsPart}`;
  } else {
    url = `/api/v1/${targetCollection}${idsPart}`;
  }
  try {
    console.log('formObj', formObj);
    const res = await axios({
      method: method,
      url: url,
      data: formObj
    });
    if (res && res.data && res.data.status === 'success') {
      console.log(res.data.data);
      if (res.data.data && res.data.data.data && res.data.data.data._id)
        return res.data.data.data._id;
      return true;
    }
    return false;
  } catch (e) {
    console.log(e);
    let err = '';
    if (e.response && e.response.data) {
      console.log(e.response.data);
      if (e.response.data.error && e.response.data.error.errors) {
        const success = showFormError(formValues, e.response.data.error.errors, true);
        if (!success) {
          if (e.response.data.message) err += JSON.stringify(e.response.data.message);
          if (err) showInfoInDiv(errorDiv, err);
        }
        return;
      }
      if (e.response.data.message) err += JSON.stringify(e.response.data.message);
    }
    if (!err) err = JSON.stringify(e);
    if (err) showInfoInDiv(errorDiv, err);
    return false;
  }
};

const prepareDataForSingleColumn = async (collName, projectID, collectionID, collFields) => {
  let ret = [];
  if (!collName) return ret;
  let refFields = [];
  let dateFields = [];
  for (var i = 0; i < collFields.length; i++) {
    if (collFields[i].ref) refFields.push(collFields[i].name);
    if (collFields[i].type == 'Date') dateFields.push(collFields[i].name);
  }
  const { projectPart, projectName } = getProjectData(projectID);
  const data = await ajaxCall('GET', `/api/v1/${projectPart}data/${collName}/populated`);
  if (data) {
    $s.data[collectionID] = data;
    const dataCopy = data.slice();
    ret = dataCopy.map(el => {
      let newObj = {};
      $.each(el, function(k) {
        if (refFields.includes(k) && el[k]) {
          let refCollID = '';
          const collNameRef = k.replace(/_id$/, '');
          const refCollData = getCollectionByName(collNameRef, projectID);
          if (refCollData && refCollData[0] && refCollData[0]._id) refCollID = refCollData[0]._id;
          let fieldsOfCollection = [];
          if (refCollID) {
            fieldsOfCollection = $s.fields.filter(f => f.collectionID === refCollID);
          }
          const showFields = getDropdownFields(el[k], fieldsOfCollection);
          if (el[k] && showFields[0]) {
            newObj[k] = el[k][showFields[0]];
          } else {
            newObj[k] = el[k]._id;
          }
        } else if (dateFields.includes(k) && el[k]) {
          const timestamp = Date.parse(el[k]);
          if (isNaN(timestamp) == false) {
            newObj[k] = moment(el[k])
              .utc()
              .format('YYYY-MM-DD');
          } else {
            console.log('not valid timestamp', el[k]);
            newObj[k] = el[k];
          }
        } else if (
          (typeof el[k] === 'object' && el[k] !== null) ||
          Array.isArray(el[k]) ||
          typeof el[k] === 'boolean'
        ) {
          newObj[k] = JSON.stringify(el[k]);
        } else {
          newObj[k] = el[k];
        }
      });
      return newObj;
    });
  }
  $s.tableData[collectionID] = ret;
  return ret;
};

export const refreshDataTables = async (TableID, collectionID, collName, projectID) => {
  const collFields = getFieldsOfCollection(collectionID);
  const data = await prepareDataForSingleColumn(collName, projectID, collectionID, collFields);

  if (!$.fn.DataTable.isDataTable(`#${TableID}`)) {
    let columns = [];
    columns.push({ data: '_id' }); // for checkboxes
    // columns.push({ data: 'DID' }); // dolphin id
    for (var i = 0; i < collFields.length; i++) {
      columns.push({ data: collFields[i].name });
    }
    // columns.push({ data: '_id' });
    columns.push({ data: 'perms' });
    var dataTableObj = {
      columns: columns,
      columnDefs: [
        { defaultContent: '', targets: '_all' }, //hides undefined error,
        {
          targets: 0,
          checkboxes: {
            selectRow: true
          }
        }
      ],
      lengthMenu: [
        [10, 25, 50, -1],
        [10, 25, 50, 'All']
      ],
      select: {
        style: 'multiple'
      }
    };
    dataTableObj.dom = '<"pull-left"f>lrt<"pull-left"i><"bottom"p><"clear">';
    dataTableObj.destroy = true;
    dataTableObj.pageLength = 10;
    dataTableObj.data = data;
    dataTableObj.hover = true;
    // speed up the table loading
    dataTableObj.deferRender = true;
    dataTableObj.scroller = true;
    dataTableObj.scrollCollapse = true;
    dataTableObj.colReorder = true;
    dataTableObj.sScrollX = true;
    $s.TableID = $(`#${TableID}`).DataTable(dataTableObj);
  } else {
    $(`#${TableID}`)
      .DataTable()
      .clear()
      .rows.add(data)
      .draw();
  }
};

const createSelectize = id => {
  if (!$(id)[0].selectize) $(id).selectize({});
};

const showTableTabs = () => {
  $(document).on('show.coreui.tab', 'a.collection[data-toggle="tab"]', function(e) {
    const collName = $(e.target).attr('collName');
    const tableID = $(e.target).attr('tableID');
    const projectID = $(e.target).attr('projectID');

    if (collName == 'all_events') {
      createSelectize(`#select-event-${projectID}`);
    } else if (collName == 'all_collections') {
      createSelectize(`#select-collection-${projectID}`);
    } else if (tableID == `tree_view_${projectID}`) {
      // refreshTreeView(projectID, $s, false);
    } else {
      refreshDataTables(tableID, tableID, collName, projectID);
    }
  });
  $(document).on('shown.coreui.tab', 'a.collection[data-toggle="tab"]', function(e) {
    $($.fn.dataTable.tables(true))
      .DataTable()
      .columns.adjust();
  });
};

const getMainDropdown = (projectID, type) => {
  let classText = '';
  let defOption = '';
  let data = '';
  let dataLabel = '';
  if (type == 'event') {
    classText = 'select-event';
    defOption = 'Select Event';
    data = $s.events;
    dataLabel = 'name';
  } else if (type == 'collection') {
    classText = 'select-collection';
    defOption = 'Select Collection';
    data = $s.collections;
    dataLabel = 'label';
  } else if (type == 'tree-view-collection') {
    classText = 'tree-view-collection';
    defOption = 'Select Collection';
    data = $s.collections;
    dataLabel = 'label';
  }
  const idText = projectID ? `id="${classText}-${projectID}"` : '';
  let dropdown = `<select class="form-control ${classText}" projectID="${projectID}" ${idText}>`;
  dropdown += `<option value="" >--- ${defOption} ---</option>`;
  if (data) {
    const projectEvents = data.filter(e => e.projectID == projectID);
    projectEvents.forEach(i => {
      dropdown += `<option  value="${i._id}">${i[dataLabel]}</option>`;
    });
  }
  dropdown += `</select>`;
  return dropdown;
};

const getEventTab = projectID => {
  const dropdown = getMainDropdown(projectID, 'event');
  const ret = `
  <div class="row" style="margin-top: 20px;">
    <div class="col-sm-8">${dropdown}</div>
    <div class="col-sm-8"></div>
  </div>
  <div id="event-form-div-${projectID}" style="display:none; margin-top: 40px;">
    <div class="col-sm-8">
      <div id="event-form-${projectID}">
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary event-reset-btn" projectID="${projectID}" type="button" >Reset</button>
        <button class="btn btn-primary event-save-btn" projectID="${projectID}" type="button">Save</button>
        <button style="display:none;" class="btn btn-success event-new-btn" projectID="${projectID}" type="button">New Data</button>
      </div>
    </div>
  </div>
  `;
  return ret;
};

const getCollectionTab = projectID => {
  const dropdown = getMainDropdown(projectID, 'collection');
  let ret = `
  <div class="row" style="margin-top: 20px;">
    <div class="col-sm-8">${dropdown}</div>
    <div class="col-sm-8"></div>
  </div>`;
  for (var i = 0; i < $s.collections.length; i++) {
    const collID = $s.collections[i]['_id'];
    ret += `<div class="collection-outerdiv" projectID="${projectID}" id="collection-outerdiv-${collID}-${projectID}" style="display:none; margin-top:40px;"></div>`;
  }
  return ret;
};

const spinnerButton = (button, mode) => {
  if (mode == 'loading') {
    $(button).prop('disabled', true);
    $(button).prepend(
      `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> `
    );
  } else if (mode == 'reset') {
    $(button).prop('disabled', false);
    $(button)
      .find('span')
      .remove();
  }
};

const getTreeViewTab = projectID => {
  const dropdown = getMainDropdown(projectID, 'tree-view-collection');
  let ret = `
  <div class="row" style="margin-top: 20px;">
    <div class="col-sm-8">${dropdown}</div>
    <div id="tree-view-data-${projectID}" projectID="${projectID}" class="col-sm-8" style="margin-top:10px;"></div>
  </div>
  <section id="d3-tree-${projectID}" style="height: 500px; max-width:100%;"></section>
  
  `;
  return ret;
};

const getCollectionNavbar = async projectId => {
  // await getCollectionFieldData();
  let header = '<ul class="nav nav-tabs" role="tablist" style="margin-top: 10px;">';
  let content = '<div class="tab-content">';

  if ($s.collections.length == 0) {
    content = '';
    header += '<p> No document found.</p>';
  }
  let tabs = [];
  tabs.push(
    {
      name: 'all_events',
      label: 'Events',
      id: `all_events_${projectId}`,
      projectID: projectId
    },
    {
      name: 'tree_view',
      label: 'Tree View',
      id: `tree_view_${projectId}`,
      projectID: projectId
    },
    {
      name: 'all_collections',
      label: 'Collections',
      id: `all_collections_${projectId}`,
      projectID: projectId
    }
  );
  let k = 0;
  for (var i = 0; i < tabs.length; i++) {
    const collectionProjectID = tabs[i].projectID;
    if ((projectId && collectionProjectID == projectId) || (!projectId && !collectionProjectID)) {
      k++;
      const collectionName = tabs[i].name;
      const collectionLabel = tabs[i].label;
      const collectionId = tabs[i].id;
      const id = getCleanDivId(collectionId);
      const collTabID = 'collTab_' + id;
      const active = k === 1 ? 'active' : '';
      const headerLi = `
      <li class="nav-item">
          <a class="nav-link ${active} collection" data-toggle="tab" collName="${collectionName}" tableID="${collectionId}" projectID="${projectId}" href="#${collTabID}" aria-expanded="true">${collectionLabel}</a>
      </li>`;
      header += headerLi;
      let colTable = '';
      let colExcelTable = '';
      let colDropzone = '';
      let crudButtons = '';
      if (collectionId == `all_events_${projectId}`) {
        colTable = getEventTab(projectId);
      } else if (collectionId == `all_collections_${projectId}`) {
        colTable = getCollectionTab(projectId);
      } else if (collectionId == `tree_view_${projectId}`) {
        colTable = getTreeViewTab(projectId);
      } else {
        colTable = getCollectionTable(collectionId, 'default');
        colExcelTable = getExcelTable(`spreadsheet-${collectionId}`);
        colDropzone = getDropzoneTable(collectionId, projectId);
        crudButtons = getCrudButtons(collectionId, collectionLabel, collectionName, projectId, {
          excel: true,
          delBtn: true
        });
      }
      const contentDiv = `
          <div role="tabpanel" class="tab-pane ${active}" searchtab="true" id="${collTabID}">
          ${crudButtons}
          ${colTable}
          ${colExcelTable}
          ${colDropzone}
        </div>`;
      content += contentDiv;
    }
  }
  header += `</ul>`;
  content += `</div>`;

  let ret = '';
  ret += '<div role="tabpanel">';
  ret += header;
  ret += content;
  ret += '</div>';
  return ret;
};

export const loadAllTabContent = () => {
  for (var i = 0; i < $s.collections.length; i++) {
    const projectID = $s.collections[i].projectID;
    const collectionID = $s.collections[i]._id;
    if (projectID && collectionID) refreshCollectionDiv(projectID, collectionID, true);
  }
};

export const getProjectNavbar = async () => {
  showTableTabs();
  bindEventHandlers();
  let [projects, collections, fields, events] = await Promise.all([
    ajaxCall('GET', '/api/v1/projects'),
    ajaxCall('GET', '/api/v1/collections'),
    ajaxCall('GET', '/api/v1/fields'),
    ajaxCall('GET', '/api/v1/events')
  ]);
  $s.collections = collections;
  $s.fields = fields;
  $s.projects = projects;
  $s.events = events;
  let tabs = [];
  // tabs.push({ label: 'Public', id: '', name: 'public' });
  if ($s.projects) tabs = tabs.concat($s.projects);
  let header = '<ul class="nav nav-tabs" role="tablist">';
  let content = '<div class="tab-content">';

  if ($s.projects.length == 0) {
    content = '';
    header = '<p> No document found.</p>';
  }
  for (var i = 0; i < tabs.length; i++) {
    const projectId = tabs[i].id;
    const projectLabel = tabs[i].label;
    const projectName = tabs[i].name;
    const id = getCleanDivId(projectName);
    const projectTabID = 'projectTab_' + id;
    const active = i === 0 ? 'active' : '';
    const headerLi = `
    <li class="nav-item">
        <a class="nav-link ${active} collection" data-toggle="tab" href="#${projectTabID}" aria-expanded="true">${projectLabel}</a>
    </li>`;
    header += headerLi;
    const colNavbar = await getCollectionNavbar(projectId);

    const contentDiv = `
    <div role="tabpanel" class="tab-pane ${active}" searchtab="true" id="${projectTabID}">
        ${colNavbar}
      </div>`;
    content += contentDiv;
  }
  header += `</ul>`;
  content += `</div>`;

  let ret = '';
  ret += '<div role="tabpanel">';
  ret += header;
  ret += content;
  ret += '</div>';
  return ret;
};
