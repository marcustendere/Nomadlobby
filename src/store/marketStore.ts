import { create } from 'zustand';
import type { CryptoAsset, MarketMetrics, FundingRate, OpenInterest } from '../types/market';
import {
  fetchMarketData,
  fetchOHLCVData,
  fetchFundingRates,
  fetchOpenInterest,
  calculateFibonacciLevels,
  detectTradingSignals,
} from '../services/marketDataService';

interface MarketStore {
  assets: CryptoAsset[];
  selectedAsset: string;
  metrics: Map<string, MarketMetrics>;
  fundingRates: Map<string, FundingRate>;
  openInterest: Map<string, OpenInterest>;
  isLoading: boolean;
  lastUpdate: number;
  setSelectedAsset: (assetId: string) => void;
  refreshData: () => Promise<void>;
  initializeData: () => Promise<void>;
}

export const useMarketStore = create<MarketStore>((set, get) => ({
  assets: [],
  selectedAsset: 'bitcoin',
  metrics: new Map(),
  fundingRates: new Map(),
  openInterest: new Map(),
  isLoading: false,
  lastUpdate: 0,

  setSelectedAsset: (assetId: string) => {
    set({ selectedAsset: assetId });
  },

  refreshData: async () => {
    const state = get();

    // Prevent concurrent refreshes
    if (state.isLoading) return;

    set({ isLoading: true });

    try {
      // Fetch all data in parallel for low latency
      const [assets, fundingRates, openInterest] = await Promise.all([
        fetchMarketData(),
        fetchFundingRates(),
        fetchOpenInterest(),
      ]);

      // Fetch OHLCV data for each asset
      const metricsPromises = assets.map(async (asset) => {
        try {
          const ohlcv = await fetchOHLCVData(asset.id, 1);

          // Calculate Fibonacci levels from 24h high/low
          const fibLevels = calculateFibonacciLevels(asset.high_24h, asset.low_24h);

          // Detect trading signals
          const signals = detectTradingSignals(ohlcv);

          const metrics: MarketMetrics = {
            asset,
            fundingRate: fundingRates.get(asset.symbol.toUpperCase()),
            openInterest: openInterest.get(asset.symbol.toUpperCase()),
            fibLevels,
            signals,
            ohlcv,
          };

          return [asset.id, metrics] as const;
        } catch (error) {
          console.error(`Error fetching metrics for ${asset.id}:`, error);
          return null;
        }
      });

      const metricsResults = await Promise.all(metricsPromises);
      const newMetrics = new Map(
        metricsResults.filter((r): r is [string, MarketMetrics] => r !== null)
      );

      set({
        assets,
        metrics: newMetrics,
        fundingRates,
        openInterest,
        isLoading: false,
        lastUpdate: Date.now(),
      });
    } catch (error) {
      console.error('Error refreshing market data:', error);
      set({ isLoading: false });
    }
  },

  initializeData: async () => {
    await get().refreshData();
  },
}));

// Auto-refresh every 1.3 seconds
let refreshInterval: ReturnType<typeof setInterval> | null = null;

export function startAutoRefresh() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }

  refreshInterval = setInterval(() => {
    useMarketStore.getState().refreshData();
  }, 1300); // 1.3 seconds
}

export function stopAutoRefresh() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
}
