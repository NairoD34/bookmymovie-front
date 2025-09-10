import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>BookMyMovie</h1>
        <p>Votre plateforme de réservation de films</p>
      </header>
      
      <main className="container">
        <section className="movie-grid">
          <div className="movie-card">
            <h3>Avengers: Endgame</h3>
            <p>Le film d'action le plus attendu de l'année</p>
            <button className="btn btn-primary">Réserver</button>
          </div>
          
          <div className="movie-card">
            <h3>The Dark Knight</h3>
            <p>Un classique du cinéma de super-héros</p>
            <button className="btn btn-primary">Réserver</button>
          </div>
          
          <div className="movie-card">
            <h3>Inception</h3>
            <p>Un thriller psychologique captivant</p>
            <button className="btn btn-primary">Réserver</button>
          </div>
        </section>
        
        <footer>
          <p>Application de démonstration pour CI/CD Jenkins</p>
        </footer>
      </main>
    </div>
  );
}

export default App;
