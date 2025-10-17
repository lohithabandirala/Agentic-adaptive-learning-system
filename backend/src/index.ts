// Load environment variables FIRST before any other imports
import dotenv from 'dotenv';
dotenv.config();

// Debug: Verify env is loaded
console.log('🔑 Environment loaded:');
console.log('  - PORT:', process.env.PORT);
console.log('  - GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Found (' + process.env.GEMINI_API_KEY.substring(0, 10) + '...)' : 'NOT FOUND');
console.log('  - DB_URL:', process.env.DB_URL ? 'Found (MongoDB Atlas)' : 'NOT FOUND (using in-memory)');

import express from 'express';
import cors from 'cors';
import { connectDB } from './db/connection';
import authRoutes from './routes/auth';
import materialRoutes from './routes/materials';
import testRoutes from './routes/tests';
import adminRoutes from './routes/admin';
import classRoutes from './routes/classes';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ message: 'AI Learning Portal API - Use /api/* endpoints' });
});

app.use('/api/auth', authRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/classes', classRoutes);

const port = process.env.PORT || 4000;

// Connect to MongoDB and start server
connectDB().then(() => {
  app.listen(port, () => {
    console.log(`✅ Server listening on ${port}`);
    console.log(`🌐 API available at: http://localhost:${port}/api`);
  });
}).catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
