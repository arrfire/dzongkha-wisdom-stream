
// src/pages/Profile.tsx - Profile page wrapper
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfilePage from "@/components/ProfilePage";
import { useNDIAuth } from "@/hooks/useNDIAuth";
import { learnerProfileService } from "@/services/learnerProfileService";
import { LearnerProfile } from "@/types/learnerProfile";
import { NDIUser } from "@/types/ndi";
import { journeyData } from "@/data/journeyData";

const Profile = () => {
  const { isAuthenticated, user } = useNDIAuth();
  const [learnerProfile, setLearnerProfile] = useState<LearnerProfile | null>(null);
  const [guestUser, setGuestUser] = useState<NDIUser | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for guest user in localStorage
    const savedGuestUser = localStorage.getItem('guestUser');
    if (savedGuestUser) {
      setGuestUser(JSON.parse(savedGuestUser));
    }
  }, []);

  useEffect(() => {
    const currentUser = user || guestUser;
    if (!currentUser && !isAuthenticated) {
      navigate('/');
      return;
    }

    if (currentUser) {
      let profile = learnerProfileService.getLearnerProfile();
      
      if (!profile || profile.ndiUser.citizenId !== currentUser.citizenId) {
        profile = learnerProfileService.createLearnerProfile(currentUser);
      }
      
      setLearnerProfile(profile);
    }
  }, [isAuthenticated, user, guestUser, navigate]);

  const currentUser = user || guestUser;
  
  if (!currentUser || !learnerProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Loading Profile...</h2>
          <p className="text-gray-600">Please wait while we load your profile.</p>
        </div>
      </div>
    );
  }

  const selectedJourney = journeyData.find(j => 
    learnerProfile.progress.some(p => p.journeyId === j.id)
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
