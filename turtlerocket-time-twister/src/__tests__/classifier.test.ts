import { classifyEvent, classifyEvents, getMatchedKeywords, ClassifiedEvent } from '../utils/classifier';
import { ParsedEvent } from '../utils/icsParser';

describe('Event Classification Algorithm', () => {
  // Helper function to create test events
  const createTestEvent = (title: string, id: string = 'test-id'): ParsedEvent => ({
    id,
    title,
    startTime: new Date('2025-01-15T10:00:00'),
    endTime: new Date('2025-01-15T11:00:00'),
    originalStartTime: new Date('2025-01-15T10:00:00'),
  });

  describe('classifyEvent - Single Event Classification', () => {
    describe('Heavy Load Classification', () => {
      test('should classify meeting as heavy', () => {
        const event = createTestEvent('Team Meeting');
        const result = classifyEvent(event);
        expect(result.cognitiveLoad).toBe('heavy');
      });

      test('should classify interview as heavy', () => {
        const event = createTestEvent('Interview with candidate');
        const result = classifyEvent(event);
        expect(result.cognitiveLoad).toBe('heavy');
      });

      test('should classify presentation as heavy', () => {
        const event = createTestEvent('Quarterly Presentation to Board');
        const result = classifyEvent(event);
        expect(result.cognitiveLoad).toBe('heavy');
      });

      test('should classify code review as heavy', () => {
        const event = createTestEvent('Code Review Session');
        const result = classifyEvent(event);
        expect(result.cognitiveLoad).toBe('heavy');
      });

      test('should classify brainstorming as heavy', () => {
        const event = createTestEvent('Brainstorm new features');
        const result = classifyEvent(event);
        expect(result.cognitiveLoad).toBe('heavy');
      });

      test('should classify strategy session as heavy', () => {
        const event = createTestEvent('Strategic Planning Session');
        const result = classifyEvent(event);
        expect(result.cognitiveLoad).toBe('heavy');
      });

      test('should classify client meeting as heavy', () => {
        const event = createTestEvent('Client Demo');
        const result = classifyEvent(event);
        expect(result.cognitiveLoad).toBe('heavy');
      });
    });

    describe('Light Load Classification', () => {
      test('should classify lunch as light', () => {
        const event = createTestEvent('Lunch Break');
        const result = classifyEvent(event);
        expect(result.cognitiveLoad).toBe('light');
      });

      test('should classify coffee break as light', () => {
        const event = createTestEvent('Coffee with team');
        const result = classifyEvent(event);
        expect(result.cognitiveLoad).toBe('light');
      });

      test('should classify social event as light', () => {
        const event = createTestEvent('Social Hour');
        const result = classifyEvent(event);
        expect(result.cognitiveLoad).toBe('light');
      });

      test('should classify team building as light', () => {
        const event = createTestEvent('Team Building Activity');
        const result = classifyEvent(event);
        expect(result.cognitiveLoad).toBe('light');
      });

      test('should classify personal time as light', () => {
        const event = createTestEvent('Personal Time');
        const result = classifyEvent(event);
        expect(result.cognitiveLoad).toBe('light');
      });

      test('should classify admin tasks as light', () => {
        const event = createTestEvent('Admin work');
        const result = classifyEvent(event);
        expect(result.cognitiveLoad).toBe('light');
      });

      test('should classify workout as light', () => {
        const event = createTestEvent('Gym workout');
        const result = classifyEvent(event);
        expect(result.cognitiveLoad).toBe('light');
      });
    });

    describe('Medium Load Classification (Default)', () => {
      test('should classify unmatched events as medium', () => {
        const event = createTestEvent('Task work');
        const result = classifyEvent(event);
        expect(result.cognitiveLoad).toBe('medium');
      });

      test('should classify generic event as medium', () => {
        const event = createTestEvent('Working on project');
        const result = classifyEvent(event);
        expect(result.cognitiveLoad).toBe('medium');
      });

      test('should classify coding session as medium', () => {
        const event = createTestEvent('Coding time');
        const result = classifyEvent(event);
        expect(result.cognitiveLoad).toBe('medium');
      });
    });

    describe('Case Insensitive Matching', () => {
      test('should match uppercase MEETING', () => {
        const event = createTestEvent('TEAM MEETING');
        const result = classifyEvent(event);
        expect(result.cognitiveLoad).toBe('heavy');
      });

      test('should match lowercase meeting', () => {
        const event = createTestEvent('team meeting');
        const result = classifyEvent(event);
        expect(result.cognitiveLoad).toBe('heavy');
      });

      test('should match mixed case MeEtInG', () => {
        const event = createTestEvent('TeAm MeEtInG');
        const result = classifyEvent(event);
        expect(result.cognitiveLoad).toBe('heavy');
      });

      test('should match LUNCH in any case', () => {
        const event = createTestEvent('LUNCH BREAK');
        const result = classifyEvent(event);
        expect(result.cognitiveLoad).toBe('light');
      });
    });

    describe('Partial Word Matching', () => {
      test('should match "meetings" from "meeting"', () => {
        const event = createTestEvent('Weekly meetings');
        const result = classifyEvent(event);
        expect(result.cognitiveLoad).toBe('heavy');
      });

      test('should match "interviewed" from "interview"', () => {
        const event = createTestEvent('Being interviewed');
        const result = classifyEvent(event);
        expect(result.cognitiveLoad).toBe('heavy');
      });

      test('should match "brainstorming" from "brainstorm"', () => {
        const event = createTestEvent('Brainstorming session');
        const result = classifyEvent(event);
        expect(result.cognitiveLoad).toBe('heavy');
      });

      test('should match keyword within compound word', () => {
        const event = createTestEvent('Pre-meeting preparation');
        const result = classifyEvent(event);
        expect(result.cognitiveLoad).toBe('heavy');
      });
    });

    describe('Precedence Rules - Heavy Over Light', () => {
      test('should classify as heavy when title has both heavy and light keywords', () => {
        const event = createTestEvent('Meeting during lunch');
        const result = classifyEvent(event);
        expect(result.cognitiveLoad).toBe('heavy');
      });

      test('should classify as heavy when interview and coffee are both present', () => {
        const event = createTestEvent('Coffee chat interview');
        const result = classifyEvent(event);
        expect(result.cognitiveLoad).toBe('heavy');
      });

      test('should classify as heavy when client and social are both present', () => {
        const event = createTestEvent('Social event with client');
        const result = classifyEvent(event);
        expect(result.cognitiveLoad).toBe('heavy');
      });
    });

    describe('Edge Cases', () => {
      test('should handle empty title', () => {
        const event = createTestEvent('');
        const result = classifyEvent(event);
        expect(result.cognitiveLoad).toBe('medium');
      });

      test('should handle whitespace-only title', () => {
        const event = createTestEvent('   ');
        const result = classifyEvent(event);
        expect(result.cognitiveLoad).toBe('medium');
      });

      test('should handle title with special characters', () => {
        const event = createTestEvent('Meeting @ HQ #important!');
        const result = classifyEvent(event);
        expect(result.cognitiveLoad).toBe('heavy');
      });

      test('should handle title with numbers', () => {
        const event = createTestEvent('Meeting 123');
        const result = classifyEvent(event);
        expect(result.cognitiveLoad).toBe('heavy');
      });

      test('should handle title with unicode characters', () => {
        const event = createTestEvent('Meeting 会议');
        const result = classifyEvent(event);
        expect(result.cognitiveLoad).toBe('heavy');
      });

      test('should handle title with emojis', () => {
        const event = createTestEvent('🎉 Team Meeting 🚀');
        const result = classifyEvent(event);
        expect(result.cognitiveLoad).toBe('heavy');
      });

      test('should handle very long titles', () => {
        const longTitle = 'A '.repeat(1000) + 'meeting';
        const event = createTestEvent(longTitle);
        const result = classifyEvent(event);
        expect(result.cognitiveLoad).toBe('heavy');
      });

      test('should handle title with newlines', () => {
        const event = createTestEvent('Team\nMeeting\nToday');
        const result = classifyEvent(event);
        expect(result.cognitiveLoad).toBe('heavy');
      });

      test('should handle title with tabs', () => {
        const event = createTestEvent('Team\t\tMeeting');
        const result = classifyEvent(event);
        expect(result.cognitiveLoad).toBe('heavy');
      });
    });

    describe('Original Event Properties Preserved', () => {
      test('should preserve all original event properties', () => {
        const event = createTestEvent('Team Meeting', 'test-123');
        const result = classifyEvent(event);
        
        expect(result.id).toBe('test-123');
        expect(result.title).toBe('Team Meeting');
        expect(result.startTime).toEqual(event.startTime);
        expect(result.endTime).toEqual(event.endTime);
        expect(result.originalStartTime).toEqual(event.originalStartTime);
      });
    });
  });

  describe('classifyEvents - Batch Processing', () => {
    test('should classify multiple events', () => {
      const events: ParsedEvent[] = [
        createTestEvent('Team Meeting', 'event-1'),
        createTestEvent('Lunch Break', 'event-2'),
        createTestEvent('Coding Time', 'event-3'),
      ];

      const results = classifyEvents(events);

      expect(results).toHaveLength(3);
      expect(results[0].cognitiveLoad).toBe('heavy');
      expect(results[1].cognitiveLoad).toBe('light');
      expect(results[2].cognitiveLoad).toBe('medium');
    });

    test('should handle empty array', () => {
      const results = classifyEvents([]);
      expect(results).toHaveLength(0);
    });

    test('should handle single event', () => {
      const events = [createTestEvent('Meeting')];
      const results = classifyEvents(events);
      
      expect(results).toHaveLength(1);
      expect(results[0].cognitiveLoad).toBe('heavy');
    });

    test('should maintain event order', () => {
      const events: ParsedEvent[] = [
        createTestEvent('Event A', 'id-1'),
        createTestEvent('Event B', 'id-2'),
        createTestEvent('Event C', 'id-3'),
      ];

      const results = classifyEvents(events);

      expect(results[0].id).toBe('id-1');
      expect(results[1].id).toBe('id-2');
      expect(results[2].id).toBe('id-3');
    });

    describe('Performance', () => {
      test('should handle large batch efficiently', () => {
        const largeEventSet: ParsedEvent[] = [];
        for (let i = 0; i < 1000; i++) {
          largeEventSet.push(createTestEvent(`Event ${i}`, `id-${i}`));
        }

        const startTime = performance.now();
        const results = classifyEvents(largeEventSet);
        const endTime = performance.now();

        expect(results).toHaveLength(1000);
        expect(endTime - startTime).toBeLessThan(1000); // Should complete in under 1 second
      });

      test('should handle batch with mixed classifications', () => {
        const events: ParsedEvent[] = [];
        for (let i = 0; i < 100; i++) {
          if (i % 3 === 0) {
            events.push(createTestEvent(`Meeting ${i}`, `heavy-${i}`));
          } else if (i % 3 === 1) {
            events.push(createTestEvent(`Lunch ${i}`, `light-${i}`));
          } else {
            events.push(createTestEvent(`Work ${i}`, `medium-${i}`));
          }
        }

        const results = classifyEvents(events);
        const heavyCount = results.filter(e => e.cognitiveLoad === 'heavy').length;
        const lightCount = results.filter(e => e.cognitiveLoad === 'light').length;
        const mediumCount = results.filter(e => e.cognitiveLoad === 'medium').length;

        expect(heavyCount).toBe(34); // 0, 3, 6, ..., 99
        expect(lightCount).toBe(33); // 1, 4, 7, ..., 97
        expect(mediumCount).toBe(33); // 2, 5, 8, ..., 98
      });
    });
  });

  describe('getMatchedKeywords - Classification Reasoning', () => {
    describe('Heavy Classification Details', () => {
      test('should return matched heavy keyword', () => {
        const result = getMatchedKeywords('Team Meeting');
        
        expect(result.cognitiveLoad).toBe('heavy');
        expect(result.matchedKeywords).toContain('meeting');
        expect(result.sourceText).toBe('Team Meeting');
        expect(result.isDefault).toBe(false);
      });

      test('should return all matched heavy keywords', () => {
        const result = getMatchedKeywords('Client interview and presentation');
        
        expect(result.cognitiveLoad).toBe('heavy');
        expect(result.matchedKeywords.length).toBeGreaterThan(0);
        expect(result.matchedKeywords).toEqual(
          expect.arrayContaining(['client', 'interview', 'presentation'])
        );
        expect(result.isDefault).toBe(false);
      });

      test('should include compound heavy keywords', () => {
        const result = getMatchedKeywords('Code review and design review');
        
        expect(result.cognitiveLoad).toBe('heavy');
        expect(result.matchedKeywords).toContain('review');
        expect(result.isDefault).toBe(false);
      });
    });

    describe('Light Classification Details', () => {
      test('should return matched light keyword', () => {
        const result = getMatchedKeywords('Lunch Break');
        
        expect(result.cognitiveLoad).toBe('light');
        expect(result.matchedKeywords).toContain('lunch');
        expect(result.sourceText).toBe('Lunch Break');
        expect(result.isDefault).toBe(false);
      });

      test('should return all matched light keywords', () => {
        const result = getMatchedKeywords('Coffee break and social time');
        
        expect(result.cognitiveLoad).toBe('light');
        expect(result.matchedKeywords.length).toBeGreaterThan(0);
        expect(result.matchedKeywords).toEqual(
          expect.arrayContaining(['coffee', 'break', 'social'])
        );
        expect(result.isDefault).toBe(false);
      });
    });

    describe('Medium Classification Details', () => {
      test('should indicate default classification', () => {
        const result = getMatchedKeywords('Work on project');
        
        expect(result.cognitiveLoad).toBe('medium');
        expect(result.matchedKeywords).toHaveLength(0);
        expect(result.sourceText).toBe('Work on project');
        expect(result.isDefault).toBe(true);
      });

      test('should handle empty title', () => {
        const result = getMatchedKeywords('');
        
        expect(result.cognitiveLoad).toBe('medium');
        expect(result.matchedKeywords).toHaveLength(0);
        expect(result.isDefault).toBe(true);
      });
    });

    describe('Precedence in Matched Keywords', () => {
      test('should show heavy keywords when both heavy and light are present', () => {
        const result = getMatchedKeywords('Interview over lunch');
        
        expect(result.cognitiveLoad).toBe('heavy');
        expect(result.matchedKeywords).toContain('interview');
        expect(result.isDefault).toBe(false);
      });

      test('should only return heavy keywords when mixed', () => {
        const result = getMatchedKeywords('Client meeting during coffee break');
        
        expect(result.cognitiveLoad).toBe('heavy');
        // Should contain heavy keywords
        expect(result.matchedKeywords).toEqual(
          expect.arrayContaining(['client', 'meeting'])
        );
        // Should not contain light keywords when heavy is present
        expect(result.matchedKeywords).not.toContain('coffee');
        expect(result.matchedKeywords).not.toContain('break');
      });
    });

    describe('Source Text Preservation', () => {
      test('should preserve original text casing', () => {
        const result = getMatchedKeywords('TEAM MEETING');
        
        expect(result.sourceText).toBe('TEAM MEETING');
      });

      test('should preserve special characters', () => {
        const result = getMatchedKeywords('Meeting @ HQ #urgent');
        
        expect(result.sourceText).toBe('Meeting @ HQ #urgent');
      });
    });

    describe('Edge Cases for Reasoning', () => {
      test('should handle keyword at start of title', () => {
        const result = getMatchedKeywords('Meeting with team');
        
        expect(result.cognitiveLoad).toBe('heavy');
        expect(result.matchedKeywords).toContain('meeting');
      });

      test('should handle keyword at end of title', () => {
        const result = getMatchedKeywords('Weekly team meeting');
        
        expect(result.cognitiveLoad).toBe('heavy');
        expect(result.matchedKeywords).toContain('meeting');
      });

      test('should handle keyword in middle of title', () => {
        const result = getMatchedKeywords('Urgent meeting today');
        
        expect(result.cognitiveLoad).toBe('heavy');
        expect(result.matchedKeywords).toContain('meeting');
      });

      test('should handle multiple occurrences of same keyword', () => {
        const result = getMatchedKeywords('Meeting about meeting schedule');
        
        expect(result.cognitiveLoad).toBe('heavy');
        expect(result.matchedKeywords).toContain('meeting');
        // Should not duplicate the keyword
        const meetingCount = result.matchedKeywords.filter(k => k === 'meeting').length;
        expect(meetingCount).toBe(1);
      });
    });
  });

  describe('Comprehensive Keyword Coverage', () => {
    describe('All Heavy Keywords', () => {
      const heavyKeywordTests = [
        'meeting', 'interview', 'presentation', 'demo', 'pitch',
        'negotiation', 'brainstorm', 'workshop', 'retrospective',
        'planning', 'standup', 'review', 'audit', 'analysis',
        'strategy', 'decision', 'architecture', 'training',
        'debugging', 'incident', 'research', 'client', 'customer'
      ];

      test.each(heavyKeywordTests)('should classify "%s" as heavy', (keyword) => {
        const event = createTestEvent(`Daily ${keyword} session`);
        const result = classifyEvent(event);
        expect(result.cognitiveLoad).toBe('heavy');
      });
    });

    describe('All Light Keywords', () => {
      const lightKeywordTests = [
        'lunch', 'break', 'coffee', 'tea', 'breakfast',
        'social', 'celebration', 'birthday', 'admin',
        'scheduling', 'fyi', 'announcement', 'reminder',
        'check-in', 'workout', 'yoga', 'meditation'
      ];

      test.each(lightKeywordTests)('should classify "%s" as light', (keyword) => {
        const event = createTestEvent(`${keyword} time`);
        const result = classifyEvent(event);
        expect(result.cognitiveLoad).toBe('light');
      });
    });
  });
});
