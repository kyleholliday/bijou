import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useParams, useNavigate } from 'react-router-dom';
import '../../styles/EpisodeDetail.scss';

const EpisodeDetail = () => {
  const { tvId, seasonNumber, episodeNumber } = useParams();
  const navigate = useNavigate();
  const [episode, setEpisode] = useState(null);
  const [showInfo, setShowInfo] = useState(null);
  const [episodeCast, setEpisodeCast] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);

    async function fetchData() {
      try {
        const apiKey = process.env.REACT_APP_API_KEY;
        const episodeEndpoint = `https://api.themoviedb.org/3/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}`;
        const showEndpoint = `https://api.themoviedb.org/3/tv/${tvId}`;
        const creditsEndpoint = `https://api.themoviedb.org/3/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}/credits`;

        const [episodeRes, showRes, creditsRes] = await Promise.all([
          axios.get(episodeEndpoint, { params: { api_key: apiKey } }),
          axios.get(showEndpoint, { params: { api_key: apiKey } }),
          axios.get(creditsEndpoint, { params: { api_key: apiKey } }),
        ]);

        setEpisode(episodeRes.data);
        setShowInfo(showRes.data);
        setEpisodeCast(creditsRes.data.cast || []);
        document.title = `${episodeRes.data.name} - ${showRes.data.name}`;
      } catch (error) {
        console.error('Error fetching episode details', error);
      }
    }

    fetchData();
  }, [tvId, seasonNumber, episodeNumber]);

  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';

    const date = new Date(dateString + 'T00:00:00');

    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    }).format(date);
  };

  const formatRuntime = (minutes) => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (!episode || !showInfo) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  const handleBackToSeason = () => {
    navigate(`/season/${tvId}/${seasonNumber}`);
  };

  console.log(episode);

  return (
    <div className="episode-detail-wrapper">
      <div className="container episode-detail-container">
        <div className="back-navigation">
          <button onClick={handleBackToSeason} className="back-button">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path
                fillRule="evenodd"
                d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"
              />
            </svg>
            Back to Season {seasonNumber}
          </button>
        </div>

        <div className="episode-content-wrapper">
          <div className="poster-section">
            <div className="poster-wrapper">
              <img
                src={
                  episode.still_path
                    ? `https://image.tmdb.org/t/p/original${episode.still_path}`
                    : '/sorry-horizontal.png'
                }
                alt={episode.name}
                className="episode-image"
              />
            </div>
          </div>

          <div className="details-section">
            <div className="episode-header">
              <h1 className="episode-title">{episode.name}</h1>
              <p className="episode-meta">
                <span className="meta-item">
                  S{episode.season_number} • E{episode.episode_number}
                </span>
                {episode.air_date && (
                  <>
                    <span className="meta-divider">•</span>
                    <span className="meta-item">
                      {formatDate(episode.air_date)}
                    </span>
                  </>
                )}
                {episode.runtime && (
                  <>
                    <span className="meta-divider">•</span>
                    <span className="meta-item">
                      {formatRuntime(episode.runtime)}
                    </span>
                  </>
                )}
              </p>

              <div className="show-link">
                <Link to={`/show/${tvId}`} className="show-name">
                  {showInfo.name}
                </Link>
              </div>
            </div>

            <p className="episode-overview">{episode.overview}</p>

            {/* Episode Cast - Only actors in THIS episode */}
            {episodeCast.length > 0 && (
              <div className="cast-section">
                <h3 className="section-label">Cast</h3>
                <div className="cast-grid">
                  {episodeCast.slice(0, 16).map((cast) => (
                    <Link
                      key={cast.id}
                      to={`/actor/${cast.id}`}
                      className="cast-badge"
                    >
                      {cast.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Guest Stars */}
            {episode.guest_stars && episode.guest_stars.length > 0 && (
              <div className="cast-section">
                <h3 className="section-label">Guest Stars</h3>
                <div className="cast-grid">
                  {episode.guest_stars.slice(0, 12).map((guest) => (
                    <Link
                      key={guest.id}
                      to={`/actor/${guest.id}`}
                      className="cast-badge"
                    >
                      {guest.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Crew */}
            {episode.crew && episode.crew.length > 0 && (
              <div className="crew-section">
                <h3 className="section-label">Crew</h3>
                <div className="crew-grid">
                  {/* Directors */}
                  {(() => {
                    const directors = episode.crew.filter(
                      (c) => c.job === 'Director'
                    );
                    if (directors.length > 0) {
                      return (
                        <div className="crew-item">
                          <span className="crew-role">
                            Director{directors.length > 1 ? 's' : ''}
                          </span>
                          <span className="crew-name">
                            {directors.map((d) => d.name).join(', ')}
                          </span>
                        </div>
                      );
                    }
                  })()}

                  {/* Writers */}
                  {(() => {
                    const writers = episode.crew
                      .filter(
                        (c) => c.job === 'Writer' || c.department === 'Writing'
                      )
                      .slice(0, 3);
                    if (writers.length > 0) {
                      return (
                        <div className="crew-item">
                          <span className="crew-role">
                            Writer{writers.length > 1 ? 's' : ''}
                          </span>
                          <span className="crew-name">
                            {writers.map((w) => w.name).join(', ')}
                          </span>
                        </div>
                      );
                    }
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EpisodeDetail;
