import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../../styles/SeasonDetail.scss';

const SeasonDetail = () => {
  const { tvId, seasonNumber } = useParams();
  const navigate = useNavigate();
  const [season, setSeason] = useState(null);
  const [showInfo, setShowInfo] = useState(null);
  const [allSeasons, setAllSeasons] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchData = async () => {
      const apiKey = process.env.REACT_APP_API_KEY;
      const seasonEndpoint = `https://api.themoviedb.org/3/tv/${tvId}/season/${seasonNumber}?language=en-US`;
      const showEndpoint = `https://api.themoviedb.org/3/tv/${tvId}?language=en-US`;

      try {
        // Fetch both season and show data in parallel
        const [seasonResponse, showResponse] = await Promise.all([
          axios.get(seasonEndpoint, { params: { api_key: apiKey } }),
          axios.get(showEndpoint, { params: { api_key: apiKey } }),
        ]);

        const seasonData = seasonResponse.data;
        const showData = showResponse.data;

        setSeason(seasonData);
        setShowInfo(showData);
        setAllSeasons(showData.seasons.filter((s) => s.season_number !== 0));
        document.title = `${seasonData.name} - ${showData.name}`;
      } catch (error) {
        console.error('Error fetching Season', error);
      }
    };

    fetchData();
  }, [tvId, seasonNumber]);

  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';

    const date = new Date(dateString + 'T00:00:00');

    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    }).format(date);
  };

  console.log(tvId);
  console.log(seasonNumber);
  console.log(season);

  // Added loading state
  if (!season || !showInfo) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  const handleBackToShow = () => {
    navigate(`/show/${tvId}`);
  };

  const handleSeasonChange = (newSeasonNumber) => {
    navigate(`/season/${tvId}/${newSeasonNumber}`);
  };

  return (
    <div className="season-detail-wrapper">
      <div className="container season-detail-container">
        {/* Season Selector */}
        {allSeasons.length > 1 && (
          <div className="season-selector">
            {/* Back Button */}
            <div className="back-navigation">
              <button onClick={handleBackToShow} className="back-button">
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
                Back to {showInfo.name}
              </button>
            </div>
            <label htmlFor="season-dropdown">Jump to Season:</label>
            <select
              id="season-dropdown"
              value={seasonNumber}
              onChange={(e) => handleSeasonChange(e.target.value)}
              className="season-dropdown"
            >
              {allSeasons.map((s) => (
                <option
                  key={s.id}
                  value={s.season_number}
                  disabled={!s.air_date}
                >
                  Season {s.season_number}
                  {!s.air_date ? ' (Not Yet Aired)' : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="season-content-wrapper">
          <div className="left-side">
            <div className="poster-holder">
              <img
                src={
                  season.poster_path
                    ? `https://image.tmdb.org/t/p/w500/${season.poster_path}.jpg`
                    : '/sorry.png'
                }
                alt={`Season ${season.season_number} Poster`}
              />
            </div>
          </div>
          <div className="right-side">
            <h1>{season.name}</h1>
            {season.air_date !== null ? (
              <>
                <p>{season.overview}</p>
                {season.episodes.length > 0 && (
                  <div className="episodes-holder">
                    {season.episodes.map((episode) => (
                      <div className="episode" key={episode.id}>
                        <div className="episode-left">
                          <img
                            src={
                              episode.still_path
                                ? `https://image.tmdb.org/t/p/w500/${episode.still_path}.jpg`
                                : '/sorry-horizontal.png'
                            }
                            alt={`${episode.name}`}
                          />
                        </div>
                        <div className="episode-right">
                          <span className="episode-name">
                            S{season.season_number}E{episode.episode_number}{' '}
                            <span>•</span> {episode.name}
                          </span>
                          <p>{formatDate(episode.air_date)}</p>
                          <p>{episode.overview}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p>This season has yet to air.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeasonDetail;
