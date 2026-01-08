
export enum CardCondition {
  NEAR_MINT = 'NM',
  LIGHTLY_PLAYED = 'LP',
  MODERATELY_PLAYED = 'MP',
  HEAVILY_PLAYED = 'HP',
  DAMAGED = 'DMG'
}

export enum CollectionStatus {
  OWNED = 'OWNED',
  WANTED = 'WANTED',
  FOR_TRADE = 'FOR_TRADE'
}

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
