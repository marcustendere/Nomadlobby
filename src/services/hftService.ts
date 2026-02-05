// OVERUNDER.AI - HFT Data Service
import axios from 'axios';
import type {
  LatencyMetrics,
  OrderFlowMetrics,
  MarketMicrostructure,
  HFTSignals,
  FundingRateData,
  OpenInterestData,
  LiquidationData,
  LongShortRatio,
  RWAMetrics,
  EnhancedMarketData,
  AdvancedIndicators,
  MarketSentiment,
  TradingSignal,
  AssetAnalysis,
  GlobalMarketState,
} from '../types/hft';
import { TRACKED_ASSETS } from '../types/hft';

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

// ==================== Technical Analysis Utilities ====================
function calculateSMA(data: number[], period: number): number {
  if (data.length < period) return data[data.length - 1] || 0;
  return data.slice(-period).reduce((a, b) => a + b, 0) / period;
}

function calculateEMA(data: number[], period: number): number {
  if (data.length === 0) return 0;
  if (data.length < period) return data[data.length - 1];
  const k = 2 / (period + 1);
  let ema = calculateSMA(data.slice(0, period), period);
  for (let i = period; i < data.length; i++) {
    ema = data[i] * k + ema * (1 - k);
  }
  return ema;
}

function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length < period + 1) return 50;
  const changes = prices.slice(1).map((p, i) => p - prices[i]);
  const gains = changes.map(c => (c > 0 ? c : 0));
  const losses = changes.map(c => (c < 0 ? Math.abs(c) : 0));
  const avgGain = calculateSMA(gains.slice(-period), period);
  const avgLoss = calculateSMA(losses.slice(-period), period);
  if (avgLoss === 0) return 100;
  return 100 - 100 / (1 + avgGain / avgLoss);
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
    const p = prices[prices.length - 1] || 0;
    return { upper: p, middle: p, lower: p, width: 0 };
  }
  const sma = calculateSMA(prices, period);
  const slice = prices.slice(-period);
  const variance = slice.reduce((sum, p) => sum + Math.pow(p - sma, 2), 0) / period;
  const std = Math.sqrt(variance);
  return {
    upper: sma + std * stdDev,
    middle: sma,
    lower: sma - std * stdDev,
    width: ((sma + std * stdDev) - (sma - std * stdDev)) / sma * 100,
  };
}

function calculateATR(highs: number[], lows: number[], closes: number[], period: number = 14): number {
  if (highs.length < 2) return 0;
  const trs: number[] = [];
  for (let i = 1; i < highs.length; i++) {
    const tr = Math.max(
      highs[i] - lows[i],
      Math.abs(highs[i] - closes[i - 1]),
      Math.abs(lows[i] - closes[i - 1])
    );
    trs.push(tr);
  }
  return calculateSMA(trs.slice(-period), period);
}

function calculateVolatility(prices: number[]): number {
  if (prices.length < 2) return 0;
  const returns = prices.slice(1).map((p, i) => (p - prices[i]) / prices[i]);
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
  return Math.sqrt(variance) * 100;
}

// ==================== HFT Metrics Generation ====================
function generateLatencyMetrics(): LatencyMetrics {
  const baseLatency = 0.5 + Math.random() * 2; // 0.5-2.5ms base
  return {
    exchangeLatency: baseLatency * 1000, // microseconds
    orderBookLatency: (baseLatency + Math.random() * 0.5) * 1000,
    executionLatency: (baseLatency + Math.random() * 1) * 1000,
    networkLatency: 50 + Math.random() * 100, // 50-150 microseconds
    totalRoundTrip: (baseLatency * 2 + Math.random()) * 1000,
    jitter: Math.random() * 50,
    packetLoss: Math.random() * 0.01, // 0-1%
    timestamp: Date.now(),
  };
}

