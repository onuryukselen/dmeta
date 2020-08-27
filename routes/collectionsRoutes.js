const express = require('express');
const authController = require('../controllers/authController');
const collectionsController = require('../controllers/collectionsController');
const fieldsController = require('../controllers/fieldsController');
const fieldsRouter = require('./fieldsRoutes');

const router = express.Router();

router.use('/:collectionID/fields', fieldsController.setFilter, fieldsRouter);

router
  .route('/')
  .get(collectionsController.getAllCollections)
  .post(
    authController.protect,
    collectionsController.setAfter,
    collectionsController.createCollection
  );

router
  .route('/:id')
  .get(collectionsController.getCollection)
  .patch(
    authController.protect,
    collectionsController.setAfter,
    collectionsController.updateCollection
  )
  .delete(
    authController.protect,
    collectionsController.setAfter,
    collectionsController.deleteCollection
  );

module.exports = router;
