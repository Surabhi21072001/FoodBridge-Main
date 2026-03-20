import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

describe('Property-Based Testing Examples', () => {
  it('Property: String concatenation is associative', () => {
    fc.assert(
      fc.property(fc.string(), fc.string(), fc.string(), (a, b, c) => {
        return (a + b) + c === a + (b + c);
      }),
      { numRuns: 100 }
    );
  });

  it('Property: Array reverse is involutive (reversing twice gives original)', () => {
    fc.assert(
      fc.property(fc.array(fc.integer()), (arr) => {
        const reversed = [...arr].reverse();
        const doubleReversed = [...reversed].reverse();
        return JSON.stringify(arr) === JSON.stringify(doubleReversed);
      }),
      { numRuns: 100 }
    );
  });

  it('Property: Adding zero does not change a number', () => {
    fc.assert(
      fc.property(fc.integer(), (n) => {
        return n + 0 === n && 0 + n === n;
      }),
      { numRuns: 100 }
    );
  });
});
