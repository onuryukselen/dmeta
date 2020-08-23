const Fields = require('../models/fieldsModel');
const factory = require('./handlerFactory');
const AppError = require('./../utils/appError');
const buildModels = require('./../utils/buildModels');

exports.setCollectionId = (req, res, next) => {
  if (!req.body.collections) req.body.collections = req.params.collectionID;
  next();
};

// asign commands to `req.body.After` which will be executed after query is completed
exports.setAfter = async (req, res, next) => {
  let collectionID;
  try {
    // for createField
    if (req.body.collectionID) collectionID = req.body.collectionID;
    // for updateField and deleteField
    else if (req.params.id) {
      const field = await Fields.findById(req.params.id);
      if (field.collectionID) collectionID = field.collectionID;
    }
    if (collectionID) {
      req.body.After = () => buildModels.updateModel(collectionID);
      return next();
    }
    return next(new AppError(`CollectionID or FieldID is not defined!`, 404));
  } catch {
    return next(new AppError(`Field is not found.`, 404));
  }
};

exports.getAllFields = factory.getAll(Fields);
exports.getField = factory.getOne(Fields);
exports.createField = factory.createOne(Fields);
exports.updateField = factory.updateOne(Fields);
exports.deleteField = factory.deleteOne(Fields);
