import { useEffect, useState } from 'react';
import Backdrop from './Backdrop';
import HorizontalScrollSection from '../../components/HorizontalScrollSection';
import '../../styles/Home.scss';
import CuratedPicks from '../../components/CuratedPicks';
import { tmdb } from '../../services/tmdb';
import { getCuratedContent } from '../../utils/curatedContent';

const Home = () => {
  const [nowPlaying, setNowPlaying] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [trendingTV, setTrendingTV] = useState([]);
  const [loading, setLoading] = useState(true);

  const curatedContent = getCuratedContent();

  useEffect(() => {
    // Fetch Now Playing
    tmdb
      .get('/movie/now_playing', { params: { region: 'US', page: 1 } })
      .then((response) => {
        setNowPlaying(response.data.results);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching the Now Playing movies:', error);
        setLoading(false);
      });

    // Fetch Upcoming Movies
    const today = new Date().toISOString().split('T')[0];
    tmdb
      .get('/movie/upcoming', {
        params: { region: 'US', 'primary_release_date.gte': today },
      })
      .then((response) => {
        const todayDate = new Date();
        const filtered = response.data.results.filter((movie) => {
          const release = new Date(movie.release_date);
          return release >= todayDate;
        });
        setUpcoming(filtered);
      })
      .catch((error) => {
        console.error('Error fetching the Upcoming movies:', error);
      });

    // Fetch Trending TV
    tmdb
      .get('/trending/tv/week')
      .then((response) => {
        setTrendingTV(response.data.results.slice(0, 12));
      })
      .catch((error) => {
        console.error('Error fetching the Trending TV Shows:', error);
      });
  }, []);

  if (loading) {
    return (
      <div className="home-page">
        <div className="loading-container">
          <div className="loading-spinner">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <Backdrop />

      <CuratedPicks
        title={curatedContent.title}
        description={curatedContent.description}
        movieIds={curatedContent.movieIds}
        moviePool={curatedContent.moviePool}
        fallbackMovieIds={curatedContent.fallbackMovieIds}
        theme="dark"
      />

      <div className="home-content">
        {nowPlaying.length > 0 && (
          <HorizontalScrollSection
            title="Now Playing"
            items={nowPlaying}
            type="movie"
            seeAllLink="/now-playing"
          />
        )}

        <div className="divider"></div>

        {upcoming.length > 0 && (
          <HorizontalScrollSection
            title="Upcoming"
            items={upcoming}
            type="movie"
            seeAllLink="/upcoming"
          />
        )}

        <div className="divider"></div>

        {trendingTV.length > 0 && (
          <HorizontalScrollSection
            title="Trending TV"
            items={trendingTV}
            type="show"
            seeAllLink="/tv-trending"
          />
        )}
      </div>
    </div>
  );
};

export default Home;
