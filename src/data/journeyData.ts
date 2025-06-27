
import { Users, TrendingUp, Palette, Rocket, Music, Code } from "lucide-react";

export interface Mission {
  id: string;
  title: string;
  description: string;
  duration: string;
  content: string;
  videoUrl?: string;
  exercises?: string[];
  completed: boolean;
    aiKeywords?: string[]; // For AI to understand content
  prerequisiteConcepts?: string[];
  learningObjectives?: string[];
  adaptiveContent?: {
    beginner: string;
    intermediate: string;
    advanced: string;
  };
}

// Add these interfaces at the top
export interface LearnerProfile {
  id: string;
  ndiId?: string;
  language: 'english' | 'dzongkha';
  selectedJourney: string;
  currentMission: string;
  completedMissions: string[];
  learningStyle: 'visual' | 'reading' | 'hands-on' | 'social';
  experienceLevel: 'complete-beginner' | 'basic' | 'intermediate' | 'advanced';
  timeCommitment: '1-2' | '3-5' | '5-10' | '10+';
  goals: string[];
  strugglingConcepts: string[];
  masteredConcepts: string[];
  consecutiveDays: number;
}

export interface Journey {
  id: string;
  title: string;
  description: string;
  icon: any;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  progress: number;
  missions: Mission[];
  rewards: string;
  status: 'locked' | 'in-progress' | 'completed';
  color: string;
}

