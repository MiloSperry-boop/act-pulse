import type { ACTQuestion, Passage } from '../../data/questionSchema';
import { authored } from '../authored/authoredHelper';

/** Original science sets. Not official ACT content. Reasoning from supplied data. */

export const SCIENCE_PASSAGES: Passage[] = [
  {
    id: 'sci.p.solubility',
    section: 'science',
    kind: 'science_data',
    title: 'Solubility of a Salt vs. Temperature',
    wordCount: 60,
    attribution: 'Original practice content',
    paragraphs: [
      {
        id: 'p1',
        text: 'Students dissolved a salt in 100 g of water and recorded the maximum mass that would dissolve (solubility) at several temperatures. The results are shown in Table 1.',
      },
    ],
    stimulus: {
      kind: 'table',
      title: 'Table 1 — Solubility (g per 100 g water)',
      columns: ['Temperature (°C)', 'Solubility (g)'],
      rows: [
        [10, 20],
        [20, 32],
        [30, 46],
        [40, 62],
        [50, 80],
      ],
      caption: 'Each value is the maximum salt that dissolved at that temperature.',
    },
  },
  {
    id: 'sci.p.plant',
    section: 'science',
    kind: 'science_research',
    title: 'Light Color and Plant Growth',
    wordCount: 120,
    attribution: 'Original practice content',
    paragraphs: [
      {
        id: 'p1',
        text: 'Researchers grew identical seedlings for 3 weeks under lamps of different colors, keeping water, soil, and temperature the same. One group (the control) grew under normal white light. Average height gain (cm) was recorded in Table 2.',
      },
    ],
    stimulus: {
      kind: 'table',
      title: 'Table 2 — Average height gain after 3 weeks',
      columns: ['Light color', 'Height gain (cm)'],
      rows: [
        ['White (control)', 12],
        ['Blue', 15],
        ['Red', 18],
        ['Green', 6],
      ],
      caption: 'Twenty seedlings per group; all other conditions held constant.',
    },
  },
  {
    id: 'sci.p.dino',
    section: 'science',
    kind: 'science_conflicting',
    title: 'Two Views on Dinosaur Metabolism',
    wordCount: 150,
    attribution: 'Original practice content',
    paragraphs: [
      {
        id: 'p1',
        functionLabel: 'Scientist 1',
        text: 'Scientist 1: Large dinosaurs were warm-blooded (endothermic). Their bones show dense networks of blood vessels like those of modern mammals and birds, which sustain the high, steady metabolism warm-blooded animals need. Fossil evidence of rapid growth further supports a high metabolic rate.',
      },
      {
        id: 'p2',
        functionLabel: 'Scientist 2',
        text: 'Scientist 2: Large dinosaurs were cold-blooded (ectothermic). Their enormous body size would have retained heat from the environment without an internal furnace, a strategy called gigantothermy. Producing enough internal heat for true warm-bloodedness at that size would have required implausible amounts of food.',
      },
    ],
  },
];

export const PHYSICS_PASSAGE: Passage = {
  id: 'sci.p.pendulum',
  section: 'science',
  kind: 'science_research',
  title: 'What Sets a Pendulum’s Swing',
  wordCount: 130,
  attribution: 'Original practice content',
  paragraphs: [
    {
      id: 'p1',
      text: 'Students investigated what determines a pendulum’s period (the time for one full swing). In Experiment 1 they varied the string length while keeping a 50 g bob and a 10° release angle. In Experiment 2 they varied the bob’s mass while keeping a 100 cm string and the same release angle. Each period is the average of 10 trials, shown in Table 3.',
    },
  ],
  stimulus: {
    kind: 'table',
    title: 'Table 3 — Average period (s)',
    columns: ['Experiment', 'Condition', 'Period (s)'],
    rows: [
      ['1', '25 cm string', 1.0],
      ['1', '50 cm string', 1.4],
      ['1', '100 cm string', 2.0],
      ['1', '200 cm string', 2.8],
      ['2', '50 g bob', 2.0],
      ['2', '100 g bob', 2.0],
      ['2', '200 g bob', 2.0],
    ],
    caption: 'Release angle held at 10° for all trials.',
  },
};

SCIENCE_PASSAGES.push(PHYSICS_PASSAGE);

