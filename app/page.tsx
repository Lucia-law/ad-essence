"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Play, Pause, RotateCcw, Sparkles, User, Clock, Zap, TrendingUp, ChevronDown, Volume2, VolumeX, Timer, EyeOff, SkipForward, AlertTriangle } from "lucide-react"

// 广告分类数据
const AD_CATEGORIES = [
  { id: "fmcg", name: "FMCG & Beauty", nameZh: "FMCG & Beauty", color: "bg-rose-100 text-rose-700" },
  { id: "tech", name: "Tech & Auto", nameZh: "Tech & Auto", color: "bg-sky-100 text-sky-700" },
  { id: "luxury", name: "Luxury & Lifestyle", nameZh: "Luxury & Lifestyle", color: "bg-amber-100 text-amber-700" },
  { id: "internet", name: "Internet & Entertainment", nameZh: "Internet & Entertainment", color: "bg-violet-100 text-violet-700" },
]

// 视频数据
const VIDEO_DATA: Record<string, { id: string; title: string; duration: number; essenceDuration: number; brand: string; videoSrc: string }[]> = {
  fmcg: [
    { id: "fmcg-1", title: "去屑洗发水", duration: 60, essenceDuration: 30, brand: "清扬", videoSrc: "/videos/fmcg/fmcg-1.mp4" },
    { id: "fmcg-2", title: "青提酸奶口味", duration: 45, essenceDuration: 22, brand: "可爱多", videoSrc: "/videos/fmcg/fmcg-2.mp4" },
  ],
  tech: [
    { id: "tech-1", title: "Pura 90", duration: 90, essenceDuration: 45, brand: "HUAWEI", videoSrc: "/videos/tech/tech-1.mp4" },
    { id: "tech-2", title: "8X", duration: 75, essenceDuration: 38, brand: "极氪", videoSrc: "/videos/tech/tech-2.mp4" },
  ],
  luxury: [
    { id: "luxury-1", title: "ETERNAL N°5", duration: 55, essenceDuration: 28, brand: "CHANEL", videoSrc: "/videos/luxury/luxury-1.mp4" },
    { id: "luxury-2", title: "X12 PRO", duration: 50, essenceDuration: 25, brand: "科沃斯", videoSrc: "/videos/luxury/luxury-2.mp4" },
  ],
  internet: [
    { id: "internet-1", title: "旅行", duration: 40, essenceDuration: 20, brand: "京东", videoSrc: "/videos/internet/internet-1.mp4" },
    { id: "internet-2", title: "淘金节", duration: 65, essenceDuration: 32, brand: "暗区突围", videoSrc: "/videos/internet/internet-2.mp4" },
  ],
}

// 产品亮点数据 - 手账风格
const HIGHLIGHTS = [
  { id: 1, icon: "◆", title: "智能定位", desc: "AI精准识别核心卖点", time: "0:05", style: "tape", rotate: -2 },
  { id: 2, icon: "●", title: "视觉焦点", desc: "高光时刻自动捕捉", time: "0:12", style: "pin", rotate: 3 },
  { id: 3, icon: "■", title: "节奏优化", desc: "删减冗余保留精华", time: "0:18", style: "tape-coral", rotate: -1 },
  { id: 4, icon: "▲", title: "信息密度", desc: "单位时间价值最大化", time: "0:25", style: "pin", rotate: 2 },
  { id: 5, icon: "◇", title: "音频增强", desc: "关键对白智能提升", time: "0:30", style: "tape-mint", rotate: -3 },
  { id: 6, icon: "★", title: "数据验证", desc: "基于观看行为持续优化", time: "0:35", style: "tape", rotate: 1 },
]

// 产品名称映射
const PRODUCT_NAMES: Record<string, string> = {
  'fmcg-1': '清扬去屑洗发水',
  'fmcg-2': '可爱多青提酸奶味甜筒',
  'tech-1': '华为 Pura 90',
  'tech-2': '极氪 8X 电混SUV',
  'luxury-1': 'CHANEL N°5高级珠宝系列',
  'luxury-2': '科沃斯 X12 PRO 扫地机',
  'internet-1': '京东旅行',
  'internet-2': '射击手游 暗区突围 淘金节'
};

// 普通模式痛点
const PAIN_POINTS = [
  { icon: <Timer className="w-5 h-5" />, title: "时长过长", desc: "平均广告60秒，超出用户耐心阈值", stat: "60s", color: "text-rose-500" },
  { icon: <EyeOff className="w-5 h-5" />, title: "注意力涣散", desc: "前15秒注意力流失率高达45%", stat: "45%", color: "text-amber-500" },
  { icon: <AlertTriangle className="w-5 h-5" />, title: "信息稀释", desc: "核心卖点被冗余内容淹没", stat: "3x", color: "text-orange-500" },
  { icon: <SkipForward className="w-5 h-5" />, title: "主动跳过", desc: "超过60%用户选择跳过广告", stat: "60%", color: "text-red-500" },
]

/**
 * 用户画像标签体系 (精简完整版)
 * 维度一：账号基础信息 (3个标签)
 * 维度二：内容偏好图谱 (4个标签，主要题材抽2个)
 * 维度三：观看行为特征 (2个标签)
 * 维度四：互动与社交行为 (1个标签)
 * 维度五：当前情境信号 (3个标签)
 * 共计 13 个标签，每个标签包含值及对广告的意义
 */

// ========== 全局题材意义（维度二与维度五共用） ==========
const GENRE_MEANINGS: Record<string, string> = {
  "科幻悬疑": "习惯处理复杂信息，可给技术参数和逻辑链。讲原理，不用过度简化。",
  "都市情感": "对人际关系、生活品质敏感。强调社交场景、他人眼中的你、日常幸福感。",
  "家庭亲子": "关注安全实用全家适用。文案必含放心、省心、孩子也能用等家庭视角。",
  "古装历史": "有叙事品味，可增加质感描述但别掉书袋。",
  "喜剧综艺": "对幽默和梗接受度最高，广告可轻松敢玩，别板着脸。",
  "恋爱真人秀": "对颜值、情感故事、社交话题高度敏感。强调外观设计、礼物属性、情绪价值。",
  "纪录片": "对信息密度和真实性要求高。用讲清原理和事实加分，真实测试、实际拍摄等话术。",
  "体育电竞": "看重速度、对抗、胜负。可用竞技隐喻：碾压、翻盘、队友，有力量不挑衅。",
  "动漫": "对视觉风格和叙事设定敏感。强调设计感、独特美学，文案可适当中二。",
  "短视频合集": "注意力切换极快，2秒抓住否则失去。文案必须极短极直接。"
};

