import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Link, useParams, useLocation } from 'react-router-dom';
import '../../styles/Person.scss';

// Utilities
const getReleaseYear = (date) => (date ? date.split('-')[0] : null);
const formatDate = (date) =>
  date
    ? new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(new Date(date))
    : '';
const getAge = (dob, deathday) => {
  if (!dob) return null;
  const birth = new Date(dob);
  const end = deathday ? new Date(deathday) : new Date();
  let age = end.getFullYear() - birth.getFullYear();
  if (
    end.getMonth() < birth.getMonth() ||
    (end.getMonth() === birth.getMonth() && end.getDate() < birth.getDate())
  )
    age--;
  return age;
};
const getImage = (path) =>
  path ? `https://image.tmdb.org/t/p/w500${path}` : '/nope.png';

const CACHE_EXPIRY = 1000 * 60 * 60 * 6; // 6 hours

// Main Component
const Person = () => {
  const { personId } = useParams();
  const location = useLocation();
  const [data, setData] = useState(null);
  const [showFullBio, setShowFullBio] = useState(false);
  const [primaryTab, setPrimaryTab] = useState('movies'); // For Movies/TV tabs
  const [movieSort, setMovieSort] = useState('popularity');
  const [tvSort, setTvSort] = useState('popularity');

  // Detect if we're on actor or director route
  const isActorRoute = location.pathname.includes('/actor/');
  const isDirectorRoute = location.pathname.includes('/director/');

  useEffect(() => {
    const apiKey = process.env.REACT_APP_API_KEY;
    const cacheKey = `person_${personId}`;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      const { timestamp, payload } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_EXPIRY) {
        setData(payload);
        document.title = payload.details.name;
        return;
      }
    }

    const detailsUrl = `https://api.themoviedb.org/3/person/${personId}`;
    const creditsUrl = `https://api.themoviedb.org/3/person/${personId}/combined_credits`;

    Promise.all([
      axios.get(detailsUrl, { params: { api_key: apiKey, language: 'en-US' } }),
      axios.get(creditsUrl, { params: { api_key: apiKey, language: 'en-US' } }),
    ])
      .then(([detailsRes, creditsRes]) => {
        const details = detailsRes.data;

        // --- Process ACTING credits (from cast) ---
        const rawActing = creditsRes.data.cast.filter(
          (c) =>
            c.character?.trim() &&
            !/presenter/i.test(c.character) &&
            ![10763, 10767].some((g) => c.genre_ids?.includes(g)) &&
            !c.adult
        );

        // Deduplicate acting credits
        const seenActing = new Set();
        const actingCredits = rawActing.filter((credit) => {
          const key = `${credit.media_type}-${credit.id}`;
          if (seenActing.has(key)) return false;
          seenActing.add(key);
          return true;
        });

        // --- Process DIRECTING credits (from crew) ---
        const rawDirecting = creditsRes.data.crew.filter(
          (c) => c.job?.toLowerCase() === 'director' && !c.adult
        );

        // Deduplicate directing credits
        const seenDirecting = new Set();
        const directingCredits = rawDirecting.filter((credit) => {
          const key = `${credit.media_type}-${credit.id}`;
          if (seenDirecting.has(key)) return false;
          seenDirecting.add(key);
          return true;
        });

        // Split by media type
        const actingMovies = actingCredits
          .filter((c) => c.media_type === 'movie')
          .sort((a, b) => b.popularity - a.popularity);

        const actingTV = actingCredits
          .filter((c) => c.media_type === 'tv')
          .sort((a, b) => b.popularity - a.popularity);

        const directingMovies = directingCredits
          .filter((c) => c.media_type === 'movie')
          .sort((a, b) => b.popularity - a.popularity);

        const directingTV = directingCredits
          .filter((c) => c.media_type === 'tv')
          .sort((a, b) => b.popularity - a.popularity);

        const payload = {
          details,
          actingMovies,
          actingTV,
          directingMovies,
          directingTV,
        };

        setData(payload);
        localStorage.setItem(
          cacheKey,
          JSON.stringify({ timestamp: Date.now(), payload })
        );
        document.title = details.name;

        // Auto-select first available tab for primary section
        if (isActorRoute) {
          if (actingMovies.length) setPrimaryTab('movies');
          else if (actingTV.length) setPrimaryTab('tv');
        } else if (isDirectorRoute) {
          if (directingMovies.length) setPrimaryTab('movies');
          else if (directingTV.length) setPrimaryTab('tv');
        }
      })
      .catch((err) => console.error('Fetch error:', err));
  }, [personId, isActorRoute, isDirectorRoute]);

  // Sorting (memoized)
  const sortedActingMovies = useMemo(() => {
    if (!data?.actingMovies) return [];
    const arr = [...data.actingMovies];
    if (movieSort === 'recent')
      arr.sort((a, b) =>
        (b.release_date || '').localeCompare(a.release_date || '')
      );
    else if (movieSort === 'earliest')
      arr.sort((a, b) =>
        (a.release_date || '').localeCompare(b.release_date || '')
      );
    else arr.sort((a, b) => b.popularity - a.popularity);
    return arr;
  }, [data, movieSort]);

  const sortedActingTV = useMemo(() => {
    if (!data?.actingTV) return [];
    const arr = [...data.actingTV];
    if (tvSort === 'recent')
      arr.sort((a, b) =>
        (b.first_air_date || '').localeCompare(a.first_air_date || '')
      );
    else if (tvSort === 'earliest')
      arr.sort((a, b) =>
        (a.first_air_date || '').localeCompare(b.first_air_date || '')
      );
    else arr.sort((a, b) => b.popularity - a.popularity);
    return arr;
  }, [data, tvSort]);

  const sortedDirectingMovies = useMemo(() => {
    if (!data?.directingMovies) return [];
    const arr = [...data.directingMovies];
    if (movieSort === 'recent')
      arr.sort((a, b) =>
        (b.release_date || '').localeCompare(a.release_date || '')
      );
    else if (movieSort === 'earliest')
      arr.sort((a, b) =>
        (a.release_date || '').localeCompare(b.release_date || '')
      );
    else arr.sort((a, b) => b.popularity - a.popularity);
    return arr;
  }, [data, movieSort]);

  const sortedDirectingTV = useMemo(() => {
    if (!data?.directingTV) return [];
    const arr = [...data.directingTV];
    if (tvSort === 'recent')
      arr.sort((a, b) =>
        (b.first_air_date || '').localeCompare(a.first_air_date || '')
      );
    else if (tvSort === 'earliest')
      arr.sort((a, b) =>
        (a.first_air_date || '').localeCompare(b.first_air_date || '')
      );
    else arr.sort((a, b) => b.popularity - a.popularity);
    return arr;
  }, [data, tvSort]);

  if (!data)
    return (
      <div className="actor-loading">
        <div className="loading-spinner">Loading...</div>
      </div>
    );

  const { details } = data;
  const bioPreview = details.biography?.slice(0, 300);
  const showReadMore = details.biography?.length > 300;

  // Determine primary and secondary sections based on route
  const primarySection = isActorRoute ? 'acting' : 'directing';
  const secondarySection = isActorRoute ? 'directing' : 'acting';

  const primaryMovies =
    primarySection === 'acting' ? sortedActingMovies : sortedDirectingMovies;
  const primaryTV =
    primarySection === 'acting' ? sortedActingTV : sortedDirectingTV;
  const secondaryMovies =
    secondarySection === 'acting' ? sortedActingMovies : sortedDirectingMovies;
  const secondaryTV =
    secondarySection === 'acting' ? sortedActingTV : sortedDirectingTV;

  const hasPrimaryContent = primaryMovies.length > 0 || primaryTV.length > 0;
  const hasSecondaryContent =
    secondaryMovies.length > 0 || secondaryTV.length > 0;

  return (
    <div className="actor-page">
      {/* Hero Section */}
      <div className="actor-hero">
        <div className="container">
          <div className="hero-content">
            <div className="profile-section">
              <div className="profile-image">
                <img src={getImage(details.profile_path)} alt={details.name} />
              </div>
            </div>

            <div className="info-section">
              <h1 className="actor-name">{details.name}</h1>

              <div className="actor-meta">
                {details.birthday && (
                  <div className="meta-item">
                    <span className="meta-label">Born</span>
                    <span className="meta-value">
                      {formatDate(details.birthday)}
                      {!details.deathday && (
                        <span className="age">
                          {' '}
                          ({getAge(details.birthday)} years old)
                        </span>
                      )}
                    </span>
                  </div>
                )}

                {details.deathday && (
                  <div className="meta-item">
                    <span className="meta-label">Died</span>
                    <span className="meta-value">
                      {formatDate(details.deathday)}
                      <span className="age">
                        {' '}
                        ({getAge(details.birthday, details.deathday)} years old)
                      </span>
                    </span>
                  </div>
                )}

                {details.place_of_birth && (
                  <div className="meta-item">
                    <span className="meta-label">Born in</span>
                    <span className="meta-value">{details.place_of_birth}</span>
                  </div>
                )}
              </div>

              {details.biography && (
                <div className="biography">
                  <p className="bio-text">
                    {showFullBio ? details.biography : bioPreview}
                    {!showFullBio && showReadMore && '...'}
                  </p>
                  {showReadMore && (
                    <button
                      className="read-more-btn"
                      onClick={() => setShowFullBio((p) => !p)}
                    >
                      {showFullBio ? 'Show Less' : 'Read More'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PRIMARY SECTION (Acting for actors, Directing for directors) */}
      <div className="container">
        <div className="credits-section">
          {hasPrimaryContent && (
            <>
              <div className="credits-tabs">
                {primaryMovies.length > 0 && (
                  <button
                    className={`tab-btn ${
                      primaryTab === 'movies' ? 'active' : ''
                    }`}
                    onClick={() => setPrimaryTab('movies')}
                  >
                    <span className="tab-label">Movies</span>
                    <span className="tab-count">{primaryMovies.length}</span>
                  </button>
                )}
                {primaryTV.length > 0 && (
                  <button
                    className={`tab-btn ${primaryTab === 'tv' ? 'active' : ''}`}
                    onClick={() => setPrimaryTab('tv')}
                  >
                    <span className="tab-label">TV Shows</span>
                    <span className="tab-count">{primaryTV.length}</span>
                  </button>
                )}
              </div>

              {primaryTab === 'movies' && primaryMovies.length > 0 && (
                <CreditsGrid
                  title={
                    primarySection === 'acting' ? 'Films' : 'Directed Films'
                  }
                  items={primaryMovies}
                  sortType={movieSort}
                  onSort={setMovieSort}
                  getReleaseYear={getReleaseYear}
                  getImage={getImage}
                  linkBase="/movie"
                />
              )}

              {primaryTab === 'tv' && primaryTV.length > 0 && (
                <CreditsGrid
                  title={
                    primarySection === 'acting'
                      ? 'TV Shows'
                      : 'Directed TV Shows'
                  }
                  items={primaryTV}
                  sortType={tvSort}
                  onSort={setTvSort}
                  getReleaseYear={getReleaseYear}
                  getImage={getImage}
                  linkBase="/show"
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* SECONDARY SECTION (Directing for actors, Acting for directors) */}
      {hasSecondaryContent && (
        <div className="container">
          <div className="credits-section secondary-section">
            <div className="section-divider">
              <h2 className="section-title">
                {secondarySection === 'acting'
                  ? 'Also appeared in'
                  : 'Also directed'}
              </h2>
            </div>

            <div className="credits-grid">
              {secondaryMovies.map((item, index) => (
                <Link
                  to={`/movie/${item.id}`}
                  key={`secondary-movie-${item.id}-${index}`}
                  className="credit-card"
                >
                  <div className="card-poster">
                    <img
                      src={getImage(item.poster_path)}
                      alt={item.title}
                      className={item.poster_path ? '' : 'fallback'}
                    />
                    <div className="overlay">
                      <p className="overlay-text">{item.title}</p>
                      {item.release_date && (
                        <p className="overlay-text">
                          {getReleaseYear(item.release_date)}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
              {secondaryTV.map((item, index) => (
                <Link
                  to={`/show/${item.id}`}
                  key={`secondary-tv-${item.id}-${index}`}
                  className="credit-card"
                >
                  <div className="card-poster">
                    <img
                      src={getImage(item.poster_path)}
                      alt={item.name}
                      className={item.poster_path ? '' : 'fallback'}
                    />
                    <div className="overlay">
                      <p className="overlay-text">{item.name}</p>
                      {item.first_air_date && (
                        <p className="overlay-text">
                          {getReleaseYear(item.first_air_date)}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const CreditsGrid = ({
  title,
  items,
  sortType,
  onSort,
  getReleaseYear,
  getImage,
  linkBase,
}) => (
  <div className="credits-content">
    <div className="content-header">
      <h2 className="content-title">{title}</h2>
      <div className="sort-controls">
        <span className="sort-label">Sort by:</span>
        <div className="sort-buttons">
          {['popularity', 'recent', 'earliest'].map((s) => (
            <button
              key={s}
              className={`sort-btn ${sortType === s ? 'active' : ''}`}
              onClick={() => onSort(s)}
            >
              {s === 'popularity'
                ? 'Popularity'
                : s === 'recent'
                ? 'Newest'
                : 'Earliest'}
            </button>
          ))}
        </div>
      </div>
    </div>

    <div className="credits-grid">
      {items.map((item, index) => (
        <Link
          to={`${linkBase}/${item.id}`}
          key={`${item.media_type || linkBase}-${item.id}-${index}`}
          className="credit-card"
        >
          <div className="card-poster">
            <img
              src={getImage(item.poster_path)}
              alt={item.title || item.name}
              className={item.poster_path ? '' : 'fallback'}
            />
            <div className="overlay">
              <p className="overlay-text">{item.title || item.name}</p>
              {(item.release_date || item.first_air_date) && (
                <p className="overlay-text">
                  {getReleaseYear(item.release_date || item.first_air_date)}
                </p>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  </div>
);

export default Person;
