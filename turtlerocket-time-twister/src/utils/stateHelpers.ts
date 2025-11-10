// src/utils/stateHelpers.ts

import { AppState, CalendarEvent, ClassifiedEvent, OptimizedEvent } from '../types';
import { EnergyLevel, HourlyEnergy } from '../types/energy';

const defaultHourlyEnergy: HourlyEnergy = {};
for (let i = 8; i < 20; i++) {
  defaultHourlyEnergy[i] = EnergyLevel.Medium;
}

export const initialState: AppState = {
  hourlyEnergy: defaultHourlyEnergy,
  uploadedEvents: [],
  classifiedEvents: [],
  optimizedEvents: [],
  isProcessing: false,
};

export function setUploadedEvents(state: AppState, uploadedEvents: CalendarEvent[]): AppState {
  return {
    ...state,
    uploadedEvents,
  };
}

export function setClassifiedEvents(state: AppState, classifiedEvents: ClassifiedEvent[]): AppState {
  return {
    ...state,
    classifiedEvents,
  };
}

export function setOptimizedEvents(state: AppState, optimizedEvents: OptimizedEvent[]): AppState {
  return {
    ...state,
    optimizedEvents,
  };
}

export function setProcessing(state: AppState, isProcessing: boolean): AppState {
  return {
    ...state,
    isProcessing,
  };
}