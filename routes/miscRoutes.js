const express = require('express');
const miscController = require('../controllers/miscController');

const router = express.Router();

router.route('/changelog').get(miscController.getChangeLog);
router.route('/getGoogleSheet/:id/:sheet').get(miscController.getGoogleSheet);

module.exports = router;
