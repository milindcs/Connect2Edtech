import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from 'express';
import { createMailRouter } from './mail.js';

let mongoServer;
const sent = [];

const ContactSubmissionSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  message: { type: String, default: '' },
  courses: { type: String, default: '' },
  hostname: { type: String, default: '' },
  ip: { type: String, default: '' },
  replied: { type: Boolean, default: false },
  replies: { type: [{ from: String, body: String, at: { type: Date, default: Date.now } }], default: [] },
  createdAt: { type: Date, default: Date.now },
});
const ContactSubmission =
  mongoose.models.ContactSubmission || mongoose.model('ContactSubmission', ContactSubmissionSchema);

async function connectMongo() {
  return mongoose.connection;
}

async function sendEmail({ to, subject, text }) {
  sent.push({ to, subject, text });
}

function makeServer() {
  const app = express();
  app.use(express.json());
  app.use('/api/mail', createMailRouter({ ContactSubmission, connectMongo, sendEmail }));
  return http.createServer(app);
}

function get(server, path) {
  const { port } = server.address();
  return fetch(`http://127.0.0.1:${port}${path}`, { headers: { Authorization: 'Bearer x' } });
}

function post(server, path, body) {
  const { port } = server.address();
  return fetch(`http://127.0.0.1:${port}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer x' },
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
  sent.length = 0;
  await ContactSubmission.deleteMany({});
});

test('lists all inquiries newest first', async () => {
  const server = makeServer();
  await new Promise((r) => server.listen(0, r));
  try {
    await ContactSubmission.create({ name: 'Old', email: 'old@t.com', message: 'hi' });
    await new Promise((r) => setTimeout(r, 10));
    await ContactSubmission.create({ name: 'New', email: 'new@t.com', message: 'yo' });
    const res = await get(server, '/api/mail/');
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.messages.length, 2);
    assert.equal(data.messages[0].name, 'New');
  } finally {
    server.close();
  }
});

test('reply requires subject and message', async () => {
  const server = makeServer();
  await new Promise((r) => server.listen(0, r));
  try {
    const c = await ContactSubmission.create({ name: 'A', email: 'a@t.com', message: 'hi' });
    assert.equal((await post(server, `/api/mail/${c._id}/reply`, { subject: '' })).status, 400);
    assert.equal((await post(server, `/api/mail/${c._id}/reply`, { subject: 's' })).status, 400);
  } finally {
    server.close();
  }
});

test('reply rejects invalid id', async () => {
  const server = makeServer();
  await new Promise((r) => server.listen(0, r));
  try {
    const res = await post(server, '/api/mail/notanid/reply', { subject: 's', message: 'm' });
    assert.equal(res.status, 400);
  } finally {
    server.close();
  }
});

test('reply to missing inquiry returns 404', async () => {
  const server = makeServer();
  await new Promise((r) => server.listen(0, r));
  try {
    const res = await post(server, '/api/mail/64b2f0c2c2a4f0c2c2a4f0c2/reply', { subject: 's', message: 'm' });
    assert.equal(res.status, 404);
  } finally {
    server.close();
  }
});

test('sends reply email and records it', async () => {
  const server = makeServer();
  await new Promise((r) => server.listen(0, r));
  try {
    const c = await ContactSubmission.create({ name: 'Ada', email: 'ada@t.com', message: 'question' });
    const res = await post(server, `/api/mail/${c._id}/reply`, { subject: 'Re: question', message: 'We can help!' });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.contact.replied, true);
    assert.equal(data.contact.replies.length, 1);
    assert.equal(sent.length, 1);
    assert.equal(sent[0].to, 'ada@t.com');
    assert.equal(sent[0].subject, 'Re: question');

    const persisted = await ContactSubmission.findById(c._id);
    assert.equal(persisted.replied, true);
    assert.equal(persisted.replies.length, 1);
  } finally {
    server.close();
  }
});
