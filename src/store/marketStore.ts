import { create } from 'zustand';
import type {
  MarketData,
  CompleteMarketMetrics,
  Timeframe,
  MarketStats,
} from '../types/market';
import { coinGeckoAPI, mockDataService } from '../services/api';
import {
  calculateAllIndicators,
  generateTradingSignals,
  calculateFibonacciLevels,
} from '../utils/technicalIndicators';

interface MarketStore {
  // State
  assets: MarketData[];
  selectedAssetId: string;
  metrics: Map<string, CompleteMarketMetrics>;
  globalStats: MarketStats | null;
  timeframe: Timeframe;
  isLoading: boolean;
  error: string | null;
  lastUpdate: number;
  updateCount: number;

  // Actions
  setSelectedAsset: (assetId: string) => void;
  setTimeframe: (timeframe: Timeframe) => void;
  fetchAllData: () => Promise<void>;
  fetchAssetMetrics: (assetId: string) => Promise<void>;
  refreshData: () => Promise<void>;
  clearError: () => void;
}

const TRACKED_ASSET_IDS = [
  'hyperliquid',
  'bitcoin',
  'ethereum',
  'solana',
  'ripple',
  'zcash',
  'bitcoin-cash',
  'core-dao',
];

export const useMarketStore = create<MarketStore>((set, get) => ({
  // Initial State
  assets: [],
  selectedAssetId: 'bitcoin',
  metrics: new Map(),
  globalStats: null,
  timeframe: '1d',
  isLoading: false,
  error: null,
  lastUpdate: 0,
  updateCount: 0,

  // Set selected asset
  setSelectedAsset: (assetId: string) => {
    set({ selectedAssetId: assetId });
    // Fetch detailed metrics for this asset if not already loaded
    const metrics = get().metrics;
    if (!metrics.has(assetId)) {
      get().fetchAssetMetrics(assetId);
    }
  },

  // Set timeframe
  setTimeframe: (timeframe: Timeframe) => {
    set({ timeframe });
    // Re-fetch data for new timeframe
    const selectedAssetId = get().selectedAssetId;
    get().fetchAssetMetrics(selectedAssetId);
  },

  // Fetch all market data
  fetchAllData: async () => {
    set({ isLoading: true, error: null });

    try {
      // Fetch market data and global stats in parallel
      const [marketData, globalStats] = await Promise.all([
        coinGeckoAPI.fetchMarketData(TRACKED_ASSET_IDS),
        coinGeckoAPI.fetchGlobalStats(),
      ]);

      set({
        assets: marketData,
        globalStats,
        isLoading: false,
        lastUpdate: Date.now(),
        updateCount: get().updateCount + 1,
      });

      // Fetch metrics for selected asset
      const selectedAssetId = get().selectedAssetId;
      if (selectedAssetId) {
        await get().fetchAssetMetrics(selectedAssetId);
      }
    } catch (error) {
      console.error('Error fetching market data:', error);
      set({
        error: 'Failed to fetch market data. Using cached data if available.',
        isLoading: false,
      });
    }
  },

  // Fetch detailed metrics for a specific asset
  fetchAssetMetrics: async (assetId: string) => {
    try {
      const timeframe = get().timeframe;
      const days = timeframe === '1d' ? 1 : timeframe === '1w' ? 7 : timeframe === '1M' ? 30 : 7;

      // Fetch OHLCV data
      const ohlcv = await coinGeckoAPI.fetchOHLCV(assetId, days);

      // Find asset data
      const asset = get().assets.find(a => a.id === assetId);
      if (!asset) return;

      // Calculate technical indicators
      const technicalIndicators = calculateAllIndicators(ohlcv);

      // Generate trading signals
      const signals = generateTradingSignals(ohlcv, technicalIndicators);

      // Calculate Fibonacci levels
      const fibonacciLevels = calculateFibonacciLevels(asset.high_24h, asset.low_24h);

      // Generate mock data for features not in free API
      const fundingRates = mockDataService.generateFundingRates([asset.symbol]);
      const openInterestMap = mockDataService.generateOpenInterest([asset.symbol]);
      const orderBook = mockDataService.generateOrderBook(asset.current_price);

      // Combine all metrics
      const completeMetrics: CompleteMarketMetrics = {
        asset,
        ohlcv,
        technicalIndicators,
        signals,
        fibonacciLevels,
        fundingRate: fundingRates.get(asset.symbol),
        openInterest: openInterestMap.get(asset.symbol),
        orderBook,
      };

      // Update metrics map
      const newMetrics = new Map(get().metrics);
      newMetrics.set(assetId, completeMetrics);

      set({ metrics: newMetrics });
    } catch (error) {
      console.error(`Error fetching metrics for ${assetId}:`, error);
    }
  },

  // Refresh all data
  refreshData: async () => {
    const { fetchAllData, selectedAssetId } = get();

    await fetchAllData();

    // Refresh metrics for currently selected asset
    if (selectedAssetId) {
      await get().fetchAssetMetrics(selectedAssetId);
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));

// Auto-refresh functionality
let refreshInterval: ReturnType<typeof setInterval> | null = null;

export function startAutoRefresh(intervalMs: number = 1300) {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }

  // Initial fetch
  useMarketStore.getState().fetchAllData();

  // Set up auto-refresh
  refreshInterval = setInterval(() => {
    useMarketStore.getState().refreshData();
  }, intervalMs);
}

export function stopAutoRefresh() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
}

// Get selected asset metrics
export function useSelectedMetrics() {
  const selectedAssetId = useMarketStore(state => state.selectedAssetId);
  const metrics = useMarketStore(state => state.metrics);
  return metrics.get(selectedAssetId);
}
