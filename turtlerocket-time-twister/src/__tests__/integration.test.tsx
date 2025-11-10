import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import {
  generateMockEvents,
  createMockICSFile,
  createEmptyICSFile,
  generateEventsWithKeywords,
} from '../test-utils';
import { HourlyEnergy } from '../types/energy';

describe('Integration Tests - Full User Workflows', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Complete Calendar Optimization Workflow', () => {
    it('should complete full workflow: upload → classify → optimize → export', async () => {
      render(<App />);

      expect(screen.getByText(/TurtleRocket Time Twister/i)).toBeInTheDocument();

      const energySelectors = screen.getAllByRole('combobox');
      expect(energySelectors.length).toBeGreaterThan(0);

      await userEvent.selectOptions(energySelectors[9], '3');
      await userEvent.selectOptions(energySelectors[10], '3');
      await userEvent.selectOptions(energySelectors[14], '1');

      const events = generateEventsWithKeywords({
        heavy: ['Strategy Planning Meeting', 'Code Review Session'],
        medium: ['Team Standup', 'Email Review'],
        light: ['Coffee Break', 'Casual Chat'],
      });

      const file = createMockICSFile(events);
      const fileInput = screen.getByLabelText(/upload/i) as HTMLInputElement;

      userEvent.upload(fileInput, file);

      await waitFor(
        () => {
          expect(screen.getByText(/original schedule/i)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      await waitFor(
        () => {
          expect(screen.getByText(/optimized schedule/i)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      const exportButton = screen.getByRole('button', { name: /export/i });
      expect(exportButton).toBeEnabled();
    });

    it('should handle empty calendar file gracefully', async () => {
      render(<App />);

      const file = createEmptyICSFile();
      const fileInput = screen.getByLabelText(/upload/i) as HTMLInputElement;

      userEvent.upload(fileInput, file);

      await waitFor(() => {
        const message = screen.queryByText(/no events found/i);
        expect(message || screen.getByText(/empty/i)).toBeInTheDocument();
      });
    });

    it('should maintain energy selections throughout workflow', async () => {
      render(<App />);

      const energySelectors = screen.getAllByRole('combobox');

      await userEvent.selectOptions(energySelectors[0], '1');
      await userEvent.selectOptions(energySelectors[12], '3');

      const events = generateMockEvents({ count: 5 });
      const file = createMockICSFile(events);
      const fileInput = screen.getByLabelText(/upload/i) as HTMLInputElement;

      userEvent.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText(/schedule/i)).toBeInTheDocument();
      });

      expect((energySelectors[0] as HTMLSelectElement).value).toBe('1');
      expect((energySelectors[12] as HTMLSelectElement).value).toBe('3');
    });
  });

  describe('Multi-File Upload Workflow', () => {
    it('should handle multiple sequential file uploads', async () => {
      render(<App />);

      const events1 = generateMockEvents({ count: 3, summaryPrefix: 'First' });
      const file1 = createMockICSFile(events1);
      const fileInput = screen.getByLabelText(/upload/i) as HTMLInputElement;

      userEvent.upload(fileInput, file1);

      await waitFor(() => {
        expect(screen.getByText(/First 0/i)).toBeInTheDocument();
      });

      const events2 = generateMockEvents({ count: 3, summaryPrefix: 'Second' });
      const file2 = createMockICSFile(events2);

      userEvent.upload(fileInput, file2);

      await waitFor(() => {
        expect(screen.getByText(/Second 0/i)).toBeInTheDocument();
      });

      expect(screen.queryByText(/First 0/i)).not.toBeInTheDocument();
    });
  });

  describe('Energy Pattern Workflows', () => {
    it('should optimize schedule based on morning energy pattern', async () => {
      render(<App />);

      const energySelectors = screen.getAllByRole('combobox');

      for (let i = 6; i <= 11; i++) {
        await userEvent.selectOptions(energySelectors[i], '3');
      }

      for (let i = 12; i <= 17; i++) {
        await userEvent.selectOptions(energySelectors[i], '1');
      }

      const events = generateEventsWithKeywords({
        heavy: ['Deep Work', 'Strategic Planning'],
        medium: ['Meeting'],
        light: ['Admin Tasks', 'Email'],
      });

      const file = createMockICSFile(events);
      const fileInput = screen.getByLabelText(/upload/i) as HTMLInputElement;

      userEvent.upload(fileInput, file);

      await waitFor(
        () => {
          expect(screen.getByText(/optimized schedule/i)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('should optimize schedule based on evening energy pattern', async () => {
      render(<App />);

      const energySelectors = screen.getAllByRole('combobox');

      for (let i = 6; i <= 11; i++) {
        await userEvent.selectOptions(energySelectors[i], '1');
      }

      for (let i = 12; i <= 17; i++) {
        await userEvent.selectOptions(energySelectors[i], '3');
      }

      const events = generateEventsWithKeywords({
        heavy: ['Analysis', 'Coding'],
        medium: ['Review'],
        light: ['Lunch', 'Break'],
      });

      const file = createMockICSFile(events);
      const fileInput = screen.getByLabelText(/upload/i) as HTMLInputElement;

      userEvent.upload(fileInput, file);

      await waitFor(
        () => {
          expect(screen.getByText(/optimized schedule/i)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('should handle flat energy pattern', async () => {
      render(<App />);

      const energySelectors = screen.getAllByRole('combobox');

      for (let i = 0; i < 24; i++) {
        await userEvent.selectOptions(energySelectors[i], '2');
      }

      const events = generateMockEvents({ count: 10 });
      const file = createMockICSFile(events);
      const fileInput = screen.getByLabelText(/upload/i) as HTMLInputElement;

      userEvent.upload(fileInput, file);

      await waitFor(
        () => {
          expect(screen.getByText(/schedule/i)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
  });

  describe('Error Recovery Workflows', () => {
    it('should recover from invalid file and accept valid file', async () => {
      render(<App />);

      const invalidFile = new File(['invalid content'], 'invalid.ics', {
        type: 'text/calendar',
      });
      const fileInput = screen.getByLabelText(/upload/i) as HTMLInputElement;

      userEvent.upload(fileInput, invalidFile);

      await waitFor(() => {
        expect(
          screen.getByText(/error/i) || screen.getByText(/invalid/i)
        ).toBeInTheDocument();
      });

      const validEvents = generateMockEvents({ count: 5 });
      const validFile = createMockICSFile(validEvents);

      userEvent.upload(fileInput, validFile);

      await waitFor(() => {
        expect(screen.getByText(/schedule/i)).toBeInTheDocument();
      });
    });
  });

  describe('User Interaction Patterns', () => {
    it('should handle rapid energy slider changes', async () => {
      render(<App />);

      const energySelectors = screen.getAllByRole('combobox');

      for (let i = 0; i < 5; i++) {
        await userEvent.selectOptions(energySelectors[9], '3');
        await userEvent.selectOptions(energySelectors[9], '1');
        await userEvent.selectOptions(energySelectors[9], '2');
      }

      expect((energySelectors[9] as HTMLSelectElement).value).toBe('2');
    });

    it('should preserve state during multiple interactions', async () => {
      render(<App />);

      const energySelectors = screen.getAllByRole('combobox');
      await userEvent.selectOptions(energySelectors[9], '3');

      const events = generateMockEvents({ count: 5 });
      const file = createMockICSFile(events);
      const fileInput = screen.getByLabelText(/upload/i) as HTMLInputElement;

      userEvent.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText(/schedule/i)).toBeInTheDocument();
      });

      await userEvent.selectOptions(energySelectors[14], '1');

      expect((energySelectors[9] as HTMLSelectElement).value).toBe('3');
    });
  });

  describe('Large Dataset Workflows', () => {
    it('should handle 100+ events workflow efficiently', async () => {
      render(<App />);

      const events = generateMockEvents({ count: 100, spacing: 15 });
      const file = createMockICSFile(events);
      const fileInput = screen.getByLabelText(/upload/i) as HTMLInputElement;

      const startTime = performance.now();

      userEvent.upload(fileInput, file);

      await waitFor(
        () => {
          expect(screen.getByText(/schedule/i)).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(5000);
    });
  });
});
