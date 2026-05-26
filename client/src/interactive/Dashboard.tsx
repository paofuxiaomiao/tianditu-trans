/* Dual-theme Team Dashboard */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Users, Target, Award, ChevronRight } from 'lucide-react';
import { TEAMS, type Team } from '@/interactive/interactive-data';
import { useTheme } from '@/contexts/ThemeContext';
import RadarChart from './RadarChart';
import PlayerCard from './PlayerCard';

export default function Dashboard() {
  const [selectedTeam, setSelectedTeam] = useState<Team>(TEAMS[0]);
  const [showRoster, setShowRoster] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const avgHeight = Math.round(selectedTeam.players.reduce((s, p) => s + p.height, 0) / selectedTeam.players.length);
  const avgWeight = Math.round(selectedTeam.players.reduce((s, p) => s + p.weight, 0) / selectedTeam.players.length);
  const topScorer = [...selectedTeam.players].sort((a, b) => b.goals - a.goals)[0];

  const teamAvgStats = {
    speed: Math.round(selectedTeam.players.reduce((s, p) => s + p.stats.speed, 0) / selectedTeam.players.length),
    shooting: Math.round(selectedTeam.players.reduce((s, p) => s + p.stats.shooting, 0) / selectedTeam.players.length),
    passing: Math.round(selectedTeam.players.reduce((s, p) => s + p.stats.passing, 0) / selectedTeam.players.length),
    defense: Math.round(selectedTeam.players.reduce((s, p) => s + p.stats.defense, 0) / selectedTeam.players.length),
    stamina: Math.round(selectedTeam.players.reduce((s, p) => s + p.stats.stamina, 0) / selectedTeam.players.length),
    technique: Math.round(selectedTeam.players.reduce((s, p) => s + p.stats.technique, 0) / selectedTeam.players.length),
  };

  // Theme-aware utility classes
  const subBg = isDark ? 'bg-[oklch(0.1_0.01_280/60%)]' : 'bg-gray-50';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-[oklch(0.7_0.005_280)]' : 'text-gray-500';
  const textMuted = isDark ? 'text-[oklch(0.5_0.005_280)]' : 'text-gray-400';
  const divider = isDark ? 'bg-[oklch(1_0_0/8%)]' : 'bg-gray-200';
  const barBg = isDark ? 'bg-[oklch(0.15_0.01_280)]' : 'bg-gray-100';

  return (
    <section id="dashboard" className="relative py-12 sm:py-20 lg:py-28">
      <div className="container mx-auto mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="h-[1px] w-8 bg-[#DC2626]" />
          <span className={`font-mono text-xs tracking-[0.3em] ${isDark ? 'text-[#DC2626]' : 'text-[#DC2626]'}`}>数据看板</span>
        </div>
        <h2 className={`font-display text-2xl sm:text-3xl lg:text-5xl font-bold tracking-tight ${textPrimary}`}>
          球队<span className="neon-text">数据看板</span>
        </h2>
      </div>

      <div className="container mx-auto">
        {/* Team selector */}
        <div className="mb-8 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
          <div className="flex gap-3 min-w-max">
            {TEAMS.map(team => (
              <button
                key={team.id}
                onClick={() => { setSelectedTeam(team); setShowRoster(false); }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-300 whitespace-nowrap border
                  ${selectedTeam.id === team.id
                    ? isDark ? 'bg-[oklch(0.58_0.22_25/15%)] border-[oklch(0.58_0.22_25/40%)]' : 'bg-red-50 border-[#DC2626]/30 shadow-sm'
                    : isDark ? 'bg-[oklch(0.12_0.01_280/60%)] border-[oklch(1_0_0/8%)] hover:border-[oklch(1_0_0/15%)]' : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
              >
                <img src={team.logo} alt={team.name} className="w-7 h-7 rounded-full object-cover" />
                <span className={`font-body text-sm font-medium ${selectedTeam.id === team.id ? textPrimary : textSecondary}`}>
                  {team.city}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Main dashboard grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedTeam.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6"
          >
            {/* Team overview */}
            <div className="lg:col-span-4 glass-panel rounded-xl p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="relative">
                  <img src={selectedTeam.logo} alt={selectedTeam.name} className="w-20 h-20 rounded-xl object-cover shadow-sm" />
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold text-white" style={{ backgroundColor: selectedTeam.color }}>
                    {selectedTeam.rank}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className={`font-display text-2xl font-bold ${textPrimary}`}>{selectedTeam.name}</h3>
                  <p className={`text-sm font-body ${textSecondary}`}>{selectedTeam.stadiumName}</p>
                  <p className={`text-xs font-mono mt-1 ${textMuted}`}>{selectedTeam.cultureLine}</p>
                </div>
              </div>

              <div className={`mb-6 p-3 rounded-lg border-l-2 ${subBg}`} style={{ borderColor: selectedTeam.color }}>
                <p className={`font-body text-sm italic ${textSecondary}`}>"{selectedTeam.slogan}"</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Shield, label: '教练', value: selectedTeam.coach, color: isDark ? '#00D4FF' : '#0284C7' },
                  { icon: Users, label: '阵容', value: `${selectedTeam.players.length}人`, color: isDark ? '#39FF14' : '#16A34A' },
                  { icon: Target, label: '风格', value: selectedTeam.coachStyle, color: '#DC2626' },
                  { icon: Award, label: '得分王', value: topScorer.name, color: '#F59E0B' },
                ].map(stat => (
                  <div key={stat.label} className={`flex items-center gap-2 p-2.5 rounded-lg ${subBg}`}>
                    <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                    <div>
                      <div className={`font-mono text-xs ${textMuted}`}>{stat.label}</div>
                      <div className={`font-body text-sm font-medium ${textPrimary}`}>{stat.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex gap-4">
                {[
                  { value: avgHeight, unit: 'cm', label: '平均身高' },
                  { value: avgWeight, unit: 'kg', label: '平均体重' },
                ].map(s => (
                  <div key={s.label} className={`flex-1 text-center p-2 rounded-lg ${subBg}`}>
                    <div className={`font-mono text-lg font-bold ${textPrimary}`}>{s.value}<span className={`text-xs ${textMuted}`}>{s.unit}</span></div>
                    <div className={`font-mono text-[10px] ${textMuted}`}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Radar + Season stats */}
            <div className="lg:col-span-4 flex flex-col gap-4 lg:gap-6">
              <div className="glass-panel rounded-xl p-6 flex-1">
                <h4 className={`font-display text-sm font-bold tracking-wider mb-4 ${textSecondary}`}>球队能力雷达</h4>
                <RadarChart stats={teamAvgStats} color={selectedTeam.color} />
              </div>

              <div className="glass-panel rounded-xl p-6">
                <h4 className={`font-display text-sm font-bold tracking-wider mb-4 ${textSecondary}`}>赛季战绩</h4>
                <div className="grid grid-cols-5 gap-2 text-center">
                  {[
                    { label: '积分', value: selectedTeam.points, color: '#DC2626' },
                    { label: '胜', value: selectedTeam.wins, color: isDark ? '#39FF14' : '#16A34A' },
                    { label: '平', value: selectedTeam.draws, color: '#F59E0B' },
                    { label: '负', value: selectedTeam.losses, color: '#EF4444' },
                    { label: '净胜', value: selectedTeam.goalsFor - selectedTeam.goalsAgainst, color: isDark ? '#00D4FF' : '#0284C7' },
                  ].map(stat => (
                    <div key={stat.label} className={`p-2 rounded-lg ${subBg}`}>
                      <div className="font-mono text-xl font-bold" style={{ color: stat.color }}>
                        {stat.value > 0 && stat.label === '净胜' ? '+' : ''}{stat.value}
                      </div>
                      <div className={`font-mono text-[10px] ${textMuted}`}>{stat.label}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <div className={`flex justify-between text-[10px] font-mono mb-1 ${textSecondary}`}>
                    <span>进球 {selectedTeam.goalsFor}</span>
                    <span>失球 {selectedTeam.goalsAgainst}</span>
                  </div>
                  <div className={`h-2 rounded-full overflow-hidden flex ${barBg}`}>
                    <div
                      className="h-full rounded-l-full transition-all duration-700"
                      style={{
                        width: `${(selectedTeam.goalsFor / (selectedTeam.goalsFor + selectedTeam.goalsAgainst)) * 100}%`,
                        background: `linear-gradient(90deg, ${selectedTeam.color}, ${selectedTeam.color}88)`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Roster */}
            <div className="lg:col-span-4 glass-panel rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className={`font-display text-sm font-bold tracking-wider ${textSecondary}`}>阵容档案</h4>
                <button
                  onClick={() => setShowRoster(!showRoster)}
                  className={`flex items-center gap-1 text-xs font-mono transition-colors ${isDark ? 'text-[#00D4FF] hover:text-[#00D4FF]/80' : 'text-[#0284C7] hover:text-[#0284C7]/80'}`}
                >
                  {showRoster ? '收起' : '展开全部'}
                  <ChevronRight className={`w-3 h-3 transition-transform ${showRoster ? 'rotate-90' : ''}`} />
                </button>
              </div>
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                {(['前锋', '中场', '后卫', '门将'] as const).map(pos => {
                  const posPlayers = selectedTeam.players.filter(p => p.position === pos);
                  return (
                    <div key={pos}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-[10px] font-mono tracking-wider ${textMuted}`}>{pos}</span>
                        <span className={`flex-1 h-[1px] ${divider}`} />
                      </div>
                      <div className="space-y-1.5">
                        {(showRoster ? posPlayers : posPlayers.slice(0, 2)).map(player => (
                          <PlayerCard key={player.id} player={player} teamColor={selectedTeam.color} compact />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
