import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const html=(readFileSync(new URL('../site/index.html',import.meta.url),'utf8')+'\n'+readFileSync(new URL('../public/assets/scripts/site.js',import.meta.url),'utf8'));
const source=html.slice(html.indexOf('let navigationRevision=0;'),html.indexOf("window.addEventListener('hashchange'"));
function harness(){
 let releaseClose,releasePeople,opens=[],renders=[];
 const closing=new Promise(r=>releaseClose=r),ready=new Promise(r=>releasePeople=r);
 const ctx={RoomFlow:{active:false},location:{hash:'#home'},shell:{dataset:{view:'events'}},main:{firstChild:{}},
 transitionCleanup(){},renderView:(name)=>{renders.push(name);ctx.shell.dataset.view=name;},
 CanopyForum:{ready},CanopyEventPage:{active:true,close:()=>closing,open:(id,kind)=>opens.push({id,kind})},views:{home:'',events:'',projects:'',people:''}};
 vm.createContext(ctx);vm.runInContext(source,ctx);
 return {ctx,opens,renders,go(hash){ctx.location.hash=hash;vm.runInContext('route()',ctx);},releaseClose,releasePeople};
}
test('finishing an old close cannot reroute a newly opened detail',async()=>{
 const h=harness();h.go('#home');h.go('#event-next');
 h.releaseClose();await Promise.resolve();await Promise.resolve();
 assert.deepEqual(h.opens,[{id:'next',kind:'event'}]);assert.equal(h.renders.length,0);
});
test('only the latest member request can open after people finishes loading',async()=>{
 const h=harness();h.ctx.shell.dataset.view='people';
 h.go('#person-first');h.go('#person-second');h.go('#person-first');
 h.releasePeople();await Promise.resolve();await Promise.resolve();
 assert.deepEqual(h.opens,[{id:'first',kind:'person'}]);
});
