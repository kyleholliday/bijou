import { AuthProvider } from './contexts/AuthContext';
import Auth from './components/Auth';
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
import Favorites from './pages/Favorites/Favorites';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Navbar />
        <div className="main">
          <ScrollToTop />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/movie/:movieId" element={<MovieDetail />} />
            <Route path="/show/:tvId" element={<TVDetail />} />
            <Route path="/actor/:personId" element={<Person />} />
            <Route path="/director/:personId" element={<Person />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/now-playing" element={<FullNowPlaying />} />
            <Route path="/upcoming" element={<FullUpcoming />} />
            <Route path="/tv-trending" element={<TVTrendingPage />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route
              path="/season/:tvId/:seasonNumber"
              element={<SeasonDetail />}
            />
            <Route
              path="/season/:tvId/:seasonNumber/:episodeNumber"
              element={<EpisodeDetail />}
            />
          </Routes>
        </div>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;
