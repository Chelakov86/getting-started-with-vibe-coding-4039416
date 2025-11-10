# Test Utilities Quick Reference

## Mock Event Generator

### Basic Event Generation

```typescript
import { generateMockEvent, generateMockEvents } from '../test-utils';

// Single event
const event = generateMockEvent(0, {
  startDate: new Date('2024-01-01T09:00:00'),
  durationMinutes: 60,
  summaryPrefix: 'Meeting'
});

// Multiple events
const events = generateMockEvents({
  count: 10,
  spacing: 30, // 30 minutes between events
  summaryPrefix: 'Event'
});
```

### Classified Events

```typescript
import { generateClassifiedEvent, generateClassifiedEvents } from '../test-utils';

// Single classified event
const event = generateClassifiedEvent(0, {
  classification: 'heavy',
  summaryPrefix: 'Deep Work'
});

// Multiple classified events
const events = generateClassifiedEvents({
  count: 20,
  classification: 'medium'
});
```

### Optimized Events

```typescript
import { generateOptimizedEvent, generateOptimizedEvents } from '../test-utils';

// Events with time shifts
const events = generateOptimizedEvents({
  count: 15,
  timeShiftMinutes: 60, // Shifted by 1 hour
  classification: 'light'
});
```

### Special Event Types

```typescript
import {
  generateEventsWithKeywords,
  generateOverlappingEvents,
  generateBoundaryEvents,
  generateLargeEventSet
} from '../test-utils';

// Events with specific keywords
const keywordEvents = generateEventsWithKeywords({
  heavy: ['Strategy', 'Analysis', 'Planning'],
  medium: ['Meeting', 'Review'],
  light: ['Break', 'Email', 'Chat']
});

// Overlapping events (30 min spacing, 1 hour duration)
const overlapping = generateOverlappingEvents(5);

// Boundary events (midnight, end of day, cross-midnight)
const boundary = generateBoundaryEvents();

// Large dataset
const largeSet = generateLargeEventSet(1000);
```

## ICS File Builder

### Basic ICS File Creation

```typescript
import { ICSFileBuilder, createMockICSFile } from '../test-utils';

// Using helper
const events = generateMockEvents({ count: 10 });
const file = createMockICSFile(events, 'my-calendar.ics');

// Using builder
const builder = new ICSFileBuilder({
  calendarName: 'Test Calendar',
  timezone: 'America/New_York'
});

const file = builder
  .addEvent(event1)
  .addEvent(event2)
  .addEvents([event3, event4])
  .buildAsFile();

// Get ICS string instead of File
const icsString = builder.build();
```

### Special ICS Files

```typescript
import {
  createEmptyICSFile,
  createInvalidICSFile,
  createLargeICSFile
} from '../test-utils';

// Empty calendar
const empty = createEmptyICSFile();

// Invalid ICS (for error testing)
const invalid = createInvalidICSFile();

// Large calendar
const large = createLargeICSFile(500); // 500 events
```

## Custom Render

```typescript
import { render, screen } from '../test-utils';

// Standard render with utilities
const { container, rerender, unmount } = render(<MyComponent />);

// With custom options
const { container } = render(<MyComponent />, {
  container: document.body
});
```

## Accessibility Helpers

### ARIA and Labels

```typescript
import { checkAriaLabels, checkFormLabels } from '../test-utils';

const { container } = render(<MyComponent />);

// Check ARIA labels
const ariaViolations = checkAriaLabels(container);
expect(ariaViolations.length).toBe(0);

// Check form labels
const formViolations = checkFormLabels(container);
expect(formViolations).toEqual([]);
```

### Keyboard Navigation

```typescript
import { checkKeyboardNavigation, checkTabOrder } from '../test-utils';

// Check if keyboard navigation is possible
const canNavigate = await checkKeyboardNavigation(container);
expect(canNavigate).toBe(true);

// Check tab order
const tabIndexes = checkTabOrder(container);
expect(tabIndexes).not.toContain(-1); // No negative tab indexes
```

### Heading and Structure

```typescript
import { checkHeadingHierarchy, checkLandmarks } from '../test-utils';

// Check heading hierarchy (h1, h2, h3, etc.)
const headingViolations = checkHeadingHierarchy(container);
expect(headingViolations.length).toBe(0);

// Check landmark regions (main, nav, etc.)
const landmarkViolations = checkLandmarks(container);
expect(landmarkViolations).toEqual([]);
```

### Images

```typescript
import { checkImageAltText } from '../test-utils';

// Check all images have alt text
const imageViolations = checkImageAltText(container);
expect(imageViolations.length).toBe(0);
```

### Screen Reader Simulation

