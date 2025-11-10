import { parseICSFile, ICSParseError, ParsedEvent } from '../utils/icsParser';

describe('icsParser', () => {
  describe('parseICSFile', () => {
    it('should parse a valid ICS file with a single event', () => {
      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
UID:test-event-1@example.com
SUMMARY:Team Meeting
DTSTART:20231115T100000Z
DTEND:20231115T110000Z
END:VEVENT
END:VCALENDAR`;

      const events = parseICSFile(icsContent);
      
      expect(events).toHaveLength(1);
      expect(events[0].id).toBe('test-event-1@example.com');
      expect(events[0].title).toBe('Team Meeting');
      expect(events[0].startTime).toBeInstanceOf(Date);
      expect(events[0].endTime).toBeInstanceOf(Date);
      expect(events[0].originalStartTime).toEqual(events[0].startTime);
    });

    it('should parse multiple events from ICS file', () => {
      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
UID:event-1@example.com
SUMMARY:Morning Standup
DTSTART:20231115T090000Z
DTEND:20231115T093000Z
END:VEVENT
BEGIN:VEVENT
UID:event-2@example.com
SUMMARY:Code Review
DTSTART:20231115T140000Z
DTEND:20231115T150000Z
END:VEVENT
BEGIN:VEVENT
UID:event-3@example.com
SUMMARY:Client Call
DTSTART:20231115T160000Z
DTEND:20231115T170000Z
END:VEVENT
END:VCALENDAR`;

      const events = parseICSFile(icsContent);
      
      expect(events).toHaveLength(3);
      expect(events[0].title).toBe('Morning Standup');
      expect(events[1].title).toBe('Code Review');
      expect(events[2].title).toBe('Client Call');
    });

    it('should handle timezone conversions to local time', () => {
      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
UID:tz-event@example.com
SUMMARY:Timezone Test
DTSTART:20231115T150000Z
DTEND:20231115T160000Z
END:VEVENT
END:VCALENDAR`;

      const events = parseICSFile(icsContent);
      
      expect(events).toHaveLength(1);
      expect(events[0].startTime).toBeInstanceOf(Date);
      expect(events[0].endTime).toBeInstanceOf(Date);
      
      // Verify the dates are valid
      expect(events[0].startTime.getTime()).toBeLessThan(events[0].endTime.getTime());
    });

    it('should filter out all-day events', () => {
      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
UID:all-day@example.com
SUMMARY:All Day Event
DTSTART;VALUE=DATE:20231115
DTEND;VALUE=DATE:20231116
END:VEVENT
BEGIN:VEVENT
UID:timed-event@example.com
SUMMARY:Timed Event
DTSTART:20231115T100000Z
DTEND:20231115T110000Z
END:VEVENT
END:VCALENDAR`;

      const events = parseICSFile(icsContent);
      
      expect(events).toHaveLength(1);
      expect(events[0].title).toBe('Timed Event');
      expect(events[0].id).toBe('timed-event@example.com');
    });

    it('should filter out events starting before 8 AM', () => {
      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
UID:early-event@example.com
SUMMARY:Early Morning Meeting
DTSTART:20231115T060000
DTEND:20231115T070000
END:VEVENT
BEGIN:VEVENT
UID:valid-event@example.com
SUMMARY:Valid Meeting
DTSTART:20231115T080000
DTEND:20231115T090000
END:VEVENT
END:VCALENDAR`;

      const events = parseICSFile(icsContent);
      
      expect(events).toHaveLength(1);
      expect(events[0].title).toBe('Valid Meeting');
    });

    it('should filter out events ending after 8 PM', () => {
      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
UID:late-event@example.com
SUMMARY:Late Evening Event
DTSTART:20231115T190000
DTEND:20231115T210000
END:VEVENT
BEGIN:VEVENT
UID:valid-event@example.com
SUMMARY:Valid Event
DTSTART:20231115T180000
DTEND:20231115T200000
END:VEVENT
END:VCALENDAR`;

      const events = parseICSFile(icsContent);
      
      expect(events).toHaveLength(1);
      expect(events[0].title).toBe('Valid Event');
    });

    it('should include events ending exactly at 8 PM', () => {
      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
UID:boundary-event@example.com
SUMMARY:Boundary Event
DTSTART:20231115T190000
DTEND:20231115T200000
END:VEVENT
END:VCALENDAR`;

      const events = parseICSFile(icsContent);
      
      expect(events).toHaveLength(1);
      expect(events[0].title).toBe('Boundary Event');
    });

    it('should exclude events ending after 8 PM (even by a minute)', () => {
      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
UID:overtime-event@example.com
SUMMARY:Overtime Event
DTSTART:20231115T190000
DTEND:20231115T200100
END:VEVENT
END:VCALENDAR`;

      const events = parseICSFile(icsContent);
      
      expect(events).toHaveLength(0);
    });

    it('should include events starting at 8 AM', () => {
      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
UID:early-start@example.com
SUMMARY:Early Start
DTSTART:20231115T080000
DTEND:20231115T090000
END:VEVENT
END:VCALENDAR`;

      const events = parseICSFile(icsContent);
      
      expect(events).toHaveLength(1);
      expect(events[0].title).toBe('Early Start');
    });

    it('should throw ICSParseError for empty file content', () => {
      expect(() => parseICSFile('')).toThrow(ICSParseError);
      expect(() => parseICSFile('')).toThrow('File content is empty');
    });

    it('should throw ICSParseError for whitespace-only content', () => {
      expect(() => parseICSFile('   \n\t  ')).toThrow(ICSParseError);
      expect(() => parseICSFile('   \n\t  ')).toThrow('File content is empty');
    });

    it('should throw ICSParseError for malformed ICS file', () => {
      const malformedContent = 'This is not a valid ICS file';
      
      expect(() => parseICSFile(malformedContent)).toThrow(ICSParseError);
      expect(() => parseICSFile(malformedContent)).toThrow('Invalid ICS file format');
    });

    it('should throw ICSParseError for incomplete ICS structure', () => {
      const incompleteContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT`;
      
      expect(() => parseICSFile(incompleteContent)).toThrow(ICSParseError);
    });

    it('should throw ICSParseError when no events are found', () => {
      const noEventsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
END:VCALENDAR`;
      
      expect(() => parseICSFile(noEventsContent)).toThrow(ICSParseError);
      expect(() => parseICSFile(noEventsContent)).toThrow('No events found in ICS file');
    });

    it('should skip events with missing UID', () => {
      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
SUMMARY:Missing UID
DTSTART:20231115T100000Z
DTEND:20231115T110000Z
END:VEVENT
BEGIN:VEVENT
UID:valid@example.com
SUMMARY:Valid Event
DTSTART:20231115T120000Z
DTEND:20231115T130000Z
END:VEVENT
END:VCALENDAR`;

      const events = parseICSFile(icsContent);
      
      expect(events).toHaveLength(1);
      expect(events[0].title).toBe('Valid Event');
    });

    it('should skip events with missing SUMMARY', () => {
      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
UID:no-summary@example.com
DTSTART:20231115T100000Z
DTEND:20231115T110000Z
END:VEVENT
BEGIN:VEVENT
UID:valid@example.com
SUMMARY:Valid Event
DTSTART:20231115T120000Z
DTEND:20231115T130000Z
END:VEVENT
END:VCALENDAR`;

      const events = parseICSFile(icsContent);
      
      expect(events).toHaveLength(1);
      expect(events[0].title).toBe('Valid Event');
    });

    it('should skip events with missing DTSTART', () => {
      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
UID:no-start@example.com
SUMMARY:No Start Time
DTEND:20231115T110000Z
END:VEVENT
BEGIN:VEVENT
UID:valid@example.com
SUMMARY:Valid Event
DTSTART:20231115T120000Z
DTEND:20231115T130000Z
END:VEVENT
END:VCALENDAR`;

      const events = parseICSFile(icsContent);
      
      expect(events).toHaveLength(1);
      expect(events[0].title).toBe('Valid Event');
    });

    it('should skip events with missing DTEND', () => {
      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
UID:no-end@example.com
SUMMARY:No End Time
DTSTART:20231115T100000Z
END:VEVENT
BEGIN:VEVENT
UID:valid@example.com
SUMMARY:Valid Event
DTSTART:20231115T120000Z
DTEND:20231115T130000Z
END:VEVENT
END:VCALENDAR`;

      const events = parseICSFile(icsContent);
      
      expect(events).toHaveLength(1);
      expect(events[0].title).toBe('Valid Event');
    });

    it('should handle mix of valid and invalid events', () => {
      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
UID:all-day@example.com
SUMMARY:All Day Event
DTSTART;VALUE=DATE:20231115
DTEND;VALUE=DATE:20231116
END:VEVENT
BEGIN:VEVENT
UID:too-early@example.com
SUMMARY:Too Early
DTSTART:20231115T060000
DTEND:20231115T070000
END:VEVENT
BEGIN:VEVENT
UID:valid-1@example.com
SUMMARY:Valid Event 1
DTSTART:20231115T100000Z
DTEND:20231115T110000Z
END:VEVENT
BEGIN:VEVENT
UID:too-late@example.com
SUMMARY:Too Late
DTSTART:20231115T200000
DTEND:20231115T210000
END:VEVENT
BEGIN:VEVENT
UID:valid-2@example.com
SUMMARY:Valid Event 2
DTSTART:20231115T140000Z
DTEND:20231115T150000Z
END:VEVENT
END:VCALENDAR`;

      const events = parseICSFile(icsContent);
      
      expect(events).toHaveLength(2);
      expect(events[0].title).toBe('Valid Event 1');
      expect(events[1].title).toBe('Valid Event 2');
    });

    it('should preserve event data integrity', () => {
      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
UID:test-123@example.com
SUMMARY:Important Meeting
DTSTART:20231115T140000Z
DTEND:20231115T153000Z
END:VEVENT
END:VCALENDAR`;

      const events = parseICSFile(icsContent);
      
      expect(events[0].id).toBe('test-123@example.com');
      expect(events[0].title).toBe('Important Meeting');
      expect(events[0].startTime.getTime()).toBeLessThan(events[0].endTime.getTime());
      expect(events[0].originalStartTime).toEqual(events[0].startTime);
    });
  });
});
