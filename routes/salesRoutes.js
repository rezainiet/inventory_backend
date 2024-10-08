import express from 'express';
import { getTodaySales, getLast7DaysSales, getLastMonthSales, getTotalSales, getTrendingProducts, getTopSellingProducts } from '../controllers/SalesController.js';

const router = express.Router();

router.get('/today', getTodaySales);
router.get('/last-7-days', getLast7DaysSales);
router.get('/last-month', getLastMonthSales); // Change here
router.get('/total-sales', getTotalSales); // Change here
router.get('/trending', getTrendingProducts); // API endpoint for trending products
router.get('/top-selling', getTopSellingProducts); // API endpoint for top-selling products


export default router;
