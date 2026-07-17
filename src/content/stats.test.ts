import { describe, it, expect } from 'vitest';
import { getContentStats } from './questionBank';

// Prints the current bank composition in test output and pins minimums.
describe('bank stats', () => {
  it('reports composition', () => {
    const s = getContentStats();
    console.log('BANK:', JSON.stringify(s));
    expect(s.total).toBeGreaterThanOrEqual(150);
    expect(s.passages).toBeGreaterThanOrEqual(8);
  });
});
