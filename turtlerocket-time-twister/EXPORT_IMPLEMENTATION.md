# Export Functionality Implementation

This document describes the export functionality that allows users to download their optimized calendar as an ICS file.

## Components

### ExportButton (`src/components/ExportButton.tsx`)

A React component that provides a prominent call-to-action button for exporting the optimized calendar.

**Features:**
- Downloads optimized calendar as `.ics` file
- Loading state during generation
- Success feedback message
- Error handling with callbacks
- Disabled state when no events are available
- Accessible with proper ARIA labels

**Props:**
- `optimizedEvents: OptimizedEvent[]` - The events to export
- `disabled?: boolean` - Optional flag to disable the button
- `onSuccess?: () => void` - Optional callback on successful export
- `onError?: (error: Error) => void` - Optional callback on export error

**Styling:**
- Gradient purple background (call-to-action style)
- Hover and active states
- Loading spinner animation
- Success message with slide-in animation
- Fully responsive design

## Utilities

### download.ts (`src/utils/download.ts`)

Browser download utilities for triggering file downloads.

**Functions:**

#### `downloadFile(content: string, filename: string, mimeType?: string): void`
Downloads a file in the browser by creating a temporary anchor element with a Blob URL.

- Creates a Blob from the content
- Generates an object URL
- Triggers browser download
- Cleans up the object URL after download
- Handles browser compatibility checks

#### `generateFilenameWithTimestamp(prefix: string, extension: string, date?: Date): string`
Generates a filename with timestamp in the format: `prefix-YYYY-MM-DD-HHMMSS.extension`

Example: `optimized-schedule-2024-03-15-143045.ics`

## Integration

The export functionality integrates with existing utilities:

1. **ICS Builder** (`src/utils/icsBuilder.ts`): Generates valid RFC 5545 compliant ICS files from optimized events
2. **Type System** (`src/types/index.ts`): Uses `OptimizedEvent` type for type-safe event handling

## Usage Example

```tsx
import { ExportButton } from './components/ExportButton';

function App() {
  const [optimizedEvents, setOptimizedEvents] = useState<OptimizedEvent[]>([]);

  const handleExportSuccess = () => {
    console.log('Calendar exported successfully!');
  };

  const handleExportError = (error: Error) => {
    console.error('Export failed:', error);
    alert(`Failed to export: ${error.message}`);
  };

  return (
    <div>
      <ExportButton
        optimizedEvents={optimizedEvents}
        onSuccess={handleExportSuccess}
        onError={handleExportError}
      />
    </div>
  );
}
```

## Testing

### Unit Tests

**`src/__tests__/download.test.ts`** (11 tests)
- Filename generation with timestamps
- Browser download triggering
- Blob creation and MIME types
- Object URL lifecycle management
- Error handling for unsupported browsers

**`src/__tests__/ExportButton.test.tsx`** (21 tests)
- Component rendering states
- Button enabled/disabled logic
- Export flow integration
- Loading states
- Success feedback
- Error handling
- Accessibility features

### Integration Tests

**`src/__tests__/ExportIntegration.test.tsx`** (6 tests)
- End-to-end export flow
- ICS file structure validation
- Special character escaping
- Download triggers in browser
- Resource cleanup
- Complete user experience flow

**Total: 38 tests, all passing**

## Browser Compatibility

The export functionality requires:
- `Blob` API support
- `URL.createObjectURL` / `URL.revokeObjectURL`
- Download attribute support on anchor elements

These are supported in all modern browsers (Chrome, Firefox, Safari, Edge).

## Error Handling

The component handles errors gracefully:
- Browser API not supported
- ICS generation failures
- Download trigger failures
- Invalid event data

All errors are caught and reported through the `onError` callback, allowing parent components to handle them appropriately.

## Accessibility

- Proper ARIA labels on buttons
- Loading and success states announced to screen readers
- Keyboard accessible
- Focus management
- Semantic HTML structure

## Performance Considerations

- Synchronous ICS generation (fast for typical calendar sizes)
- Minimal memory footprint with immediate Blob cleanup
- No external dependencies
- Efficient string building for ICS content
