import { Card, MarketSummary } from '../../types';

/**
 * Interface for pricing data providers
 */
export interface PricingProvider {
  /**
   * Get market summary for a specific card
   */
  getMarketSummary(card: Card): Promise<MarketSummary>;

  /**
   * Provider name (e.g., 'tcgplayer', 'ebay')
   */
  getName(): string;
}
