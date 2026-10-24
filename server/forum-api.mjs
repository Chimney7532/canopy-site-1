import {publicContent,contentAction} from './content.mjs';
import {publicEvents,eventAction} from './events.mjs';
import {validateJoinProfile} from './join-profile.mjs';
import {networkPeople,networkAction} from './people.mjs';
import {GET as legacyGET,POST as legacyPOST} from '../app/api/route.ts';
import {all,one,run,stmt,database,currentUser,member,admin,getPost,getProject,canSeePost,uid,field,email,passwordHash,session,rate,notify,fail,HttpError} from '../lib/server.ts';
const json=(data,status=200,cookie)=>Response.json(data,{status,headers:{'Cache-Control':'no-store',...(cookie?{'Set-Cookie':cookie}:{})}});
const now=()=>new Date().toISOString();
const allowedLegacy=new Set(['signin','register','signout','profile','connect','respondConnection','message','block','memberStatus','readNotifications','resolveReport','createProject','joinProject','projectMember','addProjectMember','task','taskStatus']);
async function thread(id,user){const p=await getPost(field(id,'Conversation',80),user);const m=await one('SELECT * FROM forum_meta WHERE post_id=?',id);if(m?.deleted||(!p.published&&user?.role!=='admin'))fail(404,'Conversation not found.');return {...p,...m,id:p.id};}
function owner(p,u){if(p.author_id!==u.id&&u.role!=='admin')fail(403,'Only the author or an administrator can change this.');}
async function inform(post,actor,body,parentUser){const recipients=new Set([post.author_id,parentUser,...(await all('SELECT user_id FROM forum_followers WHERE post_id=?',post.id)).map(r=>r.user_id)]);for(const id of recipients)if(id&&id!==actor.id)await notify(id,body,'#discussion-'+post.id);}
async function getState(req){
 const u=await currentUser(req),active=u?.status==='active',viewer=active?u:null;
 const raw=await all('SELECT p.*,u.name AS author_name,m.board,m.pinned,m.locked,m.updated_at,m.revision,m.deleted FROM posts p JOIN users u ON u.id=p.author_id LEFT JOIN forum_meta m ON m.post_id=p.id ORDER BY COALESCE(m.updated_at,p.created_at) DESC');const posts=[];
 for(const p of raw){if(p.deleted||(!p.published&&u?.role!=='admin')||!(await canSeePost(p,viewer)))continue;
 const comments=await all('SELECT c.*,u.name AS author_name,r.parent_id,r.deleted,r.edited_at FROM comments c JOIN users u ON u.id=c.author_id LEFT JOIN forum_reply_meta r ON r.comment_id=c.id WHERE c.post_id=? ORDER BY c.created_at,c.rowid',p.id);
 const poll=await one('SELECT * FROM polls WHERE post_id=?',p.id);if(poll){poll.options=await all('SELECT o.*,(SELECT COUNT(*) FROM votes WHERE option_id=o.id) AS votes FROM poll_options o WHERE poll_id=? ORDER BY o.rowid',poll.id);poll.choice=active?(await one('SELECT option_id FROM votes WHERE poll_id=? AND user_id=?',poll.id,u.id))?.option_id:null;}
 posts.push({...p,board:p.board||(p.kind==='announcement'?'official':p.project_id?'projects':'ideas'),replies:comments.map(c=>c.deleted?{id:c.id,post_id:c.post_id,deleted:1,parent_id:c.parent_id,body:'This reply was removed.',author_name:'Removed',created_at:c.created_at}:c),poll,likes:(await one('SELECT COUNT(*) AS n FROM forum_likes WHERE post_id=?',p.id)).n,saved:active&&!!(await one('SELECT 1 FROM forum_saved WHERE post_id=? AND user_id=?',p.id,u.id)),liked:active&&!!(await one('SELECT 1 FROM forum_likes WHERE post_id=? AND user_id=?',p.id,u.id)),following:active&&!!(await one('SELECT 1 FROM forum_followers WHERE post_id=? AND user_id=?',p.id,u.id))});}
 const response=await legacyGET(req),base=await response.json();if(!response.ok)fail(response.status,base.error);
 const notifications=(base.notifications||[]).map(n=>({...n,href:n.href.startsWith('#discussion-')?n.href:n.href.includes('messages')?'#room-inbox':'#room-people'}));
 const network=await networkPeople(base.people||[],u);
 return json({user:network.user,setup:!(await one("SELECT 1 FROM users WHERE role='admin'")),threads:posts,people:network.people,projects:base.projects||[],connections:base.connections||[],messages:base.messages||[],notifications,blocks:base.blocks||[],admin:base.admin,projectMembers:base.projectMembers||[],stages:base.stages||[],tasks:base.tasks||[]});
}
export async function handle(req){try{
 if(req.method==='GET'&&new URL(req.url).pathname==='/api/content')return await publicContent(req);
 if(req.method==='GET')return new URL(req.url).pathname==='/api/events'?await publicEvents(req):await getState(req);if(req.method!=='POST')return json({error:'Method not allowed.'},405);
 if(req.headers.get('origin')!==new URL(req.url).origin)fail(403,'This request must come from Canopy.');const text=await req.text();if(text.length>25000)fail(413,'This submission is too large.');let b;try{b=JSON.parse(text);}catch{fail(400,'Invalid request.');}if(!b||typeof b!=='object'||Array.isArray(b))fail(400,'Invalid request.');
 const action=field(b.action,'Action',40),u=await currentUser(req);
 const contentResponse=await contentAction(action,b,u);if(contentResponse)return contentResponse;
 const eventsResponse=await eventAction(action,b,u);if(eventsResponse)return eventsResponse;
 const networkResponse=await networkAction(action,b,u);if(networkResponse)return networkResponse;
 if(action==='joinApplication'){
  await rate(req,'join-application',15);
  const requestId=field(b.requestId,'Submission',80);
  if(!/^[a-f0-9-]{36}$/i.test(requestId))fail(400,'Invalid submission. Reload and try again.');
  const name=field(b.name,'Name',80),address=email(b.email),organization=field(b.organization??'','School or organization',160,0),introduction=field(b.introduction??'','Introduction',1500,0);
  const profile=validateJoinProfile(b.profile);if([2,3].includes(profile.version)&&!introduction)fail(400,'Tell us what brings you to Canopy.');
  const id=uid();
  await run("INSERT INTO join_applications(id,request_id,name,email,organization,introduction,created_at,profile_json) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(request_id) DO NOTHING",id,requestId,name,address,organization,introduction,now(),JSON.stringify(profile));
  return json({ok:true},201);
 }
 if(action==='listJoinApplications'){
  admin(u);
  const rows=await all('SELECT id,name,email,organization,introduction,status,created_at,profile_json FROM join_applications ORDER BY created_at DESC LIMIT 500');
  return json({applications:rows.map(({profile_json,...row})=>{const profile=JSON.parse(profile_json);return {...row,kind:profile.version===3?'connect':'join',profile};})});
 }
 if(action==='setup'){
  if(await one("SELECT 1 FROM users WHERE role='admin'"))fail(409,'Canopy is already set up. Sign in instead.');await rate(req,'setup',8);
  const id=uid(),salt=uid(),address=email(b.email),name=field(b.name,'Name',80),password=field(b.password,'Password',128,12),hash=await passwordHash(password,salt),postId=uid();
  await database().batch([stmt("INSERT INTO settings(key,value) VALUES('admin_bootstrapped',?)",id),stmt("INSERT INTO users(id,email,name,password_hash,salt,role,status) VALUES(?,?,?,?,?,'admin','active')",id,address,name,hash,salt),stmt("INSERT INTO posts(id,author_id,kind,title,body,visibility) VALUES(?,?,'announcement','Welcome to Room','Use this board for Canopy announcements. Members can share ideas, plan projects and start conversations inside the member room.','public')",postId,id),stmt("INSERT INTO forum_meta(post_id,board,pinned,updated_at) VALUES(?,'official',1,?)",postId,now())]);return json({ok:true},200,await session(id,req));
 }
 if(allowedLegacy.has(action))return legacyPOST(new Request(req.url,{method:'POST',headers:req.headers,body:text}));
 const actor=member(u);await rate(req,'forum:'+actor.id,180);
 if(['save','like','follow'].includes(action)){
  const p=await thread(b.id,actor),table={save:'forum_saved',like:'forum_likes',follow:'forum_followers'}[action];if(b.remove)await run(`DELETE FROM ${table} WHERE user_id=? AND post_id=?`,actor.id,p.id);else await run(`INSERT OR IGNORE INTO ${table}(user_id,post_id) VALUES(?,?)`,actor.id,p.id);
 }else if(action==='createThread'){
  const board=field(b.board,'Board',30);if(!['ideas','projects','hello','official'].includes(board))fail(400,'Choose a board.');let visibility=board==='official'?'public':'members';if(board==='official')admin(actor);
  let project=null;if(b.projectId){project=await getProject(b.projectId,actor);if(project.visibility==='project')visibility='project';if(actor.role!=='admin'&&project.owner_id!==actor.id&&!(await one("SELECT 1 FROM project_members WHERE project_id=? AND user_id=? AND status='active'",project.id,actor.id)))fail(403,'Join this project before posting.');}
  if(board==='projects'&&!project)fail(400,'Choose a project for this conversation.');
  const id=uid(),title=field(b.title,'Title',160),body=field(b.body,'Post',8000),batch=[stmt('INSERT INTO posts(id,author_id,kind,title,body,visibility,project_id) VALUES(?,?,?,?,?,?,?)',id,actor.id,board==='official'?'announcement':board==='ideas'?'idea':'discussion',title,body,visibility,project?.id||null),stmt('INSERT INTO forum_meta(post_id,board,updated_at) VALUES(?,?,?)',id,board,now()),stmt('INSERT INTO forum_followers(user_id,post_id) VALUES(?,?)',actor.id,id)];
  if(b.pollOptions){if(!Array.isArray(b.pollOptions)||b.pollOptions.length<2||b.pollOptions.length>6)fail(400,'Use 2–6 poll options.');const labels=b.pollOptions.map(v=>field(v,'Option',100));if(new Set(labels.map(v=>v.toLowerCase())).size!==labels.length)fail(400,'Poll options must be different.');const closing=Date.parse(b.closesAt);if(!Number.isFinite(closing)||closing<=Date.now())fail(400,'Choose a future closing date.');const pollId=uid();batch.push(stmt('INSERT INTO polls(id,post_id,question,closes_at) VALUES(?,?,?,?)',pollId,id,title,new Date(closing).toISOString()));for(const label of labels)batch.push(stmt('INSERT INTO poll_options(id,poll_id,label) VALUES(?,?,?)',uid(),pollId,label));}
  await database().batch(batch);return json({ok:true,id});
 }else if(action==='editThread'){
  const p=await thread(b.id,actor);owner(p,actor);if(p.locked&&actor.role!=='admin')fail(403,'This conversation is locked.');if(Number(b.revision)!==Number(p.revision||1))fail(409,'This post changed while you were editing. Reload it before trying again.');await database().batch([stmt('UPDATE posts SET title=?,body=? WHERE id=?',field(b.title,'Title',160),field(b.body,'Post',8000),p.id),stmt('UPDATE forum_meta SET revision=revision+1,updated_at=? WHERE post_id=?',now(),p.id)]);
 }else if(action==='deleteThread'){
  const p=await thread(b.id,actor);owner(p,actor);await run('UPDATE forum_meta SET deleted=1,updated_at=? WHERE post_id=?',now(),p.id);
 }else if(action==='reply'){
  const p=await thread(b.id,actor);if(p.locked)fail(403,'This conversation is closed to replies.');let parent=null;if(b.parentId){parent=await one('SELECT * FROM comments WHERE id=? AND post_id=?',b.parentId,p.id);if(!parent)fail(400,'Reply not found.');}
  const id=uid();await database().batch([stmt('INSERT INTO comments(id,post_id,author_id,body) VALUES(?,?,?,?)',id,p.id,actor.id,field(b.body,'Reply',4000)),stmt('INSERT INTO forum_reply_meta(comment_id,parent_id) VALUES(?,?)',id,parent?.id||null),stmt('UPDATE forum_meta SET updated_at=? WHERE post_id=?',now(),p.id),stmt('INSERT OR IGNORE INTO forum_followers(user_id,post_id) VALUES(?,?)',actor.id,p.id)]);await inform(p,actor,`${actor.name} replied to “${p.title}”.`,parent?.author_id);return json({ok:true,id});
 }else if(action==='editReply'||action==='deleteReply'){
  const c=await one('SELECT c.*,m.deleted FROM comments c LEFT JOIN forum_reply_meta m ON m.comment_id=c.id WHERE c.id=?',b.id);if(!c||c.deleted)fail(404,'Reply not found.');const p=await thread(c.post_id,actor);owner(c,actor);if(p.locked&&actor.role!=='admin')fail(403,'This conversation is locked.');if(action==='editReply')await database().batch([stmt('UPDATE comments SET body=? WHERE id=?',field(b.body,'Reply',4000),c.id),stmt('UPDATE forum_reply_meta SET edited_at=? WHERE comment_id=?',now(),c.id)]);else await run('UPDATE forum_reply_meta SET deleted=1 WHERE comment_id=?',c.id);
 }else if(action==='vote'){
  const p=await thread(b.id,actor),poll=await one('SELECT * FROM polls WHERE post_id=?',p.id);if(!poll||Date.parse(poll.closes_at)<=Date.now()||p.locked)fail(400,'This poll is closed.');if(!(await one('SELECT 1 FROM poll_options WHERE id=? AND poll_id=?',b.optionId,poll.id)))fail(400,'Choose an option from this poll.');await run('INSERT INTO votes(poll_id,user_id,option_id) VALUES(?,?,?) ON CONFLICT(poll_id,user_id) DO UPDATE SET option_id=excluded.option_id',poll.id,actor.id,b.optionId);
 }else if(action==='moderate'){
  admin(actor);const p=await thread(b.id,actor);if(!['pinned','locked','published'].includes(b.field)||typeof b.value!=='boolean')fail(400,'Choose a moderation action.');if(b.field==='published')await run('UPDATE posts SET published=? WHERE id=?',Number(b.value),p.id);else await run(`UPDATE forum_meta SET ${b.field}=? WHERE post_id=?`,Number(b.value),p.id);
 }else if(action==='projectStage'){
  const p=await getProject(field(b.projectId,'Project',80),actor,true),name=field(b.name,'Stage name',100),status=field(b.status,'Status',20);if(!['upcoming','current','done'].includes(status))fail(400,'Choose a valid stage status.');if(b.dueDate&&!/^\d{4}-\d{2}-\d{2}$/.test(b.dueDate))fail(400,'Choose a valid date.');
  if(b.id&&!(await one('SELECT 1 FROM project_stages WHERE id=? AND project_id=?',b.id,p.id)))fail(404,'Stage not found.');
  const stageId=b.id||uid(),batch=[];
  if(status==='current')batch.push(stmt("UPDATE project_stages SET status='done' WHERE project_id=? AND status='current' AND id<>?",p.id,stageId));
  batch.push(b.id?stmt('UPDATE project_stages SET name=?,status=?,due_date=? WHERE id=?',name,status,b.dueDate||null,stageId):stmt('INSERT INTO project_stages(id,project_id,name,position,status,due_date) VALUES(?,?,?,?,?,?)',stageId,p.id,name,(await one('SELECT COUNT(*) AS n FROM project_stages WHERE project_id=?',p.id)).n,status,b.dueDate||null));
  if(status==='current')batch.push(stmt('UPDATE projects SET stage=? WHERE id=?',name,p.id));
  await database().batch(batch);
 }else if(action==='report'){
  await thread(b.id,actor);await run("INSERT INTO reports(id,reporter_id,target_type,target_id,reason) VALUES(?,?,'post',?,?)",uid(),actor.id,b.id,field(b.reason,'Reason',2000));
 }else fail(400,'Unknown action.');return json({ok:true});
 }catch(e){if(e instanceof HttpError)return json({error:e.message},e.status);if(String(e.message).includes('UNIQUE'))return json({error:'This record already exists. Refresh and try again.'},409);console.error('Forum request failed:',e.message);return json({error:'The change could not be saved. Please try again.'},500);}}
