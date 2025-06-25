
import { useState } from "react";
import Header from "@/components/Header";
import JourneyCard from "@/components/JourneyCard";
import JourneyDetail from "@/components/JourneyDetail";
import MissionView from "@/components/MissionView";
import QuizCard from "@/components/QuizCard";
import AchievementBadge from "@/components/AchievementBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Users, BookOpen, Coins, TrendingUp } from "lucide-react";
import { journeyData, Journey, Mission } from "@/data/journeyData";
import { useNDIAuth } from "@/hooks/useNDIAuth";
import { NDILogin } from "@/components/NDILogin";
import { CheckCircle } from "lucide-react";

type ViewState = 'overview' | 'journey-detail' | 'mission-view';

const NDIWelcomeBanner = () => {
  const { isAuthenticated, user } = useNDIAuth();
  
  if (!isAuthenticated || !user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <div>
            <p className="font-medium text-green-800">
              Welcome back, {user.fullName}!
            </p>
            <p className="text-sm text-green-600">
              Your learning progress is securely linked to your National Digital Identity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};


const Index = () => {
  const [currentView, setCurrentView] = useState<ViewState>('overview');
  const [selectedJourney, setSelectedJourney] = useState<Journey | null>(null);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [journeys, setJourneys] = useState(journeyData);

  const stats = [
    { label: "Active Learners", value: "12,547", icon: Users, color: "text-blue-600" },
    { label: "Lessons Completed", value: "89,234", icon: BookOpen, color: "text-green-600" },
    { label: "EDU Earned", value: "77,000,000", icon: Coins, color: "text-yellow-600" },
    { label: "Success Rate", value: "94%", icon: TrendingUp, color: "text-purple-600" }
  ];

  const achievements = [
    {
      title: "First Steps",
      description: "Complete your first lesson",
      type: "milestone" as const,
      earned: true
    },
    {
      title: "Quiz Master",
      description: "Answer 50 quiz questions correctly",
      type: "quiz" as const,
      earned: true,
      progress: 47,
      total: 50
    },
    {
      title: "Learning Streak",
      description: "Learn for 7 consecutive days",
      type: "streak" as const,
      earned: false,
      progress: 4,
      total: 7
    },
    {
      title: "Blockchain Scholar",
      description: "Complete the Blockchain Basics course",
      type: "completion" as const,
      earned: false,
      progress: 10,
      total: 12
    }
  ];

  const handleJourneySelect = (journeyId: string) => {
    const journey = journeys.find(j => j.id === journeyId);
    if (journey) {
      setSelectedJourney(journey);
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

  const handleMissionComplete = (missionId: string) => {
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
    }
  };

  const handleBackToOverview = () => {
    setCurrentView('overview');
    setSelectedJourney(null);
    setSelectedMission(null);
  };

  const handleBackToJourney = () => {
    setCurrentView('journey-detail');
    setSelectedMission(null);
  };

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
            {/* Hero Section */}
            <section className="py-20 px-4">
              <div className="max-w-7xl mx-auto text-center space-y-8">
                <div className="space-y-4">
                  <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text text-transparent leading-tight">
                    Where Learning Becomes
                    <br />
                    Adventure
                  </h1>
                  <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                    Bringing the magic of blockchain education home to Bhutan, where every lesson unlocks new possibilities and ancient wisdom meets digital futures.
                  </p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                  {stats.map((stat, index) => (
                    <Card key={index} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                      <CardContent className="p-6 text-center">
                        <stat.icon className={`h-8 w-8 mx-auto mb-3 ${stat.color}`} />
                        <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                        <div className="text-sm text-gray-600">{stat.label}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </section>

            {/* Learning Journey Section */}
            <section className="py-16 px-4">
              <div className="max-w-7xl mx-auto space-y-8">
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold text-gray-900">Your Web3 Adventure Awaits</h2>
                  <p className="text-gray-600">Choose your path and embark on a magical learning journey</p>
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
            <section className="py-16 px-4 bg-white/50">
              <div className="max-w-7xl mx-auto space-y-8">
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold text-gray-900">Today's Challenge</h2>
                  <p className="text-gray-600">Test your knowledge and earn rewards</p>
                </div>
                <QuizCard />
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
                  Bridging ancient Bhutanese wisdom with modern blockchain technology, creating a future where learning is both meaningful and rewarding.
                </p>
                <div className="flex justify-center space-x-8 text-sm text-gray-400">
                  <a href="#" className="hover:text-white transition-colors">About</a>
                  <a href="#" className="hover:text-white transition-colors">Community</a>
                  <a href="#" className="hover:text-white transition-colors">Support</a>
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
