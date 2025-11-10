import React, { useState } from 'react';
import { AppState } from './types';
import { initialState } from './utils/stateHelpers';

function App() {
  const [appState, setAppState] = useState<AppState>(initialState);

  return (
    <div className="App" data-testid="app-container">
      <header className="App-header">
        <h1>TurtleRocket Time Twister</h1>
      </header>
    </div>
  );
}

export default App;
