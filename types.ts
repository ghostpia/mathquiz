
export type QuestionType = 'multiplication' | 'division';

export interface Question {
  id: string;
  type: QuestionType;
  num1: number;
  num2: number;
  answer: number;
  userAnswer?: number;
  isCorrect?: boolean;
  timeTaken?: number; // 문제 풀이에 걸린 시간 (초)
}

export interface QuizSession {
  date: string;
  timestamp: number;
  questions: Question[];
  score: number;
  totalTime: number; // 총 소요 시간 (초)
}

export interface DailyStats {
  date: string;
  totalQuizzes: number;
  totalQuestions: number;
  correctAnswers: number;
}
