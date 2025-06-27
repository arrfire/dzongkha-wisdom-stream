// src/pages/Index.tsx - Fixed MasterShifuChat props
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import MasterShifuChat from "@/components/EnhancedMasterShifuChat";
import QuizCard from "@/components/QuizCard";
import AchievementBadge from "@/components/AchievementBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users, BookOpen, Coins, TrendingUp, Mountain, ExternalLink } from "lucide-react";
import { journeyData, Journey } from "@/data/journeyData";
import { Achievement } from "@/types/achievement";
import { useNDIAuth } from "@/hooks/useNDIAuth";
import { enhancedLearnerProfileServiceInstance as learnerProfileService } from "@/services/enhancedLearnerProfileService";
import { LearnerProfile } from "@/types/learnerProfile";
import { NDILogin } from "@/components/NDILogin";
import { NDIUser } from "@/types/ndi";

const Index = () => {
  const { isAuthenticated, user } = useNDIAuth();
  const [learnerProfile, setLearnerProfile] = useState<LearnerProfile | null>(null);
  const [selectedJourney, setSelectedJourney] = useState<Journey | null>(null);
  const [journeys, setJourneys] = useState(journeyData);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showNDILogin, setShowNDILogin] = useState(false);
  const [guestMode, setGuestMode] = useState(false);
  const [guestUser, setGuestUser] = useState<NDIUser | null>(null);

  const stats = [
    { label: "Active Learners", value: "12,547", icon: Users, color: "text-blue-600" },
    { label: "Lessons Completed", value: "89,234", icon: BookOpen, color: "text-green-600" },
    { label: "EDU Earned", value: "77,000,000", icon: Coins, color: "text-yellow-600" },
    { label: "Success Rate", value: "94%", icon: TrendingUp, color: "text-purple-600" }
  ];

  // Initialize or load learner profile when user authenticates
  useEffect(() => {
    if ((isAuthenticated && user) || (guestMode && guestUser)) {
      const currentUser = user || guestUser;
      if (!currentUser) return;

      let profile = learnerProfileService.getLearnerProfile();
      
      if (!profile || profile.ndiUser.citizenId !== currentUser.citizenId) {
        // Create new profile for this user
        profile = learnerProfileService.createLearnerProfile(currentUser);
      } else {
        // Update login activity for existing profile
        profile = learnerProfileService.updateLoginActivity(profile);
      }
      
      setLearnerProfile(profile);
      
      // Load selected journey if exists
      if (profile.progress.length > 0) {
        const currentJourney = journeys.find(j => 
          profile.progress.some(p => p.journeyId === j.id && p.overallProgress < 100)
        );
        if (currentJourney) {
          setSelectedJourney(currentJourney);
          setShowWelcome(false);
        }
      }
    } else {
      setLearnerProfile(null);
      setSelectedJourney(null);
      setShowWelcome(true);
    }
  }, [isAuthenticated, user, guestMode, guestUser, journeys]); // Added journeys to dependency array

  const handleJourneySelect = (journeyId: string) => {
    const journey = journeys.find(j => j.id === journeyId);
    if (journey && learnerProfile) {
      setSelectedJourney(journey);
      const updatedProfile = learnerProfileService.startJourney(learnerProfile, journey);
      setLearnerProfile(updatedProfile);
      setShowWelcome(false);
    }
  };

  const handleMissionStart = (missionId: string) => {
    if (selectedJourney && learnerProfile) {
      console.log(`Starting mission ${missionId} in journey ${selectedJourney.id}`);
      // Logic to update learner profile for mission start if needed
    }
  };

  // Define onMissionComplete handler for MasterShifuChat
  const handleMissionComplete = (missionId: string, timeSpent: number) => {
    if (selectedJourney && learnerProfile) {
      console.log(`Mission ${missionId} completed in ${selectedJourney.title} in ${timeSpent} seconds.`);
      // This is a placeholder; actual mission completion logic should reside in learnerProfileService
      // and be called through onProfileUpdate if it modifies the profile.
      // Or MasterShifuChat directly calls enhancedLearnerProfileService.completeMissionWithTracking
      // and then triggers onProfileUpdate.
    }
  };

  const handleCredentialEarned = (credential: any) => {
    console.log('New credential earned:', credential);
    // You might want to update learner profile here or trigger a toast/modal
  };

  // Define onProfileUpdate handler for MasterShifuChat
  const handleProfileUpdate = (profile: LearnerProfile) => {
    setLearnerProfile(profile);
    // Re-evaluate selected journey based on updated profile if necessary
    if (profile.progress.length > 0) {
      const currentJourney = journeys.find(j => 
        profile.progress.some(p => p.journeyId === j.id && p.overallProgress < 100)
      );
      if (currentJourney) {
        setSelectedJourney(currentJourney);
      } else {
        setSelectedJourney(null); // All journeys completed or no current in-progress journey
      }
    }
  };

  const handleLoginSuccess = (userData: any) => {
    setShowNDILogin(false);
    console.log('User authenticated:', userData);
  };

  const handleGuestMode = () => {
    const guest: NDIUser = {
      citizenId: `guest_${Date.now()}`,
      fullName: "Guest User",
      verificationStatus: "guest",
      permissions: ['view_profile', 'access_courses']
    };
    
    localStorage.setItem('guestUser', JSON.stringify(guest));
    
    setGuestUser(guest);
    setGuestMode(true);
    setShowNDILogin(false);
  };

  const getAchievements = () => {
    if (!learnerProfile) return [];
    
    return learnerProfile.achievements.map(achievement => ({
      title: achievement.title,
      description: achievement.description,
      type: achievement.type,
      earned: true,
      progress: undefined,
      total: undefined
    }));
  };

  if (showNDILogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center p-4">
        <NDILogin 
          onSuccess={handleLoginSuccess}
          onCancel={handleGuestMode}
        />
      </div>
    );
  }

  if (!isAuthenticated && !guestMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
        <Header />
        
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <div className="flex justify-center mb-6">
                <Mountain className="h-16 w-16 text-orange-600" />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text text-transparent leading-tight">
                Making Bhutan the World's First 100% Blockchain Literate Nation
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

            <Alert className="max-w-2xl mx-auto border-orange-200 bg-orange-50">
              <Mountain className="h-4 w-4" />
              <AlertDescription className="text-left">
                <strong>Welcome to the Future of Learning!</strong><br />
                Sign in with your Bhutan NDI to start your personalized Web3 education journey. 
                Your progress will be securely tracked and verified on the blockchain.
              </AlertDescription>
            </Alert>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="bg-orange-600 hover:bg-orange-700 text-lg px-8 py-4"
                onClick={() => setShowNDILogin(true)}
              >
                Start Learning with NDI
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-4 border-orange-200 hover:bg-orange-50"
                onClick={handleGuestMode}
              >
                Continue without NDI
              </Button>
            </div>

            <div className="text-center">
              <a 
                href="https://x.com/blockvocates/status/1800453480739660033" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-orange-600 hover:text-orange-700 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Learn about choosing your perfect Web3 journey</span>
              </a>
            </div>
          </div>
        </section>

        {/* Feature Highlights */}
        <section className="py-16 px-4 bg-white/50">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-gray-900">Why EduStream?</h2>
              <p className="text-gray-600">The world's first NDI-integrated Web3 learning platform</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="text-center border-2 border-orange-100">
                <CardHeader>
                  <CardTitle className="flex items-center justify-center space-x-2">
                    <Mountain className="h-6 w-6 text-orange-600" />
                    <span>NDI Integration</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Seamless authentication with Bhutan's National Digital Identity. 
                    Your learning credentials are verified and stored on the blockchain.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center border-2 border-blue-100">
                <CardHeader>
                  <CardTitle className="flex items-center justify-center space-x-2">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                    <span>AI-Guided Learning</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Master Shifu, your AI guide, provides personalized learning paths 
                    adapted to your pace and preferences.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center border-2 border-green-100">
                <CardHeader>
                  <CardTitle className="flex items-center justify-center space-x-2">
                    <Coins className="h-6 w-6 text-green-600" />
                    <span>Earn & Learn</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Earn EDU tokens and verified NDI credentials that unlock free software subscriptions, 
                    discounts at local restaurants and businesses, and recognition from top employers and academic institutions.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12 px-4">
          <div className="max-w-7xl mx-auto text-center space-y-4">
            <h3 className="text-2xl font-bold">EduStream</h3>
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
      </div>
    );
  }

  const currentUser = user || guestUser;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {showWelcome && (
          <div className="mb-8">
            <Alert className="border-green-200 bg-green-50">
              <Mountain className="h-4 w-4" />
              <AlertDescription>
                <strong>Welcome, {currentUser?.fullName}!</strong> 
                {learnerProfile && learnerProfile.progress.length > 0 
                  ? " Ready to continue your Web3 journey?" 
                  : " Let's start your Web3 adventure with Master Shifu!"
                }
                {guestMode && (
                  <span className="block mt-2 text-sm text-orange-600">
                    You're in guest mode. Sign in with NDI to save your progress and earn credentials.
                  </span>
                )}
              </AlertDescription>
            </Alert>
            
            {/* Navigation buttons */}
            <div className="flex space-x-4 mt-4">
              <Button 
                onClick={() => window.location.href = '/profile'}
                className="bg-purple-600 hover:bg-purple-700"
              >
                View Profile
              </Button>
              <Button 
                onClick={() => window.location.href = '/rewards'}
                className="bg-green-600 hover:bg-green-700"
              >
                Explore Rewards
              </Button>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Chat Interface */}
          <div className="lg:col-span-2">
            {/* Pass required props to MasterShifuChat */}
            <MasterShifuChat
              user={currentUser!}
              journeys={journeys}
              selectedJourney={selectedJourney}
              learnerProfile={learnerProfile || undefined} // Pass learnerProfile, make it optional as MasterShifuChatProps allows
              onJourneySelect={handleJourneySelect}
              onMissionStart={handleMissionStart}
              onMissionComplete={handleMissionComplete} // Added missing prop
              onCredentialEarned={handleCredentialEarned}
              onProfileUpdate={handleProfileUpdate} // Added missing prop
            />
          </div>

          {/* Sidebar with Profile and Achievements */}
          <div className="space-y-6">
            {/* Profile Stats */}
            <Card className="border-2 border-orange-100">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-orange-600" />
                  <span>Your Progress</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {learnerProfile && (() => {
                  const stats = learnerProfileService.getProfileStats(learnerProfile);
                  return (
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-orange-600">{stats.totalCredentials}</div>
                        <div className="text-xs text-gray-600">Credentials</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{stats.currentStreak}</div>
                        <div className="text-xs text-gray-600">Day Streak</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">{Math.round(stats.totalTimeSpent / 60)}h</div>
                        <div className="text-xs text-gray-600">Time Spent</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">{stats.totalAchievements}</div>
                        <div className="text-xs text-gray-600">Achievements</div>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            {getAchievements().length > 0 && (
              <Card className="border-2 border-yellow-100">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Coins className="h-5 w-5 text-yellow-600" />
                    <span>Recent Achievements</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {getAchievements().slice(-3).map((achievement, index) => (
                    <AchievementBadge key={index} achievement={achievement} />
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Daily Challenge */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Today's Challenge</h3>
              <QuizCard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
