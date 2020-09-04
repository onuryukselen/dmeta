const express = require('express');
const dataController = require('../controllers/dataController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router.use(authController.setDefPerms);

router.route('/summary').get(authController.isLoggedIn, dataController.getDataSummary);

router
  .route('/:collectionName')
  .get(authController.isLoggedIn, dataController.setModel, dataController.getAllData)
  .post(authController.protect, dataController.setModel, dataController.createData);

router
  .route('/:collectionName/:id')
  .get(authController.isLoggedIn, dataController.setModel, dataController.getData)
  .patch(authController.protect, dataController.setModel, dataController.updateData)
  .delete(authController.protect, dataController.setModel, dataController.deleteData);

module.exports = router;
