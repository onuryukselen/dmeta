const mongoose = require('mongoose');
const Collection = require('../models/collectionsModel');
const Field = require('../models/fieldsModel');

const modelObj = {};

exports.updateModel = () => {
  // const testSchema = new mongoose.Schema({ name: { type: String } });
  // const Test = mongoose.model('test', testSchema);
  // OverwriteModelError: Cannot overwrite `test` model once compiled

  // delete mongoose.connection.models['Book'];
  //mongoose.connection.models = {}; => will delete all of the models
  return 'done';
};

exports.insertDocument = async (modelId, insert) => {
  console.log(modelId, insert);
  const doc = new modelObj[modelId](insert);
  const saveDoc = await doc.save();
  return saveDoc;
};

exports.getDocument = async (modelId, filter) => {
  const doc = await modelObj[modelId].findOne(filter);
  return doc;
};

function createSchemaEntry(field) {
  const entry = {};
  Object.keys(field.toJSON()).forEach(k => {
    if (k.toLowerCase() == 'type') {
      entry[k] = field[k];
    }
  });
  return entry;
}

//{ name: { type: String } }
function createSchema(fields) {
  const schema = {};
  for (let n = 0; n < fields.length; n++) {
    const name = fields[n].name;
    const entry = createSchemaEntry(fields[n]);
    schema[name] = entry;
  }

  return schema;
}

(async () => {
  try {
    const allCollections = await Collection.find({});
    const allFields = await Field.find({});

    for (let n = 0; n < allCollections.length; n++) {
      const colId = allCollections[n]._id.toString();
      const colName = allCollections[n].name.toString();
      const fields = allFields.filter(f => f.collectionID == colId);
      const schema = createSchema(fields);
      console.log(schema);
      if (!modelObj[colName]) {
        const Schema = new mongoose.Schema(schema);
        const Model = mongoose.model(colName, Schema);
        modelObj[colName] = Model;
      }
    }

    //test
    const insertedDoc = await exports.insertDocument('Experiments', {
      overall_design: 'test'
    });
    const retrievedDoc = await exports.getDocument('Experiments', {
      overall_design: 'test'
    });

    console.log('insertedDoc', insertedDoc);
    console.log('retrievedDoc', retrievedDoc);
    console.log(modelObj);
  } catch (err) {
    console.log('ERROR 💥', err);
  }
})();
