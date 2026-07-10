import { jainQuizDatabase, fullJainDatabase } from './jainQuizDatabase';

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const quizMaster = {
  jainQuizDatabase,
  fullJainDatabase,

  /**
   * Dynamically loads the main quiz database only when requested (e.g. when opening the Quiz tab)
   * to keep the initial application bundle lightweight and highly performant.
   */
  async loadQuizCategory(category: string): Promise<any[]> {
    // Dynamically import the main database
    const dbModule = await import('./jainQuizDatabase');
    const questions = dbModule.jainQuizDatabase || [];

    if (!category || category === 'all') {
      return questions;
    }

    // Helper to resolve category for dynamic filtering
    const getCategoryType = (id: number): string => {
      if (id >= 76 && id <= 94) return 'acharyas';
      if (id >= 95) return 'history';
      if (id >= 41 && id <= 75) return 'rituals';
      if (id >= 31 && id <= 40) return 'organization';
      return 'philosophy';
    };

    return questions.filter((q: any) => getCategoryType(q.id) === category.toLowerCase());
  }
};
