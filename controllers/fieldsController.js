const mongoose = require('mongoose');
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

const testSchema = new mongoose.Schema({ name: { type: String } });
const Test = mongoose.model('test', testSchema);
//OverwriteModelError: Cannot overwrite `test` model once compiled

// test https://localhost:4000/api/v1/fields/test
exports.test = (req, res, next) => {
  (async () => {
    try {
      const newToken = new Test({
        name: 'Mike'
      });
      const saveToken = await newToken.save();
      const getToken = await Test.findOne({ name: 'Mike' });

      console.log('1', saveToken);
      console.log('12', getToken);
      res.json(getToken);
    } catch (err) {
      console.log('ERROR 💥', err);
    }
  })();
};
