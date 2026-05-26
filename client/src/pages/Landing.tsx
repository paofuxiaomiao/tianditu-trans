/**
 * Landing - 湘超联赛介绍页面
 * Design: 「湘火燎原」国潮运动风 - 全屏沉浸式介绍页
 * 
 * Sections:
 * 1. Hero: 全屏球场背景 + 大标题 + CTA
 * 2. Stats: 赛事核心数据
 * 3. Culture: 球迷文化 + 湖南特色
 * 4. Teams: 10支队伍巡礼
 * 5. CTA: 进入地图看板
 */

import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { teams, leagueStats } from '@/data/teams';
import { MapPin, Trophy, Flame, ChevronDown, ArrowRight, Users, Timer, TrendingUp, Zap, Star, Crown } from 'lucide-react';
import TopGoals from '@/components/TopGoals';
import { assetPath, routePath } from '@/lib/sitePaths';

// CDN image URLs
const HERO_IMG = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663486523138/6NztyHB5jaNJh8ykWoD3oc/landing-hero-LFmanHYhXsky4PD5ZGP4s4.webp';
const TIANDITU_LOGO = assetPath('assets/tianditu-logo.png');
const CROWD_IMG = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663486523138/6NztyHB5jaNJh8ykWoD3oc/landing-crowd-fFJA9QH5ZrA4J5kdzVhRaD.webp';
const ACTION_IMG = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663486523138/6NztyHB5jaNJh8ykWoD3oc/landing-action-GNWSyNsvVaYp6kQGdW67Yy.webp';
const TROPHY_IMG = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663486523138/6NztyHB5jaNJh8ykWoD3oc/landing-trophy-juw6ePB9k7UFS6GB9A9hKz.webp';
const CULTURE_IMG = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663486523138/6NztyHB5jaNJh8ykWoD3oc/landing-hunan-culture-8syApEnWeXMC8qjKWYJXBz.webp';

