import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share, Activity } from 'lucide-react';

const RecentActivity = () => {
  const activities = [
    {
      type: 'like',
      user: 'Sarah Wilson',
      action: 'liked your post',
      time: '2 minutes ago',
      avatar: null
    },
    {
      type: 'comment',
      user: 'Mike Chen',
      action: 'commented on your photo',
      time: '5 minutes ago',
      avatar: null
    },
    {
      type: 'share',
      user: 'Emma Davis',
      action: 'shared your post',
      time: '1 hour ago',
      avatar: null
    },
    {
      type: 'like',
      user: 'Alex Johnson',
      action: 'liked your comment',
      time: '2 hours ago',
      avatar: null
    }
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'comment':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'share':
        return <Share className="h-4 w-4 text-green-500" />;
      default:
        return <Activity className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={activity.avatar || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {activity.user.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {getIcon(activity.type)}
                <p className="text-sm">
                  <span className="font-medium">{activity.user}</span>{' '}
                  <span className="text-muted-foreground">{activity.action}</span>
                </p>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;