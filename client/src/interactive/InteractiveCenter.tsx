/* Dual-theme Interactive Center: Voting, Cheering, Comments */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageSquare, Flame, Send, ThumbsUp, Zap } from 'lucide-react';
import { TEAMS, CHEER_SLOGANS, type Team } from '@/interactive/interactive-data';
import { useInteraction } from '@/interactive/InteractionContext';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from 'sonner';

type InteractiveTab = 'vote' | 'cheer' | 'comment';

/* Shared theme helpers */
function useThemeClasses() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  return {
    isDark,
    textPrimary: isDark ? 'text-white' : 'text-gray-900',
    textSecondary: isDark ? 'text-[oklch(0.7_0.005_280)]' : 'text-gray-500',
    textMuted: isDark ? 'text-[oklch(0.5_0.005_280)]' : 'text-gray-400',
    subBg: isDark ? 'bg-[oklch(0.1_0.01_280/60%)]' : 'bg-gray-50',
    inputBg: isDark ? 'bg-[oklch(0.12_0.01_280)] border-[oklch(1_0_0/10%)] text-white placeholder:text-[oklch(0.4_0.005_280)]' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400',
    greenColor: isDark ? '#39FF14' : '#16A34A',
    blueColor: isDark ? '#00D4FF' : '#0284C7',
  };
}

