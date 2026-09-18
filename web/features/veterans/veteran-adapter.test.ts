import { expect, it } from 'vitest';
import { combineVeteranFactors } from './veteran-adapter';
it('adds matching factor stars without mutating split data or merging different IDs', () => {
  const factors = [{id:10,level:3},{id:20,level:2},{id:10,level:3},{id:10,level:3}];
  expect(combineVeteranFactors(factors)).toEqual([{id:10,level:9},{id:20,level:2}]);
  expect(factors.map(factor => factor.level)).toEqual([3,2,3,3]);
  expect(combineVeteranFactors([])).toEqual([]);
});
