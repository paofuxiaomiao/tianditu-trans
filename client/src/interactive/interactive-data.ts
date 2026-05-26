/* ============================================================
   DATA MODEL: 湘超联赛数据
   Cyber Arena Design - All data for teams, players, matches
   ============================================================ */

export interface Player {
  id: string;
  name: string;
  number: number;
  position: '门将' | '后卫' | '中场' | '前锋';
  height: number;
  weight: number;
  goals: number;
  assists: number;
  baseRating: number;
  stats: {
    speed: number;
    shooting: number;
    passing: number;
    defense: number;
    stamina: number;
    technique: number;
  };
}

export interface Team {
  id: string;
  name: string;
  city: string;
  logo: string;
  color: string;
  accentColor: string;
  coach: string;
  coachStyle: string;
  slogan: string;
  cultureLine: string;
  stadiumName: string;
  founded: string;
  rank: number;
  points: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  votes: number;
  players: Player[];
  culture: {
    city: string;
    description: string;
    heritage: string;
    fanGroup: string;
    rituals: string[];
    banners: string[];
  };
}

export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  status: 'PREVIEW' | 'LIVE' | 'FULL TIME';
  time: string;
  round: number;
  summary: string;
}

export interface Comment {
  id: string;
  nickname: string;
  teamId: string;
  content: string;
  type: 'cheer' | 'review';
  timestamp: number;
}

export interface CheerSlogan {
  id: string;
  text: string;
  teamId: string;
  heat: number;
}

// 队徽URL映射
export const TEAM_LOGOS: Record<string, string> = {
  changsha: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663342549613/qeVmWFivCLzMEolP.jpg',
  zhuzhou: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663342549613/WIHFkuGLVqKgbUXV.jpg',
  xiangtan: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663342549613/XZiHEQeAXEBXXqpM.jpg',
  hengyang: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663342549613/LspAGDJBWwHqXvud.jpg',
  yueyang: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663342549613/dTRSBFnvlyUhHPlr.jpg',
  changde: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663342549613/gwHyYSrNgCwmnmhn.jpg',
  zhangjiajie: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663342549613/EStpyCWgtKCvEMId.jpg',
  yiyang: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663342549613/pbNNWejkWrPFNVuR.jpg',
  chenzhou: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663342549613/IUpwHSpfYZmXvugJ.jpg',
  yongzhou: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663342549613/WuXIikSTETjwDVrs.jpg',
  huaihua: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663342549613/oOwyArccYoPevpoV.jpg',
  loudi: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663342549613/kLTtySETHoLiIGxB.jpg',
  shaoyang: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663342549613/kwaOATEAWPKKjKYo.jpg',
  xiangxi: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663342549613/nMUpEOnnzFYFIMCF.jpg',
};

