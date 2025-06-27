
// src/components/Header.tsx - Updated with new navigation and Community link
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BookOpen, Mountain, Coins, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNDIAuth } from "@/hooks/useNDIAuth";
import { NDILogin } from "./NDILogin";

const Header = () => {
  const { isAuthenticated, user, logout } = useNDIAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigate = useNavigate();
  
  const handleLoginSuccess = (userData: any) => {
    setShowLoginModal(false);
    console.log('User authenticated:', userData);
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleLessonsClick = () => {
    navigate('/');
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={handleLogoClick}>
              <Mountain className="h-8 w-8 text-orange-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Edustream
              </span>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <button 
                onClick={handleLessonsClick}
                className="text-gray-700 hover:text-orange-600 transition-colors"
              >
                Lessons
              </button>
              <button 
                onClick={() => navigate('/web3bhutan')}
                className="text-gray-700 hover:text-orange-600 transition-colors"
              >
                Web3 Bhutan
              </button>
              <button 
                onClick={() => navigate('/community')}
                className="text-gray-700 hover:text-orange-600 transition-colors"
              >
                Community
              </button>
              <button 
                onClick={() => navigate('/rewards')}
                className="text-gray-700 hover:text-orange-600 transition-colors"
              >
                Rewards
              </button>
            </nav>
            
            <div className="flex items-center space-x-4">
              {isAuthenticated && user ? (
                <>
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <Coins className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium">77,000,000 EDU</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-orange-600" />
                    </div>
                    <div className="hidden md:block">
                      <p className="text-sm font-medium">{user.fullName}</p>
                      <p className="text-xs text-gray-500">{user.institution}</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={logout}
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <Coins className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium">Start Earning EDU</span>
                  </div>
                  <Button 
                    className="bg-orange-600 hover:bg-orange-700"
                    onClick={() => setShowLoginModal(true)}
                  >
                    Sign in with NDI
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Secure Authentication</DialogTitle>
          </DialogHeader>
          <NDILogin 
            onSuccess={handleLoginSuccess}
            onCancel={() => setShowLoginModal(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Header;
