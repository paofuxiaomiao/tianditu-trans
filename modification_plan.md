# 修改计划

## 需求1: LogoBadge去掉"平台"字样 → 显示"湘超联赛"+"湖南地理信息服务"
- 文件: client/src/components/LogoBadge.tsx
  - 第36行: "湖南地理信息服务平台湘超平台" → "湘超联赛"
  - 第42行: subtitle默认值"湖南地理信息服务平台" → "湖南地理信息服务"
  - 第26行: alt文字也改

## 需求5: 功能模块改为互动中心
- 文件: client/src/pages/Home.tsx 第165行: "功能模块" → "互动中心"
- 文件: client/src/data/feature-data.ts: moduleStats中 "功能模块" → "互动中心"

## 需求6: 数字看板顶部header替换为运动员剪影背景
- 文件: client/src/pages/Home.tsx 第58-78行: header背景区域
- 需要将上传的header-silhouette-bg(1).png放入项目public/assets/
- 修改背景图引用，确保运动员剪影完整显示（backgroundPosition需要调整为bottom）

## 需求-前三王冠: 前三名队伍加金银铜王冠图标
- 文件: client/src/components/TeamList.tsx 第113-124行: 已有排名角标，改为王冠图标
- 文件: client/src/pages/Landing.tsx 第528-536行: 已有Trophy图标，确认金银铜颜色

## 需求10: 主场场馆点击进入全景+提示
- 文件: client/src/components/TeamDetail.tsx 第234-254行: 场馆区域
- 右上角添加"点击进入全景"提示，hover显示全屏图标

## 需求11: 赛程hover显示6个月时间线
- 文件: client/src/components/StatsBar.tsx 第14行: 赛程项
- 添加hover弹出6个月时间线（非日历）

## 需求12: 赛事概览改为赛事回顾+2024数据
- 文件: client/src/pages/Landing.tsx
  - 第257行: "赛事概览" → "赛事回顾"
  - 第268行: "赛事概览" → "赛事回顾"  
  - 第271行: "2025赛季" → "2024赛季"
  - 第281行: "113.59亿" → "吸引 2.7亿+"

## 需求13: 赛事回顾下方添加"2025赛季即将开启"提示卡片
- 文件: client/src/pages/Landing.tsx: 在stats section后添加提示卡片
