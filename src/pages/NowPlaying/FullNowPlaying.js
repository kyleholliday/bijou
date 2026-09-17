import MediaGridPage from '../../components/MediaGridPage';

const PARAMS = { region: 'US' };

const isReleased = (movie) =>
  movie.release_date && new Date(movie.release_date) <= new Date();

const NowPlayingMoviesPage = () => (
  <MediaGridPage
    endpoint="/movie/now_playing"
    heading="Now Playing"
    documentTitle="Now Playing Movies"
    params={PARAMS}
    filterItem={isReleased}
  />
);

export default NowPlayingMoviesPage;
