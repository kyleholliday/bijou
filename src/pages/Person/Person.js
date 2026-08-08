import { useEffect, useState, useMemo } from 'react'; // Add useRef
import axios from 'axios';
import {
  Link,
  useParams,
  useLocation,
  useSearchParams,
} from 'react-router-dom';
import '../../styles/Person.scss';

// Utilities
const getReleaseYear = (date) => (date ? date.split('-')[0] : null);
const formatDate = (date) =>
  date
    ? new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC',
      }).format(new Date(date + 'T00:00:00Z'))
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

// Consolidated sorting function
const sortCredits = (credits, sortType, dateField) => {
  const sorted = [...credits];

  if (sortType === 'recent') {
    sorted.sort((a, b) => {
      // Items without dates go to the bottom
      if (!a[dateField] && !b[dateField]) return 0;
      if (!a[dateField]) return 1;
      if (!b[dateField]) return -1;
      return b[dateField].localeCompare(a[dateField]);
    });
  } else if (sortType === 'earliest') {
    sorted.sort((a, b) => {
      // Items without dates go to the bottom
      if (!a[dateField] && !b[dateField]) return 0;
      if (!a[dateField]) return 1;
      if (!b[dateField]) return -1;
      return a[dateField].localeCompare(b[dateField]);
    });
  } else {
    // popularity - also sort by vote_count as a tiebreaker for better accuracy
    sorted.sort((a, b) => {
      const popDiff = (b.popularity || 0) - (a.popularity || 0);
      if (Math.abs(popDiff) < 0.01) {
        return (b.vote_count || 0) - (a.vote_count || 0);
      }
      return popDiff;
    });
  }

  return sorted;
};

// Process and deduplicate credits
const processCredits = (rawCredits, filterFn) => {
  const filtered = rawCredits.filter(filterFn);
  const seen = new Set();

  return filtered.filter((credit) => {
    const key = `${credit.media_type}-${credit.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

// Main Component
const Person = () => {
  const { personId } = useParams();
  const location = useLocation();
  const [data, setData] = useState(null);
  const [showFullBio, setShowFullBio] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [primaryTab, setPrimaryTab] = useState(
    searchParams.get('tab') || 'movies'
  );
  const [movieSort, setMovieSort] = useState(
    searchParams.get('movieSort') || 'popularity'
  );
  const [tvSort, setTvSort] = useState(
    searchParams.get('tvSort') || 'popularity'
  );

  const isActorRoute = location.pathname.includes('/actor/');
  const isDirectorRoute = location.pathname.includes('/director/');

  // Update URL and state together
  const updateSort = (type, value) => {
    const key = type === 'movie' ? 'movieSort' : 'tvSort';
    const setter = type === 'movie' ? setMovieSort : setTvSort;

    setter(value);
    const newParams = new URLSearchParams(searchParams);
    newParams.set(key, value);
    setSearchParams(newParams, { preventScrollReset: true });
  };

  const updateTab = (tab) => {
    setPrimaryTab(tab);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', tab);
    setSearchParams(newParams, { preventScrollReset: true });
  };

  useEffect(() => {
    const fetchPersonData = async () => {
      const apiKey = process.env.REACT_APP_API_KEY;
      const detailsUrl = `https://api.themoviedb.org/3/person/${personId}`;
      const creditsUrl = `https://api.themoviedb.org/3/person/${personId}/combined_credits`;

      try {
        const [detailsRes, creditsRes] = await Promise.all([
          axios.get(detailsUrl, {
            params: { api_key: apiKey, language: 'en-US' },
          }),
          axios.get(creditsUrl, {
            params: { api_key: apiKey, language: 'en-US' },
          }),
        ]);

        const details = detailsRes.data;

        // Process ACTING credits
        const actingCredits = processCredits(
          creditsRes.data.cast,
          (c) =>
            c.character?.trim() &&
            !/presenter/i.test(c.character) &&
            ![10763, 10767].some((g) => c.genre_ids?.includes(g)) &&
            c.character.toLowerCase() !== 'self' &&
            !c.adult
        );

        // Process DIRECTING credits
        const directingCredits = processCredits(
          creditsRes.data.crew,
          (c) => c.job?.toLowerCase() === 'director' && !c.adult
        );

        // Split by media type
        const actingMovies = actingCredits.filter(
          (c) => c.media_type === 'movie'
        );
        const actingTV = actingCredits.filter((c) => c.media_type === 'tv');
        const directingMovies = directingCredits.filter(
          (c) => c.media_type === 'movie'
        );
        const directingTV = directingCredits.filter(
          (c) => c.media_type === 'tv'
        );

        setData({
          details,
          actingMovies,
          actingTV,
          directingMovies,
          directingTV,
        });

        document.title = details.name;

        // Auto-select first available tab
        // Auto-select first available tab ONLY if no tab in URL
        if (!searchParams.get('tab')) {
          if (isActorRoute) {
            const defaultTab = actingMovies.length ? 'movies' : 'tv';
            setPrimaryTab(defaultTab);
            const newParams = new URLSearchParams(searchParams);
            newParams.set('tab', defaultTab);
            setSearchParams(newParams, {
              replace: true,
            });
          } else if (isDirectorRoute) {
            const defaultTab = directingMovies.length ? 'movies' : 'tv';
            setPrimaryTab(defaultTab);
            const newParams = new URLSearchParams(searchParams);
            newParams.set('tab', defaultTab);
            setSearchParams(newParams, {
              replace: true,
            });
          }
        }
      } catch (err) {
        console.error('Fetch error:', err);
      }
    };

    fetchPersonData();
  }, [personId, isActorRoute, isDirectorRoute, searchParams, setSearchParams]);

  const sortedActingMovies = useMemo(
    () => sortCredits(data?.actingMovies || [], movieSort, 'release_date'),
    [data?.actingMovies, movieSort]
  );

  const sortedActingTV = useMemo(
    () => sortCredits(data?.actingTV || [], tvSort, 'first_air_date'),
    [data?.actingTV, tvSort]
  );

  const sortedDirectingMovies = useMemo(
    () => sortCredits(data?.directingMovies || [], movieSort, 'release_date'),
    [data?.directingMovies, movieSort]
  );

  const sortedDirectingTV = useMemo(
    () => sortCredits(data?.directingTV || [], tvSort, 'first_air_date'),
    [data?.directingTV, tvSort]
  );

  if (!data)
    return (
      <div className="actor-loading">
        <div className="loading-spinner">Loading...</div>
      </div>
    );

  const { details } = data;
  const bioPreview = details.biography?.slice(0, 300);
  const showReadMore = details.biography?.length > 300;

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

      {/* PRIMARY SECTION */}
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
                    onClick={() => updateTab('movies')}
                  >
                    <span className="tab-label">Movies</span>
                    <span className="tab-count">{primaryMovies.length}</span>
                  </button>
                )}
                {primaryTV.length > 0 && (
                  <button
                    className={`tab-btn ${primaryTab === 'tv' ? 'active' : ''}`}
                    onClick={() => updateTab('tv')}
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
                  onSort={(sort) => updateSort('movie', sort)}
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
                  onSort={(sort) => updateSort('tv', sort)}
                  linkBase="/show"
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* SECONDARY SECTION */}
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
                <CreditCard
                  key={`secondary-movie-${item.id}-${index}`}
                  item={item}
                  linkTo={`/movie/${item.id}`}
                  title={item.title}
                  date={item.release_date}
                />
              ))}
              {secondaryTV.map((item, index) => (
                <CreditCard
                  key={`secondary-tv-${item.id}-${index}`}
                  item={item}
                  linkTo={`/show/${item.id}`}
                  title={item.name}
                  date={item.first_air_date}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Extracted CreditCard component to reduce duplication
const CreditCard = ({ item, linkTo, title, date }) => (
  <Link to={linkTo} className="credit-card">
    <div className="card-poster">
      <img
        src={getImage(item.poster_path)}
        alt={title}
        className={item.poster_path ? '' : 'fallback'}
      />
      <div className="overlay">
        <p className="overlay-text">{title}</p>
        {date && <p className="overlay-text">{getReleaseYear(date)}</p>}
      </div>
    </div>
  </Link>
);

const CreditsGrid = ({ title, items, sortType, onSort, linkBase }) => (
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
        <CreditCard
          key={`${item.media_type || linkBase}-${item.id}-${index}`}
          item={item}
          linkTo={`${linkBase}/${item.id}`}
          title={item.title || item.name}
          date={item.release_date || item.first_air_date}
        />
      ))}
    </div>
  </div>
);

export default Person;
