import { describe, it, expect } from 'vitest';
import { InMemoryCardRepository } from './InMemoryCardRepository';

describe('InMemoryCardRepository', () => {
  const repository = new InMemoryCardRepository();

  describe('search', () => {
    it('should return all cards when query is empty', async () => {
      const results = await repository.search('');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should search by card name', async () => {
      const results = await repository.search('Charizard');
      expect(results.length).toBeGreaterThan(0);
      expect(results.every(card => card.name.toLowerCase().includes('charizard'))).toBe(
        true
      );
    });

    it('should search by set name', async () => {
      const results = await repository.search('Base Set');
      expect(results.length).toBeGreaterThan(0);
      expect(results.every(card => card.setName === 'Base Set')).toBe(true);
    });

    it('should search by card number', async () => {
      const results = await repository.search('4/102');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(card => card.number === '4/102')).toBe(true);
    });

    it('should search by rarity', async () => {
      const results = await repository.search('Rare Holo');
      expect(results.length).toBeGreaterThan(0);
      expect(results.every(card => card.rarity.includes('Rare Holo'))).toBe(true);
    });

    it('should be case insensitive', async () => {
      const resultsLower = await repository.search('pikachu');
      const resultsUpper = await repository.search('PIKACHU');
      expect(resultsLower.length).toBe(resultsUpper.length);
      expect(resultsLower.length).toBeGreaterThan(0);
    });

    it('should return empty array for non-matching query', async () => {
      const results = await repository.search('NonExistentCard12345');
      expect(results).toEqual([]);
    });

    it('should handle partial matches', async () => {
      const results = await repository.search('Char');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(card => card.name.includes('Char'))).toBe(true);
    });
  });

  describe('getSets', () => {
    it('should return all available sets', async () => {
      const sets = await repository.getSets();
      expect(sets.length).toBeGreaterThan(0);
      expect(sets[0]).toHaveProperty('id');
      expect(sets[0]).toHaveProperty('name');
      expect(sets[0]).toHaveProperty('series');
    });

    it('should return sets with valid structure', async () => {
      const sets = await repository.getSets();
      sets.forEach(set => {
        expect(typeof set.id).toBe('string');
        expect(typeof set.name).toBe('string');
        expect(typeof set.series).toBe('string');
        expect(typeof set.releaseDate).toBe('string');
        expect(typeof set.totalCards).toBe('number');
      });
    });
  });

  describe('getCardsBySet', () => {
    it('should return cards from Base Set', async () => {
      const cards = await repository.getCardsBySet('base1');
      expect(cards.length).toBeGreaterThan(0);
      expect(cards.every(card => card.id.startsWith('base1'))).toBe(true);
    });

    it('should return cards from Shining Fates', async () => {
      const cards = await repository.getCardsBySet('swsh45sv');
      expect(cards.length).toBeGreaterThan(0);
      expect(cards.every(card => card.id.startsWith('swsh45sv'))).toBe(true);
    });

    it('should return cards from Silver Tempest', async () => {
      const cards = await repository.getCardsBySet('swsh12');
      expect(cards.length).toBeGreaterThan(0);
      expect(cards.every(card => card.id.startsWith('swsh12'))).toBe(true);
    });

    it('should return empty array for unknown set', async () => {
      const cards = await repository.getCardsBySet('unknown-set');
      expect(cards).toEqual([]);
    });

    it('should handle set ID with dash notation', async () => {
      const cards = await repository.getCardsBySet('base1-4');
      expect(cards.length).toBeGreaterThan(0);
      expect(cards.every(card => card.id.startsWith('base1'))).toBe(true);
    });
  });

  describe('getCard', () => {
    it('should return specific card by ID', async () => {
      const card = await repository.getCard('base1-4');
      expect(card).not.toBeNull();
      expect(card?.id).toBe('base1-4');
      expect(card?.name).toBe('Charizard');
    });

    it('should return Charizard VMAX', async () => {
      const card = await repository.getCard('swsh45sv-107');
      expect(card).not.toBeNull();
      expect(card?.name).toBe('Charizard VMAX');
      expect(card?.setName).toBe('Shining Fates');
    });

    it('should return null for non-existent card', async () => {
      const card = await repository.getCard('invalid-id');
      expect(card).toBeNull();
    });

    it('should return card with complete data', async () => {
      const card = await repository.getCard('base1-4');
      expect(card).not.toBeNull();
      expect(card?.id).toBeDefined();
      expect(card?.name).toBeDefined();
      expect(card?.setName).toBeDefined();
      expect(card?.number).toBeDefined();
      expect(card?.rarity).toBeDefined();
      expect(card?.imageUrl).toBeDefined();
      expect(card?.marketPrice).toBeGreaterThan(0);
      expect(card?.prices).toBeInstanceOf(Array);
      expect(card!.prices.length).toBeGreaterThan(0);
    });
  });

  describe('data integrity', () => {
    it('should have cards from multiple sets', async () => {
      const allCards = await repository.search('');
      const setIds = new Set(allCards.map(card => card.id.split('-')[0]));
      expect(setIds.size).toBeGreaterThanOrEqual(3);
    });

    it('should have cards with different rarities', async () => {
      const allCards = await repository.search('');
      const rarities = new Set(allCards.map(card => card.rarity));
      expect(rarities.size).toBeGreaterThan(1);
    });

    it('should have cards with valid market prices', async () => {
      const allCards = await repository.search('');
      allCards.forEach(card => {
        expect(card.marketPrice).toBeGreaterThan(0);
        expect(Number.isFinite(card.marketPrice)).toBe(true);
      });
    });

    it('should have cards with price data', async () => {
      const allCards = await repository.search('');
      allCards.forEach(card => {
        expect(card.prices).toBeInstanceOf(Array);
        expect(card.prices.length).toBeGreaterThan(0);
        card.prices.forEach(price => {
          expect(price.source).toBeDefined();
          expect(price.market).toBeGreaterThan(0);
        });
      });
    });
  });
});
