// src/components/MasterShifuChat.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Send, Sparkles, ExternalLink, Award, BookOpen } from "lucide-react";
import { Journey } from "@/data/journeyData";
import { NDIUser } from "@/types/ndi";
import { claudeApiService } from "@/services/claudeApi";

interface Message {
  id: string;
  content: string;
  sender: 'shifu' | 'user';
  timestamp: Date;
  type: 'text' | 'journey-selection' | 'lesson' | 'credential-earned';
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
  const scrollAreaRef = useRef<HTMLDivElement>(null);

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

I see you're from ${user.institution} - how exciting! Bhutan is leading the world in digital innovation with NDI, and now you're about to become part of the Web3 revolution.

Before we begin your personalized journey, I highly recommend checking out this guide to help you pick the perfect path: https://x.com/blockvocates/status/1800453480739660033

Ready to choose your destiny? Each journey will unlock unique skills and exciting opportunities! 🚀`,
      sender: 'shifu',
      timestamp: new Date(),
      type: 'text'
    };

    if (!selectedJourney) {
      const journeySelectionMessage: Message = {
        id: '2',
        content: 'Choose your Web3 adventure:',
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
        [{ role: 'user', content: `I've already selected ${selectedJourney.title}. What should I do next?` }],
        user,
        selectedJourney
      );

      const shifuMessage: Message = {
        id: Date.now().toString(),
        content: response,
        sender: 'shifu',
        timestamp: new Date(),
        type: 'text'
      };

      setMessages(prev => [...prev, shifuMessage]);
    } catch (error) {
      console.error('Error getting journey continuation:', error);
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
        [...conversationHistory, { role: 'user', content: `I choose: ${journey.title}` }],
        user,
        journey
      );

      const shifuResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: 'shifu',
        timestamp: new Date(),
        type: 'text'
      };

      setMessages(prev => [...prev, shifuResponse]);
      setConversationHistory(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('Error getting journey response:', error);
      const fallbackResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: `Excellent choice! ${journey.title} is perfect for you. Let's start your first mission when you're ready!`,
        sender: 'shifu',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, fallbackResponse]);
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
      // Check for special commands
      if (currentInput.toLowerCase().includes('start mission') && selectedJourney) {
        const nextMission = selectedJourney.missions.find(m => !m.completed);
        if (nextMission) {
          onMissionStart(nextMission.id);
          const response = await claudeApiService.generateMissionContent(nextMission, user, selectedJourney);
          
          const shifuResponse: Message = {
            id: Date.now().toString(),
            content: response,
            sender: 'shifu',
            timestamp: new Date(),
            type: 'lesson',
            metadata: { mission: nextMission }
          };
          
          setMessages(prev => [...prev, shifuResponse]);
          setConversationHistory(prev => [...prev, { role: 'assistant', content: response }]);
          return;
        }
      }

      // Regular conversation with Claude
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {journeys.map((journey) => (
              <Card 
                key={journey.id}
                className="cursor-pointer border-2 hover:border-orange-300 transition-all duration-200 hover:shadow-lg"
                onClick={() => handleJourneyChoice(journey)}
              >
                <CardContent className="p-4 text-center">
                  <journey.icon className={`h-12 w-12 mx-auto mb-3 ${journey.color}`} />
                  <h3 className="font-bold text-lg mb-2">{journey.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{journey.description}</p>
                  <Badge variant={
                    journey.difficulty === 'Beginner' ? 'secondary' :
                    journey.difficulty === 'Intermediate' ? 'default' : 'destructive'
                  }>
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

    if (message.type === 'lesson' && message.metadata?.mission) {
      return (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <h4 className="font-bold text-blue-800">Mission: {message.metadata.mission.title}</h4>
            </div>
            <p className="text-sm text-blue-700 mb-3">{message.metadata.mission.description}</p>
            <Badge variant="outline" className="text-blue-600 border-blue-300">
              Duration: {message.metadata.mission.duration}
            </Badge>
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
    <Card className="h-[600px] flex flex-col border-2 border-orange-100">
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
                <div className={`max-w-[80%] ${
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
              placeholder="Ask Master Shifu anything about Web3..."
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
          
          {!selectedJourney && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              Choose your journey above to start your personalized learning experience!
            </p>
          )}
          
          {selectedJourney && (
            <div className="flex justify-center mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInputValue('start mission')}
                className="text-orange-600 border-orange-300 hover:bg-orange-50"
              >
                Start Next Mission
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MasterShifuChat;