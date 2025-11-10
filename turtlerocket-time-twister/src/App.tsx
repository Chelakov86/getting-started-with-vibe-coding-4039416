import React, { useState, useEffect } from 'react';
import { AppState, ClassifiedEvent } from './types';
import { initialState } from './utils/stateHelpers';
import EnergySelector from './components/EnergySelector';
import FileUpload from './components/FileUpload';
import ScheduleDisplay from './components/ScheduleDisplay';
import ScheduleComparison from './components/ScheduleComparison';
import { EnergyLevel } from './types/energy';
import { initializeDefaultHourlyEnergy } from './utils/energyHelpers';
import { parseICSFile, ICSParseError } from './utils/icsParser';
import { classifyEvents } from './utils/classifier';

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
      try {
        const fileContent = await file.text();
        const parsedEvents = parseICSFile(fileContent);
        
        // Classify events using the classification algorithm
        const classifiedParsedEvents = classifyEvents(parsedEvents);
        
        // Convert ParsedEvent to CalendarEvent format
        const calendarEvents = classifiedParsedEvents.map(event => ({
          uid: event.id,
          summary: event.title,
          start: event.startTime,
          end: event.endTime,
        }));
        
        // Convert to ClassifiedEvent format for state
        const classifiedEvents: ClassifiedEvent[] = classifiedParsedEvents.map(event => ({
          uid: event.id,
          summary: event.title,
          start: event.startTime,
          end: event.endTime,
          classification: event.cognitiveLoad,
        }));
        
        setAppState((prevState) => ({
          ...prevState,
          uploadedEvents: calendarEvents,
          classifiedEvents,
        }));
        
        console.log(`Successfully parsed and classified ${calendarEvents.length} events`);
      } catch (error) {
        if (error instanceof ICSParseError) {
          setFileUploadError(error.message);
        } else {
          setFileUploadError('Failed to process ICS file');
        }
        console.error('Error parsing ICS file:', error);
      } finally {
        setFileUploadProcessing(false);
      }
    } else {
      // Clear uploaded events when file is cleared
      setAppState((prevState) => ({
        ...prevState,
        uploadedEvents: [],
        classifiedEvents: [],
      }));
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
        
        {appState.classifiedEvents.length > 0 && (
          <section>
            <h2>Current Schedule</h2>
            <ScheduleDisplay
              events={appState.classifiedEvents}
              showEnergyLevels={true}
              energyLevels={appState.hourlyEnergy}
            />
          </section>
        )}
        
        {appState.optimizedEvents.length > 0 && (
          <section>
            <ScheduleComparison
              optimizedEvents={appState.optimizedEvents}
              energyLevels={appState.hourlyEnergy}
            />
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
