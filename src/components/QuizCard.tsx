
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Clock, Coins } from "lucide-react";
import { useState } from "react";

const QuizCard = () => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const quiz = {
    question: "What makes blockchain technology secure and trustworthy?",
    options: [
      "It's stored on a single powerful computer",
      "Each transaction is verified by multiple participants in the network",
      "It uses complex passwords that cannot be broken",
      "It's managed by government institutions"
    ],
    correctAnswer: 1,
    explanation: "Blockchain security comes from its decentralized nature - multiple participants (nodes) verify each transaction, making it nearly impossible to falsify records.",
    reward: "100 EDU"
  };

  const handleAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    setIsAnswered(true);
  };

  return (
    <Card className="max-w-2xl mx-auto border-2 border-orange-100">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-orange-600" />
            <CardTitle className="text-xl">Daily Challenge</CardTitle>
          </div>
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Coins className="h-3 w-3 mr-1" />
            {quiz.reward}
          </Badge>
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>2 min</span>
          </div>
          <Badge variant="outline">Blockchain Basics</Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium leading-relaxed">{quiz.question}</h3>
          
          <div className="space-y-3">
            {quiz.options.map((option, index) => (
              <button
                key={index}
                onClick={() => !isAnswered && handleAnswer(index)}
                disabled={isAnswered}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                  isAnswered
                    ? index === quiz.correctAnswer
                      ? 'border-green-500 bg-green-50 text-green-800'
                      : index === selectedAnswer && index !== quiz.correctAnswer
                      ? 'border-red-500 bg-red-50 text-red-800'
                      : 'border-gray-200 bg-gray-50 text-gray-600'
                    : selectedAnswer === index
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-orange-300 hover:bg-orange-25'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                    isAnswered && index === quiz.correctAnswer
                      ? 'border-green-500 bg-green-500 text-white'
                      : isAnswered && index === selectedAnswer && index !== quiz.correctAnswer
                      ? 'border-red-500 bg-red-500 text-white'
                      : selectedAnswer === index
                      ? 'border-orange-500 bg-orange-500 text-white'
                      : 'border-gray-300'
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {isAnswered && (
          <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-2">
              <div className="text-blue-600 font-medium">Explanation:</div>
            </div>
            <p className="text-blue-800 leading-relaxed">{quiz.explanation}</p>
            
            {selectedAnswer === quiz.correctAnswer && (
              <div className="flex items-center space-x-2 text-green-600 font-medium">
                <Coins className="h-4 w-4" />
                <span>Congratulations! You earned {quiz.reward}</span>
              </div>
            )}
          </div>
        )}
        
        {!isAnswered && (
          <p className="text-sm text-gray-500 text-center">
            Select an answer to unlock the explanation and earn rewards
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default QuizCard;
