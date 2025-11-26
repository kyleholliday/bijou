import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

// Avatar options that match Profile.js
const avatarOptions = [
  {
    id: 1,
    name: 'Neo',
    url: 'https://i.pravatar.cc/150?img=11',
    color: '#00ff41',
  },
  {
    id: 2,
    name: 'Trinity',
    url: 'https://i.pravatar.cc/150?img=5',
    color: '#ff006e',
  },
  {
    id: 3,
    name: 'Morpheus',
    url: 'https://i.pravatar.cc/150?img=13',
    color: '#3a86ff',
  },
  {
    id: 4,
    name: 'Agent Smith',
    url: 'https://i.pravatar.cc/150?img=8',
    color: '#fb5607',
  },
  {
    id: 5,
    name: 'Oracle',
    url: 'https://i.pravatar.cc/150?img=9',
    color: '#ffbe0b',
  },
  {
    id: 6,
    name: 'Architect',
    url: 'https://i.pravatar.cc/150?img=7',
    color: '#8338ec',
  },
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
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

  const fetchUserProfile = async (userId) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('avatar_url, avatar_id')
        .eq('id', userId)
        .single();

      if (data) {
        // Find the avatar object from our options
        const avatar = avatarOptions.find((a) => a.id === data.avatar_id);
        setUserProfile({
          ...data,
          avatar: avatar || null,
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  // Function to update user profile (can be called from Profile component)
  const updateUserProfile = async (updates) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (data) {
        const avatar = avatarOptions.find((a) => a.id === data.avatar_id);
        setUserProfile({
          ...data,
          avatar: avatar || null,
        });
      }

      return { data, error };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { data: null, error };
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    updateUserProfile,
    avatarOptions,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
