
const A='<span class="arrow" aria-hidden="true"></span>';
const projects=`<section class="project-reel" aria-label="Projects" tabindex="0">
<article class="project-slide">
<a class="project-focus-cover" href="#project-founder-dinners" aria-label="View Founder Dinners"><h2><span class="project-title-line">Founder</span><span class="project-title-line">Dinners</span></h2></a>
<div class="project-focus-caption"><p>Small gatherings for founders, investors, and operators.</p><span>Ongoing</span></div>
</article>
<article class="project-slide">
<a class="project-focus-cover" href="#project-startup-sourcing" aria-label="View Startup Sourcing"><h2><span class="project-title-line">Startup</span><span class="project-title-line">Sourcing</span></h2></a>
<div class="project-focus-caption"><p>Connecting early-stage founders with N1AC.</p><span>Ongoing collaboration</span></div>
</article>
</section>`;
const intro=(label,title,text)=>{
  const words=title.replace(/\.$/,'');
  return `<header class="page-intro"><h1 aria-label="${words}">${InkTitles.title(words)}</h1></header>`;
};
const views={
home:`<section class="hero" data-can-word="OPY"><div class="hero-layout invitation">
<figure class="invitation-image"><picture style="display:contents"><source type="image/avif" srcset="assets/images/canopy-800.avif 800w, assets/images/canopy-1600.avif 1600w, assets/images/canopy-2400.avif 2400w" sizes="(max-width:600px) calc(100vw - 56px), (max-width:900px) calc(100vw - 260px), calc(100vw - clamp(180px,15vw,218px) - clamp(30px,4vw,70px) - clamp(30px,4vw,70px))"><img src="assets/images/canopy-1600.webp" srcset="assets/images/canopy-800.webp 800w, assets/images/canopy-1600.webp 1600w, assets/images/canopy-2400.webp 2400w" sizes="(max-width:600px) calc(100vw - 56px), (max-width:900px) calc(100vw - 260px), calc(100vw - clamp(180px,15vw,218px) - clamp(30px,4vw,70px) - clamp(30px,4vw,70px))" width="2400" height="1800" decoding="async" fetchpriority="high" alt="Sunlight through a canopy of trees"></picture></figure>
<div class="invitation-intro">
<h2>For young builders.</h2>
<p class="invitation-description">Started at <span class="stanford-accent">Stanford</span>, Canopy is a community for young builders to meet, exchange ideas, and find the people to build with.</p>
</div>
</div></section>
<section class="home-chapter home-join" data-can-word="JOIN">
<div class="chapter-content"><div class="chapter-meta"><a href="#events" class="text-link">All events ${A}</a></div>
<div class="event-list" data-event-list="home"></div></div></section>
<section class="home-chapter home-build" data-can-word="BUILD"><div class="chapter-content"><div class="chapter-meta"><a class="text-link" href="#projects">All projects ${A}</a></div>${projects}</div></section>
<section class="home-chapter home-read" data-can-word="READ"><div class="chapter-content">${CanopyRead.teaser()}</div></section>`,
projects:`${intro('Ideas → People → Projects','Projects.','Bring an idea. Find people to work on it with.')}${projects}`,
events:`${intro('Come along','What’s on.','Find a date that works for you.')}<div class="event-admin" data-event-admin></div><div class="event-list" data-event-list="all"></div>`,
people:`${intro('The community','People.','The people making Canopy.')}<a class="people-membership" href="#join">Become a Canopy member <span aria-hidden="true">+</span></a><div class="people-grid" id="public-people"></div>`,
members:`<section class="room-coming-soon" aria-labelledby="room-soon-title">
<header class="room-soon-header"><a href="#home" class="room-soon-return"><span aria-hidden="true">←</span> Back to Canopy</a><span>Room</span></header>
<div class="room-soon-message"><h1 id="room-soon-title">Coming <em>soon.</em></h1></div>

</section>`};
const main=document.querySelector('#main'),shell=document.querySelector('#shell'),dialog=document.querySelector('#dialog');

