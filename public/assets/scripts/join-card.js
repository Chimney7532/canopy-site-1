/* Four short screens create a structured, private introduction. */
window.CanopyJoin=(()=>{
 const card=document.createElement('dialog');card.id='join-card';card.setAttribute('aria-labelledby','join-card-title');document.body.append(card);
 const KEY='canopy-join-draft-v2',roles=['Student','Working professional','Founder','Researcher','Between things','Other'],skills=['Engineering','Design','Research','Business','Writing','Community','Still exploring'],goals=['Find collaborators','Join a project','Develop an idea','Meet people','Find support','Support teams'],stages=['Just exploring','I have an idea','Already building','Something is live'],availability=['Occasionally','1–3 hours a week','4–8 hours a week','8+ hours a week','Not sure yet'];
 const titles=['Join Canopy.','Your work.','Your interests.','Review.'];
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const options=list=>'<option value="">Choose one</option>'+list.map(v=>`<option>${v}</option>`).join('');
 const chips=(name,list)=>list.map(v=>`<label class="join-chip"><input type="checkbox" name="${name}" value="${v}"><span>${v}</span></label>`).join('');
 let requestId=crypto.randomUUID(),busy=false,received=false,opener=null,step=0;
 function data(){const fd=new FormData(card.querySelector('form'));return Object.fromEntries([...fd].filter(([k])=>!['skills','goals'].includes(k)).concat([['skills',fd.getAll('skills')],['goals',fd.getAll('goals')]]));}
 function save(){try{sessionStorage.setItem(KEY,JSON.stringify({data:data(),step,requestId}));}catch{}}
 function build(){
  card.innerHTML=`<button class="join-close" type="button" aria-label="Close introduction">×</button><header class="join-heading"><h2 id="join-card-title" tabindex="-1"></h2><span class="join-count" aria-live="polite"></span></header>
  <ol class="join-progress" aria-label="Introduction steps">${['You','Your work','Your next step','Review'].map(t=>`<li aria-label="${t}"></li>`).join('')}</ol>
  <form id="join-card-form" novalidate>
  <section class="join-step" data-step="0"><div class="join-fields">
   <label>Name<input name="name" autocomplete="name" maxlength="80"  required></label>
   <label>Email<input type="email" name="email" autocomplete="email" maxlength="254" placeholder="you@example.com" required></label>
   <label class="join-wide">Role<select name="role" required>${options(roles)}</select></label>
   <label>School / organization <small>Optional</small><input name="organization" autocomplete="organization" maxlength="160" ></label>
   <label>City or time zone <small>Optional</small><input name="location" maxlength="120" ></label>
  </div></section>
  <section class="join-step" data-step="1" hidden><div class="join-fields">
   <label class="join-wide">Your project or idea<textarea name="introduction" rows="2" maxlength="1500" placeholder="What would you like to make or explore?" required></textarea></label>
   <label class="join-wide">Stage <small>Optional</small><select name="stage">${options(stages)}</select></label>
   <fieldset class="join-wide"><legend>Skills <small>Optional · up to 5</small></legend><div class="join-chips">${chips('skills',skills)}</div></fieldset>
   <details class="join-extra join-wide"><summary>Add interests or links <small>Optional</small></summary><div class="join-fields"><label class="join-wide">Interests <small>Optional</small><input name="interests" maxlength="300" placeholder="e.g. climate, film, robotics, community spaces"></label>
   <label class="join-wide">Links <small>Optional</small><textarea name="links" rows="2" maxlength="1502" placeholder="Up to 3 links, one per line."></textarea></label></div></details>
  </div></section>
  <section class="join-step" data-step="2" hidden><div class="join-fields">
   <fieldset class="join-wide"><legend>Looking for</legend><div class="join-chips">${chips('goals',goals)}</div></fieldset>
   <label class="join-wide">Time available <small>Optional</small><select name="availability">${options(availability)}</select></label>
  </div></section>
  <section class="join-step join-review" data-step="3" hidden></section>
  <p class="join-error" role="alert" hidden></p>
  <footer class="join-card-foot"><button class="join-back" type="button">Back</button><button class="join-send" type="submit">Continue</button></footer>
  </form>`;
  requestId=crypto.randomUUID();received=false;step=0;
  try{const draft=JSON.parse(sessionStorage.getItem(KEY));if(draft&&draft.data){for(const el of card.querySelectorAll('input,textarea,select')){const v=draft.data[el.name];if(el.type==='checkbox')el.checked=Array.isArray(v)&&v.includes(el.value);else if(typeof v==='string')el.value=v;}if(/^[a-f0-9-]{36}$/i.test(draft.requestId))requestId=draft.requestId;step=Math.min(3,Math.max(0,Number(draft.step)||0));}}catch{}
  if(data().interests||data().links)card.querySelector('.join-extra').open=true;
  show(step,false);
 }
 function review(){const d=data(),row=(label,value)=>value?`<div><dt>${label}</dt><dd>${esc(value)}</dd></div>`:'';
  card.querySelector('.join-review').innerHTML=`<section class="join-summary"><div class="join-summary-head"><h3>${esc(d.name)}</h3><button type="button" data-edit="0">Edit</button></div><p class="join-summary-email">${esc(d.email)}</p><dl>${row('Currently',[d.role,d.organization,d.location].filter(Boolean).join(' · '))}</dl></section>
  <section class="join-summary"><div class="join-summary-head"><h3>Project / idea</h3><button type="button" data-edit="1">Edit</button></div><p class="join-review-intro">${esc(d.introduction)}</p><dl>${row('Stage',d.stage)}${row('Can bring',d.skills.join(', '))}${row('Interests',d.interests)}${row('Links',d.links)}</dl></section>
  <section class="join-summary"><div class="join-summary-head"><h3>Looking for</h3><button type="button" data-edit="2">Edit</button></div><p>${esc(d.goals.join(' · '))}</p><dl>${row('Time',d.availability)}</dl></section>`;
 }
 function show(n,focus=true){step=n;card.querySelectorAll('.join-step').forEach((el,i)=>el.hidden=i!==step);card.querySelectorAll('.join-progress li').forEach((el,i)=>{el.classList.toggle('is-done',i<step);i===step?el.setAttribute('aria-current','step'):el.removeAttribute('aria-current');});card.querySelector('.join-count').textContent=`${step+1} / 4`;card.querySelector('h2').textContent=titles[step];card.querySelector('.join-back').hidden=step===0;card.querySelector('.join-send').textContent=step===3?'Send request':'Next';card.querySelector('.join-error').hidden=true;if(step===3)review();card.scrollTop=0;if(focus)card.querySelector('h2').focus({preventScroll:true});}
 function message(text){const error=card.querySelector('.join-error');error.textContent=text;error.hidden=false;error.scrollIntoView({block:'nearest'});}
 function validate(n){const panel=card.querySelector(`[data-step="${n}"]`);for(const el of panel.querySelectorAll('input,textarea,select')){if(el.required&&el.type!=='checkbox')el.setCustomValidity(!el.value.trim()?'Please fill in this field.':'');if(!el.checkValidity()){if(step!==n)show(n);el.reportValidity();return false;}}
  const d=data();if(n===1){if(d.skills.length>5){message('Choose up to five things you could bring.');return false;}const lines=d.links.split('\n').map(s=>s.trim()).filter(Boolean);if(lines.length>3){card.querySelector('.join-extra').open=true;message('Add up to three links, one per line.');return false;}for(const line of lines){try{const url=new URL(line);if(!['http:','https:'].includes(url.protocol)||url.username||url.password)throw new Error();}catch{card.querySelector('.join-extra').open=true;message('Use full links starting with https://, one per line.');return false;}}}
  if(n===2&&(d.goals.length<1||d.goals.length>5)){message('Choose one to five things you’d like from Canopy.');return false;}return true;
 }
 function open(){opener=document.activeElement;if(!card.firstChild||received)build();if(!card.open)card.showModal();card.querySelector('h2').focus({preventScroll:true});}
 document.addEventListener('click',e=>{if(!e.target.closest('a[href="#join"]'))return;e.preventDefault();e.stopImmediatePropagation();open();},true);
 card.addEventListener('click',e=>{const r=card.getBoundingClientRect(),outside=e.target===card&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom);if(e.target.closest('.join-close,.join-done')||outside)card.close();if(busy)return;if(e.target.closest('.join-back')){show(Math.max(0,step-1));save();}const edit=e.target.closest('[data-edit]');if(edit){show(Number(edit.dataset.edit));save();}});
 card.addEventListener('close',()=>opener?.focus({preventScroll:true}));
 card.addEventListener('input',e=>{if(busy)return;if(e.target.setCustomValidity)e.target.setCustomValidity('');requestId=crypto.randomUUID();save();});
 card.addEventListener('change',()=>{if(!busy)save();});
 card.addEventListener('submit',async e=>{
  e.preventDefault();if(busy)return;if(step<3){if(validate(step)){show(step+1);save();}return;}
  for(let i=0;i<3;i++){show(i,false);if(!validate(i))return;}show(3,false);
  const form=e.target,d=data(),button=form.querySelector('.join-send');busy=true;button.textContent='Sending…';form.setAttribute('aria-busy','true');form.querySelectorAll('input,textarea,select,button').forEach(el=>el.disabled=true);
  const payload={action:'joinApplication',requestId,name:d.name,email:d.email,organization:d.organization,introduction:d.introduction,profile:{version:2,role:d.role,location:d.location,skills:d.skills,interests:d.interests,stage:d.stage,links:d.links.split('\n').map(s=>s.trim()).filter(Boolean),goals:d.goals,availability:d.availability}};
  try{
   const response=await fetch('/api/forum',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify(payload),signal:AbortSignal.timeout(15000)});
   let result;try{result=await response.json();}catch{throw new Error('Couldn’t reach Canopy. Please try again.');}if(!response.ok)throw new Error(result.error||'Couldn’t save your introduction. Please try again.');
   received=true;try{sessionStorage.removeItem(KEY);}catch{}card.innerHTML=`<button class="join-close" type="button" aria-label="Close introduction">×</button><div class="join-success"><span class="join-check" aria-hidden="true">✓</span><h2 id="join-card-title" tabindex="-1">Request sent.</h2><p>We’ll follow up by email.</p><button class="join-send join-done" type="button">Done</button></div>`;if(card.open)card.querySelector('h2').focus({preventScroll:true});
  }catch(err){message(err.name==='TimeoutError'||err.name==='AbortError'?'The connection took too long. Your draft is safe—please try again.':err instanceof TypeError?'Couldn’t connect. Your draft is safe—please try again.':err.message);}
  finally{busy=false;form.querySelectorAll('input,textarea,select,button').forEach(el=>el.disabled=false);form.removeAttribute('aria-busy');button.textContent='Send request';}
 });
 return {open};
})();
