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

  // Code smell volontaire : fonction trop complexe
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const response = await getMovies();
        if (response && response.data) {
          setMovies(response.data);
          setError(null);
        } else {
          setError('No movies found');
        }
      } catch (err) {
        console.error('Error fetching movies:', err); // Console.log en production
        setError('Failed to load movies');
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  // Fonction dupliquée volontairement (code smell)
  const handleError = (errorMessage) => {
    console.error('Error occurred:', errorMessage);
    setError(errorMessage);
  };

  // Autre fonction similaire (duplication)
  const logError = (errorMessage) => {
    console.error('Error occurred:', errorMessage);
    setError(errorMessage);
  };

  // Bug volontaire : division par zéro possible
  const calculateAverageRating = (ratings) => {
    const total = ratings.reduce((sum, rating) => sum + rating, 0);
    return total / ratings.length; // Division par zéro si ratings est vide
  };

  // Complexité cognitive élevée
  const processMovieData = (movieData) => {
    if (movieData) {
      if (movieData.length > 0) {
        for (let i = 0; i < movieData.length; i++) {
          if (movieData[i].category) {
            if (movieData[i].category === 'action') {
              if (movieData[i].rating > 7) {
                movieData[i].recommended = true;
              } else {
                movieData[i].recommended = false;
              }
            } else if (movieData[i].category === 'comedy') {
              if (movieData[i].rating > 6) {
                movieData[i].recommended = true;
              } else {
                movieData[i].recommended = false;
              }
            }
          }
        }
      }
    }
    return movieData;
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
                onError={logError}
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
