// OVERUNDER.AI - HFT Trading Terminal
import { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Zap,
  RefreshCw,
  AlertTriangle,
  Target,
  Gauge,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Wifi,
  Database,
  DollarSign,
  Percent,
  Layers,
  Shield,
  Brain,
  Radio,
} from 'lucide-react';
import hftService from '../services/hftService';
import type {
  EnhancedMarketData,
  AssetAnalysis,
  GlobalMarketState,
} from '../types/hft';

export default function OverUnderDashboard() {
  const [marketData, setMarketData] = useState<EnhancedMarketData[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<string>('bitcoin');
  const [assetAnalysis, setAssetAnalysis] = useState<AssetAnalysis | null>(null);
  const [globalState, setGlobalState] = useState<GlobalMarketState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());
  const [activeTab, setActiveTab] = useState<'overview' | 'hft' | 'derivatives' | 'rwa'>('overview');

  const fetchData = useCallback(async () => {
    try {
      const [market, analysis, global] = await Promise.all([
        hftService.fetchMarketData(),
        hftService.getAssetAnalysis(selectedAsset),
        hftService.getGlobalMarketState(),
      ]);

      setMarketData(market);
      setAssetAnalysis(analysis);
      setGlobalState(global);
      setLastUpdate(Date.now());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [selectedAsset]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const formatPrice = (price: number) => {
    if (price >= 1000) return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    if (price >= 1) return `$${price.toFixed(4)}`;
    return `$${price.toFixed(6)}`;
  };

  const formatLargeNumber = (num: number) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toLocaleString()}`;
  };

  const formatPercent = (val: number) => {
    const sign = val >= 0 ? '+' : '';
    return `${sign}${val.toFixed(2)}%`;
  };

  const getChangeColor = (val: number) => val >= 0 ? 'text-emerald-400' : 'text-rose-400';

  const getSignalColor = (signal: string) => {
    if (signal.includes('BUY')) return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/50';
    if (signal.includes('SELL')) return 'text-rose-400 bg-rose-500/20 border-rose-500/50';
    return 'text-amber-400 bg-amber-500/20 border-amber-500/50';
  };

  const getRSIColor = (rsi: number) => {
    if (rsi < 30) return 'text-emerald-400';
    if (rsi > 70) return 'text-rose-400';
    return 'text-slate-300';
  };

  const getFearGreedColor = (index: number) => {
    if (index <= 25) return 'text-rose-500';
    if (index <= 45) return 'text-orange-400';
    if (index <= 55) return 'text-amber-400';
    if (index <= 75) return 'text-lime-400';
    return 'text-emerald-400';
  };

  if (loading && !marketData.length) {
    return (
      <div className="min-h-screen bg-[#0a0b0f] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-cyan-500/30 rounded-full animate-ping" />
            <div className="absolute inset-2 border-4 border-t-cyan-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
            <Zap className="absolute inset-0 m-auto w-8 h-8 text-cyan-500" />
          </div>
          <h2 className="text-xl font-bold text-cyan-400 mb-2">OVERUNDER.AI</h2>
          <p className="text-slate-500 text-sm">Initializing HFT Systems...</p>
        </div>
      </div>
    );
  }

  const selectedMarket = marketData.find(m => m.id === selectedAsset);

  return (
    <div className="min-h-screen bg-[#0a0b0f] text-slate-200">
      {/* Header */}
      <header className="bg-[#0d0e14] border-b border-slate-800/50 sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    OVERUNDER.AI
                  </h1>
                  <p className="text-[10px] text-slate-500 tracking-wider">HFT INTELLIGENCE TERMINAL</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Live Status */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <div className={`w-2 h-2 rounded-full ${error ? 'bg-rose-500' : 'bg-emerald-500'} animate-pulse`} />
                <span className="text-xs text-slate-400">{error ? 'ERROR' : 'LIVE'}</span>
                <Radio className="w-3 h-3 text-emerald-500" />
              </div>

              {/* Latency */}
              {assetAnalysis && (
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg border border-slate-700/50">
                  <Wifi className="w-3 h-3 text-cyan-400" />
                  <span className="text-xs text-slate-400">
                    {(assetAnalysis.hftMetrics.latency.totalRoundTrip / 1000).toFixed(2)}ms
                  </span>
                </div>
              )}

              {/* Last Update */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <Clock className="w-3 h-3 text-slate-400" />
                <span className="text-xs text-slate-400">
                  {new Date(lastUpdate).toLocaleTimeString()}
                </span>
              </div>

              <button
                onClick={fetchData}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 mt-3">
            {(['overview', 'hft', 'derivatives', 'rwa'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${
                  activeTab === tab
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                    : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50'
                }`}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="bg-rose-500/10 border-b border-rose-500/30 px-4 py-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span className="text-sm text-rose-400">{error}</span>
          </div>
        </div>
      )}

      <main className="p-4">
        {/* Global Stats Bar */}
        {globalState && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 mb-4">
            <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
              <div className="text-[10px] text-slate-500 mb-1">MARKET CAP</div>
              <div className="text-sm font-semibold">{formatLargeNumber(globalState.totalMarketCap)}</div>
            </div>
            <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
              <div className="text-[10px] text-slate-500 mb-1">24H VOLUME</div>
              <div className="text-sm font-semibold">{formatLargeNumber(globalState.totalVolume24h)}</div>
            </div>
            <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
              <div className="text-[10px] text-slate-500 mb-1">BTC DOM</div>
              <div className="text-sm font-semibold text-amber-400">{globalState.btcDominance.toFixed(1)}%</div>
            </div>
            <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
              <div className="text-[10px] text-slate-500 mb-1">ETH DOM</div>
              <div className="text-sm font-semibold text-blue-400">{globalState.ethDominance.toFixed(1)}%</div>
            </div>
            <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
              <div className="text-[10px] text-slate-500 mb-1">FEAR/GREED</div>
              <div className={`text-sm font-semibold ${getFearGreedColor(globalState.overallSentiment.fearGreedIndex)}`}>
                {globalState.overallSentiment.fearGreedIndex}
              </div>
            </div>
            <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
              <div className="text-[10px] text-slate-500 mb-1">SENTIMENT</div>
              <div className="text-sm font-semibold capitalize">{globalState.overallSentiment.fearGreedLabel}</div>
            </div>
            <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
              <div className="text-[10px] text-slate-500 mb-1">MARKET PHASE</div>
              <div className="text-sm font-semibold capitalize text-cyan-400">{globalState.marketPhase}</div>
            </div>
            <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
              <div className="text-[10px] text-slate-500 mb-1">ALTCOIN SZN</div>
              <div className={`text-sm font-semibold ${globalState.altcoinSeason ? 'text-emerald-400' : 'text-slate-400'}`}>
                {globalState.altcoinSeason ? 'ACTIVE' : 'INACTIVE'}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Asset List */}
          <div className="lg:col-span-1 space-y-2">
            <div className="bg-slate-800/30 rounded-xl border border-slate-700/30 p-3">
              <h3 className="text-xs font-semibold text-slate-400 mb-3 flex items-center gap-2">
                <Database className="w-3 h-3" /> TRACKED ASSETS
              </h3>
              <div className="space-y-1 max-h-[calc(100vh-320px)] overflow-y-auto">
                {marketData.map(asset => (
                  <button
                    key={asset.id}
                    onClick={() => setSelectedAsset(asset.id)}
                    className={`w-full p-2 rounded-lg transition-all ${
                      selectedAsset === asset.id
                        ? 'bg-cyan-500/20 border border-cyan-500/50'
                        : 'hover:bg-slate-700/30 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold">{asset.symbol}</span>
                        <span className="text-[10px] text-slate-500">#{asset.rank}</span>
                      </div>
                      {asset.priceChange24h >= 0 ? (
                        <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3 text-rose-400" />
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs font-mono">{formatPrice(asset.price)}</span>
                      <span className={`text-[10px] font-semibold ${getChangeColor(asset.priceChange24h)}`}>
                        {formatPercent(asset.priceChange24h)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-4 space-y-4">
            {selectedMarket && assetAnalysis && (
              <>
                {/* Price Header */}
                <div className="bg-slate-800/30 rounded-xl border border-slate-700/30 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold">{selectedMarket.symbol}</h2>
                        <span className="text-slate-500">{selectedMarket.name}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getSignalColor(assetAnalysis.tradingSignal.type)}`}>
                          {assetAnalysis.tradingSignal.type}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-3 mt-2">
                        <span className="text-3xl font-bold font-mono">{formatPrice(selectedMarket.price)}</span>
                        <span className={`text-lg font-semibold ${getChangeColor(selectedMarket.priceChange24h)}`}>
                          {formatPercent(selectedMarket.priceChange24h)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 text-right">
                      <div>
                        <div className="text-[10px] text-slate-500">1H</div>
                        <div className={`text-sm font-semibold ${getChangeColor(selectedMarket.priceChange1h)}`}>
                          {formatPercent(selectedMarket.priceChange1h)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500">7D</div>
                        <div className={`text-sm font-semibold ${getChangeColor(selectedMarket.priceChange7d)}`}>
                          {formatPercent(selectedMarket.priceChange7d)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500">30D</div>
                        <div className={`text-sm font-semibold ${getChangeColor(selectedMarket.priceChange30d)}`}>
                          {formatPercent(selectedMarket.priceChange30d)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500">ATH</div>
                        <div className="text-sm font-semibold text-rose-400">
                          {formatPercent(selectedMarket.athChangePercent)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {activeTab === 'overview' && (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Technical Indicators */}
                    <div className="bg-slate-800/30 rounded-xl border border-slate-700/30 p-4">
                      <h3 className="text-xs font-semibold text-slate-400 mb-4 flex items-center gap-2">
                        <Activity className="w-3 h-3" /> TECHNICAL INDICATORS
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-400">RSI (14)</span>
                          <span className={`text-sm font-mono font-semibold ${getRSIColor(assetAnalysis.indicators.rsi)}`}>
                            {assetAnalysis.indicators.rsi.toFixed(1)}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              assetAnalysis.indicators.rsi < 30 ? 'bg-emerald-500' :
                              assetAnalysis.indicators.rsi > 70 ? 'bg-rose-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${assetAnalysis.indicators.rsi}%` }}
                          />
                        </div>

                        <div className="flex justify-between items-center pt-2">
                          <span className="text-sm text-slate-400">MACD</span>
                          <span className={`text-sm font-mono font-semibold ${
                            assetAnalysis.indicators.macd.histogram >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            {assetAnalysis.indicators.macd.macd.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-500">Signal</span>
                          <span className="text-xs font-mono">{assetAnalysis.indicators.macd.signal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-500">Histogram</span>
                          <span className={`text-xs font-mono ${
                            assetAnalysis.indicators.macd.histogram >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            {assetAnalysis.indicators.macd.histogram.toFixed(4)}
                          </span>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                          <span className="text-sm text-slate-400">ADX</span>
                          <span className="text-sm font-mono font-semibold">{assetAnalysis.indicators.adx.toFixed(1)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-400">ATR</span>
                          <span className="text-sm font-mono">{formatPrice(assetAnalysis.indicators.atr)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bollinger & Moving Averages */}
                    <div className="bg-slate-800/30 rounded-xl border border-slate-700/30 p-4">
                      <h3 className="text-xs font-semibold text-slate-400 mb-4 flex items-center gap-2">
                        <BarChart3 className="w-3 h-3" /> PRICE LEVELS
                      </h3>
                      <div className="space-y-3">
                        <div className="text-xs text-slate-500 uppercase tracking-wider">Bollinger Bands</div>
                        <div className="flex justify-between">
                          <span className="text-xs text-slate-400">Upper</span>
                          <span className="text-xs font-mono text-rose-400">{formatPrice(assetAnalysis.indicators.bollingerBands.upper)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-slate-400">Middle</span>
                          <span className="text-xs font-mono">{formatPrice(assetAnalysis.indicators.bollingerBands.middle)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-slate-400">Lower</span>
                          <span className="text-xs font-mono text-emerald-400">{formatPrice(assetAnalysis.indicators.bollingerBands.lower)}</span>
                        </div>

                        <div className="text-xs text-slate-500 uppercase tracking-wider pt-2">Moving Averages</div>
                        <div className="flex justify-between">
                          <span className="text-xs text-slate-400">EMA 21</span>
                          <span className="text-xs font-mono">{formatPrice(assetAnalysis.indicators.ema.ema21)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-slate-400">EMA 50</span>
                          <span className="text-xs font-mono">{formatPrice(assetAnalysis.indicators.ema.ema50)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-slate-400">SMA 200</span>
                          <span className="text-xs font-mono">{formatPrice(assetAnalysis.indicators.sma.sma200)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Trading Signal */}
                    <div className="bg-slate-800/30 rounded-xl border border-slate-700/30 p-4">
                      <h3 className="text-xs font-semibold text-slate-400 mb-4 flex items-center gap-2">
                        <Target className="w-3 h-3" /> TRADING SIGNAL
                      </h3>
                      <div className={`text-center py-4 rounded-lg border mb-4 ${getSignalColor(assetAnalysis.tradingSignal.type)}`}>
                        <div className="text-2xl font-bold">{assetAnalysis.tradingSignal.type}</div>
                        <div className="text-xs mt-1 opacity-80">
                          {assetAnalysis.tradingSignal.confidence.toFixed(0)}% confidence
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Entry</span>
                          <span className="font-mono">{formatPrice(assetAnalysis.tradingSignal.entry)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Stop Loss</span>
                          <span className="font-mono text-rose-400">{formatPrice(assetAnalysis.tradingSignal.stopLoss)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">TP 1</span>
                          <span className="font-mono text-emerald-400">{formatPrice(assetAnalysis.tradingSignal.takeProfit[0])}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">R:R Ratio</span>
                          <span className="font-mono">{assetAnalysis.tradingSignal.riskReward.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'hft' && (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Latency Metrics */}
                    <div className="bg-slate-800/30 rounded-xl border border-slate-700/30 p-4">
                      <h3 className="text-xs font-semibold text-slate-400 mb-4 flex items-center gap-2">
                        <Wifi className="w-3 h-3" /> LATENCY METRICS
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-400">Exchange</span>
                          <span className="text-sm font-mono text-cyan-400">
                            {(assetAnalysis.hftMetrics.latency.exchangeLatency / 1000).toFixed(3)}ms
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-400">Order Book</span>
                          <span className="text-sm font-mono">
                            {(assetAnalysis.hftMetrics.latency.orderBookLatency / 1000).toFixed(3)}ms
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-400">Execution</span>
                          <span className="text-sm font-mono">
                            {(assetAnalysis.hftMetrics.latency.executionLatency / 1000).toFixed(3)}ms
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-400">Network</span>
                          <span className="text-sm font-mono">
                            {assetAnalysis.hftMetrics.latency.networkLatency.toFixed(0)}μs
                          </span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-slate-700">
                          <span className="text-sm text-slate-400 font-semibold">Round Trip</span>
                          <span className="text-sm font-mono font-semibold text-cyan-400">
                            {(assetAnalysis.hftMetrics.latency.totalRoundTrip / 1000).toFixed(2)}ms
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-400">Jitter</span>
                          <span className="text-sm font-mono">{assetAnalysis.hftMetrics.latency.jitter.toFixed(1)}μs</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-400">Packet Loss</span>
                          <span className="text-sm font-mono">{(assetAnalysis.hftMetrics.latency.packetLoss * 100).toFixed(3)}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Order Flow */}
                    <div className="bg-slate-800/30 rounded-xl border border-slate-700/30 p-4">
                      <h3 className="text-xs font-semibold text-slate-400 mb-4 flex items-center gap-2">
                        <Activity className="w-3 h-3" /> ORDER FLOW
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-400">Buy Volume</span>
                          <span className="text-sm font-mono text-emerald-400">
                            {formatLargeNumber(assetAnalysis.hftMetrics.orderFlow.buyVolume)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-400">Sell Volume</span>
                          <span className="text-sm font-mono text-rose-400">
                            {formatLargeNumber(assetAnalysis.hftMetrics.orderFlow.sellVolume)}
                          </span>
                        </div>
                        <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden flex">
                          <div
                            className="h-full bg-emerald-500"
                            style={{
                              width: `${(assetAnalysis.hftMetrics.orderFlow.buyVolume /
                                (assetAnalysis.hftMetrics.orderFlow.buyVolume + assetAnalysis.hftMetrics.orderFlow.sellVolume)) * 100}%`,
                            }}
                          />
                          <div className="h-full bg-rose-500 flex-1" />
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-400">Net Flow</span>
                          <span className={`text-sm font-mono ${
                            assetAnalysis.hftMetrics.orderFlow.netFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            {formatLargeNumber(assetAnalysis.hftMetrics.orderFlow.netFlow)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-400">CVD</span>
                          <span className={`text-sm font-mono ${
                            assetAnalysis.hftMetrics.orderFlow.cvd >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            {formatLargeNumber(assetAnalysis.hftMetrics.orderFlow.cvd)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-400">Imbalance</span>
                          <span className="text-sm font-mono">
                            {(assetAnalysis.hftMetrics.orderFlow.imbalance * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-400">VWAP</span>
                          <span className="text-sm font-mono">{formatPrice(assetAnalysis.hftMetrics.orderFlow.vwap)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Market Microstructure */}
                    <div className="bg-slate-800/30 rounded-xl border border-slate-700/30 p-4">
                      <h3 className="text-xs font-semibold text-slate-400 mb-4 flex items-center gap-2">
                        <Layers className="w-3 h-3" /> MICROSTRUCTURE
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-400">Bid-Ask Spread</span>
                          <span className="text-sm font-mono">{formatPrice(assetAnalysis.hftMetrics.microstructure.bidAskSpread)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-400">Spread (bps)</span>
                          <span className="text-sm font-mono text-amber-400">
                            {assetAnalysis.hftMetrics.microstructure.spreadBps.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-400">Microprice</span>
                          <span className="text-sm font-mono">{formatPrice(assetAnalysis.hftMetrics.microstructure.microprice)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-400">Depth Ratio</span>
                          <span className="text-sm font-mono">{assetAnalysis.hftMetrics.microstructure.depth.ratio.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-400">Toxic Flow</span>
                          <span className={`text-sm font-mono ${
                            assetAnalysis.hftMetrics.microstructure.toxicFlow > 50 ? 'text-rose-400' : 'text-emerald-400'
                          }`}>
                            {assetAnalysis.hftMetrics.microstructure.toxicFlow.toFixed(1)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-400">Price Impact</span>
                          <span className="text-sm font-mono">{(assetAnalysis.hftMetrics.microstructure.priceImpact * 100).toFixed(3)}%</span>
                        </div>
                      </div>
                    </div>

                    {/* HFT Signals */}
                    <div className="bg-slate-800/30 rounded-xl border border-slate-700/30 p-4 md:col-span-2 lg:col-span-3">
                      <h3 className="text-xs font-semibold text-slate-400 mb-4 flex items-center gap-2">
                        <Zap className="w-3 h-3" /> HFT SIGNALS
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-slate-900/50 rounded-lg p-3">
                          <div className="text-[10px] text-slate-500 mb-1">MOMENTUM</div>
                          <div className={`text-xl font-bold ${
                            assetAnalysis.hftMetrics.signals.momentumScore > 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            {assetAnalysis.hftMetrics.signals.momentumScore > 0 ? '+' : ''}
                            {assetAnalysis.hftMetrics.signals.momentumScore.toFixed(0)}
                          </div>
                        </div>
                        <div className="bg-slate-900/50 rounded-lg p-3">
                          <div className="text-[10px] text-slate-500 mb-1">MARKET STATE</div>
                          <div className="text-lg font-bold capitalize text-cyan-400">
                            {assetAnalysis.hftMetrics.signals.marketState}
                          </div>
                        </div>
                        <div className="bg-slate-900/50 rounded-lg p-3">
                          <div className="text-[10px] text-slate-500 mb-1">VOLATILITY</div>
                          <div className={`text-lg font-bold capitalize ${
                            assetAnalysis.hftMetrics.signals.volatilityRegime === 'low' ? 'text-emerald-400' :
                            assetAnalysis.hftMetrics.signals.volatilityRegime === 'extreme' ? 'text-rose-400' :
                            'text-amber-400'
                          }`}>
                            {assetAnalysis.hftMetrics.signals.volatilityRegime}
                          </div>
                        </div>
                        <div className="bg-slate-900/50 rounded-lg p-3">
                          <div className="text-[10px] text-slate-500 mb-1">LIQUIDITY</div>
                          <div className={`text-lg font-bold capitalize ${
                            assetAnalysis.hftMetrics.signals.liquidityShift === 'increasing' ? 'text-emerald-400' :
                            assetAnalysis.hftMetrics.signals.liquidityShift === 'decreasing' ? 'text-rose-400' :
                            'text-slate-400'
                          }`}>
                            {assetAnalysis.hftMetrics.signals.liquidityShift}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'derivatives' && (
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Funding Rate */}
                    <div className="bg-slate-800/30 rounded-xl border border-slate-700/30 p-4">
                      <h3 className="text-xs font-semibold text-slate-400 mb-4 flex items-center gap-2">
                        <Percent className="w-3 h-3" /> FUNDING RATE
                      </h3>
                      <div className="space-y-3">
                        <div className="text-center py-4">
                          <div className={`text-3xl font-bold font-mono ${
                            assetAnalysis.derivatives.fundingRate.rate >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            {(assetAnalysis.derivatives.fundingRate.rate * 100).toFixed(4)}%
                          </div>
                          <div className="text-xs text-slate-500 mt-1">Current Rate</div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-400">Predicted</span>
                          <span className="text-sm font-mono">
                            {(assetAnalysis.derivatives.fundingRate.predictedRate * 100).toFixed(4)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-400">Annualized</span>
                          <span className={`text-sm font-mono ${
                            assetAnalysis.derivatives.fundingRate.annualizedRate >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            {assetAnalysis.derivatives.fundingRate.annualizedRate.toFixed(2)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-400">7D Avg</span>
                          <span className="text-sm font-mono">
                            {(assetAnalysis.derivatives.fundingRate.averageRate7d * 100).toFixed(4)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Open Interest */}
                    <div className="bg-slate-800/30 rounded-xl border border-slate-700/30 p-4">
                      <h3 className="text-xs font-semibold text-slate-400 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-3 h-3" /> OPEN INTEREST
                      </h3>
                      <div className="space-y-3">
                        <div className="text-center py-2">
                          <div className="text-2xl font-bold font-mono">
                            {formatLargeNumber(assetAnalysis.derivatives.openInterest.openInterestUsd)}
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-400">1H Change</span>
                          <span className={`text-sm font-mono ${getChangeColor(assetAnalysis.derivatives.openInterest.change1h)}`}>
                            {formatPercent(assetAnalysis.derivatives.openInterest.change1h)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-400">4H Change</span>
                          <span className={`text-sm font-mono ${getChangeColor(assetAnalysis.derivatives.openInterest.change4h)}`}>
                            {formatPercent(assetAnalysis.derivatives.openInterest.change4h)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-400">24H Change</span>
                          <span className={`text-sm font-mono ${getChangeColor(assetAnalysis.derivatives.openInterest.change24h)}`}>
                            {formatPercent(assetAnalysis.derivatives.openInterest.change24h)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Liquidations */}
                    <div className="bg-slate-800/30 rounded-xl border border-slate-700/30 p-4">
                      <h3 className="text-xs font-semibold text-slate-400 mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-3 h-3" /> LIQUIDATIONS (24H)
                      </h3>
                      <div className="space-y-3">
                        <div className="text-center py-2">
                          <div className="text-2xl font-bold font-mono text-amber-400">
                            {formatLargeNumber(assetAnalysis.derivatives.liquidations.totalLiquidationUsd)}
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-emerald-400">Longs</span>
                          <span className="text-sm font-mono">
                            {formatLargeNumber(assetAnalysis.derivatives.liquidations.longLiquidationUsd)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-rose-400">Shorts</span>
                          <span className="text-sm font-mono">
                            {formatLargeNumber(assetAnalysis.derivatives.liquidations.shortLiquidationUsd)}
                          </span>
                        </div>
                        <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden flex">
                          <div
                            className="h-full bg-emerald-500"
                            style={{
                              width: `${(assetAnalysis.derivatives.liquidations.longLiquidationUsd /
                                assetAnalysis.derivatives.liquidations.totalLiquidationUsd) * 100}%`,
                            }}
                          />
                          <div className="h-full bg-rose-500 flex-1" />
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-400">Largest</span>
                          <span className="text-sm font-mono">
                            {formatLargeNumber(assetAnalysis.derivatives.liquidations.largestLiquidation)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Long/Short Ratio */}
                    <div className="bg-slate-800/30 rounded-xl border border-slate-700/30 p-4">
                      <h3 className="text-xs font-semibold text-slate-400 mb-4 flex items-center gap-2">
                        <Gauge className="w-3 h-3" /> LONG/SHORT RATIO
                      </h3>
                      <div className="space-y-3">
                        <div className="text-center py-2">
                          <div className={`text-2xl font-bold font-mono ${
                            assetAnalysis.derivatives.longShortRatio.longShortRatio > 1 ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            {assetAnalysis.derivatives.longShortRatio.longShortRatio.toFixed(2)}
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-emerald-400">Longs</span>
                          <span className="text-sm font-mono">{assetAnalysis.derivatives.longShortRatio.longRatio.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-rose-400">Shorts</span>
                          <span className="text-sm font-mono">{assetAnalysis.derivatives.longShortRatio.shortRatio.toFixed(1)}%</span>
                        </div>
                        <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden flex">
                          <div
                            className="h-full bg-emerald-500"
                            style={{ width: `${assetAnalysis.derivatives.longShortRatio.longRatio}%` }}
                          />
                          <div className="h-full bg-rose-500 flex-1" />
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-400">Retail</span>
                          <span className={`text-sm font-mono capitalize ${
                            assetAnalysis.derivatives.longShortRatio.retailSentiment === 'bullish' ? 'text-emerald-400' :
                            assetAnalysis.derivatives.longShortRatio.retailSentiment === 'bearish' ? 'text-rose-400' :
                            'text-slate-400'
                          }`}>
                            {assetAnalysis.derivatives.longShortRatio.retailSentiment}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'rwa' && globalState && (
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Tokenized Treasuries */}
                    <div className="bg-slate-800/30 rounded-xl border border-slate-700/30 p-4">
                      <h3 className="text-xs font-semibold text-slate-400 mb-4 flex items-center gap-2">
                        <Shield className="w-3 h-3" /> TOKENIZED TREASURIES
                      </h3>
                      <div className="space-y-3">
                        <div className="text-center py-2">
                          <div className="text-2xl font-bold font-mono text-blue-400">
                            {formatLargeNumber(globalState.rwa.treasuries.totalValue)}
                          </div>
                          <div className="text-xs text-slate-500">Total Value</div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-400">Avg Yield</span>
                          <span className="text-sm font-mono text-emerald-400">
                            {globalState.rwa.treasuries.avgYield.toFixed(2)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-400">Total Assets</span>
                          <span className="text-sm font-mono">{globalState.rwa.treasuries.totalAssets}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-400">Holders</span>
                          <span className="text-sm font-mono">{globalState.rwa.treasuries.holders.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-400">7D Change</span>
                          <span className={`text-sm font-mono ${getChangeColor(globalState.rwa.treasuries.change7d)}`}>
                            {formatPercent(globalState.rwa.treasuries.change7d)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stablecoins */}
                    <div className="bg-slate-800/30 rounded-xl border border-slate-700/30 p-4">
                      <h3 className="text-xs font-semibold text-slate-400 mb-4 flex items-center gap-2">
                        <DollarSign className="w-3 h-3" /> STABLECOINS
                      </h3>
                      <div className="space-y-3">
                        <div className="text-center py-2">
                          <div className="text-2xl font-bold font-mono text-emerald-400">
                            {formatLargeNumber(globalState.rwa.stablecoins.totalSupply)}
                          </div>
                          <div className="text-xs text-slate-500">Total Supply</div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-400">Dominant</span>
                          <span className="text-sm font-mono">{globalState.rwa.stablecoins.dominantIssuer}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-400">Avg Peg</span>
                          <span className={`text-sm font-mono ${
                            globalState.rwa.stablecoins.avgPeg >= 0.999 ? 'text-emerald-400' : 'text-amber-400'
                          }`}>
                            ${globalState.rwa.stablecoins.avgPeg.toFixed(4)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-400">24H Volume</span>
                          <span className="text-sm font-mono">{formatLargeNumber(globalState.rwa.stablecoins.volume24h)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-400">Depegs (24h)</span>
                          <span className={`text-sm font-mono ${
                            globalState.rwa.stablecoins.depegs24h === 0 ? 'text-emerald-400' : 'text-amber-400'
                          }`}>
                            {globalState.rwa.stablecoins.depegs24h}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Private Credit */}
                    <div className="bg-slate-800/30 rounded-xl border border-slate-700/30 p-4">
                      <h3 className="text-xs font-semibold text-slate-400 mb-4 flex items-center gap-2">
                        <Database className="w-3 h-3" /> PRIVATE CREDIT
                      </h3>
                      <div className="space-y-3">
                        <div className="text-center py-2">
                          <div className="text-2xl font-bold font-mono text-purple-400">
                            {formatLargeNumber(globalState.rwa.privateCredit.totalValue)}
                          </div>
                          <div className="text-xs text-slate-500">Total Value</div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-400">Avg APY</span>
                          <span className="text-sm font-mono text-emerald-400">
                            {globalState.rwa.privateCredit.avgApy.toFixed(2)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-400">Active Loans</span>
                          <span className="text-sm font-mono">{globalState.rwa.privateCredit.activeLoans}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-400">Default Rate</span>
                          <span className={`text-sm font-mono ${
                            globalState.rwa.privateCredit.defaultRate < 2 ? 'text-emerald-400' : 'text-amber-400'
                          }`}>
                            {globalState.rwa.privateCredit.defaultRate.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Tokenized Stocks */}
                    <div className="bg-slate-800/30 rounded-xl border border-slate-700/30 p-4">
                      <h3 className="text-xs font-semibold text-slate-400 mb-4 flex items-center gap-2">
                        <BarChart3 className="w-3 h-3" /> TOKENIZED STOCKS
                      </h3>
                      <div className="space-y-3">
                        <div className="text-center py-2">
                          <div className="text-2xl font-bold font-mono text-amber-400">
                            {formatLargeNumber(globalState.rwa.tokenizedStocks.totalValue)}
                          </div>
                          <div className="text-xs text-slate-500">Total Value</div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-400">24H Volume</span>
                          <span className="text-sm font-mono">{formatLargeNumber(globalState.rwa.tokenizedStocks.volume24h)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-400">Active Users</span>
                          <span className="text-sm font-mono">{globalState.rwa.tokenizedStocks.activeAddresses.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-400">Top Asset</span>
                          <span className="text-sm font-mono text-cyan-400">{globalState.rwa.tokenizedStocks.topAsset}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Signal Reasoning */}
                {activeTab === 'overview' && (
                  <div className="bg-slate-800/30 rounded-xl border border-slate-700/30 p-4">
                    <h3 className="text-xs font-semibold text-slate-400 mb-3 flex items-center gap-2">
                      <Brain className="w-3 h-3" /> AI ANALYSIS
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-slate-500 mb-2">SIGNAL REASONING</div>
                        <ul className="space-y-1">
                          {assetAnalysis.tradingSignal.reasoning.map((reason, i) => (
                            <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                              <span className="text-cyan-400 mt-0.5">•</span>
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-2">INDICATOR BREAKDOWN</div>
                        <div className="space-y-2">
                          {assetAnalysis.tradingSignal.indicators.map((ind, i) => (
                            <div key={i} className="flex items-center justify-between">
                              <span className="text-sm text-slate-400">{ind.name}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono">{ind.value}</span>
                                <span className={`text-xs px-1.5 py-0.5 rounded ${
                                  ind.signal === 'bullish' ? 'bg-emerald-500/20 text-emerald-400' :
                                  ind.signal === 'bearish' ? 'bg-rose-500/20 text-rose-400' :
                                  'bg-slate-600/20 text-slate-400'
                                }`}>
                                  {ind.signal}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Top Movers */}
        {globalState && activeTab === 'overview' && (
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div className="bg-slate-800/30 rounded-xl border border-slate-700/30 p-4">
              <h3 className="text-xs font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                <TrendingUp className="w-3 h-3" /> TOP GAINERS (24H)
              </h3>
              <div className="space-y-2">
                {globalState.topGainers.map((g, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-slate-700/30 last:border-0">
                    <span className="font-mono font-semibold">{g.symbol}</span>
                    <span className="font-mono text-emerald-400">{formatPercent(g.change)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-slate-800/30 rounded-xl border border-slate-700/30 p-4">
              <h3 className="text-xs font-semibold text-rose-400 mb-3 flex items-center gap-2">
                <TrendingDown className="w-3 h-3" /> TOP LOSERS (24H)
              </h3>
              <div className="space-y-2">
                {globalState.topLosers.map((l, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-slate-700/30 last:border-0">
                    <span className="font-mono font-semibold">{l.symbol}</span>
                    <span className="font-mono text-rose-400">{formatPercent(l.change)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 mt-8 py-4">
        <p className="text-center text-slate-600 text-xs">
          OVERUNDER.AI • HFT Intelligence Terminal • Data aggregated from CoinGecko • Not financial advice
        </p>
      </footer>
    </div>
  );
}
