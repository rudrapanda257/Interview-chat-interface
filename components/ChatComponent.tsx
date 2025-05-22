"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Loader2, SendHorizonal } from "lucide-react";
import { Question } from "@prisma/client";

export default function ChatComponent() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [capturingIntro, setCapturingIntro] = useState(true);
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [interviewComplete, setInterviewComplete] = useState(false);

  const { data: session } = useSession();
  interface QA {
  question: string;
  answer: string;
  evaluation: string;
  }

   const allQAs = useRef<QA[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      const res = await fetch("/api/questions");
      const data: { text: string }[] = await res.json();  // <-- Add type here instead of 'any'
      const questionTexts = data.map(q => q.text);
      setQuestions(questionTexts);

    };

    fetchQuestions();
    setMessages([
      {
        role: "assistant",
        text: "🤖 Welcome to your weekly content strategy interview. Let's start by confirming your name and the company you're working with.",
      },
    ]);
  }, []);

  // Auto-scroll to bottom when new messages appear
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, typing]);

  const handleAnswerSubmit = async () => {
    const userAnswer = currentAnswer.trim();
    if (!userAnswer || interviewComplete) return;

    setMessages((prev) => [...prev, { role: "user", text: userAnswer }]);
    setLoading(true);
    setThinking(true);
    setCurrentAnswer("");

    if (capturingIntro) {
      if (!userAnswer.toLowerCase().includes(" from ")) {
        await respondWithTyping(`👋 Please introduce yourself like "I am [your name] from [company name]"`);
        setLoading(false);
        setThinking(false);
        return;
      }

      const [nameInput, ...companyInput] = userAnswer.trim().split(" from ");
      const nameValue = nameInput.replace(/^I am\s*/i, "").replace(/^My name is\s*/i, "").trim();
      const companyValue = companyInput.join(" ").trim();

      if (!nameValue || !companyValue) {
        await respondWithTyping(`❗Please enter both name and company in the format "I am [your name] from [company name]"`);
        setLoading(false);
        setThinking(false);
        return;
      }

      setName(nameValue);
      setCompany(companyValue);
      setCapturingIntro(false);

      const firstQuestion = questions[0] || "Let's begin. Tell me about your content strategy process.";
      await respondWithTyping(`👋 Thank you, ${nameValue}. ${firstQuestion}`);
      setLoading(false);
      setThinking(false);
      return;
    }

    const currentQuestion = questions[questionIndex];

    const evaluateAnswer = async (question: string, answer: string) => {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, answer }),
      });
      if (!res.ok) {
        throw new Error("Failed to evaluate answer");
      }

      interface EvaluateResponse {
     feedback: string;
      }

      const data: EvaluateResponse = await res.json();
      return data.feedback;

    };

    try {
      const evaluation = await evaluateAnswer(currentQuestion, userAnswer);

      allQAs.current.push({
        question: currentQuestion,
        answer: userAnswer,
        evaluation: evaluation || "Reviewed ✅",
      });

      await respondWithTyping(`🤖 ${evaluation}`);

      const isFinal = questionIndex === questions.length - 1;

      if (isFinal) {
        // Save transcript
        try {
          
          const saveResponse = await fetch("/api/save-transcript", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              name, 
              company, 
              questions: allQAs.current,
              userId: session?.user?.id // Pass userId if available
            }),
          });

            interface SaveError {
  message: string;
           }

             if (saveResponse.ok) {
             await respondWithTyping("✅ Interview complete! The transcript has been saved successfully.");
             setInterviewComplete(true);
            } else {
  const errorData: SaveError = await saveResponse.json();
  console.error("Save error:", errorData.message);
  await respondWithTyping("⚠️ Interview complete, but there was an issue saving the transcript. Please contact support.");
            }

        } catch (saveError) {
          console.error("Save transcript error:", saveError);
          await respondWithTyping("⚠️ Interview complete, but there was an issue saving the transcript. Please contact support.");
        }
      } else {
        const nextIndex = questionIndex + 1;
        setQuestionIndex(nextIndex);

        if (nextIndex < questions.length) {
          await respondWithTyping(`💬 ${questions[nextIndex]} ❔`);
        }
      }
    } catch (err) {
      console.error("Evaluation error:", err);
      await respondWithTyping("⚠️ Sorry, there was an issue evaluating your response. Please try again.");
    }

    setLoading(false);
    setThinking(false);
  };

  const respondWithTyping = async (finalText: string) => {
    return new Promise<void>((resolve) => {
      setTyping(true);
      let text = "";

      setMessages((prev) => [...prev, { role: "assistant", text: "" }]);

      const speed = 30;
      const interval = setInterval(() => {
        if (text.length < finalText.length) {
          text = finalText.slice(0, text.length + 1);
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { ...updated[updated.length - 1], text };
            return updated;
          });
        } else {
          clearInterval(interval);
          setTyping(false);
          resolve();
        }
      }, speed);
    });
  };

  return (
    <>
      <div className="max-w-xl mx-auto p-1 relative">
        <div>
          <h1 className="text-2xl font-bold mb-2 mt-1 text-center">🧠  Interview Chat Interface  👩🏻‍💻</h1>

          {/* Chat box */}
          {/* <div className="border rounded-lg p-4 h-[400px] overflow-y-scroll bg-white space-y-2 shadow-md">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`text-sm p-2 rounded-md max-w-[80%] whitespace-pre-line ${
                  msg.role === "user"
                    ? "bg-blue-100 ml-auto text-right"
                    : "bg-gray-100"
                }`}
              >
                {msg.text}
              </div>
            ))}
            {typing && <div className="text-sm text-gray-500">Typing...</div>}
            <div ref={chatEndRef} />
          </div> */}
          <div>

     {/* Chat box */}
     <div
    className="relative border rounded-lg p-4 h-[400px] overflow-y-scroll shadow-lg space-y-3"
    style={{
      backgroundImage: "url('')", // 🔄 Replace with your image path
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backdropFilter: 'blur(10px)',
      backgroundColor: 'rgba(255, 255, 255, 0.6)', // fallback
    }}
  >
    <div className="">
      {messages.map((msg, i) => (
        <div
          key={i}
          className={`text-sm px-4 py-2 m-3 rounded-xl max-w-[75%] whitespace-pre-line transition-all duration-200 ${
            msg.role === "user"
              ? "bg-blue-600 text-white ml-auto shadow-md"
              : "bg-white text-gray-800 mr-auto shadow-sm"
          }`}
        >
          {msg.text}
        </div>
      ))}
      {typing && <div className="text-sm text-gray-700 italic">Typing...</div>}
      <div ref={chatEndRef} />
     </div>
     </div>
     </div>


          <div className=" borer-radiu">
            {thinking && (
              <div className="absolute top-0 left-0 w-full bg-yellow-100 text-yellow-700 px-3 py-4 text-sm text-center animate-pulse z-10 rounded-t-md shadow">
                🤔 Thinking... Evaluating your answer with Claude AI...
              </div>
            )}
          </div>

          {/* Input + Button */}
          <div className="flex gap-2 mt-4">
            <textarea
             className="flex-1 border p-2 rounded-md font-semibold text-white placeholder-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
             value={currentAnswer}
             onChange={(e) => setCurrentAnswer(e.target.value)}
             onKeyDown={(e) => {
             if (e.key === "Enter" && !e.shiftKey) {
             e.preventDefault();
              handleAnswerSubmit();
          }
        }}
          placeholder={interviewComplete ? "Interview completed!" : "✍️ Type your answer..."}
          disabled={interviewComplete}
         />
            <button
              onClick={handleAnswerSubmit}
              disabled={loading || currentAnswer.trim() === "" || interviewComplete}
              className={`px-4 py-2 rounded-md flex items-center gap-2 transition duration-300 ${
                currentAnswer.trim() === "" || loading || interviewComplete
                  ? "bg-blue-300 text-white cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {loading ? (
                <Loader2 className="animate-spin w-4 h-4" />
              ) : (
                <SendHorizonal className="w-4 h-4" />
              )}
              Send
            </button>
          </div>
        </div>
      </div>
    </>
  );
}