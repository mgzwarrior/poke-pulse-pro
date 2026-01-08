# Pricing Logic: PokéPulse Deal Evaluation

## Overview
PokéPulse helps collectors make informed purchasing decisions by comparing asking prices against aggregated market data. This document explains how market values are determined and how deals are evaluated.

## Market Value Determination

### Data Sources (MVP)
The MVP uses **stubbed providers** with fixture data:

1. **TCGplayer** (`TcgplayerProviderStub`)
   - Simulates TCGplayer marketplace data
   - Provides: market price, low, mid, high, last sold
   - Sample sizes: 15-124 recent listings

2. **eBay Sold Listings** (`EbaySoldProviderStub`)
   - Simulates eBay completed auctions
   - Provides: sold average, low, high, last sold
   - Sample sizes: 8-56 recent sales

### Data Aggregation (`CompositePricingService`)

The composite service combines data from all providers using this algorithm:

```typescript
1. Fetch from all providers in parallel
2. Filter out failed providers (graceful degradation)
3. Extract market values:
   - Prefer soldAvg (actual transaction data)
   - Fall back to mid or market if soldAvg unavailable
4. Calculate median of all market values
5. Filter outliers (>50% deviation from median)
6. Calculate final market value (average of filtered values)
7. Determine aggregate low (minimum across all sources)
8. Determine aggregate high (maximum across all sources)
9. Calculate mid (average of low and high)
10. Sum sample sizes from all sources
11. Use most recent timestamp
```

### Example Calculation

**Charizard VMAX (SV107)**
- TCGplayer: market $95.50, sample 47
- eBay: soldAvg $94.50, sample 23

**Aggregation:**
```
Values: [95.50, 94.50]
Median: 95.00
Filtered: [95.50, 94.50] (both within 50% of median)
Market: (95.50 + 94.50) / 2 = $95.00
Low: min(88.00, 75.00) = $75.00
High: max(110.00, 125.00) = $125.00
Mid: (75.00 + 125.00) / 2 = $100.00
Sample Size: 47 + 23 = 70
```

**Result:**
```json
{
  "market": 95.00,
  "low": 75.00,
  "mid": 100.00,
  "high": 125.00,
  "soldAvg": 95.00,
  "sampleSize": 70,
  "sources": ["tcgplayer", "ebay"]
}
```

## Outlier Handling

### Why Filter Outliers?
- Prevents manipulation from single bad data point
- Reduces impact of regional price variations
- Handles currency conversion errors
- Filters obvious data entry mistakes

### Outlier Definition
A value is considered an outlier if:
```
|value - median| / median > 0.5
```

In other words, values more than **50% away from the median** are excluded.

### Example
```
Provider A: $100
Provider B: $105
Provider C: $300  ← Outlier (200% above median)

Median: $105
Filtered: [$100, $105]
Market: $102.50
```

### Edge Cases
- **Single provider**: No filtering (nothing to compare)
- **All outliers**: Use unfiltered median (fail-safe)
- **Two providers, both outliers**: Use average (benefit of doubt)

## Deal Evaluation Rules

### Thresholds
The deal evaluation engine (`services/deals.ts`) uses fixed percentage thresholds:

| Verdict | Condition | Color | Description |
|---------|-----------|-------|-------------|
| **Good** | ≤80% of market | Green | Deep value, buy immediately |
| **Fair** | ≤90% of market | Blue | Reasonable trade, acceptable |
| **Overpriced** | >90% of market | Red | Above market, negotiate or pass |
| **Unknown** | Invalid/stale data | Gray | Cannot evaluate, need more info |

### Calculation
```typescript
dealTargets = {
  pct80: market * 0.80,  // Good threshold
  pct85: market * 0.85,  // Great deal threshold
  pct90: market * 0.90   // Fair threshold
}

if (askingPrice <= dealTargets.pct80) {
  verdict = "Good"
} else if (askingPrice <= dealTargets.pct90) {
  verdict = "Fair"
} else {
  verdict = "Overpriced"
}
```

### Example: Base Set Charizard

**Market Value:** $350.00

**Deal Targets:**
- 80%: $280.00 (Good)
- 85%: $297.50 (Great)
- 90%: $315.00 (Fair)

**Scenarios:**
| Asking Price | Verdict | Savings | Reason |
|--------------|---------|---------|--------|
| $250 | **Good** | $100 (29%) | 29% below market |
| $280 | **Good** | $70 (20%) | Exactly at 80% threshold |
| $300 | **Fair** | $50 (14%) | Between 80-90% |
| $315 | **Fair** | $35 (10%) | Exactly at 90% threshold |
| $350 | **Overpriced** | $0 (0%) | At market value |
| $400 | **Overpriced** | -$50 (-14%) | 14% above market |

## Confidence Scoring

### Base Confidence
Every deal starts with a **base confidence of 0.7** (70%).

### Confidence Modifiers

**1. Sample Size Bonus (+0.2)**
- Triggered when `sampleSize > 10`
- Rationale: More data points = more reliable average
- Example: 50 sales vs. 3 sales

**2. Multiple Sources Bonus (+0.1)**
- Triggered when `sources.length > 1`
- Rationale: Cross-validation reduces provider bias
- Example: TCGplayer + eBay vs. TCGplayer alone

**3. Maximum Cap (1.0)**
- Confidence cannot exceed 100%
- Prevents over-confidence even with ideal data

### Confidence Formula
```typescript
confidence = 0.7  // Base

if (sampleSize > 10) {
  confidence += 0.2  // Large sample
}

if (sources.length > 1) {
  confidence += 0.1  // Multiple sources
}

confidence = Math.min(confidence, 1.0)  // Cap at 100%
```

