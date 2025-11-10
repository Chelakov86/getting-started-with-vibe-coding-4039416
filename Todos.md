# TurtleRocket Time Twister - Implementation Checklist

## 🚀 Project Setup

### Initial Setup
- [x] Create new React app with TypeScript: `npx create-react-app turtlerocket-time-twister --template typescript`
- [x] Install required dependencies: `npm install ical.js`
- [x] Install testing utilities if needed: `npm install --save-dev @testing-library/react @testing-library/user-event` (included with Create React App)
- [x] Set up folder structure:
  - [x] Create `src/components/` directory
  - [x] Create `src/utils/` directory
  - [x] Create `src/types/` directory
  - [x] Create `src/config/` directory
  - [x] Create `src/__tests__/` directory


### Git Setup
- [x] Initialize git repository (already initialized)
- [x] Create `.gitignore` if not present (already present)
- [x] Make initial commit
- [x] Set up remote repository (optional)

---

## 📋 Phase 1: Foundation

### Iteration 1.1: Project Initialization
- [x] Create basic `App.tsx` with "TurtleRocket Time Twister" heading
- [x] Set up basic CSS with centered container (max-width: 800px)
- [x] Add subtle box shadow to container
- [x] Write test: App renders heading correctly
- [x] Write test: Container has proper styling
- [x] Ensure all tests pass
- [x] Commit: "feat: Initialize TurtleRocket Time Twister React project"

### Iteration 1.2: Core State Structure
- [x] Create `src/types/index.ts` with TypeScript interfaces:
  - [x] Define `EnergyLevel` type
  - [x] Define `CalendarEvent` interface
  - [x] Define `ClassifiedEvent` interface
  - [x] Define `OptimizedEvent` interface
  - [x] Define `AppState` interface
- [x] Initialize state in `App.tsx`
- [x] Create `src/utils/stateHelpers.ts`
- [x] Write test: Initial state has correct defaults
- [x] Write test: State update functions work correctly
- [x] Write test: State immutability is maintained
- [x] Commit: "Add state management and types"

---

## 🔋 Phase 2: Energy Level Input

### Iteration 2.1: Energy Data Model
- [x] Create `src/types/energy.ts`:
  - [x] Define `EnergyLevel` enum (`Low`, `Medium`, `High`)
  - [ ] Define `TimeSlot` interface (Removed, replaced by `HourlyEnergy` type)
  - [ ] Create `EnergyEmoji` constant object (Moved to `EnergySelector` component)
  - [ ] Create `EnergyColors` constant object (Moved to `EnergySelector.module.css`)
- [x] Create `src/utils/energyHelpers.ts`:
  - [x] `initializeDefaultHourlyEnergy()` function
  - [x] `updateEnergyLevelAtHour()` function
  - [x] `getEnergyLevelForHour()` function
  - [x] `resetToDefaultHourlyEnergy()` function
- [x] Write test: Energy level cycling works
- [x] Write test: Boundary checking (8 AM - 7 PM)
- [x] Write test: Default initialization
- [x] Commit: "Add energy level data model"

### Iteration 2.2: Energy Selector Component
- [x] Create `src/components/EnergySelector.tsx`
- [x] Create `src/components/EnergySelector.module.css` (or styled-components)
- [x] Implement 12 hour blocks (8 AM to 7 PM)
- [x] Add click interaction to cycle energy levels
- [x] Display appropriate emoji and colors
- [x] Add hover effects
- [x] Write test: Renders 12 hour blocks
- [x] Write test: Click cycling works
- [x] Write test: Visual states update
- [x] Write test: Keyboard navigation
- [x] Integrate into `App.tsx`
- [x] Commit: "Add energy selector component"

### Iteration 2.3: Energy Persistence
- [x] Add "Reset to Default" button
- [x] Implement reset functionality
- [x] Add smooth transitions between states
- [x] Write test: Reset button works
- [x] Write test: State persistence between re-renders
- [x] Add visual feedback for interactions
- [x] Commit: "Add energy persistence and reset"

---

## 📁 Phase 3: File Upload & Parsing

### Iteration 3.1: File Upload Component
- [x] Create `src/components/FileUpload.tsx`
- [x] Create `src/components/FileUpload.module.css`
- [x] Style file input to look nice
- [x] Accept only `.ics` files
- [x] Display selected filename
- [x] Add clear/remove file button
- [x] Create `src/utils/validation.ts`:
  - [x] `validateFileType()` function
  - [x] `validateFileSize()` function
  - [x] `checkICSFormat()` function
