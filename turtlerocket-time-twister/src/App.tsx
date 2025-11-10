import React, { useState } from 'react';
import { AppState } from './types';
import { initialState } from './utils/stateHelpers';
import EnergySelector from './components/EnergySelector';
import { EnergyLevel, HourlyEnergy } from './types/energy';

function App() {
  const [appState, setAppState] = useState<AppState>(initialState);

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
    const defaultHourlyEnergy: HourlyEnergy = {};
    for (let i = 8; i < 20; i++) {
      defaultHourlyEnergy[i] = EnergyLevel.Medium;
    }
    setAppState((prevState) => ({
      ...prevState,
      hourlyEnergy: defaultHourlyEnergy,
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
