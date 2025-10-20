import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import '../../styles/Person.scss';

// --- 🔧 Utilities ---
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

// --- 🎬 Main Component ---
const ActorDetails = () => {
  const { actorId } = useParams();
  const [data, setData] = useState(null);
  const [showFullBio, setShowFullBio] = useState(false);
  const [tab, setTab] = useState('movies');
  const [movieSort, setMovieSort] = useState('popularity');
  const [tvSort, setTvSort] = useState('popularity');

  useEffect(() => {
    const apiKey = process.env.REACT_APP_API_KEY;
    const cacheKey = `actor_${actorId}`;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      const { timestamp, payload } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_EXPIRY) {
        setData(payload);
        document.title = payload.actorDetails.name;
        return;
      }
    }

    const detailsUrl = `https://api.themoviedb.org/3/actor/${actorId}`;
    const creditsUrl = `https://api.themoviedb.org/3/actor/${actorId}/combined_credits`;

    Promise.all([
      axios.get(detailsUrl, { params: { api_key: apiKey, language: 'en-US' } }),
      axios.get(creditsUrl, { params: { api_key: apiKey, language: 'en-US' } }),
    ])
      .then(([detailsRes, creditsRes]) => {
        const actorDetails = detailsRes.data;

        const rawCredits = creditsRes.data.cast.filter(
          (c) =>
            c.character?.trim() &&
            !/presenter/i.test(c.character) &&
            ![10763, 10767].some((g) => c.genre_ids?.includes(g)) &&
            !c.adult
        );

        // Deduplicate by unique ID (handles multiple episode entries)
        const seen = new Set();
        const credits = rawCredits.filter((credit) => {
          const key = `${credit.media_type}-${credit.id}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        const movies = credits
          .filter((c) => c.media_type === 'movie')
          .sort((a, b) => b.popularity - a.popularity);
        const tv = credits
          .filter((c) => c.media_type === 'tv')
          .sort((a, b) => b.popularity - a.popularity);

        const payload = { actorDetails, movies, tv };
        setData(payload);
        localStorage.setItem(
          cacheKey,
          JSON.stringify({ timestamp: Date.now(), payload })
        );
        document.title = actorDetails.name;
        if (movies.length) setTab('movies');
        else if (tv.length) setTab('tv');
      })
      .catch((err) => console.error('Fetch error:', err));
  }, [actorId]);

  // --- Sorting (memoized) ---
  const sortedMovies = useMemo(() => {
    if (!data?.movies) return [];
    const arr = [...data.movies];
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

  const sortedTV = useMemo(() => {
    if (!data?.tv) return [];
    const arr = [...data.tv];
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

  const { actorDetails } = data;
  const bioPreview = actorDetails.biography?.slice(0, 300);
  const showReadMore = actorDetails.biography?.length > 300;

  return (
    <div className="actor-page">
      {/* Hero Section */}
      <div className="actor-hero">
        <div className="container">
          <div className="hero-content">
            <div className="profile-section">
              <div className="profile-image">
                <img
                  src={getImage(actorDetails.profile_path)}
                  alt={actorDetails.name}
                />
              </div>
            </div>

            <div className="info-section">
              <h1 className="actor-name">{actorDetails.name}</h1>

              <div className="actor-meta">
                {actorDetails.birthday && (
                  <div className="meta-item">
                    <span className="meta-label">Born</span>
                    <span className="meta-value">
                      {formatDate(actorDetails.birthday)}
                      {!actorDetails.deathday && (
                        <span className="age">
                          {' '}
                          ({getAge(actorDetails.birthday)} years old)
                        </span>
                      )}
                    </span>
                  </div>
                )}

                {actorDetails.deathday && (
                  <div className="meta-item">
                    <span className="meta-label">Died</span>
                    <span className="meta-value">
                      {formatDate(actorDetails.deathday)}
                      <span className="age">
                        {' '}
                        ({getAge(
                          actorDetails.birthday,
                          actorDetails.deathday
                        )}{' '}
                        years old)
                      </span>
                    </span>
                  </div>
                )}

                {actorDetails.place_of_birth && (
                  <div className="meta-item">
                    <span className="meta-label">Born in</span>
                    <span className="meta-value">
                      {actorDetails.place_of_birth}
                    </span>
                  </div>
                )}
              </div>

              {actorDetails.biography && (
                <div className="biography">
                  <p className="bio-text">
                    {showFullBio ? actorDetails.biography : bioPreview}
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

      {/* Credits Section */}
      <div className="container">
        <div className="credits-section">
          {(data.movies.length > 0 || data.tv.length > 0) && (
            <div className="credits-tabs">
              {data.movies.length > 0 && (
                <button
                  className={`tab-btn ${tab === 'movies' ? 'active' : ''}`}
                  onClick={() => setTab('movies')}
                >
                  <span className="tab-label">Movies</span>
                  <span className="tab-count">{data.movies.length}</span>
                </button>
              )}
              {data.tv.length > 0 && (
                <button
                  className={`tab-btn ${tab === 'tv' ? 'active' : ''}`}
                  onClick={() => setTab('tv')}
                >
                  <span className="tab-label">TV Shows</span>
                  <span className="tab-count">{data.tv.length}</span>
                </button>
              )}
            </div>
          )}

          {tab === 'movies' && (
            <CreditsGrid
              title="Films"
              items={sortedMovies}
              sortType={movieSort}
              onSort={setMovieSort}
              getReleaseYear={getReleaseYear}
              getImage={getImage}
              linkBase="/movie"
            />
          )}

          {tab === 'tv' && (
            <CreditsGrid
              title="TV Shows"
              items={sortedTV}
              sortType={tvSort}
              onSort={setTvSort}
              getReleaseYear={getReleaseYear}
              getImage={getImage}
              linkBase="/show"
            />
          )}
        </div>
      </div>
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

export default ActorDetails;
