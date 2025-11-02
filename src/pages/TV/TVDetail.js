import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import '../../styles/MovieDetail.scss';

const TVDetail = () => {
  const { tvId } = useParams();
  const [show, setShow] = useState(null);
  const [usProviders, setUsProviders] = useState(null);
  const [displaySection, setDisplaySection] = useState('cast');
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const apiKey = process.env.REACT_APP_API_KEY;
        const endpoint = `https://api.themoviedb.org/3/tv/${tvId}?append_to_response=videos,credits,images,content_ratings`;
        const providersEndpoint = `https://api.themoviedb.org/3/tv/${tvId}/watch/providers`;

        const [showRes, providersRes] = await Promise.all([
          axios.get(endpoint, { params: { api_key: apiKey } }),
          axios.get(providersEndpoint, { params: { api_key: apiKey } }),
        ]);

        setShow(showRes.data);
        document.title = showRes.data.name;

        const usData = providersRes.data.results.US;
        setUsProviders(usData);
      } catch (error) {
        console.error('Error fetching show details or providers', error);
      }
    }

    fetchData();
  }, [tvId]);

  const getBestTrailer = (show) => {
    if (!show?.videos?.results?.length) return null;

    const trailers = show.videos.results.filter(
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
      const aIsMain = /official|main/i.test(a.name);
      const bIsMain = /official|main/i.test(b.name);
      if (aIsMain && !bIsMain) return -1;
      if (!aIsMain && bIsMain) return 1;

      // Otherwise, fallback to most recent upload (highest id)
      return b.id.localeCompare(a.id);
    });

    return trailers[0];
  };

  const bestTrailer = getBestTrailer(show);

  const getRating = (show) => {
    if (!show?.content_ratings?.results) return null;

    const usRating = show.content_ratings.results.find(
      (r) => r.iso_3166_1 === 'US'
    );

    return usRating?.rating || null;
  };

  if (!show) {
    return <div>Loading...</div>;
  }

  const handleSectionClick = (section) => {
    setDisplaySection(section);
  };

  console.log(show);

  return (
    <div className="movie-detail-wrapper">
      {/* Full Backdrop Section */}
      {show.backdrop_path && (
        <div className="backdrop-container">
          <div className="backdrop-image-wrapper">
            <img
              src={`https://image.tmdb.org/t/p/original${show.backdrop_path}`}
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

      <div className="container movie-detail-container">
        <div className="movie-content-wrapper">
          <div className="poster-section">
            <div className="poster-wrapper">
              <img
                src={
                  show.poster_path
                    ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
                    : '/sorry.png'
                }
                alt={show.title}
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

          <div className="details-section">
            <div className="movie-header">
              <h1 className="movie-title">{show.name}</h1>
              <p className="movie-meta">
                {show.status && (
                  <span>
                    {show.first_air_date && show.first_air_date.split('-')[0]}
                    {show.status.toLowerCase() === 'returning series' && (
                      <span> - ?</span>
                    )}
                    {show.status.toLowerCase() === 'ended' &&
                      show.last_air_date !== null &&
                      show.last_air_date.split('-')[0] !==
                        show.first_air_date.split('-')[0] && (
                        <span> - {show.last_air_date.split('-')[0]}</span>
                      )}
                  </span>
                )}
                {show.number_of_seasons && (
                  <>
                    <span className="meta-divider">•</span>
                    <span className="meta-item">
                      {show.number_of_seasons} Season
                      {show.number_of_seasons !== 1 ? 's' : ''}
                    </span>
                  </>
                )}
                {show.number_of_episodes && (
                  <>
                    <span className="meta-divider">•</span>
                    <span className="meta-item">
                      {show.number_of_episodes} Episode
                      {show.number_of_episodes !== 1 ? 's' : ''}
                    </span>
                  </>
                )}
                {getRating(show) && (
                  <>
                    <span className="meta-divider">•</span>
                    <span
                      className="meta-item certification-badge"
                      data-cert={getRating(show)}
                    >
                      {getRating(show)}
                    </span>
                  </>
                )}
              </p>
              {/* {show.created_by && show.created_by.length > 0 && (
                <div className="director-info">
                  Created by{' '}
                  {show.created_by.map((creator, index, array) => (
                    <span key={creator.id}>
                      <span className="director-link">{creator.name}</span>
                      {index < array.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </div>
              )} */}
              {/* {show.status.toLowerCase() === 'returning series' && (
                <div className="director-info">
                  <span
                    className="genre-badge"
                    style={{ display: 'inline-block', marginTop: '0.5rem' }}
                  >
                    Ongoing Series
                  </span>
                </div>
              )} */}
            </div>
            {show.tagline && <p className="movie-tagline">"{show.tagline}"</p>}

            <p className="movie-overview">{show.overview}</p>

            {/* Genres */}
            {show.genres.length > 0 && (
              <div className="genres-section">
                {show.genres.map((genre) => (
                  <span key={genre.id} className="genre-badge">
                    {genre.name}
                  </span>
                ))}
              </div>
            )}
            <div className="cast-crew-section">
              {show.credits.cast.length > 0 && (
                <div className="tabs-nav">
                  <button
                    onClick={() => handleSectionClick('cast')}
                    className={`tab-button ${
                      displaySection === 'cast' ? 'active' : ''
                    }`}
                  >
                    Cast
                  </button>
                </div>
              )}

              <div className="tab-content">
                {show.credits.cast.length > 0 && displaySection === 'cast' && (
                  <div className="cast-grid">
                    {show.credits.cast.slice(0, 20).map((castMember) => (
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
              </div>
            </div>
            <div className="seasons tabs-nav">
              <div className="tab-button active">Seasons</div>
            </div>
            <div>
              {show.seasons.length > 0 && (
                <div className="seasons-holder">
                  {show.seasons
                    .filter((season) => season.season_number !== 0)
                    .map((season) => {
                      // If season has no air date, show disabled with tooltip
                      if (season.air_date == null) {
                        return (
                          <OverlayTrigger
                            key={season.id}
                            placement="top"
                            overlay={
                              <Tooltip id={`tooltip-season-${season.id}`}>
                                Season not yet aired
                              </Tooltip>
                            }
                            delay={{ show: 200, hide: 0 }}
                          >
                            <span className="season-links null">
                              Season {season.season_number}
                            </span>
                          </OverlayTrigger>
                        );
                      }

                      // Otherwise, render normal Link
                      return (
                        <Link
                          to={`/season/${tvId}/${season.season_number}`}
                          key={season.id}
                          className="season-links"
                        >
                          Season {season.season_number}
                        </Link>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TVDetail;
