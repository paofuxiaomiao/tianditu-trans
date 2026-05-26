/**
 * HunanMap - 湘超数字地图看板 · 湖南省GIS地图组件
 * Design: 中文底图 + 市级区域填色 + 湖南轮廓凸显 + 省外遮罩
 *
 * 视觉层次（从底到顶）：
 * 1. 天地图矢量底图 + 中文注记瓦片
 * 2. 省外灰色遮罩（突出湖南）
 * 3. 市级行政区划填色（队伍主题色）
 * 4. 湖南省轮廓粗边界线
 * 5. 市级边界细线
 * 6. 队伍标记点
 * 7. 长沙服务图层示例（球队 / 场馆 / 餐饮 / 住宿 / 停车 / 湘菜）
 */

import { useCallback, useEffect, useMemo, useRef, useState, type SyntheticEvent } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { AnimatePresence, motion } from 'framer-motion';
import { Building2, CarFront, ChevronLeft, ChevronRight, MapPinned, Soup, Store, Trophy } from 'lucide-react';
import { teams, type Team, HUNAN_CENTER } from '@/data/teams';
import { featureTeams, h5LayerOptions, h5Pois, type H5Poi, type PoiLayer } from '@/data/feature-data';
import { assetPath } from '@/lib/sitePaths';
import Satellite3DMap from './Satellite3DMap';
import { useIsMobile } from '@/hooks/useMobile';

// CDN URLs for GeoJSON data
const CITIES_GEOJSON_URL = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663486523138/6NztyHB5jaNJh8ykWoD3oc/hunan_cities_final_02aa81a8.json';
const OUTLINE_GEOJSON_URL = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663486523138/6NztyHB5jaNJh8ykWoD3oc/hunan_outline_final_a33c1dbf.json';

export type MapTransitionMode =
  | 'ripple'
  | 'ink'
  | 'blend'
  | 'relief'
  | 'rippleCity'
  | 'rippleFlame'
  | 'mirror'
  | 'fireVein'
  | 'silk'
  | 'scroll';

interface HunanMapProps {
  onTeamSelect: (team: Team | null) => void;
  selectedTeam: Team | null;
  show3D: boolean;
  onToggle3D: () => void;
  onResetView: () => void;
  resetViewSignal?: number;
  transitionMode?: MapTransitionMode;
}

// City name to team mapping
const cityTeamMap: Record<string, Team | undefined> = {};
teams.forEach((team) => {
  cityTeamMap[team.city] = team;
});

// Default colors for cities without teams
const DEFAULT_CITY_COLOR = '#E8E0D8';
const DEFAULT_CITY_BORDER = '#C5B9AD';

const CHANGSHA_TEAM = teams.find((team) => team.id === 'changsha') as Team;
const CHANGSHA_FEATURE = featureTeams.find((team) => team.id === 'changsha');
const CHANGSHA_DEMO_CENTER: [number, number] = [28.226, 112.978];
const HUNAN_OVERVIEW_BOUNDS = L.latLngBounds([24.62, 108.47], [30.08, 114.25]);
const CHANGSHA_DEMO_POIS = h5Pois.filter((poi) => poi.city === '长沙');
const TIANDITU_TOKEN = import.meta.env.VITE_TIANDITU_TOKEN ?? '';
const TIANDITU_SUBDOMAINS = ['0', '1', '2', '3', '4', '5', '6', '7'];
const FALLBACK_BASE_TILE_URL = 'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}';
const MAP_SWITCH_ASSET_VERSION = '20260526-smooth-2';
const mapSwitchAssetUrl = (fileName: string) => `${assetPath(`assets/${fileName}`)}?v=${MAP_SWITCH_ASSET_VERSION}`;
const MAP_SWITCH_PHOENIX_IMAGE_URL = mapSwitchAssetUrl('map-transition-phoenix-cutout.png');
const MAP_SWITCH_SOFT_IMAGE_URL = mapSwitchAssetUrl('map-transition-soft-cutout.png');
const MAP_SWITCH_SOFT_CLEAN_IMAGE_URL = mapSwitchAssetUrl('map-transition-soft-clean-cutout.png');
const MAP_SWITCH_SOFT_FLAME_IMAGE_URL = mapSwitchAssetUrl('map-transition-soft-flame-cutout.png');
const MAP_SWITCH_SOFT_RELIEF_IMAGE_URL = MAP_SWITCH_SOFT_CLEAN_IMAGE_URL;
const MAP_SWITCH_ANCIENT_IMAGE_URL = mapSwitchAssetUrl('map-transition-ancient-cutout.png');

type MapSwitchPoint = { x: number; y: number };
type MapSwitchNode = MapSwitchPoint & { id: string; delay: number };
type MapSwitchFrame = {
  left: number;
  top: number;
  width: number;
  height: number;
  impact: MapSwitchPoint;
  nodes: MapSwitchNode[];
};

const MAP_SWITCH_ASSET = {
  width: 1000,
  height: 880,
  aspect: 1000 / 880,
  visible: { x: 0.136, y: 0.021, width: 0.728, height: 0.959 },
  eye: { x: 67.0, y: 21.1 },
  changsha: { x: 68.6, y: 35.7 },
};

const MAP_SWITCH_FALLBACK_NODES: MapSwitchNode[] = [
  { id: 'changde', x: 55.0, y: 29.0, delay: 0.00 },
  { id: 'yueyang', x: 69.0, y: 24.8, delay: 0.06 },
  { id: 'yiyang', x: 61.4, y: 35.2, delay: 0.12 },
  { id: 'loudi', x: 57.8, y: 47.0, delay: 0.18 },
  { id: 'zhuzhou', x: 70.4, y: 43.8, delay: 0.24 },
  { id: 'hengyang', x: 56.8, y: 53.4, delay: 0.30 },
  { id: 'yongzhou', x: 53.6, y: 64.2, delay: 0.36 },
  { id: 'chenzhou', x: 67.6, y: 74.0, delay: 0.42 },
];
const MAP_SWITCH_HALO_GRADIENT = [
  'radial-gradient(circle, rgba(255,255,255,0.98) 0%, rgba(255,244,194,0.92) 9%, rgba(255,201,83,0.50) 22%, rgba(255,144,46,0.20) 42%, rgba(255,144,46,0) 68%)',
  'repeating-radial-gradient(circle, rgba(255,237,156,0.62) 0 2px, rgba(255,237,156,0.08) 2px 10px, transparent 10px 22px)',
].join(', ');
const MAP_SWITCH_AURA_MASK = 'radial-gradient(circle, transparent 0%, transparent 28%, black 42%, black 64%, transparent 76%)';
const MAP_SWITCH_SMOOTH_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const MAP_SWITCH_REVEAL_RADII = [0, 2, 7, 17, 34, 58, 92, 132];
const MAP_SWITCH_REVEAL_TIMES = [0, 0.08, 0.18, 0.32, 0.48, 0.64, 0.82, 1];

function getOverviewFitOptions(isMobile: boolean) {
  return {
    paddingTopLeft: isMobile ? ([24, 86] as L.PointTuple) : ([72, 72] as L.PointTuple),
    paddingBottomRight: isMobile ? ([24, 330] as L.PointTuple) : ([72, 104] as L.PointTuple),
    maxZoom: isMobile ? 6.55 : 7.55,
  };
}

const LAYER_META: Record<PoiLayer, { label: string; hint: string }> = {
  team: { label: '球队', hint: '查看长沙队信息与球队位置' },
  stadium: { label: '场馆', hint: '查看贺龙体育场位置与场馆说明' },
  food: { label: '餐饮', hint: '赛前赛后可停留的球迷餐饮点' },
  hotel: { label: '住宿', hint: '适合观赛人群的住宿配套点' },
  parking: { label: '停车', hint: '比赛日停车建议与停靠点' },
  cuisine: { label: '湘菜', hint: '结合观赛路线的长沙湘菜体验点' },
};

function tiandituTileUrl(layer: 'vec_w' | 'cva_w') {
  const tk = TIANDITU_TOKEN ? `&tk=${encodeURIComponent(TIANDITU_TOKEN)}` : '';
  return `https://t{s}.tianditu.gov.cn/DataServer?T=${layer}&x={x}&y={y}&l={z}${tk}`;
}

function clampPercent(value: number) {
  return Math.max(-18, Math.min(118, value));
}

function hideBrokenMapSwitchImage(event: SyntheticEvent<HTMLImageElement>) {
  event.currentTarget.style.display = 'none';
}

function MapSwitchImpactGlow({ point }: { point: MapSwitchPoint }) {
  return (
    <>
      <motion.div
        initial={{ x: '-50%', y: '-50%', opacity: 0, scale: 0.2, filter: 'blur(10px)' }}
        animate={{
          opacity: [0, 0.78, 0.48, 0.18, 0],
          scale: [0.12, 0.42, 1.05, 2.05, 4.55],
          filter: ['blur(14px)', 'blur(5px)', 'blur(9px)', 'blur(20px)', 'blur(30px)'],
        }}
        transition={{ delay: 3.0, duration: 5.7, ease: MAP_SWITCH_SMOOTH_EASE }}
        className="absolute aspect-square w-[clamp(132px,22vw,280px)] rounded-full"
        style={{
          left: `${point.x}%`,
          top: `${point.y}%`,
          transform: 'translate(-50%, -50%)',
          background: MAP_SWITCH_HALO_GRADIENT,
          mixBlendMode: 'normal',
          filter: 'drop-shadow(0 0 20px rgba(255,213,92,0.64))',
        }}
      />

      <motion.div
        initial={{ x: '-50%', y: '-50%', opacity: 0, scale: 0.22, rotate: -18 }}
        animate={{
          opacity: [0, 0.72, 0.58, 0.3, 0],
          scale: [0.12, 0.5, 1.18, 2.45, 4.95],
          rotate: [-18, -4, 14, 34, 58],
        }}
        transition={{ delay: 3.04, duration: 5.9, ease: MAP_SWITCH_SMOOTH_EASE }}
        className="absolute aspect-square w-[clamp(148px,25vw,320px)] rounded-full"
        style={{
          left: `${point.x}%`,
          top: `${point.y}%`,
          transform: 'translate(-50%, -50%)',
          background: 'conic-gradient(from -36deg, transparent 0deg, rgba(255,255,255,0.84) 34deg, rgba(255,192,67,0.44) 70deg, transparent 124deg, rgba(255,236,168,0.38) 212deg, transparent 284deg)',
          maskImage: MAP_SWITCH_AURA_MASK,
          WebkitMaskImage: MAP_SWITCH_AURA_MASK,
          mixBlendMode: 'normal',
          filter: 'blur(0.6px) drop-shadow(0 0 18px rgba(255,218,110,0.62))',
        }}
      />

      {[0, 1, 2].map((ring) => (
        <motion.div
          key={ring}
          initial={{ x: '-50%', y: '-50%', opacity: 0, scale: 0.14 }}
          animate={{
            opacity: [0, 0.76 - ring * 0.1, 0.34, 0],
            scale: [0.12, 0.82 + ring * 0.26, 1.92 + ring * 0.5, 4.75 + ring * 0.86],
          }}
          transition={{ delay: 3.14 + ring * 0.38, duration: 4.55, ease: 'easeOut' }}
          className="absolute aspect-square w-[clamp(82px,13vw,168px)] rounded-full"
          style={{
            left: `${point.x}%`,
            top: `${point.y}%`,
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, transparent 0%, transparent 52%, rgba(255,255,255,0.95) 53%, rgba(255,226,128,0.78) 57%, rgba(255,186,73,0.18) 64%, transparent 70%)',
            mixBlendMode: 'normal',
            filter: 'drop-shadow(0 0 18px rgba(255,224,128,0.76))',
          }}
        />
      ))}

      <motion.div
        initial={{ x: '-50%', y: '-50%', opacity: 0, scale: 0.45 }}
        animate={{
          opacity: [0, 1, 0.86, 0],
          scale: [0.45, 1.08, 0.92, 0.65],
        }}
        transition={{ delay: 2.74, duration: 1.45, ease: MAP_SWITCH_SMOOTH_EASE }}
        className="absolute h-12 w-12 rounded-full"
        style={{
          left: `${point.x}%`,
          top: `${point.y}%`,
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, #fff 0%, #FFF2B3 28%, rgba(255,188,64,0.55) 58%, transparent 72%)',
          mixBlendMode: 'normal',
          filter: 'drop-shadow(0 0 18px rgba(255,235,162,0.92))',
        }}
      />
    </>
  );
}

