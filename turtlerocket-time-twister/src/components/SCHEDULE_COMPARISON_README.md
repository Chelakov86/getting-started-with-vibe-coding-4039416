# ScheduleComparison Component

## Overview

The `ScheduleComparison` component provides a side-by-side visual comparison of original and optimized schedules. It highlights moved events, shows time displacement with directional arrows, and displays comprehensive optimization summary statistics.

## Features

### 1. Side-by-Side Comparison
- **Desktop**: Two-column layout showing original schedule on the left, optimized schedule on the right
- **Mobile**: Stacked layout for better readability on small screens
- Each event appears in both columns with its original and optimized times

### 2. Visual Change Indicators

#### Movement Indicators
- **↑ (Green)**: Event moved to an earlier time
- **↓ (Yellow)**: Event moved to a later time
- No indicator: Event time unchanged

#### Text Styling
- **Original Schedule**:
  - Moved events: Strikethrough text on title and time (indicating old values)
  - Unmoved events: Normal text
  
- **Optimized Schedule**:
  - Moved events: Bold text on title and time (emphasizing new values)
  - Unmoved events: Normal text
  - Time difference label showing exact displacement (e.g., "2 hours 30 mins earlier")

### 3. Classification Badges
- Color-coded badges for cognitive load:
  - **Heavy** (Red): High cognitive load tasks
  - **Medium** (Yellow): Medium cognitive load tasks
  - **Light** (Green): Low cognitive load tasks

### 4. Optimization Summary
Displays comprehensive statistics:
- **Total Events**: Number of events in the schedule
- **Events Optimized**: Number of events that were moved
- **Average Displacement**: Average time difference for moved events (in minutes)
- **Moved Earlier**: Count of events moved to earlier times
- **Moved Later**: Count of events moved to later times

## Usage

### Basic Usage

```tsx
import ScheduleComparison from './components/ScheduleComparison';
import { OptimizedEvent } from './types';

function MyComponent() {
  const optimizedEvents: OptimizedEvent[] = [
    {
      uid: 'event1',
      summary: 'Deep Work Session',
      originalStart: new Date('2024-01-15T15:00:00'),
      originalEnd: new Date('2024-01-15T17:00:00'),
      start: new Date('2024-01-15T09:00:00'),
      end: new Date('2024-01-15T11:00:00'),
      classification: 'heavy',
    },
    // ... more events
  ];

  return (
    <ScheduleComparison optimizedEvents={optimizedEvents} />
  );
}
```

### With Energy Levels

```tsx
import { HourlyEnergy, EnergyLevel } from './types/energy';

const energyLevels: HourlyEnergy = {
  8: EnergyLevel.High,
  9: EnergyLevel.High,
  10: EnergyLevel.High,
  // ... more hours
};

<ScheduleComparison 
  optimizedEvents={optimizedEvents}
  energyLevels={energyLevels}
/>
```

### Full Integration Example

```tsx
import { optimizeSchedule } from './utils/optimizer';
import ScheduleComparison from './components/ScheduleComparison';

function App() {
  const [classifiedEvents, setClassifiedEvents] = useState([]);
  const [energyLevels, setEnergyLevels] = useState({});
  
  // After user uploads calendar and sets energy levels
  const result = optimizeSchedule(classifiedEvents, energyLevels);
  
  return (
    <div>
      {result.optimizedEvents.length > 0 && (
        <ScheduleComparison
          optimizedEvents={result.optimizedEvents}
          energyLevels={energyLevels}
        />
      )}
    </div>
  );
}
```

## Props

### `optimizedEvents` (required)
- **Type**: `OptimizedEvent[]`
- **Description**: Array of events with both original and optimized times
- Each event must contain:
  - `uid`: Unique identifier
  - `summary`: Event title
  - `originalStart`: Original start time
  - `originalEnd`: Original end time
  - `start`: Optimized start time
  - `end`: Optimized end time
  - `classification`: Cognitive load ('heavy', 'medium', or 'light')

### `energyLevels` (optional)
- **Type**: `HourlyEnergy`
- **Description**: User's energy levels throughout the day
- Currently not visually displayed but available for future enhancements

## Component Behavior

### Empty State
When no events are provided, displays:
```
No optimized events to display
```

### Change Detection
The component automatically detects:
- Events that haven't moved (same start time)
- Events moved earlier (negative time difference)
- Events moved later (positive time difference)

### Time Difference Calculation
Formats time differences intelligently:
- Less than 60 minutes: "30 mins earlier"
- 1+ hours with no minutes: "2 hours later"
- Hours and minutes: "2 hours 30 mins earlier"

### Responsive Design
- **Desktop (>768px)**: Two-column grid layout
- **Mobile (≤768px)**: Single-column stacked layout
  - Original Schedule section appears first
  - Optimized Schedule section appears second
  - Each event pair is kept together

## Styling

### CSS Modules
The component uses CSS modules (`ScheduleComparison.module.css`) for scoped styling.

### Customization
To customize appearance, modify these CSS classes:
- `.eventCard`: Base event card styling
- `.eventCard.moved`: Styling for moved events
- `.movementIndicator.earlier`: Green up arrow styling
- `.movementIndicator.later`: Yellow down arrow styling
- `.classificationBadge.{heavy|medium|light}`: Badge colors

### Animation
Moved events have a slide-in animation (`slideIn`) that can be disabled by removing the animation property from `.eventCard.moved`.

## Accessibility

### ARIA Labels
- Movement indicators include `aria-label` attributes:
  - "Moved earlier" for up arrows
  - "Moved later" for down arrows

### Semantic HTML
- Proper heading hierarchy (h2, h3)
- Section elements for logical grouping
- Clear labeling of statistics

### Keyboard Navigation
- All interactive elements are keyboard accessible
- Focus indicators for better navigation

## Testing

The component includes comprehensive test coverage:

### Unit Tests
- Empty state handling
- Event display and formatting
- Change detection logic
- Movement indicator display
- Time difference calculations
- Summary statistics accuracy
- Accessibility features

### Integration Tests
- Full optimization flow with real optimizer
- Multi-event scenarios
- Mixed movement states

Run tests:
```bash
npm test -- ScheduleComparison.test.tsx
npm test -- ScheduleComparisonIntegration.test.tsx
```

## Performance Considerations

- Component efficiently recalculates comparisons only when `optimizedEvents` prop changes
- No heavy computations in render cycle
- CSS animations use GPU-accelerated properties (transform, opacity)

## Future Enhancements

Potential improvements:
1. Visual energy level indicators in background
2. Click-to-expand event details
3. Export comparison as PDF/image
4. Toggle between different optimization strategies
5. Highlight mismatches between cognitive load and energy levels
6. Animation on/off toggle for accessibility
7. Dark mode support

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- CSS Grid and Flexbox required

## Related Components

- **ScheduleDisplay**: Shows a single schedule in calendar format
- **EnergySelector**: Allows users to set hourly energy levels
- **FileUpload**: Handles calendar file import

## See Also

- [Optimizer Documentation](../utils/optimizer.ts)
- [Type Definitions](../types/index.ts)
- [Integration Guide](../../README.md)
