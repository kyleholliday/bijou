import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/SecondaryPages.scss';

const NowPlayingMoviesPage = () => {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    const apiKey = process.env.REACT_APP_API_KEY;
    const endpoint = `https://api.themoviedb.org/3/movie/now_playing`;

    axios
      .get(endpoint, {
        params: {
          api_key: apiKey,
          language: 'en-US',
          region: 'US',
        },
      })
      .then((response) => {
        setMovies(response.data.results);
        document.title = 'Now Playing Movies';
      })
      .catch((error) => {
        console.error('Error fetching the Now Playing movies:', error);
      });
  }, []);

  const getReleaseYear = (dateString) => {
    if (dateString) {
      const dateParts = dateString.split('-');
      if (dateParts.length === 3) {
        return dateParts[0];
      }
    }
    return 'Release TBD';
  };

  return (
    <div className="container">
      <div className="full-list">
        <h3 className="heading">Now Playing</h3>
        <ul className="movie-list full-list-movies">
          {movies.map((movie) => (
            <li key={movie.id} className="movie">
              <a href={`/movie/${movie.id}`}>
                <img
                  src={
                    movie.poster_path
                      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                      : '/nope.png'
                  }
                  alt={movie.title}
                />
                <div className="overlay">
                  <p className="overlay-text">{movie.title}</p>
                  <p className="overlay-text">
                    {getReleaseYear(movie.release_date)}
                  </p>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default NowPlayingMoviesPage;
