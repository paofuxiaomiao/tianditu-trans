/**
 * Stadium3D - 3D体育场展示组件
 * Design: 明亮版 - 3D透视变换 + 圆角卡片
 */

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import type { Team } from '@/data/teams';

interface Stadium3DProps {
  team: Team;
}

export default function Stadium3D({ team }: Stadium3DProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * -8, y: x * 8 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full overflow-hidden rounded-lg cursor-pointer shadow-md shadow-black/8"
      style={{ perspective: '800px' }}
    >
      <motion.div
        animate={{
          rotateX: tilt.x,
          rotateY: tilt.y,
        }}
        transition={{ type: 'spring', stiffness: 150, damping: 20 }}
        className="relative"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Loading skeleton */}
        {!imageLoaded && (
          <div className="w-full aspect-[16/9] bg-[oklch(0.94_0.005_260)] rounded-lg overflow-hidden">
            <div className="w-full h-full animate-pulse bg-gradient-to-r from-[oklch(0.94_0.005_260)] via-[oklch(0.96_0.003_260)] to-[oklch(0.94_0.005_260)]" />
          </div>
        )}
        
        <img
          src={team.stadiumImage}
          alt={`${team.stadium} 3D渲染`}
          className={`w-full aspect-[16/9] object-cover rounded-lg transition-opacity duration-500 ${
            imageLoaded ? 'opacity-100' : 'opacity-0 h-0'
          }`}
          onLoad={() => setImageLoaded(true)}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/15 rounded-lg" />
        
        {/* Shine effect on hover */}
        <div
          className="absolute inset-0 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `linear-gradient(${135 + tilt.y * 5}deg, transparent 40%, rgba(255,255,255,0.08) 50%, transparent 60%)`,
          }}
        />
        
        {/* Stadium name overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3.5">
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: team.color, boxShadow: `0 0 8px ${team.color}` }}
            />
            <span
              className="text-[10px] font-medium tracking-[0.2em] uppercase text-white/70"
              style={{ 
                fontFamily: "'DM Mono', monospace",
              }}
            >
              主场场馆
            </span>
          </div>
          <h4
            className="text-white text-base font-bold"
            style={{ fontFamily: "'Noto Serif SC', serif", textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}
          >
            {team.stadium}
          </h4>
        </div>

        {/* Corner brackets */}
        <div className="absolute top-2.5 left-2.5 w-6 h-6 border-l border-t rounded-tl-sm opacity-50" style={{ borderColor: 'rgba(255,255,255,0.5)' }} />
        <div className="absolute top-2.5 right-2.5 w-6 h-6 border-r border-t rounded-tr-sm opacity-50" style={{ borderColor: 'rgba(255,255,255,0.5)' }} />
        <div className="absolute bottom-2.5 left-2.5 w-6 h-6 border-l border-b rounded-bl-sm opacity-30" style={{ borderColor: 'rgba(255,255,255,0.3)' }} />
        <div className="absolute bottom-2.5 right-2.5 w-6 h-6 border-r border-b rounded-br-sm opacity-30" style={{ borderColor: 'rgba(255,255,255,0.3)' }} />
      </motion.div>
    </motion.div>
  );
}
