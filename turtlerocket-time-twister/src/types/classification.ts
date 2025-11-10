/**
 * Type definitions for cognitive load classification system
 */

/**
 * Cognitive Load Type
 * Represents the mental effort required for a calendar event
 * 
 * - 'heavy': High cognitive effort (meetings, reviews, presentations)
 * - 'medium': Moderate effort (default for unclassified events)
 * - 'light': Low effort (breaks, social events, routine admin)
 */
export type CognitiveLoad = 'heavy' | 'medium' | 'light';

/**
 * Classification Result Interface
 * Contains detailed information about how an event was classified
 */
export interface ClassificationResult {
  /**
   * The determined cognitive load
   */
  cognitiveLoad: CognitiveLoad;
  
  /**
   * Keywords that were matched in the event title
   * Empty array if no keywords matched (defaults to medium)
   */
  matchedKeywords: string[];
  
  /**
   * The source text that was analyzed (typically event title)
   */
  sourceText: string;
  
  /**
   * Whether the classification was based on keyword matching
   * or defaulted to medium
   */
  isDefault: boolean;
  
  /**
   * Confidence score (0-1) based on number and specificity of matches
   * Optional - can be implemented in future iterations
   */
  confidence?: number;
}

/**
 * Classification Options
 * Configuration options for the classification algorithm
 */
export interface ClassificationOptions {
  /**
   * Whether to include event description in classification
   * Default: false (only title is used)
   */
  includeDescription?: boolean;
  
  /**
   * Whether to include event location in classification
   * Default: false
   */
  includeLocation?: boolean;
  
  /**
   * Custom keywords to add temporarily
   * Useful for user customization without modifying config
   */
  customHeavyKeywords?: string[];
  customLightKeywords?: string[];
  
  /**
   * Whether to return detailed classification result
   * Default: false (only cognitiveLoad is added to event)
   */
  includeClassificationResult?: boolean;
}

/**
 * Keyword Match
 * Represents a single keyword match
 */
export interface KeywordMatch {
  keyword: string;
  position: number;
  cognitiveLoad: Exclude<CognitiveLoad, 'medium'>;
}
