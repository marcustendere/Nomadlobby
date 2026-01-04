import { useEffect } from 'react';
import { useMarketStore, startAutoRefresh, stopAutoRefresh } from '../store/marketStore';
import { TrendingUp, TrendingDown, Activity, Zap, AlertCircle } from 'lucide-react';

export default function TradingDashboard() {
  const {
    assets,
    selectedAssetId,
    metrics,
    globalStats,
    isLoading,
    error,
    updateCount,
    setSelectedAsset,
    clearError,
  } = useMarketStore();

  const selectedMetrics = metrics.get(selectedAssetId);

  useEffect(() => {
    startAutoRefresh(1300);
    return () => stopAutoRefresh();
  }, []);

  const formatPrice = (price: number) => {
    if (price >= 1000) return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    if (price >= 1) return `$${price.toFixed(4)}`;
    return `$${price.toFixed(6)}`;
  };

  const formatPercent = (pct: number) => {
    return `${pct > 0 ? '+' : ''}${pct.toFixed(2)}%`;
  };

  return (
    <div className="min-h-screen bg-[#0a0e17] text-[#e0e0e0]">
      {/* Header */}
      <header className="bg-[#0f1419] border-b border-[#1a1f2e] sticky top-0 z-50">
        <div className="px-4 lg:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#00d4ff]/20 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-[#00d4ff]" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#00d4ff]">
                  NOMAD TERMINAL v2.0
                </h1>
                <p className="text-[10px] text-[#8a8f98]">
                  Institutional-Grade Trading Intelligence
                </p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-6 text-xs">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${error ? 'bg-[#ff3366]' : 'bg-[#00ff88]'} animate-pulse`} />
                <span className="text-[#8a8f98]">{error ? 'ERROR' : 'LIVE'}</span>
              </div>
              <div className="text-[#8a8f98]">
                Updates: {updateCount}
              </div>
              {globalStats && (
                <div className="bg-[#0a0e17] px-3 py-1 rounded border border-[#1a1f2e]">
                  <span className="text-[#00d4ff] font-mono font-semibold">
                    BTC Dom: {globalStats.dominance.toFixed(2)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="bg-[#ff3366]/10 border-b border-[#ff3366]/30 px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#ff3366]" />
              <span className="text-sm text-[#ff3366]">{error}</span>
            </div>
            <button onClick={clearError} className="text-[#ff3366] text-sm hover:underline">
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="p-4 lg:p-6">
        {isLoading && assets.length === 0 ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-[#00d4ff] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-[#8a8f98]">Loading market data...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Asset List */}
            <div className="lg:col-span-1 space-y-2">
              <h2 className="text-sm font-semibold text-[#00d4ff] mb-3">TRACKED ASSETS</h2>
              {assets.map(asset => (
                <button
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset.id)}
                  className={`
                    w-full p-3 rounded-lg border transition-all
                    ${selectedAssetId === asset.id
                      ? 'bg-[#00d4ff]/10 border-[#00d4ff]'
                      : 'bg-[#0f1419] border-[#1a1f2e] hover:border-[#00d4ff]/50'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <div className="font-semibold text-sm">{asset.symbol.toUpperCase()}</div>
                      <div className="text-xs text-[#8a8f98]">{asset.name}</div>
                    </div>
                    {asset.price_change_percentage_24h > 0 ? (
                      <TrendingUp className="w-4 h-4 text-[#00ff88]" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-[#ff3366]" />
                    )}
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="text-sm font-mono">{formatPrice(asset.current_price)}</div>
                    <div className={`text-xs font-semibold ${
                      asset.price_change_percentage_24h > 0 ? 'text-[#00ff88]' : 'text-[#ff3366]'
                    }`}>
                      {formatPercent(asset.price_change_percentage_24h)}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Main Panel */}
            <div className="lg:col-span-3 space-y-4">
              {selectedMetrics ? (
                <>
                  {/* Price Header */}
                  <div className="bg-[#0f1419] border border-[#1a1f2e] rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold font-mono">
                          {formatPrice(selectedMetrics.asset.current_price)}
                        </h2>
                        <div className={`text-sm mt-1 ${
                          selectedMetrics.asset.price_change_percentage_24h > 0 ? 'text-[#00ff88]' : 'text-[#ff3366]'
                        }`}>
                          {formatPercent(selectedMetrics.asset.price_change_percentage_24h)} (24h)
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-[#8a8f98]">Market Cap</div>
                        <div className="text-lg font-mono">${(selectedMetrics.asset.market_cap / 1e9).toFixed(2)}B</div>
                      </div>
                    </div>
                  </div>

                  {/* Technical Indicators */}
                  <div className="bg-[#0f1419] border border-[#1a1f2e] rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-[#00d4ff] mb-3">TECHNICAL INDICATORS</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-xs text-[#8a8f98]">RSI (14)</div>
                        <div className={`text-lg font-mono ${
                          selectedMetrics.technicalIndicators.rsi < 30 ? 'text-[#00ff88]' :
                          selectedMetrics.technicalIndicators.rsi > 70 ? 'text-[#ff3366]' :
                          'text-[#e0e0e0]'
                        }`}>
                          {selectedMetrics.technicalIndicators.rsi.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-[#8a8f98]">MACD</div>
                        <div className={`text-lg font-mono ${
                          selectedMetrics.technicalIndicators.macd.histogram > 0 ? 'text-[#00ff88]' : 'text-[#ff3366]'
                        }`}>
                          {selectedMetrics.technicalIndicators.macd.macd.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-[#8a8f98]">Volume</div>
                        <div className={`text-lg font-mono ${
                          selectedMetrics.technicalIndicators.volumeProfile.volumeTrend === 'increasing' ? 'text-[#00ff88]' :
                          selectedMetrics.technicalIndicators.volumeProfile.volumeTrend === 'decreasing' ? 'text-[#ff3366]' :
                          'text-[#e0e0e0]'
                        }`}>
                          {formatPercent(selectedMetrics.technicalIndicators.volumeProfile.volumeChange)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-[#8a8f98]">EMA 12/26</div>
                        <div className={`text-lg font-mono ${
                          selectedMetrics.technicalIndicators.ema.ema12 > selectedMetrics.technicalIndicators.ema.ema26
                            ? 'text-[#00ff88]' : 'text-[#ff3366]'
                        }`}>
                          {selectedMetrics.technicalIndicators.ema.ema12 > selectedMetrics.technicalIndicators.ema.ema26
                            ? 'Bullish' : 'Bearish'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Trading Signal */}
                  {selectedMetrics.signals.length > 0 && (
                    <div className="bg-[#0f1419] border border-[#1a1f2e] rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-[#00d4ff] mb-3">TRADING SIGNAL</h3>
                      {selectedMetrics.signals.map((signal, i) => (
                        <div key={i} className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className={`text-2xl font-bold ${
                              signal.type === 'BUY' ? 'text-[#00ff88]' :
                              signal.type === 'SELL' ? 'text-[#ff3366]' :
                              'text-[#ffcc00]'
                            }`}>
                              {signal.type}
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-[#8a8f98]">Confidence</div>
                              <div className="text-lg font-mono">{signal.confidence.toFixed(0)}%</div>
                            </div>
                          </div>
                          <div className="text-sm text-[#8a8f98]">{signal.reasoning}</div>
                          <div className="grid grid-cols-3 gap-2">
                            {signal.indicators.map((ind, j) => (
                              <div key={j} className="bg-[#0a0e17] rounded p-2">
                                <div className="text-[10px] text-[#8a8f98]">{ind.name}</div>
                                <div className={`text-xs font-semibold ${
                                  ind.signal === 'bullish' ? 'text-[#00ff88]' :
                                  ind.signal === 'bearish' ? 'text-[#ff3366]' :
                                  'text-[#8a8f98]'
                                }`}>
                                  {ind.value}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Fibonacci Levels */}
                  {selectedMetrics.fibonacciLevels.length > 0 && (
                    <div className="bg-[#0f1419] border border-[#1a1f2e] rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-[#00d4ff] mb-3">FIBONACCI LEVELS</h3>
                      <div className="space-y-1">
                        {selectedMetrics.fibonacciLevels.map((fib, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-[#8a8f98]">{fib.label}</span>
                            <span className="font-mono">{formatPrice(fib.price)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-[#0f1419] border border-[#1a1f2e] rounded-lg p-8 text-center">
                  <Activity className="w-16 h-16 text-[#8a8f98] mx-auto mb-4" />
                  <p className="text-[#8a8f98]">Select an asset to view detailed metrics</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Mobile Status Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0f1419] border-t border-[#1a1f2e] px-4 py-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
            <span className="text-[#8a8f98]">LIVE • 1.3s</span>
          </div>
          <span className="text-[#8a8f98]">Updates: {updateCount}</span>
        </div>
      </div>
    </div>
  );
}
