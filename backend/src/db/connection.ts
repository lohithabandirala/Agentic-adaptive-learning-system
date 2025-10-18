import mongoose from 'mongoose';

const DB_URL = process.env.DB_URL || '';

export async function connectDB() {
  if (!DB_URL) {
    console.log('⚠️  No DB_URL found - using in-memory storage');
    return;
  }

  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(DB_URL);
    console.log('✅ MongoDB connected successfully!');
    console.log('📦 Database:', mongoose.connection.name);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    console.log('⚠️  Falling back to in-memory storage');
  }
}

export default mongoose;
