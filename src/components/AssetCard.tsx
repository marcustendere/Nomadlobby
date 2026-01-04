import type { CryptoAsset, FundingRate, OpenInterest } from '../types/market';
import { TrendingUp, TrendingDown, Activity, DollarSign } from 'lucide-react';

interface AssetCardProps {
  asset: CryptoAsset;
  fundingRate?: FundingRate;
  openInterest?: OpenInterest;
  isSelected: boolean;
  onClick: () => void;
}

export default function AssetCard({ asset, fundingRate, openInterest, isSelected, onClick }: AssetCardProps) {
  const isPositive = asset.price_change_percentage_24h > 0;
  const priceChangeColor = isPositive ? 'text-terminal-green glow-green' : 'text-terminal-red glow-red';

  const formatNumber = (num: number, decimals: number = 2) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toFixed(decimals);
  };

  const formatPrice = (price: number) => {
    if (price >= 1000) return price.toFixed(2);
    if (price >= 1) return price.toFixed(4);
    return price.toFixed(6);
  };

  return (
    <button
      onClick={onClick}
      className={`
        w-full bg-terminal-panel border rounded-lg p-4 transition-all duration-200
        hover:bg-terminal-panel/80 hover:border-terminal-accent
        ${isSelected ? 'border-terminal-accent shadow-lg shadow-terminal-accent/20' : 'border-terminal-border'}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`
            w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
            ${isSelected ? 'bg-terminal-accent/20 text-terminal-accent' : 'bg-terminal-border text-terminal-textMuted'}
          `}>
            {asset.symbol}
          </div>
          <div className="text-left">
            <div className="font-semibold text-terminal-text text-sm">{asset.symbol}</div>
            <div className="text-xs text-terminal-textMuted">{asset.name}</div>
          </div>
        </div>
        {isPositive ? (
          <TrendingUp className="w-5 h-5 text-terminal-green" />
        ) : (
          <TrendingDown className="w-5 h-5 text-terminal-red" />
        )}
      </div>

      {/* Price */}
      <div className="mb-3">
        <div className="text-2xl font-bold text-terminal-text font-mono mb-1">
          ${formatPrice(asset.current_price)}
        </div>
        <div className={`text-sm font-semibold ${priceChangeColor}`}>
          {isPositive ? '+' : ''}{asset.price_change_percentage_24h.toFixed(2)}%
          <span className="text-terminal-textMuted ml-2">
            {isPositive ? '+' : ''}${formatNumber(asset.price_change_24h)}
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {/* 24h High/Low */}
        <div className="bg-terminal-bg rounded p-2">
          <div className="text-terminal-textMuted mb-1">24h High</div>
          <div className="text-terminal-green font-mono font-semibold">
            ${formatPrice(asset.high_24h)}
          </div>
        </div>
        <div className="bg-terminal-bg rounded p-2">
          <div className="text-terminal-textMuted mb-1">24h Low</div>
          <div className="text-terminal-red font-mono font-semibold">
            ${formatPrice(asset.low_24h)}
          </div>
        </div>

        {/* Volume */}
        <div className="bg-terminal-bg rounded p-2">
          <div className="text-terminal-textMuted mb-1 flex items-center gap-1">
            <Activity className="w-3 h-3" />
            Volume
          </div>
          <div className="text-terminal-text font-mono font-semibold">
            ${formatNumber(asset.total_volume)}
          </div>
        </div>

        {/* Market Cap */}
        <div className="bg-terminal-bg rounded p-2">
          <div className="text-terminal-textMuted mb-1 flex items-center gap-1">
            <DollarSign className="w-3 h-3" />
            Mkt Cap
          </div>
          <div className="text-terminal-text font-mono font-semibold">
            ${formatNumber(asset.market_cap)}
          </div>
        </div>

        {/* Funding Rate */}
        {fundingRate && (
          <div className="bg-terminal-bg rounded p-2">
            <div className="text-terminal-textMuted mb-1">Funding</div>
            <div className={`font-mono font-semibold ${
              fundingRate.fundingRate > 0 ? 'text-terminal-green' : 'text-terminal-red'
            }`}>
              {(fundingRate.fundingRate * 100).toFixed(4)}%
            </div>
          </div>
        )}

        {/* Open Interest */}
        {openInterest && (
          <div className="bg-terminal-bg rounded p-2">
            <div className="text-terminal-textMuted mb-1">OI</div>
            <div className="text-terminal-accent font-mono font-semibold">
              ${formatNumber(openInterest.openInterestValue)}
            </div>
          </div>
        )}
      </div>

      {/* Live Indicator */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-terminal-border">
        <div className="w-2 h-2 rounded-full bg-terminal-green animate-pulse" />
        <span className="text-[10px] text-terminal-textMuted">LIVE • 1.3s refresh</span>
      </div>
    </button>
  );
}
