import { OptimizedEvent } from '../types';

/**
 * Format a Date object to ICS timestamp format (YYYYMMDDTHHMMSSZ)
 * Always uses UTC timezone
 */
function formatICSTimestamp(date: Date): string {
  const year = date.getUTCFullYear().toString().padStart(4, '0');
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = date.getUTCDate().toString().padStart(2, '0');
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  const seconds = date.getUTCSeconds().toString().padStart(2, '0');
  
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Escape special characters in text fields according to RFC 5545
 * Escapes: backslash, semicolon, comma, newline
 */
function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')  // Backslash must be escaped first
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');     // Remove carriage returns
}

/**
 * Fold long lines according to RFC 5545
 * Lines should not exceed 75 octets
 * Continuation lines start with a space
 */
function foldLine(line: string): string {
  if (line.length <= 75) {
    return line;
  }
  
  const lines: string[] = [];
  let currentLine = line;
  
  while (currentLine.length > 75) {
    // Take 75 characters for the first line, 74 for continuation lines (due to leading space)
    const splitAt = lines.length === 0 ? 75 : 74;
    lines.push(currentLine.substring(0, splitAt));
    currentLine = currentLine.substring(splitAt);
  }
  
  if (currentLine.length > 0) {
    lines.push(currentLine);
  }
  
  // Join with CRLF and continuation space
  return lines.join('\r\n ');
}

/**
 * Build a VEVENT component for an optimized event
 */
function buildVEvent(event: OptimizedEvent): string {
  const now = new Date();
  const lines: string[] = [
    'BEGIN:VEVENT',
    `UID:${event.uid}`,
    `DTSTAMP:${formatICSTimestamp(now)}`,
    `DTSTART:${formatICSTimestamp(event.start)}`,
    `DTEND:${formatICSTimestamp(event.end)}`,
    `SUMMARY:${escapeICSText(event.summary)}`,
    'X-TURTLEROCKET-OPTIMIZED:true',
    `X-TURTLEROCKET-CLASSIFICATION:${event.classification}`,
    `X-TURTLEROCKET-ORIGINAL-START:${formatICSTimestamp(event.originalStart)}`,
    `X-TURTLEROCKET-ORIGINAL-END:${formatICSTimestamp(event.originalEnd)}`,
    'END:VEVENT',
  ];
  
  return lines.map(foldLine).join('\r\n');
}

/**
 * Build a complete ICS file from optimized events
 * 
 * Generates a valid RFC 5545 compliant iCalendar file with:
 * - Required VCALENDAR headers (VERSION, PRODID, CALSCALE)
 * - VEVENT components for each optimized event
 * - Proper line folding for long lines
 * - UTC timestamps
 * - Custom properties to track optimization metadata
 * 
 * @param events Array of optimized events to serialize
 * @returns Complete ICS file content as a string
 */
export function buildICSFile(events: OptimizedEvent[]): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//TurtleRocket//Time Twister//EN',
    'CALSCALE:GREGORIAN',
  ];
  
  // Add each event
  for (const event of events) {
    lines.push(buildVEvent(event));
  }
  
  lines.push('END:VCALENDAR');
  
  return lines.join('\r\n') + '\r\n';
}
