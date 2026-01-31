// Style preset definition
export interface StylePreset {
  id: string
  name: string
  description: string
  icon: string
  promptSuffix?: string // Optional suffix to add to prompts
}

// Predefined style presets (matching Sora's style_id options)
export const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'none',
    name: '默认',
    description: '不应用任何风格预设',
    icon: '🎬',
  },
  {
    id: 'festive',
    name: '节日',
    description: '温馨欢乐的节日氛围，适合庆祝场景',
    icon: '🎉',
    promptSuffix: 'festive atmosphere, celebration, warm colors, joyful mood',
  },
  {
    id: 'retro',
    name: '复古',
    description: '80年代复古风格，霓虹灯和合成器美学',
    icon: '📼',
    promptSuffix: 'retro 80s style, neon lights, synthwave aesthetic, vintage',
  },
  {
    id: 'news',
    name: '新闻',
    description: '新闻报道风格，专业严肃的视觉效果',
    icon: '📺',
    promptSuffix: 'news broadcast style, professional, documentary look',
  },
  {
    id: 'selfie',
    name: '自拍',
    description: '手机自拍视角，亲切自然的风格',
    icon: '🤳',
    promptSuffix: 'selfie style, phone camera, casual, personal vlog',
  },
  {
    id: 'handheld',
    name: '手持',
    description: '手持摄像机效果，真实感和临场感',
    icon: '📹',
    promptSuffix: 'handheld camera, shaky cam, documentary style, raw footage',
  },
  {
    id: 'anime',
    name: '动漫',
    description: '日式动漫风格，二次元美学',
    icon: '🎌',
    promptSuffix: 'anime style, Japanese animation, cel shading, vibrant colors',
  },
  {
    id: 'comic',
    name: '漫画',
    description: '美式漫画风格，鲜明的线条和色彩',
    icon: '💥',
    promptSuffix: 'comic book style, bold lines, pop art colors, graphic novel',
  },
  {
    id: 'golden',
    name: '金色',
    description: '金色电影色调，温暖的黄金时刻',
    icon: '🌅',
    promptSuffix: 'golden hour, warm cinematic color grading, film look',
  },
  {
    id: 'vintage',
    name: '怀旧',
    description: '老电影胶片质感，复古怀旧',
    icon: '🎞️',
    promptSuffix: 'vintage film, grain texture, faded colors, nostalgic',
  },
]

// Get style by ID
export function getStyleById(id: string): StylePreset | undefined {
  return STYLE_PRESETS.find(s => s.id === id)
}

// Get style name by ID
export function getStyleName(id: string): string {
  const style = getStyleById(id)
  return style?.name || '默认'
}

// Apply style to prompt (optional enhancement)
export function applyStyleToPrompt(prompt: string, styleId: string): string {
  const style = getStyleById(styleId)
  if (!style || !style.promptSuffix || styleId === 'none') {
    return prompt
  }
  return `${prompt}, ${style.promptSuffix}`
}

// Video orientation options
export const ORIENTATIONS = [
  { id: 'landscape', name: '横向 (16:9)', icon: '🖥️', width: 1920, height: 1080 },
  { id: 'portrait', name: '纵向 (9:16)', icon: '📱', width: 1080, height: 1920 },
] as const

export type Orientation = typeof ORIENTATIONS[number]['id']

// Duration options (in seconds)
export const DURATIONS = [
  { value: 5, label: '5 秒' },
  { value: 10, label: '10 秒' },
  { value: 15, label: '15 秒' },
  { value: 20, label: '20 秒' },
  { value: 25, label: '25 秒' },
] as const

// Model options for video generation
export const VIDEO_MODELS = [
  { id: 'sy_8', name: 'Sora2 标准', description: '标准质量，速度较快' },
  { id: 'sy_8_pro', name: 'Sora2 Pro', description: '更高质量，需要更多配额' },
] as const

// Size options
export const SIZE_OPTIONS = [
  { id: 'small', name: '小', description: '480p，速度快' },
  { id: 'medium', name: '中', description: '720p，平衡' },
  { id: 'large', name: '大', description: '1080p，高质量' },
] as const
