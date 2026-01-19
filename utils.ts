
import { Question, QuestionType, QuizSession } from './types.ts';

export const generateQuestion = (id: string): Question => {
  const type: QuestionType = Math.random() > 0.5 ? 'multiplication' : 'division';
  let num1, num2, answer;

  if (type === 'multiplication') {
    num1 = Math.floor(Math.random() * 90) + 10;
    num2 = Math.floor(Math.random() * 8) + 2;
    answer = num1 * num2;
  } else {
    const quotient = Math.floor(Math.random() * 90) + 10;
    num2 = Math.floor(Math.random() * 8) + 2;
    num1 = quotient * num2;
    answer = quotient;
  }

  return { id, type, num1, num2, answer };
};

export const saveQuizSession = (session: QuizSession) => {
  try {
    const existing = localStorage.getItem('math_quiz_history');
    const history: QuizSession[] = existing ? JSON.parse(existing) : [];
    const newHistory = [...history, session].slice(-50);
    localStorage.setItem('math_quiz_history', JSON.stringify(newHistory));
  } catch (e) {
    console.error("Failed to save history", e);
  }
};

export const getHistory = (): QuizSession[] => {
  try {
    const existing = localStorage.getItem('math_quiz_history');
    return existing ? JSON.parse(existing) : [];
  } catch (e) {
    return [];
  }
};

export const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
