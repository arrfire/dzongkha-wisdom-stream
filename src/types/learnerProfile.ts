// src/types/learnerProfile.ts - Updated to remove duplicate export
import { NDIUser } from "./ndi"; // Ensure NDIUser is imported

export interface LearnerAchievement {
  id: string;
  title: string;
  description: string;
  type: 'milestone' | 'skill' | 'engagement' | 'speed' | 'completion' | 'streak' | 'quiz' | 'collaboration'; // Unified types
  earned: boolean;
  earnedDate?: Date;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export interface NDICredential {
  id: string;
  title: string;
  description: string;
  journeyId: string;
  missionId: string;
  issueDate: Date;
  credentialType: 'mission_completion' | 'journey_completion' | 'skill_verification' | 'achievement' | 'level_completion';
  level?: number;
  metadata: {
    skillsLearned: string[];
    difficulty?: string;
    timeInvested: number;
    videoWatched?: boolean;
    questionsAsked?: number;
    completionRate?: number;
  };
  ndiTransactionHash?: string;
  verificationUrl?: string;
}

export interface VideoProgress {
  watchedDuration: number;
  totalDuration: number;
  completionPercentage: number;
  lastWatched: Date;
}

export interface QuestionEntry {
  question: string;
  context: string;
  timestamp: Date;
}

export interface ConversationEntry { // Exported this interface
  timestamp: Date;
  userMessage: string;
  aiResponse: string;
  context: any;
}

export interface LearnerProgress { // Removed duplicate export here
  journeyId: string;
  journeyTitle: string;
  completedMissions: string[];
  currentMission?: string;
  overallProgress: number;
  credentialsEarned: NDICredential[];
  timeSpent: number;
  lastActivity: Date;
  conceptsLearned?: string[];
  videoProgress?: { [videoId: string]: VideoProgress };
  questionsAsked?: QuestionEntry[];
}

export interface LearnerProfile {
  ndiUser: NDIUser;
  joinDate: Date;
  lastLoginDate: Date;
  totalLogins: number;
  streakDays: number;
  longestStreak: number;
  totalTimeSpent: number;
  totalCredentialsEarned: number;
  favoriteJourneys: string[];
  progress: LearnerProgress[];
  achievements: LearnerAchievement[];
  conversationHistory: ConversationEntry[];
  preferredLearningStyle: 'mixed' | 'visual' | 'reading' | 'hands-on' | 'social';
  difficultyPreference: 'adaptive' | 'beginner' | 'intermediate' | 'advanced';
  personalizedRecommendations: string[];
  preferences: {
    language: 'en' | 'dz';
    notifications: boolean;
    publicProfile: boolean;
  };
}