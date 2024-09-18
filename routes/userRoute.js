// routes/userRoutes.js
import express from 'express';
import { getUser, createUser, updateUser } from '../controllers/userController.js';

const router = express.Router();

// Route to get a user by Google ID
router.get('/:googleId', getUser);

// Route to create a new user
router.post('', createUser);

// Route to update a user by Google ID
router.put('/:googleId', updateUser);

export default router;
