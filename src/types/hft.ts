// OVERUNDER.AI - HFT Trading Terminal Types

// ==================== HFT Metrics ====================
export interface LatencyMetrics {
  exchangeLatency: number; // microseconds
  orderBookLatency: number;
  executionLatency: number;
  networkLatency: number;
  totalRoundTrip: number;
  jitter: number;
  packetLoss: number;
  timestamp: number;
}

export interface OrderFlowMetrics {
  buyVolume: number;
  sellVolume: number;
  netFlow: number;
  buyOrders: number;
  sellOrders: number;
  largeOrdersCount: number;
  avgOrderSize: number;
  vwap: number;
  twap: number;
  cvd: number; // Cumulative Volume Delta
  delta: number;
  deltaPercent: number;
  imbalance: number; // Order book imbalance
  timestamp: number;
}

export interface MarketMicrostructure {
  bidAskSpread: number;
  spreadBps: number; // Basis points
  midPrice: number;
  microprice: number;
  tickSize: number;
  depth: {
    bids: number;
    asks: number;
    ratio: number;
  };
  toxicFlow: number; // 0-100, measure of adverse selection
  effectiveSpread: number;
  realizedSpread: number;
  priceImpact: number;
}

export interface HFTSignals {
  momentumScore: number; // -100 to 100
  meanReversionScore: number;
  arbitrageOpportunity: boolean;
  spreadCompression: boolean;
  liquidityShift: 'increasing' | 'decreasing' | 'stable';
  orderFlowToxicity: 'low' | 'medium' | 'high';
  volatilityRegime: 'low' | 'normal' | 'high' | 'extreme';
  marketState: 'trending' | 'ranging' | 'breakout' | 'reversal';
}

// ==================== Derivatives Metrics ====================
export interface FundingRateData {
  symbol: string;
  rate: number;
  predictedRate: number;
  nextFundingTime: number;
  fundingInterval: number; // hours
  annualizedRate: number;
  averageRate7d: number;
  rateChange24h: number;
  exchange: string;
}

export interface OpenInterestData {
  symbol: string;
  openInterest: number;
  openInterestUsd: number;
  change1h: number;
  change4h: number;
  change24h: number;
  allTimeHigh: number;
  athDate: string;
  exchange: string;
}

export interface LiquidationData {
  symbol: string;
  longLiquidations: number;
  shortLiquidations: number;
  totalLiquidations: number;
  longLiquidationUsd: number;
  shortLiquidationUsd: number;
  totalLiquidationUsd: number;
  largestLiquidation: number;
  liquidationLevels: LiquidationLevel[];
  timestamp: number;
}

export interface LiquidationLevel {
  price: number;
  longLiquidity: number;
  shortLiquidity: number;
  cumulativeLong: number;
  cumulativeShort: number;
}

export interface LongShortRatio {
  symbol: string;
  longRatio: number;
  shortRatio: number;
  longShortRatio: number;
  topTraderLongRatio: number;
  topTraderShortRatio: number;
  retailSentiment: 'bullish' | 'bearish' | 'neutral';
  exchange: string;
  timestamp: number;
}

// ==================== RWA Metrics ====================
export interface RWAMetrics {
  treasuries: {
    totalValue: number;
    avgYield: number;
    totalAssets: number;
    holders: number;
    change7d: number;
  };
  stablecoins: {
    totalSupply: number;
    dominantIssuer: string;
    depegs24h: number;
    avgPeg: number;
    volume24h: number;
  };
  privateCredit: {
    totalValue: number;
    avgApy: number;
    activeLoans: number;
    defaultRate: number;
  };
  tokenizedStocks: {
    totalValue: number;
    volume24h: number;
    activeAddresses: number;
    topAsset: string;
  };
}

// ==================== Enhanced Market Data ====================
export interface EnhancedMarketData {
  id: string;
  symbol: string;
  name: string;
  price: number;
  priceChange1h: number;
  priceChange24h: number;
  priceChange7d: number;
  priceChange30d: number;
  marketCap: number;
  volume24h: number;
  volumeChange24h: number;
  high24h: number;
  low24h: number;
  ath: number;
  athChangePercent: number;
  circulatingSupply: number;
  maxSupply: number | null;
  rank: number;
  // HFT specific
  volatility1h: number;
  volatility24h: number;
  correlation: Map<string, number>;
}

// ==================== Technical Indicators ====================
export interface AdvancedIndicators {
  // Momentum
  rsi: number;
  rsiDivergence: 'bullish' | 'bearish' | 'none';
  stochRsi: { k: number; d: number };
  mfi: number; // Money Flow Index
  williamsR: number;

