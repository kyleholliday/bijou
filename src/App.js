import './App.scss';
import Home from './pages/Home/Home';
import ScrollToTop from './components/ScrollToTop';
import MovieDetail from './pages/Movie/MovieDetail';
import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import SearchResults from './pages/SearchResults/SearchResults';
import FullNowPlaying from './pages/NowPlaying/FullNowPlaying';
import FullUpcoming from './pages/Upcoming/FullUpcoming';
import TVDetail from './pages/TV/TVDetail';
import TVTrendingPage from './pages/TV/FullTrendingTV';
import Person from './pages/Person/Person';
import Footer from './components/Footer';
import './styles/Variables.scss';
import SeasonDetail from './pages/TV/SeasonDetail';
import EpisodeDetail from './pages/TV/EpisodeDetail';

function App() {
  return (
    <div className="App">
      <Navbar />
      <ScrollToTop />
      <div className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movie/:movieId" element={<MovieDetail />} />
          <Route path="/show/:tvId" element={<TVDetail />} />
          <Route path="/actor/:personId" element={<Person />} />
          <Route path="/director/:personId" element={<Person />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/now-playing" element={<FullNowPlaying />} />
          <Route path="/upcoming" element={<FullUpcoming />} />
          <Route path="/tv-trending" element={<TVTrendingPage />} />
          <Route
            path="/season/:tvId/:seasonNumber"
            element={<SeasonDetail />}
          ></Route>
          <Route
            path="/season/:tvId/:seasonNumber/:episodeNumber"
            element={<EpisodeDetail />}
          ></Route>
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;
