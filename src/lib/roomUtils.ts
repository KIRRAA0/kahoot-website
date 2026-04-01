export const ALLOWED_USERS = [
  "Youssef Alaa",
  "Youssef Mohamed",
  "Braa",
  "Ali",
] as const;

export type AllowedUser = (typeof ALLOWED_USERS)[number];

export function isAllowedUser(name: string): name is AllowedUser {
  return ALLOWED_USERS.includes(name as AllowedUser);
}

export function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I/O/0/1 to avoid confusion
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export interface UserScore {
  userName: string;
  score: number;
  totalCorrect: number;
}

/**
 * Checks and applies time-based state transitions on a room document.
 * Returns whether a transition occurred and what type.
 * The caller is responsible for saving the room afterward.
 */
export function advanceRoomState(room: {
  status: string;
  questionStartedAt: Date | null;
  questionTimeLimits: number[];
  currentQuestionIndex: number;
  scoreboardUntil: Date | null;
  totalQuestions: number;
  participants: { userName: string }[];
  answers: { questionIndex: number }[];
}): { transitioned: boolean; type: string } {
  if (room.status === "playing" && room.questionStartedAt) {
    const timeLimit = room.questionTimeLimits[room.currentQuestionIndex] || 30;
    const deadline = new Date(room.questionStartedAt).getTime() + timeLimit * 1000;
    const answersForQuestion = room.answers.filter(
      (a) => a.questionIndex === room.currentQuestionIndex
    );
    const allAnswered = answersForQuestion.length >= room.participants.length;

    if (allAnswered || Date.now() > deadline) {
      room.status = "scoreboard";
      room.scoreboardUntil = new Date(Date.now() + 3000);
      return { transitioned: true, type: "scoreboard" };
    }
  }

  if (room.status === "scoreboard" && room.scoreboardUntil) {
    if (Date.now() > new Date(room.scoreboardUntil).getTime()) {
      if (room.currentQuestionIndex + 1 >= room.totalQuestions) {
        room.status = "finished";
        room.scoreboardUntil = null;
        return { transitioned: true, type: "finished" };
      } else {
        room.currentQuestionIndex += 1;
        room.questionStartedAt = new Date();
        room.status = "playing";
        room.scoreboardUntil = null;
        return { transitioned: true, type: "next-question" };
      }
    }
  }

  return { transitioned: false, type: "" };
}

export function computeScores(
  answers: { userName: string; isCorrect: boolean }[],
  participants: { userName: string }[]
): UserScore[] {
  const scoreMap = new Map<string, number>();
  for (const p of participants) {
    scoreMap.set(p.userName, 0);
  }
  for (const a of answers) {
    if (a.isCorrect) {
      scoreMap.set(a.userName, (scoreMap.get(a.userName) || 0) + 1);
    }
  }
  return participants
    .map((p) => ({
      userName: p.userName,
      score: scoreMap.get(p.userName) || 0,
      totalCorrect: scoreMap.get(p.userName) || 0,
    }))
    .sort((a, b) => b.score - a.score);
}
