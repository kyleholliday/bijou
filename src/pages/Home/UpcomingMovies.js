import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UpcomingMovies = () => {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    const apiKey = process.env.REACT_APP_API_KEY;
    const today = new Date().toISOString().split('T')[0];
    const endpoint = `https://api.themoviedb.org/3/movie/upcoming?primary_release_date.gte=${today}`;

    axios
      .get(endpoint, {
        params: {
          api_key: apiKey,
          language: 'en-US',
          region: 'US',
        },
      })
      .then((response) => {
        const today = new Date();
        const filtered = response.data.results.filter((movie) => {
          const release = new Date(movie.release_date);
          return release >= today;
        });
        setMovies(filtered);
      })
      .catch((error) => {
        console.error('Error fetching the Upcoming movies:', error);
      });
  }, []);

  const firstTwelve = movies.slice(0, 12);

  return (
    <div className="container">
      <div className="heading-container">
        <h3 className="heading">Upcoming</h3>
      </div>
      <ul className="movie-list">
        {firstTwelve.map((movie) => (
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
              </div>
            </a>
          </li>
        ))}
      </ul>
      <a href="/upcoming" className="see-more">
        See More
      </a>
      <div className="border-bottom-mobile"></div>
    </div>
  );
};

export default UpcomingMovies;
