// src/components/ProfilePage.tsx - Comprehensive learner profile with credentials and integrations
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  User, Award, Github, Globe, Calendar, MapPin, Mail, 
  ExternalLink, Shield, Coins, BookOpen, Trophy, 
  Star, TrendingUp, CheckCircle, Download
} from "lucide-react";
import { NDIUser } from "@/types/ndi";
import { LearnerProfile, NDICredential } from "@/types/learnerProfile";
import { Journey } from "@/data/journeyData";

interface ProfilePageProps {
  user: NDIUser;
  learnerProfile: LearnerProfile;
  selectedJourney?: Journey;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  user,
  learnerProfile,
  selectedJourney
}) => {
  const [ensName, setEnsName] = useState('');
  const [githubUsername, setGithubUsername] = useState('');
  const [isConnectingENS, setIsConnectingENS] = useState(false);
  const [isConnectingGithub, setIsConnectingGithub] = useState(false);

  const handleConnectENS = async () => {
    setIsConnectingENS(true);
    // Simulate ENS connection
    setTimeout(() => {
      setIsConnectingENS(false);
      console.log('ENS connected:', ensName);
    }, 2000);
  };

  const handleConnectGithub = async () => {
    setIsConnectingGithub(true);
    // Simulate GitHub connection
    setTimeout(() => {
      setIsConnectingGithub(false);
      console.log('GitHub connected:', githubUsername);
    }, 2000);
  };

  const downloadCredential = (credential: NDICredential) => {
    // Simulate credential download
    const credentialData = {
      id: credential.id,
      holder: user.fullName,
      issuer: "EduStream Bhutan",
      issued: credential.issueDate,
      credential: credential.title,
      verified: true,
      ndiHash: credential.ndiTransactionHash
    };
    
    const blob = new Blob([JSON.stringify(credentialData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${credential.title.replace(/\s+/g, '_')}_credential.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getTotalCredentials = () => {
    return learnerProfile.progress.reduce((total, progress) => 
      total + progress.credentialsEarned.length, 0
    );
  };

  const getCompletionRate = () => {
    if (learnerProfile.progress.length === 0) return 0;
    const totalProgress = learnerProfile.progress.reduce((sum, p) => sum + p.overallProgress, 0);
    return Math.round(totalProgress / learnerProfile.progress.length);
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Profile Header with Go Home Button */}
      <div className="flex items-center justify-between mb-6">
        <Button 
          onClick={handleGoHome}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <ExternalLink className="h-4 w-4" />
          <span>Go Back Home</span>
        </Button>
      </div>

      {/* Profile Header */}
      <Card className="border-2 border-orange-100 bg-gradient-to-r from-orange-50 to-red-50">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
            <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
              <AvatarImage src="/default-avatar.png" alt={user.fullName} />
              <AvatarFallback className="text-2xl font-bold bg-orange-500 text-white">
                {user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-900">{user.fullName}</h1>
              <div className="flex items-center justify-center md:justify-start space-x-2 mt-2">
                <Badge className="bg-orange-100 text-orange-800">
                  <Shield className="h-3 w-3 mr-1" />
                  {user.verificationStatus === 'guest' ? 'Guest Learner' : 'NDI Verified'}
                </Badge>
                {selectedJourney && (
                  <Badge variant="outline">
                    {selectedJourney.title} Explorer
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-center md:justify-start space-x-4 mt-3 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {learnerProfile.joinDate.toLocaleDateString()}</span>
                </div>
                {user.institution && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{user.institution}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-orange-600">{getTotalCredentials()}</div>
                <div className="text-xs text-gray-600">Credentials</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{learnerProfile.streakDays}</div>
                <div className="text-xs text-gray-600">Day Streak</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{getCompletionRate()}%</div>
                <div className="text-xs text-gray-600">Completion</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Tabs */}
      <Tabs defaultValue="credentials" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="credentials">Credentials</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        {/* Credentials Tab */}
        <TabsContent value="credentials" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-yellow-600" />
                <span>EduStream NDI Credentials</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {learnerProfile.progress.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No credentials earned yet. Start your learning journey!</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {learnerProfile.progress.flatMap(progress => 
                    progress.credentialsEarned.map(credential => (
                      <Card key={credential.id} className="border border-green-200 bg-green-50">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-bold text-green-800">{credential.title}</h4>
                              <p className="text-sm text-green-600">{credential.description}</p>
                            </div>
                            <Badge className="bg-green-100 text-green-800">
                              {credential.credentialType.replace('_', ' ')}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2 text-xs text-gray-600">
                            <div className="flex justify-between">
                              <span>Issued:</span>
                              <span>{credential.issueDate.toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Skills:</span>
                              <span>{credential.metadata.skillsLearned.join(', ')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>NDI Hash:</span>
                              <span className="font-mono text-xs break-all">
                                {credential.ndiTransactionHash?.slice(0, 10)}...
                              </span>
                            </div>
                          </div>

                          <Button 
                            onClick={() => downloadCredential(credential)}
                            className="w-full mt-3 bg-green-600 hover:bg-green-700"
                            size="sm"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download Credential
                          </Button>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span>Learning Progress</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {learnerProfile.progress.map(progress => (
                <div key={progress.journeyId} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold">{progress.journeyTitle}</h4>
                    <Badge variant="outline">{progress.overallProgress}% Complete</Badge>
                  </div>
                  
                  <Progress value={progress.overallProgress} className="mb-3" />
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Missions:</span>
                      <div className="font-bold">{progress.completedMissions.length}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Time Spent:</span>
                      <div className="font-bold">{Math.round(progress.timeSpent / 60)}h</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Credentials:</span>
                      <div className="font-bold">{progress.credentialsEarned.length}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Last Activity:</span>
                      <div className="font-bold">{progress.lastActivity.toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-purple-600" />
                <span>Achievements & Milestones</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {learnerProfile.achievements.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No achievements yet. Keep learning to unlock badges!</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-3 gap-4">
                  {learnerProfile.achievements.map(achievement => (
                    <Card key={achievement.id} className="text-center border-2 border-purple-100">
                      <CardContent className="p-4">
                        <div className={`h-16 w-16 mx-auto mb-3 rounded-full flex items-center justify-center ${
                          achievement.rarity === 'common' ? 'bg-gray-100' :
                          achievement.rarity === 'rare' ? 'bg-blue-100' :
                          achievement.rarity === 'epic' ? 'bg-purple-100' :
                          'bg-yellow-100'
                        }`}>
                          <Trophy className={`h-8 w-8 ${
                            achievement.rarity === 'common' ? 'text-gray-600' :
                            achievement.rarity === 'rare' ? 'text-blue-600' :
                            achievement.rarity === 'epic' ? 'text-purple-600' :
                            'text-yellow-600'
                          }`} />
                        </div>
                        <h4 className="font-bold">{achievement.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                        <Badge variant="outline" className="capitalize">
                          {achievement.rarity}
                        </Badge>
                        <div className="text-xs text-gray-500 mt-2">
                          {achievement.earnedDate.toLocaleDateString()}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* ENS Integration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-blue-600" />
                  <span>ENS Domain</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Connect your Ethereum Name Service domain to showcase your Web3 identity.
                </p>
                <div className="flex space-x-2">
                  <Input
                    placeholder="yourname.eth"
                    value={ensName}
                    onChange={(e) => setEnsName(e.target.value)}
                  />
                  <Button 
                    onClick={handleConnectENS}
                    disabled={!ensName || isConnectingENS}
                  >
                    {isConnectingENS ? 'Connecting...' : 'Connect'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* GitHub Integration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Github className="h-5 w-5 text-gray-800" />
                  <span>GitHub Profile</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Connect your GitHub to showcase your development skills and contributions.
                </p>
                <div className="flex space-x-2">
                  <Input
                    placeholder="your-username"
                    value={githubUsername}
                    onChange={(e) => setGithubUsername(e.target.value)}
                  />
                  <Button 
                    onClick={handleConnectGithub}
                    disabled={!githubUsername || isConnectingGithub}
                  >
                    {isConnectingGithub ? 'Connecting...' : 'Connect'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Portfolio Showcase */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-600" />
                <span>Portfolio Showcase</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Your EduStream profile serves as a comprehensive portfolio for employers and collaborators.
              </p>
              <div className="flex space-x-4">
                <Button className="bg-orange-600 hover:bg-orange-700">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Share Profile
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Resume
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;
