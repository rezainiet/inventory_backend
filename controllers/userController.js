// controllers/userController.js
import User from '../models/UserModel.js';

// Get a user by Google ID
export const getUser = async (req, res) => {
    try {
        const { googleId } = req.params;
        const user = await User.findOne({ googleId });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Create a new user
export const createUser = async (req, res) => {
    try {
        const { googleId, name, email, role = 'user', profilePicture } = req.body;

        // Check if the user already exists
        const existingUser = await User.findOne({ googleId });

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const newUser = new User({
            googleId,
            name,
            email,
            role,
            profilePicture,
        });

        await newUser.save();

        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Update a user by Google ID
export const updateUser = async (req, res) => {
    try {
        const { googleId } = req.params;
        const updatedData = req.body;

        // Find the user and update their data
        const user = await User.findOneAndUpdate({ googleId }, updatedData, {
            new: true, // Return the updated document
            runValidators: true // Ensure validators are run
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
