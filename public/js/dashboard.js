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
  ret += `<th>ID</th>`;

  return ret;
};

const getCollectionTable = collID => {
  const headers = getTableHeaders(collID);
  const ret = `
  <div class="table-responsive" style="overflow-x:auto; width:100%; ">
    <table id="${collID}" class="table table-striped" style='white-space: nowrap; width:100%;' cellspacing="0" >
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

const prepareDataForSingleColumn = async (collName, projectID) => {
  const project = $s.projects.filter(item => item.id === projectID);
  const projectName = project[0] && project[0].name ? project[0].name : '';
  const projectPart = projectName ? `projects/${projectName}/` : '';
  const data = await ajaxCall('GET', `/api/v1/${projectPart}data/${collName}`);
  const saveDataPath = `${projectName}_${collName}`;
  $s.data[saveDataPath] = data;
  const dataCopy = data.slice();
  let ret = dataCopy.map(el => {
    $.each(el, function(k) {
      if ((typeof el[k] === 'object' && el[k] !== null) || Array.isArray(el[k])) {
        el[k] = JSON.stringify(el[k]);
      }
    });
    return el;
  });
  return ret;
};

const refreshDataTables = async (TableID, collName, projectID) => {
  if (!$.fn.DataTable.isDataTable(`#${TableID}`)) {
    const collFields = getFieldsOfCollection(TableID);
    const data = await prepareDataForSingleColumn(collName, projectID);
    let columns = [];
    for (var i = 0; i < collFields.length; i++) {
      columns.push({ data: collFields[i].name });
    }
    columns.push({ data: '_id' });
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
const showTableTabs = () => {
  $(document).on('show.coreui.tab', 'a.collection[data-toggle="tab"]', function(e) {
    const collName = $(e.target).attr('collName');
    const tableID = $(e.target).attr('tableID');
    const projectID = $(e.target).attr('projectID');
    refreshDataTables(tableID, collName, projectID);
  });
  $(document).on('shown.coreui.tab', 'a.collection[data-toggle="tab"]', function(e) {
    $($.fn.dataTable.tables(true))
      .DataTable()
      .columns.adjust();
  });
};

const getCollectionNavbar = projectId => {
  let header = '<ul class="nav nav-tabs" role="tablist" style="margin-top: 10px;">';
  let content = '<div class="tab-content">';

  if ($s.collections.length == 0) {
    content = '';
    header += '<p> No document found.</p>';
  }
  let k = 0;
  for (var i = 0; i < $s.collections.length; i++) {
    const collectionProjectID = $s.collections[i].projectID;
    if ((projectId && collectionProjectID == projectId) || (!projectId && !collectionProjectID)) {
      k++;
      const collectionName = $s.collections[i].name;
      const collectionLabel = $s.collections[i].label;
      const collectionId = $s.collections[i].id;
      const id = getCleanDivId(collectionLabel);
      const collTabID = 'collTab_' + id;
      const active = k === 1 ? 'active' : '';
      const headerLi = `
      <li class="nav-item">
          <a class="nav-link ${active} collection" data-toggle="tab" collName="${collectionName}" tableID="${collectionId}" projectID="${projectId}" href="#${collTabID}" aria-expanded="true">${collectionLabel}</a>
      </li>`;
      header += headerLi;
      const colNavbar = getCollectionTable(collectionId);

      const contentDiv = `
      <div role="tabpanel" class="tab-pane ${active}" searchtab="true" id="${collTabID}">
          ${colNavbar}
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

export const getProjectNavbar = async () => {
  showTableTabs();
  let [projects, collections, fields] = await Promise.all([
    ajaxCall('GET', '/api/v1/projects'),
    ajaxCall('GET', '/api/v1/collections'),
    ajaxCall('GET', '/api/v1/fields')
  ]);
  $s.collections = collections;
  $s.fields = fields;
  $s.projects = projects;
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
        <a class="nav-link ${active}" data-toggle="tab" href="#${projectTabID}" aria-expanded="true">${projectLabel}</a>
    </li>`;
    header += headerLi;
    const colNavbar = getCollectionNavbar(projectId);

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
