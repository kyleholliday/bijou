import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TrendingTV = () => {
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
      })
      .catch((error) => {
        console.error('Error fetching the Trending TV Shows:', error);
      });
  }, []);

  const firstTwelve = shows.slice(0, 12);

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
      <div className="heading-container">
        <h3 className="heading">Trending TV</h3>
      </div>
      <ul className="movie-list">
        {firstTwelve.map((show) => (
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
      <a href="/tv-trending" className="see-more">
        See More
      </a>
    </div>
  );
};

export default TrendingTV;
