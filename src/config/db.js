import mongoose from 'mongoose';
import { MONGO_URI } from './index.js';

const connectDB = async () => {
  const maxAttempts = 5;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const conn = await mongoose.connect(MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      console.error(`Database connection attempt ${attempt}/${maxAttempts} failed: ${error.message}`);

      if (attempt === maxAttempts) {
        console.warn('MongoDB unavailable. The server will continue to run, but auth routes will fail until a valid MONGO_URI is provided.');
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
};

mongoose.connection.on('error', (err) => {
  console.error(`MongoDB Connection Loss Event: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB Disconnected Event. Attempting reconnection...');
});

export default connectDB;
