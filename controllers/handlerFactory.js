const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const APIFeatures = require('./../utils/apiFeatures');

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    // If res.locals.Model is exist, use as Model (for dataRoutes)
    if (res.locals.Model) Model = res.locals.Model;
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError(`No document found with ${req.params.id}!`, 404));
    }
    if (res.locals.After) res.locals.After();
    res.status(200).json({
      status: 'success',
      data: {
        doc: 'Deleted!'
      }
    });
  });

exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    // If res.locals.Model is exist, use as Model (for dataRoutes)
    if (res.locals.Model) Model = res.locals.Model;
    // req.user set with `protected` middleware
    req.body.lastUpdatedUser = req.user.id;
    // don't allow to change internal parameters such as owner, creationDate etc.
    ['owner', 'creationDate', 'lastUpdateDate', 'lastUpdatedUser'].forEach(function(key) {
      delete req.body[key];
    });
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
      context: 'query' //  lets you set `this` as a query object in model validators
    });
    if (!doc) {
      return next(new AppError(`No document found with ${req.params.id}!`, 404));
    }
    if (res.locals.After) res.locals.After();
    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    // If res.locals.Model is exist, use as Model (for dataRoutes)
    if (res.locals.Model) Model = res.locals.Model;
    // req.user set with `protected` middleware
    req.body.lastUpdatedUser = req.user.id;
    req.body.owner = req.user.id;
    const doc = await Model.create(req.body);
    if (res.locals.After) res.locals.After();

    res.status(201).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    // If res.locals.Model is exist, use as Model (for dataRoutes)
    if (res.locals.Model) Model = res.locals.Model;
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;
    if (!doc) {
      return next(new AppError(`No document found with ${req.params.id}!`, 404));
    }

    res.status(200).json({
      status: 'success',
      reqeustedAt: req.requestTime,
      data: {
        data: doc
      }
    });
  });

exports.getAll = Model =>
  catchAsync(async (req, res, next) => {
    // If res.locals.Model is exist, use as Model (for dataRoutes)
    if (res.locals.Model) Model = res.locals.Model;
    let filter = {};
    if (res.locals.Filter) filter = res.locals.Filter;
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    //const doc = await features.query.explain();
    const doc = await features.query;
    res.status(200).json({
      status: 'success',
      reqeustedAt: req.requestTime,
      results: doc.length,
      data: {
        data: doc
      }
    });
  });
