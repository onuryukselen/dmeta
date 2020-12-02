/* eslint-disable */
import axios from 'axios';
import { getCleanDivId } from './jsfuncs';
// GLOBAL SCOPE
let $s = { data: {} };
let $g = { data: {}, keys: {} };

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

const getTableColumns = data => {
  console.log(data[0]);
  console.log(Object.keys(data[0]));
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
  console.log(googleSheetId, TableID, contentDivId);
  if (!$.fn.DataTable.isDataTable(`#${TableID}`)) {
    const data = await prepareData(googleSheetId, TableID);
    const tableContent = getImportTable(data, TableID);
    console.log(tableContent);
    $(contentDivId).append(tableContent);

    const cols = getTableColumns(data);
    let columns = [];
    for (var i = 0; i < cols.length; i++) {
      columns.push({ data: cols[i] });
    }
    console.log(columns);
    var dataTableObj = {
      columns: columns,
      columnDefs: [
        { defaultContent: '-', targets: '_all' } //hides undefined error
      ]
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
  showTableTabs(googleSheetId);
  let header = '<ul class="nav nav-tabs" role="tablist" style="margin-top: 10px;">';
  let content = '<div class="tab-content">';

  let tabNames = ['Biosamp', 'Sample', 'Files'];
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
      <div role="tabpanel" class="tab-pane ${active}" searchtab="true" id="${importTabId}"></div>`;
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
