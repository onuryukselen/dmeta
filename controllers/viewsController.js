const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res, next) => {
  res.status(200).render('overview', {
    title: 'Overview'
  });
});

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account'
  });
};
