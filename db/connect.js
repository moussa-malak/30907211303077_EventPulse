const mongoose = require('mongoose');
const dotenv = require('dotenv');
const config = dotenv.config();

let connectionPromise = null;

const connectDB = async () => {
  // Already connected
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // Connection is already being established
  if (connectionPromise) {
    await connectionPromise;
    return mongoose.connection;
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not defined");
  }

  try {
    connectionPromise = mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    await connectionPromise;

    console.log("MongoDB connected successfully");

    return mongoose.connection;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);

    throw error;
  } finally {
    connectionPromise = null;
  }
};

module.exports = connectDB;