import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ImageIcon, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface CreatePostProps {
  onSubmit: (content: string, imageFile?: File) => void;
  loading?: boolean;
}

const CreatePost: React.FC<CreatePostProps> = ({ onSubmit, loading }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = () => {
    if (content.trim() || imageFile) {
      onSubmit(content, imageFile || undefined);
      setContent('');
      setImageFile(null);
      setImagePreview(null);
    }
  };

  return (
    <Card className="w-full mb-6">
      <CardContent className="pt-6">
        <div className="flex space-x-4">
          <Avatar>
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user?.email?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <Textarea
              placeholder="What's happening, buddy?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="border-none resize-none shadow-none focus-visible:ring-0 p-0 text-lg placeholder:text-muted-foreground"
              rows={3}
            />
            
            {imagePreview && (
              <div className="relative mt-4">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full max-h-64 object-cover rounded-lg"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={removeImage}
                  className="absolute top-2 right-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
            
            <div className="flex justify-between items-center mt-4">
              <div className="flex items-center space-x-2">
                <label htmlFor="image-upload">
                  <Button variant="ghost" size="sm" asChild>
                    <span className="cursor-pointer">
                      <ImageIcon className="w-5 h-5 text-accent mr-2" />
                      Photo
                    </span>
                  </Button>
                </label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
              
              <Button 
                onClick={handleSubmit} 
                disabled={(!content.trim() && !imageFile) || loading}
                className="bg-primary hover:bg-primary/90"
              >
                {loading ? 'Posting...' : 'Post'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreatePost;