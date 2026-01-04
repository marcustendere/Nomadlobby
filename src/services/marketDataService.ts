import axios from 'axios';
import type { CryptoAsset, OHLCVData, FundingRate, OpenInterest, TradingSignal } from '../types/market';
import { TRACKED_ASSETS } from '../types/market';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

// CoinGecko API client
const coinGeckoClient = axios.create({
  baseURL: COINGECKO_API,
  timeout: 10000,
  headers: {
    'Accept': 'application/json',
  },
});

// Cache for reducing API calls
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();
const CACHE_DURATION = 1000; // 1 second cache

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_DURATION) {
    return entry.data;
  }
  return null;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

/**
 * Fetch current market data for all tracked assets
 */
export async function fetchMarketData(): Promise<CryptoAsset[]> {
  const cacheKey = 'market_data';
  const cached = getCached<CryptoAsset[]>(cacheKey);
  if (cached) return cached;

  try {
    const ids = TRACKED_ASSETS.map(a => a.id).join(',');
    const response = await coinGeckoClient.get('/coins/markets', {
      params: {
        vs_currency: 'usd',
        ids,
        order: 'market_cap_desc',
        per_page: 10,
        page: 1,
        sparkline: false,
        price_change_percentage: '24h',
      },
    });

    const data: CryptoAsset[] = response.data;
    setCache(cacheKey, data);
    return data;
  } catch (error) {
    console.error('Error fetching market data:', error);
    // Return cached data if available, even if expired
    const staleCache = cache.get(cacheKey);
    if (staleCache) return staleCache.data;

    // Return mock data as fallback
    return TRACKED_ASSETS.map((asset, i) => ({
      id: asset.id,
      symbol: asset.symbol.toUpperCase(),
      name: asset.name,
      current_price: 50000 - i * 5000,
      price_change_24h: Math.random() * 1000 - 500,
      price_change_percentage_24h: Math.random() * 10 - 5,
      market_cap: 1000000000 - i * 100000000,
      total_volume: 50000000 - i * 5000000,
      high_24h: 52000 - i * 5000,
      low_24h: 48000 - i * 5000,
      circulating_supply: 19000000,
      ath: 69000,
      atl: 3000,
      last_updated: new Date().toISOString(),
    }));
  }
}

/**
 * Fetch OHLCV data for charting
 */
export async function fetchOHLCVData(coinId: string, days: number = 1): Promise<OHLCVData[]> {
  const cacheKey = `ohlcv_${coinId}_${days}`;
  const cached = getCached<OHLCVData[]>(cacheKey);
  if (cached) return cached;

  try {
    const response = await coinGeckoClient.get(`/coins/${coinId}/ohlc`, {
      params: {
        vs_currency: 'usd',
        days,
      },
    });

    const data: OHLCVData[] = response.data.map((item: number[]) => ({
      time: item[0] / 1000, // Convert to seconds
      open: item[1],
      high: item[2],
      low: item[3],
      close: item[4],
      volume: 0, // CoinGecko OHLC doesn't include volume in this endpoint
    }));

    setCache(cacheKey, data);
    return data;
  } catch (error) {
    console.error(`Error fetching OHLCV data for ${coinId}:`, error);

    // Generate realistic mock data
    const now = Date.now() / 1000;
    const interval = (days * 24 * 60 * 60) / 100; // 100 candles
    const basePrice = 50000;

    return Array.from({ length: 100 }, (_, i) => {
      const time = now - (100 - i) * interval;
      const volatility = basePrice * 0.02;
      const trend = Math.sin(i / 10) * volatility;
      const open = basePrice + trend + (Math.random() - 0.5) * volatility;
      const close = open + (Math.random() - 0.5) * volatility;
      const high = Math.max(open, close) + Math.random() * volatility * 0.5;
      const low = Math.min(open, close) - Math.random() * volatility * 0.5;

      return {
        time,
        open,
        high,
        low,
        close,
        volume: Math.random() * 1000000,
      };
    });
  }
}

/**
 * Fetch funding rates (from CoinGlass or mock data)
 */
export async function fetchFundingRates(): Promise<Map<string, FundingRate>> {
  const cacheKey = 'funding_rates';
  const cached = getCached<Map<string, FundingRate>>(cacheKey);
  if (cached) return cached;

  try {
    // Note: CoinGlass API requires API key for most endpoints
    // Using mock data for now
    const rates = new Map<string, FundingRate>();

    TRACKED_ASSETS.forEach(asset => {
      rates.set(asset.symbol, {
        symbol: asset.symbol,
        fundingRate: (Math.random() - 0.5) * 0.001, // -0.05% to 0.05%
        fundingTime: Date.now() + 8 * 60 * 60 * 1000, // Next funding in 8h
        markPrice: 50000 + Math.random() * 10000,
      });
    });

    setCache(cacheKey, rates);
    return rates;
  } catch (error) {
    console.error('Error fetching funding rates:', error);
    return new Map();
  }
}

