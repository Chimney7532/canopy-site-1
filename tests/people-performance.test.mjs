import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../public/assets/scripts/people.js',import.meta.url),'utf8');
const update=source.slice(source.indexOf(' function update()'),source.indexOf(' function select('));
function harness(size){
 let writes=0,rebuilds=0,scans=0;
 const nodes=new Map(Array.from({length:size},(_,i)=>[String(i),{attrs:{},classList:{add(){writes++},remove(){writes++}},setAttribute(key,value){writes++;this.attrs[key]=value;}}]));
 const records=Array.from({length:size},(_,i)=>({id:String(i),name:`Member ${i}`,index:i,identities:['Builder']}));
 const text=()=>({textContent:''});const index=text(),heading=text(),identities=text(),initials=text();
 const card={dataset:{},setAttribute(){},querySelector:s=>s==='.atlas-initials'?initials:null};
 const panel={dataset:{},firstElementChild:{},querySelector:s=>({'.atlas-member-index':index,h3:heading,p:identities,'.atlas-portrait':card})[s],set innerHTML(v){rebuilds++}};
 const host={isConnected:true,querySelector:()=>panel,querySelectorAll(){scans++;return [...nodes.values()]}};
 const context={host,nodeIndex:nodes,activeNode:nodes.get('0'),selectedId:'0',records,get:id=>records[Number(id)],identities:p=>p.identities,initials:p=>p.name[0],photoURL:()=>'',encodeURIComponent,String};
 vm.createContext(context);vm.runInContext(update,context);
 return {select(id){context.selectedId=String(id);vm.runInContext('update()',context);},counts:()=>({writes,rebuilds,scans}),heading,card,nodes};
}
test('member wall hover updates only two links without rebuilding the wall',()=>{
 for(const size of [24,240,2400]){const h=harness(size);for(let i=1;i<21;i++)h.select(i);assert.deepEqual(h.counts(),{writes:80,rebuilds:0,scans:0});assert.equal(h.nodes.get('20').attrs['aria-current'],'true');assert.equal(h.nodes.get('19').attrs['aria-current'],'false');}
});
test('repeated hover on the same member performs no extra dot updates',()=>{
 const h=harness(24);h.select(1);const before=h.counts();for(let i=0;i<100;i++)h.select(1);assert.deepEqual(h.counts(),before);
});
