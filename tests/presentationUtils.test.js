import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizePresentation, selectReelPhotos, reelPhotoKey } from '../src/lib/presentationUtils.js';

test('unsupported presentation values fall back and carousel speed is bounded', () => {
  const value = normalizePresentation({ gallery_reel: { speedSeconds: 2, direction: 'invalid', albumIds: [42, 'a'] }, event_cards: { style: 'invalid', animation: 'invalid' } });
  assert.equal(value.gallery_reel.speedSeconds, 15);
  assert.equal(value.gallery_reel.direction, 'left');
  assert.deepEqual(value.gallery_reel.albumIds, ['a']);
  assert.deepEqual(value.event_cards, { style: 'ticket', animation: 'tilt' });
  assert.equal(normalizePresentation({ gallery_reel: { speedSeconds: 999 } }).gallery_reel.speedSeconds, 120);
});
test('photo selections preserve order and exclude unpublished or removed sources', () => {
  const a = { album: { id: 'a' }, url: 'one' };
  const b = { album: { id: 'b' }, url: 'two' };
  assert.deepEqual(selectReelPhotos([a, b], { albumIds: [], photoKeys: [reelPhotoKey(b), 'missing', reelPhotoKey(a)] }), [b, a]);
  assert.deepEqual(selectReelPhotos([a, b], { albumIds: ['a'], photoKeys: [reelPhotoKey(b)] }), []);
  assert.deepEqual(selectReelPhotos([a, b], { albumIds: ['a'], photoKeys: [] }), [a]);
});
