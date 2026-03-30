import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { connectDB } from "@/lib/mongodb";
import { parseKahootXlsx } from "@/lib/xlsx-parser";
import { uploadToCloudinary } from "@/lib/cloudinary";
import Assessment from "@/models/Assessment";
import Question from "@/models/Question";

export const runtime = "nodejs";

const FILE_META = [
  {
    fileName: "kahoot_flutter_preassessment_final.xlsx",
    title: "Flutter Pre-Assessment",
    slug: "flutter-pre-assessment",
    description: "Baseline knowledge assessment before Flutter training begins",
    type: "pre-assessment" as const,
    week: null,
    weeks: [],
  },
  {
    fileName: "kahoot_week2_post_assessment.xlsx",
    title: "Week 2 Post-Assessment",
    slug: "week-2-post-assessment",
    description: "Assessment after completing Week 2 of Flutter training",
    type: "post-assessment" as const,
    week: 2,
    weeks: [2],
  },
  {
    fileName: "kahoot_weeks1-3_combined.xlsx",
    title: "Weeks 1-3 Combined Assessment",
    slug: "weeks-1-3-combined",
    description: "Combined assessment covering Weeks 1 through 3 of Flutter training",
    type: "combined" as const,
    week: null,
    weeks: [1, 2, 3],
  },
];

export async function POST() {
  try {
    await connectDB();

    const results = [];

    for (const meta of FILE_META) {
      const existing = await Assessment.findOne({ slug: meta.slug });
      if (existing) {
        results.push({ fileName: meta.fileName, status: "skipped (already exists)" });
        continue;
      }

      const filePath = path.join(process.cwd(), "data", meta.fileName);
      if (!fs.existsSync(filePath)) {
        results.push({ fileName: meta.fileName, status: "skipped (file not found)" });
        continue;
      }

      const buffer = fs.readFileSync(filePath);
      const questions = parseKahootXlsx(buffer);

      let fileUrl = "";
      try {
        fileUrl = await uploadToCloudinary(buffer, meta.fileName);
      } catch {
        // Continue without Cloudinary URL if upload fails
      }

      const assessment = await Assessment.create({
        title: meta.title,
        slug: meta.slug,
        description: meta.description,
        type: meta.type,
        week: meta.week,
        weeks: meta.weeks,
        questionCount: questions.length,
        fileName: meta.fileName,
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

      results.push({
        fileName: meta.fileName,
        status: "seeded",
        questionCount: questions.length,
        assessmentId: assessment._id,
      });
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
