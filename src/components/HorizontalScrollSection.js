import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/HorizontalScrollSection.scss';

const HorizontalScrollSection = ({
  title,
  items,
  type = 'movie',
  seeAllLink,
}) => {
  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setShowLeftArrow(container.scrollLeft > 0);
    setShowRightArrow(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );
  };

  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = container.clientWidth * 0.8;
    const targetScroll =
      direction === 'left'
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: targetScroll,
      behavior: 'smooth',
    });
  };

  const getReleaseYear = (date) => (date ? date.split('-')[0] : 'TBD');

  return (
    <section className="horizontal-scroll-section">
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
        {seeAllLink && (
          <Link to={seeAllLink} className="see-all-link">
            See All
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 3L11 8L6 13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        )}
      </div>

      <div className="scroll-wrapper">
        {showLeftArrow && (
          <button
            className="scroll-arrow scroll-arrow-left"
            onClick={() => scroll('left')}
            aria-label="Scroll left"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 18L9 12L15 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}

        <div
          className="scroll-container"
          ref={scrollContainerRef}
          onScroll={handleScroll}
        >
          {items.map((item) => {
            const linkPath =
              type === 'movie' ? `/movie/${item.id}` : `/show/${item.id}`;
            const itemTitle = item.title || item.name;
            const releaseDate = item.release_date || item.first_air_date;
            const posterPath = item.poster_path
              ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
              : '/nope.png';

            return (
              <Link to={linkPath} key={item.id} className="scroll-item">
                <div className="item-poster">
                  <img src={posterPath} alt={itemTitle} loading="lazy" />
                  <div className="item-overlay">
                    <p className="overlay-title">{itemTitle}</p>
                    <p className="overlay-year">
                      {getReleaseYear(releaseDate)}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {showRightArrow && (
          <button
            className="scroll-arrow scroll-arrow-right"
            onClick={() => scroll('right')}
            aria-label="Scroll right"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 18L15 12L9 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>
    </section>
  );
};

export default HorizontalScrollSection;
