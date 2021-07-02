const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
  fields: { type: 'Mixed' }
});

counterSchema.index({ _id: 1, seq: 1 }, { unique: true });
exports.CounterModel = mongoose.model('counter', counterSchema);

exports.autoIncrementModelDID = async function(modelID, doc, next) {
  try {
    const counter = await exports.CounterModel.findByIdAndUpdate(
      modelID,
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    doc.DID = counter.seq;
  } catch (err) {
    return next(err);
  }

  // exports.CounterModel.findByIdAndUpdate(
  //   modelID,
  //   { $inc: { seq: 1 } },
  //   { new: true, upsert: true },
  //   function(error, counter) {
  //     doc.DID = counter.seq;
  //     console.log('1');
  //     next();
  //   }
  // );
};
