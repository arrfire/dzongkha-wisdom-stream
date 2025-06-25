// src/services/aiTutorService.ts

import { journeyData } from '@/data/journeyData';

// Core interfaces
export interface LearnerProfile {
  id: string;
  ndiId?: string;
  name?: string;
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
  totalPoints: number;
  lastActiveSession: Date;
  joinedDate: Date;
  preferences: {
    showPersonalizedContent: boolean;
    enableAITutor: boolean;
    culturalContext: boolean;
  };
}

export interface AITutorResponse {
  answer: string;
  suggestedResources?: Array<{
    type: 'video' | 'reading' | 'exercise' | 'practice';
    title: string;
    url?: string;
    reason: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
  }>;
  nextQuestions?: string[];
  keyPoints?: string[];
  bhutaneseContext?: string;
  followUpActions?: Array<{
    action: string;
    description: string;
    estimatedTime: string;
  }>;
}

export interface AIRecommendation {
  type: 'mission' | 'concept' | 'practice' | 'review' | 'challenge';
  title: string;
  description: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  learningObjectives: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  bhutaneseContext?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  concept: string;
  learningObjective: string;
  hints?: string[];
  timeEstimate: string;
}

export interface LearningAnalytics {
  strengths: string[];
  improvements: string[];
  recommendedActions: string[];
  motivationalMessage: string;
  progressInsights: {
    conceptsMastered: number;
    averageTimePerConcept: number;
    streakDays: number;
    completionRate: number;
  };
  nextMilestones: string[];
}

class AITutorService {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1';
  private model = 'gpt-4';
  
