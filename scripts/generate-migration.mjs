// Drizzle's generated filenames are staged outside the source tree. The tracked
// migrations and metadata use hyphens; database records and SQL are unchanged.
import {cpSync,existsSync,mkdirSync,readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const stage='.tmp/drizzle';
mkdirSync(stage+'/meta',{recursive:true});
for(const name of readdirSync('drizzle/meta')){
 const generated=name==='journal.json'?'_journal.json':name.replace('-snapshot','_snapshot');
 cpSync('drizzle/meta/'+name,stage+'/meta/'+generated);
}
for(const name of readdirSync('drizzle').filter(n=>n.endsWith('.sql')))cpSync('drizzle/'+name,stage+'/'+name);
const result=spawnSync(process.execPath,['node_modules/drizzle-kit/bin.cjs','generate','--config','drizzle.config.ts'],{stdio:'inherit'});
if(result.status!==0)process.exit(result.status??1);
const journal=JSON.parse(readFileSync(stage+'/meta/_journal.json','utf8'));
for(const entry of journal.entries){
 const original=entry.tag,tag=original.replaceAll('_','-');
 const source=stage+'/'+original+'.sql';
 if(existsSync(source))cpSync(source,'drizzle/'+tag+'.sql');
 entry.tag=tag;
}
writeFileSync('drizzle/meta/journal.json',JSON.stringify(journal,null,2)+'\n');
for(const name of readdirSync(stage+'/meta').filter(n=>n.endsWith('_snapshot.json')))cpSync(stage+'/meta/'+name,'drizzle/meta/'+name.replace('_snapshot','-snapshot'));