  // Trend
  macd: { macd: number; signal: number; histogram: number };
  adx: number; // Average Directional Index
  dmi: { plusDI: number; minusDI: number };
  supertrend: { value: number; direction: 'up' | 'down' };

  // Volatility
  bollingerBands: { upper: number; middle: number; lower: number; width: number };
  atr: number; // Average True Range
  keltnerChannels: { upper: number; middle: number; lower: number };

  // Volume
  obv: number; // On Balance Volume
  vwap: number;
  volumeProfile: VolumeProfileLevel[];

  // Moving Averages
  ema: { ema9: number; ema21: number; ema50: number; ema100: number; ema200: number };
  sma: { sma20: number; sma50: number; sma100: number; sma200: number };

  // Support/Resistance
  pivotPoints: {
    pivot: number;
    r1: number; r2: number; r3: number;
    s1: number; s2: number; s3: number;
  };
  fibonacci: FibonacciLevel[];
}

export interface VolumeProfileLevel {
  price: number;
  volume: number;
  buyVolume: number;
  sellVolume: number;
  poc: boolean; // Point of Control
  valueArea: boolean;
}

export interface FibonacciLevel {
  level: number;
  price: number;
  label: string;
  type: 'support' | 'resistance';
}

// ==================== Sentiment ====================
export interface MarketSentiment {
  fearGreedIndex: number;
  fearGreedLabel: 'Extreme Fear' | 'Fear' | 'Neutral' | 'Greed' | 'Extreme Greed';
  socialScore: number;
  newsScore: number;
  technicalScore: number;
  overallSentiment: 'very_bearish' | 'bearish' | 'neutral' | 'bullish' | 'very_bullish';
  sentimentChange24h: number;
}

// ==================== Trading Signals ====================
export interface TradingSignal {
  type: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL';
  confidence: number;
  timeframe: string;
  indicators: SignalIndicator[];
  entry: number;
  stopLoss: number;
  takeProfit: number[];
  riskReward: number;
  reasoning: string[];
  timestamp: number;
}

export interface SignalIndicator {
  name: string;
  value: string;
  signal: 'bullish' | 'bearish' | 'neutral';
  weight: number;
}

// ==================== Composite Types ====================
export interface AssetAnalysis {
  market: EnhancedMarketData;
  indicators: AdvancedIndicators;
  hftMetrics: {
    orderFlow: OrderFlowMetrics;
    microstructure: MarketMicrostructure;
    signals: HFTSignals;
    latency: LatencyMetrics;
  };
  derivatives: {
    fundingRate: FundingRateData;
    openInterest: OpenInterestData;
    liquidations: LiquidationData;
    longShortRatio: LongShortRatio;
  };
  tradingSignal: TradingSignal;
  sentiment: MarketSentiment;
}

export interface GlobalMarketState {
  totalMarketCap: number;
  totalVolume24h: number;
  btcDominance: number;
  ethDominance: number;
  altcoinSeason: boolean;
  marketPhase: 'accumulation' | 'markup' | 'distribution' | 'markdown';
  rwa: RWAMetrics;
  overallSentiment: MarketSentiment;
  topGainers: { symbol: string; change: number }[];
  topLosers: { symbol: string; change: number }[];
  mostLiquidated: { symbol: string; amount: number }[];
  highestFunding: { symbol: string; rate: number }[];
}

// ==================== Tracked Assets ====================
export const TRACKED_ASSETS = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
  { id: 'solana', symbol: 'SOL', name: 'Solana' },
  { id: 'ripple', symbol: 'XRP', name: 'XRP' },
  { id: 'binancecoin', symbol: 'BNB', name: 'BNB' },
  { id: 'cardano', symbol: 'ADA', name: 'Cardano' },
  { id: 'avalanche-2', symbol: 'AVAX', name: 'Avalanche' },
  { id: 'polkadot', symbol: 'DOT', name: 'Polkadot' },
  { id: 'chainlink', symbol: 'LINK', name: 'Chainlink' },
  { id: 'matic-network', symbol: 'MATIC', name: 'Polygon' },
  { id: 'litecoin', symbol: 'LTC', name: 'Litecoin' },
  { id: 'uniswap', symbol: 'UNI', name: 'Uniswap' },
  { id: 'arbitrum', symbol: 'ARB', name: 'Arbitrum' },
  { id: 'optimism', symbol: 'OP', name: 'Optimism' },
  { id: 'aptos', symbol: 'APT', name: 'Aptos' },
  { id: 'sui', symbol: 'SUI', name: 'Sui' },
] as const;

export type TrackedAssetId = typeof TRACKED_ASSETS[number]['id'];
