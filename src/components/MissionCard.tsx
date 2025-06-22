
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, Play } from "lucide-react";
import { Mission } from "@/data/journeyData";

interface MissionCardProps {
  mission: Mission;
  missionNumber: number;
  onSelect: (missionId: string) => void;
}

const MissionCard = ({ mission, missionNumber, onSelect }: MissionCardProps) => {
  return (
    <Card 
      className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
      onClick={() => onSelect(mission.id)}
    >
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              mission.completed 
                ? 'bg-green-500 text-white' 
                : 'bg-orange-500 text-white'
            }`}>
              {mission.completed ? <CheckCircle className="h-4 w-4" /> : `M${missionNumber}`}
            </div>
            <CardTitle className="text-lg">{mission.title}</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{mission.duration}</span>
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-gray-600 leading-relaxed">{mission.description}</p>
        
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-2">
            {mission.completed ? (
              <Badge className="bg-green-100 text-green-800">Completed</Badge>
            ) : (
              <Badge className="bg-blue-100 text-blue-800">Ready to Start</Badge>
            )}
          </div>
          
          <button className="flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
            <Play className="h-4 w-4" />
            <span>{mission.completed ? 'Review' : 'Start Mission'}</span>
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MissionCard;
