// src/__tests__/stateHelpers.test.ts

import {
  initialState,
  setEnergyLevels,
  setUploadedEvents,
  setClassifiedEvents,
  setOptimizedEvents,
  setProcessing,
} from '../utils/stateHelpers';
import { AppState, EnergyLevel, CalendarEvent, ClassifiedEvent, OptimizedEvent } from '../types';

describe('stateHelpers', () => {
  it('should have the correct initial state', () => {
    expect(initialState).toEqual({
      energyLevels: Array(12).fill('medium'),
      uploadedEvents: [],
      classifiedEvents: [],
      optimizedEvents: [],
      isProcessing: false,
    });
  });

  it('setEnergyLevels should update energy levels immutably', () => {
    const newEnergyLevels: EnergyLevel[] = Array(12).fill('high');
    const newState = setEnergyLevels(initialState, newEnergyLevels);
    expect(newState.energyLevels).toEqual(newEnergyLevels);
    expect(newState).not.toBe(initialState);
    expect(initialState.energyLevels).not.toEqual(newEnergyLevels);
  });

  it('setUploadedEvents should update uploaded events immutably', () => {
    const newUploadedEvents: CalendarEvent[] = [{ uid: '1', summary: 'Test Event', start: new Date(), end: new Date() }];
    const newState = setUploadedEvents(initialState, newUploadedEvents);
    expect(newState.uploadedEvents).toEqual(newUploadedEvents);
    expect(newState).not.toBe(initialState);
    expect(initialState.uploadedEvents).not.toEqual(newUploadedEvents);
  });

  it('setClassifiedEvents should update classified events immutably', () => {
    const newClassifiedEvents: ClassifiedEvent[] = [
      { uid: '1', summary: 'Test Event', start: new Date(), end: new Date(), classification: 'heavy' },
    ];
    const newState = setClassifiedEvents(initialState, newClassifiedEvents);
    expect(newState.classifiedEvents).toEqual(newClassifiedEvents);
    expect(newState).not.toBe(initialState);
    expect(initialState.classifiedEvents).not.toEqual(newClassifiedEvents);
  });

  it('setOptimizedEvents should update optimized events immutably', () => {
    const newOptimizedEvents: OptimizedEvent[] = [
      {
        uid: '1',
        summary: 'Test Event',
        start: new Date(),
        end: new Date(),
        classification: 'heavy',
        originalStart: new Date(),
        originalEnd: new Date(),
      },
    ];
    const newState = setOptimizedEvents(initialState, newOptimizedEvents);
    expect(newState.optimizedEvents).toEqual(newOptimizedEvents);
    expect(newState).not.toBe(initialState);
    expect(initialState.optimizedEvents).not.toEqual(newOptimizedEvents);
  });

  it('setProcessing should update isProcessing immutably', () => {
    const newState = setProcessing(initialState, true);
    expect(newState.isProcessing).toBe(true);
    expect(newState).not.toBe(initialState);
    expect(initialState.isProcessing).toBe(false);
  });
});