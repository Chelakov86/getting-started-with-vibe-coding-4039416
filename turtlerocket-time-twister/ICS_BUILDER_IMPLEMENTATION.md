# ICS Builder Implementation

This document describes the ICS file generation functionality for exporting optimized schedules.

## Overview

The `icsBuilder.ts` module provides functionality to generate RFC 5545 compliant iCalendar (.ics) files from optimized calendar events. These files can be imported into popular calendar applications like Google Calendar, Apple Calendar, Outlook, and others.

## Features

### RFC 5545 Compliance

- **Valid iCalendar Format**: Generates properly structured VCALENDAR and VEVENT components
- **Required Properties**: Includes VERSION, PRODID, CALSCALE
- **Line Folding**: Automatically folds lines longer than 75 octets per RFC 5545
- **CRLF Line Endings**: Uses proper `\r\n` line separators
- **UTC Timestamps**: All timestamps are in UTC (Z) format

### Event Serialization

- **UID Preservation**: Maintains original event UIDs
- **Time Updates**: Uses optimized start/end times
- **Metadata Tracking**: Includes custom properties:
  - `X-TURTLEROCKET-OPTIMIZED`: Marks events as optimized
  - `X-TURTLEROCKET-CLASSIFICATION`: Stores cognitive load (heavy/medium/light)
  - `X-TURTLEROCKET-ORIGINAL-START`: Original start time before optimization
  - `X-TURTLEROCKET-ORIGINAL-END`: Original end time before optimization

### Special Character Handling

Properly escapes special characters per RFC 5545:
- Backslashes: `\` → `\\`
- Semicolons: `;` → `\;`
- Commas: `,` → `\,`
- Newlines: `\n` → `\n` (escaped, not literal)

## Usage

```typescript
import { buildICSFile } from './utils/icsBuilder';
import { OptimizedEvent } from './types';

const optimizedEvents: OptimizedEvent[] = [
  {
    uid: 'event-123',
    summary: 'Team Meeting',
    start: new Date('2024-01-15T09:00:00Z'),
    end: new Date('2024-01-15T10:00:00Z'),
    originalStart: new Date('2024-01-15T14:00:00Z'),
    originalEnd: new Date('2024-01-15T15:00:00Z'),
    classification: 'medium'
  }
];

const icsContent = buildICSFile(optimizedEvents);

// Save to file or offer as download
const blob = new Blob([icsContent], { type: 'text/calendar' });
const url = URL.createObjectURL(blob);
```

## API Reference

### `buildICSFile(events: OptimizedEvent[]): string`

Generates a complete ICS file from an array of optimized events.

**Parameters:**
- `events`: Array of `OptimizedEvent` objects to serialize

**Returns:**
- String containing the complete ICS file content

**Example Output:**
```
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//TurtleRocket//Time Twister//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
UID:event-123
DTSTAMP:20241110T144000Z
DTSTART:20240115T090000Z
DTEND:20240115T100000Z
SUMMARY:Team Meeting
X-TURTLEROCKET-OPTIMIZED:true
X-TURTLEROCKET-CLASSIFICATION:medium
X-TURTLEROCKET-ORIGINAL-START:20240115T140000Z
X-TURTLEROCKET-ORIGINAL-END:20240115T150000Z
END:VEVENT
END:VCALENDAR
```

## Testing

The implementation includes comprehensive tests covering:

1. **RFC 5545 Compliance**
   - Valid structure with BEGIN/END markers
   - Required VCALENDAR properties
   - Parseability by ical.js
   - Line folding at 75 octets
   - CRLF line endings

2. **Event Serialization**
   - UID preservation
   - Summary inclusion
   - Optimized timestamps
   - Custom properties
   - DTSTAMP generation

3. **Special Character Escaping**
   - Backslashes, semicolons, commas, newlines
   - Multiple special characters

4. **Multiple Events**
   - Empty arrays
   - Multiple event serialization
   - Event order preservation

5. **Timezone Handling**
   - UTC timezone usage
   - Local time conversion
   - No VTIMEZONE components

6. **Edge Cases**
   - Zero-duration events
   - Year boundary crossings
   - Empty summaries
   - Very long UIDs (>200 characters)

Run tests with:
```bash
npm test -- icsBuilder.test.ts
```

## Google Calendar Import Validation

A sample ICS file has been generated for manual validation:

```bash
# File location
test-output-optimized.ics
```

**Validation Steps:**

1. Open Google Calendar
2. Click the gear icon → Settings
3. Navigate to "Import & Export"
4. Click "Select file from your computer"
5. Choose `test-output-optimized.ics`
6. Click "Import"

**Expected Results:**
- All events should appear at their optimized times
- Event titles should display correctly (including special characters)
- Custom properties are preserved (viewable in event details via calendar API)

## Implementation Details

### Line Folding Algorithm

Lines exceeding 75 octets are split with continuation:
```
UID:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

The algorithm:
1. Takes the first 75 characters
2. Splits remaining content into 74-character chunks (accounting for leading space)
3. Joins with `\r\n ` (CRLF + space)

### Timestamp Formatting

All timestamps use UTC format: `YYYYMMDDTHHmmssZ`

```typescript
function formatICSTimestamp(date: Date): string {
  const year = date.getUTCFullYear().toString().padStart(4, '0');
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = date.getUTCDate().toString().padStart(2, '0');
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  const seconds = date.getUTCSeconds().toString().padStart(2, '0');
  
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}
```

### Text Escaping

RFC 5545 requires specific character escaping:

```typescript
function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')  // Backslash first
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');     // Remove carriage returns
}
```

## Future Enhancements

Potential improvements for future iterations:

1. **Description Field**: Add event descriptions with optimization details
2. **Attendees**: Include attendee information if present in original events
3. **Recurrence**: Handle recurring events
4. **Alarms**: Add reminder notifications
5. **Location**: Include location data
6. **Categories**: Use standard CATEGORIES property alongside custom properties
7. **Status**: Add STATUS property (TENTATIVE/CONFIRMED)
8. **Transparency**: Include TRANSP for free/busy time

## References

- [RFC 5545 - iCalendar Specification](https://tools.ietf.org/html/rfc5545)
- [ical.js Documentation](https://github.com/mozilla-comm/ical.js)
- [Google Calendar Import Documentation](https://support.google.com/calendar/answer/37118)

## License

Part of the TurtleRocket Time Twister project.
