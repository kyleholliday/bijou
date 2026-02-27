import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../styles/CuratedPicks.scss';

const CuratedPicks = ({ title, description, movieIds, theme = 'dark' }) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      const apiKey = process.env.REACT_APP_API_KEY;

      try {
        // Fetch each movie by ID
        const requests = movieIds.map((id) =>
          axios.get(`https://api.themoviedb.org/3/movie/${id}`, {
            params: { api_key: apiKey, language: 'en-US' },
          })
        );

        const responses = await Promise.all(requests);
        const movieData = responses.map((res) => res.data);
        setMovies(movieData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching curated movies:', error);
        setLoading(false);
      }
    };

    if (movieIds?.length) {
      fetchMovies();
    }
  }, [movieIds]);

  const getReleaseYear = (date) => (date ? date.split('-')[0] : 'TBD');

  if (loading || movies.length === 0) return null;

  return (
    <section className={`curated-picks ${theme}`}>
      <div className="curated-container">
        <div className="curated-header">
          <div className="header-content">
            <span className="header-badge">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 1L12.39 6.26L18 7.27L14 11.14L15.18 17L10 14.27L4.82 17L6 11.14L2 7.27L7.61 6.26L10 1Z"
                  fill="currentColor"
                />
              </svg>
              Editor's Pick
            </span>
            <h2 className="curated-title">{title}</h2>
            <p className="curated-description">{description}</p>
          </div>
        </div>

        <div className="curated-grid">
          {movies.map((movie, index) => (
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="grid-insider"
            >
              <Link to={`/movie/${movie.id}`} className="curated-card">
                <div className="card-image-wrapper">
                  <img
                    src={
                      movie.poster_path
                        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                        : '/sorry.png'
                    }
                    alt={movie.title}
                    className="card-image"
                  />
                </div>

                <div className="card-content">
                  <div className="card-info">
                    <h3 className="card-title">{movie.title}</h3>
                    <div className="card-meta">
                      <span className="card-year">
                        {getReleaseYear(movie.release_date)}
                      </span>
                      {movie.vote_average > 0 && (
                        <>
                          <span className="meta-dot">•</span>
                          <span className="card-rating">
                            {movie.vote_average.toFixed(1)} / 10
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {movie.overview && (
                    <p className="card-overview">
                      {movie.overview.slice(0, 120)}
                      {movie.overview.length > 120 && '...'}
                    </p>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CuratedPicks;
