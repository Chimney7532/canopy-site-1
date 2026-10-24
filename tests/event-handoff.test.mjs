import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,existsSync} from 'node:fs';
import {handoffEvents,handoffStatements,handoffCoverStatements} from '../server/event-handoff-data.mjs';

test('hyphenated migrations can run over a v1 database without changing its records',()=>{
 const db=new DatabaseSync(':memory:');
 const migrations=['0000-daily-smasher.sql','0001-high-the-order.sql'].map(file=>readFileSync(new URL('../drizzle/'+file,import.meta.url),'utf8'));
 for(const sql of migrations)db.exec(sql.replaceAll(' IF NOT EXISTS',''));
 db.exec("INSERT INTO settings(key,value) VALUES('preservation-check','keep this content')");
 const tables=db.prepare("SELECT name,sql FROM sqlite_master WHERE type IN ('table','index') ORDER BY name").all();
 for(let run=0;run<2;run++)for(const sql of migrations)db.exec(sql);
 assert.deepEqual(db.prepare("SELECT name,sql FROM sqlite_master WHERE type IN ('table','index') ORDER BY name").all(),tables);
 assert.equal(db.prepare("SELECT value FROM settings WHERE key='preservation-check'").get().value,'keep this content');
 db.close();
});

test('event handoff archives only samples and preserves subsequent editorial changes',()=>{
 const db=new DatabaseSync(':memory:');
 const schema=readFileSync(new URL('../drizzle/0001-high-the-order.sql',import.meta.url),'utf8');
 db.exec(schema.match(/CREATE TABLE(?: IF NOT EXISTS)? `site_events` \([\s\S]*?\);/)[0]);
 db.exec('CREATE TABLE settings(key TEXT PRIMARY KEY,value TEXT)');
 const insert=db.prepare("INSERT INTO site_events(id,date,title,is_sample,status,created_at,updated_at) VALUES(?,'2026-10-24',?,?,'published','before','before')");
 insert.run('sample-existing','Demo',1);insert.run('editor-existing','Actual event',0);
 const apply=()=>{
  db.exec('BEGIN');
  try{for(const [sql,args] of handoffStatements((sql,...args)=>[sql,args],'2026-10-21'))db.prepare(sql).run(...args);db.exec('COMMIT');}
  catch(e){db.exec('ROLLBACK');throw e;}
 };
 apply();
 assert.equal(db.prepare("SELECT status FROM site_events WHERE id='sample-existing'").get().status,'archived');
 assert.equal(db.prepare("SELECT title FROM site_events WHERE id='editor-existing'").get().title,'Actual event');
 assert.equal(db.prepare("SELECT count(*) n FROM site_events WHERE status='published'").get().n,6);
 db.prepare("UPDATE site_events SET title='Edited later',status='archived',revision=2 WHERE id=?").run(handoffEvents[0].id);
 const before=db.prepare('SELECT * FROM site_events ORDER BY id').all();apply();
 assert.deepEqual(db.prepare('SELECT * FROM site_events ORDER BY id').all(),before);
 db.exec("UPDATE site_events SET image_url=NULL WHERE id!='editor-existing'");
 db.prepare("UPDATE site_events SET image_url='/assets/custom.webp' WHERE id=?").run(handoffEvents[0].id);
 const repair=()=>{for(const [sql,args] of handoffCoverStatements((sql,...args)=>[sql,args],'2026-10-22'))db.prepare(sql).run(...args);};
 repair();
 assert.equal(db.prepare('SELECT image_url FROM site_events WHERE id=?').get(handoffEvents[0].id).image_url,'/assets/custom.webp');
 for(const e of handoffEvents.slice(1,4))assert.equal(db.prepare('SELECT image_url FROM site_events WHERE id=?').get(e.id).image_url,e.image);
 const restored=db.prepare('SELECT * FROM site_events ORDER BY id').all();repair();
 assert.deepEqual(db.prepare('SELECT * FROM site_events ORDER BY id').all(),restored);
 db.close();
});

test('all event media is shipped locally and the unconfirmed three-day event stays explicitly planned',()=>{
 for(const e of handoffEvents){
  assert.equal(new Date(e.date+'T12:00:00Z').toISOString().slice(0,10),e.date);
  for(const src of [e.image,...e.details.blocks.map(b=>b.image)].filter(Boolean))assert.ok(existsSync(new URL('../public'+src,import.meta.url)),src);
 }
 const upcoming=handoffEvents.find(e=>e.id==='stanford-health-hacks-2027');
 assert.match(upcoming.title,/Planned/);assert.match(upcoming.description,/19–21, 2027 \(planned\)/);
 assert.match(upcoming.details.venue,/To be confirmed/);
});
