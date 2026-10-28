import test from 'node:test';
import assert from 'node:assert/strict';
import { eventStatus, eventTimestamp, indiaDateTime, fromIndiaDateTime, galleryPhotos, registrationUrl } from '../src/lib/eventUtils.js';

const event = { id: 'e1', title: 'Workshop', starts_at: '2026-11-01T09:00:00Z', ends_at: '2026-11-01T11:00:00Z' };

test('automatic events switch at both exact boundaries', () => {
  assert.equal(eventStatus(event, Date.parse('2026-11-01T08:59:59Z')), 'upcoming');
  assert.equal(eventStatus(event, Date.parse(event.starts_at)), 'live');
  assert.equal(eventStatus(event, Date.parse(event.ends_at)), 'past');
});
test('manual overrides can move events in either direction', () => {
  for (const status of ['upcoming', 'live', 'past']) {
    assert.equal(eventStatus({ ...event, status_override: status }, 0), status);
  }
});
test('legacy prose stays unscheduled and missing ends do not stay live forever', () => {
  assert.equal(eventStatus({ date: 'To be announced', time: '' }), 'unscheduled');
  assert.equal(eventStatus({ ...event, ends_at: '' }, Date.parse(event.starts_at)), 'past');
});
test('India schedule input round-trips independently of the browser time zone', () => {
  assert.equal(indiaDateTime(event.starts_at), '2026-11-01T14:30');
  assert.equal(fromIndiaDateTime('2026-11-01T14:30'), event.starts_at.replace('00Z', '00.000Z'));
  assert.equal(fromIndiaDateTime(''), '');
  assert.equal(eventTimestamp('2026-02-30', '10:00'), null);
});
test('gallery searches captions and linked event names and filters by event', () => {
  const album = { id: 'a1', title: 'Community', description: '', event_id: 'e1', photos: ['https://example.com/one.jpg', 'https://example.com/two.jpg'], photo_captions: { 'https://example.com/one.jpg': 'Robotics demo' } };
  assert.equal(galleryPhotos([album], [event], 'robotics workshop').length, 1);
  assert.equal(galleryPhotos([album], [event], '', 'e2').length, 0);
  assert.equal(galleryPhotos([album], [event], 'unmatched').length, 0);
  assert.equal(galleryPhotos([album], [event], 'two.jpg')[0].index, 1);
});
test('gallery preserves standalone albums and removes duplicate photos', () => {
  assert.equal(galleryPhotos([{ id: 'a', title: 'Preview', photos: ['x', 'x'] }], []).length, 1);
  assert.equal(galleryPhotos([{ id: 'a', title: 'Preview', coverImage: 'cover', photos: [] }], [])[0].url, 'cover');
});
test('registration URLs reject executable schemes', () => {
  assert.equal(registrationUrl('javascript:alert(1)'), '');
  assert.equal(registrationUrl('https://example.com/register'), 'https://example.com/register');
});
