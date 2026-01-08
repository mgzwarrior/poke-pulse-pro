
import { PokemonCard, CardPrice } from "../types";

// Simulating a high-speed local cache/database
const MOCK_CARDS: PokemonCard[] = [
  {
    id: 'swsh4-183',
    name: 'Charizard VMAX',
    setName: 'Shining Fates',
    number: 'SV107/SV122',
    rarity: 'Shiny Rare VMAX',
    imageUrl: 'https://images.pokemontcg.io/swsh45sv/SV107_hires.png',
    marketPrice: 95.50,
    prices: [
      { source: 'TCGplayer', market: 95.50, low: 88.00, high: 110.00, lastSold: 92.00 },
      { source: 'eBay', market: 98.00, low: 75.00, high: 125.00, lastSold: 94.50 }
    ]
  },
  {
    id: 'base1-4',
    name: 'Charizard',
    setName: 'Base Set',
    number: '4/102',
    rarity: 'Rare Holo',
    imageUrl: 'https://images.pokemontcg.io/base1/4_hires.png',
    marketPrice: 350.00,
    prices: [
      { source: 'TCGplayer', market: 350.00, low: 280.00, high: 450.00, lastSold: 340.00 },
      { source: 'PriceCharting', market: 365.00, low: 310.00, high: 500.00, lastSold: 355.00 }
    ]
  },
  {
    id: 'swsh12-160',
    name: 'Lugia V',
    setName: 'Silver Tempest',
    number: '186/195',
    rarity: 'Special Illustration Rare',
    imageUrl: 'https://images.pokemontcg.io/swsh12/186_hires.png',
    marketPrice: 185.25,
    prices: [
      { source: 'TCGplayer', market: 185.25, low: 170.00, high: 210.00, lastSold: 182.00 }
    ]
  }
];

export const searchCards = async (query: string): Promise<PokemonCard[]> => {
  // Simulate network latency but keep it sub-second
  await new Promise(r => setTimeout(r, 200));
  const q = query.toLowerCase();
  return MOCK_CARDS.filter(c => 
    c.name.toLowerCase().includes(q) || 
    c.setName.toLowerCase().includes(q) ||
    c.number.toLowerCase().includes(q)
  );
};

export const getCardById = async (id: string): Promise<PokemonCard | null> => {
  return MOCK_CARDS.find(c => c.id === id) || null;
};

export const getCardByDetails = async (name: string, set: string, number: string): Promise<PokemonCard | null> => {
  // Logic to find closest match from local or remote DB
  const normalizedName = name.toLowerCase();
  return MOCK_CARDS.find(c => 
    c.name.toLowerCase().includes(normalizedName) || 
    normalizedName.includes(c.name.toLowerCase())
  ) || MOCK_CARDS[0]; // Default to one for demo if not found
};
