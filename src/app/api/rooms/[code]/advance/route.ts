import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Room from "@/models/Room";
import { advanceRoomState } from "@/lib/roomUtils";
import { publishRoomUpdate } from "@/lib/pusher-server";

export async function POST(req: NextRequest, { params }: { params: { code: string } }) {
  try {
    const { code } = params;

    await connectDB();

    const room = await Room.findOne({ code });
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const { transitioned, type } = advanceRoomState(room);

    if (transitioned) {
      await room.save();
      await publishRoomUpdate(code, { type });
    }

    return NextResponse.json({ success: true, transitioned, type });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