export default function InteractiveCenter() {
  const [activeTab, setActiveTab] = useState<InteractiveTab>('vote');
  const { isDark, textPrimary, textSecondary } = useThemeClasses();

  const tabs = [
    { id: 'vote' as const, label: '热度投票', icon: Heart, color: '#DC2626' },
    { id: 'cheer' as const, label: '线上打气', icon: Flame, color: isDark ? '#39FF14' : '#16A34A' },
    { id: 'comment' as const, label: '留言板', icon: MessageSquare, color: isDark ? '#00D4FF' : '#0284C7' },
  ];

  return (
    <section id="interactive" className="relative py-12 sm:py-20 lg:py-28">
      <div className="container mx-auto relative">
        <div className="flex items-center gap-3 mb-4">
          <span className="h-[1px] w-8" style={{ backgroundColor: isDark ? '#39FF14' : '#16A34A' }} />
          <span className="font-mono text-xs tracking-[0.3em]" style={{ color: isDark ? '#39FF14' : '#16A34A' }}>互动中心</span>
        </div>
        <h2 className={`font-display text-2xl sm:text-3xl lg:text-5xl font-bold tracking-tight mb-6 sm:mb-8 ${textPrimary}`}>
          互动<span className="neon-text-green">中心</span>
        </h2>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-body text-sm font-medium tracking-wide transition-all duration-300 whitespace-nowrap
                ${activeTab === tab.id
                  ? textPrimary + ' shadow-sm'
                  : isDark ? 'text-[oklch(0.4_0.005_280)] hover:text-white bg-[oklch(0.12_0.01_280/60%)] border border-[oklch(1_0_0/8%)]' : 'text-gray-400 hover:text-gray-700 bg-white border border-gray-200'
                }`}
              style={activeTab === tab.id ? {
                backgroundColor: isDark ? `${tab.color}15` : `${tab.color}10`,
                border: `1px solid ${isDark ? tab.color + '40' : tab.color + '30'}`,
              } : undefined}
            >
              <tab.icon className="w-4 h-4" style={activeTab === tab.id ? { color: tab.color } : undefined} />
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
            {activeTab === 'vote' && <VotingPanel />}
            {activeTab === 'cheer' && <CheeringPanel />}
            {activeTab === 'comment' && <CommentPanel />}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

/* ---- Voting Panel ---- */
function VotingPanel() {
  const { votes, hasVoted, voteForTeam } = useInteraction();
  const [animatingTeam, setAnimatingTeam] = useState<string | null>(null);
  const { isDark, textPrimary, textSecondary, textMuted, greenColor } = useThemeClasses();

  const teamVotes = TEAMS.map(team => ({
    ...team,
    totalVotes: team.votes + (votes[team.id] || 0),
  })).sort((a, b) => b.totalVotes - a.totalVotes);
  const maxVotes = Math.max(...teamVotes.map(t => t.totalVotes));

  const handleVote = (teamId: string) => {
    if (hasVoted) { toast.error('每台设备只能投出一票哦！'); return; }
    setAnimatingTeam(teamId);
    voteForTeam(teamId);
    toast.success('投票成功！感谢你的支持！');
    setTimeout(() => setAnimatingTeam(null), 1000);
  };

  return (
    <div>
      <p className={`text-sm font-body mb-6 ${textSecondary}`}>为你支持的球队投上宝贵的一票！每台设备限投一次。</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {teamVotes.map((team, index) => (
          <motion.div
            key={team.id}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            className={`glass-panel rounded-xl p-4 transition-all duration-300 cursor-pointer group hover:shadow-md
              ${animatingTeam === team.id ? 'ring-2 ring-[#DC2626]' : ''}
              ${hasVoted && votes[team.id] ? (isDark ? 'ring-1 ring-[#39FF14]/30' : 'ring-1 ring-[#16A34A]/30 bg-green-50/30') : ''}`}
            onClick={() => handleVote(team.id)}
          >
            <div className="flex items-center gap-3 mb-3">
              <img src={team.logo} alt={team.name} className="w-10 h-10 rounded-lg object-cover shadow-sm" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className={`font-display text-sm font-bold ${textPrimary}`}>{team.city}</span>
                  <span className={`font-mono text-xs ${textMuted}`}>#{index + 1}</span>
                </div>
              </div>
            </div>
            <div className="mb-2">
              <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-[oklch(0.15_0.01_280)]' : 'bg-gray-100'}`}>
                <motion.div
                  className="h-full rounded-full"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${(team.totalVotes / maxVotes) * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.05 }}
                  style={{ background: `linear-gradient(90deg, ${team.color}, ${team.color}88)` }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className={`font-mono text-xs ${textSecondary}`}>{team.totalVotes.toLocaleString()} 票</span>
              {hasVoted && votes[team.id] ? (
                <span className="text-[10px] font-mono flex items-center gap-1" style={{ color: greenColor }}>
                  <ThumbsUp className="w-3 h-3" /> 已投票
                </span>
              ) : (
                <span className={`text-[10px] font-mono ${textMuted} group-hover:text-[#DC2626] transition-colors`}>点击投票</span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ---- Cheering Panel ---- */
function CheeringPanel() {
  const { cheerHeat, cheerSlogan } = useInteraction();
  const [selectedTeam, setSelectedTeam] = useState<Team>(TEAMS[0]);
  const [burstEffects, setBurstEffects] = useState<{ id: string; text: string }[]>([]);
  const { isDark, textPrimary, textSecondary, textMuted } = useThemeClasses();

  const handleCheer = (sloganId: string, text: string) => {
    cheerSlogan(sloganId);
    const effectId = `${Date.now()}-${Math.random()}`;
    setBurstEffects(prev => [...prev, { id: effectId, text }]);
    setTimeout(() => setBurstEffects(prev => prev.filter(e => e.id !== effectId)), 1500);
  };

  return (
    <div>
      <p className={`text-sm font-body mb-4 ${textSecondary}`}>选择你支持的球队，为他们线上打气！点击口号即可增加热度。</p>
      <div className="relative mb-6">
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-8 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-8 bg-gradient-to-l from-background to-transparent" />
        <div className="flex gap-3 overflow-x-auto pb-3 px-1 snap-x snap-mandatory scrollbar-hide" aria-label="滑动选择打气球队">
          {TEAMS.map(team => (
            <button
              key={team.id}
              onClick={() => setSelectedTeam(team)}
              className={`shrink-0 snap-start flex w-[74px] flex-col items-center gap-2 rounded-2xl px-2.5 py-3 text-[11px] font-body font-bold transition-all touch-manipulation
                ${selectedTeam.id === team.id
                  ? isDark ? 'bg-[oklch(0.58_0.22_25/18%)] border border-[oklch(0.58_0.22_25/35%)] shadow-lg shadow-red-500/10' + ` ${textPrimary}` : 'bg-red-50 border border-[#DC2626]/25 text-gray-900 shadow-lg shadow-red-500/10'
                  : isDark ? 'bg-[oklch(0.12_0.01_280/60%)] border border-[oklch(1_0_0/8%)] text-[oklch(0.55_0.005_280)]' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
            >
              <span className={`relative flex h-12 w-12 items-center justify-center rounded-full border-2 bg-white shadow-sm transition-all
                ${selectedTeam.id === team.id ? 'border-[#DC2626] scale-105' : 'border-white'}`}>
                <img src={team.logo} alt={team.name} className="h-10 w-10 rounded-full object-cover" />
              </span>
              <span className="max-w-full truncate">{team.city}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <AnimatePresence>
          {burstEffects.map(effect => (
            <motion.div key={effect.id} initial={{ opacity: 1, y: 0, scale: 1 }} animate={{ opacity: 0, y: -60, scale: 1.5 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
              <span className="font-display text-2xl font-bold text-[#DC2626] whitespace-nowrap">{effect.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {CHEER_SLOGANS.map(slogan => {
            const heat = cheerHeat[slogan.id] || 0;
            return (
              <motion.button key={slogan.id} whileTap={{ scale: 0.95 }} onClick={() => handleCheer(slogan.id, slogan.text)}
                className="glass-panel rounded-xl p-4 text-center transition-all duration-300 hover:shadow-md group">
                <div className={`font-body text-base font-semibold mb-2 group-hover:text-[#DC2626] transition-colors ${isDark ? 'text-white' : 'text-gray-800'}`}>{slogan.text}</div>
                <div className="flex items-center justify-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span className="font-mono text-sm font-bold text-[#F59E0B]">{heat}</span>
                  <span className={`font-mono text-[10px] ${textMuted}`}>热度</span>
                </div>
              </motion.button>
            );
          })}
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleCheer(`team-${selectedTeam.id}`, selectedTeam.slogan)}
            className={`glass-panel rounded-xl p-4 text-center transition-all duration-300 border border-dashed hover:shadow-md ${isDark ? 'border-[oklch(1_0_0/15%)] hover:border-[#DC2626]/40' : 'border-gray-300 hover:border-[#DC2626]/40'}`}>
            <div className="flex items-center justify-center gap-2 mb-2">
              <img src={selectedTeam.logo} alt={selectedTeam.name} className="w-9 h-9 rounded-full object-cover shadow-sm" />
              <span className={`font-body text-sm font-semibold ${textPrimary}`}>{selectedTeam.city}专属</span>
            </div>
            <div className={`font-body text-xs italic ${textSecondary}`}>"{selectedTeam.slogan}"</div>
            <div className="flex items-center justify-center gap-1.5 mt-2">
              <Zap className="w-3 h-3 text-[#DC2626]" />
              <span className={`font-mono text-xs ${textMuted}`}>点击打气</span>
            </div>
          </motion.button>
        </div>
      </div>
    </div>
  );
}

/* ---- Comment Panel ---- */
function CommentPanel() {
  const { comments, addComment } = useInteraction();
  const [nickname, setNickname] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState(TEAMS[0].id);
  const [content, setContent] = useState('');
  const [commentType, setCommentType] = useState<'cheer' | 'review'>('cheer');
  const { isDark, textPrimary, textSecondary, textMuted, inputBg, blueColor, greenColor } = useThemeClasses();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim() || !content.trim()) { toast.error('请填写昵称和留言内容'); return; }
    addComment({ nickname: nickname.trim(), teamId: selectedTeamId, content: content.trim(), type: commentType });
    setContent('');
    toast.success('留言发表成功！');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-2">
        <div className="glass-panel rounded-xl p-6 sticky top-20">
          <h4 className={`font-display text-sm font-bold tracking-wider mb-4 ${textSecondary}`}>发表留言</h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`text-[10px] font-mono tracking-wider mb-1 block ${textMuted}`}>昵称</label>
              <input type="text" value={nickname} onChange={e => setNickname(e.target.value)} placeholder="输入你的昵称" maxLength={20}
                className={`w-full px-3 py-2 rounded-lg border text-sm font-body focus:outline-none focus:ring-1 transition-all ${inputBg} focus:border-[${blueColor}]/40 focus:ring-[${blueColor}]/20`} />
            </div>
            <div>
              <label className={`text-[10px] font-mono tracking-wider mb-1 block ${textMuted}`}>支持球队</label>
              <select value={selectedTeamId} onChange={e => setSelectedTeamId(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border text-sm font-body focus:outline-none transition-all ${inputBg}`}>
                {TEAMS.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              {[
                { type: 'cheer' as const, label: '赛前打气', color: greenColor },
                { type: 'review' as const, label: '赛后评价', color: blueColor },
              ].map(t => (
                <button key={t.type} type="button" onClick={() => setCommentType(t.type)}
                  className={`flex-1 py-2 rounded-lg text-xs font-body font-medium transition-all
                    ${commentType === t.type ? textPrimary : isDark ? 'text-[oklch(0.4_0.005_280)] bg-[oklch(0.12_0.01_280)] border border-[oklch(1_0_0/8%)]' : 'text-gray-400 bg-gray-50 border border-gray-200'}`}
                  style={commentType === t.type ? { backgroundColor: `${t.color}15`, border: `1px solid ${t.color}30` } : undefined}>
                  {t.label}
                </button>
              ))}
            </div>
            <div>
              <label className={`text-[10px] font-mono tracking-wider mb-1 block ${textMuted}`}>留言内容</label>
              <textarea value={content} onChange={e => setContent(e.target.value)} placeholder={commentType === 'cheer' ? '为你的球队加油打气吧！' : '分享你的赛后感想...'} maxLength={200} rows={3}
                className={`w-full px-3 py-2 rounded-lg border text-sm font-body resize-none focus:outline-none focus:ring-1 transition-all ${inputBg}`} />
              <div className={`text-right text-[10px] font-mono mt-1 ${textMuted}`}>{content.length}/200</div>
            </div>
            <button type="submit" className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-white font-display text-sm font-bold tracking-wider hover:opacity-90 transition-all shadow-md"
              style={{ backgroundColor: blueColor }}>
              <Send className="w-4 h-4" /> 发表留言
            </button>
          </form>
        </div>
      </div>

      <div className="lg:col-span-3">
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
          {comments.length === 0 ? (
            <div className="glass-panel rounded-xl p-8 text-center">
              <MessageSquare className={`w-8 h-8 mx-auto mb-3 ${isDark ? 'text-[oklch(0.3_0.005_280)]' : 'text-gray-300'}`} />
              <p className={`font-body text-sm ${textMuted}`}>还没有留言，来做第一个发言的人吧！</p>
            </div>
          ) : (
            comments.map((comment, index) => {
              const team = TEAMS.find(t => t.id === comment.teamId);
              return (
                <motion.div key={comment.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className="glass-panel rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    {team && <img src={team.logo} alt={team.name} className="w-6 h-6 rounded-full object-cover" />}
                    <span className={`font-body text-sm font-semibold ${textPrimary}`}>{comment.nickname}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: comment.type === 'cheer' ? `${greenColor}15` : `${blueColor}15`, color: comment.type === 'cheer' ? greenColor : blueColor }}>
                      {comment.type === 'cheer' ? '打气' : '评价'}
                    </span>
                    <span className={`text-[10px] font-mono ml-auto ${textMuted}`}>
                      {new Date(comment.timestamp).toLocaleString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className={`font-body text-sm leading-relaxed pl-9 ${textSecondary}`}>{comment.content}</p>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
