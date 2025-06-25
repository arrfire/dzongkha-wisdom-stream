import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import JourneyCard from "@/components/JourneyCard";
import JourneyDetail from "@/components/JourneyDetail";
import MissionView from "@/components/MissionView";
import QuizCard from "@/components/QuizCard";
import AchievementBadge from "@/components/AchievementBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  BookOpen, 
  Coins, 
  TrendingUp, 
  Brain, 
  Settings, 
  User,
  MessageSquare,
  Target,
  Star,
  Clock,
  Award,
  Zap,
  Sparkles
} from "lucide-react";
import { journeyData, Journey, Mission } from "@/data/journeyData";
import { NDIUser } from "@/types/ndi";

interface ClaudeRecommendation {
  type: 'mission' | 'concept' | 'practice' | 'review';
  title: string;
  description: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: string;
  action: () => void;
}

interface LearnerProfile {
  id: string;
  name: string;
  institution: string;
  academicLevel: string;
  selectedJourney: string;
  experienceLevel: 'basic' | 'intermediate' | 'advanced';
}

type ViewState = 'overview' | 'journey-detail' | 'mission-view' | 'ai-dashboard';

const Index = () => {
  // Core state
  const [currentView, setCurrentView] = useState<ViewState>('overview');
  const [selectedJourney, setSelectedJourney] = useState<Journey | null>(null);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [journeys, setJourneys] = useState(journeyData);
  
  // User state - using your existing NDI user system
  const [currentUser, setCurrentUser] = useState<NDIUser | null>(null);
  
  // AI state
  const [claudeRecommendations, setClaudeRecommendations] = useState<ClaudeRecommendation[]>([]);
  const [showAIDashboard, setShowAIDashboard] = useState(false);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [dailyMotivation, setDailyMotivation] = useState<string>('');

  // Initialize user and load AI insights
  useEffect(() => {
    loadUserProfile();
  }, []);

  useEffect(() => {
    if (currentUser && selectedJourney) {
      loadAIRecommendations();
      loadDailyMotivation();
    }
  }, [currentUser, selectedJourney]);

  const loadUserProfile = () => {
    // Create a properly structured NDI user with all required fields
    const sampleUser: NDIUser = {
      citizenId: 'BT-CID-12345678', // Required field
      fullName: 'Tenzin Dorji',
      email: 'tenzin.dorji@student.rub.edu.bt',
      studentId: 'STU2024001',
      institution: 'Royal University of Bhutan',
      academicLevel: 'Undergraduate',
      verificationStatus: 'verified',
      permissions: ['profile:read', 'academic:read', 'progress:write'] // Required field
    };
    setCurrentUser(sampleUser);
  };

  const loadAIRecommendations = async () => {
    if (!currentUser || !selectedJourney) return;
    
    setIsLoadingRecommendations(true);
    try {
      // Simulate AI recommendation generation
      // In real implementation, you'd call your Claude API service here
      const recommendations: ClaudeRecommendation[] = [
        {
          type: 'mission',
          title: 'Continue Your Current Mission',
          description: selectedMission?.title || 'Next mission in your journey',
          reason: 'Building on your progress',
          priority: 'high',
          estimatedTime: '20 min',
          action: () => {
            if (selectedMission) {
              setCurrentView('mission-view');
            }
          }
        },
        {
          type: 'practice',
          title: 'Master Shifu\'s Daily Challenge',
          description: 'AI-generated quiz tailored to your learning',
          reason: 'Reinforces recent concepts',
          priority: 'medium',
          estimatedTime: '5 min',
          action: () => {
            // Navigate to quiz section
            const quizSection = document.getElementById('quiz-section');
            quizSection?.scrollIntoView({ behavior: 'smooth' });
          }
        },
        {
          type: 'concept',
          title: 'Explore Related Topics',
          description: 'Dive deeper into blockchain fundamentals',
          reason: 'Strengthen your foundation',
          priority: 'medium',
          estimatedTime: '15 min',
          action: () => {
            // Could navigate to concept exploration
          }
        }
      ];
      
      setClaudeRecommendations(recommendations);
    } catch (error) {
      console.error('Error loading AI recommendations:', error);
      setClaudeRecommendations(getStaticRecommendations());
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  const loadDailyMotivation = async () => {
    if (!currentUser) return;
    
    try {
      // Simulate AI-generated motivation
      const motivations = [
        '🙏 Every step forward in your Web3 journey brings you closer to mastering the future of technology. Bhutan\'s pioneering spirit in digital innovation flows through your learning!',
        '🌟 Like the mountains of Bhutan reaching toward the sky, your knowledge grows higher with each lesson completed.',
        '🚀 Your dedication to learning Web3 today builds the digital bridges of tomorrow for all of Bhutan.',
        '💎 In the Land of the Thunder Dragon, you\'re becoming a digital pioneer. Keep climbing!',
        '🌱 Just as Bhutan leads in Gross National Happiness, you\'re leading in Web3 wisdom!'
      ];
      
      const randomMotivation = motivations[Math.floor(Math.random() * motivations.length)];
      setDailyMotivation(randomMotivation);
    } catch (error) {
      console.error('Error loading daily motivation:', error);
      setDailyMotivation('🙏 Keep learning and growing on your Web3 journey!');
    }
  };

  const getStaticRecommendations = (): ClaudeRecommendation[] => {
    return [
      {
        type: 'mission',
        title: 'Start Your Web3 Journey',
        description: 'Begin with creating your Web3 identity',
        reason: 'Perfect starting point for beginners',
        priority: 'high',
        estimatedTime: '30 min',
        action: () => {
          if (journeys.length > 0) {
            handleJourneySelect(journeys[0].id);
          }
        }
      }
    ];
  };

  // Stats with user-specific data
  const stats = [
    { 
      label: "Active Learners", 
      value: "12,547", 
      icon: Users, 
      color: "text-blue-600",
      change: "+12% this week"
    },
    { 
      label: "Your Progress", 
      value: selectedJourney ? `${selectedJourney.progress}%` : "0%", 
      icon: BookOpen, 
      color: "text-green-600",
      change: "Current journey"
    },
    { 
      label: "EDU Earned", 
      value: "2,500", 
      icon: Coins, 
      color: "text-yellow-600",
      change: "Your balance"
    },
    { 
      label: "Success Rate", 
      value: "94%", 
      icon: TrendingUp, 
      color: "text-purple-600",
      change: "Above average!"
    }
  ];

  // Enhanced achievements
  const achievements = [
    {
      title: "Digital Pioneer",
      description: "Started your Web3 learning journey",
      type: "milestone" as const,
      earned: !!selectedJourney
    },
    {
      title: "Master Shifu's Student",
      description: "Had your first AI tutoring session",
      type: "milestone" as const,
      earned: claudeRecommendations.length > 0
    },
    {
      title: "Bhutanese Innovator",
      description: "Embrace Bhutan's digital leadership",
      type: "milestone" as const,
      earned: !!currentUser
    },
    {
      title: "Web3 Scholar",
      description: "Complete your first journey",
      type: "completion" as const,
      earned: false,
      progress: selectedJourney?.progress || 0,
      total: 100
    }
  ];

  // Journey selection handlers
  const handleJourneySelect = (journeyId: string) => {
    const journey = journeys.find(j => j.id === journeyId);
    if (journey) {
      setSelectedJourney(journey);
      
      // Find the first incomplete mission or the first mission
      const nextMission = journey.missions.find(m => !m.completed) || journey.missions[0];
      setSelectedMission(nextMission);
      
      setCurrentView('journey-detail');
    }
  };

  const handleMissionSelect = (missionId: string) => {
    if (selectedJourney) {
      const mission = selectedJourney.missions.find(m => m.id === missionId);
      if (mission) {
        setSelectedMission(mission);
        setCurrentView('mission-view');
      }
    }
  };

  const handleMissionComplete = async (missionId: string) => {
    if (selectedJourney) {
      const updatedJourneys = journeys.map(journey => {
        if (journey.id === selectedJourney.id) {
          const updatedMissions = journey.missions.map(mission => 
            mission.id === missionId ? { ...mission, completed: true } : mission
          );
          const completedCount = updatedMissions.filter(m => m.completed).length;
          const newProgress = Math.round((completedCount / updatedMissions.length) * 100);
          
          return {
            ...journey,
            missions: updatedMissions,
            progress: newProgress,
            status: newProgress === 100 ? 'completed' as const : journey.status
          };
        }
        return journey;
      });
      
      setJourneys(updatedJourneys);
      setSelectedJourney(updatedJourneys.find(j => j.id === selectedJourney.id) || null);
      
      // Generate new recommendations after completion
      if (currentUser) {
        loadAIRecommendations();
      }
    }
  };

  // Navigation handlers
  const handleBackToOverview = () => {
    setCurrentView('overview');
    setSelectedJourney(null);
    setSelectedMission(null);
  };

  const handleBackToJourney = () => {
    setCurrentView('journey-detail');
    setSelectedMission(null);
  };

  // AI Dashboard Component
  const AIDashboard = () => (
    <Card className="border-2 border-blue-100">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-blue-600" />
          <span>Master Shifu's Guidance</span>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">Claude AI</Badge>
          {isLoadingRecommendations && (
            <div className="animate-spin h-4 w-4 border-2 border-blue-600 rounded-full border-t-transparent"></div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Daily Motivation */}
        {dailyMotivation && (
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-lg border border-orange-200">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-lg">🧙‍♂️</span>
              <h4 className="font-medium text-orange-800">Daily Wisdom</h4>
            </div>
            <p className="text-orange-700 text-sm leading-relaxed">{dailyMotivation}</p>
          </div>
        )}

        {/* Recommendations */}
        {claudeRecommendations.map((rec, index) => (
          <div 
            key={index}
            className="p-4 border rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
            onClick={rec.action}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="font-medium">{rec.title}</h4>
                  <Badge 
                    variant={rec.priority === 'high' ? 'default' : 'secondary'}
                    className={rec.priority === 'high' ? 'bg-red-100 text-red-800' : ''}
                  >
                    {rec.priority}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{rec.estimatedTime}</span>
                  </span>
                  <span>{rec.reason}</span>
                </div>
              </div>
              <div className="ml-4">
                {rec.type === 'mission' && <Target className="h-5 w-5 text-orange-600" />}
                {rec.type === 'practice' && <Zap className="h-5 w-5 text-yellow-600" />}
                {rec.type === 'concept' && <BookOpen className="h-5 w-5 text-blue-600" />}
                {rec.type === 'review' && <Star className="h-5 w-5 text-purple-600" />}
              </div>
            </div>
          </div>
        ))}
        
        {claudeRecommendations.length === 0 && !isLoadingRecommendations && (
          <div className="text-center py-8 text-gray-500">
            <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Master Shifu is analyzing your learning journey...</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={loadAIRecommendations}
            >
              Get AI Guidance
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // User Profile Summary
  const UserProfileSummary = () => (
    <Card className="border-2 border-green-100">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="h-5 w-5 text-green-600" />
          <span>Your Profile</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {currentUser && (
          <>
            <div>
              <div className="text-sm text-gray-500">Name</div>
              <div className="font-medium">{currentUser.fullName}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Institution</div>
              <div className="font-medium">{currentUser.institution}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Academic Level</div>
              <div className="font-medium">{currentUser.academicLevel}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Verification</div>
              <Badge className="bg-green-100 text-green-800">
                {currentUser.verificationStatus}
              </Badge>
            </div>
          </>
        )}
        
        <div className="pt-3 border-t">
          <div className="text-sm text-gray-500 mb-2">Journey Progress</div>
          {selectedJourney ? (
            <>
              <div className="flex justify-between text-sm mb-1">
                <span>{selectedJourney.title}</span>
                <span>{selectedJourney.progress}%</span>
              </div>
              <Progress value={selectedJourney.progress} className="h-2" />
            </>
          ) : (
            <p className="text-sm text-gray-500">No journey selected</p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // Main render function
  const renderContent = () => {
    switch (currentView) {
      case 'mission-view':
        if (selectedMission && selectedJourney) {
          const missionNumber = selectedJourney.missions.findIndex(m => m.id === selectedMission.id) + 1;
          return (
            <MissionView
              mission={selectedMission}
              journey={selectedJourney}
              missionNumber={missionNumber}
              onBack={handleBackToJourney}
              onComplete={handleMissionComplete}
            />
          );
        }
        break;
      
      case 'journey-detail':
        if (selectedJourney) {
          return (
            <JourneyDetail
              journey={selectedJourney}
              onBack={handleBackToOverview}
              onMissionSelect={handleMissionSelect}
            />
          );
        }
        break;
      
      case 'overview':
      default:
        return (
          <>
            {/* Hero Section with Personalization */}
            <section className="py-20 px-4">
              <div className="max-w-7xl mx-auto text-center space-y-8">
                <div className="space-y-4">
                  <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text text-transparent leading-tight">
                    {currentUser ? `Welcome back, ${currentUser.fullName.split(' ')[0]}!` : 'Where Learning Becomes'}
                    <br />
                    {currentUser ? 'Ready to continue your Web3 journey?' : 'Adventure'}
                  </h1>
                  <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                    {selectedJourney 
                      ? `Continue your ${selectedJourney.title} journey with Master Shifu's AI-powered guidance, designed for ${currentUser?.institution} students.`
                      : 'Bringing the magic of blockchain education home to Bhutan, where every lesson unlocks new possibilities and ancient wisdom meets digital futures.'
                    }
                  </p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                  {stats.map((stat, index) => (
                    <Card key={index} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                      <CardContent className="p-6 text-center">
                        <stat.icon className={`h-8 w-8 mx-auto mb-3 ${stat.color}`} />
                        <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                        <div className="text-sm text-gray-600">{stat.label}</div>
                        {stat.change && (
                          <div className="text-xs text-gray-500 mt-1">{stat.change}</div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Personalized Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {selectedJourney ? (
                    <>
                      <Button 
                        onClick={() => handleJourneySelect(selectedJourney.id)}
                        className="bg-orange-600 hover:bg-orange-700 px-8 py-3"
                      >
                        Continue Learning
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => setShowAIDashboard(!showAIDashboard)}
                        className="px-8 py-3"
                      >
                        <Brain className="h-4 w-4 mr-2" />
                        Master Shifu's Guidance
                      </Button>
                    </>
                  ) : (
                    <Button 
                      onClick={() => {
                        if (journeys.length > 0) {
                          handleJourneySelect(journeys[0].id);
                        }
                      }}
                      className="bg-orange-600 hover:bg-orange-700 px-8 py-3"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Start Your Journey
                    </Button>
                  )}
                </div>
              </div>
            </section>

            {/* AI Dashboard Section */}
            {showAIDashboard && currentUser && (
              <section className="py-8 px-4 bg-blue-50">
                <div className="max-w-7xl mx-auto space-y-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      <AIDashboard />
                    </div>
                    <UserProfileSummary />
                  </div>
                </div>
              </section>
            )}

            {/* Learning Journey Section */}
            <section className="py-16 px-4">
              <div className="max-w-7xl mx-auto space-y-8">
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold text-gray-900">Your Web3 Adventure Awaits</h2>
                  <p className="text-gray-600">
                    {selectedJourney 
                      ? 'Explore other learning paths or continue your current journey'
                      : 'Choose your path and embark on a magical learning journey'
                    }
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {journeys.map((journey) => (
                    <JourneyCard
                      key={journey.id}
                      journey={journey}
                      onSelect={handleJourneySelect}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* Daily Challenge Section */}
            <section id="quiz-section" className="py-16 px-4 bg-white/50">
              <div className="max-w-7xl mx-auto space-y-8">
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold text-gray-900">
                    {currentUser ? 'Your Personal Challenge' : "Today's Challenge"}
                  </h2>
                  <p className="text-gray-600">Test your knowledge with Master Shifu's guidance</p>
                </div>
                <QuizCard 
                  learnerProfile={currentUser ? {
                    id: currentUser.studentId || currentUser.citizenId,
                    name: currentUser.fullName,
                    institution: currentUser.institution || '',
                    academicLevel: currentUser.academicLevel || '',
                    selectedJourney: selectedJourney?.id || '',
                    experienceLevel: 'basic'
                  } : undefined}
                  currentConcept={selectedMission?.id || selectedJourney?.id || 'blockchain-basics'}
                />
              </div>
            </section>

            {/* Achievements Section */}
            <section className="py-16 px-4">
              <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold text-gray-900">Your Achievements</h2>
                  <p className="text-gray-600">Celebrate your learning milestones</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {achievements.map((achievement, index) => (
                    <AchievementBadge key={index} achievement={achievement} />
                  ))}
                </div>
              </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12 px-4">
              <div className="max-w-7xl mx-auto text-center space-y-4">
                <h3 className="text-2xl font-bold">Edustream</h3>
                <p className="text-gray-400 max-w-2xl mx-auto">
                  Bridging ancient Bhutanese wisdom with modern blockchain technology, powered by Master Shifu's AI guidance and Bhutan's pioneering digital identity system.
                </p>
                <div className="flex justify-center space-x-8 text-sm text-gray-400">
                  <a href="#" className="hover:text-white transition-colors">About</a>
                  <a href="#" className="hover:text-white transition-colors">Community</a>
                  <a href="#" className="hover:text-white transition-colors">NDI Integration</a>
                  <a href="#" className="hover:text-white transition-colors">Privacy</a>
                </div>
              </div>
            </footer>
          </>
        );
    }
    
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <Header />
      {renderContent()}
    </div>
  );
};

export default Index;