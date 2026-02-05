import { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  Target,
  AlertTriangle,
  RefreshCw,
  ArrowLeft,
  Gauge,
  Zap,
} from 'lucide-react';

// Types matching the API response
interface AssetInfo {
  id: string;
  symbol: string;
  name: string;
  price: number;
  marketCap: number;
  rank: number;
  volume24h: number;
}

interface PriceAnalysis {
  change24h: number;
  change7d: number | null;
  change30d: number | null;
  high24h: number;
  low24h: number;
  athDistance: number;
  volatility: number;
}

interface TechnicalIndicators {
  rsi: number;
  macd: { macd: number; signal: number; histogram: number };
  bollingerBands: { upper: number; middle: number; lower: number };
  ema: { ema12: number; ema26: number; ema50: number };
  sma: { sma20: number; sma50: number };
  trend: 'bullish' | 'bearish' | 'neutral';
  momentum: 'strong' | 'moderate' | 'weak';
}

interface Signals {
  overall: 'BUY' | 'SELL' | 'HOLD';
  strength: 'very_strong' | 'strong' | 'moderate' | 'weak';
  confidence: number;
  reasons: string[];
}

interface AssetInsight {
  asset: AssetInfo;
  priceAnalysis: PriceAnalysis;
  technicalIndicators: TechnicalIndicators;
  signals: Signals;
  support: number;
  resistance: number;
}

interface MarketOverview {
  totalMarketCap: number;
  total24hVolume: number;
  btcDominance: number;
  ethDominance: number;
  marketTrend: 'bullish' | 'bearish' | 'neutral';
  fearGreedIndex: number;
  fearGreedLabel: string;
}

interface TopMover {
  symbol: string;
  name: string;
  change: number;
}

interface InsightsData {
  timestamp: number;
  market: MarketOverview;
  assets: AssetInsight[];
  topMovers: {
    gainers: TopMover[];
    losers: TopMover[];
  };
  summary: string;
}

interface InsightsPageProps {
  onBack: () => void;
}

