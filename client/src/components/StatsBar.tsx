/**
 * StatsBar - 顶部赛事数据统计栏
 * Design: 明亮版 - 白色文字在红色 header 上
 *
 * 「赛程」项交互重做：
 * - 由 hover 弹层（被父级 overflow 裁切、移动端无效）改为可点击按钮
 * - 点击弹出居中 Dialog（赛程缩略图）：
 *   1) 顶部赛季 6 阶段时间线（5月开幕 → 10月收官）
 *   2) 下方最近比赛卡片列表（LIVE / UPCOMING / FINISHED 状态徽标 + 比分/开赛时间 + 球场）
 * - 支持键盘 ESC 关闭、点击遮罩关闭、移动端可滚动
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { leagueStats } from '@/data/teams';
import { liveReports, type LiveReport } from '@/data/feature-data';
import { Flame, Calendar, MapPin, Timer, Target, ChevronRight, Clock, Trophy, ArrowRight } from 'lucide-react';
import { routePath } from '@/lib/sitePaths';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

// 6 阶段赛季时间线
const scheduleTimeline = [
  { month: '5月', label: '开幕', desc: '揭幕战 · 常规赛开启', active: true },
  { month: '6月', label: '常规赛', desc: '小组循环阶段', active: true },
  { month: '7月', label: '常规赛', desc: '积分排名白热化', active: true },
  { month: '8月', label: '淘汰赛', desc: '八强 · 四强 · 半决赛', active: true },
  { month: '9月', label: '决赛', desc: '总决赛 · 冠军诞生', active: true },
  { month: '10月', label: '收官', desc: '颁奖典礼 · 赛季总结', active: false },
];

const stats = [
  { label: '总比赛', value: String(leagueStats.totalMatches), suffix: '场', icon: <Flame className="w-3 h-3" />, isSchedule: false },
  { label: '总进球', value: String(leagueStats.totalGoals), suffix: '球', icon: <Target className="w-3 h-3" />, isSchedule: false },
  { label: '参赛城市', value: String(leagueStats.cities), suffix: '城', icon: <MapPin className="w-3 h-3" />, isSchedule: false },
  { label: '赛程', value: leagueStats.duration, suffix: '', icon: <Timer className="w-3 h-3" />, isSchedule: true },
  {
    label: '今日日期',
    value: (() => {
      const d = new Date();
      return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
    })(),
    suffix: '',
    icon: <Calendar className="w-3 h-3" />,
    isSchedule: false,
  },
];

// 状态徽标
function StatusBadge({ type, minute }: { type: LiveReport['type']; minute?: string }) {
  if (type === 'live') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-[#D32F2F] border border-red-100">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-[#D32F2F] opacity-70 animate-ping" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#D32F2F]" />
        </span>
        LIVE {minute ?? ''}
      </span>
    );
  }
  if (type === 'upcoming') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100">
        <Clock className="w-2.5 h-2.5" />
        即将开赛
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[oklch(0.95_0.005_260)] text-[oklch(0.45_0.02_260)] border border-[oklch(0.90_0.005_260)]">
      <Trophy className="w-2.5 h-2.5" />
      已结束
    </span>
  );
}

export default function StatsBar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-5 overflow-x-auto px-1 py-0.5">
        {stats.map((stat, index) => {
          const Inner = (
            <>
              <div className="w-6 h-6 rounded-sm flex items-center justify-center bg-white/10 text-white/70 group-hover:bg-white/20 transition-colors">
                {stat.icon}
              </div>
              <div className="text-left">
                <div className="flex items-baseline gap-0.5">
                  <span className="text-white font-bold text-sm" style={{ fontFamily: "'DM Mono', monospace" }}>
                    {stat.value}
                  </span>
                  {stat.suffix && <span className="text-[10px] text-white font-medium">{stat.suffix}</span>}
                  {stat.isSchedule && <ChevronRight className="w-3 h-3 text-white/60 ml-0.5" />}
                </div>
                <span className="text-[10px] text-white tracking-wider font-semibold">{stat.label}</span>
              </div>
            </>
          );

          return (
            <motion.div
              key={stat.label}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 + index * 0.08 }}
              className="flex items-center gap-2 shrink-0"
            >
              {stat.isSchedule ? (
                <button
                  type="button"
                  onClick={() => setOpen(true)}
                  title="点击查看赛程缩略图"
                  aria-label="查看赛程缩略图"
                  className="group flex items-center gap-2 rounded-md px-1.5 py-0.5 transition-all hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 cursor-pointer"
                >
                  {Inner}
                </button>
              ) : (
                <div className="flex items-center gap-2">{Inner}</div>
              )}

              {index < stats.length - 1 && <div className="w-px h-5 bg-white/15 ml-1" />}
            </motion.div>
          );
        })}
      </div>

      <ScheduleDialog open={open} onOpenChange={setOpen} />
    </>
  );
}


type ScheduleDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ScheduleDialog({ open, onOpenChange }: ScheduleDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          /*
           * 修复：Tailwind v4 下 shadcn DialogContent 默认的
           *   `translate-x-[-50%] translate-y-[-50%]` 会被
           *   `data-[state]:zoom-*` 动画末帧的 `transform: none` 覆盖，
           *   导致弹窗实际位于视口右下角之外看不见。
           * 对策：不依赖 Tailwind translate 工具类，改用 inline style 强制
           *       transform: translate(-50%, -50%)，同时在 className 里以
           *       arbitrary 变体 [transform:translate(-50%,-50%)] 保留原定位。
           */
          style={{ transform: 'translate(-50%, -50%)' }}
          className="!translate-x-0 !translate-y-0 [transform:translate(-50%,-50%)] max-w-2xl w-[calc(100vw-2rem)] p-0 overflow-hidden bg-white border-[oklch(0.92_0.005_260)] sm:rounded-2xl"
        >
          {/* 顶部红色装饰条 */}
          <div className="relative h-16 px-6 flex items-end pb-3"
            style={{
              background:
                'linear-gradient(135deg, #C62828 0%, #D32F2F 35%, #E53935 70%, #B71C1C 100%)',
            }}
          >
            <div className="absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6'/%3E%3C/svg%3E\")",
              }}
            />
            <DialogHeader className="relative">
              <DialogTitle
                className="text-white text-lg font-black flex items-center gap-2"
                style={{ fontFamily: "'Noto Serif SC', serif" }}
              >
                <Timer className="w-5 h-5" />
                赛程缩略图
                <span className="ml-2 text-[10px] font-medium text-white/70 tracking-[0.18em]">
                  2026 赛季 · {leagueStats.duration}
                </span>
              </DialogTitle>
              <DialogDescription className="sr-only">2026 湘超联赛赛季阶段与最近比赛速览</DialogDescription>
            </DialogHeader>
          </div>

          {/* 内容区可滚动 */}
          <div className="max-h-[min(72dvh,640px)] overflow-y-auto">
            {/* 赛季时间线 */}
            <section className="px-6 pt-5">
              <div className="flex items-center justify-between mb-3">
                <h3
                  className="text-xs font-black tracking-wider text-[oklch(0.20_0.02_260)]"
                  style={{ fontFamily: "'Noto Sans SC', sans-serif" }}
                >
                  赛季阶段
                </h3>
                <span className="text-[10px] text-[oklch(0.55_0.02_260)]">5月 → 10月</span>
              </div>

              {/* 横向时间线（桌面） */}
              <div className="hidden sm:block">
                <div className="relative pt-2 pb-1">
                  {/* 背景线 + 进度线 */}
                  <div className="absolute left-2 right-2 top-[18px] h-[3px] rounded-full bg-[oklch(0.93_0.005_260)]" />
                  <div
                    className="absolute left-2 top-[18px] h-[3px] rounded-full"
                    style={{
                      width: `calc((100% - 1rem) * ${
                        scheduleTimeline.filter((s) => s.active).length /
                        scheduleTimeline.length
                      })`,
                      background: 'linear-gradient(90deg,#FF8A65,#D32F2F)',
                    }}
                  />
                  <div className="relative grid grid-cols-6 gap-1">
                    {scheduleTimeline.map((item) => (
                      <div key={item.month} className="flex flex-col items-center text-center">
                        <div
                          className={`relative z-10 w-[14px] h-[14px] rounded-full ring-4 ${
                            item.active
                              ? 'bg-[#D32F2F] ring-[#D32F2F]/15'
                              : 'bg-white border border-[oklch(0.85_0.005_260)] ring-[oklch(0.95_0.003_260)]'
                          }`}
                        />
                        <div
                          className="mt-2 text-[10px] font-bold text-[oklch(0.30_0.02_260)]"
                          style={{ fontFamily: "'DM Mono', monospace" }}
                        >
                          {item.month}
                        </div>
                        <div
                          className={`text-[10px] font-bold ${
                            item.active ? 'text-[#D32F2F]' : 'text-[oklch(0.55_0.02_260)]'
                          }`}
                        >
                          {item.label}
                        </div>
                        <div className="text-[9px] text-[oklch(0.55_0.02_260)] leading-snug mt-0.5">
                          {item.desc}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 竖向时间线（手机） */}
              <div className="sm:hidden">
                <div className="relative">
                  <div className="absolute left-[18px] top-2 bottom-2 w-[2px] bg-[oklch(0.93_0.005_260)]" />
                  <div className="space-y-2">
                    {scheduleTimeline.map((item) => (
                      <div key={item.month} className="flex items-start gap-3">
                        <div className="w-10 shrink-0 text-right text-[11px] font-bold text-[oklch(0.30_0.02_260)]"
                          style={{ fontFamily: "'DM Mono', monospace" }}
                        >
                          {item.month}
                        </div>
                        <div
                          className={`relative z-10 mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ring-2 ${
                            item.active
                              ? 'bg-[#D32F2F] ring-[#D32F2F]/20'
                              : 'bg-white border border-[oklch(0.80_0.005_260)] ring-[oklch(0.95_0.003_260)]'
                          }`}
                        />
                        <div className="min-w-0 flex-1">
                          <div className={`text-xs font-bold ${item.active ? 'text-[#D32F2F]' : 'text-[oklch(0.55_0.02_260)]'}`}>
                            {item.label}
                          </div>
                          <div className="text-[10px] text-[oklch(0.55_0.02_260)] mt-0.5">{item.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* 最近比赛 */}
            <section className="px-6 pt-5 pb-6">
              <div className="flex items-center justify-between mb-3">
                <h3
                  className="text-xs font-black tracking-wider text-[oklch(0.20_0.02_260)]"
                  style={{ fontFamily: "'Noto Sans SC', sans-serif" }}
                >
                  最近比赛
                </h3>
                <span className="text-[10px] text-[oklch(0.55_0.02_260)]">
                  共 {liveReports.length} 场预览
                </span>
              </div>

              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {liveReports.map((m) => (
                  <li
                    key={m.id}
                    className="rounded-xl border border-[oklch(0.92_0.005_260)] bg-white px-4 py-3 hover:border-[#D32F2F]/30 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-[10px] text-[oklch(0.55_0.02_260)] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {m.matchTime}
                          <span className="text-[oklch(0.85_0.005_260)]">·</span>
                          <span className="truncate">{m.stadium}</span>
                        </div>
                      </div>
                      <StatusBadge type={m.type} minute={m.minute} />
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="text-sm font-black text-[oklch(0.18_0.02_260)] truncate"
                          style={{ fontFamily: "'Noto Serif SC', serif" }}
                        >
                          {m.homeTeam}
                        </span>
                      </div>
                      {typeof m.homeScore === 'number' && typeof m.awayScore === 'number' ? (
                        <span
                          className="shrink-0 text-base font-black tabular-nums px-2.5 py-0.5 rounded-md bg-[oklch(0.96_0.005_260)] text-[#D32F2F]"
                          style={{ fontFamily: "'DM Mono', monospace" }}
                        >
                          {m.homeScore} <span className="text-[oklch(0.65_0.01_260)] font-normal">:</span> {m.awayScore}
                        </span>
                      ) : (
                        <span
                          className="shrink-0 text-[10px] font-bold tracking-wider text-[oklch(0.55_0.02_260)] px-2 py-0.5 rounded-md bg-[oklch(0.96_0.005_260)]"
                          style={{ fontFamily: "'DM Mono', monospace" }}
                        >
                          VS
                        </span>
                      )}
                      <div className="flex items-center gap-2 min-w-0 justify-end">
                        <span
                          className="text-sm font-black text-[oklch(0.18_0.02_260)] truncate text-right"
                          style={{ fontFamily: "'Noto Serif SC', serif" }}
                        >
                          {m.awayTeam}
                        </span>
                      </div>
                    </div>

                    <p className="mt-1.5 text-[11px] leading-snug text-[oklch(0.45_0.02_260)] line-clamp-2">
                      {m.summary}
                    </p>
                  </li>
                ))}
              </ul>

              {/* 跳转到完整模块 */}
              <div className="mt-4 text-right">
                <Link
                  href={routePath('/interactive')}
                  onClick={() => onOpenChange(false)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#D32F2F] hover:text-[#B71C1C] transition-colors"
                >
                  查看完整赛程与战报
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </section>
          </div>
        </DialogContent>
      </Dialog>
  );
}
