export interface Answer {
  id: number;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  _id?: string;
  assessmentId: string;
  number: number;
  text: string;
  answers: Answer[];
  timeLimit: number;
  correctAnswerIndices: number[];
  bookmarkedBy: string[];
}

export interface Assessment {
  _id?: string;
  title: string;
  slug: string;
  description: string;
  type: "pre-assessment" | "post-assessment" | "combined";
  week: number | null;
  weeks: number[];
  questionCount: number;
  fileName: string;
  fileUrl: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface QuizAnswer {
  questionId: string;
  selectedIndex: number;
  isCorrect: boolean;
  timeSpent: number;
}

export interface QuizAttempt {
  _id?: string;
  assessmentId: string;
  userName: string;
  answers: QuizAnswer[];
  score: number;
  totalQuestions: number;
  percentage: number;
  timeSpent: number;
  completedAt?: string;
}

export interface ParsedQuestion {
  number: number;
  text: string;
  answers: Answer[];
  timeLimit: number;
  correctAnswerIndices: number[];
}
