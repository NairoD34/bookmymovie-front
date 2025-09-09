import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import App from '../App';
import MovieList from '../pages/MovieList';
import { getMovies } from '../services/movieService';

// Mock du service
jest.mock('../services/movieService');

// Composant wrapper pour les tests avec Router
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('App Component', () => {
  beforeEach(() => {
    getMovies.mockClear();
  });

  test('renders BookMyMovie title', async () => {
    getMovies.mockResolvedValue({ data: [] });
    
    renderWithRouter(<App />);
    
    expect(screen.getByText('🎬 BookMyMovie')).toBeInTheDocument();
  });

  test('shows loading state initially', () => {
    getMovies.mockResolvedValue({ data: [] });
    
    renderWithRouter(<App />);
    
    expect(screen.getByText('Loading BookMyMovie...')).toBeInTheDocument();
  });

  test('displays error when movie fetch fails', async () => {
    getMovies.mockRejectedValue(new Error('API Error'));
    
    renderWithRouter(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load movies')).toBeInTheDocument();
    });
  });
});

describe('MovieList Component', () => {
  const mockMovies = [
    {
      id: 1,
      title: 'Test Movie',
      category: 'action',
      rating: 8.5,
      description: 'A test movie description',
      poster: 'test.jpg'
    }
  ];

  test('renders movie list correctly', () => {
    renderWithRouter(
      <MovieList movies={mockMovies} onError={jest.fn()} />
    );
    
    expect(screen.getByText('Test Movie')).toBeInTheDocument();
    expect(screen.getByText('action')).toBeInTheDocument();
  });

  test('filters movies by search term', async () => {
    renderWithRouter(
      <MovieList movies={mockMovies} onError={jest.fn()} />
    );
    
    const searchInput = screen.getByPlaceholderText('Search movies...');
    fireEvent.change(searchInput, { target: { value: 'Test' } });
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie')).toBeInTheDocument();
    });
  });

  test('shows no movies message when list is empty', () => {
    renderWithRouter(
      <MovieList movies={[]} onError={jest.fn()} />
    );
    
    expect(screen.getByText('No movies found matching your criteria.')).toBeInTheDocument();
  });

  // Test manquant pour la couverture incomplète
  // La fonction handleMovieClick n'est pas testée
  // Les fonctions formatRating et displayStars ne sont pas testées
  // Les cas d'erreur ne sont pas tous couverts
});

// Tests incomplets pour la fonction calculateAverageRating
describe('Utility Functions', () => {
  // Ce test ne couvre pas le cas de division par zéro
  test('calculateAverageRating with valid ratings', () => {
    const ratings = [7, 8, 9];
    // Cette fonction n'est pas exportée, donc on ne peut pas la tester facilement
    // C'est un problème de design (code smell)
  });
  
  // Tests manquants :
  // - Test avec tableau vide (division par zéro)
  // - Test avec valeurs invalides
  // - Test de la fonction processMovieData
});
