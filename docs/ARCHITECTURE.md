# Architecture: PokéPulse Collector Pro

## Overview
PokéPulse follows a layered architecture with clear separation between UI components, business logic (services), and data models (types).

```
┌─────────────────────────────────────────┐
│           UI Components                  │
│  (App, Scanner, CardDetails,            │
│   Collection, DealIntelligence)         │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│          Services Layer                  │
│  - Card Repository (search, get)        │
│  - Pricing Providers (TCG, eBay)        │
│  - Composite Pricing Service            │
│  - Deal Evaluation Engine                │
│  - Gemini Vision (card scanning)        │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│          Domain Models                   │
│  (types.ts: Card, MarketSummary,        │
│   DealTargets, CollectionEntry, etc.)   │
└─────────────────────────────────────────┘
```

## Component Responsibilities

### UI Layer (`/components`)

#### **App.tsx** (Main Application)
- **Role**: Root component, state management, routing
- **State**:
  - Current view (home, collection, scanner, details, search)
  - Selected card
  - Collection items
  - Card cache (for performance)
- **Dependencies**: All components, cardDatabase service
- **Key Features**:
  - Bottom navigation
  - View switching
  - Portfolio value calculation
  - Collection persistence (localStorage)

#### **Scanner.tsx**
- **Role**: Camera-based card scanning
- **Dependencies**: geminiService, cardDatabase
- **Flow**:
  1. Access device camera
  2. Capture frame on button press
  3. Send to Gemini for identification
  4. Match against card database
  5. Return found card or error

#### **CardDetails.tsx**
- **Role**: Display card information and pricing
- **Props**: card, onBack, onAddToCollection
- **Dependencies**: DealIntelligence component
- **Displays**:
  - Card image and metadata
  - Market price and confidence
  - Deal analysis component
  - Price sources breakdown
  - Add to collection button

#### **DealIntelligence.tsx**
- **Role**: Show deal targets and buy signals
- **Props**: marketPrice
- **Logic**:
  - Calculates 80%, 85%, 90% thresholds
  - Displays as visual tiers
  - Shows buy signal threshold
- **Note**: Currently uses simple % calc; will integrate with deals.ts engine

#### **Collection.tsx**
- **Role**: Display and filter owned cards
- **Props**: items (collection), cards (cache)
- **Features**:
  - Filter by status (Owned, Wanted, For Trade)
  - Search within collection
  - Grid view with card images
  - Portfolio value summary
- **Future**: Will need virtualization for 100+ cards

### Services Layer (`/services`)

#### **Card Repository** (`/services/cards`)
- **Interface**: `CardRepository`
- **Implementation**: `InMemoryCardRepository`
- **Methods**:
  - `search(query)` - Search by name, set, number, rarity
  - `getSets()` - List all available sets
  - `getCardsBySet(setId)` - Get all cards in a set
  - `getCard(cardId)` - Get specific card
- **Data**: 16 cards in local array (easily swappable for API)
- **Performance**: ~150ms simulated latency

#### **Pricing Providers** (`/services/pricing`)
- **Interface**: `PricingProvider`
  - `getMarketSummary(card)` → `MarketSummary`
  - `getName()` → provider name
- **Implementations**:
  - `TcgplayerProviderStub` - Reads from fixtures/tcgplayer.sample.json
  - `EbaySoldProviderStub` - Reads from fixtures/ebay.sample.json
- **Fixtures**: JSON files with card-specific pricing data
- **Future**: Replace stubs with real API calls (keep interface)

#### **Composite Pricing Service** (`/services/pricing`)
- **Role**: Aggregate data from multiple providers
- **Algorithm**:
  1. Fetch from all providers in parallel
  2. Prefer soldAvg (actual transaction data) over mid/market
  3. Filter outliers (>50% deviation from median)
  4. Calculate combined low/mid/high/market
  5. Sum sample sizes
  6. Use most recent timestamp
- **Returns**: Single `MarketSummary` with all sources

