/* Dual-theme Navigation Bar with prominent Light/Dark toggle */
import { useState } from 'react';
import { Menu, X, Zap, Lightbulb, LightbulbOff, Map } from 'lucide-react';
import { Link } from 'wouter';
import { useTheme } from '@/contexts/ThemeContext';
import { routePath } from '@/lib/sitePaths';

interface NavbarProps {
  activeSection: string;
  onNavigate: (section: string) => void;
}

const NAV_ITEMS = [
  { id: 'hero', label: '首页', icon: '◆' },
  { id: 'dashboard', label: '数据看板', icon: '◈' },
  { id: 'matches', label: '赛事战报', icon: '◇' },
  { id: 'interactive', label: '互动中心', icon: '◆' },
  { id: 'culture', label: '主场文化', icon: '◈' },
  { id: 'leaderboard', label: '联赛榜单', icon: '◇' },
];

export default function Navbar({ activeSection, onNavigate }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      {/* Background */}
      <div className={`absolute inset-0 backdrop-blur-xl border-b shadow-sm transition-colors duration-300
        ${isDark
          ? 'bg-[oklch(0.08_0.01_280/85%)] border-[oklch(1_0_0/8%)]'
          : 'bg-white/85 border-gray-200/60'
        }`}
      />

      {/* Accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#DC2626]/40 to-transparent" />

      <div className="relative container mx-auto flex items-center justify-between h-14 lg:h-16">
        {/* Logo */}
        <button onClick={() => onNavigate('hero')} className="flex items-center gap-2 group">
          <Zap className="w-5 h-5 text-[#DC2626]" />
          <span className={`font-display text-lg font-bold tracking-wider ${isDark ? 'text-white' : 'text-gray-900'}`}>
            湘超<span className="text-[#DC2626]">联赛</span>
          </span>
          <span className={`hidden sm:inline text-[10px] font-mono tracking-widest ml-1 ${isDark ? 'text-[#00D4FF] opacity-70' : 'text-[#0284C7] opacity-70'}`}>
            互动平台
          </span>
        </button>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-1">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`relative px-4 py-2 font-body text-sm font-medium tracking-wide transition-all duration-300
                ${activeSection === item.id
                  ? 'text-[#DC2626]'
                  : isDark ? 'text-[oklch(0.5_0.005_280)] hover:text-white' : 'text-gray-500 hover:text-gray-900'
                }`}
            >
              <span className="relative z-10 flex items-center gap-1.5">
                <span className="text-[8px] opacity-40">{item.icon}</span>
                {item.label}
              </span>
              {activeSection === item.id && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-[#DC2626] rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Right side: map shortcut + PROMINENT theme toggle + live indicator */}
        <div className="hidden lg:flex items-center gap-3">
          <Link href={routePath('/map')}>
            <span className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold tracking-wide transition-all duration-300 shadow-sm cursor-pointer
              ${isDark
                ? 'border-[oklch(1_0_0/12%)] bg-[oklch(1_0_0/5%)] text-white hover:border-[#DC2626]/50 hover:text-[#DC2626]'
                : 'border-gray-200 bg-white/80 text-gray-700 hover:border-[#DC2626]/30 hover:text-[#DC2626]'
              }`}>
              <Map className="h-4 w-4" />
              数字看板
            </span>
          </Link>
          {/* ===== Theme toggle button - LARGE & PROMINENT ===== */}
          {toggleTheme && (
            <button
              onClick={toggleTheme}
              className={`flex items-center gap-2.5 px-5 py-2 rounded-full text-sm font-bold tracking-wide transition-all duration-300 border-2 shadow-md
                ${isDark
                  ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border-amber-400/60 text-amber-300 hover:border-amber-300 hover:shadow-amber-500/30 hover:shadow-lg'
                  : 'bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-400/50 text-indigo-600 hover:border-indigo-500 hover:shadow-indigo-500/20 hover:shadow-lg'
                }`}
              title={isDark ? '开灯（切换亮色模式）' : '关灯（切换暗色模式）'}
            >
              {isDark ? (
                <>
                  <Lightbulb className="w-5 h-5" />
                  <span className="font-display">开灯</span>
                </>
              ) : (
                <>
                  <LightbulbOff className="w-5 h-5" />
                  <span className="font-display">关灯</span>
                </>
              )}
            </button>
          )}

          {/* Live indicator */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isDark ? 'bg-[#39FF14]' : 'bg-[#16A34A]'}`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isDark ? 'bg-[#39FF14]' : 'bg-[#16A34A]'}`} />
            </span>
            <span className={`text-[10px] font-mono tracking-wider ${isDark ? 'text-[#39FF14]' : 'text-[#16A34A]'}`}>直播</span>
          </div>
        </div>

        {/* Mobile: map shortcut + PROMINENT theme toggle + menu */}
        <div className="lg:hidden flex items-center gap-2">
          <Link href={routePath('/map')}>
            <span className={`flex h-9 w-9 items-center justify-center rounded-full border shadow-sm transition-colors
              ${isDark
                ? 'border-[oklch(1_0_0/10%)] bg-[oklch(1_0_0/5%)] text-white'
                : 'border-gray-200 bg-white text-gray-700'
              }`} aria-label="返回数字看板">
              <Map className="h-4 w-4" />
            </span>
          </Link>
          {toggleTheme && (
            <button
              onClick={toggleTheme}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 border-2 shadow-sm
                ${isDark
                  ? 'bg-amber-500/15 border-amber-400/50 text-amber-300'
                  : 'bg-indigo-500/10 border-indigo-400/40 text-indigo-600'
                }`}
            >
              {isDark ? (
                <>
                  <Lightbulb className="w-4 h-4" />
                  <span className="font-display">开灯</span>
                </>
              ) : (
                <>
                  <LightbulbOff className="w-4 h-4" />
                  <span className="font-display">关灯</span>
                </>
              )}
            </button>
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`p-2 ${isDark ? 'text-white' : 'text-gray-700'}`}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className={`lg:hidden absolute top-full left-0 right-0 backdrop-blur-xl border-b shadow-lg transition-colors
          ${isDark ? 'bg-[oklch(0.08_0.01_280/95%)] border-[oklch(1_0_0/8%)]' : 'bg-white/95 border-gray-200/60'}`}
        >
          <div className="container py-4 space-y-1">
            <Link href={routePath('/map')}>
              <span className={`mb-2 flex w-full items-center gap-2 rounded-lg px-4 py-3 font-body text-sm font-bold tracking-wide transition-all
                ${isDark ? 'bg-[oklch(1_0_0/5%)] text-white' : 'bg-red-50 text-[#DC2626]'}`}>
                <Map className="h-4 w-4" />
                返回数字看板
              </span>
            </Link>
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id); setMobileOpen(false); }}
                className={`w-full text-left px-4 py-3 rounded-lg font-body text-sm font-medium tracking-wide transition-all
                  ${activeSection === item.id
                    ? isDark ? 'text-[#DC2626] bg-[oklch(0.58_0.22_25/10%)]' : 'text-[#DC2626] bg-red-50'
                    : isDark ? 'text-[oklch(0.5_0.005_280)] hover:text-white hover:bg-[oklch(1_0_0/5%)]' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
              >
                <span className="text-[8px] opacity-40 mr-2">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
