import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import '../../styles/SeasonDetail.scss';

const SeasonDetail = () => {
  const { tvId, seasonNumber } = useParams();
  const [season, setSeason] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchSeasonData = async () => {
      const apiKey = process.env.REACT_APP_API_KEY;
      const endpoint = `https://api.themoviedb.org/3/tv/${tvId}/season/${seasonNumber}?language=en-US`;

      try {
        const seasonResponse = await axios.get(endpoint, {
          params: { api_key: apiKey },
        });

        const seasonData = seasonResponse.data;
        setSeason(seasonData);
        document.title = seasonData.name;
      } catch (error) {
        console.error('Error fetching Season', error);
      }
    };

    fetchSeasonData();
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
  if (!season) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="season-detail-wrapper">
      <div className="container season-detail-container">
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
