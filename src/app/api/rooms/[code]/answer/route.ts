import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Room from "@/models/Room";
import Question from "@/models/Question";

export async function POST(req: NextRequest, { params }: { params: { code: string } }) {
  try {
    const { userName, questionIndex, selectedIndex, timeSpent } = await req.json();
    const { code } = params;

    if (!userName || questionIndex === undefined || selectedIndex === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();

    const room = await Room.findOne({ code });
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    if (room.status !== "playing") {
      return NextResponse.json({ error: "Room is not in playing state" }, { status: 400 });
    }

    if (questionIndex !== room.currentQuestionIndex) {
      return NextResponse.json({ error: "Wrong question index" }, { status: 400 });
    }

    // Check if user already answered this question
    const alreadyAnswered = room.answers.some(
      (a: { userName: string; questionIndex: number }) =>
        a.userName === userName && a.questionIndex === questionIndex
    );
    if (alreadyAnswered) {
      return NextResponse.json({ error: "Already answered this question" }, { status: 400 });
    }

    // Determine correctness server-side
    const questions = await Question.find({ assessmentId: room.assessmentId })
      .sort({ number: 1 })
      .lean();
    const question = questions[questionIndex];
    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    const isCorrect = question.answers[selectedIndex]?.isCorrect === true;

    room.answers.push({
      userName,
      questionIndex,
      selectedIndex,
      isCorrect,
      timeSpent: timeSpent || 0,
    });

    // Check if all participants have now answered
    const answersForQuestion = room.answers.filter(
      (a: { questionIndex: number }) => a.questionIndex === questionIndex
    );
    if (answersForQuestion.length >= room.participants.length) {
      // All answered — transition to scoreboard
      room.status = "scoreboard";
      room.scoreboardUntil = new Date(Date.now() + 3000);
    }

    await room.save();

    return NextResponse.json({ success: true, isCorrect });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
