import mongoose from 'mongoose'; //check

const MONGODB_URI = process.env.MONGODB_URI;
let isConnected = false;

export async function connectToDatabase() {
  // 1. Check if the variable exists
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is missing");
  }

  try {
    // 2. Now TypeScript knows it's a string, so it won't complain
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    // Don't exit the process here so Vercel doesn't crash immediately on cold start
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