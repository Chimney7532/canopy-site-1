// Public event information from CANOPY_Website_Events_Handoff.docx.
// Import content only; the document's page/design instructions are not applied.
const text=(heading,body)=>({type:'text',heading,body});
const poster=(image,caption)=>({type:'image',image,caption});
export const handoffEvents=[
 {
  id:'edge-cloud-intelligence-2026',date:'2026-03-20',title:'Edge Cloud Intelligence Workshop',
  description:'A hands-on workshop with GPTDAO and Cloudwise on local AI agents, multimodal creation, and edge-cloud infrastructure.',
  url:'https://luma.com/8uhdpe1c',image:'/assets/images/event-edge-cloud-2026.webp',imageY:50,
  details:{layout:'cover',venue:'EVGR C134, Stanford',links:[{label:'Event photos',url:'https://drive.google.com/drive/folders/1isOPX9a3z0y83EP4hSHx0zMjHytwjcBg'}],blocks:[
   text('Edge-Cloud Intelligence: Research-Innovation Workshop','Builders, researchers, and founders worked through OpenClaw, Seedance, and Cloudwise tools, then discussed their commercial applications.'),
   text('Co-organized by Canopy','With GPTDAO and Cloudwise.'),
   poster('/assets/images/event-edge-cloud-2026.webp','Edge-Cloud Intelligence workshop · March 20, 2026')
  ]}
 },
 {
  id:'hysta-ai-healthcare-2026',date:'2026-05-30',title:'HYSTA Talk: AI and Healthcare',
  description:'From molecules to medicine: how AI is transforming healthcare.',
  url:'https://luma.com/h8eadrjo',image:'/assets/images/event-hysta-healthcare-2026.webp',imageY:0,
  details:{layout:'cover',venue:'Stanford',links:[{label:'Event photos',url:'https://drive.google.com/drive/folders/1TXotObMo6VsbGiYKkmfe6jMhZBdreBsJ'}],blocks:[
   text('From molecules to medicine','Researchers and industry leaders explored how AI is transforming biological discovery, precision medicine, and clinical practice through keynotes, a panel discussion, audience Q&A, and networking.'),
   text('The conversation','Keynotes by Michael Snyder and James Zou. A panel with Frank Zhong, Fan Zhang, Lei Xing, and Le Cong, moderated by Qi Jiang.'),
   text('Co-hosted by Canopy','A HYSTA Talk bringing together research and industry perspectives on healthcare.'),
   poster('/assets/images/event-hysta-healthcare-2026.webp','HYSTA Talk: AI + Healthcare · May 30, 2026')
  ]}
 },
 {
  id:'robotics-physical-ai-summit-2026',date:'2026-07-26',title:'Robotics × Physical AI Founder-Investor Summit',
  description:'Robotics founders, investors, researchers, and industry leaders, from frontier research to real-world deployment.',
  url:'https://luma.com/u8j9b0a6',image:'/assets/images/event-robotics-summit-2026.webp',imageY:50,
  details:{layout:'cover',venue:'Stanford Faculty Club',links:[{label:'Event photos',url:'https://m.alltuu.com/album/94dcd19a666313451b660a65106ae734/'},{label:'Event website',url:'https://www.stanford-airobotics.com/'}],blocks:[
   text('From research to deployment','CANOPY brought robotics founders, investors, researchers, and industry leaders together for keynotes, investment and industry panels, startup pitches, and curated founder-investor conversations.'),
   text('The program','Soha Pouya of NVIDIA; Patrick S. Chung of Xfund in conversation with Dara Ladjevardian of Delphi; and a closing session with Sebastian Thrun.'),
   text('Co-hosted by','CANOPY × IntelliPro Pitch'),
   poster('/assets/images/event-robotics-summit-2026.webp','Robotics × Physical AI Founder-Investor Summit · July 26, 2026')
  ]}
 },
 {
  id:'care-at-a-distance-2026',date:'2026-10-10',title:'Care at a Distance',
  description:'AI, sensors, robotics, and the future of aging.',
  url:'https://partiful.com/e/IdewRQj8ffxtXnEOkgyu',image:'/assets/images/event-care-distance-2026.webp',imageY:30,
  details:{layout:'cover',venue:'EVGR, Stanford',links:[{label:'Event photos',url:'https://drive.google.com/drive/folders/193DScz7DyHVB4XOXCxRxhGBWcmBPyPtU?usp=drive_link'}],blocks:[
   text('Care at a distance','Researchers and founders explored how AI, ambient sensing, and robotics can support independent aging. Two panels examined remote wellbeing monitoring and robotics for everyday living, followed by audience discussion and community connections.'),
   text('Canopy Community Partner','Part of SF Tech Week. Hosted by Crane Huang and Xiaojing Xing.'),
   poster('/assets/images/event-care-distance-2026.webp','Care at a Distance, October 10, 2026'),
   poster('/assets/images/care-conversation-1.jpg','A speaker joins the community conversation at Care at a Distance.'),
   poster('/assets/images/care-conversation-2.jpg','A panel conversation at Care at a Distance.')
  ]}
 },
 {
  id:'stanford-health-hacks-2027',date:'2027-02-19',title:'Stanford Health Hacks · Planned',
  description:'February 19–21, 2027 (planned). Three days of healthcare challenges, prototypes, and collaboration.',
  url:'https://stanfordhealthhacks.com/',image:null,
  details:{layout:'cover',time:'February 19–21, 2027 · Planned',venue:'Stanford Research Park · To be confirmed',blocks:[
   text('Healthcare, built together','A three-day healthcare hackathon bringing students, clinicians, researchers, and builders together across six challenge tracks. Teams will develop prototypes, work with mentors, and explore paths from an idea to real-world care.'),
   text('Canopy Partner','Hosted by BASES × Stanford Medicine Catalyst.'),
   text('Planned dates','February 19–21, 2027. Dates and venue are subject to confirmation.')
  ]}
 }
];

