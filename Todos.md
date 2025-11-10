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
- [ ] Create `src/utils/classifier.ts`
- [ ] Implement `classifyEvent()` function
- [ ] Implement `classifyEvents()` batch function
- [ ] Add `getMatchedKeywords()` for reasoning
- [ ] Support partial word matching (using config)
- [ ] Case-insensitive matching (using config)
- [ ] Write test: Single keyword matching
- [ ] Write test: Multiple keyword scenarios
- [ ] Write test: Precedence rules (heavy > light)
- [ ] Write test: Edge cases (empty titles)
- [ ] Write test: Performance with many events
- [ ] Commit: "Add classification engine"

---

## 📊 Phase 5: Schedule Optimization

### Iteration 5.1: Optimization Algorithm
- [ ] Create `src/utils/timeSlotMapper.ts`:
  - [ ] `createTimeSlotMap()` function
  - [ ] `getAvailableSlots()` function
  - [ ] `isSlotAvailable()` function
  - [ ] Time utility functions
- [ ] Create `src/utils/optimizer.ts`
- [ ] Implement core algorithm:
  - [ ] Sort events by cognitive load
  - [ ] Match heavy events to high energy
  - [ ] Match light events to low energy
  - [ ] Preserve order within groups
- [ ] Write test: Basic optimization
- [ ] Write test: No suitable slots scenario
- [ ] Write test: Duration preservation
- [ ] Commit: "Add optimization algorithm"

### Iteration 5.2: Schedule Generation
- [ ] Generate optimized schedule
- [ ] Track all movements
- [ ] Calculate displacement metrics
- [ ] Maintain event integrity
- [ ] Handle conflicts (simple overlap check)
- [ ] Write test: Schedule generation
- [ ] Write test: Movement tracking
- [ ] Write test: Metrics calculation
- [ ] Commit: "Add schedule generation"

### Iteration 5.3: Optimization Feedback
- [ ] Calculate optimization statistics:
  - [ ] Number of events moved
  - [ ] Average time displacement
  - [ ] Optimization score
- [ ] Add optimization summary
- [ ] Show improvement indicators
- [ ] Write test: Statistics calculation
- [ ] Write test: Summary generation
- [ ] Commit: "Add optimization feedback"

---

## 📅 Phase 6: Schedule Preview

### Iteration 6.1: Schedule Display Component
- [ ] Create `src/components/ScheduleDisplay.tsx`
- [ ] Create `src/components/ScheduleDisplay.module.css`
- [ ] Implement hourly grid (8 AM - 8 PM)
- [ ] Add hour markers
- [ ] Position events by time
- [ ] Show event duration
- [ ] Apply cognitive load colors
- [ ] Write test: Correct positioning
- [ ] Write test: Event rendering
- [ ] Write test: Empty state
- [ ] Commit: "Add schedule display"

### Iteration 6.2: Comparison View
- [ ] Create `src/components/ScheduleComparison.tsx`
- [ ] Show original vs optimized side-by-side
- [ ] Add movement indicators:
  - [ ] Strikethrough for old times
  - [ ] Bold for new times
  - [ ] Arrows for direction (↑↓)
  - [ ] Time difference labels
- [ ] Write test: Change detection
- [ ] Write test: Movement indicators
- [ ] Write test: Responsive layout
- [ ] Commit: "Add comparison view"

---

## 💾 Phase 7: Export Functionality

### Iteration 7.1: ICS Generation
- [ ] Create `src/utils/icsBuilder.ts`
- [ ] Implement `buildICSFile()` function
- [ ] Add proper ICS headers:
  - [ ] BEGIN:VCALENDAR
  - [ ] VERSION:2.0
  - [ ] PRODID
  - [ ] CALSCALE:GREGORIAN
