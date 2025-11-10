import React from 'react';
import styles from './ScheduleComparison.module.css';
import { OptimizedEvent } from '../types';
import { HourlyEnergy } from '../types/energy';

interface ScheduleComparisonProps {
  optimizedEvents: OptimizedEvent[];
  energyLevels?: HourlyEnergy;
}

interface EventComparison {
  event: OptimizedEvent;
  isMoved: boolean;
  timeDifferenceMs: number;
  movedEarlier: boolean;
}

interface SummaryStats {
  totalEvents: number;
  movedEvents: number;
  averageDisplacementMinutes: number;
  movedEarlier: number;
  movedLater: number;
}

const ScheduleComparison: React.FC<ScheduleComparisonProps> = ({ 
  optimizedEvents,
  energyLevels 
}) => {
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

  const calculateTimeDifference = (originalStart: Date, newStart: Date): string => {
    const diffMs = newStart.getTime() - originalStart.getTime();
    const diffMinutes = Math.abs(Math.round(diffMs / (1000 * 60)));
    
    if (diffMinutes === 0) {
      return 'No change';
    }
    
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    
    let timeStr = '';
    if (hours > 0) {
      timeStr += `${hours} hour${hours > 1 ? 's' : ''}`;
    }
    if (minutes > 0) {
      if (hours > 0) timeStr += ' ';
      timeStr += `${minutes} min${minutes > 1 ? 's' : ''}`;
    }
    
    const direction = diffMs < 0 ? 'earlier' : 'later';
    return `${timeStr} ${direction}`;
  };

  const getMovementIndicator = (isMoved: boolean, movedEarlier: boolean): string => {
    if (!isMoved) return '';
    return movedEarlier ? '↑' : '↓';
  };

  const analyzeEvents = (): EventComparison[] => {
    return optimizedEvents.map(event => {
      const timeDifferenceMs = event.start.getTime() - event.originalStart.getTime();
      const isMoved = timeDifferenceMs !== 0;
      const movedEarlier = timeDifferenceMs < 0;
      
      return {
        event,
        isMoved,
        timeDifferenceMs,
        movedEarlier,
      };
    });
  };

  const calculateSummary = (comparisons: EventComparison[]): SummaryStats => {
    const movedEvents = comparisons.filter(c => c.isMoved);
    const totalDisplacementMs = movedEvents.reduce(
      (sum, c) => sum + Math.abs(c.timeDifferenceMs),
      0
    );
    const averageDisplacementMinutes = movedEvents.length > 0
      ? Math.round(totalDisplacementMs / (movedEvents.length * 1000 * 60))
      : 0;
    
    return {
      totalEvents: comparisons.length,
      movedEvents: movedEvents.length,
      averageDisplacementMinutes,
      movedEarlier: movedEvents.filter(c => c.movedEarlier).length,
      movedLater: movedEvents.filter(c => !c.movedEarlier).length,
    };
  };

  const eventComparisons = analyzeEvents();
  const summary = calculateSummary(eventComparisons);

  if (optimizedEvents.length === 0) {
    return (
      <div className={styles.emptyState} data-testid="empty-state">
        No optimized events to display
      </div>
    );
  }

  return (
    <div className={styles.scheduleComparison} data-testid="schedule-comparison">
      <h2 className={styles.title}>Schedule Optimization Comparison</h2>
      
      <div className={styles.summarySection} data-testid="summary-section">
        <h3>Optimization Summary</h3>
        <div className={styles.summaryStats}>
          <div className={styles.stat} data-testid="total-events">
            <span className={styles.statLabel}>Total Events:</span>
            <span className={styles.statValue}>{summary.totalEvents}</span>
          </div>
          <div className={styles.stat} data-testid="moved-events">
            <span className={styles.statLabel}>Events Optimized:</span>
            <span className={styles.statValue}>{summary.movedEvents}</span>
          </div>
          {summary.movedEvents > 0 && (
            <>
              <div className={styles.stat} data-testid="average-displacement">
                <span className={styles.statLabel}>Average Displacement:</span>
                <span className={styles.statValue}>{summary.averageDisplacementMinutes} minutes</span>
              </div>
              <div className={styles.stat} data-testid="moved-earlier">
                <span className={styles.statLabel}>Moved Earlier:</span>
                <span className={styles.statValue}>{summary.movedEarlier}</span>
              </div>
              <div className={styles.stat} data-testid="moved-later">
                <span className={styles.statLabel}>Moved Later:</span>
                <span className={styles.statValue}>{summary.movedLater}</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className={styles.comparisonGrid}>
        <div className={styles.columnHeader}>
          <h3>Original Schedule</h3>
        </div>
        <div className={styles.columnHeader}>
          <h3>Optimized Schedule</h3>
        </div>

        {eventComparisons.map(({ event, isMoved, movedEarlier }) => (
          <React.Fragment key={event.uid}>
            <div 
              className={`${styles.eventCard} ${styles.originalEvent} ${isMoved ? styles.moved : ''}`}
              data-testid={`original-event-${event.uid}`}
              data-is-moved={isMoved}
            >
              <div className={styles.eventHeader}>
                <div className={`${styles.eventTitle} ${isMoved ? styles.strikethrough : ''}`}>
                  {event.summary}
                </div>
                <div className={`${styles.classificationBadge} ${styles[event.classification]}`}>
                  {event.classification}
                </div>
              </div>
              <div className={`${styles.eventTime} ${isMoved ? styles.strikethrough : ''}`}>
                {formatTime(event.originalStart)} - {formatTime(event.originalEnd)}
              </div>
              <div className={styles.eventDuration}>
                {formatDuration(event.originalStart, event.originalEnd)}
              </div>
            </div>

            <div 
              className={`${styles.eventCard} ${styles.optimizedEvent} ${isMoved ? styles.moved : ''}`}
              data-testid={`optimized-event-${event.uid}`}
              data-is-moved={isMoved}
            >
              <div className={styles.eventHeader}>
                <div className={`${styles.eventTitle} ${isMoved ? styles.bold : ''}`}>
                  {event.summary}
                  {isMoved && (
                    <span 
                      className={`${styles.movementIndicator} ${movedEarlier ? styles.earlier : styles.later}`}
                      aria-label={movedEarlier ? 'Moved earlier' : 'Moved later'}
                      data-testid={`movement-indicator-${event.uid}`}
                    >
                      {getMovementIndicator(isMoved, movedEarlier)}
                    </span>
                  )}
                </div>
                <div className={`${styles.classificationBadge} ${styles[event.classification]}`}>
                  {event.classification}
                </div>
              </div>
              <div className={`${styles.eventTime} ${isMoved ? styles.bold : ''}`}>
                {formatTime(event.start)} - {formatTime(event.end)}
              </div>
              <div className={styles.eventDuration}>
                {formatDuration(event.start, event.end)}
              </div>
              {isMoved && (
                <div 
                  className={styles.timeDifference}
                  data-testid={`time-difference-${event.uid}`}
                >
                  {calculateTimeDifference(event.originalStart, event.start)}
                </div>
              )}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ScheduleComparison;
