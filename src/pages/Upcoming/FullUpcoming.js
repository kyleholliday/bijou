import MediaGridPage from '../../components/MediaGridPage';

const PARAMS = { region: 'US' };

const isUnreleased = (movie) =>
  movie.release_date && new Date(movie.release_date) >= new Date();

const UpcomingMoviesPage = () => (
  <MediaGridPage
    endpoint="/movie/upcoming"
    heading="Upcoming Movies"
    documentTitle="Upcoming Movies"
    params={PARAMS}
    filterItem={isUnreleased}
  />
);

export default UpcomingMoviesPage;
