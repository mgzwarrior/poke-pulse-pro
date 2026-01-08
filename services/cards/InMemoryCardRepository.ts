import { PokemonCard } from '../../types';
import { CardRepository, CardSet } from './CardRepository';

// Mock card database with expanded data
const SETS: CardSet[] = [
  {
    id: 'base1',
    name: 'Base Set',
    series: 'Original Series',
    releaseDate: '1999-01-09',
    totalCards: 102,
  },
  {
    id: 'swsh45sv',
    name: 'Shining Fates',
    series: 'Sword & Shield',
    releaseDate: '2021-02-19',
    totalCards: 122,
  },
  {
    id: 'swsh12',
    name: 'Silver Tempest',
    series: 'Sword & Shield',
    releaseDate: '2022-11-11',
    totalCards: 195,
  },
];

const CARDS: PokemonCard[] = [
  // Base Set cards
  {
    id: 'base1-4',
    name: 'Charizard',
    setName: 'Base Set',
    number: '4/102',
    rarity: 'Rare Holo',
    imageUrl: 'https://images.pokemontcg.io/base1/4_hires.png',
    marketPrice: 350.0,
    prices: [
      { source: 'TCGplayer', market: 350.0, low: 280.0, high: 450.0, lastSold: 340.0 },
      { source: 'PriceCharting', market: 365.0, low: 310.0, high: 500.0, lastSold: 355.0 },
    ],
  },
  {
    id: 'base1-1',
    name: 'Alakazam',
    setName: 'Base Set',
    number: '1/102',
    rarity: 'Rare Holo',
    imageUrl: 'https://images.pokemontcg.io/base1/1_hires.png',
    marketPrice: 45.0,
    prices: [
      { source: 'TCGplayer', market: 45.0, low: 38.0, high: 55.0, lastSold: 44.0 },
    ],
  },
  {
    id: 'base1-2',
    name: 'Blastoise',
    setName: 'Base Set',
    number: '2/102',
    rarity: 'Rare Holo',
    imageUrl: 'https://images.pokemontcg.io/base1/2_hires.png',
    marketPrice: 120.0,
    prices: [
      { source: 'TCGplayer', market: 120.0, low: 95.0, high: 150.0, lastSold: 115.0 },
    ],
  },
  {
    id: 'base1-3',
    name: 'Chansey',
    setName: 'Base Set',
    number: '3/102',
    rarity: 'Rare Holo',
    imageUrl: 'https://images.pokemontcg.io/base1/3_hires.png',
    marketPrice: 35.0,
    prices: [
      { source: 'TCGplayer', market: 35.0, low: 28.0, high: 45.0, lastSold: 33.0 },
    ],
  },
  {
    id: 'base1-15',
    name: 'Venusaur',
    setName: 'Base Set',
    number: '15/102',
    rarity: 'Rare Holo',
    imageUrl: 'https://images.pokemontcg.io/base1/15_hires.png',
    marketPrice: 110.0,
    prices: [
      { source: 'TCGplayer', market: 110.0, low: 90.0, high: 135.0, lastSold: 108.0 },
    ],
  },
  {
    id: 'base1-58',
    name: 'Pikachu',
    setName: 'Base Set',
    number: '58/102',
    rarity: 'Common',
    imageUrl: 'https://images.pokemontcg.io/base1/58_hires.png',
    marketPrice: 8.5,
    prices: [
      { source: 'TCGplayer', market: 8.5, low: 6.0, high: 12.0, lastSold: 8.0 },
    ],
  },

  // Shining Fates cards
  {
    id: 'swsh45sv-107',
    name: 'Charizard VMAX',
    setName: 'Shining Fates',
    number: 'SV107/SV122',
    rarity: 'Shiny Rare VMAX',
    imageUrl: 'https://images.pokemontcg.io/swsh45sv/SV107_hires.png',
    marketPrice: 95.5,
    prices: [
      { source: 'TCGplayer', market: 95.5, low: 88.0, high: 110.0, lastSold: 92.0 },
      { source: 'eBay', market: 98.0, low: 75.0, high: 125.0, lastSold: 94.5 },
    ],
  },
  {
    id: 'swsh45sv-122',
    name: 'Shiny Charizard V',
    setName: 'Shining Fates',
    number: 'SV122/SV122',
    rarity: 'Shiny Ultra Rare',
    imageUrl: 'https://images.pokemontcg.io/swsh45sv/SV122_hires.png',
    marketPrice: 155.0,
    prices: [
      { source: 'TCGplayer', market: 155.0, low: 140.0, high: 180.0, lastSold: 150.0 },
    ],
  },
  {
    id: 'swsh45sv-050',
    name: 'Ditto VMAX',
    setName: 'Shining Fates',
    number: 'SV050/SV122',
    rarity: 'Shiny Rare VMAX',
    imageUrl: 'https://images.pokemontcg.io/swsh45sv/SV050_hires.png',
    marketPrice: 22.0,
    prices: [
      { source: 'TCGplayer', market: 22.0, low: 18.0, high: 28.0, lastSold: 21.0 },
    ],
  },
  {
    id: 'swsh45sv-001',
    name: 'Rowlet',
    setName: 'Shining Fates',
    number: 'SV001/SV122',
    rarity: 'Shiny Common',
    imageUrl: 'https://images.pokemontcg.io/swsh45sv/SV001_hires.png',
    marketPrice: 3.5,
    prices: [
      { source: 'TCGplayer', market: 3.5, low: 2.5, high: 5.0, lastSold: 3.2 },
    ],
  },

  // Silver Tempest cards
  {
    id: 'swsh12-186',
    name: 'Lugia V',
    setName: 'Silver Tempest',
    number: '186/195',
    rarity: 'Special Illustration Rare',
    imageUrl: 'https://images.pokemontcg.io/swsh12/186_hires.png',
    marketPrice: 185.25,
    prices: [
      { source: 'TCGplayer', market: 185.25, low: 170.0, high: 210.0, lastSold: 182.0 },
    ],
  },
  {
    id: 'swsh12-195',
    name: 'Lugia VSTAR',
    setName: 'Silver Tempest',
    number: '195/195',
    rarity: 'Ultra Rare',
    imageUrl: 'https://images.pokemontcg.io/swsh12/195_hires.png',
    marketPrice: 45.0,
    prices: [
      { source: 'TCGplayer', market: 45.0, low: 38.0, high: 55.0, lastSold: 44.0 },
    ],
  },
  {
    id: 'swsh12-183',
    name: 'Regieleki VMAX',
    setName: 'Silver Tempest',
    number: '183/195',
    rarity: 'Ultra Rare',
    imageUrl: 'https://images.pokemontcg.io/swsh12/183_hires.png',
    marketPrice: 12.5,
    prices: [
      { source: 'TCGplayer', market: 12.5, low: 10.0, high: 16.0, lastSold: 12.0 },
    ],
  },
  {
    id: 'swsh12-001',
    name: 'Snivy',
    setName: 'Silver Tempest',
    number: '001/195',
    rarity: 'Common',
    imageUrl: 'https://images.pokemontcg.io/swsh12/1_hires.png',
    marketPrice: 0.25,
    prices: [
      { source: 'TCGplayer', market: 0.25, low: 0.15, high: 0.5, lastSold: 0.2 },
    ],
  },
  {
    id: 'swsh12-100',
    name: 'Pikachu',
    setName: 'Silver Tempest',
    number: '100/195',
    rarity: 'Uncommon',
    imageUrl: 'https://images.pokemontcg.io/swsh12/100_hires.png',
    marketPrice: 1.5,
    prices: [
      { source: 'TCGplayer', market: 1.5, low: 1.0, high: 2.5, lastSold: 1.4 },
    ],
  },
  {
    id: 'swsh12-147',
    name: 'Mewtwo V',
    setName: 'Silver Tempest',
    number: '147/195',
    rarity: 'Ultra Rare',
    imageUrl: 'https://images.pokemontcg.io/swsh12/147_hires.png',
    marketPrice: 8.0,
    prices: [
      { source: 'TCGplayer', market: 8.0, low: 6.5, high: 10.0, lastSold: 7.8 },
    ],
  },
];

/**
 * In-memory implementation of CardRepository
 */
export class InMemoryCardRepository implements CardRepository {
  async search(query: string): Promise<PokemonCard[]> {
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 150));

    const q = query.toLowerCase().trim();
    if (!q) return CARDS;

    return CARDS.filter(
      card =>
        card.name.toLowerCase().includes(q) ||
        card.setName.toLowerCase().includes(q) ||
        card.number.toLowerCase().includes(q) ||
        card.rarity.toLowerCase().includes(q)
    );
  }

  async getSets(): Promise<CardSet[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return SETS;
  }

  async getCardsBySet(setId: string): Promise<PokemonCard[]> {
    await new Promise(resolve => setTimeout(resolve, 150));
    
    // Extract set prefix from setId (e.g., 'base1' from 'base1-4')
    const setPrefix = setId.includes('-') ? setId.split('-')[0] : setId;
    
    return CARDS.filter(card => card.id.startsWith(setPrefix));
  }

  async getCard(cardId: string): Promise<PokemonCard | null> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return CARDS.find(card => card.id === cardId) || null;
  }
}

// Export singleton instance
export const cardRepository = new InMemoryCardRepository();
