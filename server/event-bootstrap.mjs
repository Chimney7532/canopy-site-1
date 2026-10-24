import {database,one,stmt} from '../lib/server.ts';
import {handoffKey,handoffStatements,handoffCoverKey,handoffCoverStatements} from './event-handoff-data.mjs';
async function ensureHandoffEvents(){
 if(!await one('SELECT 1 FROM settings WHERE key=?',handoffKey))await database().batch(handoffStatements(stmt,new Date().toISOString()));
 if(!await one('SELECT 1 FROM settings WHERE key=?',handoffCoverKey))await database().batch(handoffCoverStatements(stmt,new Date().toISOString()));
}
// One-time content initialization, deliberately separate from schema migrations.
// Preserve existing public events; samples are used only for an empty calendar.
export async function ensurePublicEvents(){
 if(await one("SELECT 1 FROM settings WHERE key='public_calendar_v1'")){await ensureHandoffEvents();return;}
 const now=new Date().toISOString();
 await database().batch([
  stmt(`INSERT OR IGNORE INTO site_events(id,date,title,description,status,is_sample,revision,created_at,updated_at,details_json)
   SELECT 'legacy-'||id,substr(starts_at,1,10),title,description,'published',0,1,created_at,?,json_object('venue',location)
   FROM events WHERE visibility='public' AND NOT EXISTS(SELECT 1 FROM settings WHERE key='public_calendar_v1')`,now),
  stmt(`INSERT OR IGNORE INTO site_events(id,date,title,description,image_url,status,is_sample,created_at,updated_at)
   SELECT id,date,title,description,image,'published',1,?,? FROM (
    SELECT 'sample-open-table' id,'2026-10-24' date,'An open table' title,'Meet other members over supper.' description,'/assets/images/community-cover.jpg' image
    UNION ALL SELECT 'sample-ideas','2026-10-31','Bring an unfinished idea','A conversation about what we could make.',NULL
   ) WHERE NOT EXISTS(SELECT 1 FROM site_events) AND NOT EXISTS(SELECT 1 FROM settings WHERE key='public_calendar_v1')`,now,now),
  stmt("INSERT OR IGNORE INTO settings(key,value) VALUES('public_calendar_v1',?)",now)
 ]);
 await ensureHandoffEvents();
}
