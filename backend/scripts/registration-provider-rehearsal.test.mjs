import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { Buffer } from 'node:buffer';
import { readPrivateLine, emailAuthorization } from './registration-provider-rehearsal.mjs';

function terminal() {
  const input = new EventEmitter(); input.isTTY = true; input.isRaw = false;
  input.setRawMode = (value) => { input.isRaw = value; };
  input.isPaused = () => true; input.resume = () => undefined; input.pause = () => undefined;
  let transcript = ''; const output = { isTTY: true, write: (value) => { transcript += value; } };
  return { input, output, transcript: () => transcript };
}
test('private terminal input never echoes the entered value and restores raw mode', async () => {
  const io = terminal(); const result = readPrivateLine('Private: ', io.input, io.output);
  io.input.emit('data', Buffer.from('synthetic-secret\r'));
  assert.equal(await result, 'synthetic-secret'); assert.equal(io.transcript(), 'Private: \n');
  assert.equal(io.input.isRaw, false); assert.equal(io.input.listenerCount('data'), 0);
});
test('interruption clears private input and removes terminal listeners', async () => {
  const io = terminal(); const result = readPrivateLine('Private: ', io.input, io.output);
  io.input.emit('data', Buffer.from('synthetic-secret\u0003'));
  await assert.rejects(result, /interrupted/); assert.equal(io.input.isRaw, false);
  assert.equal(io.input.listenerCount('data'), 0); assert.equal(io.input.listenerCount('error'), 0);
  assert.equal(io.transcript(), 'Private: \n');
});
test('nonterminal input cannot receive codes through a pipe', async () => {
  const io = terminal(); io.input.isTTY = false;
  await assert.rejects(readPrivateLine('Private: ', io.input, io.output), /local terminal/);
  assert.equal(io.transcript(), ''); assert.equal(io.input.listenerCount('data'), 0);
});
test('email proof extraction refuses another destination, duplicate proof or added parameters', () => {
  const proof = 'A'.repeat(43); const configured = 'aayuva://verify-email';
  assert.equal(emailAuthorization(configured + '?authorization=' + proof, configured), proof);
  assert.equal(emailAuthorization(proof, configured), proof);
  for (const link of ['https://other.example/?authorization=' + proof, configured + '?authorization=' + proof + '&extra=1', configured + '?authorization=' + proof + '&authorization=' + proof, configured + '?authorization=' + proof + '#fragment']) {
    assert.throws(() => emailAuthorization(link, configured), /Invalid verification link/);
  }
});
