// ScrollToTop.js
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Use setTimeout to ensure it runs after React finishes rendering
    const scrollTimeout = setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant', // 'instant' instead of 'smooth' for immediate scroll
      });
    }, 0);

    return () => clearTimeout(scrollTimeout);
  }, [pathname, search]); // Also watch for search/query param changes

  return null;
};

export default ScrollToTop;
