import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

const avatarOptions = [
  { id: 1, name: 'Arnie', url: '/arnie.png', color: '#ff0000' },
  { id: 2, name: 'Bob', url: '/bob.png', color: '#9e2dadff' },
  { id: 3, name: 'Jules', url: '/jules.png', color: '#1e90ff' },
  { id: 4, name: 'Peter Parker', url: '/peter-parker.png', color: '#00ff00' },
  { id: 5, name: 'Ripley', url: '/ripley.png', color: '#0066cc' },
  { id: 6, name: 'Yoda', url: '/yoda.png', color: '#ff3333' },
];

const withAvatar = (profile) => ({
  ...profile,
  avatar: avatarOptions.find((a) => a.id === profile.avatar_id) || null,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async (userId) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url, avatar_id')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setUserProfile(data ? withAvatar(data) : null);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const updateAvatar = async (avatar) => {
    if (!user) return { error: new Error('Not logged in') };

    try {
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (fetchError) {
        throw new Error(`Failed to check profile: ${fetchError.message}`);
      }

      if (existingProfile) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            avatar_url: avatar.url,
            avatar_id: avatar.id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (updateError) throw new Error(`Update failed: ${updateError.message}`);
      } else {
        const { error: insertError } = await supabase.from('profiles').insert({
          id: user.id,
          avatar_url: avatar.url,
          avatar_id: avatar.id,
          email: user.email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (insertError) throw new Error(`Insert failed: ${insertError.message}`);
      }

      setUserProfile(
        withAvatar({ avatar_url: avatar.url, avatar_id: avatar.id }),
      );

      return { error: null };
    } catch (error) {
      console.error('Error updating avatar:', error);
      return { error };
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    avatarOptions,
    updateAvatar,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
