import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ExportButton } from '../components/ExportButton';
import { OptimizedEvent } from '../types';
import * as icsBuilder from '../utils/icsBuilder';
import * as download from '../utils/download';

// Mock the utilities
jest.mock('../utils/icsBuilder');
jest.mock('../utils/download');

describe('ExportButton', () => {
  const mockBuildICSFile = icsBuilder.buildICSFile as jest.MockedFunction<typeof icsBuilder.buildICSFile>;
  const mockDownloadFile = download.downloadFile as jest.MockedFunction<typeof download.downloadFile>;
  const mockGenerateFilename = download.generateFilenameWithTimestamp as jest.MockedFunction<typeof download.generateFilenameWithTimestamp>;

  const mockOptimizedEvents: OptimizedEvent[] = [
    {
      uid: 'event-1',
      summary: 'Test Event 1',
      start: new Date('2024-03-15T09:00:00Z'),
      end: new Date('2024-03-15T10:00:00Z'),
      originalStart: new Date('2024-03-15T14:00:00Z'),
      originalEnd: new Date('2024-03-15T15:00:00Z'),
      classification: 'heavy',
    },
    {
      uid: 'event-2',
      summary: 'Test Event 2',
      start: new Date('2024-03-15T14:00:00Z'),
      end: new Date('2024-03-15T15:00:00Z'),
      originalStart: new Date('2024-03-15T09:00:00Z'),
      originalEnd: new Date('2024-03-15T10:00:00Z'),
      classification: 'light',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockBuildICSFile.mockReturnValue('mock-ics-content');
    mockGenerateFilename.mockReturnValue('optimized-schedule-2024-03-15-120000.ics');
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('rendering', () => {
    it('should render export button', () => {
      render(<ExportButton optimizedEvents={mockOptimizedEvents} />);
      
      const button = screen.getByRole('button', { name: /export optimized calendar/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Export Optimized Calendar');
    });

    it('should show icon in button', () => {
      render(<ExportButton optimizedEvents={mockOptimizedEvents} />);
      
      const button = screen.getByRole('button', { name: /export optimized calendar/i });
      expect(button).toHaveTextContent('📥');
    });

    it('should be enabled when events are provided', () => {
      render(<ExportButton optimizedEvents={mockOptimizedEvents} />);
      
      const button = screen.getByRole('button', { name: /export optimized calendar/i });
      expect(button).not.toBeDisabled();
    });

    it('should be disabled when no events provided', () => {
      render(<ExportButton optimizedEvents={[]} />);
      
      const button = screen.getByRole('button', { name: /export optimized calendar/i });
      expect(button).toBeDisabled();
    });

    it('should be disabled when disabled prop is true', () => {
      render(<ExportButton optimizedEvents={mockOptimizedEvents} disabled={true} />);
      
      const button = screen.getByRole('button', { name: /export optimized calendar/i });
      expect(button).toBeDisabled();
    });
  });

  describe('export functionality', () => {
    it('should generate ICS file when button is clicked', async () => {
      render(<ExportButton optimizedEvents={mockOptimizedEvents} />);
      
      const button = screen.getByRole('button', { name: /export optimized calendar/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockBuildICSFile).toHaveBeenCalledWith(mockOptimizedEvents);
      });
    });

    it('should generate filename with timestamp', async () => {
      render(<ExportButton optimizedEvents={mockOptimizedEvents} />);
      
      const button = screen.getByRole('button', { name: /export optimized calendar/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockGenerateFilename).toHaveBeenCalledWith('optimized-schedule', 'ics');
      });
    });

    it('should trigger download with correct parameters', async () => {
      render(<ExportButton optimizedEvents={mockOptimizedEvents} />);
      
      const button = screen.getByRole('button', { name: /export optimized calendar/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockDownloadFile).toHaveBeenCalledWith(
          'mock-ics-content',
          'optimized-schedule-2024-03-15-120000.ics'
        );
      });
    });

    it('should call onSuccess callback after successful export', async () => {
      const onSuccess = jest.fn();
      render(<ExportButton optimizedEvents={mockOptimizedEvents} onSuccess={onSuccess} />);
      
      const button = screen.getByRole('button', { name: /export optimized calendar/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('loading state', () => {
    it('should show loading state during export', async () => {
      // Make download async so we can catch the loading state
      mockDownloadFile.mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      render(<ExportButton optimizedEvents={mockOptimizedEvents} />);
      
      const button = screen.getByRole('button', { name: /export optimized calendar/i });
      fireEvent.click(button);

      // The loading state should appear
      await screen.findByText('Exporting...');
      expect(button).toBeDisabled();
    });

    it('should return to normal state after export completes', async () => {
      render(<ExportButton optimizedEvents={mockOptimizedEvents} />);
      
      const button = screen.getByRole('button', { name: /export optimized calendar/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(button).toHaveTextContent('Export Optimized Calendar');
        expect(button).not.toBeDisabled();
      });
    });
  });

  describe('success feedback', () => {
    it('should show success message after export', async () => {
      render(<ExportButton optimizedEvents={mockOptimizedEvents} />);
      
      const button = screen.getByRole('button', { name: /export optimized calendar/i });
      fireEvent.click(button);

      await waitFor(() => {
        const successMessage = screen.getByRole('status');
        expect(successMessage).toHaveTextContent('Calendar exported successfully!');
      });
    });

    it('should hide success message after 3 seconds', async () => {
      render(<ExportButton optimizedEvents={mockOptimizedEvents} />);
      
      const button = screen.getByRole('button', { name: /export optimized calendar/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('status')).toBeInTheDocument();
      });

      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
      });
    });
  });

  describe('error handling', () => {
    it('should not allow export when no events provided', () => {
      const onError = jest.fn();
      render(<ExportButton optimizedEvents={[]} onError={onError} />);
      
      const button = screen.getByRole('button', { name: /export optimized calendar/i });
      
      // Button should be disabled, so click does nothing
      expect(button).toBeDisabled();
      fireEvent.click(button);
      
      expect(onError).not.toHaveBeenCalled();
      expect(mockBuildICSFile).not.toHaveBeenCalled();
    });

    it('should call onError when ICS generation fails', async () => {
      const onError = jest.fn();
      const error = new Error('ICS generation failed');
      mockBuildICSFile.mockImplementation(() => {
        throw error;
      });

      render(<ExportButton optimizedEvents={mockOptimizedEvents} onError={onError} />);
      
      const button = screen.getByRole('button', { name: /export optimized calendar/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(error);
      });
    });

    it('should call onError when download fails', async () => {
      const onError = jest.fn();
      const error = new Error('Download failed');
      mockDownloadFile.mockImplementation(() => {
        throw error;
      });

      render(<ExportButton optimizedEvents={mockOptimizedEvents} onError={onError} />);
      
      const button = screen.getByRole('button', { name: /export optimized calendar/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(error);
      });
    });

    it('should handle non-Error exceptions', async () => {
      const onError = jest.fn();
      mockDownloadFile.mockImplementation(() => {
        throw 'String error';
      });

      render(<ExportButton optimizedEvents={mockOptimizedEvents} onError={onError} />);
      
      const button = screen.getByRole('button', { name: /export optimized calendar/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(expect.any(Error));
        expect(onError.mock.calls[0][0].message).toBe('Export failed');
      });
    });

    it('should reset loading state after error', async () => {
      mockDownloadFile.mockImplementation(() => {
        throw new Error('Download failed');
      });

      render(<ExportButton optimizedEvents={mockOptimizedEvents} />);
      
      const button = screen.getByRole('button', { name: /export optimized calendar/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(button).toHaveTextContent('Export Optimized Calendar');
        expect(button).not.toBeDisabled();
      });
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA label', () => {
      render(<ExportButton optimizedEvents={mockOptimizedEvents} />);
      
      const button = screen.getByRole('button', { name: /export optimized calendar/i });
      expect(button).toHaveAttribute('aria-label', 'Export optimized calendar');
    });

    it('should mark icon as decorative', () => {
      render(<ExportButton optimizedEvents={mockOptimizedEvents} />);
      
      const button = screen.getByRole('button', { name: /export optimized calendar/i });
      const icon = button.querySelector('[aria-hidden="true"]');
      expect(icon).toBeInTheDocument();
    });

    it('should use status role for success message', async () => {
      render(<ExportButton optimizedEvents={mockOptimizedEvents} />);
      
      const button = screen.getByRole('button', { name: /export optimized calendar/i });
      fireEvent.click(button);

      await waitFor(() => {
        const status = screen.getByRole('status');
        expect(status).toHaveAttribute('aria-live', 'polite');
      });
    });
  });
});
