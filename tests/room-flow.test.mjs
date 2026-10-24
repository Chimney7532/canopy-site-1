import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const source=readFileSync(new URL('../public/assets/scripts/room-flow.js',import.meta.url),'utf8');
const freeze=source.slice(source.indexOf('  function freezeScene('),source.indexOf('  function start(commit){'));

test('outgoing scene preserves vertical and horizontal scroll when both shell and rail are captured',()=>{
  class Element {
    constructor(id='',children=[]){
      this.id=id;this.children=children;this.attributes=[];this.scrollTop=0;this.scrollLeft=0;
      this.style={setProperty(){}};this.classList={contains:()=>false};
    }
    querySelectorAll(){return this.children.flatMap(child=>[child,...child.querySelectorAll()]);}
    cloneNode(){return new Element(this.id,this.children.map(child=>child.cloneNode()));}
    setAttribute(){}
    getBoundingClientRect(){return {top:0,left:0,width:1000,height:720};}
    append(child){
      // Detaching an attached subtree clears its native scrolling state.
      if(child.parent){child.parent.children=child.parent.children.filter(el=>el!==child);[child,...child.querySelectorAll()].forEach(el=>{el.scrollTop=0;el.scrollLeft=0;});}
      child.parent=this;this.children.push(child);
    }
    prepend(child){this.children.unshift(child);child.parent=this;}
  }
  const main=new Element('main'),reel=new Element('reel');main.scrollTop=1096.5;reel.scrollLeft=520;
  const shell=new Element('shell',[main,reel]),rail=new Element('rail'),body=new Element();
  const context={document:{body,querySelectorAll:()=>[],createElement:()=>new Element(),querySelector:selector=>selector==='.shell'?shell:selector==='.rail'?rail:null},
    getComputedStyle:()=>Object.assign(['position'],{position:'relative',backgroundColor:'#f4f1ea',getPropertyValue:()=> 'relative'})};
  const scene=vm.runInNewContext(freeze+'\nfreezeScene()',context);
  const copies=scene.querySelectorAll();
  assert.equal(copies.find(el=>el.id==='ink-copy-main').scrollTop,1096.5);
  assert.equal(copies.find(el=>el.id==='ink-copy-reel').scrollLeft,520);
  assert.equal(scene.children.length,2,'both outgoing shell and navigation remain in the scene');
  assert.equal(body.children.length,1);
});
