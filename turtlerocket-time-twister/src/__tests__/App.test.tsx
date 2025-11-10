import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';
import { EnergyLevel } from '../types/energy';
import { initializeDefaultHourlyEnergy } from '../utils/energyHelpers';
import { initialState } from '../utils/stateHelpers'; // Import initialState

const LOCAL_STORAGE_KEY = 'turtleRocketTimeTwisterAppState';

describe('App', () => {
  const mockLocalStorage = (() => {
    let store: { [key: string]: string } = {};
    return {
      getItem: jest.fn((key: string) => store[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        store[key] = value;
      }),
      clear: jest.fn(() => {
        store = {};
      }),
      removeItem: jest.fn((key: string) => {
        delete store[key];
      }),
    };
  })();

  beforeAll(() => {
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
    });
  });

  beforeEach(() => {
    mockLocalStorage.clear();
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    cleanup(); // Clean up DOM between tests
  });

  test('renders the main heading', () => {
    render(<App />);
    const headingElement = screen.getByText(/TurtleRocket Time Twister/i);
    expect(headingElement).toBeInTheDocument();
  });

  test('App component initializes with correct state structure', () => {
    render(<App />);
    expect(screen.getByTestId('app-container')).toBeInTheDocument();
  });

  test('loads hourlyEnergy from localStorage on initial render', () => {
    const storedHourlyEnergy = {
      8: EnergyLevel.High,
      9: EnergyLevel.Low,
      10: EnergyLevel.Medium,
    };
    // Construct the full expected state based on initialState
    const storedAppState = {
      ...initialState, // Include all default properties
      hourlyEnergy: storedHourlyEnergy,
    };
    mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(storedAppState));

    render(<App />);

    expect(mockLocalStorage.getItem).toHaveBeenCalledWith(LOCAL_STORAGE_KEY);

    // Verify that the EnergySelector reflects the loaded state
    const eightAmBlock = screen.getByLabelText(/Set energy for 8 AM/);
    expect(eightAmBlock).toHaveTextContent('⚡'); // High emoji
    const nineAmBlock = screen.getByLabelText(/Set energy for 9 AM/);
    expect(nineAmBlock).toHaveTextContent('😴'); // Low emoji
    const tenAmBlock = screen.getByLabelText(/Set energy for 10 AM/);
    expect(tenAmBlock).toHaveTextContent('🤔'); // Medium emoji
  });

  test('saves hourlyEnergy to localStorage when an energy level changes', () => {
    render(<App />);

    // Initial state should be saved once on mount
    expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(1);
    let expectedState = {
      ...initialState, // Start with the full initial state
      hourlyEnergy: initializeDefaultHourlyEnergy(),
    };
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(LOCAL_STORAGE_KEY, JSON.stringify(expectedState));

    // Simulate clicking the 8 AM block to change its energy level
    const eightAmBlock = screen.getByLabelText(/Set energy for 8 AM/);
    fireEvent.click(eightAmBlock); // Medium -> High

    expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(2); // Should be called again after state update

    // Update expected state for the assertion
    expectedState.hourlyEnergy[8] = EnergyLevel.High;
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(LOCAL_STORAGE_KEY, JSON.stringify(expectedState));

    // Simulate clicking again: High -> Low
    fireEvent.click(eightAmBlock);
    expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(3);
    expectedState.hourlyEnergy[8] = EnergyLevel.Low;
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(LOCAL_STORAGE_KEY, JSON.stringify(expectedState));
  });

  test('saves hourlyEnergy to localStorage when reset button is clicked', () => {
    render(<App />);

    // Initial state should be saved once on mount
    expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(1);

    // Simulate changing some energy levels first
    const nineAmBlock = screen.getByLabelText(/Set energy for 9 AM/);
    fireEvent.click(nineAmBlock); // Medium -> High
    fireEvent.click(nineAmBlock); // High -> Low
    expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(3); // Initial + 2 clicks

    // Click the reset button
    const resetButton = screen.getByRole('button', { name: /Reset to Default/i });
    fireEvent.click(resetButton);

    expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(4); // Should be called again after reset

    // After reset, hourlyEnergy should be back to default (all Medium)
    const expectedState = {
      ...initialState, // Start with the full initial state
      hourlyEnergy: initializeDefaultHourlyEnergy(),
    };
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(LOCAL_STORAGE_KEY, JSON.stringify(expectedState));
  });
});