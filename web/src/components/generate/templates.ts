// Template categories
export const TEMPLATE_CATEGORIES = {
  cinematic: '电影风格',
  commercial: '商业广告',
  social: '社交媒体',
  education: '教育科普',
  story: '故事叙事',
  product: '产品展示',
  travel: '旅行风光',
  character: '角色动画',
} as const

export type TemplateCategory = keyof typeof TEMPLATE_CATEGORIES

// Shot definition for templates
export interface TemplateShot {
  duration: number // seconds (5-25)
  prompt: string
  characterRef?: string // @username placeholder
}

// Template definition
export interface Template {
  id: string
  category: TemplateCategory
  name: string
  description: string
  shots: TemplateShot[]
  style?: string
  thumbnail?: string
}

// Predefined templates
export const TEMPLATES: Template[] = [
  // ========== 电影风格 ==========
  {
    id: 'cinematic-opening',
    category: 'cinematic',
    name: '电影开场',
    description: '史诗级电影开场镜头，适合预告片和宣传视频',
    shots: [
      { duration: 5, prompt: '航拍镜头，缓缓下降穿过云层，露出壮观的城市天际线，金色阳光洒落，电影感色调' },
      { duration: 5, prompt: '镜头推进，穿过繁忙的街道，人群熙攘，霓虹灯闪烁，浅景深' },
      { duration: 5, prompt: '特写镜头，主角背影，站在高楼天台，俯瞰城市，风吹动衣角，史诗感' },
    ],
    style: 'golden',
  },
  {
    id: 'cinematic-chase',
    category: 'cinematic',
    name: '追逐场景',
    description: '紧张刺激的追逐戏，动态镜头',
    shots: [
      { duration: 5, prompt: '手持镜头，主角在狭窄的巷子里奔跑，镜头跟随，动态模糊，紧张氛围' },
      { duration: 5, prompt: '低角度镜头，脚步特写，踩过水坑溅起水花，慢动作' },
      { duration: 5, prompt: '航拍俯视，主角穿过屋顶跳跃，城市夜景背景' },
    ],
    style: 'handheld',
  },
  {
    id: 'cinematic-emotional',
    category: 'cinematic',
    name: '情感特写',
    description: '细腻的情感表达镜头',
    shots: [
      { duration: 5, prompt: '柔和的侧光，人物面部特写，眼中含泪，浅景深，温暖色调' },
      { duration: 5, prompt: '双人镜头，两人相对而坐，窗外雨滴，室内温馨灯光' },
      { duration: 5, prompt: '慢镜头，拥抱的两人，镜头缓缓环绕，背景虚化' },
    ],
    style: 'golden',
  },

  // ========== 商业广告 ==========
  {
    id: 'product-showcase',
    category: 'commercial',
    name: '产品展示',
    description: '高端产品展示模板，适合电商和品牌宣传',
    shots: [
      { duration: 5, prompt: '纯白背景，产品从画面外缓缓滑入，柔和的工作室灯光，微距镜头' },
      { duration: 5, prompt: '360度旋转展示产品细节，光线流动，突出材质质感，反射高光' },
      { duration: 5, prompt: '产品悬浮在空中，周围粒子光效环绕，品牌色调背景' },
    ],
  },
  {
    id: 'food-commercial',
    category: 'commercial',
    name: '美食广告',
    description: '诱人的美食展示，适合餐饮品牌',
    shots: [
      { duration: 5, prompt: '微距镜头，食材落入锅中，油花四溅，慢动作，暖色调' },
      { duration: 5, prompt: '俯拍镜头，精美摆盘的菜品，蒸汽缓缓升起，柔和灯光' },
      { duration: 5, prompt: '特写镜头，筷子夹起食物，拉丝效果，食欲感' },
    ],
  },
  {
    id: 'tech-reveal',
    category: 'commercial',
    name: '科技产品发布',
    description: '科技感十足的产品揭幕',
    shots: [
      { duration: 5, prompt: '黑色背景，蓝色光线扫过，产品轮廓逐渐显现，科技感' },
      { duration: 5, prompt: '产品爆炸分解图，各部件悬浮展示，全息效果' },
      { duration: 5, prompt: '产品组装完成，发出光芒，粒子效果环绕，未来感' },
    ],
  },

  // ========== 社交媒体 ==========
  {
    id: 'viral-hook',
    category: 'social',
    name: '病毒式开头',
    description: '抓住注意力的短视频开头，适合抖音/TikTok',
    shots: [
      { duration: 5, prompt: '快速变焦，直接怼脸特写，表情夸张，动态模糊效果，高饱和度' },
    ],
    style: 'handheld',
  },
  {
    id: 'before-after',
    category: 'social',
    name: '前后对比',
    description: '戏剧性的前后对比效果',
    shots: [
      { duration: 5, prompt: '分屏效果，左边灰暗破旧，右边明亮崭新，对比强烈' },
      { duration: 5, prompt: '转场特效，从旧到新的变化过程，魔法粒子效果' },
    ],
  },
  {
    id: 'day-in-life',
    category: 'social',
    name: '一日生活',
    description: 'Vlog风格的日常记录',
    shots: [
      { duration: 5, prompt: '清晨阳光透过窗帘，人物在床上伸懒腰，温馨氛围' },
      { duration: 5, prompt: '咖啡制作过程，拿铁拉花，手持镜头，生活感' },
      { duration: 5, prompt: '夕阳下的街道漫步，金色光线，惬意氛围' },
    ],
    style: 'selfie',
  },

  // ========== 教育科普 ==========
  {
    id: 'explainer-intro',
    category: 'education',
    name: '科普开场',
    description: '吸引人的科普视频开场',
    shots: [
      { duration: 5, prompt: '宇宙星空背景，镜头快速穿越星云，震撼的太空场景' },
      { duration: 5, prompt: '地球从太空视角，缓缓旋转，大气层发光' },
      { duration: 5, prompt: '镜头俯冲进入地球，穿过云层，到达目标地点' },
    ],
  },
  {
    id: 'process-demo',
    category: 'education',
    name: '流程演示',
    description: '清晰的步骤演示',
    shots: [
      { duration: 5, prompt: '干净的白色背景，手部特写，展示第一步操作，清晰明了' },
      { duration: 5, prompt: '俯拍视角，工具和材料整齐排列，逐一介绍' },
      { duration: 5, prompt: '完成效果展示，360度旋转，专业灯光' },
    ],
  },

  // ========== 故事叙事 ==========
  {
    id: 'hero-journey',
    category: 'story',
    name: '英雄之旅',
    description: '经典英雄叙事结构，适合故事类视频',
    shots: [
      { duration: 5, prompt: '平静的村庄，主角在田间劳作，阳光明媚，田园风光' },
      { duration: 5, prompt: '天空突然变暗，远处山脉出现不祥的红光，村民惊恐' },
      { duration: 5, prompt: '主角握紧拳头，眼神坚定，背起行囊踏上旅程' },
      { duration: 5, prompt: '主角行走在荒野中，风沙漫天，孤独的背影' },
      { duration: 5, prompt: '主角站在山顶，俯瞰前方的黑暗城堡，准备最终决战' },
    ],
  },
  {
    id: 'love-story',
    category: 'story',
    name: '爱情故事',
    description: '浪漫的爱情叙事',
    shots: [
      { duration: 5, prompt: '咖啡馆内，两人目光相遇，时间仿佛静止，柔和光线' },
      { duration: 5, prompt: '雨中漫步，共撑一把伞，街灯倒影，浪漫氛围' },
      { duration: 5, prompt: '海边日落，两人牵手奔跑，金色阳光，幸福感' },
    ],
    style: 'golden',
  },
  {
    id: 'mystery-thriller',
    category: 'story',
    name: '悬疑惊悚',
    description: '紧张的悬疑氛围',
    shots: [
      { duration: 5, prompt: '昏暗的走廊，闪烁的灯光，人影一闪而过，恐怖氛围' },
      { duration: 5, prompt: '特写镜头，颤抖的手打开一扇门，门后一片黑暗' },
      { duration: 5, prompt: '突然的闪电照亮房间，揭示惊人的场景，悬念感' },
    ],
  },

  // ========== 产品展示 ==========
  {
    id: 'fashion-lookbook',
    category: 'product',
    name: '时尚大片',
    description: '高端时尚产品展示',
    shots: [
      { duration: 5, prompt: '模特走秀，T台灯光，服装细节特写，时尚杂志风格' },
      { duration: 5, prompt: '慢动作转身，裙摆飘动，光影流动，高级感' },
      { duration: 5, prompt: '配饰特写，珠宝闪耀，微距镜头，奢华质感' },
    ],
  },
  {
    id: 'car-commercial',
    category: 'product',
    name: '汽车广告',
    description: '动感的汽车展示',
    shots: [
      { duration: 5, prompt: '汽车在山路疾驰，航拍跟随，壮观风景，速度感' },
      { duration: 5, prompt: '车身特写，光线流动，金属质感，反射天空' },
      { duration: 5, prompt: '内饰展示，皮革细节，科技感仪表盘，豪华氛围' },
    ],
  },

  // ========== 旅行风光 ==========
  {
    id: 'travel-montage',
    category: 'travel',
    name: '旅行蒙太奇',
    description: '精彩的旅行集锦',
    shots: [
      { duration: 5, prompt: '飞机起飞，窗外云海，旅程开始的期待感' },
      { duration: 5, prompt: '异国街头漫步，当地特色建筑，人文风情' },
      { duration: 5, prompt: '壮观的自然风光，山川湖海，航拍大场景' },
      { duration: 5, prompt: '日落时分，剪影人物，美好回忆定格' },
    ],
  },
  {
    id: 'city-timelapse',
    category: 'travel',
    name: '城市延时',
    description: '城市风光延时摄影风格',
    shots: [
      { duration: 5, prompt: '城市日出延时，天空从黑暗到金色，建筑剪影' },
      { duration: 5, prompt: '繁忙街道延时，车流光轨，人群快速移动' },
      { duration: 5, prompt: '城市夜景延时，万家灯火，星空旋转' },
    ],
  },

  // ========== 角色动画 ==========
  {
    id: 'character-intro',
    category: 'character',
    name: '角色登场',
    description: '角色出场介绍模板（需配合角色一致性功能）',
    shots: [
      { duration: 5, prompt: '@{character} 从阴影中走出，灯光逐渐照亮面部，自信的微笑' },
      { duration: 5, prompt: '@{character} 展示招牌动作，镜头环绕，动态光影' },
      { duration: 5, prompt: '@{character} 直视镜头，挥手致意，背景虚化' },
    ],
  },
  {
    id: 'character-action',
    category: 'character',
    name: '角色动作',
    description: '角色动作展示（需配合角色一致性功能）',
    shots: [
      { duration: 5, prompt: '@{character} 奔跑中，动态模糊，充满活力' },
      { duration: 5, prompt: '@{character} 跳跃动作，慢动作定格，力量感' },
      { duration: 5, prompt: '@{character} 着陆姿势，尘土飞扬，英雄感' },
    ],
  },
  {
    id: 'character-emotion',
    category: 'character',
    name: '角色情感',
    description: '角色情感表达（需配合角色一致性功能）',
    shots: [
      { duration: 5, prompt: '@{character} 开心大笑，阳光明媚，温暖氛围' },
      { duration: 5, prompt: '@{character} 沉思表情，窗边剪影，文艺感' },
      { duration: 5, prompt: '@{character} 惊讶表情，特写镜头，戏剧效果' },
    ],
  },
]

// Get templates by category
export function getTemplatesByCategory(category: TemplateCategory): Template[] {
  return TEMPLATES.filter(t => t.category === category)
}

// Get template by ID
export function getTemplateById(id: string): Template | undefined {
  return TEMPLATES.find(t => t.id === id)
}

// Replace character placeholder in template
export function applyCharacterToTemplate(template: Template, characterUsername: string): Template {
  return {
    ...template,
    shots: template.shots.map(shot => ({
      ...shot,
      prompt: shot.prompt.replace(/@\{character\}/g, `@${characterUsername}`),
    })),
  }
}

// Replace character placeholder in a single prompt string
export function applyCharacterToPrompt(prompt: string, characterUsername: string): string {
  return prompt.replace(/@\{character\}/g, `@${characterUsername}`)
}
