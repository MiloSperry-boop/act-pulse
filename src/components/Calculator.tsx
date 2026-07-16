import { useState } from 'react';
import { X } from 'lucide-react';
import { evaluateExpression } from '../utils/calc';

/**
 * A small, safe expression calculator for Math practice only. Parsing lives in
 * ../utils/calc so it can be unit-tested independently of the component.
 */

const KEYS = [
  ['7', '8', '9', '/', 'C'],
  ['4', '5', '6', '*', '('],
  ['1', '2', '3', '-', ')'],
  ['0', '.', '^', '+', '√'],
  ['sin', 'cos', 'tan', '=', '⌫'],
];

export function Calculator({ onClose }: { onClose: () => void }) {
  const [expr, setExpr] = useState('');
  const [result, setResult] = useState<string>('');

  const press = (k: string) => {
    if (k === 'C') {
      setExpr('');
      setResult('');
    } else if (k === '⌫') {
      setExpr((e) => e.slice(0, -1));
    } else if (k === '=') {
      try {
        const v = evaluateExpression(expr);
        setResult(Number.isFinite(v) ? `${Math.round(v * 1e6) / 1e6}` : 'Error');
      } catch {
        setResult('Error');
      }
    } else if (k === '√') {
      setExpr((e) => e + 'sqrt(');
    } else if (k === 'sin' || k === 'cos' || k === 'tan') {
      setExpr((e) => e + k + '(');
    } else {
      setExpr((e) => e + k);
    }
  };

  return (
    <div className="card stack" style={{ position: 'relative' }}>
      <div className="row-between">
        <strong>Calculator</strong>
        <button className="btn btn--sm btn--ghost" onClick={onClose} aria-label="Close calculator">
          <X size={18} />
        </button>
      </div>
      <div
        className="card--tight"
        style={{
          background: 'var(--surface-2)',
          borderRadius: 'var(--radius)',
          padding: 'var(--sp-3)',
          textAlign: 'right',
          fontFamily: 'var(--font-mono)',
          minHeight: 56,
        }}
      >
        <div className="faint text-sm" style={{ minHeight: 20, wordBreak: 'break-all' }}>
          {expr || '0'}
        </div>
        <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }}>
          {result}
        </div>
      </div>
      <div className="stack-sm">
        {KEYS.map((row, ri) => (
          <div key={ri} className="row" style={{ gap: 6 }}>
            {row.map((k) => (
              <button
                key={k}
                className={`btn btn--sm ${k === '=' ? 'btn--primary' : ''}`}
                style={{ flex: 1, minWidth: 0, padding: '0 4px' }}
                onClick={() => press(k)}
              >
                {k}
              </button>
            ))}
          </div>
        ))}
      </div>
      <p className="text-xs faint">
        Practice tool only — trig uses degrees. Not an exact replica of the test
        calculator.
      </p>
    </div>
  );
}
