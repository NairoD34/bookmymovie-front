import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const MovieList = ({ movies, onError }) => {
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Simplified filtering logic
  useEffect(() => {
    let result = movies;
    
    // Clean search filtering
    if (searchTerm && searchTerm.length > 2) {
      result = result.filter(movie => 
        movie.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movie.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      result = result.filter(movie => movie.category === selectedCategory);
    }

    setFilteredMovies(result);
  }, [movies, searchTerm, selectedCategory]);

  // Unified rating display function
  const formatRating = (rating) => {
    const stars = Math.min(5, Math.max(1, Math.ceil(rating / 2)));
    return '⭐'.repeat(stars);
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
          <option value="sci-fi">Sci-Fi</option>

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
