import mongoose from 'mongoose';

let shuttingDown = false;

export const setShuttingDown = () => { shuttingDown = true; };

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

mongoose.connection.on('error', (err) => {
  console.error('MongoDB runtime error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  if (shuttingDown) {
    console.log('MongoDB disconnected');
  } else {
    console.warn('MongoDB disconnected. Attempting to reconnect...');
  }
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected');
});

export default connectDB;