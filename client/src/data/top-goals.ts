/**
 * 湘超联赛十佳进球数据
 * 基于2025赛季湘超联赛真实赛事数据
 */

export interface TopGoal {
  id: number;
  rank: number;
  player: string;
  team: string;
  teamColor: string;
  opponent: string;
  matchType: string;
  minute: number;
  goalType: string;
  description: string;
  image: string;
  videoUrl?: string;
}

export const topGoals: TopGoal[] = [
  {
    id: 1,
    rank: 1,
    player: '张涛',
    team: '永州',
    teamColor: '#E63B2E',
    opponent: '娄底',
    matchType: '淘汰赛·1/4决赛',
    minute: 67,
    goalType: '倒挂金钩',
    description: '张涛背对球门腾空跃起，以一记惊世骇俗的倒挂金钩将球送入网窝，入选央视《天下足球》全球一周十佳进球第5位，年度百大进球第55位。',
    image: '/assets/goals/goal-01.jpg',
    videoUrl: 'https://www.youtube.com/shorts/tQmR1fVt2a8',
  },
  {
    id: 2,
    rank: 2,
    player: '赵文荻',
    team: '常德',
    teamColor: '#C8A84E',
    opponent: '张家界',
    matchType: '常规赛·第三轮',
    minute: 23,
    goalType: '远射破门',
    description: '赵文荻中场附近拿球后连续摆脱两名防守球员，在禁区外30米处起脚怒射，皮球划出完美弧线直挂死角。',
    image: '/assets/goals/goal-02.jpg',
  },
  {
    id: 3,
    rank: 3,
    player: '高响',
    team: '永州',
    teamColor: '#E63B2E',
    opponent: '长沙',
    matchType: '淘汰赛·半决赛',
    minute: 88,
    goalType: '绝杀头球',
    description: '比赛第88分钟，高响在禁区内高高跃起，力压两名后卫头球攻门得手，帮助永州队绝杀省会长沙队晋级决赛。',
    image: '/assets/goals/goal-03.jpg',
  },
  {
    id: 4,
    rank: 4,
    player: '何阳钊',
    team: '湘潭',
    teamColor: '#4A90D9',
    opponent: '益阳',
    matchType: '常规赛·第五轮',
    minute: 52,
    goalType: '凌空抽射',
    description: '队友开出角球被解围，何阳钊在禁区外凌空抽射，皮球如炮弹般飞入球门上角，门将望球兴叹。',
    image: '/assets/goals/goal-04.jpg',
  },
  {
    id: 5,
    rank: 5,
    player: '马子宜',
    team: '长沙',
    teamColor: '#FF6B35',
    opponent: '衡阳',
    matchType: '常规赛·第六轮',
    minute: 34,
    goalType: '个人突破',
    description: '马子宜从中场带球长途奔袭60米，连过三人后面对门将冷静推射远角得手，全场球迷为之疯狂。',
    image: '/assets/goals/goal-05.jpg',
  },
  {
    id: 6,
    rank: 6,
    player: '王博',
    team: '郴州',
    teamColor: '#2E8B57',
    opponent: '邵阳',
    matchType: '常规赛·第四轮',
    minute: 71,
    goalType: '任意球直接破门',
    description: '王博主罚禁区前沿25米任意球，皮球越过人墙后急速下坠钻入球门左下角，技惊四座。',
    image: '/assets/goals/goal-06.jpg',
  },
  {
    id: 7,
    rank: 7,
    player: '吴梦豪',
    team: '衡阳',
    teamColor: '#8B4513',
    opponent: '岳阳',
    matchType: '常规赛·第七轮',
    minute: 15,
    goalType: '零角度破门',
    description: '吴梦豪在底线附近以几乎零度角的位置起脚射门，皮球贴着近门柱内侧飞入网窝，角度刁钻令人叫绝。',
    image: '/assets/goals/goal-07.jpg',
  },
  {
    id: 8,
    rank: 8,
    player: '林昊',
    team: '永州',
    teamColor: '#E63B2E',
    opponent: '常德',
    matchType: '淘汰赛·决赛',
    minute: 63,
    goalType: '团队配合',
    description: '永州队在决赛中打出精妙的连续一脚传递配合，林昊在小禁区内轻巧垫射破门，这粒进球帮助永州队最终夺冠。',
    image: '/assets/goals/goal-08.jpg',
  },
  {
    id: 9,
    rank: 9,
    player: '夏宇航',
    team: '常德',
    teamColor: '#C8A84E',
    opponent: '株洲',
    matchType: '淘汰赛·半决赛',
    minute: 41,
    goalType: '胸部停球转身抽射',
    description: '夏宇航接队友长传球，胸部停球后迅速转身，在防守球员封堵前一脚抽射破门，动作行云流水。',
    image: '/assets/goals/goal-09.jpg',
  },
  {
    id: 10,
    rank: 10,
    player: '李超豪',
    team: '株洲',
    teamColor: '#DC143C',
    opponent: '湘西',
    matchType: '常规赛·第九轮',
    minute: 78,
    goalType: '世界波远射',
    description: '李超豪在中圈附近观察到对方门将站位靠前，果断起脚吊射，皮球越过门将头顶飞入球门，超远距离破门震惊全场。',
    image: '/assets/goals/goal-10.jpg',
  },
];
