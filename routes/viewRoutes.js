const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/receivetoken', authController.ssoReceiveToken);

router.use(authController.isLoggedIn);
router.get('/', viewsController.getOverview);
router.get(
  '/login',
  authController.ensureSingleSignOn,
  viewsController.getLoginForm,
  viewsController.getOverview
);
router.get('/me', authController.protect, viewsController.getAccount);

module.exports = router;
