import { authored } from './authoredHelper';
import type { ACTQuestion } from '../../data/questionSchema';

/**
 * Original, ACT-aligned Math questions emphasizing difficult, multistep,
 * "what is the right starting method" problems. Not official ACT content.
 */
export const MATH_QUESTIONS: ACTQuestion[] = [
  authored({
    id: 'math.a.system.1',
    section: 'math',
    microSkill: 'math.alg.systems',
    difficulty: 4,
    expectedSeconds: 75,
    prompt:
      'At a stand, 3 muffins and 2 scones cost $13, while 2 muffins and 4 scones cost $14. What is the cost of one muffin?',
    correct: '$3.00',
    choices: ['$2.00', '$3.00', '$3.50', '$4.00'],
    explanation:
      'Let m and s be the prices. 3m + 2s = 13 and 2m + 4s = 14. Multiply the first by 2: 6m + 4s = 26. Subtract the second: 4m = 12, so m = 3.',
    distractors: {
      '$2.00': 'This is the price of a scone, not a muffin.',
      '$3.50': 'Check the elimination step; subtracting the equations gives 4m = 12.',
      '$4.00': 'This overshoots; 4m = 12 gives m = 3, not 4.',
    },
    conceptSummary:
      'Solve a system by elimination: scale one equation so a variable cancels when you subtract.',
    strategyTip: 'Line up the equations and make one variable’s coefficients match, then subtract.',
    hints: [
      { level: 1, kind: 'concept', text: 'Set up two equations, then eliminate a variable.' },
      {
        level: 2,
        kind: 'starting_step',
        text: 'Double the first equation so the scone terms match the second.',
      },
    ],
    tags: ['systems', 'multistep'],
  }),

  authored({
    id: 'math.a.geometry.1',
    section: 'math',
    microSkill: 'math.geo.trig',
    difficulty: 4,
    expectedSeconds: 80,
    prompt:
      'A 13-foot ladder leans against a wall, with its base 5 feet from the wall. A painter climbs to a point two-thirds of the way up the ladder. How high above the ground is the painter?',
    correct: '8 feet',
    choices: ['8 feet', '9 feet', '7.5 feet', '12 feet'],
    explanation:
      'The ladder’s top reaches height √(13² − 5²) = √144 = 12 ft. Two-thirds of the way up the ladder is at height (2/3)(12) = 8 ft.',
    distractors: {
      '9 feet': 'You may have taken two-thirds of 13 (the ladder length) instead of the height.',
      '7.5 feet': 'This looks like half of a mis-computed height; recompute the height first.',
      '12 feet': 'That is the full height of the ladder’s top, not two-thirds of the way up.',
    },
    conceptSummary:
      'Find the missing leg with the Pythagorean theorem, then scale by the given fraction of the height.',
    strategyTip: 'Two problems in one: first the right triangle, then the fraction of the vertical height.',
    hints: [
      { level: 1, kind: 'concept', text: 'It is a 5-12-13 right triangle.' },
      { level: 2, kind: 'starting_step', text: 'Height of the top = 12; take two-thirds of the height.' },
    ],
    tags: ['geometry', 'pythagorean', 'multistep'],
  }),

  authored({
    id: 'math.a.function.1',
    section: 'math',
    microSkill: 'math.fn.composition',
    difficulty: 4,
    expectedSeconds: 70,
    prompt:
      'If f(x) = 2x − 1 and g(x) = x² + 3, what is f(g(2))?',
    correct: '13',
    choices: ['13', '11', '15', '7'],
    explanation:
      'Work inside out: g(2) = 2² + 3 = 7. Then f(7) = 2(7) − 1 = 13.',
    distractors: {
      '11': 'You may have computed g(f(2)) instead of f(g(2)). Order matters.',
      '15': 'Check f(7) = 2·7 − 1 = 13, not 15.',
      '7': 'That is only g(2); you still need to apply f.',
    },
    conceptSummary: 'For f(g(x)), evaluate the inner function first, then apply the outer.',
    strategyTip: 'Composition works inside-out: compute g first, feed the result into f.',
    tags: ['functions', 'composition'],
  }),

  authored({
    id: 'math.a.quadratic.1',
    section: 'math',
    microSkill: 'math.alg.quadratic',
    difficulty: 4,
    expectedSeconds: 75,
    prompt:
      'The product of two consecutive positive integers is 72. What is their sum?',
    correct: '17',
    choices: ['17', '15', '18', '19'],
    explanation:
      'Let the integers be n and n+1. n(n+1) = 72 → n² + n − 72 = 0 → (n + 9)(n − 8) = 0. The positive solution is n = 8, so the integers are 8 and 9 and their sum is 17.',
    distractors: {
      '15': 'Try n = 7, 8 → product 56, not 72. The correct pair is 8 and 9.',
      '18': 'This would come from 8 + 10; the integers must be consecutive (8 and 9).',
      '19': 'This would come from 9 + 10, whose product is 90, not 72.',
    },
    conceptSummary:
      'Translate "consecutive integers" into n and n+1, form a quadratic, and factor.',
    strategyTip: 'On the ACT you can also test the answer choices: which consecutive pair multiplies to 72?',
    tags: ['quadratic', 'factoring', 'multistep'],
  }),

  authored({
    id: 'math.a.ies.rate.1',
    section: 'math',
    microSkill: 'math.ies.rates',
    difficulty: 5,
    expectedSeconds: 90,
    prompt:
      'A printer prints 12 pages per minute for the first 5 minutes, then slows to 8 pages per minute. How many total minutes does it take to print 116 pages?',
    correct: '12 minutes',
    choices: ['12 minutes', '10 minutes', '13 minutes', '11.5 minutes'],
    explanation:
      'In the first 5 minutes it prints 12 × 5 = 60 pages, leaving 116 − 60 = 56 pages. At 8 pages/min, 56 ÷ 8 = 7 more minutes. Total = 5 + 7 = 12 minutes.',
    distractors: {
      '10 minutes': 'This ignores the slower second rate; recompute the remaining 56 pages at 8/min.',
      '13 minutes': 'Off by one — 56 ÷ 8 = 7, not 8, additional minutes.',
      '11.5 minutes': 'The pages come out even; there is no half minute here.',
    },
    conceptSummary:
      'Break a variable-rate problem into segments; compute work done in each, then combine.',
    strategyTip: 'Handle each rate segment separately, then add the times.',
    hints: [
      { level: 1, kind: 'concept', text: 'Split the job into the fast phase and the slow phase.' },
      { level: 2, kind: 'starting_step', text: 'First 5 minutes: 12 × 5 = 60 pages. How many remain?' },
    ],
    tags: ['rates', 'multistep', 'late-section'],
  }),

  authored({
    id: 'math.a.stat.weighted.1',
    section: 'math',
    microSkill: 'math.stat.center',
    difficulty: 4,
    expectedSeconds: 75,
    prompt:
      'A class of 20 students averaged 78 on a test. After a 21st student’s score is added, the class average rises to 79. What did the 21st student score?',
    correct: '99',
    choices: ['99', '89', '95', '100'],
    explanation:
      'Original total = 20 × 78 = 1560. New total = 21 × 79 = 1659. The new score = 1659 − 1560 = 99.',
    distractors: {
      '89': 'This is close to the average, but adding a score equal to ~79 would not raise the mean by a full point.',
      '95': 'Recompute using totals: 21 × 79 − 20 × 78 = 99.',
      '100': 'Very close, but the exact difference of totals is 99, not 100.',
    },
    conceptSummary:
      'Work with totals: average × count = sum. Compare the old and new sums to find the added value.',
    strategyTip: 'Convert averages to totals before comparing.',
    tags: ['statistics', 'weighted-average', 'multistep'],
  }),

  authored({
    id: 'math.a.exponential.1',
    section: 'math',
    microSkill: 'math.fn.exponential',
    difficulty: 4,
    expectedSeconds: 70,
    prompt:
      'A culture of bacteria doubles every 3 hours. If it starts with 500 cells, how many cells are there after 12 hours?',
    correct: '8,000',
    choices: ['8,000', '4,000', '2,000', '16,000'],
    explanation:
      '12 hours is 12 ÷ 3 = 4 doubling periods. 500 × 2⁴ = 500 × 16 = 8,000.',
    distractors: {
      '4,000': 'That is only 3 doublings (2³); 12 ÷ 3 = 4 doublings.',
      '2,000': 'That is only 2 doublings; count 12 ÷ 3 = 4.',
      '16,000': 'This doubles 5 times; 12 hours gives exactly 4 doublings.',
    },
    conceptSummary:
      'Exponential growth: multiply by the growth factor once per period; count the number of periods.',
    strategyTip: 'Number of doublings = total time ÷ doubling time.',
    tags: ['exponential', 'growth'],
  }),

  authored({
    id: 'math.a.method.1',
    section: 'math',
    microSkill: 'math.ies.multistep',
    difficulty: 5,
    expectedSeconds: 90,
    prompt:
      'For how many integer values of x is |2x − 5| < 7 true?',
    correct: '6',
    choices: ['6', '7', '5', '8'],
    explanation:
      '|2x − 5| < 7 means −7 < 2x − 5 < 7 → −2 < 2x < 12 → −1 < x < 6. The integers strictly between −1 and 6 are 0, 1, 2, 3, 4, 5 — six values.',
    distractors: {
      '7': 'The endpoints −1 and 6 are excluded because the inequality is strict.',
      '5': 'Recount the integers from 0 to 5 inclusive: that is six values.',
      '8': 'This over-counts; only integers strictly between −1 and 6 qualify.',
    },
    conceptSummary:
      'Rewrite an absolute-value inequality |A| < b as −b < A < b, then solve the compound inequality.',
    strategyTip: 'Choosing the right first step — splitting the absolute value — is the whole problem.',
    hints: [
      { level: 1, kind: 'concept', text: '|A| < b becomes the double inequality −b < A < b.' },
      { level: 2, kind: 'starting_step', text: 'Write −7 < 2x − 5 < 7 and solve for x.' },
    ],
    tags: ['absolute-value', 'inequalities', 'method-selection', 'late-section'],
  }),

  authored({
    id: 'math.a.geometry.circle.1',
    section: 'math',
    microSkill: 'math.geo.circles',
    difficulty: 4,
    expectedSeconds: 75,
    prompt:
      'A circle has center (3, −1) and passes through the point (7, 2). What is the equation of the circle?',
    correct: '(x − 3)² + (y + 1)² = 25',
    choices: [
      '(x − 3)² + (y + 1)² = 25',
      '(x − 3)² + (y − 1)² = 25',
      '(x + 3)² + (y − 1)² = 5',
      '(x − 3)² + (y + 1)² = 5',
    ],
    explanation:
      'The radius is the distance from (3, −1) to (7, 2): √((7−3)² + (2−(−1))²) = √(16 + 9) = 5, so r² = 25. Center (3, −1) gives (x − 3)² + (y + 1)² = 25.',
    distractors: {
      '(x − 3)² + (y − 1)² = 25': 'The center’s y-coordinate is −1, so the term is (y + 1)², not (y − 1)².',
      '(x + 3)² + (y − 1)² = 5': 'Both center signs are wrong, and r² should be 25, not 5.',
      '(x − 3)² + (y + 1)² = 5': 'You used r instead of r²; the equation needs r² = 25.',
    },
    conceptSummary:
      'Circle: (x − h)² + (y − k)² = r². Find r as the distance from the center to a known point.',
    strategyTip: 'Center signs flip inside the squares; the right side is r², not r.',
    tags: ['circles', 'coordinate-geometry', 'multistep'],
  }),

  // ── Round 2: coverage for previously content-less skills ──────────────
  authored({
    id: 'math.a.complex.1',
    section: 'math',
    microSkill: 'math.nq.complex',
    difficulty: 3,
    expectedSeconds: 60,
    prompt: 'For i² = −1, what is the product (3 + 2i)(1 − i)?',
    correct: '5 − i',
    choices: ['5 − i', '3 − 2i', '5 + i', '1 − i'],
    explanation:
      'FOIL: 3·1 + 3(−i) + 2i·1 + 2i(−i) = 3 − 3i + 2i − 2i² = 3 − i + 2 = 5 − i.',
    distractors: {
      '3 − 2i': 'This misses the −2i² term, which becomes +2 and changes the real part.',
      '5 + i': 'Sign slip on the imaginary part: −3i + 2i = −i, not +i.',
      '1 − i': 'This is the second factor, not the product.',
    },
    conceptSummary: 'Multiply complex numbers with FOIL, then replace i² with −1.',
    strategyTip: 'The i² term always folds back into the real part — with a sign flip.',
    tags: ['complex-numbers'],
  }),

  authored({
    id: 'math.a.vectors.1',
    section: 'math',
    microSkill: 'math.nq.vectors',
    difficulty: 3,
    expectedSeconds: 55,
    prompt:
      'Vectors u = ⟨3, −2⟩ and v = ⟨−1, 4⟩. What is 2u + v?',
    correct: '⟨5, 0⟩',
    choices: ['⟨5, 0⟩', '⟨2, 2⟩', '⟨4, −6⟩', '⟨5, 8⟩'],
    explanation:
      '2u = ⟨6, −4⟩. Adding v: ⟨6 + (−1), −4 + 4⟩ = ⟨5, 0⟩.',
    distractors: {
      '⟨2, 2⟩': 'This is u + v without doubling u first.',
      '⟨4, −6⟩': 'This subtracted v instead of adding it.',
      '⟨5, 8⟩': 'Sign error on the second component: −4 + 4 = 0, not 8.',
    },
    conceptSummary:
      'Scale a vector by multiplying each component; add vectors component by component.',
    tags: ['vectors'],
  }),

  authored({
    id: 'math.a.similar.1',
    section: 'math',
    microSkill: 'math.geo.triangles',
    difficulty: 3,
    expectedSeconds: 65,
    prompt:
      'Two similar triangles have corresponding sides of 6 cm and 9 cm. If the smaller triangle’s area is 20 cm², what is the larger triangle’s area?',
    correct: '45 cm²',
    choices: ['45 cm²', '30 cm²', '60 cm²', '40 cm²'],
    explanation:
      'The side ratio is 9/6 = 3/2, so areas scale by (3/2)² = 9/4. Area = 20 × 9/4 = 45 cm².',
    distractors: {
      '30 cm²': 'This scales the area by the side ratio (3/2) instead of its square.',
      '60 cm²': 'This scales by 3 — the ratio of one triangle’s sides to itself, not the pair.',
      '40 cm²': 'Doubling is not the correct scale factor here.',
    },
    conceptSummary:
      'For similar figures, areas scale by the SQUARE of the ratio of corresponding sides.',
    strategyTip: 'Length ratio k → area ratio k² → volume ratio k³.',
    tags: ['similarity', 'geometry', 'area'],
  }),

  authored({
    id: 'math.a.volume.1',
    section: 'math',
    microSkill: 'math.geo.volume',
    difficulty: 4,
    expectedSeconds: 75,
    prompt:
      'A cylindrical water tank has radius 3 ft and height 10 ft. Approximately how many cubic feet of water does it hold when 80% full? (Use π ≈ 3.14.)',
    correct: '226 ft³',
    choices: ['226 ft³', '283 ft³', '188 ft³', '75 ft³'],
    explanation:
      'V = πr²h = 3.14 × 9 × 10 ≈ 282.6 ft³. At 80%: 282.6 × 0.8 ≈ 226 ft³.',
    distractors: {
      '283 ft³': 'That is the FULL tank — the question asks for 80% of it.',
      '188 ft³': 'This looks like 2/3 of the volume; the tank is 80% full.',
      '75 ft³': 'This used circumference or dropped the r² — recheck V = πr²h.',
    },
    conceptSummary: 'Cylinder volume V = πr²h; then apply the fraction that is filled.',
    strategyTip: 'Two steps: full volume first, percentage second.',
    tags: ['volume', 'cylinder', 'multistep'],
  }),

  authored({
    id: 'math.a.expected.1',
    section: 'math',
    microSkill: 'math.stat.expected',
    difficulty: 4,
    expectedSeconds: 75,
    prompt:
      'A game pays $10 with probability 0.2, $2 with probability 0.5, and $0 otherwise. What is the expected payout per play?',
    correct: '$3.00',
    choices: ['$3.00', '$4.00', '$2.40', '$6.00'],
    explanation:
      'E = 10(0.2) + 2(0.5) + 0(0.3) = 2 + 1 + 0 = $3.00.',
    distractors: {
      '$4.00': 'This averaged the two payouts (10 + 2)/3 — expected value weights by probability.',
      '$2.40': 'Check the second term: 2 × 0.5 = 1, giving 3, not 2.4.',
      '$6.00': 'This is (10 + 2)/2 — an unweighted average, not an expected value.',
    },
    conceptSummary:
      'Expected value = Σ (outcome × probability), including zero-payout outcomes.',
    tags: ['expected-value', 'probability'],
  }),

  authored({
    id: 'math.a.bestfit.1',
    section: 'math',
    microSkill: 'math.stat.data',
    difficulty: 3,
    expectedSeconds: 60,
    prompt:
      'A line of best fit for a scatterplot of study hours (x) vs. quiz score (y) is y = 6x + 55. Which is the best interpretation of the slope?',
    correct: 'Each additional hour of study is associated with about 6 more points.',
    choices: [
      'Each additional hour of study is associated with about 6 more points.',
      'A student who studies zero hours scores exactly 6.',
      'Every student improves by exactly 6 points per hour.',
      'The maximum possible score is 55.',
    ],
    explanation:
      'The slope (6) is the predicted change in y per one-unit change in x — about 6 points per extra hour, on average.',
    distractors: {
      'A student who studies zero hours scores exactly 6.': 'The zero-hours prediction is the intercept (55), not the slope.',
      'Every student improves by exactly 6 points per hour.': 'A best-fit line describes an average trend, not a guarantee for every student.',
      'The maximum possible score is 55.': 'The intercept is a starting prediction, not a maximum.',
    },
    conceptSummary:
      'Slope = predicted change in y per unit of x; intercept = prediction when x = 0. Trends are averages, not guarantees.',
    tags: ['scatterplot', 'best-fit', 'interpretation'],
  }),

  authored({
    id: 'math.a.transform.1',
    section: 'math',
    microSkill: 'math.fn.graphs',
    difficulty: 4,
    expectedSeconds: 65,
    prompt:
      'The graph of y = f(x) is shifted 3 units right and 2 units down. Which equation describes the new graph?',
    correct: 'y = f(x − 3) − 2',
    choices: [
      'y = f(x − 3) − 2',
      'y = f(x + 3) − 2',
      'y = f(x − 3) + 2',
      'y = f(x − 2) − 3',
    ],
    explanation:
      'A shift RIGHT by 3 replaces x with (x − 3) — the sign is opposite the direction — and a shift down subtracts 2 outside the function.',
    distractors: {
      'y = f(x + 3) − 2': '(x + 3) shifts LEFT, not right — horizontal shifts run opposite to their sign.',
      'y = f(x − 3) + 2': '+2 outside shifts UP; the graph moves down.',
      'y = f(x − 2) − 3': 'The 3 and 2 are swapped between the horizontal and vertical roles.',
    },
    conceptSummary:
      'y = f(x − h) + k shifts right h and up k; horizontal shifts are opposite the sign inside.',
    strategyTip: 'Inside the parentheses = horizontal and backwards; outside = vertical and as written.',
    tags: ['transformations', 'graphs'],
  }),

  authored({
    id: 'math.a.log.1',
    section: 'math',
    microSkill: 'math.fn.exponential',
    difficulty: 4,
    expectedSeconds: 60,
    prompt: 'If log₂(x) = 5, what is the value of x?',
    correct: '32',
    choices: ['32', '25', '10', '64'],
    explanation:
      'log₂(x) = 5 means 2⁵ = x, so x = 32.',
    distractors: {
      '25': 'This squared 5 — the base is 2, so compute 2⁵, not 5².',
      '10': 'This multiplied 2 × 5; a logarithm is an exponent, not a product.',
      '64': 'That is 2⁶ — one power too many.',
    },
    conceptSummary: 'log_b(x) = y means bʸ = x — a logarithm IS an exponent.',
    strategyTip: 'Rewrite every log equation in exponential form first.',
    tags: ['logarithms'],
  }),

  authored({
    id: 'math.a.rational.1',
    section: 'math',
    microSkill: 'math.alg.expressions',
    difficulty: 4,
    expectedSeconds: 70,
    prompt:
      'For x ≠ 3, which expression is equivalent to (x² − 9)/(x − 3)?',
    correct: 'x + 3',
    choices: ['x + 3', 'x − 3', 'x² − 3', 'x + 6'],
    explanation:
      'Factor the numerator as a difference of squares: x² − 9 = (x − 3)(x + 3). Cancel (x − 3) to get x + 3.',
    distractors: {
      'x − 3': 'The surviving factor after cancelling is (x + 3), not (x − 3).',
      'x² − 3': 'You can’t subtract the denominator from the numerator — factor and cancel.',
      'x + 6': 'Check the factoring: x² − 9 = (x − 3)(x + 3).',
    },
    conceptSummary:
      'Simplify rational expressions by factoring, then cancelling common factors.',
    strategyTip: 'a² − b² = (a − b)(a + b) appears constantly on the ACT.',
    tags: ['rational-expressions', 'factoring'],
  }),

  authored({
    id: 'math.a.probability.compound.1',
    section: 'math',
    microSkill: 'math.stat.probability',
    difficulty: 4,
    expectedSeconds: 70,
    prompt:
      'Two fair six-sided dice are rolled. What is the probability that the sum is 9?',
    correct: '1/9',
    choices: ['1/9', '1/6', '1/12', '4/9'],
    explanation:
      'There are 36 equally likely outcomes. Sums of 9 come from (3,6), (4,5), (5,4), (6,3) — 4 outcomes. 4/36 = 1/9.',
    distractors: {
      '1/6': 'That would require 6 favorable outcomes; only 4 give a sum of 9.',
      '1/12': 'That is 3/36; there are 4 ways, not 3, to make 9.',
      '4/9': 'You may have divided by 9 instead of 36; the sample space has 36 outcomes.',
    },
    conceptSummary:
      'Compound probability: count favorable outcomes over the 36-outcome sample space for two dice.',
    strategyTip: 'List the ordered pairs that give the target sum; remember (3,6) and (6,3) are different.',
    tags: ['probability', 'compound', 'dice'],
  }),
];
