import React, { useState, useEffect } from 'react';
import axios from 'axios';

const NowPlayingMovies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageLoaded, setImageLoaded] = useState({});

  useEffect(() => {
    const apiKey = process.env.REACT_APP_API_KEY;
    const endpoint = `https://api.themoviedb.org/3/movie/now_playing`;

    axios
      .get(endpoint, {
        params: {
          api_key: apiKey,
          language: 'en-US',
          region: 'US',
        },
      })
      .then((response) => {
        setMovies(response.data.results);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching the Now Playing movies:', error);
        setError('Unable to load movies. Please try again later.');
        setLoading(false);
      });
  }, []);

  const firstTwelve = movies.slice(0, 12);

  const getReleaseYear = (dateString) => {
    if (dateString) {
      const dateParts = dateString.split('-');
      if (dateParts.length === 3) {
        return dateParts[0];
      }
    }
    return 'Release TBD';
  };

  const handleImageLoad = (movieId) => {
    setImageLoaded((prev) => ({ ...prev, [movieId]: true }));
  };

  if (loading) {
    return (
      <div className="container top-home-container">
        <div className="heading-container">
          <h3 className="heading">Now Playing</h3>
        </div>
        <ul className="movie-list">
          {[...Array(12)].map((_, index) => (
            <li key={index} className="movie skeleton">
              <div className="skeleton-poster"></div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container top-home-container">
        <div className="heading-container">
          <h3 className="heading">Now Playing</h3>
        </div>
        <div className="error-message">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container top-home-container">
      <div className="heading-container">
        <h3 className="heading">Now Playing</h3>
      </div>
      <ul className="movie-list">
        {firstTwelve.map((movie) => (
          <li key={movie.id} className="movie">
            <a
              href={`/movie/${movie.id}`}
              aria-label={`View details for ${movie.title}`}
            >
              <img
                src={
                  movie.poster_path
                    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                    : '/nope.png'
                }
                alt={`${movie.title} poster`}
                className={imageLoaded[movie.id] ? 'loaded' : 'loading'}
                onLoad={() => handleImageLoad(movie.id)}
                loading="lazy"
              />
              <div className="overlay">
                <p className="overlay-text">{movie.title}</p>
                <p className="overlay-text">
                  {getReleaseYear(movie.release_date)}
                </p>
              </div>
            </a>
          </li>
        ))}
      </ul>
      <a href="/now-playing" className="see-more">
        See More
      </a>
      <div className="border-bottom-mobile"></div>
    </div>
  );
};

export default NowPlayingMovies;
