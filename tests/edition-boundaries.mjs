// Integration check against a local database with existing QA accounts and content.
import assert from 'node:assert/strict';
const origin = 'http://127.0.0.1:5173';
const email = process.env.CANOPY_TEST_EMAIL;
const password = process.env.CANOPY_TEST_PASSWORD;
assert.ok(email && password, 'Provide credentials for a local QA account.');
const signin = await fetch(origin + '/api', { method: 'POST', headers: { origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'signin', email, password }) });
assert.equal(signin.status, 200);
const cookie = signin.headers.get('set-cookie').split(';')[0];
async function read(view, authenticated) {
  const response = await fetch(origin + '/api?view=' + view, { headers: authenticated ? { cookie } : {} });
  assert.equal(response.status, 200);
  return response.json();
}
try {
  const member = await read('members', true);
  assert.equal(member.user.status, 'active');
  assert.ok(member.posts.some(p => p.visibility !== 'public'), 'Fixture must contain private content.');
  assert.ok(member.people.some(p => !p.public_profile), 'Fixture must contain a private profile.');
  const guest = await read('public', false);
  const website = await read('public', true);
  const privateArrays = ['messages', 'connections', 'notifications', 'votes', 'rsvps', 'interested', 'blocks', 'tasks', 'stages', 'projectMembers', 'comments', 'polls', 'options'];
  for (const result of [guest, website, await read('members', false)]) {
    for (const key of privateArrays) assert.deepEqual(result[key], [], key + ' must stay internal');
    assert.equal(result.admin, null);
    assert.ok(result.posts.every(p => p.published && p.visibility === 'public' && ['announcement', 'update', 'testimonial'].includes(p.kind)));
    assert.ok(result.events.every(e => e.visibility === 'public'));
    assert.ok(result.projects.every(p => p.visibility === 'public'));
    assert.ok(result.people.every(p => p.public_profile));
    assert.ok(result.posts.every(p => p.comment_count === 0 && p.interest_count === 0));
  }
  assert.deepEqual({ ...website, user: null }, guest, 'Signed-in website has the same public content as a guest.');
  console.log('PASS: guest, signed-in website and member boundaries; no internal payload on the website.');
} finally {
  await fetch(origin + '/api', { method: 'POST', headers: { origin, cookie, 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'signout' }) });
}
