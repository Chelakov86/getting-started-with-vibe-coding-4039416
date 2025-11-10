import { HEAVY_KEYWORDS, LIGHT_KEYWORDS, KEYWORD_MATCHING_CONFIG } from '../config/keywords';
import { CognitiveLoad, ClassificationResult, KeywordMatch } from '../types/classification';
import { ParsedEvent } from './icsParser';

/**
 * Extended event type with cognitive load classification
 */
export interface ClassifiedEvent extends ParsedEvent {
  cognitiveLoad: CognitiveLoad;
}

/**
 * Classifies a single event based on keyword matching in the title
 * 
 * Algorithm:
 * 1. Check title against HEAVY_KEYWORDS first
 * 2. Then check LIGHT_KEYWORDS
 * 3. Default to 'medium' if no matches
 * 4. Heavy keywords take precedence over light keywords
 * 5. Case-insensitive and partial word matching
 * 
 * @param event - The event to classify
 * @returns ClassifiedEvent with cognitiveLoad property added
 */
export function classifyEvent(event: ParsedEvent): ClassifiedEvent {
  const cognitiveLoad = determineLoadFromTitle(event.title);
  
  return {
    ...event,
    cognitiveLoad,
  };
}

/**
 * Classifies multiple events in batch
 * 
 * @param events - Array of events to classify
 * @returns Array of classified events
 */
export function classifyEvents(events: ParsedEvent[]): ClassifiedEvent[] {
  return events.map(event => classifyEvent(event));
}

/**
 * Gets detailed classification result including matched keywords and reasoning
 * 
 * @param title - The event title to analyze
 * @returns ClassificationResult with detailed information
 */
export function getMatchedKeywords(title: string): ClassificationResult {
  const normalizedTitle = normalizeText(title);
  
  // Check heavy keywords first
  const heavyMatches = findMatchingKeywords(normalizedTitle, HEAVY_KEYWORDS, 'heavy');
  if (heavyMatches.length > 0) {
    return {
      cognitiveLoad: 'heavy',
      matchedKeywords: heavyMatches.map(m => m.keyword),
      sourceText: title,
      isDefault: false,
    };
  }
  
  // Then check light keywords
  const lightMatches = findMatchingKeywords(normalizedTitle, LIGHT_KEYWORDS, 'light');
  if (lightMatches.length > 0) {
    return {
      cognitiveLoad: 'light',
      matchedKeywords: lightMatches.map(m => m.keyword),
      sourceText: title,
      isDefault: false,
    };
  }
  
  // Default to medium
  return {
    cognitiveLoad: 'medium',
    matchedKeywords: [],
    sourceText: title,
    isDefault: true,
  };
}

/**
 * Determines cognitive load from event title
 * Internal function used by classifyEvent
 * 
 * @param title - Event title to analyze
 * @returns CognitiveLoad classification
 */
function determineLoadFromTitle(title: string): CognitiveLoad {
  const normalizedTitle = normalizeText(title);
  
  // Check heavy keywords first (priority)
  if (hasKeywordMatch(normalizedTitle, HEAVY_KEYWORDS)) {
    return 'heavy';
  }
  
  // Then check light keywords
  if (hasKeywordMatch(normalizedTitle, LIGHT_KEYWORDS)) {
    return 'light';
  }
  
  // Default to medium
  return 'medium';
}

/**
 * Normalizes text for keyword matching
 * Applies case-insensitive transformation
 * 
 * @param text - Text to normalize
 * @returns Normalized text
 */
function normalizeText(text: string): string {
  if (!KEYWORD_MATCHING_CONFIG.caseInsensitive) {
    return text;
  }
  return text.toLowerCase();
}

/**
 * Checks if title contains any keyword from the list
 * Supports partial word matching
 * 
 * @param normalizedTitle - Normalized title text
 * @param keywords - Array of keywords to check
 * @returns true if any keyword matches
 */
function hasKeywordMatch(normalizedTitle: string, keywords: readonly string[]): boolean {
  for (const keyword of keywords) {
    const normalizedKeyword = normalizeText(keyword);
    
    if (KEYWORD_MATCHING_CONFIG.partialMatch) {
      // Partial match: keyword can appear anywhere in title
      if (normalizedTitle.includes(normalizedKeyword)) {
        return true;
      }
    } else {
      // Exact match: keyword must be complete word
      const wordBoundaryRegex = new RegExp(`\\b${escapeRegExp(normalizedKeyword)}\\b`);
      if (wordBoundaryRegex.test(normalizedTitle)) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Finds all matching keywords in the title with their positions
 * 
 * @param normalizedTitle - Normalized title text
 * @param keywords - Array of keywords to check
 * @param load - The cognitive load type for these keywords
 * @returns Array of KeywordMatch objects
 */
function findMatchingKeywords(
  normalizedTitle: string,
  keywords: readonly string[],
  load: Exclude<CognitiveLoad, 'medium'>
): KeywordMatch[] {
  const matches: KeywordMatch[] = [];
  
  for (const keyword of keywords) {
    const normalizedKeyword = normalizeText(keyword);
    
    if (KEYWORD_MATCHING_CONFIG.partialMatch) {
      const position = normalizedTitle.indexOf(normalizedKeyword);
      if (position !== -1) {
        matches.push({
          keyword,
          position,
          cognitiveLoad: load,
        });
      }
    } else {
      const wordBoundaryRegex = new RegExp(`\\b${escapeRegExp(normalizedKeyword)}\\b`);
      const match = wordBoundaryRegex.exec(normalizedTitle);
      if (match) {
        matches.push({
          keyword,
          position: match.index,
          cognitiveLoad: load,
        });
      }
    }
  }
  
  return matches;
}

/**
 * Escapes special regex characters in a string
 * 
 * @param str - String to escape
 * @returns Escaped string safe for regex
 */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