function MapSwitchRevealLayer({
  src,
  point,
  delay,
  duration,
  opacity,
  blur = false,
}: {
  src: string;
  point: MapSwitchPoint;
  delay: number;
  duration: number;
  opacity: number[];
  blur?: boolean;
}) {
  const clipPath = MAP_SWITCH_REVEAL_RADII.map((radius) => `circle(${radius}% at ${point.x}% ${point.y}%)`);

  return (
    <motion.img
      src={src}
      alt=""
      initial={{
        opacity: 0,
        clipPath: clipPath[0],
        filter: blur ? 'blur(10px) saturate(1.08)' : 'blur(0px) saturate(1.02)',
      }}
      animate={{
        opacity,
        clipPath,
        filter: blur
          ? ['blur(12px) saturate(1.12)', 'blur(9px) saturate(1.08)', 'blur(5px) saturate(1.03)', 'blur(1px) saturate(1)', 'blur(0px) saturate(1)', 'blur(0px) saturate(1)', 'blur(0px) saturate(1)', 'blur(0px) saturate(1)']
          : ['blur(4px) saturate(1.08)', 'blur(2px) saturate(1.06)', 'blur(1px) saturate(1.04)', 'blur(0px) saturate(1.02)', 'blur(0px) saturate(1)', 'blur(0px) saturate(1)', 'blur(0px) saturate(1)', 'blur(0px) saturate(1)'],
      }}
      transition={{ times: MAP_SWITCH_REVEAL_TIMES, delay, duration, ease: MAP_SWITCH_SMOOTH_EASE }}
      className="absolute inset-0 h-full w-full object-contain"
      onError={hideBrokenMapSwitchImage}
      decoding="async"
      draggable={false}
      aria-hidden="true"
    />
  );
}

function MapSwitchBlendLayers() {
  return (
    <>
      <motion.img
        src={MAP_SWITCH_SOFT_IMAGE_URL}
        alt=""
        initial={{ opacity: 0, scale: 1.008, filter: 'blur(4px) saturate(1.05)' }}
        animate={{
          opacity: [0, 0, 0.18, 0.82, 0.98, 0.96, 0.86, 0.72],
          scale: [1.008, 1.006, 1.004, 1.002, 1, 1, 1, 1],
          filter: ['blur(4px) saturate(1.05)', 'blur(3px) saturate(1.04)', 'blur(2px) saturate(1.03)', 'blur(1px) saturate(1.02)', 'blur(0px) saturate(1)', 'blur(0px) saturate(1)', 'blur(0px) saturate(0.98)', 'blur(0px) saturate(0.96)'],
        }}
        transition={{ times: [0, 0.2, 0.34, 0.48, 0.64, 0.78, 0.92, 1], duration: 15.35, ease: MAP_SWITCH_SMOOTH_EASE }}
        className="absolute inset-0 h-full w-full object-contain"
        onError={hideBrokenMapSwitchImage}
        decoding="async"
        draggable={false}
        aria-hidden="true"
      />
      <motion.img
        src={MAP_SWITCH_ANCIENT_IMAGE_URL}
        alt=""
        initial={{ opacity: 0, scale: 1.003, filter: 'blur(3px) saturate(1.04)' }}
        animate={{
          opacity: [0, 0, 0, 0.16, 0.42, 0.66, 0.78, 0.74],
          scale: [1.003, 1.003, 1.002, 1.001, 1, 1, 1, 1],
          filter: ['blur(3px) saturate(1.04)', 'blur(3px) saturate(1.04)', 'blur(2px) saturate(1.03)', 'blur(1px) saturate(1.02)', 'blur(0px) saturate(1)', 'blur(0px) saturate(1)', 'blur(0px) saturate(1)', 'blur(0px) saturate(0.98)'],
        }}
        transition={{ times: [0, 0.3, 0.44, 0.58, 0.72, 0.84, 0.94, 1], duration: 15.45, ease: MAP_SWITCH_SMOOTH_EASE }}
        className="absolute inset-0 h-full w-full object-contain"
        onError={hideBrokenMapSwitchImage}
        decoding="async"
        draggable={false}
        aria-hidden="true"
      />
    </>
  );
}

function MapSwitchReliefLayers({ point }: { point: MapSwitchPoint }) {
  const clipPath = MAP_SWITCH_REVEAL_RADII.map((radius) => `circle(${radius}% at ${point.x}% ${point.y}%)`);

  return (
    <>
      <motion.img
        src={MAP_SWITCH_SOFT_RELIEF_IMAGE_URL}
        alt=""
        initial={{
          opacity: 0,
          scale: 1.012,
          clipPath: clipPath[0],
        }}
        animate={{
          opacity: [0, 0.14, 0.44, 0.78, 0.96, 0.96, 0.82, 0.58],
          scale: [1.012, 1.01, 1.008, 1.004, 1.001, 1, 1, 1],
          clipPath,
        }}
        transition={{ times: MAP_SWITCH_REVEAL_TIMES, delay: 2.92, duration: 12.8, ease: MAP_SWITCH_SMOOTH_EASE }}
        className="absolute inset-0 h-full w-full object-contain"
        style={{ willChange: 'opacity, transform, clip-path' }}
        onError={hideBrokenMapSwitchImage}
        decoding="async"
        draggable={false}
        aria-hidden="true"
      />

      <motion.div
        initial={{ x: '-50%', y: '-50%', opacity: 0, scale: 0.24, rotate: -18 }}
        animate={{
          opacity: [0, 0.42, 0.32, 0.12, 0],
          scale: [0.24, 0.86, 1.82, 3.4, 4.8],
          rotate: [-18, -7, 8, 22, 34],
        }}
        transition={{ delay: 2.9, duration: 8.4, ease: MAP_SWITCH_SMOOTH_EASE }}
        className="absolute aspect-square w-[clamp(124px,21vw,292px)] rounded-full"
        style={{
          left: `${point.x}%`,
          top: `${point.y}%`,
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(255,255,255,0.68) 0%, rgba(255,238,178,0.32) 30%, rgba(244,150,67,0.12) 58%, transparent 76%)',
          maskImage: 'radial-gradient(circle, black 0%, black 54%, transparent 79%)',
          WebkitMaskImage: 'radial-gradient(circle, black 0%, black 54%, transparent 79%)',
          mixBlendMode: 'screen',
          willChange: 'opacity, transform',
        }}
      />
    </>
  );
}

function MapSwitchDropletCityLayers({
  point,
  baseSrc = MAP_SWITCH_SOFT_CLEAN_IMAGE_URL,
}: {
  point: MapSwitchPoint;
  baseSrc?: string;
}) {
  const clipPath = MAP_SWITCH_REVEAL_RADII.map((radius) => `circle(${radius}% at ${point.x}% ${point.y}%)`);

  return (
    <>
      <motion.img
        src={baseSrc}
        alt=""
        initial={{
          opacity: 0,
          scale: 1.014,
          clipPath: clipPath[0],
          filter: 'blur(14px) saturate(1.08) contrast(0.98)',
        }}
        animate={{
          opacity: [0, 0.18, 0.66, 0.96, 1, 1, 0.98, 0.96],
          scale: [1.014, 1.012, 1.01, 1.006, 1.002, 1, 1, 1],
          clipPath,
          filter: [
            'blur(14px) saturate(1.08) contrast(0.98)',
            'blur(11px) saturate(1.08) contrast(0.99)',
            'blur(7px) saturate(1.06) contrast(1)',
            'blur(3px) saturate(1.04) contrast(1.01)',
            'blur(0px) saturate(1.02) contrast(1.01)',
            'blur(0px) saturate(1) contrast(1)',
            'blur(0px) saturate(0.98) contrast(0.99)',
            'blur(0px) saturate(0.98) contrast(0.99)',
          ],
        }}
        transition={{ times: MAP_SWITCH_REVEAL_TIMES, delay: 3.04, duration: 16.6, ease: MAP_SWITCH_SMOOTH_EASE }}
        className="absolute inset-0 h-full w-full object-contain"
        onError={hideBrokenMapSwitchImage}
        decoding="async"
        draggable={false}
        aria-hidden="true"
      />

      <motion.img
        src={MAP_SWITCH_SOFT_IMAGE_URL}
        alt=""
        initial={{
          opacity: 0,
          scale: 1.006,
          clipPath: clipPath[0],
          filter: 'blur(8px) saturate(1.06) contrast(1)',
        }}
        animate={{
          opacity: [0, 0, 0.16, 0.5, 0.82, 1, 1, 1],
          scale: [1.006, 1.006, 1.004, 1.002, 1, 1, 1, 1],
          clipPath,
          filter: [
            'blur(8px) saturate(1.06) contrast(1)',
            'blur(8px) saturate(1.06) contrast(1)',
            'blur(5px) saturate(1.05) contrast(1)',
            'blur(2px) saturate(1.03) contrast(1.01)',
            'blur(0px) saturate(1.02) contrast(1.01)',
            'blur(0px) saturate(1) contrast(1)',
            'blur(0px) saturate(0.99) contrast(0.99)',
            'blur(0px) saturate(0.98) contrast(0.99)',
          ],
        }}
        transition={{ times: MAP_SWITCH_REVEAL_TIMES, delay: 10.8, duration: 10.9, ease: MAP_SWITCH_SMOOTH_EASE }}
        className="absolute inset-0 h-full w-full object-contain"
        onError={hideBrokenMapSwitchImage}
        decoding="async"
        draggable={false}
        aria-hidden="true"
      />
    </>
  );
}

