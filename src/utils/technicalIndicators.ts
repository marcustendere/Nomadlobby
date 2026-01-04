import type { OHLCV, TechnicalIndicators, TradingSignal } from '../types/market';

/**
 * Calculate Simple Moving Average (SMA)
 */
export function calculateSMA(data: number[], period: number): number {
  if (data.length < period) return data[data.length - 1] || 0;
  const slice = data.slice(-period);
  return slice.reduce((sum, val) => sum + val, 0) / period;
}

/**
 * Calculate Exponential Moving Average (EMA)
 */
export function calculateEMA(data: number[], period: number): number {
  if (data.length === 0) return 0;
  if (data.length < period) return data[data.length - 1];

  const multiplier = 2 / (period + 1);
  let ema = calculateSMA(data.slice(0, period), period);

  for (let i = period; i < data.length; i++) {
    ema = (data[i] - ema) * multiplier + ema;
  }

  return ema;
}

/**
 * Calculate Relative Strength Index (RSI)
 */
export function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length < period + 1) return 50;

  const changes: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1]);
  }

  const gains = changes.map(change => change > 0 ? change : 0);
  const losses = changes.map(change => change < 0 ? Math.abs(change) : 0);

  const avgGain = calculateSMA(gains, period);
  const avgLoss = calculateSMA(losses, period);

  if (avgLoss === 0) return 100;

  const rs = avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));

  return rsi;
}

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 */
export function calculateMACD(prices: number[]): { macd: number; signal: number; histogram: number } {
  if (prices.length < 26) {
    return { macd: 0, signal: 0, histogram: 0 };
  }

  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const macd = ema12 - ema26;

  // Calculate signal line (9-day EMA of MACD)
  const macdHistory: number[] = [];
  for (let i = 26; i <= prices.length; i++) {
    const slice = prices.slice(0, i);
    const e12 = calculateEMA(slice, 12);
    const e26 = calculateEMA(slice, 26);
    macdHistory.push(e12 - e26);
  }

  const signal = calculateEMA(macdHistory, 9);
  const histogram = macd - signal;

  return { macd, signal, histogram };
}

/**
 * Calculate Bollinger Bands
 */