export default function InsightsPage({ onBack }: InsightsPageProps) {
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/insights');
      if (!response.ok) throw new Error('Failed to fetch insights');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const formatPrice = (price: number) => {
    if (price >= 1000) return `$${price.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
    if (price >= 1) return `$${price.toFixed(4)}`;
    return `$${price.toFixed(6)}`;
  };

  const formatLargeNumber = (num: number) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toLocaleString()}`;
  };

  const formatPercent = (val: number | null) => {
    if (val === null) return 'N/A';
    const sign = val >= 0 ? '+' : '';
    return `${sign}${val.toFixed(2)}%`;
  };

  const getSignalColor = (signal: 'BUY' | 'SELL' | 'HOLD') => {
    if (signal === 'BUY') return 'text-[#00ff88] bg-[#00ff88]/10 border-[#00ff88]/30';
    if (signal === 'SELL') return 'text-[#ff3366] bg-[#ff3366]/10 border-[#ff3366]/30';
    return 'text-[#ffaa00] bg-[#ffaa00]/10 border-[#ffaa00]/30';
  };

  const getTrendColor = (trend: 'bullish' | 'bearish' | 'neutral') => {
    if (trend === 'bullish') return 'text-[#00ff88]';
    if (trend === 'bearish') return 'text-[#ff3366]';
    return 'text-[#888]';
  };

  const getFearGreedColor = (index: number) => {
    if (index <= 20) return 'text-[#ff3366]';
    if (index <= 40) return 'text-[#ff6644]';
    if (index <= 60) return 'text-[#ffaa00]';
    if (index <= 80) return 'text-[#88cc00]';
    return 'text-[#00ff88]';
  };

  const getRSIColor = (rsi: number) => {
    if (rsi < 30) return 'text-[#00ff88]';
    if (rsi > 70) return 'text-[#ff3366]';
    return 'text-[#e0e0e0]';
  };

  const selectedInsight = data?.assets.find(a => a.asset.id === selectedAsset);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-[#00ff88] animate-spin mx-auto mb-4" />
          <p className="text-[#888] font-mono">Loading market insights...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-[#ff3366] mx-auto mb-4" />
          <p className="text-[#ff3366] font-mono mb-4">{error}</p>
          <button
            onClick={fetchInsights}
            className="px-4 py-2 bg-[#1a1a2e] border border-[#333] rounded hover:bg-[#252540] transition-colors font-mono text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#e0e0e0]">
      {/* Header */}
      <header className="bg-[#0d0d15] border-b border-[#1a1a2e] px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-[#888] hover:text-[#e0e0e0] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-mono text-sm">Back</span>
            </button>
            <div className="h-6 w-px bg-[#333]" />
            <h1 className="text-xl font-bold text-[#00ff88] font-mono tracking-tight">
              MARKET INSIGHTS
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-[#666] font-mono">
              Updated: {new Date(data.timestamp).toLocaleTimeString()}
            </span>
            <button
              onClick={fetchInsights}
              className="p-2 hover:bg-[#1a1a2e] rounded transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4 text-[#888]" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Summary */}
        <div className="bg-[#0d0d15] border border-[#1a1a2e] rounded-lg p-4">
          <p className="text-[#ccc] font-mono text-sm leading-relaxed">{data.summary}</p>
        </div>

        {/* Market Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-[#0d0d15] border border-[#1a1a2e] rounded-lg p-4">
            <div className="flex items-center gap-2 text-[#666] text-xs font-mono mb-2">
              <BarChart3 className="w-4 h-4" />
              MARKET CAP
            </div>
            <p className="text-lg font-mono font-bold">{formatLargeNumber(data.market.totalMarketCap)}</p>
          </div>

          <div className="bg-[#0d0d15] border border-[#1a1a2e] rounded-lg p-4">
            <div className="flex items-center gap-2 text-[#666] text-xs font-mono mb-2">
              <Activity className="w-4 h-4" />
              24H VOLUME
            </div>
            <p className="text-lg font-mono font-bold">{formatLargeNumber(data.market.total24hVolume)}</p>
          </div>

          <div className="bg-[#0d0d15] border border-[#1a1a2e] rounded-lg p-4">
            <div className="flex items-center gap-2 text-[#666] text-xs font-mono mb-2">
              <Target className="w-4 h-4" />
              BTC DOM
            </div>
            <p className="text-lg font-mono font-bold">{data.market.btcDominance.toFixed(1)}%</p>
          </div>

          <div className="bg-[#0d0d15] border border-[#1a1a2e] rounded-lg p-4">
            <div className="flex items-center gap-2 text-[#666] text-xs font-mono mb-2">
              <Target className="w-4 h-4" />
              ETH DOM
            </div>
            <p className="text-lg font-mono font-bold">{data.market.ethDominance.toFixed(1)}%</p>
          </div>

          <div className="bg-[#0d0d15] border border-[#1a1a2e] rounded-lg p-4">
            <div className="flex items-center gap-2 text-[#666] text-xs font-mono mb-2">
              <Gauge className="w-4 h-4" />
              FEAR/GREED
            </div>
            <p className={`text-lg font-mono font-bold ${getFearGreedColor(data.market.fearGreedIndex)}`}>
              {data.market.fearGreedIndex}
            </p>
            <p className="text-xs text-[#666] font-mono">{data.market.fearGreedLabel}</p>
          </div>

          <div className="bg-[#0d0d15] border border-[#1a1a2e] rounded-lg p-4">
            <div className="flex items-center gap-2 text-[#666] text-xs font-mono mb-2">
              <Zap className="w-4 h-4" />
              TREND
            </div>
            <p className={`text-lg font-mono font-bold capitalize ${getTrendColor(data.market.marketTrend)}`}>
              {data.market.marketTrend}
            </p>
          </div>
        </div>

        {/* Top Movers */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-[#0d0d15] border border-[#1a1a2e] rounded-lg p-4">
            <h3 className="flex items-center gap-2 text-[#00ff88] font-mono font-bold mb-3">
              <TrendingUp className="w-4 h-4" />
              TOP GAINERS
            </h3>
            <div className="space-y-2">
              {data.topMovers.gainers.map((g, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-[#1a1a2e] last:border-0">
                  <div>
                    <span className="font-mono font-bold">{g.symbol}</span>
                    <span className="text-[#666] text-sm ml-2">{g.name}</span>
                  </div>
                  <span className="text-[#00ff88] font-mono">+{g.change.toFixed(2)}%</span>
                </div>
              ))}
              {data.topMovers.gainers.length === 0 && (
                <p className="text-[#666] text-sm font-mono">No gainers</p>
              )}
            </div>
          </div>

          <div className="bg-[#0d0d15] border border-[#1a1a2e] rounded-lg p-4">
            <h3 className="flex items-center gap-2 text-[#ff3366] font-mono font-bold mb-3">
              <TrendingDown className="w-4 h-4" />
              TOP LOSERS
            </h3>
            <div className="space-y-2">
              {data.topMovers.losers.map((l, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-[#1a1a2e] last:border-0">
                  <div>
                    <span className="font-mono font-bold">{l.symbol}</span>
                    <span className="text-[#666] text-sm ml-2">{l.name}</span>
                  </div>
                  <span className="text-[#ff3366] font-mono">{l.change.toFixed(2)}%</span>
                </div>
              ))}
              {data.topMovers.losers.length === 0 && (
                <p className="text-[#666] text-sm font-mono">No losers</p>
              )}
            </div>
          </div>
        </div>

        {/* Asset Insights Grid */}
        <div>
          <h2 className="text-lg font-mono font-bold text-[#e0e0e0] mb-4">ASSET ANALYSIS</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {data.assets.map(insight => (
              <div
                key={insight.asset.id}
                onClick={() => setSelectedAsset(selectedAsset === insight.asset.id ? null : insight.asset.id)}
                className={`bg-[#0d0d15] border rounded-lg p-4 cursor-pointer transition-all hover:border-[#333] ${
                  selectedAsset === insight.asset.id ? 'border-[#00ff88]' : 'border-[#1a1a2e]'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-mono font-bold text-lg">{insight.asset.symbol}</h3>
                    <p className="text-[#666] text-xs font-mono">{insight.asset.name}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded border text-xs font-mono font-bold ${getSignalColor(
                      insight.signals.overall
                    )}`}
                  >
                    {insight.signals.overall}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#666] text-sm">Price</span>
                    <span className="font-mono">{formatPrice(insight.asset.price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#666] text-sm">24h</span>
                    <span
                      className={`font-mono ${
                        insight.priceAnalysis.change24h >= 0 ? 'text-[#00ff88]' : 'text-[#ff3366]'
                      }`}
                    >
                      {formatPercent(insight.priceAnalysis.change24h)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#666] text-sm">RSI</span>
                    <span className={`font-mono ${getRSIColor(insight.technicalIndicators.rsi)}`}>
                      {insight.technicalIndicators.rsi.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#666] text-sm">Trend</span>
                    <span
                      className={`font-mono capitalize ${getTrendColor(insight.technicalIndicators.trend)}`}
                    >
                      {insight.technicalIndicators.trend}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#666] text-sm">Confidence</span>
                    <span className="font-mono">{insight.signals.confidence.toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Asset Detail */}
        {selectedInsight && (
          <div className="bg-[#0d0d15] border border-[#00ff88]/30 rounded-lg p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-mono font-bold">
                  {selectedInsight.asset.symbol}{' '}
                  <span className="text-[#666] text-lg">/ {selectedInsight.asset.name}</span>
                </h2>
                <p className="text-[#888] text-sm font-mono">Rank #{selectedInsight.asset.rank}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-mono font-bold">{formatPrice(selectedInsight.asset.price)}</p>
                <p
                  className={`font-mono ${
                    selectedInsight.priceAnalysis.change24h >= 0 ? 'text-[#00ff88]' : 'text-[#ff3366]'
                  }`}
                >
                  {formatPercent(selectedInsight.priceAnalysis.change24h)} (24h)
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Price Analysis */}
              <div>
                <h4 className="text-[#666] text-xs font-mono mb-3 border-b border-[#1a1a2e] pb-2">
                  PRICE ANALYSIS
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#888]">24h High</span>
                    <span className="font-mono">{formatPrice(selectedInsight.priceAnalysis.high24h)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#888]">24h Low</span>
                    <span className="font-mono">{formatPrice(selectedInsight.priceAnalysis.low24h)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#888]">7d Change</span>
                    <span
                      className={`font-mono ${
                        (selectedInsight.priceAnalysis.change7d ?? 0) >= 0
                          ? 'text-[#00ff88]'
                          : 'text-[#ff3366]'
                      }`}
                    >
                      {formatPercent(selectedInsight.priceAnalysis.change7d)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#888]">30d Change</span>
                    <span
                      className={`font-mono ${
                        (selectedInsight.priceAnalysis.change30d ?? 0) >= 0
                          ? 'text-[#00ff88]'
                          : 'text-[#ff3366]'
                      }`}
                    >
                      {formatPercent(selectedInsight.priceAnalysis.change30d)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#888]">From ATH</span>
                    <span className="font-mono text-[#ff3366]">
                      {selectedInsight.priceAnalysis.athDistance.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#888]">Volatility</span>
                    <span className="font-mono">{selectedInsight.priceAnalysis.volatility.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#888]">Support</span>
                    <span className="font-mono text-[#00ff88]">{formatPrice(selectedInsight.support)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#888]">Resistance</span>
                    <span className="font-mono text-[#ff3366]">{formatPrice(selectedInsight.resistance)}</span>
                  </div>
                </div>
              </div>

              {/* Technical Indicators */}
              <div>
                <h4 className="text-[#666] text-xs font-mono mb-3 border-b border-[#1a1a2e] pb-2">
                  TECHNICAL INDICATORS
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#888]">RSI (14)</span>
                    <span className={`font-mono ${getRSIColor(selectedInsight.technicalIndicators.rsi)}`}>
                      {selectedInsight.technicalIndicators.rsi.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#888]">MACD</span>
                    <span
                      className={`font-mono ${
                        selectedInsight.technicalIndicators.macd.histogram >= 0
                          ? 'text-[#00ff88]'
                          : 'text-[#ff3366]'
                      }`}
                    >
                      {selectedInsight.technicalIndicators.macd.macd.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#888]">Signal</span>
                    <span className="font-mono">
                      {selectedInsight.technicalIndicators.macd.signal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#888]">BB Upper</span>
                    <span className="font-mono">
                      {formatPrice(selectedInsight.technicalIndicators.bollingerBands.upper)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#888]">BB Lower</span>
                    <span className="font-mono">
                      {formatPrice(selectedInsight.technicalIndicators.bollingerBands.lower)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#888]">EMA 50</span>
                    <span className="font-mono">
                      {formatPrice(selectedInsight.technicalIndicators.ema.ema50)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#888]">SMA 50</span>
                    <span className="font-mono">
                      {formatPrice(selectedInsight.technicalIndicators.sma.sma50)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Trading Signal */}
              <div>
                <h4 className="text-[#666] text-xs font-mono mb-3 border-b border-[#1a1a2e] pb-2">
                  TRADING SIGNAL
                </h4>
                <div
                  className={`text-center py-4 px-3 rounded-lg border mb-4 ${getSignalColor(
                    selectedInsight.signals.overall
                  )}`}
                >
                  <p className="text-2xl font-mono font-bold">{selectedInsight.signals.overall}</p>
                  <p className="text-xs uppercase mt-1">
                    {selectedInsight.signals.strength} • {selectedInsight.signals.confidence.toFixed(0)}%
                    confidence
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-[#888] text-xs font-mono">REASONING:</p>
                  <ul className="space-y-1">
                    {selectedInsight.signals.reasons.map((reason, i) => (
                      <li key={i} className="text-sm text-[#ccc] flex items-start gap-2">
                        <span className="text-[#00ff88] mt-1">•</span>
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1a1a2e] mt-8 py-4">
        <p className="text-center text-[#666] text-xs font-mono">
          Data provided by CoinGecko API • Not financial advice
        </p>
      </footer>
    </div>
  );
}
