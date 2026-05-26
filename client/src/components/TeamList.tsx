/**
 * TeamList - 左侧队伍排行列表
 * Design: 明亮版 - 白底 + 红金点缀
 * 改动: 增加队徽色块、点赞按钮、展示全部球队、英文改中文
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, ChevronRight, ThumbsUp, Crown } from 'lucide-react';
import { teams, type Team } from '@/data/teams';
import { featureTeams } from '@/data/feature-data';
import { assetPath } from '@/lib/sitePaths';

interface TeamListProps {
  selectedTeam: Team | null;
  onTeamSelect: (team: Team) => void;
}

// 合并所有球队：teams.ts 中有10支（有详细 stats），featureTeams 中有14支
// 将 featureTeams 中不在 teams 里的球队转换为 Team 格式补充进来
const allTeams: Team[] = (() => {
  const existingIds = new Set(teams.map((t) => t.id));
  const extraTeams: Team[] = featureTeams
    .filter((ft) => !existingIds.has(ft.id))
    .map((ft, idx) => ({
      id: ft.id,
      name: ft.city,
      city: ft.city + '市',
      fullName: ft.fullName,
      rank: teams.length + idx + 1,
      rankLabel: `第${teams.length + idx + 1}名`,
      stadium: ft.stadium,
      lat: ft.lat,
      lng: ft.lng,
      stats: { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDiff: 0, points: 0 },
      badgeDesc: ft.badgeDesc,
      color: ft.color,
      slogan: ft.slogan,
      stadiumImage: '',
      highlights: ft.seasonHighlights,
    }));
  return [...teams, ...extraTeams];
})();

export default function TeamList({ selectedTeam, onTeamSelect }: TeamListProps) {
  const [likes, setLikes] = useState<Record<string, number>>({});

  const handleLike = (e: React.MouseEvent, teamId: string) => {
    e.stopPropagation();
    setLikes((prev) => ({ ...prev, [teamId]: (prev[teamId] ?? 0) + 1 }));
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-sm flex items-center justify-center bg-[#D32F2F]/8">
            <Trophy className="w-3.5 h-3.5 text-[#D32F2F]" />
          </div>
          <h3
            className="text-sm font-black tracking-wider text-[oklch(0.25_0.02_260)]"
            style={{ fontFamily: "'Noto Sans SC', sans-serif" }}
          >
            队伍排行
          </h3>
        </div>
        <p className="text-[10px] text-[oklch(0.55_0.02_260)] mt-1.5 ml-[34px]" style={{ fontFamily: "'Noto Sans SC', sans-serif" }}>
          2026 湘超联赛 · 全部 {allTeams.length} 支球队
        </p>
        <div className="mt-3 h-px bg-gradient-to-r from-[#D32F2F]/15 to-transparent" />
      </div>

      {/* Team list */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-0.5" style={{ scrollbarWidth: 'thin' }}>
        {allTeams.map((team, index) => {
          const isSelected = selectedTeam?.id === team.id;
          return (
            <motion.div
              key={team.id}
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 + index * 0.04, type: 'spring', damping: 20 }}
              role="button"
              tabIndex={0}
              onClick={() => onTeamSelect(team)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onTeamSelect(team);
                }
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all duration-200 group text-left relative overflow-hidden ${
                isSelected
                  ? 'bg-[oklch(0.97_0.005_25)] shadow-sm'
                  : 'bg-transparent hover:bg-[oklch(0.97_0.003_260)]'
              }`}
            >
              {/* Selected indicator */}
              {isSelected && (
                <motion.div
                  layoutId="selectedIndicator"
                  className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r"
                  style={{ backgroundColor: team.color }}
                />
              )}

              {/* 队徽图片 */}
              <div className="w-8 h-8 rounded-lg shrink-0 relative overflow-hidden bg-[oklch(0.95_0.003_260)]">
                <img
                  src={assetPath(`assets/badges/${team.id}.jpg`)}
                  alt={`${team.name}队徽`}
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML = `<span style="font-family:'Noto Serif SC',serif;font-size:13px;color:white;display:flex;align-items:center;justify-content:center;width:100%;height:100%;background:linear-gradient(135deg,${team.color},${team.color}CC)">${team.name.slice(0, 1)}</span>`;
                  }}
                />
                {/* 王冠图标 */}
                {team.rank === 1 && (
                  <div
                    className="absolute -top-1.5 -right-1.5 z-10"
                  >
                    <Crown className="w-4.5 h-4.5 drop-shadow-sm" style={{ color: '#FFD700', filter: 'drop-shadow(0 1px 2px rgba(255,215,0,0.5))' }} />
                  </div>
                )}
                {team.rank === 2 && (
                  <div
                    className="absolute -top-1.5 -right-1.5 z-10"
                  >
                    <Crown className="w-4.5 h-4.5 drop-shadow-sm" style={{ color: '#C0C0C0', filter: 'drop-shadow(0 1px 2px rgba(192,192,192,0.5))' }} />
                  </div>
                )}
                {team.rank === 3 && (
                  <div
                    className="absolute -top-1.5 -right-1.5 z-10"
                  >
                    <Crown className="w-4.5 h-4.5 drop-shadow-sm" style={{ color: '#CD7F32', filter: 'drop-shadow(0 1px 2px rgba(205,127,50,0.5))' }} />
                  </div>
                )}
              </div>

              {/* Team info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-bold truncate transition-colors ${
                      isSelected ? 'text-[oklch(0.20_0.02_260)]' : 'text-[oklch(0.30_0.02_260)] group-hover:text-[oklch(0.20_0.02_260)]'
                    }`}
                    style={{ fontFamily: "'Noto Sans SC', sans-serif" }}
                  >
                    {team.name}
                  </span>
                  {team.rank <= 3 && (
                    <span
                      className="text-[8px] px-1.5 py-0.5 rounded-sm font-bold tracking-wider"
                      style={{
                        backgroundColor: `${team.color}12`,
                        color: team.color,
                        border: `1px solid ${team.color}18`,
                      }}
                    >
                      {team.rankLabel}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5 ml-0">
                  <span
                    className="text-[10px] text-[oklch(0.50_0.02_260)] font-medium"
                    style={{ fontFamily: "'Noto Sans SC', sans-serif" }}
                  >
                    {team.stats.points > 0 ? `${team.stats.points}分` : '暂无数据'}
                  </span>
                  {team.stats.points > 0 && (
                    <>
                      <span className="text-[8px] text-[oklch(0.80_0.005_260)]">|</span>
                      <span
                        className="text-[10px] text-[oklch(0.55_0.02_260)]"
                        style={{ fontFamily: "'Noto Sans SC', sans-serif" }}
                      >
                        {team.stats.won}胜 {team.stats.drawn}平 {team.stats.lost}负
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* 点赞按钮 */}
              <button
                onClick={(e) => handleLike(e, team.id)}
                className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold transition-all bg-[oklch(0.97_0.003_260)] border border-[oklch(0.90_0.005_260)] text-[oklch(0.50_0.02_260)] hover:bg-red-50 hover:border-red-200 hover:text-red-400"
              >
                <ThumbsUp className="w-3 h-3" />
                {(likes[team.id] ?? 0) > 0 && <span>{likes[team.id]}</span>}
              </button>

              {/* Arrow */}
              <ChevronRight
                className={`w-3.5 h-3.5 shrink-0 transition-all duration-200 ${
                  isSelected
                    ? 'text-[oklch(0.50_0.02_260)] opacity-100'
                    : 'text-[oklch(0.75_0.005_260)] opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0'
                }`}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-[oklch(0.93_0.005_260)]">
        <p className="text-[9px] text-[oklch(0.65_0.01_260)] text-center" style={{ fontFamily: "'Noto Sans SC', sans-serif" }}>
          数据来源：2026 湘超联赛
        </p>
      </div>
    </div>
  );
}
