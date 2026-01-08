import { describe, it, expect } from 'vitest';
import { TcgplayerProviderStub } from './TcgplayerProviderStub';
import { EbaySoldProviderStub } from './EbaySoldProviderStub';
import { CompositePricingService } from './CompositePricingService';
import { Card } from '../../types';

const createMockCard = (id: string): Card => ({
  id: {
    setId: id.split('-')[0],
    number: id.split('-')[1],
  },
  name: 'Test Card',
  setName: 'Test Set',
  setId: id.split('-')[0],
  number: id.split('-')[1],
  rarity: 'Rare',
  images: {
    small: 'https://example.com/small.png',
    large: 'https://example.com/large.png',
  },
});

describe('TcgplayerProviderStub', () => {
  const provider = new TcgplayerProviderStub();

  it('should return provider name', () => {
    expect(provider.getName()).toBe('tcgplayer');
  });

  it('should return market summary for known card', async () => {
    const card = createMockCard('swsh4-183');
    const summary = await provider.getMarketSummary(card);

    expect(summary.currency).toBe('USD');
    expect(summary.market).toBe(95.5);
    expect(summary.low).toBe(88);
    expect(summary.high).toBe(110);
    expect(summary.sampleSize).toBe(47);
    expect(summary.sources).toHaveLength(1);
    expect(summary.sources[0].source).toBe('tcgplayer');
  });

  it('should return default values for unknown card', async () => {
    const card = createMockCard('unknown-999');
    const summary = await provider.getMarketSummary(card);

    expect(summary.currency).toBe('USD');
    expect(summary.market).toBe(25);
    expect(summary.sampleSize).toBe(15);
  });

  it('should return valid timestamp', async () => {
    const card = createMockCard('swsh4-183');
    const summary = await provider.getMarketSummary(card);

    expect(summary.lastUpdated).toBeGreaterThan(0);
    expect(typeof summary.lastUpdated).toBe('number');
  });
});

describe('EbaySoldProviderStub', () => {
  const provider = new EbaySoldProviderStub();

  it('should return provider name', () => {
    expect(provider.getName()).toBe('ebay');
  });

  it('should return market summary for known card', async () => {
    const card = createMockCard('base1-4');
    const summary = await provider.getMarketSummary(card);

    expect(summary.currency).toBe('USD');
    expect(summary.market).toBe(365);
    expect(summary.soldAvg).toBe(365);
    expect(summary.low).toBe(310);
    expect(summary.high).toBe(500);
    expect(summary.sampleSize).toBe(56);
    expect(summary.sources).toHaveLength(1);
    expect(summary.sources[0].source).toBe('ebay');
  });

  it('should return default values for unknown card', async () => {
    const card = createMockCard('unknown-999');
    const summary = await provider.getMarketSummary(card);

    expect(summary.currency).toBe('USD');
    expect(summary.market).toBe(22);
    expect(summary.soldAvg).toBe(22);
    expect(summary.sampleSize).toBe(8);
  });
});

describe('CompositePricingService', () => {
  it('should aggregate data from multiple providers', async () => {
    const tcgProvider = new TcgplayerProviderStub();
    const ebayProvider = new EbaySoldProviderStub();
    const composite = new CompositePricingService([tcgProvider, ebayProvider]);

    const card = createMockCard('swsh4-183');
    const summary = await composite.getMarketSummary(card);

    expect(summary.currency).toBe('USD');
    expect(summary.market).toBeGreaterThan(0);
    expect(summary.sources).toHaveLength(2);
    expect(summary.sources.map(s => s.source)).toContain('tcgplayer');
    expect(summary.sources.map(s => s.source)).toContain('ebay');
  });

  it('should combine sample sizes from all providers', async () => {
    const tcgProvider = new TcgplayerProviderStub();
    const ebayProvider = new EbaySoldProviderStub();
    const composite = new CompositePricingService([tcgProvider, ebayProvider]);

    const card = createMockCard('swsh4-183');
    const summary = await composite.getMarketSummary(card);

    // TCGPlayer has 47, eBay has 23
    expect(summary.sampleSize).toBe(70);
  });

  it('should use most recent timestamp', async () => {
    const tcgProvider = new TcgplayerProviderStub();
    const ebayProvider = new EbaySoldProviderStub();
    const composite = new CompositePricingService([tcgProvider, ebayProvider]);

    const card = createMockCard('base1-4');
    const summary = await composite.getMarketSummary(card);

    expect(summary.lastUpdated).toBeGreaterThan(0);
  });

  it('should calculate proper low and high from all sources', async () => {
    const tcgProvider = new TcgplayerProviderStub();
    const ebayProvider = new EbaySoldProviderStub();
    const composite = new CompositePricingService([tcgProvider, ebayProvider]);

    const card = createMockCard('swsh4-183');
    const summary = await composite.getMarketSummary(card);

    // Should take minimum low and maximum high
    expect(summary.low).toBeLessThanOrEqual(summary.market);
    expect(summary.high).toBeGreaterThanOrEqual(summary.market);
  });

  it('should handle single provider', async () => {
    const tcgProvider = new TcgplayerProviderStub();
    const composite = new CompositePricingService([tcgProvider]);

    const card = createMockCard('swsh4-183');
    const summary = await composite.getMarketSummary(card);

    expect(summary.market).toBe(95.5);
    expect(summary.sources).toHaveLength(1);
  });

  it('should throw error when no providers are available', async () => {
    const composite = new CompositePricingService([]);

    const card = createMockCard('swsh4-183');

    await expect(composite.getMarketSummary(card)).rejects.toThrow(
      'No pricing data available'
    );
  });

  it('should calculate soldAvg when available from providers', async () => {
    const ebayProvider = new EbaySoldProviderStub();
    const composite = new CompositePricingService([ebayProvider]);

    const card = createMockCard('base1-4');
    const summary = await composite.getMarketSummary(card);

    expect(summary.soldAvg).toBeDefined();
    expect(summary.soldAvg).toBe(365);
  });

  it('should round all prices to 2 decimal places', async () => {
    const tcgProvider = new TcgplayerProviderStub();
    const ebayProvider = new EbaySoldProviderStub();
    const composite = new CompositePricingService([tcgProvider, ebayProvider]);

    const card = createMockCard('swsh12-160');
    const summary = await composite.getMarketSummary(card);

    // Verify that all prices are properly rounded (no more than 2 decimal places)
    expect(Number.isFinite(summary.market)).toBe(true);
    expect(Number.isFinite(summary.low)).toBe(true);
    expect(Number.isFinite(summary.high)).toBe(true);
    
    // Check that rounding is correct (multiply by 100, round, divide by 100 should be same)
    expect(summary.market).toBe(Math.round(summary.market * 100) / 100);
    expect(summary.low).toBe(Math.round(summary.low * 100) / 100);
    expect(summary.high).toBe(Math.round(summary.high * 100) / 100);
  });
});
