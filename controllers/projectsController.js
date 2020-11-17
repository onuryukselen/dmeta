const Project = require('../models/projectsModel');
const factory = require('./handlerFactory');
// const AppError = require('./../utils/appError');
// const buildModels = require('./../utils/buildModels');

exports.getProjectByName = async name => {
  return await Project.findOne({ name }).lean();
};
exports.getProjectById = async id => {
  return await Project.findById(id).lean();
};

// set commands after query is completed
// exports.setAfter = async (req, res, next) => {
//   // for createCollection
//   if (req.body.name) {
//     res.locals.After = async function() {
//       try {
//         req.body.name = req.body.name.replace(/\s+/g, '_').toLowerCase();
//         const col = await exports.getCollectionByName(req.body.name);
//         buildModels.updateModel(col._id);
//       } catch {
//         return next(new AppError(`Collection Model couldn't be updated.`, 404));
//       }
//     };
//     return next();
//   }
//   // for updateCollection and deleteCollection
//   if (req.params.id) {
//     res.locals.After = function() {
//       buildModels.updateModel(req.params.id);
//     };
//     return next();
//   }
//   return next(new AppError(`Collection couldn't created!`, 404));
// };

exports.getAllProjects = factory.getAll(Project);
exports.getProject = factory.getOne(Project);
exports.createProject = factory.createOne(Project);
exports.updateProject = factory.updateOne(Project);
exports.deleteProject = factory.deleteOne(Project);
