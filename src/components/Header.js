import React from 'react';
import { Link } from 'react-router-dom';

// Clean header component
const Header = () => {
  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">
          <h1>🎬 BookMyMovie</h1>
        </Link>
        
        <nav className="navigation">
          <Link to="/" className="nav-link">Movies</Link>
          <Link to="/favorites" className="nav-link">Favorites</Link>
          <Link to="/profile" className="nav-link">Profile</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
