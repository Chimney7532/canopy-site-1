// Shared by the Sites and Vercel form handlers.
const roles=['Student','Working professional','Founder','Researcher','Between things','Other'];
const skills=['Engineering','Design','Research','Business','Writing','Community','Still exploring'];
const goals=['Find collaborators','Join a project','Develop an idea','Meet people','Find support','Support teams'];
const stages=['Just exploring','I have an idea','Already building','Something is live'];
const availability=['Occasionally','1–3 hours a week','4–8 hours a week','8+ hours a week','Not sure yet'];
export function validateIntroductionProfile(p,{field,fail}){
 if(p===undefined)return {};
 if(!p||typeof p!=='object'||Array.isArray(p)||![2,3].includes(p.version))fail(400,'Invalid introduction format.');
 const choice=(value,options,label,required=false)=>{const v=field(value??'',label,100,required?1:0);if(v&&!options.includes(v))fail(400,`Choose a valid ${label.toLowerCase()}.`);return v;};
 const many=(value,options,label,min=0)=>{if(!Array.isArray(value)||value.length<min||value.length>5||new Set(value).size!==value.length||value.some(v=>!options.includes(v)))fail(400,`Choose ${min||1}–5 ${label.toLowerCase()}.`);return value;};
 if(!Array.isArray(p.links)||p.links.length>3)fail(400,'Add up to three links.');
 const links=p.links.map(v=>{const s=field(v,'Link',500);let url;try{url=new URL(s);}catch{fail(400,'Use a full link starting with https://.');}if(!['https:','http:'].includes(url.protocol)||!url.hostname||url.username||url.password)fail(400,'Use a public http or https link.');return url.href;});
 if(p.version===3){if(links.length>1)fail(400,'Add one website or profile.');return {version:3,role:choice(p.role,['Builder','Founder','VC','Angel','Company'],'Role',true),links};}
 return {version:2,role:choice(p.role,roles,'Role',true),location:field(p.location??'','City or time zone',120,0),skills:many(p.skills,skills,'skills'),interests:field(p.interests??'','Interests',300,0),stage:choice(p.stage,stages,'Stage'),links,goals:many(p.goals,goals,'goals',1),availability:choice(p.availability,availability,'Availability')};
}
