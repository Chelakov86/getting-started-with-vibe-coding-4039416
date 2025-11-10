import React from 'react';
import styles from './ScheduleDisplay.module.css';
import { ClassifiedEvent } from '../types';
import { HourlyEnergy, EnergyLevel } from '../types/energy';

interface ScheduleDisplayProps {
  events: ClassifiedEvent[];
  showEnergyLevels: boolean;
  energyLevels?: HourlyEnergy;
}

interface EventPosition {
  event: ClassifiedEvent;
  column: number;
  totalColumns: number;
}

const HOUR_HEIGHT = 60; // pixels per hour
const START_HOUR = 8;
const END_HOUR = 20;

const ScheduleDisplay: React.FC<ScheduleDisplayProps> = ({ 
  events, 
  showEnergyLevels, 
  energyLevels 
}) => {
  const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

  const formatHour = (hour: number): string => {
    if (hour === 12) return '12 PM';
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    return `${hour - 12} PM`;
  };

  const formatTime = (date: Date): string => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    return `${displayHours}:${displayMinutes} ${period}`;
  };

  const formatDuration = (start: Date, end: Date): string => {
    const durationMs = end.getTime() - start.getTime();
    const durationMinutes = Math.round(durationMs / (1000 * 60));
    
    if (durationMinutes < 60) {
      return `${durationMinutes}m`;
    }
    
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    
    if (minutes === 0) {
      return `${hours}h`;
    }
    
    return `${hours}h ${minutes}m`;
  };

  const getEventPosition = (event: ClassifiedEvent): { top: number; height: number } => {
    const startHour = event.start.getHours() + event.start.getMinutes() / 60;
    const endHour = event.end.getHours() + event.end.getMinutes() / 60;
    
    const top = (startHour - START_HOUR) * HOUR_HEIGHT;
    const height = (endHour - startHour) * HOUR_HEIGHT;
    
    return { top, height };
  };

  const calculateOverlaps = (events: ClassifiedEvent[]): EventPosition[] => {
    const sortedEvents = [...events].sort((a, b) => a.start.getTime() - b.start.getTime());
    const eventPositions: EventPosition[] = [];
    
    sortedEvents.forEach(event => {
      // Find overlapping events that are already positioned
      const overlapping = eventPositions.filter(positioned => {
        const posEvent = positioned.event;
        return (
          event.start < posEvent.end && event.end > posEvent.start
        );
      });
      
      if (overlapping.length === 0) {
        eventPositions.push({ event, column: 0, totalColumns: 1 });
      } else {
        // Find the first available column
        const usedColumns = new Set(overlapping.map(p => p.column));
        let column = 0;
        while (usedColumns.has(column)) {
          column++;
        }
        
        const totalColumns = Math.max(column + 1, ...overlapping.map(p => p.totalColumns));
        
        // Update total columns for all overlapping events
        overlapping.forEach(positioned => {
          positioned.totalColumns = totalColumns;
        });
        
        eventPositions.push({ event, column, totalColumns });
      }
    });
    
    return eventPositions;
  };

  const eventPositions = calculateOverlaps(events);

  const getEnergyClassName = (level?: EnergyLevel): string => {
    if (!level) return '';
    switch (level) {
      case EnergyLevel.High:
        return styles.energyHigh;
      case EnergyLevel.Medium:
        return styles.energyMedium;
      case EnergyLevel.Low:
        return styles.energyLow;
      default:
        return '';
    }
  };

  const getCognitiveLoadLabel = (load: string): string => {
    return `${load} cognitive load`;
  };

  return (
    <div className={styles.scheduleDisplay}>
      <div className={styles.timeline}>
        <div className={styles.hourColumn}>
          {hours.map(hour => (
            <div 
              key={hour} 
              className={styles.hourMarker}
              aria-label={`Hour marker for ${formatHour(hour)}`}
            >
              {formatHour(hour)}
            </div>
          ))}
        </div>
        
        <div className={styles.eventsColumn}>
          {showEnergyLevels && energyLevels && (
            <div className={styles.energyBackground}>
              {hours.slice(0, -1).map(hour => (
                <div
                  key={hour}
                  className={`${styles.energySlot} ${getEnergyClassName(energyLevels[hour])}`}
                  data-testid={`energy-slot-${hour}`}
                />
              ))}
            </div>
          )}
          
          <div className={styles.eventsContainer} role="list">
            {events.length === 0 ? (
              <div className={styles.emptyState}>
                No events scheduled for this day
              </div>
            ) : (
              eventPositions.map(({ event, column, totalColumns }) => {
                const { top, height } = getEventPosition(event);
                const width = `${100 / totalColumns}%`;
                const left = `${(column * 100) / totalColumns}%`;
                const durationHours = (event.end.getTime() - event.start.getTime()) / (1000 * 60 * 60);
                
                return (
                  <div
                    key={event.uid}
                    className={`${styles.eventBlock} ${styles[event.classification]}`}
                    style={{
                      top: `${top}px`,
                      height: `${height}px`,
                      width,
                      left,
                    }}
                    data-testid={`event-${event.uid}`}
                    data-start-hour={event.start.getHours().toString()}
                    data-overlap-column={column.toString()}
                    data-total-columns={totalColumns.toString()}
                    data-duration-hours={durationHours.toString()}
                    role="article"
                    tabIndex={0}
                    aria-label={`${event.summary}, ${formatTime(event.start)} to ${formatTime(event.end)}, ${getCognitiveLoadLabel(event.classification)}`}
                  >
                    <div className={styles.eventTitle}>{event.summary}</div>
                    <div className={styles.eventTime}>
                      {formatTime(event.start)} - {formatTime(event.end)}
                    </div>
                    <div className={styles.eventDuration}>
                      {formatDuration(event.start, event.end)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleDisplay;
