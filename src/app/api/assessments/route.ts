import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Assessment from "@/models/Assessment";

export async function GET() {
  try {
    await connectDB();
    const assessments = await Assessment.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(assessments);
  } catch (error) {
    console.error("Fetch assessments error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