- [x] Write test: File type validation
- [x] Write test: File size validation (max 5MB)
- [x] Write test: Error display
- [x] Write test: Clear functionality
- [x] Commit: "Add file upload component"

### Iteration 3.2: ICS Parser
- [x] Create `src/utils/icsParser.ts`
- [x] Implement `parseICSFile()` function
- [x] Extract event properties:
  - [x] SUMMARY (title)
  - [x] DTSTART (start time)
  - [x] DTEND (end time)
  - [x] UID (unique identifier)
- [x] Convert to JavaScript Date objects
- [x] Handle timezone conversions
- [x] Write test: Valid ICS parsing
- [x] Write test: Multiple events extraction
- [x] Write test: Timezone handling
- [x] Write test: Error handling for malformed files
- [x] Commit: "Add ICS parser"

---

## 🏷️ Phase 4: Event Classification

### Iteration 4.1: Keyword Configuration
- [x] Create `src/config/keywords.ts`
- [x] Define `HEAVY_KEYWORDS` array (53 keywords):
  - [x] Meetings & Collaboration: meeting, interview, presentation, demo, pitch, negotiation, brainstorm, workshop, retrospective, retro, planning, standup, sync, all-hands, town hall
  - [x] Reviews & Analysis: review, code review, design review, performance review, audit, assessment, evaluation, analysis, deep dive
  - [x] Decision Making & Strategy: strategy, strategic, decision, prioritization, roadmap, architecture, design session
  - [x] Training & Learning: training, onboarding, certification, exam, learning session, tutorial
  - [x] Problem Solving: debugging, troubleshooting, incident, postmortem, research, investigation, implementation
  - [x] Stakeholders: client, customer, stakeholder, executive, board, investor
- [x] Define `LIGHT_KEYWORDS` array (51 keywords):
  - [x] Breaks & Personal: lunch, break, coffee, tea, snack, breakfast, dinner, meal, rest, personal, break time, time off
  - [x] Social: social, happy hour, team building, celebration, birthday, party, casual, chat, watercooler, informal
  - [x] Administrative: admin, administrative, calendar, scheduling, logistics, setup, cleanup, organize
  - [x] Passive: fyi, info, information, announcement, update, status update, reminder, notification
  - [x] Low-Effort Communication: check-in, touch base, quick sync, office hours, availability, optional
  - [x] Wellness: exercise, workout, gym, walk, yoga, meditation, wellness
- [x] Organize keywords by category using `KEYWORD_CATEGORIES`
- [x] Add `KEYWORD_MATCHING_CONFIG` for case-insensitive and partial matching
- [x] Write test: No keyword conflicts (27 comprehensive tests)
- [x] Write test: Comprehensive coverage
- [x] Write test: Case sensitivity handling
- [x] Write test: Keyword quality standards
- [x] Write test: Real-world event title coverage
- [x] Write test: Extensibility
- [x] Commit: "Add keyword-based classification system for cognitive load assessment"

### Iteration 4.2: Type Definitions
- [x] Create `src/types/classification.ts`
- [x] Define `CognitiveLoad` type: 'heavy' | 'medium' | 'light'
- [x] Define `ClassificationResult` interface with matched keywords
- [x] Define `ClassificationOptions` interface for customization
- [x] Define `KeywordMatch` interface
- [x] Update `src/types/index.ts` to use `CognitiveLoad` type
- [x] Re-export classification types
- [x] Commit: (included in 4.1)

### Iteration 4.3: Classification Engine
- [x] Create `src/utils/classifier.ts`
- [x] Implement `classifyEvent()` function
- [x] Implement `classifyEvents()` batch function
- [x] Add `getMatchedKeywords()` for reasoning
- [x] Support partial word matching (using config)
- [x] Case-insensitive matching (using config)
- [x] Write test: Single keyword matching
- [x] Write test: Multiple keyword scenarios
- [x] Write test: Precedence rules (heavy > light)
- [x] Write test: Edge cases (empty titles)
- [x] Write test: Performance with many events
- [x] Commit: "Add classification engine"

---

## 📊 Phase 5: Schedule Optimization

### Iteration 5.1: Optimization Algorithm
- [x] Create `src/utils/timeSlotMapper.ts`:
  - [x] `createTimeSlotMap()` function
  - [x] `getAvailableSlots()` function
  - [x] `isSlotAvailable()` function
  - [x] Time utility functions (calculateDuration, addHoursToDate, getHourFromDate, createDateAtHour, isWithinWorkingHours)
  - [x] Write comprehensive tests (45 tests covering all functions)
  - [x] Support 8 AM - 8 PM time range
  - [x] Handle event duration calculations with partial hours
  - [x] Account for slot availability and conflicts
  - [x] Test boundary conditions and slot conflict detection
