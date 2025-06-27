export interface Journey {
  id: string;
  title: string;
  description: string;
  missions: Mission[];
  rewardPoints: number;
  imageUrl: string;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  contentUrl: string;
  quizId?: string;
  duration: number;
  rewardPoints: number;
  concepts: string[];
}

export interface Quiz {
  id: string;
  questions: Question[];
}

export interface Question {
  id: string;
  text: string;
  options: Option[];
  correctAnswerId: string;
}

export interface Option {
  id: string;
  text: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  isTyping: boolean;
}

export const journeys: Journey[] = [
  {
    id: "journey-1",
    title: "Blockchain Fundamentals",
    description: "Learn the basics of blockchain technology.",
    missions: [
      {
        id: "mission-1",
        title: "Introduction to Blockchain",
        description: "Understand what blockchain is and its origins.",
        contentUrl: "https://example.com/blockchain-intro",
        duration: 30,
        rewardPoints: 50,
        concepts: ["blockchain", "decentralization", "cryptography"]
      },
      {
        id: "mission-2",
        title: "How Blockchain Works",
        description: "Explore the mechanics behind blockchain technology.",
        contentUrl: "https://example.com/blockchain-mechanics",
        duration: 45,
        rewardPoints: 75,
        concepts: ["blocks", "hashing", "consensus"]
      }
    ],
    rewardPoints: 150,
    imageUrl: "/images/blockchain-fundamentals.jpg"
  },
  {
    id: "journey-2",
    title: "Smart Contracts",
    description: "Dive into the world of smart contracts.",
    missions: [
      {
        id: "mission-3",
        title: "What are Smart Contracts?",
        description: "Learn the definition and purpose of smart contracts.",
        contentUrl: "https://example.com/smart-contracts-intro",
        duration: 40,
        rewardPoints: 60,
        concepts: ["smart contracts", "solidity", "ethereum"]
      },
      {
        id: "mission-4",
        title: "Developing Smart Contracts",
        description: "Get hands-on with smart contract development.",
        contentUrl: "https://example.com/smart-contracts-dev",
        duration: 60,
        rewardPoints: 90,
        concepts: ["coding", "testing", "deployment"]
      }
    ],
    rewardPoints: 200,
    imageUrl: "/images/smart-contracts.jpg"
  },
  {
    id: "journey-3",
    title: "Decentralized Applications (DApps)",
    description: "Explore the architecture and development of DApps.",
    missions: [
      {
        id: "mission-5",
        title: "DApps Explained",
        description: "Understand the concept and benefits of DApps.",
        contentUrl: "https://example.com/dapps-explained",
        duration: 35,
        rewardPoints: 55,
        concepts: ["dapps", "web3", "decentralization"]
      },
      {
        id: "mission-6",
        title: "Building DApps",
        description: "Learn how to create your own DApps.",
        contentUrl: "https://example.com/building-dapps",
        duration: 55,
        rewardPoints: 85,
        concepts: ["front-end", "back-end", "integration"]
      }
    ],
    rewardPoints: 180,
    imageUrl: "/images/dapps.jpg"
  },
  {
    id: "journey-4",
    title: "Cryptocurrency and Digital Assets",
    description: "Understand the basics of cryptocurrency and digital assets.",
    missions: [
      {
        id: "mission-7",
        title: "Introduction to Cryptocurrency",
        description: "Learn about the history and basics of cryptocurrency.",
        contentUrl: "https://example.com/cryptocurrency-intro",
        duration: 30,
        rewardPoints: 50,
        concepts: ["cryptocurrency", "bitcoin", "altcoins"]
      },
      {
        id: "mission-8",
        title: "Digital Assets and NFTs",
        description: "Explore the world of NFTs and digital assets.",
        contentUrl: "https://example.com/digital-assets-nfts",
        duration: 45,
        rewardPoints: 75,
        concepts: ["nfts", "digital assets", "tokenization"]
      }
    ],
    rewardPoints: 150,
    imageUrl: "/images/cryptocurrency.jpg"
  },
  {
    id: "journey-5",
    title: "Blockchain Security",
    description: "Learn about the security aspects of blockchain technology.",
    missions: [
      {
        id: "mission-9",
        title: "Security Basics",
        description: "Understand the basic security principles in blockchain.",
        contentUrl: "https://example.com/security-basics",
        duration: 40,
        rewardPoints: 60,
        concepts: ["security", "encryption", "hashing"]
      },
      {
        id: "mission-10",
        title: "Common Attacks and Prevention",
        description: "Learn about common attacks and how to prevent them.",
        contentUrl: "https://example.com/attacks-prevention",
        duration: 60,
        rewardPoints: 90,
        concepts: ["attacks", "prevention", "best practices"]
      }
    ],
    rewardPoints: 200,
    imageUrl: "/images/blockchain-security.jpg"
  }
];
