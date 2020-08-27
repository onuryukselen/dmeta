const express = require('express');
const authController = require('../controllers/authController');
const groupController = require('../controllers/groupController');

const router = express.Router();

router.use(authController.protect);

// user groups
router
  .route('/user')
  .get(groupController.getUserGroups) //all groups belong to user
  .post(groupController.createUserGroup);

router
  .route('/user/:id')
  .patch(groupController.updateUserGroup)
  .delete(groupController.deleteUserGroup);

router.route('/:id/user').get(groupController.getGroupUsers); // get all users belonging to a group

// groups
router
  .route('/')
  .get(groupController.getAllGroups)
  .post(groupController.createGroup);

router
  .route('/:id')
  .get(groupController.getGroup)
  .patch(groupController.updateGroup)
  .delete(groupController.deleteGroup);

module.exports = router;
