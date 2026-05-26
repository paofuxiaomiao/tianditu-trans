/* Dual-theme SVG Radar Chart */
import { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface RadarChartProps {
  stats: { speed: number; shooting: number; passing: number; defense: number; stamina: number; technique: number };
  color: string;
}

const LABELS = [
  { key: 'speed', label: '速度' },
  { key: 'shooting', label: '射门' },
  { key: 'passing', label: '传球' },
  { key: 'defense', label: '防守' },
  { key: 'stamina', label: '体能' },
  { key: 'technique', label: '技术' },
];

const CENTER = 120;
const RADIUS = 90;
const LEVELS = 5;

function polarToCartesian(angle: number, radius: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: CENTER + radius * Math.cos(rad), y: CENTER + radius * Math.sin(rad) };
}

export default function RadarChart({ stats, color }: RadarChartProps) {
  const [animated, setAnimated] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => { const t = setTimeout(() => setAnimated(true), 100); return () => clearTimeout(t); }, [stats]);
  useEffect(() => { setAnimated(false); }, [stats]);

  const angleStep = 360 / LABELS.length;
  const gridPaths = Array.from({ length: LEVELS }, (_, level) => {
    const r = (RADIUS / LEVELS) * (level + 1);
    const points = LABELS.map((_, i) => { const { x, y } = polarToCartesian(i * angleStep, r); return `${x},${y}`; });
    return `M${points.join('L')}Z`;
  });
  const dataPoints = LABELS.map((item, i) => {
    const value = stats[item.key as keyof typeof stats] / 100;
    const r = animated ? value * RADIUS : 0;
    return polarToCartesian(i * angleStep, r);
  });
  const dataPath = `M${dataPoints.map(p => `${p.x},${p.y}`).join('L')}Z`;

  const gridStroke = isDark ? 'oklch(1 0 0 / 8%)' : 'oklch(0 0 0 / 8%)';
  const axisStroke = isDark ? 'oklch(1 0 0 / 10%)' : 'oklch(0 0 0 / 10%)';
  const labelClass = isDark ? 'fill-[oklch(0.6_0.005_280)]' : 'fill-gray-500';

  return (
    <div className="flex justify-center">
      <svg viewBox="0 0 240 240" className="w-full max-w-[280px]">
        <defs>
          <filter id="softShadow"><feGaussianBlur stdDeviation="2" result="coloredBlur" /><feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          <radialGradient id={`radarGrad-${color.replace('#', '')}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={color} stopOpacity={isDark ? '0.35' : '0.25'} />
            <stop offset="100%" stopColor={color} stopOpacity="0.05" />
          </radialGradient>
        </defs>
        {gridPaths.map((path, i) => <path key={i} d={path} fill="none" stroke={gridStroke} strokeWidth="0.5" />)}
        {LABELS.map((_, i) => { const { x, y } = polarToCartesian(i * angleStep, RADIUS); return <line key={i} x1={CENTER} y1={CENTER} x2={x} y2={y} stroke={axisStroke} strokeWidth="0.5" />; })}
        <path d={dataPath} fill={`url(#radarGrad-${color.replace('#', '')})`} stroke={color} strokeWidth="2" filter="url(#softShadow)" className="transition-all duration-700 ease-out" />
        {dataPoints.map((point, i) => <circle key={i} cx={point.x} cy={point.y} r="3" fill={color} filter="url(#softShadow)" className="transition-all duration-700 ease-out" />)}
        {LABELS.map((item, i) => {
          const { x, y } = polarToCartesian(i * angleStep, RADIUS + 18);
          const value = stats[item.key as keyof typeof stats];
          return (
            <g key={item.key}>
              <text x={x} y={y - 4} textAnchor="middle" dominantBaseline="middle" className={`${labelClass} text-[9px]`} style={{ fontFamily: 'Rajdhani, sans-serif' }}>{item.label}</text>
              <text x={x} y={y + 8} textAnchor="middle" dominantBaseline="middle" className="text-[8px] font-bold" style={{ fontFamily: 'JetBrains Mono, monospace', fill: color }}>{value}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
