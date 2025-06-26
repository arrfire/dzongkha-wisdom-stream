// src/components/EnhancedMasterShifuChat.tsx - Fixed import for enhancedLearnerProfileService
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Send, Sparkles, ExternalLink, Award, BookOpen, Play, Pause,
  Globe, CheckCircle, Clock, Star, Trophy, Target
} from "lucide-react";
import { Journey } from "@/data/journeyData";
import { NDIUser } from "@/types/ndi";
import { enhancedClaudeApiService } from "@/services/enhancedClaudeApiService";
import { LearnerProfile } from "@/types/learnerProfile";
// Corrected import: import the specific instance and alias it
import { enhancedLearnerProfileServiceInstance as enhancedLearnerProfileService } from "@/services/enhancedLearnerProfileService";

interface Message {
  id: string;
  content: string;
  sender: 'shifu' | 'user';
  timestamp: Date;
  type: 'text' | 'journey-selection' | 'video-lesson' | 'credential-earned' | 'mission-progress' | 'language-selection';
  metadata?: any;
  videoTranscript?: string;
}

interface MasterShifuChatProps {
  user: NDIUser;
  journeys: Journey[];
  selectedJourney?: Journey;
  learnerProfile?: LearnerProfile;
  onJourneySelect: (journeyId: string) => void;
  onMissionStart: (missionId: string) => void;
  onMissionComplete: (missionId: string, timeSpent: number) => void;
  onCredentialEarned: (credential: any) => void;
  onProfileUpdate: (profile: LearnerProfile) => void;
}

// Blockvocates video mapping with transcripts
const blockvocatesVideos = {
  intro: {
    youtubeId: 'dKYncXmM8P4',
    title: 'Intro to Blockvocates',
    transcript: `hi everyone welcome to blog for kids what is block for Kates well block for Kates stands for blockchain Advocates and it started as a way for me to bring my friends acquaintances and so many people who have asked me this question what is crypto what is web3 what is blockchain I wanted to create a structured community...`,
    duration: '8:30'
  },
  'create-identity-1': {
    youtubeId: 'o7bq7oEuSgU',
    title: 'Create your Identity - Part 1',
    transcript: `hi everyone welcome to Mission one of blog for kids and this mission is called create your identity and if you successfully complete this Mission there's 6,000 voet tokens waiting for you as a reward...`,
    duration: '12:45'
  },
  'create-identity-2': {
    youtubeId: 'X5ygRVEQDtU',
    title: 'Create your Identity - Part 2',
    transcript: `continuation of mission one we're going to look at the steps in detail and I'm going to do this on my phone you can do this on a laptop also...`,
    duration: '15:20'
  },
  'read-write-own': {
    youtubeId: 'bNd0UOE2l_U',
    title: 'Read, Write, Own',
    transcript: `all right everyone so you've made it P mission one and now you're here ad mission to congratulations this mission is called read right own...`,
    duration: '10:15'
  },
  'crypto-trader-mission-3': {
    youtubeId: 'V3lJD2Z3z0s',
    title: 'Crypto Traders - Trade Crypto on CEX (Binance) DEX (Aerodrome)',
    transcript: `all right hi everyone welcome to mission three of block Vates and this is mission three of the crypto Trader Journey so it's going to be the nitty-gritty...`,
    duration: '25:40'
  },
  'developer-mission-3-1': {
    youtubeId: '53QO6myTCo4',
    title: 'Developers - Understanding Web2 Programming, Introduction to Ethereum',
    transcript: `development before I'm not a professional developer by any means right so I'm going to be doing this on my own too...`,
    duration: '18:30'
  },
  'developer-mission-3-2': {
    youtubeId: 'v_Le-9NTWyU',
    title: 'Developers - Deploy your First Dapp!',
    transcript: `so guys all right so we just finished the introduction to solid it's pretty comprehensively covered...`,
    duration: '22:15'
  },
  'community-builder-mission-3': {
    youtubeId: 'VHA7x2OGxlU',
    title: 'Community Builder - Understanding Web3 Communities',
    transcript: `hello everyone and welcome to mission three of the community Builder journey in blo Vates...`,
    duration: '16:45'
  }
};

