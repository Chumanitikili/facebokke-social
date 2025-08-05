import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, MessageCircle, Camera, Calendar } from 'lucide-react';

const QuickActions = () => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button variant="ghost" className="w-full justify-start gap-3">
          <User className="h-5 w-5 text-primary" />
          Update Profile
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-3">
          <MessageCircle className="h-5 w-5 text-primary" />
          Messages
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-3">
          <Camera className="h-5 w-5 text-primary" />
          Upload Photo
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-3">
          <Calendar className="h-5 w-5 text-primary" />
          Create Event
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuickActions;