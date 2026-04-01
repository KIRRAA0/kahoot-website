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

// ─── Workshop Material Types ────────────────────────────────

export interface Material {
  _id?: string;
  title: string;
  url: string;
  week: number;
  createdAt?: string;
}

// ─── Tech Topic Types ───────────────────────────────────────

export interface TechTopic {
  _id?: string;
  title: string;
  category: string;
  tagline: string;
  description: string;
  url: string;
  createdAt?: string;
}

// ─── Multiplayer Room Types ───────────────────────────────────

export interface RoomParticipant {
  userName: string;
  joinedAt: string;
}

export interface RoomAnswer {
  userName: string;
  questionIndex: number;
  selectedIndex: number;
  isCorrect: boolean;
  timeSpent: number;
}

export interface Room {
  _id?: string;
  code: string;
  assessmentId: string;
  hostName: string;
  status: "waiting" | "playing" | "scoreboard" | "finished";
  participants: RoomParticipant[];
  currentQuestionIndex: number;
  questionStartedAt: string | null;
  scoreboardUntil: string | null;
  answers: RoomAnswer[];
  totalQuestions: number;
  questionTimeLimits: number[];
  createdAt?: string;
}

export interface PreviousQuestionResult {
  questionIndex: number;
  questionText: string;
  correctAnswerIndex: number;
  participantResults: {
    userName: string;
    selectedIndex: number;
    isCorrect: boolean;
    timeSpent: number;
  }[];
}

export interface RoomPollResponse {
  room: Room;
  currentQuestion?: Question;
  previousQuestionResults?: PreviousQuestionResult;
  scores: { userName: string; score: number; totalCorrect: number }[];
}
