import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../public/assets/scripts/liquid-rail.js',import.meta.url),'utf8');
function harness({reduced=false,width=1280}={}){
 const events={},docEvents={},frames=new Map(),elements=[];let id=0,now=0,reads=0,styleReads=0,linkTop=299;
 function element(){const attrs={};const e={attrs,append(){},setAttribute(k,v){attrs[k]=v},removeAttribute(k){delete attrs[k]},classList:{add(){},remove(){}}};elements.push(e);return e;}
 const rail={addEventListener(){},getBoundingClientRect:()=>{reads++;return {width:236.8,bottom:linkTop+52,top:linkTop,left:300,right:350}}};
 const window={addEventListener:(n,f)=>events[n]=f};
 const document={hidden:false,createElement:element,createElementNS:element,body:{append(){},classList:{contains:()=>false}},querySelector:()=>rail,addEventListener:(n,f)=>docEvents[n]=f};
 vm.runInNewContext(source,{window,document,innerWidth:width,innerHeight:800,performance:{now:()=>now},matchMedia:()=>({matches:reduced,addEventListener(){}}),getComputedStyle:()=>{styleReads++;return {paddingLeft:'52px'}},requestAnimationFrame:f=>{frames.set(++id,f);return id},cancelAnimationFrame:i=>frames.delete(i)});
 return {surface:window.LiquidRail,frames,
  measurements:()=>({reads,styleReads}),scroll:()=>events.scroll(),moveLink:top=>{linkTop=top},
  move(x,y){events.pointermove({clientX:x,clientY:y,pointerType:'mouse'})},leave(){docEvents.pointerleave()},
  advance(ms,hz=60){for(let t=0;t<ms;t+=1000/hz){now+=1000/hz;const callbacks=[...frames.values()];frames.clear();callbacks.forEach(f=>f(now))}},
  shape(){return elements[2].attrs.d},xs(){return Array.from(elements[2].attrs.d.matchAll(/C ([^CMLZ]+)/g),m=>Number(m[1].trim().split(/\s+/)[4])).slice(0,41)}

 };
}
test('resting ink sleeps; nearby pointer pulls only the local edge and leaving settles it',()=>{
 const h=harness(),rest=h.xs();assert.equal(h.frames.size,0);
 h.move(250,326);h.advance(800);const active=h.xs();
 assert.ok(active[20]-rest[20]>15, JSON.stringify({rest:rest[20],active:active[20],length:active.length}));assert.ok(Math.abs(active[0]-rest[0])<(active[20]-rest[20])*.3);
 h.leave();h.advance(6000);assert.equal(h.frames.size,0);
 assert.ok(h.xs().every((x,i)=>Math.abs(x-rest[i])<.1));
});

test('pointer ripples reuse geometry instead of measuring layout every animation frame',()=>{
 const h=harness(),initial=h.measurements();
 h.move(250,326);h.advance(1000,120);h.leave();h.advance(6000,120);
 assert.deepEqual(h.measurements(),initial);
 h.moveLink(400);h.surface.sync();assert.ok(h.measurements().reads>initial.reads);
 const rest=h.xs();h.move(250,426);h.advance(800);
 assert.ok(h.xs()[20]-rest[20]>15,'resync follows the newly positioned link');
});

test('mobile scroll bursts coalesce into one geometry measurement and repaint',()=>{
 const h=harness({width:390}),before=h.shape(),initial=h.measurements();h.moveLink(180);
 for(let i=0;i<20;i++)h.scroll();
 assert.deepEqual(h.measurements(),initial);assert.equal(h.frames.size,1);
 h.advance(17);assert.equal(h.measurements().reads-initial.reads,2);
 assert.notEqual(h.shape(),before);assert.equal(h.frames.size,0);
});
test('fast pointer movements remain bounded and motion is consistent at 60 and 120 Hz',()=>{
 const run=hz=>{const h=harness();h.move(250,311);h.advance(200,hz);h.move(265,340);h.advance(400,hz);return h.xs()};
 const a=run(60),b=run(120);
 assert.ok(a.every((x,i)=>Math.abs(x-b[i])<2));assert.ok(a.every(x=>x>130&&x<280));
});
test('transition begins at the actual interactive edge without snapping',()=>{
 const h=harness();h.move(250,326);h.advance(800);const prior=h.xs();
 const g=h.surface.begin();h.surface.paint(g.edge,3,0,false,1);
 assert.deepEqual(h.xs(),prior);assert.equal(h.frames.size,0);
 h.surface.end();assert.ok(!h.shape().includes('NaN'));
});
test('reduced motion and touch-sized navigation have no mouse ripple loop',()=>{
 for(const options of [{reduced:true},{width:390}]){const h=harness(options),before=h.shape();h.move(250,326);h.advance(1000);assert.equal(h.shape(),before);assert.equal(h.frames.size,0)}
});

test('event liquid seed preserves its start contour and covers every viewport corner',()=>{
 const h=harness(),center={x:780,y:360};
 const points=Array.from({length:96},(_,i)=>{const a=i*Math.PI*2/96;return {x:center.x+220*Math.cos(a),y:center.y+90*Math.sin(a)}});
 const original=JSON.stringify(points),shape=h.surface.revealShape({points,center,width:1280,height:800});
 const endpoints=d=>[...d.matchAll(/C\s+([^CMLZ]+)/g)].map(m=>{const v=m[1].trim().split(/\s+/).map(Number);return {x:v[4],y:v[5]}});
 const start=endpoints(shape(0));assert.ok(start.every((p,i)=>Math.hypot(p.x-points[(i+1)%96].x,p.y-points[(i+1)%96].y)<.001));
 const contains=(polygon,x,y)=>{let inside=false;for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){const a=polygon[i],b=polygon[j];if((a.y>y)!==(b.y>y)&&x<(b.x-a.x)*(y-a.y)/(b.y-a.y)+a.x)inside=!inside;}return inside;};
 const end=endpoints(shape(1));for(const [x,y] of [[0,0],[1280,0],[0,800],[1280,800]])assert.ok(contains(end,x,y));
 for(const q of [0,.1,.5,.9,1])assert.ok(!/NaN|Infinity/.test(shape(q)));
 assert.ok(endpoints(shape(0,0)).every(p=>Math.hypot(p.x-center.x,p.y-center.y)<.001),'closing ink must disappear, not leave a rectangular event crop');
 assert.equal(JSON.stringify(points),original);
});
