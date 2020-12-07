/* eslint-disable */
import axios from 'axios';
import { getCleanDivId } from './jsfuncs';
// GLOBAL SCOPE
let $s = { data: {} };
let $g = { data: {} };
// Make it for all projects for now only vitiligo supported
const projectPart = 'projects/vitiligo/';
const colls = ['exp', 'biosamp', 'sample', 'file'];

const ajaxCall = async (method, url) => {
  try {
    const res = await axios({
      method,
      url
    });
    return res.data.data;
  } catch (err) {
    console.log(err);
    return '';
  }
};

const crudCall = async (method, url, data) => {
  try {
    const res = await axios({
      method,
      url,
      data
    });
    return res;
  } catch (err) {
    console.log(err);
    return '';
  }
};

const getTableColumns = data => {
  if (data[0]) return Object.keys(data[0]);
  return [];
};

const getTableHeaders = cols => {
  let ret = '';
  for (var i = 0; i < cols.length; i++) {
    ret += `<th>${cols[i]}</th>`;
  }
  return ret;
};

const getImportTable = (data, TableID) => {
  const cols = getTableColumns(data);
  const headers = getTableHeaders(cols);
  const ret = `
  <div class="table-responsive" style="overflow-x:auto; width:100%; ">
    <table id="${TableID}" class="table table-striped" style='white-space: nowrap; width:100%;' cellspacing="0" >
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
const bindEventHandlers = () => {
  $(document).on('click', '.update-db', function(e) {
    e.preventDefault();
    const tabId = $(this).attr('tabId');
    getDbData(tabId);
  });
};

const compareWithDB = async (gdata, ddata, tabId) => {
  //console.log(ddata[0].name);
  // get parentCollection data
  const parentColl = colls[Number(tabId) - 1];
  const currColl = colls[tabId];
  const dat = await ajaxCall('GET', `/api/v1/${projectPart}data/${parentColl}`);
  const parentData = dat.data;

  for (var i = 0; i < gdata.length; i++) {
    let recordfound = [];
    try {
      //name should be unique for this check
      recordfound = ddata.filter(ddata => ddata.name === gdata[i].name);
    } catch (err) {
      console.log(err);
    }
    //record found -> then compare it and patch if necessary
    if (recordfound.length) {
      //console.log('recordfound:', recordfound);
      let k = 0;
      Object.keys(gdata[i]).forEach(key => {
        if (gdata[i][key] != recordfound[0][key]) {
          k++;
        }
      });

      // ** Consider removing unused keys

      if (k > 0) {
        console.log(ddata);
        console.log('Patch ', gdata[i].name);
        const res = await crudCall(
          'PATCH',
          `/api/v1/${projectPart}data/${currColl}/${recordfound[0]._id}`,
          gdata[i]
        );
      }
      // record not found -> insert document
    } else {
      let m = 0;
      if (tabId == 1 && !gdata[i].exp_id) {
        m++;
        console.log(parentData[0]._id);
        // there is only one experiment for now
        gdata[i].exp_id = parentData[0]._id;
      } else if (tabId == 2 && !gdata[i].biosamp_id) {
        // find parent data based on their unique_id
        const recordfound = parentData.filter(dat => dat.unique_id === gdata[i].unique_id);
        if (recordfound.length > 0) {
          m++;
          gdata[i].biosamp_id = recordfound[0]._id;
        }
      } else if (tabId == 3 && !gdata[i].sample_id) {
        const recordfound = parentData.filter(dat => dat.unique_id === gdata[i].unique_id);
        if (recordfound.length > 0) {
          m++;
          gdata[i].sample_id = recordfound[0]._id;
        }
      }
      if (m > 0) {
        console.log('DATA:[', i, ']', gdata[i]);
        const res = await crudCall('POST', `/api/v1/${projectPart}data/${currColl}`, gdata[i]);
      }
    }
  }
};

const getDbData = async tabId => {
  // Only three collections supported now (make this part generic)
  const data = await ajaxCall('GET', `/api/v1/${projectPart}data/${colls[tabId]}`);
  $s.data[tabId] = data.data;

  compareWithDB($g.data[tabId], $s.data[tabId], tabId);
};

const showTableTabs = async googleSheetId => {
  $(document).on('show.coreui.tab', 'a.collection[data-toggle="tab"]', function(e) {
    const tableID = $(e.target).attr('tableID');
    const contentDivId = $(e.target).attr('href');
    refreshDataTables(googleSheetId, tableID, contentDivId);
  });
  $(document).on('shown.coreui.tab', 'a.collection[data-toggle="tab"]', function(e) {
    $($.fn.dataTable.tables(true))
      .DataTable()
      .columns.adjust();
  });
};
const prepareData = async (googleSheetId, tableID) => {
  const data = await ajaxCall('GET', ` /api/v1/misc/getGoogleSheet/${googleSheetId}/${tableID}`);
  const dataObj = JSON.parse(data);
  $g.data[tableID] = dataObj;
  return dataObj;
};
const refreshDataTables = async (googleSheetId, TableID, contentDivId) => {
  if (!$.fn.DataTable.isDataTable(`#${TableID}`)) {
    const data = await prepareData(googleSheetId, TableID);
    const tableContent = getImportTable(data, TableID);
    $(contentDivId).append(tableContent);

    const cols = getTableColumns(data);
    let columns = [];
    for (var i = 0; i < cols.length; i++) {
      columns.push({ data: cols[i] });
    }
    var dataTableObj = {
      columns: columns,
      columnDefs: [
        { defaultContent: '-', targets: '_all' } //hides undefined error
      ],
      buttons: [{ extend: 'csv' }]
    };
    dataTableObj.dom = '<"pull-left"f>rt<"pull-left"i><"bottom"p><"clear">';
    dataTableObj.destroy = true;
    dataTableObj.data = data;
    dataTableObj.hover = true;
    // speed up the table loading
    dataTableObj.deferRender = true;
    dataTableObj.scroller = true;
    dataTableObj.scrollCollapse = true;
    dataTableObj.colReorder = true;
    // dataTableObj.scrollY = 600;
    // dataTableObj.scrollX = 500;
    dataTableObj.sScrollX = true;
    // dataTableObj.autoWidth = false;

    $s.TableID = $(`#${TableID}`).DataTable(dataTableObj);
  }
};

export const getImportPageNavBar = async googleSheetId => {
  bindEventHandlers();
  showTableTabs(googleSheetId);
  let header = '<ul class="nav nav-tabs" role="tablist" style="margin-top: 10px;">';
  let content = '<div class="tab-content">';

  let tabNames = ['Biosample', 'Sample', 'Files'];
  for (var i = 0; i < tabNames.length; i++) {
    const tabId = i + 1;
    const Name = tabNames[i];
    const Label = tabNames[i];
    const id = getCleanDivId(Label);
    const importTabId = 'importTab_' + id;
    const active = i === 0 ? 'active' : '';
    const headerLi = `
      <li class="nav-item">
          <a class="nav-link ${active} collection" data-toggle="tab" collName="${Name}" tableID="${tabId}" href="#${importTabId}" aria-expanded="true">${Label}</a>
      </li>`;
    header += headerLi;
    const contentDiv = `
      <div role="tabpanel" class="tab-pane ${active}" searchtab="true" id="${importTabId}">
      <button class="btn update-db btn-secondary" type="button" tabId="${tabId}">Update ${Label}</button>
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
