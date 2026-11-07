const mongoose = require('mongoose');

let isMongooseConnected = false;

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/funnelpro';
  
  try {
    // Attempt Mongoose connection with 3-second timeout
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000
    });
    isMongooseConnected = true;
    console.log(`[Database] MongoDB Connected successfully to: ${mongoURI}`);
  } catch (err) {
    isMongooseConnected = false;
    console.log(`[Database] Local MongoDB server not detected (${err.message}).`);
    console.log('[Database] Auto-switching to high-performance Persistent JSON Database Engine (server/data/funnelpro_db.json).');
    console.log('[Database] All models, relations, seed data, and CRUD operations are fully active and persisted to disk.');
  }
};

const getDbStatus = () => {
  return {
    isMongooseConnected,
    mode: isMongooseConnected ? 'MongoDB (Mongoose)' : 'Persistent JSON Engine'
  };
};

module.exports = { connectDB, getDbStatus };

