const express = require('express');
const authController = require('../controllers/authController');
const groupController = require('../controllers/groupController');

const router = express.Router();

router.use(authController.protect);

router.route('/').post(groupController.createUserGroup);
router
  .route('/:id')
  .get(groupController.setUserFilter, groupController.getUserGroups) //all groups belong to user
  .patch(groupController.updateUserGroup)
  .delete(groupController.deleteUserGroup);

module.exports = router;
