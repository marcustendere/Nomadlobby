import { useEffect, useState } from 'react';
import { useMarketStore, startAutoRefresh, stopAutoRefresh } from '../store/marketStore';
import AssetCard from './AssetCard';
import TradingChart from './TradingChart';
import { Activity, BarChart3, TrendingUp, Radio, Zap } from 'lucide-react';

type ViewMode = 'overview' | 'detailed';
type Tab = 'all' | 'majors' | 'alts';

export default function TradingDashboard() {
  const {
    assets,
    selectedAsset,
    metrics,
    isLoading,
    lastUpdate,
    setSelectedAsset,
    initializeData,
  } = useMarketStore();

  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [activeTab, setActiveTab] = useState<Tab>('all');

  useEffect(() => {
    initializeData();
    startAutoRefresh();

    return () => {
      stopAutoRefresh();
    };
  }, [initializeData]);

  const selectedMetrics = selectedAsset ? metrics.get(selectedAsset) : null;

  // Filter assets based on tab
  const filteredAssets = assets.filter(asset => {
    if (activeTab === 'majors') {
      return ['BTC', 'ETH', 'SOL'].includes(asset.symbol.toUpperCase());
    }
    if (activeTab === 'alts') {
      return !['BTC', 'ETH', 'SOL'].includes(asset.symbol.toUpperCase());
    }
    return true;
  });

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-terminal-bg text-terminal-text">
      {/* Header */}
      <header className="bg-terminal-panel border-b border-terminal-border sticky top-0 z-50 backdrop-blur-sm bg-terminal-panel/95">
        <div className="px-4 lg:px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-terminal-accent/20 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-terminal-accent" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-terminal-accent glow-text">
                  NOMAD TERMINAL
                </h1>
                <p className="text-[10px] text-terminal-textMuted">
                  Professional Trading Intelligence Platform
                </p>
              </div>
            </div>

            {/* Status Indicators */}
            <div className="hidden md:flex items-center gap-6 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-terminal-green animate-pulse" />
                <span className="text-terminal-textMuted">LIVE</span>
              </div>
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-terminal-accent" />
                <span className="text-terminal-textMuted">
                  {lastUpdate ? formatTime(lastUpdate) : '--:--:--'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-terminal-yellow" />
                <span className="text-terminal-textMuted">1.3s refresh</span>
              </div>
              <div className="bg-terminal-bg px-3 py-1 rounded border border-terminal-border">
                <span className="text-terminal-accent font-mono font-semibold">
                  {assets.length}
                </span>
                <span className="text-terminal-textMuted ml-1">assets</span>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 mt-3">
            {[
              { id: 'all' as Tab, label: 'All Assets', icon: BarChart3 },
              { id: 'majors' as Tab, label: 'Majors', icon: TrendingUp },
              { id: 'alts' as Tab, label: 'Altcoins', icon: Activity },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${activeTab === tab.id
                    ? 'bg-terminal-accent text-terminal-bg'
                    : 'bg-terminal-bg text-terminal-textMuted hover:text-terminal-text hover:bg-terminal-border'
                  }
                `}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}

            {/* View Mode Toggle */}
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => setViewMode('overview')}
                className={`
                  px-3 py-2 rounded text-xs transition-all
                  ${viewMode === 'overview' ? 'bg-terminal-accent text-terminal-bg' : 'bg-terminal-bg text-terminal-textMuted'}
                `}
              >
                Overview
              </button>
              <button
                onClick={() => setViewMode('detailed')}
                className={`
                  px-3 py-2 rounded text-xs transition-all
                  ${viewMode === 'detailed' ? 'bg-terminal-accent text-terminal-bg' : 'bg-terminal-bg text-terminal-textMuted'}
                `}
              >
                Detailed
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 lg:p-6">
        {isLoading && assets.length === 0 ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-terminal-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-terminal-textMuted">Loading market data...</p>
            </div>
          </div>
        ) : viewMode === 'overview' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredAssets.map(asset => {
              const assetMetrics = metrics.get(asset.id);
              return (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  fundingRate={assetMetrics?.fundingRate}
                  openInterest={assetMetrics?.openInterest}
                  isSelected={selectedAsset === asset.id}
                  onClick={() => {
                    setSelectedAsset(asset.id);
                    setViewMode('detailed');
                  }}
                />
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Asset Selector */}
            <div className="bg-terminal-panel border border-terminal-border rounded-lg p-4">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin pb-2">
                {assets.map(asset => (
                  <button
                    key={asset.id}
                    onClick={() => setSelectedAsset(asset.id)}
                    className={`
                      flex-shrink-0 px-4 py-2 rounded-lg font-semibold text-sm transition-all
                      ${selectedAsset === asset.id
                        ? 'bg-terminal-accent text-terminal-bg'
                        : 'bg-terminal-bg text-terminal-textMuted hover:text-terminal-text'
                      }
                    `}
                  >
                    {asset.symbol}
                  </button>
                ))}
              </div>
            </div>

            {selectedMetrics && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Chart - Takes 2 columns */}
                <div className="lg:col-span-2 bg-terminal-panel border border-terminal-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-terminal-accent">
                      {selectedMetrics.asset.name} ({selectedMetrics.asset.symbol.toUpperCase()})
                    </h2>
                    <div className="text-right">
                      <div className="text-2xl font-bold font-mono">
                        ${selectedMetrics.asset.current_price.toFixed(2)}
                      </div>
                      <div className={`text-sm ${
                        selectedMetrics.asset.price_change_percentage_24h > 0
                          ? 'text-terminal-green'
                          : 'text-terminal-red'
                      }`}>
                        {selectedMetrics.asset.price_change_percentage_24h > 0 ? '+' : ''}
                        {selectedMetrics.asset.price_change_percentage_24h.toFixed(2)}%
                      </div>
                    </div>
                  </div>

                  <TradingChart
                    data={selectedMetrics.ohlcv}
                    signals={selectedMetrics.signals}
                    fibLevels={selectedMetrics.fibLevels}
                    height={500}
                  />
                </div>

                {/* Metrics Panel */}
                <div className="space-y-4">
                  {/* Key Metrics */}
                  <div className="bg-terminal-panel border border-terminal-border rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-terminal-accent mb-3">
                      Key Metrics
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-terminal-textMuted">24h Volume</span>
                        <span className="font-mono text-terminal-text">
                          ${(selectedMetrics.asset.total_volume / 1e9).toFixed(2)}B
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-terminal-textMuted">Market Cap</span>
                        <span className="font-mono text-terminal-text">
                          ${(selectedMetrics.asset.market_cap / 1e9).toFixed(2)}B
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-terminal-textMuted">ATH</span>
                        <span className="font-mono text-terminal-green">
                          ${selectedMetrics.asset.ath.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-terminal-textMuted">ATL</span>
                        <span className="font-mono text-terminal-red">
                          ${selectedMetrics.asset.atl.toFixed(2)}
                        </span>
                      </div>
                      {selectedMetrics.fundingRate && (
                        <div className="flex justify-between pt-2 border-t border-terminal-border">
                          <span className="text-terminal-textMuted">Funding Rate</span>
                          <span className={`font-mono ${
                            selectedMetrics.fundingRate.fundingRate > 0
                              ? 'text-terminal-green'
                              : 'text-terminal-red'
                          }`}>
                            {(selectedMetrics.fundingRate.fundingRate * 100).toFixed(4)}%
                          </span>
                        </div>
                      )}
                      {selectedMetrics.openInterest && (
                        <div className="flex justify-between">
                          <span className="text-terminal-textMuted">Open Interest</span>
                          <span className="font-mono text-terminal-accent">
                            ${(selectedMetrics.openInterest.openInterestValue / 1e9).toFixed(2)}B
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Trading Signals */}
                  {selectedMetrics.signals.length > 0 && (
                    <div className="bg-terminal-panel border border-terminal-border rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-terminal-accent mb-3">
                        Trading Signals
                      </h3>
                      <div className="space-y-2">
                        {selectedMetrics.signals.slice(-5).reverse().map((signal, i) => (
                          <div
                            key={i}
                            className="bg-terminal-bg rounded p-2 border-l-2"
                            style={{
                              borderLeftColor: signal.type === 'BUY' ? '#00ff88' : '#ff3366'
                            }}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className={`font-semibold text-xs ${
                                signal.type === 'BUY' ? 'text-terminal-green' : 'text-terminal-red'
                              }`}>
                                {signal.type}
                              </span>
                              <span className="text-[10px] text-terminal-textMuted">
                                {new Date(signal.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            <div className="text-[10px] text-terminal-textMuted">
                              {signal.reason}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Mobile Status Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-terminal-panel border-t border-terminal-border px-4 py-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-terminal-green animate-pulse" />
            <span className="text-terminal-textMuted">LIVE</span>
          </div>
          <span className="text-terminal-textMuted">
            {lastUpdate ? formatTime(lastUpdate) : '--:--:--'}
          </span>
          <span className="text-terminal-yellow">1.3s refresh</span>
        </div>
      </div>
    </div>
  );
}
