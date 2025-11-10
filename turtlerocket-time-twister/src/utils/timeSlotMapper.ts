/**
 * Time Slot Mapper Utilities
 * 
 * Provides utilities for mapping time slots to energy levels and managing
 * schedule optimization. Supports 8 AM - 8 PM working hours (12 hours total).
 */

import { EnergyLevel } from '../types/energy';
import { ClassifiedEvent } from '../types';

/**
 * Working hours configuration
 */
export const WORKING_HOURS_START = 8;  // 8 AM
export const WORKING_HOURS_END = 20;   // 8 PM (exclusive)
export const WORKING_HOURS_COUNT = 12; // 8 AM - 7 PM (12 hours)

/**
 * TimeSlotMap - Maps hour (8-19) to energy level
 */
export interface TimeSlotMap {
  [hour: number]: EnergyLevel;
}

/**
 * Creates a time slot map from an array of energy levels
 * 
 * @param energyArray - Array of 12 energy levels (8 AM - 8 PM)
 * @returns TimeSlotMap with hour keys from 8-19
 * @throws Error if energyArray length is not 12
 */
export function createTimeSlotMap(energyArray: EnergyLevel[]): TimeSlotMap {
  if (energyArray.length !== WORKING_HOURS_COUNT) {
    throw new Error(
      `Energy array must have exactly ${WORKING_HOURS_COUNT} elements (8 AM - 8 PM). Got ${energyArray.length}.`
    );
  }

  const slotMap: TimeSlotMap = {};
  
  for (let i = 0; i < energyArray.length; i++) {
    const hour = WORKING_HOURS_START + i;
    slotMap[hour] = energyArray[i];
  }

  return slotMap;
}

/**
 * Gets available time slots for a given energy level, excluding conflicts
 * 
 * @param slotMap - Time slot to energy level mapping
 * @param energyLevel - Desired energy level
 * @param existingEvents - Events that create conflicts
 * @param baseDate - Reference date for checking conflicts
 * @returns Array of available hour slots
 */
export function getAvailableSlots(
  slotMap: TimeSlotMap,
  energyLevel: EnergyLevel,
  existingEvents: ClassifiedEvent[],
  baseDate: Date
): number[] {
  const availableSlots: number[] = [];

  for (let hour = WORKING_HOURS_START; hour < WORKING_HOURS_END; hour++) {
    // Check if this hour has the desired energy level
    if (slotMap[hour] === energyLevel) {
      // Check if slot is available (no conflicts)
      if (isSlotAvailable(hour, 1, existingEvents, baseDate)) {
        availableSlots.push(hour);
      }
    }
  }

  return availableSlots;
}

/**
 * Checks if a time slot is available (no conflicts with existing events)
 * 
 * @param startHour - Starting hour of the slot
 * @param durationHours - Duration in hours
 * @param existingEvents - Events to check for conflicts
 * @param baseDate - Reference date for the slot
 * @returns true if slot is available, false if there's a conflict
 */
export function isSlotAvailable(
  startHour: number,
  durationHours: number,
  existingEvents: ClassifiedEvent[],
  baseDate: Date
): boolean {
  const slotStart = createDateAtHour(baseDate, startHour);
  const slotEnd = addHoursToDate(slotStart, durationHours);

  for (const event of existingEvents) {
    // Check if event is on the same day
    if (!isSameDay(event.start, baseDate)) {
      continue;
    }

    // Check for any overlap
    // Events overlap if: event.start < slotEnd AND event.end > slotStart
    if (event.start < slotEnd && event.end > slotStart) {
      return false;
    }
  }

  return true;
}

/**
 * Calculates duration in hours between two dates, rounding up partial hours
 * 
 * @param start - Start date
 * @param end - End date
 * @returns Duration in hours (rounded up), minimum 0
 */
export function calculateDuration(start: Date, end: Date): number {
  const milliseconds = end.getTime() - start.getTime();
  
  if (milliseconds <= 0) {
    return 0;
  }

  const hours = milliseconds / (1000 * 60 * 60);
  return Math.ceil(hours);
}

/**
 * Adds hours to a date, returning a new date object
 * 
 * @param date - Base date
 * @param hours - Hours to add (can be negative)
 * @returns New date with hours added
 */
export function addHoursToDate(date: Date, hours: number): Date {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
}

/**
 * Extracts the hour component from a date
 * 
 * @param date - Date to extract from
 * @returns Hour (0-23)
 */
export function getHourFromDate(date: Date): number {
  return date.getHours();
}

/**
 * Creates a date at a specific hour on the same day as baseDate
 * Sets minutes, seconds, and milliseconds to 0
 * 
 * @param baseDate - Reference date for year/month/day
 * @param hour - Hour to set (0-23)
 * @returns New date at specified hour
 */
export function createDateAtHour(baseDate: Date, hour: number): Date {
  const result = new Date(baseDate);
  result.setHours(hour, 0, 0, 0);
  return result;
}

/**
 * Checks if a date falls within working hours (8 AM - 8 PM)
 * 
 * @param date - Date to check
 * @returns true if within working hours, false otherwise
 */
export function isWithinWorkingHours(date: Date): boolean {
  const hour = getHourFromDate(date);
  return hour >= WORKING_HOURS_START && hour < WORKING_HOURS_END;
}

/**
 * Helper function to check if two dates are on the same day
 * 
 * @param date1 - First date
 * @param date2 - Second date
 * @returns true if same day, false otherwise
 */
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}
