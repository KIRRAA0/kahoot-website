import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Room from "@/models/Room";
import Assessment from "@/models/Assessment";
import Question from "@/models/Question";
import { generateRoomCode } from "@/lib/roomUtils";

export async function POST(req: NextRequest) {
  try {
    const { assessmentId, hostName } = await req.json();

    if (!assessmentId || !hostName) {
      return NextResponse.json({ error: "assessmentId and hostName are required" }, { status: 400 });
    }

    await connectDB();

    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
    }

    const questions = await Question.find({ assessmentId }).sort({ number: 1 }).lean();
    if (questions.length === 0) {
      return NextResponse.json({ error: "No questions found for this assessment" }, { status: 404 });
    }

    // Generate unique room code
    let code: string;
    let attempts = 0;
    do {
      code = generateRoomCode();
      const existing = await Room.findOne({ code });
      if (!existing) break;
      attempts++;
    } while (attempts < 10);

    if (attempts >= 10) {
      return NextResponse.json({ error: "Failed to generate unique room code" }, { status: 500 });
    }

    const room = await Room.create({
      code,
      assessmentId,
      hostName,
      status: "waiting",
      participants: [{ userName: hostName, joinedAt: new Date() }],
      totalQuestions: questions.length,
      questionTimeLimits: questions.map((q) => q.timeLimit || 30),
    });

    return NextResponse.json({ code: room.code, roomId: room._id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
