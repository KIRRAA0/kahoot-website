import * as XLSX from "xlsx";
import { ParsedQuestion, Answer } from "./types";

const HEADER_ROW_INDEX = 7;

const COL = {
  questionNumber: 0,
  questionText: 1,
  answer1: 2,
  answer2: 3,
  answer3: 4,
  answer4: 5,
  timeLimit: 6,
  correctAnswers: 7,
} as const;

export function parseKahootXlsx(buffer: Buffer | ArrayBuffer): ParsedQuestion[] {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawData: (string | number | null)[][] = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: null,
  });

  const questions: ParsedQuestion[] = [];

  for (let i = HEADER_ROW_INDEX + 1; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row) continue;

    const questionText = row[COL.questionText];
    if (!questionText || String(questionText).trim() === "") continue;

    const correctAnswerStr = String(row[COL.correctAnswers] ?? "");
    const correctIndices = correctAnswerStr
      .split(",")
      .map((s) => parseInt(s.trim()))
      .filter((n) => !isNaN(n));

    const answers: Answer[] = [];
    const answerCols = [COL.answer1, COL.answer2, COL.answer3, COL.answer4];
    for (let a = 0; a < answerCols.length; a++) {
      const answerText = row[answerCols[a]];
      if (answerText !== null && answerText !== undefined && String(answerText).trim() !== "") {
        answers.push({
          id: a + 1,
          text: String(answerText),
          isCorrect: correctIndices.includes(a + 1),
        });
      }
    }

    questions.push({
      number: Number(row[COL.questionNumber]) || questions.length + 1,
      text: String(questionText),
      answers,
      timeLimit: parseInt(String(row[COL.timeLimit] ?? "30")) || 30,
      correctAnswerIndices: correctIndices,
    });
  }

  return questions;
}
