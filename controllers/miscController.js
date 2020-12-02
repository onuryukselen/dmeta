const fs = require('fs');
const path = require('path');
const GSheetReader = require('g-sheets-api');
const AppError = require('./../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getChangeLog = catchAsync(async (req, res, next) => {
  const doc = fs.readFileSync(path.join(__dirname, './../NEWS'), 'utf8');
  res.status(200).json({
    status: 'success',
    data: JSON.stringify(doc)
  });
});

exports.getGoogleSheet = catchAsync(async (req, res, next) => {
  const sheetId = req.params.id;
  const sheetNumber = req.params.sheet;
  console.log(sheetNumber);
  console.log(sheetId);
  const options = {
    sheetId: sheetId,
    sheetNumber: sheetNumber,
    returnAllResults: true
  };
  console.log(options);
  GSheetReader(
    options,
    results => {
      // do something with the results here
      res.status(200).json({
        status: 'success',
        data: JSON.stringify(results)
      });
    },
    error => {
      // OPTIONAL: handle errors here
      return next(new AppError(error, 404));
    }
  );
});