export function calculateBollingerBands(
  prices: number[],
  period: number = 20,
  stdDev: number = 2
): { upper: number; middle: number; lower: number } {
  if (prices.length < period) {
    const price = prices[prices.length - 1] || 0;
    return { upper: price, middle: price, lower: price };
  }

  const sma = calculateSMA(prices, period);
  const slice = prices.slice(-period);

  // Calculate standard deviation
  const squaredDiffs = slice.map(price => Math.pow(price - sma, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / period;
  const standardDeviation = Math.sqrt(variance);

  return {
    upper: sma + (standardDeviation * stdDev),
    middle: sma,
    lower: sma - (standardDeviation * stdDev),
  };
}

/**
 * Calculate all technical indicators
 */
export function calculateAllIndicators(ohlcv: OHLCV[]): TechnicalIndicators {
  const closes = ohlcv.map(candle => candle.close);
  const volumes = ohlcv.map(candle => candle.volume);

  const rsi = calculateRSI(closes);
  const macd = calculateMACD(closes);
  const bollingerBands = calculateBollingerBands(closes);

  const ema12 = calculateEMA(closes, 12);
  const ema26 = calculateEMA(closes, 26);
  const ema50 = calculateEMA(closes, 50);
  const ema200 = calculateEMA(closes, 200);

  const sma20 = calculateSMA(closes, 20);
  const sma50 = calculateSMA(closes, 50);
  const sma100 = calculateSMA(closes, 100);
  const sma200 = calculateSMA(closes, 200);

  const avgVolume = calculateSMA(volumes, 20);
  const currentVolume = volumes[volumes.length - 1] || 0;
  const volumeChange = ((currentVolume - avgVolume) / avgVolume) * 100;

  let volumeTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
  if (volumeChange > 20) volumeTrend = 'increasing';
  else if (volumeChange < -20) volumeTrend = 'decreasing';

  return {
    rsi,
    macd,
    bollingerBands,
    ema: { ema12, ema26, ema50, ema200 },
    sma: { sma20, sma50, sma100, sma200 },
    volumeProfile: {
      avgVolume,
      volumeChange,
      volumeTrend,
    },
  };
}

/**
 * Generate trading signals based on technical indicators
 */
export function generateTradingSignals(
  ohlcv: OHLCV[],
  indicators: TechnicalIndicators
): TradingSignal[] {
  const signals: TradingSignal[] = [];
  const currentPrice = ohlcv[ohlcv.length - 1]?.close || 0;
  const timestamp = Date.now();

  // Analyze indicators
  const indicatorSignals: { name: string; value: string; signal: 'bullish' | 'bearish' | 'neutral' }[] = [];
  let bullishCount = 0;
  let bearishCount = 0;

  // RSI Analysis
  if (indicators.rsi < 30) {
    indicatorSignals.push({ name: 'RSI', value: indicators.rsi.toFixed(2), signal: 'bullish' });
    bullishCount += 2;
  } else if (indicators.rsi > 70) {
    indicatorSignals.push({ name: 'RSI', value: indicators.rsi.toFixed(2), signal: 'bearish' });
    bearishCount += 2;
  } else {
    indicatorSignals.push({ name: 'RSI', value: indicators.rsi.toFixed(2), signal: 'neutral' });
  }

  // MACD Analysis
  if (indicators.macd.histogram > 0 && indicators.macd.macd > indicators.macd.signal) {
    indicatorSignals.push({
      name: 'MACD',
      value: `${indicators.macd.macd.toFixed(2)} / ${indicators.macd.signal.toFixed(2)}`,
      signal: 'bullish'
    });
    bullishCount += 2;
  } else if (indicators.macd.histogram < 0 && indicators.macd.macd < indicators.macd.signal) {
    indicatorSignals.push({
      name: 'MACD',
      value: `${indicators.macd.macd.toFixed(2)} / ${indicators.macd.signal.toFixed(2)}`,
      signal: 'bearish'
    });
    bearishCount += 2;
  } else {
    indicatorSignals.push({
      name: 'MACD',
      value: `${indicators.macd.macd.toFixed(2)} / ${indicators.macd.signal.toFixed(2)}`,
      signal: 'neutral'
    });
  }

  // Bollinger Bands Analysis
  if (currentPrice < indicators.bollingerBands.lower) {
    indicatorSignals.push({ name: 'BB', value: 'Below Lower Band', signal: 'bullish' });
    bullishCount += 1;
  } else if (currentPrice > indicators.bollingerBands.upper) {
    indicatorSignals.push({ name: 'BB', value: 'Above Upper Band', signal: 'bearish' });
    bearishCount += 1;
  } else {
    indicatorSignals.push({ name: 'BB', value: 'Within Bands', signal: 'neutral' });
  }

  // EMA Crossover Analysis
  if (indicators.ema.ema12 > indicators.ema.ema26 && indicators.ema.ema26 > indicators.ema.ema50) {
    indicatorSignals.push({ name: 'EMA', value: 'Bullish Alignment', signal: 'bullish' });
    bullishCount += 1;
  } else if (indicators.ema.ema12 < indicators.ema.ema26 && indicators.ema.ema26 < indicators.ema.ema50) {
    indicatorSignals.push({ name: 'EMA', value: 'Bearish Alignment', signal: 'bearish' });
    bearishCount += 1;
  } else {
    indicatorSignals.push({ name: 'EMA', value: 'Mixed', signal: 'neutral' });
  }

  // Volume Analysis
  if (indicators.volumeProfile.volumeTrend === 'increasing') {
    indicatorSignals.push({ name: 'Volume', value: '+' + indicators.volumeProfile.volumeChange.toFixed(0) + '%', signal: 'bullish' });
    bullishCount += 1;
  } else if (indicators.volumeProfile.volumeTrend === 'decreasing') {
    indicatorSignals.push({ name: 'Volume', value: indicators.volumeProfile.volumeChange.toFixed(0) + '%', signal: 'bearish' });
    bearishCount += 1;
  } else {
    indicatorSignals.push({ name: 'Volume', value: 'Stable', signal: 'neutral' });
  }

  // Determine overall signal
  const totalSignals = bullishCount + bearishCount;
  const bullishPercentage = totalSignals > 0 ? (bullishCount / totalSignals) * 100 : 50;

  let signalType: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
  let strength: TradingSignal['strength'] = 'moderate';
  let reasoning = '';

  if (bullishPercentage > 70) {
    signalType = 'BUY';
    reasoning = `Strong bullish indicators: ${bullishCount} bullish vs ${bearishCount} bearish signals`;
    if (bullishPercentage > 85) strength = 'very_strong';
    else if (bullishPercentage > 75) strength = 'strong';
  } else if (bullishPercentage < 30) {
    signalType = 'SELL';
    reasoning = `Strong bearish indicators: ${bearishCount} bearish vs ${bullishCount} bullish signals`;
    if (bullishPercentage < 15) strength = 'very_strong';
    else if (bullishPercentage < 25) strength = 'strong';
  } else {
    signalType = 'HOLD';
    reasoning = `Mixed signals: ${bullishCount} bullish, ${bearishCount} bearish - waiting for clearer trend`;
    if (Math.abs(bullishPercentage - 50) < 10) strength = 'weak';
  }

  signals.push({
    type: signalType,
    strength,
    confidence: Math.abs(bullishPercentage - 50) * 2,
    price: currentPrice,
    timestamp,
    indicators: indicatorSignals,
    reasoning,
  });

  return signals;
}

/**
 * Calculate Fibonacci retracement levels
 */
export function calculateFibonacciLevels(high: number, low: number) {
  const diff = high - low;

  return [
    { level: 0, price: high, label: '0.0% (High)', type: 'resistance' as const },
    { level: 0.236, price: high - diff * 0.236, label: '23.6%', type: 'support' as const },
    { level: 0.382, price: high - diff * 0.382, label: '38.2%', type: 'support' as const },
    { level: 0.5, price: high - diff * 0.5, label: '50.0%', type: 'support' as const },
    { level: 0.618, price: high - diff * 0.618, label: '61.8% (Golden Ratio)', type: 'support' as const },
    { level: 0.786, price: high - diff * 0.786, label: '78.6%', type: 'support' as const },
    { level: 1, price: low, label: '100.0% (Low)', type: 'support' as const },
  ];
}
