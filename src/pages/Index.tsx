
import Header from "@/components/Header";
import LearningJourney from "@/components/LearningJourney";
import QuizCard from "@/components/QuizCard";
import AchievementBadge from "@/components/AchievementBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, Coins, TrendingUp } from "lucide-react";

const Index = () => {
  const stats = [
    { label: "Active Learners", value: "12,547", icon: Users, color: "text-blue-600" },
    { label: "Lessons Completed", value: "89,234", icon: BookOpen, color: "text-green-600" },
    { label: "EDU Earned", value: "77,000,000", icon: Coins, color: "text-yellow-600" },
    { label: "Success Rate", value: "94%", icon: TrendingUp, color: "text-purple-600" }
  ];

  const achievements = [
    {
      title: "First Steps",
      description: "Complete your first lesson",
      type: "milestone" as const,
      earned: true
    },
    {
      title: "Quiz Master",
      description: "Answer 50 quiz questions correctly",
      type: "quiz" as const,
      earned: true,
      progress: 47,
      total: 50
    },
    {
      title: "Learning Streak",
      description: "Learn for 7 consecutive days",
      type: "streak" as const,
      earned: false,
      progress: 4,
      total: 7
    },
    {
      title: "Blockchain Scholar",
      description: "Complete the Blockchain Basics course",
      type: "completion" as const,
      earned: false,
      progress: 10,
      total: 12
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text text-transparent leading-tight">
              Where Learning Becomes
              <br />
              Adventure
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Bringing the magic of blockchain education home to Bhutan, where every lesson unlocks new possibilities and ancient wisdom meets digital futures.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <Card key={index} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <stat.icon className={`h-8 w-8 mx-auto mb-3 ${stat.color}`} />
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Journey Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <LearningJourney />
        </div>
      </section>

      {/* Daily Challenge Section */}
      <section className="py-16 px-4 bg-white/50">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-gray-900">Today's Challenge</h2>
            <p className="text-gray-600">Test your knowledge and earn rewards</p>
          </div>
          <QuizCard />
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-gray-900">Your Achievements</h2>
            <p className="text-gray-600">Celebrate your learning milestones</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            {achievements.map((achievement, index) => (
              <AchievementBadge key={index} achievement={achievement} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <h3 className="text-2xl font-bold">Edustream</h3>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Bridging ancient Bhutanese wisdom with modern blockchain technology, creating a future where learning is both meaningful and rewarding.
          </p>
          <div className="flex justify-center space-x-8 text-sm text-gray-400">
            <a href="#" className="hover:text-white transition-colors">About</a>
            <a href="#" className="hover:text-white transition-colors">Community</a>
            <a href="#" className="hover:text-white transition-colors">Support</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
