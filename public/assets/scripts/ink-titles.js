(() => {
'use strict';
const NS='http://www.w3.org/2000/svg';
const make=(name,attrs={})=>{const el=document.createElementNS(NS,name);Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,v));return el};
const split=d=>d.match(/[Mm][^Mm]*/g)||[];
const lerp=(a,b,t)=>a+(b-a)*t;
const clamp=t=>Math.max(0,Math.min(1,t));
const phase=(t,a,b)=>clamp((t-a)/(b-a));
const ease=t=>t*t*t*(t*(t*6-15)+10);
const polygon=pts=>'M'+pts.map(p=>p.map(v=>v.toFixed(2)).join(',')).join('L')+'Z';
const paper='#f4f1ea',ink='#171715';
let serial=0;
const DATA={"source": {"can": "M354.783 162.151C341.54 161.935 328.295 161.928 315.052 162.125C296.908 135.105 277.509 104.644 260.298 77.1605C259.949 105.392 260.364 133.968 260.192 162.28C243.701 162.558 227.208 162.644 210.715 162.538L139.654 162.556L155.79 124.519L189.647 124.455C183.5 108.178 174.709 87.059 167.764 71.0384C159.529 91.0092 151.141 110.916 142.599 130.756C138.525 140.159 133.569 152.468 128.658 161.134C103.773 166.344 70.4545 167.793 47.0296 157.464C28.0587 149.149 13.185 133.615 5.7005 114.301C-2.2936 93.269 -2.02459 66.181 7.42511 45.6497C16.1794 26.9389 31.93 12.415 51.2874 5.20344C73.469 -2.95996 96.1166 0.0304042 117.15 9.82063C115.627 24.1753 114.937 41.7604 114.006 56.4183C100.588 45.4924 88.3608 36.7498 69.9368 42.2659C60.8657 44.9815 53.2754 51.2449 48.888 59.6351C43.1105 70.6745 42.4727 86.4845 46.0599 97.9915C52.5966 118.962 71.5103 127.865 92.0247 120.877C106.771 115.856 104.921 111.047 110.843 98.4769C122.27 74.2234 132.098 49.651 143.716 25.5091C147.2 18.2282 150.01 10.6708 153.677 3.44172C163.205 3.23336 172.734 3.12143 182.264 3.10774C186.209 13.0907 191.137 23.3788 195.423 33.306C202.889 50.9818 210.586 68.5582 218.513 86.0325C218.976 76.9076 218.668 65.73 218.67 56.4798L218.627 3.34602C232.209 3.29809 245.791 3.36913 259.371 3.55891C266.358 16.2613 278.804 33.7012 287.104 46.4134C295.603 59.4318 303.817 73.2861 312.258 86.0335C312.413 58.4638 312.414 30.8923 312.262 3.32258L355.064 3.40656L354.783 162.151Z", "opy": "M420.679 0.51008C445.976 -2.6133 473.21 8.87459 489.987 27.6458C501.321 40.3268 505.698 51.3252 509.605 67.4495C510.12 46.3743 509.428 24.9487 509.436 3.79133L551.075 3.81281C561.486 3.81672 578.04 2.88519 587.316 5.74738C629.313 18.9291 631.125 76.6366 603.44 104.701C588.238 120.112 571.399 117.737 551.384 117.71L551.428 162.793L509.381 162.743C509.411 143.802 509.914 122.346 509.11 103.552C507.602 107.865 505.721 112.801 503.781 116.912C494.359 136.946 477.318 152.38 456.451 159.778C435.631 167.074 412.765 165.813 392.873 156.267C364.5 142.4 346 113.8 346 82.5C346 61 352 47 365.03 30.3646C378.507 13.4606 399.303 2.88623 420.679 0.51008ZM494.542 78.6693C490.324 59.6391 457.38 45.9874 420.921 48.1614C384.385 50.3396 358.168 67.5831 362.396 86.6546C366.624 105.725 399.693 119.386 436.216 117.15C472.662 114.918 498.761 97.6992 494.542 78.6693ZM580.887 64.6488C583.377 39.9973 570.697 39.5818 551.517 39.9017C551.551 53.1049 551.292 67.4672 551.65 80.5697C560.762 80.511 568.464 81.2696 576.119 75.7239C578.924 72.1858 580.428 69.1906 580.887 64.6488Z", "pupil": "M424.473 48.1646C443.775 45.9601 461.216 59.8041 463.45 79.1021C465.683 98.3998 451.865 115.861 432.571 118.125C413.235 120.393 395.729 106.539 393.49 87.1998C391.252 67.8598 405.131 50.3735 424.473 48.1646Z", "y": "M683.133 3.23569C697.421 3.08015 711.711 3.08504 726 3.25232C717.249 27.8424 703.84 58.16 693.751 82.6258C692.123 86.9897 687.615 95.8829 686.765 99.8145C685.577 105.313 686.068 117.643 686.079 123.824L686.087 161.57C672.414 161.27 658.21 161.454 644.495 161.48L644.383 122.121C644.372 118.984 644.481 104.098 643.939 102.109C641.496 93.1595 635.52 79.3871 632.78 70.3912C631.546 66.3413 605.093 9.53946 604.303 3.41469C618.01 3.12318 632.396 3.30905 646.156 3.27677C650.205 16.2668 659.294 38.199 664.47 50.6041C671.18 35.1606 677.136 19.004 683.133 3.23569Z", "star": "M435.124 77.5154L449.058 83.658L435.124 89.8007L428.981 103.737L422.838 89.8007L408.904 83.658L422.838 77.5154L428.981 63.5859L435.124 77.5154Z"}};
const customLetters={
 P:[114,'M0 3L42 3C53 3 77 2 86 5C126 18 127 75 101 103C87 118 62 117 42 117L42 163H0ZM69 64C72 40 60 39 42 40V81C51 81 59 81 65 76C68 73 69 69 69 64Z'],
 R:[122,'M0 3H56C97 3 115 20 115 54C115 77 107 91 90 99L122 163H76L43 105H42V163H0ZM42 40V73H56C70 73 77 69 77 57C77 45 70 40 56 40Z'],
 O:[166,'M75 0C100 -3 127 9 144 28C160 46 166 66 166 84C166 120 144 149 110 160C88 168 66 166 47 156C19 143 0 114 0 83C0 61 6 47 19 30C32 13 54 3 75 0Z'],
 J:[92,'M50 3H92V109C92 147 73 166 43 166C14 166 0 148 0 113V98H36V111C36 123 38 128 43 128C48 128 50 122 50 109Z'],
 E:[122,'M0 3H122L119 42H42V65H114L111 102H42V125H126L122 163H0Z'],
 C:[125,'M117 10L114 56C100 45 88 37 70 42C61 45 53 51 49 60C43 71 42 86 46 98C53 119 72 128 92 121C104 117 109 110 118 99L125 145C110 160 81 169 55 162C21 156 0 126 0 84C0 47 16 20 51 5C73 -3 96 0 117 10Z'],
 T:[112,'M0 3H112L109 43H77V163H35V43H0Z'],
 S:[114,'M109 10L106 52C93 42 80 38 64 38C53 38 47 42 47 49C47 56 53 60 71 66C100 76 114 87 114 113C114 147 92 166 56 166C34 166 14 160 0 152L4 110C20 122 36 128 56 128C68 128 74 124 74 117C74 110 67 106 48 100C19 91 5 76 5 51C5 19 29 0 64 0C83 0 98 4 109 10Z']
};

