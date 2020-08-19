const express = require('express');
const dataController = require('../controllers/dataController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(dataController.getAllData)
  .post(dataController.createData);

router
  .route('/:id')
  .get(dataController.getData)
  .patch(dataController.updateData)
  .delete(dataController.deleteData);

module.exports = router;
