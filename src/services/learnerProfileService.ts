// src/services/learnerProfileService.ts
import { NDIUser } from "@/types/ndi";
import { LearnerProfile, LearnerProgress, NDICredential, ConversationEntry } from "@/types/learnerProfile";
import { LearnerAchievement } from "@/types/achievement";
import { Journey, Mission } from "@/data/journeyData";

class LearnerProfileService {
  private readonly STORAGE_KEY = 'edustream_learner_profile';

  createLearnerProfile(ndiUser: NDIUser): LearnerProfile {
    const profile: LearnerProfile = {
      ndiUser,
      progress: [],
      totalCredentialsEarned: 0,
      totalTimeSpent: 0,
      preferredLearningStyle: 'mixed',
      difficultyPreference: 'adaptive',
      conversationHistory: [],
      personalizedRecommendations: [],
      streakDays: 0,
      longestStreak: 0,
      achievements: [],
      joinDate: new Date(),
      lastLoginDate: new Date(),
      totalLogins: 1,
      favoriteJourneys: []
    };

    this.saveLearnerProfile(profile);
    return profile;
  }

  getLearnerProfile(): LearnerProfile | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const profile = JSON.parse(stored);
        // Convert date strings back to Date objects
        profile.joinDate = new Date(profile.joinDate);
        profile.lastLoginDate = new Date(profile.lastLoginDate);
        profile.progress.forEach((p: LearnerProgress) => {
          p.lastActivity = new Date(p.lastActivity);
          p.credentialsEarned.forEach((c: NDICredential) => {
            c.issueDate = new Date(c.issueDate);
          });
        });
        profile.conversationHistory.forEach((c: ConversationEntry) => {
          c.timestamp = new Date(c.timestamp);
        });
        profile.achievements.forEach((a: LearnerAchievement) => {
          a.earnedDate = new Date(a.earnedDate);
        });
        return profile;
      }
    } catch (error) {
      console.error('Error loading learner profile:', error);
    }
    return null;
  }

  saveLearnerProfile(profile: LearnerProfile): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(profile));
    } catch (error) {
      console.error('Error saving learner profile:', error);
    }
  }

  updateLoginActivity(profile: LearnerProfile): LearnerProfile {
    const today = new Date().toDateString();
    const lastLogin = profile.lastLoginDate.toDateString();
    
    if (today !== lastLogin) {
      const daysDiff = Math.floor((new Date().getTime() - profile.lastLoginDate.getTime()) / (1000 * 3600 * 24));
      
      if (daysDiff === 1) {
        // Consecutive day
        profile.streakDays += 1;
        profile.longestStreak = Math.max(profile.longestStreak, profile.streakDays);
      } else if (daysDiff > 1) {
        // Streak broken
        profile.streakDays = 1;
      }
      
      profile.lastLoginDate = new Date();
      profile.totalLogins += 1;
    }

    this.saveLearnerProfile(profile);
    return profile;
  }

  startJourney(profile: LearnerProfile, journey: Journey): LearnerProfile {
    const existingProgress = profile.progress.find(p => p.journeyId === journey.id);
    
    if (!existingProgress) {
      const newProgress: LearnerProgress = {
        journeyId: journey.id,
        journeyTitle: journey.title,
        completedMissions: [],
        currentMission: journey.missions[0]?.id,
        overallProgress: 0,
        credentialsEarned: [],
        timeSpent: 0,
        lastActivity: new Date()
      };
      
      profile.progress.push(newProgress);
      
      if (!profile.favoriteJourneys.includes(journey.id)) {
        profile.favoriteJourneys.push(journey.id);
      }
      
      // Award journey start achievement
      this.awardAchievement(profile, {
        id: `journey_start_${journey.id}`,
        title: `${journey.title} Explorer`,
        description: `Started the ${journey.title} learning journey`,
        type: 'milestone',
        earned: true,
        earnedDate: new Date(),
        rarity: 'common'
      });
    }

    this.saveLearnerProfile(profile);
    return profile;
  }

  completeMission(profile: LearnerProfile, journeyId: string, missionId: string, timeSpent: number): LearnerProfile {
    const progressIndex = profile.progress.findIndex(p => p.journeyId === journeyId);
    
    if (progressIndex !== -1) {
      const progress = profile.progress[progressIndex];
      
      if (!progress.completedMissions.includes(missionId)) {
        progress.completedMissions.push(missionId);
        progress.timeSpent += timeSpent;
        progress.lastActivity = new Date();
        
        // Update overall progress
        const totalMissions = this.getTotalMissionsForJourney(journeyId);
        progress.overallProgress = Math.round((progress.completedMissions.length / totalMissions) * 100);
        
        // Update profile totals
        profile.totalTimeSpent += timeSpent;
        
        // Issue NDI credential
        const credential = this.issueNDICredential(profile, journeyId, missionId, timeSpent);
        progress.credentialsEarned.push(credential);
        profile.totalCredentialsEarned += 1;
        
        // Check for achievements
        this.checkAndAwardAchievements(profile, progress);
        
        // Move to next mission
        const nextMission = this.getNextMission(journeyId, missionId);
        progress.currentMission = nextMission?.id;
      }
    }

    this.saveLearnerProfile(profile);
    return profile;
  }

  issueNDICredential(profile: LearnerProfile, journeyId: string, missionId: string, timeSpent: number): NDICredential {
    const credential: NDICredential = {
      id: `cred_${Date.now()}_${missionId}`,
      title: `Mission Completion - ${this.getMissionTitle(journeyId, missionId)}`,
      description: `Successfully completed mission in ${this.getJourneyTitle(journeyId)}`,
      journeyId,
      missionId,
      issueDate: new Date(),
      credentialType: 'mission_completion',
      metadata: {
        skillsLearned: this.getMissionSkills(journeyId, missionId),
        difficulty: this.getJourneyDifficulty(journeyId),
        timeInvested: timeSpent
      },
      ndiTransactionHash: this.simulateNDITransaction()
    };

    // In a real implementation, this would send the credential to the NDI wallet
    this.sendCredentialToNDIWallet(credential, profile.ndiUser);
    
    return credential;
  }

  addConversationEntry(profile: LearnerProfile, userMessage: string, aiResponse: string, context: any): LearnerProfile {
    const entry: ConversationEntry = {
      timestamp: new Date(),
      userMessage,
      aiResponse,
      context
    };

    profile.conversationHistory.push(entry);
    
    // Keep only last 100 conversations to manage storage
    if (profile.conversationHistory.length > 100) {
      profile.conversationHistory = profile.conversationHistory.slice(-100);
    }

    this.saveLearnerProfile(profile);
    return profile;
  }

  awardAchievement(profile: LearnerProfile, achievement: LearnerAchievement): void {
    const exists = profile.achievements.find(a => a.id === achievement.id);
    if (!exists) {
      profile.achievements.push(achievement);
    }
  }

  checkAndAwardAchievements(profile: LearnerProfile, progress: LearnerProgress): void {
    // First mission achievement
    if (progress.completedMissions.length === 1) {
      this.awardAchievement(profile, {
        id: 'first_mission',
        title: 'First Steps',
        description: 'Completed your first mission',
        type: 'milestone',
        earned: true,
        earnedDate: new Date(),
        rarity: 'common'
      });
    }

    // Journey completion achievement
    const totalMissions = this.getTotalMissionsForJourney(progress.journeyId);
    if (progress.completedMissions.length === totalMissions) {
      this.awardAchievement(profile, {
        id: `journey_complete_${progress.journeyId}`,
        title: `${progress.journeyTitle} Master`,
        description: `Completed the entire ${progress.journeyTitle} journey`,
        type: 'completion',
        earned: true,
        earnedDate: new Date(),
        rarity: 'epic'
      });
    }

    // Streak achievements
    if (profile.streakDays === 7) {
      this.awardAchievement(profile, {
        id: 'week_streak',
        title: 'Dedicated Learner',
        description: 'Learned for 7 consecutive days',
        type: 'streak',
        earned: true,
        earnedDate: new Date(),
        rarity: 'rare'
      });
    }

    // Time-based achievements
    if (profile.totalTimeSpent >= 600) { // 10 hours
      this.awardAchievement(profile, {
        id: 'time_investor',
        title: 'Time Investor',
        description: 'Spent 10+ hours learning',
        type: 'milestone',
        earned: true,
        earnedDate: new Date(),
        rarity: 'rare'
      });
    }
  }

  // Helper methods
  private getTotalMissionsForJourney(journeyId: string): number {
    // This would typically fetch from journey data
    return 4; // Default assumption
  }

  private getNextMission(journeyId: string, currentMissionId: string): Mission | null {
    // This would typically fetch from journey data
    return null;
  }

  private getMissionTitle(journeyId: string, missionId: string): string {
    return "Mission Title"; // Placeholder
  }

  private getJourneyTitle(journeyId: string): string {
    return "Journey Title"; // Placeholder
  }

  private getMissionSkills(journeyId: string, missionId: string): string[] {
    return ["Web3 Basics", "Blockchain Understanding"]; // Placeholder
  }

  private getJourneyDifficulty(journeyId: string): string {
    return "Beginner"; // Placeholder
  }

  private simulateNDITransaction(): string {
    return `ndi_tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async sendCredentialToNDIWallet(credential: NDICredential, user: NDIUser): Promise<void> {
    // In a real implementation, this would:
    // 1. Create a verifiable credential
    // 2. Send it to the user's NDI wallet
    // 3. Record the transaction on blockchain
    
    console.log(`NDI Credential issued to ${user.fullName}:`, credential);
    
    // Simulate API call to NDI system
    try {
      console.log('Credential successfully sent to NDI wallet');
    } catch (error) {
      console.error('Failed to send credential to NDI wallet:', error);
    }
  }

  getProfileStats(profile: LearnerProfile) {
    return {
      totalJourneysStarted: profile.progress.length,
      totalJourneysCompleted: profile.progress.filter(p => p.overallProgress === 100).length,
      totalMissionsCompleted: profile.progress.reduce((sum, p) => sum + p.completedMissions.length, 0),
      totalTimeSpent: profile.totalTimeSpent,
      totalCredentials: profile.totalCredentialsEarned,
      currentStreak: profile.streakDays,
      longestStreak: profile.longestStreak,
      totalAchievements: profile.achievements.length
    };
  }
}

export const learnerProfileService = new LearnerProfileService();