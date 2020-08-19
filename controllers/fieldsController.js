const Fields = require('../models/fieldsModel');
const factory = require('./handlerFactory');
const AppError = require('./../utils/appError');
const buildModels = require('./../utils/buildModels');

exports.setCollectionId = (req, res, next) => {
  if (!req.body.collections) req.body.collections = req.params.collectionID;
  next();
};

// set commands after query is completed
exports.setAfter = (req, res, next) => {
  if (req.body.collectionID) {
    req.body.After = function() {
      buildModels.updateModel(req.body.collectionID);
    };
    return next();
  }
  return next(new AppError(`CollectionID is not defined!`, 404));
};

exports.getAllFields = factory.getAll(Fields);
exports.getField = factory.getOne(Fields);
exports.createField = factory.createOne(Fields);
exports.updateField = factory.updateOne(Fields);
exports.deleteField = factory.deleteOne(Fields);
