const factory = require('./handlerFactory');
const Group = require('../models/groupModel');
const UserGroup = require('../models/userGroupModel');

exports.getAllGroups = factory.getAll(Group);
exports.getGroup = factory.getOne(Group);
exports.createGroup = factory.createOne(Group);
exports.updateGroup = factory.updateOne(Group);
exports.deleteGroup = factory.deleteOne(Group);

exports.getUserGroups = factory.getAll(UserGroup);
exports.getGroupUsers = factory.getOne(UserGroup);
exports.createUserGroup = factory.createOne(UserGroup);
exports.updateUserGroup = factory.updateOne(UserGroup);
exports.deleteUserGroup = factory.deleteOne(UserGroup);
