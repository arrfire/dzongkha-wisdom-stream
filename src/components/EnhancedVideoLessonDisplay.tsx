// src/components/EnhancedVideoLessonDisplay.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Play, Pause, ExternalLink, BookOpen, Clock, CheckCircle, 
  MessageSquare, FileText, Award, Target, Volume2, VolumeX
} from "lucide-react";
import { Journey } from "@/data/journeyData";
import { LearnerProfile } from "@/types/learnerProfile";
import { enhancedLearnerProfileServiceInstance } from "@/services/enhancedLearnerProfileService";

interface VideoLessonProps {
  journey: Journey;
  missionId: string;
  learnerProfile?: LearnerProfile;
  onProgressUpdate?: (profile: LearnerProfile) => void;
  onMissionComplete?: (missionId: string, timeSpent: number, concepts: string[]) => void;
  className?: string;
}

interface VideoData {
  youtubeId: string;
  title: string;
  description: string;
  duration: string;
  transcript: string;
  concepts: string[];
  keyTimestamps: { time: string; description: string; concept?: string }[];
}

// Enhanced video data with transcripts and concepts from Blockvocates
const videoDatabase: { [key: string]: VideoData } = {
  'intro-blockvocates': {
    youtubeId: 'dKYncXmM8P4',
    title: 'Intro to Blockvocates',
    description: 'Welcome to Blockvocates - blockchain Advocates. Learn what crypto, web3, and blockchain are in a structured community.',
    duration: '8:30',
    transcript: `hi everyone welcome to blog for kids what is block for Kates well block for Kates stands for blockchain Advocates and it started as a way for me to bring my friends acquaintances and so many people who have asked me this question what is crypto what is web3 what is blockchain I wanted to create a structured community where you could learn not just on your own but along with a set of other people like-minded individuals who wanted to learn and grow and understand what this industry is...`,
    concepts: ['Blockchain Advocates', 'Crypto Basics', 'Web3 Introduction', 'Community Learning', 'Structured Education'],
    keyTimestamps: [
      { time: '0:08', description: 'Introduction to Blockvocates', concept: 'Blockchain Advocates' },
      { time: '1:15', description: 'What is crypto, web3, blockchain?', concept: 'Web3 Introduction' },
      { time: '2:30', description: 'Community-based learning approach', concept: 'Community Learning' },
      { time: '4:45', description: 'Journey selection and missions', concept: 'Structured Education' },
      { time: '6:20', description: 'Career opportunities in Web3', concept: 'Web3 Careers' }
    ]
  },
  'create-identity-1': {
    youtubeId: 'o7bq7oEuSgU',
    title: 'Mission 1 - Create your Identity (Part 1)',
    description: 'Learn why identity is crucial in blockchain and the three types of identities: real, pseudonymous, and anonymous.',
    duration: '12:45',
    transcript: `hi everyone welcome to Mission one of blog for kids and this mission is called create your identity and if you successfully complete this Mission there's 6,000 voet tokens waiting for you as a reward at the end of it so let's dive into mission one why is identity so important in blockchain well blockchain is built upon the foundations of giving ownership to each and every user...`,
    concepts: ['Digital Identity', 'Blockchain Ownership', 'Pseudonymous Identity', 'Anonymous Identity', 'Twitter for Web3'],
    keyTimestamps: [
      { time: '0:15', description: 'Mission 1 introduction and rewards', concept: 'Mission Structure' },
      { time: '1:30', description: 'Why identity matters in blockchain', concept: 'Digital Identity' },
      { time: '3:20', description: 'Three types of identities explained', concept: 'Identity Types' },
      { time: '5:45', description: 'Real identity examples (CZ, Vitalik)', concept: 'Real Identity' },
      { time: '7:10', description: 'Pseudonymous identity (Kobe example)', concept: 'Pseudonymous Identity' },
      { time: '8:30', description: 'Anonymous identity examples', concept: 'Anonymous Identity' }
    ]
  },
  'create-identity-2': {
    youtubeId: 'X5ygRVEQDtU',
    title: 'Mission 1 - Create your Identity (Part 2)',
    description: 'Hands-on walkthrough: setting up Rainbow wallet, creating Farcaster and Lens profiles, and connecting everything.',
    duration: '15:20',
    transcript: `continuation of mission one we're going to look at the steps in detail and I'm going to do this on my phone you can do this on a laptop also but we're going to do the steps on my phone where we're going to install rainbow wallet that's the first step...`,
    concepts: ['Rainbow Wallet', 'Web3 Wallet Setup', 'Farcaster', 'Lens Protocol', 'Web3 Social Media'],
    keyTimestamps: [
      { time: '0:30', description: 'Installing Rainbow wallet', concept: 'Rainbow Wallet' },
      { time: '2:15', description: 'Backup and security setup', concept: 'Wallet Security' },
      { time: '4:45', description: 'Creating Farcaster profile', concept: 'Farcaster' },
      { time: '8:20', description: 'Setting up Lens protocol account', concept: 'Lens Protocol' },
      { time: '12:10', description: 'Connecting accounts with Yup', concept: 'Web3 Social Integration' }
    ]
  },
  'read-write-own': {
    youtubeId: 'bNd0UOE2l_U',
    title: 'Mission 2 - Read, Write, Own',
    description: 'Understanding the fundamental concept that defines Web3: the evolution from Web1 (read) to Web2 (write) to Web3 (own).',
    duration: '10:15',
    transcript: `all right everyone so you've made it past mission one and now you're here at mission two congratulations this mission is called read write own right so what does read write own mean read write own is a book written by Chris Dixon from a16z and it's a really wonderful book...`,
    concepts: ['Read Write Own', 'Web1 vs Web2 vs Web3', 'Ownership', 'Chris Dixon', 'A16z', 'Blockchain Fundamentals'],
    keyTimestamps: [
      { time: '0:45', description: 'Introduction to Read Write Own concept', concept: 'Read Write Own' },
      { time: '2:20', description: 'Web1: Read-only internet', concept: 'Web1 Evolution' },
      { time: '4:10', description: 'Web2: Read and Write capabilities', concept: 'Web2 Evolution' },
      { time: '6:30', description: 'Web3: Read, Write, and Own', concept: 'Web3 Ownership' },
      { time: '8:15', description: 'Preparing your speech assignment', concept: 'Communication Skills' }
    ]
  },
  'crypto-trader-mission-3': {
    youtubeId: 'V3lJD2Z3z0s',
    title: 'Crypto Traders - Trade Crypto on CEX (Binance) DEX (Aerodrome)',
    description: 'Hands-on trading tutorial: setting up Binance account, using Aerodrome DEX, providing liquidity, and earning rewards.',
    duration: '25:40',
    transcript: `all right hi everyone welcome to mission three of block Vates and this is mission three of the crypto Trader Journey so it's going to be the nitty-gritty where we're setting up your centralized exchange and your Dex account...`,
    concepts: ['Centralized Exchange', 'Binance Setup', 'DEX Trading', 'Aerodrome', 'Liquidity Provision', 'DeFi Yields'],
    keyTimestamps: [
      { time: '1:30', description: 'Setting up Binance account', concept: 'Centralized Exchange' },
      { time: '5:45', description: 'KYC verification process', concept: 'Compliance' },
      { time: '8:20', description: 'Understanding DEX vs CEX', concept: 'Decentralized Exchange' },
      { time: '12:15', description: 'Connecting to Aerodrome', concept: 'DEX Connection' },
      { time: '16:30', description: 'Providing liquidity tutorial', concept: 'Liquidity Provision' },
      { time: '20:10', description: 'Understanding rewards and risks', concept: 'DeFi Risk Management' }
    ]
  },
  'developer-mission-3-1': {
    youtubeId: '53QO6myTCo4',
    title: 'Developers - Understanding Web2 Programming Introduction',
    description: 'Learn the basics of web programming: front-end vs back-end, HTML/CSS/JavaScript, and prepare for Web3 development.',
    duration: '18:30',
    transcript: `development before I'm not a professional developer by any means right so I'm going to be doing this on my own too and if I'm able to do it I'm sure all of you guys will be able to do it right...`,
    concepts: ['Frontend vs Backend', 'HTML CSS JavaScript', 'Web Development Basics', 'Programming Fundamentals', 'Web3 Preparation'],
    keyTimestamps: [
      { time: '2:15', description: 'Frontend vs Backend explanation', concept: 'Web Architecture' },
      { time: '5:30', description: 'HTML: Structure of web pages', concept: 'HTML Fundamentals' },
      { time: '8:45', description: 'CSS: Styling and design', concept: 'CSS Fundamentals' },
      { time: '12:20', description: 'JavaScript: Adding functionality', concept: 'JavaScript Fundamentals' },
      { time: '15:40', description: 'Preparing for Web3 development', concept: 'Web3 Transition' }
    ]
  },
  'community-builder-mission-3': {
    youtubeId: 'VHA7x2OGxlU',
    title: 'Community Builder - Understanding Web3 Communities',
    description: 'Explore different types of Web3 communities: project-based, purpose-driven, and interest-based communities.',
    duration: '16:45',
    transcript: `hello everyone and welcome to mission three of the community Builder journey in blockvocates and today we're going to look at how you can understand what the different kinds of communities look like...`,
    concepts: ['Web3 Communities', 'Project-based Communities', 'Purpose-driven Communities', 'DAOs', 'Discord and Telegram'],
    keyTimestamps: [
      { time: '1:20', description: 'Types of Web3 communities', concept: 'Community Types' },
      { time: '3:45', description: 'Project-based communities explained', concept: 'Project Communities' },
      { time: '6:30', description: 'Purpose-driven communities and DAOs', concept: 'DAOs' },
      { time: '9:15', description: 'Interest-based groups', concept: 'Interest Communities' },
      { time: '12:20', description: 'Community platforms and tools', concept: 'Community Tools' }
    ]
  }
};

