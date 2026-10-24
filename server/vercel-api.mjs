import { createHmac } from 'node:crypto';
import { put, list, head } from '@vercel/blob';
import { publicPeople } from './public-people.mjs';
import { handoffEvents } from './event-handoff-data.mjs';
import { validateIntroductionProfile } from './introduction-profile.mjs';

const fail = (status, message) => { throw Object.assign(new Error(message), { status }); };
const field = (value, label, max, min = 1) => {
  if (typeof value !== 'string' || value.trim().length < min || value.trim().length > max) fail(400, `Check ${label.toLowerCase()}.`);
  return value.trim();
};
const json = (res, status, data, head = false) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.end(head ? undefined : JSON.stringify(data));
};

export function validateApplication(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body) || body.action !== 'joinApplication') fail(400, 'Invalid introduction.');
  const requestId = field(body.requestId, 'Submission', 36);
  if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(requestId)) fail(400, 'Reload and try again.');
  const email = field(body.email, 'Email', 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail(400, 'Use a valid email address.');
  const profile = validateIntroductionProfile(body.profile, { field, fail });
  if (![2, 3].includes(profile.version)) fail(400, 'Invalid introduction format.');
  return {
    requestId: requestId.toLowerCase(), name: field(body.name, 'Name', 80), email,
    organization: field(body.organization ?? '', 'Organization', 160, 0),
    introduction: field(body.introduction ?? '', 'Introduction', 1500), profile,
    kind: profile.version === 3 ? 'connect' : 'join',
  };
}

async function saveApplication(application, req) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  const storeId = process.env.BLOB_STORE_ID;
  if (!token && !storeId) fail(503, 'Introductions are temporarily unavailable. Your draft is safe; please try again later.');
  // A project-connected store uses Vercel OIDC; no persistent write token is needed.
  const auth = token ? { token } : {};
  // Only Vercel supplies this header in production. Never retain a raw IP address.
  const ip = req.headers['x-vercel-forwarded-for'] || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  const day = new Date().toISOString().slice(0, 10);
  const bucket = createHmac('sha256', token || storeId).update(`${day}:${ip}`).digest('hex').slice(0, 32);
  const prefix = `applications/${day}/${bucket}/`;
  const pathname = `${prefix}${application.requestId}.json`;
  const existing = await list({ prefix, limit: 31, ...auth });
  if (existing.blobs.some(blob => blob.pathname === pathname)) return;
  if (existing.blobs.length >= 30) fail(429, 'Too many introductions today. Please try again later.');
  try {
    await put(pathname, JSON.stringify({ ...application, createdAt: new Date().toISOString() }), {
      access: 'private', ...auth, contentType: 'application/json',
      addRandomSuffix: false, allowOverwrite: false,
    });
  } catch (error) {
    // A simultaneous retry may have created this exact receipt already.
    try { await head(pathname, auth); } catch { throw error; }
  }
}

export function createHandler(resource, dependencies = {}) {
  const save = dependencies.saveApplication ?? saveApplication;
  return async (req, res) => {
    try {
      if (req.method === 'GET' || req.method === 'HEAD') {
        const data = resource === 'events'
          ? { events: handoffEvents.map(event => ({ ...event, imageX: 50, status: 'published', sample: false, revision: 1 })), canManage: false }
          : resource === 'content' ? { item: null, canManage: false }
          : { user: null, setup: false, threads: [], people: publicPeople, projects: [], connections: [], messages: [], notifications: [], blocks: [], projectMembers: [], stages: [], tasks: [] };
        return json(res, 200, data, req.method === 'HEAD');
      }
      if (req.method !== 'POST' || resource !== 'forum') {
        res.setHeader('Allow', resource === 'forum' ? 'GET, HEAD, POST' : 'GET, HEAD');
        return json(res, 405, { error: 'Method not allowed.' });
      }
      let origin;
      try { origin = new URL(req.headers.origin); } catch { fail(403, 'This request must come from Canopy.'); }
      if (origin.host !== req.headers.host || !['https:', 'http:'].includes(origin.protocol)) fail(403, 'This request must come from Canopy.');
      if (!String(req.headers['content-type'] ?? '').toLowerCase().startsWith('application/json')) fail(415, 'Use JSON for this introduction.');
      if (Number(req.headers['content-length']) > 25000) fail(413, 'This submission is too large.');
      const chunks = []; let size = 0;
      for await (const chunk of req) {
        const buffer = Buffer.from(chunk); size += buffer.length;
        if (size > 25000) fail(413, 'This submission is too large.');
        chunks.push(buffer);
      }
      let body;
      try { body = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { fail(400, 'Invalid request.'); }
      if (body?.action !== 'joinApplication') fail(403, 'Room is coming soon.');
      await save(validateApplication(body), req);
      return json(res, 201, { ok: true });
    } catch (error) {
      const status = error.status || 503;
      // Storage exceptions can contain URLs or credentials: do not expose or log them.
      return json(res, status, { error: error.status ? error.message : 'Could not save your introduction. Your draft is safe; please try again.' });
    }
  };
}
