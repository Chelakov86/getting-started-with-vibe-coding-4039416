import { parseICS } from '../utils/icsParser';
import { classifyEvents } from '../utils/classifier';
import { optimizeSchedule } from '../utils/optimizer';
import { buildICS } from '../utils/icsBuilder';
import { validateEnergyLevels } from '../utils/validation';
import {
  generateMockEvents,
  generateBoundaryEvents,
  generateOverlappingEvents,
  createMockICSFile,
  createEmptyICSFile,
  ICSFileBuilder,
  generateEventsWithKeywords,
} from '../test-utils';
import { HourlyEnergy } from '../types/energy';
import { CalendarEvent } from '../types';

describe('Edge Cases and Boundary Conditions Tests', () => {
  describe('Empty and Null Input Handling', () => {
    it('should handle empty calendar file', () => {
      const content = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test Calendar//EN
CALNAME:Empty Calendar
END:VCALENDAR`;

      const parsed = parseICS(content);

      expect(parsed).toBeDefined();
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBe(0);
    });

    it('should handle empty events array', () => {
      const events: CalendarEvent[] = [];

      const classified = classifyEvents(events);

      expect(classified).toBeDefined();
      expect(classified.length).toBe(0);
    });

    it('should handle empty energy configuration', () => {
      const events = generateMockEvents({ count: 5 });
      const classified = classifyEvents(events);
      const energy: HourlyEnergy = {};

      const optimized = optimizeSchedule(classified, energy);

      expect(optimized).toBeDefined();
      expect(optimized.length).toBe(5);
    });

    it('should handle empty summary', () => {
      const events: CalendarEvent[] = [
        {
          uid: 'test-1',
          summary: 'Meeting',
          start: new Date('2024-01-01T09:00:00'),
          end: new Date('2024-01-01T10:00:00'),
        },
      ];

      const classified = classifyEvents(events);

      expect(classified.length).toBe(1);
      expect(classified[0].classification).toBeDefined();
    });
  });

  describe('Day Boundary Events', () => {
    it('should handle events at midnight', () => {
      const events = generateBoundaryEvents();
      const classified = classifyEvents(events);

      const midnightEvent = classified.find(e => e.start.getHours() === 0);
      expect(midnightEvent).toBeDefined();
      expect(midnightEvent?.classification).toBeDefined();
    });

    it('should handle events crossing midnight', () => {
      const event: CalendarEvent = {
        uid: 'midnight-cross',
        summary: 'Late Night Meeting Event',
        start: new Date('2024-01-01T23:30:00'),
        end: new Date('2024-01-02T00:30:00'),
      };

      const classified = classifyEvents([event]);

      expect(classified.length).toBe(1);
      expect(classified[0].end.getDate()).toBe(2);
    });

    it('should handle events at end of day', () => {
      const event: CalendarEvent = {
        uid: 'end-of-day',
        summary: 'Late Meeting Event',
        start: new Date('2024-01-01T23:00:00'),
        end: new Date('2024-01-01T23:59:59'),
      };

      const classified = classifyEvents([event]);

      expect(classified.length).toBe(1);
      expect(classified[0].start.getHours()).toBe(23);
    });

    it('should optimize events spanning multiple days', () => {
      const event: CalendarEvent = {
        uid: 'multi-day',
        summary: 'Conference Meeting',
        start: new Date('2024-01-01T09:00:00'),
        end: new Date('2024-01-03T17:00:00'),
      };

      const classified = classifyEvents([event]);
      const energy: HourlyEnergy = { 9: 3, 10: 3, 11: 3, 12: 2, 13: 2, 14: 2, 15: 1, 16: 1, 17: 1 };

      const optimized = optimizeSchedule(classified, energy);

      expect(optimized.length).toBe(1);
      expect(optimized[0].start).toBeDefined();
      expect(optimized[0].end).toBeDefined();
    });
  });

  describe('Overlapping Events', () => {
    it('should handle overlapping events', () => {
      const events = generateOverlappingEvents(5);
      const classified = classifyEvents(events);

      expect(classified.length).toBe(5);
      classified.forEach(event => {
        expect(event.classification).toBeDefined();
      });
    });

    it('should handle completely overlapping events', () => {
      const baseTime = new Date('2024-01-01T09:00:00');
      const events: CalendarEvent[] = [
        {
          uid: 'event-1',
          summary: 'Meeting Event 1',
          start: new Date(baseTime),
          end: new Date(baseTime.getTime() + 3600000),
        },
        {
          uid: 'event-2',
          summary: 'Meeting Event 2',
          start: new Date(baseTime),
          end: new Date(baseTime.getTime() + 3600000),
        },
      ];

      const classified = classifyEvents(events);
      const energy: HourlyEnergy = { 9: 3 };

      const optimized = optimizeSchedule(classified, energy);

      expect(optimized.length).toBe(2);
    });

    it('should handle partially overlapping events', () => {
      const events: CalendarEvent[] = [
        {
          uid: 'event-1',
          summary: 'Morning Meeting',
          start: new Date('2024-01-01T09:00:00'),
          end: new Date('2024-01-01T10:30:00'),
        },
        {
          uid: 'event-2',
          summary: 'Team Sync',
          start: new Date('2024-01-01T10:00:00'),
          end: new Date('2024-01-01T11:00:00'),
        },
      ];

      const classified = classifyEvents(events);

      expect(classified.length).toBe(2);
    });
  });

  describe('Large Dataset Boundaries', () => {
    it('should handle exactly 100 events', () => {
      const events = generateMockEvents({ count: 100 });
      const classified = classifyEvents(events);

      expect(classified.length).toBe(100);
    });

    it('should handle 1000+ events', () => {
      const events = generateMockEvents({ count: 1001 });
      const classified = classifyEvents(events);

      expect(classified.length).toBe(1001);
    });

    it('should handle single event', () => {
      const events = generateMockEvents({ count: 1 });
      const classified = classifyEvents(events);
      const energy: HourlyEnergy = { 9: 3 };

      const optimized = optimizeSchedule(classified, energy);

      expect(optimized.length).toBe(1);
    });
  });

  describe('Extreme Time Values', () => {
    it('should handle events with zero duration', () => {
      const event: CalendarEvent = {
        uid: 'zero-duration',
        summary: 'Instant Meeting Event',
        start: new Date('2024-01-01T09:00:00'),
        end: new Date('2024-01-01T09:00:00'),
      };

      const classified = classifyEvents([event]);

      expect(classified.length).toBe(1);
      expect(classified[0].start.getTime()).toBe(classified[0].end.getTime());
    });

    it('should handle very long events (weeks)', () => {
      const start = new Date('2024-01-01T09:00:00');
      const end = new Date(start);
      end.setDate(end.getDate() + 14);

      const event: CalendarEvent = {
        uid: 'long-event',
        summary: 'Two Week Project Meeting',
        start,
        end,
      };

      const classified = classifyEvents([event]);

      expect(classified.length).toBe(1);
      expect(classified[0].end.getTime() - classified[0].start.getTime()).toBeGreaterThan(0);
    });

    it('should handle events at beginning of Unix epoch', () => {
      const event: CalendarEvent = {
        uid: 'epoch',
        summary: 'Historical Meeting Event',
        start: new Date('1970-01-01T00:00:00'),
        end: new Date('1970-01-01T01:00:00'),
      };

      const classified = classifyEvents([event]);

      expect(classified.length).toBe(1);
    });

    it('should handle events far in future', () => {
      const event: CalendarEvent = {
        uid: 'future',
        summary: 'Future Meeting Event',
        start: new Date('2099-12-31T23:00:00'),
        end: new Date('2099-12-31T23:59:59'),
      };

      const classified = classifyEvents([event]);

      expect(classified.length).toBe(1);
    });
  });

  describe('Keyword Edge Cases', () => {
    it('should handle events with no matching keywords', () => {
      const events: CalendarEvent[] = [
        {
          uid: 'no-match',
          summary: 'xyz123abc meeting',
          start: new Date('2024-01-01T09:00:00'),
          end: new Date('2024-01-01T10:00:00'),
        },
      ];

      const classified = classifyEvents(events);

      expect(classified.length).toBe(1);
      expect(classified[0].classification).toBeDefined();
    });

    it('should handle events with multiple keyword matches', () => {
      const events: CalendarEvent[] = [
        {
          uid: 'multi-match',
          summary: 'Strategy Planning Meeting Review Session Analysis',
          start: new Date('2024-01-01T09:00:00'),
          end: new Date('2024-01-01T10:00:00'),
        },
      ];

      const classified = classifyEvents(events);

      expect(classified.length).toBe(1);
      expect(classified[0].classification).toBeDefined();
    });

    it('should handle events with special characters', () => {
      const events: CalendarEvent[] = [
        {
          uid: 'special',
          summary: 'Meeting!@#$%^&*()_+-=[]{}|;:\'",.<>?/',
          start: new Date('2024-01-01T09:00:00'),
          end: new Date('2024-01-01T10:00:00'),
        },
      ];

      const classified = classifyEvents(events);

      expect(classified.length).toBe(1);
    });

    it('should handle case sensitivity correctly', () => {
      const events: CalendarEvent[] = [
        {
          uid: 'upper',
          summary: 'STRATEGY MEETING',
          start: new Date('2024-01-01T09:00:00'),
          end: new Date('2024-01-01T10:00:00'),
        },
        {
          uid: 'lower',
          summary: 'strategy meeting',
          start: new Date('2024-01-01T10:00:00'),
          end: new Date('2024-01-01T11:00:00'),
        },
      ];

      const classified = classifyEvents(events);

      expect(classified.length).toBe(2);
      expect(classified[0].classification).toBe(classified[1].classification);
    });

    it('should handle very long event titles', () => {
      const longTitle = 'A'.repeat(1000);
      const events: CalendarEvent[] = [
        {
          uid: 'long-title',
          summary: longTitle,
          start: new Date('2024-01-01T09:00:00'),
          end: new Date('2024-01-01T10:00:00'),
        },
      ];

      const classified = classifyEvents(events);

      expect(classified.length).toBe(1);
    });
  });

  describe('Energy Level Edge Cases', () => {
    it('should handle all minimum energy levels', () => {
      const events = generateMockEvents({ count: 5 });
      const classified = classifyEvents(events);
      const energy: HourlyEnergy = {};
      
      for (let i = 0; i < 24; i++) {
        energy[i] = 1;
      }

      const optimized = optimizeSchedule(classified, energy);

      expect(optimized.length).toBe(5);
    });

    it('should handle all maximum energy levels', () => {
      const events = generateMockEvents({ count: 5 });
      const classified = classifyEvents(events);
      const energy: HourlyEnergy = {};
      
      for (let i = 0; i < 24; i++) {
        energy[i] = 3;
      }

      const optimized = optimizeSchedule(classified, energy);

      expect(optimized.length).toBe(5);
    });

    it('should handle sparse energy configuration', () => {
      const events = generateMockEvents({ count: 5 });
      const classified = classifyEvents(events);
      const energy: HourlyEnergy = { 9: 3, 15: 1 };

      const optimized = optimizeSchedule(classified, energy);

      expect(optimized.length).toBe(5);
    });

    it('should validate energy levels at boundaries', () => {
      const energy: HourlyEnergy = {
        0: 1,
        23: 3,
      };

      const isValid = validateEnergyLevels(energy);
      expect(isValid).toBe(true);
    });
  });

  describe('ICS Format Edge Cases', () => {
    it('should handle ICS with missing optional fields', () => {
      const content = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:test-1
DTSTART:20240101T090000Z
DTEND:20240101T100000Z
SUMMARY:Test Event
END:VEVENT
END:VCALENDAR`;

      const parsed = parseICS(content);

      expect(parsed.length).toBe(1);
    });

    it('should handle ICS with extra whitespace', () => {
      const content = `BEGIN:VCALENDAR
VERSION:2.0

BEGIN:VEVENT
UID:test-1  
DTSTART:20240101T090000Z  
DTEND:20240101T100000Z  
SUMMARY:Test Event  
END:VEVENT

END:VCALENDAR`;

      const parsed = parseICS(content);

      expect(parsed.length).toBe(1);
    });

    it('should handle ICS with different line endings', () => {
      const content = 'BEGIN:VCALENDAR\rVERSION:2.0\rBEGIN:VEVENT\rUID:test-1\rDTSTART:20240101T090000Z\rDTEND:20240101T100000Z\rSUMMARY:Test\rEND:VEVENT\rEND:VCALENDAR';

      const parsed = parseICS(content);

      expect(parsed.length).toBe(1);
    });
  });

  describe('Optimization Edge Cases', () => {
    it('should handle unoptimizable schedules', () => {
      const events = generateMockEvents({ count: 100, spacing: 0 });
      const classified = classifyEvents(events);
      const energy: HourlyEnergy = { 9: 2 };

      const optimized = optimizeSchedule(classified, energy);

      expect(optimized.length).toBe(100);
    });

    it('should preserve event data through optimization', () => {
      const events = generateMockEvents({ count: 5 });
      const originalSummaries = events.map(e => e.summary);
      
      const classified = classifyEvents(events);
      const energy: HourlyEnergy = { 9: 3, 14: 1 };

      const optimized = optimizeSchedule(classified, energy);

      const optimizedSummaries = optimized.map(e => e.summary);
      originalSummaries.forEach(summary => {
        expect(optimizedSummaries).toContain(summary);
      });
    });
  });

  describe('Export Edge Cases', () => {
    it('should build valid ICS from empty array', () => {
      const ics = buildICS([]);

      expect(ics).toContain('BEGIN:VCALENDAR');
      expect(ics).toContain('END:VCALENDAR');
    });

    it('should build valid ICS from single event', () => {
      const events = generateMockEvents({ count: 1 });
      const ics = buildICS(events);

      expect(ics).toContain('BEGIN:VCALENDAR');
      expect(ics).toContain('BEGIN:VEVENT');
      expect(ics).toContain('END:VEVENT');
      expect(ics).toContain('END:VCALENDAR');
    });

    it('should handle special characters in export', () => {
      const events: CalendarEvent[] = [
        {
          uid: 'special',
          summary: 'Meeting with "quotes" and \\backslashes\\',
          start: new Date('2024-01-01T09:00:00'),
          end: new Date('2024-01-01T10:00:00'),
        },
      ];

      const ics = buildICS(events);

      expect(ics).toContain('BEGIN:VCALENDAR');
    });
  });
});