// No invented dates: retain undated activities separately from the public calendar.
export const undatedActivities=[
 {title:'Founder investor dinners',cadence:'Ongoing',description:'Small, curated gatherings where founders meet investors and operators, share what they are building, and develop relationships that continue beyond the evening.'},
 {title:'Startup sourcing with N1AC',cadence:'Ongoing collaboration',description:'CANOPY helps source and introduce early-stage founders for N1AC pitch sessions and investor conversations, connecting relevant teams with a network of independent angel investors.',url:'https://n1-ac.com/#top'}
];

export const handoffKey='events_handoff_oct_2026_v1';
// One atomic import. Re-running must not overwrite later edits or resurrect samples.
export function handoffStatements(prepare,now){
 return [
  ...handoffEvents.map(e=>prepare(`INSERT OR IGNORE INTO site_events
   (id,date,title,description,url,image_url,image_x,image_y,status,is_sample,revision,created_at,updated_at,details_json)
   SELECT ?,?,?,?,?,?,50,?,'published',0,1,?,?,?
   WHERE NOT EXISTS(SELECT 1 FROM settings WHERE key=?)`,e.id,e.date,e.title,e.description,e.url,e.image,e.imageY??50,now,now,JSON.stringify(e.details),handoffKey)),
  prepare(`UPDATE site_events SET status='archived',revision=revision+1,updated_at=?
   WHERE is_sample=1 AND status='published' AND NOT EXISTS(SELECT 1 FROM settings WHERE key=?)`,now,handoffKey),
  prepare('INSERT OR IGNORE INTO settings(key,value) VALUES(?,?)',handoffKey,now)
 ];
}

// Restore cover references already imported without images in v97.
export const handoffCoverKey='events_handoff_covers_oct_2026_v1';
export function handoffCoverStatements(prepare,now){
 return [
  ...handoffEvents.filter(e=>e.image).map(e=>prepare(`UPDATE site_events
   SET image_url=?,image_y=?,revision=revision+1,updated_at=?
   WHERE id=? AND (image_url IS NULL OR image_url='')
   AND NOT EXISTS(SELECT 1 FROM settings WHERE key=?)`,e.image,e.imageY??50,now,e.id,handoffCoverKey)),
  prepare('INSERT OR IGNORE INTO settings(key,value) VALUES(?,?)',handoffCoverKey,now)
 ];
}
