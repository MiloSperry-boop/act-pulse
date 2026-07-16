import type { ACTQuestion, Passage } from '../../data/questionSchema';
import { authored } from '../authored/authoredHelper';

/**
 * Original reading passages and questions. Not official ACT content.
 * Each paragraph carries a functionLabel for passage-mapping drills.
 */

export const READING_PASSAGES: Passage[] = [
  {
    id: 'read.p.lighthouse',
    section: 'reading',
    kind: 'literary_narrative',
    title: 'The Keeper’s Daughter',
    wordCount: 250,
    attribution: 'Original practice content — ACT Pulse',
    paragraphs: [
      {
        id: 'p1',
        functionLabel: 'Introduces the setting and narrator',
        text: 'For as long as I could remember, our whole world was the narrow spiral of the lighthouse stairs and the gray water beyond. My father kept the light; I kept my father company. Visitors were rare, and the mainland was a rumor we could see only on the clearest afternoons.',
      },
      {
        id: 'p2',
        functionLabel: 'Presents the central tension',
        text: 'That autumn the shipping company announced it would replace the keepers with an automatic beacon. My father read the letter twice, folded it into careful quarters, and said nothing. I understood then that a machine could hold the flame, but it could not hold the watch the way he did — leaning into the storm as if daring it to test the glass.',
      },
      {
        id: 'p3',
        functionLabel: 'Shows a shift in the narrator’s view',
        text: 'I had spent years wishing for the mainland, for streets and strangers and noise. Now, watching him, I felt the wish curdle into something closer to grief. It was not the tower I would miss, I realized, but the shape his life had given to my own.',
      },
      {
        id: 'p4',
        functionLabel: 'Resolves with a quiet decision',
        text: 'On our last night, he let me trim the wick alone. The flame steadied under my hand. "You’ll do," he said, which from him was a whole speech. When the automatic beacon finally blinked on months later, I was far away — but I still woke at every storm, listening for a light that no longer needed me.',
      },
    ],
  },
  {
    id: 'read.p.bees',
    section: 'reading',
    kind: 'natural_science',
    title: 'What the Bees Remember',
    wordCount: 245,
    attribution: 'Original practice content — ACT Pulse',
    paragraphs: [
      {
        id: 'p1',
        functionLabel: 'States the surprising claim',
        text: 'A honeybee’s brain is smaller than a grass seed, yet it can remember the location of a flower for days and communicate that location to hundreds of nestmates. For decades, biologists assumed such feats required a large brain. The bee suggests otherwise.',
      },
      {
        id: 'p2',
        functionLabel: 'Explains the mechanism (evidence)',
        text: 'A returning forager performs a "waggle dance," tracing a figure-eight whose angle encodes the direction of the food relative to the sun and whose duration encodes the distance. Nestmates crowd close, reading the vibrations, and then fly out along the described path with remarkable accuracy.',
      },
      {
        id: 'p3',
        functionLabel: 'Introduces a complication',
        text: 'Yet the dance is not infallible. On cloudy days, when the sun is hidden, bees rely on patterns of polarized light invisible to us. If those patterns are disrupted, foragers grow disoriented, and the colony’s carefully shared map begins to blur.',
      },
      {
        id: 'p4',
        functionLabel: 'Draws a broader conclusion',
        text: 'The lesson researchers draw is not that small brains are secretly large, but that intelligence can be distributed. No single bee holds the colony’s knowledge; it lives in the exchange between them. Understanding that has begun to reshape how engineers design swarms of simple, cooperating robots.',
      },
    ],
  },
  {
    id: 'read.p.cities',
    section: 'reading',
    kind: 'social_science',
    title: 'The Fifteen-Minute City',
    wordCount: 240,
    attribution: 'Original practice content — ACT Pulse',
    paragraphs: [
      {
        id: 'p1',
        functionLabel: 'Defines the concept',
        text: 'Urban planners have lately embraced the "fifteen-minute city," a neighborhood where residents can reach work, school, groceries, and green space within a short walk or bike ride. The idea is old — it describes most cities before the automobile — but its revival responds to distinctly modern worries about congestion and emissions.',
      },
      {
        id: 'p2',
        functionLabel: 'Presents supporting evidence',
        text: 'Where such planning has been tried, the results are measurable. Pilot districts report shorter commutes, livelier street-level businesses, and modest drops in car traffic. Residents surveyed describe a stronger sense of belonging, crediting chance encounters at shared local spaces.',
      },
      {
        id: 'p3',
        functionLabel: 'Raises an objection',
        text: 'Critics caution that the model can backfire. If desirable amenities cluster in a few redesigned districts, housing costs there may climb, pushing lower-income residents toward car-dependent outskirts — the very pattern the plan hoped to undo. Convenience, they warn, is not automatically shared.',
      },
      {
        id: 'p4',
        functionLabel: 'Offers a qualified conclusion',
        text: 'The disagreement is less about the goal than the guardrails. Proponents increasingly argue that a fifteen-minute city works only when paired with policies that keep it affordable. The walk, in other words, must be short for everyone, not just for those who can afford the address.',
      },
    ],
  },
];

