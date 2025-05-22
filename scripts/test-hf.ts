// 4. scripts/test-hf.ts
import { callHuggingFaceAPI } from '../lib/huggingface';

async function test() {
  try {
    const res = await callHuggingFaceAPI("Hello, how are you?");
    console.log("Response:", res);
  } catch (err) {
    console.error("Test failed:", err);
  }
}

test();
