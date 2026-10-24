import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const file=process.env.CANOPY_EYE_SOURCE||new URL('../public/assets/scripts/ink-titles.js',import.meta.url);
const full=readFileSync(file,'utf8');
const source=full.slice(full.indexOf('// Resting eyes share'),full.indexOf('function eyeMark()'))+'\nwindow.eyeAPI={rest,stopBlink};';
function harness(){
 const frames=new Map(),timers=new Map(),events={};let now=0,id=0,reads=0,writes=0,modal=false,onscreen=true;
 const on=(name,fn)=>{(events[name]??=[]).push(fn);};
 const el=()=>({isConnected:true,attrs:{},setAttribute(k,v){writes++;this.attrs[k]=v;},removeAttribute(k){delete this.attrs[k];}});
 const pupil=el(),lid=el();
 const base={getScreenCTM(){reads++;return {a:1,b:0,c:0,d:1,e:0,f:0};},querySelector:s=>s==='[data-ink-gaze]'?pupil:lid};
 const svg={getBoundingClientRect(){reads++;return {left:0,right:600,top:onscreen?0:1000,bottom:onscreen?180:1180};},querySelector:()=>base,querySelectorAll:()=>[base]};
 const root={isConnected:true,querySelector:()=>null,querySelectorAll:()=>[svg]};
 const document={hidden:false,querySelector:s=>s==='dialog[open]'&&modal?{}:null,documentElement:{addEventListener:on},addEventListener:on};
 const window={addEventListener:on};
 vm.runInNewContext(source,{document,window,innerWidth:1280,innerHeight:800,performance:{now:()=>now},Math,clamp:t=>Math.max(0,Math.min(1,t)),ease:t=>t*t*(3-2*t),getComputedStyle:()=>{reads++;return {visibility:'visible'};},matchMedia:()=>({matches:false,addEventListener:on}),requestAnimationFrame:fn=>{frames.set(++id,fn);return id;},cancelAnimationFrame:id=>frames.delete(id),setTimeout:(fn,ms)=>{timers.set(++id,{fn,at:now+ms});return id;},clearTimeout:id=>timers.delete(id)});
 const emit=(event,data={})=>(events[event]||[]).forEach(fn=>fn(data));
 return {start(){window.eyeAPI.rest(root);},emit,pupil,lid,frames,timers,counts:()=>({reads,writes}),
  offscreen(){onscreen=false;emit('scroll');},cover(){modal=true;},uncover(){modal=false;emit('close');},
  hidden(value){document.hidden=value;emit('visibilitychange');},
  step(ms=16.667){now+=ms;const callbacks=[...frames.values()];frames.clear();callbacks.forEach(fn=>fn(now));for(const [key,timer] of [...timers])if(timer.at<=now){timers.delete(key);timer.fn();}},
  advance(ms){for(let n=0;n<ms/16.667;n++)this.step();}};
}
test('pointer tracking reuses measured geometry through a 120-event burst',()=>{
 const h=harness();h.start();h.step();const before=h.counts();
 for(let i=0;i<120;i++){h.emit('pointermove',{clientX:500+i,clientY:200,pointerType:'mouse'});h.step();}
 const after=h.counts();console.log('eye tracking measurement reads per 120 frames:',after.reads-before.reads);
 assert.equal(after.reads,before.reads);assert.match(h.pupil.attrs.transform,/translate\(/);
 h.emit('scroll');h.step();assert.ok(h.counts().reads>after.reads,'scroll invalidates the geometry');
});
test('offscreen eyes stop blink timers and animation frames',()=>{
 const h=harness();h.start();h.step();h.offscreen();h.advance(100);assert.equal(h.frames.size,0);assert.equal(h.timers.size,0);
});
test('modal pauses eye work and close resumes it',()=>{
 const h=harness();h.start();h.step();h.cover();h.emit('pointermove',{clientX:600,clientY:250,pointerType:'mouse'});h.advance(200);assert.equal(h.frames.size,0);assert.equal(h.timers.size,0);
 h.uncover();h.advance(1000);assert.ok(h.timers.size>0);assert.ok(h.counts().writes>1);
});
test('hidden tab cancels all eye work and restores tracking on return',()=>{
 const h=harness();h.start();h.step();h.hidden(true);assert.equal(h.frames.size,0);assert.equal(h.timers.size,0);
 h.hidden(false);h.step();assert.ok(h.frames.size+h.timers.size>0);
});
