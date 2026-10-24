/* A short, private introduction for people and partners connecting with Canopy. */
window.CanopyConnect=(()=>{
 const card=document.createElement('dialog');card.id='connect-card';card.setAttribute('aria-labelledby','connect-card-title');document.body.append(card);
 const KEY='canopy-connect-draft-v3';
 const roles={Builder:'Builder',Founder:'Founder',VC:'VC',Angel:'Angel investor',Company:'Brand / company'};
 let requestId=crypto.randomUUID(),busy=false,received=false,opener=null,deliveryAnimations=[],receiptBlink=null;
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');
 reduced.addEventListener('change',()=>{if(reduced.matches){deliveryAnimations.forEach(animation=>animation.cancel());receiptBlink?.cancel();}});
 function data(){return Object.fromEntries(new FormData(card.querySelector('form')));}
 function save(){try{sessionStorage.setItem(KEY,JSON.stringify({data:data(),requestId}));}catch{}}

 function build(){
  receiptBlink?.cancel();receiptBlink=null;
  card.style.removeProperty('height');card.classList.remove('connect-received','connect-delivering');
  card.innerHTML=`<button class="connect-close" type="button" aria-label="Close contact card">×</button>
  <div class="connect-face"><header class="connect-brand"><span>CANOPY</span><h2 id="connect-card-title" tabindex="-1">Let’s connect.</h2></header>
  <form id="connect-card-form" novalidate>
   <div class="connect-identity"><input aria-label="Your name" name="name" autocomplete="name" maxlength="80" placeholder="Your name" required><input aria-label="Company or team (optional)" name="organization" autocomplete="organization" maxlength="160" placeholder="Company / team (optional)"></div>
   <fieldset class="connect-roles"><legend class="connect-sr">How you’d like to connect</legend><div class="connect-chips">${Object.entries(roles).map(([value,label])=>`<label class="connect-chip"><input type="radio" name="role" value="${value}" required><span>${label}</span></label>`).join('')}</div></fieldset>
   <div class="connect-details"><input aria-label="Email" type="email" name="email" autocomplete="email" maxlength="254" placeholder="Email" required><input aria-label="Website or profile (optional)" name="link" type="url" maxlength="500" placeholder="Website / profile (optional)" inputmode="url"></div>
   <textarea aria-label="What brings you here?" name="introduction" rows="1" maxlength="1500" placeholder="What brings you here?" required></textarea>
   <p class="connect-error" role="alert" hidden></p><footer class="connect-card-foot"><span>Shared only with Canopy.</span><button class="connect-send" type="submit">Send card <span aria-hidden="true">↗</span></button></footer>
  </form></div>`;
  requestId=crypto.randomUUID();received=false;
  try{const draft=JSON.parse(sessionStorage.getItem(KEY));if(draft?.data){for(const el of card.querySelectorAll('input,textarea')){const value=draft.data[el.name];if(el.type==='radio')el.checked=el.value===value;else if(typeof value==='string')el.value=value;}if(/^[a-f0-9-]{36}$/i.test(draft.requestId))requestId=draft.requestId;}}catch{}

 }
 function message(text){const el=card.querySelector('.connect-error');el.textContent=text;el.hidden=false;el.scrollIntoView({block:'nearest'});}
 function open(){opener=document.activeElement;if(!card.firstChild||(received&&!busy))build();if(!card.open)card.showModal();card.querySelector('h2').focus({preventScroll:true});}
 document.addEventListener('click',e=>{if(!e.target.closest('a[href="#connect"],a[href="#contact"]'))return;e.preventDefault();e.stopImmediatePropagation();open();},true);
 card.addEventListener('click',e=>{const r=card.getBoundingClientRect(),outside=e.target===card&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom);if(e.target.closest('.connect-close,.connect-done')||outside)card.close();});
 card.addEventListener('close',()=>{deliveryAnimations.forEach(animation=>animation.cancel());receiptBlink?.cancel();opener?.focus({preventScroll:true});});
 card.addEventListener('input',e=>{if(busy)return;e.target.setCustomValidity?.('');requestId=crypto.randomUUID();card.querySelector('.connect-error').hidden=true;save();});
 card.addEventListener('change',()=>{if(!busy)save();});
 card.addEventListener('submit',async e=>{
  e.preventDefault();if(busy)return;const form=e.target,d=data();
  if(!roles[d.role]){message('Choose how you’d like to connect.');form.querySelector('[name=role]').focus();return;}
  for(const el of form.querySelectorAll('input,textarea')){if(el.required&&el.type!=='radio')el.setCustomValidity(el.value.trim()?'':'Please fill in this field.');if(!el.checkValidity()){el.reportValidity();return;}}
  if(d.link){try{const url=new URL(d.link);if(!['http:','https:'].includes(url.protocol)||url.username||url.password)throw new Error();}catch{message('Use a full public link starting with https://.');return;}}
  const button=form.querySelector('.connect-send'),started=performance.now();busy=true;button.innerHTML='<span role="status">Sending…</span><span class="connect-sending-arrow" aria-hidden="true">↗</span>';button.classList.add('is-sending');form.setAttribute('aria-busy','true');form.querySelectorAll('input,textarea,button').forEach(el=>el.disabled=true);
  try{
   const response=await fetch('/api/forum',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify({action:'joinApplication',requestId,name:d.name,email:d.email,organization:d.organization,introduction:d.introduction,profile:{version:3,role:d.role,links:d.link?[d.link]:[]}}),signal:AbortSignal.timeout(15000)});
   let result;try{result=await response.json();}catch{throw new Error('Couldn’t reach Canopy. Please try again.');}if(!response.ok)throw new Error(result.error||'Couldn’t save your introduction. Please try again.');
   received=true;try{sessionStorage.removeItem(KEY);}catch{}
   // One continuous handoff inside the same paper surface.
   await new Promise(resolve=>setTimeout(resolve,Math.max(0,(reduced.matches?150:450)-(performance.now()-started))));
   const face=card.querySelector('.connect-face');
   const bounds=card.getBoundingClientRect(),buttonBounds=button.getBoundingClientRect();
   const source={x:buttonBounds.left-bounds.left+buttonBounds.width/2,y:buttonBounds.top-bounds.top+buttonBounds.height/2,rx:buttonBounds.width/2,ry:buttonBounds.height/2};
   if(card.open)card.style.height=bounds.height+'px';
   card.classList.add('connect-received','connect-delivering');
   face.inert=true;face.setAttribute('aria-hidden','true');face.querySelector('h2').removeAttribute('id');
   card.querySelector('.connect-close').setAttribute('aria-label','Close introduction');
   card.insertAdjacentHTML('beforeend',`<div class="connect-success"><div class="connect-back-brand">CANOPY</div><div class="connect-back-main"><h2 id="connect-card-title" tabindex="-1" aria-live="polite" aria-atomic="true">Card<br>received.</h2>${InkTitles.eyeMark()}</div><div class="connect-back-foot"><p>Thanks for introducing yourself.</p><button class="connect-done" type="button">Done <span aria-hidden="true">↗</span></button></div></div>`);
   if(card.open&&!reduced.matches){
    const receipt=card.querySelector('.connect-success');
    // The button's black ink grows into the reverse face. All frames use the
    // same smooth contour topology, so the edge flows rather than crossfades.
    const reach=Math.max(...[[0,0],[bounds.width,0],[0,bounds.height],[bounds.width,bounds.height]].map(([x,y])=>Math.hypot(x-source.x,y-source.y)))*1.16;
    const inkEdge=t=>{
     const points=Array.from({length:12},(_,i)=>{
      const angle=i*Math.PI/6;
      const ripple=Math.sin(Math.PI*t)*(.07*Math.sin(angle*3-t*4)+.035*Math.cos(angle*2+t*5));
      return [source.x+Math.cos(angle)*(source.rx+(reach-source.rx)*t)*(1+ripple),source.y+Math.sin(angle)*(source.ry+(reach-source.ry)*t)*(1+ripple)];
     });
     let d=`M${points[0].join(',')}`;
     for(let i=0;i<points.length;i++){
      const a=points[(i+11)%12],b=points[i],c=points[(i+1)%12],e=points[(i+2)%12];
      d+=`C${b[0]+(c[0]-a[0])/6},${b[1]+(c[1]-a[1])/6} ${c[0]-(e[0]-b[0])/6},${c[1]-(e[1]-b[1])/6} ${c.join(',')}`;
     }
     return `path('${d}Z')`;
    };
    deliveryAnimations=[
     receipt.animate(Array.from({length:17},(_,i)=>({clipPath:inkEdge(i/16),offset:i/16})),{duration:860,easing:'cubic-bezier(.55,0,.2,1)',fill:'both'}),
     ...[...receipt.children].map((child,i)=>child.animate([{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'translateY(0)'}],{duration:400,delay:220+i*40,easing:'cubic-bezier(.22,1,.36,1)',fill:'both'}))
    ];
    await Promise.all(deliveryAnimations.map(animation=>animation.finished.catch(()=>{})));
   }
   face.remove();card.classList.remove('connect-delivering');
   deliveryAnimations.forEach(animation=>animation.cancel());deliveryAnimations=[];
   if(card.open){
    card.querySelector('h2').focus({preventScroll:true});
    if(!reduced.matches)receiptBlink=card.querySelector('.connect-receipt-lid').animate([
     {transform:'scaleY(1) rotate(0deg)',offset:0},
     {transform:'scaleY(.06) rotate(-3deg)',offset:.32},
     {transform:'scaleY(.06) rotate(-3deg)',offset:.42},
     {transform:'scaleY(1) rotate(0deg)',offset:1}
    ],{duration:360,delay:180,easing:'cubic-bezier(.4,0,.2,1)'});
   }
   // Let the confirmed receipt and wink register before the closing message.
   // This acknowledges storage, without suggesting a person has already read it.
   if(card.open)await new Promise(resolve=>setTimeout(resolve,1050));
   const title=card.querySelector('#connect-card-title'),note=card.querySelector('.connect-back-foot p');
   const words=[title,note];
   if(card.open&&!reduced.matches){
    deliveryAnimations=words.map(el=>el.animate([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(-4px)'}],{duration:130,easing:'ease-in',fill:'both'}));
    await Promise.all(deliveryAnimations.map(animation=>animation.finished.catch(()=>{})));
   }
   title.innerHTML='You’re on<br>our radar.';
   note.innerHTML='Your card is with the Canopy team.<br>We’ll be in touch.';
   deliveryAnimations.forEach(animation=>animation.cancel());deliveryAnimations=[];
   if(card.open&&!reduced.matches){
    deliveryAnimations=words.map(el=>el.animate([{opacity:0,transform:'translateY(4px)'},{opacity:1,transform:'translateY(0)'}],{duration:320,easing:'cubic-bezier(.22,1,.36,1)',fill:'both'}));
    await Promise.all(deliveryAnimations.map(animation=>animation.finished.catch(()=>{})));
    deliveryAnimations.forEach(animation=>animation.cancel());deliveryAnimations=[];
   }
  }catch(err){message(err.name==='TimeoutError'||err.name==='AbortError'?'The connection took too long. Your draft is safe—please try again.':err instanceof TypeError?'Couldn’t connect. Your draft is safe—please try again.':err.message);}
  finally{busy=false;form.querySelectorAll('input,textarea,button').forEach(el=>el.disabled=false);form.removeAttribute('aria-busy');button.classList.remove('is-sending');button.innerHTML='Send card <span aria-hidden="true">↗</span>';}
 });
 return {open};
})();