const EnhancedVideoLessonDisplay: React.FC<VideoLessonProps> = ({
  journey,
  missionId,
  learnerProfile,
  onProgressUpdate,
  onMissionComplete,
  className = ""
}) => {
  const [currentVideo, setCurrentVideo] = useState<VideoData | null>(null);
  const [watchProgress, setWatchProgress] = useState(0);
  const [isWatching, setIsWatching] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [conceptsLearned, setConceptsLearned] = useState<string[]>([]);
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [questionsAsked, setQuestionsAsked] = useState(0);
  const videoRef = useRef<HTMLIFrameElement>(null);
  const watchTimeRef = useRef(0);

  useEffect(() => {
    // Load video based on journey and mission
    const videoKey = getVideoKey(journey.id, missionId);
    if (videoDatabase[videoKey]) {
      setCurrentVideo(videoDatabase[videoKey]);
      setStartTime(new Date());
    }
  }, [journey.id, missionId]);

  useEffect(() => {
    // Track video watching progress
    if (isWatching && startTime && learnerProfile && onProgressUpdate) {
      const interval = setInterval(() => {
        watchTimeRef.current += 1;
        const progress = Math.min((watchTimeRef.current / parseDuration(currentVideo?.duration || '0:00')) * 100, 100);
        setWatchProgress(progress);
        
        // Auto-learn concepts at certain progress points
        if (currentVideo && progress > 25 && !conceptsLearned.includes(currentVideo.concepts[0])) {
          setConceptsLearned(prev => [...prev, currentVideo.concepts[0]]);
        }
        if (currentVideo && progress > 50 && !conceptsLearned.includes(currentVideo.concepts[1])) {
          setConceptsLearned(prev => [...prev, currentVideo.concepts[1]]);
        }
        if (currentVideo && progress > 75 && !conceptsLearned.includes(currentVideo.concepts[2])) {
          setConceptsLearned(prev => [...prev, currentVideo.concepts[2]]);
        }
        
        // Track in learner profile
        if (watchTimeRef.current % 30 === 0) { // Every 30 seconds
          const updatedProfile = enhancedLearnerProfileServiceInstance.trackVideoWatching(
            learnerProfile,
            journey.id,
            currentVideo?.youtubeId || '',
            watchTimeRef.current,
            parseDuration(currentVideo?.duration || '0:00')
          );
          onProgressUpdate(updatedProfile);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isWatching, startTime, currentVideo, learnerProfile, journey.id, conceptsLearned, onProgressUpdate]);

  const getVideoKey = (journeyId: string, missionId: string): string => {
    // Map journey and mission to video keys
    const mappings: { [key: string]: { [mission: string]: string } } = {
      'community-builder': {
        'mission-1': 'create-identity-1',
        'mission-2': 'read-write-own',
        'mission-3': 'community-builder-mission-3'
      },
      'digital-trader': {
        'mission-1': 'create-identity-1',
        'mission-2': 'read-write-own',
        'mission-3': 'crypto-trader-mission-3'
      },
      'future-developer': {
        'mission-1': 'create-identity-1',
        'mission-2': 'read-write-own',
        'mission-3': 'developer-mission-3-1'
      }
    };

    return mappings[journeyId]?.[missionId] || 'intro-blockvocates';
  };

  const parseDuration = (duration: string): number => {
    const parts = duration.split(':');
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  };

  const handleVideoPlay = () => {
    setIsWatching(true);
    if (!startTime) setStartTime(new Date());
  };

  const handleVideoPause = () => {
    setIsWatching(false);
  };

  const handleConceptClick = (concept: string) => {
    setSelectedConcept(concept);
    if (!conceptsLearned.includes(concept)) {
      setConceptsLearned(prev => [...prev, concept]);
    }
  };

  const handleQuestionAsked = () => {
    setQuestionsAsked(prev => prev + 1);
    if (currentVideo && learnerProfile && onProgressUpdate) {
      const updatedProfile = enhancedLearnerProfileServiceInstance.trackQuestionAsked(
        learnerProfile,
        journey.id,
        "Question about video content",
        `Video: ${currentVideo.title}`
      );
      onProgressUpdate(updatedProfile);
    }
  };

  const handleMissionComplete = () => {
    if (currentVideo && startTime && onMissionComplete) {
      const timeSpent = Math.floor((Date.now() - startTime.getTime()) / 1000);
      onMissionComplete(missionId, timeSpent, conceptsLearned);
      
      // Complete mission in enhanced service if learner profile available
      if (learnerProfile && onProgressUpdate) {
        const completion = {
          missionId,
          journeyId: journey.id,
          completedAt: new Date(),
          timeSpent,
          videoWatched: watchProgress > 80,
          questionsAsked,
          conceptsLearned
        };

        const { updatedProfile } = enhancedLearnerProfileServiceInstance.completeMissionWithTracking(
          learnerProfile,
          completion
        );
        onProgressUpdate(updatedProfile);
      }
    }
  };

  const formatTranscriptWithHighlights = (transcript: string) => {
    let formattedTranscript = transcript;
    conceptsLearned.forEach(concept => {
      const regex = new RegExp(`(${concept})`, 'gi');
      formattedTranscript = formattedTranscript.replace(
        regex, 
        `<mark class="bg-yellow-200 px-1 rounded">$1</mark>`
      );
    });
    return formattedTranscript;
  };

  if (!currentVideo) {
    return (
      <Card className={`border-orange-200 ${className}`}>
        <CardContent className="p-6 text-center">
          <BookOpen className="h-12 w-12 text-orange-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Loading Video Lesson...
          </h3>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Video Player - Much Larger */}
      <Card className="border-2 border-orange-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Play className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-xl text-orange-800">
                  {currentVideo.title}
                </CardTitle>
                <div className="flex items-center space-x-4 mt-2">
                  <Badge variant="secondary" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {currentVideo.duration}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {journey.title}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`https://www.youtube.com/watch?v=${currentVideo.youtubeId}`, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                YouTube
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTranscript(!showTranscript)}
              >
                <FileText className="h-4 w-4 mr-2" />
                {showTranscript ? 'Hide' : 'Show'} Transcript
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {/* Extra Large Video Embed */}
          <div className="relative w-full" style={{ paddingBottom: '56.25%', minHeight: '400px' }}>
            <iframe
              ref={videoRef}
              className="absolute top-0 left-0 w-full h-full"
              src={`https://www.youtube.com/embed/${currentVideo.youtubeId}?enablejsapi=1&rel=0&modestbranding=1&autoplay=0`}
              title={currentVideo.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              onLoad={() => {
                // You can add YouTube API integration here for better tracking
              }}
            />
          </div>
          
          {/* Progress Bar */}
          <div className="p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Watch Progress</span>
              <span className="text-sm text-gray-600">{Math.round(watchProgress)}%</span>
            </div>
            <Progress value={watchProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Learning Progress and Concepts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Concepts Learned */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-600" />
              <span>Key Concepts</span>
              <Badge variant="secondary">{conceptsLearned.length}/{currentVideo.concepts.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentVideo.concepts.map((concept, index) => (
              <div
                key={concept}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  conceptsLearned.includes(concept)
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-gray-50 border-gray-200 hover:bg-blue-50'
                }`}
                onClick={() => handleConceptClick(concept)}
              >
                <div className="flex items-center space-x-2">
                  {conceptsLearned.includes(concept) ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                  )}
                  <span className="font-medium">{concept}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Mission Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-purple-600" />
              <span>Mission Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{Math.round(watchProgress)}%</div>
                <div className="text-sm text-gray-600">Video Watched</div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{conceptsLearned.length}</div>
                <div className="text-sm text-gray-600">Concepts Learned</div>
              </div>
            </div>
            
            {/* Mission Complete Button */}
            <Button
              onClick={handleMissionComplete}
              disabled={watchProgress < 80 || conceptsLearned.length < 3}
              className="w-full"
              size="lg"
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              Complete Mission
              {watchProgress < 80 && <span className="ml-2 text-xs">(Watch 80% to unlock)</span>}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Content Tabs */}
      <Card>
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="timestamps">Key Timestamps</TabsTrigger>
            <TabsTrigger value="transcript" className={showTranscript ? 'bg-yellow-50' : ''}>
              Transcript
            </TabsTrigger>
            <TabsTrigger value="notes">Your Notes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="description" className="p-6">
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">{currentVideo.description}</p>
              
              {selectedConcept && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Selected Concept: {selectedConcept}</h4>
                  <p className="text-blue-700 text-sm">
                    Click on the chat below to ask Master Shifu about this concept!
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="timestamps" className="p-6">
            <div className="space-y-3">
              {currentVideo.keyTimestamps.map((timestamp, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Badge variant="outline" className="text-xs mt-1">
                    {timestamp.time}
                  </Badge>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">{timestamp.description}</p>
                    {timestamp.concept && (
                      <Badge 
                        variant="secondary" 
                        className={`text-xs mt-1 ${
                          conceptsLearned.includes(timestamp.concept) ? 'bg-green-100 text-green-800' : ''
                        }`}
                      >
                        {timestamp.concept}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="transcript" className="p-6">
            <ScrollArea className="h-96 w-full">
              <div 
                className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ 
                  __html: formatTranscriptWithHighlights(currentVideo.transcript) 
                }}
              />
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="notes" className="p-6">
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Use the chat below to ask questions and take notes with Master Shifu!</p>
              <p className="text-sm mt-2">Questions asked this session: <span className="font-bold">{questionsAsked}</span></p>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Hidden elements for tracking */}
      <div className="hidden">
        <button onClick={handleVideoPlay}>Play</button>
        <button onClick={handleVideoPause}>Pause</button>
        <button onClick={handleQuestionAsked}>Question Asked</button>
      </div>
    </div>
  );
};

export default EnhancedVideoLessonDisplay;
