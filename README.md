<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# PokéPulse: Collector Pro Edition

A mobile-first Pokémon TCG collectors tool designed for show-floor deal evaluation. Scan or search for cards, get instant market pricing, and evaluate deals with confidence.

[![CI](https://github.com/mgzwarrior/poke-pulse-pro/workflows/CI/badge.svg)](https://github.com/mgzwarrior/poke-pulse-pro/actions)
[![Tests](https://img.shields.io/badge/tests-70%20passing-success)](https://github.com/mgzwarrior/poke-pulse-pro)

## 🎯 Features

- **📸 Camera Scanning**: Identify cards using your device camera + Gemini AI
- **💰 Market Pricing**: Aggregated prices from multiple sources (TCGplayer, eBay)
- **🎯 Deal Intelligence**: Instant verdict (Good/Fair/Overpriced/Unknown)
- **📊 Collection Management**: Track owned cards with conditions and notes
- **🔍 Fast Search**: Search by card name, set, number, or rarity
- **📱 Mobile-First**: Optimized for phone screens and show-floor use
- **🌙 Dark Theme**: High contrast for visibility in any lighting
- **⚡ Offline-Friendly**: Works with cached data and graceful degradation

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Gemini API Key** (get one at [ai.google.dev](https://ai.google.dev/))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mgzwarrior/poke-pulse-pro.git
   cd poke-pulse-pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```bash
   GEMINI_API_KEY=your_api_key_here
   ```
   
   > **Note**: Get your free Gemini API key at [ai.google.dev](https://ai.google.dev/). The scanner feature requires this key.

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

## 📋 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server (port 3000) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |
| `npm run test:ui` | Open Vitest UI |
| `npm run lint` | Lint code with ESLint |
| `npm run lint:fix` | Auto-fix linting issues |
| `npm run format` | Format code with Prettier |
| `npm run typecheck` | Check TypeScript types |

## 🏗️ Project Structure

```
poke-pulse-pro/
├── components/           # React UI components
│   ├── CardDetails.tsx   # Card detail view
│   ├── Collection.tsx    # Collection manager
│   ├── DealIntelligence.tsx  # Deal analysis
│   └── Scanner.tsx       # Camera scanner
├── services/             # Business logic
│   ├── cards/            # Card repository
│   ├── pricing/          # Pricing providers
│   ├── deals.ts          # Deal evaluation engine
│   └── geminiService.ts  # Card scanning
├── docs/                 # Documentation
│   ├── MVP_SCOPE.md      # Feature scope
│   ├── ARCHITECTURE.md   # System design
│   └── PRICING.md        # Pricing logic
├── App.tsx               # Root component
├── types.ts              # TypeScript types
└── package.json          # Dependencies
```

## 📚 Documentation

- **[MVP Scope](./docs/MVP_SCOPE.md)** - Features in this release
- **[Architecture](./docs/ARCHITECTURE.md)** - System design and components
- **[Pricing Logic](./docs/PRICING.md)** - How deals are evaluated

## 🧪 Testing

This project has **70 comprehensive tests** covering:
- ✅ Deal evaluation engine (32 tests)
- ✅ Pricing providers (15 tests)
- ✅ Card repository (23 tests)

Run tests:
```bash
npm run test:run
```

Run tests with UI:
```bash
npm run test:ui
```

## 🎨 Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 6
- **Testing**: Vitest + React Testing Library
- **Styling**: Tailwind-like utility classes (inline)
- **AI**: Google Gemini 3 Flash (card identification)
- **Icons**: Lucide React
- **Linting**: ESLint + Prettier

## 📊 MVP Status

### ✅ Completed
- [x] Card scanning with camera + Gemini AI
- [x] Market pricing from multiple sources
- [x] Deal evaluation engine (Good/Fair/Overpriced)
- [x] Collection management (add/view/filter)
- [x] 16-card database across 3 sets
- [x] Responsive mobile UI
- [x] 70 passing tests
- [x] CI/CD pipeline

### 🚧 In Progress
- [ ] Virtualized lists for large collections
- [ ] IndexedDB for offline storage
- [ ] Set browsing UI

### 📅 Planned (Post-MVP)
- [ ] Real API integrations (TCGplayer, eBay)
- [ ] Price history and trends
- [ ] Barcode scanning for sealed products
- [ ] User authentication and cloud sync
- [ ] Advanced filtering and search

## 🎯 Deal Evaluation Rules

| Verdict | Condition | What It Means |
|---------|-----------|---------------|
| **Good** 🟢 | ≤80% of market | Deep value, buy immediately |
| **Fair** 🔵 | ≤90% of market | Reasonable trade, acceptable |
| **Overpriced** 🔴 | >90% of market | Above market, negotiate or pass |
| **Unknown** ⚪ | Invalid/stale data | Cannot evaluate, need more info |

## 🗂️ Card Database (MVP)

The MVP includes **16 cards** across **3 sets**:

- **Base Set** (6 cards): Charizard, Blastoise, Venusaur, Alakazam, Chansey, Pikachu
- **Shining Fates** (4 cards): Charizard VMAX, Shiny Charizard V, Ditto VMAX, Rowlet
- **Silver Tempest** (6 cards): Lugia V, Lugia VSTAR, Regieleki VMAX, Mewtwo V, Pikachu, Snivy

Price range: $0.25 - $350.00

## 🔒 What's Stubbed in MVP

For the MVP, the following are **simulated with local fixtures**:

- **Pricing APIs**: Using `fixtures/tcgplayer.sample.json` and `fixtures/ebay.sample.json`
- **Card Database**: 16 cards in-memory (scalable architecture ready for API)

These can be swapped for real APIs without changing the UI or domain logic.

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

This creates an optimized build in the `/dist` folder.

### Deploy to Vercel (Recommended)
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Set environment variable `GEMINI_API_KEY` in Vercel dashboard

### Deploy to Netlify
1. Run: `npm run build`
2. Drag `/dist` folder to Netlify drop zone
3. Set environment variable `GEMINI_API_KEY` in Netlify settings

### Deploy to GitHub Pages
```bash
npm run build
npx gh-pages -d dist
```

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Run tests (`npm run test:run`)
4. Run linter (`npm run lint`)
5. Commit changes (`git commit -m 'Add amazing feature'`)
6. Push to branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **Pokémon TCG** images from [pokemontcg.io](https://pokemontcg.io)
- **Google Gemini** for AI-powered card identification
- Built with the [AI Studio Repository Template](https://ai.studio/)

## 🐛 Known Issues

- Scanner requires good lighting for best results
- Camera access requires HTTPS in production
- Fixture data is not real-time (by design for MVP)

## 🔮 Roadmap to Public Beta

1. **Real API integrations** (TCGplayer, eBay, Pokemon TCG API)
2. **User authentication** (save collection to cloud)
3. **Advanced scanning** (barcode support for sealed products)
4. **More sets** (expand to 100+ cards)
5. **Rate limiting & caching** (optimize API usage)
6. **Price history charts** (trending indicators)
7. **PWA support** (installable app)

---

**Made with ❤️ for Pokémon TCG collectors**

View in AI Studio: https://ai.studio/apps/drive/11nQpKbB3gmoE7AddM7z1LWpsmqGL77tv
