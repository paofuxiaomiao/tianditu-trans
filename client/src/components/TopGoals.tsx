/**
 * TopGoals - 十佳进球展示栏组件
 * Design: 「湘火燎原」国潮运动风 - 横向滚动卡片 + 排名动效
 */

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Play, ChevronLeft, ChevronRight, Flame, Timer, Target, Zap } from 'lucide-react';
import { topGoals, type TopGoal } from '@/data/top-goals';
import { assetPath } from '@/lib/sitePaths';

function GoalCard({ goal, isActive, onClick }: { goal: TopGoal; isActive: boolean; onClick: () => void }) {
  return (
    <motion.div
      layout
      onClick={onClick}
      className={`relative flex-shrink-0 cursor-pointer transition-all duration-500 ${
        isActive ? 'w-[320px] sm:w-[380px]' : 'w-[260px] sm:w-[300px]'
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div
        className={`relative h-[280px] sm:h-[320px] rounded-2xl border overflow-hidden transition-all duration-500 ${
          isActive
            ? 'border-white/20 shadow-2xl shadow-black/40'
            : 'border-white/5 hover:border-white/10'
        }`}
      >
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src={assetPath(goal.image)}
            alt={`${goal.player} - ${goal.goalType}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
        </div>

        {/* Top gradient accent */}
        <div
          className="absolute top-0 left-0 right-0 h-1 opacity-80 z-10"
          style={{ background: `linear-gradient(90deg, transparent, ${goal.teamColor}, transparent)` }}
        />

        {/* Rank badge */}
        <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black"
            style={{
              background: goal.rank <= 3
                ? `linear-gradient(135deg, ${goal.rank === 1 ? '#FFD700' : goal.rank === 2 ? '#C0C0C0' : '#CD7F32'}, ${goal.rank === 1 ? '#FFA500' : goal.rank === 2 ? '#A0A0A0' : '#A0522D'})`
                : 'rgba(255,255,255,0.1)',
              color: goal.rank <= 3 ? '#000' : 'rgba(255,255,255,0.6)',
            }}
          >
            {goal.rank}
          </div>
          {goal.rank === 1 && <Trophy className="w-4 h-4 text-[#FFD700]" />}
        </div>

        {/* Goal type tag */}
        <div className="absolute top-4 right-4 z-10">
          <span
            className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider border"
            style={{
              borderColor: `${goal.teamColor}40`,
              backgroundColor: `${goal.teamColor}15`,
              color: goal.teamColor,
            }}
          >
            {goal.goalType}
          </span>
        </div>

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-5 z-10">
          {/* Player & Team */}
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-2.5 h-2.5 rounded-full ring-1 ring-white/20"
                style={{ backgroundColor: goal.teamColor }}
              />
              <span className="text-xs text-white/40" style={{ fontFamily: "'DM Mono', monospace" }}>
                {goal.team} vs {goal.opponent}
              </span>
            </div>
            <h4
              className="text-xl sm:text-2xl font-black text-white mb-1"
              style={{ fontFamily: "'Noto Serif SC', serif" }}
            >
              {goal.player}
            </h4>
            <div className="flex items-center gap-3 text-xs text-white/30">
              <span className="flex items-center gap-1">
                <Timer className="w-3 h-3" />
                {goal.minute}'
              </span>
              <span className="flex items-center gap-1">
                <Target className="w-3 h-3" />
                {goal.matchType}
              </span>
            </div>
          </div>

          {/* Description - only show when active */}
          <AnimatePresence>
            {isActive && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="text-xs text-white/40 leading-relaxed line-clamp-3"
                style={{ fontFamily: "'Noto Sans SC', sans-serif" }}
              >
                {goal.description}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Video link indicator */}
          {goal.videoUrl && (
            <div className="mt-3 flex items-center gap-1.5 text-[10px] text-[#FF5252]/70">
              <Play className="w-3 h-3" />
              <span>视频回放</span>
            </div>
          )}
        </div>

        {/* Background decorative elements */}
        <div className="absolute top-12 right-4 opacity-[0.06] z-10">
          <span
            className="text-[80px] font-black text-white"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            {goal.rank}
          </span>
        </div>

        {/* Hover glow */}
        <div
          className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-3xl"
          style={{ background: goal.teamColor }}
        />
      </div>
    </motion.div>
  );
}

export default function TopGoals() {
  const [activeId, setActiveId] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 320;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <section className="relative py-14 sm:py-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] via-[#0D0808] to-[#0A0A0A]" />
      
      {/* Decorative fire particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-[#FF5252]/30"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
            animate={{
              y: [-20, -60, -20],
              opacity: [0.3, 0.7, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.4,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8 sm:mb-14 px-4 sm:px-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 sm:mb-6 rounded-full border border-[#FF5252]/20 bg-[#FF5252]/5">
            <Zap className="w-3.5 h-3.5 text-[#FF5252]" />
            <span className="text-xs tracking-[0.15em] text-[#FF8A80]" style={{ fontFamily: "'DM Mono', monospace" }}>
              精彩瞬间
            </span>
          </div>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 sm:mb-4"
            style={{
              fontFamily: "'Noto Serif SC', serif",
              background: 'linear-gradient(135deg, #FFFFFF 0%, #FF5252 50%, #FFD54F 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            十佳进球
          </h2>
          <p className="text-white/40 text-base sm:text-lg max-w-xl mx-auto" style={{ fontFamily: "'Noto Sans SC', sans-serif" }}>
            2025赛季最令人血脉偾张的十大进球，每一粒都是三湘足球的传奇
          </p>
        </motion.div>

        {/* Scroll controls */}
        <div className="flex items-center justify-end gap-2 px-4 sm:px-6 mb-4">
          <button
            onClick={() => scroll('left')}
            className="w-9 h-9 rounded-full border border-white/10 bg-white/[0.03] flex items-center justify-center hover:border-white/20 hover:bg-white/[0.06] transition-all"
          >
            <ChevronLeft className="w-4 h-4 text-white/50" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-9 h-9 rounded-full border border-white/10 bg-white/[0.03] flex items-center justify-center hover:border-white/20 hover:bg-white/[0.06] transition-all"
          >
            <ChevronRight className="w-4 h-4 text-white/50" />
          </button>
        </div>

        {/* Goals carousel */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto px-4 sm:px-6 pb-4 scrollbar-hide"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {topGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              isActive={activeId === goal.id}
              onClick={() => setActiveId(goal.id)}
            />
          ))}
        </div>

        {/* Active goal detail panel */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mt-8 sm:mt-12 px-4 sm:px-6"
        >
          <AnimatePresence mode="wait">
            {topGoals.filter(g => g.id === activeId).map(goal => (
              <motion.div
                key={goal.id}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="max-w-3xl mx-auto"
              >
                <div className="relative p-6 sm:p-8 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm overflow-hidden">
                  {/* Accent glow */}
                  <div
                    className="absolute -top-20 -left-20 w-60 h-60 rounded-full blur-3xl opacity-10"
                    style={{ background: goal.teamColor }}
                  />
                  
                  <div className="relative flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                    {/* Rank */}
                    <div
                      className="text-5xl sm:text-6xl font-black opacity-80"
                      style={{
                        fontFamily: "'Bebas Neue', sans-serif",
                        background: goal.rank <= 3
                          ? `linear-gradient(135deg, ${goal.rank === 1 ? '#FFD700' : goal.rank === 2 ? '#C0C0C0' : '#CD7F32'}, ${goal.rank === 1 ? '#FFA500' : goal.rank === 2 ? '#808080' : '#8B4513'})`
                          : `linear-gradient(135deg, ${goal.teamColor}, ${goal.teamColor}80)`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      #{goal.rank}
                    </div>

                    {/* Detail */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3
                          className="text-xl sm:text-2xl font-black text-white"
                          style={{ fontFamily: "'Noto Serif SC', serif" }}
                        >
                          {goal.player}
                        </h3>
                        <span
                          className="px-2 py-0.5 rounded text-xs font-bold"
                          style={{ backgroundColor: `${goal.teamColor}20`, color: goal.teamColor }}
                        >
                          {goal.team}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3 mb-3 text-xs text-white/40">
                        <span className="flex items-center gap-1">
                          <Flame className="w-3 h-3 text-[#FF5252]/60" />
                          {goal.goalType}
                        </span>
                        <span>vs {goal.opponent}</span>
                        <span>{goal.matchType}</span>
                        <span>{goal.minute}'</span>
                      </div>

                      <p
                        className="text-sm text-white/50 leading-relaxed"
                        style={{ fontFamily: "'Noto Sans SC', sans-serif" }}
                      >
                        {goal.description}
                      </p>

                      {goal.videoUrl && (
                        <a
                          href={goal.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg border border-[#FF5252]/20 bg-[#FF5252]/5 text-xs text-[#FF8A80] hover:bg-[#FF5252]/10 transition-colors"
                        >
                          <Play className="w-3.5 h-3.5" />
                          观看视频回放
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6 text-xs text-white/20 px-4"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          TOP 10 GOALS · 2025 XIANGCHAO FOOTBALL LEAGUE
        </motion.p>
      </div>
    </section>
  );
}
