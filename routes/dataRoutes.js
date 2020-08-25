const express = require('express');
const dataController = require('../controllers/dataController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router
  .route('/:collectionName')
  .get(dataController.setModel, dataController.getAllData)
  .post(authController.protect, dataController.setModel, dataController.createData);

router
  .route('/:collectionName/:id')
  .get(dataController.setModel, dataController.getData)
  .patch(authController.protect, dataController.setModel, dataController.updateData)
  .delete(authController.protect, dataController.setModel, dataController.deleteData);

module.exports = router;
