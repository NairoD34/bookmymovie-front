import { render, screen } from '@testing-library/react';
import App from '../App';

test('renders BookMyMovie title', () => {
  render(<App />);
  const titleElement = screen.getByText(/BookMyMovie/i);
  expect(titleElement).toBeInTheDocument();
});

test('renders movie cards', () => {
  render(<App />);
  const avengerElement = screen.getByText(/Avengers: Endgame/i);
  const darkKnightElement = screen.getByText(/The Dark Knight/i);
  const inceptionElement = screen.getByText(/Inception/i);

  expect(avengerElement).toBeInTheDocument();
  expect(darkKnightElement).toBeInTheDocument();
  expect(inceptionElement).toBeInTheDocument();
});

test('renders booking buttons', () => {
  render(<App />);
  const buttons = screen.getAllByText(/Réserver/i);
  expect(buttons).toHaveLength(3);
});
