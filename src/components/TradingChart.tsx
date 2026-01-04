import { useEffect, useRef, useState } from 'react';
import { createChart, type IChartApi, type CandlestickData, type Time } from 'lightweight-charts';
import type { OHLCVData, TradingSignal, FibonacciLevel } from '../types/market';

interface TradingChartProps {
  data: OHLCVData[];
  signals?: TradingSignal[];
  fibLevels?: FibonacciLevel[];
  height?: number;
}

export default function TradingChart({ data, signals = [], fibLevels = [], height = 400 }: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height,
      layout: {
        background: { color: '#0f1419' },
        textColor: '#8a8f98',
      },
      grid: {
        vertLines: { color: '#1a1f2e', style: 1 },
        horzLines: { color: '#1a1f2e', style: 1 },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          width: 1,
          color: '#00d4ff',
          style: 3,
        },
        horzLine: {
          width: 1,
          color: '#00d4ff',
          style: 3,
        },
      },
      rightPriceScale: {
        borderColor: '#1a1f2e',
        textColor: '#8a8f98',
      },
      timeScale: {
        borderColor: '#1a1f2e',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const candleSeries = (chart as any).addCandlestickSeries({
      upColor: '#00ff88',
      downColor: '#ff3366',
      borderUpColor: '#00ff88',
      borderDownColor: '#ff3366',
      wickUpColor: '#00ff88',
      wickDownColor: '#ff3366',
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    setIsReady(true);

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [height]);

  useEffect(() => {
    if (!isReady || !candleSeriesRef.current || data.length === 0) return;

    // Convert data to lightweight-charts format
    const chartData: CandlestickData[] = data.map(d => ({
      time: d.time as Time,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }));

    candleSeriesRef.current.setData(chartData);

    // Add markers for trading signals
    if (signals.length > 0) {
      const markers = signals.map(signal => ({
        time: (signal.timestamp / 1000) as Time,
        position: signal.type === 'BUY' ? ('belowBar' as const) : ('aboveBar' as const),
        color: signal.type === 'BUY' ? '#00ff88' : '#ff3366',
        shape: signal.type === 'BUY' ? ('arrowUp' as const) : ('arrowDown' as const),
        text: signal.type,
        size: signal.strength === 'strong' ? 2 : 1,
      }));

      candleSeriesRef.current.setMarkers(markers);
    }

    // Fit content
    chartRef.current?.timeScale().fitContent();
  }, [data, signals, isReady]);

  return (
    <div className="relative w-full">
      <div ref={chartContainerRef} className="w-full" />

      {/* Fibonacci levels overlay */}
      {fibLevels.length > 0 && (
        <div className="absolute top-2 right-2 bg-terminal-panel/80 backdrop-blur-sm border border-terminal-border rounded px-3 py-2 text-xs">
          <div className="font-semibold text-terminal-accent mb-1">Fibonacci Levels</div>
          {fibLevels.map((level, i) => (
            <div key={i} className="flex justify-between gap-4 text-terminal-textMuted">
              <span>{level.label}</span>
              <span className="text-terminal-text font-mono">${level.price.toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Signal indicators */}
      {signals.length > 0 && (
        <div className="absolute bottom-2 left-2 bg-terminal-panel/80 backdrop-blur-sm border border-terminal-border rounded px-3 py-2 text-xs max-w-xs">
          <div className="font-semibold text-terminal-accent mb-1">Recent Signals</div>
          <div className="space-y-1 max-h-24 overflow-y-auto scrollbar-thin">
            {signals.slice(-3).reverse().map((signal, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className={signal.type === 'BUY' ? 'text-terminal-green' : 'text-terminal-red'}>
                  {signal.type}
                </span>
                <span className="text-terminal-textMuted text-[10px]">{signal.reason}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
