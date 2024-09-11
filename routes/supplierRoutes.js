import express from 'express';
import { addSupplier, getAllSuppliers } from '../controllers/SupplierController.js';

const router = express.Router();

// Route for adding a supplier
router.post('/add', addSupplier);
router.get('/', getAllSuppliers);

export default router;
