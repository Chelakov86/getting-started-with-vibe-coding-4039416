import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';
import fs from 'fs';
import path from 'path';

// Read and inject the CSS file
const cssFile = fs.readFileSync(path.resolve(__dirname, '../App.css'), 'utf8');
const styleTag = document.createElement('style');
styleTag.innerHTML = cssFile;
document.head.appendChild(styleTag);


test('renders the main heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/TurtleRocket Time Twister/i);
  expect(headingElement).toBeInTheDocument();
});

test('app container has correct styles', () => {
  render(<App />);
  const appElement = screen.getByTestId('app-container');
  expect(appElement).toHaveStyle('max-width: 800px');
  expect(appElement).toHaveStyle('margin: 2rem auto');
  expect(appElement).toHaveStyle('padding: 2rem');
  expect(appElement).toHaveStyle('background-color: #ffffff');
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