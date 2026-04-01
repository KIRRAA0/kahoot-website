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
