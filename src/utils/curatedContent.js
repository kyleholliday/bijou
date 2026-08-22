// Candidate pool for the dynamic "Most Anticipated" list. Anything in here
// that hasn't released yet (per TMDB's US release date, same check used for
// the "Coming Soon" label on the movie detail page) is eligible to show —
// three are picked at random on each load. Add new movie IDs here as you
// hear about them; once a movie releases it drops out of the pool
// automatically, no cleanup needed.
const ANTICIPATED_POOL = [
  1204680, // Coyote vs. Acme
  1170608, // Dune: Part Three
  1003596, // Avengers: Doomsday
  1248832, // Digger
  1423191, // Resident Evil
  1421903, // Werwulf
];

// Shown instead of the pool above if fewer than 3 candidates are still
// unreleased (e.g. the pool has gone stale and needs new IDs added).
const ANTICIPATED_FALLBACK = [687163, 1170608];

export const getCuratedContent = () => {
  const now = new Date();
  const month = now.getMonth(); // 0-11
  const day = now.getDate();

  // Halloween (October 1 - November 10)
  if (month === 9 || (month === 10 && day <= 10)) {
    return {
      movieIds: [575776, 913290, 1008042],
      title: 'Spooky Season Picks',
      description: 'Get in the Halloween spirit with these chilling favorites.',
    };
  }

  // Holiday Season (November 15 - December 31)
  if ((month === 10 && day >= 24) || month === 11) {
    return {
      movieIds: [850, 771, 840430],
      title: 'Holiday Classics',
      description:
        'Pour up some hot cocoa, toss another log on the fire, and cozy up with these heartwarming holiday favorites.',
    };
  }

  // Default (also covers Spring/Awards Season) — Most Anticipated, three
  // random unreleased picks from ANTICIPATED_POOL. See CuratedPicks.js for
  // the fetch/filter/randomize logic.
  return {
    moviePool: ANTICIPATED_POOL,
    fallbackMovieIds: ANTICIPATED_FALLBACK,
    title: 'Most Anticipated',
    description:
      "We've had a great year for movies, but we still have a few more we're looking forward to.",
  };
};
