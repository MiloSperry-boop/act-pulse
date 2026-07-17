/**
 * Subject-verb agreement generator with the 8-level difficulty progression.
 * Each template has a known correct number; distractors are the mismatched
 * conjugations, so the correct answer is computed, never guessed.
 */

import type { ACTQuestion, Difficulty } from '../../data/questionSchema';
import { mulberry32, hashSeed, pick, randInt, type RNG } from '../../engine/rng';
import { makeQuestion } from './helpers';

interface VerbSet {
  singular: string; // agrees with singular subject
  plural: string; // agrees with plural subject
  distract: [string, string]; // two non-finite / wrong-tense forms
}

// Verb sets are grouped by what predicate they can grammatically precede.
// BE works before adjectives, participles, and "There ___" constructions;
// SEEM works before adjectives only. (Action verbs like "runs" would produce
// ungrammatical sentences with these templates, so they are not used.)
const BE_VERBS: VerbSet[] = [
  { singular: 'is', plural: 'are', distract: ['being', 'be'] },
  { singular: 'was', plural: 'were', distract: ['been', 'being'] },
];
const SEEM_VERBS: VerbSet[] = [
  { singular: 'seems', plural: 'seem', distract: ['seeming', 'to seem'] },
];
/** Adjective predicates ("… careful about the details") take BE or SEEM. */
const LINKING = [...BE_VERBS, ...SEEM_VERBS];
/** Participle / existential predicates ("… stored in the attic") take BE only. */
const BE_ONLY = BE_VERBS;

interface Template {
  level: number;
  difficulty: Difficulty;
  micro: string;
  subskillNote: string;
  /** Verb sets grammatically compatible with this template's predicate. */
  verbs: VerbSet[];
  /** returns { sentenceBefore, sentenceAfter, subjectIsSingular, trapNote } */
  build: (rng: RNG) => {
    before: string;
    after: string;
    singular: boolean;
    trap: string;
    subjectPhrase: string;
  };
}

const SINGULAR_NOUNS = ['scientist', 'teacher', 'author', 'engineer', 'artist'];
const PLURAL_NOUNS = ['students', 'workers', 'players', 'readers', 'volunteers'];
const PLURAL_OBJECTS = ['letters', 'samples', 'reports', 'photographs', 'files'];
const SINGULAR_OBJECTS = ['garden', 'library', 'museum', 'laboratory', 'office'];

const TEMPLATES: Template[] = [
  {
    level: 1,
    verbs: LINKING,
    difficulty: 1,
    micro: 'eng.usage.sva.basic',
    subskillNote: 'Simple subject',
    build: (rng) => {
      const singular = rng() < 0.5;
      const subj = singular ? pick(rng, SINGULAR_NOUNS) : pick(rng, PLURAL_NOUNS);
      const art = singular ? 'The' : 'The';
      return {
        before: `${art} ${subj} `,
        after: ` careful about the details.`,
        singular,
        trap: '',
        subjectPhrase: subj,
      };
    },
  },
  {
    level: 2,
    verbs: BE_ONLY,
    difficulty: 2,
    micro: 'eng.usage.sva.intervening',
    subskillNote: 'Intervening prepositional phrase',
    build: (rng) => {
      const singular = rng() < 0.5;
      if (singular) {
        const subj = pick(rng, ['box', 'stack', 'collection', 'series']);
        const trapNoun = pick(rng, PLURAL_OBJECTS);
        return {
          before: `The ${subj} of old ${trapNoun} `,
          after: ` stored in the attic.`,
          singular: true,
          trap: trapNoun,
          subjectPhrase: subj,
        };
      }
      const subj = pick(rng, ['boxes', 'crates', 'folders']);
      const trapNoun = pick(rng, SINGULAR_OBJECTS);
      return {
        before: `The ${subj} near the ${trapNoun} `,
        after: ` clearly labeled.`,
        singular: false,
        trap: trapNoun,
        subjectPhrase: subj,
      };
    },
  },
  {
    level: 3,
    verbs: LINKING,
    difficulty: 3,
    micro: 'eng.usage.sva.intervening',
    subskillNote: 'Relative clause between subject and verb',
    build: (rng) => {
      const singular = rng() < 0.5;
      const subj = singular ? pick(rng, SINGULAR_NOUNS) : pick(rng, PLURAL_NOUNS);
      const trapNoun = singular ? pick(rng, PLURAL_OBJECTS) : pick(rng, SINGULAR_OBJECTS);
      return {
        before: `The ${subj}, who reviewed the ${trapNoun} last week, `,
        after: ` confident about the conclusion.`,
        singular,
        trap: trapNoun,
        subjectPhrase: subj,
      };
    },
  },
  {
    level: 4,
    verbs: BE_ONLY,
    difficulty: 3,
    micro: 'eng.usage.sva.compound',
    subskillNote: 'Compound subject joined by "and"',
    build: (rng) => {
      const a = pick(rng, SINGULAR_NOUNS);
      const b = pick(rng, SINGULAR_NOUNS.filter((x) => x !== a));
      return {
        before: `The ${a} and the ${b} `,
        after: ` collaborating on the project.`,
        singular: false, // "and" → plural
        trap: 'compound subject',
        subjectPhrase: `${a} and ${b}`,
      };
    },
  },
  {
    level: 5,
    verbs: LINKING,
    difficulty: 4,
    micro: 'eng.usage.sva.compound',
    subskillNote: 'Neither/nor — agree with the nearer subject',
    build: (rng) => {
      // "Neither the players nor the coach ___" → nearer is singular.
      const nearSingular = rng() < 0.5;
      const near = nearSingular ? pick(rng, SINGULAR_NOUNS) : pick(rng, PLURAL_NOUNS);
      const far = nearSingular ? pick(rng, PLURAL_NOUNS) : pick(rng, SINGULAR_NOUNS);
      return {
        before: `Neither the ${far} nor the ${near} `,
        after: ` willing to compromise.`,
        singular: nearSingular,
        trap: 'nearer subject',
        subjectPhrase: near,
      };
    },
  },
  {
    level: 6,
    verbs: LINKING,
    difficulty: 4,
    micro: 'eng.usage.sva.indefinite',
    subskillNote: 'Indefinite pronoun subject',
    build: (rng) => {
      const pronoun = pick(rng, ['Each', 'Every one', 'Neither']);
      const trapNoun = pick(rng, PLURAL_NOUNS);
      return {
        before: `${pronoun} of the ${trapNoun} `,
        after: ` responsible for a section.`,
        singular: true, // each/every one/neither → singular
        trap: trapNoun,
        subjectPhrase: pronoun.toLowerCase(),
      };
    },
  },
  {
    level: 7,
    verbs: BE_ONLY,
    difficulty: 4,
    micro: 'eng.usage.sva.inverted',
    subskillNote: 'Inverted order (there is/are)',
    build: (rng) => {
      const plural = rng() < 0.6;
      const noun = plural
        ? pick(rng, ['several reasons', 'many options', 'two explanations'])
        : pick(rng, ['a single reason', 'one explanation', 'a clear cause']);
      return {
        before: `There `,
        after: ` ${noun} for the delay.`,
        singular: !plural,
        trap: 'inverted subject after the verb',
        subjectPhrase: noun,
      };
    },
  },
];

