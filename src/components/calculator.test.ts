import { describe, it, expect } from 'vitest';
import { evaluateExpression } from '../utils/calc';

describe('calculator expression evaluator', () => {
  it('handles basic arithmetic with precedence', () => {
    expect(evaluateExpression('2+3*4')).toBe(14);
    expect(evaluateExpression('(2+3)*4')).toBe(20);
    expect(evaluateExpression('10/4')).toBe(2.5);
    expect(evaluateExpression('7-2-1')).toBe(4);
  });

  it('handles exponents and roots', () => {
    expect(evaluateExpression('2^10')).toBe(1024);
    expect(evaluateExpression('sqrt(144)')).toBe(12);
    expect(evaluateExpression('sqrt(9)+1')).toBe(4);
  });

  it('handles unary minus and nested parentheses', () => {
    expect(evaluateExpression('-5+3')).toBe(-2);
    expect(evaluateExpression('((1+2)*(3+4))')).toBe(21);
  });

  it('handles degree-based trig', () => {
    expect(evaluateExpression('sin(30)')).toBeCloseTo(0.5, 5);
    expect(evaluateExpression('cos(60)')).toBeCloseTo(0.5, 5);
  });

  it('throws on malformed input', () => {
    expect(() => evaluateExpression('2++')).toThrow();
    expect(() => evaluateExpression('2+)')).toThrow();
  });
});
