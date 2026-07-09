import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from 'express';
import { createSigninRouter } from './signin.js';

let mongoServer;
const accounts = [];

const SignupSubmissionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  whatsappNumber: { type: String, default: '' },
  passwordHash: { type: String, required: true },
  verified: { type: Boolean, default: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  otp: { type: String, default: '' },
  otpExpiry: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});
const SignupSubmission =
  mongoose.models.SignupSubmission || mongoose.model('SignupSubmission', SignupSubmissionSchema);

async function connectMongo() {
  return mongoose.connection;
}

function signJwt(account) {
  return `jwt:${account.email}`;
}

async function seedAccount({ email, password, verified = true, name = 'Jane', phone = '999' } = {}) {
  const passwordHash = await bcrypt.hash(password, 10);
  const doc = await SignupSubmission.create({
    name, email, phone, passwordHash, verified,
  });
  accounts.push(doc);
  return doc;
}

function makeServer() {
  const app = express();
  app.use(express.json());
  app.use('/api/signin', createSigninRouter({ SignupSubmission, connectMongo, signJwt }));
  return http.createServer(app);
}

function postSignin(server, body) {
  const { port } = server.address();
  return fetch(`http://127.0.0.1:${port}/api/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

before(async () => {
  mongoServer = await MongoMemoryServer.create({ instance: { launchTimeout: 180000 } });
  await mongoose.connect(mongoServer.getUri());
});

after(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

beforeEach(async () => {
  await SignupSubmission.deleteMany({});
  accounts.length = 0;
});

test('rejects missing fields', async () => {
  const server = makeServer();
  await new Promise((r) => server.listen(0, r));
  try {
    assert.equal((await postSignin(server, {})).status, 400);
    assert.equal((await postSignin(server, { email: 'x@y.com' })).status, 400);
    assert.equal((await postSignin(server, { password: 'pw' })).status, 400);
  } finally {
    server.close();
  }
});

test('rejects unknown account with 401', async () => {
  const server = makeServer();
  await new Promise((r) => server.listen(0, r));
  try {
    const res = await postSignin(server, { email: 'nobody@test.com', password: 'whatever123' });
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.ok, false);
  } finally {
    server.close();
  }
});

test('rejects wrong password with 401', async () => {
  const server = makeServer();
  await new Promise((r) => server.listen(0, r));
  try {
    await seedAccount({ email: 'jane@test.com', password: 'correct123' });
    const res = await postSignin(server, { email: 'jane@test.com', password: 'wrongpassword' });
    assert.equal(res.status, 401);
  } finally {
    server.close();
  }
});

test('rejects unverified account with 403 and requiresVerification', async () => {
  const server = makeServer();
  await new Promise((r) => server.listen(0, r));
  try {
    await seedAccount({ email: 'jane@test.com', password: 'correct123', verified: false });
    const res = await postSignin(server, { email: 'jane@test.com', password: 'correct123' });
    assert.equal(res.status, 403);
    const body = await res.json();
    assert.equal(body.requiresVerification, true);
  } finally {
    server.close();
  }
});

test('signs in verified account and returns token + user', async () => {
  const server = makeServer();
  await new Promise((r) => server.listen(0, r));
  try {
    await seedAccount({ email: 'jane@test.com', password: 'correct123', name: 'Jane Doe', phone: '555' });
    const res = await postSignin(server, { email: 'jane@test.com', password: 'correct123' });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.ok, true);
    assert.equal(body.token, 'jwt:jane@test.com');
    assert.equal(body.user.email, 'jane@test.com');
    assert.equal(body.user.name, 'Jane Doe');
    assert.equal(body.user.phone, '555');
    assert.equal(body.user.verified, true);
    assert.equal(body.user.role, 'user');
  } finally {
    server.close();
  }
});

test('matches email case-insensitively', async () => {
  const server = makeServer();
  await new Promise((r) => server.listen(0, r));
  try {
    await seedAccount({ email: 'Jane@Test.com', password: 'correct123' });
    const res = await postSignin(server, { email: 'jane@test.com', password: 'correct123' });
    assert.equal(res.status, 200);
  } finally {
    server.close();
  }
});
