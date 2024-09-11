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
