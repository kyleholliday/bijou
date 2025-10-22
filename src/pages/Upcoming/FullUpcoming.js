import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../../styles/SecondaryPages.scss';

const UpcomingMoviesPage = () => {
  const [movies, setMovies] = useState([]);
  const [allMovies, setAllMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const moviesPerPage = 18;

  // Fetch all upcoming movies once
  useEffect(() => {
    const fetchAllUpcoming = async () => {
      setLoading(true);
      const apiKey = process.env.REACT_APP_API_KEY;
      const today = new Date();

      try {
        // Fetch multiple pages to get enough upcoming movies
        const requests = [];
        for (let page = 1; page <= 5; page++) {
          requests.push(
            axios.get('https://api.themoviedb.org/3/movie/upcoming', {
              params: {
                api_key: apiKey,
                language: 'en-US',
                region: 'US',
                page: page,
              },
            })
          );
        }

        const responses = await Promise.all(requests);
        const allResults = responses.flatMap((res) => res.data.results);

        // Filter to only include movies with future release dates
        const filtered = allResults.filter((movie) => {
          const release = new Date(movie.release_date);
          return release >= today;
        });

        // Remove duplicates (if any)
        const uniqueMovies = Array.from(
          new Map(filtered.map((movie) => [movie.id, movie])).values()
        );

        setAllMovies(uniqueMovies);
        setTotalPages(Math.ceil(uniqueMovies.length / moviesPerPage));
        document.title = 'Upcoming Movies';
        setLoading(false);
      } catch (error) {
        console.error('Error fetching Upcoming movies:', error);
        setLoading(false);
      }
    };

    fetchAllUpcoming();
  }, []);

  // Update displayed movies when page changes
  useEffect(() => {
    window.scrollTo(0, 0);
    const startIndex = (currentPage - 1) * moviesPerPage;
    const endIndex = startIndex + moviesPerPage;
    setMovies(allMovies.slice(startIndex, endIndex));
  }, [currentPage, allMovies]);

  const getReleaseYear = (dateString) => {
    if (dateString) {
      const dateParts = dateString.split('-');
      if (dateParts.length === 3) {
        return dateParts[0];
      }
    }
    return 'TBD';
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (loading) {
    return (
      <div className="modern-page">
        <div className="loading-container">
          <div className="loading-spinner">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-page">
      <div className="page-header">
        <h1 className="page-title">Upcoming Movies</h1>
        <p className="page-subtitle">
          {allMovies.length} movies • Page {currentPage} of {totalPages}
        </p>
      </div>

      <motion.div
        className="movies-grid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {movies.map((movie, index) => (
          <motion.div
            key={movie.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.02 }}
          >
            <Link to={`/movie/${movie.id}`} className="movie-card">
              <div className="movie-poster">
                <img
                  src={
                    movie.poster_path
                      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                      : '/nope.png'
                  }
                  alt={movie.title}
                  loading="lazy"
                />
                <div className="movie-overlay">
                  <p className="movie-title">{movie.title}</p>
                  <p className="movie-year">
                    {getReleaseYear(movie.release_date)}
                  </p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M12 15L7 10L12 5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Previous
          </button>

          <div className="pagination-numbers">
            {getPageNumbers().map((page, index) =>
              page === '...' ? (
                <span key={`ellipsis-${index}`} className="pagination-ellipsis">
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  className={`pagination-number ${
                    currentPage === page ? 'active' : ''
                  }`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              )
            )}
          </div>

          <button
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M8 15L13 10L8 5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default UpcomingMoviesPage;
