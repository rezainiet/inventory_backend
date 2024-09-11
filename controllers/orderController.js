import Order from "../models/OrderModel.js";
import Product from "../models/ProductModel.js";

// Function to create a new order
export const createOrder = async (req, res) => {
    const { customerName, products, shippingAddress } = req.body;

    if (!customerName || !products || products.length === 0 || !shippingAddress) {
        return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    try {
        // Calculate total amount for the order
        const totalAmount = products.reduce((acc, item) => acc + item.price * item.quantity, 0);

        // Generate a unique order number
        const orderNumber = `ORD-${Date.now()}`;

        // Create the order
        const newOrder = new Order({
            orderNumber,
            customerName,
            products,
            totalAmount,
            shippingAddress,
        });

        // Save the order in the database
        const savedOrder = await newOrder.save();

        // Update the stock for each product in the order
        for (let item of products) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: -item.quantity }
            });
        }

        res.status(201).json({ message: 'Order created successfully', order: savedOrder });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Error creating order', error });
    }
};
