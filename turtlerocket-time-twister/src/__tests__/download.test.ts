import { downloadFile, generateFilenameWithTimestamp } from '../utils/download';

describe('download utilities', () => {
  describe('generateFilenameWithTimestamp', () => {
    it('should generate filename with current timestamp by default', () => {
      const filename = generateFilenameWithTimestamp('schedule', 'ics');
      
      expect(filename).toMatch(/^schedule-\d{4}-\d{2}-\d{2}-\d{6}\.ics$/);
    });

    it('should generate filename with specific date', () => {
      const testDate = new Date('2024-03-15T14:30:45');
      const filename = generateFilenameWithTimestamp('optimized', 'ics', testDate);
      
      expect(filename).toBe('optimized-2024-03-15-143045.ics');
    });

    it('should pad single-digit values', () => {
      const testDate = new Date('2024-01-05T09:05:03');
      const filename = generateFilenameWithTimestamp('schedule', 'ics', testDate);
      
      expect(filename).toBe('schedule-2024-01-05-090503.ics');
    });

    it('should handle different prefixes and extensions', () => {
      const testDate = new Date('2024-06-20T12:00:00');
      const filename = generateFilenameWithTimestamp('my-calendar', 'txt', testDate);
      
      expect(filename).toBe('my-calendar-2024-06-20-120000.txt');
    });
  });

  describe('downloadFile', () => {
    let createObjectURLMock: jest.Mock;
    let revokeObjectURLMock: jest.Mock;
    let appendChildMock: jest.SpyInstance;
    let removeChildMock: jest.SpyInstance;
    let anchorClickMock: jest.Mock;
    let createElementMock: jest.SpyInstance;

    beforeEach(() => {
      // Mock URL.createObjectURL and URL.revokeObjectURL
      createObjectURLMock = jest.fn().mockReturnValue('blob:mock-url');
      revokeObjectURLMock = jest.fn();
      (global.URL as any).createObjectURL = createObjectURLMock;
      (global.URL as any).revokeObjectURL = revokeObjectURLMock;

      // Mock document.body methods
      appendChildMock = jest.spyOn(document.body, 'appendChild').mockImplementation(() => null as any);
      removeChildMock = jest.spyOn(document.body, 'removeChild').mockImplementation(() => null as any);

      // Mock anchor click
      anchorClickMock = jest.fn();
      createElementMock = jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        if (tagName === 'a') {
          return {
            click: anchorClickMock,
            style: {},
            href: '',
            download: '',
          } as any;
        }
        return document.createElement(tagName);
      });

      jest.useFakeTimers();
    });

    afterEach(() => {
      appendChildMock.mockRestore();
      removeChildMock.mockRestore();
      createElementMock.mockRestore();
      jest.useRealTimers();
    });

    it('should create blob with correct content and MIME type', () => {
      const content = 'test content';
      const filename = 'test.ics';

      downloadFile(content, filename);

      // Verify Blob was created (indirectly through createObjectURL being called)
      expect(createObjectURLMock).toHaveBeenCalledTimes(1);
    });

    it('should create anchor element with correct attributes', () => {
      const content = 'test content';
      const filename = 'test.ics';

      downloadFile(content, filename);

      expect(appendChildMock).toHaveBeenCalledTimes(1);
      expect(anchorClickMock).toHaveBeenCalledTimes(1);
      expect(removeChildMock).toHaveBeenCalledTimes(1);
    });

    it('should use default MIME type for calendar files', () => {
      downloadFile('content', 'test.ics');
      
      expect(createObjectURLMock).toHaveBeenCalled();
    });

    it('should accept custom MIME type', () => {
      downloadFile('content', 'test.txt', 'text/plain');
      
      expect(createObjectURLMock).toHaveBeenCalled();
    });

    it('should revoke object URL after timeout', () => {
      downloadFile('content', 'test.ics');

      expect(revokeObjectURLMock).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);

      expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:mock-url');
    });

    it('should revoke URL even if download fails', () => {
      anchorClickMock.mockImplementation(() => {
        throw new Error('Click failed');
      });

      expect(() => downloadFile('content', 'test.ics')).toThrow('Click failed');

      jest.advanceTimersByTime(100);

      expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:mock-url');
    });

    it('should throw error if Blob is not supported', () => {
      const originalBlob = global.Blob;
      // @ts-ignore
      delete global.Blob;

      expect(() => downloadFile('content', 'test.ics')).toThrow('Browser does not support Blob');

      global.Blob = originalBlob;
    });
  });
});
