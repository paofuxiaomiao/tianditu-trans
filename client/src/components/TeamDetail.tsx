/**
 * TeamDetail - 队伍详情面板
 * Design: 明亮版 - 白底卡片 + 彩色点缀
 * 改动: 去掉编号、英文改中文、增加场馆导航、球员更突出、增加湘菜推荐
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Target, Shield, Zap, MapPin, Star, Navigation, ThumbsUp, Utensils, Users, Maximize2 } from 'lucide-react';
import type { Team } from '@/data/teams';
import { featureTeams, getTeamDashboardProfile } from '@/data/feature-data';
import { assetPath } from '@/lib/sitePaths';
import Stadium3D from './Stadium3D';

// 湘菜推荐数据（按城市）
const XIANGCAI_MAP: Record<string, { name: string; desc: string }[]> = {
  永州: [{ name: '永州血鸭', desc: '永州传统名菜，鲜辣醇香' }, { name: '东安鸡', desc: '湘菜经典，酸辣鲜嫩' }],
  常德: [{ name: '常德米粉', desc: '圆粉细滑，牛肉浇头' }, { name: '钵子菜', desc: '砂钵慢炖，原汁原味' }],
  长沙: [{ name: '辣椒炒肉', desc: '湘菜灵魂，下饭首选' }, { name: '臭豆腐', desc: '长沙名片，外焦里嫩' }],
  株洲: [{ name: '株洲炒码粉', desc: '大火爆炒，鲜香浓郁' }, { name: '醴陵焖鹅', desc: '醴陵特色，肉质鲜美' }],
  娄底: [{ name: '新化三合汤', desc: '牛血牛肉牛肚三合一' }, { name: '白溪豆腐', desc: '质嫩味美，百年传承' }],
  衡阳: [{ name: '衡阳鱼粉', desc: '鲜鱼熬汤，粉滑汤鲜' }, { name: '衡东土菜', desc: '原生态食材，乡土风味' }],
  郴州: [{ name: '栖凤渡鱼粉', desc: '辣椒红油鱼汤粉' }, { name: '临武鸭', desc: '郴州名产，香辣入味' }],
  岳阳: [{ name: '岳阳烧烤', desc: '洞庭湖鲜，炭火飘香' }, { name: '巴陵全鱼席', desc: '洞庭湖鱼宴' }],
  益阳: [{ name: '安化擂茶', desc: '养生茶饮，清香回甘' }, { name: '南县小龙虾', desc: '稻虾共生，肉质紧实' }],
  邵阳: [{ name: '猪血丸子', desc: '邵阳特色，咸香耐嚼' }, { name: '武冈卤菜', desc: '非遗卤味，百年工艺' }],
};

interface TeamDetailProps {
  team: Team | null;
  onClose: () => void;
}

export default function TeamDetail({ team, onClose }: TeamDetailProps) {
  const [liked, setLiked] = useState<Record<string, boolean>>({});

  const handleLike = (teamId: string) => {
    setLiked((prev) => ({ ...prev, [teamId]: !prev[teamId] }));
  };

  return (
    <AnimatePresence mode="wait">
      {team && (
        <motion.div
          key={team.id}
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 250 }}
          className="absolute top-0 right-0 bottom-0 w-full max-w-[420px] z-[1000] overflow-hidden"
        >
          {/* Backdrop - white/frosted glass */}
          <div className="absolute inset-0 bg-white/95 backdrop-blur-2xl" />
          
          {/* Accent color top bar */}
          <div
            className="absolute top-0 left-0 right-0 h-1"
            style={{ background: `linear-gradient(90deg, ${team.color}, ${team.color}60, transparent)` }}
          />
          
          {/* Content */}
          <div className="relative h-full overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
            {/* Header */}
            <div className="relative p-5 pb-3">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-lg bg-[oklch(0.95_0.003_260)] hover:bg-[oklch(0.92_0.005_260)] transition-colors border border-[oklch(0.90_0.005_260)]"
              >
                <X className="w-4 h-4 text-[oklch(0.45_0.02_260)]" />
              </button>

              {/* Rank badge - 去掉编号 */}
              <motion.div
                initial={{ scale: 2.5, rotate: -20, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ delay: 0.15, type: 'spring', damping: 10, stiffness: 200 }}
                className="inline-flex items-center gap-3 mb-4"
              >
                <div
                  className="relative px-3 py-1.5 rounded-md"
                  style={{
                    background: `linear-gradient(135deg, ${team.color}, ${team.color}DD)`,
                    boxShadow: `0 4px 16px ${team.color}25`,
                  }}
                >
                  <span className="text-white font-black text-sm tracking-wider" style={{ fontFamily: "'Noto Sans SC', sans-serif" }}>
                    {team.rankLabel}
                  </span>
                  {/* Stamp corner marks */}
                  <div className="absolute -top-0.5 -left-0.5 w-1.5 h-1.5 border-t border-l border-white/40" />
                  <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 border-t border-r border-white/40" />
                  <div className="absolute -bottom-0.5 -left-0.5 w-1.5 h-1.5 border-b border-l border-white/40" />
                  <div className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 border-b border-r border-white/40" />
                </div>
                {/* 点赞按钮 */}
                <button
                  onClick={() => handleLike(team.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                    liked[team.id]
                      ? 'bg-red-50 border-red-200 text-red-500'
                      : 'bg-[oklch(0.97_0.003_260)] border-[oklch(0.90_0.005_260)] text-[oklch(0.50_0.02_260)] hover:bg-red-50 hover:border-red-200 hover:text-red-400'
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  {liked[team.id] ? '已点赞' : '点赞'}
                </button>
              </motion.div>

              {/* Team name */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <h2
                  className="text-3xl font-black text-[oklch(0.18_0.02_260)] leading-tight"
                  style={{ fontFamily: "'Noto Serif SC', serif" }}
                >
                  {team.fullName}
                </h2>
                <div className="flex items-center gap-2 mt-1.5 text-[oklch(0.55_0.02_260)]">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="text-sm">{team.city}</span>
                </div>
              </motion.div>

              {/* Slogan */}
              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="mt-4 origin-left"
              >
                <div
                  className="relative px-4 py-2.5 rounded-lg"
                  style={{ 
                    background: `linear-gradient(90deg, ${team.color}10, ${team.color}05)`,
                    borderLeft: `3px solid ${team.color}`,
                  }}
                >
                  <p
                    className="text-base font-medium"
                    style={{
                      color: team.color,
                      fontFamily: "'Noto Serif SC', serif",
                    }}
                  >
                    「{team.slogan}」
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Stats Grid - 英文改中文 */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="px-5 pb-4"
            >
              <div className="grid grid-cols-4 gap-2">
                <StatCard label="场次" value={team.stats.played} icon={<Shield className="w-3.5 h-3.5" />} color={team.color} delay={0.3} />
                <StatCard label="胜" value={team.stats.won} icon={<Trophy className="w-3.5 h-3.5" />} color="#388E3C" delay={0.35} />
                <StatCard label="平" value={team.stats.drawn} icon={<Target className="w-3.5 h-3.5" />} color="#F57C00" delay={0.4} />
                <StatCard label="负" value={team.stats.lost} icon={<Zap className="w-3.5 h-3.5" />} color="#D32F2F" delay={0.45} />
              </div>

              {/* Extended stats - 英文改中文 */}
              <div className="mt-3 grid grid-cols-2 gap-2">
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="bg-[oklch(0.97_0.003_260)] rounded-lg p-3 border border-[oklch(0.92_0.005_260)]"
                >
                  <div className="flex justify-between items-baseline">
                    <span className="text-[10px] text-[oklch(0.55_0.02_260)] tracking-wider font-bold" style={{ fontFamily: "'Noto Sans SC', sans-serif" }}>进球/失球</span>
                    <span className="text-[oklch(0.25_0.02_260)] font-bold text-sm" style={{ fontFamily: "'DM Mono', monospace" }}>
                      {team.stats.goalsFor} / {team.stats.goalsAgainst}
                    </span>
                  </div>
                  <div className="mt-2.5 h-1.5 bg-[oklch(0.92_0.005_260)] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(team.stats.goalsFor / (team.stats.goalsFor + team.stats.goalsAgainst)) * 100}%` }}
                      transition={{ delay: 0.8, duration: 0.8, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{
                        background: `linear-gradient(90deg, ${team.color}, ${team.color}AA)`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[9px] text-[oklch(0.60_0.02_260)]">进球</span>
                    <span className="text-[9px] text-[oklch(0.60_0.02_260)]">失球</span>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.55 }}
                  className="bg-[oklch(0.97_0.003_260)] rounded-lg p-3 border border-[oklch(0.92_0.005_260)]"
                >
                  <div className="flex justify-between items-baseline">
                    <span className="text-[10px] text-[oklch(0.55_0.02_260)] tracking-wider font-bold" style={{ fontFamily: "'Noto Sans SC', sans-serif" }}>净胜球</span>
                    <span
                      className="font-bold text-sm"
                      style={{
                        fontFamily: "'DM Mono', monospace",
                        color: team.stats.goalDiff > 0 ? '#388E3C' : team.stats.goalDiff < 0 ? '#D32F2F' : '#F57C00',
                      }}
                    >
                      {team.stats.goalDiff > 0 ? '+' : ''}{team.stats.goalDiff}
                    </span>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-[10px] text-[oklch(0.55_0.02_260)] tracking-wider font-bold" style={{ fontFamily: "'Noto Sans SC', sans-serif" }}>积分</span>
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.9, type: 'spring' }}
                      className="text-[oklch(0.18_0.02_260)] font-black text-2xl"
                      style={{ fontFamily: "'DM Mono', monospace" }}
                    >
                      {team.stats.points}
                    </motion.span>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* 主场场馆 - 移到球员介绍之前 */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="px-5 pb-4"
            >
              <SectionTitle icon={<Star className="w-3 h-3" />} title="主场场馆" />
              {/* 场馆图片容器 - 右上角“点击进入全景”提示 */}
              <div className="relative group cursor-pointer">
                <Stadium3D team={team} />
                {/* 右上角全景提示 */}
                <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/50 backdrop-blur-sm text-white/90 text-xs font-bold transition-all group-hover:bg-black/70">
                  <Maximize2 className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
                  <span>点击进入全景</span>
                </div>
              </div>
              {/* 场馆导航按钮 */}
              <a
                href={`https://uri.amap.com/search?keyword=${encodeURIComponent(team.stadium)}&city=${encodeURIComponent(team.city)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: `linear-gradient(135deg, ${team.color}, ${team.color}DD)` }}
              >
                <Navigation className="w-4 h-4" />
                导航到 {team.stadium}
              </a>
            </motion.div>

            {/* Badge description + 队徽图片 */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="px-5 pb-4"
            >
              <SectionTitle icon={<Shield className="w-3 h-3" />} title="队徽解读" />
              <div className="flex items-start gap-4 mt-2">
                <p className="text-sm text-[oklch(0.45_0.02_260)] leading-relaxed flex-1">
                  {team.badgeDesc}
                </p>
                <div className="w-16 h-16 rounded-xl shrink-0 overflow-hidden bg-[oklch(0.95_0.003_260)] shadow-sm border border-[oklch(0.92_0.005_260)]">
                  <img
                    src={assetPath(`assets/badges/${team.id}.jpg`)}
                    alt={`${team.name}队徽`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.innerHTML = `<span style="font-family:'Noto Serif SC',serif;font-size:24px;color:white;display:flex;align-items:center;justify-content:center;width:100%;height:100%;background:linear-gradient(135deg,${team.color},${team.color}CC)">${team.name.slice(0, 1)}</span>`;
                    }}
                  />
                </div>
              </div>
            </motion.div>

            {/* 球员介绍 */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.55 }}
              className="px-5 pb-4"
            >
              <SectionTitle icon={<Users className="w-3 h-3" />} title="核心球员" />
              <PlayerShowcase teamId={team.id} color={team.color} />
            </motion.div>

            {/* 湘菜推荐 */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.65 }}
              className="px-5 pb-4"
            >
              <SectionTitle icon={<Utensils className="w-3 h-3" />} title="湘菜推荐" />
              <div className="space-y-2 mt-3">
                {(XIANGCAI_MAP[team.name] ?? [{ name: '湘菜体验', desc: '当地特色美食推荐' }]).map((dish, i) => (
                  <motion.div
                    key={i}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.7 + i * 0.08 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-[oklch(0.97_0.003_260)] border border-[oklch(0.92_0.005_260)] hover:shadow-sm transition-all"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${team.color}15` }}
                    >
                      <Utensils className="w-4 h-4" style={{ color: team.color }} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-[oklch(0.25_0.02_260)]">{dish.name}</div>
                      <div className="text-xs text-[oklch(0.55_0.02_260)] mt-0.5">{dish.desc}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Highlights */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="px-5 pb-10"
            >
              <SectionTitle icon={<Trophy className="w-3 h-3" />} title="赛季亮点" />
              <div className="space-y-2 mt-3">
                {team.highlights.map((highlight, i) => (
                  <motion.div
                    key={i}
                    initial={{ x: 30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.75 + i * 0.08 }}
                    className="flex items-start gap-3 group"
                  >
                    <div className="mt-1 relative">
                      <div
                        className="w-2 h-2 rounded-full shrink-0 group-hover:scale-150 transition-transform"
                        style={{ backgroundColor: team.color }}
                      />
                      {i < team.highlights.length - 1 && (
                        <div className="absolute top-2 left-[3px] w-[2px] h-5 bg-[oklch(0.92_0.005_260)]" />
                      )}
                    </div>
                    <span className="text-sm text-[oklch(0.40_0.02_260)] leading-relaxed">{highlight}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Left edge decorative border */}
          <div
            className="absolute top-0 left-0 bottom-0 w-[2px]"
            style={{
              background: `linear-gradient(180deg, ${team.color}, ${team.color}40, transparent)`,
            }}
          />
          
          {/* Left shadow for depth */}
          <div className="absolute top-0 left-0 bottom-0 w-4 bg-gradient-to-r from-black/5 to-transparent pointer-events-none" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* 球员展示组件 */
function PlayerShowcase({ teamId, color }: { teamId: string; color: string }) {
  const profile = getTeamDashboardProfile(teamId);
  if (!profile || !profile.players || profile.players.length === 0) {
    return <p className="text-sm text-[oklch(0.55_0.02_260)] mt-2">球员信息更新中...</p>;
  }

  return (
    <div className="space-y-2 mt-3">
      {profile.players.map((player, i) => (
        <motion.div
          key={player.id}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5 + i * 0.1 }}
          className="p-3 rounded-lg bg-[oklch(0.97_0.003_260)] border border-[oklch(0.92_0.005_260)] hover:shadow-sm transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-black text-sm"
                style={{ background: `linear-gradient(135deg, ${color}, ${color}CC)` }}
              >
                {player.jerseyNumber}
              </div>
              <div>
                <div className="text-sm font-bold text-[oklch(0.20_0.02_260)]">{player.name}</div>
                <div className="text-xs text-[oklch(0.55_0.02_260)]">{player.position}</div>
              </div>
            </div>
            {player.goals > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold" style={{ background: `${color}15`, color }}>
                <Target className="w-3 h-3" />
                {player.goals}球
              </div>
            )}
          </div>
          <p className="text-xs text-[oklch(0.50_0.02_260)] mt-2 leading-relaxed">{player.contribution}</p>
        </motion.div>
      ))}
      {profile.dataStatus && (
        <p className="text-[10px] text-[oklch(0.60_0.02_260)] text-center mt-2">{profile.dataStatus}</p>
      )}
    </div>
  );
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <div className="text-[#D32F2F]">{icon}</div>
      <h3
        className="text-xs font-bold text-[oklch(0.50_0.02_260)] tracking-wider"
        style={{ fontFamily: "'Noto Sans SC', sans-serif" }}
      >
        {title}
      </h3>
      <div className="flex-1 h-px bg-[oklch(0.92_0.005_260)]" />
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
  delay,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ y: 15, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay }}
      className="bg-[oklch(0.97_0.003_260)] rounded-lg p-2.5 border border-[oklch(0.92_0.005_260)] text-center hover:shadow-sm transition-all"
    >
      <div className="flex items-center justify-center gap-1 mb-1.5" style={{ color }}>
        {icon}
      </div>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: delay + 0.2, type: 'spring', damping: 12 }}
        className="text-xl font-black text-[oklch(0.20_0.02_260)]"
        style={{ fontFamily: "'DM Mono', monospace" }}
      >
        {value}
      </motion.div>
      <div className="text-[9px] text-[oklch(0.55_0.02_260)] mt-1 tracking-wider">{label}</div>
    </motion.div>
  );
}
