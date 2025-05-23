"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Bot, Brain, Loader2, SendHorizonal, Sparkles, User } from "lucide-react";
import { Question } from "@prisma/client";

interface Message {
  role: "user" | "assistant";
  text: string;
}

interface MessageBubbleProps {
  message: Message;
  index: number;
}



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
          await respondWithTyping(`💬 ${questions[nextIndex]} ❓`);
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

 


   useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);


  // const TypingIndicator = () => (
  // <div className="flex items-center space-x-2 px-6 py-4 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/50 mr-auto max-w-[200px]">
  //   <div className="flex items-center space-x-1">
  //     <div 
  //       className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
  //     ></div>
  //     <div 
  //       className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
  //       style={{ animationDelay: '0.1s' }}
  //     ></div>
  //     <div 
  //       className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
  //       style={{ animationDelay: '0.2s' }}
  //     ></div>
  //   </div>
  //   <span className="text-sm text-gray-600 font-medium">AI is thinking</span>
  // </div>
  //  );

  
 

  const MessageBubble: React.FC<MessageBubbleProps> = ({ message, index }) => {
    const isUser = message.role === 'user';
    

  return (
      <div
        className={`flex items-end space-x-3 mb-6 animate-in slide-in-from-${isUser ? 'right' : 'left'}-4 duration-500`}
        style={{ animationDelay: `${index * 100}ms` }}
      >
        {!isUser && (
          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25">
            <Bot className="w-5 h-5 text-white" />
          </div>
        )}
        
        <div className={`max-w-[80%] ${isUser ? 'ml-auto' : ''}`}>
          <div className={`relative px-6 py-4 rounded-3xl shadow-lg transition-all duration-300 hover:shadow-xl ${
            isUser 
              ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white ml-auto' 
              : 'bg-white/90 backdrop-blur-sm text-gray-800 border border-gray-100/50'
          }`}>
            {/* Message tail */}
            <div className={`absolute top-4 w-0 h-0 ${
              isUser 
                ? 'right-[-8px] border-l-[16px] border-l-blue-600 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent'
                : 'left-[-8px] border-r-[16px] border-r-white border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent'
            }`}></div>
            
            <p className="text-sm leading-relaxed whitespace-pre-line font-medium">
              {message.text}
            </p>
            
            {/* Sparkle effect for AI messages */}
            {!isUser && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center opacity-80">
                <Sparkles className="w-2.5 h-2.5 text-white" />
              </div>
            )}
          </div>
        </div>
        
        {isUser && (
          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/25">
            <User className="w-5 h-5 text-white" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926')] bg-cover bg-center from-blue-400 via-cyan-500 to-teal-600 pt-4 pb-1 ml-0 mr-0">
      <div className="mx-2.5">
      <div className="max-w-2xl max-h-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-0 animate-in fade-in-5 slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center space-x-3 bg-white/80 backdrop-blur-sm px-8 py-1 rounded-3xl shadow-xl shadow-blue-500/10 border border-white/50 mb-4">
            <div className="relative">
              <Brain className="w-8 h-10 text-blue-600" />
              <div className="absolute inset-0 bg-blue-400 rounded-full opacity-20 blur-md animate-pulse"></div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              AI Interview Chat Interface
            </h1>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
          </div>
          <p className="text-gray-300 font-medium">
            Powered by advanced AI • Real-time evaluation • Professional insights
          </p>
        </div>

        {/* Thinking Banner */}
        {thinking && (
          <div className="mb-1 animate-in slide-in-from-top-2 duration-500">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-4 rounded-2xl shadow-lg flex items-center justify-center space-x-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
              <span className="font-semibold">🤔 Analyzing your response with Claude AI...</span>
            </div>
          </div>
        )}

        {/* Chat Container */}
        <div className="relative mb-3">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/5 border border-white/50 overflow-hidden">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                
                <div className="w-3 h-3 bg-red-600 rounded-full shadow-lg shadow-green-400/50 animate-pulse"></div>
                <span className="text-white font-semibold">Live Interview Session</span>
                
                </div>
              <div className="text-white/80 text-sm font-medium flex">
                {messages.length} messages
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full shadow-lg shadow-green-400/50 "></div>
              </div>
            </div>

            {/* Messages */}
            <div className="h-[400px] overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              {messages.map((message, index) => (
                <MessageBubble key={index} message={message} index={index} />
              ))}
              

              {/* AI Typing Indicator */}
              {typing && 
              <div className="flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/50 mr-auto max-w-[200px]">
                <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-blue-800 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
               <span className="text-sm text-gray-600 font-medium">AI is thinking</span>
              </div>
              
              }
              <div ref={chatEndRef} />
            </div>
          </div>
        </div>

        {/* Input Section */}
        {/* <div className="bg-white/80 backdrop-blur-xl rounded-7xl shadow-2xl shadow-black/5 border border-white/50 p-1 animate-in slide-in-from-bottom-4 duration-700"> */}
         <div>
          <div className="flex space-x-4 mt-1">
            <div className="flex-1 relative">
              <textarea
                className="w-full bg-gradient-to-br  bg-white-500 border-2 border-gray-200/50 rounded-2xl px-6 py-1 text-gray-100 placeholder-gray-300 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-400/20 transition-all duration-300 resize-none min-h-[60px] font-medium shadow-inner"
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAnswerSubmit();
                  }
                }}
                placeholder={interviewComplete ? "Interview completed! 🎉" : "✍️ Share your thoughts and insights..."}
                disabled={interviewComplete}
                rows={2}
              />
              
              {/* Character counter */}
              <div className="absolute bottom-2 right-3 text-xs text-gray-400 font-medium">
                {currentAnswer.length}/500
              </div>
            </div>
            
            <button
              onClick={handleAnswerSubmit}
              disabled={loading || currentAnswer.trim() === "" || interviewComplete}
              className={`px-9 py-1 rounded-2xl font-semibold transition-all duration-300 transform active:scale-95 flex items-center space-x-3 shadow-lg ${
                currentAnswer.trim() === "" || loading || interviewComplete
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-105"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5" />
                  <span>Sending</span>
                </>
              ) : (
                <>
                  <SendHorizonal className="w-5 h-5" />
                  <span>Send</span>
                </>
              )}
            </button>
          </div>
          

          
        </div>

        {/* Progress Indicator */}
        {/* <div className="mt-0 bg-white/60 backdrop-blur-xl rounded-2xl p-4 shadow-lg border border-white/50 mb-1"> */}
        <div className="mb-0 p-4 mt-8 ">
          {/* <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">Interview Progress</span>
            <span className="text-sm text-gray-500">Question 3 of 10</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-700 ease-out shadow-sm" style={{ width: '30%' }}></div>
          </div> */}
        </div>
      </div>
      </div>
    </div>
  );
}