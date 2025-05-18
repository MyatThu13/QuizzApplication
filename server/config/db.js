/**
 * Database Connection Configuration
 * Sets up MongoDB connection using Mongoose
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Get MongoDB URI from environment variables
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/quiz-app';
    
    // Configure mongoose connection options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true
    };
    
    // Connect to MongoDB
    const conn = await mongoose.connect(mongoURI, options);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;