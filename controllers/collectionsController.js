const Collection = require('../models/collectionsModel');
const factory = require('./handlerFactory');
const AppError = require('./../utils/appError');
const buildModels = require('./../utils/buildModels');

// set commands after query is completed
exports.setAfter = async (req, res, next) => {
  // for createCollection
  if (req.body.name) {
    res.locals.After = async function() {
      try {
        req.body.name = req.body.name.replace(/\s+/g, '_').toLowerCase();
        const col = await Collection.findOne({ name: req.body.name });
        console.log('col', col);
        buildModels.updateModel(col._id);
      } catch {
        return next(new AppError(`Collection Model couldn't be updated.`, 404));
      }
    };
    return next();
  }
  // for updateCollection and deleteCollection
  if (req.params.id) {
    res.locals.After = function() {
      buildModels.updateModel(req.params.id);
    };
    return next();
  }
  return next(new AppError(`Collection couldn't created!`, 404));
};

exports.getAllCollections = factory.getAll(Collection);
exports.getCollection = factory.getOne(Collection);
exports.createCollection = factory.createOne(Collection);
exports.updateCollection = factory.updateOne(Collection);
exports.deleteCollection = factory.deleteOne(Collection);
