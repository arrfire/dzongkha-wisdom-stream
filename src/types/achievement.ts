// src/types/achievement.ts
export interface Achievement {
  title: string;
  description: string;
  type: "streak" | "completion" | "quiz" | "milestone" | "collaboration";
  earned: boolean;
  progress?: number;
  total?: number;
}

export interface LearnerAchievement {
  id: string;
  title: string;
  description: string;
  type: "streak" | "completion" | "quiz" | "milestone" | "collaboration";
  earned: boolean;
  earnedDate: Date;
  iconUrl?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}