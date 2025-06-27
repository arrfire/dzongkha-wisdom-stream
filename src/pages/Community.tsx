
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Users, MessageCircle, Globe, Code, TrendingUp } from "lucide-react";

const Community = () => {
  const communities = [
    {
      id: 'global-edustream',
      title: 'Global Edustream Group',
      description: 'Join our main community hub where learners from around the world connect, share insights, and collaborate on Web3 education.',
      platform: 'Telegram',
      url: 'https://t.me/blockvocates',
      members: '2,500+',
      icon: Globe,
      color: 'bg-blue-500',
      category: 'Global'
    },
    {
      id: 'bhutan-builders',
      title: 'Bhutan Builders Community',
      description: 'Local builders and innovators shaping Bhutan\'s digital future. Connect with fellow Bhutanese working on tech projects.',
      platform: 'WhatsApp',
      url: 'https://chat.whatsapp.com/HPaCtyXaBtt26t5s3pDMNA',
      members: '800+',
      icon: Users,
      color: 'bg-green-500',
      category: 'Local'
    },
    {
      id: 'web3-builders',
      title: 'Web3 Community Builders',
      description: 'For those building the next generation of decentralized communities and applications. Share experiences and learn together.',
      platform: 'WhatsApp',
      url: 'https://chat.whatsapp.com/JZnSoGtblP3LbvDOIOj34H',
      members: '1,200+',
      icon: Users,
      color: 'bg-purple-500',
      category: 'Builders'
    },
    {
      id: 'crypto-traders',
      title: 'Web3 Crypto Traders',
      description: 'Discuss trading strategies, market analysis, and investment opportunities in the cryptocurrency and Web3 space.',
      platform: 'WhatsApp',
      url: 'https://chat.whatsapp.com/BkCw25GjVLxIRvg6bfqNFW',
      members: '3,100+',
      icon: TrendingUp,
      color: 'bg-yellow-500',
      category: 'Trading'
    },
    {
      id: 'web3-developers',
      title: 'Web3 Developers',
      description: 'Technical discussions, code reviews, and collaboration among developers building on blockchain and Web3 technologies.',
      platform: 'WhatsApp',
      url: 'https://chat.whatsapp.com/HKpBSjHuWovBthjIPTxTUF',
      members: '1,800+',
      icon: Code,
      color: 'bg-indigo-500',
      category: 'Development'
    }
  ];

  const handleJoinCommunity = (url: string, title: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text text-transparent">
            Join Our Global Community
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connect with thousands of learners, builders, and innovators from around the world. 
            Share knowledge, collaborate on projects, and grow together in the Web3 ecosystem.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mt-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">8,000+</div>
              <div className="text-sm text-gray-600">Community Members</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">24/7</div>
              <div className="text-sm text-gray-600">Active Discussions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">50+</div>
              <div className="text-sm text-gray-600">Countries</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">5</div>
              <div className="text-sm text-gray-600">Specialized Groups</div>
            </div>
          </div>
        </div>
      </section>

      {/* Communities Grid */}
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communities.map((community) => {
              const IconComponent = community.icon;
              return (
                <Card key={community.id} className="border-2 border-gray-100 hover:border-orange-200 transition-all duration-300 hover:shadow-lg">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className={`p-3 rounded-lg ${community.color} mb-3`}>
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {community.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{community.title}</CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {community.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <MessageCircle className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">{community.platform}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-gray-700">{community.members}</span>
                      </div>
                    </div>

                    <Button 
                      onClick={() => handleJoinCommunity(community.url, community.title)}
                      className="w-full bg-orange-600 hover:bg-orange-700"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Join Community
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Community Guidelines */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-blue-100 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-800">
                <Users className="h-5 w-5" />
                <span>Community Guidelines</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-blue-800 mb-2">✨ Be Respectful</h4>
                  <p className="text-blue-700 text-sm">Treat all members with kindness and respect, regardless of their experience level.</p>
                </div>
                <div>
                  <h4 className="font-bold text-blue-800 mb-2">🤝 Share Knowledge</h4>
                  <p className="text-blue-700 text-sm">Help others learn and grow by sharing your experiences and insights.</p>
                </div>
                <div>
                  <h4 className="font-bold text-blue-800 mb-2">📚 Stay On Topic</h4>
                  <p className="text-blue-700 text-sm">Keep discussions relevant to the group's focus and purpose.</p>
                </div>
                <div>
                  <h4 className="font-bold text-blue-800 mb-2">🌱 Support Growth</h4>
                  <p className="text-blue-700 text-sm">Encourage learning and celebrate the achievements of fellow members.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Community;
