import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Room from "@/models/Room";

export async function POST(req: NextRequest, { params }: { params: { code: string } }) {
  try {
    const { userName } = await req.json();
    const { code } = params;

    if (!userName) {
      return NextResponse.json({ error: "userName is required" }, { status: 400 });
    }

    await connectDB();

    const room = await Room.findOne({ code });
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    if (room.status !== "waiting") {
      return NextResponse.json({ error: "Room has already started" }, { status: 400 });
    }

    const alreadyJoined = room.participants.some(
      (p: { userName: string }) => p.userName === userName
    );
    if (alreadyJoined) {
      return NextResponse.json({ error: "You have already joined this room" }, { status: 400 });
    }

    if (room.participants.length >= 4) {
      return NextResponse.json({ error: "Room is full (max 4 players)" }, { status: 400 });
    }

    room.participants.push({ userName, joinedAt: new Date() });
    await room.save();

    return NextResponse.json({ success: true, room });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
