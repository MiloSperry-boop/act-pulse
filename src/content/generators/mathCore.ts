/**
 * Core numeric Math generators: linear equations, function evaluation,
 * percentages, mean, and simple probability. Answers computed programmatically;
 * distractors are near-misses from common mistakes.
 */

import type { ACTQuestion, Difficulty } from '../../data/questionSchema';
import { mulberry32, hashSeed, randInt, pick, type RNG } from '../../engine/rng';
import { makeQuestion } from './helpers';

function idFor(kind: string, seed: string): string {
  return `gen.math.${kind}.${hashSeed(seed).toString(36)}`;
}

function linearEquation(rng: RNG, seed: string): ACTQuestion {
  // a x + b = c  → x = (c - b) / a, chosen to be an integer.
  const a = randInt(rng, 2, 6);
  const x = randInt(rng, -6, 9);
  const b = randInt(rng, -8, 8);
  const c = a * x + b;
  const correct = `${x}`;
  const distractors = [
    `${x + 1}`,
    `${Math.round((c + b) / a)}`, // sign error on b
    `${c - b}`, // forgot to divide
  ];
  return makeQuestion(rng, {
    id: idFor('linear', seed),
    section: 'math',
    officialCategory: 'Preparing for Higher Math',
    subskill: 'Algebra',
    microSkill: 'math.alg.linear',
    difficulty: 2 as Difficulty,
    expectedSeconds: 40,
    calculatorAllowed: true,
    prompt: `If ${a}x ${b >= 0 ? '+' : '−'} ${Math.abs(b)} = ${c}, what is the value of x?`,
    correctText: correct,
    distractorTexts: distractors,
    distractorExplainer: (t) =>
      t === `${c - b}`
        ? 'You isolated the x-term but forgot to divide by the coefficient.'
        : 'Check the sign when moving the constant, then divide by the coefficient.',
    explanation: `Subtract ${b} from both sides: ${a}x = ${c - b}. Divide by ${a}: x = ${x}.`,
    conceptSummary: 'Isolate the variable: undo addition/subtraction, then division.',
    tags: ['generated', 'algebra', 'linear'],
  });
}

function functionEval(rng: RNG, seed: string): ACTQuestion {
  // f(x) = a x^2 + b x + c, evaluate at n.
  const a = randInt(rng, 1, 3);
  const b = randInt(rng, -4, 4);
  const c = randInt(rng, -5, 5);
  const n = randInt(rng, -3, 4);
  const val = a * n * n + b * n + c;
  const correct = `${val}`;
  const distractors = [
    `${a * n + b * n + c}`, // treated x^2 as x
    `${a * n * n + b * n - c}`, // sign of c
    `${val + a}`,
  ];
  return makeQuestion(rng, {
    id: idFor('fn', seed),
    section: 'math',
    officialCategory: 'Preparing for Higher Math',
    subskill: 'Functions',
    microSkill: 'math.fn.notation',
    difficulty: 2 as Difficulty,
    expectedSeconds: 45,
    calculatorAllowed: true,
    prompt: `If f(x) = ${a}x² ${b >= 0 ? '+' : '−'} ${Math.abs(b)}x ${c >= 0 ? '+' : '−'} ${Math.abs(c)}, what is f(${n})?`,
    correctText: correct,
    distractorTexts: distractors,
    distractorExplainer: () =>
      'Substitute the input for every x, square before multiplying, and follow order of operations.',
    explanation: `f(${n}) = ${a}(${n})² ${b >= 0 ? '+' : '−'} ${Math.abs(b)}(${n}) ${c >= 0 ? '+' : '−'} ${Math.abs(c)} = ${val}.`,
    conceptSummary: 'To evaluate f(n), replace every x with n and simplify.',
    tags: ['generated', 'functions'],
  });
}

function percentChange(rng: RNG, seed: string): ACTQuestion {
  const base = randInt(rng, 4, 20) * 10;
  const pct = pick(rng, [10, 15, 20, 25, 40]);
  const increase = rng() < 0.5;
  const result = increase
    ? base + (base * pct) / 100
    : base - (base * pct) / 100;
  const correct = `${result}`;
  const distractors = [
    `${increase ? base - (base * pct) / 100 : base + (base * pct) / 100}`,
    `${base + pct}`,
    `${(base * pct) / 100}`,
  ];
  return makeQuestion(rng, {
    id: idFor('percent', seed),
    section: 'math',
    officialCategory: 'Integrating Essential Skills',
    subskill: 'Integrating Essential Skills',
    microSkill: 'math.ies.percent',
    difficulty: 3 as Difficulty,
    expectedSeconds: 50,
    calculatorAllowed: true,
    prompt: `A quantity of ${base} is ${increase ? 'increased' : 'decreased'} by ${pct}%. What is the new value?`,
    correctText: correct,
    distractorTexts: distractors,
    distractorExplainer: (t) =>
      t === `${(base * pct) / 100}`
        ? 'That is only the amount of the change, not the new total.'
        : 'A percent change is computed on the original amount, then added or subtracted.',
    explanation: `${pct}% of ${base} is ${(base * pct) / 100}. ${increase ? 'Add' : 'Subtract'} it: ${result}.`,
    conceptSummary: 'Percent change = (percent ÷ 100) × original, then add or subtract from the original.',
    tags: ['generated', 'percent'],
  });
}

