import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import '../../styles/Person.scss';

const DirectorFilms = () => {
  const { directorId } = useParams();
  const [movieCredits, setMovieCredits] = useState([]);
  const [directorDetails, setDirectorDetails] = useState(null);
  const [showFullBiography, setShowFullBiography] = useState(false);
  const [sortBy, setSortBy] = useState('popularity');

  useEffect(() => {
    const apiKey = process.env.REACT_APP_API_KEY;
    const movieCreditsEndpoint = `https://api.themoviedb.org/3/person/${directorId}/movie_credits`;
    const directorDetailsEndpoint = `https://api.themoviedb.org/3/person/${directorId}`;

    axios
      .get(movieCreditsEndpoint, {
        params: {
          api_key: apiKey,
          language: 'en-US',
        },
      })
      .then((response) => {
        const directedMovies = response.data.crew.filter(
          (movie) => movie.job.toLowerCase() === 'director'
        );

        directedMovies.sort((a, b) => b.popularity - a.popularity);
        setMovieCredits(directedMovies);
      })
      .catch((error) => {
        console.error('Error fetching Director Films:', error);
      });

    axios
      .get(directorDetailsEndpoint, {
        params: {
          api_key: apiKey,
          language: 'en-US',
        },
      })
      .then((response) => {
        setDirectorDetails(response.data);
        document.title = `${response.data.name} - Director`;
      })
      .catch((error) => {
        console.error('Error fetching Director Details:', error);
      });
  }, [directorId]);

  const toggleBio = () => {
    setShowFullBiography(!showFullBiography);
  };

  const getReleaseYear = (dateString) => {
    if (dateString) {
      const dateParts = dateString.split('-');
      if (dateParts.length === 3) {
        return dateParts[0];
      }
    }
    return null;
  };

  const getAge = (dob, deathday = null) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const endDate = deathday ? new Date(deathday) : new Date();

    let age = endDate.getFullYear() - birthDate.getFullYear();
    if (
      endDate.getMonth() < birthDate.getMonth() ||
      (endDate.getMonth() === birthDate.getMonth() &&
        endDate.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(dateString));
  };

  const handleSort = (selectedOption) => {
    setSortBy(selectedOption);
    const sortedMovies = [...movieCredits];

    if (selectedOption === 'recent') {
      sortedMovies.sort((a, b) => {
        if (!a.release_date) return 1;
        if (!b.release_date) return -1;
        return new Date(b.release_date) - new Date(a.release_date);
      });
    } else if (selectedOption === 'earliest') {
      sortedMovies.sort((a, b) => {
        if (!a.release_date) return 1;
        if (!b.release_date) return -1;
        return new Date(a.release_date) - new Date(b.release_date);
      });
    } else if (selectedOption === 'popularity') {
      sortedMovies.sort((a, b) => b.popularity - a.popularity);
    }

    setMovieCredits(sortedMovies);
  };

  if (!directorDetails) {
    return (
      <div className="actor-loading">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  const bioPreview = directorDetails.biography?.substring(0, 300);
  const shouldShowReadMore = directorDetails.biography?.length > 300;

  return (
    <div className="actor-page">
      {/* Hero Section with Profile */}
      <div className="actor-hero">
        <div className="container">
          <div className="hero-content">
            <div className="profile-section">
              <div className="profile-image">
                <img
                  src={
                    directorDetails.profile_path
                      ? `https://image.tmdb.org/t/p/w500${directorDetails.profile_path}`
                      : '/sorry.png'
                  }
                  alt={directorDetails.name}
                />
              </div>
            </div>

            <div className="info-section">
              <h1 className="actor-name">{directorDetails.name}</h1>

              <div className="actor-meta">
                <div className="meta-item">
                  <span className="meta-label">Role</span>
                  <span className="meta-value">Director</span>
                </div>

                {directorDetails.birthday && (
                  <div className="meta-item">
                    <span className="meta-label">Born</span>
                    <span className="meta-value">
                      {formatDate(directorDetails.birthday)}
                      {!directorDetails.deathday && (
                        <span className="age">
                          {' '}
                          ({getAge(directorDetails.birthday)} years old)
                        </span>
                      )}
                    </span>
                  </div>
                )}

                {directorDetails.deathday && (
                  <div className="meta-item">
                    <span className="meta-label">Died</span>
                    <span className="meta-value">
                      {formatDate(directorDetails.deathday)}
                      <span className="age">
                        {' '}
                        (
                        {getAge(
                          directorDetails.birthday,
                          directorDetails.deathday
                        )}{' '}
                        years old)
                      </span>
                    </span>
                  </div>
                )}

                {directorDetails.place_of_birth && (
                  <div className="meta-item">
                    <span className="meta-label">Born in</span>
                    <span className="meta-value">
                      {directorDetails.place_of_birth}
                    </span>
                  </div>
                )}
              </div>

              {directorDetails.biography && (
                <div className="biography">
                  <p className="bio-text">
                    {showFullBiography ? directorDetails.biography : bioPreview}
                    {!showFullBiography && shouldShowReadMore && '...'}
                  </p>
                  {shouldShowReadMore && (
                    <button className="read-more-btn" onClick={toggleBio}>
                      {showFullBiography ? 'Show Less' : 'Read More'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Films Section */}
      <div className="container">
        <div className="credits-section">
          {movieCredits.length > 0 && (
            <div className="credits-content">
              <div className="content-header">
                <h2 className="content-title">Directed Films</h2>
                <div className="sort-controls">
                  <span className="sort-label">Sort by:</span>
                  <div className="sort-buttons">
                    <button
                      className={`sort-btn ${
                        sortBy === 'popularity' ? 'active' : ''
                      }`}
                      onClick={() => handleSort('popularity')}
                    >
                      Popularity
                    </button>
                    <button
                      className={`sort-btn ${
                        sortBy === 'recent' ? 'active' : ''
                      }`}
                      onClick={() => handleSort('recent')}
                    >
                      Newest
                    </button>
                    <button
                      className={`sort-btn ${
                        sortBy === 'earliest' ? 'active' : ''
                      }`}
                      onClick={() => handleSort('earliest')}
                    >
                      Earliest
                    </button>
                  </div>
                </div>
              </div>

              <div className="credits-grid">
                {movieCredits.map((movie) => (
                  <Link
                    to={`/movie/${movie.id}`}
                    key={movie.id}
                    className="credit-card"
                  >
                    <div className="card-poster">
                      <img
                        src={
                          movie.poster_path
                            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                            : '/sorry.png'
                        }
                        alt={movie.title}
                      />
                      <div className="overlay">
                        <p className="overlay-text">{movie.title}</p>
                        {movie.release_date && (
                          <p className="overlay-text">
                            {getReleaseYear(movie.release_date)}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {movieCredits.length === 0 && (
            <div className="no-credits">
              <p>No directed films available for this person.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DirectorFilms;