function generateOrderFlowMetrics(price: number, volume: number): OrderFlowMetrics {
  const buyRatio = 0.3 + Math.random() * 0.4; // 30-70%
  const buyVolume = volume * buyRatio;
  const sellVolume = volume * (1 - buyRatio);
  const buyOrders = Math.floor(1000 + Math.random() * 5000);
  const sellOrders = Math.floor(1000 + Math.random() * 5000);

  return {
    buyVolume,
    sellVolume,
    netFlow: buyVolume - sellVolume,
    buyOrders,
    sellOrders,
    largeOrdersCount: Math.floor(Math.random() * 50),
    avgOrderSize: volume / (buyOrders + sellOrders),
    vwap: price * (0.998 + Math.random() * 0.004),
    twap: price * (0.997 + Math.random() * 0.006),
    cvd: (buyVolume - sellVolume) * (Math.random() > 0.5 ? 1 : -1),
    delta: buyVolume - sellVolume,
    deltaPercent: ((buyVolume - sellVolume) / volume) * 100,
    imbalance: (buyOrders - sellOrders) / (buyOrders + sellOrders),
    timestamp: Date.now(),
  };
}

function generateMarketMicrostructure(price: number): MarketMicrostructure {
  const spreadBps = 1 + Math.random() * 10; // 1-11 bps
  const spread = price * spreadBps / 10000;

  return {
    bidAskSpread: spread,
    spreadBps,
    midPrice: price,
    microprice: price * (0.9999 + Math.random() * 0.0002),
    tickSize: price < 100 ? 0.01 : price < 1000 ? 0.1 : 1,
    depth: {
      bids: 1000000 + Math.random() * 5000000,
      asks: 1000000 + Math.random() * 5000000,
      ratio: 0.8 + Math.random() * 0.4,
    },
    toxicFlow: Math.random() * 100,
    effectiveSpread: spread * (1 + Math.random() * 0.5),
    realizedSpread: spread * (0.5 + Math.random() * 0.5),
    priceImpact: Math.random() * 0.1,
  };
}

function generateHFTSignals(rsi: number, macdHist: number, volatility: number): HFTSignals {
  const momentumScore = ((rsi - 50) * 2) + (macdHist > 0 ? 20 : -20);

  let volatilityRegime: HFTSignals['volatilityRegime'] = 'normal';
  if (volatility < 1) volatilityRegime = 'low';
  else if (volatility > 5) volatilityRegime = 'high';
  else if (volatility > 10) volatilityRegime = 'extreme';

  let marketState: HFTSignals['marketState'] = 'ranging';
  if (Math.abs(momentumScore) > 50) marketState = 'trending';
  if (Math.abs(momentumScore) > 70 && volatility > 5) marketState = 'breakout';

  return {
    momentumScore: Math.max(-100, Math.min(100, momentumScore)),
    meanReversionScore: -momentumScore * 0.5,
    arbitrageOpportunity: Math.random() < 0.05,
    spreadCompression: Math.random() < 0.2,
    liquidityShift: Math.random() < 0.33 ? 'increasing' : Math.random() < 0.5 ? 'decreasing' : 'stable',
    orderFlowToxicity: volatility > 5 ? 'high' : volatility > 2 ? 'medium' : 'low',
    volatilityRegime,
    marketState,
  };
}

// ==================== Derivatives Metrics ====================
function generateFundingRate(symbol: string, _price: number): FundingRateData {
  const rate = (Math.random() - 0.5) * 0.002; // -0.1% to 0.1%
  return {
    symbol,
    rate,
    predictedRate: rate * (0.8 + Math.random() * 0.4),
    nextFundingTime: Date.now() + Math.random() * 8 * 60 * 60 * 1000,
    fundingInterval: 8,
    annualizedRate: rate * 3 * 365 * 100,
    averageRate7d: rate * (0.7 + Math.random() * 0.6),
    rateChange24h: (Math.random() - 0.5) * 50,
    exchange: 'Aggregate',
  };
}

function generateOpenInterest(symbol: string, marketCap: number): OpenInterestData {
  const oi = marketCap * (0.01 + Math.random() * 0.05);
  return {
    symbol,
    openInterest: oi / 50000,
    openInterestUsd: oi,
    change1h: (Math.random() - 0.5) * 5,
    change4h: (Math.random() - 0.5) * 10,
    change24h: (Math.random() - 0.5) * 20,
    allTimeHigh: oi * (1.2 + Math.random() * 0.5),
    athDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    exchange: 'Aggregate',
  };
}

