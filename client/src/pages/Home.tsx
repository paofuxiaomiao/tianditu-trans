/**
 * Home - 湘超数字地图看板主页（移动端适配版）
 * Mobile adaptations:
 * - Header simplified on mobile (smaller text, compact layout)
 * - Bottom team selector with larger touch targets & snap scroll
 * - TeamDetail uses bottom drawer on mobile via useIsMobile hook
 * - Map controls repositioned for thumb reach
 * - Stats bar simplified
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import HunanMap, { type MapTransitionMode } from '@/components/HunanMap';
import TeamList from '@/components/TeamList';
import TeamDetail from '@/components/TeamDetail';
import StatsBar, { ScheduleDialog } from '@/components/StatsBar';
import { teams, type Team, HERO_BANNER, leagueStats } from '@/data/teams';
import { Trophy, Map, ArrowLeft, ChevronRight, MapPin, Shield, Medal, ChevronDown, ChevronUp, Flame, Target, Timer, CalendarDays } from 'lucide-react';
import { projectLogo } from '@/data/feature-data';
import { routePath, assetPath } from '@/lib/sitePaths';
import { useIsMobile } from '@/hooks/useMobile';

type LifeLayerKey = 'team' | 'stadium' | 'food' | 'hotel' | 'parking' | 'cuisine';

const LIFE_LAYER_OPTIONS: { key: LifeLayerKey; label: string }[] = [
  { key: 'team', label: '球队' },
  { key: 'stadium', label: '场馆' },
  { key: 'food', label: '餐饮' },
  { key: 'hotel', label: '住宿' },
  { key: 'parking', label: '停车' },
  { key: 'cuisine', label: '湘菜' },
];

const MAP_TRANSITION_OPTIONS: { key: MapTransitionMode; label: string }[] = [
  { key: 'ripple', label: '水滴' },
  { key: 'ink', label: '墨染' },
  { key: 'blend', label: '叠化' },
  { key: 'relief', label: '立体' },
  { key: 'rippleCity', label: '水滴2' },
  { key: 'rippleFlame', label: '火焰' },
  { key: 'mirror', label: '水镜' },
  { key: 'fireVein', label: '火脉' },
  { key: 'silk', label: '绢幕' },
  { key: 'scroll', label: '卷轴' },
];


const TOP_RANK_MEDALS: Record<number, {
  label: string;
  medalColor: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  shadow: string;
}> = {
  1: {
    label: '冠军',
    medalColor: '#F5B301',
    bgClass: 'bg-amber-50',
    borderClass: 'border-amber-200',
    textClass: 'text-amber-600',
    shadow: '0 8px 20px rgba(245, 179, 1, 0.20)',
  },
  2: {
    label: '亚军',
    medalColor: '#A7B0BE',
    bgClass: 'bg-slate-50',
    borderClass: 'border-slate-200',
    textClass: 'text-slate-500',
    shadow: '0 8px 20px rgba(148, 163, 184, 0.22)',
  },
  3: {
    label: '季军',
    medalColor: '#C77B30',
    bgClass: 'bg-orange-50',
    borderClass: 'border-orange-200',
    textClass: 'text-orange-600',
    shadow: '0 8px 20px rgba(199, 123, 48, 0.20)',
  },
};

function getTopRankMedal(team: Team) {
  return TOP_RANK_MEDALS[team.rank];
}

export default function Home() {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [show3D, setShow3D] = useState(false);
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);
  const [mobileHubOpen, setMobileHubOpen] = useState(false);
  const [mobileLifePanelOpen, setMobileLifePanelOpen] = useState(false);
  const [activeLifeLayer, setActiveLifeLayer] = useState<LifeLayerKey>('team');
  const [mapTransitionMode, setMapTransitionMode] = useState<MapTransitionMode>('ripple');
  const [mapResetSignal, setMapResetSignal] = useState(0);
  const [mobileCardCollapsed, setMobileCardCollapsed] = useState(false);
  const [mobileScheduleOpen, setMobileScheduleOpen] = useState(false);
  const transitionButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const isMobile = useIsMobile();
  const defaultMobileTeam = teams.find((team) => team.id === 'changsha') ?? teams[0];
  const mobileDisplayTeam = selectedTeam ?? defaultMobileTeam;

  const handleTeamSelect = useCallback((team: Team | null) => {
    if (team === null) {
      setSelectedTeam(null);
      setShow3D(false);
      setMobilePanelOpen(false);
      setMobileLifePanelOpen(false);
      setMobileHubOpen(false);
      return;
    }
    if (isMobile) {
      setSelectedTeam(team);
      setMobilePanelOpen(false);
      setMobileLifePanelOpen(false);
      setMobileHubOpen(false);
      return;
    }
    const isSameTeam = selectedTeam?.id === team.id;
    setSelectedTeam(isSameTeam ? null : team);
  }, [isMobile, selectedTeam]);
  const handleMobileTeamJump = useCallback((team: Team) => {
    setSelectedTeam(team);
    setShow3D(false);
    setMobilePanelOpen(false);
    setMobileLifePanelOpen(false);
    setMobileHubOpen(false);
  }, []);
  const handleCloseDetail = useCallback(() => {
    setSelectedTeam(null);
    setShow3D(false);
    setMobilePanelOpen(false);
    setMobileLifePanelOpen(false);
    setMobileHubOpen(false);
  }, []);

  const handleToggleMobileHub = useCallback(() => {
    setMobileHubOpen((prev) => !prev);
  }, []);

  const handleOpenMobilePanel = useCallback(() => {
    if (!selectedTeam) {
      setSelectedTeam(defaultMobileTeam);
    }
    setMobilePanelOpen(true);
    setMobileLifePanelOpen(false);
    setMobileHubOpen(false);
  }, [defaultMobileTeam, selectedTeam]);

  const handleOpenMobileLifePanel = useCallback(() => {
    if (!selectedTeam) {
      setSelectedTeam(defaultMobileTeam);
    }
    setActiveLifeLayer('team');
    setMobilePanelOpen(false);
    setMobileLifePanelOpen(true);
    setMobileHubOpen(false);
  }, [defaultMobileTeam, selectedTeam]);

  const handleCloseMobilePanel = useCallback(() => {
    setMobilePanelOpen(false);
  }, []);

  const handleCloseMobileLifePanel = useCallback(() => {
    setMobileLifePanelOpen(false);
  }, []);

  const handleToggle3D = useCallback(() => {
    setShow3D((prev) => !prev);
  }, []);

  const handleResetView = useCallback(() => {
    setShow3D(false);
    setSelectedTeam(null);
    setMobilePanelOpen(false);
    setMobileLifePanelOpen(false);
    setMobileHubOpen(false);
    if (isMobile) {
      setMobileCardCollapsed(true);
    }
    setMapResetSignal((value) => value + 1);
  }, [isMobile]);

  const handleTransitionModeSelect = useCallback((mode: MapTransitionMode) => {
    setMapTransitionMode(mode);
    setShow3D(false);
    setSelectedTeam(null);
    setMobilePanelOpen(false);
    setMobileLifePanelOpen(false);
    setMobileHubOpen(false);
    if (isMobile) {
      setMobileCardCollapsed(true);
    }
    setMapResetSignal((value) => value + 1);
  }, [isMobile]);

  useEffect(() => {
    transitionButtonRefs.current[mapTransitionMode]?.scrollIntoView({
      block: 'nearest',
      inline: 'center',
      behavior: 'smooth',
    });
  }, [mapTransitionMode]);

  return (
    <div className="h-screen w-screen overflow-hidden bg-[oklch(0.96_0.005_220)] flex flex-col">
      {/* Top Header Bar - Red gradient */}
      <header className="relative z-10 shrink-0">
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, #C62828 0%, #D32F2F 30%, #E53935 60%, #B71C1C 100%)',
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: `url(${HERO_BANNER})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center 30%',
              mixBlendMode: 'overlay',
            }}
          />
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.5\'/%3E%3C/svg%3E")',
          }} />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `url(${assetPath('assets/header-football-bg.png')})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center center',
            }}
          />
        </div>
        
        <div className="relative px-3 py-2 sm:px-5 sm:py-3.5 flex items-center justify-between">
          {/* Left: Title */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href={routePath('/')}>
              <motion.div
                whileHover={{ x: -3 }}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/15 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/80" />
              </motion.div>
            </Link>

            {/* Logo - hidden on mobile */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 12, delay: 0.1 }}
              className="relative hidden sm:block"
            >
              <div className="w-11 h-11 rounded-sm flex items-center justify-center relative"
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(8px)',
                  border: '1.5px solid rgba(255,255,255,0.25)',
                }}
              >
                <img src={projectLogo} alt="湘超 LOGO" className="w-7 h-7 object-contain" />
                <div className="absolute inset-[3px] border border-white/10 rounded-[1px]" />
              </div>
              <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-[1.5px] border-l-[1.5px] border-white/30" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-[1.5px] border-r-[1.5px] border-white/30" />
              <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-[1.5px] border-l-[1.5px] border-white/30" />
              <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-[1.5px] border-r-[1.5px] border-white/30" />
            </motion.div>

            <div>
              <motion.h1
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-1"
              >
                <span
                  className="text-[15px] sm:text-[22px] font-black text-white tracking-wide"
                  style={{ fontFamily: "'Noto Serif SC', serif", textShadow: '0 1px 3px rgba(0,0,0,0.15)' }}
                >
                  湘超
                </span>
                <span className="text-[15px] sm:text-[22px] font-light text-white/40 mx-0.5">·</span>
                <span
                  className="text-[15px] sm:text-[22px] font-black text-white/95 tracking-wide"
                  style={{ fontFamily: "'Noto Serif SC', serif", textShadow: '0 1px 3px rgba(0,0,0,0.15)' }}
                >
                  数字地图
                </span>
              </motion.h1>
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="hidden sm:flex items-center gap-2.5 mt-0.5"
              >
                <span className="text-[10px] text-white/50 tracking-[0.15em]" style={{ fontFamily: "'Noto Sans SC', sans-serif" }}>
                  2026 湘超联赛
                </span>
                <div className="w-px h-3 bg-white/20" />
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-sm bg-white/10 border border-white/15">
                  <Trophy className="w-2.5 h-2.5 text-amber-300" />
                  <span className="text-[9px] text-amber-200 font-bold tracking-wider">{leagueStats.champion}</span>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Right: Desktop nav */}
          <div className="hidden lg:flex items-center gap-3">
            <Link href={routePath('/interactive')}>
              <div className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/88 backdrop-blur-md transition hover:bg-white/15">
                互动中心
              </div>
            </Link>
            <Link href={routePath('/h5')}>
              <div className="rounded-full border border-white/15 bg-black/20 px-4 py-2 text-sm text-white/88 backdrop-blur-md transition hover:bg-black/30">
                H5
              </div>
            </Link>
            <div className="hidden xl:block">
              <StatsBar />
            </div>
          </div>

          {/* Mobile: Quick nav */}
          <div className="flex lg:hidden items-center gap-1.5">
            <Link href={routePath('/interactive')}>
              <div className="rounded-full bg-white/10 border border-white/15 px-2.5 py-1.5 text-[11px] text-white/80 backdrop-blur-sm">
                互动
              </div>
            </Link>
            <Link href={routePath('/h5')}>
              <div className="rounded-full bg-white/10 border border-white/15 px-2.5 py-1.5 text-[11px] text-white/80 backdrop-blur-sm">
                H5
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Left Panel: Team List - desktop only */}
        <AnimatePresence>
          {!show3D && (
            <motion.aside
              initial={{ x: -280, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -280, opacity: 0 }}
              transition={{ type: 'spring', damping: 22 }}
              className="w-[260px] shrink-0 border-r border-[oklch(0.90_0.005_260)] bg-white hidden lg:block"
            >
              <TeamList selectedTeam={selectedTeam} onTeamSelect={handleTeamSelect} />
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Center: Map */}
        <div className="flex-1 relative">
          <HunanMap
            onTeamSelect={handleTeamSelect}
            selectedTeam={selectedTeam}
            show3D={show3D}
            onToggle3D={handleToggle3D}
            onResetView={handleResetView}
            resetViewSignal={mapResetSignal}
            transitionMode={mapTransitionMode}
          />


          {/* Mobile: Tianditu globe hub with match/life quick actions */}
          <div className="lg:hidden absolute left-3 top-3 z-[1180]">
            <button
              onClick={handleToggleMobileHub}
              className={`relative h-14 w-14 rounded-full border-2 border-white/90 bg-white/95 shadow-[0_14px_30px_rgba(15,23,42,0.18)] backdrop-blur-xl flex items-center justify-center active:scale-95 transition-transform touch-manipulation ${mobileHubOpen ? 'scale-105' : ''}`}
              aria-label="打开地图快捷菜单"
              title="地图快捷菜单"
              style={{ boxShadow: `0 14px 30px ${(selectedTeam?.color ?? '#D32F2F')}2F` }}
            >
              <span className="absolute inset-1 rounded-full bg-gradient-to-br from-[#0B2A44] via-[#0E4F72] to-[#1A7E9D] opacity-95" />
              <span className="absolute inset-[6px] rounded-full border border-white/35" />
              <img src={assetPath('assets/tianditu-globe.png')} alt="天地图地球图案" className="relative z-10 h-9 w-9 object-contain drop-shadow" />
              <span
                className="absolute -right-1 -bottom-1 h-5 min-w-5 rounded-full border border-white bg-white px-1 text-[9px] font-black leading-5 text-[#0E4F72]"
                style={{ fontFamily: "'Noto Sans SC', sans-serif" }}
              >
                图
              </span>
            </button>

            <AnimatePresence>
              {mobileHubOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.82, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.82, y: -8 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 260 }}
                  className="absolute left-[3px] top-16 flex flex-col gap-2"
                >
                  <button
                    onClick={handleOpenMobilePanel}
                    className="h-12 w-12 rounded-full border-2 border-white bg-[#D32F2F] text-[12px] font-black text-white shadow-[0_10px_24px_rgba(211,47,47,0.28)] active:scale-95 touch-manipulation"
                    style={{ fontFamily: "'Noto Sans SC', sans-serif" }}
                    aria-label="打开赛事数据"
                  >
                    赛事
                  </button>
                  <button
                    onClick={handleOpenMobileLifePanel}
                    className="h-12 w-12 rounded-full border-2 border-white bg-emerald-500 text-[12px] font-black text-white shadow-[0_10px_24px_rgba(16,185,129,0.28)] active:scale-95 touch-manipulation"
                    style={{ fontFamily: "'Noto Sans SC', sans-serif" }}
                    aria-label="打开生活服务图层"
                  >
                    生活
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {isMobile && mobilePanelOpen && selectedTeam && (
              <>
                <motion.button
                  key="mobile-detail-backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={handleCloseMobilePanel}
                  className="fixed inset-0 z-[1190] bg-black/30 backdrop-blur-[1px] lg:hidden"
                  aria-label="关闭球队详情侧栏遮罩"
                />
                <motion.div
                  key="mobile-detail-panel"
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 28, stiffness: 260 }}
                  className="fixed right-0 top-0 bottom-0 z-[1200] w-[min(92vw,420px)] max-w-[420px] lg:hidden"
                >
                  <div className="relative h-full w-full overflow-hidden rounded-l-[28px] shadow-[-20px_0_45px_rgba(15,23,42,0.22)]">
                    <TeamDetail team={selectedTeam} onClose={handleCloseMobilePanel} />
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isMobile && mobileLifePanelOpen && (
              <>
                <motion.button
                  key="mobile-life-backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={handleCloseMobileLifePanel}
                  className="fixed inset-0 z-[1190] bg-white/15 backdrop-blur-[2px] lg:hidden"
                  aria-label="关闭生活服务图层遮罩"
                />
                <motion.div
                  key="mobile-life-panel"
                  initial={{ opacity: 0, y: 28, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.96 }}
                  transition={{ type: 'spring', damping: 24, stiffness: 230 }}
                  className="fixed inset-x-3 top-[82px] bottom-5 z-[1200] lg:hidden"
                >
                  <MobileLifeServicePanel
                    team={mobileDisplayTeam}
                    activeLayer={activeLifeLayer}
                    onLayerChange={setActiveLifeLayer}
                    onClose={handleCloseMobileLifePanel}
                  />
                </motion.div>
              </>
            )}
          </AnimatePresence>
          
          {/* Floating info - desktop only */}
          <AnimatePresence>
            {!selectedTeam && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[600] hidden lg:flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/90 backdrop-blur-md border border-[oklch(0.90_0.005_260)] shadow-lg shadow-black/5"
              >
                <Map className="w-3.5 h-3.5 text-[#D32F2F]/60" />
                <span className="text-xs text-[oklch(0.45_0.02_260)]" style={{ fontFamily: "'Noto Sans SC', sans-serif" }}>
                  点击地图标记或左侧列表查看队伍详情
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Mobile: Bottom team data card and city jump selector */}
          <motion.div
            initial={{ y: 28, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', damping: 24, stiffness: 220 }}
            className="lg:hidden absolute bottom-0 left-0 right-0 z-[620] px-3 pb-[calc(env(safe-area-inset-bottom)+10px)] pointer-events-none"
          >
            <AnimatePresence mode="wait" initial={false}>
              {mobileCardCollapsed ? (
                <MobileCollapsedDashboardBar
                  key="mobile-collapsed-dashboard"
                  onExpand={() => setMobileCardCollapsed(false)}
                  onOpenSchedule={() => setMobileScheduleOpen(true)}
                />
              ) : (
                <motion.div
                  key="mobile-expanded-team-card"
                  initial={{ y: 18, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 18, opacity: 0 }}
                  transition={{ type: 'spring', damping: 26, stiffness: 260 }}
                  className="mx-auto max-w-[440px] rounded-t-[26px] rounded-b-[22px] border border-white/80 bg-white/96 p-3 shadow-[0_-12px_34px_rgba(15,23,42,0.14)] backdrop-blur-2xl pointer-events-auto"
                >
                  <button
                    type="button"
                    onClick={() => setMobileCardCollapsed(true)}
                    className="mx-auto mb-2 flex h-6 min-w-20 items-center justify-center gap-1 rounded-full px-3 text-[10px] font-black text-[oklch(0.45_0.02_260)] active:scale-95 transition-transform"
                    aria-label="收起底部球队数据卡，显示数字看板快捷工具条"
                    title="收起球队卡片"
                    style={{ fontFamily: "'Noto Sans SC', sans-serif" }}
                  >
                    <span className="h-1 w-9 rounded-full bg-[oklch(0.78_0.01_260)]" />
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenMobilePanel}
                    className="flex w-full items-center gap-3 rounded-[20px] px-1 pb-3 text-left active:scale-[0.99] transition-transform touch-manipulation"
                    aria-label="通过湘超球赛事入口查看当前球队赛事数据"
                  >
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-white bg-white shadow-[0_8px_20px_rgba(15,23,42,0.12)]">
                      <div
                        className="absolute inset-0 opacity-10"
                        style={{ background: `radial-gradient(circle at 30% 20%, ${mobileDisplayTeam.color}, transparent 56%)` }}
                      />
                      <img
                        src={assetPath(`assets/badges/${mobileDisplayTeam.id}.jpg`)}
                        alt={`${mobileDisplayTeam.name}队徽`}
                        className="relative z-10 h-full w-full object-cover"
                        onError={(event) => {
                          const target = event.currentTarget;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling;
                          fallback?.classList.remove('hidden');
                          fallback?.classList.add('flex');
                        }}
                      />
                      <span
                        className="team-crest-fallback hidden relative z-10 h-full w-full items-center justify-center text-xl font-black text-white"
                        style={{ background: `linear-gradient(135deg, ${mobileDisplayTeam.color}, ${mobileDisplayTeam.color}CC)`, fontFamily: "'Noto Serif SC', serif" }}
                      >
                        {mobileDisplayTeam.name.slice(0, 1)}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-xl font-black text-[oklch(0.18_0.02_260)]" style={{ fontFamily: "'Noto Serif SC', serif" }}>
                        {mobileDisplayTeam.fullName}
                      </h2>
                      <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-[oklch(0.52_0.02_260)]" style={{ fontFamily: "'Noto Sans SC', sans-serif" }}>
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{mobileDisplayTeam.city}</span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {(() => {
                        const medal = getTopRankMedal(mobileDisplayTeam);
                        return medal ? (
                          <span
                            className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-black ${medal.bgClass} ${medal.borderClass} ${medal.textClass}`}
                            style={{ boxShadow: medal.shadow }}
                          >
                            <Medal className="h-3.5 w-3.5" style={{ color: medal.medalColor }} />
                            {medal.label}
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-lg border border-[oklch(0.90_0.005_260)] bg-white px-2.5 py-1 text-xs font-black text-[oklch(0.42_0.02_260)]">
                            {mobileDisplayTeam.rankLabel}
                          </span>
                        );
                      })()}
                      <ChevronRight className="h-5 w-5 text-[oklch(0.62_0.015_260)]" />
                    </div>
                  </button>
                  <div className="grid grid-cols-3 overflow-hidden rounded-2xl border border-[oklch(0.90_0.005_260)] bg-white/82">
                    <div className="flex flex-col items-center justify-center gap-1 border-r border-[oklch(0.90_0.005_260)] px-2 py-2.5">
                      <Shield className="h-4 w-4 text-[oklch(0.50_0.02_260)]" />
                      <div className="text-lg font-black text-[#D32F2F] leading-none">{mobileDisplayTeam.stats.points}<span className="ml-0.5 text-xs">分</span></div>
                      <div className="text-[11px] text-[oklch(0.45_0.02_260)]">积分</div>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-1 border-r border-[oklch(0.90_0.005_260)] px-2 py-2.5">
                      <Trophy className="h-4 w-4 text-emerald-500" />
                      <div className="text-sm font-black text-[#D32F2F] leading-none">
                        {mobileDisplayTeam.stats.won}<span className="text-xs text-[oklch(0.45_0.02_260)]">胜</span>
                        {mobileDisplayTeam.stats.drawn}<span className="text-xs text-[oklch(0.45_0.02_260)]">平</span>
                        {mobileDisplayTeam.stats.lost}<span className="text-xs text-[oklch(0.45_0.02_260)]">负</span>
                      </div>
                      <div className="text-[11px] text-[oklch(0.45_0.02_260)]">战绩</div>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-1 px-2 py-2.5">
                      <span className="text-base leading-none">⚽</span>
                      <div className="text-lg font-black text-[#D32F2F] leading-none">{mobileDisplayTeam.stats.goalsFor} / {mobileDisplayTeam.stats.goalsAgainst}</div>
                      <div className="text-[11px] text-[oklch(0.45_0.02_260)]">进球/失球</div>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2 overflow-x-auto rounded-[22px] bg-white px-2 py-2 shadow-[inset_0_0_0_1px_oklch(0.91_0.005_260)] snap-x snap-mandatory scrollbar-hide">
                    {teams.map((team) => {
                      const isActive = mobileDisplayTeam.id === team.id;
                      const medal = getTopRankMedal(team);
                      return (
                        <button
                          key={team.id}
                          type="button"
                          onClick={() => handleMobileTeamJump(team)}
                          className={`inline-flex shrink-0 min-w-[64px] items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-black transition-all snap-center touch-manipulation ${
                            isActive
                              ? 'text-white shadow-lg scale-105'
                              : 'bg-white text-[oklch(0.22_0.02_260)] active:scale-95'
                          }`}
                          style={isActive ? { background: `linear-gradient(135deg, ${team.color}, #D32F2F)`, boxShadow: `0 8px 18px ${team.color}30` } : {}}
                        >
                          {medal ? (
                            <Medal
                              className="h-3.5 w-3.5 shrink-0"
                              style={{ color: isActive ? '#FFFFFF' : medal.medalColor, filter: isActive ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.22))' : `drop-shadow(0 1px 2px ${medal.medalColor}55)` }}
                            />
                          ) : null}
                          <span>{team.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          {/* Desktop: Team Detail Panel */}
          <div className="hidden lg:block">
            <TeamDetail team={selectedTeam} onClose={handleCloseDetail} />
          </div>

          {/* Map control buttons */}
          <div className="absolute left-20 right-3 top-3 z-[1100] flex items-start justify-end gap-2 sm:left-auto sm:top-4 sm:right-4 sm:max-w-[calc(100vw-86px)]">
            <div
              className="scrollbar-hide min-w-0 flex-1 overflow-x-auto rounded-lg border border-[#FCA5A5]/55 bg-white/90 p-1 shadow-md shadow-black/5 backdrop-blur-md sm:flex-none"
              style={{ fontFamily: "'Noto Sans SC', sans-serif" }}
              aria-label="转场审核方式"
            >
              <div className="flex w-max items-center gap-1">
                {MAP_TRANSITION_OPTIONS.map((option) => {
                  const isActive = mapTransitionMode === option.key;
                  return (
                    <button
                      key={option.key}
                      ref={(node) => {
                        transitionButtonRefs.current[option.key] = node;
                      }}
                      type="button"
                      onClick={() => handleTransitionModeSelect(option.key)}
                      aria-pressed={isActive}
                      aria-label={`审核${option.label}转场效果`}
                      title={`切换并重播${option.label}转场效果`}
                      className={`h-8 shrink-0 rounded-md px-2.5 text-xs font-black transition-all touch-manipulation sm:h-7 ${
                        isActive
                          ? 'bg-[#D32F2F] text-white shadow-[0_6px_14px_rgba(211,47,47,0.26)]'
                          : 'text-[#7A1F1F] hover:bg-[#FFF1F1] active:scale-95'
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <button
              onClick={handleResetView}
              className="flex shrink-0 items-center gap-1.5 sm:gap-2 bg-white/90 hover:bg-white text-[oklch(0.35_0.02_260)] hover:text-[#D32F2F] px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all border border-[oklch(0.88_0.005_260)] backdrop-blur-md shadow-md shadow-black/5 hover:shadow-lg hover:border-[#D32F2F]/20 group touch-manipulation"
              style={{ fontFamily: "'Noto Sans SC', sans-serif" }}
            >
              <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:rotate-180 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              <span className="hidden sm:inline">全省总览</span>
              <span className="sm:hidden">总览</span>
            </button>
            <button
              onClick={handleResetView}
              className="flex shrink-0 items-center gap-1.5 sm:gap-2 bg-white/90 hover:bg-white text-[#C62828] px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-bold transition-all border border-[#FCA5A5]/60 backdrop-blur-md shadow-md shadow-black/5 hover:shadow-lg hover:border-[#D32F2F]/25 group touch-manipulation"
              style={{ fontFamily: "'Noto Sans SC', sans-serif" }}
              aria-label="重播凤凰到数字地图的切换效果"
              title="重播凤凰到数字地图的切换效果"
            >
              <Flame className="h-3 w-3 sm:h-3.5 sm:w-3.5 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">重播转场</span>
              <span className="sm:hidden">转场</span>
            </button>
          </div>
        </div>
      </main>
      <ScheduleDialog open={mobileScheduleOpen} onOpenChange={setMobileScheduleOpen} />

    </div>
  );
}

function MobileCollapsedDashboardBar({ onExpand, onOpenSchedule }: { onExpand: () => void; onOpenSchedule: () => void }) {
  const today = (() => {
    const date = new Date();
    return `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
  })();

  const statItems = [
    { label: '总比赛', value: String(leagueStats.totalMatches), suffix: '场', icon: Flame },
    { label: '总进球', value: String(leagueStats.totalGoals), suffix: '球', icon: Target },
    { label: '参赛城市', value: String(leagueStats.cities), suffix: '城', icon: MapPin },
    { label: '赛程', value: leagueStats.duration, suffix: '', icon: Timer },
    { label: '今日日期', value: today, suffix: '', icon: CalendarDays },
  ];

  return (
    <motion.div
      initial={{ y: 18, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 18, opacity: 0 }}
      transition={{ type: 'spring', damping: 26, stiffness: 260 }}
      className="mx-auto max-w-[440px] overflow-hidden rounded-[24px] border border-white/75 bg-white/95 shadow-[0_-10px_30px_rgba(15,23,42,0.16)] backdrop-blur-2xl pointer-events-auto"
      aria-label="收起态数字看板快捷工具条"
    >
      <div className="relative overflow-hidden rounded-[23px] bg-gradient-to-r from-[#B71C1C] via-[#D32F2F] to-[#EF5350] px-2.5 py-2.5">
        <div
          className="absolute inset-0 opacity-[0.10]"
          style={{
            backgroundImage: `url(${HERO_BANNER})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            mixBlendMode: 'screen',
          }}
        />
        <div className="relative flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <button
            type="button"
            onClick={onExpand}
            className="flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-white/22 bg-white/16 px-3 text-xs font-black text-white shadow-sm active:scale-95 transition-transform touch-manipulation"
            aria-label="展开底部球队数据卡"
            title="展开球队卡片"
            style={{ fontFamily: "'Noto Sans SC', sans-serif" }}
          >
            <ChevronUp className="h-4 w-4" />
            展开
          </button>
          <Link href={routePath('/interactive')}>
            <div className="flex h-10 shrink-0 items-center whitespace-nowrap rounded-full border border-white/22 bg-white/14 px-3 text-xs font-black text-white/95 active:scale-95 transition-transform">
              互动中心
            </div>
          </Link>
          <Link href={routePath('/h5')}>
            <div className="flex h-10 shrink-0 items-center whitespace-nowrap rounded-full border border-white/22 bg-black/18 px-3 text-xs font-black text-white/95 active:scale-95 transition-transform">
              H5
            </div>
          </Link>
          {statItems.map((item) => {
            const Icon = item.icon;
            const content = (
              <>
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/12 text-white/75">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="flex flex-col leading-none">
                  <span className="text-sm font-black" style={{ fontFamily: "'DM Mono', monospace" }}>
                    {item.value}<span className="ml-0.5 text-[10px] font-bold text-white/65">{item.suffix}</span>
                  </span>
                  <span className="mt-1 whitespace-nowrap text-[9px] font-medium tracking-[0.12em] text-white/55">
                    {item.label}
                  </span>
                </span>
              </>
            );

            if (item.label === '赛程') {
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={onOpenSchedule}
                  title="点击查看赛程缩略图"
                  aria-label="查看赛程缩略图"
                  className="flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-[15px] border border-white/22 bg-white/18 px-3 text-white backdrop-blur-md active:scale-95 transition-transform touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                >
                  {content}
                  <ChevronRight className="h-3.5 w-3.5 text-white/65" />
                </button>
              );
            }

            return (
              <div
                key={item.label}
                className="flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-[15px] border border-white/16 bg-white/12 px-3 text-white backdrop-blur-md"
              >
                {content}
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

function getLifeLayerCopy(layer: LifeLayerKey, team: Team) {
  const cityName = team.city.replace('市', '');

  switch (layer) {
    case 'stadium':
      return {
        category: '场馆',
        title: team.stadium,
        highlight: '主场观赛动线担当',
        description: `围绕${team.stadium}聚合入场口、看台区、安检口和赛后疏散建议，帮助球迷快速找到观赛路径。`,
      };
    case 'food':
      return {
        category: '餐饮',
        title: `${cityName}赛前补给`,
        highlight: '场馆周边餐饮推荐',
        description: `展示主场周边适合赛前聚餐与赛后宵夜的餐饮点位，优先突出步行可达和本地热门商圈。`,
      };
    case 'hotel':
      return {
        category: '住宿',
        title: `${cityName}观赛住宿`,
        highlight: '客队球迷友好住处',
        description: `聚合靠近球场、交通节点和城市核心区的住宿信息，方便外地球迷规划一晚或周末观赛行程。`,
      };
    case 'parking':
      return {
        category: '停车',
        title: `${team.stadium}停车指南`,
        highlight: '赛时交通疏导辅助',
        description: `展示球场周边停车场、临停区和换乘点，配合地图缩放可快速判断自驾与公共交通方案。`,
      };
    case 'cuisine':
      return {
        category: '湘菜',
        title: `${cityName}地道湘味`,
        highlight: '城市文旅味觉名片',
        description: `把本地代表湘菜、夜市和特色小吃纳入生活图层，让球迷在观赛之外继续探索城市烟火气。`,
      };
    case 'team':
    default:
      return {
        category: '球队',
        title: team.fullName,
        highlight: `${team.rankLabel}主场热度担当`,
        description: `球队以速度与压迫感见长，主场话题度和球迷黏性都很高。当前积分${team.stats.points}分，进失球为${team.stats.goalsFor}/${team.stats.goalsAgainst}。`,
      };
  }
}

function MobileLifeServicePanel({
  team,
  activeLayer,
  onLayerChange,
  onClose,
}: {
  team: Team;
  activeLayer: LifeLayerKey;
  onLayerChange: (layer: LifeLayerKey) => void;
  onClose: () => void;
}) {
  const layerCopy = getLifeLayerCopy(activeLayer, team);

  return (
    <div className="h-full overflow-y-auto rounded-[30px] border border-white/80 bg-white/96 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.20)] backdrop-blur-xl">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium tracking-[0.12em] text-[oklch(0.46_0.02_260)]" style={{ fontFamily: "'Noto Sans SC', sans-serif" }}>
            {team.name}示例
          </p>
          <h2 className="mt-2 text-[26px] font-black leading-tight text-[oklch(0.16_0.02_260)]" style={{ fontFamily: "'Noto Serif SC', serif" }}>
            {team.name}服务图层示例
          </h2>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="rounded-full bg-[#D32F2F]/8 px-3 py-1.5 text-xs font-black text-[#D32F2F]" style={{ fontFamily: "'Noto Sans SC', sans-serif" }}>
            已集成到地图
          </span>
          <button
            onClick={onClose}
            className="h-11 w-11 rounded-full border border-[oklch(0.88_0.005_260)] bg-white text-2xl font-light leading-none text-[oklch(0.30_0.02_260)] shadow-sm active:scale-95"
            aria-label="关闭生活服务图层"
          >
            ‹
          </button>
        </div>
      </div>

      <p className="mt-5 text-[16px] font-medium leading-8 text-[oklch(0.36_0.02_260)]" style={{ fontFamily: "'Noto Sans SC', sans-serif" }}>
        这里先以{team.name}做交互样例。切换图层后，地图会自动聚焦{team.stadium}周边，并通过点位弹窗展示球队、场馆和周边服务信息。拖动、缩放或点击地图时，图例会自动收起，减少对地图视野的遮挡。
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        {LIFE_LAYER_OPTIONS.map((option) => {
          const isActive = option.key === activeLayer;
          return (
            <button
              key={option.key}
              onClick={() => onLayerChange(option.key)}
              className={`rounded-full border px-5 py-3 text-base font-black transition-all active:scale-95 ${
                isActive
                  ? 'border-transparent bg-[#FF4D4F] text-white shadow-[0_10px_24px_rgba(255,77,79,0.26)]'
                  : 'border-[oklch(0.88_0.005_260)] bg-white text-[oklch(0.24_0.02_260)] shadow-sm'
              }`}
              style={{ fontFamily: "'Noto Sans SC', sans-serif" }}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <div className="mt-8 rounded-[28px] border border-[oklch(0.88_0.005_260)] bg-[oklch(0.985_0.002_260)] p-5 shadow-inner">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium tracking-[0.2em] text-[oklch(0.56_0.02_260)]" style={{ fontFamily: "'Noto Sans SC', sans-serif" }}>
              {layerCopy.category}
            </p>
            <h3 className="mt-3 text-[24px] font-black leading-snug text-[oklch(0.16_0.02_260)]" style={{ fontFamily: "'Noto Serif SC', serif" }}>
              {layerCopy.title}
            </h3>
            <p className="mt-3 text-base font-black text-[#D32F2F]" style={{ fontFamily: "'Noto Sans SC', sans-serif" }}>
              {layerCopy.highlight}
            </p>
          </div>
          <div
            className="h-20 w-20 shrink-0 rounded-[22px] shadow-lg"
            style={{ background: `linear-gradient(135deg, ${team.color}, ${team.color}B8)` }}
          />
        </div>

        <p className="mt-5 text-[17px] font-medium leading-8 text-[oklch(0.34_0.02_260)]" style={{ fontFamily: "'Noto Sans SC', sans-serif" }}>
          {layerCopy.description}
        </p>

        <div className="mt-6 rounded-[22px] bg-white p-4 shadow-[0_16px_42px_rgba(15,23,42,0.07)]">
          <p className="text-[15px] font-medium leading-8 text-[oklch(0.34_0.02_260)]" style={{ fontFamily: "'Noto Sans SC', sans-serif" }}>
            交互方式：点击图层按钮切换点位；点击地图地标打开弹窗；球队与场馆层可联动右侧赛事详情面板，服务层则聚焦商家简介与观赛动线。
          </p>
        </div>
      </div>
    </div>
  );
}
