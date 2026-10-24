import {all,one,stmt,database,member,field,fail} from '../lib/server.ts';
import {publicPeople} from './public-people.mjs';
const prefix='network_profile:';
export async function networkPeople(people,user){
 const rows=await all("SELECT key,value FROM settings WHERE key LIKE 'network_profile:%'");
 const metadata=new Map(rows.map(row=>[row.key.slice(prefix.length),JSON.parse(row.value)]));
 const enrich=person=>({...person,...(metadata.get(person.id)||{})});
 const enriched=people.map(enrich);
 const names=new Set(enriched.filter(p=>p.public_profile).map(p=>p.name.toLowerCase().replace(/\./g,'').trim()));
 const directory=[...publicPeople.filter(p=>!names.has(p.name.toLowerCase().replace(/\./g,'').trim())),...enriched];
 const first=directory.findIndex(p=>p.public_profile&&(p.group||'community')==='community'&&p.name.toLowerCase().replace(/\./g,'').trim()==='chimney y');
 if(first>0)directory.unshift(...directory.splice(first,1));
 return {people:directory,user:user?enrich(user):null};
}
export async function networkAction(action,b,user){
 if(action!=='saveNetworkProfile')return null;
 const actor=member(user);
 if(b.id&&b.id!==actor.id)fail(403,'You can only edit your own card.');
 if(!Array.isArray(b.identities)||b.identities.length>6)fail(400,'Choose up to six identities.');
 const identities=[...new Set(b.identities.map(item=>field(item,'Identity',40)))];
 if(typeof b.public_profile!=='boolean')fail(400,'Choose whether your card is public.');
 const existing=await one('SELECT value FROM settings WHERE key=?',prefix+actor.id);
 const previous=existing?JSON.parse(existing.value):{};
 const bio=field(b.bio??previous.bio??actor.bio??'','Introduction',600,0);
 // Group and photo are preserved; members cannot promote themselves to Advisor.
 const profile={...previous,bio,identities};
 await database().batch([
  stmt('INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value',prefix+actor.id,JSON.stringify(profile)),
  stmt('UPDATE users SET public_profile=? WHERE id=?',Number(b.public_profile),actor.id)
 ]);
 return Response.json({ok:true,profile:{...actor,...profile,public_profile:Number(b.public_profile)}},{headers:{'Cache-Control':'no-store'}});
}
