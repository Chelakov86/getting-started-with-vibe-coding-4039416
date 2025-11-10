import {
  initializeDefaultEnergyArray,
  updateEnergyLevelAtHour,
  getEnergyLevelForHour,
  resetToDefaultPattern,
  cycleEnergyLevel,
} from '../utils/energyHelpers';
import { EnergyLevel, TimeSlot } from '../types/energy';

describe('energyHelpers', () => {
  const START_HOUR = 8;
  const END_HOUR = 19;

  describe('initializeDefaultEnergyArray', () => {
    it('should return an array of TimeSlot objects with default medium energy levels', () => {
      const defaultArray = initializeDefaultEnergyArray();
      expect(defaultArray).toHaveLength(END_HOUR - START_HOUR + 1);
      defaultArray.forEach((slot, index) => {
        expect(slot.hour).toBe(START_HOUR + index);
        expect(slot.level).toBe('medium');
      });
    });
  });

  describe('updateEnergyLevelAtHour', () => {
    let initialArray: TimeSlot[];

    beforeEach(() => {
      initialArray = initializeDefaultEnergyArray();
    });

    it('should update the energy level for a specific hour', () => {
      const updatedArray = updateEnergyLevelAtHour(initialArray, 10, 'high');
      expect(updatedArray).not.toBe(initialArray); // Should return a new array
      expect(getEnergyLevelForHour(updatedArray, 10)).toBe('high');
      expect(getEnergyLevelForHour(updatedArray, 9)).toBe('medium'); // Other hours unchanged
    });

    it('should return the original array if the hour is out of bounds (below START_HOUR)', () => {
      const updatedArray = updateEnergyLevelAtHour(initialArray, 7, 'high');
      expect(updatedArray).toBe(initialArray); // Should return the same array reference
    });

    it('should return the original array if the hour is out of bounds (above END_HOUR)', () => {
      const updatedArray = updateEnergyLevelAtHour(initialArray, 20, 'high');
      expect(updatedArray).toBe(initialArray); // Should return the same array reference
    });
  });

  describe('getEnergyLevelForHour', () => {
    let energyArray: TimeSlot[];

    beforeEach(() => {
      energyArray = initializeDefaultEnergyArray();
      energyArray = updateEnergyLevelAtHour(energyArray, 9, 'low');
      energyArray = updateEnergyLevelAtHour(energyArray, 15, 'high');
    });

    it('should return the correct energy level for a valid hour', () => {
      expect(getEnergyLevelForHour(energyArray, 9)).toBe('low');
      expect(getEnergyLevelForHour(energyArray, 15)).toBe('high');
      expect(getEnergyLevelForHour(energyArray, 10)).toBe('medium'); // Unchanged hour
    });

    it('should return "medium" for an hour below START_HOUR', () => {
      expect(getEnergyLevelForHour(energyArray, 7)).toBe('medium');
    });

    it('should return "medium" for an hour above END_HOUR', () => {
      expect(getEnergyLevelForHour(energyArray, 20)).toBe('medium');
    });
  });

  describe('resetToDefaultPattern', () => {
    it('should reset all energy levels to medium', () => {
      let energyArray = initializeDefaultEnergyArray();
      energyArray = updateEnergyLevelAtHour(energyArray, 10, 'high');
      energyArray = updateEnergyLevelAtHour(energyArray, 12, 'low');

      const resetArray = resetToDefaultPattern();
      expect(resetArray).toHaveLength(END_HOUR - START_HOUR + 1);
      resetArray.forEach((slot) => {
        expect(slot.level).toBe('medium');
      });
    });
  });

  describe('cycleEnergyLevel', () => {
    let initialArray: TimeSlot[];

    beforeEach(() => {
      initialArray = initializeDefaultEnergyArray(); // All medium
    });

    it('should cycle from medium to high', () => {
      const arrayAfterFirstCycle = cycleEnergyLevel(initialArray, 10);
      expect(getEnergyLevelForHour(arrayAfterFirstCycle, 10)).toBe('high');
    });

    it('should cycle from high to low', () => {
      let array = cycleEnergyLevel(initialArray, 10); // medium -> high
      array = cycleEnergyLevel(array, 10); // high -> low
      expect(getEnergyLevelForHour(array, 10)).toBe('low');
    });

    it('should cycle from low to medium', () => {
      let array = cycleEnergyLevel(initialArray, 10); // medium -> high
      array = cycleEnergyLevel(array, 10); // high -> low
      array = cycleEnergyLevel(array, 10); // low -> medium
      expect(getEnergyLevelForHour(array, 10)).toBe('medium');
    });

    it('should not change the array if the hour is out of bounds', () => {
      const arrayAfter = cycleEnergyLevel(initialArray, 7);
      expect(arrayAfter).toBe(initialArray); // Should return the same reference as the input
    });
  });
});
