import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Clock, User } from 'lucide-react';
import videoThumbnail from '@/assets/video-thumbnail.jpg';

const VideoSection = () => {
  const videos = [
    {
      id: 1,
      title: 'Getting Started with FACEBOKKE',
      duration: '3:24',
      author: 'Team FACEBOKKE',
      views: '12.5k',
      thumbnail: videoThumbnail
    },
    {
      id: 2,
      title: 'Community Stories',
      duration: '5:18',
      author: 'Community Team',
      views: '8.3k',
      thumbnail: videoThumbnail
    },
    {
      id: 3,
      title: 'Tips for Better Posts',
      duration: '2:45',
      author: 'Content Creator',
      views: '15.2k',
      thumbnail: videoThumbnail
    }
  ];

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <Play className="h-6 w-6 text-primary" />
          Featured Videos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {videos.map((video) => (
            <div key={video.id} className="flex gap-4 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
              <div className="relative flex-shrink-0">
                <img 
                  src={video.thumbnail} 
                  alt={video.title}
                  className="w-24 h-16 object-cover rounded-md"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Play className="w-6 h-6 text-white drop-shadow-lg" />
                </div>
                <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {video.duration}
                  </div>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm line-clamp-2 mb-1">{video.title}</h4>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <User className="w-3 h-3" />
                  <span>{video.author}</span>
                  <span>•</span>
                  <span>{video.views} views</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <Button variant="outline" className="w-full mt-4">
          View All Videos
        </Button>
      </CardContent>
    </Card>
  );
};

export default VideoSection;