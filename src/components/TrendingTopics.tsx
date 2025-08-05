import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Hash } from 'lucide-react';

const TrendingTopics = () => {
  const trendingTopics = [
    { tag: 'Technology', posts: '1.2k posts' },
    { tag: 'Nature', posts: '856 posts' },
    { tag: 'Photography', posts: '743 posts' },
    { tag: 'Travel', posts: '612 posts' },
    { tag: 'Food', posts: '487 posts' },
  ];

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Hash className="h-5 w-5 text-primary" />
          Trending Topics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {trendingTopics.map((topic, index) => (
          <div
            key={index}
            className="flex justify-between items-center p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
          >
            <div>
              <p className="font-medium text-foreground">#{topic.tag}</p>
              <p className="text-sm text-muted-foreground">{topic.posts}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default TrendingTopics;