  // Blockvocates knowledge base - extracted from your documents
  private blockvocatesKnowledge = {
    communityBuilder: {
      missions: [
        {
          id: 'm1-identity',
          title: 'Create Your Identity',
          concepts: ['Web3 identity', 'pseudonymous identity', 'Twitter/X', 'Farcaster', 'Lens Protocol'],
          videoUrl: 'https://www.youtube.com/watch?v=o7bq7oEuSgU',
          keyLearnings: ['Three types of identities', 'Social media setup', 'Rainbow wallet creation']
        },
        {
          id: 'm2-read-write-own',
          title: 'Read, Write, Own',
          concepts: ['Web1 vs Web2 vs Web3', 'Ownership', 'Chris Dixon book'],
          videoUrl: 'https://www.youtube.com/watch?v=bNd0UOE2l_U',
          keyLearnings: ['Evolution of internet', 'Ownership principles', 'Public speaking']
        },
        {
          id: 'm3-communities',
          title: 'Understanding Web3 Communities',
          concepts: ['DAOs', 'Protocol communities', 'Discord', 'Telegram', 'Governance'],
          videoUrl: 'https://www.youtube.com/watch?v=VHA7x2OGxlU',
          keyLearnings: ['Community types', 'Platforms', 'Best practices']
        }
      ]
    },
    trader: {
      missions: [
        {
          id: 'm3-exchanges',
          title: 'CEX and DEX Setup',
          concepts: ['Binance', 'Aerodrome', 'Liquidity provision', 'DeFi'],
          videoUrl: 'https://www.youtube.com/watch?v=V3lJD2Z3z0s',
          keyLearnings: ['Exchange differences', 'Trading setup', 'Risk management']
        }
      ]
    },
    developer: {
      missions: [
        {
          id: 'm3-web3-dev',
          title: 'Web3 Development Fundamentals',
          concepts: ['Solidity', 'Smart contracts', 'Remix', 'MetaMask'],
          videoUrl: 'https://www.youtube.com/watch?v=53QO6myTCo4',
          keyLearnings: ['Web2 vs Web3 development', 'Blockchain platforms', 'Programming basics']
        }
      ]
    }
  };

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || '';
    if (!this.apiKey) {
      console.warn('OpenAI API key not provided. AI features will be limited.');
    }
  }

  // Main tutoring method
  async provideTutoringGuidance(
    learnerProfile: LearnerProfile,
    userQuestion: string,
    currentContext: {
      missionContent?: string;
      missionTitle?: string;
      journeyId?: string;
      journeyTitle?: string;
    }
  ): Promise<AITutorResponse> {
    try {
      const relevantKnowledge = this.getRelevantBlockvocatesContent(
        currentContext.journeyId || learnerProfile.selectedJourney,
        currentContext.missionTitle || ''
      );

      const prompt = this.buildTutoringPrompt(
        learnerProfile,
        userQuestion,
        currentContext,
        relevantKnowledge
      );

      const response = await this.callOpenAI(prompt);
      return this.parseTutoringResponse(response, learnerProfile);
    } catch (error) {
      console.error('AI Tutor error:', error);
      return this.getFallbackResponse(userQuestion, learnerProfile);
    }
  }

  // Generate personalized recommendations
  async generateRecommendations(
    learnerProfile: LearnerProfile,
    journeys: any[]
  ): Promise<AIRecommendation[]> {
    try {
      const prompt = this.buildRecommendationPrompt(learnerProfile, journeys);
      const response = await this.callOpenAI(prompt);
      return this.parseRecommendationsResponse(response, learnerProfile);
    } catch (error) {
      console.error('Recommendations error:', error);
      return this.getStaticRecommendations(learnerProfile);
    }
  }

  // Generate adaptive quiz questions
  async generateAdaptiveQuiz(
    learnerProfile: LearnerProfile,
    concept: string,
    difficulty?: 'beginner' | 'intermediate' | 'advanced'
  ): Promise<QuizQuestion> {
    try {
      const targetDifficulty = difficulty || this.mapExperienceToQuizDifficulty(learnerProfile.experienceLevel);
      const relevantContent = this.getConceptContent(concept, learnerProfile.selectedJourney);
      
      const prompt = this.buildQuizPrompt(learnerProfile, concept, targetDifficulty, relevantContent);
      const response = await this.callOpenAI(prompt);
      return this.parseQuizResponse(response, concept, targetDifficulty);
    } catch (error) {
      console.error('Quiz generation error:', error);
      return this.getFallbackQuiz(concept, learnerProfile);
    }
  }

  // Analyze learning progress
  async analyzeProgress(learnerProfile: LearnerProfile): Promise<LearningAnalytics> {
    try {
      const prompt = this.buildAnalyticsPrompt(learnerProfile);
      const response = await this.callOpenAI(prompt);
      return this.parseAnalyticsResponse(response, learnerProfile);
    } catch (error) {
      console.error('Analytics error:', error);
      return this.getBasicAnalytics(learnerProfile);
    }
  }

  // Build tutoring prompt
  private buildTutoringPrompt(
    learnerProfile: LearnerProfile,
    userQuestion: string,
    context: any,
    relevantKnowledge: any
  ): string {
    return `You are Master Shifu, an AI tutor for Edustream, teaching Web3 concepts to Bhutanese learners.

LEARNER PROFILE:
- Name: ${learnerProfile.name || 'Student'}
- Journey: ${learnerProfile.selectedJourney}
- Experience Level: ${learnerProfile.experienceLevel}
- Learning Style: ${learnerProfile.learningStyle}
- Language: ${learnerProfile.language}
- Goals: ${learnerProfile.goals.join(', ')}
- Struggling Concepts: ${learnerProfile.strugglingConcepts.join(', ')}
- Mastered Concepts: ${learnerProfile.masteredConcepts.join(', ')}
- Consecutive Learning Days: ${learnerProfile.consecutiveDays}

CURRENT CONTEXT:
- Mission: ${context.missionTitle || 'General Web3 Learning'}
- Journey: ${context.journeyTitle || 'Web3 Education'}
- Content: ${context.missionContent ? context.missionContent.substring(0, 1000) + '...' : 'General Web3 concepts'}

RELEVANT BLOCKVOCATES KNOWLEDGE:
${JSON.stringify(relevantKnowledge, null, 2)}

CULTURAL CONTEXT:
- Student is from Bhutan, a kingdom in the Himalayas
- Bhutan has the world's first national digital identity system using blockchain
- Values Gross National Happiness over GDP
- Strong Buddhist cultural background
- Tech-forward government with 100% renewable energy

LEARNER QUESTION:
"${userQuestion}"

Provide a helpful, culturally appropriate response that:
1. Directly answers their question using simple, clear language
2. Adapts to their ${learnerProfile.learningStyle} learning style
3. Uses Bhutanese context and examples when relevant (NDI system, GNH philosophy, etc.)
4. References specific Blockvocates content when helpful
5. Suggests practical next steps
6. Includes encouraging, culturally appropriate motivation

Response format (JSON):
{
  "answer": "Your detailed explanation here",
  "suggestedResources": [
    {
      "type": "video|reading|exercise|practice",
      "title": "Resource title",
      "url": "Optional URL",
      "reason": "Why this helps them",
      "difficulty": "beginner|intermediate|advanced"
    }
  ],
  "nextQuestions": ["Follow-up question 1", "Follow-up question 2"],
  "bhutaneseContext": "Optional Bhutanese cultural connection",
  "followUpActions": [
    {
      "action": "Specific action to take",
      "description": "Why this action helps",
      "estimatedTime": "Time needed"
    }
  ]
}`;
  }

  // Build recommendation prompt
  private buildRecommendationPrompt(learnerProfile: LearnerProfile, journeys: any[]): string {
    return `You are Master Shifu, analyzing a Bhutanese learner's progress to provide personalized recommendations.

LEARNER PROFILE:
${JSON.stringify(learnerProfile, null, 2)}

AVAILABLE JOURNEYS:
${JSON.stringify(journeys.map(j => ({
  id: j.id,
  title: j.title,
  difficulty: j.difficulty,
  progress: j.progress,
  missions: j.missions.length
})), null, 2)}

BLOCKVOCATES CONTENT AVAILABLE:
${JSON.stringify(this.blockvocatesKnowledge, null, 2)}

Generate 3-5 personalized recommendations that:
1. Match their experience level and learning style
2. Consider their current progress and goals
3. Include variety (missions, practice, review, challenges)
4. Provide clear reasoning for each recommendation
5. Estimate realistic time commitments
6. Align with Bhutanese learning culture (patience, mindfulness, community)

Response format (JSON array):
[
  {
    "type": "mission|concept|practice|review|challenge",
    "title": "Clear, actionable title",
    "description": "What they'll do and learn",
    "reason": "Why this is recommended for them specifically",
    "priority": "high|medium|low",
    "estimatedTime": "Realistic time estimate",
    "difficulty": "beginner|intermediate|advanced",
    "tags": ["relevant", "tags"],
    "learningObjectives": ["What they'll achieve"]
  }
]`;
  }

  // Build quiz prompt
  private buildQuizPrompt(
    learnerProfile: LearnerProfile,
    concept: string,
    difficulty: string,
    relevantContent: any
  ): string {
    return `Generate a personalized quiz question for a Bhutanese Web3 learner.

LEARNER: ${learnerProfile.experienceLevel} level, ${learnerProfile.learningStyle} learner
CONCEPT: ${concept}
DIFFICULTY: ${difficulty}
JOURNEY: ${learnerProfile.selectedJourney}

RELEVANT CONTENT:
${JSON.stringify(relevantContent, null, 2)}

BHUTANESE CONTEXT TO CONSIDER:
- National Digital Identity system uses blockchain
- Buddhist philosophy and mindful learning
- GNH (Gross National Happiness) values
- Mountain kingdom with strong community values
- 100% renewable energy (for blockchain context)

Create ONE excellent question that:
1. Tests understanding of ${concept}
2. Matches ${difficulty} difficulty level
3. Includes Bhutanese context when possible
4. Has 4 clear multiple choice options
5. Provides detailed explanation
6. Includes practical application

Response format (JSON):
{
  "id": "unique-question-id",
  "question": "Clear, specific question",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0-3,
  "explanation": "Detailed explanation with Bhutanese context",
  "bhutaneseContext": "How this relates to Bhutan specifically",
  "difficulty": "${difficulty}",
  "concept": "${concept}",
  "learningObjective": "What they should understand after this",
  "hints": ["Helpful hint if they struggle"],
  "timeEstimate": "Estimated time to complete"
}`;
  }

  // Build analytics prompt
  private buildAnalyticsPrompt(learnerProfile: LearnerProfile): string {
    return `Analyze this Bhutanese learner's progress and provide insights.

LEARNER PROFILE:
${JSON.stringify(learnerProfile, null, 2)}

CULTURAL CONTEXT:
- Bhutanese learning philosophy emphasizes patience and mindfulness
- Community support is highly valued
- GNH philosophy prioritizes wellbeing over pure achievement
- Respect for gradual, sustainable progress

Provide analysis that:
1. Celebrates their achievements in culturally appropriate way
2. Identifies specific strengths they've developed
3. Suggests gentle improvements without pressure
4. Provides motivational message aligned with Bhutanese values
5. Recommends next steps that build confidence

Response format (JSON):
{
  "strengths": ["Specific strength 1", "Specific strength 2"],
  "improvements": ["Gentle suggestion 1", "Gentle suggestion 2"],
  "recommendedActions": ["Specific action 1", "Specific action 2"],
  "motivationalMessage": "Culturally appropriate encouragement",
  "progressInsights": {
    "conceptsMastered": number,
    "averageTimePerConcept": number,
    "streakDays": number,
    "completionRate": number
  },
  "nextMilestones": ["Achievable milestone 1", "Achievable milestone 2"]
}`;
  }

  // Get relevant Blockvocates content
  private getRelevantBlockvocatesContent(journeyId: string, missionTitle: string): any {
    const journey = this.blockvocatesKnowledge[journeyId as keyof typeof this.blockvocatesKnowledge];
    if (!journey) return {};

    if (missionTitle) {
      const mission = journey.missions.find(m => 
        m.title.toLowerCase().includes(missionTitle.toLowerCase()) ||
        missionTitle.toLowerCase().includes(m.title.toLowerCase())
      );
      return mission || journey.missions[0];
    }

    return journey.missions[0];
  }

  // Get concept content
  private getConceptContent(concept: string, journeyId: string): any {
    const journey = this.blockvocatesKnowledge[journeyId as keyof typeof this.blockvocatesKnowledge];
    if (!journey) return {};

    const relevantMission = journey.missions.find(m => 
      m.concepts.some(c => c.toLowerCase().includes(concept.toLowerCase()))
    );

    return relevantMission || {};
  }

  // Map experience level to quiz difficulty
  private mapExperienceToQuizDifficulty(experienceLevel: string): 'beginner' | 'intermediate' | 'advanced' {
    switch (experienceLevel) {
      case 'complete-beginner':
      case 'basic':
        return 'beginner';
      case 'intermediate':
        return 'intermediate';
      case 'advanced':
        return 'advanced';
      default:
        return 'beginner';
    }
  }

  // Call OpenAI API
  private async callOpenAI(prompt: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not available');
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are Master Shifu, a wise and patient AI tutor specializing in Web3 education for Bhutanese learners. Always respond with valid JSON when requested.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  // Parse tutoring response
  private parseTutoringResponse(response: string, learnerProfile: LearnerProfile): AITutorResponse {
    try {
      const parsed = JSON.parse(response);
      return {
        answer: parsed.answer || response,
        suggestedResources: parsed.suggestedResources || [],
        nextQuestions: parsed.nextQuestions || [],
        bhutaneseContext: parsed.bhutaneseContext,
        followUpActions: parsed.followUpActions || []
      };
    } catch {
      return {
        answer: response,
        suggestedResources: [],
        nextQuestions: [
          "Can you explain this concept with a Bhutanese example?",
          "What should I focus on learning next?",
          "How does this apply in real-world situations?"
        ]
      };
    }
  }

  // Parse recommendations response
  private parseRecommendationsResponse(response: string, learnerProfile: LearnerProfile): AIRecommendation[] {
    try {
      const parsed = JSON.parse(response);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return this.getStaticRecommendations(learnerProfile);
    }
  }

  // Parse quiz response
  private parseQuizResponse(response: string, concept: string, difficulty: string): QuizQuestion {
    try {
      const parsed = JSON.parse(response);
      return {
        id: parsed.id || `quiz-${Date.now()}`,
        question: parsed.question || "What is blockchain?",
        options: parsed.options || ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: parsed.correctAnswer || 0,
        explanation: parsed.explanation || "This tests basic blockchain understanding.",
        bhutaneseContext: parsed.bhutaneseContext,
        difficulty: parsed.difficulty || difficulty,
        concept: parsed.concept || concept,
        learningObjective: parsed.learningObjective || `Understand ${concept}`,
        hints: parsed.hints || [],
        timeEstimate: parsed.timeEstimate || "3 minutes"
      };
    } catch {
      return this.getFallbackQuiz(concept, { experienceLevel: difficulty } as LearnerProfile);
    }
  }

  // Parse analytics response
  private parseAnalyticsResponse(response: string, learnerProfile: LearnerProfile): LearningAnalytics {
    try {
      const parsed = JSON.parse(response);
      return {
        strengths: parsed.strengths || [],
        improvements: parsed.improvements || [],
        recommendedActions: parsed.recommendedActions || [],
        motivationalMessage: parsed.motivationalMessage || "Keep up the great work!",
        progressInsights: parsed.progressInsights || {
          conceptsMastered: learnerProfile.masteredConcepts.length,
          averageTimePerConcept: 15,
          streakDays: learnerProfile.consecutiveDays,
          completionRate: 75
        },
        nextMilestones: parsed.nextMilestones || []
      };
    } catch {
      return this.getBasicAnalytics(learnerProfile);
    }
  }

  // Fallback responses when AI is unavailable
  private getFallbackResponse(userQuestion: string, learnerProfile: LearnerProfile): AITutorResponse {
    return {
      answer: `I understand you're asking about "${userQuestion}". While I'm having trouble connecting to my full knowledge base right now, I can suggest reviewing the current mission content above. As a ${learnerProfile.experienceLevel} learner in the ${learnerProfile.selectedJourney} journey, focusing on hands-on practice often helps solidify understanding.`,
      suggestedResources: [
        {
          type: 'reading',
          title: 'Review Current Mission',
          reason: 'Reinforce the concepts you\'re learning',
          difficulty: learnerProfile.experienceLevel as any
        }
      ],
      nextQuestions: [
        "Can you break down this concept into simpler parts?",
        "What are some real-world applications of this?",
        "How can I practice this concept?"
      ]
    };
  }

  private getStaticRecommendations(learnerProfile: LearnerProfile): AIRecommendation[] {
    const currentJourney = journeyData.find(j => j.id === learnerProfile.selectedJourney);
    
    return [
      {
        type: 'mission',
        title: 'Continue Current Journey',
        description: `Progress through your ${currentJourney?.title || 'learning'} journey`,
        reason: `Builds on your ${learnerProfile.experienceLevel} foundation`,
        priority: 'high',
        estimatedTime: '30 minutes',
        difficulty: learnerProfile.experienceLevel as any,
        tags: ['journey', 'progress'],
        learningObjectives: ['Complete next mission', 'Build core skills']
      },
      {
        type: 'practice',
        title: 'Daily Quiz Challenge',
        description: 'Test your Web3 knowledge with personalized questions',
        reason: 'Regular practice strengthens understanding',
        priority: 'medium',
        estimatedTime: '10 minutes',
        difficulty: 'beginner',
        tags: ['quiz', 'practice'],
        learningObjectives: ['Test knowledge', 'Identify gaps']
      }
    ];
  }

  private getFallbackQuiz(concept: string, learnerProfile: LearnerProfile): QuizQuestion {
    return {
      id: `fallback-${Date.now()}`,
      question: "What makes blockchain technology secure and trustworthy?",
      options: [
        "It's stored on a single powerful computer",
        "Each transaction is verified by multiple participants in the network",
        "It uses complex passwords that cannot be broken",
        "It's managed by government institutions"
      ],
      correctAnswer: 1,
      explanation: "Blockchain security comes from its decentralized nature - multiple participants verify each transaction, making it nearly impossible to falsify records. This is similar to how traditional Bhutanese village consensus works - decisions require community agreement rather than one authority.",
      bhutaneseContext: "Just like Bhutan's National Digital Identity system, blockchain relies on distributed trust rather than a single authority.",
      difficulty: this.mapExperienceToQuizDifficulty(learnerProfile.experienceLevel),
      concept: concept,
      learningObjective: "Understand blockchain security principles",
      hints: ["Think about how communities make decisions together"],
      timeEstimate: "3 minutes"
    };
  }

  private getBasicAnalytics(learnerProfile: LearnerProfile): LearningAnalytics {
    return {
      strengths: [
        `Consistent learning with ${learnerProfile.consecutiveDays} day streak`,
        `Completed ${learnerProfile.completedMissions.length} missions successfully`
      ],
      improvements: [
        "Try exploring different learning styles to find what works best",
        "Consider joining community discussions to deepen understanding"
      ],
      recommendedActions: [
        "Complete your current mission",
        "Take a practice quiz to test your knowledge",
        "Share your learning progress with the community"
      ],
      motivationalMessage: "Your dedication to learning reflects the Bhutanese principle of mindful progress. Every step forward, no matter how small, contributes to your wisdom journey. Tashi Delek!",
      progressInsights: {
        conceptsMastered: learnerProfile.masteredConcepts.length,
        averageTimePerConcept: 20,
        streakDays: learnerProfile.consecutiveDays,
        completionRate: Math.round((learnerProfile.completedMissions.length / 10) * 100)
      },
      nextMilestones: [
        "Complete 5 more missions",
        "Achieve 7-day learning streak",
        "Master blockchain fundamentals"
      ]
    };
  }
}

// Export singleton instance
export const aiTutorService = new AITutorService();
export default AITutorService;