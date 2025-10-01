require('dotenv').config();
const mongoose = require('mongoose');
const { connectMongoDB } = require('./lib/mongodb');

async function testConnection() {
  try {
    console.log('Testing database connection...');
    console.log('MongoDB URI exists:', !!process.env.MONGO_URI);

    await connectMongoDB();
    console.log('✅ Connected to MongoDB successfully');

    // Test if we can query the users collection
    const User = require('./models/User');
    const users = await User.find({});
    console.log(`Found ${users.length} users in database`);

    if (users.length > 0) {
      console.log('Sample user emails:', users.map(u => u.email));
    }

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Database connection error:', error);
  }
}

testConnection();