# MVP Scope: PokéPulse Collector Pro Edition

## Overview
PokéPulse is a mobile-first Pokémon TCG collectors tool designed for show-floor use. The MVP focuses on helping collectors quickly evaluate card deals by comparing asking prices against market data.

## Core User Flow
1. **Scan or Search** → Identify a card
2. **View Card Details** → See market pricing and deal analysis
3. **Evaluate Deal** → Get instant verdict (Good/Fair/Overpriced/Unknown)
4. **Add to Collection** → Track owned cards with metadata

## MVP Features (In Scope)

### 1. Card Scanning
- **Camera-based scanning** using device camera (web API)
- **Gemini AI vision** for card identification
- **Manual search fallback** by name, set, or number
- Returns card with confidence score

### 2. Card Database
- **Local card repository** with 16+ sample cards across 3 sets:
  - Base Set (6 cards)
  - Shining Fates (4 cards)
  - Silver Tempest (6 cards)
- Fast search by name, set, number, or rarity
- Real card images from pokemontcg.io

### 3. Market Pricing
- **Stubbed pricing providers** (TCGplayer, eBay)
- Uses local fixture data (no API keys required for MVP)
- Shows aggregated market value from multiple sources
- Displays price range (low/mid/high)
- Shows recent sold prices when available

### 4. Deal Intelligence
- **Automated deal evaluation**:
  - ≤80% of market = **Good Deal** (green)
  - ≤90% of market = **Fair Trade** (blue)
  - \>90% of market = **Overpriced** (red)
  - No data or stale = **Unknown** (gray)
- **Confidence scoring** based on:
  - Sample size (number of recent sales)
  - Number of data sources
  - Data freshness (24-hour threshold)
- **Deal targets** displayed at 80%, 85%, and 90% of market value
- Percentage above/below market shown

### 5. Collection Management
- **Add cards to collection** with metadata:
  - Quantity
  - Condition (NM, LP, MP, HP, DMG)
  - Status (Owned, Wanted, For Trade)
  - Acquisition price and date
  - Notes
- **View collection** filtered by status
- **Portfolio value** calculation
- Persists to localStorage (IndexedDB planned for future)

### 6. UI/UX
- **Mobile-first design** optimized for phone screens
- **Dark theme** with high contrast for show-floor visibility
- **Bottom navigation** with centered scan button
- **Instant feedback** with loading states
- **Offline-friendly** (data cached, graceful degradation)

## Explicitly Out of Scope (MVP)

### Not Included in MVP
- Real API integrations (TCGplayer, eBay, CardMarket)
- User authentication or cloud sync
- Deck building features
- Trade matching or marketplace
- Price history charts or trends
- Advanced filtering (by type, HP, attack, etc.)
- Bulk import/export of collections
- Multiple condition pricing per card
- Automated price updates/notifications
- Social features (sharing, profiles)

### Technical Limitations
- **Pricing data**: Stubbed with fixture files (not real-time)
- **Card database**: Limited to 16 cards (scalable architecture)
- **Scan accuracy**: Depends on Gemini AI (may require good lighting)
- **Persistence**: localStorage (not synchronized across devices)

## Success Criteria

### Must Have
- ✅ User can scan or search for a card
- ✅ User sees market price and deal analysis
- ✅ User can add cards to collection
- ✅ Deal evaluation works correctly per rules
- ✅ All core features work offline after initial load
- ✅ Tests pass and CI is green

### Nice to Have (Future)
- Real API integrations with rate limiting
- IndexedDB for better offline support
- Virtual scrolling for large collections
- Price history and trending indicators
- Barcode scanning for sealed products

## Data Sources

### Current (MVP)
- **Cards**: Local JSON fixtures (16 cards)
- **Prices**: Local JSON fixtures (TCGplayer, eBay simulated)
- **Images**: pokemontcg.io CDN (publicly available)

### Planned (Post-MVP)
- TCGplayer API (requires key and approval)
- eBay Finding API (for sold listings)
- Pokemon TCG API (for complete card database)
- CardMarket API (European pricing)

## Performance Targets
- Initial page load: <3s
- Card search: <500ms
- Scan to results: <5s
- Collection view: <1s for 100 cards
- Deal calculation: <100ms

## Browser Support
- Modern mobile browsers (Chrome, Safari, Firefox)
- Camera API support required for scanning
- JavaScript enabled
- LocalStorage available (minimum 5MB)

## Next Steps (Post-MVP)
See the main README or ARCHITECTURE.md for the roadmap to public beta.
