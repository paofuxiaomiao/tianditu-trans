/* Dual-theme Leaderboard */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Target, Handshake } from 'lucide-react';
import { getLeagueTable, getTopScorers, getTopAssisters } from '@/interactive/interactive-data';
import { useInteraction } from '@/interactive/InteractionContext';
import { useTheme } from '@/contexts/ThemeContext';

type LeaderboardTab = 'table' | 'scorers' | 'assists';

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState<LeaderboardTab>('table');
  const { votes } = useInteraction();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const leagueTable = getLeagueTable();
  const topScorers = getTopScorers();
  const topAssisters = getTopAssisters();

  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-[oklch(0.6_0.005_280)]' : 'text-gray-500';
  const textMuted = isDark ? 'text-[oklch(0.4_0.005_280)]' : 'text-gray-400';
  const greenColor = isDark ? '#39FF14' : '#16A34A';
  const blueColor = isDark ? '#00D4FF' : '#0284C7';

  const tabs = [
    { id: 'table' as const, label: '积分榜', icon: Trophy },
    { id: 'scorers' as const, label: '射手榜', icon: Target },
    { id: 'assists' as const, label: '助攻榜', icon: Handshake },
  ];

  return (
    <section id="leaderboard" className="relative py-12 sm:py-20 lg:py-28">
      <div className="container mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <span className="h-[1px] w-8 bg-[#DC2626]" />
          <span className="font-mono text-xs text-[#DC2626] tracking-[0.3em]">联赛榜单</span>
        </div>
        <h2 className={`font-display text-2xl sm:text-3xl lg:text-5xl font-bold tracking-tight mb-6 sm:mb-8 ${textPrimary}`}>
          联赛<span className="neon-text">榜单</span>
        </h2>

        <div className="flex gap-2 mb-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-body text-sm font-medium tracking-wide transition-all duration-300
                ${activeTab === tab.id
                  ? isDark ? 'bg-[oklch(0.58_0.22_25/15%)] border border-[oklch(0.58_0.22_25/30%)] text-white' : 'bg-red-50 border border-[#DC2626]/20 text-gray-900'
                  : isDark ? 'text-[oklch(0.4_0.005_280)] hover:text-white bg-[oklch(0.12_0.01_280/60%)] border border-[oklch(1_0_0/8%)]' : 'text-gray-400 hover:text-gray-700 bg-white border border-gray-200'
                }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-[#DC2626]' : ''}`} />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'table' && (
          <div className="glass-panel rounded-xl overflow-hidden">
            <div className={`grid grid-cols-12 gap-2 px-4 py-3 border-b ${isDark ? 'bg-[oklch(0.1_0.01_280/60%)] border-[oklch(1_0_0/8%)]' : 'bg-gray-50 border-gray-200'}`}>
              {['#', '球队', '场', '胜', '平', '负'].map((h, i) => (
                <div key={h} className={`${i === 0 ? 'col-span-1' : i === 1 ? 'col-span-3' : 'col-span-1 text-center'} font-mono text-[10px] ${textMuted}`}>{h}</div>
              ))}
              <div className={`col-span-1 font-mono text-[10px] text-center hidden sm:block ${textMuted}`}>进/失</div>
              <div className={`col-span-1 font-mono text-[10px] text-center hidden sm:block ${textMuted}`}>净胜</div>
              <div className={`col-span-1 font-mono text-[10px] text-center hidden sm:block ${textMuted}`}>热度</div>
              <div className="col-span-1 font-mono text-[10px] text-[#DC2626] text-center">积分</div>
            </div>

            {leagueTable.map((team, index) => {
              const totalGames = team.wins + team.draws + team.losses;
              const gd = team.goalsFor - team.goalsAgainst;
              const teamVotes = team.votes + (votes[team.id] || 0);

              return (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.03 }}
                  className={`grid grid-cols-12 gap-2 px-4 py-3 items-center transition-colors border-b
                    ${isDark
                      ? `${index < 3 ? 'bg-[oklch(0.58_0.22_25/8%)]' : index % 2 === 0 ? 'bg-[oklch(0.1_0.01_280/30%)]' : ''} border-[oklch(1_0_0/5%)] hover:bg-[oklch(1_0_0/5%)]`
                      : `${index < 3 ? 'bg-red-50/40' : index % 2 === 0 ? 'bg-gray-50/50' : ''} border-gray-100 hover:bg-gray-100/60`
                    }`}
                >
                  <div className="col-span-1">
                    <span className={`inline-flex w-6 h-6 rounded items-center justify-center font-mono text-xs font-bold
                      ${index === 0 ? 'bg-amber-100 text-[#F59E0B]' : index === 1 ? (isDark ? 'bg-[oklch(0.3_0.005_280)] text-[oklch(0.7_0.005_280)]' : 'bg-gray-200 text-gray-500') : index === 2 ? 'bg-orange-100 text-[#CD7F32]' : textMuted}`}>
                      {index + 1}
                    </span>
                  </div>
                  <div className="col-span-3 flex items-center gap-2">
                    <img src={team.logo} alt={team.name} className="w-7 h-7 rounded object-cover" />
                    <span className={`font-body text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-800'}`}>{team.city}</span>
                  </div>
                  <div className={`col-span-1 font-mono text-xs text-center ${textSecondary}`}>{totalGames}</div>
                  <div className="col-span-1 font-mono text-xs text-center" style={{ color: greenColor }}>{team.wins}</div>
                  <div className={`col-span-1 font-mono text-xs text-center ${textSecondary}`}>{team.draws}</div>
                  <div className="col-span-1 font-mono text-xs text-[#EF4444] text-center">{team.losses}</div>
                  <div className={`col-span-1 font-mono text-xs text-center hidden sm:block ${textSecondary}`}>{team.goalsFor}/{team.goalsAgainst}</div>
                  <div className="col-span-1 font-mono text-xs text-center hidden sm:block" style={{ color: gd > 0 ? greenColor : gd < 0 ? '#EF4444' : '#9CA3AF' }}>
                    {gd > 0 ? '+' : ''}{gd}
                  </div>
                  <div className={`col-span-1 font-mono text-[10px] text-center hidden sm:block ${textMuted}`}>{teamVotes}</div>
                  <div className="col-span-1 font-mono text-sm font-bold text-[#DC2626] text-center">{team.points}</div>
                </motion.div>
              );
            })}
          </div>
        )}

        {activeTab === 'scorers' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topScorers.map((item, index) => (
              <motion.div key={item.player.id} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }} className="glass-panel rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-display text-sm font-black
                    ${index === 0 ? 'bg-amber-100 text-[#F59E0B]' : index === 1 ? (isDark ? 'bg-[oklch(0.3_0.005_280)] text-[oklch(0.7_0.005_280)]' : 'bg-gray-200 text-gray-500') : index === 2 ? 'bg-orange-100 text-[#CD7F32]' : isDark ? 'bg-[oklch(0.15_0.01_280)] text-[oklch(0.4_0.005_280)]' : 'bg-gray-100 text-gray-400'}`}>
                    {index + 1}
                  </span>
                  <img src={item.team.logo} alt={item.team.name} className="w-8 h-8 rounded object-cover" />
                  <div className="flex-1">
                    <div className={`font-body text-sm font-semibold ${textPrimary}`}>{item.player.name}</div>
                    <div className={`text-[10px] font-mono ${textMuted}`}>{item.team.city} · #{item.player.number}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-2xl font-black text-[#DC2626]">{item.player.goals}</div>
                    <div className={`text-[10px] font-mono ${textMuted}`}>进球</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'assists' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topAssisters.map((item, index) => (
              <motion.div key={item.player.id} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }} className="glass-panel rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-display text-sm font-black
                    ${index === 0 ? 'bg-amber-100 text-[#F59E0B]' : index === 1 ? (isDark ? 'bg-[oklch(0.3_0.005_280)] text-[oklch(0.7_0.005_280)]' : 'bg-gray-200 text-gray-500') : index === 2 ? 'bg-orange-100 text-[#CD7F32]' : isDark ? 'bg-[oklch(0.15_0.01_280)] text-[oklch(0.4_0.005_280)]' : 'bg-gray-100 text-gray-400'}`}>
                    {index + 1}
                  </span>
                  <img src={item.team.logo} alt={item.team.name} className="w-8 h-8 rounded object-cover" />
                  <div className="flex-1">
                    <div className={`font-body text-sm font-semibold ${textPrimary}`}>{item.player.name}</div>
                    <div className={`text-[10px] font-mono ${textMuted}`}>{item.team.city} · #{item.player.number}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-2xl font-black" style={{ color: blueColor }}>{item.player.assists}</div>
                    <div className={`text-[10px] font-mono ${textMuted}`}>助攻</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
