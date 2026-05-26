import { projectLogo } from '@/data/feature-data';

interface LogoBadgeProps {
  compact?: boolean;
  light?: boolean;
  subtitle?: string;
}

export default function LogoBadge({
  compact = false,
  light = false,
  subtitle = '湖南地理信息服务',
}: LogoBadgeProps) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`shrink-0 rounded-2xl border ${compact ? 'p-2' : 'p-2.5'} ${
          light
            ? 'border-white/20 bg-white/10 backdrop-blur-md'
            : 'border-[oklch(0.90_0.005_260)] bg-white shadow-sm'
        }`}
      >
        <img
          src={projectLogo}
          alt="湘超联赛 LOGO"
          className={compact ? 'h-8 w-8 object-contain' : 'h-10 w-10 object-contain'}
        />
      </div>
      <div className="min-w-0">
        <div
          className={`font-black tracking-wide ${compact ? 'text-base' : 'text-lg'} ${
            light ? 'text-white' : 'text-[oklch(0.18_0.02_260)]'
          }`}
          style={{ fontFamily: "'Noto Serif SC', serif" }}
        >
          湘超联赛
        </div>
        <p
          className={`truncate text-xs ${light ? 'text-white/70' : 'text-[oklch(0.52_0.02_260)]'}`}
          style={{ fontFamily: "'Noto Sans SC', sans-serif" }}
        >
          {subtitle}
        </p>
      </div>
    </div>
  );
}
