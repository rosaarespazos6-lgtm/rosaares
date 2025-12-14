export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer';

export interface Question {
  id: number;
  category: string;
  type: QuestionType;
  text: string;
  options?: string[]; // Used for MC and TF
  correctIndex?: number; // Used for MC and TF (0-3 or 0-1)
  correctAnswer?: string; // Used for Short Answer
  explanation: string;
}

export interface QuizState {
  questions: Question[];
  currentQuestionIndex: number;
  userAnswers: Record<number, number | string>; // index (number) or text (string)
  isFinished: boolean;
  score: number;
}

export enum AppStatus {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  QUIZ_ACTIVE = 'QUIZ_ACTIVE',
  REVIEW = 'REVIEW',
  LIST_VIEW = 'LIST_VIEW'
}

export interface GenerationConfig {
  topic: string;
  count: number;
}