const storyWords={"CAN": "<svg viewBox=\"0 0 355.1 166\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M354.783 162.151C341.54 161.935 328.295 161.928 315.052 162.125C296.908 135.105 277.509 104.644 260.298 77.1605C259.949 105.392 260.364 133.968 260.192 162.28C243.701 162.558 227.208 162.644 210.715 162.538L139.654 162.556L155.79 124.519L189.647 124.455C183.5 108.178 174.709 87.059 167.764 71.0384C159.529 91.0092 151.141 110.916 142.599 130.756C138.525 140.159 133.569 152.468 128.658 161.134C103.773 166.344 70.4545 167.793 47.0296 157.464C28.0587 149.149 13.185 133.615 5.7005 114.301C-2.2936 93.269 -2.02459 66.181 7.42511 45.6497C16.1794 26.9389 31.93 12.415 51.2874 5.20344C73.469 -2.95996 96.1166 0.0304042 117.15 9.82063C115.627 24.1753 114.937 41.7604 114.006 56.4183C100.588 45.4924 88.3608 36.7498 69.9368 42.2659C60.8657 44.9815 53.2754 51.2449 48.888 59.6351C43.1105 70.6745 42.4727 86.4845 46.0599 97.9915C52.5966 118.962 71.5103 127.865 92.0247 120.877C106.771 115.856 104.921 111.047 110.843 98.4769C122.27 74.2234 132.098 49.651 143.716 25.5091C147.2 18.2282 150.01 10.6708 153.677 3.44172C163.205 3.23336 172.734 3.12143 182.264 3.10774C186.209 13.0907 191.137 23.3788 195.423 33.306C202.889 50.9818 210.586 68.5582 218.513 86.0325C218.976 76.9076 218.668 65.73 218.67 56.4798L218.627 3.34602C232.209 3.29809 245.791 3.36913 259.371 3.55891C266.358 16.2613 278.804 33.7012 287.104 46.4134C295.603 59.4318 303.817 73.2861 312.258 86.0335C312.413 58.4638 312.414 30.8923 312.262 3.32258L355.064 3.40656L354.783 162.151Z\"/></svg>", "OPY": "<svg viewBox=\"346 0 380 166\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M420.679 0.51008C445.976 -2.6133 473.21 8.87459 489.987 27.6458C501.321 40.3268 505.698 51.3252 509.605 67.4495C510.12 46.3743 509.428 24.9487 509.436 3.79133L551.075 3.81281C561.486 3.81672 578.04 2.88519 587.316 5.74738C629.313 18.9291 631.125 76.6366 603.44 104.701C588.238 120.112 571.399 117.737 551.384 117.71L551.428 162.793L509.381 162.743C509.411 143.802 509.914 122.346 509.11 103.552C507.602 107.865 505.721 112.801 503.781 116.912C494.359 136.946 477.318 152.38 456.451 159.778C435.631 167.074 412.765 165.813 392.873 156.267C364.5 142.4 346 113.8 346 82.5C346 61 352 47 365.03 30.3646C378.507 13.4606 399.303 2.88623 420.679 0.51008ZM494.542 78.6693C490.324 59.6391 457.38 45.9874 420.921 48.1614C384.385 50.3396 358.168 67.5831 362.396 86.6546C366.624 105.725 399.693 119.386 436.216 117.15C472.662 114.918 498.761 97.6992 494.542 78.6693ZM580.887 64.6488C583.377 39.9973 570.697 39.5818 551.517 39.9017C551.551 53.1049 551.292 67.4672 551.65 80.5697C560.762 80.511 568.464 81.2696 576.119 75.7239C578.924 72.1858 580.428 69.1906 580.887 64.6488Z\"/><path d=\"M424.473 48.1646C443.775 45.9601 461.216 59.8041 463.45 79.1021C465.683 98.3998 451.865 115.861 432.571 118.125C413.235 120.393 395.729 106.539 393.49 87.1998C391.252 67.8598 405.131 50.3735 424.473 48.1646Z\"/><path d=\"M683.133 3.23569C697.421 3.08015 711.711 3.08504 726 3.25232C717.249 27.8424 703.84 58.16 693.751 82.6258C692.123 86.9897 687.615 95.8829 686.765 99.8145C685.577 105.313 686.068 117.643 686.079 123.824L686.087 161.57C672.414 161.27 658.21 161.454 644.495 161.48L644.383 122.121C644.372 118.984 644.481 104.098 643.939 102.109C641.496 93.1595 635.52 79.3871 632.78 70.3912C631.546 66.3413 605.093 9.53946 604.303 3.41469C618.01 3.12318 632.396 3.30905 646.156 3.27677C650.205 16.2668 659.294 38.199 664.47 50.6041C671.18 35.1606 677.136 19.004 683.133 3.23569Z\"/><path d=\"M435.124 77.5154L449.058 83.658L435.124 89.8007L428.981 103.737L422.838 89.8007L408.904 83.658L422.838 77.5154L428.981 63.5859L435.124 77.5154Z\" class=\"story-star\"/></svg>", "JOIN": "<svg viewBox=\"0 0 472 166\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M70 3H112V109C112 147 91 166 55 166C21 166 0 148 0 113V94H41V110C41 122 46 128 55 128C65 128 70 122 70 109Z\" transform=\"translate(0 0)\" fill-rule=\"evenodd\"/><path d=\"M83 0C130 0 166 36 166 83C166 130 130 166 83 166C36 166 0 130 0 83C0 36 36 0 83 0ZM83 42C59 42 43 59 43 83C43 107 59 124 83 124C107 124 123 107 123 83C123 59 107 42 83 42Z\" transform=\"translate(117 0)\" fill-rule=\"evenodd\"/><path d=\"M0 3H42V163H0Z\" transform=\"translate(288 0)\" fill-rule=\"evenodd\"/><path d=\"M0 3H41L94 86V3H137V163H97L42 77V163H0Z\" transform=\"translate(335 0)\" fill-rule=\"evenodd\"/></svg>", "BUILD": "<svg viewBox=\"0 0 554 166\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M0 3H64C106 3 121 18 121 46C121 64 114 75 100 82C117 88 124 101 124 120C124 149 104 163 66 163H0ZM42 39V66H63C75 66 80 61 80 52C80 43 75 39 63 39ZM42 98V127H66C78 127 83 123 83 113C83 103 78 98 66 98Z\" transform=\"translate(0 0)\" fill-rule=\"evenodd\"/><path d=\"M0 3H42V100C42 118 50 127 66 127C82 127 90 118 90 100V3H132V103C132 145 108 166 66 166C24 166 0 145 0 103Z\" transform=\"translate(129 0)\" fill-rule=\"evenodd\"/><path d=\"M0 3H42V163H0Z\" transform=\"translate(266 0)\" fill-rule=\"evenodd\"/><path d=\"M0 3H42V124H103V163H0Z\" transform=\"translate(313 0)\" fill-rule=\"evenodd\"/><path d=\"M0 3H58C107 3 133 33 133 83C133 133 107 163 58 163H0ZM42 42V124H55C78 124 90 112 90 83C90 54 78 42 55 42Z\" transform=\"translate(421 0)\" fill-rule=\"evenodd\"/></svg>", "READ": "<svg viewBox=\"0 0 529 166\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M0 3H63C104 3 126 20 126 54C126 79 117 94 97 102L132 163H83L53 110H42V163H0ZM42 41V74H61C76 74 83 69 83 57C83 46 76 41 61 41Z\" transform=\"translate(0 0)\" fill-rule=\"evenodd\"/><path d=\"M0 3H103V42H42V65H96V101H42V124H103V163H0Z\" transform=\"translate(137 0)\" fill-rule=\"evenodd\"/><path d=\"M0 163L59 3H87L146 163H51L67 125H94L72 71L34 163Z\" transform=\"translate(245 0)\" fill-rule=\"evenodd\"/><path d=\"M0 3H58C107 3 133 33 133 83C133 133 107 163 58 163H0ZM42 42V124H55C78 124 90 112 90 83C90 54 78 42 55 42Z\" transform=\"translate(396 0)\" fill-rule=\"evenodd\"/></svg>"};
const normalLogo=document.querySelector('#logo').innerHTML;
let stopStory=()=>{};
function setupStory(home){
  stopStory();shell.classList.toggle('home-story-mode',home);
  if(!home)return;
  const anchor=document.createElement('div');anchor.className='can-anchor';anchor.setAttribute('aria-hidden','true');anchor.innerHTML=storyWords.CAN;main.prepend(anchor);
  main.querySelectorAll('[data-can-word]').forEach((chapter,i)=>{
    const heading=document.createElement('div');heading.className='chapter-head'+(i===0?' first':'');heading.setAttribute('role','heading');heading.setAttribute('aria-level',i===0?'1':'2');heading.setAttribute('aria-label',i===0?'Canopy':'Can '+chapter.dataset.canWord.toLowerCase());heading.innerHTML=storyWords[chapter.dataset.canWord];chapter.prepend(heading);
    if(i){const point=document.createElement('span');point.className='story-snap-point';point.setAttribute('aria-hidden','true');chapter.prepend(point)}
  });
  stopStory=CanopyStoryScroll.mount({main,anchor,blocked:()=>dialog.open||CanopyEventPage.active});
}
let transitionCleanup=()=>{},activeInkStage=null;
function resetViewScroll(){
  window.scrollTo({top:0,left:0,behavior:'instant'});
  main.scrollTo({top:0,left:0,behavior:'instant'});
}
function displayParts(root){
  const heading=root.querySelector('.page-intro .ink-word,.workspace-head .ink-word');
  if(heading)return [heading];
  const can=root.querySelector('.can-anchor>svg');
  if(!can)return [];
  const baseline=can.getBoundingClientRect().top;
  const words=[...root.querySelectorAll('.chapter-head>svg')];
  const word=words.sort((a,b)=>Math.abs(a.getBoundingClientRect().top-baseline)-Math.abs(b.getBoundingClientRect().top-baseline))[0];
  return [can,...(word&&Math.abs(word.getBoundingClientRect().top-baseline)<can.getBoundingClientRect().height*.65?[word]:[])];
}
function renderView(name,quiet=false){
  const crossesRoom=main.firstChild&&((name==='members')!==(shell.dataset.view==='members'));
  if(crossesRoom&&!quiet&&!matchMedia('(prefers-reduced-motion:reduce)').matches){
    RoomFlow.start(()=>{
      transitionCleanup();CanopyForum.stopMotion();InkTitles.stopBlink();stopStory();
      route(true);
    });return;
  }
  const interrupted=activeInkStage?.snapshot();
  const outgoingParts=displayParts(main),outgoingDisplay=interrupted||InkTitles.capture(outgoingParts);
  // Freeze the current pixels before cancelling an interrupted animation.
  // Computed layout and nested scroll offsets must survive the shell changing.
  const old=!quiet&&main.firstChild&&!matchMedia('(prefers-reduced-motion:reduce)').matches?RoomFlow.freezeView(main):null;
  transitionCleanup();CanopyForum.stopMotion();InkTitles.stopBlink();
  main.innerHTML='<div class="view">'+views[name]+'</div>';
  shell.classList.toggle('compact',name==='members');shell.dataset.view=name;document.body.classList.toggle('projects-page',name==='projects');
  document.querySelectorAll('[data-route]').forEach(a=>{a.classList.toggle('active',a.dataset.route===name);if(a.dataset.route===name)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
  window.scrollTo(0,0);main.scrollTop=0;CanopyEvents.mount();setupStory(name==='home');CanopyForum.mount(main);CanopyRead.mount(main);
  // Measure the destination title only after the page and its scroller are at
  // their initial positions, including the agenda's nested scroll container.
  resetViewScroll();
  if(!old||matchMedia('(prefers-reduced-motion:reduce)').matches){old?.remove();InkTitles.rest(main);return}
  const incomingParts=displayParts(main),incomingDisplay=InkTitles.capture(incomingParts);
  const ease='cubic-bezier(.22,1,.36,1)',animations=[];
  const play=(el,frames,options)=>{if(!el)return;const animation=el.animate(frames,{fill:'both',easing:ease,...options});animations.push(animation);return animation};
  let stage=null;
  if(outgoingDisplay&&incomingDisplay){
    stage=InkTitles.transition(outgoingDisplay,incomingDisplay);activeInkStage=stage;animations.push(stage);
    incomingParts.forEach(el=>el.style.visibility='hidden');
    old.querySelectorAll('.page-intro h1,.workspace-head h1,.can-anchor>svg,.chapter-head>svg').forEach(el=>el.style.setProperty('opacity','0','important'));
  }
  const fadeOld=play(old,[{opacity:1},{opacity:0}],{duration:300,easing:'cubic-bezier(.4,0,.6,1)'});
  fadeOld.finished.then(()=>old.remove()).catch(()=>{});
  const title=main.querySelector('.page-intro');
  if(title){
    if(!stage)play(title.querySelector('h1'),[{opacity:0,transform:'translateY(25px)'},{opacity:1,transform:'none'}],{duration:360,delay:0});
    play(title.querySelector('.intro-rule'),[{transform:'scaleX(0)'},{transform:'scaleX(1)'}],{duration:360,delay:30});
    play(title.querySelector('p'),[{opacity:0,transform:'translateY(16px)'},{opacity:1,transform:'none'}],{duration:320,delay:40});
    [...main.querySelector('.view').children].filter(el=>el!==title).forEach((el,i)=>play(el,name==='events'?[{opacity:0},{opacity:1}]:[{opacity:0,transform:'translateY(24px)'},{opacity:1,transform:'none'}],{duration:360,delay:40+Math.min(i,3)*25}));
  }else{
    const body=main.querySelectorAll('.hero-layout,.opening-note,.section-head,.event-row,.chapter-content,.read-body,.workspace');
    body.forEach(el=>play(el,[{opacity:0,transform:'translateY(24px)'},{opacity:1,transform:'none'}],{duration:360,delay:40}));
    // Later chapter words remain in normal document flow.
    main.querySelectorAll('.chapter-head:not(.first)').forEach(el=>play(el,[{opacity:0},{opacity:1}],{duration:360,delay:40}));
    if(!stage)play(main,[{opacity:0},{opacity:1}],{duration:360,delay:0});
  }
  let cleaned=false;
  const revealTitle=()=>{
    incomingParts.forEach(el=>el.style.removeProperty('visibility'));
    if(activeInkStage===stage)activeInkStage=null;
  };
  const cleanup=(settled=false)=>{
    if(cleaned)return;cleaned=true;revealTitle();stage?.cancel();old.remove();animations.forEach(a=>a.cancel());
    window.removeEventListener('wheel',finishAtViewport);window.removeEventListener('touchmove',finishAtViewport);window.removeEventListener('resize',finishAtViewport);
    if(settled)InkTitles.rest(main);
  };
  const finishAtViewport=()=>cleanup(true);
  transitionCleanup=()=>cleanup(false);
  window.addEventListener('wheel',finishAtViewport,{passive:true,once:true});
  window.addEventListener('touchmove',finishAtViewport,{passive:true,once:true});
  window.addEventListener('resize',finishAtViewport,{once:true});
  stage?.finished.then(()=>{if(!cleaned)revealTitle()});
  Promise.all(animations.map(a=>a.finished)).then(()=>cleanup(true)).catch(()=>{});
}

function modal(content){document.querySelector('#dialog-body').innerHTML=content;dialog.showModal()}
let navigationRevision=0;
function route(quiet=false){const revision=++navigationRevision;if(RoomFlow.active&&!quiet){RoomFlow.defer(()=>route());return}let name=location.hash.slice(1)||'home';if(name.startsWith('person-')){if(shell.dataset.view!=='people')renderView('people',true);transitionCleanup();const requested=location.hash;CanopyForum.ready.then(()=>{if(revision===navigationRevision&&location.hash===requested)CanopyEventPage.open(name.slice(7),'person')});return}if(name==='read'||name.startsWith('read-')||name.startsWith('event-')||name.startsWith('project-')){const kind=name==='read'||name.startsWith('read-')?'read':name.startsWith('project-')?'project':'event';if(!main.firstChild)renderView(kind==='read'?'home':kind==='project'?'projects':'events',true);transitionCleanup();CanopyEventPage.open(name==='read'?CanopyRead.featuredId:name.slice(kind==='read'?5:kind==='project'?8:6),kind);return}if(CanopyEventPage.active){CanopyEventPage.close().then(()=>{if(revision===navigationRevision&&(location.hash.slice(1)||'home')!==shell.dataset.view)route(true)});return}if(name==='about'){history.replaceState(null,'',location.pathname+location.search+'#home');name='home';}if(['join','connect','contact'].includes(name)){if(!main.firstChild)renderView('home',true);history.replaceState(null,'',location.pathname+location.search+'#'+(shell.dataset.view||'home'));(name==='join'?CanopyJoin:CanopyConnect).open();return}if(name==='manage-content'){if(!main.firstChild)renderView('home',true);history.replaceState(null,'',location.pathname+location.search+'#home');CanopyReadManager.manage();return}if(name==='manage-events'){if(shell.dataset.view!=='events')renderView('events',true);history.replaceState(null,'',location.pathname+location.search+'#events');CanopyEvents.manage();return}if(name==='signin'){history.replaceState(null,'',location.pathname+location.search+'#members');name='members';}if(name==='members'||name.startsWith('discussion-')||name.startsWith('room-')){if(shell.dataset.view==='members'){transitionCleanup();CanopyForum.navigate();return}renderView('members',quiet);return}if(views[name]){renderView(name,quiet);return}if(name==='join'||name==='contact'||name==='new-idea')modal('<span class="eyebrow">Design preview · nothing is sent</span><h2>'+(name==='join'?'Come on in.':name==='new-idea'?'What’s your idea?':'Say hello.')+'</h2><form id="sample-form"><label>Your name<input name="name" required placeholder="Name"></label><label>'+(name==='join'?'A little about you':'Your message')+'<textarea rows="3" name="message" required placeholder="Start here…"></textarea></label><button class="button" type="submit">Preview submission '+A+'</button></form>');else if(name==='thread')modal('<span class="eyebrow">Sample conversation</span><h2>Room for a reply.</h2><p>In the member area, conversations include replies, polls and project links. Public visitors don’t see this discussion.</p><a href="#members" data-dismiss class="text-link">Back to discussions '+A+'</a>');}
window.addEventListener('hashchange',()=>{if(dialog.open)dialog.close();route()});document.querySelector('.close').onclick=()=>dialog.close();dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});

