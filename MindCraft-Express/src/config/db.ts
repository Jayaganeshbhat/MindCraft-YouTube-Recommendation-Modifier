import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDB() {
  if (!env.MONGO_URI) throw new Error('MONGO_URI not set');
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.MONGO_URI);
  console.log('[db] MongoDB connected');
}
