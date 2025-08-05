import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Eye, Heart, MessageCircle } from 'lucide-react';
import featuredImage from '@/assets/featured-content.jpg';
import videoThumbnail from '@/assets/video-thumbnail.jpg';
import communityImage from '@/assets/community-highlights.jpg';

const FeaturedContent = () => {
  const featuredItems = [
    {
      id: 1,
      type: 'image',
      title: 'Amazing Photography Collection',
      description: 'Discover breathtaking photos from our community',
      image: featuredImage,
      stats: { views: '2.3k', likes: '156', comments: '42' }
    },
    {
      id: 2,
      type: 'video',
      title: 'Community Highlights',
      description: 'Watch the best moments from this week',
      image: videoThumbnail,
      stats: { views: '5.1k', likes: '234', comments: '67' }
    },
    {
      id: 3,
      type: 'community',
      title: 'Join Our Growing Community',
      description: 'Meet amazing people and make new connections',
      image: communityImage,
      stats: { views: '1.8k', likes: '89', comments: '23' }
    }
  ];

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-6 text-foreground">Featured Content</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuredItems.map((item) => (
          <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              <img 
                src={item.image} 
                alt={item.title}
                className="w-full h-48 object-cover"
              />
              {item.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button size="lg" className="rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm">
                    <Play className="w-6 h-6 text-white" />
                  </Button>
                </div>
              )}
              <div className="absolute top-3 right-3">
                <span className="px-2 py-1 bg-primary/80 text-white text-xs rounded-full capitalize">
                  {item.type}
                </span>
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
              <p className="text-muted-foreground text-sm mb-4">{item.description}</p>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {item.stats.views}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    {item.stats.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    {item.stats.comments}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FeaturedContent;