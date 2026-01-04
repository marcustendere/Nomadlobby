import axios, { type AxiosInstance } from 'axios';
import type {
  MarketData,
  OHLCV,
  FundingRate,
  OpenInterest,
  OrderBook,
  MarketStats,
} from '../types/market';

/**
 * CoinGecko API Client with proper error handling and rate limiting
 */
class CoinGeckoAPI {
  private client: AxiosInstance;
  private cache: Map<string, { data: any; timestamp: number }>;
  private readonly CACHE_DURATION = 10000; // 10 seconds
  private requestCount = 0;
  private lastResetTime = Date.now();
  private readonly MAX_REQUESTS_PER_MINUTE = 50;

  constructor() {
    this.client = axios.create({
      baseURL: 'https://api.coingecko.com/api/v3',
      timeout: 15000,
      headers: {
        'Accept': 'application/json',
      },
    });

    this.cache = new Map();

    // Add request interceptor for rate limiting
    this.client.interceptors.request.use(async (config) => {
      await this.checkRateLimit();
      return config;
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('CoinGecko API Error:', error.response?.data || error.message);
        throw error;
      }
    );
  }

  /**
   * Rate limiting check
   */
  private async checkRateLimit(): Promise<void> {
    const now = Date.now();

    // Reset counter every minute
    if (now - this.lastResetTime > 60000) {
      this.requestCount = 0;
      this.lastResetTime = now;
    }

    // If we've hit the limit, wait
    if (this.requestCount >= this.MAX_REQUESTS_PER_MINUTE) {
      const waitTime = 60000 - (now - this.lastResetTime);
      console.warn(`Rate limit reached. Waiting ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      this.requestCount = 0;
      this.lastResetTime = Date.now();
    }

    this.requestCount++;
  }

  /**
   * Get from cache or fetch
   */
  private async getCached<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key);
    const now = Date.now();

    if (cached && now - cached.timestamp < this.CACHE_DURATION) {
      return cached.data as T;
    }

    try {
      const data = await fetcher();
      this.cache.set(key, { data, timestamp: now });
      return data;
    } catch (error) {
      // Return stale cache if available
      if (cached) {
        console.warn('Using stale cache due to API error');
        return cached.data as T;
      }
      throw error;
    }
  }

  /**
   * Fetch market data for multiple coins
   */
  async fetchMarketData(coinIds: string[]): Promise<MarketData[]> {
    const cacheKey = `markets_${coinIds.join(',')}`;

    return this.getCached(cacheKey, async () => {
      const response = await this.client.get<MarketData[]>('/coins/markets', {
        params: {
          vs_currency: 'usd',
          ids: coinIds.join(','),
          order: 'market_cap_desc',
          per_page: 50,
          page: 1,
          sparkline: true,
          price_change_percentage: '24h,7d,30d',
        },
      });

      return response.data;
    });
  }

  /**
   * Fetch OHLCV data
   */
  async fetchOHLCV(coinId: string, days: number = 7): Promise<OHLCV[]> {
    const cacheKey = `ohlcv_${coinId}_${days}`;

    return this.getCached(cacheKey, async () => {
      const response = await this.client.get<number[][]>(`/coins/${coinId}/ohlc`, {
        params: {
          vs_currency: 'usd',
          days,
        },
      });

      return response.data.map(([timestamp, open, high, low, close]) => ({
        timestamp: timestamp / 1000,
        open,
        high,
        low,
        close,
        volume: 0, // CoinGecko OHLC doesn't include volume
      }));
    });
  }

  /**
   * Fetch detailed coin data
   */
  async fetchCoinDetails(coinId: string) {
    const cacheKey = `details_${coinId}`;

    return this.getCached(cacheKey, async () => {
      const response = await this.client.get(`/coins/${coinId}`, {
        params: {
          localization: false,
          tickers: true,
          market_data: true,
          community_data: false,
          developer_data: false,
          sparkline: false,
        },
      });

      return response.data;
    });
  }

  /**
   * Fetch global market stats
   */
  async fetchGlobalStats(): Promise<MarketStats> {
    const cacheKey = 'global_stats';

    return this.getCached(cacheKey, async () => {
      const response = await this.client.get('/global');
      const data = response.data.data;

      return {
        dominance: data.market_cap_percentage?.btc || 0,
        totalMarketCap: data.total_market_cap?.usd || 0,
        total24hVolume: data.total_volume?.usd || 0,
        defiMarketCap: data.defi_market_cap || 0,
        defiDominance: data.defi_to_total_market_cap_percentage || 0,
        ethDominance: data.market_cap_percentage?.eth || 0,
        activeCryptocurrencies: data.active_cryptocurrencies || 0,
      };
    });
  }

  /**
   * Fetch trending coins
   */
  async fetchTrending() {
    const cacheKey = 'trending';

    return this.getCached(cacheKey, async () => {
      const response = await this.client.get('/search/trending');
      return response.data.coins;
    });
  }
}

/**
 * Mock data service for features not available in free CoinGecko API
 */
class MockDataService {
  /**
   * Generate mock funding rates
   */
  generateFundingRates(symbols: string[]): Map<string, FundingRate> {
    const rates = new Map<string, FundingRate>();

    symbols.forEach(symbol => {
      const baseRate = (Math.random() - 0.5) * 0.001;
      rates.set(symbol, {
        symbol,
        rate: baseRate,
        nextFundingTime: Date.now() + 8 * 60 * 60 * 1000,
        predictedRate: baseRate * (0.9 + Math.random() * 0.2),
        markPrice: 50000 + Math.random() * 10000,
      });
    });

    return rates;
  }

  /**
   * Generate mock open interest
   */
  generateOpenInterest(symbols: string[]): Map<string, OpenInterest> {
    const oi = new Map<string, OpenInterest>();

    symbols.forEach(symbol => {
      const value = Math.random() * 5000000000;
      const change = (Math.random() - 0.5) * 20;

      oi.set(symbol, {
        symbol,
        openInterest: value / 50000,
        openInterestValue: value,
        change24h: change,
        changePercentage24h: change,
        timestamp: Date.now(),
      });
    });

    return oi;
  }

  /**
   * Generate mock order book
   */
  generateOrderBook(currentPrice: number): OrderBook {
    const bids: any[] = [];
    const asks: any[] = [];
    const spread = currentPrice * 0.001; // 0.1% spread

    // Generate 20 levels each side
    for (let i = 0; i < 20; i++) {
      const bidPrice = currentPrice - spread - (i * currentPrice * 0.0005);
      const askPrice = currentPrice + spread + (i * currentPrice * 0.0005);
      const bidAmount = Math.random() * 10;
      const askAmount = Math.random() * 10;

      bids.push({
        price: bidPrice,
        amount: bidAmount,
        total: bidPrice * bidAmount,
      });

      asks.push({
        price: askPrice,
        amount: askAmount,
        total: askPrice * askAmount,
      });
    }

    return {
      bids: bids.reverse(),
      asks,
      spread,
      spreadPercentage: (spread / currentPrice) * 100,
    };
  }
}

// Export singleton instances
export const coinGeckoAPI = new CoinGeckoAPI();
export const mockDataService = new MockDataService();
