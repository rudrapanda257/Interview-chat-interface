"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Bot, Brain, Loader2, SendHorizonal, Sparkles, User } from "lucide-react";

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
  const allQAs = useRef<{ question: string; answer: string; evaluation: string }[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      const res = await fetch("/api/questions");
      const data = await res.json();
      const questionTexts = data.map((q: any) => q.text);
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

      const data = await res.json();
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

          if (saveResponse.ok) {
            await respondWithTyping("✅ Interview complete! The transcript has been saved successfully.");
            setInterviewComplete(true);
          } else {
            const errorData = await saveResponse.json();
            console.error("Save error:", errorData);
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
          await respondWithTyping(`💬 ${questions[nextIndex]}`);
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
       <div className="max-w-4xl mx-auto p-6">
        {/* Progress Indicator */}
        {!capturingIntro && (
          <div className="mb-6 bg-white/80 backdrop-blur-lg rounded-2xl p-4 shadow-lg border border-gray-200/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm text-gray-500">
                {questionIndex + 1} of {questions.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${((questionIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Thinking Indicator */}
        {thinking && (
          <div className="mb-4 animate-in slide-in-from-top duration-300">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Brain className="w-5 h-5 text-amber-600 animate-pulse" />
                  <div className="absolute inset-0 animate-ping">
                    <Brain className="w-5 h-5 text-amber-400 opacity-75" />
                  </div>
                </div>
                <div>
                  <p className="font-medium text-amber-800">AI is thinking...</p>
                  <p className="text-sm text-amber-600">Evaluating your response with advanced analysis</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chat Container */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden max-w-4xl mx-auto">
          {/* Chat Messages */}
          <div className="h-96 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-white/20 to-white/40" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 animate-in slide-in-from-bottom duration-500 ${
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {/* Avatar */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center shadow-md ${
                  msg.role === "user" 
                    ? "bg-gradient-to-br from-blue-500 to-indigo-600" 
                    : "bg-gradient-to-br from-gray-700 to-gray-800"
                }`}>
                  {msg.role === "user" ? (
                    <User className="w-5 h-5 text-white" />
                  ) : (
                    <Bot className="w-5 h-5 text-white" />
                  )}
                </div>

                {/* Message Bubble */}
                <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${
                  msg.role === "user" ? "items-end" : "items-start"
                } flex flex-col gap-1`}>
                  <div className={`px-6 py-3 rounded-3xl shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl ${
                    msg.role === "user"
                      ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
                      : "bg-white/90 text-gray-800 border border-gray-100"
                  }`}>
                    <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                  </div>
                  
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {typing && (
              <div className="flex gap-3 animate-in slide-in-from-bottom duration-300">
                <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center shadow-md">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl px-6 py-3 shadow-lg border border-gray-100">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-white/30 bg-white/90 backdrop-blur-lg p-6">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <textarea
                  className="w-full resize-none border-2 border-gray-200 focus:border-blue-500 rounded-2xl px-6 py-4 text-gray-800 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 bg-white/90 backdrop-blur-sm"
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleAnswerSubmit();
                    }
                  }}
                  placeholder={interviewComplete ? "Interview completed! Thank you." : "Type your answer here..."}
                  disabled={interviewComplete}
                  rows={3}
                />
              </div>
              <button
                onClick={handleAnswerSubmit}
                disabled={loading || currentAnswer.trim() === "" || interviewComplete}
                className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                  currentAnswer.trim() === "" || loading || interviewComplete
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-br from-blue-500 to-indigo-600 text-white hover:shadow-xl"
                }`}
              >
                {loading ? (
                  <Loader2 className="animate-spin w-6 h-6" />
                ) : (
                  <SendHorizonal className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Interview Complete Message */}
        {interviewComplete && (
          <div className="mt-6 animate-in slide-in-from-bottom duration-500">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-green-800 text-lg">Interview Complete!</h3>
                  <p className="text-green-600">Thank you for participating. Your responses have been recorded.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    
    </>
  );
}