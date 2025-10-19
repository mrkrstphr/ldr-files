import { expect, test } from 'vitest';
import { loadTestFile } from '../../testData/loadTestFile.js';
import { getModelMetadata } from './getModelMetadata.js';

test('no results with no data', () => {
  const result = getModelMetadata(``);
  expect(result).toEqual({});
});

test('no results with no metadata', () => {
  const result = getModelMetadata(loadTestFile('no-metadata'));
  expect(result).toEqual({});
});

test('extracts metadata', () => {
  const result = getModelMetadata(loadTestFile('with-metadata'));

  expect(result).toEqual({
    Name: 'Sample Model',
    Author: 'John Doe',
    Description: 'This is a sample model.',
  });
});

test('stops after first non-zero line', () => {
  const result = getModelMetadata(loadTestFile('metadata-after-model'));

  expect(result).toEqual({
    Name: 'Sample Model',
  });
});

test('multiple entries for the same key', () => {
  const result = getModelMetadata(loadTestFile('metadata-multiple-keys'));

  expect(result).toEqual({
    Name: 'Horse',
    Keyword: ['Brick', 'Wall', 'Roof'],
    Something: 'Else',
  });
});
