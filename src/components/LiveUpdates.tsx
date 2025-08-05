import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, TrendingUp, Users, MessageSquare } from 'lucide-react';

const LiveUpdates = () => {
  const [updates, setUpdates] = useState([
    { id: 1, type: 'trending', text: '#Technology is trending now', time: 'Just now', icon: TrendingUp },
    { id: 2, type: 'users', text: '25 new users joined today', time: '2 min ago', icon: Users },
    { id: 3, type: 'posts', text: '156 new posts in the last hour', time: '5 min ago', icon: MessageSquare },
    { id: 4, type: 'activity', text: 'Peak activity detected', time: '8 min ago', icon: Zap },
  ]);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'trending': return 'bg-orange-500/10 text-orange-500';
      case 'users': return 'bg-blue-500/10 text-blue-500';
      case 'posts': return 'bg-green-500/10 text-green-500';
      case 'activity': return 'bg-purple-500/10 text-purple-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary animate-pulse" />
          Live Updates
          <Badge variant="secondary" className="ml-auto">
            {currentTime.toLocaleTimeString()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {updates.map((update) => {
          const Icon = update.icon;
          return (
            <div
              key={update.id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors"
            >
              <div className={`p-2 rounded-full ${getTypeColor(update.type)}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{update.text}</p>
                <p className="text-xs text-muted-foreground">{update.time}</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default LiveUpdates;