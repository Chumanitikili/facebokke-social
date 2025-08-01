import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Heart, MessageCircle, Share } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { af } from 'date-fns/locale';

interface PostCardProps {
  post: {
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
  };
  onLike: (postId: string) => void;
  onComment: (postId: string, content: string) => void;
  currentUserId: string;
}

const PostCard: React.FC<PostCardProps> = ({ post, onLike, onComment, currentUserId }) => {
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  
  const isLiked = post.likes.some(like => like.user_id === currentUserId);
  const likesCount = post.likes.length;
  const commentsCount = post.comments.length;

  const handleComment = () => {
    if (commentText.trim()) {
      onComment(post.id, commentText);
      setCommentText('');
    }
  };

  return (
    <Card className="w-full mb-4">
      <CardHeader className="pb-2">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={post.profiles.avatar_url} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {post.profiles.full_name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{post.profiles.full_name}</p>
            <p className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(post.created_at), { 
                addSuffix: true, 
                locale: af 
              })}
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="mb-4">{post.content}</p>
        
        {post.image_url && (
          <img 
            src={post.image_url} 
            alt="Post content" 
            className="w-full rounded-lg mb-4 max-h-96 object-cover"
          />
        )}
        
        {/* Actions */}
        <div className="flex items-center justify-between py-2 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onLike(post.id)}
            className={`${isLiked ? 'text-red-500' : 'text-muted-foreground'} hover:text-red-500`}
          >
            <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
            {likesCount > 0 && likesCount}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="text-muted-foreground hover:text-primary"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            {commentsCount > 0 && commentsCount}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-primary"
          >
            <Share className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 space-y-3">
            {post.comments.map((comment) => (
              <div key={comment.id} className="flex space-x-2">
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="bg-muted text-xs">
                    {comment.profiles.full_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 bg-muted rounded-lg px-3 py-2">
                  <p className="font-semibold text-sm">{comment.profiles.full_name}</p>
                  <p className="text-sm">{comment.content}</p>
                </div>
              </div>
            ))}
            
            {/* Add Comment */}
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Skryf 'n kommentaar..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleComment()}
                className="flex-1 px-3 py-2 border border-border rounded-lg bg-background"
              />
              <Button onClick={handleComment} size="sm">
                Pos
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PostCard;