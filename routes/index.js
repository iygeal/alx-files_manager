import { Router } from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';

const router = Router();

// Define the routes and link them to the AppController methods
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

// Route to create a new user
router.post('/users', UsersController.postNew);

export default router;
