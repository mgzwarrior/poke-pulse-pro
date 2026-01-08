// ============================================================================
// Enums
// ============================================================================

export enum CardCondition {
  NEAR_MINT = 'NM',
  LIGHTLY_PLAYED = 'LP',
  MODERATELY_PLAYED = 'MP',
  HEAVILY_PLAYED = 'HP',
  DAMAGED = 'DMG',
}

export enum CollectionStatus {
  OWNED = 'OWNED',
  WANTED = 'WANTED',
  FOR_TRADE = 'FOR_TRADE',
}

export enum DealVerdictType {
  GOOD = 'good',
  FAIR = 'fair',
  OVERPRICED = 'overpriced',
  UNKNOWN = 'unknown',
}

// ============================================================================
// Core Domain Models
// ============================================================================

/**
 * Unique identifier for a card across variants
 */
export interface CardId {
  setId: string;
  number: string;
  variant?: string;
  language?: string;
}

/**
 * Complete card information
 */
export interface Card {
  id: CardId;
  name: string;
  setName: string;
  setId: string;
  number: string;
  rarity: string;
  images: {
    small: string;
    large: string;
  };
  variants?: string[];
}

/**
 * Single price point from a specific source
 */
export interface PricePoint {
  source: 'tcgplayer' | 'ebay' | 'pricecharting' | 'cardmarket' | string;
  condition?: CardCondition;
  currency: string;
  value: number;
  lastUpdated: number; // Unix timestamp
  url?: string;
}

/**
 * Aggregated market summary from multiple sources
 */
export interface MarketSummary {
  currency: string;
  market: number; // Primary market value
  low?: number;
  mid?: number;
  high?: number;
  soldAvg?: number; // Average of recent sold prices
  sampleSize?: number;
  lastUpdated: number; // Unix timestamp
  sources: PricePoint[];
}

/**
 * Deal target prices at different discount levels
 */
export interface DealTargets {
  pct80: number; // 80% of market (deep value)
  pct85: number; // 85% of market (great deal)
  pct90: number; // 90% of market (fair trade)
}

/**
 * Deal evaluation result
 */
export interface DealVerdict {
  verdict: DealVerdictType;
  confidence: number; // 0 to 1
  reason: string;
}

/**
 * Collection entry with full metadata
 */
export interface CollectionEntry {
  cardId: string;
  quantity: number;
  condition?: CardCondition;
  notes?: string;
  acquiredPrice?: number;
  acquiredDate?: number; // Unix timestamp
  status: CollectionStatus;
  addedAt: number;
}

// ============================================================================
// Legacy/Compatibility Types (kept for backward compatibility)
// ============================================================================

export interface CardPrice {
  source: string;
  market: number;
  low: number;
  high: number;
  lastSold?: number;
}

export interface PokemonCard {
  id: string;
  name: string;
  setName: string;
  number: string;
  rarity: string;
  imageUrl: string;
  marketPrice: number;
  prices: CardPrice[];
}

export interface CollectionItem {
  cardId: string;
  status: CollectionStatus;
  condition: CardCondition;
  quantity: number;
  addedAt: number;
  notes?: string;
}

export interface ScanResult {
  name: string;
  set: string;
  number: string;
  confidence: number;
}
