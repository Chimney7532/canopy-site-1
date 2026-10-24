import {database,one,stmt} from '../lib/server.ts';

// Requested timeline examples: one-time, editable, and safe to archive later.
export async function ensureCalendarPreview(){
 const key='calendar_preview_oct_2026_v1';
 if(await one('SELECT 1 FROM settings WHERE key=?',key))return;
 const now=new Date().toISOString();
 const samples=[
  ['sample-april-introductions','2026-04-11','First introductions','An afternoon to meet people and trade ideas.','/assets/images/community-cover.jpg'],
  ['sample-april-work','2026-04-25','Work in progress','Bring something you’re still figuring out.',null],
  ['sample-july-table','2026-07-11','Summer open table','Good food, new faces, and time to talk.','/assets/images/community-cover.jpg'],
  ['sample-july-show','2026-07-25','Show what you’re making','A few demos. A few questions. No polished pitch needed.',null],
  ['sample-february-ideas','2027-02-06','New year, new ideas','Share what you want to work on next.',null],
  ['sample-february-collaborators','2027-02-20','Meet your next collaborator','Meet people interested in building together.','/assets/images/community-cover.jpg']
 ];
 const details=JSON.stringify({layout:'cover',blocks:[{type:'text',heading:'A calendar preview',body:'This is a sample event for trying out the Canopy calendar. The date and description are placeholders, not a confirmed event.'}]});
 await database().batch([
  ...samples.map(values=>stmt(`INSERT OR IGNORE INTO site_events(id,date,title,description,image_url,status,is_sample,created_at,updated_at,details_json)
   SELECT ?,?,?,?,?,'published',1,?,?,? WHERE NOT EXISTS(SELECT 1 FROM settings WHERE key=?)`,...values,now,now,details,key)),
  stmt('INSERT OR IGNORE INTO settings(key,value) VALUES(?,?)',key,now)
 ]);
}
