// GenreQuickLinks.js
import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/GenreQuickLinks.scss';

const GenreQuickLinks = () => {
  const scrollRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const genres = [
    { id: 28, name: 'Action', icon: '💥' },
    { id: 12, name: 'Adventure', icon: '🗺️' },
    { id: 16, name: 'Animation', icon: '🎨' },
    { id: 35, name: 'Comedy', icon: '😂' },
    { id: 80, name: 'Crime', icon: '🔫' },
    { id: 99, name: 'Documentary', icon: '🎬' },
    { id: 18, name: 'Drama', icon: '🎭' },
    { id: 14, name: 'Fantasy', icon: '🧙' },
    { id: 27, name: 'Horror', icon: '👻' },
    { id: 10402, name: 'Music', icon: '🎵' },
    { id: 9648, name: 'Mystery', icon: '🔍' },
    { id: 10749, name: 'Romance', icon: '💕' },
    { id: 878, name: 'Sci-Fi', icon: '🚀' },
    { id: 53, name: 'Thriller', icon: '😱' },
    { id: 10752, name: 'War', icon: '⚔️' },
    { id: 37, name: 'Western', icon: '🤠' },
  ];

  const handleScroll = () => {
    const container = scrollRef.current;
    if (!container) return;

    setShowLeftArrow(container.scrollLeft > 10);
    setShowRightArrow(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );
  };

  const scroll = (direction) => {
    const container = scrollRef.current;
    if (!container) return;

    const scrollAmount = 400;
    const targetScroll =
      direction === 'left'
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: targetScroll,
      behavior: 'smooth',
    });
  };

  return (
    <section className="genre-quick-links">
      <div className="genre-container">
        <h2 className="genre-title">Browse by Genre</h2>

        <div className="genre-scroll-wrapper">
          {showLeftArrow && (
            <button
              className="genre-arrow genre-arrow-left"
              onClick={() => scroll('left')}
              aria-label="Scroll left"
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
            </button>
          )}

          <div className="genre-scroll" ref={scrollRef} onScroll={handleScroll}>
            {genres.map((genre) => (
              <Link
                key={genre.id}
                to={`/genre/${genre.id}`}
                className="genre-pill"
              >
                <span className="genre-icon">{genre.icon}</span>
                <span className="genre-name">{genre.name}</span>
              </Link>
            ))}
          </div>

          {showRightArrow && (
            <button
              className="genre-arrow genre-arrow-right"
              onClick={() => scroll('right')}
              aria-label="Scroll right"
            >
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
          )}
        </div>
      </div>
    </section>
  );
};

export default GenreQuickLinks;
