import mongoose from 'mongoose';
import { env } from './env';

export const connectDb = async (): Promise<void> => {
  mongoose.set('strictQuery', true);

  await mongoose.connect(env.MONGO_URI);

  mongoose.connection.on('connected', () => {
    console.log('Mongo connected');
  });

  mongoose.connection.on('error', (err) => {
    console.error('Mongo connection error', err);
  });
};
