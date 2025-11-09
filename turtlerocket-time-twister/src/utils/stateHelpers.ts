// src/utils/stateHelpers.ts

import { AppState, EnergyLevel } from '../types';

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

export function setProcessing(state: AppState, isProcessing: boolean): AppState {
  return {
    ...state,
    isProcessing,
  };
}
