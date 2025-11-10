import { EnergyLevel, HourlyEnergy } from '../types/energy';

const START_HOUR = 8;
const END_HOUR = 19; // Represents 7 PM

/**
 * Initializes an HourlyEnergy object with a default energy pattern.
 * The default pattern is 'medium' for all hours from START_HOUR to END_HOUR.
 * @returns {HourlyEnergy} An object mapping hours to EnergyLevel.
 */
export function initializeDefaultHourlyEnergy(): HourlyEnergy {
  const hourlyEnergy: HourlyEnergy = {};
  for (let hour = START_HOUR; hour <= END_HOUR; hour++) {
    hourlyEnergy[hour] = EnergyLevel.Medium;
  }
  return hourlyEnergy;
}

/**
 * Updates the energy level for a specific hour in the HourlyEnergy object.
 * If the hour is out of bounds (8-19), it returns the original object unchanged.
 * @param {HourlyEnergy} currentHourlyEnergy The current HourlyEnergy object.
 * @param {number} hour The hour to update (8-19).
 * @param {EnergyLevel} newLevel The new energy level to set.
 * @returns {HourlyEnergy} A new object with the updated energy level, or the original object if the hour is invalid.
 */
export function updateEnergyLevelAtHour(
  currentHourlyEnergy: HourlyEnergy,
  hour: number,
  newLevel: EnergyLevel
): HourlyEnergy {
  if (hour < START_HOUR || hour > END_HOUR) {
    return currentHourlyEnergy; // Hour out of bounds, return original object
  }

  return {
    ...currentHourlyEnergy,
    [hour]: newLevel,
  };
}

/**
 * Gets the energy level for a given hour from the HourlyEnergy object.
 * Returns EnergyLevel.Medium if the hour is out of bounds or not found.
 * @param {HourlyEnergy} currentHourlyEnergy The current HourlyEnergy object.
 * @param {number} hour The hour to retrieve the energy level for.
 * @returns {EnergyLevel} The energy level for the given hour, or EnergyLevel.Medium if not found/out of bounds.
 */
export function getEnergyLevelForHour(
  currentHourlyEnergy: HourlyEnergy,
  hour: number
): EnergyLevel {
  if (hour < START_HOUR || hour > END_HOUR) {
    return EnergyLevel.Medium; // Hour out of bounds, return default
  }
  return currentHourlyEnergy[hour] || EnergyLevel.Medium;
}

/**
 * Resets the HourlyEnergy object to the default pattern (all EnergyLevel.Medium).
 * @returns {HourlyEnergy} A new object with all energy levels set to EnergyLevel.Medium.
 */
export function resetToDefaultHourlyEnergy(): HourlyEnergy {
  return initializeDefaultHourlyEnergy();
}

/**
 * Cycles the energy level for a given hour: Low -> Medium -> High -> Low.
 * @param {HourlyEnergy} currentHourlyEnergy The current HourlyEnergy object.
 * @param {number} hour The hour to cycle the energy level for.
 * @returns {HourlyEnergy} A new object with the cycled energy level.
 */
export function cycleEnergyLevel(
  currentHourlyEnergy: HourlyEnergy,
  hour: number
): HourlyEnergy {
  const currentLevel = getEnergyLevelForHour(currentHourlyEnergy, hour);
  let newLevel: EnergyLevel;

  switch (currentLevel) {
    case EnergyLevel.Low:
      newLevel = EnergyLevel.Medium;
      break;
    case EnergyLevel.Medium:
      newLevel = EnergyLevel.High;
      break;
    case EnergyLevel.High:
      newLevel = EnergyLevel.Low;
      break;
    default:
      newLevel = EnergyLevel.Medium; // Should not happen if levels are strictly 'low', 'medium', 'high'
  }

  return updateEnergyLevelAtHour(currentHourlyEnergy, hour, newLevel);
}
