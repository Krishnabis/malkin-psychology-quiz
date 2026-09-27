export interface AttemptResult {
  questionId: number;
  selectedIndex: number;
  isCorrect: boolean;
  timeTaken: number; // seconds
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
}

export interface AppState {
  attempts: QuizAttempt[];
}
