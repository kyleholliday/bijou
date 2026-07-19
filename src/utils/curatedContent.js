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

  // Summer Blockbusters (June 1 - August 31)
  if (month >= 5 && month <= 7) {
    return {
      movieIds: [1339713, 1368337, 1275779],
      title: 'Summer Blockbusters',
      description: 'The biggest hits making waves this summer.',
    };
  }

  // Spring/Awards Season (February 1 - March 31)
  if (month >= 1 || month <= 2) {
    return {
      movieIds: [687163, 1368337, 1170608],
      title: 'Most Anticipated',
      description: "The movies we're looking forward to in 2026",
    };
  }

  // Default - Year Round Favorites
  return {
    movieIds: [687163, 1368337, 1170608],
    title: 'Most Anticipated',
    description: "The movies we're looking forward to in 2026",
  };
};
