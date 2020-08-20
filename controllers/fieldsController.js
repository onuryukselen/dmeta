const Fields = require('../models/fieldsModel');
const factory = require('./handlerFactory');
const AppError = require('./../utils/appError');
const buildModels = require('./../utils/buildModels');

exports.setCollectionId = (req, res, next) => {
  if (!req.body.collections) req.body.collections = req.params.collectionID;
  next();
};

// set commands after query is completed
exports.setAfter = async (req, res, next) => {
  // for createField
  if (req.body.collectionID) {
    req.body.After = function() {
      buildModels.updateModel(req.body.collectionID);
    };
    return next();
  }
  // for updateField and deleteField
  if (req.params.id) {
    try {
      const field = await Fields.findById(req.params.id);
      if (field.collectionID) {
        req.body.After = function() {
          buildModels.updateModel(field.collectionID);
        };
      }
      return next();
    } catch {
      return next(new AppError(`Field is not found.`, 404));
    }
  }
  return next(new AppError(`CollectionID or FieldID is not defined!`, 404));
};

exports.getAllFields = factory.getAll(Fields);
exports.getField = factory.getOne(Fields);
exports.createField = factory.createOne(Fields);
exports.updateField = factory.updateOne(Fields);
exports.deleteField = factory.deleteOne(Fields);
