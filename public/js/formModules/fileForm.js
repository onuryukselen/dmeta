/* eslint-disable */
import axios from 'axios';
import {
  createFormObj,
  convertFormObj,
  getDropdownFields,
  createElement,
  showInfoModal,
  getSimpleDropdown
} from './../jsfuncs';
import { getFormRow } from './../formModules/crudData';

let $s = { datatables: {}, data: {}, collections: {}, fields: {}, projects: {}, server: {} };

const updateDropdownOptions = (dropdown, data) => {
  console.log(dropdown);
  console.log(data);
  dropdown.empty();
  for (var k = 0; k < data.length; k++) {
    if (data[k]['_id'] && data[k]['name']) {
      dropdown.append(
        $('<option></option>')
          .val(data[k]['_id'])
          .html(data[k]['name'])
      );
    }
  }
};

const getFilePatternDiv = () => {
  return `<div class="form-group row">
  <label class="col-md-3 col-form-label text-right">File Pattern</label>
  <div class="col-md-9">
      <div class="filePattern customize" style="display: block;">
      <div class="form-group row">
          <div class="col-sm-6 singlepatternDiv" style="display:none;">
            <div class="row">
              <p class="col-sm-5 col-form-label">Filename Extension <span><a data-toggle="tooltip" data-placement="bottom" title="Please enter end of the file name to filter files (eg. fastq or fq.gz). This pattern will be removed from the file names to fill 'Names' field in the table below."><i class='glyphicon glyphicon-info-sign'></i></a></span> </p>
              <div class="col-sm-7">
                  <input type="text" class="form-control no-hide" id="single_pattern" name="single_pattern" value="">
              </div>
            </div>
              <div style="margin-top:8px;">
                  <select id="singleList" type="select-multiple" multiple class="form-control" size="9"></select>
              </div>
          </div>
          <div class="col-sm-6 forwardpatternDiv" style="display:none;">
            <div class="row">
              <p class="col-sm-5 col-form-label text-right">R1 Pattern <span><a data-toggle="tooltip" data-placement="bottom" title="Please enter pattern for forward reads eg. _R1"><i class='glyphicon glyphicon-info-sign'></i></a></span> </p>
              <div class="col-sm-7">
                  <input type="text" class="form-control no-hide" id="forward_pattern" name="forward_pattern" value="_R1">
              </div>
            </div>
              <div style="margin-top:8px; margin-bottom:12px;">
                  <select id="forwardList" type="select-multiple" multiple class="form-control" size="9"></select>
              </div>
          </div>
          <div class="col-sm-6 reversepatternDiv" style="display:none;">
            <div class="row">
              <p class="col-sm-5 col-form-label text-right">R2 Pattern <span><a data-toggle="tooltip" data-placement="bottom" title="Please enter pattern for reverse reads eg. _R2"><i class='glyphicon glyphicon-info-sign'></i></a></span> </p>
              <div class="col-sm-7">
                  <input type="text" class="form-control no-hide" id="reverse_pattern" name="reverse_pattern" value="_R2">
              </div>
            </div>
              <div style="margin-top:8px; margin-bottom:12px;">
                  <select id="reverseList" type="select-multiple" multiple class="form-control" size="9"></select>
              </div>
          </div>
          <div class="col-sm-6 r3patternDiv" style="display:none;">
            <div class="row">
              <p class="col-sm-5 col-form-label text-right">R3 Pattern <span><a data-toggle="tooltip" data-placement="bottom" title="Please enter pattern for reads eg. _R3"><i class='glyphicon glyphicon-info-sign'></i></a></span> </p>
              <div class="col-sm-7">
                  <input type="text" class="form-control no-hide" id="r3_pattern" name="r3_pattern" value="_R3">
              </div>
            </div>
              <div style="margin-top:8px;">
                  <select id="r3List" type="select-multiple" multiple class="form-control" size="9"></select>
              </div>
          </div>
          <div class="col-sm-6 r4patternDiv" style="display:none;">
            <div class="row">
              <p class="col-sm-5 col-form-label text-right">R4 Pattern <span><a data-toggle="tooltip" data-placement="bottom" title="Please enter pattern for reads eg. _R4"><i class='glyphicon glyphicon-info-sign'></i></a></span> </p>
              <div class="col-sm-7">
                  <input type="text" class="form-control no-hide" id="r4_pattern" name="r4_pattern" value="_R4">
              </div>
            </div>
              <div style="margin-top:8px;">
                  <select id="r4List" type="select-multiple" multiple class="form-control" size="9"></select>
              </div>
          </div>
      </div>
  <div class="form-group patternButs" style="display:none;">
          <div class="float-right">
              <span class="pull-right" style="padding-top:7px; padding-left:5px;"><a data-toggle="tooltip" data-placement="bottom" title="In order to merge multiple files, first select the files and then click 'Add Selected Files' button. If you don't need to merge files, you can simply click 'Add All Files' button."><i class='glyphicon glyphicon-info-sign'></i></a></span>
              <button id="clear_selection" type="button" class="btn btn-warning pull-right" style="margin-right:3px;" ">Reset</button>
              <button id="smart_add_file" type="button" class="btn btn-primary pull-right" style="margin-right:3px;" >Add All Files</button>
              <button id="add_selection_file" type="button" class="btn btn-primary pull-right" >Add Selected Files</button>
          </div>
  </div>
  <div class="form-group patternTable" style="display:none;">
      <div class="form-group" style="margin-top:60px;">
          <table id="selectedSamples" class="table table-striped compact table-bordered display" cellspacing="0" width="100%">
              <thead>
                  <tr>
                      <th scope="col">Name</th>
                      <th scope="col">Files Used</th>
                      <th scope="col">Directory</th>
                      <th scope="col" style="width:20px;">Remove</th>
                      <th scope="col">Amz_key</th>
                      <th scope="col">Goog_key</th>
                  </tr>
              </thead>
              <tbody></tbody>
          </table>
      </div>
  </div>   
  </div>   
      
  </div>
</div>`;
};

//use array of item to fill select element
function fillArray2Select(arr, id, clean) {
  if (clean === true) {
    $(id).empty();
  }
  for (var i = 0; i < arr.length; i++) {
    var param = arr[i];
    var optionGroup = new Option(param, param);
    $(id).append(optionGroup);
  }
}

function resetPatternList() {
  fillArray2Select([], '#singleList', true);
  fillArray2Select([], '#reverseList', true);
  fillArray2Select([], '#forwardList', true);
  fillArray2Select([], '#r3List', true);
  fillArray2Select([], '#r4List', true);
}

