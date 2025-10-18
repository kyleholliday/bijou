import React from 'react';
import './App.scss';
import NowPlayingMovies from './pages/Home/NowPlayingMovies';
import MovieDetail from './pages/Movie/MovieDetail';
import { Route, Routes } from 'react-router-dom';
import UpcomingMovies from './pages/Home/UpcomingMovies';
import Navbar from './components/Navbar';
import SearchResults from './pages/SearchResults/SearchResults';
import FullNowPlaying from './pages/NowPlaying/FullNowPlaying';
import FullUpcoming from './pages/Upcoming/FullUpcoming';
import DirectorFilms from './pages/Person/DirectorFilms';
import TrendingTV from './pages/Home/TrendingTV';
import TVDetail from './pages/TV/TVDetail';
import TVTrendingPage from './pages/TV/FullTrendingTV';
import Actor from './pages/Person/Actor';
import Backdrop from './pages/Home/Backdrop';
import Footer from './components/Footer';
import './styles/Variables.scss';
// import TopGenres from './pages/Home/Genres';

document.title = 'Bijou';

function App() {
  return (
    <div className="App">
      <Navbar />
      <div className="main">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Backdrop />
                {/* <TopGenres /> */}
                <NowPlayingMovies />
                <UpcomingMovies />
                <TrendingTV />
              </>
            }
          />
          <Route path="/movie/:movieId" element={<MovieDetail />} />
          <Route path="/show/:tvId" element={<TVDetail />} />
          <Route
            path="/director-films/:directorId"
            element={<DirectorFilms />}
          />
          <Route path="/actor/:actorId" element={<Actor />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/now-playing" element={<FullNowPlaying />} />
          <Route path="/upcoming" element={<FullUpcoming />} />
          <Route path="/tv-trending" element={<TVTrendingPage />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;
