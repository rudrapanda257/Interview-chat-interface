
import { NextResponse } from "next/server";
import { callClaude } from "@/lib/anthropic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Evaluate request body:", body);
    const { question, answer } = body;

    if (!question || !answer) {
      return NextResponse.json({ feedback: "Invalid input" }, { status: 400 });
    }

    const prompt = `
You are a friendly content strategy coach.

Evaluate the following candidate answer to the given question and give a very very short, kind, encouraging, and constructive comment.

Question: "${question}"
Answer: "${answer}"

Respond like a helpful mentor.
`;

    const feedback = await callClaude(prompt);

    return NextResponse.json({ feedback });
  } catch (error: any) {
    console.error("Evaluation error:", error);
    return NextResponse.json(
      { feedback: "Sorry, something went wrong while evaluating your response." },
      { status: 500 }
    );
  }
}