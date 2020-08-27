const express = require('express');
const authController = require('../controllers/authController');
const groupController = require('../controllers/groupController');

const router = express.Router();

router
  .route('/')
  .get(groupController.getAllGroups)
  .post(authController.protect, groupController.createGroup);

router
  .route('/:id')
  .get(groupController.getGroup)
  .patch(authController.protect, groupController.updateGroup)
  .delete(authController.protect, groupController.deleteGroup);

router
  .route('/user')
  .get(groupController.getUserGroups)
  .post(authController.protect, groupController.createUserGroup);

router
  .route('/user/:id')
  .get(groupController.getGroupUsers)
  .patch(authController.protect, groupController.updateUserGroup)
  .delete(authController.protect, groupController.deleteUserGroup);

module.exports = router;
