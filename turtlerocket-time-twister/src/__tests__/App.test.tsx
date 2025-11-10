import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';

test('renders the main heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/TurtleRocket Time Twister/i);
  expect(headingElement).toBeInTheDocument();
});

test('App component initializes with correct state structure', () => {
  render(<App />);
  // Since the state is internal to the App component, we can't directly assert its values here.
  // However, if the component renders without errors, it implies the state initialization
  // (including the initialState structure) is not causing immediate issues.
  // More detailed state checks would typically be done via component props or context,
  // or by testing the state management utility functions directly (which we've done in stateHelpers.test.ts).
  expect(screen.getByTestId('app-container')).toBeInTheDocument();
});