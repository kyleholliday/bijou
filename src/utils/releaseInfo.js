// Shared logic for determining a movie's real-world US release status.
// Used on the movie detail page (the "Coming Soon" label) and by the
// curated "Most Anticipated" list (utils/curatedContent.js) to decide
// which movies haven't released yet.
//
// Expects a movie object fetched with `append_to_response=release_dates`.
export const getUsReleaseInfo = (movie) => {
  // default return for when release_dates data can't be found
  const defaultReturn = {
    isUpcoming: false,
    releaseDate: movie?.release_date || null,
  };

  if (!movie?.release_dates?.results) return defaultReturn;

  const usRelease = movie.release_dates.results.find(
    (r) => r.iso_3166_1 === 'US',
  );

  if (!usRelease?.release_dates) return defaultReturn;

  // priority: wide theatrical (3) > limited theatrical (2) > digital (4)
  let targetRelease = usRelease.release_dates.find((d) => d.type === 3);
  if (!targetRelease) {
    targetRelease = usRelease.release_dates.find((d) => d.type === 2);
  }
  if (!targetRelease) {
    targetRelease = usRelease.release_dates.find((d) => d.type === 4);
  }

  if (!targetRelease?.release_date) return defaultReturn;

  const today = new Date();
  const releaseDate = new Date(targetRelease.release_date);

  // time's set to midnight for comparison b/t the two dates
  today.setHours(0, 0, 0, 0);
  releaseDate.setHours(0, 0, 0, 0);

  return {
    isUpcoming: releaseDate > today,
    releaseDate: targetRelease.release_date.split('T')[0],
  };
};
