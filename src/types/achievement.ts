// src/types/achievement.ts - SYNCHRONIZED
export interface Achievement {
  title: string;
  description: string;
  type: "streak" | "completion" | "quiz" | "milestone" | "collaboration" | "skill" | "engagement" | "speed"; // Unified types
  earned: boolean;
  progress?: number;
  total?: number;
}

export interface LearnerAchievement {
  id: string;
  title: string;
  description: string;
  type: "streak" | "completion" | "quiz" | "milestone" | "collaboration" | "skill" | "engagement" | "speed"; // Unified types
  earned: boolean;
  earnedDate: Date;
  iconUrl?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}