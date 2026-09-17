import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { tmdb } from '../services/tmdb';
import ErrorState from './ErrorState';
import '../styles/SecondaryPages.scss';

const PAGES_TO_FETCH = 5;
const BATCH_SIZE = 20;

const getReleaseYear = (date) => (date ? date.split('-')[0] : 'TBD');

const MediaGridPage = ({
  endpoint,
  heading,
  documentTitle,
  mediaType = 'movie',
  params,
  filterItem,
}) => {
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const responses = await Promise.all(
          Array.from({ length: PAGES_TO_FETCH }, (_, i) =>
            tmdb.get(endpoint, { params: { ...params, page: i + 1 } }),
          ),
        );

        const results = responses.flatMap((res) => res.data.results);
        const filtered = filterItem ? results.filter(filterItem) : results;
        const unique = Array.from(
          new Map(filtered.map((item) => [item.id, item])).values(),
        );

        setAllItems(unique);
        setVisibleCount(BATCH_SIZE);
        document.title = documentTitle;
      } catch (err) {
        console.error(`Error fetching ${documentTitle}:`, err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [endpoint, documentTitle, params, filterItem]);

  const items = allItems.slice(0, visibleCount);
  const hasMore = visibleCount < allItems.length;

  const linkBase = mediaType === 'tv' ? '/show' : '/movie';
  const noun = mediaType === 'tv' ? 'shows' : 'movies';

  if (error) {
    return <ErrorState message={`We couldn't load ${heading}.`} />;
  }

  if (loading) {
    return (
      <div className="modern-page">
        <div className="loading-container">
          <div className="loading-spinner">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-page">
      <div className="page-header">
        <h1 className="page-title">{heading}</h1>
        <p className="page-subtitle">
          {allItems.length} {noun}
        </p>
      </div>

      <motion.div
        className="movies-grid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.02 }}
          >
            <Link to={`${linkBase}/${item.id}`} className="movie-card">
              <div className="movie-poster">
                <img
                  src={
                    item.poster_path
                      ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                      : '/nope.png'
                  }
                  alt={item.title || item.name}
                  loading="lazy"
                />
                <div className="movie-overlay">
                  <p className="movie-title">{item.title || item.name}</p>
                  <p className="movie-year">
                    {getReleaseYear(item.release_date || item.first_air_date)}
                  </p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {hasMore && (
        <div className="load-more">
          <p className="load-more-count">
            Showing {items.length} of {allItems.length} {noun}
          </p>
          <button
            className="load-more-btn"
            onClick={() => setVisibleCount((count) => count + BATCH_SIZE)}
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default MediaGridPage;
