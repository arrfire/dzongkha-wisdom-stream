// src/services/claudeApi.ts - Replace your existing file with this
import { NDIUser } from "@/types/ndi";
import { Journey, Mission } from "@/data/journeyData";

interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ClaudeAPIResponse {
  content: Array<{
    type: 'text';
    text: string;
  }>;
  model: string;
  role: string;
  stop_reason: string;
  stop_sequence: null;
  type: 'message';
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

class ClaudeApiService {
  private apiEndpoint: string;
  private fallbackResponses: { [key: string]: string[] };

  constructor() {
    // Use the Netlify edge function endpoint
    this.apiEndpoint = '/api/claude';
    
    // Smart fallback responses
    this.fallbackResponses = {
      greeting: [
        `🙏 Namaste! I'm Master Shifu, your Web3 guide. Welcome to EduStream - where ancient Bhutanese wisdom meets cutting-edge blockchain technology!`,
        `Hello there! I'm Master Shifu, and I'm thrilled to guide you through your Web3 learning journey. Bhutan's pioneering spirit in digital innovation makes this the perfect place to explore blockchain!`,
        `Welcome to your Web3 adventure! I'm Master Shifu, here to help you master blockchain technology. Let's unlock the power of decentralized learning together! 🚀`
      ],
      journey: [
        `Excellent choice! This journey will transform your understanding of Web3. As someone from Bhutan - the world's first carbon-negative country and NDI pioneer - you're perfectly positioned to lead the blockchain revolution! 🌟`,
        `Perfect selection! You're about to embark on an incredible learning adventure. Bhutan's innovative spirit in digital identity makes you ideal for mastering Web3 concepts. Let's begin! ⚡`,
        `Outstanding! This journey aligns wonderfully with your goals. With Bhutan leading the way in digital innovation, you'll find these blockchain concepts both familiar and revolutionary! 🎯`
      ],
      encouragement: [
        `You're making amazing progress! Your dedication to learning blockchain technology honors Bhutan's tradition of innovation. Keep building those Web3 skills! 🚀`,
        `Fantastic work! You're embodying the spirit of Gross National Happiness by pursuing meaningful knowledge. Every step forward strengthens your Web3 expertise! 🌟`,
        `Wonderful achievement! Your learning journey reflects Bhutan's pioneering approach to digital transformation. Keep pushing the boundaries! ⚡`
      ]
    };
  }

  private getSystemPrompt(user: NDIUser, selectedJourney?: Journey): string {
    return `You are Master Shifu, an AI guide for EduStream - Bhutan's premier Web3 education platform. You are wise, encouraging, and deeply knowledgeable about blockchain technology.

STUDENT CONTEXT:
- Name: ${user.fullName}
- Institution: ${user.institution}
- Academic Level: ${user.academicLevel}
- Student ID: ${user.studentId}
- From: Bhutan (first country with National Digital Identity)

PERSONALITY:
- Wise and patient like a martial arts master
- Encouraging and supportive
- Uses emojis appropriately (🙏 🚀 🌟 ⚡ 🎯)
- References Bhutanese culture and NDI innovation respectfully
- Occasionally uses "Namaste" and acknowledges Bhutan's digital leadership

CAPABILITIES:
1. Guide students through Web3 learning journeys
2. Explain complex blockchain concepts simply
3. Track learning progress and issue NDI credentials
4. Answer questions about Web3, DeFi, NFTs, DAOs
5. Provide personalized learning recommendations

JOURNEY OPTIONS:
1. 🌟 Community Builder - Master Web3 community building
2. 💫 Digital Trader - Learn responsible crypto trading  
3. 🎨 Creative Designer - Create NFTs and digital art
4. 🚀 Visionary Founder - Build Web3 startups
5. 🎵 Music Pioneer - Revolutionize music with blockchain
6. 💻 Future Developer - Code decentralized applications

${selectedJourney ? `
CURRENT JOURNEY: ${selectedJourney.title}
JOURNEY DESCRIPTION: ${selectedJourney.description}
PROGRESS: ${selectedJourney.progress}% complete
NEXT MISSION: ${selectedJourney.missions.find(m => !m.completed)?.title || 'All missions complete!'}
` : ''}

IMPORTANT GUIDELINES:
- Always be encouraging and supportive
- Break down complex concepts into digestible parts
- Use real-world examples relevant to Bhutan when possible
- Acknowledge the student's progress and celebrate achievements
- Guide them to the journey selection if they haven't chosen yet
- Keep responses conversational but informative
- Maximum response length: 300 words`;
  }

  private getSmartFallback(userMessage: string, user: NDIUser, selectedJourney?: Journey): string {
    const message = userMessage.toLowerCase();
    
    if (message.includes('hello') || message.includes('hi') || message.includes('start') || message.includes('namaste')) {
      const responses = this.fallbackResponses.greeting;
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    if (message.includes('journey') || message.includes('choose') || selectedJourney) {
      const responses = this.fallbackResponses.journey;
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    if (message.includes('mission') || message.includes('complete') || message.includes('done') || message.includes('progress')) {
      const responses = this.fallbackResponses.encouragement;
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // Context-aware responses
    if (selectedJourney) {
      return `🙏 Great question about ${selectedJourney.title}! This journey focuses on ${selectedJourney.description.toLowerCase()}. As a student from ${user.institution}, you bring unique perspectives to Web3 learning. Each mission builds your expertise step by step! 🌟`;
    }

    return `🙏 Namaste ${user.fullName}! Your question shows great curiosity about Web3. As someone from Bhutan - where digital innovation meets ancient wisdom - you're perfectly positioned to master blockchain technology. Keep exploring and asking great questions! 🚀`;
  }

  async sendMessage(
    messages: ClaudeMessage[],
    user: NDIUser,
    selectedJourney?: Journey,
    currentMission?: Mission
  ): Promise<string> {
    try {
      const requestBody = {
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        system: this.getSystemPrompt(user, selectedJourney),
        messages: messages.slice(-10), // Keep last 10 messages for context
      };

      console.log('Sending request to edge function...');

      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Edge function response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Edge function error:', errorText);
        throw new Error(`API error: ${response.status}`);
      }

      const data: ClaudeAPIResponse = await response.json();
      
      if (data.content && data.content[0]?.text) {
        console.log('Successfully got Claude response');
        return data.content[0].text;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Claude API error:', error);
      // Return smart fallback instead of generic error
      return this.getSmartFallback(messages[messages.length - 1]?.content || '', user, selectedJourney);
    }
  }

  async getJourneyRecommendation(user: NDIUser): Promise<string> {
    const messages: ClaudeMessage[] = [
      {
        role: 'user',
        content: `Based on my profile (${user.academicLevel} at ${user.institution}), which Web3 journey would you recommend and why? Please provide a personalized recommendation.`
      }
    ];

    return this.sendMessage(messages, user);
  }

  async explainConcept(concept: string, user: NDIUser, selectedJourney?: Journey): Promise<string> {
    const messages: ClaudeMessage[] = [
      {
        role: 'user',
        content: `Can you explain "${concept}" in simple terms? Please relate it to my journey: ${selectedJourney?.title || 'not selected yet'}.`
      }
    ];

    return this.sendMessage(messages, user, selectedJourney);
  }

  async generateMissionContent(mission: Mission, user: NDIUser, journey: Journey): Promise<string> {
    const messages: ClaudeMessage[] = [
      {
        role: 'user',
        content: `I'm starting the mission "${mission.title}" in my ${journey.title} journey. Can you explain what I'll learn and why it's important? Keep it engaging and motivating!`
      }
    ];

    return this.sendMessage(messages, user, journey, mission);
  }

  async celebrateCompletion(completedMission: Mission, user: NDIUser, journey: Journey): Promise<string> {
    const messages: ClaudeMessage[] = [
      {
        role: 'user',
        content: `I just completed the mission "${completedMission.title}"! Please celebrate my achievement and tell me what's next in my ${journey.title} journey.`
      }
    ];

    return this.sendMessage(messages, user, journey);
  }
}

export const claudeApiService = new ClaudeApiService();