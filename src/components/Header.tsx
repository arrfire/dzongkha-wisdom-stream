
import { Button } from "@/components/ui/button";
import { BookOpen, Mountain, Coins } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b border-orange-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Mountain className="h-8 w-8 text-orange-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Edustream
            </span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-700 hover:text-orange-600 transition-colors">Lessons</a>
            <a href="#" className="text-gray-700 hover:text-orange-600 transition-colors">Quizzes</a>
            <a href="#" className="text-gray-700 hover:text-orange-600 transition-colors">Community</a>
            <a href="#" className="text-gray-700 hover:text-orange-600 transition-colors">Rewards</a>
          </nav>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <Coins className="h-4 w-4 text-yellow-500" />
              <span className="font-medium">1,247 BTC</span>
            </div>
            <Button className="bg-orange-600 hover:bg-orange-700">
              Start Learning
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
