/**
 * Database Connection Configuration
 * Handles MongoDB connection using Mongoose
 */

const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        console.log(' Attempting to connect to MongoDB...');
        console.log(' MongoDB URI:', process.env.MONGO_URI ? 'Set' : 'Missing');

        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in environment variables');
        }

        const conn = await mongoose.connect(process.env.MONGO_URI, {
            // Modern Mongoose doesn't need these options, but they're harmless
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log(` MongoDB Connected: ${conn.connection.host}`);
        console.log(` Database Name: ${conn.connection.name}`);

    } catch (error) {
        console.error(' MongoDB connection error:', error.message);
        console.error(' Full error:', error);
        process.exit(1);
    }
};

module.exports = connectDB;