// Animated counter hook
function useCounter(target: number, duration: number = 2000, start: boolean = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

// Intersection observer hook
function useInView(threshold = 0.3) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

export default function Landing() {
  const [, setLocation] = useLocation();
  const [heroLoaded, setHeroLoaded] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const statsSection = useInView(0.2);
  const matchCount = useCounter(leagueStats.totalMatches, 2000, statsSection.inView);
  const goalCount = useCounter(leagueStats.totalGoals, 2000, statsSection.inView);
  const cityCount = useCounter(leagueStats.cities, 1500, statsSection.inView);

  useEffect(() => {
    const img = new Image();
    img.src = HERO_IMG;
    img.onload = () => setHeroLoaded(true);
    const timer = setTimeout(() => setHeroLoaded(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleEnterMap = () => {
    setLocation(routePath('/map'));
  };

  const handleOpenModules = (view?: 'dashboard' | 'interactive' | 'culture') => {
    const base = routePath('/modules');
    setLocation(view ? `${base}?view=${view}` : base);
  };

  const handleOpenH5 = () => {
    setLocation(routePath('/h5'));
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white overflow-x-hidden touch-manipulation">
      {/* ===== HERO SECTION ===== */}
      <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background image with parallax */}
        <motion.div className="absolute inset-0" style={{ y: heroY }}>
          <div
            className="absolute inset-0 bg-cover bg-center scale-110"
            style={{ backgroundImage: `url(${HERO_IMG})` }}
          />
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#B71C1C]/30 via-transparent to-[#B71C1C]/20" />
        </motion.div>

        {/* Animated grain texture */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.5\'/%3E%3C/svg%3E")',
        }} />


        {/* Content */}
        <motion.div style={{ opacity: heroOpacity }} className="relative z-10 text-center px-6 max-w-5xl mx-auto">


          <AnimatePresence>
            {heroLoaded && (
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.45, duration: 0.8 }}
                className="mb-8 flex justify-center"
              >
                <div className="flex flex-col items-center gap-3 rounded-[28px] border border-white/18 bg-black/24 px-6 py-5 shadow-[0_18px_50px_rgba(0,0,0,0.32)] backdrop-blur-xl sm:px-8 sm:py-6">
                  <img
                    src={TIANDITU_LOGO}
                    alt="天地图·湖南"
                    className="block h-auto w-[112px] object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.30)] sm:w-[144px]"
                  />
                  <p
                    className="whitespace-nowrap text-xs font-medium tracking-[0.08em] text-white/76 sm:text-sm"
                    style={{ fontFamily: "'Noto Sans SC', sans-serif" }}
                  >
                    湖南地理信息公共服务平台
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main title */}
          <AnimatePresence>
            {heroLoaded && (
              <>
                <motion.div
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <h1 className="mb-2">
                    <span
                      className="block text-[clamp(3.5rem,10vw,8rem)] font-black leading-[0.95] tracking-tight"
                      style={{
                        fontFamily: "'Noto Serif SC', serif",
                        background: 'linear-gradient(135deg, #FFFFFF 0%, #FFD54F 40%, #FF8A65 70%, #FF5252 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textShadow: 'none',
                        filter: 'drop-shadow(0 4px 30px rgba(255,82,82,0.3))',
                      }}
                    >
                      湘超联赛
                    </span>
                  </h1>
                </motion.div>

                <motion.div
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7, duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <p
                    className="text-[clamp(1rem,2.5vw,1.5rem)] text-white/60 font-light tracking-[0.3em] mb-10"
                    style={{ fontFamily: "'Noto Sans SC', sans-serif" }}
                  >
                    湖南省足球联赛 · 数字地图看板
                  </p>
                </motion.div>

                <motion.div
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.9, duration: 1 }}
                >
                  <p
                    className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-12 leading-relaxed"
                    style={{ fontFamily: "'Noto Sans SC', sans-serif" }}
                  >
                    一场属于三湘大地的足球盛宴，14座城市的荣耀之战。
                    <br className="hidden md:block" />
                    用数字地图，探索湘超的每一寸热土。
                  </p>
                </motion.div>

                {/* CTA Button */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.2, duration: 0.8 }}
                  className="flex flex-col items-center justify-center gap-4"
                >
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                      onClick={handleEnterMap}
                      className="group relative px-10 py-4 rounded-xl text-lg font-bold tracking-wider overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95"
                      style={{ fontFamily: "'Noto Sans SC', sans-serif" }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-[#D32F2F] via-[#E53935] to-[#FF5252] group-hover:from-[#B71C1C] group-hover:via-[#D32F2F] group-hover:to-[#E53935] transition-all duration-500" />
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
                        background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.15) 0%, transparent 70%)',
                      }} />
                      <span className="relative flex items-center gap-3 text-white">
                        <MapPin className="w-5 h-5" />
                        进入数字地图看板
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </button>
                  </div>


                </motion.div>
              </>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-xs text-white/30 tracking-[0.2em]" style={{ fontFamily: "'DM Mono', monospace" }}>向下滑动</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          >
            <ChevronDown className="w-5 h-5 text-white/30" />
          </motion.div>
        </motion.div>
      </section>

      {/* ===== STATS SECTION ===== */}
      <section ref={statsSection.ref} className="relative py-14 sm:py-28 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] via-[#1A0A0A] to-[#0A0A0A]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url(${CULTURE_IMG})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }} />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
          {/* Section header */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8 sm:mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full border border-[#D32F2F]/20 bg-[#D32F2F]/5">
              <TrendingUp className="w-3.5 h-3.5 text-[#FF5252]" />
              <span className="text-xs tracking-[0.15em] text-[#FF8A80]" style={{ fontFamily: "'DM Mono', monospace" }}>赛事回顾</span>
            </div>
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 sm:mb-4"
              style={{
                fontFamily: "'Noto Serif SC', serif",
                background: 'linear-gradient(135deg, #FFFFFF 0%, #FFD54F 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              赛事回顾
            </h2>
            <p className="text-white/40 text-base sm:text-lg max-w-xl mx-auto" style={{ fontFamily: "'Noto Sans SC', sans-serif" }}>
              2024赛季湘超联赛，一组数字诠释三湘足球的火热与激情
            </p>
          </motion.div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 md:gap-8">
            {[
              { value: matchCount, suffix: '场', label: '总比赛', icon: Zap, color: '#FF5252' },
              { value: goalCount, suffix: '球', label: '总进球', icon: Star, color: '#FFD54F' },
              { value: cityCount, suffix: '城', label: '参赛城市', icon: MapPin, color: '#FF8A65' },
              { value: 0, suffix: '吸引人次 2.7亿+', label: '线上观赛人次', icon: TrendingUp, color: '#4FC3F7', isText: true },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ y: 40, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                className="relative group"
              >
                <div className="relative p-4 sm:p-6 md:p-8 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm overflow-hidden hover:border-white/10 transition-all duration-500">
                  {/* Glow effect */}
                  <div
                    className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-3xl"
                    style={{ background: stat.color }}
                  />
                  <stat.icon className="w-5 h-5 mb-4 opacity-40" style={{ color: stat.color }} />
                  <div className="relative">
                    {stat.isText ? (
                      <span
                        className="text-xl sm:text-3xl md:text-4xl font-black"
                        style={{ fontFamily: "'Bebas Neue', sans-serif", color: stat.color }}
                      >
                        {statsSection.inView ? stat.suffix : '0'}
                      </span>
                    ) : (
                      <span
                        className="text-2xl sm:text-4xl md:text-5xl font-black"
                        style={{ fontFamily: "'Bebas Neue', sans-serif", color: stat.color }}
                      >
                        {stat.value}
                        <span className="text-lg ml-1 font-normal text-white/40">{stat.suffix}</span>
                      </span>
                    )}
                    <p className="text-white/40 text-sm mt-2 tracking-wider" style={{ fontFamily: "'Noto Sans SC', sans-serif" }}>
                      {stat.label}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Additional stats row */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-10 flex flex-wrap justify-center gap-6 md:gap-10"
          >
            {[
              { label: '冠军', value: leagueStats.champion },
              { label: '最佳球员', value: leagueStats.mvp },
              { label: '最佳射手', value: leagueStats.topScorer },
              { label: '最佳门将', value: leagueStats.bestGK },
              { label: '最佳教练', value: leagueStats.bestCoach },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2.5 px-4 py-2 rounded-full border border-white/5 bg-white/[0.02]">
                <Trophy className="w-3.5 h-3.5 text-[#FFD54F]/60" />
                <span className="text-xs text-white/30" style={{ fontFamily: "'DM Mono', monospace" }}>{item.label}</span>
                <span className="text-sm font-bold text-[#FFD54F]/80" style={{ fontFamily: "'Noto Sans SC', sans-serif" }}>{item.value}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== 十佳进球展示栏 ===== */}
      <TopGoals />

      {/* ===== 2026赛季即将开启提示卡片 ===== */}
      <section className="relative py-10 sm:py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] via-[#1A0505] to-[#0A0A0A]" />
        <div className="relative z-10 max-w-3xl mx-auto px-6">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative overflow-hidden rounded-2xl border border-[#D32F2F]/20 bg-gradient-to-r from-[#D32F2F]/10 via-[#B71C1C]/5 to-[#D32F2F]/10 backdrop-blur-sm p-8 text-center"
          >
            {/* 装饰光晕 */}
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[#FF5252]/10 blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-[#FFD54F]/10 blur-3xl" />
            
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 rounded-full border border-[#FFD54F]/20 bg-[#FFD54F]/5">
                <Flame className="w-3.5 h-3.5 text-[#FFD54F]" />
                <span className="text-xs tracking-[0.15em] text-[#FFD54F]" style={{ fontFamily: "'DM Mono', monospace" }}>即将开赛</span>
              </div>
              <h3
                className="text-2xl md:text-3xl font-black mb-3"
                style={{
                  fontFamily: "'Noto Serif SC', serif",
                  background: 'linear-gradient(135deg, #FFFFFF 0%, #FFD54F 50%, #FF5252 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                2026赛季即将开启
              </h3>
              <p className="text-white/50 text-base max-w-lg mx-auto leading-relaxed" style={{ fontFamily: "'Noto Sans SC', sans-serif" }}>
                新赛季蓄势待发，更多精彩赛事敬请期待。让我们一起期待三湘足球的下一次燃烧！
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== CULTURE SECTION ===== */}
      <section className="relative py-14 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-[#0A0A0A]" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-20 items-center">
            {/* Left: Images */}
            <motion.div
              initial={{ x: -60, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="relative"
            >
              {/* Main image */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
                <img
                  src={CROWD_IMG}
                  alt="湘超球迷"
                  className="w-full aspect-[4/3] object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-white/70" />
                    <span className="text-sm text-white/70" style={{ fontFamily: "'Noto Sans SC', sans-serif" }}>
                      2.7亿线上观赛人次
                    </span>
                  </div>
                </div>
              </div>

              {/* Floating action image */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="absolute -bottom-8 -right-4 lg:-right-8 w-[55%] rounded-xl overflow-hidden shadow-2xl shadow-black/60 border-2 border-[#0A0A0A]"
              >
                <img
                  src={ACTION_IMG}
                  alt="湘超比赛"
                  className="w-full aspect-video object-cover"
                  loading="lazy"
                />
              </motion.div>
            </motion.div>

            {/* Right: Text */}
            <motion.div
              initial={{ x: 60, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="lg:pl-4"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full border border-[#D32F2F]/20 bg-[#D32F2F]/5">
                <Flame className="w-3.5 h-3.5 text-[#FF5252]" />
                <span className="text-xs tracking-[0.15em] text-[#FF8A80]" style={{ fontFamily: "'DM Mono', monospace" }}>球迷文化</span>
              </div>

              <h2
                className="text-3xl md:text-4xl font-black mb-6 leading-tight"
                style={{ fontFamily: "'Noto Serif SC', serif" }}
              >
                <span className="text-white">霸蛮精神，</span>
                <br />
                <span style={{
                  background: 'linear-gradient(135deg, #FF5252, #FFD54F)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  燃动三湘
                </span>
              </h2>

              <div className="space-y-5 text-white/50 leading-relaxed" style={{ fontFamily: "'Noto Sans SC', sans-serif" }}>
                <p>
                  湘超联赛，全称湖南省足球联赛，是一项由湖南省体育局主办的省级足球赛事。
                  2026赛季共有14支城市代表队参赛，历时112天，覆盖全省14个市州。
                </p>
                <p>
                  从长沙贺龙体育场的万人齐呼，到永州零陵的草根逆袭；从常德伢子的霸蛮拼搏，
                  到株洲动力之都的全速冲锋——每一座城市都在用足球书写属于自己的故事。
                </p>
                <p>
                  这不仅是一场体育赛事，更是一场文化盛宴。湘超带动了113.59亿元的文旅消费，
                  让足球成为连接湖南人情感的纽带。
                </p>
              </div>

              {/* Key highlights */}
              <div className="mt-8 grid grid-cols-2 gap-4">
                {[
                  { icon: Timer, label: '112天赛程', desc: '横跨春夏秋三季' },
                  { icon: Users, label: '2.7亿人次', desc: '线上观赛流量' },
                  { icon: MapPin, label: '14座城市', desc: '全省市州覆盖' },
                  { icon: Trophy, label: '永州夺冠', desc: '黑马逆袭传奇' },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <item.icon className="w-4 h-4 mt-0.5 text-[#FF5252]/60 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-white/80">{item.label}</p>
                      <p className="text-xs text-white/30">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== TEAMS SECTION ===== */}
      <section className="relative py-14 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] via-[#0D0505] to-[#0A0A0A]" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
          {/* Section header */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8 sm:mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 sm:mb-6 rounded-full border border-[#D32F2F]/20 bg-[#D32F2F]/5">
              <Star className="w-3.5 h-3.5 text-[#FFD54F]" />
              <span className="text-xs tracking-[0.15em] text-[#FF8A80]" style={{ fontFamily: "'DM Mono', monospace" }}>队伍巡礼</span>
            </div>
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 sm:mb-4"
              style={{
                fontFamily: "'Noto Serif SC', serif",
                background: 'linear-gradient(135deg, #FFFFFF 0%, #FFD54F 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              十城争霸
            </h2>
            <p className="text-white/40 text-lg max-w-xl mx-auto" style={{ fontFamily: "'Noto Sans SC', sans-serif" }}>
              十支劲旅，十座城市，一个共同的梦想
            </p>
          </motion.div>

          {/* Teams grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
            {teams.map((team, i) => (
              <motion.div
                key={team.id}
                initial={{ y: 40, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="group relative"
              >
                <div
                  className="relative p-5 rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden hover:border-white/15 transition-all duration-500 cursor-pointer"
                  onClick={handleEnterMap}
                >
                  {/* Hover glow */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                    style={{
                      background: `radial-gradient(circle at 50% 0%, ${team.color}15 0%, transparent 70%)`,
                    }}
                  />

                  {/* Rank */}
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className="text-3xl font-black opacity-20"
                      style={{ fontFamily: "'Bebas Neue', sans-serif", color: team.color }}
                    >
                      #{team.rank}
                    </span>
                    {team.rankLabel.includes('冠') && (
                      <Crown className="w-5 h-5" style={{ color: '#FFD700', filter: 'drop-shadow(0 1px 3px rgba(255,215,0,0.5))' }} />
                    )}
                    {team.rankLabel.includes('亚') && (
                      <Crown className="w-5 h-5" style={{ color: '#C0C0C0', filter: 'drop-shadow(0 1px 3px rgba(192,192,192,0.5))' }} />
                    )}
                    {team.rankLabel.includes('季') && (
                      <Crown className="w-5 h-5" style={{ color: '#CD7F32', filter: 'drop-shadow(0 1px 3px rgba(205,127,50,0.5))' }} />
                    )}
                  </div>

                  {/* Team color dot + name */}
                  <div className="flex items-center gap-2.5 mb-2">
                    <div
                      className="w-3 h-3 rounded-full ring-2 ring-white/10"
                      style={{ backgroundColor: team.color }}
                    />
                    <h3
                      className="text-lg font-black text-white group-hover:text-white transition-colors"
                      style={{ fontFamily: "'Noto Serif SC', serif" }}
                    >
                      {team.name}
                    </h3>
                  </div>

                  {/* City */}
                  <p className="text-xs text-white/30 mb-3" style={{ fontFamily: "'Noto Sans SC', sans-serif" }}>
                    {team.city}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-3 text-xs text-white/40" style={{ fontFamily: "'DM Mono', monospace" }}>
                    <span>{team.stats.points}<span className="text-white/20">pts</span></span>
                    <span className="text-white/10">|</span>
                    <span>{team.stats.won}W {team.stats.drawn}D {team.stats.lost}L</span>
                  </div>

                  {/* Bottom accent line */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `linear-gradient(90deg, transparent, ${team.color}, transparent)` }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CULTURE BANNER ===== */}
      <section className="relative py-12 sm:py-20 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={CULTURE_IMG}
            alt="湖南文化"
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h3
              className="text-2xl md:text-3xl font-black mb-4 text-white"
              style={{ fontFamily: "'Noto Serif SC', serif" }}
            >
              足球 × 湖湘文化
            </h3>
            <p className="text-white/50 text-lg leading-relaxed mb-8 max-w-2xl mx-auto" style={{ fontFamily: "'Noto Sans SC', sans-serif" }}>
              每一支队伍的队徽都融入了当地非遗文化元素——永州的"走"字、邵阳的宝庆竹刻、
              株洲的火车头、岳阳的洞庭水纹……足球与文化在这里交融，传统与现代在这里碰撞。
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {['非遗队徽', '城市文化', '草根精神', '全民足球', '文旅融合'].map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-1.5 rounded-full text-sm border border-white/10 text-white/60 bg-white/5"
                  style={{ fontFamily: "'Noto Sans SC', sans-serif" }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== FINAL CTA SECTION ===== */}
      <section className="relative py-16 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] via-[#1A0505] to-[#0A0A0A]" />
        
        {/* Trophy floating image */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          whileInView={{ y: 0, opacity: 0.15 }}
          viewport={{ once: true }}
          className="absolute right-0 top-0 bottom-0 w-1/3 hidden lg:block"
        >
          <img
            src={TROPHY_IMG}
            alt=""
            className="w-full h-full object-contain object-right"
            loading="lazy"
          />
        </motion.div>

        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <h2
              className="text-3xl sm:text-4xl md:text-6xl font-black mb-4 sm:mb-6 leading-tight"
              style={{
                fontFamily: "'Noto Serif SC', serif",
                background: 'linear-gradient(135deg, #FFFFFF 0%, #FFD54F 50%, #FF5252 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              探索湘超地图
            </h2>
            <p className="text-white/40 text-base sm:text-lg mb-6 sm:mb-10 max-w-xl mx-auto" style={{ fontFamily: "'Noto Sans SC', sans-serif" }}>
              点击进入数字地图看板，查看每支队伍的详细数据、
              3D实景体育场、卫星影像，感受湘超的每一寸热土。
            </p>

            <button
              onClick={handleEnterMap}
              className="group relative px-8 sm:px-12 py-4 sm:py-5 rounded-2xl text-lg sm:text-xl font-bold tracking-wider overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 shadow-2xl shadow-[#D32F2F]/20"
              style={{ fontFamily: "'Noto Sans SC', sans-serif" }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#B71C1C] via-[#D32F2F] to-[#E53935]" />
              <div className="absolute inset-[1px] rounded-[15px] bg-gradient-to-r from-[#C62828] via-[#D32F2F] to-[#E53935]" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
                background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 70%)',
              }} />
              <span className="relative flex items-center gap-3 text-white">
                <MapPin className="w-6 h-6" />
                进入数字地图看板
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
              </span>
            </button>

            <p className="mt-6 text-xs text-white/20" style={{ fontFamily: "'DM Mono', monospace" }}>
              GIS · 3D SATELLITE · REAL-TIME DATA
            </p>
          </motion.div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="relative py-8 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Flame className="w-4 h-4 text-[#D32F2F]/40" />
            <span className="text-xs text-white/20" style={{ fontFamily: "'Noto Sans SC', sans-serif" }}>
              湘超联赛 · 数字地图看板
            </span>
          </div>
          <span className="text-xs text-white/15" style={{ fontFamily: "'DM Mono', monospace" }}>
            2026 湘超联赛 · 数字地图看板
          </span>
        </div>
      </footer>
    </div>
  );
}
