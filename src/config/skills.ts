/**
 * Micro-skill taxonomy. Every question tags exactly one primary `microSkill`
 * (and optional secondary skills). Each micro-skill maps to an official ACT
 * reporting category so blueprint coverage can be computed.
 */

import type { SectionId } from './actBlueprint';

export interface Skill {
  id: string;
  section: SectionId;
  categoryId: string; // one of CATEGORY_TARGETS ids
  subcategory: string;
  label: string;
  /** Higher = the initial user self-reported this as a priority weakness. */
  initialPriority: number; // 0 = normal, 1 = medium, 2 = high
}

// Convenience builder to keep the table readable.
function s(
  id: string,
  section: SectionId,
  categoryId: string,
  subcategory: string,
  label: string,
  initialPriority = 0,
): Skill {
  return { id, section, categoryId, subcategory, label, initialPriority };
}

export const SKILLS: Skill[] = [
  // ─── ENGLISH · Conventions · Punctuation ──────────────────────────────
  s('eng.comma.intro', 'english', 'eng.conventions', 'Punctuation', 'Commas — introductory elements', 2),
  s('eng.comma.nonessential', 'english', 'eng.conventions', 'Punctuation', 'Commas — nonessential information', 2),
  s('eng.comma.series', 'english', 'eng.conventions', 'Punctuation', 'Commas — items in a series', 2),
  s('eng.comma.coordinate', 'english', 'eng.conventions', 'Punctuation', 'Commas — coordinate adjectives', 1),
  s('eng.comma.compound', 'english', 'eng.conventions', 'Punctuation', 'Commas — before FANBOYS joining clauses', 2),
  s('eng.comma.splice', 'english', 'eng.conventions', 'Punctuation', 'Comma splices', 2),
  s('eng.comma.unnecessary', 'english', 'eng.conventions', 'Punctuation', 'Unnecessary commas (subject/verb split)', 2),
  s('eng.punct.semicolon', 'english', 'eng.conventions', 'Punctuation', 'Semicolons', 1),
  s('eng.punct.colon', 'english', 'eng.conventions', 'Punctuation', 'Colons', 1),
  s('eng.punct.apostrophe', 'english', 'eng.conventions', 'Punctuation', 'Apostrophes & possessives', 1),
  s('eng.punct.dash', 'english', 'eng.conventions', 'Punctuation', 'Dashes', 1),

  // ─── ENGLISH · Conventions · Sentence Structure ───────────────────────
  s('eng.struct.fragment', 'english', 'eng.conventions', 'Sentence Structure', 'Fragments', 1),
  s('eng.struct.runon', 'english', 'eng.conventions', 'Sentence Structure', 'Run-ons & fused sentences', 1),
  s('eng.struct.parallel', 'english', 'eng.conventions', 'Sentence Structure', 'Parallel structure', 1),
  s('eng.struct.modifier', 'english', 'eng.conventions', 'Sentence Structure', 'Modifier placement / dangling modifiers', 1),

  // ─── ENGLISH · Conventions · Usage ────────────────────────────────────
  s('eng.usage.sva.basic', 'english', 'eng.conventions', 'Usage', 'Subject-verb agreement — basic', 2),
  s('eng.usage.sva.intervening', 'english', 'eng.conventions', 'Usage', 'SVA — intervening phrase', 2),
  s('eng.usage.sva.compound', 'english', 'eng.conventions', 'Usage', 'SVA — compound & either/or subjects', 2),
  s('eng.usage.sva.indefinite', 'english', 'eng.conventions', 'Usage', 'SVA — indefinite pronouns', 1),
  s('eng.usage.sva.inverted', 'english', 'eng.conventions', 'Usage', 'SVA — inverted order', 1),
  s('eng.usage.pronoun', 'english', 'eng.conventions', 'Usage', 'Pronoun agreement, clarity & case', 1),
  s('eng.usage.verbtense', 'english', 'eng.conventions', 'Usage', 'Verb tense & form', 1),
  s('eng.usage.confused', 'english', 'eng.conventions', 'Usage', 'Commonly confused words', 1),

  // ─── ENGLISH · Knowledge of Language ──────────────────────────────────
  s('eng.kol.concision', 'english', 'eng.knowledge', 'Knowledge of Language', 'Concision & redundancy', 1),
  s('eng.kol.precision', 'english', 'eng.knowledge', 'Knowledge of Language', 'Precision & word choice', 1),
  s('eng.kol.tone', 'english', 'eng.knowledge', 'Knowledge of Language', 'Style & tone consistency', 1),

  // ─── ENGLISH · Production of Writing ──────────────────────────────────
  s('eng.prod.writersgoal', 'english', 'eng.production', 'Topic Development', "Writer's goal — does it accomplish the purpose", 2),
  s('eng.prod.purpose', 'english', 'eng.production', 'Topic Development', 'Main purpose & summary', 2),
  s('eng.prod.adddelete', 'english', 'eng.production', 'Topic Development', 'Add or delete a sentence', 1),
  s('eng.prod.relevance', 'english', 'eng.production', 'Topic Development', 'Relevance of a detail', 1),
  s('eng.prod.transition', 'english', 'eng.production', 'Organization', 'Transitions', 1),
  s('eng.prod.order', 'english', 'eng.production', 'Organization', 'Sentence / paragraph order', 1),
  s('eng.prod.introconc', 'english', 'eng.production', 'Organization', 'Introductions & conclusions', 1),

  // ─── MATH · Number & Quantity ─────────────────────────────────────────
  s('math.nq.matrix.dims', 'math', 'math.higher', 'Number & Quantity', 'Matrices — dimensions & entries', 2),
  s('math.nq.matrix.addsub', 'math', 'math.higher', 'Number & Quantity', 'Matrices — addition & subtraction', 2),
  s('math.nq.matrix.scalar', 'math', 'math.higher', 'Number & Quantity', 'Matrices — scalar multiplication', 2),
  s('math.nq.matrix.multiply', 'math', 'math.higher', 'Number & Quantity', 'Matrices — multiplication & validity', 2),
  s('math.nq.exponents', 'math', 'math.higher', 'Number & Quantity', 'Exponents & radicals', 0),
  s('math.nq.complex', 'math', 'math.higher', 'Number & Quantity', 'Complex numbers', 0),

  // ─── MATH · Algebra ───────────────────────────────────────────────────
  s('math.alg.linear', 'math', 'math.higher', 'Algebra', 'Linear equations & inequalities', 0),
  s('math.alg.systems', 'math', 'math.higher', 'Algebra', 'Systems of equations', 1),
  s('math.alg.quadratic', 'math', 'math.higher', 'Algebra', 'Quadratics & factoring', 1),
  s('math.alg.expressions', 'math', 'math.higher', 'Algebra', 'Equivalent & rational expressions', 1),

  // ─── MATH · Functions ─────────────────────────────────────────────────
  s('math.fn.notation', 'math', 'math.higher', 'Functions', 'Function notation & evaluation', 0),
  s('math.fn.composition', 'math', 'math.higher', 'Functions', 'Composition & inverses', 1),
  s('math.fn.graphs', 'math', 'math.higher', 'Functions', 'Graph features & transformations', 1),
  s('math.fn.exponential', 'math', 'math.higher', 'Functions', 'Exponential & logarithmic functions', 1),

  // ─── MATH · Geometry ──────────────────────────────────────────────────
  s('math.geo.triangles', 'math', 'math.higher', 'Geometry', 'Triangles, similarity & congruence', 1),
  s('math.geo.circles', 'math', 'math.higher', 'Geometry', 'Circles & coordinate geometry', 1),
  s('math.geo.volume', 'math', 'math.higher', 'Geometry', 'Area, surface area & volume', 1),
  s('math.geo.trig', 'math', 'math.higher', 'Geometry', 'Right-triangle trigonometry', 1),

  // ─── MATH · Statistics & Probability ──────────────────────────────────
  s('math.stat.center', 'math', 'math.higher', 'Statistics & Probability', 'Mean, median, range & weighted averages', 0),
  s('math.stat.data', 'math', 'math.higher', 'Statistics & Probability', 'Scatterplots, correlation & best fit', 1),
  s('math.stat.probability', 'math', 'math.higher', 'Statistics & Probability', 'Probability & counting', 1),
  s('math.stat.expected', 'math', 'math.higher', 'Statistics & Probability', 'Expected value', 1),

  // ─── MATH · Integrating Essential Skills ──────────────────────────────
  s('math.ies.rates', 'math', 'math.essential', 'Integrating Essential Skills', 'Rates, ratios & proportions', 1),
  s('math.ies.percent', 'math', 'math.essential', 'Integrating Essential Skills', 'Percentages & unit conversion', 1),
  s('math.ies.multistep', 'math', 'math.essential', 'Integrating Essential Skills', 'Multistep modeling & method selection', 2),

  // ─── READING · Key Ideas and Details ──────────────────────────────────
  s('read.key.mainidea', 'reading', 'read.key', 'Key Ideas and Details', 'Main idea & central theme', 1),
  s('read.key.detail', 'reading', 'read.key', 'Key Ideas and Details', 'Significant details & evidence location', 2),
  s('read.key.inference', 'reading', 'read.key', 'Key Ideas and Details', 'Inference & logical conclusions', 1),
  s('read.key.sequence', 'reading', 'read.key', 'Key Ideas and Details', 'Cause/effect, comparison & sequence', 0),

  // ─── READING · Craft and Structure ────────────────────────────────────
  s('read.craft.purpose', 'reading', 'read.craft', 'Craft and Structure', 'Author purpose & perspective', 2),
  s('read.craft.context', 'reading', 'read.craft', 'Craft and Structure', 'Meaning in context & word choice', 1),
  s('read.craft.structure', 'reading', 'read.craft', 'Craft and Structure', 'Text structure & paragraph function', 2),
  s('read.craft.tone', 'reading', 'read.craft', 'Craft and Structure', 'Tone & rhetorical choices', 1),

  // ─── READING · Integration of Knowledge and Ideas ─────────────────────
  s('read.int.evidence', 'reading', 'read.integration', 'Integration of Knowledge and Ideas', 'Claims, evidence & reasoning', 1),
  s('read.int.compare', 'reading', 'read.integration', 'Integration of Knowledge and Ideas', 'Comparing paired passages', 1),
  s('read.int.visual', 'reading', 'read.integration', 'Integration of Knowledge and Ideas', 'Integrating text with figures/tables', 1),
  s('read.speed.efficiency', 'reading', 'read.key', 'Key Ideas and Details', 'Reading efficiency & passage mapping', 2),

  // ─── SCIENCE · Interpretation of Data ─────────────────────────────────
  s('sci.data.readvalue', 'science', 'sci.data', 'Interpretation of Data', 'Locate a value / read a graph or table', 0),
  s('sci.data.trend', 'science', 'sci.data', 'Interpretation of Data', 'Identify trends, interpolate & extrapolate', 0),
  s('sci.data.compare', 'science', 'sci.data', 'Interpretation of Data', 'Compare conditions across data', 1),

  // ─── SCIENCE · Scientific Investigation ───────────────────────────────
  s('sci.inv.variables', 'science', 'sci.investigation', 'Scientific Investigation', 'Independent/dependent variables & controls', 1),
  s('sci.inv.design', 'science', 'sci.investigation', 'Scientific Investigation', 'Experimental design & procedure', 1),
  s('sci.inv.predict', 'science', 'sci.investigation', 'Scientific Investigation', 'Predict an additional trial', 1),

  // ─── SCIENCE · Evaluation of Models & Results ─────────────────────────
  s('sci.eval.hypothesis', 'science', 'sci.evaluation', 'Evaluation of Models', 'Does evidence support a hypothesis', 1),
  s('sci.eval.viewpoints', 'science', 'sci.evaluation', 'Evaluation of Models', 'Compare competing explanations', 1),
  s('sci.eval.conclude', 'science', 'sci.evaluation', 'Evaluation of Models', 'What can / cannot be concluded', 1),
];

export const SKILL_BY_ID: Record<string, Skill> = Object.fromEntries(
  SKILLS.map((sk) => [sk.id, sk]),
);

export function skillsForSection(section: SectionId): Skill[] {
  return SKILLS.filter((sk) => sk.section === section);
}

/** Micro-skill ids the initial user self-reported as priority weaknesses. */
export const INITIAL_WEAKNESS_SKILLS: string[] = SKILLS.filter(
  (sk) => sk.initialPriority >= 2,
).map((sk) => sk.id);

export function isValidSkillId(id: string): boolean {
  return id in SKILL_BY_ID;
}
