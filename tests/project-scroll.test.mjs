import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../public/assets/scripts/projects.js',import.meta.url),'utf8');
function harness(hz=120,reduced=false){
 const frames=new Map();let serial=0,time=0,left=0;
 const reel={clientWidth:1000,scrollWidth:1468,isConnected:true,
  get scrollLeft(){return left},set scrollLeft(value){left=Math.round(Math.max(0,Math.min(468,value)))},
  style:{setProperty(){},removeProperty(){}},classList:{add(){},remove(){}},
  getBoundingClientRect:()=>({left:200}),
  children:[0,748].map(x=>({getBoundingClientRect:()=>({left:200+x-left})}))};
 const window={};
 vm.runInNewContext(source,{window,document:{addEventListener(){}},performance:{now:()=>time},
  matchMedia:()=>({matches:reduced,addEventListener(){}}),
  requestAnimationFrame:fn=>{frames.set(++serial,fn);return serial},cancelAnimationFrame:id=>frames.delete(id)});
 return {reel,api:window.CanopyProjects,frames,
  advance(ms){for(let i=0;i<Math.ceil(ms*hz/1000);i++){time+=1000/hz;const callbacks=[...frames.values()];frames.clear();callbacks.forEach(fn=>fn(time));}}};
}
for(const hz of [60,120,144,240])test(`project reaches its end and releases scrolling at ${hz} Hz`,()=>{
 const h=harness(hz);h.api.enter(h.reel,1);assert.equal(h.api.step(h.reel,1),true);h.advance(2500);
 assert.equal(h.reel.scrollLeft,468,'fractional animation must reach the actual edge');
 assert.equal(h.api.step(h.reel,1),false,'next gesture must leave CAN BUILD');
 assert.equal(h.frames.size,0,'animation must not spin forever at the boundary');
});
test('a fresh gesture at the selected last project is not swallowed while it settles',()=>{
 const h=harness();h.api.enter(h.reel,1);h.api.step(h.reel,1);h.advance(160);
 assert.equal(h.api.step(h.reel,1),false);h.advance(2500);assert.equal(h.reel.scrollLeft,468);
});
test('reverse navigation reaches the first project then releases upward scrolling',()=>{
 const h=harness();h.api.enter(h.reel,-1);assert.equal(h.reel.scrollLeft,468);
 assert.equal(h.api.step(h.reel,-1),true);h.advance(2500);
 assert.equal(h.reel.scrollLeft,0);assert.equal(h.api.step(h.reel,-1),false);assert.equal(h.frames.size,0);
});
test('reduced motion and a reel without overflow release chapter navigation',()=>{
 const h=harness(120,true);h.api.enter(h.reel,1);h.api.step(h.reel,1);
 assert.equal(h.reel.scrollLeft,468);assert.equal(h.api.step(h.reel,1),false);
 h.reel.scrollWidth=1000;assert.equal(h.api.step(h.reel,-1),false);assert.equal(h.frames.size,0);
});