const PROFILE_DIMENSIONS = {
  // ========== 维度一：账号基础信息 (各抽1个，共3个) ==========
  membership: {
    name: "会员等级",
    count: 1,
    values: ["SVIP", "VIP", "非会员"],
    meanings: {
      "SVIP": "广告极少出现，一旦出现需高质感。对尊享、专属、限量敏感，反感便宜、折扣。文案像对老客户告知，不需说服，只需告知。",
      "VIP": "已付费，对划算、会员价、加量不加价敏感。文案需让他觉得这钱花得值，性价比和品质感并行。",
      "非会员": "价格门槛敏感，最大转化机会。文案聚焦试一下的成本有多低，不编造免费信息，用即刻体验、了解看看等低门槛引导。"
    }
  },
  gender: {
    name: "性别",
    count: 1,
    values: ["男", "女", "未知"],
    meanings: {
      "男": "基础人口标签。一般倾向于直接、功能导向的沟通，但个体差异远大于性别差异。仅作低权重背景参考，不可单独决定文案风格。",
      "女": "基础人口标签。一般对情感连接与细节描述更开放，但个体差异远大于性别差异。仅作低权重背景参考，不可单独决定文案风格。",
      "未知": "无法获取或用户未公开。不影响广告策略，按中性处理，以其他维度为准。"
    }
  },
  age: {
    name: "年龄段",
    count: 1,
    values: ["18以下", "18–24", "25–34", "35–44", "45+"],
    meanings: {
      "18以下": "未成年，需合规。偏好轻松有趣、快节奏，酷、好玩、朋友都在用敏感。避免过度商业化。",
      "18–24": "大学生/初入职场，消费力中低但尝试意愿强。对新潮、社交货币、颜值敏感，决策偏冲动，适合场景化、情绪化。",
      "25–34": "职场中坚，消费力上升，关注品质效率。对省时间、提升生活质量、专业感敏感。理性但别冷。",
      "35–44": "家庭决策者概率高，关注全家适用、省心耐用。需要理由和依据，也吃情感共鸣（为孩子/家人）。",
      "45+": "消费力分化，信任门槛高。文案需更朴实可信，避免网感夸张，强调实在、靠谱、用了很多年。"
    }
  },

  // ========== 维度二：内容偏好图谱 (主要题材抽2个，其余各1个，共4个) ==========
  mainGenres: {
    name: "主要题材",
    count: 2,
    values: [
      "科幻悬疑", "都市情感", "家庭亲子", "古装历史",
      "喜剧综艺", "恋爱真人秀", "纪录片", "体育电竞",
      "动漫", "短视频合集"
    ],
    meanings: GENRE_MEANINGS
  },
  contentTone: {
    name: "内容格调偏好",
    count: 1,
    values: ["烧脑硬核", "轻松解压", "情绪共鸣", "猎奇刺激", "知识获取"],
    meanings: {
      "烧脑硬核": "享受思考，广告智商在线。必需数据、逻辑、技术名词，拒绝空洞形容词。像实验结论不像广告。",
      "轻松解压": "为放松而来，别制造焦虑。文案轻、软、舒服，可幽默，不讲大道理。",
      "情绪共鸣": "用内容消费情感，广告共情则效果翻倍。从感受切入，告别那种感觉、找回那种状态胜过功能。",
      "猎奇刺激": "对新奇敏感，强调新款、首创、没见过，新鲜感第一，但信息要真新，不标题党。",
      "知识获取": "信息密度要求高，讲清原理加分。用研究表明、原理很简单开头，讲明白就是最好推销。"
    }
  },
  followBehavior: {
    name: "追剧行为",
    count: 1,
    values: ["连续追更", "囤剧一口气", "随缘看"],
    meanings: {
      "连续追更": "有追踪习惯，对时效性、抢先敏感。强调首发、限时、最新款，给信息领先感。",
      "囤剧一口气": "喜欢沉浸体验，不急打扰，适合剧集间隙出现。文案可稍直接，他耐心看完，不需太短钩子。",
      "随缘看": "无强执念，需要强钩子抓住。第一秒让他觉得这个跟我有关，否则滑走。"
    }
  },

  // ========== 维度三：观看行为特征 (各抽1个，共2个) ==========
  watchDepth: {
    name: "观看深度",
    count: 1,
    values: ["深度沉浸", "普通", "碎片跳跃"],
    meanings: {
      "深度沉浸": "广告打断感最强，若内容无关则强烈反感。必须与当前内容情感一致，至少不跳戏。",
      "普通": "中等打断感，信息有用、表达清楚即可，不需刻意讨好。",
      "碎片跳跃": "注意力分散，2秒没说出关我什么事就跳过。文案极短极直接，亮点前置。"
    }
  },
  watchFrequency: {
    name: "观看频次",
    count: 1,
    values: ["重度", "中度", "轻度"],
    meanings: {
      "重度": "平台重度用户，广告见得多，模板化已免疫。需更精准个性化文案才能打动。",
      "中度": "普通用户，愿意给几秒注意力，适合中等长度文案。",
      "轻度": "偶尔打开，可能被某剧吸引，广告可更直接功利，转化机会珍贵。"
    }
  },

  // ========== 维度四：互动与社交行为 (抽1个，共1个) ==========
  interaction: {
    name: "互动强度",
    count: 1,
    values: ["高互动", "中互动", "零互动"],
    meanings: {
      "高互动": "社交驱动，对大家都说用、能拿出去说敏感，文案强调社交货币，口语化网感接受度高。",
      "中互动": "介于社交和独立之间。文案正常写，不刻意夸张也不高冷，信息给够即可。",
      "零互动": "独立判断，对社交证明不敏感，在意逻辑和事实。给出理由依据，别用大家都在买说服。"
    }
  },

  // ========== 维度五：当前情境信号 (各抽1个，共3个) ==========
  currentMood: {
    name: "当前内容情绪基调",
    count: 1,
    values: ["烧脑紧张", "温馨治愈", "轻松欢乐", "热血燃情", "感动催泪", "猎奇刺激"],
    meanings: {
      "烧脑紧张": "认知资源高度投入，情绪偏紧绷。广告必须简洁直接，用事实逻辑说话，避免情感渲染冗余。",
      "温馨治愈": "心理防线最低时刻之一，广告触及情感温暖则接受度极高。柔软有人情味。",
      "轻松欢乐": "用户在开怀，对幽默梗接受度最高。可轻松玩花样，别破坏好心情。",
      "热血燃情": "情绪高位肾上腺素驱动，广告可适度燃，用有力量语言让产品跟燃挂钩。",
      "感动催泪": "情绪释放点，对情感连接高度敏感。广告若能共情触达深度远超平时，温暖有力量。",
      "猎奇刺激": "对新奇事物期待高，强调不一样、没见过、惊艳。新鲜感是第一钩子。"
    }
  },
  currentGenre: {
    name: "当前内容题材",
    count: 1,
    values: [
      "科幻悬疑", "都市情感", "家庭亲子", "古装历史",
      "喜剧综艺", "恋爱真人秀", "纪录片", "体育电竞",
      "动漫", "短视频合集"
    ],
    meanings: GENRE_MEANINGS
  },
  realTimeHour: {
    name: "实时观看时段",
    count: 1,
    values: ["早间6–9点", "午间11–14点", "傍晚17–19点", "晚间19–22点", "深夜22点后"],
    meanings: {
      "早间6–9点": "通勤/起床，注意力碎片化，文案要短，适合效率型、醒神型。",
      "午间11–14点": "午休摸鱼，心态放松，轻松有趣网感接受度高。",
      "傍晚17–19点": "放学/下班路上疲劳，广告可温暖勿烧脑。",
      "晚间19–22点": "最长不打扰时段，沉浸观看，剧集间隙时接受度最高，文案可适度展开。",
      "深夜22点后": "独处时间，情绪放大，感性内容易接受，有情绪张力但别太吵。"
    }
  }
};

// 工具函数
const randomPick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

const randomPickN = <T,>(arr: T[], n: T[]): T[] => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n.length);
}

// 生成用户画像
const generateProfile = () => {
  const membership = randomPick(PROFILE_DIMENSIONS.membership.values)
  const gender = randomPick(PROFILE_DIMENSIONS.gender.values)
  const age = randomPick(PROFILE_DIMENSIONS.age.values)
  const firstGenre = randomPick(PROFILE_DIMENSIONS.mainGenres.values)
  const secondGenre = randomPick(PROFILE_DIMENSIONS.mainGenres.values.filter(g => g !== firstGenre))
  const mainGenres = [firstGenre, secondGenre]
  const contentTone = randomPick(PROFILE_DIMENSIONS.contentTone.values)
  const followBehavior = randomPick(PROFILE_DIMENSIONS.followBehavior.values)
  const watchDepth = randomPick(PROFILE_DIMENSIONS.watchDepth.values)
  const watchFrequency = randomPick(PROFILE_DIMENSIONS.watchFrequency.values)
  const interaction = randomPick(PROFILE_DIMENSIONS.interaction.values)
  const currentMood = randomPick(PROFILE_DIMENSIONS.currentMood.values)
  const currentGenre = randomPick(PROFILE_DIMENSIONS.currentGenre.values)
  const realTimeHour = randomPick(PROFILE_DIMENSIONS.realTimeHour.values)

  return {
    membership,
    gender,
    age,
    mainGenres,
    contentTone,
    followBehavior,
    watchDepth,
    watchFrequency,
    interaction,
    currentMood,
    currentGenre,
    realTimeHour,
    meanings: {
      membership: PROFILE_DIMENSIONS.membership.meanings[membership as keyof typeof PROFILE_DIMENSIONS.membership.meanings],
      gender: PROFILE_DIMENSIONS.gender.meanings[gender as keyof typeof PROFILE_DIMENSIONS.gender.meanings],
      age: PROFILE_DIMENSIONS.age.meanings[age as keyof typeof PROFILE_DIMENSIONS.age.meanings],
      mainGenres: mainGenres.map(g => GENRE_MEANINGS[g]),
      contentTone: PROFILE_DIMENSIONS.contentTone.meanings[contentTone as keyof typeof PROFILE_DIMENSIONS.contentTone.meanings],
      followBehavior: PROFILE_DIMENSIONS.followBehavior.meanings[followBehavior as keyof typeof PROFILE_DIMENSIONS.followBehavior.meanings],
      watchDepth: PROFILE_DIMENSIONS.watchDepth.meanings[watchDepth as keyof typeof PROFILE_DIMENSIONS.watchDepth.meanings],
      watchFrequency: PROFILE_DIMENSIONS.watchFrequency.meanings[watchFrequency as keyof typeof PROFILE_DIMENSIONS.watchFrequency.meanings],
      interaction: PROFILE_DIMENSIONS.interaction.meanings[interaction as keyof typeof PROFILE_DIMENSIONS.interaction.meanings],
      currentMood: PROFILE_DIMENSIONS.currentMood.meanings[currentMood as keyof typeof PROFILE_DIMENSIONS.currentMood.meanings],
      currentGenre: GENRE_MEANINGS[currentGenre],
      realTimeHour: PROFILE_DIMENSIONS.realTimeHour.meanings[realTimeHour as keyof typeof PROFILE_DIMENSIONS.realTimeHour.meanings],
    }
  }
}

