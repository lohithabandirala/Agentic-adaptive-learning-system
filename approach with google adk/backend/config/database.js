import mongoose from 'mongoose';

/**
 * Connect to MongoDB
 */
export async function connectDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/adaptive-learning';
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ MongoDB connected successfully');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Check if MongoDB is running locally');
    console.error('   2. Verify MONGODB_URI in .env file');
    console.error('   3. For MongoDB Atlas, check connection string\n');
    process.exit(1);
  }
}

/**
 * Disconnect from MongoDB
 */
export async function disconnectDatabase() {
  try {
    await mongoose.connection.close();
    console.log('👋 MongoDB disconnected');
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await disconnectDatabase();
  process.exit(0);
});

export default mongoose;
