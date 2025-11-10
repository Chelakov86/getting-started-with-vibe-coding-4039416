import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExportButton } from '../components/ExportButton';
import { OptimizedEvent } from '../types';

/**
 * Integration tests for the export functionality
 * These tests verify the entire export flow without mocking internal utilities
 */
describe('ExportButton Integration', () => {
  // Set up browser API mocks
  let createObjectURLMock: jest.Mock;
  let revokeObjectURLMock: jest.Mock;
  let appendChildMock: jest.SpyInstance;
  let removeChildMock: jest.SpyInstance;
  let anchorElement: HTMLAnchorElement;

  beforeEach(() => {
    // Mock URL APIs
    createObjectURLMock = jest.fn().mockReturnValue('blob:mock-url');
    revokeObjectURLMock = jest.fn();
    (global.URL as any).createObjectURL = createObjectURLMock;
    (global.URL as any).revokeObjectURL = revokeObjectURLMock;

    // Mock DOM methods  
    appendChildMock = jest.spyOn(document.body, 'appendChild');
    removeChildMock = jest.spyOn(document.body, 'removeChild');

    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  const mockOptimizedEvents: OptimizedEvent[] = [
    {
      uid: 'event-1@test.com',
      summary: 'Team Meeting',
      start: new Date('2024-03-15T09:00:00Z'),
      end: new Date('2024-03-15T10:00:00Z'),
      originalStart: new Date('2024-03-15T14:00:00Z'),
      originalEnd: new Date('2024-03-15T15:00:00Z'),
      classification: 'heavy',
    },
    {
      uid: 'event-2@test.com',
      summary: 'Email Review',
      start: new Date('2024-03-15T14:00:00Z'),
      end: new Date('2024-03-15T15:00:00Z'),
      originalStart: new Date('2024-03-15T09:00:00Z'),
      originalEnd: new Date('2024-03-15T10:00:00Z'),
      classification: 'light',
    },
  ];

  it('should generate valid ICS file and trigger download', async () => {
    render(<ExportButton optimizedEvents={mockOptimizedEvents} />);

    const button = screen.getByRole('button', { name: /export optimized calendar/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(createObjectURLMock).toHaveBeenCalledWith(expect.any(Blob));
    });

    // Verify the blob contains ICS content
    const blob = createObjectURLMock.mock.calls[0][0];
    expect(blob.type).toBe('text/calendar');

    // Verify download was initiated
    expect(appendChildMock).toHaveBeenCalled();
    const anchorCall = appendChildMock.mock.calls.find(call => 
      call[0] && call[0].tagName === 'A'
    );
    expect(anchorCall).toBeDefined();
    
    if (anchorCall) {
      const anchor = anchorCall[0] as HTMLAnchorElement;
      expect(anchor.download).toMatch(/^optimized-schedule-\d{4}-\d{2}-\d{2}-\d{6}\.ics$/);
    }
  });

  it('should generate ICS content with correct structure', async () => {
    render(<ExportButton optimizedEvents={mockOptimizedEvents} />);

    const button = screen.getByRole('button', { name: /export optimized calendar/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(createObjectURLMock).toHaveBeenCalled();
    });

    // Read the blob content using FileReader
    const blob = createObjectURLMock.mock.calls[0][0] as Blob;
    const content = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsText(blob);
    });

    // Verify ICS structure
    expect(content).toContain('BEGIN:VCALENDAR');
    expect(content).toContain('VERSION:2.0');
    expect(content).toContain('PRODID:-//TurtleRocket//Time Twister//EN');
    expect(content).toContain('END:VCALENDAR');

    // Verify events are included
    expect(content).toContain('BEGIN:VEVENT');
    expect(content).toContain('END:VEVENT');
    expect(content).toContain('SUMMARY:Team Meeting');
    expect(content).toContain('SUMMARY:Email Review');

    // Verify optimization metadata
    expect(content).toContain('X-TURTLEROCKET-OPTIMIZED:true');
    expect(content).toContain('X-TURTLEROCKET-CLASSIFICATION:heavy');
    expect(content).toContain('X-TURTLEROCKET-CLASSIFICATION:light');
  });

  it('should clean up object URL after download', async () => {
    render(<ExportButton optimizedEvents={mockOptimizedEvents} />);

    const button = screen.getByRole('button', { name: /export optimized calendar/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(createObjectURLMock).toHaveBeenCalled();
    });

    expect(revokeObjectURLMock).not.toHaveBeenCalled();

    // Advance timer to trigger URL cleanup
    jest.advanceTimersByTime(100);

    expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:mock-url');
  });

  it('should show complete export flow with user feedback', async () => {
    render(<ExportButton optimizedEvents={mockOptimizedEvents} />);

    const button = screen.getByRole('button', { name: /export optimized calendar/i });
    
    // Initial state
    expect(button).toHaveTextContent('Export Optimized Calendar');
    expect(button).not.toBeDisabled();

    // Click to start export
    fireEvent.click(button);

    // Should show success message
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Calendar exported successfully!');
    });

    // Button should return to normal state
    expect(button).toHaveTextContent('Export Optimized Calendar');
    expect(button).not.toBeDisabled();

    // Success message should disappear after 3 seconds
    jest.advanceTimersByTime(3000);

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  it('should handle special characters in event summaries', async () => {
    const eventsWithSpecialChars: OptimizedEvent[] = [
      {
        uid: 'special@test.com',
        summary: 'Meeting; with, special\\chars\nand newlines',
        start: new Date('2024-03-15T09:00:00Z'),
        end: new Date('2024-03-15T10:00:00Z'),
        originalStart: new Date('2024-03-15T09:00:00Z'),
        originalEnd: new Date('2024-03-15T10:00:00Z'),
        classification: 'medium',
      },
    ];

    render(<ExportButton optimizedEvents={eventsWithSpecialChars} />);

    const button = screen.getByRole('button', { name: /export optimized calendar/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(createObjectURLMock).toHaveBeenCalled();
    });

    const blob = createObjectURLMock.mock.calls[0][0] as Blob;
    const content = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsText(blob);
    });

    // Verify special characters are properly escaped
    expect(content).toContain('SUMMARY:Meeting\\; with\\, special\\\\chars\\nand newlines');
  });

  it('should handle errors during export gracefully', async () => {
    const onError = jest.fn();

    // Force an error by breaking Blob
    const originalBlob = global.Blob;
    // @ts-ignore
    delete global.Blob;

    render(<ExportButton optimizedEvents={mockOptimizedEvents} onError={onError} />);

    const button = screen.getByRole('button', { name: /export optimized calendar/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });

    // Restore Blob
    global.Blob = originalBlob;
  });
});
