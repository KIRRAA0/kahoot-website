import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Room from "@/models/Room";

export async function POST(req: NextRequest, { params }: { params: { code: string } }) {
  try {
    const { userName } = await req.json();
    const { code } = params;

    await connectDB();

    const room = await Room.findOne({ code });
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    if (room.hostName !== userName) {
      return NextResponse.json({ error: "Only the host can start the quiz" }, { status: 403 });
    }

    if (room.status !== "waiting") {
      return NextResponse.json({ error: "Room has already started" }, { status: 400 });
    }

    room.status = "playing";
    room.currentQuestionIndex = 0;
    room.questionStartedAt = new Date();
    await room.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
