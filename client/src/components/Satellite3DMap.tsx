/**
 * Satellite3DMap - 3D实景卫星地图组件（精美体育场渲染图 + 卫星影像 + 3D建筑）
 * Design: MapLibre GL JS + 卫星影像 + 3D地形 + 3D建筑物 + 精美体育场渲染图浮动展示
 * 
 * 视觉层次：
 * 1. Sentinel-2 卫星影像底图
 * 2. AWS Terrain 3D地形
 * 3. OpenFreeMap 3D建筑物（fill-extrusion）
 * 4. 精美AI渲染体育场浮动卡片
 * 5. 队伍标记 + 体育场标注
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { motion, AnimatePresence } from 'framer-motion';
import type { Team } from '@/data/teams';
import { STADIUM_RENDERS } from '@/data/teams';

interface Satellite3DMapProps {
  team: Team;
  onClose: () => void;
}

// Stadium coordinates for each team
const STADIUM_COORDS: Record<string, [number, number]> = {
  changsha: [112.9836, 28.1926],
  yongzhou: [111.6130, 26.4200],
  changde: [111.6880, 29.0460],
  zhuzhou: [113.1340, 27.8270],
  loudi: [112.0050, 27.7280],
  hengyang: [112.5720, 26.8850],
  chenzhou: [113.0150, 25.7700],
  yueyang: [113.1280, 29.3650],
  yiyang: [112.3550, 28.5530],
  shaoyang: [111.4720, 27.2380],
};

export default function Satellite3DMap({ team, onClose }: Satellite3DMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [loading, setLoading] = useState(true);
  const [buildingsEnabled, setBuildingsEnabled] = useState(true);
  const [showStadiumCard, setShowStadiumCard] = useState(false);
  const [stadiumImageLoaded, setStadiumImageLoaded] = useState(false);
  const [isOrbiting, setIsOrbiting] = useState(false);
  const orbitRef = useRef<number | null>(null);

  const stadiumCoords = STADIUM_COORDS[team.id] || [team.lng, team.lat];
  const stadiumRenderUrl = STADIUM_RENDERS[team.id];

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      zoom: 15.5,
      center: stadiumCoords,
      pitch: 60,
      bearing: -30,
      maxPitch: 85,
      canvasContextAttributes: { antialias: true },
      style: {
        version: 8,
        name: 'Satellite + 3D Buildings',
        sources: {
          satellite: {
            type: 'raster',
            tiles: [
              'https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2020_3857/default/g/{z}/{y}/{x}.jpg',
            ],
            tileSize: 256,
            attribution: '&copy; EOX IT Services GmbH - Sentinel-2',
          },
          terrainSource: {
            type: 'raster-dem',
            tiles: [
              'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png',
            ],
            encoding: 'terrarium',
            tileSize: 256,
            maxzoom: 15,
          },
          hillshadeSource: {
            type: 'raster-dem',
            tiles: [
              'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png',
            ],
            encoding: 'terrarium',
            tileSize: 256,
            maxzoom: 15,
          },
        },
        layers: [
          {
            id: 'satellite-layer',
            type: 'raster',
            source: 'satellite',
            paint: {
              'raster-opacity': 1,
              'raster-saturation': 0.15,
              'raster-contrast': 0.08,
              'raster-brightness-min': 0.05,
            },
          },
          {
            id: 'hillshade',
            type: 'hillshade',
            source: 'hillshadeSource',
            paint: {
              'hillshade-shadow-color': '#3a3520',
              'hillshade-illumination-direction': 315,
              'hillshade-exaggeration': 0.4,
            },
          },
        ],
        terrain: {
          source: 'terrainSource',
          exaggeration: 1.5,
        },
        sky: {},
      },
    });

    // Navigation controls
    map.addControl(
      new maplibregl.NavigationControl({
        visualizePitch: true,
        showZoom: true,
        showCompass: true,
      }),
      'bottom-right'
    );

    map.on('load', () => {
      // Add OpenFreeMap for 3D buildings
      map.addSource('openfreemap', {
        url: 'https://tiles.openfreemap.org/planet',
        type: 'vector',
      });

      // 3D buildings layer
      map.addLayer({
        id: '3d-buildings',
        source: 'openfreemap',
        'source-layer': 'building',
        type: 'fill-extrusion',
        minzoom: 13,
        filter: ['!=', ['get', 'hide_3d'], true],
        paint: {
          'fill-extrusion-color': [
            'interpolate', ['linear'], ['get', 'render_height'],
            0, '#E8E0D8',
            10, '#D4C8BC',
            30, '#C0B4A8',
            60, '#AAA0A0',
            100, '#9090A0',
            200, '#8080B0',
          ],
          'fill-extrusion-height': [
            'interpolate', ['linear'], ['zoom'],
            13, 0,
            14.5, ['get', 'render_height'],
          ],
          'fill-extrusion-base': [
            'case',
            ['>=', ['get', 'zoom'], 16],
            ['get', 'render_min_height'],
            0,
          ],
          'fill-extrusion-opacity': 0.85,
        },
      });

      // Stadium glow highlight on map
      map.addSource('stadium-highlight', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: stadiumCoords },
          properties: { name: team.stadium },
        },
      });

      map.addLayer({
        id: 'stadium-glow',
        type: 'circle',
        source: 'stadium-highlight',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 13, 15, 16, 50, 18, 100],
          'circle-color': team.color,
          'circle-opacity': 0.2,
          'circle-blur': 1,
        },
      });

      map.addLayer({
        id: 'stadium-pulse',
        type: 'circle',
        source: 'stadium-highlight',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 13, 8, 16, 25, 18, 40],
          'circle-color': team.color,
          'circle-opacity': 0.4,
          'circle-stroke-width': 3,
          'circle-stroke-color': '#ffffff',
          'circle-stroke-opacity': 0.6,
        },
      });

      setLoading(false);

      // Camera animation after load
      setTimeout(() => {
        map.easeTo({
          pitch: 65,
          bearing: 40,
          zoom: 16,
          duration: 3000,
          easing: (t: number) => t * (2 - t),
        });
        // Show stadium card after camera settles
        setTimeout(() => setShowStadiumCard(true), 2500);
      }, 800);
    });

    map.on('idle', () => setLoading(false));

    // Team marker
    const markerEl = document.createElement('div');
    markerEl.innerHTML = `
      <div style="
        display: flex; flex-direction: column; align-items: center;
        filter: drop-shadow(0 4px 16px rgba(0,0,0,0.5));
      ">
        <div style="
          background: linear-gradient(135deg, ${team.color}, ${team.color}DD);
          color: white; padding: 8px 16px; border-radius: 10px;
          font-family: 'Noto Serif SC', serif; font-weight: 900;
          font-size: 16px; letter-spacing: 3px;
          border: 2.5px solid rgba(255,255,255,0.7);
          white-space: nowrap; box-shadow: 0 4px 20px ${team.color}60;
        ">${team.fullName}</div>
        <div style="width:0;height:0;border-left:9px solid transparent;border-right:9px solid transparent;border-top:12px solid ${team.color};margin-top:-1px;"></div>
      </div>
    `;
    new maplibregl.Marker({ element: markerEl, anchor: 'bottom' })
      .setLngLat([team.lng, team.lat])
      .addTo(map);

    // Stadium location marker
    const stadiumEl = document.createElement('div');
    stadiumEl.innerHTML = `
      <div style="
        width: 20px; height: 20px; border-radius: 50%;
        background: ${team.color}; border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        animation: stadiumPulse 2s ease-in-out infinite;
      "></div>
    `;
    new maplibregl.Marker({ element: stadiumEl, anchor: 'center' })
      .setLngLat(stadiumCoords)
      .addTo(map);

    const loadTimeout = setTimeout(() => setLoading(false), 10000);
    mapRef.current = map;

    return () => {
      clearTimeout(loadTimeout);
      if (orbitRef.current) cancelAnimationFrame(orbitRef.current);
      map.remove();
      mapRef.current = null;
    };
  }, [team]);

  const handleToggleBuildings = useCallback(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const newState = !buildingsEnabled;
    if (map.getLayer('3d-buildings')) {
      map.setLayoutProperty('3d-buildings', 'visibility', newState ? 'visible' : 'none');
    }
    setBuildingsEnabled(newState);
  }, [buildingsEnabled]);

  const handleResetCamera = useCallback(() => {
    if (!mapRef.current) return;
    if (orbitRef.current) {
      cancelAnimationFrame(orbitRef.current);
      orbitRef.current = null;
      setIsOrbiting(false);
    }
    mapRef.current.easeTo({
      center: stadiumCoords,
      zoom: 16,
      pitch: 65,
      bearing: 40,
      duration: 1500,
    });
    setShowStadiumCard(true);
  }, [stadiumCoords]);

  const handleFlyToStadium = useCallback(() => {
    if (!mapRef.current) return;
    if (orbitRef.current) {
      cancelAnimationFrame(orbitRef.current);
      orbitRef.current = null;
      setIsOrbiting(false);
    }
    mapRef.current.flyTo({
      center: stadiumCoords,
      zoom: 17.5,
      pitch: 72,
      bearing: 60,
      duration: 2500,
      essential: true,
    });
    setShowStadiumCard(true);
  }, [stadiumCoords]);

  // Orbit animation around stadium
  const handleOrbitStadium = useCallback(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    if (isOrbiting) {
      if (orbitRef.current) cancelAnimationFrame(orbitRef.current);
      orbitRef.current = null;
      setIsOrbiting(false);
      return;
    }

    setIsOrbiting(true);
    setShowStadiumCard(false);

    // First fly close
    map.flyTo({
      center: stadiumCoords,
      zoom: 17,
      pitch: 70,
      duration: 1500,
    });

    // Then start orbiting
    setTimeout(() => {
      const duration = 30000;
      const startTime = performance.now();
      const startBearing = map.getBearing();

      function orbit(time: number) {
        if (!mapRef.current) return;
        const elapsed = time - startTime;
        const progress = elapsed / duration;

        if (progress < 1) {
          const currentBearing = startBearing + progress * 360;
          map.setBearing(currentBearing);
          orbitRef.current = requestAnimationFrame(orbit);
        } else {
          setIsOrbiting(false);
          setShowStadiumCard(true);
        }
      }

      orbitRef.current = requestAnimationFrame(orbit);
    }, 1600);
  }, [stadiumCoords, isOrbiting]);

  return (
    <div className="absolute inset-0 z-[800]">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-[oklch(0.12_0.01_260)] flex items-center justify-center z-10">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 border-3 border-white/10 rounded-full" />
              <div className="absolute inset-0 border-3 border-transparent border-t-[#D32F2F] rounded-full animate-spin" />
              <div className="absolute inset-2 border-2 border-transparent border-b-white/30 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
            </div>
            <p className="mt-5 text-sm text-white/80 font-medium" style={{ fontFamily: "'Noto Sans SC', sans-serif" }}>
              正在加载3D实景...
            </p>
            <p className="mt-1.5 text-[11px] text-white/40 tracking-wider" style={{ fontFamily: "'DM Mono', monospace" }}>
              卫星影像 · 3D地形 · 建筑
            </p>
          </div>
        </div>
      )}

      {/* Top bar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-3 bg-white/92 backdrop-blur-xl rounded-2xl px-5 py-3 shadow-xl shadow-black/15 border border-white/60 pointer-events-auto">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-black text-[11px] shrink-0"
            style={{
              background: `linear-gradient(135deg, ${team.color}, ${team.color}CC)`,
              fontFamily: "'Noto Serif SC', serif",
              boxShadow: `0 2px 8px ${team.color}40`,
            }}
          >
            {team.name}
          </div>
          <div>
            <h3 className="text-sm font-bold text-[oklch(0.18_0.02_260)]" style={{ fontFamily: "'Noto Sans SC', sans-serif" }}>
              {team.fullName} · 3D实景
            </h3>
            <p className="text-[10px] text-[oklch(0.50_0.02_260)] mt-0.5" style={{ fontFamily: "'DM Mono', monospace" }}>
              {team.stadium} · 卫星影像 + 3D建筑
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="bg-white/92 backdrop-blur-xl hover:bg-white text-[oklch(0.35_0.02_260)] hover:text-[#D32F2F] w-11 h-11 rounded-2xl flex items-center justify-center shadow-xl shadow-black/15 border border-white/60 transition-all hover:scale-105 active:scale-95 pointer-events-auto"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Floating Stadium Render Card */}
      <AnimatePresence>
        {showStadiumCard && stadiumRenderUrl && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-20 left-4 z-20 w-[380px] max-w-[calc(100%-2rem)]"
          >
            <div className="bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl shadow-black/20 border border-white/70 overflow-hidden">
              {/* Stadium Image */}
              <div className="relative aspect-[16/9] overflow-hidden group">
                {!stadiumImageLoaded && (
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-300 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                )}
                <img
                  src={stadiumRenderUrl}
                  alt={team.stadium}
                  className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${stadiumImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={() => setStadiumImageLoaded(true)}
                />
                {/* Gradient overlay at bottom */}
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
                {/* Stadium name badge */}
                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                  <div>
                    <h4 className="text-white font-black text-base drop-shadow-lg" style={{ fontFamily: "'Noto Serif SC', serif", letterSpacing: '2px' }}>
                      {team.stadium}
                    </h4>
                    <p className="text-white/80 text-[10px] mt-0.5 drop-shadow" style={{ fontFamily: "'DM Mono', monospace" }}>
                      3D场馆渲染图
                    </p>
                  </div>
                  <div
                    className="px-2.5 py-1 rounded-lg text-white text-[10px] font-bold tracking-wider"
                    style={{ background: `linear-gradient(135deg, ${team.color}, ${team.color}CC)` }}
                  >
                    {team.name}
                  </div>
                </div>
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </div>

              {/* Stadium Info */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: team.color }}
                  />
                  <span className="text-xs font-bold text-[oklch(0.25_0.02_260)]" style={{ fontFamily: "'Noto Sans SC', sans-serif" }}>
                    {team.fullName} 主场
                  </span>
                  <span className="text-[10px] text-[oklch(0.55_0.02_260)] ml-auto" style={{ fontFamily: "'DM Mono', monospace" }}>
                    {team.city}
                  </span>
                </div>

                {/* Quick stats */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: '排名', value: `#${team.rank}` },
                    { label: '积分', value: team.stats.points },
                    { label: '进球', value: team.stats.goalsFor },
                    { label: '净胜', value: team.stats.goalDiff > 0 ? `+${team.stats.goalDiff}` : team.stats.goalDiff },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center py-2 rounded-lg bg-[oklch(0.97_0.005_260)]">
                      <div className="text-sm font-black" style={{ color: team.color, fontFamily: "'DM Mono', monospace" }}>
                        {stat.value}
                      </div>
                      <div className="text-[9px] text-[oklch(0.55_0.02_260)] mt-0.5" style={{ fontFamily: "'Noto Sans SC', sans-serif" }}>
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Close card button */}
                <button
                  onClick={() => setShowStadiumCard(false)}
                  className="mt-3 w-full py-2 rounded-lg text-[11px] font-semibold text-[oklch(0.50_0.02_260)] hover:text-[oklch(0.30_0.02_260)] bg-[oklch(0.97_0.005_260)] hover:bg-[oklch(0.94_0.005_260)] transition-colors"
                  style={{ fontFamily: "'Noto Sans SC', sans-serif" }}
                >
                  收起卡片
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Show stadium card button (when card is hidden) */}
      {!showStadiumCard && !loading && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => setShowStadiumCard(true)}
          className="absolute top-20 left-4 z-20 bg-white/92 backdrop-blur-xl rounded-2xl px-4 py-3 shadow-xl shadow-black/15 border border-white/60 hover:bg-white transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
        >
          <span className="text-base">🏟️</span>
          <span className="text-xs font-bold text-[oklch(0.25_0.02_260)]" style={{ fontFamily: "'Noto Sans SC', sans-serif" }}>
            查看体育场
          </span>
        </motion.button>
      )}

      {/* Bottom controls */}
      <div className="absolute bottom-6 left-4 z-10 flex items-center gap-2.5 flex-wrap">
        {/* Fly to stadium */}
        <button
          onClick={handleFlyToStadium}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-[#D32F2F] to-[#E53935] text-white border border-white/20 shadow-lg shadow-[#D32F2F]/25 hover:shadow-xl hover:from-[#C62828] hover:to-[#D32F2F] transition-all active:scale-95"
          style={{ fontFamily: "'Noto Sans SC', sans-serif" }}
        >
          <span className="text-base">🏟️</span>
          飞往体育场
        </button>

        {/* Orbit */}
        <button
          onClick={handleOrbitStadium}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border shadow-lg transition-all active:scale-95 ${
            isOrbiting
              ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white border-white/20 shadow-amber-500/30'
              : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-white/20 shadow-amber-500/25 hover:shadow-xl'
          }`}
          style={{ fontFamily: "'Noto Sans SC', sans-serif" }}
        >
          <svg className={`w-4 h-4 ${isOrbiting ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {isOrbiting ? '停止环绕' : '环绕飞行'}
        </button>

        {/* Toggle buildings */}
        <button
          onClick={handleToggleBuildings}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg border active:scale-95 ${
            buildingsEnabled
              ? 'bg-[oklch(0.25_0.02_260)] text-white border-white/15 shadow-black/20'
              : 'bg-white/92 backdrop-blur-xl text-[oklch(0.35_0.02_260)] border-white/60 shadow-black/10'
          }`}
          style={{ fontFamily: "'Noto Sans SC', sans-serif" }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          {buildingsEnabled ? '3D建筑 开' : '3D建筑 关'}
        </button>

        {/* Reset */}
        <button
          onClick={handleResetCamera}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-white/92 backdrop-blur-xl text-[oklch(0.35_0.02_260)] border border-white/60 shadow-lg shadow-black/10 hover:bg-white transition-all active:scale-95"
          style={{ fontFamily: "'Noto Sans SC', sans-serif" }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          重置视角
        </button>
      </div>

      {/* Info badge */}
      <div className="absolute bottom-6 right-24 z-10">
        <div className="bg-black/50 backdrop-blur-md rounded-lg px-3 py-1.5 text-[10px] text-white/70 shadow-md border border-white/10" style={{ fontFamily: "'DM Mono', monospace" }}>
          Sentinel-2 · OpenFreeMap · 3D Terrain
        </div>
      </div>

      <style>{`
        @keyframes stadiumPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 ${team.color}60; }
          50% { transform: scale(1.2); box-shadow: 0 0 0 12px ${team.color}00; }
        }
      `}</style>
    </div>
  );
}
