import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';

export const useFavorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all favorites for the current user
  const fetchFavorites = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFavorites(data || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      setFavorites([]);
      setLoading(false);
    }
  }, [user, fetchFavorites]);

  // Check if a specific movie/show is favorited
  const isFavorite = (tmdbId) => {
    return favorites.some((fav) => fav.tmdb_id === tmdbId);
  };

  // Add to favorites
  const addFavorite = async (tmdbId, mediaType, title, posterPath) => {
    if (!user) {
      alert('Please log in to add favorites');
      return;
    }

    try {
      const { error } = await supabase.from('favorites').insert({
        user_id: user.id,
        tmdb_id: tmdbId,
        media_type: mediaType,
        title: title,
        poster_path: posterPath,
      });

      if (error) throw error;

      // Refresh favorites list
      await fetchFavorites();
    } catch (error) {
      console.error('Error adding favorite:', error);
    }
  };

  // Remove from favorites
  const removeFavorite = async (tmdbId) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('tmdb_id', tmdbId);

      if (error) throw error;

      // Refresh favorites list
      await fetchFavorites();
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  // Toggle favorite status
  const toggleFavorite = async (tmdbId, mediaType, title, posterPath) => {
    if (isFavorite(tmdbId)) {
      await removeFavorite(tmdbId);
    } else {
      await addFavorite(tmdbId, mediaType, title, posterPath);
    }
  };

  return {
    favorites,
    loading,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
  };
};
