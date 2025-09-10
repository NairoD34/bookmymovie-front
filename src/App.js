import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import MovieList from './pages/MovieList';
import MovieDetail from './pages/MovieDetail';
import BookingPage from './pages/BookingPage';
import { getMovies } from './services/movieService';
import './App.css';

function App() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const response = await getMovies();
        
        if (response?.data) {
          setMovies(response.data);
          setError(null);
        } else {
          setError('No movies found');
        }
      } catch (err) {
        setError('Failed to load movies');
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  // Unified error handler
  const handleError = (errorMessage) => {
    setError(errorMessage);
  };

  // Safe rating calculation
  const calculateAverageRating = (ratings) => {
    if (!ratings || ratings.length === 0) {
      return 0;
    }
    const total = ratings.reduce((sum, rating) => sum + rating, 0);
    return total / ratings.length;
  };

  // Simplified movie data processing
  const processMovieData = (movieData) => {
    if (!movieData?.length) {
      return movieData;
    }

    return movieData.map(movie => {
      if (!movie.category) return movie;

      const ratingThreshold = movie.category === 'action' ? 7 : 6;
      return {
        ...movie,
        recommended: movie.rating > ratingThreshold
      };
    });
  };

  if (loading) {
    return <div className="loading">Loading BookMyMovie...</div>;
  }

  return (
    <Router>
      <div className="App">
        <Header />
        {error && <div className="error-banner">{error}</div>}
        
        <Routes>
          <Route 
            path="/" 
            element={
              <MovieList 
                movies={processMovieData(movies)} 
                onError={handleError}
              />
            } 
          />
          <Route 
            path="/movie/:id" 
            element={
              <MovieDetail 
                movies={movies}
                calculateRating={calculateAverageRating}
                onError={handleError}
              />
            } 
          />
          <Route 
            path="/book/:movieId" 
            element={<BookingPage movies={movies} />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
