
// src/components/MasterShifuChat.tsx - Enhanced with visual journey selection and YouTube integration
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Send, Sparkles, ExternalLink, Award, BookOpen, Play, Pause } from "lucide-react";
import { Journey } from "@/data/journeyData";
import { NDIUser } from "@/types/ndi";
import { claudeApiService } from "@/services/claudeApi";

interface Message {
  id: string;
  content: string;
  sender: 'shifu' | 'user';
  timestamp: Date;
  type: 'text' | 'journey-selection' | 'video-lesson' | 'credential-earned';
  metadata?: any;
}

interface MasterShifuChatProps {
  user: NDIUser;
  journeys: Journey[];
  selectedJourney?: Journey;
  onJourneySelect: (journeyId: string) => void;
  onMissionStart: (missionId: string) => void;
  onCredentialEarned: (credential: any) => void;
}

const MasterShifuChat: React.FC<MasterShifuChatProps> = ({
  user,
  journeys,
  selectedJourney,
  onJourneySelect,
  onMissionStart,
  onCredentialEarned
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // YouTube video mapping for each journey
  const journeyVideos = {
    'community-builder': 'dQw4w9WgXcQ', // Replace with actual Blockvocates video IDs
    'digital-trader': 'dQw4w9WgXcQ',
    'creative-designer': 'dQw4w9WgXcQ',
    'visionary-founder': 'dQw4w9WgXcQ',
    'music-pioneer': 'dQw4w9WgXcQ',
    'future-developer': 'dQw4w9WgXcQ'
  };

  useEffect(() => {
    initializeChat();
  }, [user]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const initializeChat = async () => {
    const welcomeMessage: Message = {
      id: '1',
      content: `🙏 Namaste ${user.fullName}! I am Master Shifu, your AI guide on this Web3 learning adventure.

${user.verificationStatus === 'guest' ? 
  `Welcome, traveler! You're exploring as a guest - your journey will be just as magical, though signing in with NDI would let you earn verified credentials and save your progress.` : 
  `I see you're from ${user.institution || 'Bhutan'} - how exciting! You're about to become part of the Web3 revolution.`
}

Before we begin your personalized journey, I highly recommend checking out this guide: https://x.com/blockvocates/status/1800453480739660033

Ready to choose your destiny? Each journey will unlock unique skills through immersive video lessons and interactive learning! 🚀`,
      sender: 'shifu',
      timestamp: new Date(),
      type: 'text'
    };

    if (!selectedJourney) {
      const journeySelectionMessage: Message = {
        id: '2',
        content: 'Choose your Web3 adventure by selecting one of these visual journeys:',
        sender: 'shifu',
        timestamp: new Date(),
        type: 'journey-selection',
        metadata: { journeys }
      };
      setMessages([welcomeMessage, journeySelectionMessage]);
    } else {
      setMessages([welcomeMessage]);
      await handleJourneyAlreadySelected();
    }
  };

  const handleJourneyAlreadySelected = async () => {
    if (!selectedJourney) return;

    setIsTyping(true);
    try {
      const response = await claudeApiService.sendMessage(
        [{ role: 'user', content: `I've selected ${selectedJourney.title}. Show me the video lessons.` }],
        user,
        selectedJourney
      );

      const videoMessage: Message = {
        id: Date.now().toString(),
        content: response,
        sender: 'shifu',
        timestamp: new Date(),
        type: 'video-lesson',
        metadata: { 
          journey: selectedJourney,
          videoId: journeyVideos[selectedJourney.id as keyof typeof journeyVideos]
        }
      };

      setMessages(prev => [...prev, videoMessage]);
    } catch (error) {
      console.error('Error getting journey content:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleJourneyChoice = async (journey: Journey) => {
    onJourneySelect(journey.id);

    const userMessage: Message = {
      id: Date.now().toString(),
      content: `I choose: ${journey.title}`,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setConversationHistory(prev => [...prev, { role: 'user', content: `I choose: ${journey.title}` }]);

    setIsTyping(true);
    try {
      const response = await claudeApiService.sendMessage(
        [...conversationHistory, { role: 'user', content: `I choose: ${journey.title}. Show me video lessons.` }],
        user,
        journey
      );

      const videoResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: 'shifu',
        timestamp: new Date(),
        type: 'video-lesson',
        metadata: { 
          journey,
          videoId: journeyVideos[journey.id as keyof typeof journeyVideos]
        }
      };

      setMessages(prev => [...prev, videoResponse]);
      setConversationHistory(prev => [...prev, { role: 'assistant', content: response }]);
      setCurrentVideoId(journeyVideos[journey.id as keyof typeof journeyVideos]);
    } catch (error) {
      console.error('Error getting journey response:', error);
      const fallbackResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: `Excellent choice! ${journey.title} is perfect for you. Let's start with your first video lesson!`,
        sender: 'shifu',
        timestamp: new Date(),
        type: 'video-lesson',
        metadata: { 
          journey,
          videoId: journeyVideos[journey.id as keyof typeof journeyVideos]
        }
      };
      setMessages(prev => [...prev, fallbackResponse]);
      setCurrentVideoId(journeyVideos[journey.id as keyof typeof journeyVideos]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    const newConversationHistory = [...conversationHistory, { role: 'user' as const, content: inputValue }];
    setConversationHistory(newConversationHistory);
    
    const currentInput = inputValue;
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await claudeApiService.sendMessage(
        newConversationHistory,
        user,
        selectedJourney
      );

      const shifuResponse: Message = {
        id: Date.now().toString(),
        content: response,
        sender: 'shifu',
        timestamp: new Date(),
        type: 'text'
      };

      setMessages(prev => [...prev, shifuResponse]);
      setConversationHistory(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorResponse: Message = {
        id: Date.now().toString(),
        content: "I'm having trouble connecting right now. Please try again in a moment! 🙏",
        sender: 'shifu',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderMessage = (message: Message) => {
    if (message.type === 'journey-selection') {
      return (
        <div className="space-y-4">
          <p className="text-gray-700">{message.content}</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {journeys.map((journey) => (
              <Card 
                key={journey.id}
                className="cursor-pointer border-2 hover:border-orange-300 transition-all duration-200 hover:shadow-lg group"
                onClick={() => handleJourneyChoice(journey)}
              >
                <CardContent className="p-4 text-center">
                  <div className="relative mb-3">
                    <div className={`h-20 w-20 mx-auto rounded-lg bg-gradient-to-br ${
                      journey.id === 'community-builder' ? 'from-blue-400 to-blue-600' :
                      journey.id === 'digital-trader' ? 'from-green-400 to-green-600' :
                      journey.id === 'creative-designer' ? 'from-purple-400 to-purple-600' :
                      journey.id === 'visionary-founder' ? 'from-orange-400 to-orange-600' :
                      journey.id === 'music-pioneer' ? 'from-pink-400 to-pink-600' :
                      'from-indigo-400 to-indigo-600'
                    } flex items-center justify-center group-hover:scale-105 transition-transform`}>
                      <journey.icon className="h-10 w-10 text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-red-500 text-white rounded-full p-1">
                      <Play className="h-3 w-3" />
                    </div>
                  </div>
                  <h3 className="font-bold text-sm mb-2">{journey.title}</h3>
                  <p className="text-xs text-gray-600 mb-2">{journey.description}</p>
                  <Badge variant={
                    journey.difficulty === 'Beginner' ? 'secondary' :
                    journey.difficulty === 'Intermediate' ? 'default' : 'destructive'
                  } className="text-xs">
                    {journey.difficulty}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center">
            <a 
              href="https://x.com/blockvocates/status/1800453480739660033" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-orange-600 hover:text-orange-700 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Need help choosing? Read our journey guide!</span>
            </a>
          </div>
        </div>
      );
    }

    if (message.type === 'video-lesson' && message.metadata?.videoId) {
      return (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <BookOpen className="h-5 w-5 text-orange-600" />
              <h4 className="font-bold text-orange-800">
                {message.metadata.journey?.title} - Video Lesson
              </h4>
            </div>
            <div className="relative">
              <iframe
                width="100%"
                height="240"
                src={`https://www.youtube.com/embed/${message.metadata.videoId}?enablejsapi=1`}
                title="Web3 Learning Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-lg"
              ></iframe>
            </div>
            <p className="text-sm text-gray-600 mt-3">
              📹 Watch the video above and ask me any questions below! I'm here to help clarify concepts and guide your learning.
            </p>
          </div>
          <p className="text-gray-700 whitespace-pre-wrap">{message.content}</p>
        </div>
      );
    }

    if (message.type === 'credential-earned') {
      return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Award className="h-5 w-5 text-green-600" />
            <h4 className="font-bold text-green-800">Credential Earned!</h4>
          </div>
          <p className="text-gray-700 whitespace-pre-wrap">{message.content}</p>
        </div>
      );
    }

    return (
      <p className="text-gray-700 whitespace-pre-wrap">{message.content}</p>
    );
  };

  return (
    <Card className="h-[700px] flex flex-col border-2 border-orange-100">
      <CardHeader className="border-b border-orange-100">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src="/shifu-avatar.png" alt="Master Shifu" />
            <AvatarFallback>🥋</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-xl">Master Shifu</CardTitle>
            <p className="text-sm text-gray-600">Your AI Web3 Learning Guide</p>
          </div>
          {selectedJourney && (
            <Badge className="ml-auto bg-orange-100 text-orange-800">
              {selectedJourney.title}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[90%] ${
                  message.sender === 'user'
                    ? 'bg-orange-500 text-white rounded-lg p-3'
                    : 'bg-gray-50 rounded-lg p-3'
                }`}>
                  {renderMessage(message)}
                  <div className="text-xs opacity-75 mt-2">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-50 rounded-lg p-3 max-w-[80%]">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-4 w-4 text-orange-500 animate-pulse" />
                    <span className="text-gray-600">Master Shifu is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="border-t border-gray-200 p-4">
          <div className="flex space-x-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={currentVideoId ? "Ask me about the video or any Web3 concept..." : "Ask Master Shifu anything about Web3..."}
              className="flex-1"
              disabled={isTyping}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          {currentVideoId && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              💡 Watching a video? Ask me questions about what you're learning!
            </p>
          )}
          
          {!selectedJourney && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              Choose your visual journey above to start your personalized video learning experience!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MasterShifuChat;
