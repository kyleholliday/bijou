import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/SecondaryPages.scss';

const TVTrendingPage = () => {
  const [shows, setShows] = useState([]);

  useEffect(() => {
    const apiKey = process.env.REACT_APP_API_KEY;
    const endpoint = `https://api.themoviedb.org/3/trending/tv/week`;

    axios
      .get(endpoint, {
        params: {
          api_key: apiKey,
          language: 'en-US',
          region: 'US',
        },
      })
      .then((response) => {
        setShows(response.data.results);
        document.title = 'Trending TV';
      })
      .catch((error) => {
        console.error('Error fetching Trending TV shows:', error);
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
        <h3 className="heading">Trending TV</h3>
        <ul className="movie-list full-list-movies">
          {shows.map((show) => (
            <li key={show.id} className="movie">
              <a href={`/show/${show.id}`}>
                <img
                  src={
                    show.poster_path
                      ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
                      : '/nope.png'
                  }
                  alt={show.name}
                />
                <div className="overlay">
                  <p className="overlay-text">{show.name}</p>
                  <p className="overlay-text">
                    {getReleaseYear(show.first_air_date)}
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

export default TVTrendingPage;
