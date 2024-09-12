import Order from "../models/OrderModel.js";
import Product from "../models/ProductModel.js";

export const createOrder = async (req, res) => {
    const {
        customerName,
        customerPhone,
        customerEmail,
        products,
        shippingAddress,
        billingAddress,
        discount = 0,
        tax = 0,
        paymentMethod,
        notes
    } = req.body;

    if (!customerName || !customerPhone || !products || products.length === 0 || !shippingAddress || !paymentMethod) {
        return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    try {
        // Check if order quantity exceeds stock
        for (let item of products) {
            const product = await Product.findById(item.product);
            if (!product || product.stock < item.quantity) {
                return res.status(400).json({ message: `Insufficient stock for product ${product.name}. Available stock: ${product.stock}` });
            }
        }

        // Calculate total amount for the order
        const totalAmount = products.reduce((acc, item) => acc + item.price * item.quantity, 0);
        const finalAmount = totalAmount - discount + tax;

        // Generate a unique order number
        const orderNumber = `ORD-${Date.now()}`;

        // Create the order
        const newOrder = new Order({
            orderNumber,
            customerName,
            customerPhone,
            customerEmail,
            products,
            totalAmount,
            discount,
            tax,
            finalAmount,
            shippingAddress,
            billingAddress: billingAddress || shippingAddress,
            paymentMethod,
            notes,
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


// Get all orders

export const getOrders = async (req, res) => {
    const { search = '', page = 1, limit = 5, startDate, endDate } = req.query; // Default limit to 5
    const query = {};

    // Search by order number or customer name
    if (search) {
        query.$or = [
            { orderNumber: { $regex: search, $options: 'i' } },
            { customerName: { $regex: search, $options: 'i' } }
        ];
    }

    // Filter by order date range
    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        // Set the end date to the end of the day (23:59:59)
        end.setHours(23, 59, 59, 999);

        query.orderDate = { $gte: start, $lte: end };
    }

    try {
        const orders = await Order.find(query)
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ orderDate: -1 });

        const totalOrders = await Order.countDocuments(query);

        res.status(200).json({
            orders,
            totalPages: Math.ceil(totalOrders / limit),
            currentPage: parseInt(page),
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Error fetching orders' });
    }
};


export const deleteOrder = async (req, res) => {
    try {
        const orderId = req.params.id;
        const result = await Order.findByIdAndDelete(orderId);

        if (!result) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({ message: 'Failed to delete order' });
    }
};


export const updateOrderStatus = async (req, res) => {
    const { orderId } = req.params;
    const { fulfillmentStatus } = req.body;

    // Validate the incoming data
    if (!fulfillmentStatus) {
        return res.status(400).json({ message: 'Please provide the new status' });
    }

    try {
        // Update the order with the new status
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { fulfillmentStatus }, // Correctly set the new status
            { new: true } // Return the updated document
        );

        // Check if the order was found and updated
        if (!updatedOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json({ message: 'Order status updated successfully', order: updatedOrder });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ message: 'Failed to update order status', error });
    }
};
