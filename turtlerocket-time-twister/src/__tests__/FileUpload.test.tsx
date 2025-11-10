// src/__tests__/FileUpload.test.tsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FileUpload from '../components/FileUpload';
import * as validation from '../utils/validation';

// Mock the validation functions to control test scenarios
jest.mock('../utils/validation', () => ({
  ...jest.requireActual('../utils/validation'),
  validateICSFormat: jest.fn(),
}));

const mockValidateICSFormat = validation.validateICSFormat as jest.Mock;

describe('FileUpload Component', () => {
  const mockOnFileSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockValidateICSFormat.mockResolvedValue(null); // Default to valid ICS format
  });

  const setup = (props = {}) => {
    const defaultProps = {
      onFileSelect: mockOnFileSelect,
      isProcessing: false,
      error: null,
    };
    return render(<FileUpload {...defaultProps} {...props} />);
  };

  const createMockFile = (name: string, size: number, type: string, content: string = 'BEGIN:VCALENDAR') => {
    const file = new File([content], name, { type });
    Object.defineProperty(file, 'size', { value: size });
    return file;
  };

  it('renders correctly with initial state', () => {
    setup();
    expect(screen.getByText(/Drag & drop your .ics file here/i)).toBeInTheDocument();
    expect(screen.getByText(/click to browse/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Upload ICS file/i)).toBeInTheDocument(); // Keep this one for initial render check
  });

  it('displays selected filename after file input change', async () => {
    setup();
    const file = createMockFile('mycalendar.ics', 1024, 'text/calendar');
    const input = screen.getByTestId('file-input');

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(`Selected file: ${file.name}`)).toBeInTheDocument();
    });
    expect(mockOnFileSelect).toHaveBeenCalledWith(file);
  });

  it('calls onFileSelect with null when clear button is clicked', async () => {
    setup();
    const file = createMockFile('mycalendar.ics', 1024, 'text/calendar');
    const input = screen.getByTestId('file-input');

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(`Selected file: ${file.name}`)).toBeInTheDocument();
    });

    const clearButton = screen.getByRole('button', { name: /Clear/i });
    fireEvent.click(clearButton);

    expect(mockOnFileSelect).toHaveBeenCalledWith(null);
    expect(screen.queryByText(`Selected file: ${file.name}`)).not.toBeInTheDocument();
    expect(screen.getByText(/Drag & drop your .ics file here/i)).toBeInTheDocument();
  });

  it('displays an error message for invalid file type', async () => {
    setup();
    const file = createMockFile('document.txt', 1024, 'text/plain');
    const input = screen.getByTestId('file-input');

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/Invalid file type. Only .ics files are allowed./i)).toBeInTheDocument();
    });
    expect(mockOnFileSelect).not.toHaveBeenCalled();
  });

  it('displays an error message for oversized file', async () => {
    setup();
    const largeFile = createMockFile('large.ics', 6 * 1024 * 1024, 'text/calendar'); // 6MB
    const input = screen.getByTestId('file-input');

    fireEvent.change(input, { target: { files: [largeFile] } });

    await waitFor(() => {
      expect(screen.getByText(/File size exceeds the maximum limit of 5MB./i)).toBeInTheDocument();
    });
    expect(mockOnFileSelect).not.toHaveBeenCalled();
  });

  it('displays an error message for invalid ICS format', async () => {
    mockValidateICSFormat.mockResolvedValue('Invalid ICS file format. Missing "BEGIN:VCALENDAR".');
    setup();
    const file = createMockFile('badformat.ics', 1024, 'text/calendar', 'some random text');
    const input = screen.getByTestId('file-input');

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/Invalid ICS file format. Missing "BEGIN:VCALENDAR"./i)).toBeInTheDocument();
    });
    expect(mockOnFileSelect).not.toHaveBeenCalled();
  });

  it('displays processing state when isProcessing prop is true', async () => {
    setup({ isProcessing: true });
    const file = createMockFile('mycalendar.ics', 1024, 'text/calendar');
    const input = screen.getByTestId('file-input');

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(`Selected file: ${file.name}`)).toBeInTheDocument();
      expect(screen.getByText(/Processing.../i)).toBeInTheDocument();
    });
  });

  it('disables clear button when processing', async () => {
    setup({ isProcessing: true });
    const file = createMockFile('mycalendar.ics', 1024, 'text/calendar');
    const input = screen.getByTestId('file-input');

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      const clearButton = screen.getByRole('button', { name: /Clear/i });
      expect(clearButton).toBeDisabled();
    });
  });

  it('displays external error prop', () => {
    const externalError = 'An external error occurred!';
    setup({ error: externalError });
    expect(screen.getByText(externalError)).toBeInTheDocument();
  });

  it('handles drag and drop of a valid file', async () => {
    setup();
    const file = createMockFile('dragged.ics', 2048, 'text/calendar');
    const dropZone = screen.getByRole('button', { name: /Upload ICS file/i });

    fireEvent.dragOver(dropZone);
    expect(dropZone).toHaveClass('dragOver');

    fireEvent.drop(dropZone, { dataTransfer: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(`Selected file: ${file.name}`)).toBeInTheDocument();
    });
    expect(mockOnFileSelect).toHaveBeenCalledWith(file);
    expect(dropZone).not.toHaveClass('dragOver');
  });

  it('handles drag leave event', () => {
    setup();
    const dropZone = screen.getByRole('button', { name: /Upload ICS file/i });

    fireEvent.dragOver(dropZone);
    expect(dropZone).toHaveClass('dragOver');

    fireEvent.dragLeave(dropZone);
    expect(dropZone).not.toHaveClass('dragOver');
  });

  it('does not call onFileSelect if dropped file is invalid', async () => {
    setup();
    const invalidFile = createMockFile('invalid.txt', 100, 'text/plain');
    const dropZone = screen.getByRole('button', { name: /Upload ICS file/i });

    fireEvent.drop(dropZone, { dataTransfer: { files: [invalidFile] } });

    await waitFor(() => {
      expect(screen.getByText(/Invalid file type. Only .ics files are allowed./i)).toBeInTheDocument();
    });
    expect(mockOnFileSelect).not.toHaveBeenCalled();
  });

  it('has correct accessibility attributes', () => {
    setup();
    const input = screen.getByTestId('file-input');
    expect(input).toHaveAttribute('accept', '.ics');
    expect(input).toHaveAttribute('type', 'file');

    const uploadArea = screen.getByRole('button', { name: /Upload ICS file/i });
    expect(uploadArea).toHaveAttribute('tabIndex', '0');
  });

  it('links error message to input via aria-describedby', async () => {
    setup();
    const file = createMockFile('document.txt', 1024, 'text/plain');
    const input = screen.getByTestId('file-input');

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      const errorMessage = screen.getByText(/Invalid file type. Only .ics files are allowed./i);
      expect(errorMessage).toHaveAttribute('id', 'file-upload-error');
      expect(input).toHaveAttribute('aria-describedby', 'file-upload-error');
    });
  });
});