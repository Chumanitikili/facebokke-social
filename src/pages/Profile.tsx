import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit, Save, X, Upload, MapPin, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import PostCard from '@/components/PostCard';

interface Profile {
  id: string;
  username: string;
  full_name: string;
  bio?: string;
  location?: string;
  avatar_url?: string;
  created_at: string;
}

interface Post {
  id: string;
  content: string;
  image_url?: string;
  created_at: string;
  profiles: {
    username: string;
    full_name: string;
    avatar_url?: string;
  };
  likes: Array<{ user_id: string }>;
  comments: Array<{
    id: string;
    content: string;
    created_at: string;
    profiles: {
      username: string;
      full_name: string;
    };
  }>;
}

const Profile = () => {
  const { user, loading } = useAuth();
  const { userId } = useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [stats, setStats] = useState({ posts: 0, friends: 0 });
  const [editing, setEditing] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [postsLoading, setPostsLoading] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    bio: '',
    location: ''
  });

  const targetUserId = userId || user?.id;
  const isOwnProfile = !userId || userId === user?.id;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const fetchProfile = async () => {
    if (!targetUserId) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', targetUserId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      toast.error('Could not load profile');
    } else {
      setProfile(data);
      if (isOwnProfile) {
        setFormData({
          username: data.username,
          full_name: data.full_name,
          bio: data.bio || '',
          location: data.location || ''
        });
      }
    }
  };

  const fetchPosts = async () => {
    if (!targetUserId) return;
    
    setPostsLoading(true);
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles!posts_user_id_fkey (username, full_name, avatar_url),
        likes (user_id),
        comments (
          id,
          content,
          created_at,
          profiles!comments_user_id_fkey (username, full_name)
        )
      `)
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error);
    } else {
      setPosts((data as any) || []);
    }
    setPostsLoading(false);
  };

  const fetchStats = async () => {
    if (!targetUserId) return;
    
    // Fetch post count
    const { count: postCount } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', targetUserId);

    // Fetch friend count
    const { count: friendCount } = await supabase
      .from('friendships')
      .select('*', { count: 'exact', head: true })
      .or(`requester_id.eq.${targetUserId},addressee_id.eq.${targetUserId}`)
      .eq('status', 'accepted');

    setStats({
      posts: postCount || 0,
      friends: friendCount || 0
    });
  };

  useEffect(() => {
    if (targetUserId) {
      fetchProfile();
      fetchPosts();
      fetchStats();
    }
  }, [targetUserId]);

  const handleSave = async () => {
    if (!user) return;
    
    const { error } = await supabase
      .from('profiles')
      .update(formData)
      .eq('user_id', user.id);

    if (error) {
      toast.error('Could not update profile');
    } else {
      toast.success('Profile updated successfully!');
      setEditing(false);
      fetchProfile();
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0] || !user) return;
    
    const file = event.target.files[0];
    setAvatarUploading(true);

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/avatar.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      toast.error('Could not upload avatar');
      setAvatarUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(uploadData.path);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrlData.publicUrl })
      .eq('user_id', user.id);

    if (updateError) {
      toast.error('Could not update avatar');
    } else {
      toast.success('Avatar updated successfully!');
      fetchProfile();
    }
    setAvatarUploading(false);
  };

  const handleLike = async (postId: string) => {
    if (!user) return;
    
    const existingLike = posts
      .find(p => p.id === postId)
      ?.likes.find(l => l.user_id === user.id);

    if (existingLike) {
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);

      if (!error) fetchPosts();
    } else {
      const { error } = await supabase
        .from('likes')
        .insert({
          post_id: postId,
          user_id: user.id
        });

      if (!error) fetchPosts();
    }
  };

  const handleComment = async (postId: string, content: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        content,
        user_id: user.id
      });

    if (error) {
      toast.error('Could not post comment');
    } else {
      fetchPosts();
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Cover Photo & Profile Header */}
        <Card className="mb-6">
          <div className="h-48 bg-gradient-to-r from-primary/20 to-primary/40 rounded-t-lg relative">
            {/* Profile Picture */}
            <div className="absolute -bottom-16 left-8">
              <div className="relative">
                <Avatar className="w-32 h-32 border-4 border-background">
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-4xl">
                    {profile.full_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {isOwnProfile && (
                  <div className="absolute bottom-2 right-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 w-8 p-0 rounded-full"
                      disabled={avatarUploading}
                    >
                      <label htmlFor="avatar-upload" className="cursor-pointer">
                        <Upload className="w-4 h-4" />
                      </label>
                    </Button>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <CardContent className="pt-20 pb-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold">{profile.full_name}</h1>
                <p className="text-xl text-muted-foreground">@{profile.username}</p>
                {profile.bio && (
                  <p className="text-foreground max-w-md">{profile.bio}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {profile.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {profile.location}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Joined {new Date(profile.created_at).toLocaleDateString('en-US', { 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </div>
                </div>
              </div>
              
              {isOwnProfile && (
                <div>
                  {!editing ? (
                    <Button
                      variant="outline"
                      onClick={() => setEditing(true)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditing(false);
                          if (profile) {
                            setFormData({
                              username: profile.username,
                              full_name: profile.full_name,
                              bio: profile.bio || '',
                              location: profile.location || ''
                            });
                          }
                        }}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                      <Button onClick={handleSave}>
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Stats */}
            <div className="flex gap-8 mt-6 pt-6 border-t border-border">
              <div className="text-center">
                <p className="font-bold text-2xl">{stats.posts}</p>
                <p className="text-sm text-muted-foreground">Posts</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-2xl">{stats.friends}</p>
                <p className="text-sm text-muted-foreground">Friends</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile Modal */}
        {editing && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Username</label>
                <Input
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Your username"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Full Name</label>
                <Input
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Bio</label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us a bit about yourself..."
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Location</label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Cape Town, South Africa"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Profile Content Tabs */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts" className="space-y-4">
            {postsLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading posts...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {isOwnProfile ? "You haven't posted anything yet." : "No posts to show."}
                </p>
              </div>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={handleLike}
                  onComment={handleComment}
                  currentUserId={user?.id || ''}
                />
              ))
            )}
          </TabsContent>
          
          <TabsContent value="about">
            <Card>
              <CardContent className="pt-6 space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">About {profile.full_name}</h3>
                  <p className="text-muted-foreground">
                    {profile.bio || `${profile.full_name} hasn't written a bio yet.`}
                  </p>
                </div>
                
                {profile.location && (
                  <div>
                    <h4 className="font-medium mb-1">Location</h4>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      {profile.location}
                    </div>
                  </div>
                )}
                
                <div>
                  <h4 className="font-medium mb-1">Joined</h4>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {new Date(profile.created_at).toLocaleDateString('en-US', { 
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;