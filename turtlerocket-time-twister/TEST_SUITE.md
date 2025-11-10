# TurtleRocket Time Twister - Testing Suite Documentation

## Overview

This document describes the comprehensive testing suite created for the TurtleRocket Time Twister application. The suite includes integration tests, performance benchmarks, accessibility compliance tests, and edge case validation.

## Test Structure

### Test Files

1. **`src/__tests__/integration.test.tsx`** - Full user workflows
   - Complete optimization workflows (upload → classify → optimize → export)
   - Multi-file upload scenarios
   - Energy pattern variations (morning, evening, flat)
   - Error recovery workflows
   - User interaction patterns
   - Large dataset handling (100+ events)

2. **`src/__tests__/performance.test.ts`** - Optimization speed benchmarks
   - ICS parsing performance (100, 1000, 5000 events)
   - Event classification speed
   - Schedule optimization performance
   - ICS building/export speed
   - End-to-end pipeline benchmarks
   - Memory usage monitoring
   - Algorithmic complexity validation
   - Concurrent operations testing

3. **`src/__tests__/accessibility.test.tsx`** - A11y compliance
   - Semantic HTML structure
   - Keyboard navigation support
   - ARIA labels and roles
   - Screen reader support
   - Focus management
   - Color contrast validation
   - Form accessibility
   - Dynamic content announcements
   - WCAG 2.1 Level AA compliance

4. **`src/__tests__/edge-cases.test.ts`** - Boundary conditions
   - Empty input handling
   - Day boundary events (midnight, cross-midnight)
   - Overlapping events
   - Large datasets (100+, 1000+)
   - Extreme time values (zero duration, weeks-long, epoch, far future)
   - Keyword edge cases (no matches, multiple matches, special characters)
   - Energy level boundaries
   - ICS format variations
   - Optimization edge cases

### Test Utilities (`src/test-utils/`)

1. **`mockEventGenerator.ts`** - Mock event creation utilities
   - `generateMockEvent()` - Create single events
   - `generateMockEvents()` - Create event arrays
   - `generateClassifiedEvent()` - Create classified events
   - `generateOptimizedEvent()` - Create optimized events
   - `generateEventsWithKeywords()` - Create events with specific keywords
   - `generateOverlappingEvents()` - Create overlapping events
   - `generateBoundaryEvents()` - Create boundary condition events
   - `generateLargeEventSet()` - Create large datasets

2. **`icsFileBuilder.ts`** - ICS file creation utilities
   - `ICSFileBuilder` class - Fluent API for building ICS files
   - `createMockICSFile()` - Create File objects from events
   - `createEmptyICSFile()` - Create empty ICS files
   - `createInvalidICSFile()` - Create invalid ICS files
   - `createLargeICSFile()` - Create large ICS files (100+ events)

3. **`customRender.tsx`** - Custom React Testing Library render
   - Enhanced render function with common providers
   - Reusable test setup

4. **`accessibilityHelpers.ts`** - A11y testing utilities
   - `checkAriaLabels()` - Validate ARIA labeling
   - `checkKeyboardNavigation()` - Verify keyboard support
   - `checkFormLabels()` - Validate form accessibility
   - `checkImageAltText()` - Check alt text presence
   - `checkHeadingHierarchy()` - Validate heading structure
   - `checkTabOrder()` - Verify tab navigation order
   - `simulateScreenReader()` - Test screen reader announcements

## Performance Benchmarks

The test suite enforces the following performance requirements:

| Operation | Dataset Size | Target Time |
|-----------|--------------|-------------|
| Parse ICS | 100 events | < 500ms |
| Parse ICS | 1000 events | < 1 second |
| Parse ICS | 5000 events | < 3 seconds |
| Classify Events | 100 events | < 100ms |
| Classify Events | 1000 events | < 500ms |
| Optimize Schedule | 50 events | < 500ms |
| Optimize Schedule | 100 events | < 1 second |
| Optimize Schedule | 200 events | < 2 seconds |
| Build ICS | 100 events | < 200ms |
| Build ICS | 1000 events | < 1 second |
| Full Pipeline | 50 events | < 1 second |
| Full Pipeline | 100 events | < 2 seconds |
| Full Pipeline | 200 events | < 4 seconds |

## Test Scenarios Covered

### Empty and Null Inputs
- ✅ Empty calendar files
- ✅ Empty events arrays
- ✅ Empty energy configurations
- ✅ Events with minimal data

### Boundary Conditions
- ✅ Events at midnight (00:00)
- ✅ Events crossing midnight
- ✅ Events at end of day (23:59)
- ✅ Multi-day spanning events
- ✅ Zero-duration events
- ✅ Very long events (weeks)
- ✅ Unix epoch events (1970)
- ✅ Far future events (2099)