- [x] Create `src/utils/optimizer.ts`
- [x] Implement core algorithm:
  - [x] Sort events by cognitive load (heavy → medium → light)
  - [x] Match heavy events to high energy (with fallbacks)
  - [x] Match light events to low energy (with fallbacks)
  - [x] Match medium events to medium energy (with fallbacks)
  - [x] Preserve order within groups
  - [x] Handle slot availability and conflicts
  - [x] Enforce 8 AM - 8 PM time constraints
- [x] Write test: Basic optimization scenarios (3 tests)
- [x] Write test: No suitable slots scenario
- [x] Write test: Duration preservation (2 tests)
- [x] Write test: Time constraints (3 tests)
- [x] Write test: Overlap prevention (2 tests)
- [x] Write test: Order preservation (1 test)
- [x] Write test: Edge cases (4 tests)
- [x] Commit: "Add optimization algorithm"

### Iteration 5.2: Schedule Generation
- [x] Generate optimized schedule
- [x] Track all movements (originalStart, originalEnd)
- [x] Calculate displacement metrics:
  - [x] Total events processed
  - [x] Events optimized (changed)
  - [x] Total displacement in hours
  - [x] Average displacement per optimized event
- [x] Maintain event integrity (duration preservation)
- [x] Handle conflicts (overlap check with occupied slots)
- [x] Write test: Schedule generation (20 comprehensive tests)
- [x] Write test: Movement tracking (4 change tracking tests)
- [x] Write test: Metrics calculation (3 metrics tests)
- [x] Commit: "Add schedule generation and metrics"

### Iteration 5.3: Optimization Feedback
- [x] Calculate optimization statistics:
  - [x] Number of events moved
  - [x] Average time displacement
  - [x] Total displacement
- [x] Return metrics with optimization results
- [x] Write test: Statistics calculation
- [x] All tests passing (20/20 optimizer tests)
- [x] Commit: "Complete schedule optimization with comprehensive metrics"

---

## 📅 Phase 6: Schedule Preview

### Iteration 6.1: Schedule Display Component
- [x] Create `src/components/ScheduleDisplay.tsx`
- [x] Create `src/components/ScheduleDisplay.module.css`
- [x] Implement hourly grid (8 AM - 8 PM)
- [x] Add hour markers
- [x] Position events by time
- [x] Show event duration
- [x] Apply cognitive load colors
- [x] Write test: Correct positioning
- [x] Write test: Event rendering
- [x] Write test: Empty state
- [x] Write test: Overlapping events
- [x] Write test: Energy level display
- [x] Write test: Accessibility features
- [x] Write test: Time formatting
- [x] Write test: Responsive behavior
- [x] All 24 tests passing
- [x] Commit: "Add schedule display component with comprehensive tests"

### Iteration 6.2: Comparison View
- [x] Create `src/components/ScheduleComparison.tsx`
- [x] Create `src/components/ScheduleComparison.module.css`
- [x] Show original vs optimized side-by-side
- [x] Add movement indicators:
  - [x] Strikethrough for old times
  - [x] Bold for new times
  - [x] Arrows for direction (↑ earlier / ↓ later)
  - [x] Time difference labels (e.g., "2 hours 30 mins earlier")
- [x] Add optimization summary statistics:
  - [x] Total events count
  - [x] Events optimized count
  - [x] Average displacement
  - [x] Moved earlier/later counts
- [x] Implement responsive design:
  - [x] Two-column layout on desktop
  - [x] Stacked layout on mobile
- [x] Add visual enhancements:
  - [x] Classification badges
  - [x] Event cards with hover effects
  - [x] Slide-in animations for moved events
- [x] Write test: Empty state handling
- [x] Write test: Event display correctness
- [x] Write test: Change detection logic
- [x] Write test: Movement indicator logic (↑/↓)
- [x] Write test: Time difference calculations
- [x] Write test: Summary statistics accuracy
- [x] Write test: Accessibility features (ARIA labels)
- [x] Write test: Multiple events with mixed states
- [x] Write integration test: Full optimization flow
- [x] All 21 tests passing (303 total project tests)
- [x] Integrate into `App.tsx` with ScheduleDisplay
- [x] Create comprehensive documentation (SCHEDULE_COMPARISON_README.md)
- [x] Commit: "feat: Add schedule comparison component with before/after view and optimization summary"

