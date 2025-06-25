import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, CheckCircle, Play, Brain, MessageSquare, Lightbulb, Send, BookOpen, Video, Target, Sparkles } from "lucide-react";
import { Mission, Journey } from "@/data/journeyData";
import { claudeApiService } from "@/services/claudeApi";
import { NDIUser } from "@/types/ndi";

interface TutorMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface MissionViewProps {
  mission: Mission;
  journey: Journey;
  missionNumber: number;
  user?: NDIUser; // Use your existing NDI user type
  onBack: () => void;
  onComplete: (missionId: string) => void;
}

const MissionView: React.FC<MissionViewProps> = ({ 
  mission, 
  journey, 
  missionNumber, 
  user,
  onBack, 
  onComplete 
}) => {
  const [showTutor, setShowTutor] = useState(false);
  const [tutorMessages, setTutorMessages] = useState<TutorMessage[]>([]);
  const [userQuestion, setUserQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPersonalizedContent, setShowPersonalizedContent] = useState(false);
  const [missionInsights, setMissionInsights] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with mission-specific insights when component loads
  useEffect(() => {
    if (user) {
      loadMissionInsights();
    }
  }, [mission, user]);

  // Initialize with a welcome message when tutor is first opened
  useEffect(() => {
    if (showTutor && tutorMessages.length === 0 && user) {
      initializeTutorChat();
    }
  }, [showTutor, mission, user]);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [tutorMessages]);

  const loadMissionInsights = async () => {
    if (!user) return;
    
    try {
      const insights = await claudeApiService.generateMissionContent(mission, user, journey);
      setMissionInsights(insights);
    } catch (error) {
      console.error('Error loading mission insights:', error);
    }
  };

  const initializeTutorChat = async () => {
    if (!user) return;

    try {
      const welcomeMessage = await claudeApiService.explainConcept(
        `Mission: ${mission.title} - ${mission.description}`,
        user,
        journey
      );
      
      setTutorMessages([{
        role: 'assistant',
        content: welcomeMessage,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Error initializing tutor:', error);
      setTutorMessages([{
        role: 'assistant',
        content: `🙏 Namaste ${user.fullName}! I'm Master Shifu, here to guide you through "${mission.title}". This mission is part of your ${journey.title} journey. Feel free to ask me anything about the concepts, request examples relevant to Bhutan, or get study tips!`,
        timestamp: new Date()
      }]);
    }
  };

  const askTutor = async () => {
    if (!userQuestion.trim() || isLoading || !user) return;
    
    const newUserMessage: TutorMessage = {
      role: 'user',
      content: userQuestion,
      timestamp: new Date()
    };
    
    const updatedMessages = [...tutorMessages, newUserMessage];
    setTutorMessages(updatedMessages);
    setUserQuestion('');
    setIsLoading(true);

    try {
      // Convert to Claude message format
      const claudeMessages = updatedMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await claudeApiService.sendMessage(
        claudeMessages,
        user,
        journey,
        mission
      );
      
      const aiMessage: TutorMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      
      setTutorMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI Tutor error:', error);
      const errorMessage: TutorMessage = {
        role: 'assistant',
        content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment, or feel free to continue with the mission content above. Your learning journey is important, and I'm here to help when the connection is restored! 🙏",
        timestamp: new Date()
      };
      setTutorMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMissionComplete = async () => {
    if (!user) {
      onComplete(mission.id);
      return;
    }

    try {
      // Get celebration message from Claude
      const celebration = await claudeApiService.celebrateCompletion(mission, user, journey);
      
      // Show celebration message
      setTutorMessages(prev => [...prev, {
        role: 'assistant',
        content: celebration,
        timestamp: new Date()
      }]);
      
      // Complete the mission
      onComplete(mission.id);
    } catch (error) {
      console.error('Error celebrating completion:', error);
      onComplete(mission.id);
    }
  };

  const formatContent = (content: string) => {
    return content.split('\n').map((line, index) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <h3 key={index} className="font-bold text-lg mt-4 mb-2 text-gray-800">{line.slice(2, -2)}</h3>;
      }
      if (line.startsWith('- ')) {
        return <li key={index} className="ml-4 mb-1 text-gray-700">{line.slice(2)}</li>;
      }
      if (line.trim() === '') {
        return <br key={index} />;
      }
      return <p key={index} className="mb-2 leading-relaxed text-gray-700">{line}</p>;
    });
  };

  const getPersonalizedContent = () => {
    if (!user || !missionInsights) return mission.content;
    
    return `${missionInsights}\n\n---\n\n${mission.content}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Navigation */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={onBack} className="flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to {journey.title}</span>
        </Button>
        <div className="flex items-center space-x-2">
          <journey.icon className={`h-5 w-5 ${journey.color}`} />
          <span className="text-gray-600">{journey.title}</span>
        </div>
      </div>

      {/* Mission Content */}
      <Card className="border-2 border-orange-100">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                mission.completed ? 'bg-green-500' : 'bg-orange-500'
              }`}>
                {mission.completed ? <CheckCircle className="h-5 w-5" /> : `M${missionNumber}`}
              </div>
              <div>
                <CardTitle className="text-2xl">{mission.title}</CardTitle>
                <p className="text-gray-600 mt-1">{mission.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{mission.duration}</span>
              </Badge>
              {user && missionInsights && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPersonalizedContent(!showPersonalizedContent)}
                  className="text-purple-600 border-purple-600 hover:bg-purple-50"
                >
                  <Sparkles className="h-4 w-4 mr-1" />
                  {showPersonalizedContent ? 'Original' : 'AI Insights'}
                </Button>
              )}
            </div>
          </div>

          {/* User Profile Indicator */}
          {user && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 text-sm">
                <Brain className="h-4 w-4 text-blue-600" />
                <span className="text-blue-700 font-medium">
                  Personalized for {user.fullName} • {user.academicLevel} at {user.institution}
                </span>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Mission Content */}
          <div className="prose prose-gray max-w-none">
            {formatContent(showPersonalizedContent ? getPersonalizedContent() : mission.content)}
          </div>

          {/* Video Section */}
          {mission.videoUrl && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center space-x-2">
                <Video className="h-4 w-4" />
                <span>Video Lesson</span>
              </h4>
              <Button variant="outline" className="flex items-center space-x-2">
                <Play className="h-4 w-4" />
                <span>Watch Video</span>
              </Button>
            </div>
          )}

          {/* Exercises Section */}
          {mission.exercises && mission.exercises.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium mb-3 flex items-center space-x-2">
                <Target className="h-4 w-4" />
                <span>Practice Exercises</span>
              </h4>
              <ul className="space-y-2">
                {mission.exercises.map((exercise, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="font-medium text-blue-600">{index + 1}.</span>
                    <span>{exercise}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Mission Completion */}
          <div className="flex items-center justify-between pt-6 border-t">
            <div className="flex items-center space-x-2">
              {mission.completed ? (
                <Badge className="bg-green-100 text-green-800">Mission Completed</Badge>
              ) : (
                <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
              )}
            </div>
            
            {!mission.completed && (
              <Button 
                onClick={handleMissionComplete}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Mark as Complete
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Master Shifu AI Tutor Section */}
      <Card className="border-2 border-blue-100">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-xl">Master Shifu - Your AI Guide</CardTitle>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">Claude AI</Badge>
            </div>
            <Button 
              variant="outline"
              onClick={() => setShowTutor(!showTutor)}
              className="flex items-center space-x-2"
            >
              <MessageSquare className="h-4 w-4" />
              <span>{showTutor ? 'Hide Guide' : 'Ask Master Shifu'}</span>
            </Button>
          </div>
          
          {!showTutor && (
            <p className="text-sm text-gray-600">
              Get personalized guidance, Bhutanese examples, and wisdom from Master Shifu
            </p>
          )}
        </CardHeader>
        
        {showTutor && (
          <CardContent className="space-y-4">
            {/* Chat Interface */}
            <div className="border rounded-lg bg-white">
              <div className="h-80 overflow-y-auto p-4 space-y-4">
                {tutorMessages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-lg ${
                      msg.role === 'user' 
                        ? 'bg-orange-500 text-white' 
                        : 'bg-blue-50 text-gray-800 border border-blue-200'
                    }`}>
                      {msg.role === 'assistant' && (
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-lg">🧙‍♂️</span>
                          <span className="font-medium text-blue-700">Master Shifu</span>
                        </div>
                      )}
                      
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                      
                      <div className="text-xs opacity-70 mt-2">
                        {msg.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">🧙‍♂️</span>
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
              
              {/* Input Area */}
              <div className="border-t p-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={userQuestion}
                    onChange={(e) => setUserQuestion(e.target.value)}
                    placeholder="Ask Master Shifu about concepts, examples, or guidance..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && askTutor()}
                    disabled={isLoading || !user}
                  />
                  <Button 
                    onClick={askTutor} 
                    disabled={!userQuestion.trim() || isLoading || !user}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
                  <Lightbulb className="h-3 w-3" />
                  <span>Master Shifu provides guidance using Claude AI, with knowledge of Bhutanese culture and Web3</span>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default MissionView;