function MapSwitchMirrorLayers({ point }: { point: MapSwitchPoint }) {
  const clipPath = MAP_SWITCH_REVEAL_RADII.map((radius) => `circle(${radius}% at ${point.x}% ${point.y}%)`);

  return (
    <>
      <motion.img
        src={MAP_SWITCH_SOFT_CLEAN_IMAGE_URL}
        alt=""
        initial={{ opacity: 0, scale: 1.012, clipPath: clipPath[0], filter: 'saturate(1.05) contrast(1)' }}
        animate={{
          opacity: [0, 0.1, 0.42, 0.82, 1, 1, 0.96, 0.9],
          scale: [1.012, 1.01, 1.008, 1.004, 1.001, 1, 1, 1],
          clipPath,
          filter: [
            'saturate(1.05) contrast(1)',
            'saturate(1.05) contrast(1)',
            'saturate(1.04) contrast(1.01)',
            'saturate(1.03) contrast(1.01)',
            'saturate(1.01) contrast(1)',
            'saturate(1) contrast(1)',
            'saturate(0.99) contrast(0.99)',
            'saturate(0.98) contrast(0.99)',
          ],
        }}
        transition={{ times: MAP_SWITCH_REVEAL_TIMES, delay: 3.05, duration: 14.8, ease: MAP_SWITCH_SMOOTH_EASE }}
        className="absolute inset-0 h-full w-full object-contain"
        style={{ willChange: 'opacity, transform, clip-path' }}
        onError={hideBrokenMapSwitchImage}
        decoding="async"
        draggable={false}
        aria-hidden="true"
      />

      <motion.img
        src={MAP_SWITCH_SOFT_IMAGE_URL}
        alt=""
        initial={{ opacity: 0, scale: 1.004, clipPath: clipPath[0] }}
        animate={{
          opacity: [0, 0, 0, 0.18, 0.52, 0.82, 0.98, 1],
          scale: [1.004, 1.004, 1.003, 1.002, 1.001, 1, 1, 1],
          clipPath,
        }}
        transition={{ times: MAP_SWITCH_REVEAL_TIMES, delay: 9.8, duration: 11.8, ease: MAP_SWITCH_SMOOTH_EASE }}
        className="absolute inset-0 h-full w-full object-contain"
        style={{ willChange: 'opacity, transform, clip-path' }}
        onError={hideBrokenMapSwitchImage}
        decoding="async"
        draggable={false}
        aria-hidden="true"
      />

      <motion.div
        initial={{ x: '-50%', y: '-50%', opacity: 0, scale: 0.18 }}
        animate={{
          opacity: [0, 0.82, 0.72, 0.42, 0.16, 0],
          scale: [0.18, 0.68, 1.54, 2.7, 4.2, 5.9],
        }}
        transition={{ delay: 2.92, duration: 11.6, ease: MAP_SWITCH_SMOOTH_EASE }}
        className="absolute aspect-square w-[clamp(124px,23vw,310px)] rounded-full"
        style={{
          left: `${point.x}%`,
          top: `${point.y}%`,
          transform: 'translate(-50%, -50%)',
          background: [
            'radial-gradient(circle, rgba(255,255,255,0.32) 0%, rgba(255,244,205,0.20) 44%, transparent 68%)',
            'radial-gradient(circle, transparent 0%, transparent 55%, rgba(255,255,255,0.9) 58%, rgba(255,229,148,0.58) 62%, rgba(244,143,62,0.14) 72%, transparent 82%)',
          ].join(', '),
          boxShadow: 'inset 0 0 34px rgba(255,255,255,0.45), 0 0 32px rgba(255,218,118,0.52)',
          mixBlendMode: 'screen',
          willChange: 'opacity, transform',
        }}
      />

      <motion.div
        initial={{ x: '-52%', y: '-55%', opacity: 0, scale: 0.3, rotate: -16 }}
        animate={{
          opacity: [0, 0.7, 0.42, 0.18, 0],
          scale: [0.3, 1.0, 1.9, 3.0, 4.5],
          rotate: [-16, -10, -2, 7, 14],
        }}
        transition={{ delay: 3.25, duration: 10.4, ease: MAP_SWITCH_SMOOTH_EASE }}
        className="absolute aspect-[1.35/1] w-[clamp(112px,20vw,280px)] rounded-[50%]"
        style={{
          left: `${point.x}%`,
          top: `${point.y}%`,
          transform: 'translate(-50%, -50%)',
          background: 'linear-gradient(108deg, transparent 8%, rgba(255,255,255,0.72) 33%, rgba(255,255,255,0.18) 47%, transparent 66%)',
          filter: 'blur(3px)',
          mixBlendMode: 'screen',
        }}
      />
    </>
  );
}

function MapSwitchFireVeinLayers({ point, nodes }: { point: MapSwitchPoint; nodes: MapSwitchNode[] }) {
  const clipPath = MAP_SWITCH_REVEAL_RADII.map((radius) => `circle(${radius}% at ${point.x}% ${point.y}%)`);

  return (
    <>
      <motion.img
        src={MAP_SWITCH_SOFT_FLAME_IMAGE_URL}
        alt=""
        initial={{ opacity: 0, scale: 1.012, clipPath: clipPath[0] }}
        animate={{
          opacity: [0, 0.08, 0.32, 0.7, 0.98, 1, 0.98, 0.92],
          scale: [1.012, 1.011, 1.008, 1.004, 1.001, 1, 1, 1],
          clipPath,
        }}
        transition={{ times: MAP_SWITCH_REVEAL_TIMES, delay: 3.15, duration: 13.4, ease: MAP_SWITCH_SMOOTH_EASE }}
        className="absolute inset-0 h-full w-full object-contain"
        style={{ willChange: 'opacity, transform, clip-path' }}
        onError={hideBrokenMapSwitchImage}
        decoding="async"
        draggable={false}
        aria-hidden="true"
      />

      <motion.img
        src={MAP_SWITCH_SOFT_IMAGE_URL}
        alt=""
        initial={{ opacity: 0, scale: 1.004, clipPath: clipPath[0] }}
        animate={{
          opacity: [0, 0, 0.12, 0.36, 0.66, 0.92, 1, 1],
          scale: [1.004, 1.004, 1.003, 1.002, 1, 1, 1, 1],
          clipPath,
        }}
        transition={{ times: MAP_SWITCH_REVEAL_TIMES, delay: 8.8, duration: 12.4, ease: MAP_SWITCH_SMOOTH_EASE }}
        className="absolute inset-0 h-full w-full object-contain"
        style={{ willChange: 'opacity, transform, clip-path' }}
        onError={hideBrokenMapSwitchImage}
        decoding="async"
        draggable={false}
        aria-hidden="true"
      />

      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <filter id="map-switch-fire-vein-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="0.9" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {nodes.map((node) => (
          <motion.line
            key={node.id}
            x1={point.x}
            y1={point.y}
            x2={clampPercent(node.x)}
            y2={clampPercent(node.y)}
            stroke="#FFCC71"
            strokeWidth="1.05"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            filter="url(#map-switch-fire-vein-glow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: [0, 1, 1], opacity: [0, 0.86, 0.54, 0.12, 0] }}
            transition={{ times: [0, 0.42, 0.68, 0.9, 1], delay: 4.52 + node.delay * 0.9, duration: 6.8, ease: MAP_SWITCH_SMOOTH_EASE }}
          />
        ))}
      </svg>

      {nodes.map((node) => {
        const nodeX = clampPercent(node.x);
        const nodeY = clampPercent(node.y);
        const dx = nodeX - point.x;
        const dy = nodeY - point.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

        return (
          <div
            key={`${node.id}-beam`}
            className="absolute h-[2px]"
            style={{
              left: `${point.x}%`,
              top: `${point.y}%`,
              width: `${length}%`,
              transform: `rotate(${angle}deg)`,
              transformOrigin: '0 50%',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: [0, 0.82, 0.56, 0.12, 0], scaleX: [0, 1, 1, 1, 1] }}
              transition={{ times: [0, 0.34, 0.62, 0.88, 1], delay: 4.5 + node.delay * 0.9, duration: 6.8, ease: MAP_SWITCH_SMOOTH_EASE }}
              className="h-full w-full origin-left rounded-full"
              style={{
                background: 'linear-gradient(90deg, rgba(255,255,255,0.94), rgba(255,185,67,0.9), rgba(229,57,53,0.58), transparent)',
                boxShadow: '0 0 14px rgba(255,176,63,0.78), 0 0 26px rgba(229,57,53,0.42)',
              }}
            />
          </div>
        );
      })}

      {nodes.map((node) => (
        <motion.div
          key={node.id}
          initial={{ x: '-50%', y: '-50%', opacity: 0, scale: 0.3 }}
          animate={{
            opacity: [0, 0.95, 0.86, 0.38, 0],
            scale: [0.3, 1, 1.24, 1.48, 1.1],
          }}
          transition={{ delay: 5.05 + node.delay * 0.9, duration: 5.7, ease: MAP_SWITCH_SMOOTH_EASE }}
          className="absolute h-2.5 w-2.5 rounded-full"
          style={{
            left: `${clampPercent(node.x)}%`,
            top: `${clampPercent(node.y)}%`,
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, #fff 0%, #FFE6A5 42%, rgba(255,116,45,0.52) 72%, transparent 78%)',
            boxShadow: '0 0 16px rgba(255,208,113,0.9), 0 0 28px rgba(255,87,34,0.38)',
          }}
        />
      ))}

      <motion.div
        initial={{ x: '-50%', y: '-50%', opacity: 0, scale: 0.22 }}
        animate={{
          opacity: [0, 0.58, 0.42, 0.16, 0],
          scale: [0.22, 0.92, 2.1, 3.7, 5.15],
        }}
        transition={{ delay: 3.4, duration: 9.6, ease: MAP_SWITCH_SMOOTH_EASE }}
        className="absolute aspect-square w-[clamp(116px,20vw,286px)] rounded-full"
        style={{
          left: `${point.x}%`,
          top: `${point.y}%`,
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(255,255,255,0.58) 0%, rgba(255,195,92,0.32) 38%, rgba(229,57,53,0.16) 60%, transparent 78%)',
          willChange: 'opacity, transform',
        }}
      />
    </>
  );
}

function MapSwitchSilkLayers({ point }: { point: MapSwitchPoint }) {
  const silkClipPath = [
    'polygon(45% 0%, 56% 0%, 54% 100%, 44% 100%)',
    'polygon(36% 0%, 66% 0%, 66% 100%, 32% 100%)',
    'polygon(22% 0%, 79% 0%, 82% 100%, 18% 100%)',
    'polygon(8% 0%, 92% 0%, 96% 100%, 4% 100%)',
    'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
  ];

  return (
    <>
      <motion.img
        src={MAP_SWITCH_SOFT_CLEAN_IMAGE_URL}
        alt=""
        initial={{ opacity: 0, scale: 1.01, clipPath: silkClipPath[0] }}
        animate={{
          opacity: [0, 0.22, 0.68, 0.96, 1],
          scale: [1.01, 1.008, 1.004, 1.001, 1],
          clipPath: silkClipPath,
        }}
        transition={{ times: [0, 0.22, 0.5, 0.78, 1], delay: 3.05, duration: 11.2, ease: MAP_SWITCH_SMOOTH_EASE }}
        className="absolute inset-0 h-full w-full object-contain"
        style={{ willChange: 'opacity, transform, clip-path' }}
        onError={hideBrokenMapSwitchImage}
        decoding="async"
        draggable={false}
        aria-hidden="true"
      />

      <motion.img
        src={MAP_SWITCH_SOFT_IMAGE_URL}
        alt=""
        initial={{ opacity: 0, scale: 1.004, clipPath: silkClipPath[0] }}
        animate={{
          opacity: [0, 0, 0.2, 0.72, 1],
          scale: [1.004, 1.003, 1.002, 1, 1],
          clipPath: silkClipPath,
        }}
        transition={{ times: [0, 0.24, 0.54, 0.82, 1], delay: 8.4, duration: 9.8, ease: MAP_SWITCH_SMOOTH_EASE }}
        className="absolute inset-0 h-full w-full object-contain"
        style={{ willChange: 'opacity, transform, clip-path' }}
        onError={hideBrokenMapSwitchImage}
        decoding="async"
        draggable={false}
        aria-hidden="true"
      />

      <motion.div
        initial={{ opacity: 0, x: '-42%', rotate: -5 }}
        animate={{ opacity: [0, 0.42, 0.26, 0], x: ['-42%', '6%', '38%', '62%'], rotate: [-5, -3, 2, 4] }}
        transition={{ delay: 3.2, duration: 11.6, ease: MAP_SWITCH_SMOOTH_EASE }}
        className="absolute -top-[8%] h-[116%] w-[34%]"
        style={{
          left: `${point.x - 17}%`,
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.58) 46%, rgba(255,232,178,0.24) 56%, transparent 100%)',
          filter: 'blur(7px)',
          mixBlendMode: 'screen',
        }}
      />

      <motion.div
        initial={{ x: '-50%', y: '-50%', opacity: 0, scale: 0.32 }}
        animate={{ opacity: [0, 0.48, 0.32, 0.1, 0], scale: [0.32, 1.1, 2.2, 3.6, 4.75] }}
        transition={{ delay: 3.0, duration: 9.0, ease: MAP_SWITCH_SMOOTH_EASE }}
        className="absolute aspect-square w-[clamp(120px,20vw,280px)] rounded-full"
        style={{
          left: `${point.x}%`,
          top: `${point.y}%`,
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(255,255,255,0.48) 0%, rgba(255,231,168,0.26) 34%, transparent 72%)',
          mixBlendMode: 'screen',
        }}
      />
    </>
  );
}

