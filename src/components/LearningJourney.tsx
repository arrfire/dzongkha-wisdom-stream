
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, Palette, Rocket, Music, Code, Star, Lock, CheckCircle } from "lucide-react";

const LearningJourney = () => {
  const journeys = [
    {
      title: "🌟 Community Builder",
      description: "Master the art of bringing people together in Web3 spaces, creating thriving communities that change the world",
      progress: 85,
      lessons: 8,
      completed: 7,
      status: "in-progress",
      difficulty: "Beginner",
      rewards: "5,000 EDU",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "💫 Digital Trader", 
      description: "Navigate digital markets with wisdom, learning to trade responsibly while understanding market dynamics",
      progress: 60,
      lessons: 8,
      completed: 5,
      status: "in-progress",
      difficulty: "Intermediate",
      rewards: "7,500 EDU",
      icon: TrendingUp,
      color: "text-green-600"
    },
    {
      title: "🎨 Creative Designer",
      description: "Craft beautiful digital experiences and NFTs that tell stories and connect hearts across the blockchain",
      progress: 25,
      lessons: 8,
      completed: 2,
      status: "in-progress", 
      difficulty: "Beginner",
      rewards: "6,000 EDU",
      icon: Palette,
      color: "text-purple-600"
    },
    {
      title: "🚀 Visionary Founder",
      description: "Transform big ideas into reality, learning to launch and scale Web3 projects that make a difference",
      progress: 0,
      lessons: 8,
      completed: 0,
      status: "locked",
      difficulty: "Advanced",
      rewards: "12,000 EDU",
      icon: Rocket,
      color: "text-red-600"
    },
    {
      title: "🎵 Music Pioneer",
      description: "Revolutionize the music industry through blockchain, empowering artists and creating new creative economies",
      progress: 0,
      lessons: 8,
      completed: 0,
      status: "locked",
      difficulty: "Intermediate",
      rewards: "8,000 EDU",
      icon: Music,
      color: "text-pink-600"
    },
    {
      title: "💻 Future Developer",
      description: "Code the future of Web3, building decentralized applications that empower communities worldwide",
      progress: 0,
      lessons: 8,
      completed: 0,
      status: "locked",
      difficulty: "Advanced",
      rewards: "15,000 EDU",
      icon: Code,
      color: "text-indigo-600"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-900">Your Web3 Adventure Awaits</h2>
        <p className="text-gray-600">Choose your path and embark on a magical learning journey</p>
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
                  <span className="font-medium">{journey.completed}/{journey.lessons} stepping stones</span>
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
        ))}
      </div>
    </div>
  );
};

export default LearningJourney;
