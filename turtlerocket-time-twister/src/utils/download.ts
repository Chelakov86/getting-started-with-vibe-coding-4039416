/**
 * Download utility for browser-based file downloads
 * Handles Blob creation, browser compatibility, and download triggering
 */

/**
 * Download a file in the browser by creating a temporary anchor element
 * 
 * This function creates a Blob from the provided content, generates a download URL,
 * creates a temporary anchor element, clicks it to trigger the download, and cleans up.
 * 
 * @param content - The file content as a string
 * @param filename - The desired filename for the download
 * @param mimeType - The MIME type of the file (default: 'text/calendar')
 * @throws Error if browser doesn't support Blob or download attribute
 */
export function downloadFile(
  content: string,
  filename: string,
  mimeType: string = 'text/calendar'
): void {
  // Check browser support
  if (typeof Blob === 'undefined') {
    throw new Error('Browser does not support Blob');
  }

  // Create Blob with proper MIME type
  const blob = new Blob([content], { type: mimeType });

  // Check if we can use the download attribute (modern browsers)
  const supportsDownloadAttribute = 'download' in document.createElement('a');
  
  if (!supportsDownloadAttribute) {
    throw new Error('Browser does not support download attribute');
  }

  // Create object URL from Blob
  const url = URL.createObjectURL(blob);

  try {
    // Create temporary anchor element
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.style.display = 'none';

    // Append to body, click, and remove
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  } finally {
    // Clean up object URL after a short delay to ensure download starts
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);
  }
}

/**
 * Generate a filename with timestamp
 * 
 * Creates a filename in the format: prefix-YYYY-MM-DD-HHMMSS.extension
 * 
 * @param prefix - The prefix for the filename (e.g., 'optimized-schedule')
 * @param extension - The file extension (e.g., 'ics')
 * @param date - Optional date to use (defaults to current date)
 * @returns Formatted filename with timestamp
 */
export function generateFilenameWithTimestamp(
  prefix: string,
  extension: string,
  date: Date = new Date()
): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  return `${prefix}-${year}-${month}-${day}-${hours}${minutes}${seconds}.${extension}`;
}
