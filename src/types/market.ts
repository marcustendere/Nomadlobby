export interface CryptoAsset {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  circulating_supply: number;
  ath: number;
  atl: number;
  last_updated: string;
}

export interface OHLCVData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface FundingRate {
  symbol: string;
  fundingRate: number;
  fundingTime: number;
  markPrice: number;
}

export interface OpenInterest {
  symbol: string;
  openInterest: number;
  openInterestValue: number;
  timestamp: number;
}

export interface FibonacciLevel {
  level: number;
  price: number;
  label: string;
}

export interface TradingSignal {
  type: 'BUY' | 'SELL';
  price: number;
  volume: number;
  timestamp: number;
  strength: 'weak' | 'moderate' | 'strong';
  reason: string;
}

export interface MarketMetrics {
  asset: CryptoAsset;
  fundingRate?: FundingRate;
  openInterest?: OpenInterest;
  fibLevels: FibonacciLevel[];
  signals: TradingSignal[];
  ohlcv: OHLCVData[];
}

export const TRACKED_ASSETS = [
  { id: 'hyperliquid', symbol: 'HYPE', name: 'Hyperliquid' },
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
  { id: 'solana', symbol: 'SOL', name: 'Solana' },
  { id: 'ripple', symbol: 'XRP', name: 'Ripple' },
  { id: 'zcash', symbol: 'ZEC', name: 'Zcash' },
  { id: 'bitcoin-cash', symbol: 'BCH', name: 'Bitcoin Cash' },
  { id: 'core-dao', symbol: 'CC', name: 'Core' },
];
