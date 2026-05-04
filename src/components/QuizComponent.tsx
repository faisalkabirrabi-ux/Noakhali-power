import React, { useState } from 'react';
import { Brain, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

const quizQuestions = [
  {
    question: "বিদ্যুতের মেইন সুইচ বা ফিউজ ভিজে হাতে ধরা উচিত?",
    options: ["হ্যাঁ", "না"],
    correctAnswer: 1
  },
  {
    question: "এনার্জি সেভিং বাল্ব ব্যবহারে বিদ্যুৎ খরচ কি কমে?",
    options: ["হ্যাঁ", "না"],
    correctAnswer: 0
  },
  {
    question: "বজ্রপাতের সময় বাড়ির ইলেক্ট্রিক্যাল অ্যাপ্লায়েন্সের প্লাগ খুলে রাখা উচিত?",
    options: ["হ্যাঁ", "না"],
    correctAnswer: 0
  }
];

export default function QuizComponent() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const handleAnswer = (index: number) => {
    setSelectedOption(index);
    if (index === quizQuestions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }
  };

  const nextQuestion = () => {
    setSelectedOption(null);
    if (currentQuestion + 1 < quizQuestions.length) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResult(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
    setSelectedOption(null);
  };

  return (
    <div className="bg-[#0D0D0D] p-6 rounded-3xl border border-gray-900 shadow-xl space-y-4">
      <h3 className="text-lg font-black text-white flex items-center gap-2">
        <Brain className="w-5 h-5 text-indigo-500" /> বিদ্যুৎ সচেতনতা কুইজ
      </h3>
      
      {!showResult ? (
        <div className="space-y-4 animate-in fade-in duration-500">
          <p className="text-gray-200 font-medium">{quizQuestions[currentQuestion].question}</p>
          <div className="space-y-2">
            {quizQuestions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                className={`w-full p-3 rounded-lg text-left transition ${
                  selectedOption === index 
                    ? index === quizQuestions[currentQuestion].correctAnswer ? 'bg-green-900/50 border border-green-500' : 'bg-red-900/50 border border-red-500'
                    : 'bg-[#1A1A1A] hover:bg-[#252525] border border-gray-700'
                }`}
                disabled={selectedOption !== null}
              >
                {option}
              </button>
            ))}
          </div>
          {selectedOption !== null && (
            <button onClick={nextQuestion} className="w-full bg-indigo-600 p-2 rounded-lg text-white font-bold">
              পরবর্তী প্রশ্ন
            </button>
          )}
        </div>
      ) : (
        <div className="text-center space-y-4 animate-in zoom-in duration-500">
          <p className="text-white">আপনার স্কোর: {score} / {quizQuestions.length}</p>
          <button onClick={resetQuiz} className="flex items-center gap-2 bg-indigo-600 mx-auto px-4 py-2 rounded-lg text-white font-bold">
            <RefreshCw className="w-4 h-4" /> আবার খেলুন
          </button>
        </div>
      )}
    </div>
  );
}
