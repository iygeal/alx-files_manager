import { Router } from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';
import FilesController from '../controllers/FilesController';

const router = Router();

// Define the routes and link them to the AppController methods
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

// Route to create a new user
router.post('/users', UsersController.postNew);

// More routes
router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);
router.get('/users/me', UsersController.getMe);

// Route to upload files
router.post('/files', FilesController.postUpload);

// Routes to get files
router.get('/files', FilesController.getIndex);
router.get('/files/:id', FilesController.getShow);

// Routes to publish and unpublish files
router.put('/files/:id/publish', FilesController.putPublish);
router.put('/files/:id/unpublish', FilesController.putUnpublish);

// Route to get content of a file
router.get('/files/:id/data', FilesController.getFile);

export default router;
