# Manual Testing Guide: Calendar App Compatibility

This guide provides step-by-step instructions for manually testing the exported ICS files with real calendar applications to ensure compatibility and proper display.

## 📋 Pre-Testing Setup

### Requirements
- [ ] TurtleRocket Time Twister app running locally (`npm start`)
- [ ] Sample ICS file for testing (or create one)
- [ ] Access to multiple calendar applications (see list below)
- [ ] Clean test calendar accounts (to avoid cluttering personal calendars)

### Test Calendar Applications

**Desktop Applications:**
- [ ] Google Calendar (Web)
- [ ] Microsoft Outlook (Web/Desktop)
- [ ] Apple Calendar (macOS)
- [ ] Mozilla Thunderbird

**Mobile Applications:**
- [ ] Google Calendar (iOS/Android)
- [ ] Apple Calendar (iOS)
- [ ] Microsoft Outlook (iOS/Android)

**Web Clients:**
- [ ] Outlook.com
- [ ] Calendar.google.com
- [ ] iCloud Calendar (Web)

---

## 🧪 Test Scenarios

### Test Case 1: Basic Export and Import

**Objective:** Verify that a simple optimized calendar exports and imports correctly.

**Steps:**
1. [ ] Open TurtleRocket Time Twister in browser
2. [ ] Set energy levels (vary between Low, Medium, High)
3. [ ] Upload a sample `.ics` file with 3-5 events
4. [ ] Verify events are classified correctly
5. [ ] Click "Export Optimized Calendar" button
6. [ ] Verify download succeeds (check Downloads folder)
7. [ ] Note the filename format: `optimized-schedule-YYYY-MM-DD-HHMMSS.ics`

**Import into Google Calendar:**
1. [ ] Go to https://calendar.google.com
2. [ ] Click Settings (⚙️) → Settings → Import & Export
3. [ ] Click "Select file from your computer"
4. [ ] Choose the downloaded ICS file
5. [ ] Select destination calendar
6. [ ] Click "Import"

**Verify:**
- [ ] All events appear in the calendar
- [ ] Event titles are correct (no garbled text)
- [ ] Times match the optimized schedule (not original times)
- [ ] Event durations are preserved
- [ ] No duplicate events
- [ ] Events are on the correct dates

**Expected Result:** ✅ All events import successfully with correct details

---

### Test Case 2: Special Characters in Event Titles

**Objective:** Ensure special characters are properly escaped and display correctly.

**Test Events:**
Create or use events with these titles:
- "Meeting; with, semicolons & commas"
- "Review: Code\\Path\\Analysis"
- "Q&A Session (Important!)"
- "Project Update - 50% Complete"
- "Team Lunch @ Café"

**Steps:**
1. [ ] Export calendar containing these events
2. [ ] Import into calendar app
3. [ ] Verify each title displays exactly as expected
4. [ ] Check for any corrupted or missing characters

**Verify in Multiple Apps:**
- [ ] Google Calendar
- [ ] Outlook
- [ ] Apple Calendar

**Expected Result:** ✅ All special characters display correctly without escaping artifacts

---

### Test Case 3: Timezone Handling

**Objective:** Verify events maintain correct times across timezones.

**Setup:**
- [ ] Note your local timezone
- [ ] Create events spanning different hours (morning, afternoon, evening)

**Steps:**
1. [ ] Export optimized calendar
2. [ ] Import into calendar app
3. [ ] Verify event times are in UTC or properly converted

**Test Cases:**
- [ ] 9:00 AM event displays at 9:00 AM
- [ ] 2:00 PM event displays at 2:00 PM
- [ ] 6:00 PM event displays at 6:00 PM
- [ ] Multi-day events span correctly
- [ ] No timezone offset errors

**Expected Result:** ✅ All events display at correct local times

---

### Test Case 4: Optimization Metadata

**Objective:** Verify custom properties are handled gracefully.

