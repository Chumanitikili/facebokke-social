import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import CreatePost from '@/components/CreatePost';
import PostCard from '@/components/PostCard';
import TrendingTopics from '@/components/TrendingTopics';
import SuggestedFriends from '@/components/SuggestedFriends';
import QuickActions from '@/components/QuickActions';
import RecentActivity from '@/components/RecentActivity';
import HeroBanner from '@/components/HeroBanner';
import FeaturedContent from '@/components/FeaturedContent';
import VideoSection from '@/components/VideoSection';
import LiveUpdates from '@/components/LiveUpdates';
import { toast } from 'sonner';

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

const Index = () => {
  const { user, loading } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [createPostLoading, setCreatePostLoading] = useState(false);

  const fetchPosts = async () => {
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
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Could not load posts');
      console.error('Error fetching posts:', error);
    } else {
      setPosts((data as any) || []);
    }
    setPostsLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary">FACEBOKKE</h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleCreatePost = async (content: string, imageFile?: File) => {
    setCreatePostLoading(true);
    let imageUrl = null;

    // Upload image if provided
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(fileName, imageFile);

      if (uploadError) {
        toast.error('Could not upload image');
        setCreatePostLoading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from('post-images')
        .getPublicUrl(uploadData.path);

      imageUrl = publicUrlData.publicUrl;
    }

    // Create post
    const { error } = await supabase
      .from('posts')
      .insert({
        content,
        image_url: imageUrl,
        user_id: user.id
      });

    if (error) {
      toast.error('Could not create post');
      console.error('Error creating post:', error);
    } else {
      toast.success('Post created successfully!');
      fetchPosts(); // Refresh posts
    }
    setCreatePostLoading(false);
  };

  const handleLike = async (postId: string) => {
    const existingLike = posts
      .find(p => p.id === postId)
      ?.likes.find(l => l.user_id === user.id);

    if (existingLike) {
      // Unlike
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);

      if (!error) {
        fetchPosts();
      }
    } else {
      // Like
      const { error } = await supabase
        .from('likes')
        .insert({
          post_id: postId,
          user_id: user.id
        });

      if (!error) {
        fetchPosts();
      }
    }
  };

  const handleComment = async (postId: string, content: string) => {
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
      fetchPosts(); // Refresh posts
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Banner */}
        <HeroBanner />
        
        {/* Featured Content */}
        <FeaturedContent />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <TrendingTopics />
            <VideoSection />
            <SuggestedFriends />
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-2">
            <CreatePost onSubmit={handleCreatePost} loading={createPostLoading} />
            
            {postsLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading posts...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No posts yet. Be the first to post something!</p>
              </div>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={handleLike}
                  onComment={handleComment}
                  currentUserId={user.id}
                />
              ))
            )}
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <LiveUpdates />
            <QuickActions />
            <RecentActivity />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
