import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../public/assets/scripts/read.js',import.meta.url),'utf8');
const window={};vm.runInNewContext(readFileSync(new URL('../public/assets/scripts/read-content.js',import.meta.url),'utf8'),{window});vm.runInNewContext(source,{window,URL});
const api=window.CanopyRead;
test('reading data is public editorial content and unknown IDs have a usable fallback',()=>{
 const item=api.get('philosophy');assert.equal(item.format,'article');assert.equal(item.source.roomId,null);assert.ok(item.paragraphs.length>0);
 assert.equal(api.get('missing'),null);assert.match(api.markup(null,{hash:'#home'}),/Story unavailable/);
 assert.match(api.markup(item,{hash:'#home'}),/data-detail-back/);
});
test('reading content is escaped before rendering',()=>{
 const unsafe='<img src=x onerror=alert(1)>';
 const item={...api.get('philosophy'),title:unsafe,excerpt:unsafe,paragraphs:[unsafe],author:unsafe,label:unsafe};
 const html=api.markup(item,{hash:'#home'});
 assert.ok(!html.includes(unsafe));assert.equal((html.match(/&lt;img/g)||[]).length,4); // Title, excerpt, paragraph and author; the old label is no longer rendered.
});

test('featured panel can switch to a video without a philosophy-specific link',()=>{
 const item={id:'film',format:'video',title:'A conversation',video:{src:'https://example.com/film.mp4'}};
 window.CanopyReadContent.items.push(item);window.CanopyReadContent.featuredId='film';
 assert.equal(api.get('film'),item);assert.match(api.teaser(),/data-video-id="film"/);assert.match(api.teaser(),/Play A conversation/);assert.match(api.teaser(),/href="#read-philosophy"/);assert.doesNotMatch(api.teaser(),/<iframe|<video/);
 assert.doesNotMatch(api.teaser(),/Read our philosophy/);assert.match(api.markup(item),/<video controls playsinline preload="metadata"/);
 assert.doesNotMatch(api.markup({...item,video:{src:'javascript:alert(1)'}}),/<video/);
 window.CanopyReadContent.featuredId='philosophy';
});

test('article panel visibly reserves a video frame without a fake playable video',()=>{
 const html=api.teaser();assert.match(html,/read-video-slot/);assert.match(html,/Films &amp; <br>conversations/);assert.match(html,/id="read-screen-video"[^>]* hidden/);assert.match(html,/role="tab"[^>]*aria-selected="true"[^>]*data-read-mode="read"/);assert.doesNotMatch(html,/read-video-launch|<iframe|<video/);
 assert.match(api.videoMarkup({title:'Film',video:{src:'https://www.youtube.com/watch?v=aqz-KE-bpKQ'}}),/youtube-nocookie.com\/embed\/aqz-KE-bpKQ/);
});

test('homepage preview identifies a real article with its title, body and reading action',()=>{
 const html=api.teaser();assert.match(html,/<strong>Most read in Room<\/strong>/);assert.doesNotMatch(html,/>Preview<\/span>/);assert.match(html,/Most watched in Room/);assert.doesNotMatch(html,/Coming soon<\/span>|Opening note|read-panel-credit/);assert.match(html,/read-ink/);assert.match(html,/<h3 class="read-statement-heading">Start before you’re ready\.<\/h3>/);assert.match(html,/Canopy is for people who want to make something/);assert.match(html,/Read article/);
});
