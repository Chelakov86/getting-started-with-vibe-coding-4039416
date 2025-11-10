import React from 'react';
import { render, screen } from '@testing-library/react';
import ScheduleComparison from '../components/ScheduleComparison';
import { OptimizedEvent } from '../types';
import { optimizeSchedule } from '../utils/optimizer';
import { HourlyEnergy, EnergyLevel } from '../types/energy';

describe('ScheduleComparison Integration', () => {
  it('should display full comparison flow with optimizer', () => {
    // Setup: Create classified events
    const classifiedEvents = [
      {
        uid: 'event1',
        summary: 'Deep Work - Code Review',
        start: new Date('2024-01-15T15:00:00'),
        end: new Date('2024-01-15T17:00:00'),
        classification: 'heavy' as const,
      },
      {
        uid: 'event2',
        summary: 'Email Processing',
        start: new Date('2024-01-15T09:00:00'),
        end: new Date('2024-01-15T10:00:00'),
        classification: 'light' as const,
      },
    ];

    // Setup: Define energy levels (high in morning, low in afternoon)
    const hourlyEnergy: HourlyEnergy = {
      8: EnergyLevel.High,
      9: EnergyLevel.High,
      10: EnergyLevel.High,
      11: EnergyLevel.Medium,
      12: EnergyLevel.Medium,
      13: EnergyLevel.Medium,
      14: EnergyLevel.Low,
      15: EnergyLevel.Low,
      16: EnergyLevel.Low,
      17: EnergyLevel.Low,
      18: EnergyLevel.Low,
      19: EnergyLevel.Low,
    };

    // Optimize: Run the schedule optimizer
    const result = optimizeSchedule(classifiedEvents, hourlyEnergy);

    // Render: Display the comparison
    render(
      <ScheduleComparison
        optimizedEvents={result.optimizedEvents}
        energyLevels={hourlyEnergy}
      />
    );

    // Verify: Component displays correctly
    expect(screen.getByTestId('schedule-comparison')).toBeInTheDocument();
    expect(screen.getByText('Schedule Optimization Comparison')).toBeInTheDocument();

    // Verify: Summary stats are displayed
    expect(screen.getByTestId('total-events')).toHaveTextContent('2');
    expect(screen.getByTestId('summary-section')).toBeInTheDocument();

    // Verify: Both events are displayed in original and optimized columns
    expect(screen.getByTestId('original-event-event1')).toBeInTheDocument();
    expect(screen.getByTestId('optimized-event-event1')).toBeInTheDocument();
    expect(screen.getByTestId('original-event-event2')).toBeInTheDocument();
    expect(screen.getByTestId('optimized-event-event2')).toBeInTheDocument();

    // The optimizer should move heavy work to high energy times (morning)
    // and light work to low energy times (afternoon)
    // This demonstrates the full integration
  });

  it('should handle no optimization needed scenario', () => {
    // When events are already optimally placed
    const optimalEvents: OptimizedEvent[] = [
      {
        uid: 'event1',
        summary: 'Already Optimal',
        originalStart: new Date('2024-01-15T09:00:00'),
        originalEnd: new Date('2024-01-15T10:00:00'),
        start: new Date('2024-01-15T09:00:00'),
        end: new Date('2024-01-15T10:00:00'),
        classification: 'heavy',
      },
    ];

    render(<ScheduleComparison optimizedEvents={optimalEvents} />);

    expect(screen.getByTestId('moved-events')).toHaveTextContent('0');
    expect(screen.queryByTestId('movement-indicator-event1')).not.toBeInTheDocument();
  });
});
