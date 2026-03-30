import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import QuizAttempt from "@/models/QuizAttempt";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const assessmentId = searchParams.get("assessmentId");

    const matchStage = assessmentId
      ? { $match: { assessmentId: assessmentId } }
      : { $match: {} };

    const leaderboard = await QuizAttempt.aggregate([
      matchStage,
      {
        $group: {
          _id: "$userName",
          bestScore: { $max: "$percentage" },
          totalAttempts: { $sum: 1 },
          avgScore: { $avg: "$percentage" },
          lastAttempt: { $max: "$createdAt" },
        },
      },
      { $sort: { bestScore: -1, avgScore: -1 } },
      { $limit: 50 },
      {
        $project: {
          userName: "$_id",
          bestScore: 1,
          totalAttempts: 1,
          avgScore: { $round: ["$avgScore", 1] },
          lastAttempt: 1,
          _id: 0,
        },
      },
    ]);

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
