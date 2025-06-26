// src/pages/Profile.tsx - Updated with better routing logic
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfilePage from "@/components/ProfilePage";
import { useNDIAuth } from "@/hooks/useNDIAuth";
// Corrected import: import the specific instance and alias it
import { enhancedLearnerProfileServiceInstance as learnerProfileService } from "@/services/enhancedLearnerProfileService";
import { LearnerProfile } from "@/types/learnerProfile";
import { NDIUser } from "@/types/ndi";
import { journeyData } from "@/data/journeyData";

const Profile = () => {
  const { isAuthenticated, user } = useNDIAuth();
  const [learnerProfile, setLearnerProfile] = useState<LearnerProfile | null>(null);
  const [guestUser, setGuestUser] = useState<NDIUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for guest user in localStorage first
    const savedGuestUser = localStorage.getItem('guestUser');
    if (savedGuestUser) {
      try {
        setGuestUser(JSON.parse(savedGuestUser));
      } catch (error) {
        console.error('Error parsing guest user:', error);
        localStorage.removeItem('guestUser');
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isLoading) return; // Wait for initial load to complete

    const currentUser = user || guestUser;
    
    // Only redirect if we've finished loading AND there's no user at all
    if (!currentUser && !isAuthenticated) {
      console.log('No user found after loading, redirecting to homepage');
      navigate('/');
      return;
    }

    if (currentUser) {
      let profile = learnerProfileService.getLearnerProfile();
      
      if (!profile || profile.ndiUser.citizenId !== currentUser.citizenId) {
        profile = learnerProfileService.createLearnerProfile(currentUser);
      } else {
        // Update login activity for existing profile
        profile = learnerProfileService.updateLoginActivity(profile); // Ensure this is called only if profile exists
      }
      
      setLearnerProfile(profile);
    }
  }, [isAuthenticated, user, guestUser, navigate, isLoading]);

  // Show loading state while determining user status
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Loading Profile...</h2>
          <p className="text-gray-600">Please wait while we load your profile.</p>
        </div>
      </div>
    );
  }

  const currentUser = user || guestUser;
  
  // Don't render anything if redirecting
  if (!currentUser) {
    return null;
  }

  // Wait for learner profile to be created
  if (!learnerProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Setting up Profile...</h2>
          <p className="text-gray-600">Preparing your learning dashboard.</p>
        </div>
      </div>
    );
  }

  const selectedJourney = journeyData.find(j => 
    learnerProfile?.progress.some(p => p.journeyId === j.id)
  );

  return (
    <ProfilePage 
      user={currentUser}
      learnerProfile={learnerProfile}
      selectedJourney={selectedJourney}
    />
  );
};

export default Profile;