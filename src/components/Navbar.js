import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../services/supabase';
import '../styles/Navbar.scss';

const Navbar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userAvatar, setUserAvatar] = useState(null);
  const navigate = useNavigate();

  const { user } = useAuth();

  // Fetch user avatar when user changes
  useEffect(() => {
    const fetchUserAvatar = async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', user.id)
          .maybeSingle();

        if (data && data.avatar_url) {
          setUserAvatar(data.avatar_url);
        }
      } catch (error) {
        console.error('Error fetching avatar:', error);
      }
    };

    if (user) {
      fetchUserAvatar();
    } else {
      setUserAvatar(null);
    }
  }, [user]);

  const handleSearch = () => {
    if (searchTerm.trim() !== '') {
      navigate(`/search?query=${encodeURIComponent(searchTerm)}`);
      setSearchOpen(false);
      setSearchTerm('');
      setMobileMenuOpen(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
    if (e.key === 'Escape') {
      setSearchOpen(false);
      setSearchTerm('');
    }
  };

  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
    if (!searchOpen) {
      // Focus input when opening
      setTimeout(() => {
        document.getElementById('search-input')?.focus();
      }, 100);
    }
  };

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="modern-navbar">
      <div className="navbar-container">
        {/* Logo */}
        <NavLink to="/" className="navbar-logo">
          BIJOU
        </NavLink>

        {/* Desktop Navigation */}
        <div className="navbar-links desktop">
          <NavLink to="/now-playing" className="navigation-link">
            Now Playing
          </NavLink>
          <NavLink to="/upcoming" className="navigation-link">
            Upcoming
          </NavLink>
          <NavLink to="/tv-trending" className="navigation-link">
            Trending TV
          </NavLink>
          {user && (
            <NavLink to="/favorites" className="navigation-link">
              Favorites
            </NavLink>
          )}
        </div>

        {/* Desktop Search */}
        <div className="navbar-actions desktop">
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                className="search-input-wrapper"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 300, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <input
                  id="search-input"
                  type="text"
                  placeholder="Search movies and TV..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="search-input"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <button
            className={`search-icon-btn ${searchOpen ? 'active' : ''}`}
            onClick={toggleSearch}
            aria-label="Toggle search"
          >
            <AnimatePresence mode="wait">
              {searchOpen ? (
                <motion.svg
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </motion.svg>
              ) : (
                <motion.svg
                  key="search"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </motion.svg>
              )}
            </AnimatePresence>
          </button>
          {user ? (
            <NavLink to="/profile" className="profile-avatar-btn">
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt="Profile"
                  className="navbar-avatar-image"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <span
                className="navbar-avatar-letter"
                style={{ display: userAvatar ? 'none' : 'flex' }}
              >
                {user.email.charAt(0).toUpperCase()}
              </span>
            </NavLink>
          ) : (
            <NavLink to="/auth" className="auth-btn">
              Log In
            </NavLink>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-btn mobile"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`hamburger ${mobileMenuOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
        {user ? (
          <NavLink
            to="/profile"
            className="mobile-navigation-link profile-link mobile-menu-btn"
            onClick={handleNavClick}
          >
            Profile
          </NavLink>
        ) : (
          <NavLink
            to="/auth"
            className="mobile-navigation-link auth-link mobile-menu-btn"
            onClick={handleNavClick}
          >
            Log In
          </NavLink>
        )}
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mobile-menu-content">
              <NavLink
                to="/"
                className="mobile-navigation-link"
                onClick={handleNavClick}
                end
              >
                Home
              </NavLink>
              <NavLink
                to="/now-playing"
                className="mobile-navigation-link"
                onClick={handleNavClick}
              >
                Now Playing
              </NavLink>
              <NavLink
                to="/upcoming"
                className="mobile-navigation-link"
                onClick={handleNavClick}
              >
                Upcoming
              </NavLink>
              <NavLink
                to="/tv-trending"
                className="mobile-navigation-link"
                onClick={handleNavClick}
              >
                Trending TV
              </NavLink>
              {user && (
                <NavLink
                  to="/favorites"
                  className="mobile-navigation-link"
                  onClick={handleNavClick}
                >
                  Favorites
                </NavLink>
              )}

              {/* Mobile Search */}
              <div className="mobile-search">
                <input
                  type="text"
                  placeholder="Search movies and TV..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="mobile-search-input"
                />
                <button className="mobile-search-btn" onClick={handleSearch}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default React.memo(Navbar);
