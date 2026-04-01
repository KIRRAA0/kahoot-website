import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { isAllowedUser } from "@/lib/roomUtils";

export async function POST(req: NextRequest) {
  try {
    const { name, password } = await req.json();

    if (!name || !password) {
      return NextResponse.json({ error: "Name and password are required" }, { status: 400 });
    }

    if (!isAllowedUser(name)) {
      return NextResponse.json({ error: "Invalid user name" }, { status: 400 });
    }

    if (password.length < 3) {
      return NextResponse.json({ error: "Password must be at least 3 characters" }, { status: 400 });
    }

    await connectDB();

    const existingUser = await User.findOne({ name });

    if (!existingUser) {
      // First time: create user with hashed password
      const passwordHash = await bcrypt.hash(password, 10);
      await User.create({ name, passwordHash });
      return NextResponse.json({ success: true, isNewUser: true });
    }

    // Existing user: verify password
    const isValid = await bcrypt.compare(password, existingUser.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
    }

    return NextResponse.json({ success: true, isNewUser: false });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
