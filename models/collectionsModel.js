const mongoose = require('mongoose');
const slugify = require('slugify');

const collectionsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: [true, 'A collection must have a name']
    },
    slug: String,
    label: {
      type: String,
      unique: true,
      required: [true, 'A collection must have a label']
    },
    parentCollectionID: {
      type: String,
      default: '0'
    },
    version: {
      type: String,
      required: [true, 'A collection must have a version'],
      default: '1.0.0'
    },
    required: { type: 'boolean', default: false },
    active: { type: 'boolean', default: true },
    license: { type: String, default: 'MIT' },
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
      required: [true, 'A collection must have a user'],
      //For now add default user admin
      default: 'admin'
    },
    lastUpdatedUser: {
      type: String,
      required: [true, 'A collection must have a lastUpdatedUser'],
      //For now add default user admin
      default: 'admin'
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

collectionsSchema.index({ slug: 1 });

collectionsSchema.virtual('fields', {
  ref: 'Fields',
  foreignField: 'collectionID',
  localField: '_id'
});

collectionsSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

collectionsSchema.pre(/^findOneAnd/, async function(next) {
  this.r = await this.findOne();
  next();
});

const Collection = mongoose.model('Collection', collectionsSchema);

module.exports = Collection;
