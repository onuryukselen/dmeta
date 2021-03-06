/* eslint-disable */
import '@babel/polyfill';
import axios from 'axios';
import { loadLoginDiv, login, logout } from './login';
import { getProjectNavbar, loadAllTabContent } from './dashboard.js';
import { refreshAdminProjectNavbar } from './admin-dashboard.js';
import { getProfileNavbar, loadProfileTabContent } from './profile.js';
import { getEventNavbar, loadEventContent } from './event.js';
import { getImportPageNavBar } from './importpage.js';
import { globalEventBinders } from './jsfuncs.js';

import 'jquery';
import '@coreui/coreui';
require('datatables.net'); // Datatables Core
require('datatables.net-bs4/js/dataTables.bootstrap4.js'); // Datatables Bootstrap 4
require('datatables.net-bs4/css/dataTables.bootstrap4.css'); // Datatables Bootstrap 4
require('datatables.net-colreorder');
require('datatables.net-colreorder-bs4');
require('datatables.net-rowreorder-bs4');
require('datatables.net-rowreorder-bs4/css/rowReorder.bootstrap4.min.css');
require('jquery-datatables-checkboxes');
require('selectize/dist/js/selectize.js');
require('selectize/dist/css/selectize.bootstrap3.css');
import 'handsontable/dist/handsontable.full.css';
require('dropzone/dist/min/dropzone.min.css');
window.Dropzone = require('dropzone/dist/min/dropzone.min.js');
// require('datatables.net-buttons');
// require('datatables.net-buttons-bs4');
// require('bootstrap-select');
// require('bootstrap-select/js/i18n/defaults-en_US');

// import './../css/style.css';
import './../vendors/@coreui/icons/css/free.min.css';
import './../vendors/@coreui/icons/css/flag.min.css';
import './../vendors/@coreui/icons/css/brand.min.css';

// GLOBAL ENV CONFIG
globalEventBinders();
const envConf = document.querySelector('#session-env-config');
const ssologin =
  envConf && envConf.getAttribute('sso_login') && envConf.getAttribute('sso_login') == 'true';
// DOM ELEMENTS
const logOutBtn = document.querySelector('.nav__el--logout');
const logInBtn = document.querySelector('.nav__el--login');
const afterSsoClose = document.querySelector('.after-sso-close');
const loginForm = document.querySelector('#loginOuterDiv');
const allProjectNav = document.querySelector('#allProjectNav');
const allProfileNav = document.querySelector('#allProfileNav');
const allEventNav = document.querySelector('#allEventNav');
const allAdminEventNav = document.querySelector('#allAdminEventNav');
const adminAllProjectNav = document.querySelector('#admin-allProjectNav');
const dmetaVersionBut = document.querySelector('#dmetaVersionBut');

const importpageNav = document.querySelector('#import-page');
const googleSheetId = envConf && envConf.getAttribute('google_sheet_id');
const userRole = envConf && envConf.getAttribute('role');

if (logOutBtn) logOutBtn.addEventListener('click', logout);

function popupwindow(url, title, w, h) {
  var left = screen.width / 2 - w / 2;
  var top = screen.height / 2 - h / 2;
  return window.open(
    url,
    title,
    'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' +
      w +
      ', height=' +
      h +
      ', top=' +
      top +
      ', left=' +
      left
  );
}

// open child window for SSO if user clicks on sign-in button
if (logInBtn && ssologin) {
  logInBtn.addEventListener('click', e => {
    e.preventDefault();
    var SSO_URL = envConf.getAttribute('sso_url');
    var CLIENT_ID = envConf.getAttribute('client_id');
    var SSO_REDIRECT_URL = `${window.location.origin}/receivetoken`;
    var SSO_FINAL_URL = `${SSO_URL}/dialog/authorize?redirect_uri=${SSO_REDIRECT_URL}&response_type=code&client_id=${CLIENT_ID}&scope=offline_access`;
    popupwindow(SSO_FINAL_URL, 'Login', 650, 800);
  });
}

