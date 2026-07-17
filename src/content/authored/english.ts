import { authored } from './authoredHelper';
import type { ACTQuestion } from '../../data/questionSchema';

/**
 * Original, ACT-aligned English questions. Not official ACT content.
 * Commas, punctuation, sentence structure, usage, knowledge of language,
 * and production of writing (writer's goal, transitions, add/delete).
 */
export const ENGLISH_QUESTIONS: ACTQuestion[] = [
  // ── Commas: introductory element ──────────────────────────────────────
  authored({
    id: 'eng.a.comma.intro.1',
    section: 'english',
    microSkill: 'eng.comma.intro',
    difficulty: 2,
    expectedSeconds: 35,
    prompt:
      'Choose the best punctuation for the underlined portion:\n\n“After the long winter finally __ the gardeners began planting.”\n\nUnderlined: “finally” (choose what should follow it).',
    correct: 'finally ended, the gardeners',
    choices: [
      'finally ended the gardeners',
      'finally ended, the gardeners',
      'finally ended; the gardeners',
      'finally ended: the gardeners',
    ],
    explanation:
      '“After the long winter finally ended” is an introductory dependent clause. A comma should separate it from the independent clause that follows.',
    distractors: {
      'finally ended the gardeners':
        'Without a comma, the introductory clause runs into the main clause and is hard to read.',
      'finally ended; the gardeners':
        'A semicolon joins two independent clauses; the first part here is a dependent clause, so a semicolon is wrong.',
      'finally ended: the gardeners':
        'A colon introduces a list or explanation, not an ordinary main clause after an introductory phrase.',
    },
    conceptSummary:
      'Use a comma after an introductory word, phrase, or dependent clause before the main clause.',
    strategyTip: 'If the sentence opens with a setup phrase, a comma usually follows it.',
    tags: ['comma', 'introductory'],
  }),

  authored({
    id: 'eng.a.comma.nonessential.1',
    section: 'english',
    microSkill: 'eng.comma.nonessential',
    difficulty: 3,
    expectedSeconds: 40,
    prompt:
      'Choose the best version:\n\n“The novelist ___ spent years abroad set her latest book in Lisbon.”',
    correct: 'novelist, who had spent years abroad,',
    choices: [
      'novelist who had spent years abroad',
      'novelist, who had spent years abroad,',
      'novelist, who had spent years abroad',
      'novelist who had spent years abroad,',
    ],
    explanation:
      'The clause “who had spent years abroad” adds extra, nonessential information about a specific novelist. Nonessential clauses are set off with a pair of commas — one before and one after.',
    distractors: {
      'novelist who had spent years abroad':
        'This removes the commas, treating the clause as essential; but it is added detail and needs to be set off.',
      'novelist, who had spent years abroad':
        'This opens the nonessential clause with a comma but never closes it. Nonessential elements need commas on both sides.',
      'novelist who had spent years abroad,':
        'The closing comma appears without the opening one, so the pair is incomplete.',
    },
    conceptSummary:
      'Nonessential (extra) information is enclosed by a matched pair of commas.',
    strategyTip:
      'If you could delete the clause and still know exactly who/what is meant, set it off with two commas.',
    tags: ['comma', 'nonessential'],
  }),

  authored({
    id: 'eng.a.comma.splice.1',
    section: 'english',
    microSkill: 'eng.comma.splice',
    difficulty: 3,
    expectedSeconds: 40,
    prompt:
      'Choose the best revision:\n\n“The experiment produced clear results, the team published its findings within a month.”',
    correct: 'clear results, and the team published',
    choices: [
      'clear results, the team published',
      'clear results, and the team published',
      'clear results the team published',
      'clear results, therefore the team published',
    ],
    explanation:
      'Two independent clauses joined by only a comma form a comma splice. Adding the coordinating conjunction “and” after the comma correctly joins them.',
    distractors: {
      'clear results, the team published':
        'This is the original comma splice — a comma alone cannot join two independent clauses.',
      'clear results the team published':
        'Removing the comma creates a fused (run-on) sentence.',
      'clear results, therefore the team published':
        '“Therefore” is a conjunctive adverb; joining two independent clauses with it requires a semicolon, not a comma.',
    },
    conceptSummary:
      'Fix a comma splice with a period, a semicolon, or a comma + coordinating conjunction (FANBOYS).',
    strategyTip: 'Two complete sentences joined by only a comma is always wrong.',
    tags: ['comma', 'splice', 'run-on'],
  }),

  authored({
    id: 'eng.a.comma.unnecessary.1',
    section: 'english',
    microSkill: 'eng.comma.unnecessary',
    difficulty: 3,
    expectedSeconds: 35,
    prompt:
      'Choose the best version:\n\n“The scientist who first proposed the theory ___ eventually awarded a prize.”',
    correct: 'theory was',
    choices: ['theory, was', 'theory was', 'theory; was', 'theory: was'],
    explanation:
      'Nothing should separate the subject (“The scientist who first proposed the theory”) from its verb (“was”). A comma there is an error.',
    distractors: {
      'theory, was':
        'This comma wrongly separates the subject from its verb.',
      'theory; was':
        'A semicolon must join two independent clauses; “was eventually awarded a prize” is not independent.',
      'theory: was':
        'A colon does not belong between a subject and its verb.',
    },
    conceptSummary:
      'Never place a single comma between a subject and its verb.',
    strategyTip: 'Read subject → verb directly; if a comma interrupts them, delete it.',
    tags: ['comma', 'subject-verb-split'],
  }),

  authored({
    id: 'eng.a.comma.series.1',
    section: 'english',
    microSkill: 'eng.comma.series',
    difficulty: 2,
    expectedSeconds: 30,
    prompt:
      'Choose the best version:\n\n“For the trip she packed a raincoat ___ and a first-aid kit.”',
    correct: 'a raincoat, sturdy boots,',
    choices: [
      'a raincoat sturdy boots',
      'a raincoat, sturdy boots,',
      'a raincoat, sturdy boots',
      'a raincoat; sturdy boots;',
    ],
    explanation:
      'Three items in a series are separated by commas: “a raincoat, sturdy boots, and a first-aid kit.”',
    distractors: {
      'a raincoat sturdy boots':
        'The items run together without the commas a list requires.',
      'a raincoat, sturdy boots':
        'This drops the comma before “and,” leaving the list punctuation incomplete for a clean ACT-style series.',
      'a raincoat; sturdy boots;':
        'Semicolons separate list items only when the items themselves contain commas, which these do not.',
    },
    conceptSummary: 'Separate three or more items in a series with commas.',
    tags: ['comma', 'series'],
  }),

  // ── Semicolon vs comma ────────────────────────────────────────────────
  authored({
    id: 'eng.a.semicolon.1',
    section: 'english',
    microSkill: 'eng.punct.semicolon',
    difficulty: 3,
    expectedSeconds: 40,
    prompt:
      'Choose the best version:\n\n“The bridge was closed for repairs ___ commuters had to find another route.”',
    correct: 'repairs; commuters',
    choices: [
      'repairs, commuters',
      'repairs; commuters',
      'repairs commuters',
      'repairs: commuters',
    ],
    explanation:
      'Both parts are complete independent clauses that are closely related. A semicolon correctly joins them without a conjunction.',
    distractors: {
      'repairs, commuters': 'A comma alone between two independent clauses is a comma splice.',
      'repairs commuters': 'Running the two clauses together makes a fused sentence.',
      'repairs: commuters':
        'A colon signals that what follows explains or lists; here the second clause is simply a related statement, so a semicolon fits better.',
    },
    conceptSummary:
      'A semicolon joins two closely related independent clauses without a conjunction.',
    strategyTip: 'If both sides could be their own sentences, a semicolon can link them.',
    tags: ['semicolon', 'punctuation'],
  }),

  authored({
    id: 'eng.a.colon.1',
    section: 'english',
    microSkill: 'eng.punct.colon',
    difficulty: 3,
    expectedSeconds: 40,
    prompt:
      'Choose the best version:\n\n“The recipe calls for three basic ingredients ___ flour, water, and salt.”',
    correct: 'ingredients: flour',
    choices: [
      'ingredients, flour',
      'ingredients: flour',
      'ingredients; flour',
      'ingredients flour',
    ],
    explanation:
      'A colon follows a complete clause to introduce a list or explanation. “The recipe calls for three basic ingredients” is complete, so a colon properly introduces the list.',
    distractors: {
      'ingredients, flour': 'A comma is too weak to formally introduce the list here.',
      'ingredients; flour':
        'A semicolon needs an independent clause on both sides; “flour, water, and salt” is not independent.',
      'ingredients flour': 'Some punctuation is needed to introduce the list.',
    },
    conceptSummary:
      'Use a colon after a complete clause to introduce a list, example, or explanation.',
    strategyTip: 'The words before a colon must form a complete sentence.',
    tags: ['colon', 'punctuation'],
  }),

  authored({
    id: 'eng.a.apostrophe.1',
    section: 'english',
    microSkill: 'eng.punct.apostrophe',
    difficulty: 2,
    expectedSeconds: 35,
    prompt:
      'Choose the best version:\n\n“Both ___ presentations impressed the judges.”',
    correct: "students'",
    choices: ["students", "student's", "students'", "students's"],
    explanation:
      '“Both” signals more than one student, and the presentations belong to them, so we need the plural possessive: students’.',
    distractors: {
      students: 'This is a plain plural with no possessive, but the presentations belong to the students.',
      "student's": 'This is the singular possessive (one student), but “both” means more than one.',
      "students's": 'Regular plurals ending in -s take just an apostrophe, not an extra -s.',
    },
    conceptSummary:
      'Plural nouns ending in -s form the possessive by adding only an apostrophe.',
    tags: ['apostrophe', 'possessive'],
  }),

  // ── Sentence structure ────────────────────────────────────────────────
  authored({
    id: 'eng.a.modifier.1',
    section: 'english',
    microSkill: 'eng.struct.modifier',
    difficulty: 4,
    expectedSeconds: 45,
    prompt:
      'Choose the best version:\n\n“Walking to school, ___”',
    correct: 'Maria noticed the first frost on the grass.',
    choices: [
      'the first frost on the grass was noticed by Maria.',
      'Maria noticed the first frost on the grass.',
      'the grass had the first frost, which Maria noticed.',
      'there was frost on the grass Maria noticed.',
    ],
    explanation:
      'The opening modifier “Walking to school” must describe the subject that immediately follows. Only Maria can be walking, so “Maria” must come right after the comma.',
    distractors: {
      'the first frost on the grass was noticed by Maria.':
        'This makes “the first frost” the thing walking to school — a dangling modifier.',
      'the grass had the first frost, which Maria noticed.':
        'Here “the grass” is walking to school, which is illogical.',
      'there was frost on the grass Maria noticed.':
        '“There” cannot be the one walking, so the modifier still dangles, and the sentence is awkward.',
    },
    conceptSummary:
      'An introductory modifier must be immediately followed by the noun it describes.',
    strategyTip: 'Ask “who or what is doing the opening action?” That noun comes right after the comma.',
    tags: ['modifier', 'dangling'],
  }),

  authored({
    id: 'eng.a.parallel.1',
    section: 'english',
    microSkill: 'eng.struct.parallel',
    difficulty: 3,
    expectedSeconds: 40,
    prompt:
      'Choose the best version:\n\n“The internship taught her to analyze data, to write clearly, and ___.”',
    correct: 'to present confidently',
    choices: [
      'presenting confidently',
      'to present confidently',
      'she could present confidently',
      'confident presentations',
    ],
    explanation:
      'The list uses “to analyze… to write… ” so the third item must match: “to present confidently.” Parallel items share the same grammatical form.',
    distractors: {
      'presenting confidently': 'This breaks the “to + verb” pattern of the list.',
      'she could present confidently': 'A full clause does not match the infinitive phrases.',
      'confident presentations': 'A noun phrase is not parallel with the infinitive phrases.',
    },
    conceptSummary: 'Items in a series must share the same grammatical form (parallel structure).',
    tags: ['parallelism'],
  }),

  // ── Usage ─────────────────────────────────────────────────────────────
  authored({
    id: 'eng.a.pronoun.1',
    section: 'english',
    microSkill: 'eng.usage.pronoun',
    difficulty: 3,
    expectedSeconds: 40,
    prompt:
      'Choose the best version:\n\n“Each of the runners crossed the line, and ___ received a medal.”',
    correct: 'each of them',
    choices: ['each of them', 'they all', 'each of them all', 'them'],
    explanation:
      'The subject “Each” is singular. To keep agreement and clarity, “each of them” maintains the singular reference established at the start of the sentence.',
    distractors: {
      'they all': 'Switching to the plural “they” conflicts with the singular “Each” already used.',
      'each of them all': 'This is redundant — “each” and “all” together are ungrammatical.',
      them: 'A bare object pronoun cannot serve as the subject of “received.”',
    },
    conceptSummary:
      'Keep pronouns consistent with their antecedents in number; “each” is singular.',
    tags: ['pronoun', 'agreement'],
  }),

  authored({
    id: 'eng.a.confused.1',
    section: 'english',
    microSkill: 'eng.usage.confused',
    difficulty: 2,
    expectedSeconds: 30,
    prompt:
      'Choose the best version:\n\n“The committee reviewed the proposal and decided ___ effects were worth the cost.”',
    correct: 'its',
    choices: ["it's", 'its', 'its’', 'their'],
    explanation:
      '“Its” is the possessive form meaning “belonging to it,” which the sentence needs. The committee is a singular unit here.',
    distractors: {
      "it's": '“It’s” means “it is” or “it has,” which does not fit.',
      'its’': 'There is no such form as “its’.”',
      their: 'The antecedent “committee” is treated as singular, so “their” disagrees in number.',
    },
    conceptSummary: '“Its” = possessive; “it’s” = it is / it has.',
    tags: ['confused-words', 'its'],
  }),

  // ── Knowledge of Language: concision ──────────────────────────────────
  authored({
    id: 'eng.a.concision.1',
    section: 'english',
    microSkill: 'eng.kol.concision',
    difficulty: 3,
    expectedSeconds: 35,
    prompt:
      'Choose the most concise version that keeps the meaning:\n\n“The results were ___ surprising to everyone who saw them.”',
    correct: 'surprising',
    choices: [
      'completely and totally surprising and unexpected',
      'surprising',
      'surprising in a way that was a surprise',
      'quite surprising and also unexpected',
    ],
    explanation:
      'On the ACT, the most concise option that preserves meaning and is grammatically correct is best. “Surprising” says everything the others do without redundancy.',
    distractors: {
      'completely and totally surprising and unexpected':
        '“Completely,” “totally,” “surprising,” and “unexpected” pile up redundant ideas.',
      'surprising in a way that was a surprise': 'This repeats “surprise” needlessly.',
      'quite surprising and also unexpected':
        '“Surprising” and “unexpected” are redundant together.',
    },
    conceptSummary:
      'Prefer the shortest option that keeps the meaning and stays grammatical; avoid redundancy.',
    strategyTip: 'When options say the same thing, pick the shortest correct one.',
    tags: ['concision', 'redundancy'],
  }),

  authored({
    id: 'eng.a.tone.1',
    section: 'english',
    microSkill: 'eng.kol.tone',
    difficulty: 3,
    expectedSeconds: 40,
    prompt:
      'The passage is a formal history of the telescope. Choose the option that best matches its tone:\n\n“Galileo’s improved telescope ___ the way astronomers studied the sky.”',
    correct: 'transformed',
    choices: ['totally flipped', 'transformed', 'messed with', 'jazzed up'],
    explanation:
      '“Transformed” matches the formal, academic tone of a history passage. The other choices are too casual.',
    distractors: {
      'totally flipped': 'Slangy and informal — clashes with a formal history.',
      'messed with': 'Colloquial and imprecise for an academic passage.',
      'jazzed up': 'Informal and vague; inappropriate in tone.',
    },
    conceptSummary: 'Word choice should match the passage’s established tone and formality.',
    tags: ['tone', 'style'],
  }),

  // ── Production of Writing: Writer's Goal ───────────────────────────────
  authored({
    id: 'eng.a.writersgoal.1',
    section: 'english',
    microSkill: 'eng.prod.writersgoal',
    difficulty: 4,
    expectedSeconds: 55,
    prompt:
      'Suppose the writer’s goal is to convince readers that community gardens improve neighborhood health. Which sentence, added to the paragraph, best accomplishes that goal?',
    correct:
      'A recent survey found that residents near new community gardens reported eating more vegetables and walking outdoors more often.',
    choices: [
      'Community gardens have existed in many cultures for hundreds of years.',
      'A recent survey found that residents near new community gardens reported eating more vegetables and walking outdoors more often.',
      'Some people prefer flower gardens to vegetable gardens.',
      'The first community garden in the town opened on a rainy Tuesday.',
    ],
    explanation:
      'The goal is to show gardens improve health. Only the survey sentence provides evidence tying gardens to healthier behaviors (more vegetables, more activity).',
    distractors: {
      'Community gardens have existed in many cultures for hundreds of years.':
        'Interesting background, but it says nothing about health benefits.',
      'Some people prefer flower gardens to vegetable gardens.':
        'Off topic — preference between garden types does not support a health claim.',
      'The first community garden in the town opened on a rainy Tuesday.':
        'A trivial detail that does not advance the health argument.',
    },
    conceptSummary:
      'To meet a stated goal, choose the option that directly provides relevant evidence for that specific purpose.',
    strategyTip:
      'Restate the goal in your own words, then keep only the choice that clearly serves it.',
    hints: [
      { level: 1, kind: 'concept', text: 'The goal is about HEALTH benefits specifically.' },
      {
        level: 2,
        kind: 'starting_step',
        text: 'Cross out any choice that is merely interesting but not about health.',
      },
    ],
    tags: ['writers-goal', 'evidence'],
  }),

  authored({
    id: 'eng.a.purpose.1',
    section: 'english',
    microSkill: 'eng.prod.purpose',
    difficulty: 4,
    expectedSeconds: 55,
    prompt:
      'A paragraph describes how a bakery sources flour locally, mills it on site, and trains new bakers. The writer wants to add a concluding sentence that summarizes the paragraph’s main point. Which is best?',
    correct:
      'From grain to guidance, the bakery keeps nearly every step of its craft close to home.',
    choices: [
      'The bakery also sells coffee in the mornings.',
      'From grain to guidance, the bakery keeps nearly every step of its craft close to home.',
      'Milling flour is a very old process.',
      'New bakers must wake up early for their shifts.',
    ],
    explanation:
      'A good summary sentence captures the paragraph’s unifying idea. The bakery controlling each step locally — sourcing, milling, training — is that idea.',
    distractors: {
      'The bakery also sells coffee in the mornings.':
        'Introduces a new, unrelated detail rather than summarizing.',
      'Milling flour is a very old process.':
        'A general fact that ignores the paragraph’s actual focus.',
      'New bakers must wake up early for their shifts.':
        'Narrow detail that does not summarize the whole paragraph.',
    },
    conceptSummary:
      'A summary/conclusion sentence should capture the paragraph’s overall point, not add new or narrow details.',
    tags: ['main-purpose', 'summary', 'conclusion'],
  }),

  authored({
    id: 'eng.a.adddelete.1',
    section: 'english',
    microSkill: 'eng.prod.adddelete',
    difficulty: 4,
    expectedSeconds: 55,
    prompt:
      'The writer is considering deleting the sentence “My cousin also owns a red bicycle.” from a paragraph about a city’s new bike-share program. Should the sentence be kept or deleted?',
    correct: 'Deleted, because it introduces an irrelevant personal detail.',
    choices: [
      'Kept, because it adds a vivid personal example.',
      'Deleted, because it introduces an irrelevant personal detail.',
      'Kept, because bicycles are the paragraph’s topic.',
      'Deleted, because the paragraph already has enough sentences.',
    ],
    explanation:
      'The paragraph is about a public bike-share program. A cousin’s personal bicycle is irrelevant to that topic and should be deleted.',
    distractors: {
      'Kept, because it adds a vivid personal example.':
        'It is personal but not relevant to a bike-share program, so it distracts rather than helps.',
      'Kept, because bicycles are the paragraph’s topic.':
        'The topic is the bike-share PROGRAM, not bicycles in general; relevance, not keyword overlap, is the test.',
      'Deleted, because the paragraph already has enough sentences.':
        'Sentence count is not the reason; relevance is. This gives a wrong justification.',
    },
    conceptSummary:
      'Delete details that are irrelevant to the paragraph’s specific focus, even if they share a keyword.',
    strategyTip: 'Match the sentence to the paragraph’s exact topic, not just a shared word.',
    tags: ['add-delete', 'relevance'],
  }),

  // ── Transitions ───────────────────────────────────────────────────────
  authored({
    id: 'eng.a.transition.1',
    section: 'english',
    microSkill: 'eng.prod.transition',
    difficulty: 3,
    expectedSeconds: 40,
    prompt:
      'Choose the best transition:\n\n“The city expected the festival to lose money. ___, it earned a record profit.”',
    correct: 'Instead',
    choices: ['Therefore', 'Instead', 'For example', 'In addition'],
    explanation:
      'The second sentence contradicts the expectation in the first. “Instead” signals that the actual outcome differed from what was expected.',
    distractors: {
      Therefore: 'Signals a result that follows logically, but here the outcome is a surprise, not a consequence.',
      'For example': 'Introduces an illustration, but the second sentence is a contrast, not an example.',
      'In addition': 'Adds a similar idea, yet the sentences contrast rather than accumulate.',
    },
    conceptSummary:
      'Choose transitions by the logical relationship: contrast, cause/effect, addition, or example.',
    strategyTip: 'Name the relationship between the two sentences before picking a transition word.',
    tags: ['transition', 'contrast'],
  }),

  authored({
    id: 'eng.a.transition.2',
    section: 'english',
    microSkill: 'eng.prod.transition',
    difficulty: 3,
    expectedSeconds: 40,
    prompt:
      'Choose the best transition:\n\n“The new alloy resists rust. ___, it is far lighter than steel, making it ideal for aircraft.”',
    correct: 'Moreover',
    choices: ['However', 'Moreover', 'Nevertheless', 'By contrast'],
    explanation:
      'The second sentence adds a further advantage to the first. “Moreover” signals an additional supporting point.',
    distractors: {
      However: 'Signals contrast, but the second point reinforces rather than opposes the first.',
      Nevertheless: 'Implies the second idea holds despite the first — but there is no tension here.',
      'By contrast': 'Sets up an opposition that does not exist between these two benefits.',
    },
    conceptSummary: 'Additive transitions (moreover, furthermore) stack supporting points.',
    tags: ['transition', 'addition'],
  }),

  // ── Round 2: coverage for previously content-less skills ──────────────
  authored({
    id: 'eng.a.comma.coordinate.1',
    section: 'english',
    microSkill: 'eng.comma.coordinate',
    difficulty: 3,
    expectedSeconds: 40,
    prompt:
      'Choose the best version:\n\n“The hikers followed a ___ trail to the summit.”',
    correct: 'steep, rocky',
    choices: ['steep, rocky', 'steep rocky', 'steep, rocky,', 'steep and, rocky'],
    explanation:
      '“Steep” and “rocky” are coordinate adjectives — you could say “steep and rocky” or “rocky, steep” — so a comma separates them. No comma follows the last adjective before the noun.',
    distractors: {
      'steep rocky': 'Coordinate adjectives (test: could you insert “and”?) need a comma between them.',
      'steep, rocky,': 'Never put a comma between the final adjective and its noun.',
      'steep and, rocky': 'A comma never follows “and” between two adjectives.',
    },
    conceptSummary:
      'Separate coordinate adjectives with a comma; skip the comma if “and” wouldn’t sound natural between them.',
    strategyTip: 'Try the “and” test or reverse the adjectives — if it still works, use a comma.',
    tags: ['comma', 'coordinate-adjectives'],
  }),

  authored({
    id: 'eng.a.comma.compound.1',
    section: 'english',
    microSkill: 'eng.comma.compound',
    difficulty: 2,
    expectedSeconds: 35,
    prompt:
      'Choose the best version:\n\n“The storm knocked out the power ___ the family lit candles.”',
    correct: 'power, so the family',
    choices: ['power, so the family', 'power so the family', 'power, the family', 'power; so the family'],
    explanation:
      'Two independent clauses joined by the coordinating conjunction “so” need a comma before the conjunction.',
    distractors: {
      'power so the family': 'A comma is required before a FANBOYS conjunction joining two independent clauses.',
      'power, the family': 'Dropping the conjunction leaves a comma splice.',
      'power; so the family': 'Use either a semicolon alone or a comma + conjunction — not a semicolon + conjunction here.',
    },
    conceptSummary:
      'Independent clause + comma + FANBOYS (for, and, nor, but, or, yet, so) + independent clause.',
    tags: ['comma', 'fanboys', 'compound'],
  }),

  authored({
    id: 'eng.a.dash.1',
    section: 'english',
    microSkill: 'eng.punct.dash',
    difficulty: 3,
    expectedSeconds: 40,
    prompt:
      'Choose the best version:\n\n“The recipe requires one unusual ingredient ___ saffron ___ that can be hard to find.”',
    correct: '— saffron —',
    choices: ['— saffron —', '— saffron,', ', saffron —', '; saffron;'],
    explanation:
      'An interrupting element can be set off by a PAIR of dashes. The punctuation must match on both sides — a dash to open requires a dash to close.',
    distractors: {
      '— saffron,': 'Mixing a dash with a comma breaks the pair; the marks must match.',
      ', saffron —': 'Same problem in reverse — open and close with the same mark.',
      '; saffron;': 'Semicolons join independent clauses; they cannot frame an appositive.',
    },
    conceptSummary:
      'Set off interrupters with a matched pair: two commas, two dashes, or two parentheses — never a mix.',
    strategyTip: 'Find the opening mark; the closing mark must be its twin.',
    tags: ['dash', 'punctuation', 'pairs'],
  }),

  authored({
    id: 'eng.a.quotation.1',
    section: 'english',
    microSkill: 'eng.punct.quotation',
    difficulty: 3,
    expectedSeconds: 40,
    prompt:
      'Choose the best version:\n\n“The coach said ___ every practice counts.”',
    correct: ', “Remember,',
    choices: [', “Remember,', ' “Remember,', ', “Remember', ': “Remember —'],
    explanation:
      'A comma introduces the quotation after “said,” and the interrupter “Remember,” keeps its own comma inside the quotation: The coach said, “Remember, every practice counts.”',
    distractors: {
      ' “Remember,': 'A comma is needed after the speech verb “said” to introduce a direct quotation.',
      ', “Remember': 'The word “Remember” addresses the listeners and needs its own comma inside the quote.',
      ': “Remember —': 'A colon can introduce a quote after a full clause, but “The coach said” is not a complete setup, and the dash is unneeded.',
    },
    conceptSummary:
      'Use a comma after a speech verb (said, asked) to introduce a direct quotation; punctuation inside the quote follows normal rules.',
    tags: ['quotation', 'punctuation'],
  }),

  authored({
    id: 'eng.a.fragment.1',
    section: 'english',
    microSkill: 'eng.struct.fragment',
    difficulty: 3,
    expectedSeconds: 40,
    prompt:
      'Which option makes the underlined portion a complete sentence?\n\n“Because the museum stayed open late. Visitors lingered in the new wing.”',
    correct: 'Because the museum stayed open late, visitors lingered in the new wing.',
    choices: [
      'Because the museum stayed open late. Visitors lingered in the new wing.',
      'Because the museum stayed open late, visitors lingered in the new wing.',
      'Because the museum stayed open late; visitors lingered in the new wing.',
      'The museum stayed open late. Because visitors lingered in the new wing.',
    ],
    explanation:
      '“Because the museum stayed open late” is a dependent clause and cannot stand alone. Joining it to the main clause with a comma fixes the fragment.',
    distractors: {
      'Because the museum stayed open late. Visitors lingered in the new wing.':
        'The first “sentence” is a fragment — a dependent clause with no main clause.',
      'Because the museum stayed open late; visitors lingered in the new wing.':
        'A semicolon requires an independent clause on BOTH sides; the first part is dependent.',
      'The museum stayed open late. Because visitors lingered in the new wing.':
        'This just moves the fragment to the second sentence.',
    },
    conceptSummary:
      'A clause starting with a subordinator (because, although, when…) must attach to an independent clause.',
    strategyTip: 'If a “sentence” starts with because/although/while, make sure a main clause follows.',
    tags: ['fragment', 'sentence-structure'],
  }),

  authored({
    id: 'eng.a.runon.1',
    section: 'english',
    microSkill: 'eng.struct.runon',
    difficulty: 3,
    expectedSeconds: 40,
    prompt:
      'Choose the best version:\n\n“The tide came in quickly the children grabbed their sandcastle buckets.”',
    correct: 'came in quickly, and the children',
    choices: [
      'came in quickly the children',
      'came in quickly, and the children',
      'came in quickly, the children',
      'came in quickly and, the children',
    ],
    explanation:
      'Two independent clauses are fused together. A comma plus “and” joins them correctly.',
    distractors: {
      'came in quickly the children': 'This is the original fused sentence — two clauses with no join at all.',
      'came in quickly, the children': 'A comma alone creates a comma splice.',
      'came in quickly and, the children': 'The comma belongs BEFORE the conjunction, not after it.',
    },
    conceptSummary:
      'Fix fused sentences with a period, a semicolon, or comma + coordinating conjunction.',
    tags: ['run-on', 'fused'],
  }),

  authored({
    id: 'eng.a.verbtense.1',
    section: 'english',
    microSkill: 'eng.usage.verbtense',
    difficulty: 3,
    expectedSeconds: 40,
    prompt:
      'Choose the best version:\n\n“By the time the judges announced the winner, the bakers ___ for nine hours.”',
    correct: 'had been working',
    choices: ['had been working', 'are working', 'will work', 'work'],
    explanation:
      'The sentence describes an action that continued up to a point in the past (“by the time the judges announced”), which calls for the past perfect progressive: “had been working.”',
    distractors: {
      'are working': 'Present tense clashes with the past-tense time frame set by “announced.”',
      'will work': 'Future tense contradicts an event that already happened.',
      work: 'Simple present cannot describe a duration completed before a past moment.',
    },
    conceptSummary:
      'Match verb tense to the sentence’s time markers; “by the time + past” pairs with the past perfect.',
    strategyTip: 'Find the time anchor (announced) and choose the tense that fits before/after it.',
    tags: ['verb-tense', 'usage'],
  }),

  authored({
    id: 'eng.a.precision.1',
    section: 'english',
    microSkill: 'eng.kol.precision',
    difficulty: 3,
    expectedSeconds: 35,
    prompt:
      'Choose the most precise word:\n\n“The engineer ___ the bridge’s cables weekly for signs of wear.”',
    correct: 'inspects',
    choices: ['inspects', 'looks at', 'considers', 'handles'],
    explanation:
      '“Inspects” precisely names a careful, systematic examination — exactly what an engineer does to cables. The other options are vaguer or wrong in meaning.',
    distractors: {
      'looks at': 'Too casual and vague for a technical safety check.',
      considers: '“Considers” means thinks about, not physically examines.',
      handles: '“Handles” means touches or manages, not examines for wear.',
    },
    conceptSummary: 'Prefer the word whose meaning most exactly fits the context.',
    tags: ['precision', 'word-choice'],
  }),

  authored({
    id: 'eng.a.relevance.1',
    section: 'english',
    microSkill: 'eng.prod.relevance',
    difficulty: 3,
    expectedSeconds: 45,
    prompt:
      'A paragraph explains how a town restored its historic clock tower. Which sentence, if added, is most relevant to the paragraph?',
    correct: 'Craftspeople rebuilt the clock’s original brass mechanism by hand.',
    choices: [
      'The town also has a popular farmers market on Saturdays.',
      'Craftspeople rebuilt the clock’s original brass mechanism by hand.',
      'Many cities have clock towers of various heights.',
      'The mayor enjoys jogging past the tower in the mornings.',
    ],
    explanation:
      'Only the brass-mechanism sentence adds a detail about the restoration itself — the paragraph’s actual topic.',
    distractors: {
      'The town also has a popular farmers market on Saturdays.': 'The market has nothing to do with the restoration.',
      'Many cities have clock towers of various heights.': 'A generic fact that adds nothing about THIS restoration.',
      'The mayor enjoys jogging past the tower in the mornings.': 'A personal detail unrelated to the restoration work.',
    },
    conceptSummary:
      'A relevant addition develops the paragraph’s specific topic, not just its general subject.',
    tags: ['relevance', 'topic-development'],
  }),

  authored({
    id: 'eng.a.introconc.1',
    section: 'english',
    microSkill: 'eng.prod.introconc',
    difficulty: 4,
    expectedSeconds: 50,
    prompt:
      'An essay describes how community libraries reinvented themselves as technology hubs. Which sentence is the most effective introduction?',
    correct:
      'Walk into a library today and you may hear 3D printers humming where card catalogs once stood.',
    choices: [
      'Libraries are buildings that contain books and other materials.',
      'Walk into a library today and you may hear 3D printers humming where card catalogs once stood.',
      'This essay will discuss libraries and technology.',
      'Technology is important in the modern world.',
    ],
    explanation:
      'The best introduction previews the essay’s specific angle — libraries transformed by technology — with a vivid, concrete image.',
    distractors: {
      'Libraries are buildings that contain books and other materials.': 'A flat definition that previews nothing about the essay’s angle.',
      'This essay will discuss libraries and technology.': 'Announcing the topic (“this essay will…”) is weak ACT style.',
      'Technology is important in the modern world.': 'Too broad — it could open almost any essay.',
    },
    conceptSummary:
      'Strong introductions are specific to the essay’s actual focus and engage without empty announcements.',
    tags: ['introduction', 'organization'],
  }),

  authored({
    id: 'eng.a.order.1',
    section: 'english',
    microSkill: 'eng.prod.order',
    difficulty: 4,
    expectedSeconds: 50,
    prompt:
      'A paragraph presents these sentences:\n[1] Finally, the mixture is baked until golden.\n[2] First, the cook combines the dry ingredients.\n[3] Next, the wet ingredients are folded in.\nWhich order is most logical?',
    correct: '2, 3, 1',
    choices: ['1, 2, 3', '2, 3, 1', '3, 2, 1', '2, 1, 3'],
    explanation:
      'The sentences describe a sequence. The signal words “First,” “Next,” and “Finally” dictate the order 2 → 3 → 1.',
    distractors: {
      '1, 2, 3': '“Finally” cannot come first in a sequence.',
      '3, 2, 1': '“Next” should not precede “First.”',
      '2, 1, 3': '“Finally” (baking) must be last, not in the middle.',
    },
    conceptSummary: 'Order sentences using sequence signal words and logical steps.',
    strategyTip: 'Let transition words like first/next/finally set the sequence.',
    tags: ['organization', 'sequence'],
  }),
];
