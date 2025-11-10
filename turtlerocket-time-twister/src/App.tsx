import React, { useState, useEffect } from 'react';
import { AppState } from './types';
import { initialState } from './utils/stateHelpers';
import EnergySelector from './components/EnergySelector';
import { EnergyLevel } from './types/energy';
import { initializeDefaultHourlyEnergy } from './utils/energyHelpers';

const LOCAL_STORAGE_KEY = 'turtleRocketTimeTwisterAppState';

function App() {
  const [appState, setAppState] = useState<AppState>(() => {
    try {
      const storedState = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedState) {
        const parsedState: AppState = JSON.parse(storedState);
        // Ensure hourlyEnergy is properly initialized if not present or malformed
        if (!parsedState.hourlyEnergy || Object.keys(parsedState.hourlyEnergy).length === 0) {
          parsedState.hourlyEnergy = initializeDefaultHourlyEnergy();
        }
        return parsedState;
      }
    } catch (error) {
      console.error("Failed to parse state from localStorage", error);
    }
    return { ...initialState, hourlyEnergy: initializeDefaultHourlyEnergy() };
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(appState));
    } catch (error) {
      console.error("Failed to save state to localStorage", error);
    }
  }, [appState]);

  const handleEnergyChange = (hour: number, level: EnergyLevel) => {
    setAppState((prevState) => ({
      ...prevState,
      hourlyEnergy: {
        ...prevState.hourlyEnergy,
        [hour]: level,
      },
    }));
  };

  const handleResetEnergy = () => {
    setAppState((prevState) => ({
      ...prevState,
      hourlyEnergy: initializeDefaultHourlyEnergy(),
    }));
  };

  return (
    <div className="App" data-testid="app-container">
      <header className="App-header">
        <h1>TurtleRocket Time Twister</h1>
      </header>
      <main>
        <EnergySelector
          hourlyEnergy={appState.hourlyEnergy}
          onEnergyChange={handleEnergyChange}
          onReset={handleResetEnergy}
        />
      </main>
    </div>
  );
}

export default App;
