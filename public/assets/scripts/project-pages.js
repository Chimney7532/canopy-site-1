window.CanopyProjectPages=(()=>{
 const projects={
  'founder-dinners':{id:'founder-dinners',kind:'project',title:'Founder Dinners',lines:['Founder','Dinners'],stage:'Ongoing',description:'Small gatherings for founders, investors, and operators.',sections:[{body:'Curated gatherings where founders meet investors and operators, share what they are building, and develop relationships that continue beyond the evening.'}]},
  'startup-sourcing':{id:'startup-sourcing',kind:'project',title:'Startup Sourcing',lines:['Startup','Sourcing'],stage:'Ongoing collaboration',description:'Connecting early-stage founders with N1AC.',sections:[{body:'CANOPY helps source and introduce early-stage founders for N1AC pitch sessions and investor conversations, connecting relevant teams with a network of independent angel investors.'}]}
 };
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function markup(project,origin){
  const home=origin?.hash==='#home',back=home?'Home':'Projects';
  const nav=`<header class="detail-nav"><button type="button" data-detail-back>← ${home?'Home':'All projects'}</button><a href="#home" aria-label="Canopy home">CANOPY</a></header>`;
  if(!project)return `<article class="event-detail-content project-detail-content">${nav}<section class="detail-hero"><h1 id="event-page-title">Project unavailable.</h1></section></article>`;
  return `<article class="event-detail-content project-detail-content">${nav}<section class="detail-hero"><div class="detail-hero-copy"><h1 id="event-page-title">${project.lines.map(line=>`<span>${esc(line)}</span>`).join('')}</h1><div class="detail-hero-meta"><p class="detail-date">${esc(project.stage)}</p><button class="detail-read" type="button" data-detail-read aria-label="Read project details">The project <span aria-hidden="true">↓</span></button></div></div></section><div class="detail-body"><p class="project-detail-lead">${esc(project.description)}</p>${project.sections.map(s=>`<section class="project-detail-section"><p>${esc(s.body)}</p></section>`).join('')}<div class="project-detail-connect"><a class="text-link" href="#connect">Talk to us <span aria-hidden="true">↗</span></a></div><footer class="detail-footer"><button type="button" data-detail-back>Back to ${back} <span aria-hidden="true">↖</span></button></footer></div></article>`;
 }
 return {get:id=>Object.hasOwn(projects,id)?projects[id]:null,markup};
})();
