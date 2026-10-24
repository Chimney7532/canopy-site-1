import {one,run,currentUser,admin,field,fail} from '../lib/server.ts';
const key='homepage_content_v1';
const json=data=>Response.json(data,{headers:{'Cache-Control':'no-store'}});
const initial={revision:0,draft:null,published:null};
async function state(){const row=await one('SELECT value FROM settings WHERE key=?',key);return row?JSON.parse(row.value):initial;}
function url(raw,label,required=false){const value=field(raw??'',label,2000,required?1:0);if(!value)return '';try{const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password)throw 0;return u.href;}catch{fail(400,`Use a full https:// ${label.toLowerCase()}.`);}}
export function validateContent(b){
 if(!['article','video'].includes(b.format))fail(400,'Choose Article or Video.');
 const item={id:'homepage-feature',format:b.format,title:field(b.title,'Title',160),panelTitle:field(b.title,'Title',160),excerpt:field(b.excerpt??'','Description',600,0),author:'Canopy',label:'From Canopy',source:{type:'editorial',roomId:null}};
 if(b.format==='article'){const body=field(b.body,'Article',16000);item.paragraphs=body.split(/\n\s*\n/).filter(Boolean);}else{item.video={src:url(b.videoUrl,'Video link',true),poster:url(b.poster,'Cover image')};const u=new URL(item.video.src),h=u.hostname.replace(/^www\./,'');
  if(['youtube.com','youtu.be','m.youtube.com'].includes(h)){const id=h==='youtu.be'?u.pathname.slice(1):u.searchParams.get('v')||u.pathname.match(/^\/(?:shorts|embed)\/([^/]+)/)?.[1];if(!/^[\w-]{11}$/.test(id||''))fail(400,'Use a YouTube video link.');item.video.embed='https://www.youtube-nocookie.com/embed/'+id;}
  else if(h==='vimeo.com'||h==='player.vimeo.com'){const id=u.pathname.match(/(?:^\/|\/video\/)(\d+)(?:\/|$)/)?.[1];if(!id)fail(400,'Use a Vimeo video link.');item.video.embed='https://player.vimeo.com/video/'+id;}
  else if(!/\.(mp4|webm|m4v|mov)$/i.test(u.pathname))fail(400,'Use a YouTube, Vimeo, MP4 or WebM video link.');
 }
 return item;
}
export async function publicContent(req){const [data,u]=await Promise.all([state(),currentUser(req)]);return json({item:data.published,canManage:u?.role==='admin'&&u?.status==='active'});}
export async function contentAction(action,b,u){
 if(!['getHomepageContent','saveHomepageContent'].includes(action))return null;
 admin(u);const previous=await state();
 if(action==='getHomepageContent')return json(previous);
 if(!['draft','publish'].includes(b.intent))fail(400,'Choose Save draft or Publish.');
 if(b.revision!==previous.revision)fail(409,'This panel changed in another session. Reopen the editor before saving.');
 const item=validateContent(b),next={revision:previous.revision+1,draft:item,published:b.intent==='publish'?item:previous.published,updatedAt:new Date().toISOString()};
 await run('INSERT OR IGNORE INTO settings(key,value) VALUES(?,?)',key,JSON.stringify(initial));
 const result=await run('UPDATE settings SET value=? WHERE key=? AND value=?',JSON.stringify(next),key,JSON.stringify(previous));
 if(!result.meta?.changes)fail(409,'This panel changed in another session. Reopen the editor before saving.');
 return json(next);
}
