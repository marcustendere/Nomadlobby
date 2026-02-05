import type { VercelRequest, VercelResponse } from '@vercel/node';

// Types
interface MarketData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency?: number;
  price_change_percentage_30d_in_currency?: number;
  ath: number;
  ath_change_percentage: number;
  sparkline_in_7d?: { price: number[] };
}

interface OHLCV {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
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

interface AssetInsight {
  asset: {
    id: string;
    symbol: string;
    name: string;
    price: number;
    marketCap: number;
    rank: number;
    volume24h: number;
  };
  priceAnalysis: {
    change24h: number;
    change7d: number | null;
    change30d: number | null;
    high24h: number;
    low24h: number;
    athDistance: number;
    volatility: number;
  };
  technicalIndicators: TechnicalIndicators;
  signals: {
    overall: 'BUY' | 'SELL' | 'HOLD';
    strength: 'very_strong' | 'strong' | 'moderate' | 'weak';
    confidence: number;
    reasons: string[];
  };
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

interface InsightsResponse {
  timestamp: number;
  market: MarketOverview;
  assets: AssetInsight[];
  topMovers: {
    gainers: { symbol: string; name: string; change: number }[];
    losers: { symbol: string; name: string; change: number }[];
  };
  summary: string;
}

// Technical Analysis Utilities
function calculateSMA(data: number[], period: number): number {
  if (data.length < period) return data[data.length - 1] || 0;
  const slice = data.slice(-period);
  return slice.reduce((sum, val) => sum + val, 0) / period;
}

function calculateEMA(data: number[], period: number): number {
  if (data.length === 0) return 0;
  if (data.length < period) return data[data.length - 1];
  const multiplier = 2 / (period + 1);
  let ema = calculateSMA(data.slice(0, period), period);
  for (let i = period; i < data.length; i++) {
    ema = (data[i] - ema) * multiplier + ema;
  }
  return ema;
}

function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length < period + 1) return 50;
  const changes: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1]);
  }
  const gains = changes.map(change => (change > 0 ? change : 0));
  const losses = changes.map(change => (change < 0 ? Math.abs(change) : 0));
  const avgGain = calculateSMA(gains, period);
  const avgLoss = calculateSMA(losses, period);
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

function calculateMACD(prices: number[]): { macd: number; signal: number; histogram: number } {
  if (prices.length < 26) return { macd: 0, signal: 0, histogram: 0 };
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const macd = ema12 - ema26;
  const macdHistory: number[] = [];
  for (let i = 26; i <= prices.length; i++) {
    const slice = prices.slice(0, i);
    macdHistory.push(calculateEMA(slice, 12) - calculateEMA(slice, 26));
  }
  const signal = calculateEMA(macdHistory, 9);
  return { macd, signal, histogram: macd - signal };
}