// Language translations
const translations = {
  en: {
    welcome: "🙏 Namaste {name}! I am Master Shifu, your AI guide on this Web3 learning adventure.",
    chooseLanguage: "Choose your preferred language:",
    languageSet: "Perfect! I'll guide you in English. Let's begin your Web3 journey!",
    guideLink: "Before we begin your personalized journey, I highly recommend checking out this guide:",
    journeySelection: "Which learning path calls to your heart?",
    missionProgress: "Mission Progress",
    credentialEarned: "🎉 Congratulations! You've earned a new credential!",
    videoLesson: "📹 Watch this video lesson and ask me questions below!",
    readyToStart: "Ready to start your first mission?",
    nextMission: "Ready for your next mission?",
    journeyComplete: "🎉 Congratulations! You've completed the {journey} journey!",
    watchVideo: "Watch Video Lesson",
    askQuestion: "Ask me anything about this lesson...",
    progressUpdate: "Great progress! You're {progress}% through your {journey} journey."
  },
  dz: {
    welcome: "🙏 བཀྲ་ཤིས་བདེ་ལེགས། {name}! ང་སློབ་དཔོན་ཤི་ཕུ་ཡིན། ཁྱེད་ཀྱི་ Web3 སློབ་སྦྱོང་གི་ལམ་སྟོན་པ།",
    chooseLanguage: "ཁྱེད་ཀྱི་སྐད་ཡིག་འདེམས་རོགས།",
    languageSet: "ལེགས་སོ! ང་རྫོང་ཁ་ནང་ལམ་སྟོན་འཕྲུལ་འཁོར། ཁྱེད་ཀྱི་ Web3 ལམ་བུ་འགོ་བཙུགས།",
    guideLink: "ང་ཚོའི་ལམ་སྟོན་འདི་ལ་བལྟ་རོགས:",
    journeySelection: "ཁྱེད་ཀྱིས་ག་ཅི་སློབ་འདོད།",
    missionProgress: "ལས་འགན་ཚད་ལེན།",
    credentialEarned: "🎉 བཀྲ་ཤིས་བདེ་ལེགས! ཁྱེད་ལ་ལག་ཁྱེར་གསར་པ་ཐོབ་སོང་།",
    videoLesson: "📹 འདི་ལ་བལྟ་ནས་དྲི་བ་གང་ཡང་དྲིས་ཆོག",
    readyToStart: "ཁྱེད་ཀྱི་དང་པོའི་ལས་འགན་འགོ་འཛུགས་རེད་པས།",
    nextMission: "ཤུལ་མའི་ལས་འགན་ལ་འགོ་འདྲེན་པ།",
    journeyComplete: "🎉 བཀྲ་ཤིས་བདེ་ལེགས! ཁྱེད་ཀྱིས་{journey} ལམ་བུ་མཐར་ཕྱིན་སོང་།",
    watchVideo: "འདིའི་ནང་བལྟ།",
    askQuestion: "སློབ་ཚན་འདིའི་སྐོར་དྲི་བ་གང་ཡང་དྲིས་ཆོག",
    progressUpdate: "ཡག་པོ་བྱུང་། ཁྱེད་ཀྱི་{journey} ལམ་བུའི་{progress}% འགྲུབ་སོང་།"
  }
};

