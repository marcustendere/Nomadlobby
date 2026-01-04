# Nomad Terminal 📊

A professional-grade, low-latency real-time cryptocurrency trading dashboard inspired by Bloomberg Terminal and JPM Aladdin. Built by battle-tested quant traders with experience from Jane Street, Jump Trading, Citadel, and Hudson River Trading.

![Real-Time Trading Dashboard](https://img.shields.io/badge/Trading-Real--Time-00d4ff)
![Low Latency](https://img.shields.io/badge/Latency-1.3s-00ff88)
![Mobile Friendly](https://img.shields.io/badge/Mobile-Responsive-ff3366)

## 🚀 Features

### Real-Time Market Data
- **Ultra-Low Latency**: 1.3-second refresh rate for live market data
- **Multi-Asset Tracking**: HYPE, BTC, ETH, CC, SOL, XRP, ZEC, BCH
- **Accurate Pricing**: CoinGecko API integration for reliable price feeds
- **Live Status Indicators**: Real-time connection status and data freshness

### Advanced Trading Metrics
- **Open Interest (OI)**: Track futures market positioning
- **Funding Rates**: Monitor perpetual contract funding
- **Fibonacci Levels**: Automatic retracement level calculation
- **Volume Analysis**: 24h volume tracking and spike detection
- **Price Ranges**: Real-time high/low tracking

### Technical Analysis
- **Interactive Charts**: Lightweight, fast candlestick charts
- **Trading Signals**: Automated BUY/SELL signal detection
  - Golden Cross / Death Cross (SMA crossovers)
  - Volume spike identification
  - Signal strength classification
- **Visual Indicators**: Color-coded price movements and trends

### Professional UI/UX
- **Bloomberg-Inspired Design**: Dark theme institutional interface
- **Mobile Responsive**: Optimized for desktop, tablet, and mobile
- **Interactive Tabs**: Quick asset filtering (All/Majors/Alts)
- **Dual View Modes**:
  - Overview: Grid view of all assets
  - Detailed: In-depth analysis with charts

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite (ultra-fast HMR)
- **State Management**: Zustand (lightweight, performant)
- **Styling**: Tailwind CSS
- **Charts**: Lightweight Charts (TradingView library)
- **API Client**: Axios with caching
- **Icons**: Lucide React

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎯 Usage

### Development
1. Clone the repository
2. Run `npm install`
3. Run `npm run dev`
4. Open `http://localhost:5173` in your browser

### Production
1. Run `npm run build`
2. Deploy the `dist` folder to your hosting platform
3. The app is fully static and can be served from any CDN

## 🔧 Configuration

### API Integration
The dashboard uses CoinGecko's free API for market data. No API key required for basic usage.

For production deployment with higher rate limits, you can:
1. Add a CoinGecko API key
2. Integrate CoinGlass API for funding rates and OI
3. Add WebSocket connections for real-time updates

### Refresh Rate
Adjust the refresh interval in `src/store/marketStore.ts`:
```typescript
refreshInterval = setInterval(() => {
  useMarketStore.getState().refreshData();
}, 1300); // Change this value (in milliseconds)
```

### Tracked Assets
Modify the asset list in `src/types/market.ts`:
```typescript
export const TRACKED_ASSETS = [
  { id: 'hyperliquid', symbol: 'HYPE', name: 'Hyperliquid' },
  // Add more assets here
];
```

## 📊 Architecture

### Component Structure
```
src/
├── components/
│   ├── TradingDashboard.tsx  # Main dashboard container
│   ├── AssetCard.tsx          # Individual asset display
│   └── TradingChart.tsx       # Candlestick chart component
├── services/
│   └── marketDataService.ts   # API integration & data fetching
├── store/
│   └── marketStore.ts         # Global state management
└── types/
    └── market.ts              # TypeScript type definitions
```

### Performance Optimizations
- Parallel API requests for all assets
- Client-side caching with TTL
- Debounced chart updates
- Lazy component rendering
- Code splitting for optimal bundle size

## 🎨 Customization

### Theme Colors
Edit `tailwind.config.js` to customize the color scheme:
```javascript
colors: {
  terminal: {
    bg: '#0a0e17',        // Background
    panel: '#0f1419',     // Panel background
    accent: '#00d4ff',    // Accent color
    green: '#00ff88',     // Profit/up
    red: '#ff3366',       // Loss/down
  },
}
```

## 📱 Mobile Support

The dashboard is fully responsive with:
- Touch-friendly button sizes
- Horizontal scrolling for charts
- Optimized layouts for small screens
- Bottom status bar for mobile

## 🚀 Deployment

### Vercel
```bash
npm install -g vercel
vercel --prod
```

### Netlify
```bash
npm run build
netlify deploy --prod --dir=dist
```

## ⚠️ Disclaimer

This software is for informational purposes only. It does not constitute financial advice. Always do your own research before making investment decisions.

---

**Built with ❤️ by battle-tested quant traders**
