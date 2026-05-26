// 湘超10支主要队伍数据
// Design: 「湘火燎原」国潮运动风格 - 每支队伍带有印章式标识

export interface Team {
  id: string;
  name: string;
  city: string;
  fullName: string;
  rank: number;
  rankLabel: string;
  stadium: string;
  lat: number;
  lng: number;
  stats: {
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDiff: number;
    points: number;
  };
  badgeDesc: string;
  color: string;
  slogan: string;
  stadiumImage: string;
  highlights: string[];
}

export const STADIUM_IMAGES = {
  night: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663486523138/6NztyHB5jaNJh8ykWoD3oc/stadium-3d-1-GLRtzoUhTYxNNgF2ngMgca.webp',
  entrance: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663486523138/6NztyHB5jaNJh8ykWoD3oc/stadium-3d-2-Ak6P3BwyAm76zhW9LBrEUa.webp',
  aerial: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663486523138/6NztyHB5jaNJh8ykWoD3oc/stadium-3d-3-5iVFwzPz6Zux8AXJZ5qNHU.webp',
};

// 高品质AI生成的3D体育场渲染图
export const STADIUM_RENDERS: Record<string, string> = {
  changsha: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663486523138/6NztyHB5jaNJh8ykWoD3oc/stadium-changsha-DxdVsbuDRvtbWwHZ8jRJfF.png',
  yongzhou: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663486523138/6NztyHB5jaNJh8ykWoD3oc/stadium-yongzhou-hTucoKo3DJanm64A8LGvmb.png',
  changde: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663486523138/6NztyHB5jaNJh8ykWoD3oc/stadium-changde-kJc8E2oBaSyCTu8EYDqLcF.png',
  zhuzhou: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663486523138/6NztyHB5jaNJh8ykWoD3oc/stadium-zhuzhou-cNgPzNBSfmihNy6Uq6EozW.png',
  loudi: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663486523138/6NztyHB5jaNJh8ykWoD3oc/stadium-loudi-f26beeHuceeN8DJMti8htk.png',
  hengyang: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663486523138/6NztyHB5jaNJh8ykWoD3oc/stadium-hengyang-84Xqu52MQdnRwjVgBWeuzy.png',
  chenzhou: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663486523138/6NztyHB5jaNJh8ykWoD3oc/stadium-chenzhou-ifyfFULdrdkoRDPp9j6VhA.png',
  yueyang: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663486523138/6NztyHB5jaNJh8ykWoD3oc/stadium-yueyang-oCixyQcUGabV4YrVHHkPMd.png',
  yiyang: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663486523138/6NztyHB5jaNJh8ykWoD3oc/stadium-yiyang-5cCfQX97pGu6xpw7HKnGGj.png',
  shaoyang: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663486523138/6NztyHB5jaNJh8ykWoD3oc/stadium-shaoyang-D4jmsANe7dMYMtY4b2Bsrd.png',
};

export const HERO_BANNER = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663486523138/6NztyHB5jaNJh8ykWoD3oc/hero-banner-Bx9zkxrHNgVg3S4ARo4Ryw.webp';
export const INK_TEXTURE = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663486523138/6NztyHB5jaNJh8ykWoD3oc/ink-texture-bg-gFv2M9cXCt2d5SgQYzdxWr.webp';

const stadiumImgList = [STADIUM_IMAGES.night, STADIUM_IMAGES.entrance, STADIUM_IMAGES.aerial];