function generateLiquidationData(symbol: string, price: number, volume: number): LiquidationData {
  const totalLiq = volume * (0.001 + Math.random() * 0.01);
  const longRatio = 0.3 + Math.random() * 0.4;

  const levels: LiquidationData['liquidationLevels'] = [];
  for (let i = -10; i <= 10; i++) {
    const levelPrice = price * (1 + i * 0.01);
    const longLiq = i < 0 ? Math.random() * totalLiq * 0.1 : 0;
    const shortLiq = i > 0 ? Math.random() * totalLiq * 0.1 : 0;
    levels.push({
      price: levelPrice,
      longLiquidity: longLiq,
      shortLiquidity: shortLiq,
      cumulativeLong: levels.reduce((sum, l) => sum + l.longLiquidity, 0) + longLiq,
      cumulativeShort: levels.reduce((sum, l) => sum + l.shortLiquidity, 0) + shortLiq,
    });
  }

  return {
    symbol,
    longLiquidations: Math.floor(Math.random() * 1000),
    shortLiquidations: Math.floor(Math.random() * 1000),
    totalLiquidations: Math.floor(Math.random() * 2000),
    longLiquidationUsd: totalLiq * longRatio,
    shortLiquidationUsd: totalLiq * (1 - longRatio),
    totalLiquidationUsd: totalLiq,
    largestLiquidation: totalLiq * 0.05 * Math.random(),
    liquidationLevels: levels,
    timestamp: Date.now(),
  };
}

function generateLongShortRatio(symbol: string): LongShortRatio {
  const longRatio = 40 + Math.random() * 20;
  const shortRatio = 100 - longRatio;
  return {
    symbol,
    longRatio,
    shortRatio,
    longShortRatio: longRatio / shortRatio,
    topTraderLongRatio: 45 + Math.random() * 10,
    topTraderShortRatio: 55 - Math.random() * 10,
    retailSentiment: longRatio > 55 ? 'bullish' : longRatio < 45 ? 'bearish' : 'neutral',
    exchange: 'Aggregate',
    timestamp: Date.now(),
  };
}

// ==================== RWA Metrics ====================
function generateRWAMetrics(): RWAMetrics {
  return {
    treasuries: {
      totalValue: 9.5e9 + Math.random() * 0.5e9,
      avgYield: 3.2 + Math.random() * 0.3,
      totalAssets: 61,
      holders: 65000 + Math.floor(Math.random() * 1000),
      change7d: (Math.random() - 0.3) * 5,
    },
    stablecoins: {
      totalSupply: 180e9 + Math.random() * 5e9,
      dominantIssuer: 'Tether',
      depegs24h: Math.floor(Math.random() * 3),
      avgPeg: 0.999 + Math.random() * 0.002,
      volume24h: 50e9 + Math.random() * 20e9,
    },
    privateCredit: {
      totalValue: 12e9 + Math.random() * 2e9,
      avgApy: 8 + Math.random() * 4,
      activeLoans: 150 + Math.floor(Math.random() * 50),
      defaultRate: 0.5 + Math.random() * 1.5,
    },
    tokenizedStocks: {
      totalValue: 850e6 + Math.random() * 50e6,
      volume24h: 2e9 + Math.random() * 1e9,
      activeAddresses: 39000 + Math.floor(Math.random() * 2000),
      topAsset: 'TSLA',
    },
  };
}

// ==================== Sentiment ====================
function generateSentiment(rsi: number, priceChange: number): MarketSentiment {
  let baseScore = 50;
  baseScore += (rsi - 50) * 0.3;
  baseScore += priceChange * 2;
  baseScore = Math.max(0, Math.min(100, baseScore));

  let label: MarketSentiment['fearGreedLabel'] = 'Neutral';
  if (baseScore <= 20) label = 'Extreme Fear';
  else if (baseScore <= 40) label = 'Fear';
  else if (baseScore >= 80) label = 'Extreme Greed';
  else if (baseScore >= 60) label = 'Greed';

  let overall: MarketSentiment['overallSentiment'] = 'neutral';
  if (baseScore <= 20) overall = 'very_bearish';
  else if (baseScore <= 40) overall = 'bearish';
  else if (baseScore >= 80) overall = 'very_bullish';
  else if (baseScore >= 60) overall = 'bullish';

  return {
    fearGreedIndex: Math.round(baseScore),
    fearGreedLabel: label,
    socialScore: 40 + Math.random() * 40,
    newsScore: 40 + Math.random() * 40,
    technicalScore: baseScore,
    overallSentiment: overall,
    sentimentChange24h: (Math.random() - 0.5) * 20,
  };
}

