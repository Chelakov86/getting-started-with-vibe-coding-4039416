import ICAL from 'ical.js';
import { CalendarEvent } from '../types';

export interface ICSBuilderOptions {
  calendarName?: string;
  timezone?: string;
  prodId?: string;
}

export class ICSFileBuilder {
  private events: CalendarEvent[] = [];
  private options: ICSBuilderOptions;

  constructor(options: ICSBuilderOptions = {}) {
    this.options = {
      calendarName: options.calendarName || 'Test Calendar',
      timezone: options.timezone || 'UTC',
      prodId: options.prodId || '-//Test//Test Calendar//EN',
    };
  }

  addEvent(event: CalendarEvent): this {
    this.events.push(event);
    return this;
  }

  addEvents(events: CalendarEvent[]): this {
    this.events.push(...events);
    return this;
  }

  build(): string {
    const comp = new ICAL.Component(['vcalendar', [], []]);
    comp.updatePropertyWithValue('prodid', this.options.prodId!);
    comp.updatePropertyWithValue('version', '2.0');
    comp.updatePropertyWithValue('calname', this.options.calendarName!);

    for (const event of this.events) {
      const vevent = new ICAL.Component('vevent');
      const icalEvent = new ICAL.Event(vevent);

      icalEvent.uid = event.uid;
      icalEvent.summary = event.summary;
      icalEvent.startDate = ICAL.Time.fromJSDate(event.start, false);
      icalEvent.endDate = ICAL.Time.fromJSDate(event.end, false);

      comp.addSubcomponent(vevent);
    }

    return comp.toString();
  }

  buildAsFile(): File {
    const content = this.build();
    return new File([content], 'test-calendar.ics', { type: 'text/calendar' });
  }

  clear(): this {
    this.events = [];
    return this;
  }
}

export const createMockICSFile = (events: CalendarEvent[], filename = 'test.ics'): File => {
  const builder = new ICSFileBuilder();
  builder.addEvents(events);
  return builder.buildAsFile();
};

export const createEmptyICSFile = (): File => {
  const content = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test Calendar//EN
CALNAME:Empty Calendar
END:VCALENDAR`;
  return new File([content], 'empty.ics', { type: 'text/calendar' });
};

export const createInvalidICSFile = (): File => {
  const content = 'This is not a valid ICS file';
  return new File([content], 'invalid.ics', { type: 'text/calendar' });
};

export const createLargeICSFile = (eventCount: number = 100): File => {
  const events: CalendarEvent[] = [];
  const baseDate = new Date('2024-01-01T09:00:00');

  for (let i = 0; i < eventCount; i++) {
    const start = new Date(baseDate);
    start.setHours(start.getHours() + i);
    const end = new Date(start);
    end.setHours(end.getHours() + 1);

    events.push({
      uid: `large-event-${i}`,
      summary: `Large Calendar Event ${i}`,
      start,
      end,
    });
  }

  return createMockICSFile(events, `large-${eventCount}.ics`);
};
