import mongoose from 'mongoose';
import { config } from './index.js';

// Connection state tracking
let isConnected = false;

/**
 * Connect to MongoDB database
 */
export async function connectDatabase(): Promise<void> {
  if (isConnected) {
    console.log('📦 Using existing database connection');
    return;
  }

  try {
    const conn = await mongoose.connect(config.mongodb.uri, config.mongodb.options);
    isConnected = true;
    console.log(`📦 MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

/**
 * Disconnect from MongoDB database
 */
export async function disconnectDatabase(): Promise<void> {
  if (!isConnected) {
    return;
  }

  try {
    await mongoose.disconnect();
    isConnected = false;
    console.log('📦 MongoDB disconnected');
  } catch (error) {
    console.error('❌ MongoDB disconnection error:', error);
  }
}

// Handle connection events
mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err);
});

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.log('📦 MongoDB disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await disconnectDatabase();
  process.exit(0);
});

export default { connectDatabase, disconnectDatabase };
