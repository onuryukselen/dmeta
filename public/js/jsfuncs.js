/* eslint-disable */
const JSON5 = require('json5');

export const globalEventBinders = () => {
  /* modal show form values on multiple values */
  //show field
  $(document).on('click', `.multi-value`, function(e) {
    $(this).css('display', 'none');
    const field = $(this).next();
    const isSelectized = field.hasClass('selectized');
    if (isSelectized) {
      field.css('display', 'none');
      field.next().css('display', 'block');
    } else {
      field.css('display', 'block');
    }
    $(this)
      .siblings('.multi-restore')
      .css('display', 'block');
  });
  //hide field
  $(document).on('click', `.multi-restore`, function(e) {
    $(this).css('display', 'none');
    const field = $(this)
      .siblings('.multi-value')
      .next();
    const isSelectized = field.hasClass('selectized');
    $(this)
      .siblings('.multi-value')
      .css('display', 'block');
    field.css('display', 'none');
    if (isSelectized) field.next().css('display', 'none');
  });
};

export const getCleanDivId = n => {
  if (n) {
    n = n
      .replace(/ /g, '_')
      .replace(/-/g, '_')
      .replace(/:/g, '_')
      .replace(/,/g, '_')
      .replace(/\$/g, '_')
      .replace(/\!/g, '_')
      .replace(/\</g, '_')
      .replace(/\>/g, '_')
      .replace(/\?/g, '_')
      .replace(/\(/g, '_')
      .replace(/\)/g, '_')
      .replace(/\"/g, '_')
      .replace(/\'/g, '_')
      .replace(/\./g, '_')
      .replace(/\//g, '_')
      .replace(/\\/g, '_')
      .replace(/@/g, '_');
  }
  return n;
};

// creates object of the form fields and change color of requiredFields
// if warn set to true, 'Please provide a valid information.' information will be added to field
// if visible set to true => display of field shouldn't be none;
// if visible set to "undefined" => hidden fields set to "undefined" to remove from db.
export const createFormObj = (formValues, requiredFields, warn, visible) => {
  var formObj = {};
  var stop = false;
  for (var i = 0; i < formValues.length; i++) {
    var name = $(formValues[i]).attr('name');
    var type = $(formValues[i]).attr('type');
    const isSelectized = $(formValues[i]).hasClass('selectized');
    var val = '';
    if (type == 'radio') {
      for (var k = 0; k < formValues.length; k++) {
        if ($(formValues[k]).attr('name')) {
          if ($(formValues[k]).attr('name') == name && $(formValues[k]).is(':checked')) {
            val = $(formValues[k]).val();
            break;
          }
        }
      }
    } else if (type == 'checkbox') {
      if ($(formValues[i]).is(':checked')) {
        val = true;
      } else {
        val = false;
      }
    } else if ($(formValues[i]).is('select')) {
      if ($(formValues[i]).val() === '') {
        val = null;
      } else {
        val = $(formValues[i]).val();
      }
    } else {
      val = $(formValues[i]).val();
    }
    if (requiredFields.includes(name)) {
      if (val != '') {
        $(formValues[i]).removeClass('is-invalid');
        if (warn && $(formValues[i]).next('div.invalid-feedback').length == 1) {
          $(formValues[i])
            .next('div.invalid-feedback')
            .remove();
        }
      } else {
        $(formValues[i]).addClass('is-invalid');
        if (warn && $(formValues[i]).next('div.invalid-feedback').length == 0) {
          $(formValues[i]).after(
            '<div class="invalid-feedback text-left">Please provide a valid information.</div>'
          );
        }
        stop = true;
      }
    }
    if (!isSelectized && visible && $(formValues[i]).css('display') == 'none') {
      if (visible == 'undefined') {
        val = 'undefined';
      } else {
        continue;
      }
    }
    if (name) formObj[name] = val;
  }
  return [formObj, stop];
};

// convert string fields to array/object
export const convertFormObj = formObj => {
  Object.keys(formObj).forEach(key => {
    try {
      if (
        formObj[key] &&
        typeof formObj[key] === 'string' &&
        (formObj[key].charAt(0) == '{' || formObj[key].charAt(0) == '[')
      ) {
        let val = JSON5.parse(formObj[key]);
        formObj[key] = val;
      }
    } catch (err) {
      console.log('format error', err);
    }
  });
  return formObj;
};

export const getUpdatedFields = (beforeUpdate, formObj) => {
  Object.keys(formObj).forEach(key => {
    if (beforeUpdate[key]) {
      if (JSON.stringify(beforeUpdate[key]) == JSON.stringify(formObj[key])) {
        delete formObj[key];
      }
    }
    // if (!beforeUpdate[key] && formObj[key] === '') {
    //   delete formObj[key];
    // }
  });
  return formObj;
};

export const showFormError = (formValues, errorFields, warn) => {
  if (errorFields) {
    for (var i = 0; i < formValues.length; i++) {
      var name = $(formValues[i]).attr('name');
      if (name in errorFields) {
        $(formValues[i]).addClass('is-invalid');
        if (errorFields[name]['message'] && warn) {
          const errorText = errorFields[name]['message'];
          if ($(formValues[i]).next('div.invalid-feedback').length == 0) {
            $(formValues[i]).after(`<div class="invalid-feedback text-left">${errorText}</div>`);
          } else {
            $(formValues[i])
              .next('div.invalid-feedback')
              .remove()
              .after(`<div class="invalid-feedback text-left">${errorText}</div>`);
          }
        }
      }
    }
  }
};

export const showInfoModal = text => {
  const modalId = '#infoModal';
  const textID = '#infoModalText';
  //true if modal is open
  if ($(textID).html().length) {
    const oldText = $(textID).html();
    const newText = oldText + '<br/><br/>' + text;
    $(textID).html(newText);
  } else {
    $(modalId).off();
    $(modalId).on('show.coreui.modal', function(event) {
      $(textID).html(text);
    });
    $(modalId).on('hide.coreui.modal', function(event) {
      $(textID).html('');
    });
    $(modalId).modal('show');
  }
};

export const prepareMultiUpdateModal = (formId, formBodyId, find) => {
  const formValues = $(formId).find(find);
  $(formBodyId).prepend(
    '<p> Each field contains different values for that input. To edit and set all items to the same value, click on the field, otherwise they will retain their individual values.</p>'
  );
  for (var k = 0; k < formValues.length; k++) {
    const isSelectized = $(formValues[k]).hasClass('selectized');
    const nameAttr = $(formValues[k]).attr('name');
    if (nameAttr) {
      $(formValues[k]).before(`<div class="multi-value" > Multiple Values</div>`);
      $(formValues[k]).css('display', 'none');
      if (isSelectized) {
        $(formValues[k])
          .next()
          .css('display', 'none');
        $(formValues[k])
          .next()
          .after(`<div class="multi-restore" style="display:none;"> Undo changes</div>`);
      } else {
        $(formValues[k]).after(
          `<div class="multi-restore" style="display:none;"> Undo changes</div>`
        );
      }
    }
  }
};

export const prepareClickToActivateModal = (formId, formBodyId, find, data) => {
  const formValues = $(formId).find(find);
  $(formBodyId).prepend('<p> Please click to boxes below to set fields.</p>');
  for (var k = 0; k < formValues.length; k++) {
    const isRequired = $(formValues[k]).attr('required');
    const nameAttr = $(formValues[k]).attr('name');
    const isSelectized = $(formValues[k]).hasClass('selectized');
    if (!isRequired && nameAttr) {
      // value not filled
      if (!(nameAttr in data) || data[nameAttr] === null) {
        $(formValues[k]).before(`<div class="multi-value" > Click to Set Field </div>`);
        if (isSelectized) {
          $(formValues[k])
            .next()
            .after(`<div class="multi-restore" style="display:none;"> Unset Field</div>`);
          $(formValues[k])
            .css('display', 'none')
            .next()
            .css('display', 'none');
        } else {
          $(formValues[k]).after(
            `<div class="multi-restore" style="display:none;"> Unset Field</div>`
          );
          $(formValues[k]).css('display', 'none');
        }
      } else {
        // value filled
        $(formValues[k]).before(
          `<div class="multi-value" style="display:none;"> Click to Set Field </div>`
        );
        if (isSelectized) {
          $(formValues[k])
            .next()
            .after(`<div class="multi-restore" > Unset Field</div>`);
        } else {
          $(formValues[k]).after(`<div class="multi-restore" > Unset Field</div>`);
        }
      }
    }
  }
};

//use name attr to fill form
export const fillFormByName = (formId, find, data) => {
  const formValues = $(formId).find(find);
  for (var k = 0; k < formValues.length; k++) {
    const nameAttr = $(formValues[k]).attr('name');
    const radioCheck = $(formValues[k]).is(':radio');
    const checkboxCheck = $(formValues[k]).is(':checkbox');
    if (data[nameAttr]) {
      if (radioCheck) {
        if (data[nameAttr] == $(formValues[k]).val()) {
          $(formValues[k]).attr('checked', true);
        }
      } else if (checkboxCheck) {
        if (data[nameAttr] == $(formValues[k]).val() || data[nameAttr] === true) {
          $(formValues[k]).attr('checked', true);
        } else {
          $(formValues[k]).attr('checked', false);
        }
      } else {
        if (data[nameAttr] === 'on') {
          $(formValues[k]).attr('checked', true);
        } else {
          $(formValues[k]).val(data[nameAttr]);
        }
      }
    }
  }
};
