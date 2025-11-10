import { ClassifiedEvent, OptimizedEvent } from '../types';
import { EnergyLevel, HourlyEnergy } from '../types/energy';
import { CognitiveLoad } from '../types/classification';

export interface OptimizationMetrics {
  totalEvents: number;
  eventsOptimized: number;
  totalDisplacement: number;
  averageDisplacement: number;
}

export interface OptimizationResult {
  optimizedEvents: OptimizedEvent[];
  metrics: OptimizationMetrics;
}

interface TimeSlot {
  hour: number;
  energyLevel: EnergyLevel;
  available: boolean;
}

const WORK_DAY_START = 8;
const WORK_DAY_END = 20;

/**
 * Maps cognitive load to preferred energy levels
 */
const getPreferredEnergyLevels = (cognitiveLoad: CognitiveLoad): EnergyLevel[] => {
  switch (cognitiveLoad) {
    case 'heavy':
      return [EnergyLevel.High, EnergyLevel.Medium, EnergyLevel.Low];
    case 'medium':
      return [EnergyLevel.Medium, EnergyLevel.High, EnergyLevel.Low];
    case 'light':
      return [EnergyLevel.Low, EnergyLevel.Medium, EnergyLevel.High];
  }
};

/**
 * Calculate duration in hours from two dates
 */
const getDurationHours = (start: Date, end: Date): number => {
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
};

/**
 * Check if a time slot can accommodate an event
 */
const canFitEvent = (
  startHour: number,
  durationHours: number,
  occupiedSlots: Set<number>
): boolean => {
  // Check if event would go beyond work day
  if (startHour < WORK_DAY_START || startHour + durationHours > WORK_DAY_END) {
    return false;
  }

  // Check for conflicts with occupied slots
  for (let h = startHour; h < startHour + durationHours; h++) {
    if (occupiedSlots.has(h)) {
      return false;
    }
  }

  return true;
};

/**
 * Calculate displacement in hours between two times
 */
const calculateDisplacement = (originalStart: Date, newStart: Date): number => {
  return Math.abs((newStart.getTime() - originalStart.getTime()) / (1000 * 60 * 60));
};

/**
 * Find the best time slot for an event based on energy levels and displacement
 */
const findBestSlot = (
  event: ClassifiedEvent,
  hourlyEnergy: HourlyEnergy,
  occupiedSlots: Set<number>
): number | null => {
  const durationHours = getDurationHours(event.start, event.end);
  const originalHour = event.start.getHours();
  const preferredEnergyLevels = getPreferredEnergyLevels(event.classification);

  // Check if original slot is still optimal
  if (
    canFitEvent(originalHour, durationHours, occupiedSlots) &&
    hourlyEnergy[originalHour] === preferredEnergyLevels[0]
  ) {
    return originalHour;
  }

  // Build available slots grouped by energy level
  const slotsByEnergy: { [key in EnergyLevel]?: number[] } = {};
  for (let hour = WORK_DAY_START; hour < WORK_DAY_END; hour++) {
    if (canFitEvent(hour, durationHours, occupiedSlots)) {
      const energyLevel = hourlyEnergy[hour];
      if (energyLevel) {
        if (!slotsByEnergy[energyLevel]) {
          slotsByEnergy[energyLevel] = [];
        }
        slotsByEnergy[energyLevel].push(hour);
      }
    }
  }

  // Try to find slot with preferred energy levels
  for (const preferredLevel of preferredEnergyLevels) {
    const availableSlots = slotsByEnergy[preferredLevel];
    if (availableSlots && availableSlots.length > 0) {
      // Sort by hour (earlier slots first to maintain sequential order)
      availableSlots.sort((a, b) => a - b);
      // Return first available slot with matching energy
      return availableSlots[0];
    }
  }

  // If no slot with energy data, try to keep original if available
  if (canFitEvent(originalHour, durationHours, occupiedSlots)) {
    return originalHour;
  }

  // Last resort: find any available slot
  for (let hour = WORK_DAY_START; hour < WORK_DAY_END; hour++) {
    if (canFitEvent(hour, durationHours, occupiedSlots)) {
      return hour;
    }
  }

  return null;
};

