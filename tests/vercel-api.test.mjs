import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createHandler } from '../server/vercel-api.mjs';

const application = {
  action: 'joinApplication', requestId: '019a0000-1234-4000-8000-123456789abc',
  name: 'Deployment test', email: 'test@example.com', introduction: 'Local validation only.',
  profile: { version: 3, role: 'Builder', links: [] },
};
async function serverFor(t, resource, saveApplication) {
  const server = createServer(createHandler(resource, { saveApplication }));
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
  const url = `http://127.0.0.1:${server.address().port}`;
  return {
    url,
    post: (body, origin = url) => fetch(url, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
  };
}

test('Vercel publishes only the supplied members and events, without management data', async t => {
  const forum = await serverFor(t, 'forum');
  const response = await fetch(forum.url); const state = await response.json();
  assert.equal(state.people.length, 13);
  assert.equal(state.people[0].name, 'Chimney Y.');
  assert.deepEqual(state.threads, []); assert.equal(state.user, null); assert.equal(state.setup, false);
  assert.equal('applications' in state, false);
  const events = await serverFor(t, 'events');
  const calendar = await (await fetch(events.url)).json();
  assert.equal(calendar.events.length, 5); assert.equal(calendar.canManage, false);
  assert.ok(calendar.events.every(event => event.sample === false));
  assert.match(calendar.events.at(-1).title, /Planned/);
});

test('invalid and cross-origin submissions never reach storage', async t => {
  let writes = 0;
  const api = await serverFor(t, 'forum', async () => { writes++; });
  assert.equal((await api.post(application, 'https://other.example')).status, 403);
  assert.equal((await api.post({ ...application, email: 'invalid' })).status, 400);
  assert.equal((await api.post({ ...application, profile: { version: 3, role: 'Builder', links: ['javascript:alert(1)'] } })).status, 400);
  assert.equal((await api.post({ ...application, introduction: 'x'.repeat(26000) })).status, 413);
  assert.equal((await api.post({ action: 'listJoinApplications' })).status, 403);
  assert.equal(writes, 0);
});

test('a receipt is returned only after the complete introduction is persisted', async t => {
  let saved;
  const api = await serverFor(t, 'forum', async value => { saved = value; });
  const response = await api.post(application);
  assert.equal(response.status, 201); assert.deepEqual(await response.json(), { ok: true });
  assert.equal(saved.email, application.email); assert.equal(saved.kind, 'connect');
  assert.equal(saved.requestId, application.requestId);
  assert.deepEqual(saved.profile, application.profile);
});

test('storage errors retain a retryable failure without exposing provider details', async t => {
  const api = await serverFor(t, 'forum', async () => { throw Error('secret-provider-token'); });
  const response = await api.post(application);
  assert.equal(response.status, 503);
  const body = await response.text();
  assert.match(body, /draft is safe/); assert.doesNotMatch(body, /secret-provider-token/);
});
