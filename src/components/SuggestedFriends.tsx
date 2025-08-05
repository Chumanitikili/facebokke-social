import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserPlus, Users } from 'lucide-react';

const SuggestedFriends = () => {
  const suggestedFriends = [
    { name: 'Alex Johnson', username: 'alex_j', mutualFriends: 5, avatar: null },
    { name: 'Sarah Wilson', username: 'sarah_w', mutualFriends: 3, avatar: null },
    { name: 'Mike Chen', username: 'mike_c', mutualFriends: 7, avatar: null },
    { name: 'Emma Davis', username: 'emma_d', mutualFriends: 2, avatar: null },
  ];

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          People You May Know
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestedFriends.map((friend, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={friend.avatar || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {friend.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-foreground">{friend.name}</p>
                <p className="text-sm text-muted-foreground">
                  {friend.mutualFriends} mutual friends
                </p>
              </div>
            </div>
            <Button size="sm" variant="outline" className="gap-1">
              <UserPlus className="h-4 w-4" />
              Add
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default SuggestedFriends;