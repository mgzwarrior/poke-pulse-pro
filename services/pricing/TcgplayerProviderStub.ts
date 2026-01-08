import { Card, MarketSummary, PricePoint } from '../../types';
import { PricingProvider } from './PricingProvider';
import tcgplayerData from './fixtures/tcgplayer.sample.json';

interface TCGPlayerFixture {
  cardId: string;
  currency: string;
  market: number;
  low: number;
  mid: number;
  high: number;
  lastSold: number;
  sampleSize: number;
  lastUpdated: string;
}

/**
 * Stub implementation of TCGplayer pricing provider
 * Uses local fixture data instead of real API calls
 */
export class TcgplayerProviderStub implements PricingProvider {
  getName(): string {
    return 'tcgplayer';
  }

  async getMarketSummary(card: Card): Promise<MarketSummary> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // Try to find card-specific data, fall back to default
    const cardKey = typeof card.id === 'string' ? card.id : card.id.setId + '-' + card.id.number;
    const fixtureData: TCGPlayerFixture =
      (tcgplayerData.cards as Record<string, TCGPlayerFixture>)[cardKey] ||
      (tcgplayerData.default as TCGPlayerFixture);

    const pricePoint: PricePoint = {
      source: 'tcgplayer',
      currency: fixtureData.currency,
      value: fixtureData.market,
      lastUpdated: new Date(fixtureData.lastUpdated).getTime(),
    };

    return {
      currency: fixtureData.currency,
      market: fixtureData.market,
      low: fixtureData.low,
      mid: fixtureData.mid,
      high: fixtureData.high,
      sampleSize: fixtureData.sampleSize,
      lastUpdated: new Date(fixtureData.lastUpdated).getTime(),
      sources: [pricePoint],
    };
  }
}
