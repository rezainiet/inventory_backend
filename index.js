import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import connectDB from './config/database.js';
import productRoutes from './routes/productRoutes.js'; // Import the product routes
import supplierRoutes from './routes/supplierRoutes.js'; // Import the supplier routes
import orderRoutes from './routes/orderRoutes.js'; // Import the order routes
import userRoutes from './routes/userRoute.js'; // Import the user routes
import salesRoutes from './routes/salesRoutes.js'; // Import the sales routes

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 4000;

// Middleware
dotenv.config();
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

connectDB();

// API routes
app.use('/api/v1/products', productRoutes); // Use the product routes
app.use('/api/v1/suppliers', supplierRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/sales', salesRoutes); // Use the sales routes

// added live api key.
// Root endpoint
app.get('/', (req, res) => res.send(`App is running on port: ${PORT}`));

// Handle server errors
app.listen(PORT, (err) => {
    if (err) {
        console.error('Error starting server:', err);
    } else {
        console.log(`App is running on http://localhost:${PORT}`);
    }
});
