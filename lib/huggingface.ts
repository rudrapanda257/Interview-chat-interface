// lib/huggingface.ts
export async function callHuggingFaceAPI(prompt: string): Promise<string> {
  const response = await fetch("https://api-inference.huggingface.co/models/gpt2", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        max_new_tokens: 50,
        temperature: 0.7,
      },
    }),
  });

  const result = await response.json();

  const generatedText =
    result?.generated_text ||
    result?.generated_texts?.[0] ||
    result?.[0]?.generated_text ||
    "";

  return generatedText.replace(prompt, "").trim() || "Thanks for your answer!";
}
