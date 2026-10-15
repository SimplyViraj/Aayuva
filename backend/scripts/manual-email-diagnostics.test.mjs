import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createManualEmailFetch } from './manual-email-diagnostics.mjs';
import { ResendRegistrationEmail } from '../dist/modules/auth/providers/resend-registration.js';

const settings = { apiKey: 'private-key-canary', sender: 'onboarding@resend.dev', verificationUrl: 'aayuva://verify-email' };
const send = (fetcher) => new ResendRegistrationEmail(settings, fetcher).send('member@example.test', 'private-proof-canary', 'fixture');
const reply = (status, value) => new globalThis.Response(JSON.stringify(value), { status });

test('successful delivery keeps its response body and never emits a diagnostic', async () => {
  const events = []; let requests = 0;
  await send(createManualEmailFetch(async () => { requests++; return reply(200, { id: 'fixture' }); }, (event) => events.push(event)));
  assert.equal(requests, 1); assert.deepEqual(events, []);
});

test('provider sender and recipient rejections expose fixed categories only', async () => {
  for (const [message, reason] of [
    ['You can only send testing emails to your own email address (private-recipient-canary).', 'test_recipient_restricted'],
    ['The private-domain-canary domain is not verified.', 'sender_domain_unverified'],
  ]) {
    const events = [];
    await assert.rejects(send(createManualEmailFetch(async () => reply(403, { name: 'validation_error', message }), (event) => events.push(event))), { message: 'Service Unavailable' });
    assert.deepEqual(events, [{ status: 403, reason }]);
    assert.doesNotMatch(JSON.stringify(events), /canary/);
  }
});

test('key, throttling and malformed or oversized errors remain bounded and generic', async () => {
  for (const [status, body, reason] of [
    [401, '{}', 'api_key_rejected'],
    [403, JSON.stringify({ name: 'restricted_api_key', message: 'private-key-canary' }), 'api_key_rejected'],
    [429, '{}', 'provider_rate_limited'],
    [502, 'private-non-json-canary', 'provider_rejected'],
    [403, 'x'.repeat(65_537), 'provider_rejected'],
  ]) {
    const events = [];
    await assert.rejects(send(createManualEmailFetch(async () => new globalThis.Response(body, { status }), (event) => events.push(event))), { message: 'Service Unavailable' });
    assert.deepEqual(events, [{ status, reason }]);
  }
});

test('transport exceptions are sanitized without retrying the request', async () => {
  const events = []; let requests = 0;
  await assert.rejects(send(createManualEmailFetch(async () => { requests++; throw new Error('private-transport-canary'); }, (event) => events.push(event))), { message: 'Service Unavailable' });
  assert.equal(requests, 1); assert.deepEqual(events, [{ status: null, reason: 'transport_unavailable' }]);
});

test('a failing diagnostic observer cannot change the adapter error contract', async () => {
  await assert.rejects(send(createManualEmailFetch(async () => reply(403, {}), () => { throw new Error('private-observer-canary'); })), { message: 'Service Unavailable' });
});
