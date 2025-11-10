import { EnergyLevel, TimeSlot } from '../types/energy';

const START_HOUR = 8;
const END_HOUR = 19;

/**
 * Initializes an array of TimeSlot objects with a default energy pattern.
 * The default pattern is 'medium' for all hours from START_HOUR to END_HOUR.
 * @returns {TimeSlot[]} An array of TimeSlot objects.
 */
export function initializeDefaultEnergyArray(): TimeSlot[] {
  const energyArray: TimeSlot[] = [];
  for (let hour = START_HOUR; hour <= END_HOUR; hour++) {
    energyArray.push({ hour, level: 'medium' });
  }
  return energyArray;
}

/**
 * Updates the energy level for a specific hour in the energy array.
 * If the hour is out of bounds (8-19), it returns the original array unchanged.
 * @param {TimeSlot[]} currentEnergyArray The current array of TimeSlot objects.
 * @param {number} hour The hour to update (8-19).
 * @param {EnergyLevel} newLevel The new energy level to set.
 * @returns {TimeSlot[]} A new array with the updated energy level, or the original array if the hour is invalid.
 */
export function updateEnergyLevelAtHour(
  currentEnergyArray: TimeSlot[],
  hour: number,
  newLevel: EnergyLevel
): TimeSlot[] {
  if (hour < START_HOUR || hour > END_HOUR) {
    return currentEnergyArray; // Hour out of bounds, return original array
  }

  return currentEnergyArray.map((slot) =>
    slot.hour === hour ? { ...slot, level: newLevel } : slot
  );
}

/**
 * Gets the energy level for a given hour from the energy array.
 * Returns 'medium' if the hour is out of bounds or not found.
 * @param {TimeSlot[]} currentEnergyArray The current array of TimeSlot objects.
 * @param {number} hour The hour to retrieve the energy level for.
 * @returns {EnergyLevel} The energy level for the given hour, or 'medium' if not found/out of bounds.
 */
export function getEnergyLevelForHour(
  currentEnergyArray: TimeSlot[],
  hour: number
): EnergyLevel {
  if (hour < START_HOUR || hour > END_HOUR) {
    return 'medium'; // Hour out of bounds, return default
  }
  const slot = currentEnergyArray.find((s) => s.hour === hour);
  return slot ? slot.level : 'medium'; // Return 'medium' if hour not found (shouldn't happen with initializeDefaultEnergyArray)
}

/**
 * Resets the energy array to the default pattern (all 'medium').
 * @returns {TimeSlot[]} A new array with all energy levels set to 'medium'.
 */
export function resetToDefaultPattern(): TimeSlot[] {
  return initializeDefaultEnergyArray();
}

/**
 * Cycles the energy level for a given hour: low -> medium -> high -> low.
 * @param {TimeSlot[]} currentEnergyArray The current array of TimeSlot objects.
 * @param {number} hour The hour to cycle the energy level for.
 * @returns {TimeSlot[]} A new array with the cycled energy level.
 */
export function cycleEnergyLevel(
  currentEnergyArray: TimeSlot[],
  hour: number
): TimeSlot[] {
  const currentLevel = getEnergyLevelForHour(currentEnergyArray, hour);
  let newLevel: EnergyLevel;

  switch (currentLevel) {
    case 'low':
      newLevel = 'medium';
      break;
    case 'medium':
      newLevel = 'high';
      break;
    case 'high':
      newLevel = 'low';
      break;
    default:
      newLevel = 'medium'; // Should not happen if levels are strictly 'low', 'medium', 'high'
  }

  return updateEnergyLevelAtHour(currentEnergyArray, hour, newLevel);
}
