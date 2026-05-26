/* Dual-theme Match Center */
import { motion } from 'framer-motion';
import { MATCHES, TEAMS, type Match } from '@/interactive/interactive-data';
import { useTheme } from '@/contexts/ThemeContext';

function MatchCard({ match, index }: { match: Match; index: number }) {
  const home = TEAMS.find(t => t.id === match.homeTeam);
  const away = TEAMS.find(t => t.id === match.awayTeam);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  if (!home || !away) return null;

  const liveColor = isDark ? '#39FF14' : '#16A34A';
  const blueColor = isDark ? '#00D4FF' : '#0284C7';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textMuted = isDark ? 'text-[oklch(0.5_0.005_280)]' : 'text-gray-400';
  const textSecondary = isDark ? 'text-[oklch(0.6_0.005_280)]' : 'text-gray-500';
  const borderSub = isDark ? 'border-[oklch(1_0_0/8%)]' : 'border-gray-100';

  const statusColors: Record<string, { bg: string; text: string; border: string }> = {
    LIVE: { bg: isDark ? 'bg-[oklch(0.85_0.3_142/10%)]' : 'bg-green-50', text: `text-[${liveColor}]`, border: isDark ? 'border-[oklch(0.85_0.3_142/30%)]' : 'border-green-200' },
    'FULL TIME': { bg: isDark ? 'bg-[oklch(0.2_0.01_280)]' : 'bg-gray-50', text: textSecondary, border: isDark ? 'border-[oklch(1_0_0/8%)]' : 'border-gray-200' },
    PREVIEW: { bg: isDark ? 'bg-[oklch(0.75_0.15_220/10%)]' : 'bg-blue-50', text: `text-[${blueColor}]`, border: isDark ? 'border-[oklch(0.75_0.15_220/30%)]' : 'border-blue-200' },
  };
  const statusStyle = statusColors[match.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className={`glass-panel rounded-xl p-5 ${match.status === 'LIVE' ? (isDark ? 'neon-border' : 'border-green-300 shadow-md shadow-green-100/50') : ''}`}
    >
      <div className="flex items-center justify-between mb-4">
        <span className={`font-mono text-[10px] tracking-wider ${textMuted}`}>第{match.round}轮</span>
        <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono ${statusStyle.bg} ${statusStyle.text} border ${statusStyle.border}`}>
          {match.status === 'LIVE' && (
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: liveColor }} />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ backgroundColor: liveColor }} />
            </span>
          )}
          {match.status === 'LIVE' ? `直播中 ${match.time}` : match.status === 'PREVIEW' ? '即将开始' : '已结束'}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <img src={home.logo} alt={home.name} className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover shadow-sm" />
          <div>
            <div className={`font-display text-base font-bold ${textPrimary}`}>{home.city}</div>
            <div className={`text-[10px] font-mono ${textMuted}`}>主场</div>
          </div>
        </div>
        <div className="px-3 sm:px-6 text-center">
          {match.status === 'PREVIEW' ? (
            <div className={`font-mono text-sm ${textMuted}`}>{match.time}</div>
          ) : (
            <div className="flex items-center gap-3">
              <span className={`font-display text-2xl sm:text-3xl font-black ${textPrimary}`}>{match.homeScore}</span>
              <span className={`font-mono text-base sm:text-lg ${isDark ? 'text-[oklch(0.3_0.005_280)]' : 'text-gray-300'}`}>:</span>
              <span className={`font-display text-2xl sm:text-3xl font-black ${textPrimary}`}>{match.awayScore}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 flex-1 justify-end">
          <div className="text-right">
            <div className={`font-display text-base font-bold ${textPrimary}`}>{away.city}</div>
            <div className={`text-[10px] font-mono ${textMuted}`}>客场</div>
          </div>
          <img src={away.logo} alt={away.name} className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover shadow-sm" />
        </div>
      </div>

      <div className={`mt-4 pt-3 border-t ${borderSub}`}>
        <p className={`text-xs font-body leading-relaxed ${textSecondary}`}>{match.summary}</p>
      </div>
    </motion.div>
  );
}

export default function MatchCenter() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const liveMatches = MATCHES.filter(m => m.status === 'LIVE');
  const upcomingMatches = MATCHES.filter(m => m.status === 'PREVIEW');
  const finishedMatches = MATCHES.filter(m => m.status === 'FULL TIME');

  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const blueColor = isDark ? '#00D4FF' : '#0284C7';
  const liveColor = isDark ? '#39FF14' : '#16A34A';

  return (
    <section id="matches" className="relative py-12 sm:py-20 lg:py-28">
      <div className="container mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <span className="h-[1px] w-8" style={{ backgroundColor: blueColor }} />
          <span className="font-mono text-xs tracking-[0.3em]" style={{ color: blueColor }}>赛事中心</span>
        </div>
        <h2 className={`font-display text-2xl sm:text-3xl lg:text-5xl font-bold tracking-tight mb-8 sm:mb-12 ${textPrimary}`}>
          赛事<span className="neon-text-blue">战报</span>
        </h2>

        {liveMatches.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: liveColor }} />
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: liveColor }} />
              </span>
              <span className="font-mono text-xs tracking-wider" style={{ color: liveColor }}>正在进行</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {liveMatches.map((m, i) => <MatchCard key={m.id} match={m} index={i} />)}
            </div>
          </div>
        )}

        {upcomingMatches.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: blueColor }} />
              <span className="font-mono text-xs tracking-wider" style={{ color: blueColor }}>即将开始</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingMatches.map((m, i) => <MatchCard key={m.id} match={m} index={i} />)}
            </div>
          </div>
        )}

        {finishedMatches.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className={`w-2 h-2 rounded-full ${isDark ? 'bg-[oklch(0.4_0.005_280)]' : 'bg-gray-400'}`} />
              <span className={`font-mono text-xs tracking-wider ${isDark ? 'text-[oklch(0.4_0.005_280)]' : 'text-gray-400'}`}>已结束</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {finishedMatches.map((m, i) => <MatchCard key={m.id} match={m} index={i} />)}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
