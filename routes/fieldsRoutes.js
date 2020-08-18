const express = require('express');

const fieldsController = require('../controllers/fieldsController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(fieldsController.getAllFields)
  .post(fieldsController.setCollectionId, fieldsController.createField);

router
  .route('/:id')
  .get(fieldsController.getField)
  .patch(fieldsController.updateField)
  .delete(fieldsController.deleteField);

// router.route('/model/:id');

module.exports = router;
