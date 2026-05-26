import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  BarChart3,
  Flag,
  Megaphone,
  MessageSquare,
  Radio,
  Send,
  Shield,
  Sparkles,
  Star,
  Trophy,
  Users,
  Vote,
} from 'lucide-react';
import LogoBadge from '@/components/LogoBadge';
import { assetPath, routePath } from '@/lib/sitePaths';
import {
  featureTeams,
  getTeamCultureProfile,
  getTeamDashboardProfile,
  initialFanMessages,
  leagueLeaders,
  liveReports,
  moduleStats,
  type FanMessage,
  type FeatureTeam,
  type TeamPlayerProfile,
} from '@/data/feature-data';

type ModuleView = 'dashboard' | 'interactive' | 'culture';
type DashboardTab = 'overview' | 'roster' | 'leaders';
type PlayerRatingEntry = { count: number; total: number; userScore?: number };

const VOTE_STORAGE_KEY = 'xiangchao_vote_extras_v1';
const VOTED_TEAM_STORAGE_KEY = 'xiangchao_voted_team_v1';
const MESSAGE_STORAGE_KEY = 'xiangchao_messages_v1';
const PLAYER_RATING_STORAGE_KEY = 'xiangchao_player_ratings_v1';
const CHEER_STORAGE_KEY = 'xiangchao_cheer_counts_v1';

const PORTAL_RED = '#8F1F1F';
const PORTAL_RED_SOFT = '#A62C2C';
const PORTAL_GOLD = '#B48A4C';
const PAPER_BG = '#FFFDF8';

const moduleViews: Array<{ id: ModuleView; label: string; desc: string; icon: typeof BarChart3 }> = [
  { id: 'dashboard', label: '数字看板', desc: '积分、阵容、教练与榜单', icon: BarChart3 },
  { id: 'interactive', label: '互动中心', desc: '评论、打分、投票与打气', icon: MessageSquare },
  { id: 'culture', label: '主场文化', desc: '城市故事、粉丝队与横幅墙', icon: Flag },
];

const dashboardTabs: Array<{ id: DashboardTab; label: string }> = [
  { id: 'overview', label: '球队总览' },
  { id: 'roster', label: '阵容档案' },
  { id: 'leaders', label: '联赛榜单' },
];

const cultureThemeMap: Partial<Record<FeatureTeam['id'], { image: string; label: string; note: string }>> = {
  zhuzhou: {
    image: assetPath('assets/zhuzhou_yandi_bg.jpg'),
    label: '炎帝火种专题背景',
    note: '以炎帝陵礼制轴线、火种意象与谷穗纹样强化株洲主场识别。',
  },
  yongzhou: {
    image: assetPath('assets/yongzhou_shundi_bg.jpg'),
    label: '舜德九嶷专题背景',
    note: '以九嶷山、舜帝陵与礼乐纹样构成永州主场的文化母题。',
  },
};

function loadJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function resolveInitialView(): ModuleView {
  if (typeof window === 'undefined') return 'dashboard';
  const view = new URLSearchParams(window.location.search).get('view');
  if (view === 'interactive') {
    window.location.href = routePath('/interactive');
    return 'dashboard';
  }
  return view === 'culture' || view === 'dashboard' ? view : 'dashboard';
}

