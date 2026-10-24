/* Presentation polish is optional; content and navigation work without motion. */
(() => {
 const main=document.querySelector('#main');
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const seen=new WeakSet(),animations=new Set();
 const observer=new IntersectionObserver(entries=>{
  for(const entry of entries){
   if(!entry.isIntersecting)continue;
   observer.unobserve(entry.target);
   if(reduced.matches)continue;
   const motion=entry.target.animate([
    {opacity:.2,transform:'translateY(14px)'},
    {opacity:1,transform:'translateY(0)'}
   ],{duration:480,easing:'cubic-bezier(.16,1,.3,1)',fill:'none'});
   animations.add(motion);motion.finished.finally(()=>animations.delete(motion)).catch(()=>{});
  }
 },{threshold:.1,rootMargin:'0px 0px -20px 0px'});
 function mount(){
  observer.disconnect();
  for(const el of main.querySelectorAll('.invitation-intro,.project-slide,.event-poster-caption,.read-statement,.atlas-band')){
   if(seen.has(el))continue;seen.add(el);observer.observe(el);
  }
 }
 const updates=new MutationObserver(mount);updates.observe(main,{childList:true});
 reduced.addEventListener('change',()=>{if(reduced.matches)for(const motion of animations)motion.cancel();});
 mount();
})();
