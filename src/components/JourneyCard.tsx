
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Star, Lock, CheckCircle } from "lucide-react";
import { Journey } from "@/data/journeyData";

interface JourneyCardProps {
  journey: Journey;
  onSelect: (journeyId: string) => void;
}

const JourneyCard = ({ journey, onSelect }: JourneyCardProps) => {
  const handleClick = () => {
    if (journey.status !== 'locked') {
      onSelect(journey.id);
    }
  };

  return (
    <Card 
      className={`transition-all duration-300 cursor-pointer ${
        journey.status === 'locked' 
          ? 'opacity-60 cursor-not-allowed' 
          : 'hover:shadow-lg hover:-translate-y-1'
      }`}
      onClick={handleClick}
    >
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {journey.status === 'locked' ? (
              <Lock className="h-5 w-5 text-gray-400" />
            ) : journey.progress === 100 ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <journey.icon className={`h-5 w-5 ${journey.color}`} />
            )}
            <Badge variant={
              journey.difficulty === 'Beginner' ? 'secondary' :
              journey.difficulty === 'Intermediate' ? 'default' : 'destructive'
            }>
              {journey.difficulty}
            </Badge>
          </div>
          <div className="flex items-center space-x-1 text-sm text-yellow-600">
            <Star className="h-4 w-4 fill-current" />
            <span>{journey.rewards}</span>
          </div>
        </div>
        
        <CardTitle className="text-lg leading-tight">{journey.title}</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600 leading-relaxed">{journey.description}</p>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Progress</span>
            <span className="font-medium">
              {journey.missions.filter(m => m.completed).length}/{journey.missions.length} missions
            </span>
          </div>
          <Progress value={journey.progress} className="h-2" />
        </div>
        
        {journey.status !== 'locked' && (
          <div className="pt-2">
            <button className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 px-4 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-200">
              {journey.progress > 0 ? 'Continue Adventure' : 'Begin Journey'}
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default JourneyCard;