// 荧光笔高亮组件
function HighlightText({ text }: { text: string }) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <p>
      {parts.map((p, i) =>
        p.startsWith('**') ? (
          <mark key={i}>{p.replace(/\*\*/g, '')}</mark>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </p>
  );
}

// ═══════════════════════════════════════════════
// 用户权重向量计算
// 输入：用户画像对象
// 输出：{ P1, P2, P3, P4, P5, P6, P7 } 权重向量，总和=1
// ═══════════════════════════════════════════════

function computeUserWeights(user: any) {
  // 基础权重：所有人的起点相同
  const w: Record<string, number> = { P1: 0.18, P2: 0.16, P3: 0.15, P4: 0.14, P5: 0.14, P6: 0.13, P7: 0.10 };

  // ── 会员等级调整（增大调整幅度）──────────────────────
  if (user.membership === "SVIP") {
    w.P7 += 0.15; w.P4 += 0.10; w.P6 -= 0.20;
  }
  if (user.membership === "非会员") {
    w.P6 += 0.18; w.P3 += 0.10; w.P7 -= 0.15; w.P4 -= 0.10;
  }

  // ── 互动强度调整（增大调整幅度）──────────────────────
  if (user.interaction === "高互动") {
    w.P3 += 0.18; w.P4 += 0.12; w.P7 -= 0.15; w.P1 -= 0.12;
  }
  if (user.interaction === "零互动") {
    w.P1 += 0.18; w.P7 += 0.15; w.P3 -= 0.20; w.P4 -= 0.12;
  }

  // ── 内容格调偏好调整（增大调整幅度）─────────────────────
  const contentBoosts: Record<string, Record<string, number>> = {
    "烧脑硬核":   { P1: +0.20, P2: +0.10, P4: -0.15, P3: -0.12 },
    "轻松解压":   { P4: +0.20, P3: +0.12, P1: -0.15, P7: -0.12 },
    "情绪共鸣":   { P5: +0.22, P3: +0.12, P1: -0.15, P6: -0.10 },
    "猎奇刺激":   { P4: +0.18, P3: +0.15, P1: -0.12, P6: -0.10 },
    "知识获取":   { P1: +0.18, P7: +0.18, P4: -0.15, P3: -0.12 },
  };
  const cb = contentBoosts[user.contentTone];
  if (cb) Object.entries(cb).forEach(([k, v]) => { w[k] += v; });

  // ── 观看深度调整（增大调整幅度）──────────────────────
  if (user.watchDepth === "深度沉浸") {
    w.P1 += 0.12; w.P5 += 0.10; w.P4 -= 0.10; w.P2 -= 0.10;
  }
  if (user.watchDepth === "碎片跳跃") {
    w.P2 += 0.15; w.P4 += 0.12; w.P1 -= 0.15; w.P7 -= 0.12;
  }

  // ── 当前情境实时修正（增大调整幅度）─────────────────────
  const moodBoosts: Record<string, Record<string, number>> = {
    "烧脑紧张": { P1: +0.15, P2: +0.12, P4: -0.15, P5: -0.12 },
    "温馨治愈": { P5: +0.22, P3: +0.10, P1: -0.15, P6: -0.15 },
    "轻松欢乐": { P4: +0.18, P3: +0.12, P1: -0.15, P7: -0.15 },
    "热血燃情": { P3: +0.15, P4: +0.12, P6: -0.15, P5: -0.12 },
    "感动催泪": { P5: +0.25, P3: +0.12, P1: -0.18, P6: -0.18 },
    "猎奇刺激": { P4: +0.15, P1: +0.10, P5: -0.12, P6: -0.12 },
  };
  const mb = moodBoosts[user.currentMood];
  if (mb) Object.entries(mb).forEach(([k, v]) => { w[k] += v; });

  // ── 引入随机扰动，增加多样性 ──────────────────────
  Object.keys(w).forEach(k => {
    const noise = (Math.random() - 0.5) * 0.08; // ±0.04的随机扰动
    w[k] += noise;
  });

  // ── 归一化，确保总和=1，且每项≥0.03 ──────────
  Object.keys(w).forEach(k => { w[k] = Math.max(0.03, w[k]); });
  const total = Object.values(w).reduce((a, b) => a + b, 0);
  Object.keys(w).forEach(k => { w[k] = parseFloat((w[k] / total).toFixed(4)); });

  return w;
}

// ═══════════════════════════════════════════════
// 共鸣系数计算与亮点排序
// 输入：产品features数组，用户权重向量
// 输出：按R值排序的features数组（含R值和得分明细）
// ═══════════════════════════════════════════════

function rankFeatures(features: any[], weights: Record<string, number>) {
  return features
    .map(feature => {
      const R = Object.keys(weights).reduce((sum, dim) => {
        return sum + weights[dim] * (feature.scores[dim] || 0);
      }, 0);

      // 找出这个亮点得分最高的心理维度（用于指导文案）
      const dominantDim = Object.keys(feature.scores).reduce((a, b) =>
        (weights[a] * feature.scores[a]) > (weights[b] * feature.scores[b]) ? a : b
      );

      return {
        ...feature,
        R: parseFloat(R.toFixed(4)),
        dominantDim,
        dominantScore: weights[dominantDim] * feature.scores[dominantDim],
      };
    })
    .sort((a: any, b: any) => b.R - a.R);
}

// ═══════════════════════════════════════════════
// 构建文案生成Prompt
// ═══════════════════════════════════════════════

const DIM_DESCRIPTIONS: Record<string, string> = {
  P1: "掌控感与确定性——用户需要被说服'这个东西真的靠谱'，要用可验证的事实、数据、机制",
  P2: "效率与省力——用户最在乎'能帮我省时间省麻烦'，要让他们感受到具体的轻松",
  P3: "归属感与认同——用户在意'用这个的人是我想成为的那类人'，要建立群体认同或圈层归属",
  P4: "感官愉悦——用户被'光是想象使用就感到愉快'所打动，要给出具体的感官画面",
  P5: "关爱安全感——用户的驱动力是'保护我在乎的人'，要唤起对家人/宠物的情感",
  P6: "经济理性——用户核心问题是'这钱花得值吗'，要给出清晰的性价比逻辑",
  P7: "自我叙事与成长——用户在问'这符合我想象中的自己吗'，要让他感到'这就是我该有的选择'",
};

function buildCopyPrompt(user: any, product: any, rankedFeatures: any[], weights: Record<string, number>) {
  const top3 = rankedFeatures.slice(0, 3);

  // 格式化权重，只展示对这次结果影响最大的前3个维度
  const sortedWeights = Object.entries(weights)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([k, v]) => `${k}(${DIM_DESCRIPTIONS[k].split("——")[0]}): ${(v * 100).toFixed(1)}%`)
    .join("\n    ");

  const featuresText = top3.map((f: any, i: number) => `
  [亮点${i + 1}] ${f.label || f.name}
  产品事实：${f.fact}
  共鸣系数 R = ${(f.R * 100).toFixed(1)}分
  主导心理维度：${f.dominantDim} — ${DIM_DESCRIPTIONS[f.dominantDim]}
  `).join("\n");

  const systemPrompt = `你是腾讯视频广告共鸣引擎的文案生成模块。
你的任务是：根据已完成的共鸣系数计算结果，为选定的产品亮点生成能真正打动当前用户的专属广告文案。
数学计算已经完成，你的工作是把数字变成能戳人心的语言。
你必须返回严格的JSON，不含任何markdown或额外文字。`;

  const userPrompt = `
## 用户画像

会员等级：${user.membership}
性别：${user.gender}
年龄段：${user.age}
主要题材：${user.mainGenres.join("、")}
内容格调：${user.contentTone}
追剧行为：${user.followBehavior}
观看深度：${user.watchDepth}
观看频次：${user.watchFrequency}
互动强度：${user.interaction}

当前内容情绪基调：${user.currentMood}
当前内容题材：${user.currentGenre}
实时观看时段：${user.realTimeHour}

---

## 本次用户心理权重分析（前3位主导维度）

    ${sortedWeights}

这意味着：这个用户此刻最容易被"${Object.entries(weights).sort((a: any, b: any) => b[1] - a[1])[0][0]}"维度的信息打动。

---

## 已选定的Top 3亮点及共鸣系数

${featuresText}

---

## 广告产品信息

产品：${product.productName}
品牌：${product.brand || '未知'}

---

## 你的任务

**第一步：深度理解这个用户和产品**
根据以上数据，用2-3句话描述：
1. 这个人此刻的心理状态（在看什么，情绪是什么，注意力在哪）
2. 他们最容易被什么类型的信息触发购买意愿
3. 什么样的语言风格会让他们感到被理解而不是被推销

**第二步：为每个亮点生成专属文案**
对每个亮点，生成一句打动这个具体用户的广告文案。

【核心原则】
- 特征是产品的组成部分，文案要让用户感受到"这个产品整体适合我"
- 用户画像只是让你了解用户的语言风格和偏好，不要在文案中直接提及
- 用户喜欢看综艺 ≠ 文案里要写"看综艺"，而是用年轻人喜欢的方式来表达
- 每条文案必须回答："这和我有什么关系"

【文案硬性要求】
- 字数：12-18字之间
- 必须结合产品整体价值，不要只聚焦单一特征
- 禁止在文案中直接提及用户画像中的标签（如"综艺"、"悬疑"等）
- 用户画像只用于理解用户的语言风格和偏好，不用于文案内容
- 每条文案必须回答："这和我有什么关系"
- 必须给出一个用户能瞬间在脑子里播放的具体画面或感受
- 绝对禁止使用的词：极致、完美、颠覆、革命性、超级、震撼、非凡、卓越
- 禁止抽象概念，必须有具体场景或可感知的细节

**第三步：生成用户友好特征名**
对每个亮点，输出一个简短的"用户友好特征名"（6字以内），让人一看就懂。

**第四步：给出文案的心理拆解**
每条文案附一句话说明：这句话打的是用户哪个具体的心理点（20字以内，直接说，不要说"这句话..."）

---

## 返回格式（严格JSON）

{
  "userInsight": {
    "momentState": "此刻心理状态，一句话",
    "triggerType": "最容易被什么触发，一句话",
    "languageStyle": "适合的语言风格，一句话"
  },
  "results": [
    {
      "featureId": "f1",
      "featureLabel": "亮点名称",
      "friendlyLabel": "用户友好特征名，6字以内",
      "resonanceScore": 0.00,
      "dominantDim": "P1",
      "copy": "专属文案，12-18字",
      "psychBreakdown": "这句话打的心理点，20字以内"
    }
  ]
}
`;

  return { systemPrompt, userPrompt };
}

