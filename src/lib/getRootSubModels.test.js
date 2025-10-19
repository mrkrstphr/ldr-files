import { expect, test } from 'vitest';
import { loadTestFile } from '../../testData/loadTestFile';
import { getRootSubmodels } from './getRootSubmodels';

test('no submodels', () => {
  expect(getRootSubmodels(loadTestFile('no-metadata'))).toEqual([]);
});

test('with submodels', () => {
  const result = getRootSubmodels(loadTestFile('with-submodels'));
  expect(result).toEqual(['submodel 1', 'submodel 2', 'submodel 3']);
});
