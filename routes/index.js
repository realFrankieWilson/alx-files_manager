// routes/index.js
const express = require('express');
const router = express.Router();
const AppController = require('../controllers/AppController');

router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStatus);

module.exports = router;
