import assert from 'node:assert/strict';
import test from 'node:test';
import { formatArgumentValue } from '../src/lib/format-argument-value.mjs';

test('quotes values that contain whitespace', () => {
  assert.equal(formatArgumentValue('west us'), '"west us"');
});

test('leaves simple values unchanged', () => {
  assert.equal(formatArgumentValue('0,0,0'), '0,0,0');
});

test('escapes quotes and preserves trailing backslashes', () => {
  assert.equal(formatArgumentValue('a "b" c\\'), '"a \\"b\\" c\\\\"');
});
