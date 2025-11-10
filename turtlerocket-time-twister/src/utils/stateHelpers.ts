// src/utils/stateHelpers.ts

import { AppState, EnergyLevel, CalendarEvent, ClassifiedEvent, OptimizedEvent } from '../types';

export const initialState: AppState = {
  energyLevels: Array(12).fill('medium'),
  uploadedEvents: [],
  classifiedEvents: [],
  optimizedEvents: [],
  isProcessing: false,
};

export function setEnergyLevels(state: AppState, energyLevels: EnergyLevel[]): AppState {
  return {
    ...state,
    energyLevels,
  };
}

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