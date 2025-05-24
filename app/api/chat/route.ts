import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { question, answer } = await req.json();

    const prompt = `
You are a content strategy coach. Evaluate this answer to the question and reply with a short, friendly, helpful comment.

Question: "${question}"
Answer: "${answer}"

Respond like a helpful mentor.`;

    const hfResponse = await fetch("https://api-inference.huggingface.co/models/gpt2", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: { max_new_tokens: 50, temperature: 0.7 },
      }),
    });

    const data = await hfResponse.json();

    const generated = data?.["generated_text"] || data?.["generated_texts"]?.[0] || "Thanks for your answer!";
    const feedback = generated.replace(prompt, "").trim();

    return NextResponse.json({ feedback });
  } catch (error: any) {
    console.error("Evaluation error:", error);
    return NextResponse.json({ error: "Failed to evaluate answer." }, { status: 500 });
  }
}


