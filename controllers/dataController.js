const factory = require('./handlerFactory');
const buildModels = require('./../utils/buildModels');
const AppError = require('./../utils/appError');

const modelObj = buildModels.modelObj;

//if collectionName is set, then save that Model as a req.body.Model
exports.setModel = (req, res, next) => {
  if (req.params.collectionName) {
    req.body.Model = modelObj[req.params.collectionName];
    if (!modelObj[req.params.collectionName]) {
      return next(new AppError(`collectionName is not found!`, 404));
    }
    return next();
  }
  return next(new AppError(`collectionName is not defined!`, 404));
};

exports.getAllData = factory.getAll();
exports.getData = factory.getOne();
exports.createData = factory.createOne();
exports.updateData = factory.updateOne();
exports.deleteData = factory.deleteOne();
