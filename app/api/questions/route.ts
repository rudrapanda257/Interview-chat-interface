import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const questions = await prisma.question.findMany();
    return NextResponse.json(questions);
  } catch (error) {
    console.error("/api/questions error:", error);
    return NextResponse.json({ error: "Failed to load questions" }, { status: 500 });
  }
}