// src/utils/stateHelpers.test.ts

import { initialState } from '../utils/stateHelpers';
import { EnergyLevel, HourlyEnergy } from '../types/energy';

describe('stateHelpers', () => {
  it('should have the correct initial state', () => {
    const defaultHourlyEnergy: HourlyEnergy = {};
    for (let i = 8; i < 20; i++) {
      defaultHourlyEnergy[i] = EnergyLevel.Medium;
    }

    expect(initialState).toEqual({
      hourlyEnergy: defaultHourlyEnergy,
      uploadedEvents: [],
      classifiedEvents: [],
      optimizedEvents: [],
      isProcessing: false,
    });
  });
});