// ==================== Trading Signals ====================
function generateTradingSignal(
  price: number,
  rsi: number,
  macd: { macd: number; signal: number; histogram: number },
  bb: { upper: number; lower: number },
  _atr: number
): TradingSignal {
  let bullishScore = 0;
  let bearishScore = 0;
  const indicators: TradingSignal['indicators'] = [];

  // RSI
  if (rsi < 30) {
    bullishScore += 25;
    indicators.push({ name: 'RSI', value: rsi.toFixed(1), signal: 'bullish', weight: 25 });
  } else if (rsi > 70) {
    bearishScore += 25;
    indicators.push({ name: 'RSI', value: rsi.toFixed(1), signal: 'bearish', weight: 25 });
  } else {
    indicators.push({ name: 'RSI', value: rsi.toFixed(1), signal: 'neutral', weight: 10 });
  }

  // MACD
  if (macd.histogram > 0) {
    bullishScore += 20;
    indicators.push({ name: 'MACD', value: macd.macd.toFixed(2), signal: 'bullish', weight: 20 });
  } else {
    bearishScore += 20;
    indicators.push({ name: 'MACD', value: macd.macd.toFixed(2), signal: 'bearish', weight: 20 });
  }

  // Bollinger Bands
  if (price < bb.lower) {
    bullishScore += 15;
    indicators.push({ name: 'BB', value: 'Below Lower', signal: 'bullish', weight: 15 });
  } else if (price > bb.upper) {
    bearishScore += 15;
    indicators.push({ name: 'BB', value: 'Above Upper', signal: 'bearish', weight: 15 });
  } else {
    indicators.push({ name: 'BB', value: 'Within Bands', signal: 'neutral', weight: 5 });
  }

  const netScore = bullishScore - bearishScore;
  let type: TradingSignal['type'] = 'HOLD';
  if (netScore >= 40) type = 'STRONG_BUY';
  else if (netScore >= 20) type = 'BUY';
  else if (netScore <= -40) type = 'STRONG_SELL';
  else if (netScore <= -20) type = 'SELL';

  const reasons: string[] = [];
  if (rsi < 30) reasons.push('RSI indicates oversold conditions');
  if (rsi > 70) reasons.push('RSI indicates overbought conditions');
  if (macd.histogram > 0) reasons.push('MACD histogram positive, bullish momentum');
  if (macd.histogram < 0) reasons.push('MACD histogram negative, bearish momentum');
  if (price < bb.lower) reasons.push('Price below Bollinger lower band');
  if (price > bb.upper) reasons.push('Price above Bollinger upper band');

  const stopLoss = type.includes('BUY') ? price * 0.97 : price * 1.03;
  const tp1 = type.includes('BUY') ? price * 1.03 : price * 0.97;
  const tp2 = type.includes('BUY') ? price * 1.05 : price * 0.95;
  const tp3 = type.includes('BUY') ? price * 1.08 : price * 0.92;

  return {
    type,
    confidence: Math.min(100, 50 + Math.abs(netScore)),
    timeframe: '4H',
    indicators,
    entry: price,
    stopLoss,
    takeProfit: [tp1, tp2, tp3],
    riskReward: Math.abs(tp2 - price) / Math.abs(price - stopLoss),
    reasoning: reasons.length > 0 ? reasons : ['Mixed signals, recommend holding position'],
    timestamp: Date.now(),
  };
}

// ==================== Main API Class ====================
class HFTService {
  private cache = new Map<string, { data: unknown; timestamp: number }>();
  private readonly CACHE_TTL = 10000; // 10 seconds

