import { CalendarEvent, ClassifiedEvent, OptimizedEvent } from '../types';
import { CognitiveLoad } from '../types/classification';

export interface EventGeneratorOptions {
  count?: number;
  startDate?: Date;
  durationMinutes?: number;
  classification?: CognitiveLoad;
  summaryPrefix?: string;
  spacing?: number; // minutes between events
}

export const generateMockEvent = (
  index: number,
  options: EventGeneratorOptions = {}
): CalendarEvent => {
  const {
    startDate = new Date('2024-01-01T09:00:00'),
    durationMinutes = 60,
    summaryPrefix = 'Event',
    spacing = 0,
  } = options;

  const start = new Date(startDate);
  start.setMinutes(start.getMinutes() + (index * (durationMinutes + spacing)));

  const end = new Date(start);
  end.setMinutes(end.getMinutes() + durationMinutes);

  return {
    uid: `event-${index}-${Date.now()}`,
    summary: `${summaryPrefix} ${index}`,
    start,
    end,
  };
};

export const generateMockEvents = (
  options: EventGeneratorOptions = {}
): CalendarEvent[] => {
  const { count = 10 } = options;
  return Array.from({ length: count }, (_, i) => generateMockEvent(i, options));
};

export const generateClassifiedEvent = (
  index: number,
  options: EventGeneratorOptions & { classification?: CognitiveLoad } = {}
): ClassifiedEvent => {
  const { classification = 'medium' } = options;
  const baseEvent = generateMockEvent(index, options);

  return {
    ...baseEvent,
    classification,
  };
};

export const generateClassifiedEvents = (
  options: EventGeneratorOptions & { classification?: CognitiveLoad } = {}
): ClassifiedEvent[] => {
  const { count = 10 } = options;
  return Array.from({ length: count }, (_, i) => generateClassifiedEvent(i, options));
};

export const generateOptimizedEvent = (
  index: number,
  options: EventGeneratorOptions & { 
    classification?: CognitiveLoad;
    timeShiftMinutes?: number;
  } = {}
): OptimizedEvent => {
  const { timeShiftMinutes = 0 } = options;
  const classifiedEvent = generateClassifiedEvent(index, options);
  
  const originalStart = new Date(classifiedEvent.start);
  const originalEnd = new Date(classifiedEvent.end);

  if (timeShiftMinutes !== 0) {
    classifiedEvent.start.setMinutes(classifiedEvent.start.getMinutes() + timeShiftMinutes);
    classifiedEvent.end.setMinutes(classifiedEvent.end.getMinutes() + timeShiftMinutes);
  }

  return {
    ...classifiedEvent,
    originalStart,
    originalEnd,
  };
};

export const generateOptimizedEvents = (
  options: EventGeneratorOptions & { 
    classification?: CognitiveLoad;
    timeShiftMinutes?: number;
  } = {}
): OptimizedEvent[] => {
  const { count = 10 } = options;
  return Array.from({ length: count }, (_, i) => generateOptimizedEvent(i, options));
};

export const generateEventsWithKeywords = (keywords: {
  heavy: string[];
  medium: string[];
  light: string[];
}): CalendarEvent[] => {
  const events: CalendarEvent[] = [];
  const baseDate = new Date('2024-01-01T09:00:00');
  let index = 0;

  for (const keyword of keywords.heavy) {
    events.push({
      uid: `event-${index++}`,
      summary: keyword,
      start: new Date(baseDate.getTime() + index * 3600000),
      end: new Date(baseDate.getTime() + index * 3600000 + 3600000),
    });
  }

  for (const keyword of keywords.medium) {
    events.push({
      uid: `event-${index++}`,
      summary: keyword,
      start: new Date(baseDate.getTime() + index * 3600000),
      end: new Date(baseDate.getTime() + index * 3600000 + 3600000),
    });
  }

  for (const keyword of keywords.light) {
    events.push({
      uid: `event-${index++}`,
      summary: keyword,
      start: new Date(baseDate.getTime() + index * 3600000),
      end: new Date(baseDate.getTime() + index * 3600000 + 3600000),
    });
  }

  return events;
};

export const generateOverlappingEvents = (count: number = 5): CalendarEvent[] => {
  const baseDate = new Date('2024-01-01T09:00:00');
  return Array.from({ length: count }, (_, i) => ({
    uid: `overlapping-${i}`,
    summary: `Overlapping Meeting Event ${i}`,
    start: new Date(baseDate.getTime() + i * 1800000), // 30 minutes apart
    end: new Date(baseDate.getTime() + i * 1800000 + 3600000), // 1 hour duration
  }));
};

export const generateBoundaryEvents = (): CalendarEvent[] => {
  return [
    {
      uid: 'boundary-midnight',
      summary: 'Midnight Meeting Event',
      start: new Date('2024-01-01T00:00:00'),
      end: new Date('2024-01-01T01:00:00'),
    },
    {
      uid: 'boundary-end-of-day',
      summary: 'End of Day Meeting Event',
      start: new Date('2024-01-01T23:00:00'),
      end: new Date('2024-01-02T00:00:00'),
    },
    {
      uid: 'boundary-cross-midnight',
      summary: 'Cross Midnight Meeting Event',
      start: new Date('2024-01-01T23:30:00'),
      end: new Date('2024-01-02T00:30:00'),
    },
  ];
};

export const generateLargeEventSet = (count: number = 100): CalendarEvent[] => {
  return generateMockEvents({ count, spacing: 30 });
};
