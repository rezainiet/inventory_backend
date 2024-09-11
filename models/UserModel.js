import mongoose from "mongoose";
// Define the schema for the user model
const UserSchema = new mongoose.Schema({
    googleId: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    role: {
        type: String,
        enum: ['admin', 'user', 'manager'],
        default: 'user',
    },
    profilePicture: {
        type: String, // URL of the profile picture
    },
    lastLogin: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

// Create the User model
const User = mongoose.model('User', UserSchema);

export default User;
