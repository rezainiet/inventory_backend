import Supplier from '../models/SupplierModel.js';

// Add Supplier
export const addSupplier = async (req, res) => {
    const { name, contactPerson, email, phone, address, productsSupplied, status } = req.body;

    // Validate required fields
    if (!name || !contactPerson || !email || !phone || !address) {
        return res.status(400).json({
            message: 'Please provide all required fields.',
            missingFields: {
                name: !name,
                contactPerson: !contactPerson,
                email: !email,
                phone: !phone,
                address: !address
            }
        });
    }

    try {
        // Check if the email already exists
        const existingSupplier = await Supplier.findOne({ email });
        if (existingSupplier) {
            return res.status(400).json({ message: 'Supplier with this email already exists.' });
        }

        // Create a new supplier
        const supplier = new Supplier({
            name,
            contactPerson,
            email,
            phone,
            address,
            productsSupplied, // Array of product references (if any)
            status,
            lastOrderDate: new Date(), // Set current date as lastOrderDate (optional)
        });

        // Save the supplier to the database
        const savedSupplier = await supplier.save();
        res.status(201).json({ message: 'Supplier added successfully', supplier: savedSupplier });
    } catch (error) {
        console.error('Error adding supplier:', error);
        res.status(500).json({ message: 'Error adding supplier', error });
    }
};


export const getAllSuppliers = async (req, res) => {
    try {
        const suppliers = await Supplier.find(); // Fetch all suppliers from the database
        res.status(200).json(suppliers);
    } catch (error) {
        console.error('Error fetching suppliers:', error);
        res.status(500).json({ message: 'Error fetching suppliers', error });
    }
};