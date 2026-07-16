/**
 * Matrix question generator. All answers are computed programmatically and
 * validated. Covers dimensions, entries, add/subtract, scalar, multiply, and
 * validity-of-operation questions.
 */

import type { ACTQuestion, Difficulty } from '../../data/questionSchema';
import { mulberry32, hashSeed, randInt, pick, type RNG } from '../../engine/rng';
import { makeQuestion } from './helpers';

type Matrix = number[][];

function makeMatrix(rng: RNG, rows: number, cols: number, lo = -6, hi = 9): Matrix {
  const m: Matrix = [];
  for (let r = 0; r < rows; r++) {
    const row: number[] = [];
    for (let c = 0; c < cols; c++) row.push(randInt(rng, lo, hi));
    m.push(row);
  }
  return m;
}

function fmtMatrix(m: Matrix): string {
  return m.map((row) => `[ ${row.join('  ')} ]`).join('  ');
}

function addM(a: Matrix, b: Matrix): Matrix {
  return a.map((row, r) => row.map((v, c) => v + b[r][c]));
}
function subM(a: Matrix, b: Matrix): Matrix {
  return a.map((row, r) => row.map((v, c) => v - b[r][c]));
}
function scalarM(k: number, a: Matrix): Matrix {
  return a.map((row) => row.map((v) => v * k));
}
function multiplyM(a: Matrix, b: Matrix): Matrix {
  const rows = a.length;
  const inner = b.length;
  const cols = b[0].length;
  const out: Matrix = [];
  for (let r = 0; r < rows; r++) {
    const row: number[] = [];
    for (let c = 0; c < cols; c++) {
      let sum = 0;
      for (let k = 0; k < inner; k++) sum += a[r][k] * b[k][c];
      row.push(sum);
    }
    out.push(row);
  }
  return out;
}

function matrixStimulus(named: { name: string; values: Matrix }[]) {
  return {
    kind: 'matrix' as const,
    matrices: named,
  };
}

type MatrixKind =
  | 'dimensions'
  | 'entry'
  | 'add'
  | 'subtract'
  | 'scalar'
  | 'multiply'
  | 'validity';

const MICRO_BY_KIND: Record<MatrixKind, string> = {
  dimensions: 'math.nq.matrix.dims',
  entry: 'math.nq.matrix.dims',
  add: 'math.nq.matrix.addsub',
  subtract: 'math.nq.matrix.addsub',
  scalar: 'math.nq.matrix.scalar',
  multiply: 'math.nq.matrix.multiply',
  validity: 'math.nq.matrix.multiply',
};