### Confidence Levels

| Confidence | Sources | Sample Size | Interpretation |
|------------|---------|-------------|----------------|
| 0.7 | 1 | ≤10 | Moderate confidence, limited data |
| 0.8 | 2 | ≤10 | Good confidence, cross-validated |
| 0.9 | 1 | >10 | Good confidence, large sample |
| 1.0 | 2+ | >10 | Highest confidence, ideal conditions |

### Confidence Impact on UI
- **≥0.9**: Display as "High Confidence" (green check)
- **0.7-0.9**: Display as "Moderate Confidence" (yellow dot)
- **<0.7**: Display as "Low Confidence" (red warning)

## Data Staleness

### Freshness Threshold
Market data becomes **stale after 24 hours**.

### Rationale
- TCG prices can fluctuate daily (new releases, meta shifts)
- Weekend vs. weekday pricing varies
- Tournament results impact prices overnight
- Balance between freshness and cache efficiency

### Stale Data Handling
```typescript
const dataAge = Date.now() - marketSummary.lastUpdated;
const STALE_THRESHOLD = 24 * 60 * 60 * 1000;  // 24 hours

if (dataAge > STALE_THRESHOLD) {
  verdict = "Unknown"
  reason = `Market data is stale (${hoursOld}h old)`
  confidence = 0
}
```

### UI Display
- Show age indicator: "Updated 2h ago" (green)
- Warn if >12h: "Updated 15h ago" (yellow)
- Block if >24h: "Data is stale" (red)

## Missing or Invalid Data

### Unknown Verdict Triggers

**1. Missing Market Value**
```typescript
if (!market || market <= 0 || !isFinite(market)) {
  verdict = "Unknown"
  reason = "Market data unavailable"
}
```

**2. Invalid Asking Price**
```typescript
if (askingPrice < 0 || !isFinite(askingPrice)) {
  verdict = "Unknown"
  reason = "Invalid asking price"
}
```

**3. Stale Data**
```typescript
if (dataAge > 24 * 60 * 60 * 1000) {
  verdict = "Unknown"
  reason = "Market data is stale (Xh old)"
}
```

### Graceful Degradation
- If one provider fails, use remaining providers
- If all providers fail, show "No pricing data available"
- If Gemini scan fails, prompt manual search
- If card not found, suggest adding to wishlist

## UI Implementation

### DealIntelligence Component (Current)
Displays three color-coded tiers:
- **80% (Green)**: Deep Value - $X.XX
- **85% (Emerald)**: Great Deal - $X.XX
- **90% (Blue)**: Fair Trade - $X.XX

Shows buy signal: "Buy if under $X.XX"

### Future Enhancements
1. **Asking Price Input**
   - User enters seller's asking price
   - Live verdict updates as they type
   - Color-coded chip (Good/Fair/Overpriced)

2. **Confidence Indicator**
   - Badge showing confidence %
   - Tooltip explaining factors
   - Warning if low confidence

3. **Price History**
   - Sparkline chart of last 30 days
   - Highlight if price is rising/falling
   - Show % change from last week

4. **Negotiation Helper**
   - Suggest counter-offer price
   - Show % discount needed to hit "Good" threshold
   - Calculate total savings over time

## Testing

### Test Coverage
The deal engine (`deals.ts`) has **32 comprehensive tests**:

- ✅ Correct percentage calculations
- ✅ Rounding to 2 decimal places
- ✅ Good/Fair/Overpriced thresholds
- ✅ Missing market data handling
- ✅ Invalid asking price handling
- ✅ Stale data detection
- ✅ Confidence scoring logic
- ✅ Edge cases (zero, negative, infinity)

### Test Philosophy
Deal evaluation is a **pure function** (no side effects), making it:
- Deterministic (same input → same output)
- Easily testable (no mocks required)
- Predictable (no hidden state)
- Portable (can run anywhere)

## Real-World Examples

### Example 1: Tournament Staple Card
**Lugia V (Silver Tempest)**
- TCGplayer: $185.25, 31 sales
- Market: $185.25
- Deal targets: $148 / $157 / $167
- Scenario: Seller asks $150
- **Verdict**: Good (19% below market)
- **Confidence**: 90% (large sample)
- **Action**: Buy immediately

### Example 2: Common Card
**Pikachu (Base Set)**
- TCGplayer: $8.50, 100+ sales
- Market: $8.50
- Deal targets: $6.80 / $7.23 / $7.65
- Scenario: Seller asks $8.00
- **Verdict**: Fair (6% below market)
- **Confidence**: 100% (large sample)
- **Action**: Acceptable, not a steal

### Example 3: Rare Vintage Card
**Base Set Charizard**
- TCGplayer: $350, 124 sales
- eBay: $365, 56 sales
- Market: $357.50 (averaged)
- Deal targets: $286 / $304 / $322
- Scenario: Seller asks $400
- **Verdict**: Overpriced (12% above market)
- **Confidence**: 100% (multiple sources, large sample)
- **Action**: Negotiate down to $300 or pass

## Future Improvements

### Post-MVP Enhancements
1. **Dynamic thresholds** based on card rarity/value
2. **Condition adjustments** (NM vs. LP pricing)
3. **Regional pricing** (US vs. EU vs. JP)
4. **Trending indicators** (price rising/falling)
5. **Historical percentile** (is this a good time to buy?)
6. **Seller reputation** (adjust confidence)
7. **Shipping cost consideration**
8. **Currency conversion** (real-time rates)

### Advanced Features
- Machine learning for price prediction
- Anomaly detection for fake cards
- Portfolio optimization (best ROI cards)
- Alert system for price drops
- Automated buy/sell recommendations
