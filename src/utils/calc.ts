/**
 * Safe arithmetic expression evaluator (no eval). Recursive-descent parser
 * supporting + - * / ^, parentheses, sqrt, and degree-based sin/cos/tan.
 */
export function evaluateExpression(expr: string): number {
  let i = 0;
  const s = expr.replace(/\s+/g, '');

  const peek = () => s[i];

  function parseExpr(): number {
    let v = parseTerm();
    while (peek() === '+' || peek() === '-') {
      const op = s[i++];
      const rhs = parseTerm();
      v = op === '+' ? v + rhs : v - rhs;
    }
    return v;
  }
  function parseTerm(): number {
    let v = parseFactor();
    while (peek() === '*' || peek() === '/') {
      const op = s[i++];
      const rhs = parseFactor();
      v = op === '*' ? v * rhs : v / rhs;
    }
    return v;
  }
  function parseFactor(): number {
    let base = parseUnary();
    if (peek() === '^') {
      i++;
      base = Math.pow(base, parseFactor());
    }
    return base;
  }
  function parseUnary(): number {
    if (peek() === '-') {
      i++;
      return -parseUnary();
    }
    if (peek() === '+') {
      i++;
      return parseUnary();
    }
    return parsePrimary();
  }
  function parsePrimary(): number {
    if (peek() === '(') {
      i++;
      const v = parseExpr();
      if (peek() === ')') i++;
      return v;
    }
    const fnMatch = s.slice(i).match(/^(sqrt|sin|cos|tan)/);
    if (fnMatch) {
      const fn = fnMatch[1];
      i += fn.length;
      const arg = parsePrimary();
      switch (fn) {
        case 'sqrt':
          return Math.sqrt(arg);
        case 'sin':
          return Math.sin((arg * Math.PI) / 180);
        case 'cos':
          return Math.cos((arg * Math.PI) / 180);
        case 'tan':
          return Math.tan((arg * Math.PI) / 180);
      }
    }
    const numMatch = s.slice(i).match(/^\d*\.?\d+/);
    if (numMatch) {
      i += numMatch[0].length;
      return parseFloat(numMatch[0]);
    }
    throw new Error('Parse error');
  }

  const result = parseExpr();
  if (i !== s.length) throw new Error('Unexpected token');
  return result;
}
