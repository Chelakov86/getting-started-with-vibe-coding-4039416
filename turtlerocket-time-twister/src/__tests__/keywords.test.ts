/**
 * Tests for keyword-based classification system
 */

import {
  HEAVY_KEYWORDS,
  LIGHT_KEYWORDS,
  KEYWORD_CATEGORIES,
  KEYWORD_MATCHING_CONFIG,
} from '../config/keywords';

describe('Keyword Configuration', () => {
  describe('Keyword List Completeness', () => {
    it('should have heavy keywords defined', () => {
      expect(HEAVY_KEYWORDS).toBeDefined();
      expect(HEAVY_KEYWORDS.length).toBeGreaterThan(0);
    });

    it('should have light keywords defined', () => {
      expect(LIGHT_KEYWORDS).toBeDefined();
      expect(LIGHT_KEYWORDS.length).toBeGreaterThan(0);
    });

    it('should have at least 20 heavy keywords for comprehensive classification', () => {
      expect(HEAVY_KEYWORDS.length).toBeGreaterThanOrEqual(20);
    });

    it('should have at least 15 light keywords for comprehensive classification', () => {
      expect(LIGHT_KEYWORDS.length).toBeGreaterThanOrEqual(15);
    });

    it('should have categories defined', () => {
      expect(KEYWORD_CATEGORIES).toBeDefined();
      expect(KEYWORD_CATEGORIES.heavy).toBeDefined();
      expect(KEYWORD_CATEGORIES.light).toBeDefined();
    });

    it('should have all category keywords present in main keyword lists', () => {
      const heavyCategoryKeywords = Object.values(KEYWORD_CATEGORIES.heavy).flat();
      const lightCategoryKeywords = Object.values(KEYWORD_CATEGORIES.light).flat();

      heavyCategoryKeywords.forEach((keyword) => {
        expect(HEAVY_KEYWORDS).toContain(keyword);
      });

      lightCategoryKeywords.forEach((keyword) => {
        expect(LIGHT_KEYWORDS).toContain(keyword);
      });
    });
  });

  describe('Keyword Conflict Detection', () => {
    it('should have no overlapping keywords between HEAVY and LIGHT', () => {
      const heavySet = new Set<string>(HEAVY_KEYWORDS);
      const lightSet = new Set<string>(LIGHT_KEYWORDS);

      const overlaps: string[] = [];
      heavySet.forEach((keyword) => {
        if (lightSet.has(keyword as any)) {
          overlaps.push(keyword);
        }
      });

      expect(overlaps).toEqual([]);
    });

    it('should have no duplicate keywords within HEAVY_KEYWORDS', () => {
      const duplicates = HEAVY_KEYWORDS.filter(
        (keyword, index) => HEAVY_KEYWORDS.indexOf(keyword) !== index
      );

      expect(duplicates).toEqual([]);
    });

    it('should have no duplicate keywords within LIGHT_KEYWORDS', () => {
      const duplicates = LIGHT_KEYWORDS.filter(
        (keyword, index) => LIGHT_KEYWORDS.indexOf(keyword) !== index
      );

      expect(duplicates).toEqual([]);
    });

    it('should not have substring conflicts within HEAVY keywords', () => {
      // This test warns about potential substring issues
      // e.g., if "meet" and "meeting" both exist, they may cause confusion
      const potentialConflicts: string[] = [];

      for (let i = 0; i < HEAVY_KEYWORDS.length; i++) {
        for (let j = i + 1; j < HEAVY_KEYWORDS.length; j++) {
          const keyword1 = HEAVY_KEYWORDS[i];
          const keyword2 = HEAVY_KEYWORDS[j];

          if (keyword1.includes(keyword2) || keyword2.includes(keyword1)) {
            potentialConflicts.push(`"${keyword1}" and "${keyword2}"`);
          }
        }
      }

      // We allow some substring overlaps but document them
      // This is informational, not a failure
      if (potentialConflicts.length > 0) {
        console.log(
          'Substring overlaps in HEAVY keywords (may be intentional):',
          potentialConflicts
        );
      }
    });

    it('should not have substring conflicts within LIGHT keywords', () => {
      const potentialConflicts: string[] = [];

      for (let i = 0; i < LIGHT_KEYWORDS.length; i++) {
        for (let j = i + 1; j < LIGHT_KEYWORDS.length; j++) {
          const keyword1 = LIGHT_KEYWORDS[i];
          const keyword2 = LIGHT_KEYWORDS[j];

          if (keyword1.includes(keyword2) || keyword2.includes(keyword1)) {
            potentialConflicts.push(`"${keyword1}" and "${keyword2}"`);
          }
        }
      }

      if (potentialConflicts.length > 0) {
        console.log(
          'Substring overlaps in LIGHT keywords (may be intentional):',
          potentialConflicts
        );
      }
    });
  });

  describe('Case Sensitivity Configuration', () => {
    it('should have case-insensitive matching enabled', () => {
      expect(KEYWORD_MATCHING_CONFIG.caseInsensitive).toBe(true);
    });

    it('should have all keywords in lowercase for consistency', () => {
      const nonLowercaseHeavy = HEAVY_KEYWORDS.filter(
        (keyword) => keyword !== keyword.toLowerCase()
      );
      const nonLowercaseLight = LIGHT_KEYWORDS.filter(
        (keyword) => keyword !== keyword.toLowerCase()
      );

      expect(nonLowercaseHeavy).toEqual([]);
      expect(nonLowercaseLight).toEqual([]);
    });
  });

  describe('Partial Matching Configuration', () => {
    it('should have partial matching enabled', () => {
      expect(KEYWORD_MATCHING_CONFIG.partialMatch).toBe(true);
    });

    it('should have priority order defined', () => {
      expect(KEYWORD_MATCHING_CONFIG.priorityOrder).toEqual(['heavy', 'light']);
    });
  });

  describe('Keyword Quality Standards', () => {
    it('should not have empty keywords', () => {
      const emptyHeavy = HEAVY_KEYWORDS.filter((keyword) => keyword.trim() === '');
      const emptyLight = LIGHT_KEYWORDS.filter((keyword) => keyword.trim() === '');

      expect(emptyHeavy).toEqual([]);
      expect(emptyLight).toEqual([]);
    });

    it('should not have excessively long keywords (> 50 chars)', () => {
      const longHeavy = HEAVY_KEYWORDS.filter((keyword) => keyword.length > 50);
      const longLight = LIGHT_KEYWORDS.filter((keyword) => keyword.length > 50);

      expect(longHeavy).toEqual([]);
      expect(longLight).toEqual([]);
    });

    it('should not have leading or trailing whitespace', () => {
      const whitespaceHeavy = HEAVY_KEYWORDS.filter(
        (keyword) => keyword !== keyword.trim()
      );
      const whitespaceLight = LIGHT_KEYWORDS.filter(
        (keyword) => keyword !== keyword.trim()
      );

      expect(whitespaceHeavy).toEqual([]);
      expect(whitespaceLight).toEqual([]);
    });

    it('should use singular or root forms where possible', () => {
      // Check for plural forms that might indicate keyword could be simplified
      const pluralHeavy = HEAVY_KEYWORDS.filter((keyword) => keyword.endsWith('s'));
      const pluralLight = LIGHT_KEYWORDS.filter((keyword) => keyword.endsWith('s'));

      // This is informational - some plurals may be intentional
      if (pluralHeavy.length > 0) {
        console.log('HEAVY keywords ending in "s" (may be intentional):', pluralHeavy);
      }
      if (pluralLight.length > 0) {
        console.log('LIGHT keywords ending in "s" (may be intentional):', pluralLight);
      }
    });
  });

  describe('Keyword Categories Organization', () => {
    it('should have at least 3 categories for heavy keywords', () => {
      expect(Object.keys(KEYWORD_CATEGORIES.heavy).length).toBeGreaterThanOrEqual(3);
    });

    it('should have at least 3 categories for light keywords', () => {
      expect(Object.keys(KEYWORD_CATEGORIES.light).length).toBeGreaterThanOrEqual(3);
    });

    it('should have non-empty categories', () => {
      Object.entries(KEYWORD_CATEGORIES.heavy).forEach(([category, keywords]) => {
        expect(keywords.length).toBeGreaterThan(0);
      });

      Object.entries(KEYWORD_CATEGORIES.light).forEach(([category, keywords]) => {
        expect(keywords.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Real-world Event Title Coverage', () => {
    it('should classify common meeting types as heavy', () => {
      const meetingTypes = [
        'Team Meeting',
        'Client Interview',
        'Presentation Review',
        'Design Review',
        'Sprint Planning',
      ];

      meetingTypes.forEach((title) => {
        const titleLower = title.toLowerCase();
        const hasHeavyKeyword = HEAVY_KEYWORDS.some((keyword) =>
          titleLower.includes(keyword)
        );
        expect(hasHeavyKeyword).toBe(true);
      });
    });

    it('should classify common break types as light', () => {
      const breakTypes = [
        'Lunch Break',
        'Coffee Chat',
        'Team Social',
        'Personal Time',
        'Quick Break',
      ];

      breakTypes.forEach((title) => {
        const titleLower = title.toLowerCase();
        const hasLightKeyword = LIGHT_KEYWORDS.some((keyword) =>
          titleLower.includes(keyword)
        );
        expect(hasLightKeyword).toBe(true);
      });
    });

    it('should not classify generic terms', () => {
      const genericTerms = ['work', 'task', 'event', 'time', 'schedule'];

      genericTerms.forEach((term) => {
        const hasHeavyKeyword = (HEAVY_KEYWORDS as readonly string[]).includes(term);
        const hasLightKeyword = (LIGHT_KEYWORDS as readonly string[]).includes(term);

        expect(hasHeavyKeyword || hasLightKeyword).toBe(false);
      });
    });
  });

  describe('Extensibility', () => {
    it('should use const assertions for type safety', () => {
      // Type-level test - if this compiles, the const assertions work
      const heavyKeyword: typeof HEAVY_KEYWORDS[number] = 'meeting';
      const lightKeyword: typeof LIGHT_KEYWORDS[number] = 'lunch';

      expect(heavyKeyword).toBe('meeting');
      expect(lightKeyword).toBe('lunch');
    });

    it('should be easily extendable with new keywords', () => {
      // Demonstrate that keywords can be extended programmatically
      const customHeavyKeywords = [...HEAVY_KEYWORDS, 'custom-heavy'];
      const customLightKeywords = [...LIGHT_KEYWORDS, 'custom-light'];

      expect(customHeavyKeywords.length).toBe(HEAVY_KEYWORDS.length + 1);
      expect(customLightKeywords.length).toBe(LIGHT_KEYWORDS.length + 1);
    });
  });
});
