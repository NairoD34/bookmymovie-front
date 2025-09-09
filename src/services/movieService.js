import axios from 'axios';

// Configuration de base
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Instance axios avec configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock data pour les tests (sera remplacé par de vraies API calls)
const mockMovies = [
  {
    id: 1,
    title: 'Avatar: The Way of Water',
    category: 'action',
    rating: 8.2,
    description: 'Jake Sully and Neytiri have formed a family and are doing everything to stay together.',
    poster: 'https://example.com/avatar2.jpg',
    duration: 192,
    director: 'James Cameron'
  },
  {
    id: 2,
    title: 'Top Gun: Maverick',
    category: 'action',
    rating: 8.7,
    description: 'After thirty years, Maverick is still pushing the envelope as a top naval aviator.',
    poster: 'https://example.com/topgun.jpg',
    duration: 130,
    director: 'Joseph Kosinski'
  },
  {
    id: 3,
    title: 'The Batman',
    category: 'action',
    rating: 7.8,
    description: 'Batman ventures into Gotham City underworld when a sadistic killer leaves clues.',
    poster: 'https://example.com/batman.jpg',
    duration: 176,
    director: 'Matt Reeves'
  }
];

// Fonction avec gestion d'erreur incomplète
export const getMovies = async () => {
  try {
    // Simulation d'un délai réseau
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Pour l'instant, on retourne les données mock
    return { data: mockMovies };
    
    // Code commenté pour la vraie API
    // const response = await apiClient.get('/movies');
    // return response.data;
  } catch (error) {
    // Bug : on ne rethrow pas l'erreur correctement
    console.error('Error in getMovies:', error);
    return { data: [] }; // Retourne des données vides au lieu de faire échouer
  }
};

// Fonction avec paramètres non validés
export const getMovieById = async (movieId) => {
  try {
    // Bug : pas de validation de movieId
    const movie = mockMovies.find(m => m.id == movieId); // == au lieu de ===
    
    if (!movie) {
      throw new Error('Movie not found');
    }
    
    return { data: movie };
  } catch (error) {
    console.error('Error fetching movie:', error);
    throw error;
  }
};

// Fonction avec logique de réservation
export const createBooking = async (bookingData) => {
  try {
    // Validation manquante
    const booking = {
      id: Date.now(),
      movieId: bookingData.movieId,
      userId: bookingData.userId,
      seats: bookingData.seats,
      showtime: bookingData.showtime,
      totalPrice: bookingData.seats.length * 12.50, // Prix hardcodé (code smell)
      createdAt: new Date().toISOString()
    };

    // Simulation d'API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return { data: booking };
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

// Fonction avec gestion d'authentification simpliste
export const authenticateUser = async (email, password) => {
  // Sécurité très faible (pour les tests SonarQube)
  if (password === '123456') { // Mot de passe faible
    return {
      data: {
        id: 1,
        email: email,
        token: 'fake-jwt-token', // Token non sécurisé
        role: 'user'
      }
    };
  }
  
  throw new Error('Invalid credentials');
};

export default {
  getMovies,
  getMovieById,
  createBooking,
  authenticateUser
};