export const journeyData: Journey[] = [
  {
    id: "community-builder",
    title: "🌟 Community Builder",
    description: "Master the art of bringing people together in Web3 spaces, creating thriving communities that change the world",
    icon: Users,
    difficulty: "Beginner",
    progress: 85,
    rewards: "5,000 EDU",
    status: "in-progress",
    color: "text-blue-600",
    missions: [
      {
        id: "m1-identity",
        title: "Create Your Identity",
        description: "Build your unique Web3 identity and understand the importance of digital ownership",
        duration: "45 min",
        content: `Identity is fundamental in blockchain because blockchain gives ownership to every user.

**Three Types of Web3 Identities:**

1. **Real Life Identity** - Like CZ (Binance CEO) or Vitalik Buterin (Ethereum co-founder)
2. **Pseudonymous Identity** - Like Cobie, discoverable but uses pseudonym  
3. **Anonymous Identity** - Fully hidden, like anonymous crypto accounts

**Exercise: Create Your Crypto Identity**
- Think of a hobby you enjoy
- Choose your favorite animal or character
- Combine them (e.g., "Singing Cat" or "Dancing Tiger")

**Setting Up Web3 Presence:**
- Twitter/X (most popular in crypto)
- Lens Protocol (decentralized social)
- Farcaster (Web3 social network)
- Rainbow Wallet (Web3 gateway)

Use Yup.io to post across all platforms simultaneously.`,
        completed: true
      },
      {
        id: "m2-read-write-own",
        title: "Read, Write, Own",
        description: "Understand the evolution from Web1 to Web3 and why ownership matters",
        duration: "4-6 hours",
        content: `**Understanding Web Evolution:**

**Web 1 (Read):** Early internet - only consume content
**Web 2 (Write):** Platforms like Facebook/Twitter - create content  
**Web 3 (Own):** You own what you create and control your data

**Your Mission:**
1. Read "Read Write Own" by Chris Dixon
2. Prepare 4-6 minute speech about key takeaways
3. Present at club meeting about blockchain inspiration
4. Share personal Web3 journey story

This foundation explains why communities matter in Web3 and how ownership changes everything.`,
        completed: true
      },
      {
        id: "m3-web3-communities",
        title: "Understanding Web3 Communities",
        description: "Explore different types of communities and their unique characteristics",
        duration: "60 min",
        content: `**Three Types of Web3 Communities:**

**1. Project/Protocol Communities**
Think of these as "blockchain nations" - Bitcoin, Ethereum, Polygon, Solana
Examples: Uniswap (DEX), Bored Ape Yacht Club (NFT)

**2. Purpose-Driven Communities (DAOs)**
United by specific vision:
- Constitution DAO (tried to buy US Constitution)
- Gitcoin (public goods funding)  
- Educational communities

**3. Interest-Based Communities**
Based on Web3 activities:
- Trader groups sharing alpha
- Developer communities
- Designer collectives

**Platforms:**
- Discord & Telegram (main gathering spaces)
- Snapshot, Tally, Aragon (governance)
- Unlock Protocol, Collab.Land (token gating)
- Mirror (Web3 publishing)

**Key Web3 vs Web2 Differences:**
- Ownership from day one
- Composability (own your data)
- Incentive alignment (rewards for participation)`,
        completed: true
      },
      {
        id: "m4-community-match",
        title: "Discover Your Community Match",
        description: "Find communities that align with your interests and goals",
        duration: "90 min",
        content: `**Finding Your Perfect Community Match:**

**Assessment Questions:**
- What Web3 topics excite you most?
- Do you prefer large or intimate groups?
- Are you more of a contributor or learner?
- What timezone works best for you?

**Research Process:**
1. Join Discord servers of interesting projects
2. Lurk and observe community culture
3. Participate in discussions gradually
4. Attend virtual events and AMAs
5. Connect with like-minded members

**Red Flags to Avoid:**
- Communities focused only on price
- Lack of genuine discussion
- No clear governance structure
- Toxic or unwelcoming behavior

**Green Flags to Look For:**
- Educational content sharing
- Collaborative projects
- Diverse perspectives welcomed
- Clear community guidelines
- Active moderation`,
        completed: false
      }
    ]
  },
  {
    id: "digital-trader",
    title: "💫 Digital Trader",
    description: "Navigate digital markets with wisdom, learning to trade responsibly while understanding market dynamics",
    icon: TrendingUp,
    difficulty: "Intermediate",
    progress: 60,
    rewards: "7,500 EDU",
    status: "in-progress",
    color: "text-green-600",
    missions: [
      {
        id: "m1-identity",
        title: "Create Your Identity",
        description: "Build your trader identity and understand market psychology",
        duration: "45 min",
        content: `Identity is fundamental in blockchain because blockchain gives ownership to every user.

**Three Types of Web3 Identities:**

1. **Real Life Identity** - Like CZ (Binance CEO) or Vitalik Buterin (Ethereum co-founder)
2. **Pseudonymous Identity** - Like Cobie, discoverable but uses pseudonym
3. **Anonymous Identity** - Fully hidden, like anonymous crypto accounts

**Exercise: Create Your Crypto Identity**
- Think of a hobby you enjoy
- Choose your favorite animal or character
- Combine them (e.g., "Singing Cat" or "Dancing Tiger")

**Setting Up Web3 Presence:**
- Twitter/X (most popular in crypto)
- Lens Protocol (decentralized social)
- Farcaster (Web3 social network)
- Rainbow Wallet (Web3 gateway)

Use Yup.io to post across all platforms simultaneously.`,
        completed: true
      },
      {
        id: "m2-read-write-own",
        title: "Read, Write, Own",
        description: "Understand Web3 fundamentals and ownership principles",
        duration: "4-6 hours",
        content: `**Understanding Web Evolution:**

**Web 1 (Read):** Early internet - only consume content
**Web 2 (Write):** Platforms like Facebook/Twitter - create content
**Web 3 (Own):** You own what you create and control your data

**Your Mission:**
1. Read "Read Write Own" by Chris Dixon
2. Prepare 4-6 minute speech about key takeaways
3. Present at club meeting about blockchain inspiration
4. Share personal Web3 journey story

This foundation explains why communities matter in Web3 and how ownership changes everything.`,
        completed: true
      },
      {
        id: "m3-wallets-exchanges",
        title: "Wallets, CEX, and DEX Setup",
        description: "Learn to navigate centralized and decentralized exchanges safely",
        duration: "2 hours",
        content: `**Centralized Exchange (CEX) Setup - Binance:**
1. Download official Binance app
2. Complete KYC verification
3. Understand interface: Spot trading, Futures, P2P
4. Deposit methods vary by country

**Decentralized Exchange (DEX) Setup:**
1. Install Rainbow Wallet
2. **CRITICAL:** Save 12-word recovery phrase securely
3. Connect to Base network for lower fees
4. Use Aerodrome Finance for trading

**Key Differences:**
- **CEX:** Custodial, KYC required, easier UX, customer support
- **DEX:** Non-custodial, no KYC, you control keys, more privacy

**Safety Rules:**
- Never share seed phrase
- Double-check addresses
- Start with small amounts
- Understand network fees`,
        completed: true
      },
      {
        id: "m4-research-analysis",
        title: "Trading Research & Analysis",
        description: "Master fundamental and technical analysis for informed trading decisions",
        duration: "3 hours",
        content: `**Fundamental Analysis:**
- Project team and background
- Tokenomics and utility
- Partnerships and adoption
- Market competition
- Roadmap progress

**Technical Analysis Basics:**
- Support and resistance levels
- Moving averages (20, 50, 200)
- RSI and MACD indicators
- Volume analysis
- Chart patterns

**Risk Management:**
- Never invest more than you can afford to lose
- Diversify your portfolio
- Set stop-losses
- Take profits gradually
- Keep emotions in check

**Research Tools:**
- CoinGecko/CoinMarketCap for data
- DefiLlama for DeFi metrics
- Twitter for sentiment
- Discord for community insights
- On-chain analytics platforms`,
        completed: false
      }
    ]
  },
  {
    id: "creative-designer",
    title: "🎨 Creative Designer",
    description: "Craft beautiful digital experiences and NFTs that tell stories and connect hearts across the blockchain",
    icon: Palette,
    difficulty: "Beginner",
    progress: 25,
    rewards: "6,000 EDU",
    status: "in-progress",
    color: "text-purple-600",
    missions: [
      {
        id: "m1-identity",
        title: "Create Your Identity",
        description: "Develop your unique design identity in the Web3 space",
        duration: "45 min",
        content: `Identity is fundamental in blockchain because blockchain gives ownership to every user.

**Three Types of Web3 Identities:**

1. **Real Life Identity** - Like CZ (Binance CEO) or Vitalik Buterin (Ethereum co-founder)
2. **Pseudonymous Identity** - Like Cobie, discoverable but uses pseudonym
3. **Anonymous Identity** - Fully hidden, like anonymous crypto accounts

**Exercise: Create Your Crypto Identity**
- Think of a hobby you enjoy
- Choose your favorite animal or character
- Combine them (e.g., "Singing Cat" or "Dancing Tiger")

**Setting Up Web3 Presence:**
- Twitter/X (most popular in crypto)
- Lens Protocol (decentralized social)
- Farcaster (Web3 social network)
- Rainbow Wallet (Web3 gateway)

Use Yup.io to post across all platforms simultaneously.`,
        completed: true
      },
      {
        id: "m2-read-write-own",
        title: "Read, Write, Own",
        description: "Understand ownership in digital design and creativity",
        duration: "4-6 hours",
        content: `**Understanding Web Evolution:**

**Web 1 (Read):** Early internet - only consume content
**Web 2 (Write):** Platforms like Facebook/Twitter - create content
**Web 3 (Own):** You own what you create and control your data

**Your Mission:**
1. Read "Read Write Own" by Chris Dixon
2. Prepare 4-6 minute speech about key takeaways
3. Present at club meeting about blockchain inspiration
4. Share personal Web3 journey story

This foundation explains why communities matter in Web3 and how ownership changes everything.`,
        completed: true
      },
      {
        id: "m3-web3-design",
        title: "Understanding Web3 Design",
        description: "Explore the unique aspects of designing for decentralized platforms",
        duration: "2 hours",
        content: `**Web3 Design Principles:**

**Decentralization-First Design:**
- No single point of failure
- User-controlled experiences
- Transparent interactions
- Composable components

**Key Differences from Web2:**
- Wallet connections vs login forms
- Transaction confirmations
- Gas fee considerations
- Network status indicators
- Decentralized storage (IPFS)

**Design Tools for Web3:**
- Figma for UI/UX design
- Blender for 3D NFTs
- Adobe Creative Suite
- Procreate for digital art
- Canva for quick graphics

**NFT Art Considerations:**
- Aspect ratios and dimensions
- File size optimization
- Metadata importance
- Rarity and traits
- Community engagement`,
        completed: false
      },
      {
        id: "m4-design-voice",
        title: "Finding Your Design Voice",
        description: "Develop your unique style and brand in the Web3 ecosystem",
        duration: "90 min",
        content: `**Discovering Your Style:**

**Exploration Process:**
1. Study successful Web3 artists
2. Experiment with different mediums
3. Gather feedback from communities
4. Iterate based on response
5. Develop signature elements

**Building Your Brand:**
- Consistent color palette
- Recognizable style elements
- Clear artistic message
- Professional portfolio
- Social media presence

**Finding Your Niche:**
- Pixel art and retro gaming
- Abstract and generative art
- Photography and real-world capture
- 3D modeling and animation
- Utility-focused design

**Portfolio Building:**
- Showcase diverse skills
- Tell stories through your work
- Document your process
- Engage with other creators
- Participate in design challenges`,
        completed: false
      }
    ]
  },
  {
    id: "visionary-founder",
    title: "🚀 Visionary Founder",
    description: "Transform big ideas into reality, learning to launch and scale Web3 projects that make a difference",
    icon: Rocket,
    difficulty: "Advanced",
    progress: 0,
    rewards: "12,000 EDU",
    status: "locked",
    color: "text-red-600",
    missions: [
      {
        id: "m1-identity",
        title: "Create Your Identity",
        description: "Build your founder persona and leadership identity",
        duration: "45 min",
        content: `Identity is fundamental in blockchain because blockchain gives ownership to every user.

**Three Types of Web3 Identities:**

1. **Real Life Identity** - Like CZ (Binance CEO) or Vitalik Buterin (Ethereum co-founder)
2. **Pseudonymous Identity** - Like Cobie, discoverable but uses pseudonym
3. **Anonymous Identity** - Fully hidden, like anonymous crypto accounts

**Exercise: Create Your Crypto Identity**
- Think of a hobby you enjoy
- Choose your favorite animal or character
- Combine them (e.g., "Singing Cat" or "Dancing Tiger")

**Setting Up Web3 Presence:**
- Twitter/X (most popular in crypto)
- Lens Protocol (decentralized social)
- Farcaster (Web3 social network)
- Rainbow Wallet (Web3 gateway)

Use Yup.io to post across all platforms simultaneously.`,
        completed: false
      }
    ]
  },
  {
    id: "music-pioneer",
    title: "🎵 Music Pioneer",
    description: "Revolutionize the music industry through blockchain, empowering artists and creating new creative economies",
    icon: Music,
    difficulty: "Intermediate",
    progress: 0,
    rewards: "8,000 EDU",
    status: "locked",
    color: "text-pink-600",
    missions: [
      {
        id: "m1-identity",
        title: "Create Your Identity",
        description: "Develop your musical identity in the Web3 space",
        duration: "45 min",
        content: `Identity is fundamental in blockchain because blockchain gives ownership to every user.

**Three Types of Web3 Identities:**

1. **Real Life Identity** - Like CZ (Binance CEO) or Vitalik Buterin (Ethereum co-founder)
2. **Pseudonymous Identity** - Like Cobie, discoverable but uses pseudonym
3. **Anonymous Identity** - Fully hidden, like anonymous crypto accounts

**Exercise: Create Your Crypto Identity**
- Think of a hobby you enjoy
- Choose your favorite animal or character
- Combine them (e.g., "Singing Cat" or "Dancing Tiger")

**Setting Up Web3 Presence:**
- Twitter/X (most popular in crypto)
- Lens Protocol (decentralized social)
- Farcaster (Web3 social network)
- Rainbow Wallet (Web3 gateway)

Use Yup.io to post across all platforms simultaneously.`,
        completed: false
      }
    ]
  },
  {
    id: "future-developer",
    title: "💻 Future Developer",
    description: "Code the future of Web3, building decentralized applications that empower communities worldwide",
    icon: Code,
    difficulty: "Advanced",
    progress: 0,
    rewards: "15,000 EDU",
    status: "locked",
    color: "text-indigo-600",
    missions: [
      {
        id: "m1-identity",
        title: "Create Your Identity",
        description: "Build your developer identity and coding persona",
        duration: "45 min",
        content: `Identity is fundamental in blockchain because blockchain gives ownership to every user.

**Three Types of Web3 Identities:**

1. **Real Life Identity** - Like CZ (Binance CEO) or Vitalik Buterin (Ethereum co-founder)
2. **Pseudonymous Identity** - Like Cobie, discoverable but uses pseudonym
3. **Anonymous Identity** - Fully hidden, like anonymous crypto accounts

**Exercise: Create Your Crypto Identity**
- Think of a hobby you enjoy
- Choose your favorite animal or character
- Combine them (e.g., "Singing Cat" or "Dancing Tiger")

**Setting Up Web3 Presence:**
- Twitter/X (most popular in crypto)
- Lens Protocol (decentralized social)
- Farcaster (Web3 social network)
- Rainbow Wallet (Web3 gateway)

Use Yup.io to post across all platforms simultaneously.`,
        completed: false
      },
      {
        id: "m2-read-write-own",
        title: "Read, Write, Own",
        description: "Understand Web3 development fundamentals",
        duration: "4-6 hours",
        content: `**Understanding Web Evolution:**

**Web 1 (Read):** Early internet - only consume content
**Web 2 (Write):** Platforms like Facebook/Twitter - create content
**Web 3 (Own):** You own what you create and control your data

**Your Mission:**
1. Read "Read Write Own" by Chris Dixon
2. Prepare 4-6 minute speech about key takeaways
3. Present at club meeting about blockchain inspiration
4. Share personal Web3 journey story

This foundation explains why communities matter in Web3 and how ownership changes everything.`,
        completed: false
      },
      {
        id: "m3-dev-fundamentals",
        title: "Web3 Development Fundamentals",
        description: "Learn the core concepts and tools for blockchain development",
        duration: "4 hours",
        content: `**Web2 vs Web3 Development:**

**Architecture:**
- Web2: Centralized client-server, AWS hosting
- Web3: Decentralized blockchain networks, distributed storage

**Backend:**
- Web2: Python/Node.js, SQL databases on servers
- Web3: Smart contracts in Solidity, blockchain as backend

**Frontend:**
- Similar: HTML, CSS, JavaScript
- New: Web3.js, Ethers.js for blockchain interaction
- Auth: Wallet connections vs Google/Facebook login

**Major Platforms:**
- Ethereum: Solidity, EVM, ERC standards
- Solana: Rust, high TPS, SPL standards
- Polygon: Ethereum-compatible, lower fees

**Choose based on:**
- Community fit
- Use case alignment
- Developer experience
- Ecosystem opportunities`,
        completed: false
      }
    ]
  }
];
