const mongoose = require('mongoose');
const { MONGO_URI } = require('./env');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 4000
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`[Database Warning] MongoDB connection failed: ${error.message}`);
    console.warn('[Database Warning] Running in standalone/dev mode (persistence will be limited until MongoDB is started).');
    return null;
  }
};

module.exports = connectDB;
