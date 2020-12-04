/* eslint-disable */
import axios from 'axios';
import { getCleanDivId } from './jsfuncs';
// GLOBAL SCOPE
let $s = { data: {} };
$s.AdminCollectionFields = [
  'name',
  'label',
  'type',
  'required',
  'active',
  'enum',
  'checkvalid',
  'min',
  'max',
  'minlength',
  'maxlength',
  'ref',
  'collectionID',
  'id',
  'creationDate',
  'lastUpdateDate'
];

$s.AdminAllCollectionFields = [
  'name',
  'label',
  'slug',
  'version',
  'active',
  'parentCollectionID',
  'projectID',
  'id',
  'perms',
  'restrictTo',
  'owner',
  'creationDate',
  'lastUpdateDate'
];

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
  let headerList;
  if (collID == 'all_collections') {
    headerList = $s.AdminAllCollectionFields;
  } else {
    headerList = $s.AdminCollectionFields;
  }
  for (var k = 0; k < headerList.length; k++) {
    const label = headerList[k].charAt(0).toUpperCase() + headerList[k].slice(1);
    ret += `<th>${label}</th>`;
  }
  return ret;
};

const getCollectionTable = collID => {
  const headers = getTableHeaders(collID);
  const ret = `
  <div class="table-responsive" style="overflow-x:auto; width:100%; ">
    <table id="${collID}" class="table table-striped" style="white-space:nowrap;  width:100%;" cellspacing="0" cellpadding="0" border="0">
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

const prepareDataForSingleColumn = async collID => {
  let data;
  if (collID == 'all_collections') {
    // Use "$s.collections" prepare all_collections table
    data = $s.collections;
  } else {
    // Use $s.fields to prepare data
    data = getFieldsOfCollection(collID);
  }
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

const refreshDataTables = async TableID => {
  if (!$.fn.DataTable.isDataTable(`#${TableID}`)) {
    const data = await prepareDataForSingleColumn(TableID);
    let columns = [];
    let fieldList;
    if (TableID == 'all_collections') {
      fieldList = $s.AdminAllCollectionFields;
    } else {
      fieldList = $s.AdminCollectionFields;
    }
    for (var i = 0; i < fieldList.length; i++) {
      columns.push({ data: fieldList[i] });
    }
    var dataTableObj = {
      columns: columns,
      columnDefs: [
        { defaultContent: '-', targets: '_all' } //hides undefined error
      ],
      lengthMenu: [
        [10, 25, 50, -1],
        [10, 25, 50, 'All']
      ]
    };
    dataTableObj.dom = '<"pull-left"f>lrt<"pull-left"i><"bottom"p><"clear">';
    dataTableObj.destroy = true;
    dataTableObj.pageLength = 25;
    dataTableObj.data = data;
    dataTableObj.hover = true;
    // speed up the table loading
    dataTableObj.deferRender = true;
    dataTableObj.scroller = true;
    dataTableObj.colReorder = true;
    dataTableObj.scrollX = '500';
    $s.TableID = $(`#${TableID}`).DataTable(dataTableObj);
  }
};
const showTableTabs = () => {
  $(document).on('show.coreui.tab', 'a.collection[data-toggle="tab"]', function(e) {
    const tableID = $(e.target).attr('tableID');
    refreshDataTables(tableID);
  });
  $(document).on('shown.coreui.tab', 'a.collection[data-toggle="tab"]', function(e) {
    $($.fn.dataTable.tables(true))
      .DataTable()
      .columns.adjust();
  });
};

// NEEDS UPDATE! get all collection with project id
const getCollectionNavbar = projectId => {
  let header = '<ul class="nav nav-tabs" role="tablist" style="margin-top: 10px;">';
  let content = '<div class="tab-content">';
  let tabs = [];
  tabs.push({ label: 'All Collections', id: 'all_collections' });
  tabs = tabs.concat($s.collections);
  let k = 0;
  for (var i = 0; i < tabs.length; i++) {
    const collectionProjectID = tabs[i].projectID;
    if ((projectId && collectionProjectID == projectId) || (!projectId && !collectionProjectID)) {
      k++;
      const collectionLabel = tabs[i].label;
      const collectionId = tabs[i].id;
      const id = getCleanDivId(collectionLabel);
      const collTabID = 'collTab_' + id;
      const active = k === 1 ? 'active' : '';
      const headerLi = `
      <li class="nav-item">
          <a class="nav-link ${active} collection" data-toggle="tab" tableID="${collectionId}" href="#${collTabID}" aria-expanded="true">${collectionLabel}</a>
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

export const getAdminProjectNavbar = async rowdata => {
  showTableTabs();
  let [collections, fields, projects] = await Promise.all([
    ajaxCall('GET', '/api/v1/collections'),
    ajaxCall('GET', '/api/v1/fields'),
    ajaxCall('GET', '/api/v1/projects')
  ]);
  $s.collections = collections;
  console.log($s.collections);
  $s.fields = fields;
  $s.projects = projects;
  let tabs = [];
  // tabs.push({ label: 'Public', id: '', name: 'public' });
  tabs = tabs.concat($s.projects);

  let header = '<ul class="nav nav-tabs" role="tablist">';
  let content = '<div class="tab-content">';

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
