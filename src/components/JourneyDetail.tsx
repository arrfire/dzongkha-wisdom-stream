
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Star } from "lucide-react";
import { Journey } from "@/data/journeyData";
import MissionCard from "./MissionCard";

interface JourneyDetailProps {
  journey: Journey;
  onBack: () => void;
  onMissionSelect: (missionId: string) => void;
}

const JourneyDetail = ({ journey, onBack, onMissionSelect }: JourneyDetailProps) => {
  const completedMissions = journey.missions.filter(m => m.completed).length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={onBack} className="flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Journeys</span>
        </Button>
      </div>

      <Card className="border-2 border-orange-100">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <journey.icon className={`h-8 w-8 ${journey.color}`} />
              <div>
                <CardTitle className="text-3xl">{journey.title}</CardTitle>
                <p className="text-gray-600 mt-2 text-lg">{journey.description}</p>
              </div>
            </div>
            
            <div className="text-right space-y-2">
              <Badge variant={
                journey.difficulty === 'Beginner' ? 'secondary' :
                journey.difficulty === 'Intermediate' ? 'default' : 'destructive'
              }>
                {journey.difficulty}
              </Badge>
              <div className="flex items-center space-x-1 text-yellow-600">
                <Star className="h-4 w-4 fill-current" />
                <span className="font-medium">{journey.rewards}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Overall Progress</span>
              <span className="font-medium">{completedMissions}/{journey.missions.length} missions completed</span>
            </div>
            <Progress value={journey.progress} className="h-3" />
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Mission Path</h3>
            <div className="grid gap-4">
              {journey.missions.map((mission, index) => (
                <MissionCard
                  key={mission.id}
                  mission={mission}
                  missionNumber={index + 1}
                  onSelect={onMissionSelect}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JourneyDetail;
