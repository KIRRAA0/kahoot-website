import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import QuizAttempt from "@/models/QuizAttempt";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { assessmentId, userName, answers, score, totalQuestions, percentage, timeSpent } = body;

    if (!assessmentId || !answers || score === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const attempt = await QuizAttempt.create({
      assessmentId,
      userName: userName || "Anonymous",
      answers,
      score,
      totalQuestions,
      percentage,
      timeSpent: timeSpent || 0,
    });

    return NextResponse.json({ success: true, attemptId: attempt._id });
  } catch (error) {
    console.error("Quiz attempt error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const assessmentId = searchParams.get("assessmentId");
    const userName = searchParams.get("userName");

    const filter: Record<string, string> = {};
    if (assessmentId) filter.assessmentId = assessmentId;
    if (userName) filter.userName = userName;

    const attempts = await QuizAttempt.find(filter)
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json(attempts);
  } catch (error) {
    console.error("Fetch quiz attempts error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
