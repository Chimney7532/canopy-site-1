import { mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
mkdirSync('.tmp',{recursive:true});
writeFileSync('.tmp/local-database.json',JSON.stringify({
 name:'canopy-local',compatibility_date:'2026-05-15',
 d1_databases:[{binding:'DB',database_name:'site-creator-d1',database_id:'00000000-0000-4000-8000-000000000000',migrations_dir:'../drizzle'}]
}));
const result=spawnSync(process.execPath,['node_modules/wrangler/bin/wrangler.js','d1','migrations','apply','DB','--local','--persist-to','.wrangler/state','--config','.tmp/local-database.json'],{stdio:'inherit',env:{...process.env,WRANGLER_SEND_METRICS:'false'}});
process.exit(result.status??1);