### Overlapping Events
- ✅ Partially overlapping events
- ✅ Completely overlapping events
- ✅ Multiple overlapping chains

### Large Datasets
- ✅ Exactly 100 events
- ✅ 100+ events (101-500)
- ✅ 1000+ events
- ✅ Single event edge case

### Keyword Variations
- ✅ No matching keywords
- ✅ Multiple keyword matches
- ✅ Special characters in titles
- ✅ Case sensitivity handling
- ✅ Very long titles (1000+ chars)

### Energy Patterns
- ✅ All minimum energy (1)
- ✅ All maximum energy (3)
- ✅ Sparse energy configuration
- ✅ Morning energy pattern
- ✅ Evening energy pattern
- ✅ Flat energy pattern

### User Workflows
- ✅ Complete upload → optimize → export flow
- ✅ Multiple file uploads
- ✅ Error recovery
- ✅ Rapid UI interactions
- ✅ State persistence

## Running the Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test Suites
```bash
# Integration tests only
npm test -- integration.test

# Performance tests only
npm test -- performance.test

# Accessibility tests only
npm test -- accessibility.test

# Edge cases only
npm test -- edge-cases.test
```

### Run with Coverage
```bash
npm test -- --coverage
```

### Run in Watch Mode
```bash
npm test -- --watch
```

### Run with Verbose Output
```bash
npm test -- --verbose
```

## Coverage Goals

The testing suite aims to achieve:

- **>90% Overall Code Coverage** ✅
- **>95% Function Coverage** ✅
- **>90% Branch Coverage** ✅
- **>95% Line Coverage** ✅

### Excluded from Coverage
- Test files themselves (`*.test.ts`, `*.test.tsx`)
- Test utilities (`src/test-utils/**`)
- Type definitions (`*.d.ts`)
- Configuration files

## Accessibility Compliance

The test suite validates WCAG 2.1 Level AA compliance:

### Keyboard Navigation
- ✅ All interactive elements accessible via keyboard
- ✅ Logical tab order
- ✅ No keyboard traps
- ✅ Visible focus indicators

### Screen Reader Support
- ✅ Proper ARIA labels on all controls
- ✅ Live regions for dynamic content
- ✅ Semantic HTML structure
- ✅ Meaningful heading hierarchy

### Visual Design
- ✅ Sufficient color contrast
- ✅ Information not conveyed by color alone
- ✅ Text resizable up to 200%
- ✅ Responsive design support

### Forms and Controls
- ✅ All form controls properly labeled
- ✅ Error messages accessible
- ✅ Disabled states indicated
- ✅ Loading states announced

## Continuous Integration

The test suite is designed to run in CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run Tests
  run: npm test -- --coverage --watchAll=false

- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
```

## Test Maintenance

### Adding New Tests

1. **Integration Tests**: Add to `integration.test.tsx` for user workflows
2. **Performance Tests**: Add to `performance.test.ts` for benchmarks
3. **Accessibility Tests**: Add to `accessibility.test.tsx` for a11y features
4. **Edge Cases**: Add to `edge-cases.test.ts` for boundary conditions

### Creating Mock Data

Use the test utilities for consistent mock data:

```typescript
import { generateMockEvents, createMockICSFile } from '../test-utils';

// Generate 50 events
const events = generateMockEvents({ count: 50, spacing: 30 });

// Create ICS file
const file = createMockICSFile(events);
```

### Writing Accessible Tests

Always include accessibility checks:

```typescript
import { checkAriaLabels, checkKeyboardNavigation } from '../test-utils';

it('should be accessible', () => {
  const { container } = render(<Component />);
  
  const violations = checkAriaLabels(container);
  expect(violations.length).toBe(0);
});
```

## Known Limitations

1. **Browser-Specific Features**: Some tests may behave differently in different environments
2. **Timing-Sensitive Tests**: Performance tests may fail on slow machines
3. **File API Mocking**: File upload tests rely on jsdom implementation

## Future Enhancements

- [ ] Visual regression testing
- [ ] E2E tests with Playwright/Cypress
- [ ] Mutation testing
- [ ] Load testing with Artillery
- [ ] Mobile device testing
- [ ] Cross-browser testing
- [ ] Screenshot comparison
- [ ] Network condition simulation

## Contributing

When adding new features, ensure:

1. Tests are written before or alongside implementation (TDD)
2. All test suites pass
3. Code coverage remains above 90%
4. Accessibility tests pass
5. Performance benchmarks are met
6. Edge cases are considered

## Questions?

For questions about the testing suite, please review:
- Jest documentation: https://jestjs.io/
- React Testing Library: https://testing-library.com/react
- WCAG Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
