const factory = require('./handlerFactory');
const { modelObj } = require('./../utils/buildModels');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

//if collectionName is set, then save that Model as a res.locals.Model
exports.setModel = (req, res, next) => {
  if (req.params.collectionName) {
    res.locals.Model = modelObj[req.params.collectionName];
    if (!modelObj[req.params.collectionName]) {
      return next(new AppError(`collectionName is not found!`, 404));
    }
    return next();
  }
  return next(new AppError(`collectionName is not defined!`, 404));
};

exports.getAllData = factory.getAll();
exports.getData = factory.getOne();
exports.createData = factory.createOne();
exports.updateData = factory.updateOne();
exports.deleteData = factory.deleteOne();

const parseSummarySchema = () => {
  // * expected Schema for data summary
  // - collection: main target collecton
  // - populate: space separated fields to be merged my reference
  // - select: space separated selected fields
  // - rename: final name of the fields in the output
  //
  //e.g. const schema = {
  //    collection: 'samples',
  //    select:'dir experiments_id.exp experiments_id.projects_id.name experiments_id.test_id.name',
  //    rename: 'directory exp_name pro_name test_name',
  //    populate: 'experiments_id experiments_id.projects_id experiments_id.test_id'
  //   }
  const schema = {
    collection: 'samples',
    select:
      'name dir experiments_id.exp experiments_id.projects_id.name experiments_id.test_id.name',
    rename: 'name directory exp_name pro_name test_name',
    populate: 'experiments_id experiments_id.projects_id experiments_id.test_id'
  };
  const targetCollection = schema.collection;
  const select = [];
  const rename = [];
  const populate = {};

  // const cloneObjWithoutKeys = (obj, keys) => {
  //   if (Object(obj) !== obj) return obj;
  //   if (Array.isArray(obj)) return obj.map(o => cloneObjWithoutKeys(o, keys));

  //   return Object.fromEntries(
  //     Object.entries(obj)
  //       .filter(([k, v]) => !keys.includes(k))
  //       .map(([k, v]) => [k, cloneObjWithoutKeys(v, keys)])
  //   );
  // };
  // const populate = cloneObjWithoutKeys(schema, keepKeys);
  // console.log(populate);

  return { targetCollection, populate, select, rename };
};

exports.getDataSummary = catchAsync(async (req, res, next) => {
  const start = Date.now();
  const { targetCollection, populate, select, rename } = parseSummarySchema();
  const query = modelObj[targetCollection].find({});
  // if (res.locals.Perms) {
  //   const permFilter = await res.locals.Perms('read');
  //   query.find(permFilter);
  // }
  query
    .populate({
      path: 'experiments_id',
      populate: {
        path: 'projects_id projects2_id'
      }
    })
    .select('name experiments_id.email experiments_id.projects_id.biosample_name projects2_id.name')
    .lean();

  let doc = await query;
  if (!doc || (Array.isArray(doc) && doc.length === 0)) {
    return next(new AppError(`No document found!`, 404));
  }
  // rename keys according to Schema
  doc = doc.map(d => {
    // console.log(d.name);
    return {
      name: d.name,
      exp_email: d.experiments_id.email,
      project_biosample_name: d.experiments_id.projects_id.biosample_name,
      project2_name: d.experiments_id.projects2_id.name
    };
  });

  const duration = Date.now() - start;

  res.status(200).json({
    status: 'success',
    duration: duration,
    results: doc.length,
    data: {
      data: doc
    }
  });
});
