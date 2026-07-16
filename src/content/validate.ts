/** Content validation used by tests and the developer Question Bank Inspector. */

import { ACTQuestionSchema, type ACTQuestion } from '../data/questionSchema';
import { isValidSkillId } from '../config/skills';
import { getPassageById } from './questionBank';

export interface ValidationIssue {
  questionId: string;
  message: string;
}

export function validateQuestion(q: ACTQuestion): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const push = (message: string) => issues.push({ questionId: q.id, message });

  // Schema-level (Zod) — catches duplicate ids, missing correct answer, missing
  // distractor explanations, calculator policy conflicts, passage requirements.
  const parsed = ACTQuestionSchema.safeParse(q);
  if (!parsed.success) {
    for (const iss of parsed.error.issues) {
      push(`${iss.path.join('.')}: ${iss.message}`);
    }
  }

  // Skill tag must be known.
  if (!isValidSkillId(q.microSkill)) {
    push(`Unknown microSkill "${q.microSkill}"`);
  }
  for (const s of q.secondarySkills) {
    if (!isValidSkillId(s)) push(`Unknown secondary skill "${s}"`);
  }

  // Expected time sanity.
  if (q.expectedSeconds < 10 || q.expectedSeconds > 300) {
    push(`Suspicious expectedSeconds: ${q.expectedSeconds}`);
  }

  // Passage reference must resolve.
  if (q.passageId && !getPassageById(q.passageId)) {
    push(`passageId "${q.passageId}" does not resolve to a passage`);
  }

  // Explanation length heuristics.
  if (q.explanation.trim().length < 10) push('Explanation too short');

  return issues;
}

export function validateAll(questions: ACTQuestion[]): ValidationIssue[] {
  return questions.flatMap(validateQuestion);
}
