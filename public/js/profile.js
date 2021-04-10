/* eslint-disable */
import axios from 'axios';
import moment from 'moment';

import { getCleanDivId } from './jsfuncs';

// GLOBAL SCOPE
let $s = { usergroups: {} };

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

const getGroupTableOptions = (owner_id, u_id) => {
  if (owner_id === u_id) {
    //if user is the owner of the group
    var button = `<div class="btn-group">
        <button type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown" aria-expanded="true">Options <span class="fa fa-caret-down"></span></button>
        <ul class="dropdown-menu" role="menu">
          <li><a class="dropdown-item viewGroupMembers">View Group Members</a></li>
          <li class="divider"></li>
          <li><a class="dropdown-item addUsers">Edit Group Members</a></li>
          <li class="divider"></li><li><a  class="dropdown-item editGroup">Edit Group Name</a></li>
          <li><a class="dropdown-item deleteGroup">Delete Group</a></li>
        </ul>
      </div>`;
  } else {
    var button = `<div class="btn-group"><button type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown" aria-expanded="true">Options <span class="fa fa-caret-down"></span></button>
    <ul class="dropdown-menu" role="menu">
      <li><a class="dropdown-item viewGroupMembers">View Group Members</a></li>
    </ul>
    </div>`;
  }
  return button;
};

export const refreshDataTables = async TableID => {
  console.log($s.usergroups);
  const data = $s.usergroups;
  const fomatted_data = data.map(i => {
    i.creationDate = moment(i.creationDate).format('YYYY-MM-DD');
    return i;
  });

  if (!$.fn.DataTable.isDataTable(`#${TableID}`)) {
    let columns = [];
    columns.push({ data: 'group_name' });
    columns.push({ data: 'owner_username' });
    columns.push({ data: 'creationDate' });
    columns.push({
      data: null,
      fnCreatedCell: function(nTd, sData, oData, iRow, iCol) {
        $(nTd).html(getGroupTableOptions(oData.owner, oData.user_id));
      }
    });
    var dataTableObj = {
      columns: columns,
      columnDefs: [
        { defaultContent: '', targets: '_all' } //hides undefined error,
      ]
    };
    dataTableObj.dom = '<"pull-left"f>lrt<"pull-left"i><"bottom"p><"clear">';
    dataTableObj.destroy = true;
    dataTableObj.pageLength = 10;
    dataTableObj.data = fomatted_data;
    dataTableObj.hover = true;
    // speed up the table loading
    dataTableObj.deferRender = true;
    dataTableObj.scroller = true;
    dataTableObj.scrollCollapse = true;
    dataTableObj.colReorder = true;
    // dataTableObj.sScrollX = true; // dropdown remains under the datatable div
    $s.TableID = $(`#${TableID}`).DataTable(dataTableObj);
  }
};

const getTableHeaders = labels => {
  let ret = '';
  for (var i = 0; i < labels.length; i++) {
    ret += `<th>${labels[i]}</th>`;
  }
  return ret;
};

const getGroupsTab = id => {
  const headers = getTableHeaders(['Group Name', 'Owner', 'Created On', 'Options']);
  const tableID = `table-${id}`;
  const table = `
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
  const button = `<button class="btn btn-primary create-group" type="button">Create a Group</button>`;
  const groups = `
  <div style="margin-top:10px;" class="row">
    <div class="col-sm-12">
      <div class="card">
        <div class="card-header"> 
        <span style="font-size:large; font-weight:600;"><i class="cil-people"> </i> Groups</span>
          <div style="float:right;" class="card-header-actions">
            ${button}
          </div>
        </div>
      <div class="card-body">
        ${table}
      </div>
    </div>
  </div>`;
  return groups;
};

export const loadProfileTabContent = () => {
  const tableID = 'table-groups';
  refreshDataTables(tableID);
};

const bindEventHandlers = () => {
  $(document).on('click', `a.viewGroupMembers`, async function(e) {
    $('#groupModal').modal('show');
  });
};

export const getProfileNavbar = async () => {
  bindEventHandlers();
  let [usergroups] = await Promise.all([
    // ajaxCall('GET', '/api/v1/groups'),
    ajaxCall('GET', '/api/v1/usergroups')
  ]);
  $s.usergroups = usergroups;
  let tabs = [];
  tabs.push({ label: 'Groups', id: 'groups' });
  let header = '<ul class="nav nav-tabs" role="tablist">';
  let content = '<div class="tab-content">';

  for (var i = 0; i < tabs.length; i++) {
    const id = tabs[i].id;
    const label = tabs[i].label;
    const tabID = 'tab_' + id;
    const active = i === 0 ? 'active' : '';
    const headerLi = `
    <li class="nav-item">
        <a class="nav-link ${active}" data-toggle="tab" href="#${tabID}" aria-expanded="true">${label}</a>
    </li>`;
    header += headerLi;
    let tabContent = '';
    if (id == 'groups') {
      tabContent = getGroupsTab(id);
    }

    const contentDiv = `
    <div role="tabpanel" class="tab-pane ${active}" searchtab="true" id="${tabID}">
        ${tabContent}
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
