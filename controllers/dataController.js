const factory = require('./handlerFactory');
const buildModels = require('./../utils/buildModels');

const modelObj = buildModels.modelObj;

//if collectionName is set, then save that Model into req.body.Model
exports.setModel = (req, res, next) => {
  if (req.params.collectionName) req.body.Model = modelObj[req.params.collectionName];
  next();
};

exports.getAllData = factory.getAll();
exports.getData = factory.getOne();
exports.createData = factory.createOne();
exports.updateData = factory.updateOne();
exports.deleteData = factory.deleteOne();

exports.test = (req, res, next) => {
  console.log('test');
  next();
};