document.addEventListener('click',e=>{const same=e.target.closest('a[href]');if(same&&same.getAttribute('href')===location.hash){e.preventDefault();if(views[location.hash.slice(1)]){transitionCleanup();resetViewScroll()}else route()}const f=e.target.closest('[data-filter]');if(f){document.querySelectorAll('[data-filter]').forEach(b=>b.classList.toggle('active',b===f));document.querySelectorAll('.project-card').forEach(c=>c.hidden=f.dataset.filter!=='all'&&c.dataset.stage!==f.dataset.filter)}if(e.target.closest('[data-compose]')){location.hash='new-idea'}const b=e.target.closest('[data-board]');if(b){if(b.dataset.board==='discussions')return;modal('<span class="eyebrow">Member workspace / Design preview</span><h2>'+b.textContent+'.</h2><p>'+({ideas:'Collect ideas, find collaborators and track project stages.',members:'Find members by interests and connect with them.',messages:'Private conversations between connected members.',calendar:'Member events and RSVP in one place.'}[b.dataset.board])+'</p><button class="button light" data-dismiss>Back to discussions '+A+'</button>')}if(e.target.closest('[data-dismiss]'))dialog.close();const demo=e.target.closest('[data-demo]');if(demo)demo.textContent=demo.dataset.demo});document.addEventListener('submit',e=>{if(e.target.id==='sample-form'){e.preventDefault();modal('<span class="eyebrow">Preview only</span><h2>That’s the flow.</h2><p>No information was sent or saved. This form shows the proposed interaction.</p><button class="button light" data-dismiss>Back to the design '+A+'</button>')}});
document.querySelectorAll('[data-route]').forEach(a=>a.insertAdjacentHTML('beforeend',A));
Promise.all([document.fonts.ready,CanopyForum.ready,CanopyEvents.ready,CanopyReadManager.ready]).then(()=>route());
