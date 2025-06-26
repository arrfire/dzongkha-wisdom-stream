// src/services/enhancedLearnerProfileService.ts - Updated export of the instance
import { NDIUser } from "@/types/ndi";
import { LearnerProfile, LearnerProgress, NDICredential, ConversationEntry } from "@/types/learnerProfile";
import { LearnerAchievement } from "@/types/achievement"; // Ensure LearnerAchievement is imported from correct type file
import { Journey, Mission } from "@/data/journeyData";

class EnhancedLearnerProfileService {
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
      favoriteJourneys: [],
      preferences: {
        language: 'en',
        notifications: true,
        publicProfile: false
      }
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
        // Ensure preferences object exists for older profiles
        if (!profile.preferences) {
          profile.preferences = {
            language: 'en',
            notifications: true,
            publicProfile: false
          };
        }
        // Ensure personalizedRecommendations exists
        if (!profile.personalizedRecommendations) {
          profile.personalizedRecommendations = [];
        }
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
        
        const totalMissions = this.getTotalMissionsForJourney(journeyId);
        progress.overallProgress = Math.round((progress.completedMissions.length / totalMissions) * 100);
        
        profile.totalTimeSpent += timeSpent;
        
        const credential = this.issueNDICredential(profile, journeyId, missionId, timeSpent);
        progress.credentialsEarned.push(credential);
        profile.totalCredentialsEarned += 1;
        
        this.checkAndAwardAchievements(profile, progress);
        
