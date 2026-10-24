// Calendar dates stay in the visitor's local calendar, never UTC-converted.
globalThis.CanopyEventDates={
 today(now=new Date()){return [now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-');},
 home(events,today){
  const ordered=[...events].sort((a,b)=>a.date.localeCompare(b.date)||String(a.id||'').localeCompare(String(b.id||'')));
  const upcoming=ordered.filter(e=>e.date>=today),past=ordered.filter(e=>e.date<today);
  if(upcoming.length===1&&past.length)return {featured:past.at(-1),next:upcoming[0]};
  return {featured:upcoming[0]||past.at(-1)||null,next:upcoming[1]||null};
 },
 program(events,today){
  const ordered=[...events].sort((a,b)=>a.date.localeCompare(b.date)||String(a.id||'').localeCompare(String(b.id||'')));
  const current=ordered.find(e=>e.date>=today)||ordered.find(e=>e.date===ordered.at(-1)?.date);
  return {events:ordered,anchorId:current?.id??null};
 }
};
