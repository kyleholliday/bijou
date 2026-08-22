// Returns a random sample of `count` unique items from `array`, without
// mutating the original array.
export const pickRandom = (array, count) => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
