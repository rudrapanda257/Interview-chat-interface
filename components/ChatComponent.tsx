"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Loader2, SendHorizonal, } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'


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
        text: "Welcome to your weekly content strategy interview. Let's start by confirming your name and the company you're working with.",
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
        await respondWithTyping(`Please introduce yourself like "I am [your name] from [company name]"`);
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
      await respondWithTyping(`Thank you, ${nameValue}. ${firstQuestion}`);
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
        evaluation: evaluation || "Reviewed ",
      });

      await respondWithTyping(` ${evaluation}`);

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
              userId: session?.user?.id 
            }),
          });

            interface SaveError {
               message: string;
           }

             if (saveResponse.ok) {
             await respondWithTyping(" Interview complete! The transcript has been saved successfully.");
             setInterviewComplete(true);
            } else {
             const errorData: SaveError = await saveResponse.json();
             console.error("Save error:", errorData.message);
             await respondWithTyping(" Interview complete, but there was an issue saving the transcript. Please contact support.");
            }

        } catch (saveError) {
          console.error("Save transcript error:", saveError);
          await respondWithTyping(" Interview complete, but there was an issue saving the transcript. Please contact support.");
        }
      } else {
        const nextIndex = questionIndex + 1;
        setQuestionIndex(nextIndex);

        if (nextIndex < questions.length) {
          await respondWithTyping(` ${questions[nextIndex]} `);
        }
      }
    } catch (err) {
      console.error("Evaluation error:", err);
      await respondWithTyping(" Sorry, there was an issue evaluating your response. Please try again.");
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


 

  const MessageBubble: React.FC<MessageBubbleProps> = ({ message, index }) => {
    const isUser = message.role === 'user';
    

  return (
      <div
        className={`flex items-end space-x-3 mb-6 animate-in slide-in-from-${isUser ? 'right' : 'left'}-4 duration-500`}
        style={{ animationDelay: `${index * 100}ms` }}
      >
       <div className={`max-w-[80%] ${isUser ? 'ml-auto' : ''}`}>
          <div className={`relative px-6 py-4 rounded-3xl shadow-lg transition-all duration-300 hover:shadow-xl ${
            isUser 
              ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white ml-auto' 
              : 'bg-white/90 backdrop-blur-sm text-gray-800 border border-gray-100/50'
          }`}> 
            <p className="text-sm leading-relaxed whitespace-pre-line font-medium">
              {message.text}
            </p>
           </div>
         </div> 
       </div>
      );
     };

   return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 pt-4 pb-1 ml-0 mr-0">
      <div className="mx-2.5">
        <div className="max-w-2xl max-h-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-4 animate-in fade-in-5 slide-in-from-top-4 duration-700">
            <Card className="inline-flex mt-2 items-center space-x-3 px-8 py-2 rounded-3xl bg-white/80 backdrop-blur-sm shadow-xl shadow-blue-500/10 border border-white/50">
              {/* <div className="relative">
                <Brain className="w-8 h-10 text-blue-600" />
                <div className="absolute inset-0 bg-blue-400 rounded-full opacity-20 blur-md animate-pulse" />
              </div> */}
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                AI Interview Chat Interface
              </h1>
            </Card>
            <p className="text-gray-400 font-medium">
              Powered by Claude AI • Real-time evaluation • Professional insights
            </p>
          </div>

          {/* Thinking Banner */}
          {thinking && (
            <Card className="mb-3 animate-in slide-in-from-top-2 duration-500 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-4 rounded-2xl shadow-lg flex items-center justify-center space-x-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-200"></div>
                <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-400"></div>
              </div>
              <span className="font-semibold">🤔 Analyzing your response with Claude AI...</span>
            </Card>
          )}

          {/* Chat Section */}
          <Card className="relative mb-4 mt-0 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/5 border border-white/50 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-red-600 rounded-full shadow-lg shadow-green-400/50 animate-pulse"></div>
                <span className="text-white font-semibold">Live Interview Session</span>
              </div>
              <div className="text-white/80 text-sm font-medium flex items-center space-x-1">
                <span>{messages.length} messages</span>
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full shadow-lg shadow-green-400/50"></div>
              </div>
            </CardHeader>

            <CardContent className="h-[400px] overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              {messages.map((message: any, index: number) => (
                <MessageBubble key={index} message={message} index={index} />
              ))}

              {/* AI Typing Indicator */}
              {typing && (
                <div className="flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/50 max-w-[200px]">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-200"></div>
                    <div className="w-2 h-2 bg-blue-800 rounded-full animate-bounce delay-400"></div>
                  </div>
                  <span className="text-sm text-gray-600 font-medium">AI is thinking</span>
                </div>
              )}

              <div ref={chatEndRef} />
            </CardContent>
          </Card>

          {/* Input Section */}
          <div className="flex space-x-4 mt-1">
            <div className="flex-1 relative">
              <Textarea
                className="text-sm min-h-[60px] font-medium shadow-inner"
                placeholder={interviewComplete ? "Interview completed! 🎉" : "Share your thoughts and insights..."}
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleAnswerSubmit()
                  }
                }}
                disabled={interviewComplete}
                maxLength={500}
              />
              <div className="absolute bottom-2 right-3 text-xs text-gray-400 font-medium">
                {currentAnswer.length}/500
              </div>
            </div>

            <Button
              onClick={handleAnswerSubmit}
              disabled={loading || currentAnswer.trim() === '' || interviewComplete}
              className="px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl font-semibold transition-all duration-300 transform active:scale-95 flex items-center space-x-2"
              variant={loading || currentAnswer.trim() === '' || interviewComplete ? 'outline' : 'default'}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5 " />
                  <span className="text-amber-50">Sending</span>
                </>
              ) : (
                <>
                  <SendHorizonal className="w-7 h-5 " />
                  <span className="text-amber-50">Send</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

}