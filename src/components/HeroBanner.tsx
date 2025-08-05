import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Users, Heart } from 'lucide-react';
import heroBanner from '@/assets/hero-banner.jpg';

const HeroBanner = () => {
  return (
    <div className="relative overflow-hidden rounded-xl mb-8">
      <div 
        className="h-64 bg-cover bg-center relative"
        style={{ backgroundImage: `url(${heroBanner})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-secondary/60" />
        <div className="relative z-10 h-full flex items-center justify-center text-center">
          <div className="max-w-2xl px-6">
            <h1 className="text-4xl font-bold text-white mb-4">
              Welcome to FACEBOKKE
            </h1>
            <p className="text-xl text-white/90 mb-6">
              Connect, share, and discover amazing content with friends around the world
            </p>
            <div className="flex items-center justify-center gap-6 text-white/80">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>10K+ Users</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                <span>50K+ Posts</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;