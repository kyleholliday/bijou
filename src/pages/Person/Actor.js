import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import '../../styles/SecondaryPages.scss';
import '../../styles/Person.scss';

const ActorDetails = () => {
  const { actorId } = useParams();
  const [actorData, setActorData] = useState(null);
  const [showFullBiography, setShowFullBiography] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const apiKey = process.env.REACT_APP_API_KEY;
    const combinedCreditsUrl = `https://api.themoviedb.org/3/person/${actorId}/combined_credits`;
    const detailsUrl = `https://api.themoviedb.org/3/person/${actorId}`;
    window.scrollTo(0, 0);

    // Fetch combined credits for Movies + TV
    axios
      .get(combinedCreditsUrl, {
        params: {
          api_key: apiKey,
          language: 'en-US',
        },
      })
      .then((response) => {
        const credits = response.data.cast;

        const uniqueCredits = new Set(); // Use a Set to keep track of unique credits
        const movieCredits = [];
        const tvCredits = [];

        credits.forEach((credit) => {
          if (
            !credit.character.toLowerCase().includes('presenter') &&
            credit.character.trim() !== '' &&
            !uniqueCredits.has(credit.id) &&
            (!credit.genre_ids ||
              (!credit.genre_ids.includes(10767) &&
                !credit.genre_ids.includes(10763)))
          ) {
            uniqueCredits.add(credit.id);

            if (credit.media_type === 'movie' && credit.adult === false) {
              movieCredits.push(credit);
            } else if (credit.media_type === 'tv' && credit.adult === false) {
              tvCredits.push(credit);
            }
          }
        });

        movieCredits.sort((a, b) => b.popularity - a.popularity);
        tvCredits.sort((a, b) => b.popularity - a.popularity);

        axios
          .get(detailsUrl, {
            params: {
              api_key: apiKey,
              language: 'en-US',
            },
          })
          .then((detailsResponse) => {
            // Combine actor details with movie and TV credits
            const actorDetails = detailsResponse.data;

            setActorData({
              actorDetails,
              movieCredits,
              tvCredits,
            });
            document.title = `${actorDetails.name} - Movies and TV`;
          })
          .catch((detailsError) => {
            console.error('Error fetching actor details:', detailsError);
          });
      })
      .catch((creditsError) => {
        console.error('Error fetching actor credits:', creditsError);
      });
    function handleResize() {
      setIsSmallScreen(window.innerWidth < 768); // Adjust the threshold as needed
    }

    // Initial check
    handleResize();

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [actorId]);

  // Show full biography toggle
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
    return 'Release TBD';
  };

  // Movie Sort
  const sortByMostRecent = () => {
    const sortedMovies = [...actorData.movieCredits].sort((a, b) => {
      if (!a.release_date) return 1;
      if (!b.release_date) return -1;
      return b.release_date.localeCompare(a.release_date);
    });
    setActorData((prevData) => ({
      ...prevData,
      movieCredits: sortedMovies,
    }));
  };

  const sortByLeastRecent = () => {
    const sortedMovies = [...actorData.movieCredits].sort((a, b) => {
      if (!a.release_date) return 1;
      if (!b.release_date) return -1;
      return a.release_date.localeCompare(b.release_date);
    });
    setActorData((prevData) => ({
      ...prevData,
      movieCredits: sortedMovies,
    }));
  };

  const sortByPopularity = () => {
    const sortedMovies = [...actorData.movieCredits].sort((a, b) =>
      a.popularity < b.popularity ? 1 : -1
    );
    setActorData((prevData) => ({
      ...prevData,
      movieCredits: sortedMovies,
    }));
  };

  const handleSortChange = (selectedValue) => {
    switch (selectedValue) {
      case 'recent':
        sortByMostRecent();
        break;
      case 'leastRecent':
        sortByLeastRecent();
        break;
      case 'popularity':
        sortByPopularity();
        break;
      default:
        break;
    }
  };

  const sortMostRecentTV = () => {
    const sortedTV = [...actorData.tvCredits].sort((a, b) => {
      if (!a.first_air_date) return 1;
      if (!b.first_air_date) return -1;
      return b.first_air_date.localeCompare(a.first_air_date);
    });
    setActorData((prevData) => ({
      ...prevData,
      tvCredits: sortedTV,
    }));
  };

  const sortLeastRecentTV = () => {
    const sortedTV = [...actorData.tvCredits].sort((a, b) => {
      if (!a.first_air_date) return 1;
      if (!b.first_air_date) return -1;
      return a.first_air_date.localeCompare(b.first_air_date);
    });
    setActorData((prevData) => ({
      ...prevData,
      tvCredits: sortedTV,
    }));
  };

  const sortTVByPopularity = () => {
    const sortedTV = [...actorData.tvCredits].sort((a, b) =>
      a.popularity < b.popularity ? 1 : -1
    );
    setActorData((prevData) => ({
      ...prevData,
      tvCredits: sortedTV,
    }));
  };

  const handleSortChangeTV = (selectedValueTV) => {
    switch (selectedValueTV) {
      case 'recentTV':
        sortMostRecentTV();
        break;
      case 'leastRecentTV':
        sortLeastRecentTV();
        break;
      case 'popularityTV':
        sortTVByPopularity();
        break;
      default:
        break;
    }
  };

  // Render the actor details
  if (!actorData) {
    return <div>Loading...</div>;
  }

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

  console.log(actorData);

  return (
    <div className="container">
      <div className="person-info row">
        <div className="full-list order-2 order-sm-1 col-sm-9 left-side">
          {actorData.movieCredits.length > 0 && (
            <>
              <h1 className="d-none d-sm-block">
                <span>Films Starring</span> {actorData.actorDetails.name}
              </h1>
              <div className="films-and-sort">
                <p>{actorData.movieCredits.length} Films</p>
                <div className="sorting-dropdown">
                  <label htmlFor="sort-select-films">Sort by: </label>
                  <select
                    id="sort-select-films"
                    onChange={(e) => handleSortChange(e.target.value)}
                  >
                    <option value="popularity">Popularity</option>
                    <option value="recent">Newest First</option>
                    <option value="leastRecent">Earliest First</option>
                  </select>
                </div>
              </div>

              <ul className="movie-list crew">
                {actorData.movieCredits.map((movie) => (
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
            </>
          )}
          {actorData.tvCredits.length > 0 && (
            <>
              <h1 className="d-none d-sm-block tv">
                <span>TV Starring</span> {actorData.actorDetails.name}
              </h1>
              <div className="films-and-sort">
                <p>{actorData.tvCredits.length} TV Shows</p>
                <div className="sorting-dropdown">
                  <label htmlFor="sort-select-tv">Sort by: </label>
                  <select
                    id="sort-select-tv"
                    onChange={(e) => handleSortChangeTV(e.target.value)}
                  >
                    <option value="popularityTV">Popularity</option>
                    <option value="recentTV">Newest First</option>
                    <option value="leastRecentTV">Earliest First</option>
                  </select>
                </div>
              </div>
              <ul className="movie-list crew">
                {actorData.tvCredits.map((show) => (
                  <li key={show.id} className="movie">
                    <a href={`/show/${show.id}`}>
                      <img
                        src={
                          show.poster_path
                            ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
                            : '/nope.png'
                        }
                        alt={show.title}
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
            </>
          )}
          {actorData.tvCredits.length < 1 && actorData.movieCredits < 1 && (
            <p>
              Actor has not appeared in any movie or TV that has currently been
              released
            </p>
          )}
        </div>
        <div className="col-sm-3 order-1 order-sm-2 right-side">
          <div className="row">
            <h1 className="d-block d-sm-none">{actorData.actorDetails.name}</h1>
            <div className="col-4 col-sm-12">
              <img
                src={
                  actorData.actorDetails.profile_path
                    ? `https://image.tmdb.org/t/p/w500${actorData.actorDetails.profile_path}`
                    : '/nope.png'
                }
                alt={actorData.actorDetails.name}
                className="img-fluid"
              />
            </div>
            <div className="col-8 col-sm-12">
              <div className="text-holder">
                <p>
                  {actorData.actorDetails.birthday &&
                    !actorData.actorDetails.deathday && (
                      <>
                        Born: {formatDate(actorData.actorDetails.birthday)}
                        <br></br>({getAge(actorData.actorDetails.birthday)}{' '}
                        years old)
                      </>
                    )}

                  {actorData.actorDetails.birthday &&
                    actorData.actorDetails.deathday && (
                      <>
                        Born: {formatDate(actorData.actorDetails.birthday)}{' '}
                        <br></br>
                        Died: {formatDate(actorData.actorDetails.deathday)}
                        <br></br>(
                        {getAge(
                          actorData.actorDetails.birthday,
                          actorData.actorDetails.deathday
                        )}{' '}
                        years old)
                      </>
                    )}
                </p>
                <p>
                  {actorData.actorDetails.biography &&
                    isSmallScreen === false &&
                    (showFullBiography
                      ? actorData.actorDetails.biography
                      : actorData.actorDetails.biography.length > 1000
                      ? actorData.actorDetails.biography.substring(0, 1000) +
                        '...'
                      : actorData.actorDetails.biography)}
                  {actorData.actorDetails.biography &&
                    isSmallScreen &&
                    (showFullBiography
                      ? actorData.actorDetails.biography
                      : actorData.actorDetails.biography.length > 140
                      ? actorData.actorDetails.biography.substring(0, 140) +
                        '...'
                      : actorData.actorDetails.biography)}
                  {actorData.actorDetails.biography &&
                    actorData.actorDetails.biography.length > 1000 &&
                    isSmallScreen === false && (
                      <button className="view-more" onClick={toggleBio}>
                        {showFullBiography ? 'View Less' : 'View More'}
                      </button>
                    )}
                  {actorData.actorDetails.biography &&
                    actorData.actorDetails.biography.length > 140 &&
                    isSmallScreen && (
                      <button className="view-more" onClick={toggleBio}>
                        {showFullBiography ? 'View Less' : 'View More'}
                      </button>
                    )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActorDetails;