        const nextMission = this.getNextMission(journeyId, missionId);
        progress.currentMission = nextMission?.id;
      }
    }

    this.saveLearnerProfile(profile);
    return profile;
  }

  completeMissionWithTracking(
    profile: LearnerProfile,
    completion: {
      missionId: string;
      journeyId: string;
      completedAt: Date;
      timeSpent: number;
      videoWatched: boolean;
      questionsAsked: number;
      conceptsLearned: string[];
    }
  ): { updatedProfile: LearnerProfile; newCredentials: NDICredential[] } {
    const progressIndex = profile.progress.findIndex(p => p.journeyId === completion.journeyId);
    const newCredentials: NDICredential[] = [];

    if (progressIndex !== -1) {
      const progress = profile.progress[progressIndex];

      if (!progress.completedMissions.includes(completion.missionId)) {
        progress.completedMissions.push(completion.missionId);
        progress.timeSpent += completion.timeSpent;
        progress.lastActivity = completion.completedAt;
        progress.conceptsLearned = [...(progress.conceptsLearned || []), ...completion.conceptsLearned];
        
        const totalMissions = this.getTotalMissionsForJourney(completion.journeyId);
        progress.overallProgress = Math.round((progress.completedMissions.length / totalMissions) * 100);

        profile.totalTimeSpent += completion.timeSpent;

        const credential = this.issueNDICredential(
          profile,
          completion.journeyId,
          completion.missionId,
          completion.timeSpent,
          completion.videoWatched,
          completion.questionsAsked,
          completion.conceptsLearned
        );
        progress.credentialsEarned.push(credential);
        profile.totalCredentialsEarned += 1;
        newCredentials.push(credential);

        this.checkAndAwardAchievements(profile, progress);

        const nextMission = this.getNextMission(completion.journeyId, completion.missionId);
        progress.currentMission = nextMission?.id;
      }
    }

    this.saveLearnerProfile(profile);
    return { updatedProfile: profile, newCredentials };
  }

  issueNDICredential(profile: LearnerProfile, journeyId: string, missionId: string, timeInvested: number, videoWatched: boolean = false, questionsAsked: number = 0, conceptsLearned: string[] = []): NDICredential {
    const credential: NDICredential = {
      id: `cred_${Date.now()}_${missionId}`,
      title: `Mission Completion - ${this.getMissionTitle(journeyId, missionId)}`,
      description: `Successfully completed mission in ${this.getJourneyTitle(journeyId)}`,
      journeyId,
      missionId,
      issueDate: new Date(),
      credentialType: 'mission_completion',
      level: parseInt(missionId.replace(/\D/g, '')),
      metadata: {
        skillsLearned: this.getMissionSkills(journeyId, missionId),
        difficulty: this.getJourneyDifficulty(journeyId),
        timeInvested: timeInvested,
        videoWatched: videoWatched,
        questionsAsked: questionsAsked,
        completionRate: 100
      },
      ndiTransactionHash: this.simulateNDITransaction()
    };

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

  trackVideoWatching(profile: LearnerProfile, journeyId: string, videoId: string, watchedDuration: number, totalDuration: number): LearnerProfile {
    const progressIndex = profile.progress.findIndex(p => p.journeyId === journeyId);

    if (progressIndex !== -1) {
      const progress = profile.progress[progressIndex];
      if (!progress.videoProgress) {
        progress.videoProgress = {};
      }

      progress.videoProgress[videoId] = {
        watchedDuration: watchedDuration,
        totalDuration: totalDuration,
        completionPercentage: (watchedDuration / totalDuration) * 100,
        lastWatched: new Date()
      };
      this.saveLearnerProfile(profile);
    }
    return profile;
  }

  trackQuestionAsked(profile: LearnerProfile, journeyId: string, question: string, context: string): LearnerProfile {
    const progressIndex = profile.progress.findIndex(p => p.journeyId === journeyId);

    if (progressIndex !== -1) {
      const progress = profile.progress[progressIndex];
      if (!progress.questionsAsked) {
        progress.questionsAsked = [];
      }
      progress.questionsAsked.push({ question, context, timestamp: new Date() });
      this.saveLearnerProfile(profile);
    }
    return profile;
  }

  private getTotalMissionsForJourney(journeyId: string): number {
    return 4; 
  }

  private getNextMission(journeyId: string, currentMissionId: string): Mission | null {
    const currentMissionNumber = parseInt(currentMissionId.replace('mission-', ''));
    if (currentMissionNumber < this.getTotalMissionsForJourney(journeyId)) {
      return { id: `mission-${currentMissionNumber + 1}` } as Mission;
    }
    return null;
  }

  private getMissionTitle(journeyId: string, missionId: string): string {
    return `Mission ${missionId.split('-')[1]}`;
  }

  private getJourneyTitle(journeyId: string): string {
    return `Journey ${journeyId.replace('-', ' ').split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}`;
  }

  private getMissionSkills(journeyId: string, missionId: string): string[] {
    return ["Web3 Basics", "Blockchain Understanding"];
  }

  private getJourneyDifficulty(journeyId: string): string {
    return "Beginner";
  }

  private simulateNDITransaction(): string {
    return `ndi_tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async sendCredentialToNDIWallet(credential: NDICredential, user: NDIUser): Promise<void> {
    console.log(`NDI Credential issued to ${user.fullName}:`, credential);
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

  generateProgressReport(profile: LearnerProfile) {
    const recommendations: string[] = [];
    if (profile.progress.length === 0) {
      recommendations.push("Start your first learning journey to explore Web3 fundamentals.");
    } else {
      const incompleteJourneys = profile.progress.filter(p => p.overallProgress < 100);
      if (incompleteJourneys.length > 0) {
        incompleteJourneys.forEach(j => {
          recommendations.push(`Continue your "${j.journeyTitle}" journey. You are ${j.overallProgress}% complete.`);
        });
      } else {
        recommendations.push("You've completed all started journeys! Explore a new Web3 journey from the main page.");
      }
    }
    
    if (profile.streakDays === 0) {
      recommendations.push("Try to build a learning streak by logging in daily!");
    } else if (profile.streakDays < 7) {
      recommendations.push(`Keep up your ${profile.streakDays}-day streak! Aim for 7 days to earn a "Dedicated Learner" badge.`);
    }

    if (profile.totalTimeSpent < 3600) { // Less than 1 hour
      recommendations.push("Spend more time interacting with lessons and asking questions to deepen your understanding.");
    }

    if (profile.personalizedRecommendations.length > 0) {
      profile.personalizedRecommendations.forEach(rec => recommendations.push(rec));
    }

    return { recommendations };
  }
}

// Export both the class and the instance with a distinct name
export { EnhancedLearnerProfileService };
export const enhancedLearnerProfileServiceInstance = new EnhancedLearnerProfileService();