function MapSwitchScrollLayers({ point }: { point: MapSwitchPoint }) {
  const scrollClipPath = [
    'inset(0% 50% 0% 50% round 2%)',
    'inset(0% 40% 0% 40% round 2%)',
    'inset(0% 27% 0% 27% round 1.5%)',
    'inset(0% 13% 0% 13% round 1%)',
    'inset(0% 0% 0% 0% round 0%)',
  ];

  return (
    <>
      <motion.img
        src={MAP_SWITCH_SOFT_CLEAN_IMAGE_URL}
        alt=""
        initial={{ opacity: 0, scale: 1.012, clipPath: scrollClipPath[0] }}
        animate={{
          opacity: [0, 0.18, 0.54, 0.9, 1],
          scale: [1.012, 1.008, 1.004, 1.001, 1],
          clipPath: scrollClipPath,
        }}
        transition={{ times: [0, 0.22, 0.5, 0.78, 1], delay: 3.08, duration: 12.2, ease: MAP_SWITCH_SMOOTH_EASE }}
        className="absolute inset-0 h-full w-full object-contain"
        style={{ willChange: 'opacity, transform, clip-path' }}
        onError={hideBrokenMapSwitchImage}
        decoding="async"
        draggable={false}
        aria-hidden="true"
      />

      <motion.img
        src={MAP_SWITCH_SOFT_IMAGE_URL}
        alt=""
        initial={{ opacity: 0, scale: 1.004, clipPath: scrollClipPath[0] }}
        animate={{
          opacity: [0, 0, 0.12, 0.62, 1],
          scale: [1.004, 1.003, 1.002, 1, 1],
          clipPath: scrollClipPath,
        }}
        transition={{ times: [0, 0.25, 0.52, 0.8, 1], delay: 9.6, duration: 10.6, ease: MAP_SWITCH_SMOOTH_EASE }}
        className="absolute inset-0 h-full w-full object-contain"
        style={{ willChange: 'opacity, transform, clip-path' }}
        onError={hideBrokenMapSwitchImage}
        decoding="async"
        draggable={false}
        aria-hidden="true"
      />

      {[-1, 1].map((side) => (
        <motion.div
          key={side}
          initial={{ x: '-50%', y: '-50%', opacity: 0 }}
          animate={{
            opacity: [0, 0.64, 0.48, 0.18, 0],
            left: [`${point.x}%`, `${point.x + side * 9}%`, `${point.x + side * 22}%`, `${point.x + side * 38}%`, `${point.x + side * 53}%`],
          }}
          transition={{ delay: 3.08, duration: 12.1, ease: MAP_SWITCH_SMOOTH_EASE }}
          className="absolute top-1/2 h-[86%] w-[clamp(12px,1.8vw,24px)] rounded-full"
          style={{
            transform: 'translate(-50%, -50%)',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), rgba(255,218,138,0.28), transparent)',
            boxShadow: '0 0 26px rgba(255,222,146,0.42)',
            filter: 'blur(2px)',
            mixBlendMode: 'screen',
          }}
        />
      ))}

      <motion.div
        initial={{ x: '-50%', y: '-50%', opacity: 0, scale: 0.34 }}
        animate={{ opacity: [0, 0.66, 0.42, 0.14, 0], scale: [0.34, 1.1, 2.0, 3.28, 4.3] }}
        transition={{ delay: 3.2, duration: 8.2, ease: MAP_SWITCH_SMOOTH_EASE }}
        className="absolute aspect-square w-[clamp(108px,18vw,250px)] rounded-full"
        style={{
          left: `${point.x}%`,
          top: `${point.y}%`,
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(255,255,255,0.54) 0%, rgba(255,224,151,0.28) 38%, transparent 74%)',
          mixBlendMode: 'screen',
        }}
      />
    </>
  );
}

function MapSwitchInkWash({ point }: { point: MapSwitchPoint }) {
  return (
    <>
      <motion.div
        initial={{ x: '-50%', y: '-50%', opacity: 0, scale: 0.18, rotate: -16 }}
        animate={{
          opacity: [0, 0.64, 0.58, 0.34, 0.16, 0],
          scale: [0.18, 0.82, 1.72, 3.1, 4.9, 6.45],
          rotate: [-16, -6, 7, 18, 28, 36],
        }}
        transition={{ delay: 2.74, duration: 8.8, ease: MAP_SWITCH_SMOOTH_EASE }}
        className="absolute aspect-square w-[clamp(120px,20vw,270px)] rounded-full"
        style={{
          left: `${point.x}%`,
          top: `${point.y}%`,
          transform: 'translate(-50%, -50%)',
          background: [
            'radial-gradient(circle, rgba(255,250,226,0.56) 0%, rgba(255,224,145,0.24) 34%, rgba(255,177,82,0.10) 58%, transparent 74%)',
            'conic-gradient(from 24deg, transparent 0deg, rgba(255,255,255,0.58) 34deg, rgba(255,207,111,0.22) 82deg, transparent 132deg, rgba(255,244,198,0.34) 188deg, rgba(244,148,69,0.16) 244deg, transparent 320deg)',
          ].join(', '),
          maskImage: 'radial-gradient(circle, black 0%, black 54%, transparent 78%)',
          WebkitMaskImage: 'radial-gradient(circle, black 0%, black 54%, transparent 78%)',
          filter: 'blur(11px) drop-shadow(0 0 34px rgba(255,219,125,0.58))',
          mixBlendMode: 'screen',
        }}
      />

      <motion.div
        initial={{ x: '-50%', y: '-50%', opacity: 0, scale: 0.2 }}
        animate={{
          opacity: [0, 0.82, 0.62, 0.34, 0.08, 0],
          scale: [0.2, 0.72, 1.5, 2.72, 4.4, 5.8],
        }}
        transition={{ delay: 2.95, duration: 7.9, ease: MAP_SWITCH_SMOOTH_EASE }}
        className="absolute aspect-square w-[clamp(98px,16vw,214px)] rounded-full"
        style={{
          left: `${point.x}%`,
          top: `${point.y}%`,
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, transparent 0%, transparent 48%, rgba(255,255,255,0.72) 54%, rgba(255,223,143,0.54) 61%, rgba(244,149,67,0.16) 72%, transparent 84%)',
          filter: 'blur(5px) drop-shadow(0 0 24px rgba(255,226,145,0.64))',
          mixBlendMode: 'screen',
        }}
      />
    </>
  );
}

function MapSwitchSoftPulse({ point }: { point: MapSwitchPoint }) {
  return (
    <motion.div
      initial={{ x: '-50%', y: '-50%', opacity: 0, scale: 0.32 }}
      animate={{
        opacity: [0, 0.56, 0.42, 0.18, 0],
        scale: [0.32, 1.15, 2.3, 3.6, 4.5],
      }}
      transition={{ delay: 2.65, duration: 8.4, ease: MAP_SWITCH_SMOOTH_EASE }}
      className="absolute aspect-square w-[clamp(130px,22vw,300px)] rounded-full"
      style={{
        left: `${point.x}%`,
        top: `${point.y}%`,
        transform: 'translate(-50%, -50%)',
        background: 'radial-gradient(circle, rgba(255,255,255,0.66) 0%, rgba(255,234,163,0.34) 28%, rgba(245,148,71,0.12) 58%, transparent 78%)',
        filter: 'blur(18px) drop-shadow(0 0 26px rgba(255,219,118,0.46))',
      }}
    />
  );
}

function MapSwitchLiquidEdge({ point }: { point: MapSwitchPoint }) {
  return (
    <>
      <motion.div
        initial={{ x: '-50%', y: '-50%', opacity: 0, scale: 0.1, rotate: -8 }}
        animate={{
          opacity: [0, 0.86, 0.74, 0.38, 0.12, 0],
          scale: [0.1, 0.48, 1.18, 2.3, 3.75, 5.85],
          rotate: [-8, -2, 8, 18, 28, 36],
        }}
        transition={{ delay: 2.36, duration: 5.6, ease: MAP_SWITCH_SMOOTH_EASE }}
        className="absolute aspect-square w-[clamp(104px,17vw,232px)] rounded-full"
        style={{
          left: `${point.x}%`,
          top: `${point.y}%`,
          transform: 'translate(-50%, -50%)',
          background: [
            'radial-gradient(circle, transparent 0%, transparent 50%, rgba(255,255,255,0.98) 54%, rgba(255,235,158,0.92) 58%, rgba(255,176,72,0.34) 66%, transparent 76%)',
            'conic-gradient(from 18deg, transparent 0deg, rgba(255,255,255,0.76) 34deg, rgba(255,222,133,0.28) 62deg, transparent 118deg, rgba(255,255,255,0.58) 178deg, transparent 236deg, rgba(255,211,105,0.34) 296deg, transparent 360deg)',
          ].join(', '),
          maskImage: 'radial-gradient(circle, transparent 0%, transparent 46%, black 53%, black 68%, transparent 78%)',
          WebkitMaskImage: 'radial-gradient(circle, transparent 0%, transparent 46%, black 53%, black 68%, transparent 78%)',
          filter: 'blur(2.4px) drop-shadow(0 0 24px rgba(255,222,134,0.82))',
          mixBlendMode: 'screen',
        }}
      />

      <motion.div
        initial={{ x: '-50%', y: '-50%', opacity: 0, scale: 0.2 }}
        animate={{
          opacity: [0, 0.72, 0.5, 0.2, 0],
          scale: [0.18, 0.72, 1.65, 3.05, 4.55],
        }}
        transition={{ delay: 2.5, duration: 4.9, ease: 'easeOut' }}
        className="absolute aspect-square w-[clamp(88px,14vw,188px)] rounded-full"
        style={{
          left: `${point.x}%`,
          top: `${point.y}%`,
          transform: 'translate(-50%, -50%)',
          border: '1px solid rgba(255,255,255,0.72)',
          boxShadow: '0 0 26px rgba(255,230,155,0.72), inset 0 0 18px rgba(255,245,210,0.38)',
          filter: 'blur(0.8px)',
        }}
      />
    </>
  );
}

