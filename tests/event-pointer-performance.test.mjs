import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const text=readFileSync(new URL('../public/assets/scripts/events.js',import.meta.url),'utf8');
const source=text.slice(text.indexOf(' function bindReveal('),text.indexOf(" const dialog=document.createElement('dialog')"))+'\nwindow.bind=bindReveal;';
function harness(){
 let reads=0,top=100,serial=0,time=0,covered=false;const listeners={},docEvents={},frames=new Map(),resize=[];
 const layer={style:{},querySelector:()=>null};
 const day={firstChild:{}};
 const row={isConnected:true,classList:{contains:c=>c==='agenda-entry',add(){}},querySelector:s=>s==='.event-date strong'?day:layer,
 getBoundingClientRect(){reads++;return {left:0,top,width:800,height:240};},addEventListener:(n,f)=>listeners[n]=f};
 const ctx={window:{},stops:[],geometryEpoch:0,AbortController,Float64Array,Math,Array,
 reduced:{matches:false,addEventListener(){}},coarse:{matches:false,addEventListener(){}},
 document:{hidden:false,body:{classList:{contains:()=>covered}},fonts:{ready:{then(){}}},addEventListener:(n,f)=>docEvents[n]=f,
 createRange:()=>({selectNodeContents(){},setStart(){},getBoundingClientRect(){reads++;return {left:80,top:110,bottom:200,height:90};}})},
 ResizeObserver:class{constructor(fn){resize.push(fn)}observe(){}disconnect(){}},
 requestAnimationFrame:fn=>{frames.set(++serial,fn);return serial;},cancelAnimationFrame:id=>frames.delete(id)};
 vm.runInNewContext(source,ctx);ctx.window.bind(row);
 return {clip:()=>layer.style.clipPath,
 event(name){if(name==='canopy-event-cover-open')covered=true;if(name==='canopy-event-cover-closed')covered=false;docEvents[name]?.();},
 advance(count){for(let i=0;i<count;i++){time+=16.667;const batch=[...frames.values()];frames.clear();batch.forEach(fn=>fn(time));}},
 reads:()=>reads,move:(x=100,y=160)=>listeners.pointermove({clientX:x,clientY:y,timeStamp:100,pointerType:'mouse'}),
 enter:()=>listeners.pointerenter({clientX:100,clientY:160,timeStamp:100,pointerType:'mouse'}),
 scroll(){top=0;ctx.geometryEpoch++;},resize(){resize.forEach(fn=>fn());},
 hide(){ctx.document.hidden=true;docEvents.visibilitychange();},frames};
}
test('liquid edge reuses its rectangle throughout pointer bursts, invalidating after scroll',()=>{
 const h=harness();h.enter();const before=h.reads();for(let i=0;i<120;i++)h.move(100+i,160);
 assert.equal(h.reads(),before,'120 pointer events should not force a layout measurement');
 h.scroll();h.move();assert.equal(h.reads(),before+1,'scroll measures the new rectangle once');h.move();assert.equal(h.reads(),before+1);
 h.resize();assert.ok(h.reads()>before+1,'resize updates the split date geometry');
});
test('hidden tab cancels the event liquid simulation',()=>{
 const h=harness();h.enter();assert.ok(h.frames.size>0);h.hide();assert.equal(h.frames.size,0);
});


test('closing resumes the liquid edge without a boundary snap',()=>{
 const h=harness(),rest=h.clip();h.enter();h.advance(180);
 assert.equal(h.clip(),'none','hover reaches a straight filled edge');
 h.event('canopy-event-cover-open');assert.equal(h.frames.size,0);
 h.event('canopy-event-cover-closing');
 assert.equal(h.clip(),'none','closing must retain the exact starting pose');
 h.advance(10);const intermediate=h.clip();
 assert.notEqual(intermediate,'none');assert.notEqual(intermediate,rest,'edge interpolates while covered');
 h.event('canopy-event-cover-closed');assert.equal(h.clip(),intermediate,'dialog cleanup must not reset the spring');
 h.advance(180);const points=value=>value.match(/-?\d+(?:\.\d+)?/g).map(Number),actual=points(h.clip()),expected=points(rest);
 assert.ok(actual.every((value,i)=>Math.abs(value-expected[i])<.02),'edge settles within a subpixel of its original wave');assert.equal(h.frames.size,0);
});

test('reopening during the return freezes and resumes the current shape',()=>{
 const h=harness();h.enter();h.advance(120);h.event('canopy-event-cover-open');h.event('canopy-event-cover-closing');h.advance(6);
 const pose=h.clip();h.event('canopy-event-cover-open');h.advance(20);assert.equal(h.clip(),pose);
 h.event('canopy-event-cover-closing');assert.equal(h.clip(),pose);h.advance(120);assert.notEqual(h.clip(),pose);
});
