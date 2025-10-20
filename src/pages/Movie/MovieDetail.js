import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import '../../styles/MovieDetail.scss';

const MovieDetail = () => {
  const { movieId } = useParams();
  const [movie, setMovie] = useState(null);
  const [usProviders, setUsProviders] = useState(null);
  const [collection, setCollection] = useState(null);
  const [displaySection, setDisplaySection] = useState('cast');
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const apiKey = process.env.REACT_APP_API_KEY;
    const endpoint = `https://api.themoviedb.org/3/movie/${movieId}?append_to_response=credits%2Csimilar%2Cvideos%2Cimages%2Crelease_dates`;
    const providersEndpoint = `https://api.themoviedb.org/3/movie/${movieId}/watch/providers`;

    axios
      .get(endpoint, {
        params: {
          api_key: apiKey,
        },
      })
      .then((response) => {
        // Extract U.S. content rating
        const usRelease = response.data.release_dates?.results?.find(
          (r) => r.iso_3166_1 === 'US'
        );
        const certification =
          usRelease?.release_dates?.find((d) => d.certification)
            ?.certification || null;

        response.data.certification = certification;

        setMovie(response.data);
        document.title = response.data.title;

        if (response.data.belongs_to_collection) {
          const collectionId = response.data.belongs_to_collection.id;
          const collectionEndpoint = `https://api.themoviedb.org/3/collection/${collectionId}`;
          axios
            .get(collectionEndpoint, {
              params: { api_key: apiKey },
            })
            .then((collectionResponse) => {
              setCollection(collectionResponse.data);
            })
            .catch((error) => {
              console.error('Error fetching Collection Details:', error);
            });
        }
        if (response.data.credits && response.data.credits.cast.length > 0) {
          setDisplaySection('cast');
        } else {
          setDisplaySection('crew');
        }
      })
      .catch((error) => {
        console.error('Error fetching Movie Details:', error);
      });

    axios
      .get(providersEndpoint, {
        params: {
          api_key: apiKey,
        },
      })
      .then((response) => {
        const usData = response.data.results.US;
        setUsProviders(usData);
      })
      .catch((error) => {
        console.error('Error fetching Watch Providers', error);
      });
  }, [movieId]);

  const getReleaseYear = (dateString) => {
    if (dateString) {
      const dateParts = dateString.split('-');
      if (dateParts.length === 3) {
        return dateParts[0];
      }
    }
    return 'Release TBD';
  };

  function timeConverter(minutesString) {
    const totalMinutes = parseInt(minutesString, 10);

    if (isNaN(totalMinutes)) {
      return 'Invalid input';
    }

    const hours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;

    let formattedTime = hours > 0 ? `${hours}h` : '';

    if (remainingMinutes > 0) {
      formattedTime +=
        hours > 0 ? ` ${remainingMinutes}m` : `${remainingMinutes}m`;
    }

    return formattedTime;
  }

  // Trailer
  const getBestTrailer = (movie) => {
    if (!movie?.videos?.results?.length) return null;

    const trailers = movie.videos.results.filter(
      (v) => v.type === 'Trailer' && v.site === 'YouTube'
    );

    if (!trailers.length) return null;

    trailers.sort((a, b) => {
      // Prefer official trailers
      if (a.official && !b.official) return -1;
      if (!a.official && b.official) return 1;

      // Prefer US region
      if (a.iso_3166_1 === 'US' && b.iso_3166_1 !== 'US') return -1;
      if (a.iso_3166_1 !== 'US' && b.iso_3166_1 === 'US') return 1;

      // Prefer “Official Trailer” or “Main Trailer” by name
      const aIsMain = /official|main|theatrical/i.test(a.name);
      const bIsMain = /official|main|theatrical/i.test(b.name);
      if (aIsMain && !bIsMain) return -1;
      if (!aIsMain && bIsMain) return 1;

      // Otherwise, fallback to most recent upload (highest id)
      return b.id.localeCompare(a.id);
    });

    return trailers[0];
  };

  const bestTrailer = getBestTrailer(movie);

  if (!movie) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  const filterCrewByJob = (job) =>
    movie.credits.crew.filter(
      (crewMember) => crewMember.job && crewMember.job.toLowerCase() === job
    );

  const handleSectionClick = (section) => {
    setDisplaySection(section);
  };

  console.log(movie);

  return (
    <div className="movie-detail-wrapper">
      {/* Full Backdrop Section */}
      {movie.backdrop_path && (
        <div className="backdrop-container">
          <div className="backdrop-image-wrapper">
            <img
              src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
              alt=""
              className={`backdrop-image ${imageLoaded ? 'loaded' : ''}`}
              onLoad={() => setImageLoaded(true)}
            />
          </div>
          <div className="backdrop-mask">
            <div className="backdrop-gradient" />
          </div>
        </div>
      )}

      {!movie.backdrop_path && <div style={{ height: '50px' }}></div>}

      <div className="container movie-detail-container">
        <div className="movie-content-wrapper">
          {/* Left Side - Poster & Trailer */}
          <div className="poster-section">
            <div className="poster-wrapper">
              <img
                src={
                  movie.poster_path
                    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                    : '/nope.png'
                }
                alt={movie.title}
                className="poster-image"
              />
            </div>
            {bestTrailer && (
              <a
                href={`https://www.youtube.com/watch?v=${bestTrailer.key}`}
                target="_blank"
                rel="noopener noreferrer"
                className="trailer-button"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z" />
                </svg>
                Play Trailer
              </a>
            )}
            {/* Streaming Providers */}
            {usProviders && usProviders.flatrate && (
              <div className="providers-section">
                <p className="section-label">Stream On</p>
                <div className="providers-list">
                  {usProviders.flatrate.map((provider) => (
                    <div key={provider.provider_id} className="provider-logo">
                      <img
                        src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                        alt={provider.provider_name}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Side - All Details */}
          <div className="details-section">
            <div className="movie-header">
              <h1 className="movie-title">{movie.title}</h1>
              <div className="movie-meta">
                <span className="meta-item">
                  {getReleaseYear(movie.release_date)}
                </span>

                {Number(movie.runtime) > 0 && (
                  <>
                    <span className="meta-divider">•</span>
                    <span className="meta-item">
                      {timeConverter(movie.runtime)}
                    </span>
                  </>
                )}

                {/* {movie.vote_average > 0 && (
                  <>
                    <span className="meta-divider">•</span>
                    <span className="meta-item rating-badge">
                      <span className="star-icon">⭐</span>
                      <span className="rating-value">
                        {movie.vote_average.toFixed(1)}
                      </span>
                    </span>
                  </>
                )} */}

                {movie.certification && (
                  <>
                    <span className="meta-divider">•</span>
                    <span
                      className="meta-item certification-badge"
                      data-cert={movie.certification}
                    >
                      {movie.certification}
                    </span>
                  </>
                )}
              </div>

              {movie.credits.crew.some(
                (crewMember) => crewMember.job.toLowerCase() === 'director'
              ) && (
                <div className="director-info">
                  Directed by{' '}
                  {movie.credits.crew
                    .filter(
                      (crewMember) =>
                        crewMember.job.toLowerCase() === 'director'
                    )
                    .map((director, index, array) => (
                      <span key={director.id}>
                        <Link
                          to={`/director/${director.id}`}
                          className="director-link"
                        >
                          {director.name}
                        </Link>
                        {index < array.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                </div>
              )}
            </div>

            {movie.tagline && (
              <p className="movie-tagline">"{movie.tagline}"</p>
            )}

            <p className="movie-overview">{movie.overview}</p>

            {/* Genres */}
            {movie.genres.length > 0 && (
              <div className="genres-section">
                {movie.genres.map((genre) => (
                  <span key={genre.id} className="genre-badge">
                    {genre.name}
                  </span>
                ))}
              </div>
            )}

            {/* Cast/Crew Tabs */}
            <div className="cast-crew-section">
              <div className="tabs-nav">
                {movie.credits.cast.length > 0 && (
                  <button
                    onClick={() => handleSectionClick('cast')}
                    className={`tab-button ${
                      displaySection === 'cast' ? 'active' : ''
                    }`}
                  >
                    Cast
                  </button>
                )}
                <button
                  onClick={() => handleSectionClick('crew')}
                  className={`tab-button ${
                    displaySection === 'crew' ? 'active' : ''
                  }`}
                >
                  Crew
                </button>
              </div>

              <div className="tab-content">
                {movie.credits.cast.length > 0 && displaySection === 'cast' && (
                  <div className="cast-grid">
                    {movie.credits.cast.slice(0, 20).map((castMember) => (
                      <OverlayTrigger
                        key={castMember.id}
                        placement="top"
                        overlay={
                          castMember.character ? (
                            <Tooltip id={`tooltip-${castMember.id}`}>
                              {castMember.character}
                            </Tooltip>
                          ) : (
                            <></>
                          )
                        }
                        delay={{ show: 300, hide: 0 }}
                      >
                        <Link
                          to={`/actor/${castMember.id}`}
                          className="cast-badge"
                        >
                          {castMember.name}
                        </Link>
                      </OverlayTrigger>
                    ))}
                  </div>
                )}

                {movie.credits.crew.length > 0 && displaySection === 'crew' && (
                  <div className="crew-grid">
                    {filterCrewByJob('director').length > 0 && (
                      <div className="crew-category">
                        <p className="crew-role">
                          Director
                          {filterCrewByJob('director').length > 1 && 's'}
                        </p>
                        <div className="crew-names">
                          {filterCrewByJob('director').map((director) => (
                            <span key={director.id} className="crew-name">
                              {director.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {filterCrewByJob('screenplay').length > 0 && (
                      <div className="crew-category">
                        <p className="crew-role">
                          Writer
                          {filterCrewByJob('screenplay').length > 1 && 's'}
                        </p>
                        <div className="crew-names">
                          {filterCrewByJob('screenplay').map((writer) => (
                            <span key={writer.id} className="crew-name">
                              {writer.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {filterCrewByJob('writer').length > 0 && (
                      <div className="crew-category">
                        <p className="crew-role">
                          Writer
                          {filterCrewByJob('writer').length > 1 && 's'}
                        </p>
                        <div className="crew-names">
                          {filterCrewByJob('writer').map((writer) => (
                            <span key={writer.id} className="crew-name">
                              {writer.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {filterCrewByJob('producer').length > 0 && (
                      <div className="crew-category">
                        <p className="crew-role">
                          Producer
                          {filterCrewByJob('producer').length > 1 && 's'}
                        </p>
                        <div className="crew-names">
                          {filterCrewByJob('producer').map((producer) => (
                            <span key={producer.id} className="crew-name">
                              {producer.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {filterCrewByJob('director of photography').length > 0 && (
                      <div className="crew-category">
                        <p className="crew-role">Cinematography</p>
                        <div className="crew-names">
                          {filterCrewByJob('director of photography').map(
                            (dp) => (
                              <span key={dp.id} className="crew-name">
                                {dp.name}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}
                    {filterCrewByJob('original music composer').length > 0 && (
                      <div className="crew-category">
                        <p className="crew-role">
                          Composer
                          {filterCrewByJob('original music composer').length >
                            1 && 's'}
                        </p>
                        <div className="crew-names">
                          {filterCrewByJob('original music composer').map(
                            (composer) => (
                              <span key={composer.id} className="crew-name">
                                {composer.name}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Related Films */}
            {collection && (
              <div className="related-section">
                <h3 className="section-title">{collection.name}</h3>
                <div className="related-grid">
                  {collection.parts.map((collectionMovie) => (
                    <Link
                      key={collectionMovie.id}
                      to={`/movie/${collectionMovie.id}`}
                      className="related-item"
                    >
                      <img
                        src={
                          collectionMovie.poster_path
                            ? `https://image.tmdb.org/t/p/w500${collectionMovie.poster_path}`
                            : '/nope.png'
                        }
                        alt={collectionMovie.title}
                      />
                      <div className="related-overlay">
                        <p className="related-title">{collectionMovie.title}</p>
                        <p className="related-year">
                          {getReleaseYear(collectionMovie.release_date)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
