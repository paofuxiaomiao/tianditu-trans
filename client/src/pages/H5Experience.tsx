import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'wouter';
import {
  ArrowLeft,
  ChevronDown,
  Flame,
  Hotel,
  MapPin,
  MessageSquare,
  ParkingCircle,
  Send,
  Soup,
  Trophy,
  UtensilsCrossed,
  Vote,
} from 'lucide-react';
import LogoBadge from '@/components/LogoBadge';
import {
  featureTeams,
  h5LayerOptions,
  h5Pois,
  initialFanMessages,
  liveReports,
  type FanMessage,
  type H5Poi,
  type PoiLayer,
  projectLogo,
} from '@/data/feature-data';
import { cityGeoData, hunanOutline } from '@/data/hunan-geo';
import { routePath } from '@/lib/sitePaths';

const HERO_IMG = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663486523138/6NztyHB5jaNJh8ykWoD3oc/landing-hero-LFmanHYhXsky4PD5ZGP4s4.webp';
const ACTION_IMG = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663486523138/6NztyHB5jaNJh8ykWoD3oc/landing-action-GNWSyNsvVaYp6kQGdW67Yy.webp';
const CULTURE_IMG = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663486523138/6NztyHB5jaNJh8ykWoD3oc/landing-hunan-culture-8syApEnWeXMC8qjKWYJXBz.webp';

const VOTE_STORAGE_KEY = 'xiangchao_vote_extras_v1';
const VOTED_TEAM_STORAGE_KEY = 'xiangchao_voted_team_v1';
const MESSAGE_STORAGE_KEY = 'xiangchao_messages_v1';

function loadJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function pointToSvg(lat: number, lng: number) {
  const minLat = 24.6;
  const maxLat = 30.2;
  const minLng = 108.8;
  const maxLng = 114.3;
  const x = ((lng - minLng) / (maxLng - minLng)) * 290 + 18;
  const y = (1 - (lat - minLat) / (maxLat - minLat)) * 360 + 24;
  return { x, y };
}

