
// src/components/MissionView.tsx - Fixed version with proper imports
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, CheckCircle } from "lucide-react";
import { Mission, Journey } from "@/data/journeyData";
import { LearnerProfile } from "@/types/learnerProfile";
import VideoLessonDisplay from "./EnhancedVideoLessonDisplay";

interface MissionViewProps {
  mission: Mission;
  journey: Journey;
  missionNumber: number;
  learnerProfile?: LearnerProfile;
  onBack: () => void;
  onComplete: (missionId: string) => void;
  onProfileUpdate?: (profile: LearnerProfile) => void;
}

const MissionView: React.FC<MissionViewProps> = ({ 
  mission, 
  journey, 
  missionNumber, 
  learnerProfile,
  onBack, 
  onComplete,
  onProfileUpdate
}) => {
  const formatContent = (content: string) => {
    return content.split('\n').map((line, index) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <h3 key={index} className="font-bold text-lg mt-4 mb-2">
            {line.slice(2, -2)}
          </h3>
        );
      }
      if (line.startsWith('- ')) {
        return (
          <li key={index} className="ml-4 mb-1">
            {line.slice(2)}
          </li>
        );
      }
      if (line.trim() === '') {
        return <br key={index} />;
      }
      return (
        <p key={index} className="mb-2 leading-relaxed">
          {line}
        </p>
      );
    });
  };

  const handleMissionComplete = (missionId: string, timeSpent: number, concepts: string[]) => {
    onComplete(missionId);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={onBack} className="flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to {journey.title}</span>
        </Button>
        <div className="flex items-center space-x-2">
          <journey.icon className={`h-5 w-5 ${journey.color}`} />
          <span className="text-gray-600">{journey.title}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mission Content */}
        <Card className="border-2 border-orange-100">
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                  mission.completed ? 'bg-green-500' : 'bg-orange-500'
                }`}>
                  {mission.completed ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    `M${missionNumber}`
                  )}
                </div>
                <div>
                  <CardTitle className="text-2xl">{mission.title}</CardTitle>
                  <p className="text-gray-600 mt-1">{mission.description}</p>
                </div>
              </div>
              <Badge variant="outline" className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{mission.duration}</span>
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="prose prose-gray max-w-none">
              {formatContent(mission.content)}
            </div>

            {mission.exercises && mission.exercises.length > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3">Practice Exercises</h4>
                <ul className="space-y-2">
                  {mission.exercises.map((exercise, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="font-medium text-blue-600">{index + 1}.</span>
                      <span>{exercise}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center justify-between pt-6 border-t">
              <div className="flex items-center space-x-2">
                {mission.completed ? (
                  <Badge className="bg-green-100 text-green-800">Mission Completed</Badge>
                ) : (
                  <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
                )}
              </div>
              
              {!mission.completed && (
                <Button 
                  onClick={() => onComplete(mission.id)}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Mark as Complete
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Video Lessons - Enhanced and Larger */}
        <div className="space-y-6">
          <VideoLessonDisplay 
            journey={journey}
            missionId={mission.id}
            learnerProfile={learnerProfile}
            onProgressUpdate={onProfileUpdate}
            onMissionComplete={handleMissionComplete}
            className="h-fit"
          />
        </div>
      </div>
    </div>
  );
};

export default MissionView;
