// src/components/RewardsPage.tsx - Rewards marketplace for NDI credential holders
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Gift, ShoppingBag, Plane, Utensils, Laptop, Shield, 
  CheckCircle, ExternalLink, MapPin, Clock, Percent, BookOpen, Trophy
} from "lucide-react";
import { NDIUser } from "@/types/ndi";
import { LearnerProfile } from "@/types/learnerProfile";
import CredentialVerification from "./CredentialVerification";

interface RewardOffer {
  id: string;
  title: string;
  description: string;
  discount: string;
  category: 'restaurant' | 'travel' | 'tools' | 'shopping';
  partner: string;
  location?: string;
  validUntil: Date;
  requiredCredentials: string[];
  redemptionCode?: string;
  isRedeemed: boolean;
  icon: React.ComponentType<{ className?: string }>;
}

interface RewardsPageProps {
  user: NDIUser;
  learnerProfile: LearnerProfile;
}

export const RewardsPage: React.FC<RewardsPageProps> = ({
  user,
  learnerProfile
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [redeemedOffers, setRedeemedOffers] = useState<string[]>([]);
  const [verifiedCredentials, setVerifiedCredentials] = useState<any[]>([]);

  // Sample reward offers
  const rewardOffers: RewardOffer[] = [
    {
      id: 'restaurant-1',
      title: '20% Off Traditional Bhutanese Cuisine',
      description: 'Enjoy authentic Bhutanese dishes at Thimphu\'s premier restaurant',
      discount: '20%',
      category: 'restaurant',
      partner: 'Heritage Restaurant',
      location: 'Thimphu',
      validUntil: new Date('2024-12-31'),
      requiredCredentials: ['mission_completion'],
      isRedeemed: false,
      icon: Utensils
    },
    {
      id: 'travel-1',
      title: '15% Off Domestic Flights',
      description: 'Explore Bhutan with discounted flights to Paro and other destinations',
      discount: '15%',
      category: 'travel',
      partner: 'Bhutan Airlines',
      validUntil: new Date('2024-11-30'),
      requiredCredentials: ['journey_completion'],
      isRedeemed: false,
      icon: Plane
    },
    {
      id: 'tools-1',
      title: '50% Off Developer Tools Subscription',
      description: 'Access premium development tools and resources',
      discount: '50%',
      category: 'tools',
      partner: 'GitBook Pro',
      validUntil: new Date('2024-10-31'),
      requiredCredentials: ['mission_completion', 'skill_verification'],
      isRedeemed: false,
      icon: Laptop
    },
    {
      id: 'restaurant-2',
      title: 'Free Appetizer with Main Course',
      description: 'Complimentary starter with any main dish order',
      discount: 'Free Item',
      category: 'restaurant',
      partner: 'Mountain View Cafe',
      location: 'Paro',
      validUntil: new Date('2024-12-15'),
      requiredCredentials: ['mission_completion'],
      isRedeemed: false,
      icon: Utensils
    },
    {
      id: 'travel-2',
      title: '25% Off Hotel Bookings',
      description: 'Special rates for verified EduStream learners',
      discount: '25%',
      category: 'travel',
      partner: 'Bhutan Hotels Network',
      validUntil: new Date('2025-01-31'),
      requiredCredentials: ['journey_completion'],
      isRedeemed: false,
      icon: Plane
    },
    {
      id: 'tools-2',
      title: '30% Off Design Software',
      description: 'Professional design tools for creative projects',
      discount: '30%',
      category: 'tools',
      partner: 'CreativeCloud',
      validUntil: new Date('2024-12-31'),
      requiredCredentials: ['skill_verification'],
      isRedeemed: false,
      icon: Laptop
    }
  ];

  // Mock leaderboard data
  const leaderboardData = [
    { rank: 1, name: "Tenzin Norbu", institution: "Royal University of Bhutan", credentials: 15, eduTokens: 2500000, avatar: "TN" },
    { rank: 2, name: "Pema Choden", institution: "Thimphu TechPark", credentials: 12, eduTokens: 2100000, avatar: "PC" },
    { rank: 3, name: "Karma Wangchuk", institution: "Druk School of Business", credentials: 11, eduTokens: 1900000, avatar: "KW" },
    { rank: 4, name: "Sonam Yangchen", institution: "College of Natural Resources", credentials: 10, eduTokens: 1750000, avatar: "SY" },
    { rank: 5, name: "Dorji Phuntsho", institution: "Jigme Namgyel Engineering College", credentials: 9, eduTokens: 1600000, avatar: "DP" },
    { rank: 6, name: "Kinley Dem", institution: "Samtse College of Education", credentials: 8, eduTokens: 1450000, avatar: "KD" },
    { rank: 7, name: "Ugyen Tshering", institution: "Sherubtse College", credentials: 7, eduTokens: 1300000, avatar: "UT" },
    { rank: 8, name: "Chimi Wangmo", institution: "Gedu College of Business Studies", credentials: 6, eduTokens: 1150000, avatar: "CW" },
  ];

  const handleVerificationComplete = (credentials: any[]) => {
    setVerifiedCredentials(credentials);
    console.log('✅ Credentials verified:', credentials);
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  const getUserCredentialTypes = () => {
    const credentialTypes = new Set<string>();
    learnerProfile.progress.forEach(progress => {
      progress.credentialsEarned.forEach(credential => {
        credentialTypes.add(credential.credentialType);
      });
    });
    return Array.from(credentialTypes);
  };

  const canRedeemOffer = (offer: RewardOffer) => {
    const userCredentials = getUserCredentialTypes();
    return offer.requiredCredentials.some(required => userCredentials.includes(required));
  };

  const redeemOffer = (offerId: string) => {
    setRedeemedOffers(prev => [...prev, offerId]);
    console.log('Offer redeemed:', offerId);
  };

  const filteredOffers = selectedCategory === 'all' 
    ? rewardOffers 
    : rewardOffers.filter(offer => offer.category === selectedCategory);

  const totalCredentials = learnerProfile.progress.reduce(
    (total, progress) => total + progress.credentialsEarned.length, 0
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header with Go Home Button */}
      <div className="flex items-center justify-between mb-6">
        <Button 
          onClick={handleGoHome}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <ExternalLink className="h-4 w-4" />
          <span>Go Back Home</span>
        </Button>
      </div>

      {/* Header */}
      <Card className="border-2 border-yellow-100 bg-gradient-to-r from-yellow-50 to-orange-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">EduStream Rewards</h1>
              <p className="text-gray-600">
                Use your verified NDI credentials to unlock exclusive discounts and offers from local businesses
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{totalCredentials}</div>
              <div className="text-sm text-gray-600">Verified Credentials</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verification Status */}
      <Card className="border border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-green-600" />
            <div>
              <h3 className="font-bold text-green-800">NDI Credential Verification Active</h3>
              <p className="text-sm text-green-600">
                Your EduStream credentials are verified and ready to use for exclusive rewards
              </p>
            </div>
            <CheckCircle className="h-6 w-6 text-green-600 ml-auto" />
          </div>
        </CardContent>
      </Card>

      {/* Credential Verification Section */}
      <CredentialVerification onVerificationComplete={handleVerificationComplete} />

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All Offers</TabsTrigger>
          <TabsTrigger value="restaurant">Restaurants</TabsTrigger>
          <TabsTrigger value="travel">Travel</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
          <TabsTrigger value="shopping">Shopping</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        {/* Existing tabs content */}
        <TabsContent value={selectedCategory} className="mt-6">
          {selectedCategory === 'leaderboard' ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  <span>National Blockchain Learning Leaderboard</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6 text-center">
                  Top learners in Bhutan's blockchain education program. Compete with peers and earn additional EDU rewards!
                </p>
                
                <div className="space-y-4">
                  {leaderboardData.map((learner, index) => (
                    <Card key={learner.rank} className={`border-2 transition-all duration-200 ${
                      learner.rank <= 3 
                        ? 'border-yellow-200 bg-yellow-50' 
                        : 'border-gray-200'
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                              learner.rank === 1 ? 'bg-yellow-500' :
                              learner.rank === 2 ? 'bg-gray-400' :
                              learner.rank === 3 ? 'bg-orange-600' :
                              'bg-blue-500'
                            }`}>
                              {learner.rank <= 3 ? (
                                <Trophy className="h-6 w-6" />
                              ) : (
                                learner.avatar
                              )}
                            </div>
                            
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="text-2xl font-bold text-gray-800">#{learner.rank}</span>
                                <div>
                                  <h4 className="font-bold text-lg">{learner.name}</h4>
                                  <p className="text-sm text-gray-600">{learner.institution}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-6 text-right">
                            <div>
                              <div className="text-lg font-bold text-green-600">{learner.credentials}</div>
                              <div className="text-xs text-gray-600">Credentials</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold text-orange-600">
                                {learner.eduTokens.toLocaleString()} EDU
                              </div>
                              <div className="text-xs text-gray-600">Tokens Earned</div>
                            </div>
                          </div>
                        </div>
                        
                        {learner.rank <= 3 && (
                          <div className="mt-3 pt-3 border-t border-yellow-200">
                            <Badge className={`${
                              learner.rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                              learner.rank === 2 ? 'bg-gray-100 text-gray-800' :
                              'bg-orange-100 text-orange-800'
                            }`}>
                              {learner.rank === 1 ? '🥇 Gold Champion' :
                               learner.rank === 2 ? '🥈 Silver Expert' :
                               '🥉 Bronze Leader'}
                            </Badge>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                  <h4 className="font-bold text-blue-800 mb-2">🎯 Leaderboard Rewards</h4>
                  <p className="text-sm text-blue-700">
                    Top 10 learners each month receive bonus EDU tokens and exclusive access to premium content!
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOffers.map(offer => {
              const canRedeem = canRedeemOffer(offer);
              const isRedeemed = redeemedOffers.includes(offer.id);
              
              return (
                <Card 
                  key={offer.id} 
                  className={`border-2 transition-all duration-200 ${
                    canRedeem && !isRedeemed
                      ? 'border-green-200 hover:border-green-300 hover:shadow-lg'
                      : 'border-gray-200 opacity-75'
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          offer.category === 'restaurant' ? 'bg-orange-100' :
                          offer.category === 'travel' ? 'bg-blue-100' :
                          offer.category === 'tools' ? 'bg-purple-100' :
                          'bg-green-100'
                        }`}>
                          <offer.icon className={`h-6 w-6 ${
                            offer.category === 'restaurant' ? 'text-orange-600' :
                            offer.category === 'travel' ? 'text-blue-600' :
                            offer.category === 'tools' ? 'text-purple-600' :
                            'text-green-600'
                          }`} />
                        </div>
                        <div>
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <Percent className="h-3 w-3 mr-1" />
                            {offer.discount}
                          </Badge>
                        </div>
                      </div>
                      {isRedeemed && (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Redeemed
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg">{offer.title}</CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-gray-600 text-sm">{offer.description}</p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <ShoppingBag className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{offer.partner}</span>
                      </div>
                      
                      {offer.location && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span>{offer.location}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>Valid until {offer.validUntil.toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <div className="text-xs text-gray-500 mb-2">Required credentials:</div>
                      <div className="flex flex-wrap gap-1">
                        {offer.requiredCredentials.map(cred => (
                          <Badge key={cred} variant="outline" className="text-xs">
                            {cred.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button 
                      className={`w-full ${
                        canRedeem && !isRedeemed
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-gray-400 cursor-not-allowed'
                      }`}
                      disabled={!canRedeem || isRedeemed}
                      onClick={() => redeemOffer(offer.id)}
                    >
                      {isRedeemed ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Redeemed
                        </>
                      ) : canRedeem ? (
                        <>
                          <Gift className="h-4 w-4 mr-2" />
                          Redeem Offer
                        </>
                      ) : (
                        <>
                          <Shield className="h-4 w-4 mr-2" />
                          Credentials Required
                        </>
                      )}
                    </Button>

                    {isRedeemed && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="text-sm font-medium text-green-800 mb-1">
                          Redemption Code:
                        </div>
                        <div className="font-mono text-lg text-green-700 bg-white px-3 py-1 rounded border">
                          EDU{offer.id.toUpperCase().slice(-6)}
                        </div>
                        <div className="text-xs text-green-600 mt-2">
                          Show this code to {offer.partner} to claim your discount
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* How it Works */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Gift className="h-5 w-5 text-purple-600" />
            <span>How EduStream Rewards Work</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-bold mb-2">1. Learn & Earn Credentials</h4>
              <p className="text-sm text-gray-600">
                Complete missions and journeys to earn verified NDI credentials
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-bold mb-2">2. Verify Your Skills</h4>
              <p className="text-sm text-gray-600">
                Your credentials are securely verified through Bhutan's NDI system
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Gift className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-bold mb-2">3. Unlock Exclusive Rewards</h4>
              <p className="text-sm text-gray-600">
                Use your verified skills to access special discounts and offers
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RewardsPage;
