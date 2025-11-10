// src/__tests__/validation.test.ts

import { validateFileType, validateFileSize, validateICSFormat } from '../utils/validation';

describe('Validation Utilities', () => {
  describe('validateFileType', () => {
    it('should return null for a valid file type', () => {
      const file = new File(['content'], 'test.ics', { type: 'text/calendar' });
      expect(validateFileType(file, ['.ics'])).toBeNull();
    });

    it('should return an error message for an invalid file type', () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      expect(validateFileType(file, ['.ics'])).toBe('Invalid file type. Only .ics files are allowed.');
    });

    it('should handle multiple allowed file types', () => {
      const file = new File(['content'], 'test.ics', { type: 'text/calendar' });
      expect(validateFileType(file, ['.ics', '.txt'])).toBeNull();
    });

    it('should return an error message if file has no extension', () => {
      const file = new File(['content'], 'testfile', { type: 'text/calendar' });
      expect(validateFileType(file, ['.ics'])).toBe('Invalid file type. Only .ics files are allowed.');
    });
  });

  describe('validateFileSize', () => {
    it('should return null for a valid file size', () => {
      const file = new File(['content'], 'test.ics', { type: 'text/calendar' }); // ~7 bytes
      expect(validateFileSize(file, 5)).toBeNull(); // 5MB limit
    });

    it('should return an error message for an oversized file', () => {
      const largeContent = 'a'.repeat(5 * 1024 * 1024 + 1); // 5MB + 1 byte
      const file = new File([largeContent], 'large.ics', { type: 'text/calendar' });
      expect(validateFileSize(file, 5)).toBe('File size exceeds the maximum limit of 5MB.');
    });

    it('should return null for a file exactly at the size limit', () => {
      const contentAtLimit = 'a'.repeat(5 * 1024 * 1024); // Exactly 5MB
      const file = new File([contentAtLimit], 'limit.ics', { type: 'text/calendar' });
      expect(validateFileSize(file, 5)).toBeNull();
    });
  });

  describe('validateICSFormat', () => {
    it('should return null for a valid ICS format', async () => {
      const file = new File(['BEGIN:VCALENDAR\nEND:VCALENDAR'], 'valid.ics', { type: 'text/calendar' });
      await expect(validateICSFormat(file)).resolves.toBeNull();
    });

    it('should return an error message for an invalid ICS format (missing BEGIN:VCALENDAR)', async () => {
      const file = new File(['some random content'], 'invalid.ics', { type: 'text/calendar' });
      await expect(validateICSFormat(file)).resolves.toBe('Invalid ICS file format. Missing "BEGIN:VCALENDAR".');
    });

    it('should return an error message if file content cannot be read', async () => {
      const file = new File([], 'empty.ics', { type: 'text/calendar' });
      // Mock FileReader to simulate an error
      jest.spyOn(FileReader.prototype, 'readAsText').mockImplementationOnce(function(this: FileReader) {
        this.onerror?.(new ProgressEvent('error'));
      });
      await expect(validateICSFormat(file)).resolves.toBe('Could not read file content.');
    });
  });
});
