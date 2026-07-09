import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import express from 'express';
import { createMailRouter } from './mail.js';
import { createDocument, findOne, clearCollection, find } from '../store.js';

const sent = [];

async function sendEmail({ to, subject, text }) {
  sent.push({ to, subject, text });
}

function updateByIdMail(collectionName, id, update) {
  const storeRow = findOne('contacts', { _id: id });
  if (!storeRow) return null;
  const updated = { ...storeRow, ...(update.$set || update) };
  const idx = (find('contacts') || []).findIndex((d) => d._id === id);
  if (idx !== -1) find('contacts')[idx] = updated;
  return updated;
}

function makeServer() {
  const app = express();
  app.use(express.json());
  app.use('/api/mail', createMailRouter({ findOne, updateById: updateByIdMail, find, sendEmail }));
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

function createContact(data) {
  return createDocument('contacts', data);
}

before(() => {
  clearCollection('contacts');
});

after(() => {
  clearCollection('contacts');
});

beforeEach(() => {
  sent.length = 0;
  clearCollection('contacts');
});

test('lists all inquiries newest first', async () => {
  const server = makeServer();
  await new Promise((r) => server.listen(0, r));
  try {
    createContact({ name: 'Old', email: 'old@t.com', message: 'hi' });
    await new Promise((r) => setTimeout(r, 10));
    createContact({ name: 'New', email: 'new@t.com', message: 'yo' });
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
    const c = createContact({ name: 'A', email: 'a@t.com', message: 'hi' });
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
    const c = createContact({ name: 'Ada', email: 'ada@t.com', message: 'question' });
    const res = await post(server, `/api/mail/${c._id}/reply`, { subject: 'Re: question', message: 'We can help!' });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.contact.replied, true);
    assert.equal(data.contact.replies.length, 1);
    assert.equal(sent.length, 1);
    assert.equal(sent[0].to, 'ada@t.com');
    assert.equal(sent[0].subject, 'Re: question');

    const persisted = findOne('contacts', { _id: c._id });
    assert.equal(persisted.replied, true);
    assert.equal(persisted.replies.length, 1);
  } finally {
    server.close();
  }
});