export function generateMatrixQuestion(seedStr: string): ACTQuestion {
  const rng = mulberry32(hashSeed(seedStr));
  const kind = pick(rng, [
    'dimensions',
    'entry',
    'add',
    'subtract',
    'scalar',
    'multiply',
    'validity',
  ] as MatrixKind[]);

  const id = `gen.matrix.${kind}.${hashSeed(seedStr).toString(36)}`;
  const base = {
    id,
    section: 'math' as const,
    officialCategory: 'Preparing for Higher Math',
    subskill: 'Number & Quantity',
    microSkill: MICRO_BY_KIND[kind],
    calculatorAllowed: true,
    tags: ['generated', 'matrix', kind],
  };

  if (kind === 'dimensions' || kind === 'entry') {
    const rows = randInt(rng, 2, 3);
    const cols = randInt(rng, 2, 3);
    const A = makeMatrix(rng, rows, cols);
    if (kind === 'dimensions') {
      const correct = `${rows} × ${cols}`;
      const distractors = [
        `${cols} × ${rows}`,
        `${rows} × ${cols + 1}`,
        `${rows * cols} × 1`,
      ];
      return makeQuestion(rng, {
        ...base,
        difficulty: 1 as Difficulty,
        expectedSeconds: 25,
        stimulus: matrixStimulus([{ name: 'A', values: A }]),
        prompt: `Matrix A is shown above. What are the dimensions (rows × columns) of A?`,
        correctText: correct,
        distractorTexts: distractors,
        distractorExplainer: (t) =>
          t === `${cols} × ${rows}`
            ? 'Dimensions are stated rows × columns, not columns × rows.'
            : 'Count the horizontal rows first, then the vertical columns.',
        explanation: `Matrix A has ${rows} rows and ${cols} columns, so its dimensions are ${correct}. Dimensions are always given as rows × columns.`,
        conceptSummary:
          'A matrix’s dimensions are (number of rows) × (number of columns), in that order.',
        strategyTip: 'Rows are horizontal; columns are vertical. Rows come first.',
      });
    }
    // entry
    const r = randInt(rng, 1, rows);
    const c = randInt(rng, 1, cols);
    const correctVal = A[r - 1][c - 1];
    const wrong = [A[c - 1] ? A[c - 1][r - 1] : correctVal + 1, correctVal + 1, correctVal - 1];
    return makeQuestion(rng, {
      ...base,
      difficulty: 1 as Difficulty,
      expectedSeconds: 25,
      stimulus: matrixStimulus([{ name: 'A', values: A }]),
      prompt: `In matrix A above, what is the entry a₍${r},${c}₎ (row ${r}, column ${c})?`,
      correctText: `${correctVal}`,
      distractorTexts: wrong.map((v) => `${v}`),
      distractorExplainer: () =>
        'The entry a₍i,j₎ is in row i, column j. Count down to the row first, then across to the column.',
      explanation: `The entry a₍${r},${c}₎ sits in row ${r}, column ${c}, which is ${correctVal}.`,
      conceptSummary: 'Entry a₍i,j₎ is located in row i and column j.',
    });
  }

  if (kind === 'scalar') {
    const rows = 2;
    const cols = 2;
    const A = makeMatrix(rng, rows, cols, -5, 6);
    const k = pick(rng, [2, 3, -2, 4]);
    const result = scalarM(k, A);
    const correct = fmtMatrix(result);
    const distractors = [
      fmtMatrix(scalarM(k, A).map((row) => row.map((v) => v + k))), // added k
      fmtMatrix(addM(A, A)), // doubled regardless of k
      fmtMatrix(A.map((row, ri) => row.map((v, ci) => v * k + (ri + ci)))),
    ];
    return makeQuestion(rng, {
      ...base,
      difficulty: 2 as Difficulty,
      expectedSeconds: 40,
      stimulus: matrixStimulus([{ name: 'A', values: A }]),
      prompt: `Given matrix A above, compute ${k}A.`,
      correctText: correct,
      distractorTexts: distractors,
      distractorExplainer: () =>
        `Scalar multiplication multiplies every entry by ${k}. Don’t add ${k}; multiply.`,
      explanation: `Multiply every entry of A by ${k}: ${correct}.`,
      conceptSummary:
        'Scalar multiplication multiplies each entry of the matrix by the scalar.',
      hints: [
        {
          level: 1,
          kind: 'concept',
          text: `${k}A means multiply each entry of A by ${k}.`,
        },
      ],
    });
  }

  if (kind === 'add' || kind === 'subtract') {
    const rows = 2;
    const cols = 2;
    const A = makeMatrix(rng, rows, cols, -5, 6);
    const B = makeMatrix(rng, rows, cols, -5, 6);
    const result = kind === 'add' ? addM(A, B) : subM(A, B);
    const correct = fmtMatrix(result);
    const distractors = [
      fmtMatrix(kind === 'add' ? subM(A, B) : addM(A, B)), // opposite op
      fmtMatrix(multiplyM(A, B)), // multiplied
      fmtMatrix(result.map((row) => row.map((v) => v + 1))),
    ];
    const opWord = kind === 'add' ? 'A + B' : 'A − B';
    return makeQuestion(rng, {
      ...base,
      difficulty: 2 as Difficulty,
      expectedSeconds: 45,
      stimulus: matrixStimulus([
        { name: 'A', values: A },
        { name: 'B', values: B },
      ]),
      prompt: `Using matrices A and B above, compute ${opWord}.`,
      correctText: correct,
      distractorTexts: distractors,
      distractorExplainer: (t) =>
        t === fmtMatrix(multiplyM(A, B))
          ? 'That is the matrix product, not the sum/difference. Add or subtract entry by entry.'
          : `${opWord} combines matching entries. Watch the sign of each subtraction.`,
      explanation: `Add or subtract corresponding entries: ${opWord} = ${correct}.`,
      conceptSummary:
        'Addition and subtraction of matrices operate entry by entry, and require equal dimensions.',
      hints: [
        {
          level: 1,
          kind: 'concept',
          text: 'Combine entries in the same position — top-left with top-left, and so on.',
        },
      ],
    });
  }

  if (kind === 'multiply') {
    // (2×2)(2×2) product, values kept small.
    const A = makeMatrix(rng, 2, 2, -3, 4);
    const B = makeMatrix(rng, 2, 2, -3, 4);
    const result = multiplyM(A, B);
    const correct = fmtMatrix(result);
    const distractors = [
      fmtMatrix(A.map((row, r) => row.map((v, c) => v * B[r][c]))), // entrywise
      fmtMatrix(multiplyM(B, A)), // reversed order
      fmtMatrix(addM(A, B)),
    ];
    return makeQuestion(rng, {
      ...base,
      difficulty: 4 as Difficulty,
      expectedSeconds: 70,
      stimulus: matrixStimulus([
        { name: 'A', values: A },
        { name: 'B', values: B },
      ]),
      prompt: `Using matrices A and B above, compute the product AB.`,
      correctText: correct,
      distractorTexts: distractors,
      distractorExplainer: (t) =>
        t === fmtMatrix(A.map((row, r) => row.map((v, c) => v * B[r][c])))
          ? 'Matrix multiplication is not entry-by-entry. Each entry is a row·column dot product.'
          : 'Order matters: AB ≠ BA in general. Take rows of A dotted with columns of B.',
      explanation: `Each entry of AB is a dot product of a row of A with a column of B. For example the top-left entry is (${A[0][0]})(${B[0][0]}) + (${A[0][1]})(${B[1][0]}) = ${result[0][0]}. The full product is ${correct}.`,
      conceptSummary:
        'The (i,j) entry of AB is the dot product of row i of A with column j of B. Inner dimensions must match.',
      strategyTip: 'Row of the first matrix, column of the second — multiply and add.',
      hints: [
        {
          level: 1,
          kind: 'concept',
          text: 'Entry (i,j) = (row i of A) · (column j of B).',
        },
        {
          level: 2,
          kind: 'starting_step',
          text: `Start with the top-left: (${A[0][0]})(${B[0][0]}) + (${A[0][1]})(${B[1][0]}).`,
        },
      ],
    });
  }

  // validity
  const rA = randInt(rng, 2, 3);
  const cA = randInt(rng, 2, 3);
  const rB = randInt(rng, 2, 3);
  const cB = randInt(rng, 2, 3);
  const A = makeMatrix(rng, rA, cA);
  const B = makeMatrix(rng, rB, cB);
  const canMultiplyAB = cA === rB;
  const correct = canMultiplyAB
    ? `Yes — the product AB is ${rA} × ${cB}.`
    : 'No — the operation is undefined.';
  const distractors = [
    canMultiplyAB
      ? 'No — the operation is undefined.'
      : `Yes — the product AB is ${rA} × ${cB}.`,
    `Yes — the product AB is ${cA} × ${rB}.`,
    'Yes — but only if both matrices are square.',
  ];
  return makeQuestion(rng, {
    ...base,
    difficulty: 3 as Difficulty,
    expectedSeconds: 45,
    stimulus: matrixStimulus([
      { name: 'A', values: A },
      { name: 'B', values: B },
    ]),
    prompt: `Matrix A is ${rA} × ${cA} and matrix B is ${rB} × ${cB}. Is the product AB defined, and if so, what is its size?`,
    correctText: correct,
    distractorTexts: distractors,
    distractorExplainer: () =>
      'AB is defined only when the number of columns of A equals the number of rows of B; then AB is (rows of A) × (columns of B).',
    explanation: canMultiplyAB
      ? `A is ${rA}×${cA} and B is ${rB}×${cB}. The inner dimensions match (${cA} = ${rB}), so AB is defined and has size ${rA} × ${cB}.`
      : `A is ${rA}×${cA} and B is ${rB}×${cB}. The inner dimensions (${cA} and ${rB}) do not match, so AB is undefined.`,
    conceptSummary:
      'For AB, the inner dimensions must match: (m×n)(n×p) → (m×p). Otherwise the product is undefined.',
    strategyTip: 'Write the sizes side by side; the inner numbers must be equal.',
  });
}

/** Generate a batch of matrix questions from a base seed. */
export function generateMatrixBatch(baseSeed: string, n: number): ACTQuestion[] {
  const out: ACTQuestion[] = [];
  const seen = new Set<string>();
  let i = 0;
  while (out.length < n && i < n * 5) {
    const q = generateMatrixQuestion(`${baseSeed}:${i}`);
    if (!seen.has(q.id)) {
      seen.add(q.id);
      out.push(q);
    }
    i++;
  }
  return out;
}
