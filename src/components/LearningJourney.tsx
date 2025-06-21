
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Star, Lock, CheckCircle } from "lucide-react";

const LearningJourney = () => {
  const journeys = [
    {
      title: "Blockchain Basics",
      description: "Discover how blockchain technology works and its applications in everyday life",
      progress: 85,
      lessons: 12,
      completed: 10,
      status: "in-progress",
      difficulty: "Beginner",
      rewards: "50 BTC"
    },
    {
      title: "Digital Finance Wisdom",
      description: "Learn about cryptocurrency, trading, and financial literacy with Bhutanese context",
      progress: 60,
      lessons: 15,
      completed: 9,
      status: "in-progress",
      difficulty: "Intermediate",
      rewards: "75 BTC"
    },
    {
      title: "Smart Contracts & DApps",
      description: "Advanced concepts in decentralized applications and smart contract development",
      progress: 0,
      lessons: 20,
      completed: 0,
      status: "locked",
      difficulty: "Advanced",
      rewards: "150 BTC"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-900">Your Learning Journey</h2>
        <p className="text-gray-600">Every step forward unlocks new possibilities</p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {journeys.map((journey, index) => (
          <Card key={index} className={`transition-all duration-300 hover:shadow-lg ${
            journey.status === 'locked' ? 'opacity-60' : 'hover:-translate-y-1'
          }`}>
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {journey.status === 'locked' ? (
                    <Lock className="h-5 w-5 text-gray-400" />
                  ) : journey.progress === 100 ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <BookOpen className="h-5 w-5 text-orange-600" />
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
                  <span className="font-medium">{journey.completed}/{journey.lessons} lessons</span>
                </div>
                <Progress value={journey.progress} className="h-2" />
              </div>
              
              {journey.status !== 'locked' && (
                <div className="pt-2">
                  <button className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 px-4 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-200">
                    {journey.progress > 0 ? 'Continue Journey' : 'Start Adventure'}
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default LearningJourney;
