import { Card, MarketSummary, PricePoint } from '../../types';
import { PricingProvider } from './PricingProvider';
import ebayData from './fixtures/ebay.sample.json';

interface EbayFixture {
  cardId: string;
  currency: string;
  soldAvg: number;
  low: number;
  high: number;
  lastSold: number;
  sampleSize: number;
  lastUpdated: string;
}

/**
 * Stub implementation of eBay sold listings pricing provider
 * Uses local fixture data instead of real API calls
 */
export class EbaySoldProviderStub implements PricingProvider {
  getName(): string {
    return 'ebay';
  }

  async getMarketSummary(card: Card): Promise<MarketSummary> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 120));

    // Try to find card-specific data, fall back to default
    const cardKey = typeof card.id === 'string' ? card.id : card.id.setId + '-' + card.id.number;
    const fixtureData: EbayFixture =
      (ebayData.cards as Record<string, EbayFixture>)[cardKey] ||
      (ebayData.default as EbayFixture);

    const pricePoint: PricePoint = {
      source: 'ebay',
      currency: fixtureData.currency,
      value: fixtureData.soldAvg,
      lastUpdated: new Date(fixtureData.lastUpdated).getTime(),
    };

    return {
      currency: fixtureData.currency,
      market: fixtureData.soldAvg,
      low: fixtureData.low,
      high: fixtureData.high,
      soldAvg: fixtureData.soldAvg,
      sampleSize: fixtureData.sampleSize,
      lastUpdated: new Date(fixtureData.lastUpdated).getTime(),
      sources: [pricePoint],
    };
  }
}
