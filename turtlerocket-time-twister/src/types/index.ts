import { HourlyEnergy } from './energy';
import { CognitiveLoad } from './classification';

export interface CalendarEvent {
  uid: string;
  summary: string;
  start: Date;
  end: Date;
}

export interface ClassifiedEvent extends CalendarEvent {
  classification: CognitiveLoad;
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

// Re-export classification types
export type { CognitiveLoad, ClassificationResult, ClassificationOptions, KeywordMatch } from './classification';