export const SCIENCE_QUESTIONS: ACTQuestion[] = [
  // Pendulum — research summary (physics)
  authored({
    id: 'sci.q.pend.design',
    section: 'science',
    microSkill: 'sci.inv.design',
    difficulty: 2,
    expectedSeconds: 45,
    format: 'science_set',
    passageId: 'sci.p.pendulum',
    prompt:
      'Why did the students keep the release angle at 10° in both experiments?',
    correct: 'To make sure any change in period came only from the variable being tested.',
    choices: [
      'To make the pendulum swing faster.',
      'To make sure any change in period came only from the variable being tested.',
      'Because larger angles are impossible to measure.',
      'To reduce the mass of the bob.',
    ],
    explanation:
      'Holding the angle constant controls it as a variable, so differences in period can be attributed to string length (Exp. 1) or mass (Exp. 2) alone.',
    distractors: {
      'To make the pendulum swing faster.': 'A fixed angle is about control, not speed.',
      'Because larger angles are impossible to measure.': 'Larger angles can be measured; they were simply held constant.',
      'To reduce the mass of the bob.': 'Angle and mass are independent quantities.',
    },
    conceptSummary:
      'Controlled variables are held constant so only the independent variable can cause the effect.',
    tags: ['science', 'design', 'controls', 'physics'],
  }),
  authored({
    id: 'sci.q.pend.trend',
    section: 'science',
    microSkill: 'sci.data.trend',
    difficulty: 3,
    expectedSeconds: 45,
    format: 'science_set',
    passageId: 'sci.p.pendulum',
    prompt: 'Based on Table 3, the period of the pendulum depends on:',
    correct: 'string length but not bob mass.',
    choices: [
      'string length but not bob mass.',
      'bob mass but not string length.',
      'both string length and bob mass.',
      'neither string length nor bob mass.',
    ],
    explanation:
      'In Experiment 1 the period rises with string length (1.0 → 2.8 s), while in Experiment 2 the period stays 2.0 s across all masses.',
    distractors: {
      'bob mass but not string length.': 'The mass rows are identical (2.0 s); the length rows change.',
      'both string length and bob mass.': 'Mass shows no effect — all three masses give 2.0 s.',
      'neither string length nor bob mass.': 'Length clearly changes the period.',
    },
    conceptSummary:
      'Compare each experiment separately: a variable matters only if the outcome changes with it.',
    strategyTip: 'Scan for the column that changes while the result stays flat — that variable doesn’t matter.',
    tags: ['science', 'trend', 'physics'],
  }),
  authored({
    id: 'sci.q.pend.predict',
    section: 'science',
    microSkill: 'sci.inv.predict',
    difficulty: 3,
    expectedSeconds: 50,
    format: 'science_set',
    passageId: 'sci.p.pendulum',
    prompt:
      'If the students tested a 150 cm string with a 50 g bob at 10°, the period would most likely be:',
    correct: 'between 2.0 and 2.8 seconds.',
    choices: [
      'between 2.0 and 2.8 seconds.',
      'less than 1.0 second.',
      'exactly 2.0 seconds.',
      'greater than 2.8 seconds.',
    ],
    explanation:
      '150 cm falls between the 100 cm (2.0 s) and 200 cm (2.8 s) trials, so its period should fall between those values.',
    distractors: {
      'less than 1.0 second.': 'That would suit a string shorter than 25 cm.',
      'exactly 2.0 seconds.': '2.0 s belongs to the 100 cm string; 150 cm should be longer.',
      'greater than 2.8 seconds.': 'That would require a string longer than 200 cm.',
    },
    conceptSummary: 'Interpolate: a value between two tested conditions gives a result between their outcomes.',
    tags: ['science', 'interpolation', 'prediction', 'physics'],
  }),

  // Solubility — data representation
  authored({
    id: 'sci.q.sol.read',
    section: 'science',
    microSkill: 'sci.data.readvalue',
    difficulty: 1,
    expectedSeconds: 30,
    format: 'science_set',
    passageId: 'sci.p.solubility',
    prompt: 'According to Table 1, what is the solubility of the salt at 30 °C?',
    correct: '46 g',
    choices: ['32 g', '46 g', '62 g', '80 g'],
    explanation: 'Reading the row for 30 °C in Table 1 gives a solubility of 46 g.',
    distractors: {
      '32 g': 'That is the value at 20 °C, not 30 °C.',
      '62 g': 'That is the value at 40 °C.',
      '80 g': 'That is the value at 50 °C.',
    },
    conceptSummary: 'Locate the requested row and read the corresponding value.',
    tags: ['science', 'data', 'read-value'],
  }),
  authored({
    id: 'sci.q.sol.trend',
    section: 'science',
    microSkill: 'sci.data.trend',
    difficulty: 2,
    expectedSeconds: 35,
    format: 'science_set',
    passageId: 'sci.p.solubility',
    prompt: 'Based on Table 1, as temperature increases, solubility:',
    correct: 'increases.',
    choices: ['increases.', 'decreases.', 'stays constant.', 'increases then decreases.'],
    explanation:
      'Every step up in temperature (10→50 °C) is paired with a larger solubility (20→80 g), a steadily increasing trend.',
    distractors: {
      'decreases.': 'The values rise, not fall, as temperature increases.',
      'stays constant.': 'The solubility changes at every temperature.',
      'increases then decreases.': 'There is no peak; the values rise across the whole table.',
    },
    conceptSummary: 'Identify a trend by comparing how one variable changes as the other increases.',
    tags: ['science', 'trend'],
  }),
  authored({
    id: 'sci.q.sol.extrap',
    section: 'science',
    microSkill: 'sci.data.trend',
    difficulty: 3,
    expectedSeconds: 45,
    format: 'science_set',
    passageId: 'sci.p.solubility',
    prompt:
      'If the trend in Table 1 continues, the solubility at 60 °C would most likely be closest to:',
    correct: '100 g',
    choices: ['70 g', '80 g', '100 g', '46 g'],
    explanation:
      'Solubility rises by roughly 12–18 g per 10 °C, reaching 80 g at 50 °C. Extending the trend to 60 °C gives about 100 g.',
    distractors: {
      '70 g': 'This is below the 50 °C value of 80 g, so it contradicts the increasing trend.',
      '80 g': 'That is the value already reached at 50 °C; 60 °C should be higher.',
      '46 g': 'That is the 30 °C value, far below the trend at 60 °C.',
    },
    conceptSummary: 'Extrapolate by extending the established rate of change beyond the data.',
    strategyTip: 'Estimate the step size per interval, then add one more step.',
    tags: ['science', 'extrapolation'],
  }),

  // Plant — research summary
  authored({
    id: 'sci.q.plant.control',
    section: 'science',
    microSkill: 'sci.inv.variables',
    difficulty: 2,
    expectedSeconds: 40,
    format: 'science_set',
    passageId: 'sci.p.plant',
    prompt: 'In this experiment, which group serves as the control?',
    correct: 'The seedlings under white light.',
    choices: [
      'The seedlings under red light.',
      'The seedlings under white light.',
      'The seedlings under green light.',
      'There is no control group.',
    ],
    explanation:
      'The passage states the control grew "under normal white light," providing a baseline against which the colored-light groups are compared.',
    distractors: {
      'The seedlings under red light.': 'Red is an experimental (treatment) group, not the baseline.',
      'The seedlings under green light.': 'Green is a treatment group being tested.',
      'There is no control group.': 'The passage explicitly identifies the white-light group as the control.',
    },
    conceptSummary: 'The control is the baseline group that receives no experimental treatment.',
    tags: ['science', 'control', 'design'],
  }),
  authored({
    id: 'sci.q.plant.iv',
    section: 'science',
    microSkill: 'sci.inv.variables',
    difficulty: 2,
    expectedSeconds: 40,
    format: 'science_set',
    passageId: 'sci.p.plant',
    prompt: 'What is the independent variable in this experiment?',
    correct: 'The color of the light.',
    choices: [
      'The height gain of the seedlings.',
      'The color of the light.',
      'The amount of water given.',
      'The temperature of the room.',
    ],
    explanation:
      'The researchers deliberately varied light color and measured the resulting height gain, so light color is the independent variable.',
    distractors: {
      'The height gain of the seedlings.': 'Height gain is the measured outcome — the dependent variable.',
      'The amount of water given.': 'Water was held constant, so it is a controlled variable.',
      'The temperature of the room.': 'Temperature was kept the same; it is controlled, not independent.',
    },
    conceptSummary:
      'The independent variable is the one the experimenter deliberately changes.',
    strategyTip: 'Independent = what you change; dependent = what you measure.',
    tags: ['science', 'independent-variable'],
  }),
  authored({
    id: 'sci.q.plant.conclude',
    section: 'science',
    microSkill: 'sci.eval.conclude',
    difficulty: 3,
    expectedSeconds: 45,
    format: 'science_set',
    passageId: 'sci.p.plant',
    prompt: 'Which conclusion is best supported by Table 2?',
    correct: 'Red light produced more growth than white light, while green produced less.',
    choices: [
      'All colored lights increased growth compared with white light.',
      'Red light produced more growth than white light, while green produced less.',
      'Light color had no effect on growth.',
      'Green light is best for plant growth.',
    ],
    explanation:
      'Red (18) and blue (15) exceeded white (12), but green (6) was below it — so not all colors helped, and green was worst.',
    distractors: {
      'All colored lights increased growth compared with white light.':
        'Green (6 cm) was below white (12 cm), so this overgeneralizes.',
      'Light color had no effect on growth.': 'The groups differ substantially, showing an effect.',
      'Green light is best for plant growth.': 'Green produced the least growth, not the most.',
    },
    conceptSummary: 'A supported conclusion accounts for every data point, not just the favorable ones.',
    tags: ['science', 'conclusion', 'evaluation'],
  }),

  // Dino — conflicting viewpoints
  authored({
    id: 'sci.q.dino.view',
    section: 'science',
    microSkill: 'sci.eval.viewpoints',
    difficulty: 3,
    expectedSeconds: 50,
    format: 'science_set',
    passageId: 'sci.p.dino',
    prompt: 'Scientist 1 would most likely cite which evidence to support the warm-blooded view?',
    correct: 'Dense networks of blood vessels in dinosaur bones.',
    choices: [
      'The large body size of dinosaurs.',
      'Dense networks of blood vessels in dinosaur bones.',
      'The high food requirement of large animals.',
      'The strategy of gigantothermy.',
    ],
    explanation:
      'Scientist 1 points to bone blood-vessel density (like mammals and birds) and rapid growth as signs of a high, warm-blooded metabolism.',
    distractors: {
      'The large body size of dinosaurs.': 'Body size is Scientist 2’s evidence for heat retention without endothermy.',
      'The high food requirement of large animals.': 'Scientist 2 uses food requirements to argue against warm-bloodedness.',
      'The strategy of gigantothermy.': 'Gigantothermy is Scientist 2’s cold-blooded mechanism.',
    },
    conceptSummary: 'In conflicting-viewpoints sets, match each piece of evidence to the view it supports.',
    strategyTip: 'Keep each scientist’s claims and evidence in separate mental columns.',
    tags: ['science', 'conflicting-viewpoints'],
  }),
  authored({
    id: 'sci.q.dino.compare',
    section: 'science',
    microSkill: 'sci.eval.viewpoints',
    difficulty: 4,
    expectedSeconds: 55,
    format: 'science_set',
    passageId: 'sci.p.dino',
    prompt:
      'The discovery that a giant dinosaur ate far less food than a warm-blooded animal of similar size would most:',
    correct: 'support Scientist 2 and weaken Scientist 1.',
    choices: [
      'support Scientist 1 and weaken Scientist 2.',
      'support Scientist 2 and weaken Scientist 1.',
      'support both scientists equally.',
      'have no bearing on either view.',
    ],
    explanation:
      'Scientist 2 argues warm-bloodedness at that size would demand implausible amounts of food. Low food intake fits gigantothermy (Scientist 2) and undercuts the high-metabolism claim (Scientist 1).',
    distractors: {
      'support Scientist 1 and weaken Scientist 2.':
        'Low food intake argues against the high metabolism Scientist 1 needs.',
      'support both scientists equally.': 'The evidence favors the cold-blooded view, not both.',
      'have no bearing on either view.': 'Food requirement is central to Scientist 2’s argument.',
    },
    conceptSummary:
      'New evidence supports a viewpoint when it fits that view’s reasoning and strains the other.',
    tags: ['science', 'conflicting-viewpoints', 'evaluation'],
  }),
];
