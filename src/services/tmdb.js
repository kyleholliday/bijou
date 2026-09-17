import axios from 'axios';

export const tmdb = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  params: {
    api_key: process.env.REACT_APP_API_KEY,
    language: 'en-US',
  },
});
