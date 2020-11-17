const axios = require('axios');
const dataController = require('../controllers/dataController');
const Event = require('../models/eventModel');
const serverController = require('../controllers/serverController');
const factory = require('./handlerFactory');

// create event tracker for data routes -> create/update/delete
exports.setEvent = async (req, res, next) => {
  // event type: "insert", "update", "delete"
  res.locals.Event = async function(type, collection, doc) {
    let update = {};
    let docId;
    let docReq;
    let docRes;
    const perms = doc.perms;
    if (type == 'insert') {
      docId = doc.id;
      docReq = req.body;
      docRes = doc;
    } else if (type == 'update') {
      docId = req.params.id;
      docReq = req.body;
      docRes = doc;
    } else if (type == 'delete') {
      docId = req.params.id;
    }
    const eventDetails = {
      type,
      coll: collection,
      doc_id: docId,
      res: docReq,
      req: docRes,
      update,
      perms
    };
    try {
      await Event.create(eventDetails);
    } catch {
      return { status: 'error', message: 'Event could not be created', error: eventDetails };
    }

    if (
      type == 'insert' &&
      (collection == 'run' || collection.match(/_run$/)) &&
      res.locals.token
    ) {
      return await exports.startRun(doc, req, res, next);
    }
  };
  return next();
};

exports.replaceDataIds = async (doc, req, res, next) => {
  // replace doc inputs with getDataSummaryDoc function
  // searches objects that has key which match following pattern `!${collectionName}_id`
  // e.g. `input` -> { "!sample_id":["5f5a98...","5f5a99..."] }
  // replaces with [{_id:"5f5a98", name:"test"},{_id:"5f5a99", name:"test2"},]
  // e.g. `input` -> "single" (doesn't replace)
  let sampleIds = [];
  try {
    if (doc.in) {
      let dbLib = {};
      for (const k of Object.keys(doc.in)) {
        const input = doc.in[k];
        if (typeof input === 'object' && input !== null) {
          for (const i of Object.keys(input)) {
            // e.g. `i` -> "!sample_id"
            // check if keys are like "!sample_id"
            if (i.charAt(0) == '!' && i.slice(-3) == '_id') {
              const refModel = i.substring(1, i.length - 3);
              console.log('refModel', refModel);
              const refs = input[i];
              if (!dbLib[refs]) {
                req.params.collectionName = refModel;
                const type = 'summary';
                // eslint-disable-next-line no-await-in-loop
                const docs = await dataController.getDataSummaryDoc(type, req, res, next);
                dbLib[refModel] = docs;
              }
              if (Array.isArray(refs)) {
                const promises = refs.map(async id => {
                  const filteredItem = dbLib[refModel].filter(d => d._id == id);
                  console.log(id);
                  console.log(filteredItem);
                  if (refModel == 'sample') {
                    sampleIds.push(id);
                  }
                  if (filteredItem && filteredItem[0]) return filteredItem[0];
                  return id;
                });
                // eslint-disable-next-line no-await-in-loop
                const populated = await Promise.all(promises);
                doc.in[k] = populated;
              }
            }
          }
        }
      }
    }
    return [doc, sampleIds];
  } catch (err) {
    return doc;
  }
};

exports.insertOutputRows = async (query, coll, req, res, next) => {
  try {
    const auth = `Bearer ${res.locals.token}`;
    const { data } = await axios.post(`${process.env.BASE_URL}/api/v1/data/${coll}`, query, {
      headers: {
        Authorization: auth
      }
    });
    if (data.data.data._id) return data.data.data._id;
    return null;
  } catch (err) {
    return null;
  }
};

exports.getDataIdByQueryParams = async (queryParams, collection, req, res, next) => {
  try {
    const auth = `Bearer ${res.locals.token}`;
    const { data } = await axios.get(
      `${process.env.BASE_URL}/api/v1/data/${collection}${queryParams}`,
      {},
      {
        headers: {
          Authorization: auth
        }
      }
    );
    if (data.data.data._id) return data.data.data._id;
    return null;
  } catch (err) {
    return null;
  }
};

exports.updateDataByQueryParams = async (queryParams, collection, update, req, res, next) => {
  try {
    const auth = `Bearer ${res.locals.token}`;
    const { data } = await axios.patch(
      `${process.env.BASE_URL}/api/v1/data/${collection}${queryParams}`,
      update,
      {
        headers: {
          Authorization: auth
        }
      }
    );
    if (data.data.data._id) return data.data.data._id;
    return null;
  } catch (err) {
    return null;
  }
};