function calculateBollingerBands(prices: number[], period: number = 20, stdDev: number = 2) {
  if (prices.length < period) {
    const price = prices[prices.length - 1] || 0;
    return { upper: price, middle: price, lower: price };
  }
  const sma = calculateSMA(prices, period);
  const slice = prices.slice(-period);
  const squaredDiffs = slice.map(price => Math.pow(price - sma, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / period;
  const standardDeviation = Math.sqrt(variance);
  return {
    upper: sma + standardDeviation * stdDev,
    middle: sma,
    lower: sma - standardDeviation * stdDev,
  };
}

function calculateVolatility(prices: number[]): number {
  if (prices.length < 2) return 0;
  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
  }
  const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
  return Math.sqrt(variance) * 100;
}

function analyzeAsset(market: MarketData, ohlcv: OHLCV[]): AssetInsight {
  const prices = ohlcv.map(c => c.close);
  const highs = ohlcv.map(c => c.high);
  const lows = ohlcv.map(c => c.low);

  // Calculate technical indicators
  const rsi = calculateRSI(prices);
  const macd = calculateMACD(prices);
  const bb = calculateBollingerBands(prices);
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const ema50 = calculateEMA(prices, 50);
  const sma20 = calculateSMA(prices, 20);
  const sma50 = calculateSMA(prices, 50);

  // Determine trend
  let trend: 'bullish' | 'bearish' | 'neutral' = 'neutral';
  if (ema12 > ema26 && ema26 > ema50 && market.current_price > sma20) {
    trend = 'bullish';
  } else if (ema12 < ema26 && ema26 < ema50 && market.current_price < sma20) {
    trend = 'bearish';
  }

  // Determine momentum
  let momentum: 'strong' | 'moderate' | 'weak' = 'moderate';
  if (Math.abs(macd.histogram) > Math.abs(macd.signal) * 0.5) {
    momentum = 'strong';
  } else if (Math.abs(macd.histogram) < Math.abs(macd.signal) * 0.2) {
    momentum = 'weak';
  }

  // Generate signals
  const reasons: string[] = [];
  let bullishScore = 0;
  let bearishScore = 0;

  // RSI signals
  if (rsi < 30) {
    reasons.push('RSI indicates oversold conditions');
    bullishScore += 2;
  } else if (rsi > 70) {
    reasons.push('RSI indicates overbought conditions');
    bearishScore += 2;
  }

  // MACD signals
  if (macd.histogram > 0 && macd.macd > macd.signal) {
    reasons.push('MACD showing bullish momentum');
    bullishScore += 2;
  } else if (macd.histogram < 0 && macd.macd < macd.signal) {
    reasons.push('MACD showing bearish momentum');
    bearishScore += 2;
  }

  // Bollinger Bands signals
  if (market.current_price < bb.lower) {
    reasons.push('Price below lower Bollinger Band (potential reversal)');
    bullishScore += 1;
  } else if (market.current_price > bb.upper) {
    reasons.push('Price above upper Bollinger Band (potential pullback)');
    bearishScore += 1;
  }

  // EMA alignment
  if (ema12 > ema26 && ema26 > ema50) {
    reasons.push('EMA alignment is bullish');
    bullishScore += 1;
  } else if (ema12 < ema26 && ema26 < ema50) {
    reasons.push('EMA alignment is bearish');
    bearishScore += 1;
  }

  // Price vs SMA
  if (market.current_price > sma50) {
    reasons.push('Price trading above 50-day SMA');
    bullishScore += 1;
  } else {
    reasons.push('Price trading below 50-day SMA');
    bearishScore += 1;
  }

  // Determine overall signal
  const totalScore = bullishScore + bearishScore;
  const bullishPercentage = totalScore > 0 ? (bullishScore / totalScore) * 100 : 50;

  let overall: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
  let strength: 'very_strong' | 'strong' | 'moderate' | 'weak' = 'moderate';

  if (bullishPercentage > 70) {
    overall = 'BUY';
    strength = bullishPercentage > 85 ? 'very_strong' : bullishPercentage > 75 ? 'strong' : 'moderate';
  } else if (bullishPercentage < 30) {
    overall = 'SELL';
    strength = bullishPercentage < 15 ? 'very_strong' : bullishPercentage < 25 ? 'strong' : 'moderate';
  } else {
    strength = 'weak';
  }

  // Calculate support and resistance
  const recentHigh = Math.max(...highs.slice(-20));
  const recentLow = Math.min(...lows.slice(-20));

  return {
    asset: {
      id: market.id,
      symbol: market.symbol.toUpperCase(),
      name: market.name,
      price: market.current_price,
      marketCap: market.market_cap,
      rank: market.market_cap_rank,
      volume24h: market.total_volume,
    },
    priceAnalysis: {
      change24h: market.price_change_percentage_24h,
      change7d: market.price_change_percentage_7d_in_currency ?? null,
      change30d: market.price_change_percentage_30d_in_currency ?? null,
      high24h: market.high_24h,
      low24h: market.low_24h,
      athDistance: market.ath_change_percentage,
      volatility: calculateVolatility(prices),
    },
    technicalIndicators: {
      rsi,
      macd,
      bollingerBands: bb,
      ema: { ema12, ema26, ema50 },
      sma: { sma20, sma50 },
      trend,
      momentum,
    },
    signals: {
      overall,
      strength,
      confidence: Math.abs(bullishPercentage - 50) * 2,
      reasons,
    },
    support: recentLow,
    resistance: recentHigh,
  };
}

function calculateFearGreedIndex(assets: MarketData[]): { index: number; label: string } {
  // Simplified fear/greed calculation based on market metrics
  let score = 50;

  // Price momentum factor
  const avgChange24h =
    assets.reduce((sum, a) => sum + (a.price_change_percentage_24h || 0), 0) / assets.length;
  score += avgChange24h * 2;

  // Volatility factor (higher volatility = more fear)
  const avgVolatility = assets.reduce((sum, a) => {
    const prices = a.sparkline_in_7d?.price || [];
    return sum + calculateVolatility(prices);
  }, 0) / assets.length;
  score -= avgVolatility * 0.5;

  // ATH distance factor
  const avgAthDistance =
    assets.reduce((sum, a) => sum + (a.ath_change_percentage || 0), 0) / assets.length;
  score += avgAthDistance * 0.1;

  // Clamp between 0-100
  score = Math.max(0, Math.min(100, score));

  let label: string;
  if (score <= 20) label = 'Extreme Fear';
  else if (score <= 40) label = 'Fear';
  else if (score <= 60) label = 'Neutral';
  else if (score <= 80) label = 'Greed';
  else label = 'Extreme Greed';

  return { index: Math.round(score), label };
}

function generateMarketSummary(
  market: MarketOverview,
  assets: AssetInsight[],
  topGainers: { symbol: string; change: number }[],
  topLosers: { symbol: string; change: number }[]
): string {
  const buySignals = assets.filter(a => a.signals.overall === 'BUY').length;
  const sellSignals = assets.filter(a => a.signals.overall === 'SELL').length;

  let summary = `Market Overview: The crypto market is showing ${market.marketTrend} sentiment with a Fear & Greed Index of ${market.fearGreedIndex} (${market.fearGreedLabel}). `;
  summary += `BTC dominance is at ${market.btcDominance.toFixed(1)}%. `;

  if (buySignals > sellSignals) {
    summary += `Technical analysis suggests bullish conditions with ${buySignals} buy signals across tracked assets. `;
  } else if (sellSignals > buySignals) {
    summary += `Technical analysis suggests bearish conditions with ${sellSignals} sell signals across tracked assets. `;
  } else {
    summary += `Market signals are mixed - consider waiting for clearer trends. `;
  }

  if (topGainers.length > 0) {
    summary += `Top performer: ${topGainers[0].symbol} (+${topGainers[0].change.toFixed(2)}%). `;
  }
  if (topLosers.length > 0) {
    summary += `Biggest decline: ${topLosers[0].symbol} (${topLosers[0].change.toFixed(2)}%).`;
  }

  return summary;
}

// Tracked assets
const TRACKED_ASSETS = [
  'bitcoin',
  'ethereum',
  'solana',
  'ripple',
  'hyperliquid',
  'zcash',
  'bitcoin-cash',
  'core-dao',
];

// API Handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Fetch market data from CoinGecko
    const [marketResponse, globalResponse] = await Promise.all([
      fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${TRACKED_ASSETS.join(',')}&order=market_cap_desc&per_page=50&page=1&sparkline=true&price_change_percentage=24h,7d,30d`
      ),
      fetch('https://api.coingecko.com/api/v3/global'),
    ]);

    if (!marketResponse.ok || !globalResponse.ok) {
      throw new Error('Failed to fetch market data');
    }

    const marketData: MarketData[] = await marketResponse.json();
    const globalData = await globalResponse.json();

    // Fetch OHLCV data for each asset
    const ohlcvPromises = TRACKED_ASSETS.map(async (id) => {
      try {
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/${id}/ohlc?vs_currency=usd&days=30`
        );
        if (!response.ok) return { id, data: [] };
        const data: number[][] = await response.json();
        return {
          id,
          data: data.map(([timestamp, open, high, low, close]) => ({
            timestamp: timestamp / 1000,
            open,
            high,
            low,
            close,
          })),
        };
      } catch {
        return { id, data: [] };
      }
    });

    const ohlcvResults = await Promise.all(ohlcvPromises);
    const ohlcvMap = new Map(ohlcvResults.map(r => [r.id, r.data]));

    // Analyze each asset
    const assetInsights: AssetInsight[] = [];
    for (const market of marketData) {
      const ohlcv = ohlcvMap.get(market.id) || [];
      if (ohlcv.length > 0) {
        assetInsights.push(analyzeAsset(market, ohlcv));
      }
    }

    // Sort by market cap rank
    assetInsights.sort((a, b) => a.asset.rank - b.asset.rank);

    // Calculate market overview
    const global = globalData.data;
    const fearGreed = calculateFearGreedIndex(marketData);

    const avgChange24h =
      marketData.reduce((sum, m) => sum + (m.price_change_percentage_24h || 0), 0) /
      marketData.length;
    let marketTrend: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    if (avgChange24h > 2) marketTrend = 'bullish';
    else if (avgChange24h < -2) marketTrend = 'bearish';

    const marketOverview: MarketOverview = {
      totalMarketCap: global.total_market_cap?.usd || 0,
      total24hVolume: global.total_volume?.usd || 0,
      btcDominance: global.market_cap_percentage?.btc || 0,
      ethDominance: global.market_cap_percentage?.eth || 0,
      marketTrend,
      fearGreedIndex: fearGreed.index,
      fearGreedLabel: fearGreed.label,
    };

    // Get top movers
    const sortedByChange = [...marketData].sort(
      (a, b) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0)
    );

    const topGainers = sortedByChange
      .filter(m => (m.price_change_percentage_24h || 0) > 0)
      .slice(0, 3)
      .map(m => ({
        symbol: m.symbol.toUpperCase(),
        name: m.name,
        change: m.price_change_percentage_24h || 0,
      }));

    const topLosers = sortedByChange
      .filter(m => (m.price_change_percentage_24h || 0) < 0)
      .slice(-3)
      .reverse()
      .map(m => ({
        symbol: m.symbol.toUpperCase(),
        name: m.name,
        change: m.price_change_percentage_24h || 0,
      }));

    // Generate summary
    const summary = generateMarketSummary(marketOverview, assetInsights, topGainers, topLosers);

    const response: InsightsResponse = {
      timestamp: Date.now(),
      market: marketOverview,
      assets: assetInsights,
      topMovers: {
        gainers: topGainers,
        losers: topLosers,
      },
      summary,
    };

    // Cache for 30 seconds
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');

    return res.status(200).json(response);
  } catch (error) {
    console.error('Insights API Error:', error);
    return res.status(500).json({
      error: 'Failed to generate insights',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