// ═══════════════════════════════════════════════
// 主调用函数：串联整个算法
// ═══════════════════════════════════════════════

async function generateHighlights(product: any, userProfile: any) {
  // 提取产品所有特性
  const allFeatures = product.dimensions.flatMap((d: any) => d.features);
  
  console.log('产品:', product.productName);
  console.log('特性数量:', allFeatures.length);
  
  // 如果产品没有scores字段，使用旧的提示词方案
  if (!allFeatures[0]?.scores) {
    console.log('无scores字段，使用旧方案');
    return await generateHighlightsLegacy(product, userProfile);
  }

  // Step 1: 计算用户权重
  const weights = computeUserWeights(userProfile);

  // Step 2: 对所有亮点排序
  const ranked = rankFeatures(allFeatures, weights);
  
  // Step 3: 从Top5中随机选3个，增加多样性
  const top5 = ranked.slice(0, 5);
  const shuffled = [...top5].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 3);

  // Step 4: 构建Prompt（使用选中的3个特性）
  const { systemPrompt, userPrompt } = buildCopyPrompt(userProfile, product, selected, weights);

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer sk-b7fedf8657444fc2b3f655584acf5472`
      },
      body: JSON.stringify({
        model: 'deepseek-v4-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })
    });

    const data = await response.json();
    console.log('API响应:', data);
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      const content = data.choices[0].message.content;
      console.log('API返回内容:', content);
      
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          // 更健壮的JSON清理
          let jsonStr = jsonMatch[0]
            .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // 移除控制字符
            .replace(/,\s*}/g, '}')  // 移除对象末尾逗号
            .replace(/,\s*]/g, ']')  // 移除数组末尾逗号
            .replace(/\\'/g, "'")    // 修复转义的单引号
            .replace(/'\s*:/g, ':')  // 修复单引号作为键
            .replace(/:\s*'([^']*)'/g, ': "$1"'); // 修复单引号作为值
          
          // 尝试提取results数组
          const resultsMatch = jsonStr.match(/"results"\s*:\s*\[[\s\S]*?\]/);
          if (resultsMatch) {
            const resultsStr = resultsMatch[0];
            const results = JSON.parse(resultsStr.replace('"results":', ''));
            if (Array.isArray(results) && results.length > 0) {
              return {
                count: results.length,
                items: results.map((r: any) => ({
                  title: r.friendlyLabel || r.featureLabel || '亮点',
                  text: r.copy || '暂无描述'
                }))
              };
            }
          }
        } catch (parseError) {
          console.error('JSON解析失败:', parseError);
        }
      }
    }
    
    // API返回异常，使用默认亮点
    console.log('使用默认亮点');
    return {
      count: selected.length,
      items: selected.map((f: any) => ({
        title: f.label || f.name || '亮点',
        text: f.fact || '暂无描述'
      }))
    };
  } catch (error) {
    console.error('API调用失败:', error);
    return {
      count: selected.length,
      items: selected.map((f: any) => ({
        title: f.label || f.name || '亮点',
        text: f.fact || '暂无描述'
      }))
    };
  }
}

// 旧方案降级函数
async function generateHighlightsLegacy(product: any, userProfile: any) {
  const allFeatures = product.dimensions.flatMap((d: any) => d.features);
  
  const prompt = `你是消费心理学广告文案，你写的文案不是描述产品，而是**把产品翻译成一个具体的人想听到的话**。

---

## 这个人是谁
${JSON.stringify(userProfile, null, 2)}

---

## 你能用的产品事实（严禁编造）
${allFeatures.map((f: any, i: number) => `${i + 1}. ${f.name}：${f.reason}`).join('\n')}

---

## 写作铁律

### 1. 必须在第一秒回答："这和我有什么关系"
不要说我有什么技术、我是什么成分、我是全球第几。
要说：你用了会怎样、你今天晚上会感受到什么、你身边的人会说什么。

严禁词汇：全球、第一、顶级、王者、霸主、征服、无懈可击、无惧、战甲、身份标
允许词汇：你今天、你终于、再也不用、省下、你室友/同事/对象会发现

### 2. 根据用户画像执行精确的语言转换