---

## 💾 Phase 7: Export Functionality

### Iteration 7.1: ICS Generation
- [x] Create `src/utils/icsBuilder.ts`
- [x] Implement `buildICSFile()` function
- [x] Add proper ICS headers:
  - [x] BEGIN:VCALENDAR
  - [x] VERSION:2.0
  - [x] PRODID
  - [x] CALSCALE:GREGORIAN
- [x] Generate VEVENT for each event
- [x] Update event times
- [x] Add X-TURTLEROCKET-OPTIMIZED property
- [x] Write test: Valid ICS format
- [x] Write test: Event serialization
- [x] Write test: Special character escaping
- [x] Write test: Line folding compliance
- [x] Write test: Timezone handling
- [x] Write test: Multiple events
- [x] Write test: Edge cases
- [x] Create comprehensive documentation
- [x] Generate sample validation file
- [x] Commit: "feat: Implement ICS file generation for optimized schedules"

### Iteration 7.2: Download Implementation
- [x] Create `src/components/ExportButton.tsx`
- [x] Create `src/utils/download.ts`
- [x] Implement file download:
  - [x] Create blob from ICS
  - [x] Trigger browser download
  - [x] Generate filename with timestamp
- [x] Add loading state
- [x] Add success feedback
- [x] Write test: Download trigger
- [x] Write test: Filename generation
- [x] Write test: Error handling
- [x] Commit: "Add download functionality"

### Iteration 7.3: Full Integration
- [x] Wire export to optimization results
- [x] Add download button to UI
- [x] Style as call-to-action
- [x] Disable during processing
- [x] Add error notifications
- [x] Write test: Full export flow
- [x] Write test: Button states
- [ ] Test with real calendar apps
- [x] Commit: "Complete export integration"

---

## 🎨 Phase 8: Integration & Polish

### Main Integration
- [x] Wire all components in `App.tsx`
- [x] Implement complete data flow:
  - [x] Energy selection → State
  - [x] File upload → Parse → State
  - [x] Classification → State
  - [x] Optimization → State
  - [x] Preview → Export
- [x] Add loading states between steps
- [x] Add error boundaries
- [x] Write integration tests
- [x] Commit: "Complete app integration"

### User Experience
- [x] Add smooth transitions
- [x] Implement keyboard shortcuts:
  - [x] Tab navigation
  - [x] Ctrl/Cmd+O to optimize
  - [x] Ctrl/Cmd+R to reset energy
- [x] Add help tooltips
- [x] Include instructions/guide
- [x] Add sample ICS file
- [x] Write test: Keyboard navigation
- [x] Write test: User flow
- [x] Commit: "Enhance user experience"

### Visual Polish
- [x] Add app logo/branding
- [x] Consistent spacing
- [x] Professional typography
- [x] Loading animations
- [x] Success animations
- [x] Error state styling
- [x] Mobile responsiveness
- [x] Write test: Responsive design
- [x] Write test: Animation performance
- [x] Commit: "Visual polish"

---

## 🧪 Phase 9: Comprehensive Testing

### Integration Tests
- [x] Create `src/__tests__/integration.test.tsx` (App.integration.test.tsx)
- [x] Test complete user flow
- [x] Test error scenarios
- [x] Test edge cases
- [x] Test state consistency
- [x] Achieve >90% coverage (375+ tests passing)

### Performance Tests
- [x] Test with 100+ events
- [x] Measure parsing speed (<1s for 1000 events)
- [x] Measure optimization speed (<2s for 100+ events)
- [x] Check memory usage
- [x] Profile React renders

### Accessibility Tests
- [x] Test screen reader compatibility (ARIA labels)
- [x] Test keyboard navigation
- [x] Test color contrast (WCAG 2.1 AA)
- [x] Test focus management
- [x] WCAG 2.1 AA compliance verified

### Edge Case Tests
- [x] Empty calendar files
- [x] Invalid ICS files
- [x] Calendars with no events in range
- [x] Multiple file uploads
- [x] State consistency

### Test Utilities
- [x] Mock event generators implemented
- [x] ICS file builders implemented
- [x] Custom render functions (React Testing Library)
- [x] Test data sets created
- [x] Test patterns documented


---

## 📝 Notes

- Commit after each completed iteration
- Run tests frequently
- Keep commits atomic and descriptive
- Update this checklist as needed
- Take breaks - this is a lot of work!

**Remember**: Each checkbox represents a discrete, testable piece of work. Don't move on until tests are green!
