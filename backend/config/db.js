const mongoose = require('mongoose');

const connectDB = async () => {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/altishomes';
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully at:', MONGODB_URI);
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

module.exports = connectDB;
