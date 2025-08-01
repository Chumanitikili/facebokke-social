import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Edit, Save, X } from 'lucide-react';
import { toast } from 'sonner';

interface Profile {
  id: string;
  username: string;
  full_name: string;
  bio?: string;
  location?: string;
  avatar_url?: string;
}

const Profile = () => {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    bio: '',
    location: ''
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Besig om te laai...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
    } else {
      setProfile(data);
      setFormData({
        username: data.username,
        full_name: data.full_name,
        bio: data.bio || '',
        location: data.location || ''
      });
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user.id]);

  const handleSave = async () => {
    const { error } = await supabase
      .from('profiles')
      .update(formData)
      .eq('user_id', user.id);

    if (error) {
      toast.error('Kon nie profiel opdateer nie');
    } else {
      toast.success('Profiel suksesvol opdateer!');
      setEditing(false);
      fetchProfile();
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Besig om profiel te laai...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>My Profiel</CardTitle>
              {!editing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditing(true)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Redigeer
                </Button>
              ) : (
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditing(false);
                      setFormData({
                        username: profile.username,
                        full_name: profile.full_name,
                        bio: profile.bio || '',
                        location: profile.location || ''
                      });
                    }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Kanselleer
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Stoor
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Avatar */}
            <div className="flex justify-center">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {profile.full_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Profile Form */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Gebruikersnaam</label>
                {editing ? (
                  <Input
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Jou gebruikersnaam"
                  />
                ) : (
                  <p className="text-foreground">{profile.username}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Volle Naam</label>
                {editing ? (
                  <Input
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Jou volle naam"
                  />
                ) : (
                  <p className="text-foreground">{profile.full_name}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Bio</label>
                {editing ? (
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Vertel ons bietjie van jouself..."
                    rows={3}
                  />
                ) : (
                  <p className="text-foreground">{profile.bio || 'Geen bio nog nie'}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Ligging</label>
                {editing ? (
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Kaapstad, Suid-Afrika"
                  />
                ) : (
                  <p className="text-foreground">{profile.location || 'Geen ligging nie'}</p>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
              <div className="text-center">
                <p className="font-bold text-xl">0</p>
                <p className="text-sm text-muted-foreground">Posts</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-xl">0</p>
                <p className="text-sm text-muted-foreground">Vriende</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-xl">0</p>
                <p className="text-sm text-muted-foreground">Volgelinge</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;