function meanValue(rng: RNG, seed: string): ACTQuestion {
  const n = randInt(rng, 4, 5);
  const vals: number[] = [];
  // Make the mean an integer.
  let sum = 0;
  for (let i = 0; i < n - 1; i++) {
    const v = randInt(rng, 2, 20);
    vals.push(v);
    sum += v;
  }
  const targetMean = randInt(rng, 6, 14);
  const last = targetMean * n - sum;
  vals.push(last);
  const mean = (sum + last) / n;
  const correct = `${mean}`;
  const distractors = [
    `${Math.round((sum + last) / (n - 1))}`,
    `${mean + 1}`,
    `${Math.max(...vals)}`,
  ];
  return makeQuestion(rng, {
    id: idFor('mean', seed),
    section: 'math',
    officialCategory: 'Preparing for Higher Math',
    subskill: 'Statistics & Probability',
    microSkill: 'math.stat.center',
    difficulty: 2 as Difficulty,
    expectedSeconds: 45,
    calculatorAllowed: true,
    prompt: `What is the mean (average) of the numbers ${vals.join(', ')}?`,
    correctText: correct,
    distractorTexts: distractors,
    distractorExplainer: () =>
      'The mean is the sum of the values divided by how many values there are.',
    explanation: `Sum = ${vals.reduce((a, b) => a + b, 0)}; there are ${n} values, so the mean is ${mean}.`,
    conceptSummary: 'Mean = (sum of values) ÷ (count of values).',
    tags: ['generated', 'statistics'],
  });
}

function probability(rng: RNG, seed: string): ACTQuestion {
  const red = randInt(rng, 2, 6);
  const blue = randInt(rng, 2, 6);
  const green = randInt(rng, 1, 4);
  const total = red + blue + green;
  const target = pick(rng, ['red', 'blue', 'green'] as const);
  const favorable = target === 'red' ? red : target === 'blue' ? blue : green;
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const g = gcd(favorable, total);
  const correct = `${favorable / g}/${total / g}`;
  const distractors = [
    `${favorable}/${total - favorable}`, // odds not probability
    `${total / g}/${favorable / g}`, // inverted
    `${favorable}/${total + 1}`,
  ];
  return makeQuestion(rng, {
    id: idFor('prob', seed),
    section: 'math',
    officialCategory: 'Preparing for Higher Math',
    subskill: 'Statistics & Probability',
    microSkill: 'math.stat.probability',
    difficulty: 3 as Difficulty,
    expectedSeconds: 45,
    calculatorAllowed: true,
    prompt: `A bag contains ${red} red, ${blue} blue, and ${green} green marbles. If one marble is drawn at random, what is the probability it is ${target}?`,
    correctText: correct,
    distractorTexts: distractors,
    distractorExplainer: (t) =>
      t === `${favorable}/${total - favorable}`
        ? 'That is the odds (favorable to unfavorable), not the probability.'
        : 'Probability = favorable outcomes ÷ total outcomes, reduced to lowest terms.',
    explanation: `There are ${favorable} ${target} marbles out of ${total} total, so the probability is ${favorable}/${total} = ${correct}.`,
    conceptSummary: 'Probability = favorable outcomes ÷ total outcomes.',
    tags: ['generated', 'probability'],
  });
}

function exponentRules(rng: RNG, seed: string): ACTQuestion {
  // Simplify x^a · x^b or (x^a)^b — answer computed from the rule.
  const a = randInt(rng, 2, 6);
  const b = randInt(rng, 2, 5);
  const isProduct = rng() < 0.5;
  const result = isProduct ? a + b : a * b;
  const exprStr = isProduct ? `x${sup(a)} · x${sup(b)}` : `(x${sup(a)})${sup(b)}`;
  const correct = `x${sup(result)}`;
  const wrongRule = isProduct ? a * b : a + b;
  const distractors = [`x${sup(wrongRule)}`, `x${sup(result + 1)}`, `${result}x`];
  return makeQuestion(rng, {
    id: idFor('exponent', seed),
    section: 'math',
    officialCategory: 'Preparing for Higher Math',
    subskill: 'Number & Quantity',
    microSkill: 'math.nq.exponents',
    difficulty: 2 as Difficulty,
    expectedSeconds: 35,
    calculatorAllowed: true,
    prompt: `For all x ≠ 0, which expression is equivalent to ${exprStr}?`,
    correctText: correct,
    distractorTexts: distractors,
    distractorExplainer: (t) =>
      t === `x${sup(wrongRule)}`
        ? isProduct
          ? 'Multiplying like bases ADDS the exponents; this multiplied them.'
          : 'A power of a power MULTIPLIES the exponents; this added them.'
        : 'Apply the exponent rule to the exponents themselves; the base stays x.',
    explanation: isProduct
      ? `When multiplying like bases, add the exponents: x${sup(a)} · x${sup(b)} = x${sup(a + b)}.`
      : `A power raised to a power multiplies the exponents: (x${sup(a)})${sup(b)} = x${sup(a * b)}.`,
    conceptSummary:
      'xᵃ · xᵇ = xᵃ⁺ᵇ (add when multiplying); (xᵃ)ᵇ = xᵃᵇ (multiply for a power of a power).',
    tags: ['generated', 'exponents'],
  });
}

function sup(n: number): string {
  const map: Record<string, string> = {
    '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
    '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
  };
  return String(n).split('').map((d) => map[d] ?? d).join('');
}

function medianValue(rng: RNG, seed: string): ACTQuestion {
  // Odd-length list so the median is a single value; presented unsorted.
  const n = pick(rng, [5, 7]);
  const vals: number[] = [];
  while (vals.length < n) {
    const v = randInt(rng, 3, 40);
    if (!vals.includes(v)) vals.push(v);
  }
  const sorted = [...vals].sort((a, b) => a - b);
  const median = sorted[(n - 1) / 2];
  const mean = Math.round((vals.reduce((a, b) => a + b, 0) / n) * 10) / 10;
  const candidates = [
    `${vals[Math.floor(n / 2)]}`, // middle of the UNSORTED list
    `${mean}`,
    `${sorted[(n - 1) / 2 + 1]}`,
    `${sorted[(n - 1) / 2 - 1]}`,
    `${median + 2}`,
    `${median - 1}`,
  ];
  const distractors: string[] = [];
  for (const c of candidates) {
    if (c !== `${median}` && !distractors.includes(c)) distractors.push(c);
    if (distractors.length === 3) break;
  }
  return makeQuestion(rng, {
    id: idFor('median', seed),
    section: 'math',
    officialCategory: 'Preparing for Higher Math',
    subskill: 'Statistics & Probability',
    microSkill: 'math.stat.center',
    difficulty: 2 as Difficulty,
    expectedSeconds: 45,
    calculatorAllowed: true,
    prompt: `What is the median of the data set ${vals.join(', ')}?`,
    correctText: `${median}`,
    distractorTexts: distractors,
    distractorExplainer: (t) =>
      t === `${mean}`
        ? 'That is the mean (average). The median is the middle value after sorting.'
        : 'Sort the values first — the median is the middle entry of the SORTED list.',
    explanation: `Sorted: ${sorted.join(', ')}. With ${n} values, the median is the ${(n + 1) / 2}th value: ${median}.`,
    conceptSummary: 'The median is the middle value once the data are sorted.',
    strategyTip: 'Always sort before finding the median — ACT lists are often given out of order.',
    tags: ['generated', 'statistics', 'median'],
  });
}

const GENERATORS = [
  linearEquation,
  functionEval,
  percentChange,
  meanValue,
  probability,
  exponentRules,
  medianValue,
];

export function generateMathCoreQuestion(seedStr: string): ACTQuestion {
  const rng = mulberry32(hashSeed(seedStr));
  const gen = GENERATORS[randInt(rng, 0, GENERATORS.length - 1)];
  return gen(rng, seedStr);
}

export function generateMathCoreBatch(baseSeed: string, n: number): ACTQuestion[] {
  const out: ACTQuestion[] = [];
  const seen = new Set<string>();
  let i = 0;
  while (out.length < n && i < n * 6) {
    const q = generateMathCoreQuestion(`${baseSeed}:${i}`);
    if (!seen.has(q.id)) {
      seen.add(q.id);
      out.push(q);
    }
    i++;
  }
  return out;
}
