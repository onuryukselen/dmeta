const express = require('express');
const dataController = require('../controllers/dataController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router.use(authController.setDefPerms);
router.use(authController.isLoggedIn);

router.route('/summary').get(dataController.getDataSummary);

router
  .route('/:collectionName')
  .get(dataController.setModel, dataController.getAllData)
  .post(authController.requireLogin, dataController.setModel, dataController.createData);

router
  .route('/:collectionName/:id')
  .get(dataController.setModel, dataController.getData)
  .patch(authController.requireLogin, dataController.setModel, dataController.updateData)
  .delete(authController.requireLogin, dataController.setModel, dataController.deleteData);

module.exports = router;
