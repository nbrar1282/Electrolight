import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;
let isConnected = false;

export async function connectToDatabase() {
  // 1. Safety Check: If the variable is missing, stop everything.
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI must be defined in the environment");
  }

  try {
    // 2. Now TypeScript knows it is definitely a string
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    // Don't kill the process on Vercel; just log the error so the lambda can retry or fail gracefully
    throw error;
  }
}

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('MongoDB connected');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
  isConnected = false;
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed through app termination');
  process.exit(0);
});