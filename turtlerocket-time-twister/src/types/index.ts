import { HourlyEnergy } from './energy';

export interface CalendarEvent {
  uid: string;
  summary: string;
  start: Date;
  end: Date;
}

export interface ClassifiedEvent extends CalendarEvent {
  classification: 'heavy' | 'medium' | 'light';
}

export interface OptimizedEvent extends ClassifiedEvent {
  originalStart: Date;
  originalEnd: Date;
}

export interface AppState {
  hourlyEnergy: HourlyEnergy;
  uploadedEvents: CalendarEvent[];
  classifiedEvents: ClassifiedEvent[];
  optimizedEvents: OptimizedEvent[];
  isProcessing: boolean;
}