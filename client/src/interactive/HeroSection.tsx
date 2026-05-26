/* Dual-theme Hero Section */
import { motion } from 'framer-motion';
import { ChevronDown, Zap, Trophy, Users } from 'lucide-react';
import { TEAMS, MATCHES } from '@/interactive/interactive-data';
import { useTheme } from '@/contexts/ThemeContext';

interface HeroSectionProps {
  onNavigate: (section: string) => void;
}

export default function HeroSection({ onNavigate }: HeroSectionProps) {
  const liveMatches = MATCHES.filter(m => m.status === 'LIVE');
  const totalVotes = TEAMS.reduce((sum, t) => sum + t.votes, 0);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <section id="hero" className="relative min-h-screen flex flex-col justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="https://d2xsxph8kpxj0f.cloudfront.net/310519663342549613/maCaBegFg79dkZmom7ZdUj/hero-banner-SggMt6bUqj4QvJg2tWghFa.webp"
          alt="球场"
          className="w-full h-full object-cover"
        />
        {isDark ? (
          <>
            {/* Dark: deep gradient for cyberpunk feel */}
            <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.08_0.01_280/70%)] via-[oklch(0.08_0.01_280/40%)] to-[oklch(0.08_0.01_280)]" />
            <div className="absolute inset-0 bg-gradient-to-r from-[oklch(0.08_0.01_280/60%)] to-transparent" />
          </>
        ) : (
          <>
            {/* Light: very subtle overlay, image stays vivid */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[oklch(0.97_0.005_280)]" />
            <div className="absolute inset-0 bg-gradient-to-r from-[oklch(0.97_0.005_280/60%)] via-transparent to-transparent" />
          </>
        )}
      </div>

      {/* Content */}
      <div className="relative container mx-auto pt-20 pb-12 sm:pt-24 sm:pb-16 lg:pt-32">
        <div className="max-w-4xl">
          {/* Tag */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-2 mb-6"
          >
            <span className="h-[1px] w-12 bg-[#DC2626]" />
            <span className={`font-mono text-xs tracking-[0.3em] uppercase ${isDark ? 'text-[#DC2626]' : 'text-[#DC2626] drop-shadow-[0_0_6px_rgba(255,255,255,0.9)]'}`}>
              湘超联赛 2025 赛季
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black tracking-tight leading-[0.9] mb-6"
          >
            {isDark ? (
              <>
                <span className="text-white" style={{ textShadow: '0 0 20px oklch(0.58 0.22 25 / 40%)' }}>湘超</span>
                <br />
                <span className="text-[#DC2626]" style={{ textShadow: '0 0 30px oklch(0.58 0.22 25 / 60%)' }}>互动中心</span>
              </>
            ) : (
              <>
                <span className="text-white" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>湘超</span>
                <br />
                <span className="text-[#DC2626]" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>互动中心</span>
              </>
            )}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className={`text-base sm:text-lg md:text-xl font-body max-w-xl mb-8 sm:mb-10 leading-relaxed
              ${isDark ? 'text-[oklch(0.7_0.005_280)]' : 'text-white/90'}`}
            style={isDark ? {} : { textShadow: '0 1px 6px rgba(0,0,0,0.6)' }}
          >
            14支球队，14座城市，一场属于湖南人的足球盛宴。
            <br />
            投票、打气、评分——你的每一次互动都在书写湘超历史。
          </motion.p>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-wrap gap-4 sm:gap-6 mb-8 sm:mb-10"
          >
            {[
              { icon: Trophy, value: TEAMS.length, label: '参赛球队', color: '#DC2626', bgLight: 'bg-red-50/80', bgDark: 'bg-[oklch(0.58_0.22_25/15%)]' },
              { icon: Zap, value: liveMatches.length, label: '正在直播', color: isDark ? '#00D4FF' : '#0284C7', bgLight: 'bg-blue-50/80', bgDark: 'bg-[oklch(0.75_0.15_220/15%)]' },
              { icon: Users, value: totalVotes.toLocaleString(), label: '累计投票', color: isDark ? '#39FF14' : '#16A34A', bgLight: 'bg-green-50/80', bgDark: 'bg-[oklch(0.85_0.3_142/15%)]' },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center backdrop-blur-sm ${isDark ? stat.bgDark : stat.bgLight}`}>
                  <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
                <div>
                  <div className={`font-mono text-xl font-bold ${isDark ? 'text-white' : 'text-white'}`}
                    style={isDark ? {} : { textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
                    {stat.value}
                  </div>
                  <div className={`text-[10px] font-mono tracking-wider ${isDark ? 'text-[oklch(0.5_0.005_280)]' : 'text-white/70'}`}
                    style={isDark ? {} : { textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4"
          >
            <button
              onClick={() => onNavigate('interactive')}
              className={`group relative px-6 sm:px-8 py-3 bg-[#DC2626] text-white font-display text-sm font-bold tracking-wider w-full sm:w-auto text-center
                         hover:bg-[#B91C1C] transition-all duration-300 rounded-lg
                         ${isDark ? 'shadow-[0_0_20px_oklch(0.58_0.22_25/30%)] hover:shadow-[0_0_30px_oklch(0.58_0.22_25/50%)]' : 'shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40'}`}
            >
              立即参与互动
            </button>
            <button
              onClick={() => onNavigate('dashboard')}
              className={`px-6 sm:px-8 py-3 font-display text-sm font-bold tracking-wider transition-all duration-300 rounded-lg backdrop-blur-sm w-full sm:w-auto text-center
                         ${isDark
                           ? 'border border-[oklch(1_0_0/15%)] text-white hover:border-[#00D4FF] hover:text-[#00D4FF] bg-[oklch(0.08_0.01_280/40%)]'
                           : 'border border-white/40 text-white hover:border-white hover:bg-white/20 bg-white/10'
                         }`}
            >
              查看数据看板
            </button>
          </motion.div>
        </div>
      </div>

      {/* Live match ticker at bottom */}
      {liveMatches.length > 0 && (
        <div className="relative mt-auto">
          <div className="container mx-auto pb-6">
            <div className="glass-panel rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isDark ? 'bg-[#39FF14]' : 'bg-[#16A34A]'}`} />
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${isDark ? 'bg-[#39FF14]' : 'bg-[#16A34A]'}`} />
                </span>
                <span className={`font-mono text-xs tracking-wider ${isDark ? 'text-[#39FF14]' : 'text-[#16A34A]'}`}>正在直播</span>
              </div>
              <div className="flex flex-wrap gap-4">
                {liveMatches.map(match => {
                  const home = TEAMS.find(t => t.id === match.homeTeam);
                  const away = TEAMS.find(t => t.id === match.awayTeam);
                  if (!home || !away) return null;
                  return (
                    <div key={match.id} className={`flex items-center gap-3 rounded-lg px-4 py-2 border
                      ${isDark ? 'bg-[oklch(0.1_0.01_280/60%)] border-[oklch(1_0_0/6%)]' : 'bg-gray-50 border-gray-100'}`}>
                      <div className="flex items-center gap-2">
                        <img src={home.logo} alt={home.name} className="w-6 h-6 rounded-full object-cover" />
                        <span className={`font-body text-sm font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>{home.city}</span>
                      </div>
                      <div className={`font-mono text-lg font-bold px-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {match.homeScore} <span className={isDark ? 'text-[oklch(0.4_0.005_280)]' : 'text-gray-300'}>-</span> {match.awayScore}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`font-body text-sm font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>{away.city}</span>
                        <img src={away.logo} alt={away.name} className="w-6 h-6 rounded-full object-cover" />
                      </div>
                      <span className={`font-mono text-xs ml-2 ${isDark ? 'text-[#39FF14]' : 'text-[#16A34A]'}`}>{match.time}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2"
      >
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <ChevronDown className={`w-5 h-5 ${isDark ? 'text-[oklch(0.4_0.005_280)]' : 'text-white/60'}`} />
        </motion.div>
      </motion.div>
    </section>
  );
}