function MapImageSwitchOverlay({
  playKey,
  frame,
  mode,
}: {
  playKey: number;
  frame: MapSwitchFrame | null;
  mode: MapTransitionMode;
}) {
  const impactPoint = frame?.impact ?? MAP_SWITCH_ASSET.changsha;
  const eyePoint = MAP_SWITCH_ASSET.eye;
  const nodes = frame?.nodes?.length ? frame.nodes : MAP_SWITCH_FALLBACK_NODES;
  const showDropletCity = mode === 'rippleCity';
  const showDropletFlame = mode === 'rippleFlame';
  const showDropletReveal = showDropletCity || showDropletFlame;
  const showRippleDetails = mode === 'ripple' || showDropletReveal;
  const showInkWash = mode === 'ink';
  const showBlend = mode === 'blend';
  const showRelief = mode === 'relief';
  const showMirror = mode === 'mirror';
  const showFireVein = mode === 'fireVein';
  const showSilk = mode === 'silk';
  const showScroll = mode === 'scroll';
  const showCreativeReveal = showMirror || showFireVein || showSilk || showScroll;
  const overlayDuration = showDropletReveal
    ? 24.6
    : showMirror
      ? 23.2
      : showFireVein
        ? 22.4
        : showScroll
          ? 21.8
          : showSilk
            ? 20.6
            : 17.8;
  const overlayExitDelay = showDropletReveal ? 25.6 : showCreativeReveal ? overlayDuration + 0.9 : 18.9;
  const overlayFadeDuration = showDropletReveal ? 3.25 : showCreativeReveal ? 2.8 : 2.2;
  const phoenixDuration = showDropletReveal ? 18.8 : showCreativeReveal ? 17.6 : 15.2;
  const phoenixOpacity = showBlend
    ? [1, 1, 1, 0.9, 0.66, 0.48, 0.36, 0.24]
    : showDropletReveal
      ? [1, 1, 1, 0.99, 0.84, 0.56, 0.28, 0.1]
    : showMirror
      ? [1, 1, 1, 1, 0.92, 0.62, 0.3, 0.08]
    : showFireVein
      ? [1, 1, 1, 0.98, 0.8, 0.52, 0.25, 0.08]
    : showScroll || showSilk
      ? [1, 1, 1, 0.98, 0.86, 0.58, 0.3, 0.1]
    : showRelief
      ? [1, 1, 1, 0.98, 0.82, 0.58, 0.38, 0.2]
    : showInkWash
      ? [1, 1, 1, 0.96, 0.78, 0.58, 0.42, 0.24]
      : [1, 1, 1, 0.98, 0.78, 0.48, 0.34, 0.12];
  const frameStyle = frame
    ? {
        left: `${frame.left}px`,
        top: `${frame.top}px`,
        width: `${frame.width}px`,
        height: `${frame.height}px`,
      }
    : {
        left: '50%',
        top: '52%',
        width: 'min(76vw, 860px)',
        height: 'min(66.88vw, 757px)',
        transform: 'translate(-50%, -50%)',
      };

  return (
    <motion.div
      key={`${mode}-${playKey}`}
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ delay: overlayExitDelay, duration: overlayFadeDuration, ease: MAP_SWITCH_SMOOTH_EASE }}
      className="pointer-events-none absolute inset-0 z-[640] overflow-hidden bg-transparent"
      style={{ isolation: 'isolate' }}
      aria-hidden="true"
    >
      <motion.div
        initial={{ opacity: 0.82 }}
        animate={{ opacity: [0.82, 0.82, 0.76, 0.62, 0.46, 0.3, 0.14, 0.02] }}
        transition={{ times: MAP_SWITCH_REVEAL_TIMES, duration: overlayDuration, ease: MAP_SWITCH_SMOOTH_EASE }}
        className="absolute inset-0 bg-[#FFF8F0]"
      />

      <motion.div
        className="absolute"
        style={frameStyle}
      >
        <motion.img
          src={MAP_SWITCH_PHOENIX_IMAGE_URL}
          alt=""
          initial={{ opacity: 1, scale: 1.012, filter: 'saturate(1.08) contrast(1.03)' }}
          animate={{
            opacity: phoenixOpacity,
            scale: [1.012, 1.01, 1.006, 1.003, 1, 1, 1, 1],
            filter: ['saturate(1.08) contrast(1.03)', 'saturate(1.07) contrast(1.03)', 'saturate(1.05) contrast(1.02)', 'saturate(1.02) contrast(1)', 'saturate(0.98) contrast(0.98)', 'saturate(0.94) contrast(0.97)', 'saturate(0.92) contrast(0.96)', 'saturate(0.88) contrast(0.96)'],
          }}
          transition={{ times: [0, 0.2, 0.42, 0.56, 0.68, 0.82, 0.94, 1], duration: phoenixDuration, ease: MAP_SWITCH_SMOOTH_EASE }}
          className="absolute inset-0 h-full w-full object-contain"
          onError={hideBrokenMapSwitchImage}
          decoding="async"
          draggable={false}
        />

        {showBlend ? (
          <MapSwitchBlendLayers />
        ) : showRelief ? (
          <MapSwitchReliefLayers point={impactPoint} />
        ) : showMirror ? (
          <MapSwitchMirrorLayers point={impactPoint} />
        ) : showFireVein ? (
          <MapSwitchFireVeinLayers point={impactPoint} nodes={nodes} />
        ) : showSilk ? (
          <MapSwitchSilkLayers point={impactPoint} />
        ) : showScroll ? (
          <MapSwitchScrollLayers point={impactPoint} />
        ) : showDropletReveal ? (
          <MapSwitchDropletCityLayers
            point={impactPoint}
            baseSrc={showDropletFlame ? MAP_SWITCH_SOFT_FLAME_IMAGE_URL : MAP_SWITCH_SOFT_CLEAN_IMAGE_URL}
          />
        ) : (
          <>
            <MapSwitchRevealLayer
              src={MAP_SWITCH_SOFT_IMAGE_URL}
              point={impactPoint}
              delay={showInkWash ? 2.72 : 2.95}
              duration={showInkWash ? 12.85 : 12.2}
              opacity={showInkWash
                ? [0, 0.62, 0.94, 0.98, 0.92, 0.82, 0.68, 0.58]
                : [0, 0.86, 0.94, 0.82, 0.64, 0.54, 0.42, 0.08]}
              blur
            />
            <MapSwitchRevealLayer
              src={MAP_SWITCH_ANCIENT_IMAGE_URL}
              point={impactPoint}
              delay={showInkWash ? 3.52 : 3.42}
              duration={showInkWash ? 10.8 : 9.6}
              opacity={showInkWash
                ? [0, 0.08, 0.28, 0.54, 0.78, 0.9, 0.88, 0.76]
                : [0, 0.18, 0.52, 0.82, 0.98, 1, 1, 1]}
            />
          </>
        )}

        <motion.svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <filter id="map-switch-drop-glow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="0.6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <motion.line
            x1={eyePoint.x}
            y1={eyePoint.y}
            x2={impactPoint.x}
            y2={impactPoint.y}
            stroke="#FFE7A5"
            strokeWidth="0.22"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            filter="url(#map-switch-drop-glow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: [0, 1, 1], opacity: [0, 0.78, 0] }}
            transition={{ times: [0, 0.58, 1], delay: 1.12, duration: 2.25, ease: [0.22, 1, 0.36, 1] }}
          />
        </motion.svg>

        <motion.div
          initial={{
            left: `${eyePoint.x}%`,
            top: `${eyePoint.y}%`,
            x: '-50%',
            y: '-50%',
            opacity: 0,
            scale: 0.72,
          }}
          animate={{
            left: `${impactPoint.x}%`,
            top: `${impactPoint.y}%`,
            opacity: [0, 1, 1, 0],
            scale: [0.72, 1, 0.94, 0.64],
          }}
          transition={{ times: [0, 0.18, 0.8, 1], delay: 1.12, duration: 2.25, ease: [0.22, 1, 0.36, 1] }}
          className="absolute h-7 w-4 rounded-[60%_60%_72%_72%] border border-white/80 bg-gradient-to-b from-white via-[#FFE8B1] to-[#F97316]/80 shadow-[0_0_24px_rgba(255,211,117,0.95)]"
        />

        {showRippleDetails ? (
          <>
            <MapSwitchImpactGlow point={impactPoint} />
            <MapSwitchLiquidEdge point={impactPoint} />
          </>
        ) : null}
        {showInkWash ? <MapSwitchInkWash point={impactPoint} /> : null}
        {showBlend ? <MapSwitchSoftPulse point={impactPoint} /> : null}

        {showRippleDetails ? (
          <>
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <filter id="map-switch-line-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="0.45" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              {nodes.map((node) => (
                <motion.line
                  key={node.id}
                  x1={impactPoint.x}
                  y1={impactPoint.y}
                  x2={clampPercent(node.x)}
                  y2={clampPercent(node.y)}
                  stroke="#FFE6A3"
                  strokeWidth="0.28"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                  filter="url(#map-switch-line-glow)"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: [0, 1], opacity: [0, 0.76, 0.48, 0.12, 0] }}
                  transition={{ delay: 5.0 + node.delay, duration: 3.95, ease: MAP_SWITCH_SMOOTH_EASE }}
                />
              ))}
            </svg>

            {nodes.map((node) => (
              <motion.div
                key={node.id}
                initial={{ x: '-50%', y: '-50%', opacity: 0, scale: 0.35 }}
                animate={{ opacity: [0, 0.95, 0.58, 0.12, 0], scale: [0.35, 1, 1.08, 0.98, 0.92] }}
                transition={{ delay: 5.1 + node.delay, duration: 3.65, ease: MAP_SWITCH_SMOOTH_EASE }}
                className="absolute h-2.5 w-2.5 rounded-full bg-[#FFF8D6] shadow-[0_0_20px_rgba(255,230,163,0.95)]"
                style={{ left: `${clampPercent(node.x)}%`, top: `${clampPercent(node.y)}%`, transform: 'translate(-50%, -50%)' }}
              />
            ))}
          </>
        ) : null}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0, 0.08, 0] }}
          transition={{ times: [0, 0.5, 0.72, 1], duration: 15.0, ease: 'easeOut' }}
          className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-white/20"
        />
      </motion.div>

      {showRippleDetails || showInkWash ? (
        <motion.div
          initial={{ x: '-50%', y: '-50%', opacity: 0, scale: 0.18 }}
          animate={{
            opacity: showRelief
              ? [0, 0.46, 0.48, 0.24, 0]
              : showInkWash
                ? [0, 0.52, 0.46, 0.22, 0]
                : [0, 0.72, 0.56, 0.28, 0],
            scale: showRelief
              ? [0.16, 0.82, 1.96, 3.68, 6.35]
              : showInkWash
                ? [0.16, 0.76, 1.78, 3.34, 6.1]
                : [0.16, 0.56, 1.34, 2.78, 5.45],
          }}
          transition={{
            delay: showDropletReveal ? 3.08 : showRelief ? 3.08 : showInkWash ? 3.2 : 3.04,
            duration: showDropletReveal ? 10.4 : showRelief ? 9.0 : showInkWash ? 8.3 : 6.15,
            ease: MAP_SWITCH_SMOOTH_EASE,
          }}
          className="absolute aspect-square w-[clamp(170px,30vw,390px)] rounded-full"
          style={{
            left: frame ? `${frame.left + (frame.width * impactPoint.x) / 100}px` : `${impactPoint.x}%`,
            top: frame ? `${frame.top + (frame.height * impactPoint.y) / 100}px` : `${impactPoint.y}%`,
            transform: 'translate(-50%, -50%)',
            background: [
              'radial-gradient(circle, transparent 0%, transparent 45%, rgba(255,255,255,0.78) 52%, rgba(255,227,142,0.58) 59%, rgba(246,161,75,0.20) 70%, transparent 82%)',
              'radial-gradient(circle, rgba(255,244,194,0.18) 0%, rgba(255,219,121,0.12) 38%, transparent 72%)',
            ].join(', '),
            filter: showRelief
              ? 'blur(14px) drop-shadow(0 0 36px rgba(255,217,118,0.5))'
              : showInkWash
                ? 'blur(12px) drop-shadow(0 0 34px rgba(255,217,118,0.54))'
                : 'blur(7px) drop-shadow(0 0 26px rgba(255,217,118,0.72))',
          }}
        />
      ) : null}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.08, 0.02, 0] }}
        transition={{ times: [0, 0.42, 0.82, 1], duration: overlayDuration, ease: 'easeOut' }}
        className="absolute inset-0 bg-white"
      />
    </motion.div>
  );
}

