import express from 'express';
import { createOrder } from '../controllers/orderController.js'; // Import the createOrder function

const router = express.Router();

// POST route to create a new order
router.post('/create', createOrder);

export default router;