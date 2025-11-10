import React from 'react';
import { render, screen } from '@testing-library/react';
import ScheduleComparison from '../components/ScheduleComparison';
import { OptimizedEvent } from '../types';
import { CognitiveLoad } from '../types/classification';

describe('ScheduleComparison', () => {
  const createOptimizedEvent = (
    id: string,
    summary: string,
    originalStart: Date,
    originalEnd: Date,
    start: Date,
    end: Date,
    classification: CognitiveLoad = 'medium'
  ): OptimizedEvent => ({
    uid: id,
    summary,
    originalStart,
    originalEnd,
    start,
    end,
    classification,
  });

  describe('Empty State', () => {
    it('should display empty state when no events are provided', () => {
      render(<ScheduleComparison optimizedEvents={[]} />);
      
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText('No optimized events to display')).toBeInTheDocument();
    });

    it('should not display comparison grid when empty', () => {
      render(<ScheduleComparison optimizedEvents={[]} />);
      
      expect(screen.queryByTestId('schedule-comparison')).not.toBeInTheDocument();
    });
  });

  describe('Event Display', () => {
    it('should display both original and optimized events', () => {
      const events: OptimizedEvent[] = [
        createOptimizedEvent(
          'event1',
          'Team Meeting',
          new Date('2024-01-15T09:00:00'),
          new Date('2024-01-15T10:00:00'),
          new Date('2024-01-15T09:00:00'),
          new Date('2024-01-15T10:00:00')
        ),
      ];

      render(<ScheduleComparison optimizedEvents={events} />);
      
      expect(screen.getByTestId('original-event-event1')).toBeInTheDocument();
      expect(screen.getByTestId('optimized-event-event1')).toBeInTheDocument();
      expect(screen.getAllByText('Team Meeting')).toHaveLength(2);
    });

    it('should display event times correctly', () => {
      const events: OptimizedEvent[] = [
        createOptimizedEvent(
          'event1',
          'Morning Standup',
          new Date('2024-01-15T09:00:00'),
          new Date('2024-01-15T09:30:00'),
          new Date('2024-01-15T09:00:00'),
          new Date('2024-01-15T09:30:00')
        ),
      ];

      render(<ScheduleComparison optimizedEvents={events} />);
      
      expect(screen.getAllByText(/9:00 AM - 9:30 AM/)).toHaveLength(2);
    });

    it('should display event classification badges', () => {
      const events: OptimizedEvent[] = [
        createOptimizedEvent(
          'event1',
          'Deep Work',
          new Date('2024-01-15T09:00:00'),
          new Date('2024-01-15T11:00:00'),
          new Date('2024-01-15T09:00:00'),
          new Date('2024-01-15T11:00:00'),
          'heavy'
        ),
      ];

      render(<ScheduleComparison optimizedEvents={events} />);
      
      expect(screen.getAllByText('heavy')).toHaveLength(2);
    });

    it('should display event duration', () => {
      const events: OptimizedEvent[] = [
        createOptimizedEvent(
          'event1',
          'Project Review',
          new Date('2024-01-15T14:00:00'),
          new Date('2024-01-15T16:00:00'),
          new Date('2024-01-15T14:00:00'),
          new Date('2024-01-15T16:00:00')
        ),
      ];

      render(<ScheduleComparison optimizedEvents={events} />);
      
      expect(screen.getAllByText('2h')).toHaveLength(2);
    });
  });

  describe('Change Detection', () => {
    it('should detect when an event has not been moved', () => {
      const events: OptimizedEvent[] = [
        createOptimizedEvent(
          'event1',
          'Lunch Break',
          new Date('2024-01-15T12:00:00'),
          new Date('2024-01-15T13:00:00'),
          new Date('2024-01-15T12:00:00'),
          new Date('2024-01-15T13:00:00')
        ),
      ];

      render(<ScheduleComparison optimizedEvents={events} />);
      
      const originalEvent = screen.getByTestId('original-event-event1');
      const optimizedEvent = screen.getByTestId('optimized-event-event1');
      
      expect(originalEvent).toHaveAttribute('data-is-moved', 'false');
      expect(optimizedEvent).toHaveAttribute('data-is-moved', 'false');
      expect(screen.queryByTestId('movement-indicator-event1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('time-difference-event1')).not.toBeInTheDocument();
    });

    it('should detect when an event has been moved', () => {
      const events: OptimizedEvent[] = [
        createOptimizedEvent(
          'event1',
          'Team Sync',
          new Date('2024-01-15T14:00:00'),
          new Date('2024-01-15T15:00:00'),
          new Date('2024-01-15T10:00:00'),
          new Date('2024-01-15T11:00:00')
        ),
      ];

      render(<ScheduleComparison optimizedEvents={events} />);
      
      const originalEvent = screen.getByTestId('original-event-event1');
      const optimizedEvent = screen.getByTestId('optimized-event-event1');
      
      expect(originalEvent).toHaveAttribute('data-is-moved', 'true');
      expect(optimizedEvent).toHaveAttribute('data-is-moved', 'true');
      expect(screen.getByTestId('movement-indicator-event1')).toBeInTheDocument();
      expect(screen.getByTestId('time-difference-event1')).toBeInTheDocument();
    });
  });

  describe('Movement Indicator Logic', () => {
    it('should show up arrow (↑) when event moved earlier', () => {
      const events: OptimizedEvent[] = [
        createOptimizedEvent(
          'event1',
          'Code Review',
          new Date('2024-01-15T15:00:00'),
          new Date('2024-01-15T16:00:00'),
          new Date('2024-01-15T10:00:00'),
          new Date('2024-01-15T11:00:00')
        ),
      ];

      render(<ScheduleComparison optimizedEvents={events} />);
      
      const indicator = screen.getByTestId('movement-indicator-event1');
      expect(indicator).toHaveTextContent('↑');
      expect(indicator).toHaveAttribute('aria-label', 'Moved earlier');
    });

    it('should show down arrow (↓) when event moved later', () => {
      const events: OptimizedEvent[] = [
        createOptimizedEvent(
          'event1',
          'Email Time',
          new Date('2024-01-15T09:00:00'),
          new Date('2024-01-15T09:30:00'),
          new Date('2024-01-15T15:00:00'),
          new Date('2024-01-15T15:30:00')
        ),
      ];

      render(<ScheduleComparison optimizedEvents={events} />);
      
      const indicator = screen.getByTestId('movement-indicator-event1');
      expect(indicator).toHaveTextContent('↓');
      expect(indicator).toHaveAttribute('aria-label', 'Moved later');
    });
  });

  describe('Time Difference Display', () => {
    it('should display correct time difference for events moved earlier', () => {
      const events: OptimizedEvent[] = [
        createOptimizedEvent(
          'event1',
          'Planning Session',
          new Date('2024-01-15T14:00:00'),
          new Date('2024-01-15T15:00:00'),
          new Date('2024-01-15T10:00:00'),
          new Date('2024-01-15T11:00:00')
        ),
      ];

      render(<ScheduleComparison optimizedEvents={events} />);
      
      const timeDiff = screen.getByTestId('time-difference-event1');
      expect(timeDiff).toHaveTextContent('4 hours earlier');
    });

    it('should display correct time difference for events moved later', () => {
      const events: OptimizedEvent[] = [
        createOptimizedEvent(
          'event1',
          'Admin Tasks',
          new Date('2024-01-15T09:00:00'),
          new Date('2024-01-15T10:00:00'),
          new Date('2024-01-15T14:30:00'),
          new Date('2024-01-15T15:30:00')
        ),
      ];

      render(<ScheduleComparison optimizedEvents={events} />);
      
      const timeDiff = screen.getByTestId('time-difference-event1');
      expect(timeDiff).toHaveTextContent('5 hours 30 mins later');
    });

    it('should display time difference in minutes for small changes', () => {
      const events: OptimizedEvent[] = [
        createOptimizedEvent(
          'event1',
          'Quick Check-in',
          new Date('2024-01-15T10:00:00'),
          new Date('2024-01-15T10:15:00'),
          new Date('2024-01-15T10:30:00'),
          new Date('2024-01-15T10:45:00')
        ),
      ];

      render(<ScheduleComparison optimizedEvents={events} />);
      
      const timeDiff = screen.getByTestId('time-difference-event1');
      expect(timeDiff).toHaveTextContent('30 mins later');
    });
  });

  describe('Summary Calculations', () => {
    it('should calculate correct summary stats with no moved events', () => {
      const events: OptimizedEvent[] = [
        createOptimizedEvent(
          'event1',
          'Meeting 1',
          new Date('2024-01-15T09:00:00'),
          new Date('2024-01-15T10:00:00'),
          new Date('2024-01-15T09:00:00'),
          new Date('2024-01-15T10:00:00')
        ),
        createOptimizedEvent(
          'event2',
          'Meeting 2',
          new Date('2024-01-15T11:00:00'),
          new Date('2024-01-15T12:00:00'),
          new Date('2024-01-15T11:00:00'),
          new Date('2024-01-15T12:00:00')
        ),
      ];

      render(<ScheduleComparison optimizedEvents={events} />);
      
      expect(screen.getByTestId('total-events')).toHaveTextContent('2');
      expect(screen.getByTestId('moved-events')).toHaveTextContent('0');
      expect(screen.queryByTestId('average-displacement')).not.toBeInTheDocument();
    });

    it('should calculate correct summary stats with moved events', () => {
      const events: OptimizedEvent[] = [
        createOptimizedEvent(
          'event1',
          'Deep Work',
          new Date('2024-01-15T15:00:00'),
          new Date('2024-01-15T17:00:00'),
          new Date('2024-01-15T09:00:00'),
          new Date('2024-01-15T11:00:00')
        ),
        createOptimizedEvent(
          'event2',
          'Email',
          new Date('2024-01-15T09:00:00'),
          new Date('2024-01-15T10:00:00'),
          new Date('2024-01-15T15:00:00'),
          new Date('2024-01-15T16:00:00')
        ),
      ];

      render(<ScheduleComparison optimizedEvents={events} />);
      
      expect(screen.getByTestId('total-events')).toHaveTextContent('2');
      expect(screen.getByTestId('moved-events')).toHaveTextContent('2');
      expect(screen.getByTestId('average-displacement')).toHaveTextContent('360 minutes');
      expect(screen.getByTestId('moved-earlier')).toHaveTextContent('1');
      expect(screen.getByTestId('moved-later')).toHaveTextContent('1');
    });

    it('should calculate average displacement correctly', () => {
      const events: OptimizedEvent[] = [
        createOptimizedEvent(
          'event1',
          'Task 1',
          new Date('2024-01-15T10:00:00'),
          new Date('2024-01-15T11:00:00'),
          new Date('2024-01-15T09:00:00'),
          new Date('2024-01-15T10:00:00')
        ),
        createOptimizedEvent(
          'event2',
          'Task 2',
          new Date('2024-01-15T14:00:00'),
          new Date('2024-01-15T15:00:00'),
          new Date('2024-01-15T17:00:00'),
          new Date('2024-01-15T18:00:00')
        ),
      ];

      render(<ScheduleComparison optimizedEvents={events} />);
      
      // Both events moved by 60 minutes (1 hour) and 180 minutes (3 hours)
      // Average: (60 + 180) / 2 = 120 minutes
      expect(screen.getByTestId('average-displacement')).toHaveTextContent('120 minutes');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for movement indicators', () => {
      const events: OptimizedEvent[] = [
        createOptimizedEvent(
          'event1',
          'Task',
          new Date('2024-01-15T14:00:00'),
          new Date('2024-01-15T15:00:00'),
          new Date('2024-01-15T10:00:00'),
          new Date('2024-01-15T11:00:00')
        ),
      ];

      render(<ScheduleComparison optimizedEvents={events} />);
      
      const indicator = screen.getByTestId('movement-indicator-event1');
      expect(indicator).toHaveAttribute('aria-label', 'Moved earlier');
    });

    it('should display summary section with proper heading structure', () => {
      const events: OptimizedEvent[] = [
        createOptimizedEvent(
          'event1',
          'Task',
          new Date('2024-01-15T09:00:00'),
          new Date('2024-01-15T10:00:00'),
          new Date('2024-01-15T09:00:00'),
          new Date('2024-01-15T10:00:00')
        ),
      ];

      render(<ScheduleComparison optimizedEvents={events} />);
      
      expect(screen.getByRole('heading', { name: /Schedule Optimization Comparison/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /Optimization Summary/i })).toBeInTheDocument();
    });
  });

  describe('Multiple Events', () => {
    it('should handle multiple events with mixed movement states', () => {
      const events: OptimizedEvent[] = [
        createOptimizedEvent(
          'event1',
          'Moved Earlier',
          new Date('2024-01-15T14:00:00'),
          new Date('2024-01-15T15:00:00'),
          new Date('2024-01-15T10:00:00'),
          new Date('2024-01-15T11:00:00')
        ),
        createOptimizedEvent(
          'event2',
          'Not Moved',
          new Date('2024-01-15T11:00:00'),
          new Date('2024-01-15T12:00:00'),
          new Date('2024-01-15T11:00:00'),
          new Date('2024-01-15T12:00:00')
        ),
        createOptimizedEvent(
          'event3',
          'Moved Later',
          new Date('2024-01-15T09:00:00'),
          new Date('2024-01-15T10:00:00'),
          new Date('2024-01-15T16:00:00'),
          new Date('2024-01-15T17:00:00')
        ),
      ];

      render(<ScheduleComparison optimizedEvents={events} />);
      
      expect(screen.getByTestId('total-events')).toHaveTextContent('3');
      expect(screen.getByTestId('moved-events')).toHaveTextContent('2');
      expect(screen.getByTestId('moved-earlier')).toHaveTextContent('1');
      expect(screen.getByTestId('moved-later')).toHaveTextContent('1');
      
      expect(screen.getByTestId('original-event-event1')).toHaveAttribute('data-is-moved', 'true');
      expect(screen.getByTestId('original-event-event2')).toHaveAttribute('data-is-moved', 'false');
      expect(screen.getByTestId('original-event-event3')).toHaveAttribute('data-is-moved', 'true');
    });
  });
});
