import { expect, test } from 'vitest';
import { splitPlus } from './splitPlus';

test('splits on a delimiter', () => {
  const result = splitPlus('a+b+c+d+e+f+xyz+3+931-432', '+');

  expect(result).toEqual(['a', 'b', 'c', 'd', 'e', 'f', 'xyz', '3', '931-432']);
});

test('no matches', () => {
  const result = splitPlus('abcdefg', '+');

  expect(result).toEqual(['abcdefg']);
});

test('limit splits', () => {
  const result = splitPlus('a+b+c+d+e+f+xyz+3+931-432', '+', 4);

  expect(result).toEqual(['a', 'b', 'c', 'd+e+f+xyz+3+931-432']);
});

test('limit greater than parts', () => {
  const result = splitPlus('a+b+c', '+', 5);

  expect(result).toEqual(['a', 'b', 'c']);
});
