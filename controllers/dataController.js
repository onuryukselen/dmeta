const buildModels = require('../utils/buildModels');

const modelObj = buildModels.modelObj;

exports.getAllData = '';
exports.updateData = '';
exports.deleteData = '';

exports.createData = async (collectionName, data) => {
  console.log(collectionName, data);
  const doc = new modelObj[collectionName](data);
  const saveDoc = await doc.save();
  return saveDoc;
};

exports.getData = async (collectionName, filter) => {
  console.log(collectionName, filter);
  const doc = await modelObj[collectionName].findOne(filter);
  return doc;
};
