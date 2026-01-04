// Core Types
export interface Asset {
  id: string;
  symbol: string;
  name: string;
  image?: string;
}

// Market Data
export interface MarketData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d: number;
  price_change_percentage_30d: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  last_updated: string;
  sparkline_in_7d?: {
    price: number[];
  };
}

// OHLCV Candlestick Data
export interface OHLCV {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Technical Indicators
export interface TechnicalIndicators {
  rsi: number;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
  };
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
  };
  ema: {
    ema12: number;
    ema26: number;
    ema50: number;
    ema200: number;
  };
  sma: {
    sma20: number;
    sma50: number;
    sma100: number;
    sma200: number;
  };
  volumeProfile: {
    avgVolume: number;
    volumeChange: number;
    volumeTrend: 'increasing' | 'decreasing' | 'stable';
  };
}

// Trading Signal
export interface TradingSignal {
  type: 'BUY' | 'SELL' | 'HOLD';
  strength: 'very_weak' | 'weak' | 'moderate' | 'strong' | 'very_strong';
  confidence: number; // 0-100
  price: number;
  timestamp: number;
  indicators: {
    name: string;
    value: string;
    signal: 'bullish' | 'bearish' | 'neutral';
  }[];
  reasoning: string;
}

// Order Book
export interface OrderBookEntry {
  price: number;
  amount: number;
  total: number;
}

export interface OrderBook {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  spread: number;
  spreadPercentage: number;
}

// Market Sentiment
export interface MarketSentiment {
  fearGreedIndex: number; // 0-100
  fearGreedLabel: 'Extreme Fear' | 'Fear' | 'Neutral' | 'Greed' | 'Extreme Greed';
  socialVolume: number;
  socialSentiment: 'positive' | 'negative' | 'neutral';
  newssentiment: 'positive' | 'negative' | 'neutral';
}

// Fibonacci Levels
export interface FibonacciLevel {
  level: number;
  price: number;
  label: string;
  type: 'support' | 'resistance';
}

// Funding Rate
export interface FundingRate {
  symbol: string;
  rate: number;
  nextFundingTime: number;
  predictedRate: number;
  markPrice: number;
}

// Open Interest
export interface OpenInterest {
  symbol: string;
  openInterest: number;
  openInterestValue: number;
  change24h: number;
  changePercentage24h: number;
  timestamp: number;
}

// Liquidation Data
export interface LiquidationData {
  symbol: string;
  side: 'long' | 'short';
  amount: number;
  value: number;
  timestamp: number;
}

// Market Statistics
export interface MarketStats {
  dominance: number;
  totalMarketCap: number;
  total24hVolume: number;
  defiMarketCap: number;
  defiDominance: number;
  ethDominance: number;
  activeCryptocurrencies: number;
}

// Complete Market Metrics
export interface CompleteMarketMetrics {
  asset: MarketData;
  ohlcv: OHLCV[];
  technicalIndicators: TechnicalIndicators;
  signals: TradingSignal[];
  fibonacciLevels: FibonacciLevel[];
  fundingRate?: FundingRate;
  openInterest?: OpenInterest;
  orderBook?: OrderBook;
  sentiment?: MarketSentiment;
  liquidations?: LiquidationData[];
}

// Timeframe
export type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w' | '1M';

// Chart Type
export type ChartType = 'candlestick' | 'line' | 'area' | 'heikinashi';

// Tracked Assets
export const TRACKED_ASSETS: Asset[] = [
  { id: 'hyperliquid', symbol: 'HYPE', name: 'Hyperliquid' },
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
  { id: 'solana', symbol: 'SOL', name: 'Solana' },
  { id: 'ripple', symbol: 'XRP', name: 'Ripple' },
  { id: 'zcash', symbol: 'ZEC', name: 'Zcash' },
  { id: 'bitcoin-cash', symbol: 'BCH', name: 'Bitcoin Cash' },
  { id: 'core-dao', symbol: 'CC', name: 'Core' },
];

// API Response Types
export interface CoinGeckoMarketResponse extends MarketData {}

export interface CoinGeckoOHLCResponse extends Array<[number, number, number, number, number]> {}
