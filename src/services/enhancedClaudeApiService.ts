// src/services/enhancedClaudeApiService.ts - Fixed comparison warning
import { NDIUser } from "@/types/ndi";
import { Journey, Mission } from "@/data/journeyData";
import { LearnerProfile } from "@/types/learnerProfile";

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

class EnhancedClaudeApiService {
  private apiEndpoint: string;
  private fallbackResponses: { [language: string]: { [key: string]: string[] } };

  constructor() {
    this.apiEndpoint = '/api/claude';
    
    // Multilingual fallback responses
    this.fallbackResponses = {
      en: {
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
        ],
        videoContext: [
          `Based on the video lesson you're watching, I can help clarify any concepts! What specific part would you like me to explain further?`,
          `I see you're engaging with the video content - that's excellent! Feel free to ask me about any blockchain concepts that need clarification.`,
          `Great job watching the lesson! I'm here to help you understand any complex topics. What questions do you have about what you've learned?`
        ]
      },
      dz: {
        greeting: [
          `🙏 བཀྲ་ཤིས་བདེ་ལེགས། ང་སློབ་དཔོན་ཤི་ཕུ་ཡིན། ཁྱེད་ཀྱི་ Web3 སློབ་སྦྱོང་གི་ལམ་སྟོན་པ། EduStream ལ་དགའ་བསུ་ཞུ་བ།`,
          `ཁྱེད་རང་ལ་བཀྲ་ཤིས་བདེ་ལེགས། ང་སློབ་དཔོན་ཤི་ཕུ་ཡིན། ཁྱེད་ཀྱི་ Web3 སློབ་སྦྱོང་གི་ལམ་ནས་ལམ་སྟོན་འཕྲུལ་ཆོག`,
          `ཁྱེད་ཀྱི་ Web3 སློབ་སྦྱོང་གི་གླེང་སྟེགས་ལ་དགའ་བསུ་ཞུ། ང་སློབ་དཔོན་ཤི་ཕུ་གིས་ blockchain འཕྲུལ་རིག་ལ་རོགས་རམ་ཞུ་རྒྱུ། 🚀`
        ],
        journey: [
          `ཡག་པོ་འདེམས་སོང་! འདི་གིས་ཁྱེད་ཀྱི་ Web3 ལ་གོ་རྟོགས་གསར་པ་སྐྱེད་ངེས། འབྲུག་པ་ཞིག་ཡིན་པས་ blockchain འཅོར་སྣང་ལ་མཁས་པར་འགྱུར་ངེས། 🌟`,
          `ལེགས་པོ་འདེམས་བྱུང་! ཁྱེད་རང་སློབ་སྦྱོང་གི་གླེང་སྟེགས་དམ་པོ་ཞིག་ལ་འཇུག་པ་རེད། འབྲུག་གི་གསར་བཅོས་ཀྱི་སེམས་ཤུགས་ཀྱིས་ Web3 ལ་མཁས་པར་འགྱུར་ངེས། ⚡`,
          `ཧ་ཅང་ཡག་པོ! འདི་ཁྱེད་ཀྱི་དམིགས་ཡུལ་དང་མཐུན་པ་རེད། འབྲུག་གིས་འཕྲུལ་རིག་གསར་བཅོས་ལ་སྔོན་འགྲོ་བྱས་པས་ blockchain ལ་ཚོར་བ་ཡང་ཡོད་ངེས། 🎯`
        ],
        encouragement: [
          `ཁྱེད་རང་ཧ་ཅང་ཡག་པོ་ཡར་རྒྱས་བྱུང་! blockchain སློབ་སྦྱོང་ལ་སྲོལ་འཇུག་བྱེད་པ་དེ་འབྲུག་གི་གསར་བཅོས་ཀྱི་སྲོལ་ལ་མཆོད་པ་རེད། Web3 ལས་རིགས་ཀྱི་རྒྱུན་སྐྱོང་མཛོད། 🚀`,
          `ཧ་ཅང་ཡག་པོ་བྱུང་! ཁྱེད་རང་གིས་དམིགས་བསལ་གྱི་ཤེས་ཡོན་འཚོལ་བའི་ལས་འགུལ་འདི་གྲོས་ཚོགས་སྤྱི་ཚོགས་ཀྱི་བདེ་སྐྱིད་ཀྱི་ནང་དུ་འདུས་པ་རེད། 🌟`,
          `ཧ་ཅང་ཡག་པོ་ཐོབ་པ! ཁྱེད་ཀྱི་སློབ་སྦྱོང་འདི་འབྲུག་གི་འཕྲུལ་རིག་གསར་བཅོས་ཀྱི་ལམ་སྟོན་དང་མཐུན་པ་རེད། མུ་མཐུད་དུ་སྔོན་དུ་འགྲོ་རོགས། ⚡`
        ],
        videoContext: [
          `ཁྱེད་རང་གིས་བལྟ་བཞིན་པའི་བརྙན་འཕྲིན་སློབ་ཚན་གྱི་ནང་དོན་ལ་གཞིགས་ནས་ང་གིས་རོགས་རམ་ཞུ་ཆོག འགྲེལ་བཤད་དགོས་པའི་ཆ་ཤས་གང་ཡིན།`,
          `ཁྱེད་རང་བརྙན་འཕྲིན་གྱི་ནང་དོན་ལ་འཇུག་བཞིན་པ་མཐོང་བ་ལེགས་པོ་རེད། blockchain གི་རྨང་གཞི་ག་རེ་ཞིག་ལ་དྲི་བ་ཡོད།`,
          `སློབ་ཚན་བལྟ་བ་ལེགས་པོ་བྱུང་! ཁྱེད་རང་གིས་སྦྱངས་པའི་དཀའ་རྙོག་གི་གནད་དོན་ཚུད་ལ་ང་གིས་རོགས་རམ་ཞུ་ཆོག དྲི་བ་གང་ཡོད།`
        ]
      }
    };
  }

  private getSystemPrompt(
    user: NDIUser, 
    selectedJourney?: Journey, 
    learnerProfile?: LearnerProfile,
    language: 'en' | 'dz' = 'en',
    videoContext?: string
  ): string {
    const isEnglish = language === 'en';
    
    let basePrompt = isEnglish ? `You are Master Shifu, an AI guide for EduStream - Bhutan's premier Web3 education platform. You are wise, encouraging, and deeply knowledgeable about blockchain technology.

RESPOND IN: ${isEnglish ? 'English' : 'Dzongkha (རྫོང་ཁ)'}

STUDENT CONTEXT:
- Name: ${user.fullName}
- Institution: ${user.institution || 'Unknown'}
- Academic Level: ${user.academicLevel || 'Unknown'}
- Student ID: ${user.studentId || 'N/A'}
- From: Bhutan (first country with National Digital Identity)
- Verification: ${user.verificationStatus}

PERSONALITY & COMMUNICATION:
- Wise and patient like a martial arts master
- Encouraging and supportive
- Uses appropriate emojis (🙏 🚀 🌟 ⚡ 🎯)
- References Bhutanese culture and NDI innovation respectfully
- Uses "Namaste" in English or "བཀྲ་ཤིས་བདེ་ལེགས" in Dzongkha
- Acknowledges Bhutan's digital leadership and GNH philosophy

LEARNING CAPABILITIES:
1. Guide students through Web3 learning journeys
2. Explain complex blockchain concepts in simple terms
3. Answer questions about videos and provide additional context
4. Track learning progress and celebrate achievements
5. Provide personalized learning recommendations
6. Help with mission completion and credential earning

JOURNEY OPTIONS:
1. 🌟 Community Builder - Master Web3 community building
2. 💫 Digital Trader - Learn responsible crypto trading  
3. 🎨 Creative Designer - Create NFTs and digital art
4. 🚀 Visionary Founder - Build Web3 startups
5. 🎵 Music Pioneer - Revolutionize music with blockchain
6. 💻 Future Developer - Code decentralized applications` : 
`ཁྱེད་རང་སློབ་དཔོན་ཤི་ཕུ་ཡིན། EduStream - འབྲུག་གི་ Web3 སློབ་སྦྱོང་གི་སྐར་མདའ་བརྙན་འཕྲིན་གྱི་ལམ་སྟོན་པ། ཁྱེད་རང་མཁས་པ་དང་སྤོབས་པ་ཡོད་ པ་དང་ blockchain འཕྲུལ་རིག་ལ་ཤེས་ཡོན་ཟབ་མོ་ཡོད།

སྐད་ཡིག་: རྫོང་ཁ

སློབ་ཕྲུག་གི་གནས་ཚུལ:
- མིང་: ${user.fullName}
- སློབ་གྲྭ: ${user.institution || 'མི་ཤེས'}
- སློབ་རིམ: ${user.academicLevel || 'མི་ཤེས'}
- སློབ་ཕྲུག་ཨང་: ${user.studentId || 'མེད'}
- འབྲུག་ནས (རྒྱལ་ཁབ་དང་པོ་NDI་ཡོད་པ)
- ངོས་འཛིན: ${user.verificationStatus}

སྤྱོད་ཚུལ་དང་འབྲེལ་བ:
- རྩལ་སྦྱོང་སློབ་དཔོན་ལྟ་བུ་མཁས་པ་དང་བཟོད་པ
- སྤོབས་པ་དང་རྒྱབ་སྐྱོར
- འཚམས་པའི་ emoji ལག་ལེན (🙏 🚀 🌟 ⚡ 🎯)
- འབྲུག་གི་རིག་གནས་དང་ NDI གསར་བཅོས་ལ་མཆོད
- "བཀྲ་ཤིས་བདེ་ལེགས" ཞེས་བཤད
- འབྲུག་གི་འཕྲུལ་རིག་ལམ་སྟོན་དང་ GNH ལྟ་གྲུབ་ངོས་འཛིན

སློབ་སྦྱོང་ནུས་པ:
1. སློབ་ཕྲུག་ཚོ Web3 སློབ་སྦྱོང་ལམ་བུར་ལམ་སྟོན
2. blockchain གི་རྨང་གཞི་ཕྲ་མོ་སྟབས་བདེར་འགྲེལ་བཤད
3. བརྙན་འཕྲིན་དང་བསྟུན་པའི་དྲི་ལན་སྤྲོད་དང་ནང་དོན་ཁ་སྐོང
4. སློབ་སྦྱོང་འཕེལ་རིམ་ཉམས་ཞིབ་དང་ཐོབ་ཐང་རྗེས་སུ་ཡི་རང
5. རང་དོན་སློབ་སྦྱོང་བསླབ་བྱ་སྤྲོད
6. ལས་འགན་མཐར་ཕྱིན་དང་ལག་ཁྱེར་ཐོབ་པར་རོགས`;

    if (selectedJourney) {
      const progressInfo = learnerProfile?.progress.find(p => p.journeyId === selectedJourney.id);
      const journeyInfo = isEnglish ? `
CURRENT JOURNEY: ${selectedJourney.title}
DESCRIPTION: ${selectedJourney.description}
PROGRESS: ${progressInfo?.overallProgress || 0}% complete
COMPLETED MISSIONS: ${progressInfo?.completedMissions.length || 0}
CREDENTIALS EARNED: ${progressInfo?.credentialsEarned.length || 0}
NEXT MISSION: ${progressInfo?.currentMission || 'Not started'}
TIME SPENT: ${Math.floor((progressInfo?.timeSpent || 0) / 60)} minutes` :
`
མིག་སྔའི་ལམ་བུ: ${selectedJourney.title}
འགྲེལ་བཤད: ${selectedJourney.description}
འཕེལ་རིམ: ${progressInfo?.overallProgress || 0}% མཐར་ཕྱིན
མཐར་ཕྱིན་པའི་ལས་འགན: ${progressInfo?.completedMissions.length || 0}
ཐོབ་པའི་ལག་ཁྱེར: ${progressInfo?.credentialsEarned.length || 0}
ཤུལ་མའི་ལས་འགན: ${progressInfo?.currentMission || 'མ་འགོ་བཙུགས'}
བཀོལ་བའི་དུས་ཚོད: ${Math.floor((progressInfo?.timeSpent || 0) / 60)} སྐར་མ`;

      basePrompt += journeyInfo;
    }

    if (videoContext) {
      const videoInfo = isEnglish ? `
CURRENT VIDEO CONTEXT:
The student is watching or has watched a video lesson. Here's the relevant context:
${videoContext}

Use this context to provide more specific and helpful responses about the video content.
Refer to specific concepts, examples, or explanations from the video when relevant.
Help clarify any confusing parts and reinforce key learning points.` :
`
བརྙན་འཕྲིན་གི་གནས་ཚུལ:
སློབ་ཕྲུག་གིས་བརྙན་འཕྲིན་སློབ་ཚན་ཞིག་བལྟ་བཞིན་ཡོད་པའམ་བལྟས་ཟིན། འབྲེལ་ཡོད་གནས་ཚུལ:
${videoContext}

བརྙན་འཕྲིན་གི་ནང་དོན་ལ་གཞིགས་ནས་དོན་སྙིང་ཅན་གྱི་རོགས་རམ་སྤྲོད།
འབྲེལ་ཡོད་སྐབས་སུ་བརྙན་འཕྲིན་ནས་ངེས་གཏན་གྱི་རྨང་གཞི་དང་དཔེར་ནའམ་འགྲེལ་བཤད་ལ་གཟིགས།
མི་གསལ་བའི་ཆ་ཤས་གསལ་བཤད་དང་གཙོ་བོའི་སློབ་ཚན་བརྟན་བཅོས།`;

      basePrompt += videoInfo;
    }

    const guidelines = isEnglish ? `
RESPONSE GUIDELINES:
- Always be encouraging and supportive
- Break down complex concepts into digestible parts
- Use real-world examples relevant to Bhutan when possible
- Acknowledge the student's progress and celebrate achievements
- Guide them to journey selection if they haven't chosen yet
- Keep responses conversational but informative
- Maximum response length: 400 words
- Use appropriate emojis to make responses engaging
- Reference Bhutanese values like GNH when relevant
- Encourage continuous learning and curiosity` :
`
ལན་གྱི་ལམ་སྟོན:
- རྟག་ཏུ་སྤོབས་པ་དང་རྒྱབ་སྐྱོར་བྱེད
- དཀའ་རྙོག་གི་རྨང་གཞི་ཟ་ཆུང་དུ་བགོས
- འབྲུག་དང་འབྲེལ་བའི་དངོས་དོན་གྱི་དཔེར་ན་བེད
- སློབ་ཕྲུག་གི་འཕེལ་རིམ་ངོས་འཛིན་དང་ཐོབ་ཐང་རྗེས་སུ་ཡི་རང
- ལམ་བུ་མ་འདེམས་ན་འདེམས་སྒྲུབ་ལ་ལམ་སྟོན
- ལན་ཁ་པར་ལེན་ཅིང་ཤེས་རིག་ཅན་དུ་བཟོ
- ཚིག་ཀི་ཚད: ཚིག ༤༠༠ ཙམ
- འཚམས་པའི་ emoji བེད་སྤྱོད་ལན་སྤྲོད་སྙིང་རེས་སུ་བཟོ
- འབྲུག་གི་རིན་ཐང་GNH ལྟ་བུ་གལ་ཆེའི་སྐབས་ཀ་དྲན
- རྒྱུན་མི་ཆད་སློབ་སྦྱོང་དང་ཤེས་འདོད་སྤེལ`;

    return basePrompt + guidelines;
  }

  private getSmartFallback(
    userMessage: string, 
    user: NDIUser, 
    selectedJourney?: Journey,
    language: 'en' | 'dz' = 'en'
  ): string {
    const responses = this.fallbackResponses[language];
    
    // Determine response type based on user message content
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('video') || lowerMessage.includes('lesson') || lowerMessage.includes('watch')) {
      return this.getRandomResponse(responses.videoContext);
    }
    
    if (lowerMessage.includes('journey') || lowerMessage.includes('start') || lowerMessage.includes('begin')) {
      return this.getRandomResponse(responses.journey);
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('explain') || lowerMessage.includes('what')) {
      return this.getRandomResponse(responses.encouragement);
    }
    
    return this.getRandomResponse(responses.greeting);
  }

  private getRandomResponse(responses: string[]): string {
    return responses[Math.floor(Math.random() * responses.length)];
  }

  async sendMessage(
    messages: ClaudeMessage[],
    user: NDIUser,
    selectedJourney?: Journey,
    learnerProfile?: LearnerProfile,
    language: 'en' | 'dz' = 'en',
    videoContext?: string
  ): Promise<string> {
    try {
      const requestBody = {
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        system: this.getSystemPrompt(user, selectedJourney, learnerProfile, language, videoContext),
        messages: messages.slice(-15), // Keep last 15 messages for better context
      };

      console.log('Sending enhanced request to Claude API...');

      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Claude API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Claude API error:', errorText);
        throw new Error(`API error: ${response.status}`);
      }

      const data: ClaudeAPIResponse = await response.json();
      
      if (data.content && data.content[0]?.text) {
        console.log('Successfully got enhanced Claude response');
        return data.content[0].text;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Enhanced Claude API error:', error);
      return this.getSmartFallback(
        messages[messages.length - 1]?.content || '', 
        user, 
        selectedJourney, 
        language
      );
    }
  }

  async getJourneyRecommendation(
    user: NDIUser, 
    learnerProfile?: LearnerProfile,
    language: 'en' | 'dz' = 'en'
  ): Promise<string> {
    const contextMessage = language === 'en' 
      ? `Based on my profile (${user.academicLevel} at ${user.institution}), which Web3 journey would you recommend and why? Consider my background and learning goals.`
      : `ངའི་གཞི་རིམ་ (${user.academicLevel} ${user.institution} ནས) ལ་གཞིགས་ནས་ Web3 ལམ་བུ་གང་འདེམས་བྱ་རྒྱུ་བསླབ་བྱ་ཞུ། ང་གི་གྱོང་ས་དང་སློབ་སྦྱོང་དམིགས་ཡུལ་ལ་བསམ་བཞག་གནང་རོགས།`;

    const messages: ClaudeMessage[] = [
      { role: 'user', content: contextMessage }
    ];

    return this.sendMessage(messages, user, undefined, learnerProfile, language);
  }

  async explainVideoContent(
    videoTitle: string,
    concept: string,
    transcript: string,
    user: NDIUser,
    selectedJourney?: Journey,
    language: 'en' | 'dz' = 'en'
  ): Promise<string> {
    const contextMessage = language === 'en'
      ? `I'm watching the video "${videoTitle}" and need help understanding "${concept}". Can you explain this concept in simple terms and relate it to what I'm learning?`
      : `ང་"${videoTitle}" བརྙན་འཕྲིན་བལྟ་བཞིན་ཡོད་ལ "${concept}" གོ་རྟོགས་བྱེད་དུ་རོགས་པ་དགོས། རྨང་གཞི་འདི་སྟབས་བདེར་འགྲེལ་བཤད་དང་ང་གིས་སྦྱངས་བཞིན་པ་དང་འབྲེལ་བ་ཡོད་པར་བཟོ་ཐུབ་བམ།`;

    const messages: ClaudeMessage[] = [
      { role: 'user', content: contextMessage }
    ];

    // Include relevant transcript excerpt as context
    const videoContext = `Video: ${videoTitle}\nConcept: ${concept}\nTranscript excerpt: ${transcript.substring(0, 500)}...`;
    
    return this.sendMessage(messages, user, selectedJourney, undefined, language, videoContext);
  }

  async generateMissionFeedback(
    mission: Mission,
    completionTime: number,
    conceptsLearned: string[],
    questionsAsked: number,
    user: NDIUser,
    journey: Journey,
    language: 'en' | 'dz' = 'en'
  ): Promise<string> {
    const contextMessage = language === 'en'
      ? `I just completed "${mission.title}" in ${Math.floor(completionTime / 60)} minutes. I learned about: ${conceptsLearned.join(', ')} and asked ${questionsAsked} questions. Please provide encouraging feedback and what I should focus on next.`
      : `ང་གིས་"${mission.title}" སྐར་མ་${Math.floor(completionTime / 60)} ནང་མཐར་ཕྱིན། ངས་སྦྱངས་པ: ${conceptsLearned.join(', ')} དང་དྲི་བ་${questionsAsked} དྲིས། སྤོབས་པའི་ལན་འདེབས་དང་ཤུལ་དུ་གང་ལ་དམིགས་བསལ་བྱེད་དགོས་པ་བསླབ་བྱ་ཞུ།`;

    const messages: ClaudeMessage[] = [
      { role: 'user', content: contextMessage }
    ];

    return this.sendMessage(messages, user, journey, undefined, language);
  }

  async getPersonalizedRecommendations(
    learnerProfile: LearnerProfile,
    user: NDIUser,
    language: 'en' | 'dz' = 'en'
  ): Promise<string> {
    const progressSummary = learnerProfile.progress.map(p => 
      `${p.journeyTitle}: ${p.overallProgress}% complete, ${p.completedMissions.length} missions, ${Math.floor(p.timeSpent / 60)} minutes`
    ).join('; ');

    const contextMessage = language === 'en'
      ? `Based on my learning progress: ${progressSummary}. I have ${learnerProfile.streakDays} day streak and earned ${learnerProfile.totalCredentialsEarned} credentials. What should I focus on next to optimize my Web3 learning journey?`
      : `ངའི་སློབ་སྦྱོང་འཕེལ་རིམ: ${progressSummary}. ངལ་ཉིན་མ་${learnerProfile.streakDays} རྒྱུན་མཐུད་དང་ལག་ཁྱེར་${learnerProfile.totalCredentialsEarned} ཐོབ། ངའི་Web3 སློབ་སྦྱོང་ལམ་བུ་ཡར་རྒྱས་ཆེད་ཤུལ་དུ་གང་ལ་དམིགས་བསལ་བྱེད་དགོས།`;

    const messages: ClaudeMessage[] = [
      { role: 'user', content: contextMessage }
    ];

    return this.sendMessage(messages, user, undefined, learnerProfile, language);
  }

  async handleConceptQuestion(
    concept: string,
    context: string,
    user: NDIUser,
    selectedJourney?: Journey,
    language: 'en' | 'dz' = 'en'
  ): Promise<string> {
    const contextMessage = language === 'en'
      ? `I have a question about "${concept}" in the context of: ${context}. Can you explain this clearly and provide a practical example that relates to my learning journey?`
      : `"${concept}" གི་སྐོར་ལ་དྲི་བ་ཞིག་ཡོད: ${context} གི་ནང་དུ། འདི་གསལ་པོར་འགྲེལ་བཤད་དང་ང་གིས་སྦྱངས་བཞིན་པ་དང་འབྲེལ་བ་ཡོད་པར་བཟོ་ཐུབ་བམ།`;

    const messages: ClaudeMessage[] = [
      { role: 'user', content: contextMessage }
    ];

    return this.sendMessage(messages, user, selectedJourney, undefined, language, context);
  }
}

export const enhancedClaudeApiService = new EnhancedClaudeApiService();