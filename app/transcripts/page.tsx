"use client";

import { useEffect, useState } from "react";
import { Calendar, Building2, User, Clock, ChevronDown, ChevronUp } from "lucide-react";
import Navbar from "@/components/Navbar";

interface QAItem {
  question: string;
  answer: string;
  evaluation: string;
}

interface Transcript {
  id: string;
  name: string;
  company: string;
  questions: QAItem[];
  createdAt: string;
  user: {
    name: string | null;
    email: string | null;
  };
}

export default function TranscriptPage() {
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedTranscripts, setExpandedTranscripts] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchTranscripts();
  }, []);

  const fetchTranscripts = async () => {
    try {
      const response = await fetch('/api/transcripts');
      const data = await response.json();

      if (data.success) {
        setTranscripts(data.transcripts);
      } else {
        setError('Failed to fetch transcripts');
      }
    } catch (err) {
      setError('Error loading transcripts');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTranscript = (id: string) => {
    const newExpanded = new Set(expandedTranscripts);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedTranscripts(newExpanded);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center ">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading transcripts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-90 to-indigo-100 flex items-center justify-center ">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️ Error</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>  
    <Navbar/>
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 ">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            📋 Interview Transcripts
          </h1>
          <p className="text-gray-600">
            View all content strategy interview transcripts
          </p>
          <div className="mt-4 bg-white/20 backdrop-blur-sm rounded-lg p-2 inline-block">
            <span className="text-sm font-medium text-gray-700">
              Total Transcripts: {transcripts.length}
            </span>
          </div>
        </div>

        {/* Transcripts List */}
        {transcripts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No transcripts found
            </h3>
            <p className="text-gray-500">
              Complete an interview to see transcripts here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {transcripts.map((transcript) => {
              const { date, time } = formatDate(transcript.createdAt);
              const isExpanded = expandedTranscripts.has(transcript.id);

              return (
                <div
                  key={transcript.id}
                  className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  {/* Header */}
                  <div
                    className="p-6 cursor-pointer hover:bg-gray-50/50 transition-colors"
                    onClick={() => toggleTranscript(transcript.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex items-center gap-2 text-blue-600">
                            <User className="w-5 h-5" />
                            <span className="font-semibold text-lg">
                              {transcript.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-emerald-600">
                            <Building2 className="w-5 h-5" />
                            <span className="font-medium">
                              {transcript.company}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{time}</span>
                          </div>
                          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                            {transcript.questions.length} Questions
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">
                          {isExpanded ? 'Hide' : 'View'} Details
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-gray-200">
                      <div className="p-6 bg-gray-50/50">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                          💬 Interview Transcript
                        </h3>
                        
                        <div className="space-y-6">
                          {transcript.questions.map((qa, index) => (
                            <div
                              key={index}
                              className="bg-white rounded-lg p-5 shadow-sm border border-gray-200"
                            >
                              {/* Question */}
                              <div className="mb-4">
                                <div className="flex items-start gap-3">
                                  <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                                    Q{index + 1}
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-medium text-gray-800 mb-2">
                                      Question:
                                    </h4>
                                    <p className="text-gray-700 leading-relaxed">
                                      {qa.question}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Answer */}
                              <div className="mb-4">
                                <div className="flex items-start gap-3">
                                  <div className="bg-green-100 text-green-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                                    A
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-medium text-gray-800 mb-2">
                                      Answer:
                                    </h4>
                                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                      {qa.answer}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Evaluation */}
                              {qa.evaluation && (
                                <div className="border-t border-gray-100 pt-4">
                                  <div className="flex items-start gap-3">
                                    <div className="bg-purple-100 text-purple-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                                      ✓
                                    </div>
                                    <div className="flex-1">
                                      <h4 className="font-medium text-gray-800 mb-2">
                                        AI Evaluation:
                                      </h4>
                                      <p className="text-gray-600 leading-relaxed text-sm bg-purple-50 p-3 rounded-lg">
                                        {qa.evaluation}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
    </>
  );
}