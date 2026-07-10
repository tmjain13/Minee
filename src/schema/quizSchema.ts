import { z } from 'zod';

export const QuizQuestionSchema = z.object({
  id: z.string(),
  question: z.string(),
  options: z.array(z.string()).length(4),
  correctAnswerIndex: z.number().int().min(0).max(3),
  category: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  source: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;
