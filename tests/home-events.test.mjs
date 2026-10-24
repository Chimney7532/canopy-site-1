import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const context={};vm.runInNewContext(readFileSync(new URL('../public/assets/scripts/event-dates.js',import.meta.url),'utf8'),context);
const dates=context.CanopyEventDates,today='2026-10-21';
const past={id:'care',date:'2026-10-10'},older={id:'summit',date:'2026-07-26'},next={id:'health',date:'2027-02-19'},later={id:'later',date:'2027-03-01'};
test('one future event restores the recent feature and next-event strip',()=>{
 const input=[next,older,past],result=dates.home(input,today);
 assert.equal(result.featured,past);assert.equal(result.next,next);assert.equal(input[0],next);
});
test('two future events remain chronological, including today',()=>{
 const now={id:'now',date:today},result=dates.home([later,next,now,past],today);
 assert.equal(result.featured,now);assert.equal(result.next,next);
});
test('past events are never relabeled as next and no duplicate is created',()=>{
 assert.equal(dates.home([past,older],today).next,null);
 assert.equal(dates.home([past,older],today).featured,past);
 assert.equal(dates.home([next],today).featured,next);assert.equal(dates.home([next],today).next,null);
 assert.equal(dates.home([],today).featured,null);
});
