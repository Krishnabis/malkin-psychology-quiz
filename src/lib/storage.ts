import { QuizAttempt, QuizSession } from './types';

const ATTEMPTS_KEY = 'malkin_quiz_attempts';
const SESSION_KEY = 'malkin_quiz_session';

export function getAttempts(): QuizAttempt[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ATTEMPTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveAttempt(attempt: QuizAttempt): void {
  if (typeof window === 'undefined') return;
  const attempts = getAttempts();
  attempts.unshift(attempt); // newest first
  localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));
}

export function getSession(): QuizSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveSession(session: QuizSession): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(SESSION_KEY);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// Get incorrectly answered question IDs across all attempts
export function getIncorrectQuestionIds(): Set<number> {
  const attempts = getAttempts();
  const incorrect = new Set<number>();
  for (const attempt of attempts) {
    for (const result of attempt.results) {
      if (!result.isCorrect) {
        incorrect.add(result.questionId);
      }
    }
  }
  return incorrect;
}

// Get correctly answered question IDs across all attempts
export function getCorrectQuestionIds(): Set<number> {
  const attempts = getAttempts();
  const correct = new Set<number>();
  for (const attempt of attempts) {
    for (const result of attempt.results) {
      if (result.isCorrect) {
        correct.add(result.questionId);
      }
    }
  }
  return correct;
}
