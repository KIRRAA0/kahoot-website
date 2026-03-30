import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Question from "@/models/Question";

export async function GET() {
  try {
    await connectDB();
    // Get first 5 questions to see what the text actually looks like
    const questions = await Question.find().limit(5).lean();
    const texts = questions.map((q) => ({
      number: q.number,
      text: q.text,
      hasBackticks: q.text.includes("`"),
      charCodes: Array.from(q.text.slice(0, 100) as string).map((c) => ({
        char: c,
        code: c.charCodeAt(0),
      })),
    }));
    return NextResponse.json(texts, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
