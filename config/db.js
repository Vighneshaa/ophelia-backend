const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('⚠️  MONGODB_URI not set. Server will run without database.');
    return;
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`🟢 MongoDB connected: ${conn.connection.host} (db: ${conn.connection.name || 'default'})`);
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

module.exports = { connectDB };
