import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from 'express';
import { createSignupRouter } from './signup.js';

let mongoServer;
let sentOtps = [];

const SignupSubmissionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  whatsappNumber: { type: String, default: '' },
  passwordHash: { type: String, required: true },
  verified: { type: Boolean, default: false },
  role: { type: String, enum: ['user', 'hr', 'admin'], default: 'user' },
  otp: { type: String, default: '' },
  otpExpiry: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});
const SignupSubmission =
  mongoose.models.SignupSubmission || mongoose.model('SignupSubmission', SignupSubmissionSchema);

async function connectMongo() {
  return mongoose.connection;
}

async function sendOtpEmail(email, otp) {
  sentOtps.push({ email, otp });
}

function makeServer() {
  const app = express();
  app.use(express.json());
  app.use('/api/signup', createSignupRouter({ SignupSubmission, connectMongo, sendOtpEmail }));
  return http.createServer(app);
}

function postSignup(server, body) {
  const { port } = server.address();
  return fetch(`http://127.0.0.1:${port}/api/signup`, {
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
  await mongoServer.stop();
});

beforeEach(async () => {
  sentOtps = [];
  await SignupSubmission.deleteMany({});
});

test('rejects missing required fields', async () => {
  const server = makeServer();
  await new Promise((r) => server.listen(0, r));
  try {
    const res = await postSignup(server, {});
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.ok, false);
  } finally {
    server.close();
  }
});

test('rejects weak password', async () => {
  const server = makeServer();
  await new Promise((r) => server.listen(0, r));
  try {
    const res = await postSignup(server, { name: 'A', email: 'a@b.com', phone: '123', password: 'short' });
    assert.equal(res.status, 400);
  } finally {
    server.close();
  }
});

test('rejects invalid email', async () => {
  const server = makeServer();
  await new Promise((r) => server.listen(0, r));
  try {
    const res = await postSignup(server, { name: 'A', email: 'not-an-email', phone: '123', password: 'longenough' });
    assert.equal(res.status, 400);
  } finally {
    server.close();
  }
});

test('creates account and sends OTP', async () => {
  const server = makeServer();
  await new Promise((r) => server.listen(0, r));
  try {
    const res = await postSignup(server, { name: 'Jane', email: 'jane@test.com', phone: '999', password: 'longenough' });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.ok, true);
    assert.equal(body.requiresVerification, true);

    const saved = await SignupSubmission.findOne({ email: 'jane@test.com' });
    assert.ok(saved);
    assert.notEqual(saved.passwordHash, 'longenough');
    assert.ok(saved.otp.length === 6);
    assert.equal(sentOtps.length, 1);
    assert.equal(sentOtps[0].email, 'jane@test.com');
  } finally {
    server.close();
  }
});

test('updates unverified existing account instead of duplicate', async () => {
  const server = makeServer();
  await new Promise((r) => server.listen(0, r));
  try {
    const payload = { name: 'Jane', email: 'jane@test.com', phone: '999', password: 'longenough' };
    await postSignup(server, payload);
    const first = await SignupSubmission.findOne({ email: 'jane@test.com' });

    const res = await postSignup(server, { ...payload, name: 'Jane Doe', password: 'newerpass1' });
    assert.equal(res.status, 200);

    const count = await SignupSubmission.countDocuments({ email: 'jane@test.com' });
    assert.equal(count, 1);
    const updated = await SignupSubmission.findOne({ email: 'jane@test.com' });
    assert.equal(updated.name, 'Jane Doe');
    assert.notEqual(updated.passwordHash, first.passwordHash);
  } finally {
    server.close();
  }
});

test('rejects verified duplicate with 409', async () => {
  const server = makeServer();
  await new Promise((r) => server.listen(0, r));
  try {
    const payload = { name: 'Jane', email: 'jane@test.com', phone: '999', password: 'longenough' };
    await postSignup(server, payload);
    await SignupSubmission.updateOne({ email: 'jane@test.com' }, { $set: { verified: true } });

    const res = await postSignup(server, payload);
    assert.equal(res.status, 409);
  } finally {
    server.close();
  }
});

test('links whatsapp number when requested', async () => {
  const server = makeServer();
  await new Promise((r) => server.listen(0, r));
  try {
    const res = await postSignup(server, {
      name: 'Jane', email: 'jane@test.com', phone: '999', password: 'longenough',
      connectWhatsapp: true, whatsappNumber: '888',
    });
    assert.equal(res.status, 200);
    const saved = await SignupSubmission.findOne({ email: 'jane@test.com' });
    assert.equal(saved.whatsappNumber, '888');
  } finally {
    server.close();
  }
});

test('stores a provided role and defaults to user', async () => {
  const server = makeServer();
  await new Promise((r) => server.listen(0, r));
  try {
    const res = await postSignup(server, {
      name: 'Jane', email: 'jane@test.com', phone: '999', password: 'longenough', role: 'hr',
    });
    assert.equal(res.status, 200);
    const saved = await SignupSubmission.findOne({ email: 'jane@test.com' });
    assert.equal(saved.role, 'hr');

    const res2 = await postSignup(server, {
      name: 'Bob', email: 'bob@test.com', phone: '111', password: 'longenough',
    });
    assert.equal(res2.status, 200);
    const saved2 = await SignupSubmission.findOne({ email: 'bob@test.com' });
    assert.equal(saved2.role, 'user');
  } finally {
    server.close();
  }
});

test('ignores an invalid role and defaults to user', async () => {
  const server = makeServer();
  await new Promise((r) => server.listen(0, r));
  try {
    const res = await postSignup(server, {
      name: 'Jane', email: 'jane@test.com', phone: '999', password: 'longenough', role: 'superuser',
    });
    assert.equal(res.status, 200);
    const saved = await SignupSubmission.findOne({ email: 'jane@test.com' });
    assert.equal(saved.role, 'user');
  } finally {
    server.close();
  }
});
