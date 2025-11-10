import React from 'react';
import { render, screen, within } from '@testing-library/react';
import ScheduleDisplay from '../components/ScheduleDisplay';
import { ClassifiedEvent } from '../types';
import { EnergyLevel, HourlyEnergy } from '../types/energy';

describe('ScheduleDisplay', () => {
  const mockEvents: ClassifiedEvent[] = [
    {
      uid: '1',
      summary: 'Morning Meeting',
      start: new Date('2024-01-15T09:00:00'),
      end: new Date('2024-01-15T10:00:00'),
      classification: 'heavy',
    },
    {
      uid: '2',
      summary: 'Lunch Break',
      start: new Date('2024-01-15T12:00:00'),
      end: new Date('2024-01-15T13:00:00'),
      classification: 'light',
    },
    {
      uid: '3',
      summary: 'Code Review',
      start: new Date('2024-01-15T14:30:00'),
      end: new Date('2024-01-15T15:30:00'),
      classification: 'medium',
    },
  ];

  const mockEnergyLevels: HourlyEnergy = {
    8: EnergyLevel.High,
    9: EnergyLevel.High,
    10: EnergyLevel.Medium,
    11: EnergyLevel.Medium,
    12: EnergyLevel.Low,
    13: EnergyLevel.Low,
    14: EnergyLevel.Medium,
    15: EnergyLevel.Medium,
    16: EnergyLevel.High,
    17: EnergyLevel.High,
    18: EnergyLevel.Medium,
    19: EnergyLevel.Low,
  };

  describe('Time Grid Display', () => {
    it('should render hour markers from 8 AM to 8 PM', () => {
      render(<ScheduleDisplay events={[]} showEnergyLevels={false} />);

      expect(screen.getByText('8 AM')).toBeInTheDocument();
      expect(screen.getByText('12 PM')).toBeInTheDocument();
      expect(screen.getByText('8 PM')).toBeInTheDocument();
    });

    it('should display 13 hour slots (8 AM through 8 PM inclusive)', () => {
      render(<ScheduleDisplay events={[]} showEnergyLevels={false} />);

      const expectedHours = ['8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM'];
      expectedHours.forEach(hour => {
        expect(screen.getByText(hour)).toBeInTheDocument();
      });
    });

    it('should have hour markers on the left side with proper ARIA labels', () => {
      render(<ScheduleDisplay events={[]} showEnergyLevels={false} />);

      const hourMarker = screen.getByLabelText('Hour marker for 9 AM');
      expect(hourMarker).toBeInTheDocument();
    });
  });

  describe('Event Rendering', () => {
    it('should render event titles', () => {
      render(<ScheduleDisplay events={mockEvents} showEnergyLevels={false} />);

      expect(screen.getByText('Morning Meeting')).toBeInTheDocument();
      expect(screen.getByText('Lunch Break')).toBeInTheDocument();
      expect(screen.getByText('Code Review')).toBeInTheDocument();
    });

    it('should display event duration', () => {
      render(<ScheduleDisplay events={mockEvents} showEnergyLevels={false} />);

      expect(screen.getAllByText(/1h/).length).toBeGreaterThan(0); // All events are 1 hour long
    });

    it('should position events correctly based on start time', () => {
      render(<ScheduleDisplay events={mockEvents} showEnergyLevels={false} />);

      const morningMeeting = screen.getByTestId('event-1');
      expect(morningMeeting).toHaveAttribute('data-start-hour', '9');
    });

    it('should apply cognitive load color coding as left border', () => {
      render(<ScheduleDisplay events={mockEvents} showEnergyLevels={false} />);

      const heavyEvent = screen.getByTestId('event-1');
      const lightEvent = screen.getByTestId('event-2');
      const mediumEvent = screen.getByTestId('event-3');

      expect(heavyEvent).toHaveClass('heavy');
      expect(lightEvent).toHaveClass('light');
      expect(mediumEvent).toHaveClass('medium');
    });

    it('should have rounded corners on event blocks', () => {
      render(<ScheduleDisplay events={mockEvents} showEnergyLevels={false} />);

      const eventBlock = screen.getByTestId('event-1');
      expect(eventBlock).toHaveClass('eventBlock');
    });
  });

  describe('Overlapping Events', () => {
    const overlappingEvents: ClassifiedEvent[] = [
      {
        uid: '1',
        summary: 'Meeting A',
        start: new Date('2024-01-15T10:00:00'),
        end: new Date('2024-01-15T11:00:00'),
        classification: 'heavy',
      },
      {
        uid: '2',
        summary: 'Meeting B',
        start: new Date('2024-01-15T10:30:00'),
        end: new Date('2024-01-15T11:30:00'),
        classification: 'medium',
      },
    ];

    it('should stack overlapping events horizontally', () => {
      render(<ScheduleDisplay events={overlappingEvents} showEnergyLevels={false} />);

      const eventA = screen.getByTestId('event-1');
      const eventB = screen.getByTestId('event-2');

      expect(eventA).toHaveAttribute('data-overlap-column', '0');
      expect(eventB).toHaveAttribute('data-overlap-column', '1');
    });

    it('should reduce width of overlapping events proportionally', () => {
      render(<ScheduleDisplay events={overlappingEvents} showEnergyLevels={false} />);

      const eventA = screen.getByTestId('event-1');
      expect(eventA).toHaveAttribute('data-total-columns', '2');
    });
  });

  describe('Energy Level Display', () => {
    it('should display energy level backgrounds when showEnergyLevels is true', () => {
      render(
        <ScheduleDisplay
          events={[]}
          showEnergyLevels={true}
          energyLevels={mockEnergyLevels}
        />
      );

      const highEnergySlot = screen.getByTestId('energy-slot-8');
      expect(highEnergySlot).toHaveClass('energyHigh');
    });

    it('should not display energy levels when showEnergyLevels is false', () => {
      render(
        <ScheduleDisplay
          events={[]}
          showEnergyLevels={false}
          energyLevels={mockEnergyLevels}
        />
      );

      const slot = screen.queryByTestId('energy-slot-8');
      expect(slot).not.toBeInTheDocument();
    });

    it('should apply correct energy level styling for each hour', () => {
      render(
        <ScheduleDisplay
          events={[]}
          showEnergyLevels={true}
          energyLevels={mockEnergyLevels}
        />
      );

      expect(screen.getByTestId('energy-slot-8')).toHaveClass('energyHigh');
      expect(screen.getByTestId('energy-slot-12')).toHaveClass('energyLow');
      expect(screen.getByTestId('energy-slot-14')).toHaveClass('energyMedium');
    });

    it('should handle missing energy levels gracefully', () => {
      const sparseEnergy: HourlyEnergy = {
        8: EnergyLevel.High,
        12: EnergyLevel.Low,
      };

      render(
        <ScheduleDisplay
          events={[]}
          showEnergyLevels={true}
          energyLevels={sparseEnergy}
        />
      );

      // Should not crash and should render energy slots
      expect(screen.getByTestId('energy-slot-8')).toBeInTheDocument();
      expect(screen.getByTestId('energy-slot-9')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should display empty state message when no events', () => {
      render(<ScheduleDisplay events={[]} showEnergyLevels={false} />);

      expect(screen.getByText(/No events scheduled/i)).toBeInTheDocument();
    });

    it('should still show time grid in empty state', () => {
      render(<ScheduleDisplay events={[]} showEnergyLevels={false} />);

      expect(screen.getByText('8 AM')).toBeInTheDocument();
      expect(screen.getByText('8 PM')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have appropriate ARIA labels for events', () => {
      render(<ScheduleDisplay events={mockEvents} showEnergyLevels={false} />);

      const event = screen.getByLabelText(/Morning Meeting.*9:00 AM.*10:00 AM/i);
      expect(event).toBeInTheDocument();
    });

    it('should use semantic HTML for timeline structure', () => {
      const { container } = render(<ScheduleDisplay events={mockEvents} showEnergyLevels={false} />);

      const timeline = container.querySelector('[role="list"]');
      expect(timeline).toBeInTheDocument();
    });

    it('should indicate cognitive load in ARIA label', () => {
      render(<ScheduleDisplay events={mockEvents} showEnergyLevels={false} />);

      const heavyEvent = screen.getByLabelText(/Morning Meeting.*heavy cognitive load/i);
      expect(heavyEvent).toBeInTheDocument();
    });

    it('should have proper keyboard navigation support', () => {
      render(<ScheduleDisplay events={mockEvents} showEnergyLevels={false} />);

      const eventBlocks = screen.getAllByRole('article');
      eventBlocks.forEach(block => {
        expect(block).toHaveAttribute('tabIndex', '0');
      });
    });
  });

  describe('Time Formatting', () => {
    it('should format times in 12-hour format', () => {
      render(<ScheduleDisplay events={mockEvents} showEnergyLevels={false} />);

      expect(screen.getByText(/9:00 AM/i)).toBeInTheDocument();
      expect(screen.getByText(/2:30 PM/i)).toBeInTheDocument();
    });

    it('should handle events spanning multiple hours', () => {
      const longEvent: ClassifiedEvent[] = [
        {
          uid: '1',
          summary: 'All Day Workshop',
          start: new Date('2024-01-15T09:00:00'),
          end: new Date('2024-01-15T17:00:00'),
          classification: 'heavy',
        },
      ];

      render(<ScheduleDisplay events={longEvent} showEnergyLevels={false} />);

      const event = screen.getByTestId('event-1');
      expect(event).toHaveAttribute('data-duration-hours', '8');
    });

    it('should handle events with minute precision', () => {
      const preciseEvent: ClassifiedEvent[] = [
        {
          uid: '1',
          summary: 'Quick Sync',
          start: new Date('2024-01-15T10:15:00'),
          end: new Date('2024-01-15T10:30:00'),
          classification: 'light',
        },
      ];

      render(<ScheduleDisplay events={preciseEvent} showEnergyLevels={false} />);

      expect(screen.getByText(/10:15 AM/i)).toBeInTheDocument();
      expect(screen.getByText(/15m/i)).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('should apply responsive width classes', () => {
      const { container } = render(<ScheduleDisplay events={mockEvents} showEnergyLevels={false} />);

      const scheduleDisplay = container.firstChild;
      expect(scheduleDisplay).toHaveClass('scheduleDisplay');
    });
  });
});
