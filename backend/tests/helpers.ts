import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { createApp } from '../src/create-app';
import { Admin } from '../src/models/admin.model';
import { hashPassword } from '../src/services/auth.service';

let mongo: MongoMemoryServer | undefined;

export const ADMIN = { email: 'admin@example.test', password: 'Correct-Horse-9-Battery' };

export async function startDb() {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  await mongoose.connection.syncIndexes();
}

export async function stopDb() {
  await mongoose.disconnect();
  await mongo?.stop();
}

export async function clearDb() {
  const collections = await mongoose.connection.db!.collections();
  await Promise.all(collections.map((collection) => collection.deleteMany({})));
}

export const app = createApp();

export async function createAdmin() {
  return Admin.create({ email: ADMIN.email, name: 'Test Admin', passwordHash: await hashPassword(ADMIN.password) });
}

/** A supertest agent that keeps the session cookie across requests. */
export async function loggedInAgent() {
  await createAdmin();
  const agent = request.agent(app);
  const res = await agent.post('/api/v1/auth/login').send(ADMIN);
  if (res.status !== 200) throw new Error(`Login failed in test setup: ${res.status}`);
  return agent;
}

export const API = '/api/v1';
