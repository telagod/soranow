import { useState, useEffect, useRef } from 'react'
import { Image, Video, Loader2, Upload, X, Wand2 } from 'lucide-react'
import { StyleSelector } from './StyleSelector'
import { TemplateQuickSelect } from './TemplateLibrary'
import { CharacterPicker } from './CharacterManager'
import { type Template } from './templates'
import { ORIENTATIONS, DURATIONS, SIZE_OPTIONS } from './styles'
import { api, type TokenData } from '../../api'
import { useToast } from '../Toast'
import type { GenerationResult } from './ResultGallery'

type GenerationType = 'image' | 'video'

interface QuickGenerateProps {
  tokens: TokenData[]
  onResult: (result: GenerationResult) => void
}

export function QuickGenerate({ tokens, onResult }: QuickGenerateProps) {
  const [type, setType] = useState<GenerationType>('video')
  const [prompt, setPrompt] = useState('')
  const [selectedTokenId, setSelectedTokenId] = useState<number | null>(null)
  const [selectedStyle, setSelectedStyle] = useState<string | undefined>()
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape')
  const [duration, setDuration] = useState(5)
  const [imageSize, setImageSize] = useState('1024x1024')
  const [selectedCharacterIds, setSelectedCharacterIds] = useState<string[]>([])
  const [referenceImage, setReferenceImage] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState<string>('')
  const [showAdvanced, setShowAdvanced] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const toast = useToast()

  // Filter active tokens
  const activeTokens = tokens.filter(t => t.is_active && !t.is_expired)

  // Set default token
  useEffect(() => {
    if (activeTokens.length > 0 && !selectedTokenId) {
      setSelectedTokenId(activeTokens[0].id)
    }
  }, [activeTokens, selectedTokenId])

  // Handle template selection
  const handleTemplateSelect = (template: Template) => {
    if (template.shots.length > 0) {
      setPrompt(template.shots[0].prompt)
      if (template.style) {
        setSelectedStyle(template.style)
      }
    }
  }

  // Handle reference image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('请选择图片文件')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('图片不能超过 10MB')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setReferenceImage(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  // Generate
  const handleGenerate = async () => {
    if (!selectedTokenId) {
      toast.error('请选择 Token')
      return
    }

    if (!prompt.trim()) {
      toast.error('请输入提示词')
      return
    }

    setIsGenerating(true)
    setGenerationProgress('正在提交...')

    try {
      // Build prompt with style
      let finalPrompt = prompt
      if (selectedStyle) {
        finalPrompt = `${prompt}, ${selectedStyle} style`
      }

      if (type === 'video') {
        // Generate video
        const result = await api.generateVideo({
          token_id: selectedTokenId,
          prompt: finalPrompt,
          duration,
          aspect_ratio: orientation === 'landscape' ? '16:9' : '9:16',
          model: 'sora',
          cameo_ids: selectedCharacterIds.length > 0 ? selectedCharacterIds : undefined,
          reference_image: referenceImage || undefined,
        })

        setGenerationProgress('正在生成视频...')

        // Poll for completion
        const videoUrl = await pollGeneration(result.generation_id, selectedTokenId)

        if (videoUrl) {
          onResult({
            id: result.generation_id,
            type: 'video',
            url: videoUrl,
            prompt,
            model: 'Sora',
            style: selectedStyle,
            duration,
            timestamp: Date.now(),
          })
          toast.success('视频生成成功!')
          setPrompt('')
        } else {
          throw new Error('生成超时')
        }
      } else {
        // Generate image
        const result = await api.generateImage({
          token_id: selectedTokenId,
          prompt: finalPrompt,
          size: imageSize,
          model: 'dall-e-3',
        })

        if (result.image_url) {
          onResult({
            id: crypto.randomUUID(),
            type: 'image',
            url: result.image_url,
            prompt,
            model: 'DALL-E 3',
            style: selectedStyle,
            timestamp: Date.now(),
          })
          toast.success('图片生成成功!')
          setPrompt('')
        } else {
          throw new Error('生成失败')
        }
      }
    } catch (err: any) {
      toast.error(err.message || '生成失败')
    } finally {
      setIsGenerating(false)
      setGenerationProgress('')
    }
  }

  // Poll for generation completion
  const pollGeneration = async (generationId: string, tokenId: number): Promise<string | null> => {
    const maxAttempts = 120 // 10 minutes max
    let attempts = 0

    while (attempts < maxAttempts) {
      try {
        const status = await api.getGenerationStatus(generationId, tokenId)

        if (status.status === 'completed' && status.video_url) {
          return status.video_url
        }

        if (status.status === 'failed') {
          throw new Error(status.error || '生成失败')
        }

        // Update progress
        if (status.progress) {
          setGenerationProgress(`生成中... ${Math.round(status.progress * 100)}%`)
        }

        await new Promise(resolve => setTimeout(resolve, 5000))
        attempts++
      } catch (err: any) {
        if (err.message && err.message !== '生成失败') {
          throw err
        }
        attempts++
        if (attempts >= maxAttempts) {
          return null
        }
        await new Promise(resolve => setTimeout(resolve, 5000))
      }
    }

    return null
  }

  return (
    <div className="space-y-6">
      {/* Type Selector */}
      <div className="flex gap-2">
        <button
          onClick={() => setType('video')}
          className={`flex-1 h-12 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
            type === 'video'
              ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
              : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]'
          }`}
        >
          <Video className="w-5 h-5" />
          <span className="font-medium">视频</span>
        </button>
        <button
          onClick={() => setType('image')}
          className={`flex-1 h-12 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
            type === 'image'
              ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
              : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]'
          }`}
        >
          <Image className="w-5 h-5" />
          <span className="font-medium">图片</span>
        </button>
      </div>

      {/* Token Selector */}
      <div>
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
          选择 Token
        </label>
        <select
          value={selectedTokenId || ''}
          onChange={(e) => setSelectedTokenId(Number(e.target.value))}
          className="w-full h-9 px-3 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
        >
          {activeTokens.length === 0 && (
            <option value="">无可用 Token</option>
          )}
          {activeTokens.map((token) => (
            <option key={token.id} value={token.id}>
              {token.email || token.name || `Token #${token.id}`}
            </option>
          ))}
        </select>
      </div>

      {/* Prompt Input */}
      <div>
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
          提示词 <span className="text-red-500">*</span>
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={type === 'video'
            ? '描述你想要生成的视频内容...\n例如：一只可爱的柴犬在樱花树下奔跑，阳光明媚，电影感镜头'
            : '描述你想要生成的图片内容...'
          }
          rows={4}
          disabled={isGenerating}
          className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] resize-none disabled:opacity-50"
        />
      </div>

      {/* Quick Templates */}
      <TemplateQuickSelect onSelect={handleTemplateSelect} />

      {/* Basic Options */}
      <div className="grid grid-cols-2 gap-4">
        {/* Orientation / Size */}
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
            {type === 'video' ? '画面比例' : '图片尺寸'}
          </label>
          {type === 'video' ? (
            <div className="flex gap-2">
              {ORIENTATIONS.map((o) => (
                <button
                  key={o.id}
                  onClick={() => setOrientation(o.id as 'landscape' | 'portrait')}
                  disabled={isGenerating}
                  className={`flex-1 h-9 text-xs rounded-md transition-colors disabled:opacity-50 ${
                    orientation === o.id
                      ? 'bg-[var(--accent)] text-white'
                      : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {o.name}
                </button>
              ))}
            </div>
          ) : (
            <select
              value={imageSize}
              onChange={(e) => setImageSize(e.target.value)}
              disabled={isGenerating}
              className="w-full h-9 px-3 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] disabled:opacity-50"
            >
              {SIZE_OPTIONS.map((size) => (
                <option key={size.id} value={size.id}>
                  {size.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Duration (video only) */}
        {type === 'video' && (
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
              时长
            </label>
            <div className="flex gap-1">
              {DURATIONS.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setDuration(d.value)}
                  disabled={isGenerating}
                  className={`flex-1 h-9 text-xs rounded-md transition-colors disabled:opacity-50 ${
                    duration === d.value
                      ? 'bg-[var(--accent)] text-white'
                      : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Style Selector */}
      <StyleSelector
        selectedId={selectedStyle}
        onSelect={setSelectedStyle}
      />

      {/* Advanced Options Toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="text-xs text-[var(--accent)] hover:underline"
      >
        {showAdvanced ? '隐藏高级选项' : '显示高级选项'}
      </button>

      {/* Advanced Options */}
      {showAdvanced && (
        <div className="space-y-4 p-4 bg-[var(--bg-tertiary)] rounded-lg">
          {/* Character Picker (video only) */}
          {type === 'video' && (
            <CharacterPicker
              tokens={tokens}
              selectedIds={selectedCharacterIds}
              onSelectionChange={setSelectedCharacterIds}
              maxSelect={3}
            />
          )}

          {/* Reference Image (video only) */}
          {type === 'video' && (
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                参考图片 (可选)
              </label>
              {referenceImage ? (
                <div className="relative w-32 h-32">
                  <img
                    src={referenceImage}
                    alt="Reference"
                    className="w-full h-full object-cover rounded-lg border border-[var(--border)]"
                  />
                  <button
                    onClick={() => setReferenceImage(null)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isGenerating}
                  className="w-32 h-32 border-2 border-dashed border-[var(--border)] hover:border-[var(--accent)] rounded-lg flex flex-col items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors disabled:opacity-50"
                >
                  <Upload className="w-6 h-6 mb-1" />
                  <span className="text-xs">上传图片</span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          )}
        </div>
      )}

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating || !prompt.trim() || !selectedTokenId}
        className="w-full h-12 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            {generationProgress || '生成中...'}
          </>
        ) : (
          <>
            <Wand2 className="w-5 h-5" />
            生成{type === 'video' ? '视频' : '图片'}
          </>
        )}
      </button>

      {/* Tips */}
      <div className="text-xs text-[var(--text-muted)] space-y-1">
        <p>💡 提示：详细的描述能获得更好的效果</p>
        <p>💡 使用风格预设可以快速调整视觉效果</p>
        {type === 'video' && (
          <p>💡 选择角色可以保持视频中人物的一致性</p>
        )}
      </div>
    </div>
  )
}
