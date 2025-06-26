// src/components/VideoLessonDisplay.tsx - Enhanced video component with Blockvocates videos
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, ExternalLink, BookOpen, Clock } from "lucide-react";
import { VideoLesson, getVideosForMission, getAllVideosForJourney } from "@/data/videoMapping";
import { Journey } from "@/data/journeyData";

interface VideoLessonDisplayProps {
  journey: Journey;
  missionId?: string;
  showAllVideos?: boolean;
  className?: string;
}

const VideoLessonDisplay: React.FC<VideoLessonDisplayProps> = ({
  journey,
  missionId,
  showAllVideos = false,
  className = ""
}) => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Get videos based on props
  const videos = showAllVideos 
    ? getAllVideosForJourney(journey.id)
    : missionId 
      ? getVideosForMission(journey.id, missionId)
      : [];

  if (!videos || videos.length === 0) {
    return (
      <Card className={`border-orange-200 ${className}`}>
        <CardContent className="p-6 text-center">
          <BookOpen className="h-12 w-12 text-orange-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Video Lessons Coming Soon
          </h3>
          <p className="text-gray-500">
            We're preparing amazing video content for this section. Check back soon!
          </p>
        </CardContent>
      </Card>
    );
  }

  const currentVideo = videos[currentVideoIndex];

  const handleVideoSelect = (index: number) => {
    setCurrentVideoIndex(index);
    setIsPlaying(false);
  };

  const openInYouTube = () => {
    window.open(`https://www.youtube.com/watch?v=${currentVideo.youtubeId}`, '_blank');
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Video Player */}
      <Card className="border-2 border-orange-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Play className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-xl text-orange-800">
                  {currentVideo.title}
                </CardTitle>
                {journey && (
                  <div className="flex items-center space-x-2 mt-1">
                    <journey.icon className={`h-4 w-4 ${journey.color}`} />
                    <span className="text-sm text-gray-600">{journey.title}</span>
                  </div>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={openInYouTube}
              className="flex items-center space-x-2"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Open in YouTube</span>
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {/* Enhanced Video Embed - Larger Size */}
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              className="absolute top-0 left-0 w-full h-full rounded-lg shadow-md"
              src={`https://www.youtube.com/embed/${currentVideo.youtubeId}?enablejsapi=1&rel=0&modestbranding=1`}
              title={currentVideo.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
          
          {/* Video Description */}
          {currentVideo.description && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">About this lesson:</h4>
              <p className="text-gray-600 leading-relaxed">{currentVideo.description}</p>
              
              {currentVideo.duration && (
                <div className="flex items-center space-x-2 mt-3">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500">Duration: {currentVideo.duration}</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Video Playlist - Show if multiple videos */}
      {videos.length > 1 && (
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>Video Lessons ({videos.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {videos.map((video, index) => (
              <div
                key={video.id}
                className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                  index === currentVideoIndex
                    ? 'bg-orange-50 border-2 border-orange-200'
                    : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                }`}
                onClick={() => handleVideoSelect(index)}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    index === currentVideoIndex 
                      ? 'bg-orange-200 text-orange-700' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    <span className="font-bold">{index + 1}</span>
                  </div>
                  
                  <div className="flex-1">
                    <h4 className={`font-medium ${
                      index === currentVideoIndex ? 'text-orange-800' : 'text-gray-800'
                    }`}>
                      {video.title}
                    </h4>
                    {video.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {video.description}
                      </p>
                    )}
                    {video.duration && (
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {video.duration}
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  {index === currentVideoIndex && (
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-orange-100 text-orange-800">
                        Now Playing
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VideoLessonDisplay;