export const teams: Team[] = [
  {
    id: 'yongzhou',
    name: '永州',
    city: '永州市',
    fullName: '湘超永州队',
    rank: 1,
    rankLabel: '冠军',
    stadium: '永州市体育场',
    lat: 26.42,
    lng: 111.61,
    stats: { played: 13, won: 6, drawn: 4, lost: 3, goalsFor: 24, goalsAgainst: 14, goalDiff: 10, points: 22 },
    badgeDesc: '融入永州文旅slogan，主体"走"字形似一个人踢足球',
    color: '#E63B2E',
    slogan: '永冲锋！不喊口号不吹牛',
    stadiumImage: stadiumImgList[0],
    highlights: ['淘汰赛黑马逆袭夺冠', '决赛1-0战胜常德', '最佳运动员高响', '最佳守门员唐嘉年', '最佳教练黄楚儒'],
  },
  {
    id: 'changde',
    name: '常德',
    city: '常德市',
    fullName: '湘超常德队',
    rank: 2,
    rankLabel: '亚军',
    stadium: '常德体育中心体育场',
    lat: 29.05,
    lng: 111.69,
    stats: { played: 13, won: 8, drawn: 2, lost: 3, goalsFor: 26, goalsAgainst: 12, goalDiff: 14, points: 26 },
    badgeDesc: '足球元素+盾牌轮廓，彰显球队的坚实防守与不屈意志',
    color: '#C8A84E',
    slogan: '常德伢子，霸蛮上场！',
    stadiumImage: stadiumImgList[1],
    highlights: ['常规赛第3名', '最佳射手赵文荻', '第三轮4-0张家界登顶', '半决赛点球淘汰株洲'],
  },
  {
    id: 'changsha',
    name: '长沙',
    city: '长沙市',
    fullName: '湘超长沙队',
    rank: 3,
    rankLabel: '季军',
    stadium: '长沙贺龙体育场',
    lat: 28.23,
    lng: 112.97,
    stats: { played: 13, won: 11, drawn: 2, lost: 0, goalsFor: 26, goalsAgainst: 4, goalDiff: 22, points: 35 },
    badgeDesc: '五星形态融合足球五边形，CS双C，杜鹃花+岳麓山+湘江流线',
    color: '#FF4444',
    slogan: '星城出征，所向披靡！',
    stadiumImage: stadiumImgList[0],
    highlights: ['常规赛不败战绩', '常规赛第1名(35分)', '仅失4球防守最佳', '揭幕战2-0娄底'],
  },
  {
    id: 'zhuzhou',
    name: '株洲',
    city: '株洲市',
    fullName: '湘超株洲队',
    rank: 4,
    rankLabel: '第4名',
    stadium: '株洲体育中心体育场',
    lat: 27.83,
    lng: 113.13,
    stats: { played: 13, won: 8, drawn: 3, lost: 2, goalsFor: 27, goalsAgainst: 10, goalDiff: 17, points: 27 },
    badgeDesc: '盾牌造型，顶部齿轮皇冠，底部火车头元素，呼应"火车拉来的城市"',
    color: '#FF6B35',
    slogan: '动力之都，全速冲锋！',
    stadiumImage: stadiumImgList[2],
    highlights: ['常规赛第2名', '进球数最多(27球)', '1/4决赛点球险胜郴州', '半决赛惜败常德'],
  },
  {
    id: 'loudi',
    name: '娄底',
    city: '娄底市',
    fullName: '湘超娄底队',
    rank: 5,
    rankLabel: '第5名',
    stadium: '娄底市体育中心体育场',
    lat: 27.73,
    lng: 112.00,
    stats: { played: 13, won: 6, drawn: 5, lost: 2, goalsFor: 15, goalsAgainst: 8, goalDiff: 7, points: 23 },
    badgeDesc: '火焰斗牛+LDFT字母，钢铁新城工业底蕴，银灰红紫渐变',
    color: '#9C27B0',
    slogan: '钢铁筑魂，牛气冲天！',
    stadiumImage: stadiumImgList[1],
    highlights: ['常规赛第4名', '防守稳固仅失8球', '3-0战胜湘西锁定第4', '火焰斗牛精神'],
  },
  {
    id: 'hengyang',
    name: '衡阳',
    city: '衡阳市',
    fullName: '湘超衡阳队',
    rank: 6,
    rankLabel: '第6名',
    stadium: '衡阳体育中心体育场',
    lat: 26.89,
    lng: 112.57,
    stats: { played: 13, won: 6, drawn: 2, lost: 5, goalsFor: 24, goalsAgainst: 16, goalDiff: 8, points: 20 },
    badgeDesc: '数字模型"领头雁"，体现科技新衡阳形象，手写字体传统亲近感',
    color: '#2196F3',
    slogan: '雁城雄飞，势不可挡！',
    stadiumImage: stadiumImgList[2],
    highlights: ['进攻火力强劲(24球)', '5-0大胜张家界', '主场场馆升级改造', '淘汰赛惜败常德'],
  },
  {
    id: 'chenzhou',
    name: '郴州',
    city: '郴州市',
    fullName: '湘超郴州队',
    rank: 7,
    rankLabel: '第7名',
    stadium: '郴州市体育中心体育场',
    lat: 25.77,
    lng: 113.01,
    stats: { played: 13, won: 4, drawn: 7, lost: 2, goalsFor: 20, goalsAgainst: 16, goalDiff: 4, points: 19 },
    badgeDesc: '盾牌+"郴"字图形，形似三名队员并肩作战',
    color: '#00BCD4',
    slogan: '林中之城，并肩作战！',
    stadiumImage: stadiumImgList[0],
    highlights: ['最多平局(7场)', '仅2场失利韧性十足', '末轮3-1衡阳挺进八强', '1/4决赛点球惜败株洲'],
  },
  {
    id: 'yueyang',
    name: '岳阳',
    city: '岳阳市',
    fullName: '湘超岳阳队',
    rank: 8,
    rankLabel: '第8名',
    stadium: '岳阳市体育中心体育场',
    lat: 29.37,
    lng: 113.13,
    stats: { played: 13, won: 5, drawn: 4, lost: 4, goalsFor: 10, goalsAgainst: 7, goalDiff: 3, points: 19 },
    badgeDesc: '盾牌+稻米+洞庭湖水纹+岳阳楼造型，渔米之乡',
    color: '#4CAF50',
    slogan: '洞庭之滨，先忧后乐！',
    stadiumImage: stadiumImgList[1],
    highlights: ['防守型球队(仅失7球)', '搭上淘汰赛末班车', '洞庭湖畔的足球梦', '1/4决赛不敌长沙'],
  },
  {
    id: 'yiyang',
    name: '益阳',
    city: '益阳市',
    fullName: '湘超益阳队',
    rank: 9,
    rankLabel: '第9名',
    stadium: '益阳奥林匹克公园体育场',
    lat: 28.55,
    lng: 112.36,
    stats: { played: 13, won: 5, drawn: 3, lost: 5, goalsFor: 16, goalsAgainst: 18, goalDiff: -2, points: 18 },
    badgeDesc: '盾牌+"Y"字+足球，背景为奥林匹克公园冠军林和山水',
    color: '#8BC34A',
    slogan: '银城铁骨，永不言弃！',
    stadiumImage: stadiumImgList[2],
    highlights: ['主场氛围热烈', '与郴州之战现场火爆', '遗憾未进淘汰赛', '奥林匹克公园主场'],
  },
  {
    id: 'shaoyang',
    name: '邵阳',
    city: '邵阳市',
    fullName: '湘超邵阳队',
    rank: 10,
    rankLabel: '第10名',
    stadium: '邵阳市体育中心体育场',
    lat: 27.24,
    lng: 111.47,
    stats: { played: 13, won: 2, drawn: 7, lost: 4, goalsFor: 10, goalsAgainst: 17, goalDiff: -7, points: 13 },
    badgeDesc: '以国家级非遗宝庆竹刻为创意，演绎"邵"字篆刻体',
    color: '#795548',
    slogan: '宝庆竹韵，坚韧如竹！',
    stadiumImage: stadiumImgList[0],
    highlights: ['最多平局之一(7场)', '非遗竹刻队徽创意', '宝庆文化底蕴深厚', '顽强拼搏精神'],
  },
];

// 湖南省边界GeoJSON简化数据（用于地图渲染）
export const HUNAN_CENTER: [number, number] = [27.8, 111.8];
export const HUNAN_BOUNDS: [[number, number], [number, number]] = [
  [24.6, 108.8],
  [30.1, 114.3],
];

// 赛事统计数据
export const leagueStats = {
  totalMatches: 98,
  totalGoals: 235,
  totalAttendance: '270,000,000+',
  tourismRevenue: '113.59亿',
  duration: '112天',
  cities: 14,
  champion: '永州队',
  mvp: '高响',
  topScorer: '赵文荻',
  bestGK: '唐嘉年',
  bestCoach: '黄楚儒',
};
