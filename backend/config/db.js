const mongoose = require('mongoose');
const { MONGODB_URI } = require('./env');

const MAX_RETRIES = 5;
const BASE_DELAY_MS = 1000;
const MAX_DELAY_MS = 30000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const connectWithRetry = async (retries = 0) => {
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 10,
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4, skip trying IPv6
    });
    console.log(`✅ Society Connect Database Connected: ${conn.connection.host} / ${conn.connection.name}`);
    return conn;
  } catch (error) {
    if (retries >= MAX_RETRIES) {
      console.error(`❌ MongoDB Connection Failed after ${MAX_RETRIES} retries: ${error.message}`);
      throw error;
    }

    const delay = Math.min(BASE_DELAY_MS * Math.pow(2, retries), MAX_DELAY_MS);
    const jitter = Math.random() * 1000;
    const totalDelay = Math.floor(delay + jitter);

    console.warn(`⚠️ MongoDB connection attempt ${retries + 1}/${MAX_RETRIES} failed: ${error.message}`);
    console.log(`🔄 Retrying in ${totalDelay}ms...`);

    await sleep(totalDelay);
    return connectWithRetry(retries + 1);
  }
};

const connectDB = async () => {
  // Connection event handlers
  mongoose.connection.on('connected', () => {
    console.log('📡 Mongoose connected to DB');
  });

  mongoose.connection.on('error', (err) => {
    console.error('❌ Mongoose connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ Mongoose disconnected from DB');
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('🔌 Mongoose connection closed due to app termination');
    process.exit(0);
  });

  await connectWithRetry();
};

module.exports = connectDB;