const mongoose = require('mongoose');

const userGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide group name!']
  },
  user_id: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  group_id: {
    type: mongoose.Schema.ObjectId,
    ref: 'Group'
  },
  active: {
    type: Boolean,
    default: true,
    select: false
  },
  creationDate: {
    type: Date,
    default: Date.now()
  },
  lastUpdateDate: {
    type: Date,
    default: Date.now()
  },
  perms: {
    type: 'Mixed'
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  lastUpdatedUser: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }
});

userGroupSchema.pre(/^find/, function(next) {
  this.find({ active: { $ne: false } });
  next();
});

const UserGroup = mongoose.model('userGroup', userGroupSchema);

module.exports = UserGroup;