#### **Deal Evaluation Engine** (`/services/deals.ts`)
- **Pure Functions** (no side effects, fully tested):
  - `computeDealTargets(marketValue)` → `DealTargets`
  - `evaluateDeal(askingPrice, market)` → `DealVerdict & DealTargets`
- **Rules**:
  - Good: askingPrice ≤ 80% of market
  - Fair: askingPrice ≤ 90% of market
  - Overpriced: askingPrice > 90% of market
  - Unknown: missing/stale/invalid data
- **Confidence Scoring**:
  - Base: 0.7
  - +0.2 if sampleSize > 10
  - +0.1 if multiple sources
  - Capped at 1.0
- **Staleness**: Data older than 24h = Unknown verdict

#### **Gemini Service** (`/services/geminiService.ts`)
- **Role**: Card identification from images
- **API**: Google Gemini 3 Flash (vision model)
- **Input**: Base64 JPEG image
- **Output**: `ScanResult` (name, set, number, confidence)
- **Config**: Requires `GEMINI_API_KEY` in `.env.local`

#### **Card Database** (`/services/cardDatabase.ts`)
- **Role**: Legacy adapter for backward compatibility
- **Delegates to**: `cardRepository` (InMemoryCardRepository)
- **Functions**: searchCards, getCardById, getCardByDetails

### Domain Models (`/types.ts`)

#### Core Types
- **CardId**: Unique identifier (setId, number, variant?, language?)
- **Card**: Complete card data (id, name, setName, images, etc.)
- **PricePoint**: Single price from one source
- **MarketSummary**: Aggregated market data
- **DealTargets**: Price thresholds (pct80, pct85, pct90)
- **DealVerdict**: Evaluation result (verdict, confidence, reason)
- **CollectionEntry**: Owned card with metadata

#### Legacy Types (Backward Compatibility)
- **PokemonCard**: Original card interface (used by existing UI)
- **CardPrice**: Original price interface
- **CollectionItem**: Original collection interface
- **ScanResult**: Gemini scan output

### Data Flow Examples

#### Scan Flow
```
User → Scanner.captureAndScan()
  → geminiService.identifyCardFromImage(base64)
  → cardDatabase.getCardByDetails(name, set, number)
  → cardRepository.search(name)
  → onCardFound(card)
  → App sets selectedCard, changes view to 'details'
```

#### Pricing Flow
```
CardDetails receives card prop
  → DealIntelligence receives card.marketPrice
  → Computes 80/85/90% targets
  → Displays visual tiers and buy signals
```

#### Deal Evaluation (Future Integration)
```
User enters asking price in CardDetails
  → CompositePricingService.getMarketSummary(card)
  → deals.evaluateDeal(askingPrice, marketSummary)
  → Display verdict chip (Good/Fair/Overpriced)
  → Show confidence and reason
```

#### Collection Flow
```
User clicks "Add to Collection" in CardDetails
  → App.addToCollection(status)
  → Creates CollectionItem with metadata
  → Adds to collection state
  → Saves to localStorage
  → Navigates to Collection view
```

## State Management

### Current: Component State (useState)
- **Pros**: Simple, no dependencies, easy to understand
- **Cons**: Not scalable beyond ~1000 cards
- **Storage**: localStorage (JSON serialization)

### Future: Consider
- IndexedDB for larger collections (via Dexie.js)
- React Context for global state (theme, user prefs)
- Zustand or Jotai for lightweight state management

## Testing Strategy

### Unit Tests (Vitest)
- ✅ Deal engine (`deals.test.ts`) - 32 tests
- ✅ Pricing providers (`pricing.test.ts`) - 15 tests
- ✅ Card repository (`cards.test.ts`) - 23 tests
- Total: **70 tests**

### Test Philosophy
- Pure functions are fully tested
- Service stubs have high coverage
- UI components tested in future (React Testing Library)

### CI/CD
- GitHub Actions on every PR
- Steps: install → lint → typecheck → test → build
- Branch protection on `main` requires passing checks

## Performance Considerations

### Current Optimizations
- Simulated latency keeps UI responsive
- Card cache in App state (avoids re-fetching)
- localStorage for collection (instant load)

