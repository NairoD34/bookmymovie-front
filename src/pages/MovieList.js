import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const MovieList = ({ movies, onError }) => {
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Logique de filtrage complexe avec des conditions imbriquées
  useEffect(() => {
    let result = movies;
    
    // Code avec beaucoup de conditions imbriquées (complexité cognitive)
    if (searchTerm) {
      if (searchTerm.length > 2) {
        result = result.filter(movie => {
          if (movie.title) {
            if (movie.title.toLowerCase().includes(searchTerm.toLowerCase())) {
              return true;
            } else if (movie.description) {
              if (movie.description.toLowerCase().includes(searchTerm.toLowerCase())) {
                return true;
              } else {
                return false;
              }
            } else {
              return false;
            }
          } else {
            return false;
          }
        });
      }
    }

    if (selectedCategory !== 'all') {
      result = result.filter(movie => movie.category === selectedCategory);
    }

    setFilteredMovies(result);
  }, [movies, searchTerm, selectedCategory]);

  // Fonction avec paramètres inutilisés
  const handleMovieClick = (movieId, unusedParam, anotherUnused) => {
    // Bug potentiel : pas de vérification de movieId
    window.location.href = `/movie/${movieId}`;
  };

  // Code dupliqué
  const formatRating = (rating) => {
    if (rating >= 9) return '⭐⭐⭐⭐⭐';
    if (rating >= 7) return '⭐⭐⭐⭐';
    if (rating >= 5) return '⭐⭐⭐';
    if (rating >= 3) return '⭐⭐';
    return '⭐';
  };

  // Fonction similaire (duplication)
  const displayStars = (rating) => {
    if (rating >= 9) return '⭐⭐⭐⭐⭐';
    if (rating >= 7) return '⭐⭐⭐⭐';
    if (rating >= 5) return '⭐⭐⭐';
    if (rating >= 3) return '⭐⭐';
    return '⭐';
  };

  return (
    <div className="movie-list">
      <div className="filters">
        <input
          type="text"
          placeholder="Search movies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="category-select"
        >
          <option value="all">All Categories</option>
          <option value="action">Action</option>
          <option value="comedy">Comedy</option>
          <option value="drama">Drama</option>
          <option value="horror">Horror</option>
        </select>
      </div>

      <div className="movies-grid">
        {filteredMovies.length > 0 ? (
          filteredMovies.map(movie => (
            <div key={movie.id} className="movie-card">
              <img 
                src={movie.poster || '/placeholder.jpg'} 
                alt={movie.title}
                className="movie-poster"
              />
              <div className="movie-info">
                <h3>{movie.title}</h3>
                <p className="movie-category">{movie.category}</p>
                <div className="movie-rating">
                  {formatRating(movie.rating)}
                  <span className="rating-number">({movie.rating}/10)</span>
                </div>
                <p className="movie-description">
                  {movie.description?.substring(0, 100)}...
                </p>
                <div className="movie-actions">
                  <Link to={`/movie/${movie.id}`} className="btn btn-primary">
                    View Details
                  </Link>
                  <Link to={`/book/${movie.id}`} className="btn btn-secondary">
                    Book Now
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-movies">
            <p>No movies found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieList;
