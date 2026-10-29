import test from 'node:test';
import assert from 'node:assert/strict';
import { memberLinks } from '../src/lib/memberLinks.js';

test('member icons appear only for provided HTTPS platform links', () => {
  assert.deepEqual(memberLinks({}), []);
  assert.equal(memberLinks({ github: 'https://github.com/team', behance: 'https://www.behance.net/team', linkedin: 'https://www.linkedin.com/in/team' }).length, 3);
  for (const github of ['javascript:alert(1)', 'https://github.com.evil.test/team', 'http://github.com/team', 'https://user:pass@github.com/team', 'invalid']) {
    assert.deepEqual(memberLinks({ github }), []);
  }
  assert.deepEqual(memberLinks({ github: '', behance: '', linkedin: '' }), []);
});
