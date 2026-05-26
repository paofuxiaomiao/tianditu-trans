/* Dual-theme Footer */
import { Zap } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export default function Footer() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <footer className={`relative py-12 border-t transition-colors ${isDark ? 'border-[oklch(1_0_0/8%)]' : 'border-gray-200'}`}>
      <div className="container mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#DC2626]" />
            <span className={`font-display text-sm font-bold tracking-wider ${isDark ? 'text-white' : 'text-gray-900'}`}>
              湘超<span className="text-[#DC2626]">联赛</span>
            </span>
            <span className={`text-[10px] font-mono ml-2 ${isDark ? 'text-[oklch(0.4_0.005_280)]' : 'text-gray-400'}`}>
              湘超联赛 2025 赛季
            </span>
          </div>
          <div className={`flex items-center gap-6 text-[10px] font-mono ${isDark ? 'text-[oklch(0.4_0.005_280)]' : 'text-gray-400'}`}>
            <span>湘超地图互动页面</span>
            <span>·</span>
            <span>数据仅供展示</span>
            <span>·</span>
            <span>版本 1.0</span>
          </div>
        </div>
        <div className="mt-6 h-[1px] bg-gradient-to-r from-transparent via-[#DC2626]/15 to-transparent" />
      </div>
    </footer>
  );
}