const EnhancedMasterShifuChat: React.FC<MasterShifuChatProps> = ({
  user,
  journeys,
  selectedJourney,
  learnerProfile,
  onJourneySelect,
  onMissionStart,
  onMissionComplete,
  onCredentialEarned,
  onProfileUpdate
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'dz'>('en');
  const [showLanguageSelection, setShowLanguageSelection] = useState(true);
  const [currentMissionTime, setCurrentMissionTime] = useState<number>(0);
  const [missionStartTime, setMissionStartTime] = useState<Date | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const t = translations[selectedLanguage];

  useEffect(() => {
    if (!showLanguageSelection) {
      initializeChat();
    }
  }, [user, showLanguageSelection]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Track mission time
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (missionStartTime) {
      interval = setInterval(() => {
        setCurrentMissionTime(Date.now() - missionStartTime.getTime());
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [missionStartTime]);

  const initializeChat = async () => {
    if (showLanguageSelection) return;

    const welcomeMessage: Message = {
      id: '1',
      content: t.welcome.replace('{name}', user.fullName),
      sender: 'shifu',
      timestamp: new Date(),
      type: 'text'
    };

    const guideMessage: Message = {
      id: '2',
      content: `${t.guideLink} https://x.com/blockvocates/status/1800453480739660033`,
      sender: 'shifu',
      timestamp: new Date(),
      type: 'text'
    };

    if (!selectedJourney) {
      const journeySelectionMessage: Message = {
        id: '3',
        content: t.journeySelection,
        sender: 'shifu',
        timestamp: new Date(),
        type: 'journey-selection'
      };
      setMessages([welcomeMessage, guideMessage, journeySelectionMessage]);
    } else {
      // Show progress and current mission
      const progress = learnerProfile?.progress.find(p => p.journeyId === selectedJourney.id);
      const progressMessage: Message = {
        id: '3',
        content: t.progressUpdate
          .replace('{progress}', progress?.overallProgress.toString() || '0')
          .replace('{journey}', selectedJourney.title),
        sender: 'shifu',
        timestamp: new Date(),
        type: 'mission-progress',
        metadata: { journey: selectedJourney, progress }
      };
      setMessages([welcomeMessage, guideMessage, progressMessage]);
    }
  };

  const handleLanguageSelect = (language: 'en' | 'dz') => {
    setSelectedLanguage(language);
    setShowLanguageSelection(false);
    
    const languageMessage: Message = {
      id: 'lang-1',
      content: translations[language].languageSet,
      sender: 'shifu',
      timestamp: new Date(),
      type: 'language-selection'
    };
    setMessages([languageMessage]);
  };

  const handleJourneySelect = async (journey: Journey) => {
    onJourneySelect(journey.id);
    setIsTyping(true);

    // Start the journey and track progress
    if (learnerProfile) {
      const updatedProfile = enhancedLearnerProfileService.startJourney(learnerProfile, journey);
      onProfileUpdate(updatedProfile);
    }

    try {
      const response = await enhancedClaudeApiService.sendMessage(
        [{ role: 'user', content: `I want to start the ${journey.title} journey. Show me video lessons.` }],
        user,
        journey
      );

      // Get the intro video for this journey
      const introVideo = getVideoForJourney(journey.id);
      
      const videoResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: 'shifu',
        timestamp: new Date(),
        type: 'video-lesson',
        metadata: { 
          journey,
          video: introVideo,
          videoId: introVideo?.youtubeId
        },
        videoTranscript: introVideo?.transcript
      };

      setMessages(prev => [...prev, videoResponse]);
      setConversationHistory(prev => [...prev, { role: 'assistant', content: response }]);
      setCurrentVideoId(introVideo?.youtubeId || null);
      setMissionStartTime(new Date());
    } catch (error) {
      console.error('Error getting journey response:', error);
      const fallbackResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: `${t.readyToStart} ${journey.title}!`,
        sender: 'shifu',
        timestamp: new Date(),
        type: 'video-lesson',
        metadata: { journey }
      };
      setMessages(prev => [...prev, fallbackResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleMissionComplete = (missionId: string) => {
    if (selectedJourney && learnerProfile && missionStartTime) {
      const timeSpent = Math.floor((Date.now() - missionStartTime.getTime()) / 1000);
      
      // Update learner profile
      const updatedProfile = enhancedLearnerProfileService.completeMission(
        learnerProfile, 
        selectedJourney.id, 
        missionId, 
        timeSpent
      );
      
      onProfileUpdate(updatedProfile);
      onMissionComplete(missionId, timeSpent);
      
      // Issue credential
      const newCredential = updatedProfile.progress
        .find(p => p.journeyId === selectedJourney.id)
        ?.credentialsEarned.slice(-1)[0];
        
      if (newCredential) {
        onCredentialEarned(newCredential);
        
        const credentialMessage: Message = {
          id: Date.now().toString(),
          content: t.credentialEarned,
          sender: 'shifu',
          timestamp: new Date(),
          type: 'credential-earned',
          metadata: { credential: newCredential }
        };
        
        setMessages(prev => [...prev, credentialMessage]);
      }
      
      setMissionStartTime(null);
      setCurrentMissionTime(0);
    }
  };

  const getVideoForJourney = (journeyId: string) => {
    // Map journey IDs to video content
    switch (journeyId) {
      case 'community-builder':
        return blockvocatesVideos['community-builder-mission-3'];
      case 'digital-trader':
        return blockvocatesVideos['crypto-trader-mission-3'];
      case 'future-developer':
        return blockvocatesVideos['developer-mission-3-1'];
      default:
        return blockvocatesVideos.intro;
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
      // Add video context if current message is related to video
      const currentVideo = messages.find(m => m.type === 'video-lesson' && m.videoTranscript);
      let contextualPrompt = currentInput;
      
      if (currentVideo && currentVideo.videoTranscript) {
        contextualPrompt = `Based on the video lesson "${currentVideo.metadata?.video?.title}", the user asks: "${currentInput}". 
        
        Video transcript context: "${currentVideo.videoTranscript.substring(0, 500)}..."
        
        Please provide a helpful response that relates to the video content and their question.`;
      }

      const response = await enhancedClaudeApiService.sendMessage(
        [...newConversationHistory.slice(-15), { role: 'user', content: contextualPrompt }], // Use slice(-15) for last 15 messages
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

  const renderMessage = (message: Message) => {
    if (message.type === 'journey-selection') {
      return (
        <div className="space-y-4">
          <p className="text-gray-700">{message.content}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {journeys.map((journey) => (
              <Card 
                key={journey.id} 
                className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border-2 hover:border-orange-300"
                onClick={() => handleJourneySelect(journey)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <journey.icon className={`h-8 w-8 ${journey.color} mt-1`} />
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800 mb-2">{journey.title}</h4>
                      <p className="text-sm text-gray-600 mb-3">{journey.description}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant={
                          journey.difficulty === 'Beginner' ? 'secondary' :
                          journey.difficulty === 'Intermediate' ? 'default' : 'destructive'
                        } className="text-xs">
                          {journey.difficulty}
                        </Badge>
                        <span className="text-xs text-gray-500">{journey.missions.length} missions</span>
                      </div>
                    </div>
                  </div>
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

    if (message.type === 'video-lesson' && message.metadata?.video) {
      const video = message.metadata.video;
      return (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-orange-600" />
                <h4 className="font-bold text-orange-800">{video.title}</h4>
              </div>
              {video.duration && (
                <Badge variant="secondary" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {video.duration}
                </Badge>
              )}
            </div>
            
            {/* Larger Video Embed */}
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                className="absolute top-0 left-0 w-full h-full rounded-lg shadow-md"
                src={`https://www.youtube.com/embed/${video.youtubeId}?enablejsapi=1&rel=0&modestbranding=1`}
                title={video.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
            
            <p className="text-sm text-gray-600 mt-3">{t.videoLesson}</p>
            
            {/* Mission completion button */}
            {message.metadata?.journey && (
              <div className="mt-4 flex space-x-3">
                <Button 
                  onClick={() => handleMissionComplete('mission-1')}
                  className="flex items-center space-x-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Mark Mission Complete</span>
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.open(`https://www.youtube.com/watch?v=${video.youtubeId}`, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in YouTube
                </Button>
              </div>
            )}
          </div>
          <p className="text-gray-700">{message.content}</p>
        </div>
      );
    }

    if (message.type === 'mission-progress' && message.metadata?.progress) {
      const progress = message.metadata.progress;
      return (
        <div className="space-y-4">
          <p className="text-gray-700">{message.content}</p>
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-blue-800">Your Progress</h4>
                <Badge variant="outline">{progress.overallProgress}% Complete</Badge>
              </div>
              <Progress value={progress.overallProgress} className="h-2 mb-3" />
              <div className="grid grid-cols-3 gap-4 text-center text-sm">
                <div>
                  <div className="font-bold text-blue-600">{progress.completedMissions.length}</div>
                  <div className="text-gray-600">Completed</div>
                </div>
                <div>
                  <div className="font-bold text-green-600">{progress.credentialsEarned.length}</div>
                  <div className="text-gray-600">Credentials</div>
                </div>
                <div>
                  <div className="font-bold text-purple-600">{Math.floor(progress.timeSpent / 60)}m</div>
                  <div className="text-gray-600">Time Spent</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (message.type === 'credential-earned' && message.metadata?.credential) {
      const credential = message.metadata.credential;
      return (
        <div className="space-y-4">
          <p className="text-gray-700">{message.content}</p>
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-yellow-800">{credential.title}</h4>
                  <p className="text-sm text-yellow-700">{credential.description}</p>
                  <Badge variant="secondary" className="mt-2">
                    Level {getCredentialLevel(credential.missionId)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return <p className="text-gray-700">{message.content}</p>;
  };

  const getCredentialLevel = (missionId: string): number => {
    // Extract mission number for credential level
    const match = missionId.match(/mission[_-]?(\d+)/i);
    return match ? parseInt(match[1]) : 1;
  };

  // Language Selection Screen
  if (showLanguageSelection) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2">
            <Globe className="h-6 w-6 text-orange-600" />
            <span>Choose Language / སྐད་ཡིག་འདེམས་རོགས།</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={() => handleLanguageSelect('en')}
            className="w-full flex items-center justify-center space-x-2"
            variant="outline"
          >
            <span className="text-2xl">🇺🇸</span>
            <span>English</span>
          </Button>
          <Button 
            onClick={() => handleLanguageSelect('dz')}
            className="w-full flex items-center justify-center space-x-2"
            variant="outline"
          >
            <span className="text-2xl">🇧🇹</span>
            <span>རྫོང་ཁ (Dzongkha)</span>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with mission timer */}
      {missionStartTime && (
        <div className="bg-orange-50 border-b border-orange-200 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">Mission in Progress</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-orange-600">
              <Clock className="h-4 w-4" />
              <span>{Math.floor(currentMissionTime / 60000)}:{String(Math.floor((currentMissionTime % 60000) / 1000)).padStart(2, '0')}</span>
            </div>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-6 max-w-4xl mx-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex space-x-3 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <Avatar className="w-8 h-8 flex-shrink-0">
                  {message.sender === 'shifu' ? (
                    <>
                      <AvatarImage src="/master-shifu-avatar.png" alt="Master Shifu" />
                      <AvatarFallback className="bg-orange-100 text-orange-600">🧘</AvatarFallback>
                    </>
                  ) : (
                    <>
                      <AvatarImage src={user.profilePicture} alt={user.fullName} />
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {user.fullName.charAt(0)}
                      </AvatarFallback>
                    </>
                  )}
                </Avatar>
                
                <div className={`rounded-lg p-4 ${
                  message.sender === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white border border-gray-200 shadow-sm'
                }`}>
                  {renderMessage(message)}
                  <div className="text-xs opacity-70 mt-2">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-orange-100 text-orange-600">🧘</AvatarFallback>
                </Avatar>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Section */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex space-x-3 max-w-4xl mx-auto">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            placeholder={`${t.askQuestion}...`}
            className="flex-1"
            disabled={isTyping}
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className="px-6"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 mt-3 max-w-4xl mx-auto">
          {selectedLanguage === 'en' ? (
            <>
              <Button variant="outline" size="sm" onClick={() => setInputValue("What is blockchain?")}>
                What is blockchain?
              </Button>
              <Button variant="outline" size="sm" onClick={() => setInputValue("Show my progress")}>
                Show my progress
              </Button>
              <Button variant="outline" size="sm" onClick={() => setInputValue("I need help with this concept")}>
                Need help
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => setInputValue("བློཀ་ཅེན་ཟེར་བ་ག་རེ་རེད།")}>
                བློཀ་ཅེན་ག་རེ་རེད།
              </Button>
              <Button variant="outline" size="sm" onClick={() => setInputValue("ངའི་འཕེལ་རིམ་སྟོན་དང་།")}>
                ངའི་འཕེལ་རིམ་སྟོན།
              </Button>
              <Button variant="outline" size="sm" onClick={() => setInputValue("ངལ་རོགས་པ་དགོས།")}>
                རོགས་པ་དགོས།
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedMasterShifuChat;