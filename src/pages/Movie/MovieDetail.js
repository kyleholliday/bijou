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
    const fetchMovieData = async () => {
      const apiKey = process.env.REACT_APP_API_KEY;
      const endpoint = `https://api.themoviedb.org/3/movie/${movieId}?append_to_response=credits%2Cvideos%2Crelease_dates`;
      const providersEndpoint = `https://api.themoviedb.org/3/movie/${movieId}/watch/providers`;
      console.log(endpoint);

      try {
        // Fetch movie details and providers in parallel
        const [movieResponse, providersResponse] = await Promise.all([
          axios.get(endpoint, { params: { api_key: apiKey } }),
          axios.get(providersEndpoint, { params: { api_key: apiKey } }),
        ]);

        // Process movie data
        const movieData = movieResponse.data;

        // Extract U.S. content rating
        const usRelease = movieData.release_dates?.results?.find(
          (r) => r.iso_3166_1 === 'US'
        );
        const certification =
          usRelease?.release_dates?.find((d) => d.certification)
            ?.certification || null;

        movieData.certification = certification;
        setMovie(movieData);
        document.title = movieData.title;

        // Set initial display section
        if (movieData.credits?.cast?.length > 0) {
          setDisplaySection('cast');
        } else {
          setDisplaySection('crew');
        }

        // Process providers
        const providersData = providersResponse.data.results?.US || null;
        setUsProviders(providersData);

        // Fetch collection if exists
        if (movieData.belongs_to_collection) {
          const collectionId = movieData.belongs_to_collection.id;
          const collectionEndpoint = `https://api.themoviedb.org/3/collection/${collectionId}`;

          try {
            const collectionResponse = await axios.get(collectionEndpoint, {
              params: { api_key: apiKey },
            });
            setCollection(collectionResponse.data);
          } catch (error) {
            console.error('Error fetching Collection Details:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching Movie Details:', error);
      }
    };

    fetchMovieData();
  }, [movieId]);

  const getReleaseYear = (dateString) => {
    if (dateString) {
      const dateParts = dateString.split('-');
      if (dateParts.length === 3) {
        return dateParts[0];
      }
    }
    return 'TBD';
  };

  const getUpcomingInfo = (movie) => {
    // default return for when release_dates data can't be found
    const defaultReturn = {
      isUpcoming: false,
      releaseDate: movie?.release_date || null,
    };

    if (!movie?.release_dates?.results) return defaultReturn;

    const usRelease = movie.release_dates.results.find(
      (r) => r.iso_3166_1 === 'US'
    );

    if (!usRelease?.release_dates) return defaultReturn;

    // priority: wide theatrical (3) > limited theatrical (2) > digital (4)
    let targetRelease = usRelease.release_dates.find((d) => d.type === 3);
    if (!targetRelease) {
      targetRelease = usRelease.release_dates.find((d) => d.type === 2);
    }
    if (!targetRelease) {
      targetRelease = usRelease.release_dates.find((d) => d.type === 4);
    }

    if (!targetRelease?.release_date) return defaultReturn;

    const today = new Date();
    const releaseDate = new Date(targetRelease.release_date);

    // time's set to midnight for comparison b/t the two dates
    today.setHours(0, 0, 0, 0);
    releaseDate.setHours(0, 0, 0, 0);

    return {
      isUpcoming: releaseDate > today,
      releaseDate: targetRelease.release_date.split('T')[0],
    };
  };

  const timeConverter = (minutesString) => {
    const totalMinutes = parseInt(minutesString, 10);
    if (isNaN(totalMinutes)) return '';

    const hours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;

    let formattedTime = hours > 0 ? `${hours}h` : '';
    if (remainingMinutes > 0) {
      formattedTime +=
        hours > 0 ? ` ${remainingMinutes}m` : `${remainingMinutes}m`;
    }

    return formattedTime;
  };

  const getBestTrailer = (movie) => {
    if (!movie?.videos?.results?.length) return null;

    const trailers = movie.videos.results.filter(
      (v) => v.type === 'Trailer' && v.site === 'YouTube'
    );

    if (!trailers.length) return null;

    trailers.sort((a, b) => {
      if (a.official && !b.official) return -1;
      if (!a.official && b.official) return 1;
      if (a.iso_3166_1 === 'US' && b.iso_3166_1 !== 'US') return -1;
      if (a.iso_3166_1 !== 'US' && b.iso_3166_1 === 'US') return 1;

      const aIsMain = /official|main|theatrical/i.test(a.name);
      const bIsMain = /official|main|theatrical/i.test(b.name);
      if (aIsMain && !bIsMain) return -1;
      if (!aIsMain && bIsMain) return 1;

      return b.id.localeCompare(a.id);
    });

    return trailers[0];
  };

  const filterCrewByJob = (job) =>
    movie?.credits?.crew?.filter(
      (crewMember) => crewMember.job?.toLowerCase() === job
    ) || [];

  const filterStoryCredits = () => {
    const storyJobs = [
      'Story',
      'Original Story',
      'Novel',
      'Book',
      'Author',
      'Comic Book',
      'Characters',
    ];
    return movie?.credits?.crew?.filter((c) => storyJobs.includes(c.job)) || [];
  };

  if (!movie) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  const bestTrailer = getBestTrailer(movie);
  const upcomingInfo = getUpcomingInfo(movie);

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
                    : '/sorry.png'
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
            {usProviders?.flatrate && (
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

              {filterCrewByJob('director').length > 0 && (
                <div className="director-info">
                  Directed by{' '}
                  {filterCrewByJob('director').map((director, index, array) => (
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

            {upcomingInfo.isUpcoming && (
              <div className="release-date">
                <div className="coming-soon-sidebar"></div>
                <div className="coming-soon-content">
                  {' '}
                  <p className="coming-soon-text">Coming Soon</p>
                  <p className="releases">
                    Releases{' '}
                    {new Intl.DateTimeFormat('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      timeZone: 'UTC',
                    }).format(
                      new Date(upcomingInfo.releaseDate + 'T00:00:00Z')
                    )}
                  </p>
                </div>
              </div>
            )}

            {movie.tagline && (
              <p className="movie-tagline">"{movie.tagline}"</p>
            )}

            <p className="movie-overview">{movie.overview}</p>

            {/* Genres */}
            {movie.genres?.length > 0 && (
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
                {movie.credits?.cast?.length > 0 && (
                  <button
                    onClick={() => setDisplaySection('cast')}
                    className={`tab-button ${
                      displaySection === 'cast' ? 'active' : ''
                    }`}
                  >
                    Cast
                  </button>
                )}
                <button
                  onClick={() => setDisplaySection('crew')}
                  className={`tab-button ${
                    displaySection === 'crew' ? 'active' : ''
                  }`}
                >
                  Crew
                </button>
              </div>

              <div className="tab-content">
                {movie.credits?.cast?.length > 0 &&
                  displaySection === 'cast' && (
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

                {movie.credits?.crew?.length > 0 &&
                  displaySection === 'crew' && (
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
                            Writer{filterCrewByJob('writer').length > 1 && 's'}
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
                      {filterCrewByJob('director of photography').length >
                        0 && (
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
                      {filterCrewByJob('original music composer').length >
                        0 && (
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
                      {filterStoryCredits().length > 0 && (
                        <div className="crew-category">
                          <p className="crew-role">Story By</p>
                          <div className="crew-names">
                            {filterStoryCredits().map((credit) => (
                              <span key={credit.id} className="crew-name">
                                {credit.name}
                              </span>
                            ))}
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
                            : '/sorry.png'
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
