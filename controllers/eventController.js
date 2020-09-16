const Event = require('../models/eventModel');
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
      console.log('Event could not be created', eventDetails);
    }
  };
  return next();
};

exports.getAllEvents = factory.getAll(Event);
exports.getEvent = factory.getOne(Event);
