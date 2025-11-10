# Cognitive Load Classification System

This directory contains the keyword-based classification system for assessing the cognitive load of calendar events.

## Overview

The classification system categorizes calendar events into three cognitive load levels:
- **Heavy**: Events requiring significant mental effort (meetings, reviews, presentations)
- **Medium**: Events with moderate effort (default for unclassified events)
- **Light**: Low-effort activities (breaks, social events, routine admin)

## Files

### `keywords.ts`
Configuration file containing:
- `HEAVY_KEYWORDS`: Array of keywords for high-cognitive-load events
- `LIGHT_KEYWORDS`: Array of keywords for low-cognitive-load events
- `KEYWORD_CATEGORIES`: Organized groupings of keywords by type
- `KEYWORD_MATCHING_CONFIG`: Configuration for matching behavior

### Classification Strategy

1. **Priority-based matching**: HEAVY keywords are checked first, then LIGHT keywords
2. **Case-insensitive**: "Meeting", "MEETING", and "meeting" all match
3. **Partial matching**: "meeting" matches "meetings", "Team Meeting", etc.
4. **Fallback to medium**: Events with no keyword matches default to medium cognitive load

## Keyword Organization

Keywords are organized into categories for maintainability:

### Heavy Categories
- **Meetings & Collaboration**: High-intensity meetings and sessions
- **Reviews & Analysis**: Code reviews, design reviews, assessments
- **Strategy**: Strategic planning, decision-making sessions
- **Problem Solving**: Debugging, troubleshooting, incident response
- **Stakeholders**: Client, customer, executive interactions

### Light Categories
- **Breaks**: Lunch, coffee, personal time
- **Social**: Team building, celebrations, informal gatherings
- **Administrative**: Routine admin tasks, scheduling
- **Passive**: FYI items, announcements, updates
- **Wellness**: Exercise, meditation, wellness activities

## Usage Example

```typescript
import { HEAVY_KEYWORDS, LIGHT_KEYWORDS, KEYWORD_MATCHING_CONFIG } from './config/keywords';

// Check if event title contains heavy keywords
const eventTitle = "Team Meeting - Sprint Planning";
const titleLower = eventTitle.toLowerCase();

const isHeavy = HEAVY_KEYWORDS.some(keyword => titleLower.includes(keyword));
// Result: true (matches "meeting" and "planning")
```

## Customization

To add new keywords:

1. **Add to keyword arrays**: Update `HEAVY_KEYWORDS` or `LIGHT_KEYWORDS`
2. **Update categories**: Add to appropriate category in `KEYWORD_CATEGORIES`
3. **Run tests**: Ensure no conflicts with `npm test -- keywords.test.ts`

### Best Practices

- Use root/singular forms (e.g., "meeting" not "meetings")
- Keep keywords lowercase
- Avoid overlaps between HEAVY and LIGHT
- Focus on distinctive terms, not generic words
- Test with real event titles

## Testing

Comprehensive tests in `src/__tests__/keywords.test.ts` verify:
- Keyword list completeness (minimum counts)
- No conflicts between HEAVY and LIGHT keywords
- No duplicates within each list
- Case sensitivity handling (all lowercase)
- Real-world event title coverage
- Extensibility for custom keywords

Run tests:
```bash
npm test -- keywords.test.ts
```

## Future Enhancements

Potential improvements for future iterations:
- User-customizable keyword lists
- Confidence scores based on number of matches
- Context-aware classification (time of day, duration)
- Machine learning-based classification
- Domain-specific keyword sets (engineering, sales, etc.)