**Custom Properties in ICS:**
- `X-TURTLEROCKET-OPTIMIZED:true`
- `X-TURTLEROCKET-CLASSIFICATION:heavy/medium/light`
- `X-TURTLEROCKET-ORIGINAL-START`
- `X-TURTLEROCKET-ORIGINAL-END`

**Steps:**
1. [ ] Export optimized calendar
2. [ ] Import into calendar app
3. [ ] Open individual events and check properties/details

**Verify:**
- [ ] Events import without errors
- [ ] Custom properties don't cause import failures
- [ ] Custom properties are either stored or safely ignored
- [ ] Event descriptions are intact

**Expected Result:** ✅ Custom properties don't interfere with import

---

### Test Case 5: Large Calendar Export

**Objective:** Test with realistic calendar sizes.

**Test Sizes:**
- [ ] 10 events (minimal)
- [ ] 50 events (typical week)
- [ ] 100+ events (busy month)

**Steps for Each Size:**
1. [ ] Upload ICS file with specified number of events
2. [ ] Optimize and export
3. [ ] Note file size
4. [ ] Import into calendar app
5. [ ] Verify all events imported

**Performance Checks:**
- [ ] Export completes in < 3 seconds
- [ ] File size is reasonable (< 1MB for 100 events)
- [ ] Import doesn't timeout
- [ ] Calendar app remains responsive

**Expected Result:** ✅ Handles large calendars without issues

---

### Test Case 6: Event Details Preservation

**Objective:** Ensure all event properties are preserved.

**Test Events with:**
- [ ] Event titles/summaries
- [ ] Start times
- [ ] End times
- [ ] Event durations
- [ ] UIDs (unique identifiers)

**Steps:**
1. [ ] Create reference calendar with known event details
2. [ ] Export original ICS and note details
3. [ ] Optimize and export
4. [ ] Import optimized calendar
5. [ ] Compare side-by-side

**Verify:**
- [ ] Titles unchanged
- [ ] Durations preserved (if 1hr meeting, still 1hr)
- [ ] No events lost
- [ ] No events duplicated
- [ ] UIDs present and unique

**Expected Result:** ✅ All event details preserved correctly

---

### Test Case 7: Multiple Import Cycles

**Objective:** Test importing the same file multiple times.

**Steps:**
1. [ ] Export optimized calendar
2. [ ] Import into calendar app (first time)
3. [ ] Import same file again (second time)
4. [ ] Import same file again (third time)

**Verify:**
- [ ] First import succeeds
- [ ] Subsequent imports are handled appropriately:
  - Either: Events are updated (not duplicated)
  - Or: Calendar app warns about duplicates
  - Or: Events are skipped based on UID

**Expected Result:** ✅ No unintended duplicate events created

---

### Test Case 8: Mobile Device Testing

**Objective:** Verify mobile calendar apps work correctly.

**Test on Mobile:**
1. [ ] Email ICS file to yourself
2. [ ] Open on mobile device
3. [ ] Tap ICS file attachment
4. [ ] Choose calendar app to import

**Or:**
1. [ ] Download file on mobile browser
2. [ ] Open downloaded ICS file
3. [ ] Select calendar app

**Verify on Mobile:**
- [ ] Import process is smooth
- [ ] Events display correctly
- [ ] Times are correct
- [ ] Notifications work (if enabled)
- [ ] Events sync across devices

**Test Devices:**
- [ ] iOS (iPhone/iPad)
- [ ] Android phone
- [ ] Android tablet

**Expected Result:** ✅ Mobile import works seamlessly

---

### Test Case 9: Cross-Platform Sync

**Objective:** Test calendar sync across platforms.

**Steps:**
1. [ ] Import ICS file into Google Calendar (web)
2. [ ] Wait for sync
3. [ ] Check Google Calendar on Android app
4. [ ] Check Google Calendar on iOS app
5. [ ] Verify events match on all platforms

**Verify:**
- [ ] Events sync within reasonable time (< 5 minutes)
- [ ] All events appear on all platforms
- [ ] Event details are consistent
- [ ] Times are correct on each platform

**Expected Result:** ✅ Events sync correctly across all platforms

---

### Test Case 10: Edge Cases and Error Handling

