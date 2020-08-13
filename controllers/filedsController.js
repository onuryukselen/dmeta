const Fields = require('./../models/filedsModel');
const factory = require('./handlerFactory');

exports.getAllFields = factory.getAll(Fields);
exports.getField = factory.getOne(Fields);
exports.createField = factory.createOne(Fields);
exports.updateField = factory.updateOne(Fields);
exports.deleteField = factory.deleteOne(Fields);
