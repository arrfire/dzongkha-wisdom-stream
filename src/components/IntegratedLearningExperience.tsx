
// src/components/IntegratedLearningExperience.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, Video, Award, BookOpen, Target, 
  Sparkles, TrendingUp, Clock, CheckCircle
} from "lucide-react";
import { Journey } from "@/data/journeyData";
import { NDIUser } from "@/types/ndi";
import { LearnerProfile, NDICredential } from "@/types/learnerProfile";
import EnhancedMasterShifuChat from "./EnhancedMasterShifuChat";
import EnhancedVideoLessonDisplay from "./EnhancedVideoLessonDisplay";
import { enhancedLearnerProfileServiceInstance } from "@/services/enhancedLearnerProfileService";

interface IntegratedLearningExperienceProps {
  user: NDIUser;
  journeys: Journey[];
  selectedJourney?: Journey;
  learnerProfile: LearnerProfile;
  onJourneySelect: (journeyId: string) => void;
  onProfileUpdate: (profile: LearnerProfile) => void;
}

const IntegratedLearningExperience: React.FC<IntegratedLearningExperienceProps> = ({
  user,
  journeys,
  selectedJourney,
  learnerProfile,
  onJourneySelect,
  onProfileUpdate
}) => {
  const [currentMission, setCurrentMission] = useState<string>('mission-1');
  const [activeTab, setActiveTab] = useState<'chat' | 'video' | 'progress'>('chat');
  const [newCredentials, setNewCredentials] = useState<NDICredential[]>([]);
  const [showCredentialModal, setShowCredentialModal] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    timeSpent: 0,
    conceptsLearned: 0,
    questionsAsked: 0,
    videosWatched: 0
  });

  // Get current progress for selected journey
  const currentProgress = selectedJourney 
    ? learnerProfile.progress.find(p => p.journeyId === selectedJourney.id)
    : null;

  // Determine current mission based on progress
  useEffect(() => {
    if (currentProgress && currentProgress.currentMission) {
      setCurrentMission(currentProgress.currentMission);
    }
  }, [currentProgress]);

  // Track session statistics
  useEffect(() => {
    const interval = setInterval(() => {
      setSessionStats(prev => ({
        ...prev,
        timeSpent: prev.timeSpent + 1
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleMissionStart = (missionId: string) => {
    setCurrentMission(missionId);
    setActiveTab('video'); // Switch to video tab when starting a mission
  };

  const handleMissionComplete = (missionId: string, timeSpent: number, concepts: string[]) => {
    if (!selectedJourney) return;

    const completion = {
      missionId,
      journeyId: selectedJourney.id,
      completedAt: new Date(),
      timeSpent,
      videoWatched: true,
      questionsAsked: sessionStats.questionsAsked,
      conceptsLearned: concepts
    };

    const { updatedProfile, newCredentials: earnedCredentials } = 
      enhancedLearnerProfileServiceInstance.completeMissionWithTracking(learnerProfile, completion);
    
    onProfileUpdate(updatedProfile);
    
    if (earnedCredentials.length > 0) {
      setNewCredentials(earnedCredentials);
      setShowCredentialModal(true);
    }

    // Update session stats
    setSessionStats(prev => ({
      ...prev,
      conceptsLearned: prev.conceptsLearned + concepts.length,
      videosWatched: prev.videosWatched + 1
    }));

    // Move to next mission
    const nextMissionNumber = parseInt(missionId.replace(/\D/g, '')) + 1;
    if (nextMissionNumber <= 4) {
      setCurrentMission(`mission-${nextMissionNumber}`);
    }
  };

  const handleCredentialEarned = (credential: NDICredential) => {
    setNewCredentials([credential]);
    setShowCredentialModal(true);
  };

  const handleQuestionAsked = () => {
    setSessionStats(prev => ({
      ...prev,
      questionsAsked: prev.questionsAsked + 1
    }));
  };

  const getCredentialLevel = (credentials: NDICredential[]): number => {
    return credentials.reduce((max, cred) => Math.max(max, cred.level || 1), 0);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header with Progress Overview */}
      <div className="bg-white border-b border-orange-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {selectedJourney ? selectedJourney.title : 'Choose Your Journey'}
                </h1>
                <p className="text-gray-600">
                  {selectedJourney ? `Mission ${currentMission.split('-')[1]} of 4` : 'Select a learning path to begin'}
                </p>
              </div>
            </div>

            {selectedJourney && currentProgress && (
              <div className="flex items-center space-x-6">
                {/* Journey Progress */}
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {currentProgress.overallProgress}%
                  </div>
                  <div className="text-xs text-gray-600">Complete</div>
                </div>

                {/* Credentials Earned */}
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {getCredentialLevel(currentProgress.credentialsEarned)}
                  </div>
                  <div className="text-xs text-gray-600">Level</div>
                </div>

                {/* Session Time */}
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatTime(sessionStats.timeSpent)}
                  </div>
                  <div className="text-xs text-gray-600">Session</div>
                </div>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {selectedJourney && currentProgress && (
            <div className="mt-4">
              <Progress 
                value={currentProgress.overallProgress} 
                className="h-2 bg-orange-100" 
              />
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Sidebar - Session Stats */}
          <div className="lg:col-span-3 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span>Session Stats</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">{sessionStats.conceptsLearned}</div>
                    <div className="text-xs text-gray-600">Concepts</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-600">{sessionStats.questionsAsked}</div>
                    <div className="text-xs text-gray-600">Questions</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-lg font-bold text-purple-600">{sessionStats.videosWatched}</div>
                    <div className="text-xs text-gray-600">Videos</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-lg font-bold text-orange-600">{formatTime(sessionStats.timeSpent)}</div>
                    <div className="text-xs text-gray-600">Time</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mission Navigation */}
            {selectedJourney && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Target className="h-5 w-5 text-purple-600" />
                    <span>Missions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[1, 2, 3, 4].map(num => {
                    const missionId = `mission-${num}`;
                    const isCompleted = currentProgress?.completedMissions.includes(missionId);
                    const isCurrent = currentMission === missionId;
                    
                    return (
                      <div
                        key={missionId}
                        className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all ${
                          isCurrent 
                            ? 'bg-orange-100 border-2 border-orange-300' 
                            : isCompleted 
                              ? 'bg-green-50 border border-green-200'
                              : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                        }`}
                        onClick={() => setCurrentMission(missionId)}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          isCompleted 
                            ? 'bg-green-500 text-white' 
                            : isCurrent 
                              ? 'bg-orange-500 text-white'
                              : 'bg-gray-300 text-gray-600'
                        }`}>
                          {isCompleted ? <CheckCircle className="h-4 w-4" /> : num}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">Mission {num}</div>
                          <div className="text-xs text-gray-500">
                            {isCompleted ? 'Completed' : isCurrent ? 'In Progress' : 'Locked'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9">
            <Card className="min-h-[600px]">
              <CardHeader>
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="chat" className="flex items-center space-x-2">
                      <MessageSquare className="h-4 w-4" />
                      <span>Chat with Master Shifu</span>
                    </TabsTrigger>
                    <TabsTrigger value="video" className="flex items-center space-x-2">
                      <Video className="h-4 w-4" />
                      <span>Video Lesson</span>
                    </TabsTrigger>
                    <TabsTrigger value="progress" className="flex items-center space-x-2">
                      <Award className="h-4 w-4" />
                      <span>Progress & Credentials</span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>

              <CardContent className="p-0">
                <Tabs value={activeTab} className="w-full">
                  {/* Master Shifu Chat Tab */}
                  <TabsContent value="chat" className="h-[600px] mt-0">
                    <EnhancedMasterShifuChat
                      user={user}
                      journeys={journeys}
                      selectedJourney={selectedJourney}
                      learnerProfile={learnerProfile}
                      onJourneySelect={onJourneySelect}
                      onMissionStart={handleMissionStart}
                      onMissionComplete={(missionId, timeSpent) => handleMissionComplete(missionId, timeSpent, [])}
                      onCredentialEarned={handleCredentialEarned}
                      onProfileUpdate={onProfileUpdate}
                    />
                  </TabsContent>

                  {/* Video Lesson Tab */}
                  <TabsContent value="video" className="mt-0">
                    {selectedJourney ? (
                      <div className="p-6">
                        <EnhancedVideoLessonDisplay
                          journey={selectedJourney}
                          missionId={currentMission}
                          learnerProfile={learnerProfile}
                          onProgressUpdate={onProfileUpdate}
                          onMissionComplete={handleMissionComplete}
                        />
                      </div>
                    ) : (
                      <div className="p-6 text-center">
                        <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">
                          Select a Journey First
                        </h3>
                        <p className="text-gray-500 mb-4">
                          Choose your learning path in the chat to access video lessons.
                        </p>
                        <Button onClick={() => setActiveTab('chat')}>
                          Go to Chat
                        </Button>
                      </div>
                    )}
                  </TabsContent>

                  {/* Progress & Credentials Tab */}
                  <TabsContent value="progress" className="mt-0">
                    <div className="p-6 space-y-6">
                      {/* Progress Overview */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="border-blue-200 bg-blue-50">
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {learnerProfile.progress.reduce((sum, p) => sum + p.completedMissions.length, 0)}
                            </div>
                            <div className="text-sm text-gray-600">Total Missions</div>
                          </CardContent>
                        </Card>

                        <Card className="border-purple-200 bg-purple-50">
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-purple-600">
                              {learnerProfile.totalCredentialsEarned}
                            </div>
                            <div className="text-sm text-gray-600">Credentials Earned</div>
                          </CardContent>
                        </Card>

                        <Card className="border-green-200 bg-green-50">
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {learnerProfile.streakDays}
                            </div>
                            <div className="text-sm text-gray-600">Day Streak</div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Recent Credentials */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <Award className="h-5 w-5 text-yellow-600" />
                            <span>Recent Credentials</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {learnerProfile.progress.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                              <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                              <p>No credentials earned yet. Complete missions to earn your first credential!</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {learnerProfile.progress
                                .flatMap(p => p.credentialsEarned)
                                .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())
                                .slice(0, 5)
                                .map((credential, index) => (
                                  <div key={credential.id} className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                                      <Award className="h-5 w-5 text-yellow-600" />
                                    </div>
                                    <div className="flex-1">
                                      <h4 className="font-semibold text-yellow-800">{credential.title}</h4>
                                      <p className="text-sm text-yellow-700">{credential.description}</p>
                                      <div className="flex items-center space-x-2 mt-1">
                                        <Badge variant="secondary">Level {credential.level || 1}</Badge>
                                        <span className="text-xs text-gray-500">
                                          {new Date(credential.issueDate).toLocaleDateString()}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Learning Recommendations */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <Sparkles className="h-5 w-5 text-indigo-600" />
                            <span>Personalized Recommendations</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {enhancedLearnerProfileServiceInstance.generateProgressReport(learnerProfile).recommendations.map((rec, index) => (
                              <div key={index} className="flex items-start space-x-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                                <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0" />
                                <p className="text-sm text-indigo-800">{rec}</p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Credential Earned Modal */}
      {showCredentialModal && newCredentials.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-md mx-4 border-yellow-200 shadow-2xl">
            <CardHeader className="text-center bg-gradient-to-r from-yellow-50 to-orange-50">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-yellow-600" />
              </div>
              <CardTitle className="text-xl text-yellow-800">
                🎉 Credential Earned!
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 text-center">
              {newCredentials.map(credential => (
                <div key={credential.id} className="space-y-3">
                  <h3 className="text-lg font-bold text-gray-800">{credential.title}</h3>
                  <p className="text-gray-600">{credential.description}</p>
                  <Badge variant="secondary" className="text-sm">
                    Level {credential.level} Achievement
                  </Badge>
                  <div className="text-xs text-gray-500 mt-2">
                    Issued: {new Date(credential.issueDate).toLocaleDateString()}
                  </div>
                </div>
              ))}
              <div className="flex space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowCredentialModal(false)}
                  className="flex-1"
                >
                  Continue Learning
                </Button>
                <Button
                  onClick={() => {
                    setShowCredentialModal(false);
                    setActiveTab('progress');
                  }}
                  className="flex-1"
                >
                  View All Credentials
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default IntegratedLearningExperience;
