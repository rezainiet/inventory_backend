import express from 'express';
import { createOrder, deleteOrder, getAllOrders, getIncompleteOrders, updateOrderStatus } from '../controllers/orderController.js';

const router = express.Router();

// POST route to create a new order
router.post('/create', createOrder);

// GET route to retrieve orders exclude delivered and cancelled
router.get('/', getIncompleteOrders);

// GET route to retrieve orders
router.get('/getAllOrders', getAllOrders);

// DELETE route to delete an order
router.delete('/:id', deleteOrder);

// PUT route to update order status
router.patch('/status/:orderId', updateOrderStatus);

export default router;
