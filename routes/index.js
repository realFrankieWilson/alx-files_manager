const express = require('express');
const AppController = require('../controllers/AppController');
const UsersController = require('../controllers/UsersController'); // Import UsersController
const AuthController = require('../controllers/AuthController'); // Import AuthController
const FilesController = require('../controllers/FilesController'); // Import FilesController

const router = express.Router();

// Existing endpoints
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

// New endpoint for creating a user
router.post('/users', UsersController.postNew);

// New authentication endpoints
router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);
router.get('/users/me', UsersController.getMe);

// New endpoints for file management
router.post('/files', FilesController.postUpload);
router.get('/files/:id', FilesController.getShow);
router.get('/files', FilesController.getIndex);

module.exports = router;
