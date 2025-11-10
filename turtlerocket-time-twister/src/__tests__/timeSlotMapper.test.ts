/**
 * Tests for Time Slot Mapper Utilities
 */

import {
  TimeSlotMap,
  createTimeSlotMap,
  getAvailableSlots,
  isSlotAvailable,
  calculateDuration,
  addHoursToDate,
  getHourFromDate,
  createDateAtHour,
  isWithinWorkingHours,
} from '../utils/timeSlotMapper';
import { EnergyLevel } from '../types/energy';
import { ClassifiedEvent } from '../types';
import { CognitiveLoad } from '../types/classification';

describe('timeSlotMapper', () => {
  describe('createTimeSlotMap', () => {
    it('should create a time slot map from energy array (8 AM - 8 PM)', () => {
      const energyArray: EnergyLevel[] = [
        EnergyLevel.Low,    // 8 AM
        EnergyLevel.Medium, // 9 AM
        EnergyLevel.High,   // 10 AM
        EnergyLevel.High,   // 11 AM
        EnergyLevel.Medium, // 12 PM
        EnergyLevel.Medium, // 1 PM
        EnergyLevel.High,   // 2 PM
        EnergyLevel.Medium, // 3 PM
        EnergyLevel.Medium, // 4 PM
        EnergyLevel.Low,    // 5 PM
        EnergyLevel.Low,    // 6 PM
        EnergyLevel.Low,    // 7 PM
      ];

      const slotMap = createTimeSlotMap(energyArray);

      expect(slotMap[8]).toBe(EnergyLevel.Low);
      expect(slotMap[9]).toBe(EnergyLevel.Medium);
      expect(slotMap[10]).toBe(EnergyLevel.High);
      expect(slotMap[19]).toBe(EnergyLevel.Low);
      expect(slotMap[7]).toBeUndefined();
      expect(slotMap[20]).toBeUndefined();
    });

    it('should handle exactly 12 hours (8 AM - 8 PM)', () => {
      const energyArray = new Array(12).fill(EnergyLevel.Medium);
      const slotMap = createTimeSlotMap(energyArray);

      expect(Object.keys(slotMap).length).toBe(12);
      expect(slotMap[8]).toBe(EnergyLevel.Medium);
      expect(slotMap[19]).toBe(EnergyLevel.Medium);
    });

    it('should throw error if energy array has wrong length', () => {
      const shortArray = [EnergyLevel.Low, EnergyLevel.Medium];
      expect(() => createTimeSlotMap(shortArray)).toThrow();
      
      const longArray = new Array(15).fill(EnergyLevel.Low);
      expect(() => createTimeSlotMap(longArray)).toThrow();
    });

    it('should handle empty array', () => {
      expect(() => createTimeSlotMap([])).toThrow();
    });
  });

  describe('getAvailableSlots', () => {
    const baseDate = new Date('2024-01-15T08:00:00');
    
    const createEvent = (startHour: number, endHour: number): ClassifiedEvent => {
      const start = new Date(baseDate);
      start.setHours(startHour, 0, 0, 0);
      const end = new Date(baseDate);
      end.setHours(endHour, 0, 0, 0);
      
      return {
        uid: `event-${startHour}`,
        summary: 'Test Event',
        start,
        end,
        classification: 'medium' as CognitiveLoad,
      };
    };

    it('should return all high energy slots when no conflicts', () => {
      const slotMap: TimeSlotMap = {
        8: EnergyLevel.Low,
        9: EnergyLevel.High,
        10: EnergyLevel.High,
        11: EnergyLevel.Medium,
        12: EnergyLevel.High,
        13: EnergyLevel.Low,
        14: EnergyLevel.High,
        15: EnergyLevel.Medium,
        16: EnergyLevel.Low,
        17: EnergyLevel.Low,
        18: EnergyLevel.Low,
        19: EnergyLevel.Low,
      };

      const slots = getAvailableSlots(slotMap, EnergyLevel.High, [], baseDate);
      
      expect(slots).toEqual([9, 10, 12, 14]);
    });

    it('should filter out slots with conflicts', () => {
      const slotMap: TimeSlotMap = {
        8: EnergyLevel.High,
        9: EnergyLevel.High,
        10: EnergyLevel.High,
        11: EnergyLevel.High,
        12: EnergyLevel.High,
        13: EnergyLevel.High,
        14: EnergyLevel.High,
        15: EnergyLevel.High,
        16: EnergyLevel.High,
        17: EnergyLevel.High,
        18: EnergyLevel.High,
        19: EnergyLevel.High,
      };

      const events = [
        createEvent(9, 10),
        createEvent(14, 16),
      ];

      const slots = getAvailableSlots(slotMap, EnergyLevel.High, events, baseDate);
      
      expect(slots).not.toContain(9);
      expect(slots).not.toContain(14);
      expect(slots).not.toContain(15);
      expect(slots).toContain(8);
      expect(slots).toContain(10);
      expect(slots).toContain(11);
    });

    it('should return empty array when no matching energy slots', () => {
      const slotMap: TimeSlotMap = {
        8: EnergyLevel.Low,
        9: EnergyLevel.Low,
        10: EnergyLevel.Low,
        11: EnergyLevel.Low,
        12: EnergyLevel.Low,
        13: EnergyLevel.Low,
        14: EnergyLevel.Low,
        15: EnergyLevel.Low,
        16: EnergyLevel.Low,
        17: EnergyLevel.Low,
        18: EnergyLevel.Low,
        19: EnergyLevel.Low,
      };

      const slots = getAvailableSlots(slotMap, EnergyLevel.High, [], baseDate);
      
      expect(slots).toEqual([]);
    });

    it('should handle partial hour conflicts', () => {
      const slotMap: TimeSlotMap = {
        8: EnergyLevel.High,
        9: EnergyLevel.High,
        10: EnergyLevel.High,
        11: EnergyLevel.High,
        12: EnergyLevel.High,
        13: EnergyLevel.High,
        14: EnergyLevel.High,
        15: EnergyLevel.High,
        16: EnergyLevel.High,
        17: EnergyLevel.High,
        18: EnergyLevel.High,
        19: EnergyLevel.High,
      };

      const start = new Date(baseDate);
      start.setHours(9, 30, 0, 0);
      const end = new Date(baseDate);
      end.setHours(10, 30, 0, 0);
      
      const events: ClassifiedEvent[] = [{
        uid: 'partial-event',
        summary: 'Partial Event',
        start,
        end,
        classification: 'medium' as CognitiveLoad,
      }];

      const slots = getAvailableSlots(slotMap, EnergyLevel.High, events, baseDate);
      
      expect(slots).not.toContain(9);
      expect(slots).not.toContain(10);
    });
  });

  describe('isSlotAvailable', () => {
    const baseDate = new Date('2024-01-15T08:00:00');
    
    it('should return true for slot with no conflicts', () => {
      const events: ClassifiedEvent[] = [];
      expect(isSlotAvailable(10, 1, events, baseDate)).toBe(true);
    });

    it('should return false for slot with exact overlap', () => {
      const start = new Date(baseDate);
      start.setHours(10, 0, 0, 0);
      const end = new Date(baseDate);
      end.setHours(11, 0, 0, 0);
      
      const events: ClassifiedEvent[] = [{
        uid: 'event-1',
        summary: 'Test',
        start,
        end,
        classification: 'medium' as CognitiveLoad,
      }];

      expect(isSlotAvailable(10, 1, events, baseDate)).toBe(false);
    });

    it('should return false for partial overlap at start', () => {
      const start = new Date(baseDate);
      start.setHours(9, 30, 0, 0);
      const end = new Date(baseDate);
      end.setHours(10, 30, 0, 0);
      
      const events: ClassifiedEvent[] = [{
        uid: 'event-1',
        summary: 'Test',
        start,
        end,
        classification: 'medium' as CognitiveLoad,
      }];

      expect(isSlotAvailable(10, 1, events, baseDate)).toBe(false);
    });

    it('should return false for partial overlap at end', () => {
      const start = new Date(baseDate);
      start.setHours(10, 30, 0, 0);
      const end = new Date(baseDate);
      end.setHours(11, 30, 0, 0);
      
      const events: ClassifiedEvent[] = [{
        uid: 'event-1',
        summary: 'Test',
        start,
        end,
        classification: 'medium' as CognitiveLoad,
      }];

      expect(isSlotAvailable(10, 1, events, baseDate)).toBe(false);
    });

    it('should handle multi-hour duration', () => {
      const start = new Date(baseDate);
      start.setHours(11, 0, 0, 0);
      const end = new Date(baseDate);
      end.setHours(12, 0, 0, 0);
      
      const events: ClassifiedEvent[] = [{
        uid: 'event-1',
        summary: 'Test',
        start,
        end,
        classification: 'medium' as CognitiveLoad,
      }];

      expect(isSlotAvailable(10, 2, events, baseDate)).toBe(false);
      expect(isSlotAvailable(10, 1, events, baseDate)).toBe(true);
    });

    it('should return true when event is on different day', () => {
      const differentDay = new Date('2024-01-16T10:00:00');
      const start = new Date(differentDay);
      start.setHours(10, 0, 0, 0);
      const end = new Date(differentDay);
      end.setHours(11, 0, 0, 0);
      
      const events: ClassifiedEvent[] = [{
        uid: 'event-1',
        summary: 'Test',
        start,
        end,
        classification: 'medium' as CognitiveLoad,
      }];

      expect(isSlotAvailable(10, 1, events, baseDate)).toBe(true);
    });

    it('should handle events spanning entire duration', () => {
      const start = new Date(baseDate);
      start.setHours(10, 0, 0, 0);
      const end = new Date(baseDate);
      end.setHours(13, 0, 0, 0);
      
      const events: ClassifiedEvent[] = [{
        uid: 'event-1',
        summary: 'Test',
        start,
        end,
        classification: 'medium' as CognitiveLoad,
      }];

      expect(isSlotAvailable(10, 3, events, baseDate)).toBe(false);
      expect(isSlotAvailable(11, 1, events, baseDate)).toBe(false);
      expect(isSlotAvailable(12, 1, events, baseDate)).toBe(false);
    });
  });

  describe('calculateDuration', () => {
    it('should calculate duration for exact hours', () => {
      const start = new Date('2024-01-15T10:00:00');
      const end = new Date('2024-01-15T12:00:00');
      
      expect(calculateDuration(start, end)).toBe(2);
    });

    it('should round up partial hours', () => {
      const start = new Date('2024-01-15T10:00:00');
      const end = new Date('2024-01-15T10:30:00');
      
      expect(calculateDuration(start, end)).toBe(1);
    });

    it('should round up any partial hour', () => {
      const start = new Date('2024-01-15T10:00:00');
      const end = new Date('2024-01-15T12:15:00');
      
      expect(calculateDuration(start, end)).toBe(3);
    });

    it('should handle minutes correctly', () => {
      const start = new Date('2024-01-15T10:15:00');
      const end = new Date('2024-01-15T11:15:00');
      
      expect(calculateDuration(start, end)).toBe(1);
    });

    it('should return 0 for same start and end', () => {
      const date = new Date('2024-01-15T10:00:00');
      expect(calculateDuration(date, date)).toBe(0);
    });

    it('should handle negative duration as 0', () => {
      const start = new Date('2024-01-15T12:00:00');
      const end = new Date('2024-01-15T10:00:00');
      
      expect(calculateDuration(start, end)).toBe(0);
    });
  });

  describe('addHoursToDate', () => {
    it('should add hours to a date', () => {
      const date = new Date('2024-01-15T10:00:00');
      const result = addHoursToDate(date, 2);
      
      expect(result.getHours()).toBe(12);
      expect(result.getDate()).toBe(15);
    });

    it('should not modify original date', () => {
      const date = new Date('2024-01-15T10:00:00');
      const original = date.getTime();
      
      addHoursToDate(date, 2);
      
      expect(date.getTime()).toBe(original);
    });

    it('should handle negative hours', () => {
      const date = new Date('2024-01-15T10:00:00');
      const result = addHoursToDate(date, -2);
      
      expect(result.getHours()).toBe(8);
    });

    it('should handle day rollover', () => {
      const date = new Date('2024-01-15T23:00:00');
      const result = addHoursToDate(date, 2);
      
      expect(result.getDate()).toBe(16);
      expect(result.getHours()).toBe(1);
    });
  });

  describe('getHourFromDate', () => {
    it('should extract hour from date', () => {
      const date = new Date('2024-01-15T14:30:00');
      expect(getHourFromDate(date)).toBe(14);
    });

    it('should handle midnight', () => {
      const date = new Date('2024-01-15T00:00:00');
      expect(getHourFromDate(date)).toBe(0);
    });

    it('should handle end of day', () => {
      const date = new Date('2024-01-15T23:59:59');
      expect(getHourFromDate(date)).toBe(23);
    });
  });

  describe('createDateAtHour', () => {
    it('should create date at specified hour', () => {
      const baseDate = new Date('2024-01-15T10:30:45');
      const result = createDateAtHour(baseDate, 14);
      
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(0);
      expect(result.getDate()).toBe(15);
      expect(result.getHours()).toBe(14);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
    });

    it('should not modify original date', () => {
      const baseDate = new Date('2024-01-15T10:30:45');
      const original = baseDate.getTime();
      
      createDateAtHour(baseDate, 14);
      
      expect(baseDate.getTime()).toBe(original);
    });

    it('should handle hour 0', () => {
      const baseDate = new Date('2024-01-15T10:00:00');
      const result = createDateAtHour(baseDate, 0);
      
      expect(result.getHours()).toBe(0);
    });

    it('should handle hour 23', () => {
      const baseDate = new Date('2024-01-15T10:00:00');
      const result = createDateAtHour(baseDate, 23);
      
      expect(result.getHours()).toBe(23);
    });
  });

  describe('isWithinWorkingHours', () => {
    it('should return true for 8 AM', () => {
      const date = new Date('2024-01-15T08:00:00');
      expect(isWithinWorkingHours(date)).toBe(true);
    });

    it('should return true for 7 PM (19:00)', () => {
      const date = new Date('2024-01-15T19:00:00');
      expect(isWithinWorkingHours(date)).toBe(true);
    });

    it('should return false for 8 PM (20:00)', () => {
      const date = new Date('2024-01-15T20:00:00');
      expect(isWithinWorkingHours(date)).toBe(false);
    });

    it('should return false for 7 AM', () => {
      const date = new Date('2024-01-15T07:00:00');
      expect(isWithinWorkingHours(date)).toBe(false);
    });

    it('should return true for noon', () => {
      const date = new Date('2024-01-15T12:00:00');
      expect(isWithinWorkingHours(date)).toBe(true);
    });

    it('should return true for 7:59 PM', () => {
      const date = new Date('2024-01-15T19:59:59');
      expect(isWithinWorkingHours(date)).toBe(true);
    });

    it('should return false for midnight', () => {
      const date = new Date('2024-01-15T00:00:00');
      expect(isWithinWorkingHours(date)).toBe(false);
    });
  });

  describe('Boundary Conditions', () => {
    it('should handle events at exact working hours boundaries', () => {
      const slotMap: TimeSlotMap = {
        8: EnergyLevel.High,
        9: EnergyLevel.High,
        10: EnergyLevel.High,
        11: EnergyLevel.High,
        12: EnergyLevel.High,
        13: EnergyLevel.High,
        14: EnergyLevel.High,
        15: EnergyLevel.High,
        16: EnergyLevel.High,
        17: EnergyLevel.High,
        18: EnergyLevel.High,
        19: EnergyLevel.High,
      };

      const baseDate = new Date('2024-01-15T08:00:00');
      
      // Event at start of working hours
      const startEvent = new Date(baseDate);
      startEvent.setHours(8, 0, 0, 0);
      const startEventEnd = new Date(baseDate);
      startEventEnd.setHours(9, 0, 0, 0);
      
      const events: ClassifiedEvent[] = [{
        uid: 'start-event',
        summary: 'Start',
        start: startEvent,
        end: startEventEnd,
        classification: 'medium' as CognitiveLoad,
      }];

      expect(isSlotAvailable(8, 1, events, baseDate)).toBe(false);
      expect(isSlotAvailable(9, 1, events, baseDate)).toBe(true);
    });

    it('should handle slot at end boundary (7 PM)', () => {
      const baseDate = new Date('2024-01-15T08:00:00');
      expect(isSlotAvailable(19, 1, [], baseDate)).toBe(true);
    });

    it('should not allow slots outside working hours', () => {
      const slotMap: TimeSlotMap = {
        8: EnergyLevel.High,
        9: EnergyLevel.High,
        10: EnergyLevel.High,
        11: EnergyLevel.High,
        12: EnergyLevel.High,
        13: EnergyLevel.High,
        14: EnergyLevel.High,
        15: EnergyLevel.High,
        16: EnergyLevel.High,
        17: EnergyLevel.High,
        18: EnergyLevel.High,
        19: EnergyLevel.High,
      };

      const baseDate = new Date('2024-01-15T08:00:00');
      const slots = getAvailableSlots(slotMap, EnergyLevel.High, [], baseDate);
      
      expect(slots).not.toContain(7);
      expect(slots).not.toContain(20);
      expect(slots).not.toContain(0);
      expect(slots).not.toContain(23);
    });
  });

  describe('Slot Conflict Detection', () => {
    const baseDate = new Date('2024-01-15T08:00:00');
    
    it('should detect conflicts with multiple events', () => {
      const events: ClassifiedEvent[] = [
        {
          uid: 'event-1',
          summary: 'Morning Meeting',
          start: new Date('2024-01-15T09:00:00'),
          end: new Date('2024-01-15T10:00:00'),
          classification: 'heavy' as CognitiveLoad,
        },
        {
          uid: 'event-2',
          summary: 'Lunch',
          start: new Date('2024-01-15T12:00:00'),
          end: new Date('2024-01-15T13:00:00'),
          classification: 'light' as CognitiveLoad,
        },
        {
          uid: 'event-3',
          summary: 'Afternoon Sync',
          start: new Date('2024-01-15T15:00:00'),
          end: new Date('2024-01-15T16:00:00'),
          classification: 'medium' as CognitiveLoad,
        },
      ];

      expect(isSlotAvailable(9, 1, events, baseDate)).toBe(false);
      expect(isSlotAvailable(12, 1, events, baseDate)).toBe(false);
      expect(isSlotAvailable(15, 1, events, baseDate)).toBe(false);
      expect(isSlotAvailable(10, 1, events, baseDate)).toBe(true);
      expect(isSlotAvailable(14, 1, events, baseDate)).toBe(true);
    });

    it('should detect conflicts with back-to-back events', () => {
      const events: ClassifiedEvent[] = [
        {
          uid: 'event-1',
          summary: 'First',
          start: new Date('2024-01-15T10:00:00'),
          end: new Date('2024-01-15T11:00:00'),
          classification: 'medium' as CognitiveLoad,
        },
        {
          uid: 'event-2',
          summary: 'Second',
          start: new Date('2024-01-15T11:00:00'),
          end: new Date('2024-01-15T12:00:00'),
          classification: 'medium' as CognitiveLoad,
        },
      ];

      expect(isSlotAvailable(10, 1, events, baseDate)).toBe(false);
      expect(isSlotAvailable(11, 1, events, baseDate)).toBe(false);
      expect(isSlotAvailable(9, 1, events, baseDate)).toBe(true);
      expect(isSlotAvailable(12, 1, events, baseDate)).toBe(true);
    });

    it('should handle event spanning multiple hours', () => {
      const events: ClassifiedEvent[] = [
        {
          uid: 'long-event',
          summary: 'Long Meeting',
          start: new Date('2024-01-15T10:00:00'),
          end: new Date('2024-01-15T14:00:00'),
          classification: 'heavy' as CognitiveLoad,
        },
      ];

      expect(isSlotAvailable(10, 1, events, baseDate)).toBe(false);
      expect(isSlotAvailable(11, 1, events, baseDate)).toBe(false);
      expect(isSlotAvailable(12, 1, events, baseDate)).toBe(false);
      expect(isSlotAvailable(13, 1, events, baseDate)).toBe(false);
      expect(isSlotAvailable(14, 1, events, baseDate)).toBe(true);
      expect(isSlotAvailable(9, 1, events, baseDate)).toBe(true);
    });
  });
});
