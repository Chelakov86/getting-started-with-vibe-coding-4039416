import React, { useState, useEffect, useCallback } from 'react';
import { AppState, ClassifiedEvent } from './types';
import { initialState } from './utils/stateHelpers';
import EnergySelector from './components/EnergySelector';
import FileUpload from './components/FileUpload';
import ScheduleDisplay from './components/ScheduleDisplay';
import ScheduleComparison from './components/ScheduleComparison';
import { ExportButton } from './components/ExportButton';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import Toast, { ToastType } from './components/Toast';
import { EnergyLevel } from './types/energy';
import { initializeDefaultHourlyEnergy } from './utils/energyHelpers';
import { parseICSFile, ICSParseError } from './utils/icsParser';
import { classifyEvents } from './utils/classifier';
import { optimizeSchedule } from './utils/optimizer';
import './App.css';

const LOCAL_STORAGE_KEY = 'turtleRocketTimeTwisterAppState';

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

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
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [toastIdCounter, setToastIdCounter] = useState(0);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(appState));
    } catch (error) {
      console.error("Failed to save state to localStorage", error);
    }
  }, [appState]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + O: Optimize schedule
      if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
        e.preventDefault();
        if (appState.classifiedEvents.length > 0 && !isOptimizing) {
          handleOptimize();
        }
      }
      // Ctrl/Cmd + R: Reset energy
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        handleResetEnergy();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appState.classifiedEvents, isOptimizing]);

  const showToast = useCallback((message: string, type: ToastType) => {
    const id = toastIdCounter;
    setToastIdCounter(prev => prev + 1);
    setToasts(prev => [...prev, { id, message, type }]);
  }, [toastIdCounter]);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

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
    showToast('Energy levels reset to default', 'info');
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
          optimizedEvents: [], // Clear optimized events when new file is uploaded
        }));
        
        showToast(`Successfully loaded ${calendarEvents.length} events`, 'success');
        console.log(`Successfully parsed and classified ${calendarEvents.length} events`);
      } catch (error) {
        if (error instanceof ICSParseError) {
          setFileUploadError(error.message);
          showToast(`Error: ${error.message}`, 'error');
        } else {
          setFileUploadError('Failed to process ICS file');
          showToast('Failed to process ICS file', 'error');
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
        optimizedEvents: [],
      }));
    }
  };

  const handleOptimize = async () => {
    if (appState.classifiedEvents.length === 0) {
      showToast('Please upload a calendar file first', 'warning');
      return;
    }

    setIsOptimizing(true);
    
    try {
      // Simulate async operation for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const result = optimizeSchedule(appState.classifiedEvents, appState.hourlyEnergy);
      
      setAppState((prevState) => ({
        ...prevState,
        optimizedEvents: result.optimizedEvents,
      }));

      if (result.metrics.eventsOptimized > 0) {
        showToast(
          `Schedule optimized! ${result.metrics.eventsOptimized} events moved.`,
          'success'
        );
      } else {
        showToast('Schedule is already optimal!', 'info');
      }
    } catch (error) {
      showToast('Failed to optimize schedule', 'error');
      console.error('Optimization error:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleExportSuccess = () => {
    showToast('Calendar exported successfully!', 'success');
  };

  const handleExportError = (error: Error) => {
    showToast(`Export failed: ${error.message}`, 'error');
  };

  const canOptimize = appState.classifiedEvents.length > 0 && !isOptimizing && !fileUploadProcessing;

  return (
    <ErrorBoundary>
      <div className="App" data-testid="app-container">
        <header className="App-header">
          <div className="header-content">
            <div className="logo-container">
              <span className="logo" role="img" aria-label="Turtle Rocket">
                🐢🚀
              </span>
              <h1>TurtleRocket Time Twister</h1>
            </div>
            <p className="tagline">Optimize your schedule based on your energy levels</p>
          </div>
        </header>
        
        <main className="App-main">
          <section className="energy-section">
            <ErrorBoundary>
              <EnergySelector
                hourlyEnergy={appState.hourlyEnergy}
                onEnergyChange={handleEnergyChange}
                onReset={handleResetEnergy}
              />
            </ErrorBoundary>
          </section>

          <section className="upload-section">
            <ErrorBoundary>
              <FileUpload
                onFileSelect={handleFileSelect}
                isProcessing={fileUploadProcessing}
                error={fileUploadError}
              />
            </ErrorBoundary>
          </section>

          {fileUploadProcessing && (
            <LoadingSpinner message="Processing calendar file..." />
          )}
          
          {appState.classifiedEvents.length > 0 && !fileUploadProcessing && (
            <>
              <section className="schedule-section">
                <div className="section-header">
                  <h2>Current Schedule</h2>
                  <button
                    className="optimize-button"
                    onClick={handleOptimize}
                    disabled={!canOptimize}
                    title={canOptimize ? 'Optimize schedule (Ctrl/Cmd + O)' : 'Cannot optimize'}
                  >
                    {isOptimizing ? (
                      <>
                        <span className="button-spinner"></span>
                        Optimizing...
                      </>
                    ) : (
                      <>
                        <span role="img" aria-hidden="true">⚡</span>
                        Optimize Schedule
                      </>
                    )}
                  </button>
                </div>
                <ErrorBoundary>
                  <ScheduleDisplay
                    events={appState.classifiedEvents}
                    showEnergyLevels={true}
                    energyLevels={appState.hourlyEnergy}
                  />
                </ErrorBoundary>
              </section>

              {isOptimizing && (
                <LoadingSpinner message="Optimizing your schedule..." />
              )}
            </>
          )}
          
          {appState.optimizedEvents.length > 0 && !isOptimizing && (
            <section className="comparison-section">
              <div className="section-header">
                <h2>Optimized Schedule</h2>
                <ExportButton
                  optimizedEvents={appState.optimizedEvents}
                  onSuccess={handleExportSuccess}
                  onError={handleExportError}
                />
              </div>
              <ErrorBoundary>
                <ScheduleComparison
                  optimizedEvents={appState.optimizedEvents}
                  energyLevels={appState.hourlyEnergy}
                />
              </ErrorBoundary>
            </section>
          )}

          {appState.classifiedEvents.length === 0 && !fileUploadProcessing && (
            <div className="empty-state">
              <span className="empty-state-icon" role="img" aria-hidden="true">
                📅
              </span>
              <h3>Get Started</h3>
              <p>Upload your calendar (.ics file) to optimize your schedule</p>
              <div className="help-tips">
                <p><strong>Keyboard Shortcuts:</strong></p>
                <ul>
                  <li><kbd>Ctrl/Cmd + O</kbd> - Optimize schedule</li>
                  <li><kbd>Ctrl/Cmd + R</kbd> - Reset energy levels</li>
                </ul>
              </div>
            </div>
          )}
        </main>

        <footer className="App-footer">
          <p>
            TurtleRocket Time Twister - Optimize your schedule based on energy levels
          </p>
        </footer>

        {/* Toast notifications */}
        <div className="toast-container">
          {toasts.map(toast => (
            <Toast
              key={toast.id}
              message={toast.message}
              type={toast.type}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
