import { MarketSummary, DealTargets, DealVerdict, DealVerdictType } from '../types';

// Constants
const STALE_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Compute deal target prices at 80%, 85%, and 90% of market value
 * Values are rounded to 2 decimal places
 */
export function computeDealTargets(marketValue: number): DealTargets {
  if (marketValue <= 0 || !isFinite(marketValue)) {
    return {
      pct80: 0,
      pct85: 0,
      pct90: 0,
    };
  }

  return {
    pct80: Number((marketValue * 0.8).toFixed(2)),
    pct85: Number((marketValue * 0.85).toFixed(2)),
    pct90: Number((marketValue * 0.9).toFixed(2)),
  };
}

/**
 * Evaluate if an asking price is a good deal based on market data
 * Rules:
 * - Good: asking <= 80% of market
 * - Fair: asking <= 90% of market
 * - Overpriced: asking > 90% of market
 * - Unknown: market data is missing or stale
 */
export function evaluateDeal(
  askingPrice: number,
  market: MarketSummary
): DealVerdict & DealTargets {
  const targets = computeDealTargets(market.market);

  // Check for invalid inputs
  if (askingPrice < 0 || !isFinite(askingPrice)) {
    return {
      verdict: DealVerdictType.UNKNOWN,
      confidence: 0,
      reason: 'Invalid asking price',
      ...targets,
    };
  }

  // Check if market data is missing
  if (!market.market || market.market <= 0 || !isFinite(market.market)) {
    return {
      verdict: DealVerdictType.UNKNOWN,
      confidence: 0,
      reason: 'Market data unavailable',
      ...targets,
    };
  }

  // Check if market data is stale
  const now = Date.now();
  const dataAge = now - market.lastUpdated;
  if (dataAge > STALE_THRESHOLD_MS) {
    const hoursStale = Math.floor(dataAge / (60 * 60 * 1000));
    return {
      verdict: DealVerdictType.UNKNOWN,
      confidence: 0,
      reason: `Market data is stale (${hoursStale}h old)`,
      ...targets,
    };
  }

  // Compute confidence based on data quality
  let confidence = 0.7; // Base confidence
  
  if (market.sampleSize && market.sampleSize > 10) {
    confidence += 0.2;
  }
  
  if (market.sources && market.sources.length > 1) {
    confidence += 0.1;
  }
  
  confidence = Math.min(confidence, 1.0);

  // Evaluate deal
  if (askingPrice <= targets.pct80) {
    return {
      verdict: DealVerdictType.GOOD,
      confidence,
      reason: `Asking price is ${Math.round(((market.market - askingPrice) / market.market) * 100)}% below market value`,
      ...targets,
    };
  }

  if (askingPrice <= targets.pct90) {
    return {
      verdict: DealVerdictType.FAIR,
      confidence,
      reason: `Asking price is ${Math.round(((market.market - askingPrice) / market.market) * 100)}% below market value`,
      ...targets,
    };
  }

  const percentOver = Math.round(((askingPrice - market.market) / market.market) * 100);
  return {
    verdict: DealVerdictType.OVERPRICED,
    confidence,
    reason: percentOver > 0 
      ? `Asking price is ${percentOver}% above market value`
      : `Asking price is at market value`,
    ...targets,
  };
}
