// src/services/claudeApi.ts (ensure exact filename casing)
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
  private apiKey: string;
  private baseUrl = 'https://api.anthropic.com/v1/messages';

  constructor() {
    this.apiKey = import.meta.env.VITE_CLAUDE_API_KEY || '';
    if (!this.apiKey) {
      console.warn('Claude API key not found. Please set VITE_CLAUDE_API_KEY environment variable.');
    }
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

  async sendMessage(
    messages: ClaudeMessage[],
    user: NDIUser,
    selectedJourney?: Journey,
    currentMission?: Mission
  ): Promise<string> {
    if (!this.apiKey) {
      return "I apologize, but I need to be properly configured to assist you. Please contact support.";
    }

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 1000,
          system: this.getSystemPrompt(user, selectedJourney),
          messages: messages.slice(-10), // Keep last 10 messages for context
        }),
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status}`);
      }

      const data: ClaudeAPIResponse = await response.json();
      return data.content[0]?.text || "I'm having trouble responding right now. Please try again.";
    } catch (error) {
      console.error('Claude API error:', error);
      return "I'm experiencing some technical difficulties. Please try again in a moment.";
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