import { PokemonCard } from '../types';
import { cardRepository } from './cards/InMemoryCardRepository';

/**
 * Legacy adapter for card database functions
 * Delegates to the new CardRepository implementation
 */

export const searchCards = async (query: string): Promise<PokemonCard[]> => {
  return cardRepository.search(query);
};

export const getCardById = async (id: string): Promise<PokemonCard | null> => {
  return cardRepository.getCard(id);
};

export const getCardByDetails = async (
  name: string,
  set: string,
  number: string
): Promise<PokemonCard | null> => {
  // Search by name and try to find best match
  const results = await cardRepository.search(name);
  
  if (results.length === 0) {
    // Fallback to first card if no match
    const allCards = await cardRepository.search('');
    return allCards[0] || null;
  }
  
  // Try to find exact match by set and number
  const exactMatch = results.find(
    card =>
      card.setName.toLowerCase().includes(set.toLowerCase()) &&
      card.number.includes(number)
  );
  
  if (exactMatch) return exactMatch;
  
  // Return first match by name
  return results[0];
};

