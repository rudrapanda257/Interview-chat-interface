import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface AuthSession {
  user?: {
    id?: string;
    email?: string;
    name?: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    // Get session using NextAuth v4
    const session = await getServerSession(authConfig) as AuthSession | null;

    // Check if user is authenticated
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { company, questions, name } = await req.json();

    if (!company || !Array.isArray(questions) || !name) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const transcript = await prisma.interviewTranscript.create({
      data: {
        userId: session.user.id,
        name,
        company,
        questions,
        createdAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, transcript });
  } catch (err) {
    console.error("Error saving transcript:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}