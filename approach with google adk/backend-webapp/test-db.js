// Test MongoDB Atlas Connection
require('dotenv').config();
const mongoose = require('mongoose');

console.log('🔍 Testing MongoDB Atlas Connection...\n');

const DB_URL = process.env.DB_URL;

if (!DB_URL) {
  console.error('❌ Error: DB_URL not found in .env file');
  process.exit(1);
}

console.log('📍 Connection String:', DB_URL.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'));

mongoose.connect(DB_URL)
  .then(() => {
    console.log('\n✅ SUCCESS! MongoDB Atlas connection established!');
    console.log('📦 Database:', mongoose.connection.name);
    console.log('🌐 Host:', mongoose.connection.host);
    console.log('🔌 Connection State:', mongoose.connection.readyState === 1 ? 'Connected' : 'Unknown');
    
    // Test a simple query
    return mongoose.connection.db.admin().ping();
  })
  .then(() => {
    console.log('✅ Database is responding to ping!');
    console.log('\n🎉 Your MongoDB Atlas setup is working perfectly!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Connection Failed!');
    console.error('Error:', error.message);
    console.log('\n🔧 Common Solutions:');
    console.log('1. Check if your IP address is whitelisted in MongoDB Atlas');
    console.log('2. Verify username/password in connection string');
    console.log('3. Check if cluster is active (not paused)');
    console.log('4. Ensure network connectivity');
    process.exit(1);
  });
