import React, { useState, useEffect } from 'react';
import { AppState } from './types';
import { initialState } from './utils/stateHelpers';
import EnergySelector from './components/EnergySelector';
import FileUpload from './components/FileUpload'; // Import FileUpload component
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

  const [fileUploadProcessing, setFileUploadProcessing] = useState<boolean>(false);
  const [fileUploadError, setFileUploadError] = useState<string | null>(null);

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

  const handleFileSelect = async (file: File | null) => {
    setFileUploadError(null);
    if (file) {
      setFileUploadProcessing(true);
      console.log('File selected for processing:', file.name);
      // Simulate API call or heavy processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      setFileUploadProcessing(false);
      // Here you would typically parse the ICS file and update appState
      // For now, just log and simulate success/failure
      if (file.name.includes('error')) { // Example: simulate an error
        setFileUploadError('Simulated error during file processing.');
      } else {
        console.log('File processed successfully (simulated).');
      }
    } else {
      console.log('File cleared.');
      // Clear any related state if needed
    }
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
        <FileUpload
          onFileSelect={handleFileSelect}
          isProcessing={fileUploadProcessing}
          error={fileUploadError}
        />
      </main>
    </div>
  );
}

export default App;