  private getCached<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return Promise.resolve(cached.data as T);
    }
    return fetcher().then(data => {
      this.cache.set(key, { data, timestamp: Date.now() });
      return data;
    });
  }

  async fetchMarketData(): Promise<EnhancedMarketData[]> {
    const ids = TRACKED_ASSETS.map(a => a.id).join(',');
    return this.getCached('market_data', async () => {
      const response = await axios.get(`${COINGECKO_BASE}/coins/markets`, {
        params: {
          vs_currency: 'usd',
          ids,
          order: 'market_cap_desc',
          per_page: 50,
          sparkline: true,
          price_change_percentage: '1h,24h,7d,30d',
        },
      });

      return response.data.map((coin: Record<string, unknown>) => {
        const prices = (coin.sparkline_in_7d as { price: number[] })?.price || [];
        return {
          id: coin.id as string,
          symbol: (coin.symbol as string).toUpperCase(),
          name: coin.name as string,
          price: coin.current_price as number,
          priceChange1h: (coin.price_change_percentage_1h_in_currency as number) || 0,
          priceChange24h: (coin.price_change_percentage_24h as number) || 0,
          priceChange7d: (coin.price_change_percentage_7d_in_currency as number) || 0,
          priceChange30d: (coin.price_change_percentage_30d_in_currency as number) || 0,
          marketCap: coin.market_cap as number,
          volume24h: coin.total_volume as number,
          volumeChange24h: (Math.random() - 0.5) * 30,
          high24h: coin.high_24h as number,
          low24h: coin.low_24h as number,
          ath: coin.ath as number,
          athChangePercent: coin.ath_change_percentage as number,
          circulatingSupply: coin.circulating_supply as number,
          maxSupply: coin.max_supply as number | null,
          rank: coin.market_cap_rank as number,
          volatility1h: calculateVolatility(prices.slice(-12)),
          volatility24h: calculateVolatility(prices.slice(-288)),
          correlation: new Map(),
        } as EnhancedMarketData;
      });
    });
  }

  async fetchOHLCV(coinId: string, days: number = 30): Promise<number[][]> {
    return this.getCached(`ohlcv_${coinId}_${days}`, async () => {
      const response = await axios.get(`${COINGECKO_BASE}/coins/${coinId}/ohlc`, {
        params: { vs_currency: 'usd', days },
      });
      return response.data;
    });
  }

  async fetchGlobalData(): Promise<{ data: Record<string, unknown> }> {
    return this.getCached('global', async () => {
      const response = await axios.get(`${COINGECKO_BASE}/global`);
      return response.data;
    });
  }

  async getAssetAnalysis(coinId: string): Promise<AssetAnalysis | null> {
    try {
      const [marketData, ohlcv] = await Promise.all([
        this.fetchMarketData(),
        this.fetchOHLCV(coinId),
      ]);

      const market = marketData.find(m => m.id === coinId);
      if (!market) return null;

      const closes = ohlcv.map(c => c[4]);
      const highs = ohlcv.map(c => c[2]);
      const lows = ohlcv.map(c => c[3]);

      const rsi = calculateRSI(closes);
      const macd = calculateMACD(closes);
      const bb = calculateBollingerBands(closes);
      const atr = calculateATR(highs, lows, closes);
      const volatility = calculateVolatility(closes);

      const indicators: AdvancedIndicators = {
        rsi,
        rsiDivergence: 'none',
        stochRsi: { k: Math.random() * 100, d: Math.random() * 100 },
        mfi: 20 + Math.random() * 60,
        williamsR: -100 + Math.random() * 100,
        macd,
        adx: 15 + Math.random() * 40,
        dmi: { plusDI: 20 + Math.random() * 20, minusDI: 20 + Math.random() * 20 },
        supertrend: { value: market.price * (0.95 + Math.random() * 0.1), direction: rsi > 50 ? 'up' : 'down' },
        bollingerBands: bb,
        atr,
        keltnerChannels: { upper: bb.upper * 1.01, middle: bb.middle, lower: bb.lower * 0.99 },
        obv: Math.random() * 1000000000,
        vwap: market.price * (0.99 + Math.random() * 0.02),
        volumeProfile: [],
        ema: {
          ema9: calculateEMA(closes, 9),
          ema21: calculateEMA(closes, 21),
          ema50: calculateEMA(closes, 50),
          ema100: calculateEMA(closes, 100),
          ema200: calculateEMA(closes, 200),
        },
        sma: {
          sma20: calculateSMA(closes, 20),
          sma50: calculateSMA(closes, 50),
          sma100: calculateSMA(closes, 100),
          sma200: calculateSMA(closes, 200),
        },
        pivotPoints: {
          pivot: market.price,
          r1: market.price * 1.02,
          r2: market.price * 1.04,
          r3: market.price * 1.06,
          s1: market.price * 0.98,
          s2: market.price * 0.96,
          s3: market.price * 0.94,
        },
        fibonacci: [
          { level: 0, price: Math.max(...highs), label: '0% (High)', type: 'resistance' },
          { level: 0.236, price: Math.max(...highs) - (Math.max(...highs) - Math.min(...lows)) * 0.236, label: '23.6%', type: 'support' },
          { level: 0.382, price: Math.max(...highs) - (Math.max(...highs) - Math.min(...lows)) * 0.382, label: '38.2%', type: 'support' },
          { level: 0.5, price: Math.max(...highs) - (Math.max(...highs) - Math.min(...lows)) * 0.5, label: '50%', type: 'support' },
          { level: 0.618, price: Math.max(...highs) - (Math.max(...highs) - Math.min(...lows)) * 0.618, label: '61.8%', type: 'support' },
          { level: 1, price: Math.min(...lows), label: '100% (Low)', type: 'support' },
        ],
      };

      return {
        market,
        indicators,
        hftMetrics: {
          orderFlow: generateOrderFlowMetrics(market.price, market.volume24h),
          microstructure: generateMarketMicrostructure(market.price),
          signals: generateHFTSignals(rsi, macd.histogram, volatility),
          latency: generateLatencyMetrics(),
        },
        derivatives: {
          fundingRate: generateFundingRate(market.symbol, market.price),
          openInterest: generateOpenInterest(market.symbol, market.marketCap),
          liquidations: generateLiquidationData(market.symbol, market.price, market.volume24h),
          longShortRatio: generateLongShortRatio(market.symbol),
        },
        tradingSignal: generateTradingSignal(market.price, rsi, macd, bb, atr),
        sentiment: generateSentiment(rsi, market.priceChange24h),
      };
    } catch (error) {
      console.error('Error fetching asset analysis:', error);
      return null;
    }
  }

  async getGlobalMarketState(): Promise<GlobalMarketState | null> {
    try {
      const [marketData, globalData] = await Promise.all([
        this.fetchMarketData(),
        this.fetchGlobalData(),
      ]);

      const global = globalData.data;
      const totalMcapChange = (global.market_cap_change_percentage_24h_usd as number) || 0;

      const sorted = [...marketData].sort((a, b) => b.priceChange24h - a.priceChange24h);
      const topGainers = sorted.slice(0, 5).map(m => ({ symbol: m.symbol, change: m.priceChange24h }));
      const topLosers = sorted.slice(-5).reverse().map(m => ({ symbol: m.symbol, change: m.priceChange24h }));

      let marketPhase: GlobalMarketState['marketPhase'] = 'accumulation';
      if (totalMcapChange > 5) marketPhase = 'markup';
      else if (totalMcapChange < -5) marketPhase = 'markdown';
      else if (totalMcapChange > 0 && totalMcapChange < 2) marketPhase = 'distribution';

      const btcDom = (global.market_cap_percentage as Record<string, number>)?.btc || 50;
      const avgPriceChange = marketData.reduce((sum, m) => sum + m.priceChange24h, 0) / marketData.length;

      return {
        totalMarketCap: (global.total_market_cap as Record<string, number>)?.usd || 0,
        totalVolume24h: (global.total_volume as Record<string, number>)?.usd || 0,
        btcDominance: btcDom,
        ethDominance: (global.market_cap_percentage as Record<string, number>)?.eth || 15,
        altcoinSeason: btcDom < 40,
        marketPhase,
        rwa: generateRWAMetrics(),
        overallSentiment: generateSentiment(50, avgPriceChange),
        topGainers,
        topLosers,
        mostLiquidated: marketData.slice(0, 3).map(m => ({ symbol: m.symbol, amount: m.volume24h * 0.001 * Math.random() })),
        highestFunding: marketData.slice(0, 3).map(m => ({ symbol: m.symbol, rate: (Math.random() - 0.5) * 0.002 })),
      };
    } catch (error) {
      console.error('Error fetching global market state:', error);
      return null;
    }
  }
}

export const hftService = new HFTService();
export default hftService;
