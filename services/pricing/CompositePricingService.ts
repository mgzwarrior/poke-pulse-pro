import { Card, MarketSummary, PricePoint } from '../../types';
import { PricingProvider } from './PricingProvider';

/**
 * Composite pricing service that aggregates data from multiple providers
 * Uses a simple heuristic to combine sources:
 * - Prefers soldAvg if available (actual transaction data)
 * - Falls back to mid/market prices
 * - Filters obvious outliers (more than 50% deviation from median)
 * - Combines all sources into a single summary
 */
export class CompositePricingService {
  private providers: PricingProvider[];

  constructor(providers: PricingProvider[]) {
    this.providers = providers;
  }

  /**
   * Get aggregated market summary from all providers
   */
  async getMarketSummary(card: Card): Promise<MarketSummary> {
    // Fetch from all providers in parallel
    const summaries = await Promise.all(
      this.providers.map(provider =>
        provider
          .getMarketSummary(card)
          .catch(err => {
            console.warn(`Provider ${provider.getName()} failed:`, err);
            return null;
          })
      )
    );

    // Filter out failed providers
    const validSummaries = summaries.filter((s): s is MarketSummary => s !== null);

    if (validSummaries.length === 0) {
      throw new Error('No pricing data available from any provider');
    }

    // Collect all price points
    const allPricePoints: PricePoint[] = validSummaries.flatMap(s => s.sources);

    // Extract market values, preferring soldAvg
    const marketValues = validSummaries.map(s => s.soldAvg || s.mid || s.market);

    // Filter outliers (values more than 50% away from median)
    const median = this.calculateMedian(marketValues);
    const filteredValues = marketValues.filter(
      v => Math.abs(v - median) / median <= 0.5
    );

    // Calculate aggregated values
    const market = this.calculateAverage(filteredValues);
    const low = Math.min(...validSummaries.map(s => s.low || s.market));
    const high = Math.max(...validSummaries.map(s => s.high || s.market));

    // Calculate mid (average of low and high)
    const mid = (low + high) / 2;

    // Get soldAvg if any provider has it
    const soldAvgs = validSummaries
      .filter(s => s.soldAvg !== undefined)
      .map(s => s.soldAvg!);
    const soldAvg = soldAvgs.length > 0 ? this.calculateAverage(soldAvgs) : undefined;

    // Sum sample sizes
    const totalSampleSize = validSummaries.reduce(
      (sum, s) => sum + (s.sampleSize || 0),
      0
    );

    // Use most recent timestamp
    const mostRecentUpdate = Math.max(...validSummaries.map(s => s.lastUpdated));

    // Use currency from first provider (assume all same currency)
    const currency = validSummaries[0].currency;

    return {
      currency,
      market: Number(market.toFixed(2)),
      low: Number(low.toFixed(2)),
      mid: Number(mid.toFixed(2)),
      high: Number(high.toFixed(2)),
      soldAvg: soldAvg ? Number(soldAvg.toFixed(2)) : undefined,
      sampleSize: totalSampleSize > 0 ? totalSampleSize : undefined,
      lastUpdated: mostRecentUpdate,
      sources: allPricePoints,
    };
  }

  private calculateMedian(values: number[]): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }

  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, v) => sum + v, 0) / values.length;
  }
}
