// src/__tests__/stateHelpers.test.ts

import { initialState, setEnergyLevels, setProcessing } from '../utils/stateHelpers';
import { AppState, EnergyLevel } from '../types';

describe('stateHelpers', () => {
  it('should have the correct initial state', () => {
    expect(initialState).toEqual({
      energyLevels: Array(12).fill('medium'),
      uploadedEvents: [],
      classifiedEvents: [],
      optimizedEvents: [],
      isProcessing: false,
    });
  });

  it('setEnergyLevels should update energy levels immutably', () => {
    const newEnergyLevels: EnergyLevel[] = Array(12).fill('high');
    const newState = setEnergyLevels(initialState, newEnergyLevels);
    expect(newState.energyLevels).toEqual(newEnergyLevels);
    expect(newState).not.toBe(initialState);
    expect(initialState.energyLevels).not.toEqual(newEnergyLevels);
  });

  it('setProcessing should update isProcessing immutably', () => {
    const newState = setProcessing(initialState, true);
    expect(newState.isProcessing).toBe(true);
    expect(newState).not.toBe(initialState);
    expect(initialState.isProcessing).toBe(false);
  });
});