**会员身份 → 价值感的切入口**
- SVIP：写"优先拿到""为你留的""别人没有的"
- VIP：写"和原价比省了xx""续费的价今天薅走"
- 非会员：写"不用先掏钱""试试又不亏""不合适就换"

**内容偏好 → 比喻系统和感官**
- 甜宠：像写恋爱剧台词。比喻：心动、指尖、温度、靠近
- 悬疑：像写案件线索。比喻：证据、解锁、破译、反杀
- 热血：像比赛解说。比喻：拿下、翻盘、碾压、炸场
- 合家欢：像长辈叮嘱。比喻：放心、省心、不折腾
- 都市：像日程提醒。比喻：5分钟、搞定、直接开

**互动强度 → 亲密程度**
- 高互动：可以吐槽、玩梗、反差、自黑，像朋友群聊
- 零互动：用事实说服，语气稳、不夸张

**观看节奏 → 是给一颗子弹还是一组组合拳**
- 碎片型：只输出1条文案。它必须是一句能直接印在透明便利贴上的话。≤25字。
- 沉浸型：输出3条，分别从三个角度切入：一个讲场景感受、一个讲实际效果、一个讲购买理由。每条≤25字。

### 3. 格式
- 用 ** 包裹最想让用户看到的关键词（1-3个词），作为荧光笔标记
- 输出严格JSON，不多一字：
{
  "count": 1,
  "items": [
    {"text": "**控油48h** 以前下午就油了，现在能撑到火锅店打烊"}
  ]
}

