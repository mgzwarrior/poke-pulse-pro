import { describe, it, expect } from 'vitest';
import { computeDealTargets, evaluateDeal } from './deals';
import { DealVerdictType, MarketSummary } from '../types';

describe('computeDealTargets', () => {
  it('should compute correct percentages for a typical market value', () => {
    const result = computeDealTargets(100);
    expect(result.pct80).toBe(80);
    expect(result.pct85).toBe(85);
    expect(result.pct90).toBe(90);
  });

  it('should round to 2 decimal places', () => {
    const result = computeDealTargets(99.99);
    expect(result.pct80).toBe(79.99);
    expect(result.pct85).toBe(84.99);
    expect(result.pct90).toBe(89.99);
  });

  it('should handle fractional values correctly', () => {
    const result = computeDealTargets(33.33);
    expect(result.pct80).toBe(26.66);
    expect(result.pct85).toBe(28.33);
    expect(result.pct90).toBe(30.0);
  });

  it('should return zeros for negative market value', () => {
    const result = computeDealTargets(-10);
    expect(result.pct80).toBe(0);
    expect(result.pct85).toBe(0);
    expect(result.pct90).toBe(0);
  });

  it('should return zeros for zero market value', () => {
    const result = computeDealTargets(0);
    expect(result.pct80).toBe(0);
    expect(result.pct85).toBe(0);
    expect(result.pct90).toBe(0);
  });

  it('should handle infinity', () => {
    const result = computeDealTargets(Infinity);
    expect(result.pct80).toBe(0);
    expect(result.pct85).toBe(0);
    expect(result.pct90).toBe(0);
  });
});

