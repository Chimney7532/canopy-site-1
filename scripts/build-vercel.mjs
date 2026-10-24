import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.resolve(root, '.vercel/output');
// Only replace this deployment's generated output, never source or releases.
if (output !== path.join(root, '.vercel', 'output')) throw Error('Unexpected output directory.');
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(path.join(root, 'public'), path.join(output, 'static'), { recursive: true });
const html = await readFile(path.join(root, 'site/index.html'), 'utf8');
await writeFile(path.join(output, 'static/index.html'), html);

for (const name of ['forum', 'events', 'content']) {
  const target = path.join(output, 'functions', 'api', `${name}.func`);
  await mkdir(target, { recursive: true });
  await build({
    stdin: {
      contents: `import { createHandler } from './server/vercel-api.mjs'; export default createHandler('${name}');`,
      resolveDir: root, sourcefile: `${name}-entry.mjs`,
    },
    bundle: true, platform: 'node', target: 'node22', format: 'esm',
    outfile: path.join(target, 'index.mjs'),
    banner: { js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);" },
  });
  await writeFile(path.join(target, '.vc-config.json'), JSON.stringify({
    runtime: 'nodejs22.x', handler: 'index.mjs', launcherType: 'Nodejs', maxDuration: 30,
  }, null, 2));
}

const aliases = {
  explore: 'home', about: 'home', events: 'events', projects: 'projects', people: 'people',
  members: 'members', room: 'members', register: 'join', interest: 'connect',
};
await writeFile(path.join(output, 'config.json'), JSON.stringify({
  version: 3,
  routes: [
    { src: '/(.*)', headers: { 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'same-origin' }, continue: true },
    ...Object.entries(aliases).map(([from, to]) => ({ src: `/${from}/?`, headers: { Location: `/#${to}` }, status: 308 })),
    { handle: 'filesystem' },
    { src: '/api/.*', status: 404 },
    { src: '/.*', dest: '/index.html' },
  ],
}, null, 2));
console.log('Vercel output ready: shared Canopy pages, assets, and public API.');
