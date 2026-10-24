import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../public/assets/scripts/ink-titles.js',import.meta.url),'utf8');
const code=source.slice(source.indexOf('function usesAnchoredMotion('),source.indexOf('function transition('));
const anchored=vm.runInNewContext(code+'\nusesAnchoredMotion');
const title=(x,y,dx=0,dy=0)=>({anchor:{x,y,scale:1},eye:{x:x+dx,y:y+dy,scale:1}});
test('Projects and People keep their anchored ripple regardless of pointer direction',()=>{
 for(const dx of [-15,0,15])for(const dy of [-6,0,6]){
  assert.equal(anchored(title(560,130,dx,dy),title(560,130)),true);
 }
});
test('gaze cannot turn a nearby Home transition into an unnecessary jump',()=>{
 assert.equal(anchored(title(600,130,15,6),title(525,130)),true);
});
test('distant titles still travel and interrupted flights retain their trajectory',()=>{
 assert.equal(anchored(title(560,130),title(900,130)),false);
 assert.equal(anchored({...title(560,130),frozen:{},motion:'flight'},title(560,130)),false);
 assert.equal(anchored({...title(560,130),frozen:{},motion:'anchored'},title(560,130)),true);
});
test('capture separates title anchor from a looking, half-closed pupil',()=>{
 const matrix={a:1,b:0,c:0,d:.5,e:15,f:47.829};
 const base={a:1,b:0,c:0,d:1,e:0,f:0};
 const pupil={getAttribute:()=> 'pupil',getScreenCTM:()=>matrix,closest:s=>s==='[data-ink-eye]'?{getScreenCTM:()=>base}:null,hasAttribute:k=>k==='data-ink-pupil',classList:{contains:()=>false}};
 const body={...pupil,getAttribute:()=> 'body',getScreenCTM:()=>base,closest:()=>null,hasAttribute:()=>false,dataset:{}};
 const part={getBoundingClientRect:()=>({left:0,right:800,top:0,bottom:166}),matches:()=>false,querySelectorAll:s=>s==='path'?[body,pupil]:[]};
 const captureCode=source.slice(source.indexOf('function capture(parts)'),source.indexOf('function usesAnchoredMotion('));
 const context={DATA:{source:{pupil:'pupil',star:'star',opy:'body'}},aperturePath:'aperture',split:d=>[d],polygon:pts=>JSON.stringify(pts),sample:(d,m)=>[[m.a*428.981+m.e,m.d*83.658+m.f]],Math};
 const capture=vm.runInNewContext(captureCode+'\ncapture',context);
 const result=capture([part]);
 assert.equal(result.anchor.y,83.658);
 assert.equal(result.eye.y,89.658);
 assert.equal(result.eye.x,result.anchor.x+15);
 assert.ok(result.pupilD);assert.ok(result.starD);
});

test('ink handoff keeps viewport coordinates when a scrollbar gutter is reserved',async()=>{
 const frames=new Map(),nodes=[];let serial=0;
 const make=(name,attrs={})=>{
  const node={name,attrs:{...attrs},style:{},dataset:{},children:[],classes:[],
   setAttribute(k,v){this.attrs[k]=String(v);},getAttribute(k){return this.attrs[k];},
   removeAttribute(k){delete this.attrs[k];},append(...items){this.children.push(...items);},
   prepend(...items){this.children.unshift(...items);},before(){},after(){},remove(){this.removed=true;}};
  node.classList={add:c=>node.classes.push(c)};nodes.push(node);return node;
 };
 const clamp=t=>Math.max(0,Math.min(1,t));
 const polygon=pts=>'M'+pts.map(p=>p.join(',')).join('L')+'Z';
 const pts=Array.from({length:220},(_,i)=>[400+i%22,80+Math.floor(i/22)]);
 const snapshot={eye:{x:500,y:120,scale:1},anchor:{x:500,y:120,scale:1},
  contours:[{pts,hole:false}],aperture:pts.slice(0,100),bounds:{left:400,right:600,top:80,bottom:180},secondary:[]};
 const context={make,document:{body:{append(){}}},serial:0,innerWidth:1280,innerHeight:720,
  DATA:{source:{pupil:'pupil',star:'star'}},ink:'#171715',paper:'#f4f1ea',polygon,
  sample:(_d,_m,n)=>Array.from({length:n},(_,i)=>[400+i%22,80+Math.floor(i/22)]),
  lerp:(a,b,t)=>a+(b-a)*t,clamp,phase:(t,a,b)=>clamp((t-a)/(b-a)),ease:t=>t*t*(3-2*t),
  usesAnchoredMotion:()=>true,Math,requestAnimationFrame:fn=>{frames.set(++serial,fn);return serial;},cancelAnimationFrame:id=>frames.delete(id)};
 const transitionCode=source.slice(source.indexOf('function transition('),source.indexOf('// Resting eyes share'));
 const transition=vm.runInNewContext(transitionCode+'\ntransition',context);
 const motion=transition(snapshot,snapshot);
 const stage=nodes.find(n=>n.classes.includes('ink-route-stage'));
 for(const time of [0,400,800]){const pending=[...frames.values()];frames.clear();pending.forEach(fn=>fn(time));}
 await motion.finished;
 const css=Object.fromEntries(stage.style.cssText.split(';').filter(Boolean).map(s=>s.split(':')));
 const [, ,viewWidth,viewHeight]=stage.attrs.viewBox.split(' ').map(Number);
 // A percentage width resolves against the 1265px layout viewport, while the
 // original captured paths were measured against the full 1280px viewport.
 const width=css.width.endsWith('%')?1265:parseFloat(css.width);
 const height=css.height.endsWith('%')?720:parseFloat(css.height);
 const scale=Math.min(width/viewWidth,height/viewHeight),unit=1/1.09;
 assert.ok(Math.abs(400/unit*scale-400)<.01,'final ink edge must meet the live title without shifting');
 assert.ok(Math.abs(80/unit*scale+(height-viewHeight*scale)/2-80)<.01,'baseline must not shift at handoff');
 assert.equal(stage.removed,true);assert.equal(frames.size,0);
});
