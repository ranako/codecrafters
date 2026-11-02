import test from 'node:test';
import assert from 'node:assert/strict';
import { appendAlbumPhotos, albumDescription, reorderAlbumPhoto, validateEventSchedule, fillEventPosterDetails, pastEventDrafts } from '../src/lib/adminContentUtils.js';

test('batch photo additions deduplicate and choose a cover without replacing an existing one',()=>{
  assert.deepEqual(appendAlbumPhotos({photos:['/a.jpg'],coverImage:''},['/a.jpg','/b.jpg']).photos,['/a.jpg','/b.jpg']);
  assert.equal(appendAlbumPhotos({photos:[],coverImage:'/cover.jpg'},['/b.jpg']).coverImage,'/cover.jpg');
  assert.throws(()=>appendAlbumPhotos({photos:[]},['javascript:alert(1)']),/image URL/);
});
test('photo reordering preserves URL-keyed captions and framing and row-local replacement drafts',()=>{
  const album={photos:['/a','/b'],photo_captions:{'/a':'A'},photo_display:{'/a':{photoGrid:{zoom:2}}},_photoDrafts:[{caption:'A'},null]};
  const next=reorderAlbumPhoto(album,0,1);
  assert.deepEqual(next.photos,['/b','/a']);assert.equal(next.photo_captions['/a'],'A');assert.equal(next.photo_display['/a'].photoGrid.zoom,2);assert.equal(next._photoDrafts[1].caption,'A');assert.deepEqual(album.photos,['/a','/b']);
});
test('descriptions preserve supplied copy and provide brief missing-album text',()=>{
  assert.equal(albumDescription({title:'Coding with AI',description:'Custom copy'}),'Custom copy');
  assert.match(albumDescription({title:'Coding with AI'}),/AI tools/);
  assert.match(albumDescription({title:'Another event'}),/Another event/);
});
test('past records and private drafts do not require invented dates, but invalid partial schedules are rejected',()=>{
  assert.doesNotThrow(()=>validateEventSchedule({title:'Past',is_published:true,status_override:'past'}));
  assert.doesNotThrow(()=>validateEventSchedule({title:'Draft',is_published:false}));
  assert.throws(()=>validateEventSchedule({title:'Upcoming',is_published:true}),/before publishing/);
  assert.throws(()=>validateEventSchedule({title:'Partial',is_published:false,starts_at:'2026-01-01T00:00:00Z'}),/valid start and end/);
});

test('unchanged legacy schedules do not block edits to other collection records',()=>{
  const legacy={id:'old',title:'Legacy',is_published:true,status_override:'',starts_at:'',ends_at:''};
  assert.doesNotThrow(()=>validateEventSchedule({...legacy,description:'Updated copy'},legacy));
  assert.throws(()=>validateEventSchedule({...legacy,status_override:'upcoming'},legacy),/before publishing/);
});

test('supplied poster details retain the owner-confirmed ITM year and preserve existing edits',()=>{
  assert.equal(pastEventDrafts[1].date,'2025-09-28');
  assert.equal(pastEventDrafts[0].starts_at,'2026-01-30T04:45:00.000Z');
  const filled=fillEventPosterDetails({id:'existing',title:'Mini Hackathon at ITM',description:'Owner copy',is_published:false});
  assert.equal(filled.description,'Owner copy');assert.equal(filled.date,'2025-09-28');assert.equal(filled.id,'existing');assert.equal(filled.is_published,false);assert.match(filled.image,/2025/);
  const custom=fillEventPosterDetails({title:'Mini Hackathon at ITM',date:'2025-09-29',starts_at:''});
  assert.equal(custom.date,'2025-09-29');assert.equal(custom.starts_at,'');
});