/**
 * Mark time slots as occupied
 */
const markSlotsOccupied = (
  startHour: number,
  durationHours: number,
  occupiedSlots: Set<number>
): void => {
  for (let h = startHour; h < startHour + durationHours; h++) {
    occupiedSlots.add(h);
  }
};

/**
 * Create optimized event with new time
 */
const createOptimizedEvent = (
  event: ClassifiedEvent,
  newStartHour: number
): OptimizedEvent => {
  const durationMs = event.end.getTime() - event.start.getTime();
  const newStart = new Date(event.start);
  newStart.setHours(newStartHour, 0, 0, 0);
  const newEnd = new Date(newStart.getTime() + durationMs);

  return {
    ...event,
    originalStart: event.start,
    originalEnd: event.end,
    start: newStart,
    end: newEnd,
  };
};

/**
 * Optimize schedule by matching events to energy levels
 * 
 * Algorithm:
 * 1. Group events by cognitive load (heavy, medium, light)
 * 2. Sort each group by original time to maintain order
 * 3. Process heavy events first (highest priority for optimal slots)
 * 4. For each event, find the best matching time slot
 * 5. Track occupied slots to prevent overlaps
 * 6. Calculate optimization metrics
 */
export const optimizeSchedule = (
  events: ClassifiedEvent[],
  hourlyEnergy: HourlyEnergy
): OptimizationResult => {
  if (events.length === 0) {
    return {
      optimizedEvents: [],
      metrics: {
        totalEvents: 0,
        eventsOptimized: 0,
        totalDisplacement: 0,
        averageDisplacement: 0,
      },
    };
  }

  // Group events by cognitive load
  const groupedEvents: { [key in CognitiveLoad]: ClassifiedEvent[] } = {
    heavy: [],
    medium: [],
    light: [],
  };

  events.forEach(event => {
    groupedEvents[event.classification].push(event);
  });

  // Sort each group by original time to maintain order
  Object.values(groupedEvents).forEach(group => {
    group.sort((a, b) => a.start.getTime() - b.start.getTime());
  });

  // Process events in priority order: heavy -> medium -> light
  const orderedEvents = [
    ...groupedEvents.heavy,
    ...groupedEvents.medium,
    ...groupedEvents.light,
  ];

  const occupiedSlots = new Set<number>();
  const optimizedEvents: OptimizedEvent[] = [];
  let totalDisplacement = 0;
  let eventsOptimized = 0;

  // Optimize each event
  for (const event of orderedEvents) {
    const originalHour = event.start.getHours();
    const durationHours = getDurationHours(event.start, event.end);
    const newStartHour = findBestSlot(event, hourlyEnergy, occupiedSlots);

    if (newStartHour !== null) {
      const optimized = createOptimizedEvent(event, newStartHour);
      optimizedEvents.push(optimized);

      // Track metrics
      const displacement = calculateDisplacement(event.start, optimized.start);
      if (displacement > 0) {
        totalDisplacement += displacement;
        eventsOptimized++;
      }

      // Mark slots as occupied
      markSlotsOccupied(newStartHour, durationHours, occupiedSlots);
    } else {
      // Could not find a slot - keep original (shouldn't happen with current logic)
      const optimized = createOptimizedEvent(event, originalHour);
      optimizedEvents.push(optimized);
    }
  }

  const metrics: OptimizationMetrics = {
    totalEvents: events.length,
    eventsOptimized,
    totalDisplacement,
    averageDisplacement: eventsOptimized > 0 ? totalDisplacement / eventsOptimized : 0,
  };

  return {
    optimizedEvents,
    metrics,
  };
};
