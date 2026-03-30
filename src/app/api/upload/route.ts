import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { parseKahootXlsx } from "@/lib/xlsx-parser";
import { uploadToCloudinary } from "@/lib/cloudinary";
import Assessment from "@/models/Assessment";
import Question from "@/models/Question";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const title = formData.get("title") as string;
    const type = formData.get("type") as string;
    const weekStr = formData.get("week") as string;
    const weeksStr = formData.get("weeks") as string;
    const description = (formData.get("description") as string) || "";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.name.endsWith(".xlsx")) {
      return NextResponse.json({ error: "File must be .xlsx" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File must be under 5MB" }, { status: 400 });
    }

    if (!title || !type) {
      return NextResponse.json({ error: "Title and type are required" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const questions = parseKahootXlsx(buffer);
    if (questions.length === 0) {
      return NextResponse.json({ error: "No questions found in file" }, { status: 400 });
    }

    let fileUrl = "";
    try {
      fileUrl = await uploadToCloudinary(buffer, file.name);
    } catch {
      // Continue without Cloudinary URL
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const week = weekStr ? parseInt(weekStr) : null;
    const weeks = weeksStr
      ? weeksStr.split(",").map((s) => parseInt(s.trim())).filter((n) => !isNaN(n))
      : week
        ? [week]
        : [];

    const assessment = await Assessment.create({
      title,
      slug: `${slug}-${Date.now()}`,
      description,
      type,
      week,
      weeks,
      questionCount: questions.length,
      fileName: file.name,
      fileUrl,
    });

    const questionDocs = questions.map((q) => ({
      assessmentId: assessment._id,
      number: q.number,
      text: q.text,
      answers: q.answers,
      timeLimit: q.timeLimit,
      correctAnswerIndices: q.correctAnswerIndices,
      bookmarkedBy: [],
    }));

    await Question.insertMany(questionDocs);

    return NextResponse.json({
      success: true,
      assessmentId: assessment._id,
      questionCount: questions.length,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