---
开始写。`;

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer sk-b7fedf8657444fc2b3f655584acf5472`
      },
      body: JSON.stringify({
        model: 'deepseek-v4-flash',
        messages: [
          { role: 'system', content: '你只输出JSON。' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.error('API调用失败:', error);
    return null;
  }
}

// 动态亮点展示组件
function HighlightsBoard({ items, isVisible }: { items: any[], isVisible: boolean }) {
  const count = items.length;
  
  // 根据数量决定网格布局
  const getGridClass = () => {
    if (count <= 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-2';
    if (count === 3) return 'grid-cols-2';
    return 'grid-cols-2';
  };

  // 判断是否是大尺寸便利贴（第1个和最后1个如果是奇数个）
  const isLargeNote = (index: number) => {
    if (count <= 2) return true;
    if (count === 3) return index === 0;
    if (count === 4) return false;
    if (count === 5) return index === 0 || index === 4;
    return false;
  };

  return (
    <div className={`grid ${getGridClass()} gap-3 h-full p-2`}>
      {items.map((item, index) => (
        <div 
          key={item.id || index}
          className={`note ${isLargeNote(index) ? 'col-span-2' : 'col-span-1'} ${isVisible ? 'show' : ''}`}
          style={{ animationDelay: `${index * 150}ms` }}
        >
          <div className="w-full text-center space-y-3">
            {/* 标题：用户友好特征名 */}
            <p className="font-bold text-2xl text-foreground">
              <mark className="bg-yellow-200/60 px-3 py-1 rounded">
                {item.title || '亮点'}
              </mark>
            </p>
            {/* 推荐语：LLM生成的文案 */}
            <p className="text-lg text-muted-foreground leading-relaxed">
              {item.text || '暂无描述'}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// 打字机Hook
function useTypewriter(texts: string[], speed = 100, pauseDuration = 2500) {
  const [displayText, setDisplayText] = useState("")
  const [textIndex, setTextIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    const currentText = texts[textIndex]
    
    if (isPaused) {
      const pauseTimer = setTimeout(() => {
        setIsPaused(false)
        setIsDeleting(true)
      }, pauseDuration)
      return () => clearTimeout(pauseTimer)
    }

    const timer = setTimeout(() => {
      if (!isDeleting) {
        if (charIndex < currentText.length) {
          setDisplayText(currentText.slice(0, charIndex + 1))
          setCharIndex(charIndex + 1)
        } else {
          setIsPaused(true)
        }
      } else {
        if (charIndex > 0) {
          setDisplayText(currentText.slice(0, charIndex - 1))
          setCharIndex(charIndex - 1)
        } else {
          setIsDeleting(false)
          setTextIndex((textIndex + 1) % texts.length)
        }
      }
    }, isDeleting ? speed / 2 : speed)

    return () => clearTimeout(timer)
  }, [charIndex, isDeleting, isPaused, textIndex, texts, speed, pauseDuration])

  return { displayText, isTyping: !isPaused && !isDeleting }
}

// 滚动可见性Hook
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLElement>(null)
  const [isInView, setIsInView] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setIsInView(true)
          setHasAnimated(true)
        }
      },
      { threshold }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [threshold, hasAnimated])

  return { ref, isInView }
}

// 分类Banner组件
function CategoryBanner({ 
  activeCategory, 
  onCategoryChange,
  onVideoSelect,
  selectedVideo,
  expanded,
  onExpandedChange
}: { 
  activeCategory: string
  onCategoryChange: (id: string) => void
  onVideoSelect: (video: typeof VIDEO_DATA.fmcg[0]) => void
  selectedVideo: typeof VIDEO_DATA.fmcg[0] | null
  expanded: boolean
  onExpandedChange: (expanded: boolean) => void
}) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
        {AD_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => { onCategoryChange(cat.id); onExpandedChange(true) }}
            className={`
              px-4 py-2 text-sm transition-all duration-300 rounded-full
              ${activeCategory === cat.id 
                ? `${cat.color} font-medium shadow-sm` 
                : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'}
            `}
          >
            {cat.nameZh}
          </button>
        ))}
        <button 
          onClick={() => onExpandedChange(!expanded)}
          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <div className={`grid transition-all duration-400 ease-out ${expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div className="flex flex-wrap justify-center gap-2 pb-2">
            {VIDEO_DATA[activeCategory]?.map((video) => (
              <button
                key={video.id}
                onClick={() => onVideoSelect(video)}
                className={`
                  px-4 py-2.5 text-sm text-left transition-all duration-300 rounded-xl
                  ${selectedVideo?.id === video.id 
                    ? 'bg-foreground/10 text-foreground' 
                    : 'bg-secondary/30 text-muted-foreground hover:bg-secondary/60'}
                `}
              >
                <span className="font-medium">{video.title}</span>
                <span className="text-xs opacity-70 ml-2">{video.brand}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// 第一页：Hero
function HeroSection({ profile, onGenerateProfile }: { 
  profile: ReturnType<typeof generateProfile> | null
  onGenerateProfile: () => void 
}) {
  const { displayText } = useTypewriter(["广告精粹", "Ad Essence", "智能提炼", "价值聚焦"], 100, 2800)
  const { ref, isInView } = useInView()

  return (
    <section ref={ref as React.RefObject<HTMLDivElement>} className="min-h-screen flex items-center py-20">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-5 gap-12 lg:gap-20 items-center">
          {/* Left: Title */}
          <div className={`lg:col-span-3 space-y-10 transition-all duration-1000 ${isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
            <div className="space-y-6">
              <p className="text-xs tracking-[0.4em] text-muted-foreground/70 uppercase font-mono">
                Intelligent Ad Optimization
              </p>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.05]">
                <span className="inline-block min-w-[3ch] underline-sketch">{displayText}</span>
                <span className="inline-block w-[2px] h-[0.85em] bg-accent ml-1 animate-pulse align-middle" />
              </h1>
              
              <p className="text-xl text-muted-foreground/80 max-w-md leading-relaxed">
                智能压缩广告时长，精准传递品牌价值。
                <span className="block mt-2 text-foreground/90 font-medium">让每一秒都有意义。</span>
              </p>
            </div>
            
            {/* Stats */}
            <div className="flex flex-wrap gap-10 pt-4">
              {[
                { icon: <User className="w-4 h-4" />, value: "7", unit: "维", label: "心理分析" },
                { icon: <Sparkles className="w-4 h-4" />, value: "个性化", unit: "", label: "智能匹配" },
                { icon: <Zap className="w-4 h-4" />, value: "LLM", unit: "", label: "实时生成" },
              ].map((item, i) => (
                <div 
                  key={i} 
                  className={`transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                  style={{ transitionDelay: `${400 + i * 150}ms` }}
                >
                  <div className="flex items-center gap-1.5 text-primary mb-1 min-w-[70px] justify-center">
                    {item.icon}
                    <span className="text-xl font-semibold tracking-wide">{item.value}</span>
                    {item.unit && <span className="text-xl font-semibold">{item.unit}</span>}
                  </div>
                  <p className="text-xs text-muted-foreground text-center">{item.label}</p>
                </div>
              ))}
            </div>

            {/* Decorative element */}
            <div className="flex gap-3 pt-6">
              <div className="w-16 h-1 bg-primary/30 rounded-full" />
              <div className="w-8 h-1 bg-accent/40 rounded-full" />
              <div className="w-4 h-1 bg-primary/20 rounded-full" />
            </div>
          </div>

          {/* Right: User Profile */}
          <div 
            className={`lg:col-span-2 transition-all duration-1000 ${isInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}
            style={{ transitionDelay: '200ms' }}
          >
            <div className="relative">
              {/* 手账装饰 */}
              <div className="absolute -top-3 -left-3 w-6 h-6 border-l-2 border-t-2 border-primary/30" />
              <div className="absolute -bottom-3 -right-3 w-6 h-6 border-r-2 border-b-2 border-accent/30" />
              
              <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">用户画像</h3>
                      <p className="text-[10px] text-muted-foreground tracking-wider">USER PROFILE</p>
                    </div>
                  </div>
                  <button
                    onClick={onGenerateProfile}
                    className="px-4 py-2 bg-foreground text-background rounded-full text-xs font-medium hover:bg-foreground/90 transition-all hover:scale-105 flex items-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    随机生成
                  </button>
                </div>

                {profile ? (
                  <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {/* 维度一：账号基础信息 */}
                    <div className="space-y-1.5">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">账号基础</p>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">{profile.membership}</span>
                        <span className="px-2.5 py-1 bg-stone-100 text-stone-600 text-xs rounded-full">{profile.gender}</span>
                        <span className="px-2.5 py-1 bg-zinc-100 text-zinc-600 text-xs rounded-full">{profile.age}</span>
                      </div>
                    </div>

                    {/* 维度二：内容偏好图谱 */}
                    <div className="space-y-1.5">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">内容偏好</p>
                      <div className="flex flex-wrap gap-1.5">
                        {profile.mainGenres.map((g, i) => (
                          <span key={i} className={`px-2.5 py-1 text-xs rounded-full ${i === 0 ? 'bg-amber-50 text-amber-600' : 'bg-orange-50 text-orange-600'}`}>{g}</span>
                        ))}
                        <span className="px-2.5 py-1 bg-yellow-50 text-yellow-600 text-xs rounded-full">{profile.contentTone}</span>
                        <span className="px-2.5 py-1 bg-lime-50 text-lime-600 text-xs rounded-full">{profile.followBehavior}</span>
                      </div>
                    </div>

                    {/* 维度三：观看行为特征 */}
                    <div className="space-y-1.5">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">观看行为</p>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-xs rounded-full">{profile.watchDepth}</span>
                        <span className="px-2.5 py-1 bg-teal-50 text-teal-600 text-xs rounded-full">{profile.watchFrequency}</span>
                      </div>
                    </div>

                    {/* 维度四：互动与社交行为 */}
                    <div className="space-y-1.5">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">互动行为</p>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="px-2.5 py-1 bg-cyan-50 text-cyan-600 text-xs rounded-full">{profile.interaction}</span>
                      </div>
                    </div>

                    {/* 维度五：当前情境信号 */}
                    <div className="space-y-1.5">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">当前情境</p>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="px-2.5 py-1 bg-sky-50 text-sky-600 text-xs rounded-full">{profile.currentMood}</span>
                        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 text-xs rounded-full">{profile.currentGenre}</span>
                        <span className="px-2.5 py-1 bg-violet-50 text-violet-600 text-xs rounded-full">{profile.realTimeHour}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-56 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
                        <User className="w-5 h-5 text-muted-foreground/50" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        点击「随机生成」<br />查看用户画像示例
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// 腾讯视频落地展示
function TencentVideoShowcase() {
  const { ref, isInView } = useInView()

  return (
    <section ref={ref as React.RefObject<HTMLDivElement>} className="py-20">
      <div className="max-w-5xl mx-auto px-6 lg:px-8 w-full">
        {/* 标题 */}
        <div className={`text-center mb-12 transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-xs tracking-[0.3em] text-muted-foreground/70 uppercase font-mono mb-3">Landing Preview</p>
          <h2 className="text-2xl sm:text-3xl font-semibold">功能落地效果</h2>
        </div>

        {/* 图片展示区域 */}
        <div 
          className={`relative rounded-2xl overflow-hidden shadow-2xl transition-all duration-1000 
            ${isInView ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
          style={{ transitionDelay: '200ms' }}
        >
          {/* 装饰边框 */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-2xl blur-sm" />
          
            {/* 图片容器 */}
            <div className="relative bg-card rounded-xl overflow-hidden">
              <img 
                src="/tencent-video-preview.png" 
                alt="腾讯视频界面截图" 
                className="w-full h-auto object-cover"
              />
            </div>
        </div>

        {/* 文字说明 */}
        <div 
          className={`mt-10 text-center transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          style={{ transitionDelay: '400ms' }}
        >
          <p className="text-base text-muted-foreground/80 max-w-2xl mx-auto leading-relaxed">
            「广告精粹」功能在腾讯视频中的实际应用效果
          </p>
          <p className="text-sm text-muted-foreground/60 mt-3">
            用户可一键开启精粹模式，享受2倍速播放与智能亮点提取
          </p>
        </div>

        {/* 装饰元素 */}
        <div className={`flex justify-center gap-3 mt-8 transition-all duration-700 ${isInView ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '600ms' }}>
          <div className="w-12 h-1 bg-primary/20 rounded-full" />
          <div className="w-6 h-1 bg-accent/30 rounded-full" />
          <div className="w-3 h-1 bg-primary/15 rounded-full" />
        </div>
      </div>
    </section>
  )
}

// 第二页：普通模式痛点
function NormalModeSection({ 
  video, 
  isPlaying, 
  currentTime,
  duration,
  onPlay,
  onPause,
  onTimeUpdate,
  onDurationUpdate
}: { 
  video: typeof VIDEO_DATA.fmcg[0] | null
  isPlaying: boolean
  currentTime: number
  duration: number
  onPlay: () => void
  onPause: () => void
  onTimeUpdate: (time: number) => void
  onDurationUpdate: (duration: number) => void
}) {
  const { ref, isInView } = useInView()
  const videoRef = useRef<HTMLVideoElement>(null)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => {})
      } else {
        videoRef.current.pause()
      }
    }
  }, [isPlaying])

  useEffect(() => {
    if (videoRef.current && video) {
      videoRef.current.src = video.videoSrc
      videoRef.current.load()
    }
  }, [video])

  return (
    <section ref={ref as React.RefObject<HTMLDivElement>} className="min-h-screen flex items-center py-20">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 w-full">
        {/* Section Title */}
        <div className={`mb-12 transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-xs tracking-[0.3em] text-muted-foreground/70 uppercase font-mono mb-3">The Problem</p>
          <h2 className="text-3xl sm:text-4xl font-semibold">传统广告的困境</h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Left: Video Player */}
          <div className={`transition-all duration-700 ${isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`} style={{ transitionDelay: '200ms' }}>
            <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-muted/30 to-muted/10">
              <div className="px-5 py-4 flex items-center justify-between border-b border-border/30">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-rose-400" />
                  <div>
                    <p className="font-medium text-sm">{video?.title || '选择一个广告'}</p>
                    <p className="text-xs text-muted-foreground">{video?.brand || '品牌'}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-muted/60 text-muted-foreground text-[10px] rounded font-mono">NORMAL</span>
              </div>
              
              <div className="aspect-video bg-black relative">
                {video ? (
                  <>
                    <video 
                      ref={videoRef}
                      className="w-full h-full object-contain"
                      onTimeUpdate={(e) => onTimeUpdate(Math.floor(e.currentTarget.currentTime))}
                      onLoadedMetadata={(e) => onDurationUpdate(Math.floor(e.currentTarget.duration))}
                      onEnded={() => onPause()}
                      muted
                    />
                    
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background/60 to-transparent">
                      <div className="h-1 bg-foreground/10 rounded-full overflow-hidden">
                        <div className="h-full bg-foreground/25 transition-all duration-300" style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }} />
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-foreground/50 font-mono">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                        <Play className="w-8 h-8 text-white/50" />
                      </div>
                      <p className="text-white/50 text-sm">请从上方选择一个广告</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 flex items-center justify-center">
                <button 
                  onClick={isPlaying ? onPause : onPlay}
                  className="w-11 h-11 rounded-full bg-foreground/10 text-foreground/60 flex items-center justify-center hover:bg-foreground/15 transition-colors"
                  disabled={!video}
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Right: Pain Points */}
          <div className="space-y-4">
            <p 
              className={`text-sm text-muted-foreground mb-6 transition-all duration-700 ${isInView ? 'opacity-100' : 'opacity-0'}`}
              style={{ transitionDelay: '300ms' }}
            >
              为什么传统广告难以达到预期效果？
            </p>
            
            {PAIN_POINTS.map((point, index) => (
              <div 
                key={index}
                className={`group p-5 rounded-xl bg-gradient-to-r from-card/80 to-transparent 
                  hover:from-rose-50/50 hover:to-transparent transition-all duration-500
                  ${isInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}
                style={{ transitionDelay: `${350 + index * 100}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center ${point.color} shrink-0 group-hover:scale-110 transition-transform`}>
                    {point.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-medium">{point.title}</h4>
                      <span className={`text-xl font-semibold font-mono ${point.color}`}>{point.stat}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{point.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// 第三页：精粹模式
function EssenceModeSection({ 
  video,
  isPlaying,
  essenceTime,
  essenceDuration,
  highlights,
  isGenerating,
  hasHighlights,
  onPlay,
  onPause,
  onReset,
  onSeek,
  onTimeUpdate,
  onEssenceDurationUpdate
}: { 
  video: typeof VIDEO_DATA.fmcg[0] | null
  isPlaying: boolean
  essenceTime: number
  essenceDuration: number
  highlights: any[]
  isGenerating: boolean
  hasHighlights: boolean
  onPlay: () => void
  onPause: () => void
  onReset: () => void
  onSeek: (time: number) => void
  onTimeUpdate: (time: number) => void
  onEssenceDurationUpdate: (duration: number) => void
}) {
  const { ref, isInView } = useInView()
  const [muted, setMuted] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 2
      if (isPlaying) {
        videoRef.current.play().catch(() => {})
      } else {
        videoRef.current.pause()
      }
    }
  }, [isPlaying])

  useEffect(() => {
    if (videoRef.current && video) {
      videoRef.current.src = video.videoSrc
      videoRef.current.load()
      videoRef.current.playbackRate = 2
    }
  }, [video])

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = muted
    }
  }, [muted])

  return (
    <section ref={ref as React.RefObject<HTMLDivElement>} className="min-h-screen flex items-center py-20">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 w-full">
        {/* Section Title */}
        <div className={`mb-12 transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-xs tracking-[0.3em] text-muted-foreground/70 uppercase font-mono mb-3">The Solution</p>
          <h2 className="text-3xl sm:text-4xl font-semibold">精粹模式体验</h2>
        </div>

        {/* Main Player Container */}
        <div 
          className={`rounded-2xl overflow-hidden bg-gradient-to-br from-primary/5 to-accent/5 transition-all duration-700
            ${isInView ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
          style={{ transitionDelay: '200ms' }}
        >
          {/* Header */}
          <div className="px-5 py-4 flex items-center justify-between border-b border-primary/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">{video?.title || '选择一个广告'}</p>
                <p className="text-xs text-muted-foreground">{video?.brand || '品牌'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">2x</span>
              <span className="text-[10px] text-muted-foreground tracking-wider uppercase">Essence Mode</span>
            </div>
          </div>

          {/* Content Area */}
          <div className="aspect-video relative overflow-hidden">
            <div className="absolute inset-0 flex">
              {/* Video Area */}
              <div 
                className={`relative bg-black transition-all duration-700 ease-out
                  ${(isPlaying || hasHighlights) ? 'w-1/2' : 'w-full'}`}
              >
                {video ? (
                  <>
                    <video 
                      ref={videoRef}
                      className="w-full h-full object-contain"
                      onTimeUpdate={(e) => onTimeUpdate(Math.floor(e.currentTarget.currentTime / 2))}
                      onLoadedMetadata={(e) => onEssenceDurationUpdate(Math.floor(e.currentTarget.duration / 2))}
                      onEnded={() => onPause()}
                      muted={muted}
                    />

                    {/* Progress */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background/60 to-transparent">
                      <div className="h-1.5 bg-primary/15 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300" 
                          style={{ width: essenceDuration > 0 ? `${(essenceTime / essenceDuration) * 100}%` : '0%' }} 
                        />
                      </div>
                      <div className="flex justify-between mt-2 text-xs font-mono">
                        <span className="text-primary">{formatTime(essenceTime)}</span>
                        <span className="text-muted-foreground">{formatTime(essenceDuration)}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="w-8 h-8 text-white/50" />
                      </div>
                      <p className="text-white/50 text-sm">请从上方选择一个广告</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Collage Area - 手账风格 */}
              <div className={`overflow-hidden transition-all duration-700 ease-out ${(isPlaying || hasHighlights) ? 'w-1/2 opacity-100' : 'w-0 opacity-0'}`}>
                <div className="h-full journal-board">
                  {/* 产品名称显示 */}
                  {!isGenerating && hasHighlights && video && (
                    <div className="text-center mb-3">
                      <p className="text-lg font-bold text-foreground">
                        {PRODUCT_NAMES[video.id] || video.title}
                      </p>
                    </div>
                  )}
                  
                  {isGenerating ? (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center space-y-3">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                            <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                          </div>
                          <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">AI 精粹中...</p>
                          <p className="text-[10px] text-muted-foreground mt-1">正在为你生成个性化亮点</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <HighlightsBoard 
                      items={highlights} 
                      isVisible={isPlaying || hasHighlights}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="p-4 flex items-center justify-center gap-4 border-t border-primary/10">
            <button 
              onClick={onReset} 
              className="w-10 h-10 rounded-full bg-secondary/60 flex items-center justify-center hover:bg-secondary transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button 
              onClick={isPlaying ? onPause : onPlay}
              className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center hover:shadow-lg hover:shadow-primary/25 transition-all hover:scale-105"
              disabled={!video}
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
            </button>
            <button 
              onClick={() => setMuted(!muted)} 
              className="w-10 h-10 rounded-full bg-secondary/60 flex items-center justify-center hover:bg-secondary transition-colors"
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

// 第四页：对比
function ComparisonSection() {
  const { ref, isInView } = useInView()

  const values = [
    { 
      role: "用户", 
      benefit: "体验提升", 
      desc: "个性化亮点，减少广告厌烦",
      icon: <User className="w-5 h-5" />,
      color: "from-sky-400 to-sky-500"
    },
    { 
      role: "平台", 
      benefit: "效果提升", 
      desc: "精准匹配，提升广告价值",
      icon: <TrendingUp className="w-5 h-5" />,
      color: "from-emerald-400 to-emerald-500"
    },
    { 
      role: "广告商", 
      benefit: "转化提升", 
      desc: "精准触达，提高购买意愿",
      icon: <Zap className="w-5 h-5" />,
      color: "from-amber-400 to-amber-500"
    },
  ]

  return (
    <section ref={ref as React.RefObject<HTMLDivElement>} className="min-h-screen flex items-center py-20">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 w-full">
        {/* Section Title */}
        <div className={`text-center mb-16 transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-xs tracking-[0.3em] text-muted-foreground/70 uppercase font-mono mb-3">Win-Win-Win</p>
          <h2 className="text-3xl sm:text-4xl font-semibold">三方共赢</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {values.map((item, index) => (
            <div 
              key={item.role}
              className={`relative p-8 rounded-2xl bg-card/60 backdrop-blur-sm transition-all duration-700 text-center
                ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
              style={{ transitionDelay: `${200 + index * 150}ms` }}
            >
              {/* Decorative corner */}
              <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-primary/20 rounded-tr-lg" />
              <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-primary/20 rounded-bl-lg" />
              
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-6 mx-auto text-white`}>
                {item.icon}
              </div>
              
              <h3 className="text-xl font-semibold mb-2">{item.role}</h3>
              <p className={`text-lg font-medium bg-gradient-to-r ${item.color} bg-clip-text text-transparent mb-4`}>
                {item.benefit}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        <div 
          className={`mt-16 text-center transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          style={{ transitionDelay: '700ms' }}
        >
          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            通过AI智能精粹，广告不再是用户的负担
          </p>
          <p className="text-xl text-foreground font-medium mt-2">
            用户体验、平台价值、广告效果三方共赢
          </p>
        </div>
      </div>
    </section>
  )
}

// 主页面
export default function AdEssenceDemo() {
  const [activeCategory, setActiveCategory] = useState("fmcg")
  const [selectedVideo, setSelectedVideo] = useState<typeof VIDEO_DATA.fmcg[0] | null>(null)
  const [userProfile, setUserProfile] = useState<ReturnType<typeof generateProfile> | null>(null)
  
  const [normalIsPlaying, setNormalIsPlaying] = useState(false)
  const [essenceIsPlaying, setEssenceIsPlaying] = useState(false)
  const [normalTime, setNormalTime] = useState(0)
  const [normalDuration, setNormalDuration] = useState(0)
  const [essenceTime, setEssenceTime] = useState(0)
  const [essenceDuration, setEssenceDuration] = useState(0)
  const [expanded, setExpanded] = useState(true)

  // 产品文档
  const [allProducts, setAllProducts] = useState<any[]>([])
  const [currentHighlights, setCurrentHighlights] = useState<any[]>(HIGHLIGHTS)
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasHighlights, setHasHighlights] = useState(false)

  // 加载产品文档
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const productIds = ['fmcg-1', 'fmcg-2', 'tech-1', 'tech-2', 'luxury-1', 'luxury-2', 'internet-1', 'internet-2'];
        const products = await Promise.all(
          productIds.map(async (id) => {
            const res = await fetch(`/api/products/${id}`);
            if (res.ok) {
              const data = await res.json();
              return { ...data, video_id: id };
            }
            return null;
          })
        );
        setAllProducts(products.filter(Boolean));
      } catch (error) {
        console.error('加载产品文档失败:', error);
      }
    };
    loadProducts();
  }, []);

  // 检测当前是否在普通模式或精粹模式区域
  const [showBanner, setShowBanner] = useState(false)
  const normalRef = useRef<HTMLDivElement>(null)
  const essenceRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const windowHeight = window.innerHeight
      
      if (normalRef.current && essenceRef.current) {
        const normalTop = normalRef.current.offsetTop
        const normalHeight = normalRef.current.offsetHeight
        const essenceTop = essenceRef.current.offsetTop
        const essenceHeight = essenceRef.current.offsetHeight
        
        // 计算普通模式和精粹模式的总范围（减去一些缓冲区）
        const startRange = normalTop - windowHeight * 0.3
        const endRange = essenceTop + essenceHeight - windowHeight * 0.3
        
        setShowBanner(scrollY >= startRange && scrollY <= endRange)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // 初始检查

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNormalPlay = useCallback(() => {
    setNormalIsPlaying(true)
  }, [])

  const handleNormalPause = useCallback(() => {
    setNormalIsPlaying(false)
  }, [])

  const handleEssencePlay = useCallback(() => {
    setEssenceIsPlaying(true)
  }, [])

  const handleEssencePause = useCallback(() => {
    setEssenceIsPlaying(false)
  }, [])

  const handleReset = useCallback(() => {
    setNormalIsPlaying(false)
    setEssenceIsPlaying(false)
    setNormalTime(0)
    setEssenceTime(0)
  }, [])

  const handleSeek = useCallback((time: number) => {
    setEssenceTime(time)
    setNormalTime(time * 2)
  }, [])

  const handleNormalTimeUpdate = useCallback((time: number) => {
    setNormalTime(time)
  }, [])

  const handleEssenceTimeUpdate = useCallback((time: number) => {
    setEssenceTime(time)
  }, [])

  const handleNormalDurationUpdate = useCallback((duration: number) => {
    setNormalDuration(duration)
  }, [])

  const handleEssenceDurationUpdate = useCallback((duration: number) => {
    setEssenceDuration(duration)
  }, [])

  // 生成用户画像
  const handleGenerateProfile = useCallback(() => {
    const newProfile = generateProfile();
    setUserProfile(newProfile);
  }, [])

  // 选择视频并生成亮点
  const handleVideoSelect = useCallback(async (video: typeof VIDEO_DATA.fmcg[0]) => {
    setSelectedVideo(video)
    handleReset()
    setHasHighlights(true) // 立即显示拼贴板区域
    setIsGenerating(true)
    setCurrentHighlights([])
    
    // 如果没有用户画像，先生成一个
    let currentUserProfile = userProfile;
    if (!currentUserProfile) {
      currentUserProfile = generateProfile();
      setUserProfile(currentUserProfile);
    }
    
    // 查找对应的产品文档
    const product = allProducts.find(p => p.video_id === video.id);
    
    if (product) {
      try {
        const result = await generateHighlights(product, currentUserProfile)
        
        if (result && result.items && result.items.length > 0) {
          setCurrentHighlights(result.items.map((item: any, i: number) => ({
            id: i + 1,
            title: item.title || '亮点',
            text: item.text || '暂无描述',
            style: ['tape', 'pin', 'tape-coral', 'pin', 'tape-mint'][i % 5],
            rotate: [-2, 3, -1, 2, -3][i % 5]
          })));
        } else {
          // 使用默认亮点
          setCurrentHighlights(HIGHLIGHTS.slice(0, 4).map(h => ({
            ...h,
            title: h.title || '亮点',
            text: h.desc || '暂无描述'
          })));
        }
      } catch (error) {
        console.error('生成亮点失败:', error);
        setCurrentHighlights(HIGHLIGHTS.slice(0, 4).map(h => ({
          ...h,
          title: h.title || '亮点',
          text: h.desc || '暂无描述'
        })));
      }
    } else {
      setCurrentHighlights(HIGHLIGHTS.slice(0, 4).map(h => ({
        ...h,
        title: h.title || '亮点',
        text: h.desc || '暂无描述'
      })));
    }
    
    setIsGenerating(false)
  }, [handleReset, allProducts, userProfile])

  return (
    <main className="min-h-screen paper-bg">
      {/* Sticky分类Banner - 只在普通模式和精粹模式显示 */}
      <div className={`sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border/20 py-3 transition-all duration-300 ${showBanner ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'}`}>
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <CategoryBanner 
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            onVideoSelect={handleVideoSelect}
            selectedVideo={selectedVideo}
            expanded={expanded}
            onExpandedChange={setExpanded}
          />
        </div>
      </div>

      <HeroSection 
        profile={userProfile} 
        onGenerateProfile={handleGenerateProfile} 
      />

      <TencentVideoShowcase />

      <div ref={normalRef}>
        <NormalModeSection 
          video={selectedVideo} 
          isPlaying={normalIsPlaying} 
          currentTime={normalTime}
          duration={normalDuration}
          onPlay={handleNormalPlay} 
          onPause={handleNormalPause}
          onTimeUpdate={handleNormalTimeUpdate}
          onDurationUpdate={handleNormalDurationUpdate}
        />
      </div>

      <div ref={essenceRef}>
        <EssenceModeSection 
          video={selectedVideo} 
          isPlaying={essenceIsPlaying} 
          essenceTime={essenceTime}
          essenceDuration={essenceDuration}
          highlights={currentHighlights}
          isGenerating={isGenerating}
          hasHighlights={hasHighlights}
          onPlay={handleEssencePlay} 
          onPause={handleEssencePause} 
          onReset={handleReset} 
          onSeek={handleSeek}
          onTimeUpdate={handleEssenceTimeUpdate}
          onEssenceDurationUpdate={handleEssenceDurationUpdate}
        />
      </div>

      <ComparisonSection />

      <footer className="py-12 border-t border-border/20">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 text-center">
          <p className="text-sm text-muted-foreground">Ad Essence Demo · 广告精粹功能演示</p>
        </div>
      </footer>
    </main>
  )
}
