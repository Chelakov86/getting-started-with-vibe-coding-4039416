import ICAL from 'ical.js';

export interface ParsedEvent {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  originalStartTime: Date;
}

export class ICSParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ICSParseError';
  }
}

/**
 * Parses an ICS file content and returns an array of calendar events.
 * Only includes events that:
 * - Are not all-day events
 * - Fall within the 8 AM - 8 PM time range
 * - Have required fields (UID, SUMMARY, DTSTART, DTEND)
 */
export function parseICSFile(fileContent: string): ParsedEvent[] {
  if (!fileContent || fileContent.trim().length === 0) {
    throw new ICSParseError('File content is empty');
  }

  let jcalData: any;
  try {
    jcalData = ICAL.parse(fileContent);
  } catch (error) {
    throw new ICSParseError('Invalid ICS file format: ' + (error instanceof Error ? error.message : String(error)));
  }

  const comp = new ICAL.Component(jcalData);
  const vevents = comp.getAllSubcomponents('vevent');

  if (vevents.length === 0) {
    throw new ICSParseError('No events found in ICS file');
  }

  const events: ParsedEvent[] = [];

  for (const vevent of vevents) {
    try {
      const event = parseEvent(vevent);
      if (event) {
        events.push(event);
      }
    } catch (error) {
      // Skip events that fail to parse individual fields
      console.warn('Skipping event due to parse error:', error);
    }
  }

  return events;
}

function parseEvent(vevent: ICAL.Component): ParsedEvent | null {
  // Extract required fields
  const uid = vevent.getFirstPropertyValue('uid');
  const summary = vevent.getFirstPropertyValue('summary');
  const dtstart = vevent.getFirstPropertyValue('dtstart');
  const dtend = vevent.getFirstPropertyValue('dtend');

  // Validate required fields
  if (!uid || !summary || !dtstart || !dtend) {
    throw new Error('Missing required fields');
  }

  // Check if it's an all-day event (date-only, no time component)
  if (isAllDayEvent(dtstart, dtend)) {
    return null; // Filter out all-day events
  }

  // Convert to JavaScript Date objects
  const startTime = convertToDate(dtstart);
  const endTime = convertToDate(dtend);

  // Filter out events outside the 8 AM - 8 PM range
  if (!isWithinTimeRange(startTime, endTime)) {
    return null;
  }

  return {
    id: uid,
    title: summary,
    startTime,
    endTime,
    originalStartTime: startTime, // Keep a copy of the original time
  };
}

function isAllDayEvent(dtstart: ICAL.Time, dtend: ICAL.Time): boolean {
  // All-day events in iCal are represented as DATE values (no time component)
  // ical.js represents these with isDate = true
  return dtstart.isDate || dtend.isDate;
}

function convertToDate(icalTime: ICAL.Time): Date {
  // Convert ICAL.Time to JavaScript Date
  // toJSDate() converts to local time automatically
  return icalTime.toJSDate();
}

function isWithinTimeRange(startTime: Date, endTime: Date): boolean {
  const startHour = startTime.getHours();
  const endHour = endTime.getHours();
  const endMinute = endTime.getMinutes();

  // Event must start at or after 8 AM
  if (startHour < 8) {
    return false;
  }

  // Event must end at or before 8 PM (20:00)
  // If end hour is 20, minutes must be 0
  if (endHour > 20 || (endHour === 20 && endMinute > 0)) {
    return false;
  }

  return true;
}
