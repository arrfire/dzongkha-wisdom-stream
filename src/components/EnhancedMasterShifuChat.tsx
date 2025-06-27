// src/components/EnhancedMasterShifuChat.tsx
import React, { useState, useEffect, useRef } from "react";
import { ChatMessage, Journey } from "@/data/journeyData";
import { NDIUser } from "@/types/ndi";
import { LearnerProfile, NDICredential } from "@/types/learnerProfile";
import { enhancedLearnerProfileServiceInstance } from "@/services/enhancedLearnerProfileService";
import { ndiApiService } from "@/services/ndiApiService";

interface EnhancedMasterShifuChatProps {
  user: NDIUser;
  journeys: Journey[];
  selectedJourney?: Journey;
  learnerProfile: LearnerProfile;
  onJourneySelect: (journeyId: string) => void;
  onMissionStart?: (missionId: string) => void;
  onMissionComplete?: (missionId: string, timeSpent: number, concepts: string[]) => void;
  onCredentialEarned?: (credential: NDICredential) => void;
  onProfileUpdate: (profile: LearnerProfile) => void;
}

const EnhancedMasterShifuChat: React.FC<EnhancedMasterShifuChatProps> = ({
  user,
  journeys,
  selectedJourney,
  learnerProfile,
  onJourneySelect,
  onMissionStart,
  onMissionComplete,
  onCredentialEarned,
  onProfileUpdate
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize chat with welcome message or journey selection prompt
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: "welcome-1",
        content: `Hello ${user.fullName}! Welcome to Master Shifu. Choose a journey to begin your learning adventure.`,
        sender: "assistant",
        timestamp: new Date(),
        isTyping: false
      };
      setMessages([welcomeMessage]);
    }
  }, [user.fullName, messages.length]);

  useEffect(() => {
    // Scroll to bottom when messages update
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleUserInput = (text: string) => {
    if (!text.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString() + Math.random(),
      content: text,
      sender: "user",
      timestamp: new Date(),
      isTyping: false
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate assistant response after delay
    setTimeout(() => {
      handleAssistantResponse(text);
    }, 1000);
  };

  const handleAssistantResponse = (userText: string) => {
    let response: ChatMessage;

    // Simple command parsing for journey selection and mission start
    if (userText.toLowerCase().startsWith("select journey")) {
      const journeyId = userText.split(" ").pop() || "";
      const journey = journeys.find(j => j.id === journeyId);
      if (journey) {
        onJourneySelect(journey.id);
        response = {
          id: Date.now().toString() + Math.random(),
          content: `You have selected the journey: ${journey.title}. Let's get started!`,
          sender: "assistant",
          timestamp: new Date(),
          isTyping: false
        };
      } else {
        response = {
          id: Date.now().toString() + Math.random(),
          content: `Sorry, I couldn't find the journey "${journeyId}". Please try again.`,
          sender: "assistant",
          timestamp: new Date(),
          isTyping: false
        };
      }
    } else if (userText.toLowerCase().startsWith("start mission")) {
      const missionId = userText.split(" ").pop() || "";
      if (onMissionStart) {
        onMissionStart(missionId);
      }
      response = {
        id: Date.now().toString() + Math.random(),
        content: `Starting mission ${missionId}. Good luck!`,
        sender: "assistant",
        timestamp: new Date(),
        isTyping: false
      };
    } else {
      // Default response
      response = {
        id: Date.now().toString() + Math.random(),
        content: "I'm here to help you learn. You can say 'Select journey [id]' or 'Start mission [id]'.",
        sender: "assistant",
        timestamp: new Date(),
        isTyping: false
      };
    }

    setMessages(prev => [...prev, response]);
    setIsTyping(false);
  };

  const handleMissionComplete = async (missionId: string, timeSpent: number, concepts: string[]) => {
    if (!selectedJourney) return;

    try {
      // Complete the mission in the learning profile
      const completion = {
        missionId,
        journeyId: selectedJourney.id,
        completedAt: new Date(),
        timeSpent,
        videoWatched: true,
        questionsAsked: 0,
        conceptsLearned: concepts
      };

      const { updatedProfile, newCredentials } = 
        enhancedLearnerProfileServiceInstance.completeMissionWithTracking(learnerProfile, completion);
      
      onProfileUpdate(updatedProfile);

      // Issue NDI credential if new credentials were earned
      if (newCredentials.length > 0) {
        try {
          // Mock holderDID - in production this would come from the webhook
          const mockHolderDID = "did:key:z6MkoxCpQu6DTYGGqX5w1vCdU2Ep9V4PLnvoUAcawTX8KLym";
          
          for (const credential of newCredentials) {
            const credentialData = {
              issuerName: "EduStream",
              studentId: parseInt(user.citizenId) || 1234,
              studentName: user.fullName,
              titleOfAward: credential.title,
              collegeName: "EduStream University"
            };

            console.log('🎓 Issuing NDI credential for completed mission:', credential.title);
            await ndiApiService.issueCredential(credentialData, mockHolderDID);
            
            // Add success message to chat
            const successMessage: ChatMessage = {
              id: Date.now().toString() + Math.random(),
              content: `🎉 Congratulations! Your "${credential.title}" credential has been issued to your NDI wallet. You can now use this verified credential to unlock exclusive rewards!`,
              sender: 'assistant',
              timestamp: new Date(),
              isTyping: false
            };
            
            setMessages(prev => [...prev, successMessage]);
          }
        } catch (error) {
          console.error('❌ Failed to issue NDI credential:', error);
          
          // Add error message to chat
          const errorMessage: ChatMessage = {
            id: Date.now().toString() + Math.random(),
            content: `⚠️ Your learning progress has been saved, but there was an issue issuing your NDI credential. Please contact support if this continues.`,
            sender: 'assistant',
            timestamp: new Date(),
            isTyping: false
          };
          
          setMessages(prev => [...prev, errorMessage]);
        }
      }

      if (onMissionComplete) {
        onMissionComplete(missionId, timeSpent, concepts);
      }

    } catch (error) {
      console.error('❌ Error completing mission:', error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white rounded-lg shadow-inner">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`max-w-xl px-4 py-2 rounded-lg ${
              msg.sender === "user" ? "bg-orange-100 self-end" : "bg-gray-100 self-start"
            }`}
          >
            <p className="whitespace-pre-wrap">{msg.content}</p>
          </div>
        ))}
        {isTyping && (
          <div className="max-w-xl px-4 py-2 rounded-lg bg-gray-100 self-start italic text-gray-500">
            Master Shifu is typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={e => {
          e.preventDefault();
          handleUserInput(inputValue);
        }}
        className="flex p-4 bg-white border-t border-gray-200 rounded-b-lg"
      >
        <input
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder="Type your message here..."
          className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
          disabled={isTyping}
        />
        <button
          type="submit"
          disabled={isTyping || !inputValue.trim()}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-r-lg disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default EnhancedMasterShifuChat;
