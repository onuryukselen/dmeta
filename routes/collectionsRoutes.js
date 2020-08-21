const express = require('express');

const collectionsController = require('../controllers/collectionsController');
const fieldsRouter = require('./fieldsRoutes');

const router = express.Router();

router.use('/:collectionID/fields', fieldsRouter);

router
  .route('/')
  .get(collectionsController.getAllCollections)
  .post(collectionsController.setAfter, collectionsController.createCollection);

router
  .route('/:id')
  .get(collectionsController.getCollection)
  .patch(collectionsController.setAfter, collectionsController.updateCollection)
  .delete(collectionsController.setAfter, collectionsController.deleteCollection);

module.exports = router;