// fills  "out": {"sample_summary" : {}},
//  with sampleName specific row id's
//  e.g.  "out": {"sample_summary" : {
//                    "control" : "5f622c67721d09b3670c4b66",
//                    "experiment": "3333267721d09b3670c4b66"}
//               }

exports.createOutputRows = async (doc, req, res, next) => {
  // add sample_id, run_id to sample_summary collection
  // in {reads: [{_id:"5f5a98", name:"test"},{_id:"5f5a99", name:"test2"}], mate:"pair"}
  // get all samples names that are belong to collection = found in array
  let sample_summary_ids = [];
  const run_id = doc._id;
  const inputs = doc.in;
  let sampleNames = [];
  let sampleIDs = [];
  for (const i of Object.keys(inputs)) {
    if (Array.isArray(inputs[i])) {
      sampleNames = inputs[i].map(el => el.name);
      sampleIDs = inputs[i].map(el => el._id);
    }
  }
  const out = doc.out;
  for (const collection of Object.keys(out)) {
    for (let i = 0; i < sampleIDs.length; i += 1) {
      const sample_id = sampleIDs[i];
      const sample_name = sampleNames[i];
      const queryParams = `?sample_id=${sample_id}&run_id=${run_id}`;
      // eslint-disable-next-line no-await-in-loop
      let sample_summary_id = await exports.getDataIdByQueryParams(
        queryParams,
        collection,
        req,
        res,
        next
      );
      if (!sample_summary_id) {
        const query = { sample_id, run_id, doc: null };
        // eslint-disable-next-line no-await-in-loop
        sample_summary_id = await exports.insertOutputRows(query, collection, req, res, next);
      }
      if (sample_summary_id) {
        sample_summary_ids.push(sample_summary_id);
        // use latest rowid to update sample_summary_id field in sample collection
        const sampleQuery = `/${sample_id}`;
        const update = { sample_summary_id };
        // eslint-disable-next-line no-await-in-loop
        await exports.updateDataByQueryParams(sampleQuery, 'sample', update, req, res, next);
        // save latest rowid in doc.out
        doc.out[collection][sample_name] = sample_summary_id;
      }
    }
  }

  return [doc, sample_summary_ids];
};

exports.startRun = async (docSaved, req, res, next) => {
  try {
    console.log('run event created');
    let [docIds, sampleIds] = await exports.replaceDataIds(docSaved, req, res, next);
    let [doc, sample_summary_ids] = await exports.createOutputRows(docIds, req, res, next);
    const info = {};
    info.dmetaServer = process.env.BASE_URL;
    console.log('doc', doc);
    console.log('populated_doc_reads', doc.in.reads);
    // send run information to selected server
    if (doc.server_id) {
      const server = await serverController.getServerById(doc.server_id);
      if (server && server.url && res.locals.token) {
        const auth = `Bearer ${res.locals.token}`;
        //localhost:8080/dolphinnext/api/service.php?run=startRun
        const { data, status } = await axios.post(
          `${server.url}/api/service.php?run=startRun`,
          { doc, info },
          {
            headers: {
              Authorization: auth
            }
          }
        );
        console.log(data, status);
        const runStatus = data.status ? data.status : 'error';
        const runLog = data.log ? data.log : data.toString();
        const runUrl = data.run_url ? data.run_url : '';
        console.log('update.status:', runStatus);
        console.log('runLog:', runLog);
        if (runStatus == 'initiated') {
          //update sample status
          console.log(sampleIds);
          for (let n = 0; n < sampleIds.length; n++) {
            // use sampleID to update status field in sample collection
            // eslint-disable-next-line no-await-in-loop
            await exports.updateDataByQueryParams(
              `/${sampleIds[n]}`,
              'sample',
              { status: 'Processing' },
              req,
              res,
              next
            );
          }
          for (let n = 0; n < sample_summary_ids.length; n++) {
            // eslint-disable-next-line no-await-in-loop
            await exports.updateDataByQueryParams(
              `/${sample_summary_ids[n]}`,
              'sample_summary',
              { run_url: runUrl },
              req,
              res,
              next
            );
          }
          return { status: runStatus, message: 'Run initiated', error: null };
          // **** update run status
        }
        return { status: runStatus, message: 'Run could not be started', error: runLog };
        // **** update run status
      }
    }
    return {
      status: null,
      message: 'Run could not be started, Target server could not found.',
      error: null
    };
  } catch (err) {
    console.log('Run could not be started', err);
    return { status: null, message: 'Run could not be started', error: err };
  }
};

exports.getAllEvents = factory.getAll(Event);
exports.getEvent = factory.getOne(Event);
