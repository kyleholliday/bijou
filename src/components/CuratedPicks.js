import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { tmdb } from '../services/tmdb';
import { getUsReleaseInfo } from '../utils/releaseInfo';
import { pickRandom } from '../utils/random';
import '../styles/CuratedPicks.scss';

const BADGE_ICONS = {
  star: 'M10 1L12.39 6.26L18 7.27L14 11.14L15.18 17L10 14.27L4.82 17L6 11.14L2 7.27L7.61 6.26L10 1Z',
  moon: 'M17.5 10.66A7.5 7.5 0 1 1 9.34 2.5 5.83 5.83 0 0 0 17.5 10.66z',
};

const CuratedPicks = ({
  title,
  description,
  fallbackDescription,
  movieIds,
  pickCount,
  moviePool,
  fallbackMovieIds,
  badgeLabel = "Editor's Pick",
  badgeIcon = 'star',
  theme = 'dark',
}) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    // Fetches a fixed set of movies by ID, in order. Optionally appends
    // release_dates so callers can check real-world release status.
    const fetchMoviesByIds = async (ids, appendReleaseDates = false) => {
      const requests = ids.map((id) =>
        tmdb.get(`/movie/${id}`, {
          params: {
            ...(appendReleaseDates && { append_to_response: 'release_dates' }),
          },
        }),
      );
      const responses = await Promise.all(requests);
      return responses.map((res) => res.data);
    };

    // Static picks (e.g. seasonal lists): show the given IDs in order, or a
    // random `pickCount` of them. Randomizing before the fetch keeps the
    // request count at `pickCount` no matter how large the pool grows.
    const fetchStaticPicks = async () => {
      try {
        setUsingFallback(false);
        const ids = pickCount ? pickRandom(movieIds, pickCount) : movieIds;
        setMovies(await fetchMoviesByIds(ids));
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
          (movie) => getUsReleaseInfo(movie).isUpcoming,
        );

        if (unreleased.length < 3) {
          setUsingFallback(true);
          setMovies(await fetchMoviesByIds(fallbackMovieIds));
        } else {
          setUsingFallback(false);
          setMovies(pickRandom(unreleased, 4));
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
  }, [movieIds, pickCount, moviePool, fallbackMovieIds]);

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
                  d={BADGE_ICONS[badgeIcon] ?? BADGE_ICONS.star}
                  fill="currentColor"
                />
              </svg>
              {badgeLabel}
            </span>
            <h2 className="curated-title">{title}</h2>
            <p className="curated-description">
              {usingFallback && fallbackDescription
                ? fallbackDescription
                : description}
            </p>
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
