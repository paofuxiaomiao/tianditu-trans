/* Dual-theme Culture Section */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Landmark, Users, Flag, Sparkles } from 'lucide-react';
import { TEAMS, type Team } from '@/interactive/interactive-data';
import { useTheme } from '@/contexts/ThemeContext';

export default function CultureSection() {
  const [selectedTeam, setSelectedTeam] = useState<Team>(TEAMS[0]);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-[oklch(0.7_0.005_280)]' : 'text-gray-500';
  const textBody = isDark ? 'text-[oklch(0.7_0.005_280)]' : 'text-gray-600';
  const textMuted = isDark ? 'text-[oklch(0.5_0.005_280)]' : 'text-gray-400';
  const goldColor = '#F59E0B';

  return (
    <section id="culture" className="relative py-12 sm:py-20 lg:py-28">
      <div className="container mx-auto relative">
        <div className="flex items-center gap-3 mb-4">
          <span className="h-[1px] w-8 bg-[#F59E0B]" />
          <span className="font-mono text-xs text-[#F59E0B] tracking-[0.3em]">文化传承</span>
        </div>
        <h2 className={`font-display text-2xl sm:text-3xl lg:text-5xl font-bold tracking-tight mb-6 sm:mb-8 ${textPrimary}`}>
          主场<span className="text-[#F59E0B]">文化</span>
        </h2>

        <div className="grid grid-cols-7 sm:grid-cols-14 gap-2 mb-8">
          {TEAMS.map(team => (
            <button
              key={team.id}
              onClick={() => setSelectedTeam(team)}
              className={`relative aspect-square rounded-lg overflow-hidden transition-all duration-300 group
                ${selectedTeam.id === team.id
                  ? isDark ? 'ring-2 ring-[#F59E0B] shadow-[0_0_15px_oklch(0.7_0.18_50/30%)]' : 'ring-2 ring-[#F59E0B] shadow-md shadow-amber-100/50'
                  : 'opacity-50 hover:opacity-80'}`}
            >
              <img src={team.logo} alt={team.name} className="w-full h-full object-cover" />
              {selectedTeam.id === team.id && <div className="absolute inset-0 bg-[#F59E0B]/10" />}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={selectedTeam.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.4 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass-panel rounded-xl overflow-hidden">
              <div className="p-6 relative" style={{ background: `linear-gradient(135deg, ${selectedTeam.color}${isDark ? '15' : '10'}, transparent)` }}>
                <div className="flex items-start gap-4 mb-4">
                  <img src={selectedTeam.logo} alt={selectedTeam.name} className="w-16 h-16 rounded-xl object-cover shadow-sm" />
                  <div>
                    <h3 className={`font-display text-2xl font-bold ${textPrimary}`}>{selectedTeam.city}</h3>
                    <p className={`font-body text-sm ${textSecondary}`}>{selectedTeam.cultureLine}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 mb-6">
                  <MapPin className="w-4 h-4 text-[#F59E0B] mt-1 shrink-0" />
                  <p className={`font-body text-sm leading-relaxed ${textBody}`}>{selectedTeam.culture.description}</p>
                </div>
                <div className="flex items-start gap-3 mb-6">
                  <Landmark className="w-4 h-4 mt-1 shrink-0" style={{ color: isDark ? '#00D4FF' : '#0284C7' }} />
                  <div>
                    <span className={`text-[10px] font-mono tracking-wider block mb-1 ${textMuted}`}>文化遗产</span>
                    <p className={`font-body text-sm ${textBody}`}>{selectedTeam.culture.heritage}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="w-4 h-4 text-[#DC2626] mt-1 shrink-0" />
                  <div>
                    <span className={`text-[10px] font-mono tracking-wider block mb-1 ${textMuted}`}>球迷组织</span>
                    <p className="font-display text-lg font-bold" style={{ color: selectedTeam.color }}>{selectedTeam.culture.fanGroup}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="glass-panel rounded-xl p-6 flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-[#F59E0B]" />
                  <h4 className={`font-display text-sm font-bold tracking-wider ${textSecondary}`}>主场仪式</h4>
                </div>
                <div className="space-y-3">
                  {selectedTeam.culture.rituals.map((ritual, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded flex items-center justify-center font-mono text-[10px] font-bold shrink-0 mt-0.5"
                        style={{ backgroundColor: `${selectedTeam.color}15`, color: selectedTeam.color }}>{i + 1}</span>
                      <span className={`font-body text-sm ${textBody}`}>{ritual}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-panel rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Flag className="w-4 h-4 text-[#DC2626]" />
                  <h4 className={`font-display text-sm font-bold tracking-wider ${textSecondary}`}>代表性横幅</h4>
                </div>
                <div className="space-y-3">
                  {selectedTeam.culture.banners.map((banner, i) => (
                    <div key={i} className="p-3 rounded-lg text-center font-display text-sm font-bold tracking-wider"
                      style={{ backgroundColor: `${selectedTeam.color}${isDark ? '15' : '08'}`, border: `1px solid ${selectedTeam.color}${isDark ? '30' : '20'}`, color: selectedTeam.color }}>
                      "{banner}"
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