**Objective:** Test unusual scenarios.

**Test Cases:**

**Empty Calendar:**
- [ ] Export calendar with 0 events
- [ ] Verify button is disabled or shows appropriate message

**All Events Same Time:**
- [ ] Export calendar where all events moved to same time slot
- [ ] Import and verify all events exist (may overlap)

**Events Spanning Multiple Days:**
- [ ] Test with all-day events
- [ ] Test with multi-day events
- [ ] Verify they display correctly

**Special Event Types:**
- [ ] Recurring events (if applicable)
- [ ] All-day events
- [ ] Multi-day events
- [ ] Events with locations
- [ ] Events with attendees

**Expected Result:** ✅ Edge cases handled gracefully

---

## 📝 Testing Checklist Summary

### Quick Reference

**Must Test:**
- [x] Google Calendar (most common)
- [x] Microsoft Outlook (corporate standard)
- [x] Apple Calendar (iOS users)
- [x] Special characters display correctly
- [x] Timezone handling
- [x] Large calendars (50+ events)

**Should Test:**
- [ ] Mobile devices (iOS and Android)
- [ ] Cross-platform sync
- [ ] Multiple import cycles
- [ ] Custom metadata handling

**Nice to Have:**
- [ ] Thunderbird compatibility
- [ ] Alternative calendar apps
- [ ] Accessibility features in calendar apps

---

## 🐛 Bug Report Template

If you find issues, document them using this template:

```markdown
## Bug Report

**Calendar App:** [e.g., Google Calendar]
**Platform:** [e.g., Web, macOS, iOS 17]
**Date:** [YYYY-MM-DD]

**Issue Description:**
[Clear description of the problem]

**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happened]

**Screenshots:**
[Attach screenshots if applicable]

**ICS File:**
[Attach or link to the problematic ICS file]

**Additional Context:**
[Any other relevant information]
```

---

## ✅ Sign-Off Checklist

Before marking "Test with real calendar apps" as complete:

- [ ] Tested with at least 3 different calendar applications
- [ ] Verified on both desktop and mobile
- [ ] Tested with various event types and scenarios
- [ ] No critical bugs found (or bugs documented and fixed)
- [ ] Special characters display correctly
- [ ] Timezones handled properly
- [ ] Large calendars work
- [ ] Documented any known limitations

**Tested By:** ___________________  
**Date:** ___________________  
**Apps Tested:** ___________________  

---

## 📚 Resources

### Sample ICS Files for Testing

Create these test files:

**simple-test.ics** - 5 events, basic titles
**special-chars.ics** - Events with special characters
**large-calendar.ics** - 100+ events
**edge-cases.ics** - All-day, multi-day, overlapping events

### Useful Tools

- **ICS Validator:** https://icalendar.org/validator.html
- **ICS Viewer:** Online ICS file viewers for inspection
- **Timezone Converter:** https://www.timeanddate.com/worldclock/converter.html

### Calendar App Documentation

- [Google Calendar Import Guide](https://support.google.com/calendar/answer/37118)
- [Outlook Import Guide](https://support.microsoft.com/en-us/office/import-calendars-into-outlook-8e8364e1-400e-4c0f-a573-fe76b5a2d379)
- [Apple Calendar Guide](https://support.apple.com/guide/calendar/import-or-export-calendars-icl1023/mac)

---

## 🎯 Success Criteria

The export functionality is considered production-ready when:

✅ **All Critical Tests Pass:**
- Events import successfully in top 3 calendar apps
- No data loss or corruption
- Times display correctly
- Special characters handled properly

✅ **No Critical Bugs:**
- No crashes or errors during import
- No events disappear or duplicate incorrectly
- No timezone issues

✅ **Good User Experience:**
- Import process is straightforward
- Events display as expected
- No confusing errors or warnings

✅ **Documentation Updated:**
- Known limitations documented
- Compatible calendar apps listed
- Troubleshooting guide available

---

**Last Updated:** 2025-11-10  
**Version:** 1.0  
**Status:** Ready for Testing
