const factory = require('./handlerFactory');
const Group = require('../models/groupModel');
const UserGroup = require('../models/userGroupModel');

exports.setUserFilter = (req, res, next) => {
  if (req.params.id) res.locals.Filter = { user_id: req.params.id };
  next();
};
exports.setGroupFilter = (req, res, next) => {
  if (req.params.id) res.locals.Filter = { group_id: req.params.id };
  next();
};

exports.getAllGroups = factory.getAll(Group);
exports.getGroup = factory.getOne(Group);
exports.createGroup = factory.createOne(Group);
exports.updateGroup = factory.updateOne(Group);
exports.deleteGroup = factory.deleteOne(Group);

exports.getUserGroups = factory.getAll(UserGroup);
exports.getGroupUsers = factory.getAll(UserGroup);
exports.createUserGroup = factory.createOne(UserGroup);
exports.updateUserGroup = factory.updateOne(UserGroup);
exports.deleteUserGroup = factory.deleteOne(UserGroup);
