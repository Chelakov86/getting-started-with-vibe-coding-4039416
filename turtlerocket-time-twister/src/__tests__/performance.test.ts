import { parseICS } from '../utils/icsParser';
import { classifyEvents } from '../utils/classifier';
import { optimizeSchedule } from '../utils/optimizer';
import { buildICS } from '../utils/icsBuilder';
import {
  generateMockEvents,
  createMockICSFile,
  createLargeICSFile,
  ICSFileBuilder,
} from '../test-utils';
import { HourlyEnergy } from '../types/energy';

describe('Performance Tests - Optimization Speed', () => {
  const createHighEnergyMorning = (): HourlyEnergy => {
    const energy: HourlyEnergy = {};
    for (let i = 0; i < 24; i++) {
      energy[i] = i >= 6 && i <= 12 ? 3 : i >= 13 && i <= 17 ? 2 : 1;
    }
    return energy;
  };

  describe('ICS Parsing Performance', () => {
    it('should parse 100 events in under 500ms', async () => {
      const events = generateMockEvents({ count: 100, spacing: 15 });
      const file = createMockICSFile(events);
      const content = await file.text();

      const startTime = performance.now();
      const parsed = parseICS(content);
      const endTime = performance.now();

      expect(parsed.length).toBe(100);
      expect(endTime - startTime).toBeLessThan(500);
    });

    it('should parse 1000 events in under 1 second', async () => {
      const events = generateMockEvents({ count: 1000, spacing: 15 });
      const builder = new ICSFileBuilder();
      builder.addEvents(events);
      const content = builder.build();

      const startTime = performance.now();
      const parsed = parseICS(content);
      const endTime = performance.now();

      expect(parsed.length).toBe(1000);
      expect(endTime - startTime).toBeLessThan(1000);
    });

    it('should parse 5000 events in under 3 seconds', async () => {
      const events = generateMockEvents({ count: 5000, spacing: 10 });
      const builder = new ICSFileBuilder();
      builder.addEvents(events);
      const content = builder.build();

      const startTime = performance.now();
      const parsed = parseICS(content);
      const endTime = performance.now();

      expect(parsed.length).toBe(5000);
      expect(endTime - startTime).toBeLessThan(3000);
    });
  });

  describe('Event Classification Performance', () => {
    it('should classify 100 events in under 100ms', () => {
      const events = generateMockEvents({ count: 100 });

      const startTime = performance.now();
      const classified = classifyEvents(events);
      const endTime = performance.now();

      expect(classified.length).toBe(100);
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should classify 1000 events in under 500ms', () => {
      const events = generateMockEvents({ count: 1000 });

      const startTime = performance.now();
      const classified = classifyEvents(events);
      const endTime = performance.now();

      expect(classified.length).toBe(1000);
      expect(endTime - startTime).toBeLessThan(500);
    });

    it('should handle complex keyword matching efficiently', () => {
      const events = generateMockEvents({ count: 500 });
      events.forEach((event, i) => {
        event.summary = `Complex Meeting Strategy Planning Review Session ${i}`;
      });

      const startTime = performance.now();
      const classified = classifyEvents(events);
      const endTime = performance.now();

      expect(classified.length).toBe(500);
      expect(endTime - startTime).toBeLessThan(300);
    });
  });

  describe('Schedule Optimization Performance', () => {
    it('should optimize 50 events in under 500ms', () => {
      const events = generateMockEvents({ count: 50, spacing: 30 });
      const classified = classifyEvents(events);
      const energy = createHighEnergyMorning();

      const startTime = performance.now();
      const optimized = optimizeSchedule(classified, energy);
      const endTime = performance.now();

      expect(optimized.length).toBe(50);
      expect(endTime - startTime).toBeLessThan(500);
    });

    it('should optimize 100 events in under 1 second', () => {
      const events = generateMockEvents({ count: 100, spacing: 30 });
      const classified = classifyEvents(events);
      const energy = createHighEnergyMorning();

      const startTime = performance.now();
      const optimized = optimizeSchedule(classified, energy);
      const endTime = performance.now();

      expect(optimized.length).toBe(100);
      expect(endTime - startTime).toBeLessThan(1000);
    });

    it('should optimize 200 events in under 2 seconds', () => {
      const events = generateMockEvents({ count: 200, spacing: 15 });
      const classified = classifyEvents(events);
      const energy = createHighEnergyMorning();

      const startTime = performance.now();
      const optimized = optimizeSchedule(classified, energy);
      const endTime = performance.now();

      expect(optimized.length).toBe(200);
      expect(endTime - startTime).toBeLessThan(2000);
    });
  });

  describe('ICS Building Performance', () => {
    it('should build ICS from 100 events in under 200ms', () => {
      const events = generateMockEvents({ count: 100 });

      const startTime = performance.now();
      const icsContent = buildICS(events);
      const endTime = performance.now();

      expect(icsContent).toContain('BEGIN:VCALENDAR');
      expect(endTime - startTime).toBeLessThan(200);
    });

    it('should build ICS from 1000 events in under 1 second', () => {
      const events = generateMockEvents({ count: 1000 });

      const startTime = performance.now();
      const icsContent = buildICS(events);
      const endTime = performance.now();

      expect(icsContent).toContain('BEGIN:VCALENDAR');
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });

  describe('End-to-End Pipeline Performance', () => {
    it('should complete full pipeline for 50 events in under 1 second', async () => {
      const events = generateMockEvents({ count: 50, spacing: 30 });
      const file = createMockICSFile(events);
      const content = await file.text();
      const energy = createHighEnergyMorning();

      const startTime = performance.now();

      const parsed = parseICS(content);
      const classified = classifyEvents(parsed);
      const optimized = optimizeSchedule(classified, energy);
      const exported = buildICS(optimized);

      const endTime = performance.now();

      expect(parsed.length).toBe(50);
      expect(classified.length).toBe(50);
      expect(optimized.length).toBe(50);
      expect(exported).toContain('BEGIN:VCALENDAR');
      expect(endTime - startTime).toBeLessThan(1000);
    });

    it('should complete full pipeline for 100 events in under 2 seconds', async () => {
      const events = generateMockEvents({ count: 100, spacing: 20 });
      const file = createMockICSFile(events);
      const content = await file.text();
      const energy = createHighEnergyMorning();

      const startTime = performance.now();

      const parsed = parseICS(content);
      const classified = classifyEvents(parsed);
      const optimized = optimizeSchedule(classified, energy);
      const exported = buildICS(optimized);

      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(2000);
    });

    it('should complete full pipeline for 200 events in under 4 seconds', async () => {
      const events = generateMockEvents({ count: 200, spacing: 15 });
      const file = createMockICSFile(events);
      const content = await file.text();
      const energy = createHighEnergyMorning();

      const startTime = performance.now();

      const parsed = parseICS(content);
      const classified = classifyEvents(parsed);
      const optimized = optimizeSchedule(classified, energy);
      const exported = buildICS(optimized);

      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(4000);
    });
  });

  describe('Memory Usage', () => {
    it('should handle large datasets without memory issues', () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

      const events = generateMockEvents({ count: 1000 });
      const classified = classifyEvents(events);
      const energy = createHighEnergyMorning();
      const optimized = optimizeSchedule(classified, energy);
      const exported = buildICS(optimized);

      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;

      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });

    it('should not leak memory on repeated operations', () => {
      const events = generateMockEvents({ count: 100 });
      const energy = createHighEnergyMorning();

      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

      for (let i = 0; i < 10; i++) {
        const classified = classifyEvents(events);
        const optimized = optimizeSchedule(classified, energy);
        buildICS(optimized);
      }

      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;

      expect(memoryIncrease).toBeLessThan(20 * 1024 * 1024);
    });
  });

  describe('Algorithmic Complexity', () => {
    it('should scale linearly with input size', () => {
      const sizes = [50, 100, 200];
      const times: number[] = [];

      sizes.forEach(size => {
        const events = generateMockEvents({ count: size, spacing: 30 });
        const classified = classifyEvents(events);
        const energy = createHighEnergyMorning();

        const startTime = performance.now();
        optimizeSchedule(classified, energy);
        const endTime = performance.now();

        times.push(endTime - startTime);
      });

      const ratio1 = times[1] / times[0];
      const ratio2 = times[2] / times[1];

      expect(ratio1).toBeLessThan(3);
      expect(ratio2).toBeLessThan(3);
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle multiple operations simultaneously', async () => {
      const operations = Array.from({ length: 5 }, (_, i) =>
        generateMockEvents({ count: 50, summaryPrefix: `Batch${i}` })
      );

      const startTime = performance.now();

      const results = await Promise.all(
        operations.map(events => {
          const classified = classifyEvents(events);
          const energy = createHighEnergyMorning();
          return optimizeSchedule(classified, energy);
        })
      );

      const endTime = performance.now();

      expect(results.length).toBe(5);
      expect(endTime - startTime).toBeLessThan(3000);
    });
  });
});