Object.assign(customLetters,{
 A:[146,'M0 163L59 3H87L146 163H51L67 125H94L72 71L34 163Z'],
 B:[124,'M0 3H64C106 3 121 18 121 46C121 64 114 75 100 82C117 88 124 101 124 120C124 149 104 163 66 163H0ZM42 39V66H63C75 66 80 61 80 52C80 43 75 39 63 39ZM42 98V127H66C78 127 83 123 83 113C83 103 78 98 66 98Z'],
 D:[133,'M0 3H58C107 3 133 33 133 83C133 133 107 163 58 163H0ZM42 42V124H55C78 124 90 112 90 83C90 54 78 42 55 42Z'],
 H:[137,'M0 3H42V64H95V3H137V163H95V105H42V163H0Z'],
 I:[42,'M0 3H42V163H0Z'],
 L:[103,'M0 3H42V124H103V163H0Z'],
 M:[177,'M0 163V3H45L88 74L131 3H177V163H135V76L101 129H76L42 76V163Z'],
 N:[137,'M0 3H41L94 86V3H137V163H97L42 77V163H0Z'],
 U:[132,'M0 3H42V100C42 118 50 127 66 127C82 127 90 118 90 100V3H132V103C132 145 108 166 66 166C24 166 0 145 0 103Z'],
 W:[202,'M0 3H44L63 103L86 3H122L146 103L162 3H204L169 163H126L104 77L81 163H38Z'],
 "'": [32,'M0 3H32L24 50H0Z'],
 ' ':[35,'']
});

