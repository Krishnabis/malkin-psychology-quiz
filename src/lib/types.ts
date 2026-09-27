export interface AttemptResult {
  questionId: number;
  selectedIndex: number;
  isCorrect: boolean;
  timeTaken: number; // seconds spent on this question
  hintTaken: boolean; // whether the hint was viewed
}

export interface QuizAttempt {
  id: string;
  date: string; // ISO string
  totalQuestions: number;
  score: number;
  results: AttemptResult[];
  duration: number; // seconds
  allowRepeats: boolean;
}

export interface QuizSession {
  questionIds: number[]; // the IDs of questions chosen for this session
  currentIndex: number;
  answers: { [questionId: number]: number }; // questionId -> selected option index
  startTime: number; // Date.now()
  hintShown: { [questionId: number]: boolean };
  questionTimeTaken: { [questionId: number]: number }; // actual seconds spent per question
}

export interface AppState {
  attempts: QuizAttempt[];
}
