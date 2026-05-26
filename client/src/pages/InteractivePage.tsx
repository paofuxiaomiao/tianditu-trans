/**
 * InteractivePage - 湘超互动中心完整页面
 * 集成自 xiangchao-interactive 项目
 */
import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { InteractionProvider } from '@/interactive/InteractionContext';
import Navbar from '@/interactive/Navbar';
import HeroSection from '@/interactive/HeroSection';
import Dashboard from '@/interactive/Dashboard';
import MatchCenter from '@/interactive/MatchCenter';
import InteractiveCenter from '@/interactive/InteractiveCenter';
import CultureSection from '@/interactive/CultureSection';
import Leaderboard from '@/interactive/Leaderboard';
import Footer from '@/interactive/Footer';

const SECTIONS = ['hero', 'dashboard', 'matches', 'interactive', 'culture', 'leaderboard'];

export default function InteractivePage() {
  const [activeSection, setActiveSection] = useState('hero');
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3, rootMargin: '-80px 0px -40% 0px' }
    );
    SECTIONS.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const handleNavigate = useCallback((section: string) => {
    const el = document.getElementById(section);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <InteractionProvider>
      <div className="min-h-screen bg-background text-foreground overflow-x-hidden transition-colors duration-300 touch-manipulation overscroll-y-contain">
        {/* Pattern background */}
        <div
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            opacity: isDark ? 0.03 : 0.015,
            backgroundImage: isDark
              ? `radial-gradient(circle, oklch(0.58 0.22 25 / 15%) 1px, transparent 1px)`
              : `radial-gradient(circle, oklch(0.55 0.22 25 / 15%) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        <Navbar activeSection={activeSection} onNavigate={handleNavigate} />

        <main className="relative z-10">
          <HeroSection onNavigate={handleNavigate} />
          <div className={`h-[1px] bg-gradient-to-r from-transparent to-transparent ${isDark ? 'via-[oklch(1_0_0/8%)]' : 'via-[oklch(0_0_0/8%)]'}`} />
          <Dashboard />
          <div className={`h-[1px] bg-gradient-to-r from-transparent to-transparent ${isDark ? 'via-[oklch(1_0_0/8%)]' : 'via-[oklch(0_0_0/8%)]'}`} />
          <MatchCenter />
          <div className={`h-[1px] bg-gradient-to-r from-transparent to-transparent ${isDark ? 'via-[oklch(1_0_0/8%)]' : 'via-[oklch(0_0_0/8%)]'}`} />
          <InteractiveCenter />
          <div className={`h-[1px] bg-gradient-to-r from-transparent to-transparent ${isDark ? 'via-[oklch(1_0_0/8%)]' : 'via-[oklch(0_0_0/8%)]'}`} />
          <CultureSection />
          <div className={`h-[1px] bg-gradient-to-r from-transparent to-transparent ${isDark ? 'via-[oklch(1_0_0/8%)]' : 'via-[oklch(0_0_0/8%)]'}`} />
          <Leaderboard />
        </main>

        <Footer />
      </div>
    </InteractionProvider>
  );
}
