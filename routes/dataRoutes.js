const express = require('express');
const dataController = require('../controllers/dataController');

const router = express.Router({ mergeParams: true });

router
  .route('/:collectionName')
  .get(dataController.setModel, dataController.getAllData)
  .post(dataController.setModel, dataController.createData);

router
  .route('/:collectionName/:id')
  .get(dataController.setModel, dataController.getData)
  .patch(dataController.setModel, dataController.updateData)
  .delete(dataController.setModel, dataController.deleteData);

module.exports = router;