describe('evaluateDeal', () => {
  const createMarketSummary = (overrides: Partial<MarketSummary> = {}): MarketSummary => ({
    currency: 'USD',
    market: 100,
    low: 80,
    mid: 100,
    high: 120,
    lastUpdated: Date.now(),
    sources: [],
    ...overrides,
  });

  describe('verdict evaluation', () => {
    it('should return GOOD verdict when asking price <= 80% of market', () => {
      const market = createMarketSummary();
      const result = evaluateDeal(80, market);
      expect(result.verdict).toBe(DealVerdictType.GOOD);
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('should return GOOD verdict when asking price is exactly 80%', () => {
      const market = createMarketSummary({ market: 100 });
      const result = evaluateDeal(80, market);
      expect(result.verdict).toBe(DealVerdictType.GOOD);
    });

    it('should return FAIR verdict when asking price > 80% but <= 90%', () => {
      const market = createMarketSummary({ market: 100 });
      const result = evaluateDeal(85, market);
      expect(result.verdict).toBe(DealVerdictType.FAIR);
    });

    it('should return FAIR verdict when asking price is exactly 90%', () => {
      const market = createMarketSummary({ market: 100 });
      const result = evaluateDeal(90, market);
      expect(result.verdict).toBe(DealVerdictType.FAIR);
    });

    it('should return OVERPRICED verdict when asking price > 90%', () => {
      const market = createMarketSummary({ market: 100 });
      const result = evaluateDeal(95, market);
      expect(result.verdict).toBe(DealVerdictType.OVERPRICED);
    });

    it('should return OVERPRICED verdict when asking price equals market value', () => {
      const market = createMarketSummary({ market: 100 });
      const result = evaluateDeal(100, market);
      expect(result.verdict).toBe(DealVerdictType.OVERPRICED);
    });

    it('should return OVERPRICED verdict when asking price exceeds market value', () => {
      const market = createMarketSummary({ market: 100 });
      const result = evaluateDeal(150, market);
      expect(result.verdict).toBe(DealVerdictType.OVERPRICED);
    });
  });

  describe('missing or invalid data', () => {
    it('should return UNKNOWN verdict when market value is missing', () => {
      const market = createMarketSummary({ market: 0 });
      const result = evaluateDeal(50, market);
      expect(result.verdict).toBe(DealVerdictType.UNKNOWN);
      expect(result.confidence).toBe(0);
      expect(result.reason).toContain('unavailable');
    });

    it('should return UNKNOWN verdict when market value is negative', () => {
      const market = createMarketSummary({ market: -10 });
      const result = evaluateDeal(50, market);
      expect(result.verdict).toBe(DealVerdictType.UNKNOWN);
      expect(result.confidence).toBe(0);
    });

    it('should return UNKNOWN verdict when asking price is negative', () => {
      const market = createMarketSummary();
      const result = evaluateDeal(-10, market);
      expect(result.verdict).toBe(DealVerdictType.UNKNOWN);
      expect(result.confidence).toBe(0);
      expect(result.reason).toContain('Invalid');
    });

    it('should return UNKNOWN verdict when asking price is Infinity', () => {
      const market = createMarketSummary();
      const result = evaluateDeal(Infinity, market);
      expect(result.verdict).toBe(DealVerdictType.UNKNOWN);
      expect(result.confidence).toBe(0);
    });

    it('should return UNKNOWN verdict when market value is Infinity', () => {
      const market = createMarketSummary({ market: Infinity });
      const result = evaluateDeal(50, market);
      expect(result.verdict).toBe(DealVerdictType.UNKNOWN);
      expect(result.confidence).toBe(0);
    });
  });

  describe('stale data handling', () => {
    it('should return UNKNOWN verdict when data is older than 24 hours', () => {
      const oneDayAgo = Date.now() - 25 * 60 * 60 * 1000; // 25 hours ago
      const market = createMarketSummary({ lastUpdated: oneDayAgo });
      const result = evaluateDeal(80, market);
      expect(result.verdict).toBe(DealVerdictType.UNKNOWN);
      expect(result.reason).toContain('stale');
    });

    it('should accept data that is less than 24 hours old', () => {
      const oneHourAgo = Date.now() - 1 * 60 * 60 * 1000; // 1 hour ago
      const market = createMarketSummary({ lastUpdated: oneHourAgo });
      const result = evaluateDeal(80, market);
      expect(result.verdict).toBe(DealVerdictType.GOOD);
    });

    it('should accept data that is exactly at the threshold', () => {
      const exactlyOneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      const market = createMarketSummary({ lastUpdated: exactlyOneDayAgo });
      const result = evaluateDeal(80, market);
      expect(result.verdict).toBe(DealVerdictType.GOOD);
    });
  });

  describe('confidence scoring', () => {
    it('should have base confidence of 0.7', () => {
      const market = createMarketSummary();
      const result = evaluateDeal(80, market);
      expect(result.confidence).toBeGreaterThanOrEqual(0.7);
    });

    it('should increase confidence with large sample size', () => {
      const market = createMarketSummary({ sampleSize: 20 });
      const result = evaluateDeal(80, market);
      expect(result.confidence).toBeCloseTo(0.9, 1);
    });

    it('should increase confidence with multiple sources', () => {
      const market = createMarketSummary({
        sources: [
          { source: 'tcgplayer', currency: 'USD', value: 100, lastUpdated: Date.now() },
          { source: 'ebay', currency: 'USD', value: 102, lastUpdated: Date.now() },
        ],
      });
      const result = evaluateDeal(80, market);
      expect(result.confidence).toBeCloseTo(0.8, 1);
    });

    it('should cap confidence at 1.0', () => {
      const market = createMarketSummary({
        sampleSize: 50,
        sources: [
          { source: 'tcgplayer', currency: 'USD', value: 100, lastUpdated: Date.now() },
          { source: 'ebay', currency: 'USD', value: 102, lastUpdated: Date.now() },
        ],
      });
      const result = evaluateDeal(80, market);
      expect(result.confidence).toBeCloseTo(1.0, 1);
    });
  });

  describe('deal targets inclusion', () => {
    it('should include deal targets in the result', () => {
      const market = createMarketSummary({ market: 100 });
      const result = evaluateDeal(85, market);
      expect(result.pct80).toBe(80);
      expect(result.pct85).toBe(85);
      expect(result.pct90).toBe(90);
    });
  });

  describe('reason messages', () => {
    it('should provide clear reason for good deals', () => {
      const market = createMarketSummary({ market: 100 });
      const result = evaluateDeal(70, market);
      expect(result.reason).toContain('below market');
    });

    it('should provide clear reason for overpriced deals', () => {
      const market = createMarketSummary({ market: 100 });
      const result = evaluateDeal(120, market);
      expect(result.reason).toContain('above market');
    });

    it('should provide clear reason for unknown deals', () => {
      const market = createMarketSummary({ market: 0 });
      const result = evaluateDeal(50, market);
      expect(result.reason).toContain('unavailable');
    });
  });

  describe('edge cases', () => {
    it('should handle very small market values', () => {
      const market = createMarketSummary({ market: 0.01 });
      const result = evaluateDeal(0.008, market);
      expect(result.verdict).toBe(DealVerdictType.GOOD);
    });

    it('should handle very large market values', () => {
      const market = createMarketSummary({ market: 10000 });
      const result = evaluateDeal(8000, market);
      expect(result.verdict).toBe(DealVerdictType.GOOD);
    });

    it('should handle asking price of 0', () => {
      const market = createMarketSummary({ market: 100 });
      const result = evaluateDeal(0, market);
      expect(result.verdict).toBe(DealVerdictType.GOOD);
    });
  });
});
