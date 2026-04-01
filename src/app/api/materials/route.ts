import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Material from "@/models/Material";

const DEFAULT_MATERIALS = [
  { title: "OOP Deep Dive", url: "https://canva.link/r4hs5hbh58mt01m", week: 1 },
  { title: "Inheritance & Abstraction", url: "https://canva.link/4f4la39qmbnd132", week: 2 },
];

export async function GET() {
  try {
    await connectDB();

    let materials = await Material.find().sort({ week: 1 }).lean();

    // Auto-seed if empty
    if (materials.length === 0) {
      await Material.insertMany(DEFAULT_MATERIALS);
      materials = await Material.find().sort({ week: 1 }).lean();
    }

    return NextResponse.json(materials);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, url, week } = await req.json();

    if (!title || !url || !week) {
      return NextResponse.json({ error: "title, url, and week are required" }, { status: 400 });
    }

    await connectDB();

    const material = await Material.create({ title, url, week: Number(week) });

    return NextResponse.json(material, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
