import { useAuth } from '../../contexts/AuthContext';
import { useFavorites } from '../../hooks/useFavorites';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Profile.scss';

const avatarOptions = [
  {
    id: 1,
    name: '',
    url: 'arnie.png',
    color: '#ff0000',
  },
  {
    id: 2,
    name: '',
    url: 'bob.png',
    color: '#9e2dadff',
  },
  {
    id: 3,
    name: '',
    url: 'jules.png',
    color: '#1e90ff',
  },
  {
    id: 4,
    name: '',
    url: 'peter-parker.png',
    color: '#00ff00',
  },
  {
    id: 5,
    name: '',
    url: 'ripley.png',
    color: '#0066cc',
  },
  {
    id: 6,
    name: '',
    url: 'yoda.png',
    color: '#ff3333',
  },
];

const Profile = () => {
  const { user } = useAuth();
  const { favorites } = useFavorites();
  const navigate = useNavigate();
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [profileError, setProfileError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('avatar_url, avatar_id')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching profile:', error);
          setProfileError(error.message);
          return;
        }

        if (data) {
          setUserProfile(data);
          const avatar = avatarOptions.find((a) => a.id === data.avatar_id);
          if (avatar) {
            setSelectedAvatar(avatar);
          }
        }
      } catch (error) {
        console.error('Error in fetchUserProfile:', error);
        setProfileError(error.message);
      }
    };

    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const handleAvatarSelect = async (avatar) => {
    setIsUpdating(true);
    try {
      // Check if profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (fetchError) {
        throw new Error(`Failed to check profile: ${fetchError.message}`);
      }

      if (existingProfile) {
        // Update existing profile
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            avatar_url: avatar.url,
            avatar_id: avatar.id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (updateError)
          throw new Error(`Update failed: ${updateError.message}`);
      } else {
        // Create new profile
        const { error: insertError } = await supabase.from('profiles').insert({
          id: user.id,
          avatar_url: avatar.url,
          avatar_id: avatar.id,
          email: user.email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (insertError)
          throw new Error(`Insert failed: ${insertError.message}`);
      }

      setSelectedAvatar(avatar);
      setShowAvatarModal(false);
      setUserProfile({
        ...userProfile,
        avatar_url: avatar.url,
        avatar_id: avatar.id,
      });
      setProfileError(null);
    } catch (error) {
      console.error('Error updating avatar:', error);
      setProfileError(error.message);
      alert(`Failed to update avatar: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <div className="empty-state">
            <h2>Please Log In</h2>
            <p>You need to be logged in to view your profile.</p>
            <Link to="/auth" className="login-link">
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const movieFavorites = favorites.filter((f) => f.media_type === 'movie');
  const tvFavorites = favorites.filter((f) => f.media_type === 'tv');
  const memberSince = new Date(user.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const recentFavorites = favorites.slice(0, 6);

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Profile Header */}
        <div className="profile-header-wrapper">
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar-circle">
              {selectedAvatar ? (
                <img
                  src={selectedAvatar.url}
                  alt={selectedAvatar.name}
                  onError={(e) => {
                    console.error('Avatar image failed to load');
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <span className="avatar-letter-display">
                  {user.email.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <motion.button
              className="edit-avatar-button"
              onClick={() => setShowAvatarModal(true)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 5V15M5 10H15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </motion.button>
          </div>
          <div className="profile-info-section">
            <h1 className="profile-email-text">{user.email}</h1>
            <p className="profile-meta-text">Member since {memberSince}</p>
            {profileError && (
              <p className="profile-error-message">
                Note: Profile features may be limited. Table setup needed.
              </p>
            )}
          </div>
          <button className="logout-button" onClick={handleLogout}>
            Log Out
          </button>
        </div>

        {/* Avatar Selection Modal */}
        <AnimatePresence>
          {showAvatarModal && (
            <>
              <motion.div
                className="modal-backdrop-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowAvatarModal(false)}
              >
                <motion.div
                  className="avatar-selection-modal"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="modal-header-section">
                    <h2 className="modal-title-text">Choose Your Avatar</h2>
                    <motion.button
                      className="modal-close-button"
                      onClick={() => setShowAvatarModal(false)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M18 6L6 18M6 6L18 18"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </motion.button>
                  </div>
                  <div className="avatar-options-grid">
                    {avatarOptions.map((avatar) => (
                      <motion.button
                        key={avatar.id}
                        className={`avatar-choice-button ${
                          selectedAvatar?.id === avatar.id ? 'is-selected' : ''
                        }`}
                        onClick={() => handleAvatarSelect(avatar)}
                        disabled={isUpdating}
                        whileTap={{ scale: 0.95 }}
                        style={{ '--avatar-color': avatar.color }}
                      >
                        <div className="avatar-image-container">
                          <img
                            src={avatar.url}
                            alt={avatar.name}
                            onError={(e) => {
                              console.error(
                                `Failed to load avatar: ${avatar.name}`
                              );
                              e.target.src =
                                'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ccc" width="100" height="100"/%3E%3C/svg%3E';
                            }}
                          />
                          {selectedAvatar?.id === avatar.id && (
                            <motion.div
                              className="selection-indicator"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 500 }}
                            >
                              <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                              >
                                <path
                                  d="M5 12L10 17L20 7"
                                  stroke="white"
                                  strokeWidth="3"
                                  strokeLinecap="round"
                                />
                              </svg>
                            </motion.div>
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                  <div className="modal-footer-section">
                    <p className="modal-hint-text">
                      Select an avatar to personalize your profile
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{favorites.length}</div>
            <div className="stat-label">Total Favorites</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{movieFavorites.length}</div>
            <div className="stat-label">Movies</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{tvFavorites.length}</div>
            <div className="stat-label">TV Shows</div>
          </div>
          {/* <div className="stat-card stat-card-placeholder">
            <div className="stat-number">—</div>
            <div className="stat-label">Watchlist</div>
            <span className="coming-soon">Coming Soon</span>
          </div> */}
        </div>

        {/* Recent Favorites */}
        {recentFavorites.length > 0 && (
          <div className="profile-section-main">
            <div className="section-header">
              <h2 className="section-title">Recent Favorites</h2>
              <Link to="/favorites" className="view-all-link">
                View All
              </Link>
            </div>
            <div className="favorites-preview-grid">
              {recentFavorites.map((favorite) => (
                <Link
                  key={favorite.id}
                  to={`/${favorite.media_type === 'movie' ? 'movie' : 'show'}/${
                    favorite.tmdb_id
                  }`}
                  className="preview-card"
                >
                  <div className="preview-poster">
                    <img
                      src={
                        favorite.poster_path
                          ? `https://image.tmdb.org/t/p/w500${favorite.poster_path}`
                          : '/sorry.png'
                      }
                      alt={favorite.title}
                    />
                  </div>
                  <h3 className="preview-title">{favorite.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {favorites.length === 0 && (
          <div className="empty-favorites">
            <h3>No Favorites Yet</h3>
            <p>
              Start exploring and add some movies or TV shows to your favorites!
            </p>
            <Link to="/" className="browse-btn">
              Browse Movies
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
