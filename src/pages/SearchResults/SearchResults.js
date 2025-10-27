import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, Link } from 'react-router-dom';
import '../../styles/SearchResults.scss';

const SearchResults = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  let query = searchParams.get('query');

  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiKey = process.env.REACT_APP_API_KEY;
    const endPoint = 'https://api.themoviedb.org/3/search/multi';
    setLoading(true);

    axios
      .get(endPoint, {
        params: {
          api_key: apiKey,
          language: 'en-US',
          query: query,
        },
      })
      .then((response) => {
        // Filter out people from results
        const filteredResults = response.data.results.filter(
          (item) => item.media_type === 'movie' || item.media_type === 'tv'
        );
        setSearchResults(filteredResults);
        document.title = `Search results for: ${query}`;
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching search results:', error);
        setLoading(false);
      });
  }, [query]);

  const getReleaseYear = (dateString) => {
    if (dateString) {
      const dateParts = dateString.split('-');
      if (dateParts.length === 3) {
        return dateParts[0];
      }
    }
    return null;
  };

  if (loading) {
    return (
      <div className="search-wrapper">
        <div className="container">
          <div className="loading-state">Loading results...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="search-wrapper">
      <div className="container">
        <div className="search-header">
          <h1 className="search-title">
            {searchResults.length < 1 ? (
              <>No results for "{query}"</>
            ) : (
              <>Search results for "{query}"</>
            )}
          </h1>
          {searchResults.length > 0 && (
            <p className="search-count">
              {searchResults.length} result
              {searchResults.length !== 1 ? 's' : ''} found
            </p>
          )}
        </div>

        {searchResults.length > 0 ? (
          <div className="search-results-list">
            {searchResults.map((item) => {
              const isMovie = item.media_type === 'movie';
              const title = isMovie ? item.title : item.name;
              const releaseDate = isMovie
                ? item.release_date
                : item.first_air_date;
              const year = getReleaseYear(releaseDate);
              const link = isMovie ? `/movie/${item.id}` : `/show/${item.id}`;

              return (
                <Link to={link} key={item.id} className="search-result-item">
                  <div className="result-poster">
                    <img
                      src={
                        item.poster_path
                          ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                          : '/sorry.png'
                      }
                      alt={title}
                    />
                  </div>
                  <div className="result-content">
                    <h2 className="result-title">{title}</h2>
                    <div className="result-meta">
                      <span className="media-type-badge">
                        {isMovie ? 'Movie' : 'TV Show'}
                      </span>
                      {year && <span className="result-year">{year}</span>}
                    </div>
                    {item.overview && (
                      <p className="result-overview">{item.overview}</p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="no-results">
            <p>Try adjusting your search terms or checking for typos.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