function createOutlinePath() {
  return hunanOutline
    .map(([lat, lng], index) => {
      const { x, y } = pointToSvg(lat, lng);
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
}

const outlinePath = `${createOutlinePath()} Z`;

export default function H5Experience() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeLayer, setActiveLayer] = useState<PoiLayer>('team');
  const [activePoi, setActivePoi] = useState<H5Poi | null>(null);
  const [teamIndex, setTeamIndex] = useState(0);
  const [voteExtras, setVoteExtras] = useState<Record<string, number>>({});
  const [votedTeamId, setVotedTeamId] = useState<string | null>(null);
  const [messages, setMessages] = useState<FanMessage[]>(initialFanMessages);
  const [nickname, setNickname] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [messageTeamId, setMessageTeamId] = useState(featureTeams[0].id);

  useEffect(() => {
    setVoteExtras(loadJson<Record<string, number>>(VOTE_STORAGE_KEY, {}));
    setVotedTeamId(loadJson<string | null>(VOTED_TEAM_STORAGE_KEY, null));
    setMessages(loadJson<FanMessage[]>(MESSAGE_STORAGE_KEY, initialFanMessages));
  }, []);

  useEffect(() => {
    const initialPoi = h5Pois.find((poi) => poi.layer === activeLayer) ?? null;
    setActivePoi(initialPoi);
  }, [activeLayer]);

  const layerPois = useMemo(() => h5Pois.filter((poi) => poi.layer === activeLayer), [activeLayer]);
  const rankedTeams = useMemo(() => {
    return featureTeams
      .map((team) => ({ ...team, totalVotes: team.voteBase + (voteExtras[team.id] ?? 0) }))
      .sort((a, b) => b.totalVotes - a.totalVotes);
  }, [voteExtras]);

  const progress = ((currentIndex + 1) / 6) * 100;
  const currentTeam = featureTeams[teamIndex % featureTeams.length];

  const scrollToSection = (index: number) => {
    const node = containerRef.current;
    if (!node) return;
    node.scrollTo({ top: index * node.clientHeight, behavior: 'smooth' });
  };

  const handleScroll = () => {
    const node = containerRef.current;
    if (!node) return;
    const index = Math.round(node.scrollTop / node.clientHeight);
    setCurrentIndex(Math.max(0, Math.min(5, index)));
  };

  const handleVote = (teamId: string) => {
    if (votedTeamId) return;
    const nextExtras = {
      ...voteExtras,
      [teamId]: (voteExtras[teamId] ?? 0) + 1,
    };
    setVoteExtras(nextExtras);
    setVotedTeamId(teamId);
    window.localStorage.setItem(VOTE_STORAGE_KEY, JSON.stringify(nextExtras));
    window.localStorage.setItem(VOTED_TEAM_STORAGE_KEY, JSON.stringify(teamId));
  };

  const handleSubmitMessage = () => {
    const trimmedNickname = nickname.trim();
    const trimmedContent = messageContent.trim();
    if (!trimmedNickname || !trimmedContent) return;
    const team = featureTeams.find((item) => item.id === messageTeamId) ?? featureTeams[0];
    const nextMessages = [
      {
        id: `${Date.now()}`,
        teamId: team.id,
        teamName: team.teamName,
        nickname: trimmedNickname,
        content: trimmedContent,
        createdAt: '刚刚',
      },
      ...messages,
    ].slice(0, 10);

    setMessages(nextMessages);
    window.localStorage.setItem(MESSAGE_STORAGE_KEY, JSON.stringify(nextMessages));
    setNickname('');
    setMessageContent('');
  };

  return (
    <div className="relative h-screen overflow-hidden bg-[#080808] text-white touch-manipulation">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 h-24 bg-gradient-to-b from-black/70 to-transparent" />
      <div className="absolute left-0 right-0 top-0 z-40 h-1 bg-white/10">
        <div className="h-full bg-gradient-to-r from-[#FFB300] via-[#FF6B35] to-[#4CAF50] transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      <div className="absolute left-3 right-3 top-3 z-40 flex items-center justify-between gap-2 sm:left-4 sm:right-4 sm:top-4 lg:left-8 lg:right-8 lg:top-6">
        <Link href={routePath('/')}>
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/35 text-white backdrop-blur-md">
            <ArrowLeft className="h-4 w-4" />
          </div>
        </Link>
        <div className="rounded-full border border-white/15 bg-black/35 px-2.5 py-1.5 sm:px-3 sm:py-2 text-[10px] sm:text-xs tracking-[0.18em] text-white/80 backdrop-blur-md">
          H5 · {currentIndex + 1}/6
        </div>
      </div>

      <div ref={containerRef} onScroll={handleScroll} className="h-full snap-y snap-mandatory overflow-y-auto scroll-smooth lg:px-4">
        <section className="relative flex h-screen snap-start items-center justify-center overflow-hidden px-5 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(229,57,53,0.24),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(255,193,7,0.20),transparent_30%)]" />
          <div className="relative z-10 mx-auto max-w-sm text-center lg:max-w-2xl">
            <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-[32px] border border-white/12 bg-white/10 backdrop-blur-2xl shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
              <img src={projectLogo} alt="湘超 LOGO" className="h-20 w-20 object-contain" />
            </div>
            <div className="mt-8 text-xs tracking-[0.4em] text-white/55">LOADING H5 EXPERIENCE</div>
              <h1 className="mt-4 text-4xl font-black leading-tight lg:text-6xl" style={{ fontFamily: "'Noto Serif SC', serif" }}>

              湘超特色地图
            </h1>
            <p className="mt-4 text-sm leading-7 text-white/72 lg:mx-auto lg:max-w-xl lg:text-base">
              湖南足球地理信息服务平台 H5 版，用更轻量的方式串联球队地图、观赛互动与赛场快讯。
            </p>
            <div className="mt-8 overflow-hidden rounded-full bg-white/10">
              <div className="h-2.5 w-full animate-pulse rounded-full bg-gradient-to-r from-[#FFB300] via-[#FF6B35] to-[#4CAF50]" />
            </div>
            <button onClick={() => scrollToSection(1)} className="mt-10 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm text-white backdrop-blur-md">
              进入 H5
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </section>

        <section className="relative h-screen snap-start overflow-hidden lg:px-8">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${HERO_IMG})` }} />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/35 to-black/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#B71C1C]/35 via-transparent to-[#FFB300]/15" />
          <div className="relative z-10 flex h-full items-end px-5 pb-14 pt-20 lg:px-8 lg:pb-20 lg:pt-24">
            <div className="mx-auto w-full max-w-sm">
              <LogoBadge light subtitle="湖南地理信息服务" />
              <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs tracking-[0.18em] text-white/80 backdrop-blur-md">
                <Flame className="h-4 w-4 text-[#FFB300]" />
                一张图看湘超 · 服务球迷，带动周边
              </div>
              <h2 className="mt-5 text-[2.4rem] font-black leading-tight text-white lg:text-[3.6rem]" style={{ fontFamily: "'Noto Serif SC', serif" }}>
                湘超地图 H5
              </h2>
              <p className="mt-4 text-sm leading-7 text-white/74">
                从封面导览到图层地图、球队风采、人气投票与实时战报，这里把观赛所需的信息集中在一条连续的浏览路径中。
              </p>
              <button onClick={() => scrollToSection(2)} className="mt-7 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#D32F2F] to-[#FF6B35] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#D32F2F]/20">
                查看核心地图页
              </button>
            </div>
          </div>
        </section>

        <section className="relative h-screen snap-start overflow-hidden bg-[#0C1118] px-4 pb-8 pt-20 lg:px-8 lg:pb-10 lg:pt-24">
          <div className="mx-auto flex h-full max-w-sm flex-col rounded-[34px] border border-white/10 bg-white/6 p-4 backdrop-blur-xl lg:max-w-6xl lg:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs tracking-[0.24em] text-white/55">PAGE 03</div>
                <h3 className="mt-1 text-2xl font-black" style={{ fontFamily: "'Noto Serif SC', serif" }}>湘超一张图</h3>
              </div>
              <img src={projectLogo} alt="湘超 LOGO" className="h-10 w-10 rounded-2xl bg-white/10 p-1.5" />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {h5LayerOptions.map((layer) => (
                <button
                  key={layer.id}
                  onClick={() => setActiveLayer(layer.id)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs transition ${
                    activeLayer === layer.id
                      ? 'bg-white text-[#111827]'
                      : 'border border-white/12 bg-white/8 text-white/78'
                  }`}
                >
                  {layerIcon(layer.id)}
                  <span>{layer.label}</span>
                </button>
              ))}
            </div>

            <div className="mt-4 flex min-h-0 flex-1 flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.9fr)]">
              <div className="relative min-h-[320px] flex-1 overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,#16324F_0%,#101F32_45%,#0D1622_100%)] lg:min-h-0">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url(${CULTURE_IMG})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                <svg viewBox="0 0 330 420" className="absolute inset-0 h-full w-full">
                  <defs>
                    <linearGradient id="outlineGradient" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#4CAF50" stopOpacity="0.85" />
                      <stop offset="100%" stopColor="#FFB300" stopOpacity="0.45" />
                    </linearGradient>
                  </defs>
                  <path d={outlinePath} fill="rgba(255,255,255,0.08)" stroke="url(#outlineGradient)" strokeWidth="3" />
                  {cityGeoData.map((city) => {
                    const { x, y } = pointToSvg(city.center[0], city.center[1]);
                    return (
                      <text key={city.name} x={x} y={y - 12} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.55)">
                        {city.name}
                      </text>
                    );
                  })}
                  {layerPois.map((poi) => {
                    const { x, y } = pointToSvg(poi.lat, poi.lng);
                    const isActive = activePoi?.id === poi.id;
                    return (
                      <g key={poi.id} onClick={() => setActivePoi(poi)} style={{ cursor: 'pointer' }}>
                        <circle cx={x} cy={y} r={isActive ? 11 : 8} fill={poi.color ?? '#FF6B35'} fillOpacity={isActive ? 1 : 0.85} />
                        <circle cx={x} cy={y} r={isActive ? 17 : 13} fill={poi.color ?? '#FF6B35'} fillOpacity={0.18} />
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div className="flex flex-col gap-4">
                {activePoi ? (
                  <div className="rounded-[26px] border border-white/10 bg-black/25 p-4 lg:p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs tracking-[0.2em] text-white/50">{activePoi.city}</div>
                        <div className="mt-1 text-lg font-bold text-white lg:text-2xl">{activePoi.title}</div>
                      </div>
                      <div className="rounded-full px-3 py-1 text-xs text-white" style={{ backgroundColor: activePoi.color ?? '#FF6B35' }}>
                        {h5LayerOptions.find((item) => item.id === activePoi.layer)?.label}
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-white/80 lg:text-base">{activePoi.subtitle}</div>
                    <p className="mt-3 text-sm leading-7 text-white/70 lg:text-[15px]">{activePoi.detail}</p>
                  </div>
                ) : null}

                <div className="rounded-[26px] border border-white/10 bg-white/6 p-4 text-white/72 lg:p-5">
                  <div className="text-xs tracking-[0.2em] text-white/45">RESPONSIVE NOTES</div>
                  <p className="mt-3 text-sm leading-7 lg:text-[15px]">
                    移动端保持 H5 叙事式上下滑动体验；PC 端则将地图与详情并列展开，减少宽屏留白。图层切换后左侧地图更新，右侧同步展示当前点位信息，阅读和操作都会更直接。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative h-screen snap-start overflow-hidden bg-[#F5F0EB] px-4 pb-8 pt-20 text-[oklch(0.18_0.02_260)] lg:px-8 lg:pb-10 lg:pt-24">
          <div className="mx-auto flex h-full max-w-sm flex-col rounded-[34px] border border-[oklch(0.90_0.005_260)] bg-white p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] lg:max-w-6xl lg:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs tracking-[0.24em] text-[oklch(0.55_0.02_260)]">PAGE 04</div>
                <h3 className="mt-1 text-2xl font-black" style={{ fontFamily: "'Noto Serif SC', serif" }}>球队风采</h3>
              </div>
              <LogoBadge compact subtitle="14 支地市球队" />
            </div>

            <div className="mt-4 flex min-h-0 flex-1 flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
              <div className="overflow-hidden rounded-[28px]" style={{ background: `linear-gradient(135deg, ${currentTeam.color}16, rgba(255,255,255,0.92))` }}>
                <div className="p-5 lg:p-7">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs tracking-[0.18em] text-[oklch(0.55_0.02_260)]">{currentTeam.city}</div>
                      <div className="mt-2 text-3xl font-black lg:text-5xl" style={{ color: currentTeam.color, fontFamily: "'Noto Serif SC', serif" }}>
                        {currentTeam.teamName}
                      </div>
                    </div>
                    <div className="h-14 w-14 rounded-3xl lg:h-20 lg:w-20" style={{ background: `linear-gradient(135deg, ${currentTeam.color}, ${currentTeam.color}BB)` }} />
                  </div>
                  <p className="mt-4 text-sm leading-7 text-[oklch(0.42_0.02_260)] lg:max-w-2xl lg:text-[15px]">{currentTeam.badgeDesc}</p>
                  <div className="mt-4 rounded-[24px] bg-white/80 p-4">
                    <div className="text-xs tracking-[0.2em] text-[oklch(0.55_0.02_260)]">上赛季战绩</div>
                    <div className="mt-2 text-sm font-semibold lg:text-base" style={{ color: currentTeam.color }}>{currentTeam.lastSeasonRecord}</div>
                  </div>
                  <div className="mt-4 space-y-2 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
                    {currentTeam.seasonHighlights.map((item) => (
                      <div key={item} className="flex items-start gap-3 rounded-2xl bg-white/70 px-4 py-3">
                        <div className="mt-1 h-2.5 w-2.5 rounded-full" style={{ backgroundColor: currentTeam.color }} />
                        <div className="text-sm leading-6 text-[oklch(0.42_0.02_260)]">{item}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="rounded-[28px] border border-[oklch(0.92_0.005_260)] bg-[oklch(0.985_0.002_260)] p-4 lg:p-5">
                  <div className="text-xs tracking-[0.2em] text-[oklch(0.55_0.02_260)]">球队切换</div>
                  <div className="mt-3 grid max-h-[220px] grid-cols-4 gap-2 overflow-y-auto pr-1 lg:max-h-[320px] lg:grid-cols-3">
                    {featureTeams.map((team) => {
                      const isActive = currentTeam.id === team.id;
                      return (
                        <button
                          key={team.id}
                          onClick={() => setTeamIndex(featureTeams.findIndex((item) => item.id === team.id))}
                          className={`rounded-2xl border px-2 py-3 text-center text-xs font-semibold transition ${isActive ? 'text-white shadow-sm' : 'border-[oklch(0.92_0.005_260)] bg-white'}`}
                          style={isActive ? { background: `linear-gradient(135deg, ${team.color}, ${team.color}CC)`, borderColor: team.color } : { color: team.color }}
                        >
                          {team.city}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setTeamIndex((value) => (value - 1 + featureTeams.length) % featureTeams.length)} className="flex-1 rounded-full bg-[oklch(0.95_0.003_260)] py-3 text-sm font-semibold text-[oklch(0.35_0.02_260)]">
                    上一队
                  </button>
                  <button onClick={() => setTeamIndex((value) => (value + 1) % featureTeams.length)} className="flex-1 rounded-full bg-gradient-to-r from-[#D32F2F] to-[#FF6B35] py-3 text-sm font-semibold text-white">
                    下一队
                  </button>
                </div>
                <div className="rounded-[24px] border border-[oklch(0.92_0.005_260)] bg-white px-4 py-4 text-sm leading-7 text-[oklch(0.42_0.02_260)] lg:text-[15px]">
                  移动端保留“一屏一重点”的展示节奏；PC 端则将球队主卡与切换列表拆成双栏，方便快速浏览更多球队而不压缩主信息。
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative h-screen snap-start overflow-hidden bg-[#131313] px-4 pb-8 pt-20 lg:px-8 lg:pb-10 lg:pt-24">
          <div className="mx-auto flex h-full max-w-sm flex-col rounded-[34px] border border-white/10 bg-white/6 p-4 backdrop-blur-xl lg:max-w-6xl lg:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs tracking-[0.24em] text-white/55">PAGE 05</div>
                <h3 className="mt-1 text-2xl font-black" style={{ fontFamily: "'Noto Serif SC', serif" }}>人气投票</h3>
              </div>
              <Vote className="h-6 w-6 text-[#FFB300]" />
            </div>

            <div className="mt-4 flex min-h-0 flex-1 flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
              <div className="flex min-h-0 flex-col gap-4">
                <div className="grid grid-cols-3 gap-2">
                  {rankedTeams.slice(0, 3).map((team, index) => (
                    <div key={team.id} className="rounded-[24px] border border-white/10 bg-black/20 p-3 text-center">
                      <div className="text-xs tracking-[0.18em] text-white/45">TOP {index + 1}</div>
                      <div className="mt-3 text-base font-black" style={{ color: team.color }}>{team.teamName}</div>
                      <div className="mt-2 text-lg font-black lg:text-2xl" style={{ fontFamily: "'DM Mono', monospace" }}>{team.totalVotes}</div>
                    </div>
                  ))}
                </div>

                <div className="rounded-[28px] border border-white/10 bg-black/20 p-4 lg:min-h-0 lg:flex-1">
                  <div className="text-xs tracking-[0.2em] text-white/45">投票区</div>
                  <div className="mt-3 max-h-[28vh] space-y-2 overflow-y-auto pr-1 lg:max-h-none lg:h-[calc(100%-1.75rem)]">
                    {featureTeams.slice(0, 8).map((team) => {
                      const isSelected = votedTeamId === team.id;
                      const disabled = Boolean(votedTeamId);
                      return (
                        <button
                          key={team.id}
                          onClick={() => handleVote(team.id)}
                          disabled={disabled}
                          className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                            isSelected ? 'border-transparent text-white' : 'border-white/10 bg-black/20 text-white/85'
                          } ${disabled && !isSelected ? 'opacity-55' : ''}`}
                          style={isSelected ? { background: `linear-gradient(135deg, ${team.color}, ${team.color}CC)` } : undefined}
                        >
                          <span>{team.teamName}</span>
                          <span className="text-xs">{isSelected ? '已投票' : '投一票'}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-black/20 p-4 lg:flex lg:min-h-0 lg:flex-col">
                <div className="flex items-center gap-2 text-sm text-white/78">
                  <MessageSquare className="h-4 w-4 text-[#FFB300]" />
                  我想对他说
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-2">
                  <input
                    value={nickname}
                    onChange={(event) => setNickname(event.target.value)}
                    placeholder="昵称"
                    className="h-10 rounded-2xl border border-white/10 bg-white/10 px-3 text-sm text-white placeholder:text-white/35 outline-none"
                  />
                  <select
                    value={messageTeamId}
                    onChange={(event) => setMessageTeamId(event.target.value)}
                    className="h-10 rounded-2xl border border-white/10 bg-white/10 px-3 text-sm text-white outline-none"
                  >
                    {featureTeams.map((team) => (
                      <option key={team.id} value={team.id}>{team.teamName}</option>
                    ))}
                  </select>
                  <textarea
                    value={messageContent}
                    onChange={(event) => setMessageContent(event.target.value)}
                    placeholder="写下你想说的话"
                    className="min-h-[96px] rounded-3xl border border-white/10 bg-white/10 px-3 py-3 text-sm text-white placeholder:text-white/35 outline-none lg:col-span-2"
                  />
                  <button onClick={handleSubmitMessage} className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#D32F2F] to-[#FF6B35] py-3 text-sm font-bold text-white lg:col-span-2">
                    <Send className="h-4 w-4" />
                    提交留言
                  </button>
                </div>
                <div className="mt-3 max-h-[18vh] space-y-2 overflow-y-auto pr-1 lg:min-h-0 lg:flex-1 lg:max-h-none">
                  {messages.slice(0, 4).map((message) => (
                    <div key={message.id} className="rounded-2xl bg-white/8 px-3 py-3 text-sm text-white/80">
                      <div className="flex items-center justify-between gap-2 text-xs text-white/45">
                        <span>{message.nickname}</span>
                        <span>{message.teamName}</span>
                      </div>
                      <p className="mt-2 leading-6">{message.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative h-screen snap-start overflow-hidden bg-[#F5F0EB] px-4 pb-8 pt-20 text-[oklch(0.18_0.02_260)] lg:px-8 lg:pb-10 lg:pt-24">
          <div className="mx-auto flex h-full max-w-sm flex-col rounded-[34px] border border-[oklch(0.90_0.005_260)] bg-white p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] lg:max-w-6xl lg:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs tracking-[0.24em] text-[oklch(0.55_0.02_260)]">PAGE 06</div>
                <h3 className="mt-1 text-2xl font-black" style={{ fontFamily: "'Noto Serif SC', serif" }}>实时战报</h3>
              </div>
              <img src={ACTION_IMG} alt="实时战报氛围图" className="h-14 w-14 rounded-3xl object-cover" />
            </div>

            <div className="mt-4 flex min-h-0 flex-1 flex-col gap-4 lg:grid lg:grid-cols-[320px_minmax(0,1fr)]">
              <div className="flex flex-col gap-4">
                <div className="overflow-hidden rounded-[28px] border border-[oklch(0.92_0.005_260)]">
                  <img src={ACTION_IMG} alt="湘超比赛氛围图" className="h-32 w-full object-cover lg:h-48" />
                </div>
                <div className="rounded-[28px] border border-[oklch(0.92_0.005_260)] bg-[oklch(0.985_0.002_260)] p-4 text-sm leading-7 text-[oklch(0.42_0.02_260)] lg:text-[15px]">
                  这里汇集赛况快讯、现场氛围与观赛亮点，方便连续浏览每一轮比赛的核心信息。
                </div>
              </div>

              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
                {liveReports.map((report) => (
                  <div key={report.id} className="rounded-[28px] border border-[oklch(0.92_0.005_260)] bg-[oklch(0.985_0.002_260)] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-xs tracking-[0.18em] text-[oklch(0.55_0.02_260)]">{report.matchTime}</div>
                      <div className={`rounded-full px-3 py-1 text-[10px] font-bold ${report.type === 'live' ? 'bg-[#D32F2F]/10 text-[#D32F2F]' : report.type === 'upcoming' ? 'bg-[#FFB300]/14 text-[#B26A00]' : 'bg-[oklch(0.92_0.005_260)] text-[oklch(0.48_0.02_260)]'}`}>
                        {report.type === 'live' ? report.minute ?? 'LIVE' : report.type === 'upcoming' ? '预告' : '赛果'}
                      </div>
                    </div>
                    <div className="mt-3 flex items-end justify-between gap-4">
                      <div>
                        <div className="text-lg font-black" style={{ fontFamily: "'Noto Serif SC', serif" }}>{report.homeTeam}</div>
                        <div className="text-lg font-black" style={{ fontFamily: "'Noto Serif SC', serif" }}>{report.awayTeam}</div>
                      </div>
                      {typeof report.homeScore === 'number' && typeof report.awayScore === 'number' ? (
                        <div className="text-3xl font-black" style={{ fontFamily: "'DM Mono', monospace" }}>{report.homeScore}:{report.awayScore}</div>
                      ) : (
                        <div className="text-sm font-bold text-[#D32F2F]">即将开赛</div>
                      )}
                    </div>
                    <div className="mt-2 text-xs text-[oklch(0.55_0.02_260)]">{report.stadium}</div>
                    <p className="mt-3 text-sm leading-7 text-[oklch(0.42_0.02_260)]">{report.summary}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-2 rounded-full bg-[oklch(0.97_0.003_260)] px-4 py-3 text-sm text-[oklch(0.45_0.02_260)]">
              <span>H5 体验已完成</span>
              <Link href={routePath('/interactive')}>
                <span className="font-semibold text-[#D32F2F]">进入互动中心</span>
              </Link>
            </div>
          </div>
        </section>
      </div>

      <div className="absolute bottom-4 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-2 backdrop-blur-md lg:bottom-6">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <button
            key={index}
            onClick={() => scrollToSection(index)}
            className={`h-2.5 rounded-full transition-all ${currentIndex === index ? 'w-6 bg-white' : 'w-2.5 bg-white/35'}`}
          />
        ))}
      </div>
    </div>
  );
}

function layerIcon(layer: PoiLayer) {
  if (layer === 'stadium') return <MapPin className="h-4 w-4" />;
  if (layer === 'food') return <UtensilsCrossed className="h-4 w-4" />;
  if (layer === 'hotel') return <Hotel className="h-4 w-4" />;
  if (layer === 'parking') return <ParkingCircle className="h-4 w-4" />;
  if (layer === 'cuisine') return <Soup className="h-4 w-4" />;
  return <Trophy className="h-4 w-4" />;
}
