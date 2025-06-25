import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Target, Book, Users } from "lucide-react";
import { Achievement } from "@/types/achievement";

const AchievementBadge = ({ achievement }: { achievement: Achievement }) => {
  const getIcon = () => {
    switch (achievement.type) {
      case "streak": return <Star className="h-5 w-5" />;
      case "completion": return <Book className="h-5 w-5" />;
      case "quiz": return <Target className="h-5 w-5" />;
      case "milestone": return <Trophy className="h-5 w-5" />;
      case "collaboration": return <Users className="h-5 w-5" />;
      default: return <Star className="h-5 w-5" />;
    }
  };

  const getColor = () => {
    if (!achievement.earned) return "text-gray-400 bg-gray-100";
    switch (achievement.type) {
      case "streak": return "text-yellow-600 bg-yellow-100";
      case "completion": return "text-green-600 bg-green-100";
      case "quiz": return "text-blue-600 bg-blue-100";
      case "milestone": return "text-purple-600 bg-purple-100";
      case "collaboration": return "text-pink-600 bg-pink-100";
      default: return "text-orange-600 bg-orange-100";
    }
  };

  return (
    <div className={`flex items-center space-x-3 p-3 rounded-lg border ${
      achievement.earned ? 'border-orange-200 bg-white' : 'border-gray-200 bg-gray-50'
    }`}>
      <div className={`p-2 rounded-full ${getColor()}`}>
        {getIcon()}
      </div>
      
      <div className="flex-1">
        <h4 className={`font-medium ${achievement.earned ? 'text-gray-900' : 'text-gray-500'}`}>
          {achievement.title}
        </h4>
        <p className={`text-sm ${achievement.earned ? 'text-gray-600' : 'text-gray-400'}`}>
          {achievement.description}
        </p>
        
        {achievement.progress !== undefined && achievement.total && (
          <div className="mt-2">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span>{achievement.progress}/{achievement.total}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-orange-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
      
      {achievement.earned && (
        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
          Earned
        </Badge>
      )}
    </div>
  );
};

export default AchievementBadge;