export default function FeatureModules() {
  const [, setLocation] = useLocation();
  const [activeTeam, setActiveTeam] = useState<FeatureTeam>(featureTeams[0]);
  const [activeView, setActiveView] = useState<ModuleView>(resolveInitialView);
  const [dashboardTab, setDashboardTab] = useState<DashboardTab>('overview');
  const [voteExtras, setVoteExtras] = useState<Record<string, number>>({});
  const [votedTeamId, setVotedTeamId] = useState<string | null>(null);
  const [messages, setMessages] = useState<FanMessage[]>(initialFanMessages);
  const [nickname, setNickname] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [messageTeamId, setMessageTeamId] = useState(featureTeams[0].id);
  const [playerRatings, setPlayerRatings] = useState<Record<string, PlayerRatingEntry>>({});
  const [cheerCounts, setCheerCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    setVoteExtras(loadJson<Record<string, number>>(VOTE_STORAGE_KEY, {}));
    setVotedTeamId(loadJson<string | null>(VOTED_TEAM_STORAGE_KEY, null));
    setMessages(loadJson<FanMessage[]>(MESSAGE_STORAGE_KEY, initialFanMessages));
    setPlayerRatings(loadJson<Record<string, PlayerRatingEntry>>(PLAYER_RATING_STORAGE_KEY, {}));
    setCheerCounts(loadJson<Record<string, number>>(CHEER_STORAGE_KEY, {}));
  }, []);

  useEffect(() => {
    setMessageTeamId(activeTeam.id);
  }, [activeTeam.id]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const search = new URLSearchParams(window.location.search);
    search.set('view', activeView);
    const next = `${window.location.pathname}?${search.toString()}`;
    window.history.replaceState({}, '', next);
  }, [activeView]);

  const rankedTeams = useMemo(() => {
    return featureTeams
      .map((team) => ({
        ...team,
        totalVotes: team.voteBase + (voteExtras[team.id] ?? 0),
      }))
      .sort((a, b) => b.totalVotes - a.totalVotes);
  }, [voteExtras]);

  const activeDashboard = useMemo(() => getTeamDashboardProfile(activeTeam.id), [activeTeam.id]);
  const activeCulture = useMemo(() => getTeamCultureProfile(activeTeam.id), [activeTeam.id]);
  const activeTheme = cultureThemeMap[activeTeam.id];
  const activeRank = rankedTeams.findIndex((team) => team.id === activeTeam.id) + 1;
  const totalMessages = messages.length;
  const activeTeamVotes = rankedTeams.find((team) => team.id === activeTeam.id)?.totalVotes ?? activeTeam.voteBase;
  const totalCheers = Object.entries(cheerCounts)
    .filter(([key]) => key.startsWith(`${activeTeam.id}:`))
    .reduce((sum, [, value]) => sum + value, 0);

  const averagePlayerRating = useMemo(() => {
    const players = activeDashboard.players;
    if (!players.length) return 4.2;
    const total = players.reduce((sum, player) => {
      const entry = playerRatings[player.id];
      const baseVotes = 12;
      const baseTotal = player.ratingBase * baseVotes;
      const avg = (baseTotal + (entry?.total ?? 0)) / (baseVotes + (entry?.count ?? 0));
      return sum + avg;
    }, 0);
    return total / players.length;
  }, [activeDashboard.players, playerRatings]);

  const topRatedPlayer = useMemo(() => {
    return [...activeDashboard.players]
      .map((player) => ({ player, meta: buildPlayerRatingMeta(player, playerRatings[player.id]) }))
      .sort((a, b) => b.meta.average - a.meta.average)[0];
  }, [activeDashboard.players, playerRatings]);

  const summaryCards = useMemo(() => {
    if (activeView === 'dashboard') {
      return [
        {
          title: '当前排名',
          value: activeRank > 0 ? `联赛第 ${activeRank} 位` : '待更新',
          helper: `球队积分标签：${activeDashboard.pointsLabel}`,
        },
        {
          title: '主教练',
          value: activeDashboard.coach.name,
          helper: activeDashboard.coach.style,
        },
        {
          title: '阵容规模',
          value: activeDashboard.rosterSize,
          helper: `平均身高 ${activeDashboard.averageHeight} · 平均体重 ${activeDashboard.averageWeight}`,
        },
        {
          title: '得分焦点',
          value: activeDashboard.scoringLeader,
          helper: activeTeam.lastSeasonRecord,
        },
      ];
    }

    if (activeView === 'interactive') {
      return [
        {
          title: '球队热度',
          value: `${activeTeamVotes} 票`,
          helper: '',
        },
        {
          title: '球员评分',
          value: averagePlayerRating.toFixed(1),
          helper: '',
        },
        {
          title: '线上打气',
          value: `${totalCheers} 次`,
          helper: '',
        },
        {
          title: '最新评论',
          value: `${totalMessages} 条`,
          helper: '',
        },
      ];
    }

    return [
      {
        title: '文化主题',
        value: activeCulture.title,
        helper: '',
      },
      {
        title: '啦啦队',
        value: activeCulture.cheerSquad,
        helper: '',
      },
      {
        title: '粉丝队',
        value: activeCulture.supporterGroup,
        helper: '',
      },
      {
        title: '仪式内容',
        value: `${activeCulture.rituals.length} 项`,
        helper: '',
      },
    ];
  }, [activeCulture, activeDashboard, activeRank, activeTeam, activeTeamVotes, activeView, averagePlayerRating, totalCheers, totalMessages]);

  function handleVote(teamId: string) {
    if (votedTeamId) return;
    const next = { ...voteExtras, [teamId]: (voteExtras[teamId] ?? 0) + 1 };
    setVoteExtras(next);
    setVotedTeamId(teamId);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(VOTE_STORAGE_KEY, JSON.stringify(next));
      window.localStorage.setItem(VOTED_TEAM_STORAGE_KEY, JSON.stringify(teamId));
    }
  }

  function handleSubmitMessage() {
    if (!nickname.trim() || !messageContent.trim()) return;
    const team = featureTeams.find((item) => item.id === messageTeamId) ?? activeTeam;
    const nextMessage: FanMessage = {
      id: `${Date.now()}`,
      teamId: team.id,
      teamName: team.teamName,
      nickname: nickname.trim(),
      content: messageContent.trim(),
      createdAt: '刚刚',
    };
    const next = [nextMessage, ...messages];
    setMessages(next);
    setNickname('');
    setMessageContent('');
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(MESSAGE_STORAGE_KEY, JSON.stringify(next));
    }
  }

  function handleRatePlayer(player: TeamPlayerProfile, score: number) {
    const current = playerRatings[player.id] ?? { count: 0, total: 0 };
    const nextEntry = current.userScore
      ? { ...current, total: current.total - current.userScore + score, userScore: score }
      : { count: current.count + 1, total: current.total + score, userScore: score };

    const next = { ...playerRatings, [player.id]: nextEntry };
    setPlayerRatings(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(PLAYER_RATING_STORAGE_KEY, JSON.stringify(next));
    }
  }

  function handleCheer(template: string) {
    const key = `${activeTeam.id}:${template}`;
    const next = { ...cheerCounts, [key]: (cheerCounts[key] ?? 0) + 1 };
    setCheerCounts(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(CHEER_STORAGE_KEY, JSON.stringify(next));
    }
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f6efe8_0%,#fffaf5_18%,#fffdfb_44%,#f8f2eb_100%)] text-[oklch(0.22_0.02_260)] touch-manipulation">
      <div className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6 lg:px-8">
        <header className="overflow-hidden rounded-[20px] sm:rounded-[36px] border border-[#d8c9bf] bg-[#fffdf8] shadow-[0_22px_60px_rgba(57,42,32,0.08)]">
          <div className="relative isolate">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(143,31,31,0.18),transparent_34%),linear-gradient(180deg,rgba(255,251,245,0.96),rgba(255,251,245,0.96))]" />
            {activeTheme ? (
              <div
                className="absolute inset-y-0 right-0 hidden w-[48%] bg-cover bg-center opacity-[0.24] lg:block"
                style={{ backgroundImage: `url(${activeTheme.image})` }}
              />
            ) : (
              <div className="absolute inset-y-0 right-0 hidden w-[48%] bg-[linear-gradient(135deg,rgba(143,31,31,0.14),rgba(180,138,76,0.10),rgba(255,255,255,0))] lg:block" />
            )}
            <div className="relative grid gap-4 sm:gap-8 px-4 py-4 sm:px-7 sm:py-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
              <div className="max-w-3xl">
                <Link href={routePath('/')}>
                  <a className="inline-flex items-center gap-2 rounded-full border border-[#ddcec3] bg-white/84 px-4 py-2 text-sm text-[oklch(0.42_0.02_260)] transition hover:border-[#8F1F1F]/20 hover:text-[#8F1F1F]">
                    <ArrowLeft className="h-4 w-4" />
                    返回首页
                  </a>
                </Link>

                <div className="mt-5 inline-flex rounded-[22px] border border-[#e2d4c9] bg-white/82 px-4 py-3 shadow-sm">
                  <LogoBadge subtitle="湘超球队中心" />
                </div>

                <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#8F1F1F]/10 bg-[#8F1F1F]/[0.05] px-4 py-2 text-xs uppercase tracking-[0.24em] text-[#8F1F1F]">
                  <Sparkles className="h-3.5 w-3.5" />
                  湘超球队一览
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-[oklch(0.45_0.02_260)]">
                  <span className="rounded-full border border-[#ead8ca] bg-white/82 px-3 py-1.5">当前球队：<strong className="text-[#8F1F1F]">{activeTeam.fullName}</strong></span>
                  <span className="rounded-full border border-[#ead8ca] bg-white/82 px-3 py-1.5">当前专题：<strong className="text-[#8F1F1F]">{moduleViews.find((view) => view.id === activeView)?.label}</strong></span>
                  <span className="rounded-full border border-[#ead8ca] bg-white/82 px-3 py-1.5">主场：{activeTeam.stadium}</span>
                </div>

                <h1 className="mt-3 sm:mt-5 text-xl sm:text-3xl font-black leading-tight text-[oklch(0.18_0.02_260)] lg:text-5xl" style={{ fontFamily: "'Noto Serif SC', serif" }}>
                  {activeTeam.fullName}
                  <span className="block text-[#8F1F1F]">数据、互动与主场文化</span>
                </h1>
                <div className="mt-3 sm:mt-5 rounded-[16px] sm:rounded-[28px] border border-[#e0d2c8] bg-white/78 p-3 sm:p-4 text-sm leading-7 text-[oklch(0.43_0.02_260)]">
                  <div className="text-xs uppercase tracking-[0.18em] text-[#8F1F1F]">球队速览</div>
                  <p className="mt-3">{activeTeam.slogan}</p>
                </div>
              </div>

              <div className="grid gap-3 sm:gap-4 lg:pl-8">
                <div className="rounded-[20px] sm:rounded-[30px] border border-[#dbcdbf] bg-[linear-gradient(180deg,rgba(143,31,31,0.96),rgba(123,24,24,0.96))] p-4 sm:p-6 text-white shadow-[0_18px_40px_rgba(120,32,28,0.18)]">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs uppercase tracking-[0.2em] text-white/68">球队概览</div>
                      <h2 className="mt-3 text-3xl font-black" style={{ fontFamily: "'Noto Serif SC', serif" }}>{activeTeam.teamName}</h2>
                    </div>
                    <div className="rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white/80">TOP {activeRank > 0 ? activeRank : '--'}</div>
                  </div>
                  <div className="mt-4 sm:mt-6 grid grid-cols-2 gap-2 sm:gap-4">
                    <HeaderMetric label="球队积分" value={activeDashboard.pointsLabel} />
                    <HeaderMetric label="主教练" value={activeDashboard.coach.name} />
                    <HeaderMetric label="主场热度" value={`${activeTeamVotes} 票`} />
                    <HeaderMetric label="文化主轴" value={activeCulture.title} />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {moduleStats.map((item) => (
                    <div key={item.label} className="rounded-[24px] border border-[#e1d6cb] bg-white/92 p-4">
                      <div className="text-[11px] uppercase tracking-[0.2em] text-[oklch(0.55_0.02_260)]">{item.label}</div>
                      <div className="mt-3 text-2xl font-black text-[#8F1F1F]" style={{ fontFamily: "'DM Mono', monospace" }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-[#e6d8cb] bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(250,246,241,0.96))] px-3 py-3 sm:px-7 sm:py-4">
            <div className="grid gap-3 sm:gap-4 lg:grid-cols-[1.25fr_0.75fr] lg:items-start">
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-[oklch(0.55_0.02_260)]">球队切换</div>
                <div className="mt-2 sm:mt-3 flex flex-wrap gap-1.5 sm:gap-2">
                  {featureTeams.map((team) => {
                    const active = activeTeam.id === team.id;
                    return (
                      <button
                        key={team.id}
                        onClick={() => setActiveTeam(team)}
                        className={`rounded-full border px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold transition ${
                          active
                            ? 'border-transparent text-white shadow-[0_10px_24px_rgba(143,31,31,0.18)]'
                            : 'border-[#e2d6ca] bg-white text-[oklch(0.38_0.02_260)] hover:border-[#8F1F1F]/20 hover:text-[#8F1F1F]'
                        }`}
                        style={active ? { background: `linear-gradient(135deg, ${PORTAL_RED}, ${team.color})` } : undefined}
                      >
                        {team.teamName}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-[oklch(0.55_0.02_260)]">专题切换</div>
                <div className="mt-3 grid gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                  {moduleViews.map((view) => {
                    const Icon = view.icon;
                    const isActive = activeView === view.id;
                    return (
                      <button
                        key={view.id}
                        onClick={() => {
                          if (view.id === 'interactive') {
                            setLocation(routePath('/interactive'));
                          } else {
                            setActiveView(view.id);
                          }
                        }}
                        className={`rounded-[22px] border p-3 text-left transition ${
                          isActive
                            ? 'border-transparent bg-[linear-gradient(135deg,#8F1F1F,#B83131)] text-white shadow-[0_12px_30px_rgba(143,31,31,0.18)]'
                            : 'border-[#e2d6ca] bg-white text-[oklch(0.34_0.02_260)] hover:border-[#8F1F1F]/18'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`rounded-2xl p-2.5 ${isActive ? 'bg-white/10' : 'bg-[#8F1F1F]/8 text-[#8F1F1F]'}`}>
                            <Icon className="h-4.5 w-4.5" />
                          </div>
                          <div>
                            <div className={`text-xs uppercase tracking-[0.18em] ${isActive ? 'text-white/72' : 'text-[oklch(0.55_0.02_260)]'}`}>专题视图</div>
                            <div className="mt-1 font-black" style={{ fontFamily: "'Noto Serif SC', serif" }}>{view.label}</div>
                            <div className={`mt-1 text-xs leading-5 ${isActive ? 'text-white/78' : 'text-[oklch(0.48_0.02_260)]'}`}>{view.desc}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="mt-4 sm:mt-6 space-y-4 sm:space-y-6 pb-8 sm:pb-10">
          <section className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((item) => (
              <SummaryCard key={item.title} title={item.title} value={item.value} helper={item.helper} />
            ))}
          </section>

          {activeView === 'dashboard' ? (
            <section className="space-y-6">
              <div className="grid gap-4 sm:gap-6 xl:grid-cols-[1.12fr_0.88fr]">
                <PortalPanel>
                  <SectionHeader
                    eyebrow="球队总述"
                    title={`${activeTeam.fullName} 核心信息`}
                    description=""
                    icon={Shield}
                  />
                  <div className="mt-4 sm:mt-6 grid gap-3 sm:gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="rounded-[28px] border border-[#eaded3] bg-[linear-gradient(180deg,#fffaf6,#ffffff)] p-5">
                      <div className="text-xs uppercase tracking-[0.18em] text-[#8F1F1F]">球队气质</div>
                      <h3 className="mt-3 text-3xl font-black leading-tight" style={{ color: PORTAL_RED, fontFamily: "'Noto Serif SC', serif" }}>{activeTeam.slogan}</h3>
                      <p className="mt-4 text-sm leading-8 text-[oklch(0.42_0.02_260)]">{activeTeam.story}</p>
                    </div>
                    <div className="space-y-3">
                      <InfoCard title="主场场馆" content={activeTeam.stadium} accent={PORTAL_RED} />
                      <InfoCard title="上赛季结果" content={activeTeam.lastSeasonRecord} accent={PORTAL_RED} />
                      <InfoCard title="数据说明" content={activeDashboard.dataStatus} accent={PORTAL_RED} />
                    </div>
                  </div>
                </PortalPanel>

                <PortalPanel>
                  <SectionHeader
                    eyebrow="赛季线索"
                    title="近期看点"
                    description=""
                    icon={Trophy}
                  />
                  <div className="mt-6 space-y-4">
                    {activeTeam.seasonHighlights.map((item, index) => (
                      <div key={item} className="flex items-start gap-4 rounded-[24px] border border-[#ebe0d6] bg-[oklch(0.99_0.002_260)] px-4 py-4">
                        <div className="mt-1.5 h-2.5 w-2.5 rounded-full" style={{ backgroundColor: index === 0 ? PORTAL_RED : index === 1 ? PORTAL_GOLD : PORTAL_RED_SOFT }} />
                        <p className="text-sm leading-7 text-[oklch(0.42_0.02_260)]">{item}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 rounded-[24px] border border-[#eadbcf] bg-[linear-gradient(180deg,#fff7f1,#fffdf9)] p-5">
                    <div className="text-xs uppercase tracking-[0.18em] text-[oklch(0.55_0.02_260)]">教练观察</div>
                    <h3 className="mt-2 text-2xl font-black" style={{ fontFamily: "'Noto Serif SC', serif" }}>{activeDashboard.coach.name}</h3>
                    <p className="mt-3 text-sm leading-7 text-[oklch(0.42_0.02_260)]">{activeDashboard.coach.title}，{activeDashboard.coach.style}。</p>
                    <p className="mt-3 text-sm leading-7 text-[oklch(0.42_0.02_260)]">{activeDashboard.coach.note}</p>
                  </div>
                </PortalPanel>
              </div>

              <PortalPanel>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <SectionHeader
                    eyebrow="看板正文"
                    title="球队数据总览"
                    description=""
                    icon={BarChart3}
                  />
                  <div className="flex flex-wrap gap-2">
                    {dashboardTabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setDashboardTab(tab.id)}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                          dashboardTab === tab.id
                            ? 'bg-[#8F1F1F] text-white shadow-[0_10px_24px_rgba(143,31,31,0.16)]'
                            : 'bg-[oklch(0.985_0.002_260)] text-[oklch(0.46_0.02_260)] hover:bg-[#f7efe8]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {dashboardTab === 'overview' ? (
                  <div className="mt-6 grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
                    <div className="rounded-[28px] border border-[#e8ddd3] bg-[linear-gradient(180deg,#fff9f5,#ffffff)] p-5">
                      <div className="text-xs uppercase tracking-[0.18em] text-[oklch(0.55_0.02_260)]">球队档案</div>
                      <h3 className="mt-3 text-2xl font-black" style={{ fontFamily: "'Noto Serif SC', serif" }}>{activeTeam.fullName}</h3>
                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <MiniStat label="阵容规模" value={activeDashboard.rosterSize} />
                        <MiniStat label="平均身高" value={activeDashboard.averageHeight} />
                        <MiniStat label="平均体重" value={activeDashboard.averageWeight} />
                        <MiniStat label="重点得分" value={activeDashboard.scoringLeader} />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <InfoCard title="球队积分" content={activeDashboard.pointsLabel} accent={PORTAL_RED} />
                      <InfoCard title="主教练风格" content={activeDashboard.coach.style} accent={PORTAL_RED} />
                      <InfoCard title="文化主线" content={activeCulture.title} accent={PORTAL_RED} />
                      <InfoCard title="主场标语" content={activeTeam.slogan} accent={PORTAL_RED} />
                    </div>
                  </div>
                ) : null}

                {dashboardTab === 'roster' ? (
                  <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                    <div className="space-y-4">
                      <div className="rounded-[28px] border border-[#e8ddd3] bg-[linear-gradient(180deg,#fff7f1,#ffffff)] p-5">
                        <div className="text-xs uppercase tracking-[0.18em] text-[#8F1F1F]">教练信息</div>
                        <h3 className="mt-3 text-2xl font-black" style={{ fontFamily: "'Noto Serif SC', serif" }}>{activeDashboard.coach.name}</h3>
                        <div className="mt-4 rounded-[22px] border border-[#efe4da] bg-white px-4 py-4">
                          <div className="text-sm font-semibold text-[#8F1F1F]">{activeDashboard.coach.title}</div>
                          <p className="mt-3 text-sm leading-7 text-[oklch(0.42_0.02_260)]">{activeDashboard.coach.style}</p>
                        </div>
                        <p className="mt-4 text-sm leading-7 text-[oklch(0.42_0.02_260)]">{activeDashboard.coach.note}</p>
                      </div>
                      <InfoCard title="数据状态" content={activeDashboard.dataStatus} accent={PORTAL_RED} />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {activeDashboard.players.map((player) => {
                        const ratingMeta = buildPlayerRatingMeta(player, playerRatings[player.id]);
                        return (
                          <div key={player.id} className="rounded-[28px] border border-[#e8ddd3] bg-white p-5">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="text-xs uppercase tracking-[0.18em] text-[oklch(0.55_0.02_260)]">#{player.jerseyNumber} · {player.position}</div>
                                <h4 className="mt-2 text-xl font-black" style={{ fontFamily: "'Noto Serif SC', serif" }}>{player.name}</h4>
                              </div>
                              <div className="rounded-full bg-[#8F1F1F]/8 px-3 py-1 text-sm font-black text-[#8F1F1F]">{ratingMeta.average.toFixed(1)}</div>
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                              <MiniStat label="身高" value={player.height} />
                              <MiniStat label="体重" value={player.weight} />
                              <MiniStat label="进球" value={`${player.goals}`} />
                              <MiniStat label="评分票数" value={`${ratingMeta.count}`} />
                            </div>
                            <p className="mt-4 text-sm leading-7 text-[oklch(0.42_0.02_260)]">{player.contribution}</p>
                            {player.dataStatus ? <div className="mt-3 text-xs leading-6 text-[oklch(0.55_0.02_260)]">{player.dataStatus}</div> : null}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                {dashboardTab === 'leaders' ? (
                  <div className="mt-6 grid gap-6 xl:grid-cols-[0.86fr_1.14fr]">
                    <div className="space-y-4">
                      {leagueLeaders.map((leader) => (
                        <div key={leader.title} className="rounded-[28px] border border-[#e8ddd3] bg-[linear-gradient(180deg,#ffffff,#fff9f6)] p-5">
                          <div className="text-xs uppercase tracking-[0.18em] text-[oklch(0.55_0.02_260)]">{leader.title}</div>
                          <div className="mt-2 text-2xl font-black" style={{ fontFamily: "'Noto Serif SC', serif", color: leader.accent }}>{leader.value}</div>
                          <p className="mt-3 text-sm leading-7 text-[oklch(0.42_0.02_260)]">{leader.detail}</p>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-[28px] border border-[#e8ddd3] bg-[oklch(0.985_0.002_260)] p-5">
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-[#8F1F1F]/8 p-3 text-[#8F1F1F]">
                          <Trophy className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-xs uppercase tracking-[0.18em] text-[oklch(0.55_0.02_260)]">联赛热度排序</div>
                          <h3 className="text-2xl font-black" style={{ fontFamily: "'Noto Serif SC', serif" }}>球队热度与积分榜</h3>
                        </div>
                      </div>
                      <div className="mt-5 space-y-3">
                        {rankedTeams.slice(0, 8).map((team, index) => (
                          <div key={team.id} className="flex items-center gap-4 rounded-[22px] border border-white/80 bg-white px-4 py-4 shadow-sm">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[oklch(0.985_0.002_260)] text-sm font-black text-[oklch(0.28_0.02_260)]">{index + 1}</div>
                            <div className="min-w-0 flex-1">
                              <div className="font-bold" style={{ color: team.color }}>{team.teamName}</div>
                              <div className="mt-1 text-xs text-[oklch(0.55_0.02_260)]">{team.lastSeasonRecord}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-black" style={{ fontFamily: "'DM Mono', monospace" }}>{team.totalVotes}</div>
                              <div className="text-[10px] uppercase tracking-[0.18em] text-[oklch(0.55_0.02_260)]">Votes</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}
              </PortalPanel>
            </section>
          ) : null}

          {activeView === 'interactive' ? (
            <section className="space-y-6">
              <PortalPanel>
                <SectionHeader
                  eyebrow="互动中心"
                  title="前往湘超互动中心"
                  description=""
                  icon={MessageSquare}
                />
                <div className="mt-6 text-center">
                  <p className="text-sm leading-7 text-[oklch(0.42_0.02_260)] mb-6">
                    互动中心已升级为独立页面，包含球队热度投票、线上打气、留言板、数据看板、赛事战报、球迷文化和排行榜等丰富内容。
                  </p>
                  <a
                    href={routePath('/interactive')}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#8F1F1F,#B83131)] px-8 py-4 text-base font-bold text-white shadow-[0_12px_28px_rgba(143,31,31,0.16)] transition hover:translate-y-[-2px] hover:shadow-[0_16px_36px_rgba(143,31,31,0.22)]"
                  >
                    <Sparkles className="h-5 w-5" />
                    进入互动中心
                  </a>
                  <p className="mt-4 text-xs text-[oklch(0.55_0.02_260)]">
                    支持明暗主题切换 · 移动端完美适配
                  </p>
                </div>
              </PortalPanel>
            </section>
          ) : null}

          {/* OLD INTERACTIVE SECTION REMOVED - replaced by /interactive route */}
          {false ? (
            <section className="space-y-6 hidden">
              <div className="grid gap-4 sm:gap-6 xl:grid-cols-[0.94fr_1.06fr]">
                <div className="space-y-6">
                  <PortalPanel>
                    <SectionHeader
                      eyebrow="球迷互动"
                      title="球队热度投票"
                      description=""
                      icon={Vote}
                    />
                    <div className="mt-5 space-y-3">
                      {rankedTeams.slice(0, 6).map((team, index) => (
                        <div key={team.id} className="flex items-center gap-4 rounded-[22px] border border-[#ebe0d6] bg-[oklch(0.985_0.002_260)] px-4 py-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-sm font-black">{index + 1}</div>
                          <div className="min-w-0 flex-1">
                            <div className="font-bold" style={{ color: team.color }}>{team.teamName}</div>
                            <div className="mt-1 text-xs text-[oklch(0.55_0.02_260)]">{team.city}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-black" style={{ fontFamily: "'DM Mono', monospace" }}>{team.totalVotes}</div>
                            <div className="text-[10px] uppercase tracking-[0.18em] text-[oklch(0.55_0.02_260)]">Votes</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-5 grid gap-2 sm:grid-cols-2">
                      {featureTeams.map((team) => {
                        const disabled = Boolean(votedTeamId);
                        const isSelected = votedTeamId === team.id;
                        return (
                          <button
                            key={team.id}
                            onClick={() => handleVote(team.id)}
                            disabled={disabled}
                            className={`rounded-[22px] border px-4 py-3 text-left transition ${
                              isSelected
                                ? 'border-transparent text-white shadow-[0_10px_24px_rgba(143,31,31,0.16)]'
                                : 'border-[#e7dbcf] bg-white hover:border-[#8F1F1F]/18'
                            } ${disabled && !isSelected ? 'opacity-60' : ''}`}
                            style={isSelected ? { background: `linear-gradient(135deg, ${PORTAL_RED}, ${team.color})` } : undefined}
                          >
                            <div className="font-semibold">{team.teamName}</div>
                            <div className={`mt-1 text-xs ${isSelected ? 'text-white/75' : 'text-[oklch(0.55_0.02_260)]'}`}>{isSelected ? '本机已投票' : '点击投出 1 票'}</div>
                          </button>
                        );
                      })}
                    </div>
                  </PortalPanel>

                  <PortalPanel>
                    <SectionHeader
                      eyebrow="看台应援"
                      title="线上打气"
                      description=""
                      icon={Megaphone}
                    />
                    <div className="mt-5 space-y-3">
                      {activeCulture.cheerTemplates.map((template) => {
                        const count = cheerCounts[`${activeTeam.id}:${template}`] ?? 0;
                        return (
                          <button
                            key={template}
                            onClick={() => handleCheer(template)}
                            className="flex w-full items-center justify-between rounded-[22px] border border-[#ebe0d6] bg-[oklch(0.985_0.002_260)] px-4 py-4 text-left transition hover:border-[#8F1F1F]/20"
                          >
                            <div>
                              <div className="font-semibold text-[oklch(0.28_0.02_260)]">{template}</div>
                              <div className="mt-1 text-xs text-[oklch(0.55_0.02_260)]">点击一次即可加入线上应援热度</div>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-black text-[#8F1F1F]" style={{ fontFamily: "'DM Mono', monospace" }}>{count}</div>
                              <div className="text-[10px] uppercase tracking-[0.18em] text-[oklch(0.55_0.02_260)]">Heat</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </PortalPanel>
                </div>

                <div className="space-y-6">
                  <PortalPanel>
                    <SectionHeader
                      eyebrow="比赛评论"
                      title="评论与比赛动态"
                      description=""
                      icon={Send}
                    />
                    <div className="mt-4 sm:mt-5 grid gap-3 sm:gap-5 xl:grid-cols-[0.9fr_1.1fr]">
                      <div className="grid gap-3">
                        <input
                          value={nickname}
                          onChange={(event) => setNickname(event.target.value)}
                          placeholder="你的昵称"
                          className="h-11 rounded-2xl border border-[#e6d8cb] bg-[oklch(0.985_0.002_260)] px-4 text-sm outline-none transition focus:border-[#8F1F1F]/40"
                        />
                        <select
                          value={messageTeamId}
                          onChange={(event) => setMessageTeamId(event.target.value)}
                          className="h-11 rounded-2xl border border-[#e6d8cb] bg-[oklch(0.985_0.002_260)] px-4 text-sm outline-none transition focus:border-[#8F1F1F]/40"
                        >
                          {featureTeams.map((team) => (
                            <option key={team.id} value={team.id}>{team.teamName}</option>
                          ))}
                        </select>
                        <textarea
                          value={messageContent}
                          onChange={(event) => setMessageContent(event.target.value)}
                          placeholder={`写下你对 ${featureTeams.find((team) => team.id === messageTeamId)?.teamName ?? activeTeam.teamName} 的评价或赛前打气`}
                          className="min-h-[132px] rounded-[24px] border border-[#e6d8cb] bg-[oklch(0.985_0.002_260)] px-4 py-3 text-sm outline-none transition focus:border-[#8F1F1F]/40"
                        />
                        <button
                          onClick={handleSubmitMessage}
                          className="inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#8F1F1F,#B83131)] px-4 py-3 text-sm font-bold text-white shadow-[0_12px_28px_rgba(143,31,31,0.16)] transition hover:translate-y-[-1px]"
                        >
                          <Send className="h-4 w-4" />
                          发送评论
                        </button>
                      </div>

                      <div className="grid gap-3">
                        {messages.slice(0, 5).map((message) => (
                          <div key={message.id} className="rounded-[24px] border border-[#ebe0d6] bg-white px-4 py-4">
                            <div className="flex items-center justify-between gap-3">
                              <div className="font-semibold">{message.nickname}</div>
                              <div className="text-xs text-[oklch(0.55_0.02_260)]">{message.createdAt}</div>
                            </div>
                            <div className="mt-1 text-xs uppercase tracking-[0.18em] text-[#8F1F1F]">{message.teamName}</div>
                            <p className="mt-3 text-sm leading-7 text-[oklch(0.42_0.02_260)]">{message.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-5 grid gap-3">
                      {liveReports.slice(0, 3).map((report) => (
                        <motion.div
                          key={report.id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="rounded-[24px] border border-[#ebe0d6] bg-[linear-gradient(180deg,#ffffff,#fff8f4)] p-5"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="text-xs uppercase tracking-[0.18em] text-[oklch(0.55_0.02_260)]">{report.title}</div>
                              <div className="mt-2 text-lg font-black" style={{ fontFamily: "'Noto Serif SC', serif" }}>{report.homeTeam} VS {report.awayTeam}</div>
                            </div>
                            <div className={`rounded-full px-3 py-1 text-xs font-bold ${badgeClassName(report.type)}`}>{badgeLabel(report.type, report.minute)}</div>
                          </div>
                          <div className="mt-4 text-sm leading-7 text-[oklch(0.45_0.02_260)]">{report.summary}</div>
                        </motion.div>
                      ))}
                    </div>
                  </PortalPanel>

                  <PortalPanel>
                    <SectionHeader
                      eyebrow="阵容互动"
                      title="球员打分"
                      description=""
                      icon={Star}
                    />
                    <div className="mt-4 sm:mt-5 grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                      {activeDashboard.players.map((player) => {
                        const ratingMeta = buildPlayerRatingMeta(player, playerRatings[player.id]);
                        return (
                          <div key={player.id} className="rounded-[24px] border border-[#ebe0d6] bg-[oklch(0.985_0.002_260)] p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="text-xs uppercase tracking-[0.18em] text-[oklch(0.55_0.02_260)]">#{player.jerseyNumber} · {player.position}</div>
                                <div className="mt-1 text-lg font-black" style={{ fontFamily: "'Noto Serif SC', serif" }}>{player.name}</div>
                              </div>
                              <div className="rounded-full bg-[#8F1F1F]/8 px-3 py-1 text-sm font-black text-[#8F1F1F]">{ratingMeta.average.toFixed(1)}</div>
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                              <MiniStat label="身高" value={player.height} />
                              <MiniStat label="体重" value={player.weight} />
                              <MiniStat label="进球" value={`${player.goals}`} />
                              <MiniStat label="票数" value={`${ratingMeta.count}`} />
                            </div>
                            <p className="mt-4 text-sm leading-7 text-[oklch(0.42_0.02_260)]">{player.contribution}</p>
                            <div className="mt-4 flex flex-wrap gap-2">
                              {[1, 2, 3, 4, 5].map((score) => (
                                <button
                                  key={score}
                                  onClick={() => handleRatePlayer(player, score)}
                                  className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${ratingMeta.userScore === score ? 'bg-[#8F1F1F] text-white' : 'bg-white text-[oklch(0.45_0.02_260)]'}`}
                                >
                                  {score} 分
                                </button>
                              ))}
                            </div>
                            <div className="mt-3 text-xs text-[oklch(0.55_0.02_260)]">当前设备评分：{ratingMeta.userScore ?? '未选择'}，默认样本已累计 {ratingMeta.count} 票。</div>
                          </div>
                        );
                      })}
                    </div>
                  </PortalPanel>
                </div>
              </div>
            </section>
          ) : null}

          {activeView === 'culture' ? (
            <section className="space-y-6">
              <div className="grid gap-4 sm:gap-6 xl:grid-cols-[1.08fr_0.92fr]">
                <div className="overflow-hidden rounded-[32px] border border-[#d9cbbf] bg-[#fffaf4] shadow-[0_16px_40px_rgba(65,41,27,0.08)]">
                  <div className="relative isolate min-h-[360px] px-6 py-6 sm:px-7 sm:py-7">
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,250,244,0.96)_0%,rgba(255,250,244,0.92)_52%,rgba(143,31,31,0.18)_100%)]" />
                    {activeTheme ? (
                      <div className="absolute inset-0 bg-cover bg-center opacity-[0.26]" style={{ backgroundImage: `url(${activeTheme.image})` }} />
                    ) : (
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(143,31,31,0.18),transparent_28%),linear-gradient(135deg,rgba(180,138,76,0.10),rgba(143,31,31,0.08),transparent_70%)]" />
                    )}
                    <div className="relative max-w-2xl">
                      <div className="inline-flex items-center gap-2 rounded-full border border-[#8F1F1F]/10 bg-white/82 px-3 py-1 text-xs uppercase tracking-[0.2em] text-[#8F1F1F]">
                        <Flag className="h-3.5 w-3.5" />
                        主场文化
                      </div>
                      <h2 className="mt-5 text-4xl font-black leading-tight" style={{ fontFamily: "'Noto Serif SC', serif" }}>{activeCulture.title}</h2>
                      <p className="mt-5 text-sm leading-8 text-[oklch(0.42_0.02_260)]">{activeCulture.culturalAnchor}</p>
                      <div className="mt-6 grid gap-3 sm:grid-cols-2">
                        <InfoCard title="文化锚点" content={activeCulture.culturalAnchor} accent={PORTAL_RED} />
                        <InfoCard title="主场标语" content={activeTeam.slogan} accent={PORTAL_RED} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4">
                  <InfoCard title="啦啦队" content={activeCulture.cheerSquad} accent={PORTAL_RED} />
                  <InfoCard title="粉丝队" content={activeCulture.supporterGroup} accent={PORTAL_RED} />
                    <InfoCard title="主场看点" content={`${activeTeam.city} 主场标语与仪式。`} accent={PORTAL_RED} />
                  <InfoCard title="代表口号" content={activeCulture.bannerSamples[0] ?? activeTeam.slogan} accent={PORTAL_RED} />
                </div>
              </div>

              <div className="grid gap-4 sm:gap-6 xl:grid-cols-[0.92fr_1.08fr]">
                <PortalPanel>
                  <SectionHeader
                    eyebrow="看台组织"
                    title="看台组织"
                    description=""
                    icon={Users}
                  />
                  <div className="mt-6 space-y-4">
                    <InfoCard title="啦啦队职责" content={`${activeCulture.cheerSquad} 热场助威。`} accent={PORTAL_RED} />
                    <InfoCard title="粉丝队组织" content={`${activeCulture.supporterGroup} 以横幅和口号应援为主。`} accent={PORTAL_RED} />
                    <div className="rounded-[24px] border border-[#ebe0d6] bg-[oklch(0.985_0.002_260)] p-4">
                      <div className="text-xs uppercase tracking-[0.18em] text-[oklch(0.55_0.02_260)]">线上打气模板</div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {activeCulture.cheerTemplates.map((template) => (
                          <span key={template} className="rounded-full border border-[#eadbce] bg-white px-3 py-2 text-sm text-[oklch(0.40_0.02_260)]">{template}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </PortalPanel>

                <PortalPanel>
                  <SectionHeader
                    eyebrow="主场仪式"
                    title="主场仪式"
                    description=""
                    icon={Radio}
                  />
                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <div className="rounded-[28px] border border-[#ebe0d6] bg-[linear-gradient(180deg,#fff9f5,#ffffff)] p-5">
                      <div className="text-xs uppercase tracking-[0.18em] text-[oklch(0.55_0.02_260)]">主场仪式</div>
                      <div className="mt-4 space-y-3">
                        {activeCulture.rituals.map((ritual, index) => (
                          <div key={ritual} className="flex items-start gap-3">
                            <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#8F1F1F]/8 text-xs font-bold text-[#8F1F1F]">{index + 1}</div>
                            <p className="text-sm leading-7 text-[oklch(0.42_0.02_260)]">{ritual}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-[28px] border border-[#ebe0d6] bg-[oklch(0.985_0.002_260)] p-5">
                      <div className="text-xs uppercase tracking-[0.18em] text-[oklch(0.55_0.02_260)]">横幅墙</div>
                      <div className="mt-4 space-y-3">
                        {activeCulture.bannerSamples.map((banner) => (
                          <div key={banner} className="rounded-[20px] border border-white/80 bg-white px-4 py-3 text-sm font-medium leading-7 text-[oklch(0.40_0.02_260)]">
                            {banner}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </PortalPanel>
              </div>
            </section>
          ) : null}

          <section className="overflow-hidden rounded-[32px] border border-[#d8cabe] bg-[#fffaf5] shadow-[0_16px_40px_rgba(65,41,27,0.06)]">
            <div className="relative isolate px-5 py-6 sm:px-7 sm:py-7">
              <div className="absolute inset-y-0 right-0 hidden w-[42%] opacity-[0.16] lg:block" style={activeTheme ? { backgroundImage: `url(${activeTheme.image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { background: 'linear-gradient(135deg, rgba(143,31,31,0.10), rgba(180,138,76,0.08), transparent)' }} />
              <div className="relative grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                <div>
                  <SectionHeader
                    eyebrow="城市文化"
                    title="城市文化"
                    description=""
                    icon={Flag}
                  />
                  <div className="mt-5 rounded-[28px] border border-[#e7dbcf] bg-white/88 p-5">
                    <div className="text-xs uppercase tracking-[0.18em] text-[#8F1F1F]">城市文化锚点</div>
                    <h3 className="mt-3 text-2xl font-black" style={{ fontFamily: "'Noto Serif SC', serif" }}>{activeCulture.title}</h3>
                    <p className="mt-4 text-sm leading-8 text-[oklch(0.42_0.02_260)]">{activeCulture.culturalAnchor}</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <InfoCard title="核心仪式" content={activeCulture.rituals[0] ?? '待补充'} accent={PORTAL_RED} />
                  <InfoCard title="代表横幅" content={activeCulture.bannerSamples[0] ?? '待补充'} accent={PORTAL_RED} />
                  <InfoCard title="啦啦队" content={activeCulture.cheerSquad} accent={PORTAL_RED} />
                  <InfoCard title="粉丝队" content={activeCulture.supporterGroup} accent={PORTAL_RED} />
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function HeaderMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-white/12 bg-white/6 px-4 py-4">
      <div className="text-[11px] uppercase tracking-[0.18em] text-white/62">{label}</div>
      <div className="mt-2 text-lg font-black leading-7 text-white" style={{ fontFamily: "'Noto Serif SC', serif" }}>{value}</div>
    </div>
  );
}

function PortalPanel({ children }: { children: React.ReactNode }) {
  return <div className="rounded-[16px] sm:rounded-[30px] border border-[#e1d5cb] bg-white p-3 sm:p-6 shadow-[0_14px_34px_rgba(42,31,24,0.05)]">{children}</div>;
}

function SectionHeader({
  eyebrow,
  title,
  description,
  icon: Icon,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  icon: typeof BarChart3;
}) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-[#8F1F1F]/8 p-3 text-[#8F1F1F]">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-[oklch(0.55_0.02_260)]">{eyebrow}</div>
          <h2 className="mt-1 text-2xl font-black" style={{ fontFamily: "'Noto Serif SC', serif" }}>{title}</h2>
        </div>
      </div>
      {description ? <p className="mt-4 text-sm leading-7 text-[oklch(0.45_0.02_260)]">{description}</p> : null}
    </div>
  );
}

function SummaryCard({ title, value, helper }: { title: string; value: string; helper?: string }) {
  return (
    <div className="rounded-[16px] sm:rounded-[26px] border border-[#e1d6cb] bg-white px-3 py-3 sm:px-5 sm:py-5 shadow-[0_10px_26px_rgba(42,31,24,0.04)]">
      <div className="text-[10px] sm:text-xs uppercase tracking-[0.18em] text-[oklch(0.55_0.02_260)]">{title}</div>
      <div className="mt-2 sm:mt-3 text-lg sm:text-2xl font-black leading-tight text-[#8F1F1F]" style={{ fontFamily: "'Noto Serif SC', serif" }}>{value}</div>
      {helper ? <div className="mt-2 sm:mt-3 text-xs sm:text-sm leading-6 sm:leading-7 text-[oklch(0.45_0.02_260)]">{helper}</div> : null}
    </div>
  );
}

function InfoCard({ title, content, accent }: { title: string; content: string; accent: string }) {
  return (
    <div className="rounded-[24px] border border-[#e8ddd3] bg-white p-4 shadow-sm">
      <div className="text-xs uppercase tracking-[0.18em] text-[oklch(0.55_0.02_260)]">{title}</div>
      <div className="mt-3 text-sm font-medium leading-7" style={{ color: accent }}>{content}</div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#ebe0d6] bg-[oklch(0.985_0.002_260)] p-3">
      <div className="text-[10px] uppercase tracking-[0.18em] text-[oklch(0.55_0.02_260)]">{label}</div>
      <div className="mt-2 text-sm font-black">{value}</div>
    </div>
  );
}

function buildPlayerRatingMeta(player: TeamPlayerProfile, entry?: PlayerRatingEntry) {
  const baseVotes = 12;
  const totalVotes = baseVotes + (entry?.count ?? 0);
  const average = (player.ratingBase * baseVotes + (entry?.total ?? 0)) / totalVotes;
  return {
    average,
    count: totalVotes,
    userScore: entry?.userScore,
  };
}

function badgeClassName(type: 'live' | 'upcoming' | 'finished') {
  if (type === 'live') return 'bg-[#8F1F1F]/10 text-[#8F1F1F]';
  if (type === 'upcoming') return 'bg-[#C99C50]/12 text-[#9B6D1B]';
  return 'bg-[oklch(0.92_0.005_260)] text-[oklch(0.45_0.02_260)]';
}

function badgeLabel(type: 'live' | 'upcoming' | 'finished', minute?: string) {
  if (type === 'live') return minute ? `LIVE · ${minute}` : 'LIVE';
  if (type === 'upcoming') return 'PREVIEW';
  return 'FULL TIME';
}
