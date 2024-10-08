import Order from '../models/OrderModel.js';
import Product from '../models/ProductModel.js'; // Adjust the path as necessary

// Helper function to calculate profit
const calculateProfit = async (order) => {
    let totalProfit = 0;
    const productIds = order.products.map(item => item.product);

    // Fetch all products at once to minimize database calls
    const products = await Product.find({ _id: { $in: productIds } });

    // Create a map for easy access to product details by id
    const productMap = {};
    products.forEach(product => {
        productMap[product._id] = product;
    });

    // Calculate profit
    order.products.forEach(item => {
        const product = productMap[item.product];
        if (product) {
            const profit = item.price - product.productionCost; // Calculate profit per item
            totalProfit += profit * item.quantity; // Multiply by quantity sold
        }
    });

    return totalProfit;
};

// Get today's sales
export const getTodaySales = async (req, res) => {
    try {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        const sales = await Order.find({
            orderDate: { $gte: startOfDay, $lte: endOfDay },
        });

        const totalSales = sales.reduce((total, order) => total + order.finalAmount, 0);
        const totalProfit = await Promise.all(sales.map(order => calculateProfit(order)));
        const aggregatedProfit = totalProfit.reduce((sum, profit) => sum + profit, 0);

        res.json({ totalSales, totalProfit: aggregatedProfit, sales });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching today\'s sales', error: error.message });
    }
};

// Get sales for the last 7 days
export const getLast7DaysSales = async (req, res) => {
    try {
        const salesData = await Order.find({
            orderDate: {
                $gte: new Date(new Date().setDate(new Date().getDate() - 7)),
                $lte: new Date(),
            }
        });

        if (!salesData.length) {
            return res.json({ totalSales: 0, totalProfit: 0, salesData: [] });
        }

        const totalSales = salesData.reduce((total, order) => total + order.finalAmount, 0);
        const totalProfit = await Promise.all(salesData.map(calculateProfit));
        const aggregatedProfit = totalProfit.reduce((sum, profit) => sum + (profit || 0), 0);

        res.json({ totalSales, totalProfit: aggregatedProfit, salesData });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching sales data', error: error.message });
    }
};

// Get sales for the last month
export const getLastMonthSales = async (req, res) => {
    try {
        const salesData = await Order.find({
            orderDate: {
                $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)), // Changed to setMonth
                $lte: new Date(),
            }
        });

        if (!salesData.length) {
            return res.json({ totalSales: 0, totalProfit: 0, salesData: [] });
        }

        const totalSales = salesData.reduce((total, order) => total + order.finalAmount, 0);
        const totalProfit = await Promise.all(salesData.map(calculateProfit));
        const aggregatedProfit = totalProfit.reduce((sum, profit) => sum + (profit || 0), 0);

        res.json({ totalSales, totalProfit: aggregatedProfit, salesData });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching sales data', error: error.message });
    }
};

// Get sales for all time.
export const getTotalSales = async (req, res) => {
    try {
        // Remove date filtering to get all sales data
        const salesData = await Order.find({});
        console.log(salesData)
        if (!salesData.length) {
            return res.json({ totalSales: 0, totalProfit: 0, salesData: [] });
        }

        const totalSales = salesData.reduce((total, order) => total + order.finalAmount, 0);
        const totalProfit = await Promise.all(salesData.map(calculateProfit));
        const aggregatedProfit = totalProfit.reduce((sum, profit) => sum + (profit || 0), 0);

        res.json({ totalSales, totalProfit: aggregatedProfit, salesData });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching sales data', error: error.message });
    }
};


// Get Trending Products (most ordered recently with product details)
export const getTrendingProducts = async (req, res) => {
    try {
        const thirtyDaysAgo = new Date(new Date().setDate(new Date().getDate() - 30)); // Last 30 days

        // Find orders within the last 30 days
        const recentOrders = await Order.aggregate([
            { $match: { orderDate: { $gte: thirtyDaysAgo } } }, // Match orders within the last 30 days
            { $unwind: "$products" }, // Deconstruct the products array
            {
                $group: {
                    _id: "$products.product", // Group by product ID
                    recentOrderDate: { $max: "$orderDate" }, // Get the most recent order date for each product
                    totalQuantity: { $sum: "$products.quantity" } // Sum the quantity sold for each product
                }
            },
            { $sort: { recentOrderDate: -1 } }, // Sort by most recent order date
            { $limit: 5 }, // Limit to top 5 trending products
            {
                $lookup: {
                    from: 'products', // Collection name of Product (should match your DB collection name)
                    localField: '_id', // Field to join on (product ID)
                    foreignField: '_id', // Field in Product collection (product ID)
                    as: 'productDetails' // Alias for product details
                }
            },
            { $unwind: "$productDetails" }, // Deconstruct product details array
            {
                $project: {
                    _id: 1,
                    totalQuantity: 1,
                    recentOrderDate: 1,
                    "productDetails.name": 1,
                    "productDetails.description": 1,
                    "productDetails.price": 1,
                    "productDetails.image": 1, // Include any other fields you want from the product
                }
            }
        ]);

        res.json({ trendingProducts: recentOrders });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching trending products', error: error.message });
    }
};

// Get Top-Selling Products (highest sales volume with product details)
export const getTopSellingProducts = async (req, res) => {
    try {
        // Aggregate total quantity sold for each product
        const topSellingProducts = await Order.aggregate([
            { $unwind: "$products" }, // Deconstruct the products array
            {
                $group: {
                    _id: "$products.product", // Group by product ID
                    totalQuantitySold: { $sum: "$products.quantity" }, // Sum the total quantity sold for each product
                    totalRevenue: { $sum: { $multiply: ["$products.quantity", "$products.price"] } } // Calculate total revenue for each product
                }
            },
            { $sort: { totalQuantitySold: -1 } }, // Sort by highest quantity sold
            { $limit: 5 }, // Limit to top 5 selling products
            {
                $lookup: {
                    from: 'products', // Collection name of Product
                    localField: '_id', // Field to join on (product ID)
                    foreignField: '_id', // Field in Product collection (product ID)
                    as: 'productDetails' // Alias for product details
                }
            },
            { $unwind: "$productDetails" }, // Deconstruct product details array
            {
                $project: {
                    _id: 1,
                    totalQuantitySold: 1,
                    totalRevenue: 1,
                    "productDetails.name": 1,
                    "productDetails.description": 1,
                    "productDetails.price": 1,
                    "productDetails.image": 1, // Include any other fields you want from the product
                }
            }
        ]);

        res.json({ topSellingProducts });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching top-selling products', error: error.message });
    }
};
