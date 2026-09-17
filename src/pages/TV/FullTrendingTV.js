import MediaGridPage from '../../components/MediaGridPage';

const TVTrendingPage = () => (
  <MediaGridPage
    endpoint="/trending/tv/week"
    heading="Trending TV"
    documentTitle="Trending TV"
    mediaType="tv"
  />
);

export default TVTrendingPage;
