import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Clock, Coins, CheckCircle, X, Lightbulb, ArrowRight } from "lucide-react";

const EnhancedQuizCard = ({ learnerProfile, currentConcept }) => {
  const [quiz, setQuiz] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [tutorHelp, setTutorHelp] = useState(null);
  const [showTutorHelp, setShowTutorHelp] = useState(false);
  
  // Generate personalized quiz based on learner profile
  useEffect(() => {
    generatePersonalizedQuiz();
  }, [learnerProfile, currentConcept]);

  const generatePersonalizedQuiz = async () => {
    // This would call your AI service
    const personalizedQuiz = await generateQuizForLearner(learnerProfile, currentConcept);
    setQuiz(personalizedQuiz);
  };

  const handleAnswer = (answerIndex) => {
    setSelectedAnswer(answerIndex);
    setIsAnswered(true);
    setShowExplanation(true);
    
    // Track this interaction for AI learning
    recordLearnerInteraction({
      learnerId: learnerProfile.id,
      conceptId: currentConcept,
      questionId: quiz.id,
      selectedAnswer: answerIndex,
      correct: answerIndex === quiz.correctAnswer,
      timeSpent: Date.now() - quiz.startTime
    });
  };

  const requestTutorHelp = async () => {
    const help = await getTutorExplanation(
      learnerProfile,
      quiz.question,
      quiz.options[selectedAnswer],
      quiz.correctAnswer
    );
    setTutorHelp(help);
    setShowTutorHelp(true);
  };

  const getNextRecommendation = () => {
    if (selectedAnswer === quiz.correctAnswer) {
      return quiz.nextConcepts?.advanced || "Great! Ready for the next challenge?";
    } else {
      return quiz.nextConcepts?.remedial || "Let's review this concept with a different approach.";
    }
  };

  if (!quiz) {
    return (
      <Card className="max-w-2xl mx-auto border-2 border-orange-100">
        <CardContent className="p-8 text-center">
          <Brain className="h-12 w-12 text-orange-600 mx-auto mb-4 animate-pulse" />
          <p>Master Shifu is preparing a personalized quiz for you...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto border-2 border-orange-100">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-orange-600" />
            <CardTitle className="text-xl">
              {quiz.title || "Personalized Challenge"}
            </CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              <Coins className="h-3 w-3 mr-1" />
              {quiz.reward}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{quiz.estimatedTime}</span>
          </div>
          <Badge variant="outline">{quiz.difficulty}</Badge>
          <Badge variant="outline">{learnerProfile.selectedJourney}</Badge>
        </div>

        {/* AI Personalization Indicator */}
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="flex items-center space-x-2 text-sm">
            <Brain className="h-4 w-4 text-blue-600" />
            <span className="text-blue-700 font-medium">
              This quiz is tailored for your {learnerProfile.experienceLevel} level in {currentConcept}
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium leading-relaxed">{quiz.question}</h3>
          
          {/* Context for Bhutanese learners */}
          {quiz.bhutaneseContext && (
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <p className="text-sm text-green-700">
                <strong>🏔️ Bhutanese Context:</strong> {quiz.bhutaneseContext}
              </p>
            </div>
          )}
          
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
                    {isAnswered && index === quiz.correctAnswer ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : isAnswered && index === selectedAnswer && index !== quiz.correctAnswer ? (
                      <X className="h-4 w-4" />
                    ) : (
                      String.fromCharCode(65 + index)
                    )}
                  </div>
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* AI-Generated Explanation */}
        {isAnswered && showExplanation && (
          <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-2">
              <Brain className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <div className="font-medium text-blue-700 mb-2">Master Shifu explains:</div>
                <p className="text-blue-800 leading-relaxed">{quiz.explanation}</p>
                
                {/* Personalized next steps */}
                <div className="mt-3 p-3 bg-white rounded border border-blue-200">
                  <div className="font-medium text-blue-700 mb-1">What's next for you:</div>
                  <p className="text-sm text-blue-600">{getNextRecommendation()}</p>
                </div>
              </div>
            </div>
            
            {/* Tutor Help Button */}
            {selectedAnswer !== quiz.correctAnswer && (
              <div className="flex justify-between items-center">
                <Button 
                  variant="outline" 
                  onClick={requestTutorHelp}
                  className="text-blue-600 border-blue-600 hover:bg-blue-50"
                >
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Ask Master Shifu for more help
                </Button>
                
                {selectedAnswer === quiz.correctAnswer && (
                  <div className="flex items-center space-x-2 text-green-600 font-medium">
                    <Coins className="h-4 w-4" />
                    <span>Excellent! You earned {quiz.reward}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* AI Tutor Additional Help */}
        {showTutorHelp && tutorHelp && (
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-start space-x-2">
              <div className="text-2xl">🧙‍♂️</div>
              <div className="flex-1">
                <div className="font-medium text-purple-700 mb-2">Additional Guidance:</div>
                <p className="text-purple-800 leading-relaxed mb-3">{tutorHelp.explanation}</p>
                
                {tutorHelp.analogies && (
                  <div className="bg-white p-3 rounded border border-purple-200">
                    <div className="font-medium text-purple-700 mb-1">Think of it this way:</div>
                    <p className="text-sm text-purple-600">{tutorHelp.analogies}</p>
                  </div>
                )}
                
                {tutorHelp.practiceSteps && (
                  <div className="mt-3">
                    <div className="font-medium text-purple-700 mb-2">Try this step by step:</div>
                    <ol className="text-sm text-purple-600 space-y-1">
                      {tutorHelp.practiceSteps.map((step, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="font-medium">{index + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {!isAnswered && (
          <p className="text-sm text-gray-500 text-center">
            💡 This question is customized based on your learning journey and experience level
          </p>
        )}

        {/* Progress to next content */}
        {isAnswered && (
          <div className="flex justify-center pt-4">
            <Button 
              className="bg-orange-600 hover:bg-orange-700"
              onClick={() => {
                // Navigate to next recommended content
                if (selectedAnswer === quiz.correctAnswer) {
                  // Move to next advanced concept
                } else {
                  // Provide remedial content
                }
              }}
            >
              Continue Learning
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Helper functions (you'd implement these with your AI service)
const generateQuizForLearner = async (learnerProfile, concept) => {
  // Call your AI tutor service
  return {
    id: 'quiz-1',
    title: 'Understanding Blockchain Security',
    question: "In the context of Bhutan's National Digital Identity system, what makes blockchain technology secure and trustworthy for storing citizen credentials?",
    options: [
      "It's stored on a single powerful government computer",
      "Each transaction is verified by multiple participants in the network",
      "It uses complex passwords that cannot be broken",
      "It's managed exclusively by government institutions"
    ],
    correctAnswer: 1,
    explanation: `Excellent! You understand that blockchain security comes from decentralization. Just like how Bhutan's NDI system uses multiple verification points, blockchain networks rely on many participants (nodes) to verify each transaction. This makes it nearly impossible to falsify records because you'd need to fool the majority of the network simultaneously.

This is particularly relevant to Bhutan's approach to digital identity, where the distributed nature ensures no single point of failure while maintaining the sovereignty that aligns with Bhutanese values.`,
    bhutaneseContext: "Bhutan's National Digital Identity system actually uses blockchain technology, making this a real-world example you can relate to!",
    reward: "150 EDU",
    difficulty: learnerProfile.experienceLevel,
    estimatedTime: "3 min",
    nextConcepts: {
      advanced: "Ready to explore how smart contracts work in government applications?",
      remedial: "Let's review the basics of decentralization with a simpler example first."
    },
    startTime: Date.now()
  };
};

const getTutorExplanation = async (learnerProfile, question, selectedAnswer, correctAnswer) => {
  // Call AI service for additional explanation
  return {
    explanation: "I understand this concept can be tricky! Let me explain it differently using something more familiar.",
    analogies: "Think of blockchain like Bhutan's traditional village consensus system - decisions aren't made by one person, but require agreement from the community. Similarly, blockchain requires consensus from multiple computers.",
    practiceSteps: [
      "Imagine you want to record a land ownership in your village",
      "In traditional systems, one office keeps the record (centralized)",
      "In blockchain, every village elder keeps a copy and they must all agree (decentralized)",
      "This makes it much harder for anyone to falsify the record"
    ]
  };
};

const recordLearnerInteraction = (interaction) => {
  // Record this for improving AI recommendations
  console.log('Recording interaction:', interaction);
};

export default EnhancedQuizCard;