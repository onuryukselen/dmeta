const mongoose = require('mongoose');
//const Collection = require('../models/collectionsModel');

const fieldsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A field must have a name']
    },
    label: {
      type: String,
      required: [true, 'A field must have a label']
    },
    collectionID: {
      type: mongoose.Schema.ObjectId,
      ref: 'Collection'
    },
    required: { type: 'boolean', default: false },
    active: { type: 'boolean', default: true },
    creationDate: {
      type: Date,
      default: Date.now()
    },
    lastUpdateDate: {
      type: Date,
      default: Date.now()
    },
    owner: {
      type: String,
      required: [true, 'A field must have a user'],
      //For now add default user admin
      default: 'admin'
    },
    lastUpdatedUser: {
      type: String,
      required: [true, 'A field must have a lastUpdatedUser'],
      //For now add default user admin
      default: 'admin'
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

fieldsSchema.pre(/^findOneAnd/, async function(next) {
  this.r = await this.findOne();
  next();
});

const Fields = mongoose.model('Fields', fieldsSchema);

module.exports = Fields;