function createStampMarker(team: Team, isSelected: boolean): L.DivIcon {
  const size = isSelected ? 50 : 38;
  const ringSize = isSelected ? 64 : 50;

  return L.divIcon({
    className: 'custom-marker',
    iconSize: [ringSize, ringSize],
    iconAnchor: [ringSize / 2, ringSize / 2],
    html: `
      <div style="
        width: ${ringSize}px;
        height: ${ringSize}px;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        filter: drop-shadow(0 2px 6px rgba(0,0,0,0.25));
      ">
        ${isSelected ? `<div style="
          position: absolute;
          width: ${ringSize + 8}px;
          height: ${ringSize + 8}px;
          border-radius: 50%;
          border: 2px solid ${team.color}60;
          animation: pulse-ring 2s ease-out infinite;
        "></div>` : ''}
        <div style="
          width: ${size}px;
          height: ${size}px;
          border-radius: ${isSelected ? '8px' : '50%'};
          background: ${isSelected
            ? `linear-gradient(135deg, ${team.color}, ${team.color}DD)`
            : `linear-gradient(145deg, ${team.color}EE, ${team.color}BB)`};
          border: ${isSelected ? '3px' : '2.5px'} solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 10px ${team.color}50,
                      0 4px 16px rgba(0,0,0,0.15);
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          position: relative;
          z-index: 2;
          ${isSelected ? 'transform: rotate(-2deg);' : ''}
        ">
          <span style="
            color: white;
            font-family: 'Noto Serif SC', serif;
            font-weight: 900;
            font-size: ${isSelected ? '15' : '12'}px;
            text-shadow: 0 1px 3px rgba(0,0,0,0.4);
            letter-spacing: 2px;
          ">${team.name}</span>
        </div>
        ${team.rank <= 3 ? `
          <div style="
            position: absolute;
            top: ${isSelected ? '-6' : '-4'}px;
            right: ${isSelected ? '-4' : '-2'}px;
            background: linear-gradient(135deg, #FFD700, #F9A825);
            color: #5D4037;
            font-size: 9px;
            font-weight: 900;
            padding: 1px 5px;
            border-radius: 3px;
            font-family: 'Noto Sans SC', sans-serif;
            box-shadow: 0 2px 6px rgba(249, 168, 37, 0.4);
            z-index: 3;
            border: 1px solid rgba(255,255,255,0.6);
          ">${team.rankLabel}</div>
        ` : ''}
      </div>
    `,
  });
}

function createServiceMarker(poi: H5Poi, active: boolean): L.DivIcon {
  const outerSize = active ? 42 : 34;
  const coreSize = active ? 24 : 18;

  return L.divIcon({
    className: 'service-marker',
    iconSize: [outerSize, outerSize],
    iconAnchor: [outerSize / 2, outerSize / 2],
    html: `
      <div style="
        width: ${outerSize}px;
        height: ${outerSize}px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        cursor: pointer;
        filter: drop-shadow(0 10px 18px rgba(15,23,42,0.18));
      ">
        <div style="
          position: absolute;
          width: ${outerSize}px;
          height: ${outerSize}px;
          border-radius: 999px;
          background: ${poi.color ?? '#D32F2F'}22;
          border: 1px solid ${poi.color ?? '#D32F2F'}55;
          ${active ? 'animation: pulse-service 1.8s ease-out infinite;' : ''}
        "></div>
        <div style="
          position: absolute;
          width: ${coreSize + 8}px;
          height: ${coreSize + 8}px;
          border-radius: 999px;
          background: white;
          border: 2px solid ${poi.color ?? '#D32F2F'};
        "></div>
        <div style="
          position: relative;
          width: ${coreSize}px;
          height: ${coreSize}px;
          border-radius: 999px;
          background: linear-gradient(135deg, ${poi.color ?? '#D32F2F'}, ${(poi.color ?? '#D32F2F')}CC);
          box-shadow: 0 4px 12px ${(poi.color ?? '#D32F2F')}55;
        "></div>
      </div>
    `,
  });
}

function createPopupHtml(poi: H5Poi): string {
  const meta = LAYER_META[poi.layer];

  if (poi.layer === 'team') {
    return `
      <div style="width: 240px; font-family: 'Noto Sans SC', sans-serif; color: #1f2937;">
        <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:10px;">
          <div>
            <div style="font-size:11px; letter-spacing:0.18em; text-transform:uppercase; color:#6b7280;">${meta.label}</div>
            <div style="margin-top:4px; font-size:18px; font-weight:900; color:${CHANGSHA_TEAM.color}; font-family:'Noto Serif SC', serif;">${CHANGSHA_TEAM.fullName}</div>
          </div>
          <div style="padding:6px 10px; border-radius:999px; background:${CHANGSHA_TEAM.color}14; color:${CHANGSHA_TEAM.color}; font-size:11px; font-weight:700;">长沙示例</div>
        </div>
        <div style="padding:12px 14px; border-radius:16px; background:linear-gradient(135deg, ${CHANGSHA_TEAM.color}14, rgba(255,255,255,0.96)); border:1px solid rgba(229,231,235,0.9);">
          <div style="font-size:13px; font-weight:700; color:${CHANGSHA_TEAM.color};">${CHANGSHA_FEATURE?.slogan ?? '星城出征，所向披靡！'}</div>
          <div style="margin-top:8px; font-size:13px; line-height:1.7; color:#4b5563;">${CHANGSHA_FEATURE?.story ?? poi.detail}</div>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:10px;">
          <div style="padding:10px 12px; border-radius:14px; background:#F8FAFC; border:1px solid #E5E7EB;">
            <div style="font-size:11px; color:#6b7280; letter-spacing:0.12em; text-transform:uppercase;">主场</div>
            <div style="margin-top:6px; font-size:12px; font-weight:700; color:#111827;">${CHANGSHA_TEAM.stadium}</div>
          </div>
          <div style="padding:10px 12px; border-radius:14px; background:#F8FAFC; border:1px solid #E5E7EB;">
            <div style="font-size:11px; color:#6b7280; letter-spacing:0.12em; text-transform:uppercase;">战绩</div>
            <div style="margin-top:6px; font-size:12px; font-weight:700; color:#111827;">${CHANGSHA_FEATURE?.lastSeasonRecord ?? '上赛季常规赛第 1，最终获得季军。'}</div>
          </div>
        </div>
      </div>
    `;
  }

  if (poi.layer === 'stadium') {
    return `
      <div style="width: 236px; font-family: 'Noto Sans SC', sans-serif; color: #1f2937;">
        <div style="font-size:11px; letter-spacing:0.18em; text-transform:uppercase; color:#6b7280;">${meta.label}</div>
        <div style="margin-top:4px; font-size:18px; font-weight:900; color:${poi.color ?? '#C62828'}; font-family:'Noto Serif SC', serif;">${poi.title}</div>
        <div style="margin-top:4px; display:inline-flex; padding:4px 10px; border-radius:999px; background:${poi.color ?? '#C62828'}14; color:${poi.color ?? '#C62828'}; font-size:11px; font-weight:700;">${poi.subtitle}</div>
        <div style="margin-top:12px; padding:12px 14px; border-radius:16px; background:#F8FAFC; border:1px solid #E5E7EB; font-size:13px; line-height:1.7; color:#4b5563;">
          ${poi.detail}
        </div>
        <div style="margin-top:10px; font-size:12px; color:#374151; line-height:1.7;">
          <strong style="color:#111827;">关联球队：</strong>${CHANGSHA_TEAM.fullName}<br />
          <strong style="color:#111827;">观赛提示：</strong>适合与球队层联动展示主场与周边配套。
        </div>
      </div>
    `;
  }

  return `
    <div style="width: 228px; font-family: 'Noto Sans SC', sans-serif; color: #1f2937;">
      <div style="display:flex; align-items:center; justify-content:space-between; gap:12px;">
        <div style="font-size:11px; letter-spacing:0.18em; text-transform:uppercase; color:#6b7280;">${meta.label}</div>
        <div style="padding:4px 8px; border-radius:999px; background:${poi.color ?? '#D32F2F'}14; color:${poi.color ?? '#D32F2F'}; font-size:11px; font-weight:700;">长沙示例</div>
      </div>
      <div style="margin-top:6px; font-size:17px; font-weight:900; color:${poi.color ?? '#D32F2F'}; font-family:'Noto Serif SC', serif;">${poi.title}</div>
      <div style="margin-top:4px; font-size:12px; color:#6b7280;">${poi.subtitle}</div>
      <div style="margin-top:12px; padding:12px 14px; border-radius:16px; background:#F8FAFC; border:1px solid #E5E7EB; font-size:13px; line-height:1.7; color:#4b5563;">
        ${poi.detail}
      </div>
      <div style="margin-top:10px; font-size:12px; color:#374151; line-height:1.7;">
        <strong style="color:#111827;">服务定位：</strong>${meta.hint}<br />
        <strong style="color:#111827;">联动建议：</strong>适合与比赛日动线、球迷服务或文旅推荐一起展示。
      </div>
    </div>
  `;
}

export default function HunanMap({
  onTeamSelect,
  selectedTeam,
  show3D,
  onToggle3D,
  resetViewSignal = 0,
  transitionMode = 'ripple',
}: HunanMapProps) {
  const isMobile = useIsMobile();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const overviewLockedTeamRef = useRef<string | null>(null);
  const serviceMarkersRef = useRef<Map<string, L.Marker>>(new Map());
  const connectionLinesRef = useRef<L.LayerGroup | null>(null);
  const cityLayersRef = useRef<Map<string, L.GeoJSON>>(new Map());
  const [mapReady, setMapReady] = useState(false);
  const [geoLoaded, setGeoLoaded] = useState(false);
  const [activeServiceLayer, setActiveServiceLayer] = useState<PoiLayer>('team');
  const [activeServicePoiId, setActiveServicePoiId] = useState<string>('team-changsha');
  const [legendExpanded, setLegendExpanded] = useState(true);
  const [mapSwitchPlayKey, setMapSwitchPlayKey] = useState(0);
  const [mapSwitchFrame, setMapSwitchFrame] = useState<MapSwitchFrame | null>(null);

  const activeServicePoi = useMemo(() => {
    return CHANGSHA_DEMO_POIS.find((poi) => poi.id === activeServicePoiId) ?? CHANGSHA_DEMO_POIS[0] ?? null;
  }, [activeServicePoiId]);

  const currentLayerPois = useMemo(() => {
    return CHANGSHA_DEMO_POIS.filter((poi) => poi.layer === activeServiceLayer);
  }, [activeServiceLayer]);

  const replayMapSwitch = useCallback(() => {
    setMapSwitchPlayKey((value) => value + 1);
  }, []);

  const updateMapSwitchFrame = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const northWest = map.latLngToContainerPoint(HUNAN_OVERVIEW_BOUNDS.getNorthWest());
    const southEast = map.latLngToContainerPoint(HUNAN_OVERVIEW_BOUNDS.getSouthEast());
    const geoWidth = Math.abs(southEast.x - northWest.x);
    const geoHeight = Math.abs(southEast.y - northWest.y);

    if (geoWidth < 24 || geoHeight < 24) return;

    const frameWidthFromBounds = geoWidth / MAP_SWITCH_ASSET.visible.width;
    const frameHeightFromBounds = geoHeight / MAP_SWITCH_ASSET.visible.height;
    const frameWidth = Math.max(frameWidthFromBounds, frameHeightFromBounds * MAP_SWITCH_ASSET.aspect);
    const frameHeight = frameWidth / MAP_SWITCH_ASSET.aspect;
    const changshaPoint = map.latLngToContainerPoint([CHANGSHA_TEAM.lat, CHANGSHA_TEAM.lng]);
    const left = changshaPoint.x - frameWidth * (MAP_SWITCH_ASSET.changsha.x / 100);
    const top = changshaPoint.y - frameHeight * (MAP_SWITCH_ASSET.changsha.y / 100);

    const nodes = teams
      .filter((team) => team.id !== CHANGSHA_TEAM.id)
      .map((team, index) => {
        const point = map.latLngToContainerPoint([team.lat, team.lng]);
        return {
          id: team.id,
          x: ((point.x - left) / frameWidth) * 100,
          y: ((point.y - top) / frameHeight) * 100,
          delay: index * 0.055,
        };
      });

    setMapSwitchFrame({
      left,
      top,
      width: frameWidth,
      height: frameHeight,
      impact: MAP_SWITCH_ASSET.changsha,
      nodes,
    });
  }, []);

  const focusChangshaDemo = useCallback((layer: PoiLayer, immediate = false) => {
    if (!mapInstanceRef.current) return;
    const zoom = layer === 'team' ? 10.6 : layer === 'stadium' ? 13.2 : 13.8;
    mapInstanceRef.current.flyTo(CHANGSHA_DEMO_CENTER, zoom, {
      duration: immediate ? 0 : 1,
      easeLinearity: 0.25,
    });
  }, []);

  const handleLayerSwitch = useCallback((layer: PoiLayer) => {
    overviewLockedTeamRef.current = null;
    const firstPoi = CHANGSHA_DEMO_POIS.find((poi) => poi.layer === layer);
    setActiveServiceLayer(layer);
    setActiveServicePoiId(firstPoi?.id ?? 'team-changsha');
    setLegendExpanded(true);

    if (layer === 'team' || layer === 'stadium') {
      onTeamSelect(CHANGSHA_TEAM);
    } else if (selectedTeam?.id === 'changsha') {
      onTeamSelect(null);
    }
  }, [onTeamSelect, selectedTeam]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: HUNAN_CENTER,
      zoom: 7.8,
      minZoom: 6,
      maxZoom: 14,
      zoomControl: false,
      attributionControl: false,
      maxBounds: [
        [23.5, 107.5],
        [31.5, 115.5],
      ],
    });

    let tiandituLoaded = false;
    let tiandituErrorCount = 0;
    let fallbackBaseLayer: L.TileLayer | null = null;
    const tiandituLayers: L.TileLayer[] = [];

    const addFallbackBaseLayer = () => {
      if (fallbackBaseLayer) return;
      console.warn('Tianditu tiles failed to load; falling back to the original Chinese base map.');
      tiandituLayers.forEach((layer) => layer.remove());
      fallbackBaseLayer = L.tileLayer(FALLBACK_BASE_TILE_URL, {
        subdomains: ['1', '2', '3', '4'],
        maxZoom: 18,
      }).addTo(map);
    };

    if (!TIANDITU_TOKEN) {
      console.warn('VITE_TIANDITU_TOKEN is missing; using fallback base map.');
      addFallbackBaseLayer();
    } else {
      const handleTiandituTileLoad = () => {
        tiandituLoaded = true;
      };
      const handleTiandituTileError = () => {
        tiandituErrorCount += 1;
        if (!tiandituLoaded && tiandituErrorCount >= 8) {
          addFallbackBaseLayer();
        }
      };

      const vecLayer = L.tileLayer(tiandituTileUrl('vec_w'), {
        subdomains: TIANDITU_SUBDOMAINS,
        maxZoom: 18,
        attribution: '© 天地图',
      }).on('tileload', handleTiandituTileLoad).on('tileerror', handleTiandituTileError);

      const labelLayer = L.tileLayer(tiandituTileUrl('cva_w'), {
        subdomains: TIANDITU_SUBDOMAINS,
        maxZoom: 18,
        attribution: '© 天地图',
      }).on('tileload', handleTiandituTileLoad).on('tileerror', handleTiandituTileError);

      tiandituLayers.push(vecLayer, labelLayer);
      vecLayer.addTo(map);
      labelLayer.addTo(map);
    }

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const collapseLegend = () => {
      setLegendExpanded(false);
      overviewLockedTeamRef.current = null;
    };

    map.on('dragstart', collapseLegend);
    map.on('zoomstart', collapseLegend);
    map.on('click', collapseLegend);

    mapInstanceRef.current = map;
    setMapReady(true);

    return () => {
      map.off('dragstart', collapseLegend);
      map.off('zoomstart', collapseLegend);
      map.off('click', collapseLegend);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;

    const map = mapInstanceRef.current;
    let frameId = 0;
    const refreshFrame = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(updateMapSwitchFrame);
    };

    refreshFrame();
    map.on('moveend zoomend resize', refreshFrame);
    window.addEventListener('resize', refreshFrame);

    return () => {
      window.cancelAnimationFrame(frameId);
      map.off('moveend zoomend resize', refreshFrame);
      window.removeEventListener('resize', refreshFrame);
    };
  }, [mapReady, updateMapSwitchFrame]);

  // Load GeoJSON data and render city regions
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || geoLoaded) return;
    const map = mapInstanceRef.current;

    const loadGeoData = async () => {
      try {
        const [citiesRes, outlineRes] = await Promise.all([
          fetch(CITIES_GEOJSON_URL),
          fetch(OUTLINE_GEOJSON_URL),
        ]);
        const citiesData = await citiesRes.json();
        const outlineData = await outlineRes.json();

        const outlineCoords = outlineData.features[0].geometry.coordinates;
        const worldBounds: [number, number][] = [
          [-90, -180], [-90, 180], [90, 180], [90, -180], [-90, -180],
        ];

        let mainRing: number[][] = [];
        if (outlineData.features[0].geometry.type === 'MultiPolygon') {
          let maxLen = 0;
          for (const poly of outlineCoords) {
            if (poly[0] && poly[0].length > maxLen) {
              maxLen = poly[0].length;
              mainRing = poly[0];
            }
          }
        } else {
          mainRing = outlineCoords[0];
        }

        const maskCoords: [number, number][][] = [
          worldBounds,
          mainRing.map((c: number[]) => [c[1], c[0]] as [number, number]),
        ];

        L.polygon(maskCoords, {
          fillColor: '#F5F0EB',
          fillOpacity: 0.75,
          stroke: false,
          interactive: false,
        }).addTo(map);

        citiesData.features.forEach((feature: any) => {
          const cityName = feature.properties.name;
          const team = cityTeamMap[cityName];

          const cityLayer = L.geoJSON(feature, {
            style: () => ({
              fillColor: team ? team.color : DEFAULT_CITY_COLOR,
              fillOpacity: team ? 0.18 : 0.08,
              color: team ? team.color : DEFAULT_CITY_BORDER,
              weight: 1.2,
              opacity: team ? 0.45 : 0.25,
            }),
            onEachFeature: (_feat, layer) => {
              if (team) {
                layer.on({
                  mouseover: (e) => {
                    const currentLayer = e.target;
                    currentLayer.setStyle({
                      fillOpacity: 0.32,
                      weight: 2,
                      opacity: 0.7,
                    });
                    currentLayer.bringToFront();
                  },
                  mouseout: (e) => {
                    const isSelected = selectedTeam?.id === team.id;
                    const currentLayer = e.target;
                    currentLayer.setStyle({
                      fillOpacity: isSelected ? 0.28 : 0.18,
                      weight: isSelected ? 2.5 : 1.2,
                      opacity: isSelected ? 0.6 : 0.45,
                    });
                  },
                  click: () => {
                    overviewLockedTeamRef.current = null;
                    onTeamSelect(team);
                  },
                });
              }
            },
          }).addTo(map);

          cityLayersRef.current.set(cityName, cityLayer);
        });

        L.geoJSON(outlineData, {
          style: () => ({
            fillColor: 'transparent',
            fillOpacity: 0,
            color: '#C62828',
            weight: 3.5,
            opacity: 0.8,
            lineCap: 'round' as any,
            lineJoin: 'round' as any,
          }),
          interactive: false,
        }).addTo(map);

        teams.forEach((team) => {
          const cityFeature = citiesData.features.find((f: any) => f.properties.name === team.city);
          if (cityFeature) {
            const center = cityFeature.properties.center;
            const label = L.divIcon({
              className: 'city-label',
              iconSize: [80, 20],
              iconAnchor: [40, -18],
              html: `<div style="
                text-align: center;
                font-size: 10px;
                font-family: 'Noto Sans SC', sans-serif;
                font-weight: 600;
                color: ${team.color};
                text-shadow: 0 0 4px white, 0 0 4px white, 0 0 4px white, 0 0 4px white;
                white-space: nowrap;
                pointer-events: none;
                opacity: 0.85;
              ">${team.city.replace('市', '').replace('土家族苗族自治州', '')}</div>`,
            });
            L.marker([center[1], center[0]], { icon: label, interactive: false }).addTo(map);
          }
        });

        setGeoLoaded(true);
      } catch (err) {
        console.error('Failed to load GeoJSON:', err);
      }
    };

    loadGeoData();
  }, [mapReady, geoLoaded, onTeamSelect, selectedTeam]);

  // Subtle persistent digital connection lines, matching the final stage of the transition.
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !geoLoaded) return;
    const map = mapInstanceRef.current;

    connectionLinesRef.current?.remove();
    const connectionGroup = L.layerGroup();

    teams
      .filter((team) => team.id !== CHANGSHA_TEAM.id)
      .forEach((team) => {
        L.polyline(
          [
            [CHANGSHA_TEAM.lat, CHANGSHA_TEAM.lng],
            [team.lat, team.lng],
          ],
          {
            color: '#F59E0B',
            weight: 1.15,
            opacity: 0.22,
            dashArray: '6 10',
            lineCap: 'round',
            lineJoin: 'round',
            interactive: false,
            className: 'xiangchao-connection-line',
          },
        ).addTo(connectionGroup);
      });

    connectionGroup.addTo(map);
    connectionLinesRef.current = connectionGroup;

    return () => {
      connectionGroup.remove();
      if (connectionLinesRef.current === connectionGroup) {
        connectionLinesRef.current = null;
      }
    };
  }, [geoLoaded, mapReady]);

  // Add team markers
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !geoLoaded) return;
    const map = mapInstanceRef.current;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    teams.forEach((team, index) => {
      setTimeout(() => {
        if (!mapInstanceRef.current) return;
        const isSelected = selectedTeam?.id === team.id;
        const marker = L.marker([team.lat, team.lng], {
          icon: createStampMarker(team, isSelected),
          zIndexOffset: isSelected ? 1000 : (10 - team.rank) * 10,
        });

        if (team.id === 'changsha') {
          const teamPoi = CHANGSHA_DEMO_POIS.find((poi) => poi.layer === 'team');
          if (teamPoi) {
            marker.bindPopup(createPopupHtml(teamPoi), {
              closeButton: false,
              autoPanPadding: [24, 24],
              offset: [0, -16],
              className: 'xiangchao-map-popup',
              maxWidth: 260,
              minWidth: 220,
            });
            marker.on('popupopen', () => {
              setActiveServicePoiId(teamPoi.id);
            });
          }
        }

        marker.on('click', () => {
          overviewLockedTeamRef.current = null;
          onTeamSelect(team);
          if (team.id === 'changsha') {
            setActiveServiceLayer('team');
            setActiveServicePoiId('team-changsha');
          }
        });

        marker.addTo(map);
        markersRef.current.set(team.id, marker);
      }, 100 + index * 60);
    });
  }, [mapReady, geoLoaded, onTeamSelect, selectedTeam]);

  // Keep Changsha demo zoom stable when switching layers
  useEffect(() => {
    if (!mapReady || !geoLoaded || show3D) return;

    if (activeServiceLayer !== 'team') {
      focusChangshaDemo(activeServiceLayer);
      return;
    }

    if (selectedTeam?.id === 'changsha') {
      focusChangshaDemo('team');
    }
  }, [activeServiceLayer, focusChangshaDemo, geoLoaded, mapReady, selectedTeam, show3D]);

  // Render Changsha service example markers according to active layer
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !geoLoaded) return;

    serviceMarkersRef.current.forEach((marker) => marker.remove());
    serviceMarkersRef.current.clear();

    if (show3D) return;

    if (activeServiceLayer === 'team') {
      const changshaMarker = markersRef.current.get('changsha');
      if (changshaMarker && selectedTeam?.id === 'changsha' && !isMobile) {
        setTimeout(() => {
          changshaMarker.openPopup();
        }, 120);
      }
      return;
    }

    const map = mapInstanceRef.current;

    currentLayerPois.forEach((poi) => {
      const marker = L.marker([poi.lat, poi.lng], {
        icon: createServiceMarker(poi, activeServicePoiId === poi.id),
        zIndexOffset: activeServicePoiId === poi.id ? 1800 : 1200,
      });

      marker.bindPopup(createPopupHtml(poi), {
        closeButton: false,
        autoPanPadding: [24, 24],
        offset: [0, -16],
        className: 'xiangchao-map-popup',
        maxWidth: 260,
        minWidth: 220,
      });

      marker.on('click', () => {
        setActiveServicePoiId(poi.id);
        if (poi.layer === 'stadium') {
          onTeamSelect(CHANGSHA_TEAM);
        }
      });

      marker.on('popupopen', () => {
        setActiveServicePoiId(poi.id);
      });

      marker.addTo(map);
      serviceMarkersRef.current.set(poi.id, marker);

      if (activeServicePoiId === poi.id && !isMobile) {
        setTimeout(() => marker.openPopup(), 120);
      }
    });
  }, [activeServiceLayer, activeServicePoiId, currentLayerPois, geoLoaded, isMobile, mapReady, onTeamSelect, selectedTeam, show3D]);

  // Update markers and city highlights when selection changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    markersRef.current.forEach((marker, teamId) => {
      const team = teams.find((current) => current.id === teamId);
      if (!team) return;
      const isSelected = selectedTeam?.id === teamId;
      marker.setIcon(createStampMarker(team, isSelected));
      marker.setZIndexOffset(isSelected ? 1000 : (10 - team.rank) * 10);
    });

    cityLayersRef.current.forEach((layer, cityName) => {
      const team = cityTeamMap[cityName];
      if (!team) return;
      const isSelected = selectedTeam?.id === team.id;
      layer.setStyle({
        fillOpacity: isSelected ? 0.30 : 0.18,
        weight: isSelected ? 2.5 : 1.2,
        opacity: isSelected ? 0.65 : 0.45,
        color: team.color,
        fillColor: team.color,
      });
    });

    if (selectedTeam) {
      if (overviewLockedTeamRef.current === selectedTeam.id) {
        return;
      }

      if (selectedTeam.id === 'changsha' && activeServiceLayer !== 'team') {
        return;
      }

      const zoom = selectedTeam.id === 'changsha' ? 10.6 : 9.5;
      map.flyTo([selectedTeam.lat, selectedTeam.lng], zoom, {
        duration: 1.2,
        easeLinearity: 0.25,
      });

      if (selectedTeam.id === 'changsha' && activeServiceLayer === 'team' && !isMobile) {
        setTimeout(() => {
          markersRef.current.get('changsha')?.openPopup();
        }, 160);
      }
    }
  }, [activeServiceLayer, isMobile, selectedTeam]);

  // Reset view when exiting 3D and no team selected
  useEffect(() => {
    if (!show3D && !selectedTeam && activeServiceLayer === 'team' && mapInstanceRef.current) {
      mapInstanceRef.current.fitBounds(HUNAN_OVERVIEW_BOUNDS, {
        ...getOverviewFitOptions(isMobile),
        animate: true,
        duration: 1,
      });
    }
  }, [activeServiceLayer, isMobile, show3D, selectedTeam]);

  // Explicit overview command from the floating "总览" button.
  useEffect(() => {
    if (!resetViewSignal || !mapReady || !mapInstanceRef.current || show3D) return;

    overviewLockedTeamRef.current = selectedTeam?.id ?? null;
    setActiveServiceLayer('team');
    setActiveServicePoiId('team-changsha');
    setLegendExpanded(false);

    mapInstanceRef.current.closePopup();
    mapInstanceRef.current.fitBounds(HUNAN_OVERVIEW_BOUNDS, {
      ...getOverviewFitOptions(isMobile),
      animate: true,
      duration: 0.72,
    });

    window.setTimeout(() => {
      updateMapSwitchFrame();
      replayMapSwitch();
    }, 180);
  }, [geoLoaded, isMobile, mapReady, replayMapSwitch, resetViewSignal, show3D, updateMapSwitchFrame]);

  return (
    <div className="relative h-full w-full">
      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(0.92); opacity: 0.8; }
          70% { transform: scale(1.12); opacity: 0; }
          100% { transform: scale(1.12); opacity: 0; }
        }
        @keyframes pulse-service {
          0% { transform: scale(0.92); opacity: 0.9; }
          70% { transform: scale(1.18); opacity: 0; }
          100% { transform: scale(1.18); opacity: 0; }
        }
        .xiangchao-connection-line {
          filter: drop-shadow(0 0 5px rgba(245, 158, 11, 0.24));
        }
        .xiangchao-map-popup .leaflet-popup-content-wrapper {
          border-radius: 20px;
          box-shadow: 0 18px 40px rgba(15, 23, 42, 0.16);
          padding: 0;
          border: 1px solid rgba(255,255,255,0.8);
          background: rgba(255,255,255,0.98);
        }
        .xiangchao-map-popup .leaflet-popup-content {
          margin: 14px;
        }
        .xiangchao-map-popup .leaflet-popup-tip {
          background: rgba(255,255,255,0.98);
          box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
        }
      `}</style>

      <div ref={mapRef} className="h-full w-full" />
      {geoLoaded && !show3D ? (
        <MapImageSwitchOverlay playKey={mapSwitchPlayKey} frame={mapSwitchFrame} mode={transitionMode} />
      ) : null}

      <AnimatePresence>
        {show3D && selectedTeam && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Satellite3DMap team={selectedTeam} onClose={onToggle3D} />
          </motion.div>
        )}
      </AnimatePresence>

      {!show3D && (
        <>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="hidden lg:block absolute left-2 top-2 sm:left-4 sm:top-4 z-[920]"
          >
            <AnimatePresence mode="wait">
              {legendExpanded ? (
                <motion.div
                  key="legend-expanded"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="w-[300px] sm:w-[340px] max-w-[calc(100vw-3rem)] rounded-[18px] sm:rounded-[26px] border border-white/80 bg-white/92 p-3 sm:p-4 shadow-[0_18px_40px_rgba(15,23,42,0.10)] backdrop-blur-xl"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[11px] tracking-[0.22em] text-[oklch(0.55_0.02_260)]">长沙示例</div>
                      <h3 className="mt-1 text-lg font-black text-[oklch(0.18_0.02_260)]" style={{ fontFamily: "'Noto Serif SC', serif" }}>
                        长沙服务图层示例
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="rounded-full bg-[#D32F2F]/10 px-3 py-1 text-[11px] font-semibold text-[#D32F2F]">
                        已集成到地图
                      </div>
                      <button
                        onClick={() => setLegendExpanded(false)}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-[oklch(0.90_0.005_260)] bg-white/85 text-[oklch(0.38_0.02_260)] transition hover:border-[#D32F2F]/20 hover:text-[#D32F2F]"
                        aria-label="收起图例"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <p className="mt-3 text-xs leading-6 text-[oklch(0.44_0.02_260)]">
                    这里先以长沙做交互样例。切换图层后，地图会自动聚焦贺龙体育场周边，并通过点位弹窗展示球队、场馆和周边服务信息。你拖动、缩放或点击地图时，图例会自动收起，减少对地图视野的遮挡。
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {h5LayerOptions.map((layer) => {
                      const isActive = layer.id === activeServiceLayer;
                      const color = CHANGSHA_DEMO_POIS.find((poi) => poi.layer === layer.id)?.color ?? '#D32F2F';
                      return (
                        <button
                          key={layer.id}
                          onClick={() => handleLayerSwitch(layer.id)}
                          className={`rounded-full border px-3 py-2 text-xs font-semibold transition-all ${
                            isActive
                              ? 'border-transparent text-white shadow-lg'
                              : 'border-[oklch(0.90_0.005_260)] bg-[oklch(0.985_0.002_260)] text-[oklch(0.38_0.02_260)] hover:border-[#D32F2F]/18'
                          }`}
                          style={
                            isActive
                              ? {
                                  background: `linear-gradient(135deg, ${color}, ${color}CC)`,
                                  boxShadow: `0 10px 20px ${color}24`,
                                }
                              : undefined
                          }
                        >
                          {layer.label}
                        </button>
                      );
                    })}
                  </div>

                  {activeServicePoi ? (
                    <div className="mt-4 rounded-[22px] border border-[oklch(0.92_0.005_260)] bg-[oklch(0.985_0.002_260)] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-[11px] tracking-[0.18em] text-[oklch(0.55_0.02_260)]">
                            {LAYER_META[activeServiceLayer].label}
                          </div>
                          <div className="mt-1 text-base font-black text-[oklch(0.18_0.02_260)]" style={{ fontFamily: "'Noto Serif SC', serif" }}>
                            {activeServicePoi.title}
                          </div>
                        </div>
                        <div
                          className="h-10 w-10 rounded-2xl"
                          style={{ background: `linear-gradient(135deg, ${activeServicePoi.color ?? '#D32F2F'}, ${(activeServicePoi.color ?? '#D32F2F')}CC)` }}
                        />
                      </div>
                      <div className="mt-2 text-xs font-semibold" style={{ color: activeServicePoi.color ?? '#D32F2F' }}>
                        {activeServicePoi.subtitle}
                      </div>
                      <p className="mt-3 text-sm leading-6 text-[oklch(0.42_0.02_260)]">{activeServicePoi.detail}</p>
                      <div className="mt-3 rounded-2xl bg-white px-3 py-3 text-xs leading-6 text-[oklch(0.48_0.02_260)]">
                        交互方式：点击图层按钮切换点位；点击地图地标打开弹窗；球队与场馆层可联动右侧球队详情面板，服务层则聚焦商家简介与观赛动线。
                      </div>
                    </div>
                  ) : null}
                </motion.div>
              ) : (
                <motion.button
                  key="legend-collapsed"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onClick={() => setLegendExpanded(true)}
                  className="flex items-center gap-2 sm:gap-3 rounded-full border border-white/80 bg-white/92 px-3 py-2.5 sm:px-4 sm:py-3 shadow-[0_12px_30px_rgba(15,23,42,0.10)] backdrop-blur-xl transition hover:shadow-[0_14px_34px_rgba(15,23,42,0.14)]"
                >
                  <div
                    className="h-9 w-9 rounded-full"
                    style={{ background: `linear-gradient(135deg, ${activeServicePoi?.color ?? '#D32F2F'}, ${(activeServicePoi?.color ?? '#D32F2F')}CC)` }}
                  />
                  <div className="text-left">
                    <div className="text-[10px] tracking-[0.2em] text-[oklch(0.55_0.02_260)]">长沙图例</div>
                    <div className="mt-0.5 text-sm font-bold text-[oklch(0.18_0.02_260)]">{LAYER_META[activeServiceLayer].label} · {activeServicePoi?.title ?? '查看详情'}</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[oklch(0.42_0.02_260)]" />
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>

          <div className="absolute inset-0 pointer-events-none z-[500]">
            <div className="absolute left-0 right-0 top-0 h-8 bg-gradient-to-b from-[#F5F0EB]/50 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#F5F0EB]/50 to-transparent" />
            <div className="absolute bottom-0 top-0 left-0 w-4 bg-gradient-to-r from-[#F5F0EB]/30 to-transparent" />
          </div>

          <div className="pointer-events-none absolute bottom-5 left-4 z-[760] hidden rounded-2xl border border-white/80 bg-white/88 px-3 py-2 shadow-lg shadow-black/5 backdrop-blur-md md:flex md:items-center md:gap-2">
            {layerIcon(activeServiceLayer)}
            <span className="text-xs text-[oklch(0.42_0.02_260)]">当前图层：长沙 · {LAYER_META[activeServiceLayer].label} · 图例已支持自动收起</span>
          </div>

        </>
      )}
    </div>
  );
}

function layerIcon(layer: PoiLayer) {
  if (layer === 'team') return <Trophy className="h-3.5 w-3.5 text-[#D32F2F]" />;
  if (layer === 'stadium') return <MapPinned className="h-3.5 w-3.5 text-[#C62828]" />;
  if (layer === 'food') return <Store className="h-3.5 w-3.5 text-[#FF8A65]" />;
  if (layer === 'hotel') return <Building2 className="h-3.5 w-3.5 text-[#5C6BC0]" />;
  if (layer === 'parking') return <CarFront className="h-3.5 w-3.5 text-[#607D8B]" />;
  return <Soup className="h-3.5 w-3.5 text-[#FFB300]" />;
}
