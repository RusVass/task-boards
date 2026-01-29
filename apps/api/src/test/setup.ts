import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

const ensureEnv = () => {
  if (!process.env.CORS_ORIGIN) {
    process.env.CORS_ORIGIN = 'http://localhost:3000';
  }
  if (!process.env.MONGO_URI) {
    process.env.MONGO_URI = 'mongodb://localhost:27017/test';
  }
};

ensureEnv();

let mongo: MongoMemoryServer;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

afterEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (const collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongo.stop();
});