// Preserve the logo's O contour; close only the seam formerly shared with P.
customLetters.O=[166,split(DATA.source.opy)[0].replace(/C510\.12[\s\S]*?509\.11 103\.552/,'C512.41 79.4 512.28 92.7 509.11 103.552')];
const aperturePath=split(DATA.source.opy)[1];
function restingEye(at=428.981,secondary=false){
 const prefix=secondary?'data-eye':'data-ink';
 return `<g data-ink-eye ${secondary?'data-ink-secondary':''} transform="translate(${at-428.981} 0)"><path data-eye-rest-backdrop d="${aperturePath}" fill="${ink}" style="fill:${ink}" stroke="${ink}" stroke-width="1"/><g data-ink-blink><path ${prefix}-aperture d="${aperturePath}" fill="${paper}" style="fill:${paper}"/><g data-ink-gaze><path ${prefix}-pupil d="${DATA.source.pupil}" fill="${ink}" style="fill:${ink}"/><path ${prefix}-star d="${DATA.source.star}" fill="${paper}" style="fill:${paper}"/></g></g></g>`;
}
function title(word){
 word=word.toUpperCase().replaceAll('’',"'");
 const tracking={P:-5,R:-8,O:-4,J:9,E:-7,C:-7,T:-7,S:-3};
 // Optical AB forms retain the 42-unit stem rather than scaling the whole word.
 const letters=word==='ABOUT'?{...customLetters,
  A:[126,'M0 163L50 3H79L126 163H45L59 125H80L64 73L33 163Z'],
  B:[114,'M0 3H56C96 3 111 18 111 46C111 64 104 75 90 82C107 88 114 101 114 120C114 149 94 163 58 163H0ZM42 39V66H55C67 66 72 61 72 52C72 43 67 39 55 39ZM42 98V127H56C68 127 73 123 73 113C73 103 68 98 56 98Z']
 }:customLetters;
 if(word==='PROJECTS')tracking.R=-1;
 if(word==='PEOPLE')tracking.E=-1;
 if(word==='ABOUT'){tracking.A=-8;tracking.B=-2;}
 const advance=char=>(letters[char]||letters.E)[0]+(tracking[char]??2)+(char==="'"?12:0);
 const natural=[...word].reduce((sum,char)=>sum+advance(char),0);
 const roundWidth=[...word].filter(c=>c==='O').reduce((sum,c)=>sum+advance(c),0);
 const eventsTitle=word==="WHAT'S ON";
 const condensed=!eventsTitle&&natural>950?(950-roundWidth)/(natural-roundWidth):1;
 let x=0,eyeAt=null;const paths=[],extraEyes=[];
 let compactOpening=eventsTitle;
 for(const char of word){
  if(char===' ')compactOpening=false;
  const letterScale=char==='O'?1:condensed;
  const letterTracking=compactOpening?({W:-26,H:-32,A:-46,T:-9,"'":-3,S:-3}[char]??2):(eventsTitle&&char==='O'?-20:(tracking[char]??2));
  if(char=== "'")x+=(compactOpening?14:12)*letterScale;
  const [width,d]=letters[char]||letters.E;
  const eyeLetter=char==='O'&&eyeAt===null;
  if(eyeLetter)eyeAt=x+82.981;
  split(d).forEach((part,i)=>paths.push(`<path data-ink-part="${i?'hole':'body'}" d="${part}" transform="translate(${char==='O'?x-346:x}) scale(${letterScale} 1)" fill="${i?paper:ink}"/>`));
  if(char==='O'&&!eyeLetter)extraEyes.push(x+82.981);
  x+=(width+letterTracking)*letterScale;
 }
 if(eyeAt===null)eyeAt=x*.52;
 paths.push(restingEye(eyeAt));
 extraEyes.forEach(at=>paths.push(restingEye(at,true)));
 return `<svg class="ink-word" viewBox="0 0 ${x} 166" style="--word-width:${x}" aria-hidden="true" focusable="false">${paths.join('')}</svg>`;
}
const measure=make('svg',{width:0,height:0,'aria-hidden':'true'});measure.style.cssText='position:absolute;overflow:hidden;pointer-events:none';document.body.append(measure);
const contourCache=new Map();
function sample(d,matrix,n=160){
 const key=n+'|'+d;let pts=contourCache.get(key);
 if(!pts){
  const el=make('path',{d});measure.append(el);const length=el.getTotalLength();
  pts=Array.from({length:n},(_,i)=>{const q=el.getPointAtLength(i*length/n);return [q.x,q.y]});el.remove();
  // Cache reusable letter outlines, not snapshots of deforming polygons.
  if(d.length<3000){if(contourCache.size>160)contourCache.clear();contourCache.set(key,pts)}
 }
 return matrix?pts.map(([x,y])=>[matrix.a*x+matrix.c*y+matrix.e,matrix.b*x+matrix.d*y+matrix.f]):pts;
}
function capture(parts){
 if(!parts.length)return null;
 const contours=[],secondary=[];let aperture=null,eye=null,anchor=null,pupilD=null,starD=null;const rects=parts.map(el=>el.getBoundingClientRect());
 for(const part of parts){
  const paths=part.matches('path')?[part]:part.querySelectorAll('path');
  for(const el of paths){
   const d=el.getAttribute('d'),matrix=el.getScreenCTM();if(!d||!matrix)continue;
   if(el.closest('[data-ink-secondary]')||el.hasAttribute('data-eye-rest-backdrop'))continue;
   const isPupil=el.hasAttribute('data-ink-pupil')||d===DATA.source.pupil;
   if(el.hasAttribute('data-ink-star')||el.classList.contains('story-star')||d===DATA.source.star)continue;
   if(isPupil){
    eye={x:matrix.a*428.981+matrix.c*83.658+matrix.e,y:matrix.b*428.981+matrix.d*83.658+matrix.f,scale:Math.hypot(matrix.a,matrix.b)};
    // Gaze and blinking move inside the O; they do not move the title's anchor.
    const base=el.closest('[data-ink-eye]')?.getScreenCTM()||matrix;
    anchor={x:base.a*428.981+base.c*83.658+base.e,y:base.b*428.981+base.d*83.658+base.f,scale:Math.hypot(base.a,base.b)};
    const localShape=path=>polygon(sample(path,matrix,100).map(([x,y])=>[(x-eye.x)/eye.scale+428.981,(y-eye.y)/eye.scale+83.658]));
    pupilD=localShape(DATA.source.pupil);starD=localShape(DATA.source.star);continue;
   }
   split(d).forEach((sub,i)=>{
    const pts=sample(sub,matrix,i?100:220);
    if(el.hasAttribute('data-ink-aperture')||sub===split(DATA.source.opy)[1]){aperture=pts;return}
    contours.push({pts,hole:el.dataset.inkPart==='hole'||i>0});
   });
  }
 }
 for(const part of parts)for(const group of part.querySelectorAll('[data-ink-secondary]')){
  const m=group.getScreenCTM();
  secondary.push({x:m.a*428.981+m.e,y:m.d*83.658+m.f,scale:Math.hypot(m.a,m.b),
   shapes:[...group.querySelectorAll('path:not([data-eye-rest-backdrop])')].map(el=>({pts:sample(el.getAttribute('d'),el.getScreenCTM(),100),paper:el.hasAttribute('data-eye-aperture')||el.hasAttribute('data-eye-star')}))});
 }
 const bounds={left:Math.min(...rects.map(r=>r.left)),right:Math.max(...rects.map(r=>r.right)),top:Math.min(...rects.map(r=>r.top)),bottom:Math.max(...rects.map(r=>r.bottom))};
 if(!contours.length)return null;
 if(!eye){eye={x:(bounds.left+bounds.right)/2,y:(bounds.top+bounds.bottom)/2,scale:(bounds.bottom-bounds.top)/166};}
 if(!aperture)aperture=sample(aperturePath,{a:eye.scale,b:0,c:0,d:eye.scale,e:eye.x-428.981*eye.scale,f:eye.y-83.658*eye.scale},100);
 return {contours,eye,anchor:anchor||eye,pupilD,starD,aperture,bounds,secondary};
}
function usesAnchoredMotion(outgoing,incoming){
 const a=outgoing.anchor||outgoing.eye,b=incoming.anchor||incoming.eye;
 return Math.hypot(b.x-a.x,b.y-a.y)<=83*Math.min(a.scale,b.scale)
  &&Math.abs(b.y-a.y)<=2
  &&(!outgoing.frozen||outgoing.motion==='anchored');
}
function transition(outgoing,incoming){
 const id='ink-'+(++serial),unit=incoming.eye.scale/1.09;
 const width=innerWidth/unit,height=innerHeight/unit;
 const svg=make('svg',{viewBox:`0 0 ${width} ${height}`,'aria-hidden':'true'});svg.classList.add('ink-route-stage');
 // Captures use viewport pixels, including the reserved scrollbar gutter.
 // Percentage sizing shrinks this stage and snaps the letters on handoff.
 svg.style.cssText=`position:fixed;inset:0;width:${innerWidth}px;height:${innerHeight}px;pointer-events:none;z-index:60;overflow:visible`;document.body.append(svg);
 const normalize=c=>{const pts=c.pts.map(q=>q.map(v=>v/unit));return {pts,d:polygon(pts),ox:0,oy:0,scale:1,hole:c.hole,el:make('path')}};
 const from=outgoing.contours.map(normalize),to=incoming.contours.map(normalize);
 const origin={x:outgoing.eye.x/unit,y:outgoing.eye.y/unit};
 const targetEye={x:incoming.eye.x/unit,y:incoming.eye.y/unit,scale:incoming.eye.scale/unit};
 const ss=outgoing.eye.scale/unit;
 // Eye positions within half an O width settle along the baseline instead of jumping.
 const anchored=usesAnchoredMotion(outgoing,incoming);
 svg.dataset.motion=anchored?'anchored':'flight';
 const sourceAperture=outgoing.aperture.map(q=>q.map(v=>v/unit));
 const destAperture=incoming.aperture.map(q=>q.map(v=>v/unit));
 const body=make('g',{fill:ink}),holes=make('g',{fill:paper}),eye=make('g',{'data-flight-eye':''});svg.append(body,holes,eye);
 const defs=make('defs');svg.prepend(defs);
 const oldClip=make('clipPath',{id:id+'-old',clipPathUnits:'userSpaceOnUse'}),newClip=make('clipPath',{id:id+'-new',clipPathUnits:'userSpaceOnUse'});
 const oldEdge=make('path'),newEdge=make('path');oldClip.append(oldEdge);newClip.append(newEdge);defs.append(oldClip,newClip);
 const oldWord=make('g',{'clip-path':`url(#${id}-old)`});body.before(oldWord);
 from.forEach(c=>{c.sourceEl=make('path',{d:c.d,fill:c.hole?paper:ink});oldWord.append(c.sourceEl)});
 const oldAperture=make('path',{d:polygon(sourceAperture),fill:paper});oldWord.append(oldAperture);
 const secondaryEyes=(items,parent)=>items.map(item=>{
  const group=make('g');parent.append(group);
  return {...item,x:item.x/unit,y:item.y/unit,group,shapes:item.shapes.map(shape=>{
   const pts=shape.pts.map(q=>q.map(v=>v/unit)),el=make('path',{d:polygon(pts),fill:shape.paper?paper:ink});group.append(el);return {pts,el};
  })};
 });
 const departingEyes=secondaryEyes(outgoing.secondary||[],oldWord);
 const arrivingEyeLayer=make('g',{'clip-path':`url(#${id}-new)`});eye.before(arrivingEyeLayer);
 const arrivingEyes=secondaryEyes(incoming.secondary||[],arrivingEyeLayer);
 if(outgoing.frozen){
  from.forEach(c=>c.sourceEl.remove());oldAperture.remove();departingEyes.forEach(e=>e.group.remove());
  const frozen=make('g',{transform:`scale(${1/unit})`});frozen.append(outgoing.frozen);oldWord.append(frozen);
 }
 const departureAperture={pts:sourceAperture};
 const departureDrops=Array.from({length:3},()=>{const el=make('ellipse',{fill:ink});oldWord.append(el);return el});
 body.setAttribute('clip-path',`url(#${id}-new)`);holes.setAttribute('clip-path',`url(#${id}-new)`);
 const cavity=make('path',{fill:paper,'data-ink-cavity':''}),splash=make('g',{fill:ink});body.after(splash);eye.before(cavity);
 const pupilShape=make('path',{d:DATA.source.pupil,fill:ink}),pupilStar=make('path',{d:DATA.source.star,fill:paper});eye.append(pupilShape,pupilStar);
 const pupilContour={pts:sample(DATA.source.pupil,null,100)};
 // Only the title band needs an ink mask. Share it across all letter layers.
 const maskBox={x:Math.min(outgoing.bounds.left,incoming.bounds.left)/unit-100,y:Math.min(outgoing.bounds.top,incoming.bounds.top)/unit-180,
  width:(Math.max(outgoing.bounds.right,incoming.bounds.right)-Math.min(outgoing.bounds.left,incoming.bounds.left))/unit+200,
  height:(Math.max(outgoing.bounds.bottom,incoming.bounds.bottom)-Math.min(outgoing.bounds.top,incoming.bounds.top))/unit+360};
 const clearanceMask=make('mask',{id:id+'-clearance',maskUnits:'userSpaceOnUse',...maskBox,style:'mask-type:luminance'});
 const clearance=make('path',{fill:'black',stroke:'black','stroke-linejoin':'round'}),wake=make('path',{fill:'black'});
 clearanceMask.append(make('rect',{...maskBox,fill:'white'}),wake,clearance);defs.append(clearanceMask);
 const letters=make('g',{'mask':`url(#${id}-clearance)`});oldWord.before(letters);letters.append(oldWord,body,splash,holes);
 const flightPosition=t=>{
  const f=phase(t,outgoing.frozen?0:.04,.32),a=f*f*f,h=phase(t,.32,1);
  let x=lerp(origin.x,targetEye.x,a),y=lerp(origin.y,targetEye.y,a)-Math.sin(Math.PI*f)*112;
  if(outgoing.frozen){
   const h00=2*f*f*f-3*f*f+1,h10=f*f*f-2*f*f+f,h01=-2*f*f*f+3*f*f;
   const velocity=outgoing.velocity||[0,0];
   x=h00*origin.x+h10*velocity[0]*345/unit+h01*targetEye.x;
   y=h00*origin.y+h10*velocity[1]*345/unit+h01*targetEye.y-Math.pow(Math.sin(Math.PI*f),2)*65;
  }
  // Zero velocity at contact; the ink response grows out of the landing.
  const recoil=Math.pow(Math.sin(Math.PI*h),2)*Math.sin(h*Math.PI*3)*Math.exp(-h*4);
  return [x-recoil*18,y+recoil*11];
 };
 const droplets=Array.from({length:5},()=>{const el=make('ellipse');splash.append(el);return el});
 to.forEach(c=>{c.el.setAttribute('d',c.d);(c.hole?holes:body).append(c.el)});
 const resumePupil=outgoing.pupilD?sample(outgoing.pupilD,null,100):null;
 const resumeStar=outgoing.starD?sample(outgoing.starD,null,100):null;
 const starContour=sample(DATA.source.star,null,100);
 function blendRestingShape(path,initial,amount){
  if(!initial||amount>=1)return;
  if(amount<=0){path.setAttribute('d',polygon(initial));return;}
  const target=sample(path.getAttribute('d'),null,100);
  path.setAttribute('d',polygon(initial.map((q,i)=>q.map((v,j)=>lerp(v,target[i][j],amount)))));
 }
 function restoreStar(amount){
  pupilStar.setAttribute('d',resumeStar&&amount<1?polygon(resumeStar.map((q,i)=>q.map((v,j)=>lerp(v,starContour[i][j],amount)))):DATA.source.star);
 }
 let currentEye={...outgoing.eye},value=0,frame=0,done=false,finish;
 const finished=new Promise(resolve=>finish=resolve);
function paintAnchored(t){
 value=clamp(t);
 const blend=ease(phase(value,.04,.76));
 const ex=lerp(origin.x,targetEye.x,blend),ey=lerp(origin.y,targetEye.y,blend);
 const scale=lerp(ss,targetEye.scale,blend);
 currentEye={x:ex*unit,y:ey*unit,scale:scale*unit};
 const envelope=Math.pow(Math.sin(Math.PI*value),2);
 const pulse=Math.sin(Math.PI*phase(value,.04,.72));
 const rebound=Math.sin(Math.PI*phase(value,.58,1));
 const wave=pulse-.22*rebound;
 const shift=q=>{
  const dx=q[0]-ex,dy=q[1]-ey,r=Math.hypot(dx,dy)||1;
  const push=(wave*22+envelope*Math.sin(r*.045-value*11)*9)*Math.exp(-Math.pow(r/175,2));
  return [q[0]+dx/r*push,q[1]+dy/r*push*.65];
 };
 const change=ease(phase(value,.07,.69));
 const boundary=lerp(Math.max(outgoing.bounds.right,incoming.bounds.right)/unit+30,Math.min(outgoing.bounds.left,incoming.bounds.left)/unit-30,change);
 const points=Array.from({length:45},(_,i)=>{
  const y=-100+i*(height+200)/44;
  return [boundary+Math.sin(Math.PI*change)*Math.sin(y*.033+change*6)*10,y];
 });
 oldEdge.setAttribute('d',polygon([[-100,-100],...points,[-100,height+100]]));
 newEdge.setAttribute('d',polygon([[width+100,-100],...points,[width+100,height+100]]));
 oldWord.style.display=change===1?'none':'';
 oldAperture.style.display='none';
 if(change<1)from.forEach(c=>c.sourceEl.setAttribute('d',value===0||value===1?c.d:polygon(c.pts.map(shift))));
 to.forEach(c=>c.el.setAttribute('d',value===0||value===1?c.d:polygon(c.pts.map(shift))));
 const aperture=sourceAperture.map((q,i)=>{
  const p=destAperture[i],x=lerp(q[0],p[0],blend),y=lerp(q[1],p[1],blend);
  const dx=x-ex,dy=y-ey,angle=Math.atan2(dy,dx);
  const ripple=1+wave*(.095*Math.sin(angle*5-value*8)+.04*Math.sin(angle*9+value*5));
  return [ex+dx*(1+wave*.18)*ripple,ey+dy*(1+wave*.25)*ripple];
 });
 cavity.setAttribute('d',polygon(aperture));
 const stretch=1+wave*.18,squeeze=1-wave*.14;
 pupilShape.setAttribute('d',value===0||value===1?DATA.source.pupil:polygon(pupilContour.pts.map(q=>[428.981+(q[0]-428.981)*stretch,83.658+(q[1]-83.658)*squeeze])));
 blendRestingShape(pupilShape,resumePupil,ease(phase(value,0,.22)));
 restoreStar(ease(phase(value,0,.22)));
 pupilStar.removeAttribute('transform');
 eye.setAttribute('transform',`translate(${ex} ${ey}) scale(${scale}) translate(-428.981 -83.658)`);
 clearance.style.display='none';wake.style.display='none';splash.style.display='none';
 departureDrops.forEach(el=>el.style.display='none');
}
function paint(t){
 if(anchored){paintAnchored(t);return}
 value=clamp(t);
 const b=targetEye,flight=phase(value,outgoing.frozen?0:.04,.32),arrival=outgoing.frozen?ease(flight):flight*flight*flight;
 const after=phase(value,.32,1),opening=phase(value,.30,.48);
 const settle=after===1?1:1-Math.exp(-after*7)*Math.cos(after*10);
 const pulse=Math.sin(Math.PI*phase(value,.30,.66));
 const [ex,ey]=flightPosition(value);
 currentEye={x:ex*unit,y:ey*unit,scale:lerp(ss,b.scale,arrival)*unit};
 const animateCompanion=(item,open,pulse,shift)=>{
  item.shapes.forEach(({pts,el})=>el.setAttribute('d',polygon(pts.map(q=>{
   const dx=q[0]-item.x,dy=q[1]-item.y;
   return [item.x+dx*(1+pulse*.045)+shift,item.y+dy*open*(1-pulse*.12)];
  }))));
  item.group.style.visibility=open<.001?'hidden':'';
 };
 departingEyes.forEach(item=>{
  const release=phase(value,.025,.21),pull=Math.sin(release*Math.PI);
  animateCompanion(item,1-ease(release),pull,-pull*9);
 });
 arrivingEyes.forEach(item=>{
  const open=ease(phase(value,.405,.64));
  const response=Math.sin(Math.PI*phase(value,.365,.77));
  animateCompanion(item,open,response,response*5);
 });
 const clearing=ease(phase(value,.015,.065))*(1-ease(phase(value,.37,.52)));
 const partInk=q=>{
  const dx=q[0]-ex,dy=q[1]-ey,r=Math.hypot(dx,dy)||1;
  const push=clearing*9*Math.exp(-Math.pow((r-50)/35,2));
  return [q[0]+dx/r*push,q[1]+dy/r*push];
 };
 // A travelling ink edge replaces the word while the pupil is in flight.
 const change=ease(phase(value,.115,.295));
 const boundary=lerp(Math.max(outgoing.bounds.right,incoming.bounds.right)/unit+30,Math.min(outgoing.bounds.left,incoming.bounds.left)/unit-30,change);
 const edgePoints=Array.from({length:45},(_,i)=>{
  const y=-100+i*(height+200)/44;
  const ripple=Math.sin(Math.PI*change)*(Math.sin(y*.033+change*6)*13+Math.sin(y*.071)*5);
  return [boundary+ripple,y];
 });
 oldEdge.setAttribute('d',polygon([[-100,-100],...edgePoints,[-100,height+100]]));
 newEdge.setAttribute('d',polygon([[width+100,-100],...edgePoints,[width+100,height+100]]));
 oldWord.style.display=change===1?'none':'';
 // Departure uses the same viscous edge response as arrival, then closes behind the pupil.
 const release=phase(value,.012,.22),releasePulse=Math.sin(Math.PI*release);
 const close=1-ease(phase(value,.105,.22));
 const tug=Math.sin(Math.PI*phase(value,.025,.17));
 // Once the old word has been covered, its contours cannot contribute pixels.
 if(change<1)from.forEach(c=>{
  if(value===0){c.sourceEl.setAttribute('d',c.d);c.sourceEl.setAttribute('transform',`translate(${c.ox} ${c.oy}) scale(${c.scale})`);return}
  c.sourceEl.removeAttribute('transform');
  c.sourceEl.setAttribute('d',polygon(c.pts.map(q=>{
   const dx=q[0]-origin.x,dy=q[1]-origin.y,r=Math.hypot(dx,dy)||1;
   const local=Math.exp(-Math.pow(r/140,2));
   const force=releasePulse*(22+Math.sin(r*.045-release*11)*9)*local;
   const upper=clamp(-dy/70);
   return partInk([q[0]+dx/r*force-tug*local*upper*7,q[1]+dy/r*force*.7-tug*local*upper*35]);
  })));
 });
 if(value===0){oldAperture.setAttribute('d',polygon(sourceAperture));oldAperture.removeAttribute('transform')}
 else{
  oldAperture.removeAttribute('transform');
  oldAperture.setAttribute('d',polygon(departureAperture.pts.map(q=>{
   const dx=q[0]-origin.x,dy=q[1]-origin.y,angle=Math.atan2(dy,dx);
   const ripple=1+releasePulse*(.095*Math.sin(angle*5-release*9)+.04*Math.sin(angle*9+release*5));
   const swell=1+releasePulse*.25;
   return [origin.x+(dx*swell*ripple-7*tug)*close,origin.y+(dy*swell*ripple-30*tug)*close];
  })));
 }
 departureDrops.forEach((el,i)=>{
  const d=phase(value,.075,.205),angle=(-130+i*35)*Math.PI/180;
  const r=88+d*36,size=Math.sin(Math.PI*d)*(3+i);
  el.setAttribute('cx',origin.x+Math.cos(angle)*r);el.setAttribute('cy',origin.y+Math.sin(angle)*r);
  el.setAttribute('rx',size*.7);el.setAttribute('ry',size*1.4);
 });
 // The letters retain their outlines. Only ink close to the impact moves.
 to.forEach(c=>{
  c.el.removeAttribute('transform');
  const shifted=c.pts.map(q=>{
   const dx=q[0]-b.x,dy=q[1]-b.y,r=Math.hypot(dx,dy)||1;
   const local=Math.exp(-Math.pow(r/175,2));
   const wave=Math.sin(r*.045-after*11)*pulse*9*local;
   const force=(pulse*22)*local+wave;
   let sx=0,sy=0;
   arrivingEyes.forEach(item=>{
    const ax=q[0]-item.x,ay=q[1]-item.y,ar=Math.hypot(ax,ay)||1;
    const response=Math.sin(Math.PI*phase(value,.365,.77))*8*Math.exp(-Math.pow(ar/100,2));
    sx+=ax/ar*response;sy-=ay/ar*response*.6;
   });
   return partInk([q[0]+dx/r*force+sx,q[1]+dy/r*force*.70+sy]);
  });
  if(value===0){c.el.setAttribute('d',c.d);c.el.setAttribute('transform',`translate(${c.ox} ${c.oy}) scale(${c.scale})`)}
  else c.el.setAttribute('d',polygon(shifted));
 });
 // The cavity opens at contact, overshoots, then flows back around the pupil.
 const growth=1-Math.pow(1-opening,3);
 const wobble=Math.sin(Math.PI*phase(value,.30,.76));
 const edge=destAperture.map(q=>{
  const dx=q[0]-b.x,dy=q[1]-b.y,angle=Math.atan2(dy,dx);
  const ripple=1+wobble*(.095*Math.sin(angle*5-after*9)+.04*Math.sin(angle*9+after*5));
  return [b.x+dx*growth*(1+pulse*.18)*ripple,b.y+dy*growth*(1+pulse*.25)*ripple];
 });
 cavity.setAttribute('d',polygon(edge));
 const speed=Math.sin(Math.PI*flight);
 const rebound=phase(value,.30,.69);
 const spring=Math.sin(rebound*Math.PI*3)*Math.exp(-rebound*4);
 const stretch=1+speed*.30+tug*.22-spring*.62;
 const squeeze=1/Math.sqrt(stretch);
 // Use the actual trajectory, including an interrupted flight's tangent.
 const tangentAt=Math.min(.3199,Math.max(outgoing.frozen?0:.04,value));
 const ahead=flightPosition(tangentAt+.00005),behind=flightPosition(tangentAt-.00005);
 const vx=ahead[0]-behind[0],vy=ahead[1]-behind[1];
 const heading=Math.atan2(vy,vx),cs=Math.cos(heading),sn=Math.sin(heading);
 const soft=clamp(speed*.7+Math.abs(spring)*1.2+tug*.25);
 const pear=speed*.75+tug*.6;
 // Deform the outline itself: a narrow trailing end and a soft, fuller leading edge.
 if(value===0||value===1)pupilShape.setAttribute('d',value===0&&outgoing.pupilD?outgoing.pupilD:DATA.source.pupil);
 else {
  const shaped=pupilContour.pts.map(q=>{
  const dx=q[0]-428.981,dy=q[1]-83.658;
  const along=dx*cs+dy*sn,across=-dx*sn+dy*cs;
  const theta=Math.atan2(across,along),nx=along/35;
  const ripple=1+soft*(.048*Math.sin(theta*3-value*19)+.024*Math.sin(theta*5+value*13));
  const u=(along*stretch-pear*3*Math.pow(1-nx,2))*ripple;
  const v=across*squeeze*(1+pear*.16*nx)*ripple;
  return [428.981+u*cs-v*sn,83.658+u*sn+v*cs];
  });
  const mix=ease(phase(value,0,.12));
  pupilShape.setAttribute('d',polygon(resumePupil&&value<.12
   ?shaped.map((q,i)=>q.map((v,j)=>lerp(resumePupil[i][j],v,mix))):shaped));
 }
 restoreStar(ease(phase(value,0,.12)));
 const lag=4*speed+3*spring;
 const starAngle=12*Math.sin(Math.PI*flight)-spring*14;
 pupilStar.setAttribute('transform',`translate(${428.981-cs*lag} ${83.658-sn*lag}) rotate(${starAngle}) scale(${1+speed*.07-spring*.12} ${1-speed*.04+spring*.1}) translate(-428.981 -83.658)`);
 eye.setAttribute('transform',`translate(${ex} ${ey}) scale(${lerp(ss,b.scale,arrival)}) translate(-428.981 -83.658)`);
 // A moving negative-space channel follows the pupil, then closes behind it.
 clearance.setAttribute('d',pupilShape.getAttribute('d'));
 clearance.setAttribute('transform',eye.getAttribute('transform'));
 clearance.setAttribute('stroke-width',24*clearing);
 clearance.style.display=clearing>0?'':'none';
 const left=[],right=[];
 for(let i=0;i<=20;i++){
  const u=i/20,t=Math.max(.04,value-u*.075),q=flightPosition(t);
  const next=flightPosition(t+.001),prev=flightPosition(Math.max(.04,t-.001));
  const dx=next[0]-prev[0],dy=next[1]-prev[1],len=Math.hypot(dx,dy)||1;
  const width=38*Math.pow(1-u,1.6)*clearing;
  left.push([q[0]-dy/len*width,q[1]+dx/len*width]);
  right.push([q[0]+dy/len*width,q[1]-dx/len*width]);
 }
 wake.setAttribute('d',polygon([...left,...right.reverse()]));
 wake.style.display=value>.04&&value<.43?'':'none';
 droplets.forEach((el,i)=>{
  const d=phase(value,.32,.64),angle=(-155+i*58)*Math.PI/180;
  const radius=75+d*(42+i%2*22),size=Math.sin(Math.PI*d)*(4+i%3);
  el.setAttribute('cx',b.x+Math.cos(angle)*radius);el.setAttribute('cy',b.y+Math.sin(angle)*radius*.75);
  el.setAttribute('rx',size*1.45);el.setAttribute('ry',size*.65);
  el.setAttribute('transform',`rotate(${angle*180/Math.PI} ${b.x+Math.cos(angle)*radius} ${b.y+Math.sin(angle)*radius*.75})`);
 });
}

 const cancel=()=>{if(done)return;done=true;cancelAnimationFrame(frame);svg.remove();finish()};
 // Measure the actual on-screen arc, so long hops keep the same travel speed.
 const flightStart=outgoing.frozen?0:.04,flightEnd=.32,maxCruiseSpeed=.82;
 const arc=[{t:flightStart,d:0}];let arcLength=0,previous=flightPosition(flightStart);
 for(let i=1;i<=240;i++){
  const t=lerp(flightStart,flightEnd,i/240),point=flightPosition(t);
  arcLength+=Math.hypot(point[0]-previous[0],point[1]-previous[1])*unit;
  arc.push({t,d:arcLength});previous=point;
 }
 const launchMs=outgoing.frozen?0:35,rampMs=100,brakeMs=150,settleMs=580;
 // Arc-length pacing with continuous acceleration AND braking. The previous
 // constant-speed arrival reversed direction at contact in a single frame.
 const minimumFlightMs=380;
 const initialSpeed=outgoing.frozen?Math.hypot(...(outgoing.velocity||[0,0])):0;
 const flightMs=Math.max(minimumFlightMs,
  (arcLength-initialSpeed*rampMs/2)/maxCruiseSpeed+(rampMs+brakeMs)/2);
 const cruiseSpeed=Math.max(.001,(arcLength-initialSpeed*rampMs/2)/(flightMs-(rampMs+brakeMs)/2));
 const brakeAt=flightMs-brakeMs;
 const rampDistance=(initialSpeed+cruiseSpeed)*rampMs/2;
 const travelled=ms=>{
  if(ms<rampMs)return initialSpeed*ms+(cruiseSpeed-initialSpeed)*(ms/2-rampMs*Math.sin(Math.PI*ms/rampMs)/(2*Math.PI));
  if(ms<brakeAt)return rampDistance+cruiseSpeed*(ms-rampMs);
  const t=Math.min(brakeMs,ms-brakeAt);
  return rampDistance+cruiseSpeed*(brakeAt-rampMs)+cruiseSpeed*(t/2+brakeMs*Math.sin(Math.PI*t/brakeMs)/(2*Math.PI));
 };
 const totalMs=anchored?760:launchMs+flightMs+settleMs;
 svg.dataset.flightDistance=anchored?'0':arcLength.toFixed(2);svg.dataset.flightDuration=anchored?'0':flightMs.toFixed(2);svg.dataset.cruiseSpeed=String(cruiseSpeed*1000);
 const phaseAt=elapsed=>{
  if(elapsed<launchMs)return flightStart*elapsed/launchMs;
  const flightElapsed=elapsed-launchMs;
  if(flightElapsed>=flightMs)return lerp(flightEnd,1,clamp((flightElapsed-flightMs)/settleMs));
  const distance=travelled(flightElapsed);let lo=0,hi=arc.length-1;
  while(hi-lo>1){const mid=(lo+hi)>>1;if(arc[mid].d<distance)lo=mid;else hi=mid}
  const a=arc[lo],b=arc[hi];return lerp(a.t,b.t,(distance-a.d)/(b.d-a.d||1));
 };
 let began,lastTime,lastPosition,velocity=[0,0];
 function tick(now){
  if(done)return;began??=now;const elapsed=now-began;
  if(elapsed>=totalMs){paint(1);cancel();return}
  paint(anchored?elapsed/totalMs:phaseAt(elapsed));
  if(lastTime&&now>lastTime)velocity=[(currentEye.x-lastPosition.x)/(now-lastTime),(currentEye.y-lastPosition.y)/(now-lastTime)];
  lastTime=now;lastPosition={...currentEye};frame=requestAnimationFrame(tick);
 }
 const snapshot=()=>{
  const frozen=svg.cloneNode(true);frozen.querySelector('[data-flight-eye]')?.remove();
  frozen.removeAttribute('class');frozen.removeAttribute('style');
  frozen.setAttribute('width',innerWidth);frozen.setAttribute('height',innerHeight);
  return {...incoming,eye:{...currentEye},secondary:[],frozen,velocity:[...velocity],motion:anchored?'anchored':'flight',pupilD:pupilShape.getAttribute('d'),starD:pupilStar.getAttribute('d'),
   bounds:{left:Math.min(outgoing.bounds.left,incoming.bounds.left),right:Math.max(outgoing.bounds.right,incoming.bounds.right),top:Math.min(outgoing.bounds.top,incoming.bounds.top),bottom:Math.max(outgoing.bounds.bottom,incoming.bounds.bottom)}};
 };
 paint(0);frame=requestAnimationFrame(tick);return {cancel,finished,snapshot};
}
// Resting eyes share one frame loop; idle pages do not render continuously.
let gazeFrame=0,blinkTimer=0,eyes=[],lastTime=0,pointer=null,geometryDirty=true,activeRoot=null;
const reduced=matchMedia('(prefers-reduced-motion:reduce)');
const visibleEye=eye=>eye.el.isConnected&&eye.visible;
function measureEye(eye){
 const bounds=eye.svg.getBoundingClientRect();
 eye.visible=eye.el.isConnected&&bounds.bottom>0&&bounds.top<innerHeight&&bounds.right>0&&bounds.left<innerWidth&&getComputedStyle(eye.svg).visibility!=='hidden';
 if(!eye.visible)return;
 const m=eye.base.getScreenCTM();if(!m){eye.visible=false;return;}
 eye.center={x:m.a*428.981+m.c*83.658+m.e,y:m.b*428.981+m.d*83.658+m.f,scale:Math.max(.1,Math.hypot(m.a,m.b))};
}
function wakeEyes(){if(!gazeFrame&&eyes.length&&!reduced.matches&&!document.hidden){lastTime=0;gazeFrame=requestAnimationFrame(eyeTick);}}
function scheduleBlink(){
 clearTimeout(blinkTimer);blinkTimer=0;const visible=eyes.filter(visibleEye);if(!visible.length||reduced.matches||document.hidden||document.querySelector('dialog[open]'))return;
 blinkTimer=setTimeout(()=>{blinkTimer=0;wakeEyes();},Math.max(20,Math.min(...visible.map(eye=>eye.nextBlink))-performance.now()));
}
function eyeTick(now){
 gazeFrame=0;if(reduced.matches||document.hidden)return;
 const dt=Math.min(40,now-(lastTime||now-16));lastTime=now;let moving=false;
 // Read all geometry before mutating any SVG, and only after layout changes.
 if(geometryDirty){eyes.forEach(measureEye);geometryDirty=false;}
 const covered=!!document.querySelector('dialog[open]');
 eyes.forEach((eye,i)=>{
  if(!eye.el.isConnected)return;
  const visible=!covered&&visibleEye(eye),c=eye.center;
  if(!visible){if(eye.blinkStart!==null)eye.lid.removeAttribute('transform');eye.blinkStart=null;eye.nextBlink=Math.max(eye.nextBlink,now+1600);return;}
  const dx=pointer&&c?pointer.x-c.x:0,dy=pointer&&c?pointer.y-c.y:0;
  const tx=Math.tanh(dx/Math.max(140,c.scale*130))*15,ty=Math.tanh(dy/Math.max(180,c.scale*160))*6;
  const rate=1-Math.exp(-dt/(100+i*15));
  eye.x+=(tx-eye.x)*rate;eye.y+=(ty-eye.y)*rate;
  if(Math.abs(tx-eye.x)+Math.abs(ty-eye.y)>.02)moving=true;
  const transform=`translate(${eye.x.toFixed(3)} ${eye.y.toFixed(3)})`;
  if(transform!==eye.lastTransform){eye.el.setAttribute('transform',transform);eye.lastTransform=transform;}
  if(now>=eye.nextBlink&&eye.blinkStart===null)eye.blinkStart=now;
  if(eye.blinkStart!==null){
   const t=clamp((now-eye.blinkStart)/300);
   const opening=t<.3?1-ease(t/.3):t<.39?0:ease((t-.39)/.61);
   eye.lid.setAttribute('transform',`translate(428.981 83.658) scale(1 ${Math.max(.008,opening)}) translate(-428.981 -83.658)`);
   if(t<1)moving=true;
   else{eye.lid.removeAttribute('transform');eye.blinkStart=null;eye.nextBlink=now+3200+Math.random()*3000;}
  }
 });
 if(moving)gazeFrame=requestAnimationFrame(eyeTick);else{lastTime=0;scheduleBlink();}
}
function stopBlink(){
 clearTimeout(blinkTimer);cancelAnimationFrame(gazeFrame);blinkTimer=gazeFrame=0;lastTime=0;
 eyes.forEach(eye=>eye.lid.removeAttribute('transform'));eyes=[];
}
function prepareLogo(svg){
 if(!svg||svg.querySelector('[data-ink-eye]'))return;
 const paths=[...svg.querySelectorAll('path')],pupil=paths.find(path=>path.getAttribute('d')===DATA.source.pupil);
 if(!pupil)return;
 pupil.remove();paths.find(path=>path.getAttribute('d')===DATA.source.star)?.remove();
 svg.insertAdjacentHTML('beforeend',restingEye());
}
function rest(root){
 stopBlink();activeRoot=root;
 prepareLogo(root.querySelector('[data-can-word="OPY"] .chapter-head svg'));
 prepareLogo(document.querySelector('#logo svg'));
 const svgs=[...root.querySelectorAll('.page-intro svg,.workspace-head svg,[data-can-word="OPY"] .chapter-head svg'),document.querySelector('#logo svg')].filter(Boolean);
 const now=performance.now();
 eyes=svgs.flatMap(svg=>[...svg.querySelectorAll('[data-ink-eye]')].map(base=>({base,svg,el:base.querySelector('[data-ink-gaze]'),lid:base.querySelector('[data-ink-blink]'),x:0,y:0,blinkStart:null,nextBlink:now+1400+Math.random()*1800})));
 eyes.forEach(eye=>eye.el.removeAttribute('transform'));geometryDirty=true;
 if(reduced.matches)return;wakeEyes();scheduleBlink();
}
document.addEventListener('pointermove',event=>{if(event.pointerType==='touch')return;pointer={x:event.clientX,y:event.clientY};wakeEyes();},{passive:true});
document.documentElement.addEventListener('pointerleave',()=>{pointer=null;wakeEyes();});
window.addEventListener('blur',()=>{pointer=null;wakeEyes();});
window.addEventListener('resize',()=>{geometryDirty=true;wakeEyes();},{passive:true});
document.addEventListener('scroll',()=>{geometryDirty=true;wakeEyes();},{passive:true,capture:true});
document.addEventListener('close',()=>{geometryDirty=true;wakeEyes();},true);
document.addEventListener('canopy-event-cover-closed',()=>{geometryDirty=true;wakeEyes();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopBlink();else if(activeRoot?.isConnected)rest(activeRoot);});
reduced.addEventListener('change',()=>{eyes.forEach(eye=>eye.el.removeAttribute('transform'));if(activeRoot?.isConnected)rest(activeRoot);});
function eyeMark(){
 return `<svg class="connect-receipt-eye" viewBox="350 32 155 102" aria-hidden="true" focusable="false"><g class="connect-receipt-lid"><path d="${aperturePath}" fill="${paper}"/><path d="${DATA.source.pupil}" fill="${ink}"/><path d="${DATA.source.star}" fill="${paper}"/></g></svg>`;
}
window.InkTitles={title,capture,transition,rest,stopBlink,eyeMark};
})();