/**
 * Fetch open interest data
 */
export async function fetchOpenInterest(): Promise<Map<string, OpenInterest>> {
  const cacheKey = 'open_interest';
  const cached = getCached<Map<string, OpenInterest>>(cacheKey);
  if (cached) return cached;

  try {
    // Mock data - in production, integrate with CoinGlass API
    const oi = new Map<string, OpenInterest>();

    TRACKED_ASSETS.forEach(asset => {
      oi.set(asset.symbol, {
        symbol: asset.symbol,
        openInterest: Math.random() * 100000,
        openInterestValue: Math.random() * 5000000000,
        timestamp: Date.now(),
      });
    });

    setCache(cacheKey, oi);
    return oi;
  } catch (error) {
    console.error('Error fetching open interest:', error);
    return new Map();
  }
}

/**
 * Fetch detailed coin data
 */
export async function fetchCoinDetails(coinId: string) {
  try {
    const response = await coinGeckoClient.get(`/coins/${coinId}`, {
      params: {
        localization: false,
        tickers: false,
        market_data: true,
        community_data: false,
        developer_data: false,
      },
    });

    return response.data;
  } catch (error) {
    console.error(`Error fetching details for ${coinId}:`, error);
    return null;
  }
}

/**
 * Calculate Fibonacci retracement levels
 */
export function calculateFibonacciLevels(high: number, low: number) {
  const diff = high - low;
  const levels = [
    { level: 0, price: high, label: '0% (High)' },
    { level: 0.236, price: high - diff * 0.236, label: '23.6%' },
    { level: 0.382, price: high - diff * 0.382, label: '38.2%' },
    { level: 0.5, price: high - diff * 0.5, label: '50%' },
    { level: 0.618, price: high - diff * 0.618, label: '61.8%' },
    { level: 0.786, price: high - diff * 0.786, label: '78.6%' },
    { level: 1, price: low, label: '100% (Low)' },
  ];

  return levels;
}

/**
 * Detect trading signals from OHLCV data
 */
export function detectTradingSignals(ohlcv: OHLCVData[]): TradingSignal[] {
  const signals: TradingSignal[] = [];

  if (ohlcv.length < 20) return signals;

  // Simple moving average crossover
  for (let i = 20; i < ohlcv.length; i++) {
    const sma20 = ohlcv.slice(i - 20, i).reduce((sum, d) => sum + d.close, 0) / 20;
    const sma50 = i >= 50
      ? ohlcv.slice(i - 50, i).reduce((sum, d) => sum + d.close, 0) / 50
      : sma20;

    const prevSma20 = ohlcv.slice(i - 21, i - 1).reduce((sum, d) => sum + d.close, 0) / 20;
    const prevSma50 = i >= 51
      ? ohlcv.slice(i - 51, i - 1).reduce((sum, d) => sum + d.close, 0) / 50
      : prevSma20;

    // Golden cross (bullish)
    if (prevSma20 < prevSma50 && sma20 > sma50) {
      signals.push({
        type: 'BUY' as const,
        price: ohlcv[i].close,
        volume: ohlcv[i].volume,
        timestamp: ohlcv[i].time * 1000,
        strength: 'strong' as const,
        reason: 'Golden Cross: SMA20 crossed above SMA50',
      });
    }

    // Death cross (bearish)
    if (prevSma20 > prevSma50 && sma20 < sma50) {
      signals.push({
        type: 'SELL' as const,
        price: ohlcv[i].close,
        volume: ohlcv[i].volume,
        timestamp: ohlcv[i].time * 1000,
        strength: 'strong' as const,
        reason: 'Death Cross: SMA20 crossed below SMA50',
      });
    }

    // Volume spike detection
    const avgVolume = ohlcv.slice(Math.max(0, i - 20), i).reduce((sum, d) => sum + d.volume, 0) / 20;
    if (ohlcv[i].volume > avgVolume * 2) {
      const priceChange = (ohlcv[i].close - ohlcv[i].open) / ohlcv[i].open;
      if (Math.abs(priceChange) > 0.02) {
        signals.push({
          type: priceChange > 0 ? 'BUY' as const : 'SELL' as const,
          price: ohlcv[i].close,
          volume: ohlcv[i].volume,
          timestamp: ohlcv[i].time * 1000,
          strength: 'moderate' as const,
          reason: `High volume ${priceChange > 0 ? 'buy' : 'sell'} pressure`,
        });
      }
    }
  }

  // Return only the most recent signals
  return signals.slice(-10);
}