if (afterSsoClose) {
  if (window.opener) {
    window.opener.focus();

    if (window.opener && !window.opener.closed) {
      window.opener.location.reload();
    }
  } else {
    window.location = envConf.getAttribute('base_url');
  }
  window.close();
}

if (loginForm) {
  loadLoginDiv('loginDiv');
  $('#loginOuterDiv').on('click', '#loginBtn', function(e) {
    e.preventDefault();
    const usernameoremail = document.getElementById('usernameoremail').value;
    const password = document.getElementById('password').value;
    login(usernameoremail, password);
  });
  $('#loginOuterDiv').on('click', '#signupBtn', function(e) {
    e.preventDefault();
    loadLoginDiv('registerDiv');
  });
  $('#loginOuterDiv').on('click', '.signInBackBtn', function(e) {
    e.preventDefault();
    loadLoginDiv('loginDiv');
  });
  $('#loginOuterDiv').on('click', '#registerBtn', async function(e) {
    e.preventDefault();
    var formValues = $('#loginOuterDiv').find('input');
    var requiredFields = [
      'firstname',
      'lastname',
      'username',
      'email',
      'institute',
      'lab',
      'password',
      'passwordConfirm'
    ];
    const [formObj, stop] = createFormObj(formValues, requiredFields, true);
    console.log(formObj);
    console.log(stop);
    if (stop === false) {
      try {
        const res = await axios({
          method: 'POST',
          url: '/api/v1/users/signup',
          data: formObj
        });

        if (res && res.data && res.data.status === 'success') {
          console.log('success');
          loadLoginDiv('successSignUpDiv');
        }
      } catch (e) {
        console.log(e.response);
        if (e.response && e.response.data && e.response.data.error) {
          const errors = e.response.data.error.errors;
          showFormError(formValues, errors, true);
        }
      }
    }
  });
}

(async () => {
  if (allProjectNav) {
    const projectNavbar = await getProjectNavbar();
    $('#allProjectNav').append(projectNavbar);
    // load all tab content
    loadAllTabContent();
    $('a.collection[data-toggle="tab"]').trigger('show.coreui.tab');
    $('[data-toggle="tooltip"]').tooltip();
  }
  if (allProfileNav) {
    const profileNavbar = await getProfileNavbar(userRole);
    $('#allProfileNav').append(profileNavbar);
    loadProfileTabContent(userRole);
  }

  // first get adminEventNavbar then allEventNav
  if (allAdminEventNav) {
    const adminEventNavbar = await getEventNavbar('adminevents');
    $('#allAdminEventNav').append(adminEventNavbar);
  }
  if (allEventNav) {
    const eventNavbar = await getEventNavbar('events');
    $('#allEventNav').append(eventNavbar);
    await loadEventContent(userRole);
  }

  if (adminAllProjectNav) {
    const adminProjectNavbar = await refreshAdminProjectNavbar();
    $('#admin-allProjectNav').append(adminProjectNavbar);
    // load all tab content
    $('a.collection[data-toggle="tab"]').trigger('show.coreui.tab');
  }
  if (dmetaVersionBut) {
    // $('#dmetaVersionBut').on('click', function(event) {
    //   console.log('not working');
    // });
    var checkLoad = $('#versionNotes').attr('readonly');
    if (typeof checkLoad === typeof undefined || checkLoad === false) {
      try {
        const res = await axios({
          method: 'GET',
          url: '/api/v1/misc/changelog'
        });
        const changeLogData = res.data.data;
        $('#versionNotes').val(JSON.parse(changeLogData));
        $('#versionNotes').attr('readonly', 'readonly');
      } catch (err) {
        console.log(err);
        return '';
      }
    }
  }
  if (importpageNav && googleSheetId) {
    const importpage = await getImportPageNavBar(googleSheetId);
    $('#import-page').append(importpage);
    $('a.collection[data-toggle="tab"]').trigger('show.coreui.tab');

    // choose "run" collection as default in the run tab
    const runID = $('#allcollections option')
      .filter(function() {
        return $(this).text() == 'run';
      })
      .val();
    $('#allcollections').val(runID);
    $(`select.collection-control`).trigger('change');
  }
})();
