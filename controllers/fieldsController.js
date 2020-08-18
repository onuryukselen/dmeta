const Fields = require('../models/fieldsModel');
const factory = require('./handlerFactory');

exports.setCollectionId = (req, res, next) => {
  //Allow nested routes
  if (!req.body.collections) req.body.collections = req.params.collectionID;
  next();
};

exports.getAllFields = factory.getAll(Fields);
exports.getField = factory.getOne(Fields);
exports.createField = factory.createOne(Fields);
exports.updateField = factory.updateOne(Fields);
exports.deleteField = factory.deleteOne(Fields);
