import {
  initializeDefaultHourlyEnergy,
  updateEnergyLevelAtHour,
  getEnergyLevelForHour,
  resetToDefaultHourlyEnergy,
  cycleEnergyLevel,
} from '../utils/energyHelpers';
import { EnergyLevel, HourlyEnergy } from '../types/energy';

describe('energyHelpers', () => {
  const START_HOUR = 8;
  const END_HOUR = 19;

  let initialHourlyEnergy: HourlyEnergy;

  beforeEach(() => {
    initialHourlyEnergy = initializeDefaultHourlyEnergy();
  });

  describe('initializeDefaultHourlyEnergy', () => {
    test('should initialize an HourlyEnergy object with medium energy for all hours from 8 to 19', () => {
      const expectedHourlyEnergy: HourlyEnergy = {};
      for (let i = START_HOUR; i <= END_HOUR; i++) {
        expectedHourlyEnergy[i] = EnergyLevel.Medium;
      }
      expect(initialHourlyEnergy).toEqual(expectedHourlyEnergy);
    });
  });

  describe('updateEnergyLevelAtHour', () => {
    test('should update the energy level for a specific hour', () => {
      const updatedHourlyEnergy = updateEnergyLevelAtHour(initialHourlyEnergy, 10, EnergyLevel.High);
      expect(updatedHourlyEnergy[10]).toBe(EnergyLevel.High);
      expect(updatedHourlyEnergy).not.toBe(initialHourlyEnergy); // Ensure immutability
      expect(initialHourlyEnergy[10]).toBe(EnergyLevel.Medium); // Original should be unchanged
    });

    test('should return the original object if the hour is out of bounds (before START_HOUR)', () => {
      const updatedHourlyEnergy = updateEnergyLevelAtHour(initialHourlyEnergy, START_HOUR - 1, EnergyLevel.High);
      expect(updatedHourlyEnergy).toEqual(initialHourlyEnergy);
    });

    test('should return the original object if the hour is out of bounds (after END_HOUR)', () => {
      const updatedHourlyEnergy = updateEnergyLevelAtHour(initialHourlyEnergy, END_HOUR + 1, EnergyLevel.High);
      expect(updatedHourlyEnergy).toEqual(initialHourlyEnergy);
    });
  });

  describe('getEnergyLevelForHour', () => {
    test('should return the correct energy level for a given hour', () => {
      let customHourlyEnergy = { ...initialHourlyEnergy, 9: EnergyLevel.Low };
      expect(getEnergyLevelForHour(customHourlyEnergy, 9)).toBe(EnergyLevel.Low);
      expect(getEnergyLevelForHour(customHourlyEnergy, 10)).toBe(EnergyLevel.Medium);
    });

    test('should return EnergyLevel.Medium if the hour is out of bounds', () => {
      expect(getEnergyLevelForHour(initialHourlyEnergy, START_HOUR - 1)).toBe(EnergyLevel.Medium);
      expect(getEnergyLevelForHour(initialHourlyEnergy, END_HOUR + 1)).toBe(EnergyLevel.Medium);
    });
  });

  describe('resetToDefaultHourlyEnergy', () => {
    test('should reset all energy levels to medium', () => {
      let customHourlyEnergy = { ...initialHourlyEnergy, 9: EnergyLevel.Low, 15: EnergyLevel.High };
      const resetHourlyEnergy = resetToDefaultHourlyEnergy();
      expect(resetHourlyEnergy).toEqual(initialHourlyEnergy); // Should be same as initial default
      expect(resetHourlyEnergy).not.toBe(customHourlyEnergy);
    });
  });

  describe('cycleEnergyLevel', () => {
    test('should cycle energy level from Low to Medium', () => {
      let customHourlyEnergy = { ...initialHourlyEnergy, 10: EnergyLevel.Low };
      const cycledHourlyEnergy = cycleEnergyLevel(customHourlyEnergy, 10);
      expect(cycledHourlyEnergy[10]).toBe(EnergyLevel.Medium);
    });

    test('should cycle energy level from Medium to High', () => {
      let customHourlyEnergy = { ...initialHourlyEnergy, 12: EnergyLevel.Medium };
      const cycledHourlyEnergy = cycleEnergyLevel(customHourlyEnergy, 12);
      expect(cycledHourlyEnergy[12]).toBe(EnergyLevel.High);
    });

    test('should cycle energy level from High to Low', () => {
      let customHourlyEnergy = { ...initialHourlyEnergy, 14: EnergyLevel.High };
      const cycledHourlyEnergy = cycleEnergyLevel(customHourlyEnergy, 14);
      expect(cycledHourlyEnergy[14]).toBe(EnergyLevel.Low);
    });

    test('should handle hours out of bounds gracefully (return original)', () => {
      const cycledHourlyEnergy = cycleEnergyLevel(initialHourlyEnergy, START_HOUR - 1);
      expect(cycledHourlyEnergy).toEqual(initialHourlyEnergy);
    });
  });
});