const viewDirButSearch = async (dir, runEnvDropdownEl) => {
  const env = $(runEnvDropdownEl).val();
  if (!env || !env.split('-')[0] || !env.split('-')[1]) {
    showInfoModal('Please choose File Environment before search.');
    return;
  }
  const profileType = env.split('-')[0];
  const profileId = env.split('-')[1];

  var amazon_cre_id = '';
  var google_cre_id = '';
  var warnUser = false;
  if (dir) {
    if (dir.match(/:\/\//)) {
      var lastChr1 = dir.slice(-1);
      var lastChr2 = dir.slice(-2);
      if (lastChr1 == '/' && lastChr2 != '//') {
        dir = dir.substring(0, dir.length - 1);
      }
    }
    console.log(dir);
    if (dir.match(/s3:/i)) {
      $('#mRunAmzKeyS3')
        .parents('.row')
        .css('display', 'flex');
      amazon_cre_id = $('#mRunAmzKeyS3').val();
      if (!amazon_cre_id) {
        showInfoModal('Please select Amazon Keys to search files in your S3 storage.');
        warnUser = true;
      }
    } else if (dir.match(/gs:/i)) {
      $('#mRunGoogKeyGS')
        .parents('.row')
        .css('display', 'flex');
      google_cre_id = $('#mRunGoogKeyGS').val();
      if (!google_cre_id) {
        showInfoModal('Please select Google Keys to search files in your Google storage.');
        warnUser = true;
      }
    }
    if (!warnUser) {
      if (!$s.server.url_server) {
        showInfoModal('Please choose server before search.');
        return;
      }
      let body = {
        dir,
        profileType,
        profileId,
        amazon_cre_id,
        google_cre_id
      };
      const method = 'GET'; // method for Dnext query
      const url = `${$s.server.url_server}/api/service.php?data=getLsDir`;
      const ls = await axios({
        method: 'POST',
        url: `/api/v1/misc/getDnextData`,
        data: { body, method, url }
      });
      console.log('ls', ls);
      if (ls && ls.data && ls.data.data && ls.data.data.data) {
        let dirList = ls.data.data.data;
        dirList = $.trim(dirList);
        console.log(dirList);
        var fileArr = [];
        var errorAr = [];
        if (dir.match(/s3:/i) || dir.match(/gs:/i)) {
          var raw = dirList.split('\n');
          for (var i = 0; i < raw.length; i++) {
            var filePath = raw[i].split(' ').pop();
            if (filePath) {
              if (
                filePath.toLowerCase() === dir.toLowerCase() ||
                filePath.toLowerCase() === dir.toLowerCase() + '/'
              ) {
                console.log('skip', filePath);
                continue;
              }
              if (filePath.match(/s3:/i) || filePath.match(/gs:/i)) {
                var allBlock = filePath.split('/');
                if (filePath.substr(-1) == '/') {
                  var lastBlock = allBlock[allBlock.length - 2];
                } else {
                  var lastBlock = allBlock[allBlock.length - 1];
                }
                fileArr.push(lastBlock);
              } else {
                errorAr.push(raw[i]);
              }
            } else {
              errorAr.push(raw[i]);
            }
          }
        } else if (dir.match(/:\/\//)) {
          fileArr = dirList.split('\n');
          errorAr = fileArr.filter(line => line.match(/:/));
          fileArr = fileArr.filter(line => !line.match(/:/));
        } else {
          fileArr = dirList.split('\n');
          errorAr = fileArr.filter(line => line.match(/ls:/));
          fileArr = fileArr.filter(line => !line.match(/:/));
        }
        console.log(fileArr);
        console.log(errorAr);
        if (fileArr.length > 0) {
          var copiedList = fileArr.slice();
          copiedList.unshift('..');
          fillArray2Select(copiedList, '#viewDir', true);
          $('#viewDir').data('fileArr', fileArr);
          $('#viewDir').data('fileDir', dir);
          var amzKey = '';
          var googKey = '';
          if (dir.match(/s3:/i)) {
            amzKey = $('#mRunAmzKeyS3').val();
          }
          if (dir.match(/gs:/i)) {
            googKey = $('#mRunGoogKeyGS').val();
          }
          $('#viewDir').data('amzKey', amzKey);
          $('#viewDir').data('googKey', googKey);
          $('#collection_type').trigger('change');
        } else {
          if (errorAr.length > 0) {
            var errTxt = errorAr.join(' ');
            showInfoModal(errTxt);
            resetPatternList();
          } else {
            fillArray2Select(['Files Not Found.'], '#viewDir', true);
            resetPatternList();
          }
        }
      } else {
        fillArray2Select(['Files Not Found.'], '#viewDir', true);
        resetPatternList();
      }
    } else {
      fillArray2Select(['Files Not Found.'], '#viewDir', true);
      resetPatternList();
    }
    $('#viewDir').css('display', 'inline');
    $('#viewDirDiv').css('display', 'block');
  } else {
    showInfoModal("Please enter 'File Location' to search files.");
  }
};

const bindEventHandlers = () => {
  const addSelection = function() {
    var collection_type = $('#collection_type').val();
    if (collection_type == 'single') {
      var current_selection = document.getElementById('singleList').options;
      var regex = $('#single_pattern').val();
      var file_string = '';
      for (var x = 0; x < current_selection.length; x++) {
        if (current_selection[x].selected) {
          file_string += current_selection[x].value + ' | ';
          recordDelList('#singleList', current_selection[x].value, 'del');
          $('#singleList option[value="' + current_selection[x].value + '"]')[0].remove();
          x--;
        }
      }
    } else if (collection_type == 'pair') {
      var current_selectionF = document.getElementById('forwardList').options;
      var current_selectionR = document.getElementById('reverseList').options;
      var regex = $('#forward_pattern').val();
      var file_string = '';
      for (var x = 0; x < current_selectionF.length; x++) {
        if (current_selectionF[x].selected && current_selectionR[x].selected) {
          file_string += current_selectionF[x].value + ',' + current_selectionR[x].value + ' | ';
          recordDelList('#forwardList', current_selectionF[x].value, 'del');
          recordDelList('#reverseList', current_selectionR[x].value, 'del');
          $('#forwardList option[value="' + current_selectionF[x].value + '"]')[0].remove();
          $('#reverseList option[value="' + current_selectionR[x].value + '"]')[0].remove();
          x--;
        }
      }
    } else if (collection_type == 'triple') {
      var current_selectionF = document.getElementById('forwardList').options;
      var current_selectionR = document.getElementById('reverseList').options;
      var current_selectionR3 = document.getElementById('r3List').options;
      var regex = $('#forward_pattern').val();
      var file_string = '';
      for (var x = 0; x < current_selectionF.length; x++) {
        if (
          current_selectionF[x].selected &&
          current_selectionR[x].selected &&
          current_selectionR3[x].selected
        ) {
          file_string +=
            current_selectionF[x].value +
            ',' +
            current_selectionR[x].value +
            ',' +
            current_selectionR3[x].value +
            ' | ';
          recordDelList('#forwardList', current_selectionF[x].value, 'del');
          recordDelList('#reverseList', current_selectionR[x].value, 'del');
          recordDelList('#r3List', current_selectionR3[x].value, 'del');
          $('#forwardList option[value="' + current_selectionF[x].value + '"]')[0].remove();
          $('#reverseList option[value="' + current_selectionR[x].value + '"]')[0].remove();
          $('#r3List option[value="' + current_selectionR3[x].value + '"]')[0].remove();
          x--;
        }
      }
    } else if (collection_type == 'quadruple') {
      var current_selectionF = document.getElementById('forwardList').options;
      var current_selectionR = document.getElementById('reverseList').options;
      var current_selectionR3 = document.getElementById('r3List').options;
      var current_selectionR4 = document.getElementById('r4List').options;
      var regex = $('#forward_pattern').val();
      var file_string = '';
      for (var x = 0; x < current_selectionF.length; x++) {
        if (
          current_selectionF[x].selected &&
          current_selectionR[x].selected &&
          current_selectionR3[x].selected &&
          current_selectionR4[x].selected
        ) {
          file_string +=
            current_selectionF[x].value +
            ',' +
            current_selectionR[x].value +
            ',' +
            current_selectionR3[x].value +
            ',' +
            current_selectionR4[x].value +
            ' | ';
          recordDelList('#forwardList', current_selectionF[x].value, 'del');
          recordDelList('#reverseList', current_selectionR[x].value, 'del');
          recordDelList('#r3List', current_selectionR3[x].value, 'del');
          recordDelList('#r4List', current_selectionR4[x].value, 'del');
          $('#forwardList option[value="' + current_selectionF[x].value + '"]')[0].remove();
          $('#reverseList option[value="' + current_selectionR[x].value + '"]')[0].remove();
          $('#r3List option[value="' + current_selectionR3[x].value + '"]')[0].remove();
          $('#r4List option[value="' + current_selectionR4[x].value + '"]')[0].remove();
          x--;
        }
      }
    }
    if (file_string) {
      file_string = file_string.substring(0, file_string.length - 3);
      if (file_string != '') {
        if (regex == '') {
          var name = file_string;
        } else {
          var name = file_string.split(regex)[0];
        }
        var name = name.split(' | ')[0].split('.')[0];
        var input = createElement(
          'input',
          ['id', 'type', 'class', 'value'],
          [name, 'text', 'updateNameTable', name]
        );
        var button_div = createElement('div', ['class'], ['text-center']);

        var remove_button = createElement(
          'button',
          ['class', 'type'],
          ['btn btn-sm btn-danger removeRowSelTable', 'button']
        );
        var icon = createElement('i', ['class'], ['cil-x']);
        remove_button.appendChild(icon);
        button_div.appendChild(remove_button);
        var fileDir = $('#viewDir').data('fileDir');
        var mRunAmzKeyS3 = '';
        if (fileDir.match(/s3:/i)) {
          mRunAmzKeyS3 = $('#viewDir').data('amzKey');
        }
        var mRunGoogKeyGS = '';
        if (fileDir.match(/gs:/i)) {
          mRunGoogKeyGS = $('#viewDir').data('googKey');
        }

        $s.datatables.selectedSamplesTable.fnAddData([
          input.outerHTML,
          file_string,
          fileDir,
          button_div.outerHTML,
          mRunAmzKeyS3,
          mRunGoogKeyGS
        ]);
      }
    }
  };
  const clearSelection = function() {
    $s.datatables.selectedSamplesTable.fnClearTable();
    $('#forwardList').html('');
    $('#reverseList').html('');
    $('#r3List').html('');
    $('#r4List').html('');
    $('#singleList').html('');
    recordDelList('#forwardList', null, 'reset');
    recordDelList('#reverseList', null, 'reset');
    recordDelList('#r3List', null, 'reset');
    recordDelList('#r4List', null, 'reset');
    recordDelList('#singleList', null, 'reset');
    $('#collection_type').trigger('change');
  };
  const smartSelection = function() {
    var collection_type = $('#collection_type').val();
    if (collection_type == 'single') {
      var files_select1 = document.getElementById('singleList').options;
      var regex1 = $('#single_pattern').val();
    } else {
      var files_select1 = document.getElementById('forwardList').options;
      var files_select2 = document.getElementById('reverseList').options;
      var files_select3 = document.getElementById('r3List').options;
      var files_select4 = document.getElementById('r4List').options;
      var regex1 = $('#forward_pattern').val();
      var regex2 = $('#reverse_pattern').val();
      var regex3 = $('#r3_pattern').val();
      var regex4 = $('#r4_pattern').val();
    }
    while (
      (collection_type == 'single' && files_select1.length != 0) ||
      (collection_type == 'pair' && files_select1.length != 0 && files_select2.length != 0) ||
      (collection_type == 'triple' &&
        files_select1.length != 0 &&
        files_select2.length != 0 &&
        files_select3.length != 0) ||
      (collection_type == 'quadruple' &&
        files_select1.length != 0 &&
        files_select2.length != 0 &&
        files_select3.length != 0 &&
        files_select4.length != 0)
    ) {
      var file_string = '';
      //  var file_regex = new RegExp(regex_string);
      if (collection_type == 'single') {
        //	use regex to find the values before the pivot
        if (regex1 === '') {
          regex1 = '.';
        }
        var regex_string = files_select1[0].value.split(regex1)[0];
        for (var x = 0; x < files_select1.length; x++) {
          var prefix = files_select1[x].value.split(regex1)[0];
          if (regex_string === prefix) {
            file_string += files_select1[x].value + ' | ';
            recordDelList('#singleList', files_select1[x].value, 'del');
            $('#singleList option[value="' + files_select1[x].value + '"]')[0].remove();
            x--;
          }
        }
      } else if (collection_type == 'pair') {
        var regex_string1 = files_select1[0].value.split(regex1)[0];
        var regex_string2 = files_select2[0].value.split(regex2)[0];
        for (var x = 0; x < files_select1.length; x++) {
          var prefix1 = '';
          var prefix2 = '';
          if (files_select1[x]) prefix1 = files_select1[x].value.split(regex1)[0];
          if (files_select2[x]) prefix2 = files_select2[x].value.split(regex2)[0];
          if (regex_string1 === prefix1 && regex_string2 === prefix2) {
            file_string += files_select1[x].value + ',' + files_select2[x].value + ' | ';
            recordDelList('#forwardList', files_select1[x].value, 'del');
            recordDelList('#reverseList', files_select2[x].value, 'del');
            $('#forwardList option[value="' + files_select1[x].value + '"]')[0].remove();
            $('#reverseList option[value="' + files_select2[x].value + '"]')[0].remove();
            x--;
          }
        }
      } else if (collection_type == 'triple') {
        var regex_string1 = files_select1[0].value.split(regex1)[0];
        var regex_string2 = files_select2[0].value.split(regex2)[0];
        var regex_string3 = files_select3[0].value.split(regex3)[0];
        for (var x = 0; x < files_select1.length; x++) {
          var prefix1 = '';
          var prefix2 = '';
          var prefix3 = '';
          if (files_select1[x]) prefix1 = files_select1[x].value.split(regex1)[0];
          if (files_select2[x]) prefix2 = files_select2[x].value.split(regex2)[0];
          if (files_select3[x]) prefix3 = files_select3[x].value.split(regex3)[0];
          if (regex_string1 === prefix1 && regex_string2 === prefix2 && regex_string3 === prefix3) {
            file_string +=
              files_select1[x].value +
              ',' +
              files_select2[x].value +
              ',' +
              files_select3[x].value +
              ' | ';
            recordDelList('#forwardList', files_select1[x].value, 'del');
            recordDelList('#reverseList', files_select2[x].value, 'del');
            recordDelList('#r3List', files_select3[x].value, 'del');
            $('#forwardList option[value="' + files_select1[x].value + '"]')[0].remove();
            $('#reverseList option[value="' + files_select2[x].value + '"]')[0].remove();
            $('#r3List option[value="' + files_select3[x].value + '"]')[0].remove();
            x--;
          }
        }
      } else if (collection_type == 'quadruple') {
        var regex_string1 = files_select1[0].value.split(regex1)[0];
        var regex_string2 = files_select2[0].value.split(regex2)[0];
        var regex_string3 = files_select3[0].value.split(regex3)[0];
        var regex_string4 = files_select4[0].value.split(regex4)[0];
        for (var x = 0; x < files_select1.length; x++) {
          var prefix1 = '';
          var prefix2 = '';
          var prefix3 = '';
          var prefix4 = '';
          if (files_select1[x]) prefix1 = files_select1[x].value.split(regex1)[0];
          if (files_select2[x]) prefix2 = files_select2[x].value.split(regex2)[0];
          if (files_select3[x]) prefix3 = files_select3[x].value.split(regex3)[0];
          if (files_select4[x]) prefix4 = files_select4[x].value.split(regex4)[0];
          if (
            regex_string1 === prefix1 &&
            regex_string2 === prefix2 &&
            regex_string3 === prefix3 &&
            regex_string4 === prefix4
          ) {
            file_string +=
              files_select1[x].value +
              ',' +
              files_select2[x].value +
              ',' +
              files_select3[x].value +
              ',' +
              files_select4[x].value +
              ' | ';
            recordDelList('#forwardList', files_select1[x].value, 'del');
            recordDelList('#reverseList', files_select2[x].value, 'del');
            recordDelList('#r3List', files_select3[x].value, 'del');
            recordDelList('#r4List', files_select4[x].value, 'del');
            $('#forwardList option[value="' + files_select1[x].value + '"]')[0].remove();
            $('#reverseList option[value="' + files_select2[x].value + '"]')[0].remove();
            $('#r3List option[value="' + files_select3[x].value + '"]')[0].remove();
            $('#r4List option[value="' + files_select4[x].value + '"]')[0].remove();
            x--;
          }
        }
      }
      file_string = file_string.substring(0, file_string.length - 3);
      if (regex1 === '') {
        var name = file_string;
      } else {
        var name = file_string.split(regex1)[0];
      }
      var name = name.split(' | ')[0].split('.')[0];
      var input = createElement(
        'input',
        ['id', 'type', 'class', 'value'],
        [name, 'text', 'updateNameTable', name]
      );
      var button_div = createElement('div', ['class'], ['text-center']);

      var remove_button = createElement(
        'button',
        ['class', 'type'],
        ['btn btn-sm btn-danger text-center removeRowSelTable', 'button']
      );
      var icon = createElement('i', ['class'], ['cil-x']);
      remove_button.appendChild(icon);
      button_div.appendChild(remove_button);
      var fileDir = $('#viewDir').data('fileDir');
      var mRunAmzKeyS3 = '';
      if (fileDir.match(/s3:/i)) {
        mRunAmzKeyS3 = $('#viewDir').data('amzKey');
      }

      var mRunGoogKeyGS = '';
      if (fileDir.match(/gs:/i)) {
        mRunGoogKeyGS = $('#viewDir').data('googKey');
      }

      $s.datatables.selectedSamplesTable.fnAddData([
        input.outerHTML,
        file_string,
        fileDir,
        button_div.outerHTML,
        mRunAmzKeyS3,
        mRunGoogKeyGS
      ]);
    }
  };

  $(document).on('click', '.removeRowSelTable', function() {
    var collection_type = $('#collection_type').val();
    removeRowSelTable(this, collection_type);
  });
  $(document).on('change', '.updateNameTable', function() {
    updateNameTable(this);
  });

  $(document).on('click', '#add_selection_file', function() {
    addSelection();
  });
  $(document).on('click', '#smart_add_file', function() {
    smartSelection();
  });
  $(document).on('click', '#clear_selection', function() {
    clearSelection();
  });
  $(document).on('change', '#collection_type', function() {
    var collection_type = $(this).val();
    if (collection_type == 'pair') {
      $('.r3patternDiv').css('display', 'none');
      $('.r4patternDiv').css('display', 'none');
      $('.forwardpatternDiv').css('display', 'inline');
      $('.reversepatternDiv').css('display', 'inline');
      $('.singlepatternDiv').css('display', 'none');
      $('.patternButs').css('display', 'inline');
      $('.patternTable').css('display', 'inline');
      $('#forward_pattern').trigger('keyup');
      $('#reverse_pattern').trigger('keyup');
    } else if (collection_type == 'single') {
      $('.r3patternDiv').css('display', 'none');
      $('.r4patternDiv').css('display', 'none');
      $('.patternButs').css('display', 'inline');
      $('.patternTable').css('display', 'inline');
      $('.singlepatternDiv').css('display', 'inline');
      $('.forwardpatternDiv').css('display', 'none');
      $('.reversepatternDiv').css('display', 'none');
      $('#single_pattern').trigger('keyup');
    } else if (collection_type == 'triple') {
      $('.r3patternDiv').css('display', 'inline');
      $('.r4patternDiv').css('display', 'none');
      $('.forwardpatternDiv').css('display', 'inline');
      $('.reversepatternDiv').css('display', 'inline');
      $('.singlepatternDiv').css('display', 'none');
      $('.patternButs').css('display', 'inline');
      $('.patternTable').css('display', 'inline');
      $('#forward_pattern').trigger('keyup');
      $('#reverse_pattern').trigger('keyup');
      $('#r3_pattern').trigger('keyup');
    } else if (collection_type == 'quadruple') {
      $('.r3patternDiv').css('display', 'inline');
      $('.r4patternDiv').css('display', 'inline');
      $('.forwardpatternDiv').css('display', 'inline');
      $('.reversepatternDiv').css('display', 'inline');
      $('.singlepatternDiv').css('display', 'none');
      $('.patternButs').css('display', 'inline');
      $('.patternTable').css('display', 'inline');
      $('#forward_pattern').trigger('keyup');
      $('#reverse_pattern').trigger('keyup');
      $('#r3_pattern').trigger('keyup');
      $('#r4_pattern').trigger('keyup');
    }
    $.fn.dataTable.tables({ visible: true, api: true }).columns.adjust();
  });

  var syncSelectedOpts = function(allItems, selItems, targetID) {
    var otherOpt = $(targetID + ' > option');
    otherOpt.prop('selected', false);
    for (var i = 0; i < selItems.length; i++) {
      var order = allItems.indexOf(selItems[i]);
      if (otherOpt[order]) {
        $(otherOpt[order]).prop('selected', true);
      }
    }
  };
  $(document).on('click', '#forwardList', function() {
    var allItems = [];
    $('#forwardList > option').each(function() {
      allItems.push(this.value);
    });
    var selItems = $('#forwardList').val();
    syncSelectedOpts(allItems, selItems, '#reverseList');
    syncSelectedOpts(allItems, selItems, '#r3List');
    syncSelectedOpts(allItems, selItems, '#r4List');
  });
  $(document).on('click', '#reverseList', function() {
    var allItems = [];
    $('#reverseList > option').each(function() {
      allItems.push(this.value);
    });
    var selItems = $('#reverseList').val();
    syncSelectedOpts(allItems, selItems, '#forwardList');
    syncSelectedOpts(allItems, selItems, '#r3List');
    syncSelectedOpts(allItems, selItems, '#r4List');
  });
  $(document).on('click', '#r3List', function() {
    var allItems = [];
    $('#r3List > option').each(function() {
      allItems.push(this.value);
    });
    var selItems = $('#r3List').val();
    syncSelectedOpts(allItems, selItems, '#forwardList');
    syncSelectedOpts(allItems, selItems, '#reverseList');
    syncSelectedOpts(allItems, selItems, '#r4List');
  });
  $(document).on('click', '#r4List', function() {
    var allItems = [];
    $('#r4List > option').each(function() {
      allItems.push(this.value);
    });
    var selItems = $('#r4List').val();
    syncSelectedOpts(allItems, selItems, '#forwardList');
    syncSelectedOpts(allItems, selItems, '#reverseList');
    syncSelectedOpts(allItems, selItems, '#r3List');
  });

  var syncRegexOptions = function(collection_type, optsObjs) {
    var data = [];
    $.each(optsObjs, function(el) {
      if (optsObjs[el]) {
        optsObjs[el] = optsObjs[el].sort();
      }
    });
    var regexObj = $.extend(true, {}, optsObjs);
    // clean regex pattern from array options
    $.each(regexObj, function(el) {
      if (regexObj[el]) {
        var pattern = '';
        if (el == '#forwardList') {
          pattern = $('#forward_pattern').val();
        } else if (el == '#reverseList') {
          pattern = $('#reverse_pattern').val();
        } else if (el == '#r3List') {
          pattern = $('#r3_pattern').val();
        } else if (el == '#r4List') {
          pattern = $('#r4_pattern').val();
        }
        for (var i = 0; i < regexObj[el].length; i++) {
          regexObj[el][i] = regexObj[el][i].split(pattern).join('');
        }
      }
    });
    if (collection_type == 'pair') {
      data = [regexObj['#forwardList'], regexObj['#reverseList']];
    } else if (collection_type == 'triple') {
      data = [regexObj['#forwardList'], regexObj['#reverseList'], regexObj['#r3List']];
    } else if (collection_type == 'quadruple') {
      data = [
        regexObj['#forwardList'],
        regexObj['#reverseList'],
        regexObj['#r3List'],
        regexObj['#r4List']
      ];
    }

    var intersection = data.reduce((a, b) => a.filter(c => b.includes(c)));
    var reorderObj = {};
    var reorderCheck = false; // if one item is reordered than enable this
    $.each(regexObj, function(el) {
      if (!reorderObj[el]) reorderObj[el] = [];
      var pushLast = [];
      for (var i = 0; i < regexObj[el].length; i++) {
        var index = intersection.indexOf(regexObj[el][i]);
        var item = optsObjs[el][i];
        if (index < 0) {
          pushLast.push(item);
          reorderCheck = true;
        } else {
          reorderObj[el].push(item);
        }
      }
      if (pushLast.length) reorderObj[el] = reorderObj[el].concat(pushLast);
    });
    console.log(reorderObj);
    if (reorderCheck) {
      $.each(reorderObj, function(el) {
        fillArray2Select(reorderObj[el], el, true);
      });
    }
    return reorderCheck;
  };

  function updateFileArea(selectId, pattern) {
    var fileOrj = $('#viewDir').data('fileArr');
    if (fileOrj) {
      var fileAr = fileOrj.slice(); //clone list
      var delArr = $(selectId).data('samples');
      // files that are selected are kept in delArr and removed before loading fillArray2Select
      if (delArr && delArr.length) {
        for (var i = 0; i < delArr.length; i++) {
          var index = fileAr.indexOf(delArr[i]);
          if (index > -1) {
            fileAr.splice(index, 1);
          }
        }
      }
      console.log('fileAr', fileAr);
      if (fileAr) {
        // keeps $ and ^ for regex
        var cleanRegEx = function(pat) {
          return pat.replace(/[-\/\\*+?.()|[\]{}]/g, '\\$&');
        };
        var patternReg = cleanRegEx(pattern);
        var reg = new RegExp(patternReg);
        var filteredAr = fileAr.filter(line => line.match(reg));
        if (filteredAr.length > 0) {
          //xxxxxxxxxxxx
          var reorderCheck = false;
          var collection_type = $('#collection_type').val();
          if (collection_type != 'single') {
            var syncOtherFieldOptions = function(collection_type, selectId, filteredAr) {
              var fieldsArray = [];
              var optsObjs = {};
              optsObjs[selectId] = filteredAr;
              if (collection_type == 'pair') {
                fieldsArray = ['#forwardList', '#reverseList'];
              } else if (collection_type == 'triple') {
                fieldsArray = ['#forwardList', '#reverseList', '#r3List'];
              } else if (collection_type == 'quadruple') {
                fieldsArray = ['#forwardList', '#reverseList', '#r3List', '#r4List'];
              }
              var index = fieldsArray.indexOf(selectId);
              fieldsArray.splice(index, 1);
              for (var i = 0; i < fieldsArray.length; i++) {
                var allopts = [];
                $(fieldsArray[i] + ' > option').each(function() {
                  if (!this.value.match(/no file/i)) allopts.push(this.value);
                });
                optsObjs[fieldsArray[i]] = allopts;
              }
              // return the latest options after update (includes latest filteredAr)
              // {#forwardList: ["test.R1.fastq"], #r3List:["test.R3.fastq"]}
              console.log(optsObjs);
              var forwardList = optsObjs['#forwardList'];
              var reverseList = optsObjs['#reverseList'];
              var r3List = optsObjs['#r3List'];
              var r4List = optsObjs['#r4List'];
              if (
                (collection_type == 'pair' && forwardList.length && reverseList.length) ||
                (collection_type == 'triple' &&
                  forwardList.length &&
                  reverseList.length &&
                  r3List.length) ||
                (collection_type == 'quadruple' &&
                  forwardList.length &&
                  reverseList.length &&
                  r3List.length &&
                  r4List.length)
              ) {
                reorderCheck = syncRegexOptions(collection_type, optsObjs);
              }
            };
            syncOtherFieldOptions(collection_type, selectId, filteredAr);
          }
          if (!reorderCheck) fillArray2Select(filteredAr, selectId, true);
        } else {
          fillArray2Select(['No files matching the pattern.'], selectId, true);
        }
      } else {
        fillArray2Select(['No files matching the pattern.'], selectId, true);
      }
    }
  }

  window.timeoutID = {};
  window.timeoutID['#forward_pattern'] = 0;
  window.timeoutID['#reverse_pattern'] = 0;
  window.timeoutID['#r3_pattern'] = 0;
  window.timeoutID['#r4_pattern'] = 0;
  window.timeoutID['#single_pattern'] = 0;

  function updateFileList(selectId, pattern) {
    if (window.timeoutID[selectId]) clearTimeout(window.timeoutID[selectId]);
    window.timeoutID[selectId] = setTimeout(function() {
      updateFileArea(selectId, pattern);
    }, 500);
  }

  $(document).on('keyup', '#forward_pattern', function() {
    updateFileList('#forwardList', $('#forward_pattern').val());
  });
  $(document).on('keyup', '#reverse_pattern', function() {
    updateFileList('#reverseList', $('#reverse_pattern').val());
  });
  $(document).on('keyup', '#r3_pattern', function() {
    updateFileList('#r3List', $('#r3_pattern').val());
  });
  $(document).on('keyup', '#r4_pattern', function() {
    updateFileList('#r4List', $('#r4_pattern').val());
  });
  $(document).on('keyup', '#single_pattern', function() {
    var pattern = $(this).val();
    updateFileList('#singleList', pattern);
  });
};

const removeRowSelTable = function(button, collection_type) {
  var row = $(button).closest('tr');
  var files_used = row.children()[1].innerHTML.split(' | ');
  for (var x = 0; x < files_used.length; x++) {
    if (files_used[x].match(/,/)) {
      var splitedFiles = files_used[x].split(',');
      var forwardFile = splitedFiles[0];
      var reverseFile = splitedFiles[1];
      var r3File = splitedFiles[2];
      var r4File = splitedFiles[3];
      $('#forwardList > option').each(function() {
        if (this.value.match(/no file/i)) {
          $(this).remove();
        }
      });
      $('#reverseList > option').each(function() {
        if (this.value.match(/no file/i)) {
          $(this).remove();
        }
      });
      $('#r3List > option').each(function() {
        if (this.value.match(/no file/i)) {
          $(this).remove();
        }
      });
      $('#r4List > option').each(function() {
        if (this.value.match(/no file/i)) {
          $(this).remove();
        }
      });

      document.getElementById('forwardList').innerHTML +=
        '<option value="' + forwardFile + '">' + forwardFile + '</option>';
      document.getElementById('reverseList').innerHTML +=
        '<option value="' + reverseFile + '">' + reverseFile + '</option>';
      recordDelList('#forwardList', forwardFile, 'add');
      recordDelList('#reverseList', reverseFile, 'add');
      if (r3File) {
        document.getElementById('r3List').innerHTML +=
          '<option value="' + r3File + '">' + r3File + '</option>';
        recordDelList('#r3List', r3File, 'add');
      }
      if (r4File) {
        document.getElementById('r4List').innerHTML +=
          '<option value="' + r4File + '">' + r4File + '</option>';
        recordDelList('#r4List', r4File, 'add');
      }
    } else {
      $('#singleList > option').each(function() {
        if (this.value.match(/no file/i)) {
          $(this).remove();
        }
      });
      document.getElementById('singleList').innerHTML +=
        '<option value="' + files_used[x] + '">' + files_used[x] + '</option>';
      recordDelList('#singleList', files_used[x], 'add');
    }
  }
  $s.datatables.selectedSamplesTable.fnDeleteRow(row);
  $s.datatables.selectedSamplesTable.fnDraw();
};
const updateNameTable = function(input) {
  input.id = input.value;
};
const replaceCharacters = function(string) {
  string = string.replace(/\./g, '_');
  string = string.replace(/-/g, '_');
  return string;
};

//keep record of the deleted items from singleList, forwardList, reverseList
//in case of new search don't show these items
const recordDelList = function(listDiv, value, type) {
  if (type == 'reset') {
    $(listDiv).removeData('samples');
  } else {
    var delArr = $(listDiv).data('samples');
    if (delArr) {
      if (delArr.length) {
        if (type !== 'add') {
          delArr.push(value);
        } else {
          var index = delArr.indexOf(value);
          if (index > -1) {
            delArr.splice(index, 1);
          }
        }
        $(listDiv).data('samples', delArr);
      }
    } else {
      if (type !== 'add') {
        $(listDiv).data('samples', [value]);
      }
    }
  }
};

const prepDatatables = () => {
  console.log($.fn.DataTable.isDataTable('#selectedSamples'));
  if (!$.fn.DataTable.isDataTable('#selectedSamples')) {
    $s.datatables.selectedSamplesTable = $('#selectedSamples').dataTable({
      sScrollX: '100%',
      searching: false,
      bLengthChange: false,
      columnDefs: [
        {
          targets: [4, 5],
          visible: false
        }
      ]
    });
  }
};

const getTableSamples = function(tableId) {
  var ret = {};
  var file_array = [];
  var name_array = [];
  var warnUser = '';
  var table_data = $s.datatables[tableId].fnGetData();
  var table_nodes = $s.datatables[tableId].fnGetNodes();
  for (var y = 0; y < table_data.length; y++) {
    var name = $.trim(table_nodes[y].children[0].children[0].id);
    name = name
      .replace(/:/g, '_')
      .replace(/,/g, '_')
      .replace(/\$/g, '_')
      .replace(/\!/g, '_')
      .replace(/\</g, '_')
      .replace(/\>/g, '_')
      .replace(/\?/g, '_')
      .replace(/\(/g, '-')
      .replace(/\)/g, '-')
      .replace(/\"/g, '_')
      .replace(/\'/g, '_')
      .replace(/\//g, '_')
      .replace(/\\/g, '_')
      .replace(/ /g, '_');
    if (!name) {
      warnUser = 'Please fill all the filenames in the table.';
    }
    var files_used = table_data[y][1];
    files_used = files_used.split(' | ');
    for (let k = 0; k < files_used.length; k++) {
      files_used[k] = files_used[k].split(',');
    }
    name_array.push(name);
    file_array.push(files_used);
  }
  ret.name_array = name_array;
  ret.file_array = file_array;
  ret.warnUser = warnUser;
  return ret;
};

export const convertFileFormObj = formObj => {
  console.log(formObj);
  const exclude = [
    'amazon_cre_id',
    'google_cre_id',
    'single_pattern',
    'forward_pattern',
    'reverse_pattern',
    'r3_pattern',
    'r4_pattern'
  ];
  Object.keys(exclude).forEach((k, i) => {
    delete formObj[exclude[k]];
  });
  console.log(formObj);
  let infoModalText = '';
  let formObjArr = [];
  let warnUser = false;
  var ret = getTableSamples('selectedSamplesTable');
  var rowData = $s.datatables.selectedSamplesTable.fnGetData();
  console.log(ret);
  console.log(rowData);
  var fileDirArr = [];
  for (var i = 0; i < rowData.length; i++) {
    var file_dir = rowData[i][2];
    var amzKey = rowData[i][4];
    var googKey = rowData[i][5];
    if (file_dir.match(/s3:/i)) {
      file_dir = file_dir + '\t' + amzKey;
    }
    if (file_dir.match(/gs:/i)) {
      file_dir = file_dir + '\t' + googKey;
    }
    fileDirArr.push(file_dir);
  }
  console.log('fileDirArr', fileDirArr);

  if (ret.warnUser) {
    infoModalText += ret.warnUser;
  }
  if (!ret.file_array.length) {
    infoModalText +=
      " * Please fill table by clicking 'Add All Files' or 'Add Selected Files' buttons.\n";
  }
  var s3_archive_dir = $.trim($('#s3_archive_dir').val());
  var amzArchKey = $('#mArchAmzKeyS3').val();
  if (!warnUser && s3_archive_dir.match(/s3:/i)) {
    if (!amzArchKey) {
      infoModalText += ' * Please select Amazon Archive Keys to save files into your S3 storage.\n';
      warnUser = true;
    }
  }
  var gs_archive_dir = $.trim($('#gs_archive_dir').val());
  var googArchKey = $('#mArchGoogKeyGS').val();
  if (!warnUser && gs_archive_dir.match(/gs:/i)) {
    if (!googArchKey) {
      infoModalText +=
        ' * Please select Google Archive Keys to save files into your Google storage.\n';
      warnUser = true;
    }
  }
  console.log('infoModalText', infoModalText);

  if (infoModalText) {
    showInfoModal(infoModalText);
    return;
  }

  if (!ret.warnUser && ret.file_array.length && !warnUser) {
    if (s3_archive_dir.match(/s3:/i)) {
      s3_archive_dir = $.trim(s3_archive_dir);
      formObj.s3_archive_dir = s3_archive_dir + '\t' + amzArchKey;
    }
    if (gs_archive_dir.match(/gs:/i)) {
      gs_archive_dir = $.trim(gs_archive_dir);
      formObj.gs_archive_dir = gs_archive_dir + '\t' + googArchKey;
    }
    for (let i = 0; i < fileDirArr.length; i++) {
      let copiedObj = $.extend(true, {}, formObj);
      copiedObj.file_dir = [[fileDirArr[i]]];
      copiedObj.file_used = ret.file_array[i];
      copiedObj.name = ret.name_array[i];
      formObjArr.push(copiedObj);
    }
  }
  return formObjArr;
};

export const prepFileForm = (formId, data, $scope, projectID) => {
  bindEventHandlers();

  console.log('prepFileForm');
  //   required fields for file collection:
  //    - name	Name	String
  //    - file_used	Used Files	Array
  //    - file_dir	Directory	Array
  //    - file_type	File Type	String
  //    - collection_type	Collection Type	String
  //    - file_env	File Environment	String
  //    - server_id	Server	mongoose.Schema.ObjectId
  //    - archive_dir	Archive Directory	String
  //    - s3_archive_dir	S3 Archive Directory	Array
  //    - gs_archive_dir	Google Storage Archive Directory	Array
  const nameField = $(formId).find(`[name='name']`);
  const fileUsedField = $(formId).find(`[name='file_used']`);
  const serverIDField = $(formId).find(`[name='server_id']`);
  const runEnvField = $(formId).find(`[name='file_env']`);
  const fileDirField = $(formId).find(`[name='file_dir']`);
  const fileTypeField = $(formId).find(`[name='file_type']`);
  const collectionTypeField = $(formId).find(`[name='collection_type']`);
  const archiveDirField = $(formId).find(`[name='archive_dir']`);
  const s3ArchiveDirField = $(formId).find(`[name='s3_archive_dir']`);
  const gsArchiveDirField = $(formId).find(`[name='gs_archive_dir']`);

  // 1. reorder rows
  const firstRow = $(formId)
    .find(`[name='name']`)
    .parents('.row')
    .siblings('.row')
    .first();
  $(nameField.parents('.row')).remove();
  $(fileUsedField.parents('.row')).remove();
  $(serverIDField.parents('.row')).insertBefore(firstRow);
  $(runEnvField.parents('.row')).insertAfter(serverIDField.parents('.row'));
  $(fileDirField.parents('.row')).insertAfter(runEnvField.parents('.row'));
  $(fileTypeField.parents('.row')).insertAfter(fileDirField.parents('.row'));
  $(collectionTypeField.parents('.row')).insertAfter(fileTypeField.parents('.row'));
  const filePatternDiv = getFilePatternDiv();
  $(collectionTypeField.parents('.row')).after(filePatternDiv);
  const filePatternDOM = $(formId).find(`div.filePattern`);
  $(archiveDirField.parents('.row')).insertAfter(filePatternDOM.parents('.row'));
  $(s3ArchiveDirField.parents('.row')).insertAfter(archiveDirField.parents('.row'));
  $(gsArchiveDirField.parents('.row')).insertAfter(s3ArchiveDirField.parents('.row'));

  // 2. prepare file_dir search button
  $(fileDirField).wrap('<div class="input-group"></div>');
  $(fileDirField).after(
    `<div class="input-group-append"><button id="viewDirBut" class="btn btn-primary" type="button" data-toggle="tooltip" data-placement="bottom" title="Please enter directory and click search button." ><i class="cil-search"> </i></button></div>`
  );
  $(fileDirField).parent().after(`
  <div id="viewDirDiv" class="form-group" style="margin-top: 10px; display: none;">
    <select id="viewDir" class="form-control" size="5" style="display: inline;"></select>
  </div>`);
  $('[data-toggle="tooltip"]').tooltip();
  prepDatatables();

  let runEnvDropdownEl = '';
  if (serverIDField[0]) {
    if (runEnvField[0]) {
      if (!$(runEnvField[0]).hasClass('customize')) {
        // remove actual runEnvField
        const runEnvDropdown = getSimpleDropdown([], {
          name: 'file_env',
          class: 'no-hide'
        });
        runEnvDropdownEl = $(runEnvDropdown);
        $(runEnvField[0]).after(runEnvDropdownEl);
        $(runEnvField[0]).remove();
      }
    }

    $('#viewDirBut').on('click', async function(e) {
      let dir = $(fileDirField).val();
      dir = $.trim(dir);
      await viewDirButSearch(dir, runEnvDropdownEl);
    });

    // add amazon_cre_id and google_cre_id dropdowns
    const amzDropdown = getSimpleDropdown([], {
      id: 'mRunAmzKeyS3',
      name: 'amazon_cre_id',
      class: 'no-hide'
    });
    const googleDropdown = getSimpleDropdown([], {
      id: 'mRunGoogKeyGS',
      name: 'google_cre_id',
      class: 'no-hide'
    });
    const googleRow = getFormRow(googleDropdown, 'Google Keys', { required: true });
    const amzRow = getFormRow(amzDropdown, 'Amazon Keys', { required: true });
    $(googleRow)
      .css('display', 'none')
      .insertBefore(fileDirField.parents('.row'));
    $(amzRow)
      .css('display', 'none')
      .insertBefore(fileDirField.parents('.row'));

    // update filetype field
    const filetypeDropdown = getSimpleDropdown(
      [
        { _id: 'fastq', name: 'FASTQ' },
        { _id: 'bam', name: 'BAM' },
        { _id: 'bai', name: 'BAI' },
        { _id: 'bed', name: 'BED' },
        { _id: 'csv', name: 'CSV' },
        { _id: 'tab', name: 'TAB' },
        { _id: 'tsv', name: 'TSV' },
        { _id: 'txt', name: 'TXT' }
      ],
      {
        name: 'file_type',
        class: 'no-hide'
      }
    );
    $(fileTypeField[0]).after($(filetypeDropdown));
    $(fileTypeField[0]).remove();

    // update collectionType
    const collectionTypeDropdown = getSimpleDropdown(
      [
        { _id: 'single', name: 'Single/List' },
        { _id: 'pair', name: 'Paired List' },
        { _id: 'triple', name: 'Triple List' },
        { _id: 'quadruple', name: 'Quadruple List' }
      ],
      {
        name: 'collection_type',
        class: 'no-hide',
        placeholder: 'Choose Collection Type',
        id: 'collection_type'
      }
    );
    $(collectionTypeField[0]).after($(collectionTypeDropdown));
    $(collectionTypeField[0]).remove();

    // 1. get all run environments of user from dnext on change of serverid
    $(serverIDField[0]).on('change', async function(e) {
      const serverId = $(this).val();
      console.log(serverId);
      if (serverId) {
        try {
          const res = await axios({
            method: 'GET',
            url: `/api/v1/server/${serverId}`
          });
          console.log(res);
          if (
            res &&
            res.data &&
            res.data.status === 'success' &&
            res.data.data &&
            res.data.data.data &&
            res.data.data.data[0]
          ) {
            $s.server = res.data.data.data[0];
            const url_server = res.data.data.data[0].url_server;
            console.log(url_server, 'url_server');
            if (url_server && runEnvDropdownEl) {
              let body = {};
              const method = 'GET'; // method for Dnext query
              const url = `${url_server}/api/service.php?data=getRunEnv`;
              const runEnvData = await axios({
                method: 'POST',
                url: `/api/v1/misc/getDnextData`,
                data: { body, method, url }
              });
              console.log('runEnvData', runEnvData);
              if (runEnvData && runEnvData.data && runEnvData.data.data) {
                updateDropdownOptions(runEnvDropdownEl, runEnvData.data.data.data);
              }
            }
            if (url_server) {
              let body = {};
              const method = 'GET'; // method for Dnext query
              const url = `${url_server}/api/service.php?data=getCloudKeys`;
              const cloudData = await axios({
                method: 'POST',
                url: `/api/v1/misc/getDnextData`,
                data: { body, method, url }
              });
              console.log('getCloudKeys', cloudData);
              if (
                cloudData &&
                cloudData.data &&
                cloudData.data.data &&
                cloudData.data.data.data &&
                cloudData.data.data.data['amazon']
              ) {
                updateDropdownOptions($('#mRunAmzKeyS3'), cloudData.data.data.data['amazon']);
              }
              if (
                cloudData &&
                cloudData.data &&
                cloudData.data.data &&
                cloudData.data.data.data &&
                cloudData.data.data.data['google']
              ) {
                updateDropdownOptions($('#mRunGoogKeyGS'), cloudData.data.data.data['google']);
              }
            }
          }
        } catch (err) {
          console.log(err);
        }
      } else {
        // empty dropdowns
        updateDropdownOptions(runEnvDropdownEl, []);
      }
    });
    if (!data || !data.server_id) {
      $(serverIDField[0])
        .prop('selectedIndex', 1)
        .trigger('change');
    }
  }
};
