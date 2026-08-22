import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getUsReleaseInfo } from '../utils/releaseInfo';
import { pickRandom } from '../utils/random';
import '../styles/CuratedPicks.scss';

const CuratedPicks = ({
  title,
  description,
  movieIds,
  moviePool,
  fallbackMovieIds,
  theme = 'dark',
}) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiKey = process.env.REACT_APP_API_KEY;

    // Fetches a fixed set of movies by ID, in order. Optionally appends
    // release_dates so callers can check real-world release status.
    const fetchMoviesByIds = async (ids, appendReleaseDates = false) => {
      const requests = ids.map((id) =>
        axios.get(`https://api.themoviedb.org/3/movie/${id}`, {
          params: {
            api_key: apiKey,
            language: 'en-US',
            ...(appendReleaseDates && { append_to_response: 'release_dates' }),
          },
        })
      );
      const responses = await Promise.all(requests);
      return responses.map((res) => res.data);
    };

    // Static picks (e.g. seasonal lists): show exactly the given IDs.
    const fetchStaticPicks = async () => {
      try {
        setMovies(await fetchMoviesByIds(movieIds));
      } catch (error) {
        console.error('Error fetching curated movies:', error);
      } finally {
        setLoading(false);
      }
    };

    // Dynamic "Most Anticipated" picks: fetch the whole candidate pool,
    // keep only the ones that haven't released yet, and show 3 at random.
    // If the pool has gone stale (fewer than 3 unreleased), fall back to a
    // fixed backup list instead.
    const fetchAnticipatedPicks = async () => {
      try {
        const poolMovies = await fetchMoviesByIds(moviePool, true);
        const unreleased = poolMovies.filter(
          (movie) => getUsReleaseInfo(movie).isUpcoming
        );

        if (unreleased.length < 3) {
          setMovies(await fetchMoviesByIds(fallbackMovieIds));
        } else {
          setMovies(pickRandom(unreleased, 3));
        }
      } catch (error) {
        console.error('Error fetching anticipated movies:', error);
      } finally {
        setLoading(false);
      }
    };

    if (moviePool?.length) {
      fetchAnticipatedPicks();
    } else if (movieIds?.length) {
      fetchStaticPicks();
    }
  }, [movieIds, moviePool, fallbackMovieIds]);

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
                        : '/nope.png'
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
