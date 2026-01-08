import { Card, PokemonCard } from '../../types';

export interface CardSet {
  id: string;
  name: string;
  series: string;
  releaseDate: string;
  totalCards: number;
  imageUrl?: string;
}

/**
 * Interface for card data repository
 */
export interface CardRepository {
  /**
   * Search cards by name, set, or number
   */
  search(query: string): Promise<PokemonCard[]>;

  /**
   * Get all available sets
   */
  getSets(): Promise<CardSet[]>;

  /**
   * Get all cards in a specific set
   */
  getCardsBySet(setId: string): Promise<PokemonCard[]>;

  /**
   * Get a specific card by ID
   */
  getCard(cardId: string): Promise<PokemonCard | null>;
}
