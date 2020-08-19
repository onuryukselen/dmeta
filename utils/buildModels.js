const mongoose = require('mongoose');
const Collection = require('../models/collectionsModel');
const Field = require('../models/fieldsModel');

const modelObj = {};
exports.modelObj = modelObj;

// create schema for given fields
// returns schema obj e.g. { name: { type: String } }
function createSchema(fields) {
  // creates object for each schema entry:
  // returns: e.g. { type: String }
  const createSchemaEntry = function(field) {
    const entry = {};
    Object.keys(field.toJSON()).forEach(k => {
      if (k.toLowerCase() == 'type') {
        entry[k] = field[k];
      }
    });
    return entry;
  };

  const schema = {};
  for (let n = 0; n < fields.length; n++) {
    const name = fields[n].name;
    const entry = createSchemaEntry(fields[n]);
    schema[name] = entry;
  }
  return schema;
}

// Update mongoose models when collection or field changes
exports.updateModel = async collectionId => {
  try {
    const col = await Collection.findById(collectionId);
    const fields = await Field.find({ collectionID: collectionId });
    const colName = col.name.toString();
    // check if model created before => delete model to prevent OverwriteModelError
    if (col && mongoose.connection.models[colName]) {
      delete mongoose.connection.models[colName];
    }
    const schema = createSchema(fields);
    const Schema = new mongoose.Schema(schema);
    const Model = mongoose.model(colName, Schema);
    modelObj[colName] = Model;
    return 'done';
  } catch (err) {
    return `modelObj could not be updated: ${err}`;
  }
};

// On startup, get allCollections and allFields then prepare all mongoose models
// Save those models into modelObj
// modelObj: { experiments: Model { experiments }, projects: Model { projects } }
exports.buildModels = async () => {
  try {
    const allCollections = await Collection.find({});
    const allFields = await Field.find({});
    for (let n = 0; n < allCollections.length; n++) {
      const colId = allCollections[n]._id.toString();
      const colName = allCollections[n].name.toString();
      const fields = allFields.filter(f => f.collectionID == colId);
      const schema = createSchema(fields);
      if (!modelObj[colName]) {
        const Schema = new mongoose.Schema(schema);
        const Model = mongoose.model(colName, Schema);
        modelObj[colName] = Model;
      }
    }
  } catch (err) {
    console.log('modelObj could not created', err);
  }
};
exports.buildModels();
