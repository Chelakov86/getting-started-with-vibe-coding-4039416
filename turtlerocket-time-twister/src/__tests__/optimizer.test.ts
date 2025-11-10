import { optimizeSchedule, OptimizationMetrics } from '../utils/optimizer';
import { ClassifiedEvent, OptimizedEvent } from '../types';
import { EnergyLevel } from '../types/energy';
import { CognitiveLoad } from '../types/classification';

describe('optimizeSchedule', () => {
  const createEvent = (
    summary: string,
    startHour: number,
    durationHours: number,
    classification: CognitiveLoad
  ): ClassifiedEvent => ({
    uid: `event-${summary}-${startHour}`,
    summary,
    start: new Date(2024, 0, 1, startHour, 0),
    end: new Date(2024, 0, 1, startHour + durationHours, 0),
    classification,
  });

  const createEnergyMap = (levels: { [hour: number]: EnergyLevel }) => levels;

  describe('basic optimization scenarios', () => {
    it('should match high-energy tasks to high-energy slots', () => {
      const events: ClassifiedEvent[] = [
        createEvent('Team Meeting', 14, 1, 'heavy'),
      ];
      const energy = createEnergyMap({
        9: EnergyLevel.High,
        10: EnergyLevel.High,
        14: EnergyLevel.Low,
      });

      const result = optimizeSchedule(events, energy);

      expect(result.optimizedEvents).toHaveLength(1);
      expect(result.optimizedEvents[0].start.getHours()).toBe(9);
      expect(result.optimizedEvents[0].originalStart.getHours()).toBe(14);
    });

    it('should match low-energy tasks to low-energy slots', () => {
      const events: ClassifiedEvent[] = [
        createEvent('Coffee Break', 10, 1, 'light'),
      ];
      const energy = createEnergyMap({
        10: EnergyLevel.High,
        14: EnergyLevel.Low,
        15: EnergyLevel.Low,
      });

      const result = optimizeSchedule(events, energy);

      expect(result.optimizedEvents).toHaveLength(1);
      expect(result.optimizedEvents[0].start.getHours()).toBe(14);
    });

    it('should optimize multiple events with different cognitive loads', () => {
      const events: ClassifiedEvent[] = [
        createEvent('Light Task', 9, 1, 'light'),
        createEvent('Heavy Task', 14, 2, 'heavy'),
        createEvent('Medium Task', 16, 1, 'medium'),
      ];
      const energy = createEnergyMap({
        9: EnergyLevel.High,
        10: EnergyLevel.High,
        11: EnergyLevel.High,
        14: EnergyLevel.Medium,
        15: EnergyLevel.Medium,
        16: EnergyLevel.Low,
      });

      const result = optimizeSchedule(events, energy);

      expect(result.optimizedEvents).toHaveLength(3);
      
      const heavyEvent = result.optimizedEvents.find(e => e.summary === 'Heavy Task');
      expect(heavyEvent?.start.getHours()).toBe(9); // Moved to high energy
      
      const lightEvent = result.optimizedEvents.find(e => e.summary === 'Light Task');
      expect(lightEvent?.start.getHours()).toBe(16); // Moved to low energy
    });
  });

  describe('duration preservation', () => {
    it('should preserve event duration after optimization', () => {
      const events: ClassifiedEvent[] = [
        createEvent('2 Hour Meeting', 14, 2, 'heavy'),
      ];
      const energy = createEnergyMap({
        9: EnergyLevel.High,
        10: EnergyLevel.High,
        14: EnergyLevel.Low,
      });

      const result = optimizeSchedule(events, energy);

      const optimized = result.optimizedEvents[0];
      const duration = optimized.end.getTime() - optimized.start.getTime();
      expect(duration).toBe(2 * 60 * 60 * 1000); // 2 hours in ms
    });

    it('should preserve duration for all events', () => {
      const events: ClassifiedEvent[] = [
        createEvent('30min', 9, 0.5, 'heavy'),
        createEvent('1hour', 10, 1, 'medium'),
        createEvent('3hours', 14, 3, 'light'),
      ];
      const energy = createEnergyMap({
        8: EnergyLevel.High,
        9: EnergyLevel.High,
        10: EnergyLevel.Medium,
        14: EnergyLevel.Low,
        15: EnergyLevel.Low,
        16: EnergyLevel.Low,
        17: EnergyLevel.Low,
      });

      const result = optimizeSchedule(events, energy);

      result.optimizedEvents.forEach((optimized, idx) => {
        const original = events[idx];
        const originalDuration = original.end.getTime() - original.start.getTime();
        const optimizedDuration = optimized.end.getTime() - optimized.start.getTime();
        expect(optimizedDuration).toBe(originalDuration);
      });
    });
  });

  describe('time constraints', () => {
    it('should keep events within 8 AM - 8 PM', () => {
      const events: ClassifiedEvent[] = [
        createEvent('Task1', 9, 1, 'heavy'),
        createEvent('Task2', 10, 1, 'heavy'),
      ];
      const energy = createEnergyMap({
        9: EnergyLevel.High,
        10: EnergyLevel.High,
      });

      const result = optimizeSchedule(events, energy);

      result.optimizedEvents.forEach(event => {
        expect(event.start.getHours()).toBeGreaterThanOrEqual(8);
        expect(event.end.getHours()).toBeLessThanOrEqual(20);
      });
    });

    it('should not schedule events before 8 AM', () => {
      const events: ClassifiedEvent[] = [
        createEvent('Task', 9, 1, 'heavy'),
      ];
      const energy = createEnergyMap({
        7: EnergyLevel.High,
        9: EnergyLevel.Low,
      });

      const result = optimizeSchedule(events, energy);

      expect(result.optimizedEvents[0].start.getHours()).toBeGreaterThanOrEqual(8);
    });

    it('should not schedule events after 8 PM', () => {
      const events: ClassifiedEvent[] = [
        createEvent('Long Task', 14, 3, 'heavy'),
      ];
      const energy = createEnergyMap({
        14: EnergyLevel.Low,
        18: EnergyLevel.High,
        19: EnergyLevel.High,
      });

      const result = optimizeSchedule(events, energy);

      const event = result.optimizedEvents[0];
      expect(event.end.getHours()).toBeLessThanOrEqual(20);
    });
  });

  describe('overlap prevention', () => {
    it('should not create overlapping events', () => {
      const events: ClassifiedEvent[] = [
        createEvent('Task1', 9, 2, 'heavy'),
        createEvent('Task2', 14, 2, 'heavy'),
      ];
      const energy = createEnergyMap({
        9: EnergyLevel.High,
        10: EnergyLevel.High,
        11: EnergyLevel.High,
        12: EnergyLevel.High,
      });

      const result = optimizeSchedule(events, energy);

      const sorted = result.optimizedEvents.sort((a, b) => 
        a.start.getTime() - b.start.getTime()
      );

      for (let i = 0; i < sorted.length - 1; i++) {
        const current = sorted[i];
        const next = sorted[i + 1];
        expect(current.end.getTime()).toBeLessThanOrEqual(next.start.getTime());
      }
    });

    it('should handle back-to-back events correctly', () => {
      const events: ClassifiedEvent[] = [
        createEvent('Task1', 9, 1, 'heavy'),
        createEvent('Task2', 10, 1, 'heavy'),
        createEvent('Task3', 11, 1, 'heavy'),
      ];
      const energy = createEnergyMap({
        9: EnergyLevel.High,
        10: EnergyLevel.High,
        11: EnergyLevel.High,
      });

      const result = optimizeSchedule(events, energy);

      expect(result.optimizedEvents).toHaveLength(3);
      // No overlaps should occur
      const sorted = result.optimizedEvents.sort((a, b) => 
        a.start.getTime() - b.start.getTime()
      );
      for (let i = 0; i < sorted.length - 1; i++) {
        expect(sorted[i].end.getTime()).toBeLessThanOrEqual(sorted[i + 1].start.getTime());
      }
    });
  });

  describe('order preservation within groups', () => {
    it('should maintain relative order of events with same cognitive load', () => {
      const events: ClassifiedEvent[] = [
        createEvent('Heavy1', 9, 1, 'heavy'),
        createEvent('Heavy2', 10, 1, 'heavy'),
        createEvent('Heavy3', 11, 1, 'heavy'),
      ];
      const energy = createEnergyMap({
        9: EnergyLevel.High,
        10: EnergyLevel.High,
        11: EnergyLevel.High,
        14: EnergyLevel.High,
        15: EnergyLevel.High,
        16: EnergyLevel.High,
      });

      const result = optimizeSchedule(events, energy);

      const heavyEvents = result.optimizedEvents
        .filter(e => e.classification === 'heavy')
        .sort((a, b) => a.start.getTime() - b.start.getTime());

      expect(heavyEvents[0].summary).toBe('Heavy1');
      expect(heavyEvents[1].summary).toBe('Heavy2');
      expect(heavyEvents[2].summary).toBe('Heavy3');
    });
  });

  describe('edge cases', () => {
    it('should handle empty events array', () => {
      const result = optimizeSchedule([], {});

      expect(result.optimizedEvents).toEqual([]);
      expect(result.metrics.totalEvents).toBe(0);
      expect(result.metrics.eventsOptimized).toBe(0);
    });

    it('should handle no suitable slots available', () => {
      const events: ClassifiedEvent[] = [
        createEvent('Heavy Task', 14, 1, 'heavy'),
      ];
      const energy = createEnergyMap({
        14: EnergyLevel.Low, // Only low energy available
      });

      const result = optimizeSchedule(events, energy);

      // Event should stay in original slot if no better option
      expect(result.optimizedEvents).toHaveLength(1);
      expect(result.optimizedEvents[0].start.getHours()).toBe(14);
    });

    it('should handle events that already match energy levels', () => {
      const events: ClassifiedEvent[] = [
        createEvent('Heavy Task', 9, 1, 'heavy'),
      ];
      const energy = createEnergyMap({
        9: EnergyLevel.High,
      });

      const result = optimizeSchedule(events, energy);

      expect(result.optimizedEvents[0].start.getHours()).toBe(9);
      expect(result.metrics.eventsOptimized).toBe(0);
    });

    it('should handle events with no energy data', () => {
      const events: ClassifiedEvent[] = [
        createEvent('Task', 9, 1, 'heavy'),
      ];
      const energy = createEnergyMap({});

      const result = optimizeSchedule(events, energy);

      // Should keep original time if no energy data
      expect(result.optimizedEvents[0].start.getHours()).toBe(9);
    });
  });

  describe('change tracking', () => {
    it('should track original start and end times', () => {
      const events: ClassifiedEvent[] = [
        createEvent('Meeting', 14, 2, 'heavy'),
      ];
      const energy = createEnergyMap({
        9: EnergyLevel.High,
        10: EnergyLevel.High,
        14: EnergyLevel.Low,
      });

      const result = optimizeSchedule(events, energy);

      const optimized = result.optimizedEvents[0];
      expect(optimized.originalStart).toEqual(new Date(2024, 0, 1, 14, 0));
      expect(optimized.originalEnd).toEqual(new Date(2024, 0, 1, 16, 0));
      expect(optimized.start).toEqual(new Date(2024, 0, 1, 9, 0));
      expect(optimized.end).toEqual(new Date(2024, 0, 1, 11, 0));
    });

    it('should provide accurate optimization metrics', () => {
      const events: ClassifiedEvent[] = [
        createEvent('Heavy', 14, 1, 'heavy'),
        createEvent('Light', 9, 1, 'light'),
        createEvent('Medium', 12, 1, 'medium'),
      ];
      const energy = createEnergyMap({
        9: EnergyLevel.High,
        10: EnergyLevel.High,
        11: EnergyLevel.Medium,
        12: EnergyLevel.Medium,
        14: EnergyLevel.Low,
        15: EnergyLevel.Low,
      });

      const result = optimizeSchedule(events, energy);

      expect(result.metrics.totalEvents).toBe(3);
      expect(result.metrics.eventsOptimized).toBeGreaterThan(0);
      expect(result.metrics.totalDisplacement).toBeGreaterThanOrEqual(0);
      expect(result.metrics.averageDisplacement).toBeGreaterThanOrEqual(0);
    });

    it('should calculate displacement correctly', () => {
      const events: ClassifiedEvent[] = [
        createEvent('Task', 14, 1, 'heavy'),
      ];
      const energy = createEnergyMap({
        9: EnergyLevel.High,
        14: EnergyLevel.Low,
      });

      const result = optimizeSchedule(events, energy);

      // Moved from 14:00 to 9:00 = 5 hours displacement
      expect(result.metrics.totalDisplacement).toBe(5);
      expect(result.metrics.averageDisplacement).toBe(5);
      expect(result.metrics.eventsOptimized).toBe(1);
    });

    it('should not count unchanged events as optimized', () => {
      const events: ClassifiedEvent[] = [
        createEvent('Perfect', 9, 1, 'heavy'),
      ];
      const energy = createEnergyMap({
        9: EnergyLevel.High,
      });

      const result = optimizeSchedule(events, energy);

      expect(result.metrics.eventsOptimized).toBe(0);
      expect(result.metrics.totalDisplacement).toBe(0);
    });
  });

  describe('minimize displacement', () => {
    it('should use earliest available slot with matching energy level', () => {
      const events: ClassifiedEvent[] = [
        createEvent('Task', 12, 1, 'heavy'),
      ];
      const energy = createEnergyMap({
        9: EnergyLevel.High,
        11: EnergyLevel.High,
        13: EnergyLevel.High,
        12: EnergyLevel.Low,
      });

      const result = optimizeSchedule(events, energy);

      // Should take earliest high-energy slot
      const newHour = result.optimizedEvents[0].start.getHours();
      expect(newHour).toBe(9);
    });
  });
});
