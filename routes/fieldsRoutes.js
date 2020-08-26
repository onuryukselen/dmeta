const express = require('express');
const authController = require('../controllers/authController');

const fieldsController = require('../controllers/fieldsController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(fieldsController.getAllFields)
  .post(
    authController.protect,
    fieldsController.setCollectionId,
    fieldsController.setAfter,
    fieldsController.createField
  );

router
  .route('/:id')
  .get(fieldsController.getField)
  .patch(authController.protect, fieldsController.setAfter, fieldsController.updateField)
  .delete(authController.protect, fieldsController.setAfter, fieldsController.deleteField);

module.exports = router;
