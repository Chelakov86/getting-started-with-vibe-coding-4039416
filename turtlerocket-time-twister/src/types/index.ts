// src/types/index.ts

export type EnergyLevel = 'low' | 'medium' | 'high';

export interface CalendarEvent {
  uid: string;
  summary: string;
  start: Date;
  end: Date;
}

export interface ClassifiedEvent extends CalendarEvent {
  classification: 'heavy' | 'medium' | 'light';
}

export interface AppState {
  energyLevels: EnergyLevel[];
  uploadedEvents: CalendarEvent[];
  classifiedEvents: ClassifiedEvent[];
  optimizedEvents: ClassifiedEvent[];
  isProcessing: boolean;
}
