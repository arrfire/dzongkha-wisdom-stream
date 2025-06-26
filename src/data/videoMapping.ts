// src/data/videoMapping.ts - Video mapping based on Blockvocates Transcripts
export interface VideoLesson {
  id: string;
  title: string;
  youtubeId: string;
  description: string;
  duration?: string;
}

export interface JourneyVideoMapping {
  [journeyId: string]: {
    missions: {
      [missionId: string]: VideoLesson[];
    };
    introVideo?: VideoLesson;
  };
}

// Extract YouTube video IDs from URLs
const extractVideoId = (url: string): string => {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return match ? match[1] : '';
};

export const blockvocatesVideoMapping: JourneyVideoMapping = {
  // Common to all paths
  'common': {
    missions: {
      'intro': [{
        id: 'intro-blockvocates',
        title: 'Intro to Blockvocates',
        youtubeId: extractVideoId('https://www.youtube.com/watch?v=dKYncXmM8P4&t=8s'),
        description: 'Welcome to Blockvocates - your structured Web3 learning journey'
      }],
      'identity-1': [{
        id: 'create-identity-1',
        title: 'Create your Identity - Part 1',
        youtubeId: extractVideoId('https://www.youtube.com/watch?v=o7bq7oEuSgU'),
        description: 'Learn why identity is crucial in blockchain and start building your Web3 presence'
      }],
      'identity-2': [{
        id: 'create-identity-2',
        title: 'Create your Identity - Part 2',
        youtubeId: extractVideoId('https://www.youtube.com/watch?v=X5ygRVEQDtU'),
        description: 'Detailed walkthrough of setting up Rainbow wallet and Web3 social accounts'
      }],
      'read-write-own': [{
        id: 'read-write-own',
        title: 'Read, Write, Own',
        youtubeId: extractVideoId('https://www.youtube.com/watch?v=bNd0UOE2l_U'),
        description: 'Understanding the fundamental concept of Read, Write, Own in Web3'
      }]
    }
  },

  // Community Builder Journey
  'community-builder': {
    missions: {
      'mission-3': [{
        id: 'community-builder-mission-3',
        title: 'Mission 3 - Community Builder',
        youtubeId: extractVideoId('https://www.youtube.com/watch?v=A7pYjzKBeps'),
        description: 'Learn how to build and engage with blockchain communities'
      }],
      'mission-4': [{
        id: 'community-builder-mission-4',
        title: 'Mission 4 - Discover Your Ideal Blockchain Community Match',
        youtubeId: extractVideoId('https://www.youtube.com/watch?v=2VTBIZwHgJo&list=PLu5uVQa771ej9_qP5zs4VoaCPoWZltURJ&index=6'),
        description: 'Find and join blockchain communities that align with your interests'
      }]
    }
  },

  // Digital Trader Journey  
  'digital-trader': {
    missions: {
      'mission-3': [{
        id: 'crypto-trader-mission-3',
        title: 'Mission 3 - Trade Crypto on CEX & DEX',
        youtubeId: extractVideoId('https://www.youtube.com/watch?v=V3lJD2Z3z0s'),
        description: 'Set up centralized and decentralized exchange accounts, provide liquidity and earn rewards'
      }]
    }
  },

  // Visionary Founder Journey
  'visionary-founder': {
    missions: {
      'mission-3': [{
        id: 'founder-mission-3',
        title: 'Mission 3 - Becoming a Web3 Founder',
        youtubeId: extractVideoId('https://www.youtube.com/watch?v=ZP2QJDc0WH8&list=PLu5uVQa771ejKcOpXMfcfghgfIrmvvuA5&index=5'),
        description: 'Learn the key aspects of becoming a Web3 founder and launching blockchain companies'
      }]
    }
  },

  // Music Pioneer Journey
  'music-pioneer': {
    missions: {
      'mission-4': [{
        id: 'musician-mission-4',
        title: 'Mission 4 - Building and Joining Music Communities',
        youtubeId: extractVideoId('https://www.youtube.com/watch?v=5_MZomyEjkU&list=PLu5uVQa771ehEaW9EtXD8S_Upl2R8uaWW&index=6'),
        description: 'Build and join Web3 music communities, understand blockchain music rights'
      }]
    }
  }
};

// Helper function to get videos for a specific journey and mission
export const getVideosForMission = (journeyId: string, missionId: string): VideoLesson[] => {
  // First check journey-specific videos
  const journeyVideos = blockvocatesVideoMapping[journeyId]?.missions[missionId];
  if (journeyVideos && journeyVideos.length > 0) {
    return journeyVideos;
  }
  
  // Fall back to common videos
  const commonVideos = blockvocatesVideoMapping['common']?.missions[missionId];
  return commonVideos || [];
};

// Helper function to get all videos for a journey
export const getAllVideosForJourney = (journeyId: string): VideoLesson[] => {
  const videos: VideoLesson[] = [];
  
  // Add common videos first
  const commonMissions = blockvocatesVideoMapping['common']?.missions || {};
  Object.values(commonMissions).forEach(missionVideos => {
    videos.push(...missionVideos);
  });
  
  // Add journey-specific videos
  const journeyMissions = blockvocatesVideoMapping[journeyId]?.missions || {};
  Object.values(journeyMissions).forEach(missionVideos => {
    videos.push(...missionVideos);
  });
  
  return videos;
};