- [ ] Generate VEVENT for each event
- [ ] Update event times
- [ ] Add X-TURTLEROCKET-OPTIMIZED property
- [ ] Write test: Valid ICS format
- [ ] Write test: Event serialization
- [ ] Write test: Special character escaping
- [ ] Commit: "Add ICS generation"

### Iteration 7.2: Download Implementation
- [ ] Create `src/components/ExportButton.tsx`
- [ ] Create `src/utils/download.ts`
- [ ] Implement file download:
  - [ ] Create blob from ICS
  - [ ] Trigger browser download
  - [ ] Generate filename with timestamp
- [ ] Add loading state
- [ ] Add success feedback
- [ ] Write test: Download trigger
- [ ] Write test: Filename generation
- [ ] Write test: Error handling
- [ ] Commit: "Add download functionality"

### Iteration 7.3: Full Integration
- [ ] Wire export to optimization results
- [ ] Add download button to UI
- [ ] Style as call-to-action
- [ ] Disable during processing
- [ ] Add error notifications
- [ ] Write test: Full export flow
- [ ] Write test: Button states
- [ ] Test with real calendar apps
- [ ] Commit: "Complete export integration"

---

## 🎨 Phase 8: Integration & Polish

### Main Integration
- [ ] Wire all components in `App.tsx`
- [ ] Implement complete data flow:
  - [ ] Energy selection → State
  - [ ] File upload → Parse → State
  - [ ] Classification → State
  - [ ] Optimization → State
  - [ ] Preview → Export
- [ ] Add loading states between steps
- [ ] Add error boundaries
- [ ] Write integration tests
- [ ] Commit: "Complete app integration"

### User Experience
- [ ] Add smooth transitions
- [ ] Implement keyboard shortcuts:
  - [ ] Tab navigation
  - [ ] Enter to confirm
  - [ ] Escape to cancel
- [ ] Add help tooltips
- [ ] Include instructions/guide
- [ ] Add sample ICS file
- [ ] Write test: Keyboard navigation
- [ ] Write test: User flow
- [ ] Commit: "Enhance user experience"

### Visual Polish
- [ ] Add app logo/branding
- [ ] Consistent spacing
- [ ] Professional typography
- [ ] Loading animations
- [ ] Success animations
- [ ] Error state styling
- [ ] Mobile responsiveness
- [ ] Write test: Responsive design
- [ ] Write test: Animation performance
- [ ] Commit: "Visual polish"

---

## 🧪 Phase 9: Comprehensive Testing

### Integration Tests
- [ ] Create `src/__tests__/integration.test.tsx`
- [ ] Test complete user flow
- [ ] Test error scenarios
- [ ] Test edge cases
- [ ] Test state consistency
- [ ] Achieve >90% coverage

### Performance Tests
- [ ] Create `src/__tests__/performance.test.ts`
- [ ] Test with 100+ events
- [ ] Measure parsing speed (<1s for 1000 events)
- [ ] Measure optimization speed (<500ms)
- [ ] Check memory usage
- [ ] Profile React renders

### Accessibility Tests
- [ ] Create `src/__tests__/accessibility.test.tsx`
- [ ] Test screen reader compatibility
- [ ] Test keyboard navigation
- [ ] Test color contrast
- [ ] Test focus management
- [ ] Run axe accessibility audit

### Edge Case Tests
- [ ] Create `src/__tests__/edge-cases.test.ts`
- [ ] Empty calendar files
- [ ] Calendars with no events in range
- [ ] All events at same time
- [ ] Maximum energy scenarios
- [ ] Minimum energy scenarios

### Test Utilities
- [ ] Create mock event generators
- [ ] Create ICS file builders
- [ ] Create custom render functions
- [ ] Create test data sets
- [ ] Document test patterns


---

## 📝 Notes

- Commit after each completed iteration
- Run tests frequently
- Keep commits atomic and descriptive
- Update this checklist as needed
- Take breaks - this is a lot of work!

**Remember**: Each checkbox represents a discrete, testable piece of work. Don't move on until tests are green!
