import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { parseICSFile } from '../utils/icsParser';
import { classifyEvents } from '../utils/classifier';
import { optimizeSchedule } from '../utils/optimizer';

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Sample ICS file content for testing
const sampleICSContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
UID:test-1
DTSTART:20241111T090000
DTEND:20241111T100000
SUMMARY:Team Meeting
END:VEVENT
BEGIN:VEVENT
UID:test-2
DTSTART:20241111T140000
DTEND:20241111T160000
SUMMARY:Deep Work - Code Review
END:VEVENT
BEGIN:VEVENT
UID:test-3
DTSTART:20241111T160000
DTEND:20241111T170000
SUMMARY:Email Catch-up
END:VEVENT
END:VCALENDAR`;

describe('App Integration Tests', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('Initial State', () => {
    it('should render the app with empty state', () => {
      render(<App />);
      
      expect(screen.getByText(/TurtleRocket Time Twister/i)).toBeInTheDocument();
      expect(screen.getByText(/Get Started/i)).toBeInTheDocument();
    });

    it('should show energy selector on initial load', () => {
      render(<App />);
      
      expect(screen.getByText(/Energy Levels/i)).toBeInTheDocument();
    });

    it('should show file upload component', () => {
      render(<App />);
      
      expect(screen.getByText(/Upload Calendar/i)).toBeInTheDocument();
    });
  });

  describe('End-to-End User Flow', () => {
    it('should complete full workflow: upload → classify → optimize → export', async () => {
      render(<App />);

      // Step 1: Upload file
      const file = new File([sampleICSContent], 'test.ics', {
        type: 'text/calendar',
      });
      
      const fileInput = screen.getByLabelText(/choose file/i) as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [file] } });

      // Wait for file to be processed
      await waitFor(() => {
        expect(screen.getByText(/Current Schedule/i)).toBeInTheDocument();
      }, { timeout: 3000 });

      // Step 2: Verify events are classified and displayed
      expect(screen.getByText(/Team Meeting/i)).toBeInTheDocument();
      expect(screen.getByText(/Deep Work - Code Review/i)).toBeInTheDocument();
      expect(screen.getByText(/Email Catch-up/i)).toBeInTheDocument();

      // Step 3: Optimize schedule
      const optimizeButton = screen.getByRole('button', { name: /Optimize Schedule/i });
      expect(optimizeButton).toBeEnabled();
      
      fireEvent.click(optimizeButton);

      // Wait for optimization to complete
      await waitFor(() => {
        expect(screen.getByText(/Optimized Schedule/i)).toBeInTheDocument();
      }, { timeout: 3000 });

      // Step 4: Verify export button is available
      const exportButton = screen.getByRole('button', { name: /Export/i });
      expect(exportButton).toBeInTheDocument();
      expect(exportButton).toBeEnabled();
    });

    it('should handle file upload and show success notification', async () => {
      render(<App />);

      const file = new File([sampleICSContent], 'test.ics', {
        type: 'text/calendar',
      });
      
      const fileInput = screen.getByLabelText(/choose file/i) as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText(/Successfully loaded/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should persist energy levels to localStorage', async () => {
      render(<App />);

      // Change an energy level
      const energyButtons = screen.getAllByRole('button');
      const firstEnergyButton = energyButtons.find(btn => 
        btn.getAttribute('aria-label')?.includes('Set energy for hour')
      );
      
      if (firstEnergyButton) {
        fireEvent.click(firstEnergyButton);
      }

      // Check that state was saved to localStorage
      await waitFor(() => {
        const savedState = localStorageMock.getItem('turtleRocketTimeTwisterAppState');
        expect(savedState).toBeTruthy();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error for invalid ICS file', async () => {
      render(<App />);

      const invalidICS = 'INVALID ICS CONTENT';
      const file = new File([invalidICS], 'invalid.ics', {
        type: 'text/calendar',
      });
      
      const fileInput = screen.getByLabelText(/choose file/i) as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText(/Error/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should prevent optimization when no events are loaded', () => {
      render(<App />);

      const optimizeButton = screen.queryByRole('button', { name: /Optimize Schedule/i });
      expect(optimizeButton).not.toBeInTheDocument();
    });
  });

  describe('State Consistency', () => {
    it('should clear optimized events when new file is uploaded', async () => {
      render(<App />);

      // Upload first file
      const file1 = new File([sampleICSContent], 'test1.ics', {
        type: 'text/calendar',
      });
      
      const fileInput = screen.getByLabelText(/choose file/i) as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [file1] } });

      await waitFor(() => {
        expect(screen.getByText(/Current Schedule/i)).toBeInTheDocument();
      });

      // Optimize
      const optimizeButton = screen.getByRole('button', { name: /Optimize Schedule/i });
      fireEvent.click(optimizeButton);

      await waitFor(() => {
        expect(screen.getByText(/Optimized Schedule/i)).toBeInTheDocument();
      });

      // Upload second file
      const file2 = new File([sampleICSContent], 'test2.ics', {
        type: 'text/calendar',
      });
      fireEvent.change(fileInput, { target: { files: [file2] } });

      // Optimized schedule should be cleared
      await waitFor(() => {
        expect(screen.queryByText(/Optimized Schedule/i)).not.toBeInTheDocument();
      });
    });

    it('should maintain energy levels across file uploads', async () => {
      render(<App />);

      // Upload file
      const file = new File([sampleICSContent], 'test.ics', {
        type: 'text/calendar',
      });
      
      const fileInput = screen.getByLabelText(/choose file/i) as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText(/Current Schedule/i)).toBeInTheDocument();
      });

      // Energy selector should still be present and functional
      expect(screen.getByText(/Energy Levels/i)).toBeInTheDocument();
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('should optimize schedule with Ctrl+O', async () => {
      render(<App />);

      // Upload file first
      const file = new File([sampleICSContent], 'test.ics', {
        type: 'text/calendar',
      });
      
      const fileInput = screen.getByLabelText(/choose file/i) as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText(/Current Schedule/i)).toBeInTheDocument();
      });

      // Press Ctrl+O
      fireEvent.keyDown(window, { key: 'o', ctrlKey: true });

      await waitFor(() => {
        expect(screen.getByText(/Optimized Schedule/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should reset energy with Ctrl+R', async () => {
      render(<App />);

      // Press Ctrl+R
      fireEvent.keyDown(window, { key: 'r', ctrlKey: true });

      await waitFor(() => {
        expect(screen.getByText(/reset to default/i)).toBeInTheDocument();
      });
    });
  });

  describe('Utility Function Integration', () => {
    it('should correctly parse, classify, and optimize events', () => {
      const parsed = parseICSFile(sampleICSContent);
      expect(parsed.length).toBe(3);

      const classified = classifyEvents(parsed);
      expect(classified.every(e => e.cognitiveLoad)).toBe(true);

      const mockEnergy = {
        9: 'high' as const,
        10: 'high' as const,
        14: 'medium' as const,
        15: 'medium' as const,
        16: 'low' as const,
      };

      const classifiedEvents = classified.map(e => ({
        uid: e.id,
        summary: e.title,
        start: e.startTime,
        end: e.endTime,
        classification: e.cognitiveLoad,
      }));

      const result = optimizeSchedule(classifiedEvents, mockEnergy);
      expect(result.optimizedEvents.length).toBe(3);
      expect(result.metrics.totalEvents).toBe(3);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<App />);

      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('should support keyboard navigation', () => {
      render(<App />);

      // Should have focusable elements
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });
});
