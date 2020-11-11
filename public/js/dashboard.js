/* eslint-disable */
import axios from 'axios';
import { getCleanDivId } from './jsfuncs';
// GLOBAL SCOPE
let $s = { data: {} };

const ajaxCall = async (method, url) => {
  try {
    const res = await axios({
      method,
      url
    });
    console.log(res.data.data.data);
    return res.data.data.data;
  } catch (err) {
    console.log(err);
    return '';
  }
};

const getTableHeaders = collID => {
  let ret = '';
  for (var i = 0; i < $s.fields.length; i++) {
    if ($s.fields[i].collectionID == collID && $s.fields[i].label)
      ret += `<th>${$s.fields[i].label}</th>`;
  }
  return ret;
};

const getCollectionTable = collID => {
  const headers = getTableHeaders(collID);
  const ret = `
  <div class="table-responsive" style="overflow-x:auto; width:100%; ">
    <table id="${collID}" class="table table-striped" style='white-space: nowrap; table-layout:fixed; width:100%;' cellspacing="0" >
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
  return $s.fields.filter(field => field.collectionID === collectionID);
};

const prepareDataForSingleColumn = async collName => {
  const data = await ajaxCall('GET', `/api/v1/data/${collName}`);
  $s.data.collName = data;
  const dataCopy = data.slice();
  const ret = dataCopy.map(el => {
    $.each(el, function(k) {
      if ((typeof el[k] === 'object' && el[k] !== null) || Array.isArray(el[k])) {
        el[k] = JSON.stringify(el[k]);
      }
    });
    return el;
  });
  return ret;
};

const refreshDataTables = async (TableID, collName) => {
  console.log(TableID);
  console.log(collName);
  if (!$.fn.DataTable.isDataTable(`#${TableID}`)) {
    const collFields = getFieldsOfCollection(TableID);
    const data = await prepareDataForSingleColumn(collName);
    let columns = [];
    for (var i = 0; i < collFields.length; i++) {
      columns.push({ data: collFields[i].name });
    }
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
    // dataTableObj.scrollY = 600;
    // dataTableObj.scrollX = 500;
    dataTableObj.sScrollX = true;
    // dataTableObj.autoWidth = false;
    $s.TableID = $(`#${TableID}`).DataTable(dataTableObj);
  }
};
const showTableTabs = () => {
  $(document).on('show.coreui.tab', 'a.collection[data-toggle="tab"]', function(e) {
    const collName = $(e.target).attr('collName');
    const tableID = $(e.target).attr('tableID');
    refreshDataTables(tableID, collName);
  });
  $(document).on('shown.coreui.tab', 'a.collection[data-toggle="tab"]', function(e) {
    $($.fn.dataTable.tables(true))
      .DataTable()
      .columns.adjust();
  });
};

// NEEDS UPDATE! get all collection with project id
const getCollectionNavbar = projectLabel => {
  let header = '<ul class="nav nav-tabs" role="tablist" style="margin-top: 10px;">';
  let content = '<div class="tab-content">';

  for (var i = 0; i < $s.collections.length; i++) {
    const collectionName = $s.collections[i].name;
    const collectionLabel = $s.collections[i].label;
    const collectionId = $s.collections[i].id;
    const id = getCleanDivId(collectionLabel);
    const collTabID = 'collTab_' + id;
    const active = i === 0 ? 'active' : '';
    const headerLi = `
      <li class="nav-item">
          <a class="nav-link ${active} collection" data-toggle="tab" collName="${collectionName}" tableID="${collectionId}" href="#${collTabID}" aria-expanded="true">${collectionLabel}</a>
      </li>`;
    header += headerLi;
    const colNavbar = getCollectionTable(collectionId);

    const contentDiv = `
      <div role="tabpanel" class="tab-pane ${active}" searchtab="true" id="${collTabID}">
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

export const getProjectNavbar = async rowdata => {
  showTableTabs();
  // NEEDS UPDATE! : get all projects
  let [collections, fields] = await Promise.all([
    ajaxCall('GET', '/api/v1/collections'),
    ajaxCall('GET', '/api/v1/fields')
  ]);
  $s.collections = collections;
  $s.fields = fields;

  let header = '<ul class="nav nav-tabs" role="tablist">';
  let content = '<div class="tab-content">';

  const projects = ['Vitiligo'];
  for (var i = 0; i < projects.length; i++) {
    const projectLabel = projects[i];
    const id = getCleanDivId(projectLabel);
    const projectTabID = 'projectTab_' + id;
    const active = i === 0 ? 'active' : '';
    const headerLi = `
    <li class="nav-item">
        <a class="nav-link ${active}" data-toggle="tab" href="#${projectTabID}" aria-expanded="true">${projectLabel}</a>
    </li>`;
    header += headerLi;
    const colNavbar = getCollectionNavbar(projectLabel);

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
