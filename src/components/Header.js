import React from 'react';
import { Link } from 'react-router-dom';

// Composant avec variables inutilisées (code smell)
const Header = () => {
  const unusedVariable = "This variable is never used";
  const anotherUnusedVar = 42;
  
  // Fonction jamais appelée
  const handleUnusedFunction = () => {
    console.log("This function is never called");
  };

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
