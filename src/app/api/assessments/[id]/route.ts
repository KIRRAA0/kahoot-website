import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Assessment from "@/models/Assessment";
import Question from "@/models/Question";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const assessment = await Assessment.findById(params.id).lean();
    if (!assessment) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
    }

    const questions = await Question.find({ assessmentId: params.id })
      .sort({ number: 1 })
      .lean();

    return NextResponse.json({ assessment, questions });
  } catch (error) {
    console.error("Fetch assessment error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