### Planned Optimizations
- **Virtualization**: react-window for lists (100+ cards)
- **IndexedDB**: Structured storage with indexes
- **Service Worker**: Offline support and caching
- **Code splitting**: Lazy load Scanner component
- **Image lazy loading**: Only load visible cards

## Security & Privacy

### Current
- No authentication (local-only app)
- No user data sent to servers (except Gemini for scanning)
- Fixture data is public (no secrets)

### Future
- API keys stored securely (not in code)
- Rate limiting for API calls
- Input validation on all user-entered data
- CSP headers for XSS protection

## Extensibility Points

### Adding a New Pricing Provider
1. Implement `PricingProvider` interface
2. Create fixture file or API client
3. Add to `CompositePricingService` providers array
4. Write tests

### Adding a New Card Set
1. Add set to `SETS` array in `InMemoryCardRepository`
2. Add cards to `CARDS` array with proper `id` prefix
3. Add fixture prices if using specific pricing data
4. Update tests if needed

### Replacing Stubs with Real APIs
1. Keep `PricingProvider` interface unchanged
2. Implement new class (e.g., `TcgplayerApiClient`)
3. Swap in `CompositePricingService` constructor
4. Add API key configuration
5. Add rate limiting and error handling

## Dependencies

### Runtime
- `react` + `react-dom` (UI framework)
- `lucide-react` (icon library)
- `@google/genai` (Gemini API client)

### Development
- `vite` (bundler and dev server)
- `typescript` (type safety)
- `vitest` (test runner)
- `@testing-library/react` (component testing)
- `eslint` + `prettier` (code quality)

### Future
- `dexie` (IndexedDB wrapper)
- `react-window` (virtualization)
- `axios` or `ky` (HTTP client for APIs)

## File Structure
```
poke-pulse-pro/
├── .github/
│   └── workflows/
│       └── ci.yml                 # GitHub Actions CI
├── components/
│   ├── CardDetails.tsx            # Card detail view
│   ├── Collection.tsx             # Collection management
│   ├── DealIntelligence.tsx       # Deal analysis display
│   └── Scanner.tsx                # Camera-based scanning
├── docs/
│   ├── ARCHITECTURE.md            # This file
│   ├── MVP_SCOPE.md               # Feature scope
│   └── PRICING.md                 # Pricing logic
├── services/
│   ├── cards/
│   │   ├── CardRepository.ts      # Repository interface
│   │   ├── InMemoryCardRepository.ts  # Mock implementation
│   │   └── cards.test.ts          # Repository tests
│   ├── pricing/
│   │   ├── fixtures/
│   │   │   ├── tcgplayer.sample.json  # TCGplayer prices
│   │   │   └── ebay.sample.json       # eBay sold prices
│   │   ├── PricingProvider.ts     # Provider interface
│   │   ├── TcgplayerProviderStub.ts   # TCGplayer stub
│   │   ├── EbaySoldProviderStub.ts    # eBay stub
│   │   ├── CompositePricingService.ts # Aggregator
│   │   └── pricing.test.ts        # Pricing tests
│   ├── cardDatabase.ts            # Legacy adapter
│   ├── deals.ts                   # Deal evaluation engine
│   ├── deals.test.ts              # Deal tests
│   └── geminiService.ts           # Card scanning
├── App.tsx                        # Root component
├── types.ts                       # Domain models
├── vite.config.ts                 # Build config
├── vitest.config.ts               # Test config
├── tsconfig.json                  # TypeScript config
├── .eslintrc.json                 # ESLint config
├── .prettierrc.json               # Prettier config
└── package.json                   # Dependencies
```

## Deployment

### Current: Static Build
- `npm run build` → `/dist` folder
- Deploy to Vercel, Netlify, GitHub Pages, etc.
- No server required (JAMstack)

### Environment Variables
- `GEMINI_API_KEY` - Required for scanning feature
- Set in `.env.local` (not committed)

### Future: Progressive Web App (PWA)
- Add service worker
- Add manifest.json
- Enable "Add to Home Screen"
- Offline-first architecture
