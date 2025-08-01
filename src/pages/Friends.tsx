import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserPlus, UserCheck, UserX, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Profile {
  id: string;
  user_id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
}

interface Friendship {
  id: string;
  status: 'pending' | 'accepted' | 'declined';
  requester_id: string;
  addressee_id: string;
  profiles_requester: Profile;
  profiles_addressee: Profile;
}

const Friends = () => {
  const { user, loading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [friendRequests, setFriendRequests] = useState<Friendship[]>([]);
  const [friends, setFriends] = useState<Friendship[]>([]);

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

  const searchUsers = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`username.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`)
      .neq('user_id', user.id)
      .limit(10);

    if (!error) {
      setSearchResults(data || []);
    }
  };

  const fetchFriendRequests = async () => {
    const { data, error } = await supabase
      .from('friendships')
      .select(`
        *,
        profiles_requester:profiles!friendships_requester_id_fkey(*),
        profiles_addressee:profiles!friendships_addressee_id_fkey(*)
      `)
      .eq('addressee_id', user.id)
      .eq('status', 'pending');

    if (!error) {
      setFriendRequests((data as any) || []);
    }
  };

  const fetchFriends = async () => {
    const { data, error } = await supabase
      .from('friendships')
      .select(`
        *,
        profiles_requester:profiles!friendships_requester_id_fkey(*),
        profiles_addressee:profiles!friendships_addressee_id_fkey(*)
      `)
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
      .eq('status', 'accepted');

    if (!error) {
      setFriends((data as any) || []);
    }
  };

  useEffect(() => {
    fetchFriendRequests();
    fetchFriends();
  }, [user.id]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchUsers();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const sendFriendRequest = async (addresseeId: string) => {
    const { error } = await supabase
      .from('friendships')
      .insert({
        requester_id: user.id,
        addressee_id: addresseeId,
        status: 'pending'
      });

    if (error) {
      toast.error('Kon nie vriendversoek stuur nie');
    } else {
      toast.success('Vriendversoek gestuur!');
      searchUsers(); // Refresh search results
    }
  };

  const respondToFriendRequest = async (friendshipId: string, status: 'accepted' | 'declined') => {
    const { error } = await supabase
      .from('friendships')
      .update({ status })
      .eq('id', friendshipId);

    if (error) {
      toast.error('Kon nie vriendversoek antwoord nie');
    } else {
      if (status === 'accepted') {
        toast.success('Vriendversoek aanvaar!');
      } else {
        toast.success('Vriendversoek geweier');
      }
      fetchFriendRequests();
      fetchFriends();
    }
  };

  const checkFriendshipStatus = async (otherUserId: string) => {
    const { data } = await supabase
      .from('friendships')
      .select('*')
      .or(`and(requester_id.eq.${user.id},addressee_id.eq.${otherUserId}),and(requester_id.eq.${otherUserId},addressee_id.eq.${user.id})`)
      .single();

    return data;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="search">Soek Vriende</TabsTrigger>
            <TabsTrigger value="requests">
              Versoeke ({friendRequests.length})
            </TabsTrigger>
            <TabsTrigger value="friends">
              My Vriende ({friends.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Soek vir Vriende</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Soek volgens naam of gebruikersnaam..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="mt-4 space-y-2">
                  {searchResults.map((profile) => (
                    <div key={profile.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={profile.avatar_url} />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {profile.full_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{profile.full_name}</p>
                          <p className="text-sm text-muted-foreground">@{profile.username}</p>
                        </div>
                      </div>
                      
                      <Button
                        size="sm"
                        onClick={() => sendFriendRequest(profile.user_id)}
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Voeg by
                      </Button>
                    </div>
                  ))}
                  
                  {searchTerm && searchResults.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      Geen gebruikers gevind nie
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Vriendversoeke</CardTitle>
              </CardHeader>
              <CardContent>
                {friendRequests.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Geen vriendversoeke nie
                  </p>
                ) : (
                  <div className="space-y-3">
                    {friendRequests.map((friendship) => (
                      <div key={friendship.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={friendship.profiles_requester.avatar_url} />
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {friendship.profiles_requester.full_name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{friendship.profiles_requester.full_name}</p>
                            <p className="text-sm text-muted-foreground">@{friendship.profiles_requester.username}</p>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => respondToFriendRequest(friendship.id, 'accepted')}
                          >
                            <UserCheck className="w-4 h-4 mr-2" />
                            Aanvaar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => respondToFriendRequest(friendship.id, 'declined')}
                          >
                            <UserX className="w-4 h-4 mr-2" />
                            Weier
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="friends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>My Vriende</CardTitle>
              </CardHeader>
              <CardContent>
                {friends.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Geen vriende nog nie. Begin deur mense te soek!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {friends.map((friendship) => {
                      const friend = friendship.requester_id === user.id 
                        ? friendship.profiles_addressee 
                        : friendship.profiles_requester;
                      
                      return (
                        <div key={friendship.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={friend.avatar_url} />
                              <AvatarFallback className="bg-primary text-primary-foreground">
                                {friend.full_name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold">{friend.full_name}</p>
                              <p className="text-sm text-muted-foreground">@{friend.username}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center text-sm text-muted-foreground">
                            <UserCheck className="w-4 h-4 mr-1" />
                            Vriende
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Friends;