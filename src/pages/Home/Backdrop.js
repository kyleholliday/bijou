import React from 'react';
import '../../styles/Backdrop.scss';

const HeroBackdrop = () => {
  return (
    <section className="hero-section">
      <div className="hero-container">
        <h1 className="hero-title">The movies and TV that you want to see.</h1>
        <p className="hero-description">
          Explore thousands of movies and television shows. Find what's playing
          now,
          <br className="hide-mobile" />
          what's coming soon, and what's trending.
        </p>
        <div className="hero-actions">
          <a href="/now-playing" className="btn-primary">
            Browse Now Playing
          </a>
          <a href="/tv-trending" className="btn-secondary">
            Explore Trending TV
          </a>
        </div>
      </div>
    </section>
  );
};

export default HeroBackdrop;