```typescript
import { simulateScreenReader } from '../test-utils';

// Get aria-live announcements
const announcements = simulateScreenReader(container);
expect(announcements).toContain('Schedule optimized');
```

## Common Test Patterns

### Testing File Upload

```typescript
import userEvent from '@testing-library/user-event';
import { render, screen } from '../test-utils';
import { createMockICSFile, generateMockEvents } from '../test-utils';

it('should handle file upload', async () => {
  render(<App />);
  
  const events = generateMockEvents({ count: 5 });
  const file = createMockICSFile(events);
  const fileInput = screen.getByLabelText(/upload/i) as HTMLInputElement;
  
  userEvent.upload(fileInput, file);
  
  await waitFor(() => {
    expect(screen.getByText(/schedule/i)).toBeInTheDocument();
  });
});
```

### Testing Energy Selection

```typescript
it('should update energy levels', async () => {
  render(<App />);
  
  const selectors = screen.getAllByRole('combobox');
  await userEvent.selectOptions(selectors[9], '3'); // 9 AM = High
  await userEvent.selectOptions(selectors[14], '1'); // 2 PM = Low
  
  expect((selectors[9] as HTMLSelectElement).value).toBe('3');
  expect((selectors[14] as HTMLSelectElement).value).toBe('1');
});
```

### Testing Performance

```typescript
it('should process events quickly', () => {
  const events = generateMockEvents({ count: 100 });
  const classified = classifyEvents(events);
  
  const startTime = performance.now();
  const optimized = optimizeSchedule(classified, energy);
  const endTime = performance.now();
  
  expect(endTime - startTime).toBeLessThan(1000); // < 1 second
});
```

### Testing Accessibility

```typescript
it('should be accessible', () => {
  const { container } = render(<MyComponent />);
  
  // Check multiple a11y aspects
  expect(checkAriaLabels(container).length).toBe(0);
  expect(checkFormLabels(container).length).toBe(0);
  expect(checkHeadingHierarchy(container).length).toBe(0);
  expect(checkImageAltText(container).length).toBe(0);
});
```

### Testing Edge Cases

```typescript
it('should handle empty input', () => {
  const empty = parseICS('');
  expect(empty).toEqual([]);
});

it('should handle boundary events', () => {
  const events = generateBoundaryEvents();
  const classified = classifyEvents(events);
  
  expect(classified.length).toBe(3);
  expect(classified[0].start.getHours()).toBe(0); // Midnight
});

it('should handle large datasets', () => {
  const events = generateLargeEventSet(1000);
  const classified = classifyEvents(events);
  
  expect(classified.length).toBe(1000);
});
```

## Energy Helper

```typescript
import { HourlyEnergy } from '../types/energy';

// Create test energy configuration
const createMorningEnergy = (): HourlyEnergy => {
  const energy: HourlyEnergy = {};
  for (let i = 0; i < 24; i++) {
    energy[i] = i >= 6 && i <= 12 ? 3 : i >= 13 && i <= 17 ? 2 : 1;
  }
  return energy;
};

// Use in tests
const energy = createMorningEnergy();
const optimized = optimizeSchedule(events, energy);
```

## Tips and Best Practices

### 1. Use Descriptive Test Names
```typescript
// ✅ Good
it('should optimize heavy tasks to high energy morning hours', () => {});

// ❌ Bad
it('should work', () => {});
```

### 2. Arrange-Act-Assert Pattern
```typescript
it('should classify events correctly', () => {
  // Arrange
  const events = generateMockEvents({ count: 5 });
  
  // Act
  const classified = classifyEvents(events);
  
  // Assert
  expect(classified.length).toBe(5);
  expect(classified[0].classification).toBeDefined();
});
```

### 3. Use waitFor for Async Operations
```typescript
await waitFor(() => {
  expect(screen.getByText(/optimized/i)).toBeInTheDocument();
}, { timeout: 3000 });
```

### 4. Clean Up After Tests
```typescript
afterEach(() => {
  jest.clearAllMocks();
  cleanup();
});
```

### 5. Test One Thing at a Time
```typescript
// ✅ Good - focused test
it('should parse ICS files', () => {
  const parsed = parseICS(validICS);
  expect(parsed.length).toBe(5);
});

// ❌ Bad - testing too much
it('should parse, classify, optimize, and export', () => {
  // Too many responsibilities
});
```

## Debugging Tests

### View rendered output
```typescript
const { debug } = render(<MyComponent />);
debug(); // Prints DOM to console
```

### Query debugging
```typescript
screen.debug(); // Prints current screen state
screen.logTestingPlaygroundURL(); // Get Testing Playground URL
```

### Check what queries are available
```typescript
screen.getByRole('button'); // Throws if not found
screen.queryByRole('button'); // Returns null if not found
screen.findByRole('button'); // Returns promise, waits
```
