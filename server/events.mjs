import {ensurePublicEvents} from './event-bootstrap.mjs';
import {all,one,run,currentUser,admin,field,fail,uid} from '../lib/server.ts';
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export function validateEvent(input){
 const title=field(input.title,'Name',160),date=field(input.date,'Date',10);
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||date<'1000-01-01'||!Number.isFinite(Date.parse(date+'T12:00:00Z'))||new Date(date+'T12:00:00Z').toISOString().slice(0,10)!==date)fail(400,'Choose a valid calendar date.');
 const description=field(input.description??'','Introduction',600,0);
 const safeURL=(raw,label,local=false)=>{
  const value=field(raw??'',label,2000,0);if(!value)return null;
  if(local&&/^\/assets\/(?:images\/)?[a-zA-Z0-9_.-]+\.(?:jpg|jpeg|png|webp|gif|svg)$/i.test(value))return value;
  try{const url=new URL(value);if(!['http:','https:'].includes(url.protocol)||url.username||url.password||!url.hostname)throw 0;return url.href;}catch{fail(400,`Use a full http:// or https:// ${label.toLowerCase()}.`);}
 };
 const url=safeURL(input.url,'Link'),image=safeURL(input.image,'Image link',true);
 const focus=key=>{const n=input[key]??50;if(typeof n!=='number'||!Number.isFinite(n)||n<0||n>100)fail(400,'Image focus must be between 0 and 100.');return n;};
 const status=input.status??'draft';if(!['draft','published','archived'].includes(status))fail(400,'Choose a valid publication status.');
 let details;
 if(input.details!==undefined){
  const raw=input.details;if(!raw||typeof raw!=='object'||Array.isArray(raw))fail(400,'Choose valid event details.');
  const layout=raw.layout||'cover';if(!['cover','editorial'].includes(layout))fail(400,'Choose a valid page layout.');
  const links=raw.links??[];if(!Array.isArray(links)||links.length>6)fail(400,'Use up to 6 event links.');
  const blocks=raw.blocks??[];if(!Array.isArray(blocks)||blocks.length>12)fail(400,'Use up to 12 content sections.');
  details={layout,links:links.map(link=>{if(!link||typeof link!=='object')fail(400,'Choose a valid event link.');const url=safeURL(link.url,'Event link');if(!url)fail(400,'Enter an event link.');return {label:field(link.label,'Link label',80),url};}),time:field(raw.time??'','Time',100,0),venue:field(raw.venue??'','Location',240,0),blocks:blocks.map(block=>{
   if(!block||!['text','image','split','quote'].includes(block.type))fail(400,'Choose a valid section type.');
   return {type:block.type,heading:field(block.heading??'','Section heading',160,0),body:field(block.body??'','Section text',4000,0),image:safeURL(block.image,'Section image',true),caption:field(block.caption??'','Image caption',300,0)};
  })};
  if(JSON.stringify(details).length>20000)fail(400,'Keep event details under 20,000 characters.');
 }
 return {title,date,description:description||null,url,image,imageX:focus('imageX'),imageY:focus('imageY'),status,details};
}
const event=row=>({id:row.id,date:row.date,title:row.title,description:row.description,url:row.url,image:row.image_url,imageX:row.image_x,imageY:row.image_y,status:row.status,sample:!!row.is_sample,revision:row.revision,createdAt:row.created_at,updatedAt:row.updated_at,details:JSON.parse(row.details_json||'{}')});
export async function publicEvents(req){await ensurePublicEvents();const u=await currentUser(req);return json({events:(await all("SELECT * FROM site_events WHERE status='published' ORDER BY date,id")).map(event),canManage:u?.role==='admin'&&u?.status==='active'});}
export async function eventAction(action,b,u){
 if(!['listEvents','saveEvent'].includes(action))return null;
 admin(u);
 await ensurePublicEvents();
 if(action==='listEvents')return json({events:(await all('SELECT * FROM site_events ORDER BY date,id')).map(event)});
 const data=validateEvent(b),id=b.id?field(b.id,'Event',80):uid(),time=new Date().toISOString();
 const previous=b.id?await one('SELECT revision,details_json FROM site_events WHERE id=?',id):null;
 const details=JSON.stringify(data.details??(previous?JSON.parse(previous.details_json):{}));
 const args=[data.date,data.title,data.description,data.url,data.image,data.imageX,data.imageY,data.status,time,details];
 if(b.id){
  if(!previous)fail(404,'Event not found.');
  if(!Number.isInteger(b.revision)||b.revision!==previous.revision)fail(409,'This event changed in another session. Reopen it before saving.');
  const result=await run('UPDATE site_events SET date=?,title=?,description=?,url=?,image_url=?,image_x=?,image_y=?,status=?,updated_at=?,details_json=?,is_sample=0,revision=revision+1 WHERE id=? AND revision=?',...args,id,b.revision);
  if(!result.meta?.changes)fail(409,'This event changed in another session. Reopen it before saving.');
 }else await run('INSERT INTO site_events(date,title,description,url,image_url,image_x,image_y,status,updated_at,details_json,id,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)',...args,id,time);
 return json({event:event(await one('SELECT * FROM site_events WHERE id=?',id))},b.id?200:201);
}
