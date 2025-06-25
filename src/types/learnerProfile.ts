// src/types/learnerProfile.ts
import { NDIUser } from "./ndi";
import { LearnerAchievement } from "./achievement";

export interface LearnerProgress {
  journeyId: string;
  journeyTitle: string;
  completedMissions: string[];
  currentMission?: string;
  overallProgress: number;
  credentialsEarned: NDICredential[];
  timeSpent: number; // in minutes
  lastActivity: Date;
}

export interface NDICredential {
  id: string;
  title: string;
  description: string;
  journeyId: string;
  missionId: string;
  issueDate: Date;
  credentialType: 'mission_completion' | 'journey_completion' | 'skill_verification' | 'achievement';
  metadata: {
    skillsLearned: string[];
    difficulty: string;
    timeInvested: number;
  };
  ndiTransactionHash?: string; // For blockchain verification
}

export interface LearnerProfile {
  // NDI Data
  ndiUser: NDIUser;
  
  // Learning Progress
  progress: LearnerProgress[];
  totalCredentialsEarned: number;
  totalTimeSpent: number;
  
  // Preferences
  preferredLearningStyle: 'visual' | 'auditory' | 'hands-on' | 'mixed';
  difficultyPreference: 'beginner' | 'intermediate' | 'advanced' | 'adaptive';
  
  // AI Interaction
  conversationHistory: ConversationEntry[];
  personalizedRecommendations: string[];
  
  // Achievements
  streakDays: number;
  longestStreak: number;
  achievements: LearnerAchievement[];
  
  // Platform Engagement
  joinDate: Date;
  lastLoginDate: Date;
  totalLogins: number;
  favoriteJourneys: string[];
}

export interface ConversationEntry {
  timestamp: Date;
  userMessage: string;
  aiResponse: string;
  context: {
    currentJourney?: string;
    currentMission?: string;
    userEmotion?: 'excited' | 'confused' | 'frustrated' | 'motivated';
  };
}