import { buildICSFile } from '../utils/icsBuilder';
import { OptimizedEvent } from '../types';
import { CognitiveLoad } from '../types/classification';
import ICAL from 'ical.js';

describe('buildICSFile', () => {
  const createTestEvent = (overrides?: Partial<OptimizedEvent>): OptimizedEvent => {
    const start = new Date('2024-01-15T09:00:00');
    const end = new Date('2024-01-15T10:00:00');
    
    return {
      uid: 'test-event-123',
      summary: 'Test Event',
      start,
      end,
      originalStart: new Date('2024-01-15T14:00:00'),
      originalEnd: new Date('2024-01-15T15:00:00'),
      classification: 'heavy' as CognitiveLoad,
      ...overrides,
    };
  };

  describe('RFC 5545 Format Compliance', () => {
    it('should generate a valid ICS file with proper structure', () => {
      const events = [createTestEvent()];
      const icsContent = buildICSFile(events);

      expect(icsContent).toContain('BEGIN:VCALENDAR');
      expect(icsContent).toContain('END:VCALENDAR');
      expect(icsContent).toContain('BEGIN:VEVENT');
      expect(icsContent).toContain('END:VEVENT');
    });

    it('should include required VCALENDAR properties', () => {
      const events = [createTestEvent()];
      const icsContent = buildICSFile(events);

      expect(icsContent).toContain('VERSION:2.0');
      expect(icsContent).toContain('PRODID:-//TurtleRocket//Time Twister//EN');
      expect(icsContent).toContain('CALSCALE:GREGORIAN');
    });

    it('should be parseable by ical.js', () => {
      const events = [createTestEvent()];
      const icsContent = buildICSFile(events);

      expect(() => {
        const jcalData = ICAL.parse(icsContent);
        const comp = new ICAL.Component(jcalData);
        expect(comp.name).toBe('vcalendar');
      }).not.toThrow();
    });

    it('should fold long lines at 75 octets', () => {
      const events = [createTestEvent({
        summary: 'This is a very long event title that should be folded according to RFC 5545 because it exceeds the maximum line length',
      })];
      const icsContent = buildICSFile(events);

      const lines = icsContent.split('\r\n');
      const longLines = lines.filter(line => !line.startsWith(' ') && line.length > 75);
      
      expect(longLines.length).toBe(0);
    });

    it('should use CRLF line endings', () => {
      const events = [createTestEvent()];
      const icsContent = buildICSFile(events);

      expect(icsContent).toContain('\r\n');
      expect(icsContent).not.toMatch(/(?<!\r)\n/);
    });
  });

  describe('Event Serialization', () => {
    it('should preserve original event UIDs', () => {
      const events = [createTestEvent({ uid: 'unique-event-id-456' })];
      const icsContent = buildICSFile(events);

      expect(icsContent).toContain('UID:unique-event-id-456');
    });

    it('should include event summary', () => {
      const events = [createTestEvent({ summary: 'Team Meeting' })];
      const icsContent = buildICSFile(events);

      expect(icsContent).toContain('SUMMARY:Team Meeting');
    });

    it('should use optimized start and end times', () => {
      const start = new Date('2024-01-15T09:00:00Z');
      const end = new Date('2024-01-15T10:00:00Z');
      const events = [createTestEvent({ start, end })];
      const icsContent = buildICSFile(events);

      expect(icsContent).toContain('DTSTART:20240115T090000Z');
      expect(icsContent).toContain('DTEND:20240115T100000Z');
    });

    it('should add X-TURTLEROCKET-OPTIMIZED property', () => {
      const events = [createTestEvent()];
      const icsContent = buildICSFile(events);

      expect(icsContent).toContain('X-TURTLEROCKET-OPTIMIZED:true');
    });

    it('should include original times in custom properties', () => {
      const originalStart = new Date('2024-01-15T14:00:00Z');
      const originalEnd = new Date('2024-01-15T15:00:00Z');
      const events = [createTestEvent({ originalStart, originalEnd })];
      const icsContent = buildICSFile(events);

      expect(icsContent).toContain('X-TURTLEROCKET-ORIGINAL-START:20240115T140000Z');
      expect(icsContent).toContain('X-TURTLEROCKET-ORIGINAL-END:20240115T150000Z');
    });

    it('should include classification as custom property', () => {
      const events = [createTestEvent({ classification: 'medium' })];
      const icsContent = buildICSFile(events);

      expect(icsContent).toContain('X-TURTLEROCKET-CLASSIFICATION:medium');
    });

    it('should add DTSTAMP with current time', () => {
      const events = [createTestEvent()];
      const beforeTime = new Date();
      const icsContent = buildICSFile(events);
      const afterTime = new Date();

      const dtstampMatch = icsContent.match(/DTSTAMP:(\d{8}T\d{6}Z)/);
      expect(dtstampMatch).toBeTruthy();
      
      if (dtstampMatch) {
        const timestamp = dtstampMatch[1];
        const year = parseInt(timestamp.substring(0, 4));
        const month = parseInt(timestamp.substring(4, 6)) - 1;
        const day = parseInt(timestamp.substring(6, 8));
        const hour = parseInt(timestamp.substring(9, 11));
        const minute = parseInt(timestamp.substring(11, 13));
        const second = parseInt(timestamp.substring(13, 15));
        
        const dtstampDate = new Date(Date.UTC(year, month, day, hour, minute, second));
        expect(dtstampDate.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime() - 1000);
        expect(dtstampDate.getTime()).toBeLessThanOrEqual(afterTime.getTime() + 1000);
      }
    });
  });

  describe('Special Character Escaping', () => {
    it('should escape backslashes in summary', () => {
      const events = [createTestEvent({ summary: 'Path: C:\\Users\\Test' })];
      const icsContent = buildICSFile(events);

      expect(icsContent).toContain('SUMMARY:Path: C:\\\\Users\\\\Test');
    });

    it('should escape semicolons in summary', () => {
      const events = [createTestEvent({ summary: 'Meeting; Discuss Q4 Results' })];
      const icsContent = buildICSFile(events);

      expect(icsContent).toContain('SUMMARY:Meeting\\; Discuss Q4 Results');
    });

    it('should escape commas in summary', () => {
      const events = [createTestEvent({ summary: 'Review, approve, and deploy' })];
      const icsContent = buildICSFile(events);

      expect(icsContent).toContain('SUMMARY:Review\\, approve\\, and deploy');
    });

    it('should escape newlines in summary', () => {
      const events = [createTestEvent({ summary: 'Line 1\nLine 2' })];
      const icsContent = buildICSFile(events);

      expect(icsContent).toContain('SUMMARY:Line 1\\nLine 2');
    });

    it('should handle multiple special characters', () => {
      const events = [createTestEvent({ summary: 'Test\\Event; with, special\nchars' })];
      const icsContent = buildICSFile(events);

      expect(icsContent).toContain('SUMMARY:Test\\\\Event\\; with\\, special\\nchars');
    });
  });

  describe('Multiple Events', () => {
    it('should handle empty event array', () => {
      const icsContent = buildICSFile([]);

      expect(icsContent).toContain('BEGIN:VCALENDAR');
      expect(icsContent).toContain('END:VCALENDAR');
      expect(icsContent).not.toContain('BEGIN:VEVENT');
    });

    it('should serialize multiple events', () => {
      const events = [
        createTestEvent({ uid: 'event-1', summary: 'Event 1' }),
        createTestEvent({ uid: 'event-2', summary: 'Event 2' }),
        createTestEvent({ uid: 'event-3', summary: 'Event 3' }),
      ];
      const icsContent = buildICSFile(events);

      expect(icsContent.match(/BEGIN:VEVENT/g)?.length).toBe(3);
      expect(icsContent.match(/END:VEVENT/g)?.length).toBe(3);
      expect(icsContent).toContain('UID:event-1');
      expect(icsContent).toContain('UID:event-2');
      expect(icsContent).toContain('UID:event-3');
    });

    it('should preserve event order', () => {
      const events = [
        createTestEvent({ uid: 'first', summary: 'First' }),
        createTestEvent({ uid: 'second', summary: 'Second' }),
        createTestEvent({ uid: 'third', summary: 'Third' }),
      ];
      const icsContent = buildICSFile(events);

      const firstIndex = icsContent.indexOf('UID:first');
      const secondIndex = icsContent.indexOf('UID:second');
      const thirdIndex = icsContent.indexOf('UID:third');

      expect(firstIndex).toBeLessThan(secondIndex);
      expect(secondIndex).toBeLessThan(thirdIndex);
    });
  });

  describe('Timezone Handling', () => {
    it('should use UTC timezone for all timestamps', () => {
      const events = [createTestEvent()];
      const icsContent = buildICSFile(events);

      const timestampPattern = /DT(START|END|STAMP):\d{8}T\d{6}Z/g;
      const timestamps = icsContent.match(timestampPattern);
      
      expect(timestamps).toBeTruthy();
      expect(timestamps!.length).toBeGreaterThan(0);
      timestamps!.forEach(ts => {
        expect(ts).toMatch(/Z$/);
      });
    });

    it('should convert local times to UTC', () => {
      const localDate = new Date('2024-01-15T09:00:00-05:00'); // EST
      const events = [createTestEvent({ start: localDate })];
      const icsContent = buildICSFile(events);

      const utcTime = localDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
      expect(icsContent).toContain(`DTSTART:${utcTime}`);
    });

    it('should not include VTIMEZONE component', () => {
      const events = [createTestEvent()];
      const icsContent = buildICSFile(events);

      expect(icsContent).not.toContain('BEGIN:VTIMEZONE');
      expect(icsContent).not.toContain('TZID');
    });
  });

  describe('Integration Tests', () => {
    it('should generate valid ICS that can be parsed back', () => {
      const originalEvents = [
        createTestEvent({
          uid: 'event-1',
          summary: 'Morning Standup',
          start: new Date('2024-01-15T09:00:00Z'),
          end: new Date('2024-01-15T09:30:00Z'),
          classification: 'light',
        }),
        createTestEvent({
          uid: 'event-2',
          summary: 'Deep Work Session',
          start: new Date('2024-01-15T10:00:00Z'),
          end: new Date('2024-01-15T12:00:00Z'),
          classification: 'heavy',
        }),
      ];

      const icsContent = buildICSFile(originalEvents);
      const jcalData = ICAL.parse(icsContent);
      const comp = new ICAL.Component(jcalData);
      const vevents = comp.getAllSubcomponents('vevent');

      expect(vevents.length).toBe(2);
      
      const event1 = vevents[0];
      expect(event1.getFirstPropertyValue('uid')).toBe('event-1');
      expect(event1.getFirstPropertyValue('summary')).toBe('Morning Standup');
      
      const event2 = vevents[1];
      expect(event2.getFirstPropertyValue('uid')).toBe('event-2');
      expect(event2.getFirstPropertyValue('summary')).toBe('Deep Work Session');
    });

    it('should maintain data integrity through parse-serialize cycle', () => {
      const events = [createTestEvent({
        uid: 'cycle-test',
        summary: 'Test Event',
        start: new Date('2024-01-15T14:00:00Z'),
        end: new Date('2024-01-15T15:00:00Z'),
      })];

      const icsContent = buildICSFile(events);
      const jcalData = ICAL.parse(icsContent);
      const comp = new ICAL.Component(jcalData);
      const vevent = comp.getFirstSubcomponent('vevent');

      expect(vevent.getFirstPropertyValue('uid')).toBe('cycle-test');
      expect(vevent.getFirstPropertyValue('summary')).toBe('Test Event');
      
      const dtstart = vevent.getFirstPropertyValue('dtstart');
      expect(dtstart.toJSDate().toISOString()).toBe('2024-01-15T14:00:00.000Z');
      
      const dtend = vevent.getFirstPropertyValue('dtend');
      expect(dtend.toJSDate().toISOString()).toBe('2024-01-15T15:00:00.000Z');
    });
  });

  describe('Edge Cases', () => {
    it('should handle events with same start and end times', () => {
      const time = new Date('2024-01-15T09:00:00Z');
      const events = [createTestEvent({ start: time, end: time })];
      const icsContent = buildICSFile(events);

      expect(icsContent).toContain('DTSTART:20240115T090000Z');
      expect(icsContent).toContain('DTEND:20240115T090000Z');
    });

    it('should handle events at year boundaries', () => {
      const events = [createTestEvent({
        start: new Date('2023-12-31T23:00:00Z'),
        end: new Date('2024-01-01T01:00:00Z'),
      })];
      const icsContent = buildICSFile(events);

      expect(icsContent).toContain('DTSTART:20231231T230000Z');
      expect(icsContent).toContain('DTEND:20240101T010000Z');
    });

    it('should handle empty summary', () => {
      const events = [createTestEvent({ summary: '' })];
      const icsContent = buildICSFile(events);

      expect(icsContent).toContain('SUMMARY:');
    });

    it('should handle very long UIDs', () => {
      const longUid = 'x'.repeat(200);
      const events = [createTestEvent({ uid: longUid })];
      const icsContent = buildICSFile(events);

      // Remove folding to check full UID is present
      const unfoldedContent = icsContent.replace(/\r\n /g, '');
      expect(unfoldedContent).toContain(`UID:${longUid}`);
      
      // Verify line folding for long UID
      const lines = icsContent.split('\r\n');
      const uidLineIndex = lines.findIndex(line => line.startsWith('UID:'));
      expect(lines[uidLineIndex].length).toBeLessThanOrEqual(75);
    });
  });
});
