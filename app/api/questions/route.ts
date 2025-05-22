import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const questions = await prisma.question.findMany();
    return NextResponse.json(questions);
  } catch (error: any) {
    console.error("Error fetching questions:", error.message);
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 });
  }
}