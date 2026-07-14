import { describe, expect, it } from 'vitest';
import { QuizQuestionSchema } from './quizSchema';

const validQuestion = {
  id: 'q1',
  question: 'Who founded the Terapanth sect?',
  options: ['A', 'B', 'C', 'D'],
  correctAnswerIndex: 2,
  category: 'history',
  difficulty: 'easy' as const,
};

describe('QuizQuestionSchema', () => {
  it('accepts a valid question', () => {
    expect(QuizQuestionSchema.safeParse(validQuestion).success).toBe(true);
  });

  it('accepts optional source and tags when present', () => {
    const result = QuizQuestionSchema.safeParse({
      ...validQuestion,
      source: 'Terapanth history archive',
      tags: ['history', 'founders'],
    });
    expect(result.success).toBe(true);
  });

  it('rejects an options array that is not exactly length 4', () => {
    expect(QuizQuestionSchema.safeParse({ ...validQuestion, options: ['A', 'B', 'C'] }).success).toBe(false);
    expect(QuizQuestionSchema.safeParse({ ...validQuestion, options: ['A', 'B', 'C', 'D', 'E'] }).success).toBe(false);
  });

  it('rejects correctAnswerIndex out of the 0-3 range', () => {
    expect(QuizQuestionSchema.safeParse({ ...validQuestion, correctAnswerIndex: -1 }).success).toBe(false);
    expect(QuizQuestionSchema.safeParse({ ...validQuestion, correctAnswerIndex: 4 }).success).toBe(false);
  });

  it('rejects a non-integer correctAnswerIndex', () => {
    expect(QuizQuestionSchema.safeParse({ ...validQuestion, correctAnswerIndex: 1.5 }).success).toBe(false);
  });

  it('rejects an invalid difficulty value', () => {
    expect(QuizQuestionSchema.safeParse({ ...validQuestion, difficulty: 'impossible' }).success).toBe(false);
  });

  it('rejects a missing required field', () => {
    const { question, ...withoutQuestion } = validQuestion;
    expect(QuizQuestionSchema.safeParse(withoutQuestion).success).toBe(false);
  });
});
