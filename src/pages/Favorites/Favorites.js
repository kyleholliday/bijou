import { Link } from 'react-router-dom';
import { useFavorites } from '../../hooks/useFavorites';
import { useAuth } from '../../contexts/AuthContext';
import './Favorites.scss';

const Favorites = () => {
  const { user } = useAuth();
  const { favorites, loading } = useFavorites();

  document.title = 'My Favorites';

  if (!user) {
    return (
      <div className="favorites-page">
        <div className="favorites-container">
          <div className="empty-state">
            <h2>Please Log In</h2>
            <p>You need to be logged in to view your favorites.</p>
            <Link to="/auth" className="login-link">
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="favorites-page">
        <div className="favorites-container">
          <div className="loading-state">Loading your favorites...</div>
        </div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="favorites-page">
        <div className="favorites-container">
          <div className="empty-state">
            <h2>No Favorites Yet</h2>
            <p>Start adding movies and TV shows to your favorites!</p>
            <Link to="/" className="browse-link">
              Browse Movies
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Split favorites into movies and TV shows
  const movieFavorites = favorites.filter((f) => f.media_type === 'movie');
  const tvFavorites = favorites.filter((f) => f.media_type === 'tv');

  return (
    <div className="favorites-page">
      <div className="favorites-container">
        <h1 className="page-title">My Favorites</h1>

        {/* Movies Section */}
        {movieFavorites.length > 0 && (
          <div className="favorites-section">
            <h2 className="section-title">Movies</h2>
            <div className="favorites-grid">
              {movieFavorites.map((favorite) => (
                <Link
                  key={favorite.id}
                  to={`/movie/${favorite.tmdb_id}`}
                  className="favorite-card"
                >
                  <div className="favorites-poster-wrapper">
                    <img
                      src={
                        favorite.poster_path
                          ? `https://image.tmdb.org/t/p/w500${favorite.poster_path}`
                          : '/sorry.png'
                      }
                      alt={favorite.title}
                      className="favorites-poster-image"
                    />
                  </div>
                  <div className="favorite-info">
                    <h3 className="favorite-title">{favorite.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* TV Shows Section */}
        {tvFavorites.length > 0 && (
          <div className="favorites-section">
            <h2 className="section-title">TV Shows</h2>
            <div className="favorites-grid">
              {tvFavorites.map((favorite) => (
                <Link
                  key={favorite.id}
                  to={`/show/${favorite.tmdb_id}`}
                  className="favorite-card"
                >
                  <div className="favorites-poster-wrapper">
                    <img
                      src={
                        favorite.poster_path
                          ? `https://image.tmdb.org/t/p/w500${favorite.poster_path}`
                          : '/sorry.png'
                      }
                      alt={favorite.title}
                      className="favorites-poster-image"
                    />
                  </div>
                  <div className="favorite-info">
                    <h3 className="favorite-title">{favorite.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