export const READING_QUESTIONS: ACTQuestion[] = [
  // Lighthouse
  authored({
    id: 'read.q.lighthouse.main',
    section: 'reading',
    microSkill: 'read.key.mainidea',
    difficulty: 3,
    expectedSeconds: 55,
    format: 'passage_reading',
    passageId: 'read.p.lighthouse',
    prompt: 'The main idea of the passage is that the narrator:',
    correct:
      'comes to value the life the lighthouse shaped, even while longing to leave it.',
    choices: [
      'has always hated living in the lighthouse and is glad to go.',
      'comes to value the life the lighthouse shaped, even while longing to leave it.',
      'believes the automatic beacon will fail without a keeper.',
      'wants to take over her father’s job permanently.',
    ],
    explanation:
      'The narrator wished for the mainland but realizes she will miss "the shape his life had given to my own." The passage traces a shift from longing-to-leave toward valuing what the life gave her.',
    distractors: {
      'has always hated living in the lighthouse and is glad to go.':
        'She wished for the mainland, but the ending shows grief, not gladness — this is too one-sided.',
      'believes the automatic beacon will fail without a keeper.':
        'She notes a machine can hold the flame but not "the watch"; she never predicts failure.',
      'wants to take over her father’s job permanently.':
        'She ends up "far away," so she does not take over the post.',
    },
    conceptSummary: 'The main idea is the passage’s overall point, supported across all paragraphs.',
    strategyTip: 'Track how the narrator’s feeling changes from first paragraph to last.',
    tags: ['reading', 'main-idea', 'literary'],
  }),
  authored({
    id: 'read.q.lighthouse.tone',
    section: 'reading',
    microSkill: 'read.craft.tone',
    difficulty: 3,
    expectedSeconds: 50,
    format: 'passage_reading',
    passageId: 'read.p.lighthouse',
    prompt: 'The narrator’s tone in the final paragraph is best described as:',
    correct: 'wistful',
    choices: ['bitter', 'wistful', 'triumphant', 'indifferent'],
    explanation:
      'Waking "at every storm, listening for a light that no longer needed me" conveys gentle longing for something lost — a wistful tone.',
    distractors: {
      bitter: 'There is longing but no resentment or anger.',
      triumphant: 'Nothing is being celebrated; the mood is quiet and reflective.',
      indifferent: 'Waking at every storm shows she cares deeply, not that she is unaffected.',
    },
    conceptSummary: 'Tone is the author’s attitude, inferred from word choice and imagery.',
    tags: ['reading', 'tone', 'craft'],
  }),
  authored({
    id: 'read.q.lighthouse.detail',
    section: 'reading',
    microSkill: 'read.key.detail',
    difficulty: 2,
    expectedSeconds: 45,
    format: 'passage_reading',
    passageId: 'read.p.lighthouse',
    prompt: 'According to the passage, how does the father react to the company’s letter?',
    correct: 'He reads it twice, folds it, and says nothing.',
    choices: [
      'He immediately writes an angry reply.',
      'He reads it twice, folds it, and says nothing.',
      'He hides it from the narrator.',
      'He decides to move to the mainland at once.',
    ],
    explanation:
      'The text states he "read the letter twice, folded it into careful quarters, and said nothing."',
    distractors: {
      'He immediately writes an angry reply.': 'No reply is mentioned; he says nothing.',
      'He hides it from the narrator.': 'The narrator sees the letter and his reaction; it is not hidden.',
      'He decides to move to the mainland at once.': 'No such decision appears in the text.',
    },
    conceptSummary: 'Detail questions are answered by locating the specific supporting line.',
    strategyTip: 'Return to the exact sentence rather than relying on memory.',
    tags: ['reading', 'detail', 'evidence'],
  }),
  authored({
    id: 'read.q.lighthouse.structure',
    section: 'reading',
    microSkill: 'read.craft.structure',
    difficulty: 4,
    expectedSeconds: 55,
    format: 'passage_reading',
    passageId: 'read.p.lighthouse',
    prompt: 'The third paragraph mainly serves to:',
    correct: 'mark a turning point in how the narrator feels about leaving.',
    choices: [
      'introduce a new character who changes the plot.',
      'mark a turning point in how the narrator feels about leaving.',
      'describe the mechanics of the lighthouse.',
      'summarize the shipping company’s decision.',
    ],
    explanation:
      'Paragraph three is where the narrator’s long-held wish "curdle[s]" into grief — a pivot in her attitude.',
    distractors: {
      'introduce a new character who changes the plot.': 'No new character appears here.',
      'describe the mechanics of the lighthouse.': 'The paragraph is about feeling, not machinery.',
      'summarize the shipping company’s decision.': 'That was paragraph two; this one shifts the narrator’s view.',
    },
    conceptSummary: 'Paragraph-function questions ask what a paragraph does within the whole.',
    tags: ['reading', 'structure', 'paragraph-function'],
  }),

  // Bees
  authored({
    id: 'read.q.bees.purpose',
    section: 'reading',
    microSkill: 'read.craft.purpose',
    difficulty: 4,
    expectedSeconds: 55,
    format: 'passage_reading',
    passageId: 'read.p.bees',
    prompt: 'The author’s primary purpose is to:',
    correct:
      'use the honeybee to argue that intelligence can be distributed rather than housed in one large brain.',
    choices: [
      'prove that bees are smarter than humans.',
      'use the honeybee to argue that intelligence can be distributed rather than housed in one large brain.',
      'explain how to build robot swarms.',
      'warn that honeybee colonies are collapsing.',
    ],
    explanation:
      'The final paragraph states the lesson: "intelligence can be distributed… it lives in the exchange between them." The bee is the vehicle for that argument.',
    distractors: {
      'prove that bees are smarter than humans.': 'The passage never compares bee and human intelligence overall.',
      'explain how to build robot swarms.': 'Robots are a closing example, not the main purpose.',
      'warn that honeybee colonies are collapsing.': 'Collapse is not the passage’s subject.',
    },
    conceptSummary: 'Author purpose is the overall reason the passage was written.',
    strategyTip: 'The last paragraph often states the author’s central claim outright.',
    tags: ['reading', 'author-purpose'],
  }),
  authored({
    id: 'read.q.bees.detail',
    section: 'reading',
    microSkill: 'read.key.detail',
    difficulty: 3,
    expectedSeconds: 50,
    format: 'passage_reading',
    passageId: 'read.p.bees',
    prompt: 'According to the passage, the duration of a bee’s waggle dance encodes the:',
    correct: 'distance to the food.',
    choices: [
      'direction of the food.',
      'distance to the food.',
      'quality of the food.',
      'number of foragers needed.',
    ],
    explanation:
      'The passage says the angle encodes direction and "duration encodes the distance."',
    distractors: {
      'direction of the food.': 'Direction is encoded by the dance’s angle, not its duration.',
      'quality of the food.': 'Quality is not mentioned as encoded in the dance.',
      'number of foragers needed.': 'The dance does not encode a forager count.',
    },
    conceptSummary: 'Match the specific variable in the question to the exact line in the text.',
    tags: ['reading', 'detail', 'natural-science'],
  }),
  authored({
    id: 'read.q.bees.inference',
    section: 'reading',
    microSkill: 'read.key.inference',
    difficulty: 4,
    expectedSeconds: 55,
    format: 'passage_reading',
    passageId: 'read.p.bees',
    prompt: 'It can reasonably be inferred that on a heavily overcast day, a colony’s foraging would likely be:',
    correct: 'less accurate, because the bees’ light-based cues are disrupted.',
    choices: [
      'more accurate, because bees fly slower.',
      'less accurate, because the bees’ light-based cues are disrupted.',
      'completely unaffected by the weather.',
      'impossible, because bees never fly without sun.',
    ],
    explanation:
      'The passage explains bees use polarized-light patterns when the sun is hidden, and disrupting those patterns disorients foragers — so heavy overcast would reduce accuracy.',
    distractors: {
      'more accurate, because bees fly slower.': 'The passage links cloud cover to disorientation, not improvement.',
      'completely unaffected by the weather.': 'The text explicitly describes weather-related disruption.',
      'impossible, because bees never fly without sun.': 'Bees do forage without direct sun, using polarized light.',
    },
    conceptSummary: 'A valid inference follows from the text without going beyond it.',
    strategyTip: 'Support the inference with a specific sentence; reject choices the text contradicts.',
    tags: ['reading', 'inference'],
  }),

  // Cities
  authored({
    id: 'read.q.cities.main',
    section: 'reading',
    microSkill: 'read.key.mainidea',
    difficulty: 3,
    expectedSeconds: 55,
    format: 'passage_reading',
    passageId: 'read.p.cities',
    prompt: 'The passage is primarily concerned with:',
    correct:
      'the promise of the fifteen-minute city and the conditions needed to share its benefits.',
    choices: [
      'proving that cars should be banned from all cities.',
      'the promise of the fifteen-minute city and the conditions needed to share its benefits.',
      'the history of city planning before the automobile.',
      'why pilot districts always fail.',
    ],
    explanation:
      'The passage presents the concept and its evidence, raises an affordability objection, and concludes the model works only "when paired with policies that keep it affordable."',
    distractors: {
      'proving that cars should be banned from all cities.': 'The passage never calls for banning cars.',
      'the history of city planning before the automobile.': 'History is background, not the focus.',
      'why pilot districts always fail.': 'Pilot districts show positive results; the concern is equity, not failure.',
    },
    conceptSummary: 'The main idea balances all parts of the passage, including the objection.',
    tags: ['reading', 'main-idea', 'social-science'],
  }),
  authored({
    id: 'read.q.cities.evidence',
    section: 'reading',
    microSkill: 'read.int.evidence',
    difficulty: 4,
    expectedSeconds: 55,
    format: 'passage_reading',
    passageId: 'read.p.cities',
    prompt: 'Which choice best states the critics’ central concern?',
    correct:
      'Redesigned districts may raise local housing costs and displace lower-income residents.',
    choices: [
      'Walking is unhealthy for many residents.',
      'Redesigned districts may raise local housing costs and displace lower-income residents.',
      'Cities were better before the automobile.',
      'Green space is unnecessary in modern cities.',
    ],
    explanation:
      'Critics warn that clustering amenities can push housing costs up and drive lower-income residents to car-dependent outskirts — "convenience is not automatically shared."',
    distractors: {
      'Walking is unhealthy for many residents.': 'The critics never claim walking is unhealthy.',
      'Cities were better before the automobile.': 'That is background from paragraph one, not the critics’ concern.',
      'Green space is unnecessary in modern cities.': 'No one in the passage argues against green space.',
    },
    conceptSummary: 'Locate the claim a specific group makes, supported by their stated reasoning.',
    strategyTip: 'Find the objection paragraph and paraphrase its argument precisely.',
    tags: ['reading', 'evidence', 'claims'],
  }),
];
