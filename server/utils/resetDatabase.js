const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pocketprep-quiz';
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true
    };
    const conn = await mongoose.connect(mongoURI, options);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

const resetDatabase = async () => {
  try {
    await connectDB();
    
    // Drop the questions collection
    await mongoose.connection.collection('questions').drop();
    console.log('Questions collection dropped successfully');
    
    // Drop the attempts collection
    try {
      await mongoose.connection.collection('attempts').drop();
      console.log('Attempts collection dropped successfully');
    } catch (error) {
      console.log('No attempts collection found to drop');
    }
    
    console.log('Database reset complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  }
};

resetDatabase();