export function generateSvaQuestion(seedStr: string): ACTQuestion {
  const rng = mulberry32(hashSeed(seedStr));
  const tmpl = TEMPLATES[randInt(rng, 0, TEMPLATES.length - 1)];
  const parts = tmpl.build(rng);
  const verb = pick(rng, tmpl.verbs);
  const correct = parts.singular ? verb.singular : verb.plural;
  const wrongNumber = parts.singular ? verb.plural : verb.singular;

  const sentence = `${parts.before}______${parts.after}`;
  const id = `gen.sva.L${tmpl.level}.${hashSeed(seedStr).toString(36)}`;

  const trapExplain = parts.trap
    ? ` The word “${parts.trap}” is a distractor — it is not the subject.`
    : '';

  return makeQuestion(rng, {
    id,
    section: 'english',
    officialCategory: 'Conventions of Standard English',
    subskill: 'Usage',
    microSkill: tmpl.micro,
    difficulty: tmpl.difficulty,
    expectedSeconds: 35,
    format: 'multiple_choice',
    prompt: `Choose the verb that best completes the sentence:\n\n“${sentence}”`,
    correctText: correct,
    distractorTexts: [wrongNumber, verb.distract[0], verb.distract[1]],
    distractorExplainer: (t) =>
      t === wrongNumber
        ? `“${t}” agrees with a ${parts.singular ? 'plural' : 'singular'} subject, but the true subject (“${parts.subjectPhrase}”) is ${parts.singular ? 'singular' : 'plural'}.${trapExplain}`
        : `“${t}” is not a finite verb that can stand alone here; the sentence needs a conjugated verb.`,
    explanation: `The subject is “${parts.subjectPhrase}”, which is ${parts.singular ? 'singular' : 'plural'}, so it takes “${correct}”.${trapExplain} Strip away the words between the subject and the verb to hear the agreement clearly.`,
    conceptSummary:
      'Match the verb to its true subject in number, ignoring intervening phrases and nearby distracting nouns. “Each/every/neither” are singular; “and” makes a compound plural; with “neither…nor,” agree with the nearer subject.',
    strategyTip:
      'Find the true subject, cross out everything between it and the verb, then check agreement.',
    hints: [
      {
        level: 1,
        kind: 'concept',
        text: 'Identify the true subject first — it is rarely the noun sitting right before the verb.',
      },
      {
        level: 2,
        kind: 'starting_step',
        text: `The subject here is “${parts.subjectPhrase}”. Is it singular or plural?`,
      },
    ],
    tags: ['generated', 'sva', `level-${tmpl.level}`],
  });
}

export function generateSvaBatch(baseSeed: string, n: number): ACTQuestion[] {
  const out: ACTQuestion[] = [];
  const seen = new Set<string>();
  let i = 0;
  while (out.length < n && i < n * 6) {
    const q = generateSvaQuestion(`${baseSeed}:${i}`);
    if (!seen.has(q.id)) {
      seen.add(q.id);
      out.push(q);
    }
    i++;
  }
  return out;
}
