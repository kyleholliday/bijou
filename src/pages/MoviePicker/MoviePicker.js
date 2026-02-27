// MoviePicker.jsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './MoviePicker.scss';

const GENRES = [
  { id: 28, name: 'Action' },
  { id: 35, name: 'Comedy' },
  { id: 18, name: 'Drama' },
  { id: 27, name: 'Horror' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Sci-Fi' },
  { id: 53, name: 'Thriller' },
  { id: 16, name: 'Animation' },
  { id: 12, name: 'Adventure' },
  { id: 14, name: 'Fantasy' },
];

const DECADES = [
  { label: 'Any', value: null },
  { label: '1920s', value: { gte: '1920-01-01', lte: '1929-12-31' } },
  { label: '1930s', value: { gte: '1930-01-01', lte: '1939-12-31' } },
  { label: '1940s', value: { gte: '1940-01-01', lte: '1949-12-31' } },
  { label: '1950s', value: { gte: '1950-01-01', lte: '1959-12-31' } },
  { label: '1960s', value: { gte: '1960-01-01', lte: '1969-12-31' } },
  { label: '1970s', value: { gte: '1970-01-01', lte: '1979-12-31' } },
  { label: '1980s', value: { gte: '1980-01-01', lte: '1989-12-31' } },
  { label: '1990s', value: { gte: '1990-01-01', lte: '1999-12-31' } },
  { label: '2000s', value: { gte: '2000-01-01', lte: '2009-12-31' } },
  { label: '2010s', value: { gte: '2010-01-01', lte: '2019-12-31' } },
  { label: '2020s', value: { gte: '2020-01-01', lte: '2029-12-31' } },
];

const RUNTIMES = [
  { label: 'Any', value: null },
  { label: 'Short (<90min)', value: { lte: 90 } },
  { label: 'Medium (90-120min)', value: { gte: 90, lte: 120 } },
  { label: 'Long (120min+)', value: { gte: 120 } },
];

// const MOODS = [
//   { label: 'Feel-Good', keywords: [10751, 10402] }, // Family, Music
//   { label: 'Intense', keywords: [28, 53] }, // Action, Thriller
//   { label: 'Dark', keywords: [27, 80] }, // Horror, Crime
//   { label: 'Funny', keywords: [35] }, // Comedy
//   { label: 'Thought-Provoking', keywords: [18, 9648] }, // Drama, Mystery
// ];

export default function MoviePicker() {
  const [filters, setFilters] = useState({
    genres: [],
    decade: null,
    runtime: null,
  });
  const [results, setResults] = useState([]);
  const [displayedMovies, setDisplayedMovies] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggleGenre = (genreId) => {
    setFilters((prev) => {
      if (!prev.genres.includes(genreId) && prev.genres.length >= 3) {
        return prev;
      }

      return {
        ...prev,
        genres: prev.genres.includes(genreId)
          ? prev.genres.filter((id) => id !== genreId)
          : [...prev.genres, genreId],
      };
    });
  };

  const selectDecade = (decade) => {
    setFilters((prev) => ({ ...prev, decade }));
  };

  const selectRuntime = (runtime) => {
    setFilters((prev) => ({ ...prev, runtime }));
  };

  const findMovies = async () => {
    setLoading(true);
    setDisplayedMovies([]); // Clear previous results

    // Fetch multiple pages to get a bigger pool
    const allMovies = [];

    try {
      for (let page = 1; page <= 3; page++) {
        const params = new URLSearchParams({
          api_key: `${process.env.REACT_APP_API_KEY}`,
          language: 'en-US',
          sort_by: 'vote_average.desc',
          'vote_count.gte': 100,
          page: page,
          original_language: 'en',
        });

        if (filters.genres.length > 0) {
          params.append('with_genres', filters.genres.join(','));
        }

        if (filters.decade) {
          params.append('primary_release_date.gte', filters.decade.gte);
          params.append('primary_release_date.lte', filters.decade.lte);
        }

        if (filters.runtime) {
          if (filters.runtime.gte)
            params.append('with_runtime.gte', filters.runtime.gte);
          if (filters.runtime.lte)
            params.append('with_runtime.lte', filters.runtime.lte);
        }

        const response = await fetch(
          `https://api.themoviedb.org/3/discover/movie?${params}`
        );
        const data = await response.json();
        allMovies.push(...(data.results || []));
        console.log(allMovies);
      }

      setResults(allMovies);
      setDisplayedMovies(selectRandomThree(allMovies));
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectRandomThree = (movies) => {
    const shuffled = [...movies].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  };

  const shuffle = () => {
    setDisplayedMovies(selectRandomThree(results));
    console.log(displayedMovies);
  };

  return (
    <div className="movie-picker">
      <h1>What Should I Watch?</h1>

      {/* Genre Selection */}
      <div className="filter-group">
        <label>
          Genres <span className="label-hint">(Select up to 3)</span>
        </label>
        <div className="button-grid">
          {GENRES.map((genre) => (
            <button
              key={genre.id}
              className={filters.genres.includes(genre.id) ? 'active' : ''}
              onClick={() => toggleGenre(genre.id)}
              disabled={
                !filters.genres.includes(genre.id) && filters.genres.length >= 3
              }
            >
              {genre.name}
            </button>
          ))}
        </div>
      </div>

      {/* Decade Selection */}
      <div className="filter-group">
        <label>Decade</label>
        <div className="button-group">
          {DECADES.map((decade) => (
            <button
              key={decade.label}
              className={filters.decade === decade.value ? 'active' : ''}
              onClick={() => selectDecade(decade.value)}
            >
              {decade.label}
            </button>
          ))}
        </div>
      </div>

      {/* Runtime Selection */}
      <div className="filter-group">
        <label>Runtime</label>
        <div className="button-group">
          {RUNTIMES.map((runtime) => (
            <button
              key={runtime.label}
              className={filters.runtime === runtime.value ? 'active' : ''}
              onClick={() => selectRuntime(runtime.value)}
            >
              {runtime.label}
            </button>
          ))}
        </div>
      </div>

      <button className="find-button" onClick={findMovies} disabled={loading}>
        {loading ? 'Finding Movies...' : 'Find Movies'}
      </button>

      {/* Results */}
      {displayedMovies.length > 0 && (
        <div className="results">
          <div className="results-header">
            <h2>Your Picks</h2>
            <button onClick={shuffle}>Shuffle</button>
          </div>
          <div className="movie-grid">
            <AnimatePresence mode="wait">
              {displayedMovies.map((movie, index) => (
                <MovieCard
                  key={`${movie.id}-${index}`}
                  movie={movie}
                  index={index}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}

function MovieCard({ movie, index }) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <motion.div
      className="movie-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      {!imageLoaded && <div className="image-placeholder" />}
      <img
        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
        alt={movie.title}
        onLoad={() => setImageLoaded(true)}
        style={{ display: imageLoaded ? 'block' : 'none' }}
      />
      <div className="movie-info">
        <h3>{movie.title}</h3>
        <p className="year">{movie.release_date?.split('-')[0]}</p>
        <p className="rating">⭐ {movie.vote_average.toFixed(1)}</p>
        <p className="overview">{movie.overview}</p>
      </div>
    </motion.div>
  );
}
