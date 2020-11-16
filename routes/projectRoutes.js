const express = require('express');
const authController = require('../controllers/authController');
const projectsController = require('../controllers/projectsController');
const collectionsController = require('../controllers/collectionsController');
const collectionsRouter = require('./collectionsRoutes');

const router = express.Router();

router.use(authController.isLoggedIn);
router.use(authController.setDefPerms);

router.use('/:projectID/collections', collectionsController.setFilter, collectionsRouter);

router
  .route('/')
  .get(projectsController.getAllProjects)
  .post(
    authController.requireLogin,
    authController.restrictTo('admin'),
    // projectsController.setAfter,
    projectsController.createProject
  );

router
  .route('/:id')
  .get(projectsController.getProject)
  .patch(
    authController.requireLogin,
    authController.restrictTo('admin'),
    // projectsController.setAfter,
    projectsController.updateProject
  )
  .delete(
    authController.requireLogin,
    authController.restrictTo('admin'),
    // projectsController.setAfter,
    projectsController.deleteProject
  );

module.exports = router;