// 生成球员数据
function generatePlayers(teamId: string): Player[] {
  const positions: Array<{ pos: Player['position']; count: number }> = [
    { pos: '门将', count: 2 },
    { pos: '后卫', count: 5 },
    { pos: '中场', count: 5 },
    { pos: '前锋', count: 3 },
  ];

  const surnames = ['李', '王', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴', '徐', '孙', '马', '胡', '朱'];
  const givenNames = ['伟', '强', '磊', '军', '勇', '杰', '涛', '明', '超', '华', '飞', '鹏', '浩', '凯', '龙'];

  const players: Player[] = [];
  let number = 1;

  const seed = teamId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const rng = (i: number) => ((seed * 31 + i * 17) % 100) / 100;

  positions.forEach(({ pos, count }) => {
    for (let i = 0; i < count; i++) {
      const idx = (seed + number) % surnames.length;
      const gIdx = (seed + number * 3) % givenNames.length;
      const r = rng(number);

      players.push({
        id: `${teamId}-p${number}`,
        name: `${surnames[idx]}${givenNames[gIdx]}`,
        number,
        position: pos,
        height: Math.round(170 + r * 20),
        weight: Math.round(65 + r * 20),
        goals: pos === '前锋' ? Math.round(r * 15) : pos === '中场' ? Math.round(r * 8) : Math.round(r * 2),
        assists: pos === '中场' ? Math.round(r * 10) : Math.round(r * 5),
        baseRating: +(6 + r * 3).toFixed(1),
        stats: {
          speed: Math.round(50 + r * 45),
          shooting: pos === '前锋' ? Math.round(60 + r * 35) : Math.round(30 + r * 40),
          passing: pos === '中场' ? Math.round(60 + r * 35) : Math.round(40 + r * 35),
          defense: pos === '后卫' || pos === '门将' ? Math.round(60 + r * 35) : Math.round(30 + r * 35),
          stamina: Math.round(55 + r * 40),
          technique: Math.round(45 + r * 45),
        },
      });
      number++;
    }
  });

  return players;
}

// 14支球队完整数据
export const TEAMS: Team[] = [
  {
    id: 'changsha',
    name: '长沙队',
    city: '长沙',
    logo: TEAM_LOGOS.changsha,
    color: '#DC2626',
    accentColor: '#F59E0B',
    coach: '李铁柱',
    coachStyle: '攻势足球',
    slogan: '星城不败，湘军出征！',
    cultureLine: '敢为人先，经世致用',
    stadiumName: '贺龙体育中心',
    founded: '2023',
    rank: 1,
    points: 38,
    wins: 12,
    draws: 2,
    losses: 2,
    goalsFor: 35,
    goalsAgainst: 12,
    votes: 2856,
    players: generatePlayers('changsha'),
    culture: {
      city: '长沙',
      description: '长沙，湖南省会，楚汉名城，湖湘文化的核心发源地。岳麓书院千年弦歌不绝，橘子洲头见证革命豪情。',
      heritage: '岳麓书院、橘子洲、马王堆汉墓',
      fanGroup: '星城红魔',
      rituals: ['赛前齐唱《浏阳河》', '进球后放烟花特效', '全场红色海洋巨幅'],
      banners: ['星城永不独行', '湘军铁血出征'],
    },
  },
  {
    id: 'zhuzhou',
    name: '株洲队',
    city: '株洲',
    logo: TEAM_LOGOS.zhuzhou,
    color: '#EF4444',
    accentColor: '#F97316',
    coach: '王建功',
    coachStyle: '防守反击',
    slogan: '火车头精神，永不停歇！',
    cultureLine: '炎帝故里，动力之都',
    stadiumName: '株洲体育中心',
    founded: '2023',
    rank: 2,
    points: 35,
    wins: 11,
    draws: 2,
    losses: 3,
    goalsFor: 30,
    goalsAgainst: 15,
    votes: 2234,
    players: generatePlayers('zhuzhou'),
    culture: {
      city: '株洲',
      description: '株洲，炎帝神农氏安寝之地，中国重要的工业城市，被誉为"中国动力谷"。炎帝文化与现代工业文明在此交汇。',
      heritage: '炎帝陵、神农谷、中国动力谷',
      fanGroup: '炎帝战鼓',
      rituals: ['赛前炎帝祈福仪式', '战鼓助威团', '火车头方阵巡游'],
      banners: ['炎帝子孙，战无不胜', '动力之都，势不可挡'],
    },
  },
  {
    id: 'xiangtan',
    name: '湘潭队',
    city: '湘潭',
    logo: TEAM_LOGOS.xiangtan,
    color: '#B91C1C',
    accentColor: '#DC2626',
    coach: '陈志远',
    coachStyle: '控球打法',
    slogan: '伟人故里，敢教日月换新天！',
    cultureLine: '伟人故里，红色圣地',
    stadiumName: '湘潭体育中心',
    founded: '2023',
    rank: 3,
    points: 32,
    wins: 10,
    draws: 2,
    losses: 4,
    goalsFor: 28,
    goalsAgainst: 16,
    votes: 1987,
    players: generatePlayers('xiangtan'),
    culture: {
      city: '湘潭',
      description: '湘潭是毛泽东的故乡，红色文化底蕴深厚。槟榔之乡，莲城美誉，湘潭人骨子里透着一股不服输的劲头。',
      heritage: '韶山毛泽东故居、彭德怀纪念馆',
      fanGroup: '红色铁军',
      rituals: ['赛前集体朗诵《沁园春》', '红旗方阵', '槟榔加油站'],
      banners: ['敢教日月换新天', '红色湘潭，永不言败'],
    },
  },
  {
    id: 'hengyang',
    name: '衡阳队',
    city: '衡阳',
    logo: TEAM_LOGOS.hengyang,
    color: '#9333EA',
    accentColor: '#A855F7',
    coach: '周明辉',
    coachStyle: '均衡战术',
    slogan: '雁城雄风，南岳气概！',
    cultureLine: '雁城衡阳，南岳独秀',
    stadiumName: '衡阳体育中心',
    founded: '2023',
    rank: 4,
    points: 29,
    wins: 9,
    draws: 2,
    losses: 5,
    goalsFor: 25,
    goalsAgainst: 18,
    votes: 1756,
    players: generatePlayers('hengyang'),
    culture: {
      city: '衡阳',
      description: '衡阳因"北雁南飞，至此歇翅停回"而得名雁城。南岳衡山巍峨耸立，石鼓书院文脉悠长。抗战名城，英雄之地。',
      heritage: '南岳衡山、石鼓书院、衡阳保卫战纪念馆',
      fanGroup: '雁城飞鹰',
      rituals: ['南岳祈福仪式', '雁阵助威', '石鼓战歌'],
      banners: ['雁城铁军，所向披靡', '南岳之巅，唯我独尊'],
    },
  },
  {
    id: 'yueyang',
    name: '岳阳队',
    city: '岳阳',
    logo: TEAM_LOGOS.yueyang,
    color: '#2563EB',
    accentColor: '#3B82F6',
    coach: '张海波',
    coachStyle: '高压逼抢',
    slogan: '先天下之忧而忧，后天下之乐而乐！',
    cultureLine: '洞庭天下水，岳阳天下楼',
    stadiumName: '岳阳体育中心',
    founded: '2023',
    rank: 5,
    points: 27,
    wins: 8,
    draws: 3,
    losses: 5,
    goalsFor: 24,
    goalsAgainst: 19,
    votes: 1623,
    players: generatePlayers('yueyang'),
    culture: {
      city: '岳阳',
      description: '岳阳北枕长江，南纳三湘，洞庭湖浩渺无垠。岳阳楼上范仲淹的千古名篇，道尽忧乐精神。',
      heritage: '岳阳楼、洞庭湖、君山岛',
      fanGroup: '洞庭水师',
      rituals: ['赛前齐诵《岳阳楼记》', '洞庭波浪人浪', '龙舟鼓点助威'],
      banners: ['洞庭之子，乘风破浪', '先忧后乐，岳阳精神'],
    },
  },
  {
    id: 'changde',
    name: '常德队',
    city: '常德',
    logo: TEAM_LOGOS.changde,
    color: '#059669',
    accentColor: '#10B981',
    coach: '刘德胜',
    coachStyle: '技术流',
    slogan: '桃花源里，战意无穷！',
    cultureLine: '桃花源里好耕田',
    stadiumName: '常德体育中心',
    founded: '2023',
    rank: 6,
    points: 25,
    wins: 7,
    draws: 4,
    losses: 5,
    goalsFor: 22,
    goalsAgainst: 18,
    votes: 1445,
    players: generatePlayers('changde'),
    culture: {
      city: '常德',
      description: '常德，陶渊明笔下桃花源的原型所在。诗墙长廊文化荟萃，柳叶湖碧波荡漾，是一座充满诗意与活力的城市。',
      heritage: '桃花源、常德诗墙、柳叶湖',
      fanGroup: '桃源战士',
      rituals: ['桃花雨特效入场', '诗墙文化展示', '柳叶湖之歌'],
      banners: ['桃源出征，天下归心', '常德精神，永不言弃'],
    },
  },
  {
    id: 'zhangjiajie',
    name: '张家界队',
    city: '张家界',
    logo: TEAM_LOGOS.zhangjiajie,
    color: '#0891B2',
    accentColor: '#06B6D4',
    coach: '吴山峰',
    coachStyle: '边路突破',
    slogan: '奇峰天下，勇攀高峰！',
    cultureLine: '人间仙境，世界奇观',
    stadiumName: '张家界体育馆',
    founded: '2023',
    rank: 7,
    points: 23,
    wins: 7,
    draws: 2,
    losses: 7,
    goalsFor: 21,
    goalsAgainst: 22,
    votes: 1367,
    players: generatePlayers('zhangjiajie'),
    culture: {
      city: '张家界',
      description: '张家界以举世无双的石英砂岩峰林地貌闻名于世，天门山、玻璃栈道令人叹为观止。土家族文化在此薪火相传。',
      heritage: '武陵源、天门山、玻璃栈道',
      fanGroup: '天门勇士',
      rituals: ['土家族摆手舞入场', '天门洞光影秀', '峰林战歌'],
      banners: ['天门洞开，所向无敌', '奇峰之巅，张家界魂'],
    },
  },
  {
    id: 'yiyang',
    name: '益阳队',
    city: '益阳',
    logo: TEAM_LOGOS.yiyang,
    color: '#65A30D',
    accentColor: '#84CC16',
    coach: '赵银城',
    coachStyle: '稳健推进',
    slogan: '银城铁壁，固若金汤！',
    cultureLine: '银城益阳，竹海之乡',
    stadiumName: '益阳奥体中心',
    founded: '2023',
    rank: 8,
    points: 21,
    wins: 6,
    draws: 3,
    losses: 7,
    goalsFor: 19,
    goalsAgainst: 21,
    votes: 1198,
    players: generatePlayers('yiyang'),
    culture: {
      city: '益阳',
      description: '益阳素有"银城"美誉，桃花江竹海闻名遐迩。这里是羽毛球之乡，也是湖南重要的农业基地。',
      heritage: '桃花江竹海、安化黑茶、洞庭渔火',
      fanGroup: '银城铁卫',
      rituals: ['竹竿舞入场', '黑茶文化展示', '银城战鼓'],
      banners: ['银城铁壁，坚不可摧', '益阳精神，百折不挠'],
    },
  },
  {
    id: 'chenzhou',
    name: '郴州队',
    city: '郴州',
    logo: TEAM_LOGOS.chenzhou,
    color: '#D97706',
    accentColor: '#F59E0B',
    coach: '黄福林',
    coachStyle: '快速转换',
    slogan: '福城郴州，福运常在！',
    cultureLine: '林中之城，休闲福地',
    stadiumName: '郴州体育中心',
    founded: '2023',
    rank: 9,
    points: 19,
    wins: 5,
    draws: 4,
    losses: 7,
    goalsFor: 18,
    goalsAgainst: 22,
    votes: 1089,
    players: generatePlayers('chenzhou'),
    culture: {
      city: '郴州',
      description: '郴州位于湖南最南端，被誉为"林中之城"。东江湖雾漫小东江如梦如幻，莽山原始森林生机盎然。',
      heritage: '东江湖、莽山、苏仙岭',
      fanGroup: '福城猛虎',
      rituals: ['东江湖雾效入场', '莽山虎啸助威', '福城祈福'],
      banners: ['福城出击，虎啸山林', '郴州力量，势不可挡'],
    },
  },
  {
    id: 'yongzhou',
    name: '永州队',
    city: '永州',
    logo: TEAM_LOGOS.yongzhou,
    color: '#7C3AED',
    accentColor: '#8B5CF6',
    coach: '孙永昌',
    coachStyle: '传控结合',
    slogan: '舜帝故里，德行天下！',
    cultureLine: '舜帝故里，潇湘源头',
    stadiumName: '永州体育中心',
    founded: '2023',
    rank: 10,
    points: 17,
    wins: 5,
    draws: 2,
    losses: 9,
    goalsFor: 16,
    goalsAgainst: 25,
    votes: 956,
    players: generatePlayers('yongzhou'),
    culture: {
      city: '永州',
      description: '永州是舜帝南巡驾崩之地，潇湘二水在此交汇。柳宗元的《永州八记》让这座城市名垂千古。',
      heritage: '舜帝陵、柳子庙、九嶷山',
      fanGroup: '潇湘剑客',
      rituals: ['舜帝祭祀仪式', '潇湘水韵表演', '柳子文化诵读'],
      banners: ['舜帝之后，德行天下', '潇湘之源，永州之魂'],
    },
  },
  {
    id: 'huaihua',
    name: '怀化队',
    city: '怀化',
    logo: TEAM_LOGOS.huaihua,
    color: '#E11D48',
    accentColor: '#F43F5E',
    coach: '马通达',
    coachStyle: '全攻全守',
    slogan: '五溪蛮勇，战无不胜！',
    cultureLine: '五溪之地，侗苗风情',
    stadiumName: '怀化体育中心',
    founded: '2023',
    rank: 11,
    points: 15,
    wins: 4,
    draws: 3,
    losses: 9,
    goalsFor: 15,
    goalsAgainst: 26,
    votes: 878,
    players: generatePlayers('huaihua'),
    culture: {
      city: '怀化',
      description: '怀化地处湘西腹地，五溪文化源远流长。侗族大歌、苗族银饰在此交相辉映，洪江古商城见证千年商道繁华。',
      heritage: '洪江古商城、芷江受降纪念坊、通道侗寨',
      fanGroup: '五溪勇士',
      rituals: ['侗族大歌开场', '苗族银饰展示', '五溪战舞'],
      banners: ['五溪蛮勇，所向披靡', '怀化铁军，永不言败'],
    },
  },
  {
    id: 'loudi',
    name: '娄底队',
    city: '娄底',
    logo: TEAM_LOGOS.loudi,
    color: '#0284C7',
    accentColor: '#0EA5E9',
    coach: '胡钢铁',
    coachStyle: '铁血防守',
    slogan: '钢铁之城，意志如钢！',
    cultureLine: '钢城娄底，梅山文化',
    stadiumName: '娄底体育中心',
    founded: '2023',
    rank: 12,
    points: 13,
    wins: 3,
    draws: 4,
    losses: 9,
    goalsFor: 13,
    goalsAgainst: 27,
    votes: 789,
    players: generatePlayers('loudi'),
    culture: {
      city: '娄底',
      description: '娄底是湖南重要的钢铁工业基地，梅山文化的发源地。曾国藩故居见证了湘军的辉煌历史。',
      heritage: '曾国藩故居、梅山龙宫、紫鹊界梯田',
      fanGroup: '钢铁军团',
      rituals: ['钢铁工人方阵入场', '梅山战鼓', '曾国藩家训诵读'],
      banners: ['钢铁意志，百炼成钢', '娄底铁军，坚不可摧'],
    },
  },
  {
    id: 'shaoyang',
    name: '邵阳队',
    city: '邵阳',
    logo: TEAM_LOGOS.shaoyang,
    color: '#CA8A04',
    accentColor: '#EAB308',
    coach: '朱宝庆',
    coachStyle: '务实足球',
    slogan: '宝庆精神，坚韧不拔！',
    cultureLine: '宝庆府，崀山情',
    stadiumName: '邵阳体育中心',
    founded: '2023',
    rank: 13,
    points: 11,
    wins: 3,
    draws: 2,
    losses: 11,
    goalsFor: 11,
    goalsAgainst: 30,
    votes: 678,
    players: generatePlayers('shaoyang'),
    culture: {
      city: '邵阳',
      description: '邵阳古称宝庆，崀山丹霞地貌举世瞩目。邵阳人以"霸蛮"著称，骨子里有着不服输的精神。',
      heritage: '崀山、武冈古城、蔡锷故居',
      fanGroup: '宝庆霸蛮帮',
      rituals: ['霸蛮战吼', '崀山丹霞灯光秀', '宝庆花鼓戏'],
      banners: ['宝庆霸蛮，谁与争锋', '邵阳精神，永不服输'],
    },
  },
  {
    id: 'xiangxi',
    name: '湘西队',
    city: '湘西',
    logo: TEAM_LOGOS.xiangxi,
    color: '#059669',
    accentColor: '#34D399',
    coach: '龙凤祥',
    coachStyle: '灵活多变',
    slogan: '神秘湘西，战意无限！',
    cultureLine: '神秘湘西，土苗风情',
    stadiumName: '吉首体育中心',
    founded: '2023',
    rank: 14,
    points: 9,
    wins: 2,
    draws: 3,
    losses: 11,
    goalsFor: 10,
    goalsAgainst: 32,
    votes: 567,
    players: generatePlayers('xiangxi'),
    culture: {
      city: '湘西',
      description: '湘西土家族苗族自治州，沈从文笔下的边城所在。凤凰古城千年风韵，矮寨大桥横跨天堑，神秘与浪漫并存。',
      heritage: '凤凰古城、矮寨大桥、里耶秦简',
      fanGroup: '边城猎人',
      rituals: ['苗族银铃舞开场', '土家族茅古斯舞', '边城号角'],
      banners: ['神秘湘西，不可战胜', '边城儿女，勇往直前'],
    },
  },
];

// 比赛数据
export const MATCHES: Match[] = [
  {
    id: 'm1',
    homeTeam: 'changsha',
    awayTeam: 'zhuzhou',
    homeScore: 2,
    awayScore: 1,
    status: 'FULL TIME',
    time: '2025-04-20 19:30',
    round: 16,
    summary: '长沙队凭借下半场两粒进球逆转株洲队，继续稳坐榜首。',
  },
  {
    id: 'm2',
    homeTeam: 'xiangtan',
    awayTeam: 'hengyang',
    homeScore: 1,
    awayScore: 1,
    status: 'FULL TIME',
    time: '2025-04-20 19:30',
    round: 16,
    summary: '湘潭与衡阳战成平局，双方各取一分。',
  },
  {
    id: 'm3',
    homeTeam: 'yueyang',
    awayTeam: 'changde',
    homeScore: 3,
    awayScore: 0,
    status: 'FULL TIME',
    time: '2025-04-20 15:00',
    round: 16,
    summary: '岳阳队主场大胜常德队，展现出强大的主场优势。',
  },
  {
    id: 'm4',
    homeTeam: 'zhangjiajie',
    awayTeam: 'yiyang',
    homeScore: 2,
    awayScore: 2,
    status: 'LIVE',
    time: '75\'',
    round: 17,
    summary: '张家界与益阳激战正酣，双方各入两球。',
  },
  {
    id: 'm5',
    homeTeam: 'chenzhou',
    awayTeam: 'yongzhou',
    homeScore: 0,
    awayScore: 0,
    status: 'LIVE',
    time: '62\'',
    round: 17,
    summary: '郴州与永州的南湖南德比，暂时互交白卷。',
  },
  {
    id: 'm6',
    homeTeam: 'huaihua',
    awayTeam: 'loudi',
    homeScore: 0,
    awayScore: 0,
    status: 'PREVIEW',
    time: '2025-04-27 19:30',
    round: 17,
    summary: '怀化主场迎战娄底，两队都急需三分保级。',
  },
  {
    id: 'm7',
    homeTeam: 'shaoyang',
    awayTeam: 'xiangxi',
    homeScore: 0,
    awayScore: 0,
    status: 'PREVIEW',
    time: '2025-04-27 15:00',
    round: 17,
    summary: '邵阳对阵湘西，保级大战一触即发。',
  },
];

// 应援口号模板
export const CHEER_SLOGANS: CheerSlogan[] = [
  { id: 'c1', text: '加油！冲冲冲！', teamId: '', heat: 0 },
  { id: 'c2', text: '必胜！必胜！必胜！', teamId: '', heat: 0 },
  { id: 'c3', text: '防守！稳住！', teamId: '', heat: 0 },
  { id: 'c4', text: '进球！进球！进球！', teamId: '', heat: 0 },
  { id: 'c5', text: '全场最佳！MVP！', teamId: '', heat: 0 },
  { id: 'c6', text: '湘超最强！', teamId: '', heat: 0 },
];

// 获取球队
export function getTeamById(id: string): Team | undefined {
  return TEAMS.find(t => t.id === id);
}

// 获取比赛中的球队
export function getMatchTeams(match: Match) {
  return {
    home: TEAMS.find(t => t.id === match.homeTeam)!,
    away: TEAMS.find(t => t.id === match.awayTeam)!,
  };
}

// 排行榜排序
export function getLeagueTable() {
  return [...TEAMS].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const gdA = a.goalsFor - a.goalsAgainst;
    const gdB = b.goalsFor - b.goalsAgainst;
    if (gdB !== gdA) return gdB - gdA;
    return b.goalsFor - a.goalsFor;
  });
}

// 射手榜
export function getTopScorers() {
  const scorers: Array<{ player: Player; team: Team }> = [];
  TEAMS.forEach(team => {
    team.players.forEach(player => {
      if (player.goals > 0) {
        scorers.push({ player, team });
      }
    });
  });
  return scorers.sort((a, b) => b.player.goals - a.player.goals).slice(0, 10);
}

// 助攻榜
export function getTopAssisters() {
  const assisters: Array<{ player: Player; team: Team }> = [];
  TEAMS.forEach(team => {
    team.players.forEach(player => {
      if (player.assists > 0) {
        assisters.push({ player, team });
      }
    });
  });
  return assisters.sort((a, b) => b.player.assists - a.player.assists).slice(0, 10);
}
