import { useState, useEffect, useCallback } from 'react'
import { Plus, Play, Loader2, Film, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { ShotCard, ShotPreview, type Shot } from './ShotCard'
import { StyleSelectorCompact } from './StyleSelector'
import { TemplateLibrary } from './TemplateLibrary'
import { CharacterPicker } from './CharacterManager'
import { type Template, applyCharacterToPrompt } from './templates'
import { ORIENTATIONS } from './styles'
import { api, type TokenData, type CharacterData } from '../../api'
import { useToast } from '../Toast'

interface Story {
  id: string
  title: string
  shots: Shot[]
  style?: string
  orientation: 'landscape' | 'portrait'
}

interface StoryEditorProps {
  tokens: TokenData[]
  onGenerationComplete?: (results: { url: string; shotId: string }[]) => void
}

export function StoryEditor({ tokens, onGenerationComplete }: StoryEditorProps) {
  const [story, setStory] = useState<Story>({
    id: crypto.randomUUID(),
    title: '未命名故事',
    shots: [],
    orientation: 'landscape',
  })
  const [characters, setCharacters] = useState<CharacterData[]>([])
  const [selectedShotIndex, setSelectedShotIndex] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatingIndex, setGeneratingIndex] = useState<number | null>(null)
  const [showTemplates, setShowTemplates] = useState(false)
  const [selectedTokenId, setSelectedTokenId] = useState<number | null>(null)
  const [selectedCharacterIds, setSelectedCharacterIds] = useState<string[]>([])
  const toast = useToast()

  // Filter active tokens
  const activeTokens = tokens.filter(t => t.is_active && !t.is_expired)

  // Set default token
  useEffect(() => {
    if (activeTokens.length > 0 && !selectedTokenId) {
      setSelectedTokenId(activeTokens[0].id)
    }
  }, [activeTokens, selectedTokenId])

  // Load characters
  useEffect(() => {
    loadCharacters()
  }, [])

  const loadCharacters = async () => {
    try {
      const result = await api.getCharacters()
      setCharacters((result.characters || []).filter(c => c.status === 'finalized'))
    } catch (err) {
      // Silently fail
    }
  }

  // Generate unique ID
  const generateId = () => crypto.randomUUID()

  // Add new shot
  const addShot = useCallback(() => {
    const newShot: Shot = {
      id: generateId(),
      duration: 5,
      prompt: '',
      characterRefs: [...selectedCharacterIds],
      status: 'pending',
    }
    setStory(prev => ({
      ...prev,
      shots: [...prev.shots, newShot],
    }))
    setSelectedShotIndex(story.shots.length)
  }, [story.shots.length, selectedCharacterIds])

  // Update shot
  const updateShot = useCallback((index: number, shot: Shot) => {
    setStory(prev => ({
      ...prev,
      shots: prev.shots.map((s, i) => (i === index ? shot : s)),
    }))
  }, [])

  // Delete shot
  const deleteShot = useCallback((index: number) => {
    setStory(prev => ({
      ...prev,
      shots: prev.shots.filter((_, i) => i !== index),
    }))
    if (selectedShotIndex >= index && selectedShotIndex > 0) {
      setSelectedShotIndex(prev => prev - 1)
    }
  }, [selectedShotIndex])

  // Apply template
  const applyTemplate = useCallback((template: Template) => {
    // Get selected character usernames for template
    const characterUsernames = characters
      .filter(c => selectedCharacterIds.includes(c.character_id))
      .map(c => c.username)

    const shots: Shot[] = template.shots.map((templateShot, index) => {
      // Apply character to prompt if template has {character} placeholder
      let prompt = templateShot.prompt
      if (characterUsernames.length > 0) {
        prompt = applyCharacterToPrompt(prompt, characterUsernames[index % characterUsernames.length])
      }

      return {
        id: generateId(),
        duration: templateShot.duration,
        prompt,
        characterRefs: [...selectedCharacterIds],
        status: 'pending',
      }
    })

    setStory(prev => ({
      ...prev,
      title: template.name,
      shots,
      style: template.style,
    }))
    setSelectedShotIndex(0)
    setShowTemplates(false)
    toast.success(`已应用模板: ${template.name}`)
  }, [characters, selectedCharacterIds, toast])

  // Generate all shots
  const generateAll = async () => {
    if (!selectedTokenId) {
      toast.error('请选择 Token')
      return
    }

    if (story.shots.length === 0) {
      toast.error('请添加至少一个镜头')
      return
    }

    const emptyShots = story.shots.filter(s => !s.prompt.trim())
    if (emptyShots.length > 0) {
      toast.error('请填写所有镜头的描述')
      return
    }

    setIsGenerating(true)
    const results: { url: string; shotId: string }[] = []

    // Reset all shot statuses
    setStory(prev => ({
      ...prev,
      shots: prev.shots.map(s => ({ ...s, status: 'pending', resultUrl: undefined })),
    }))

    for (let i = 0; i < story.shots.length; i++) {
      const shot = story.shots[i]
      setGeneratingIndex(i)
      setSelectedShotIndex(i)

      // Update shot status to generating
      setStory(prev => ({
        ...prev,
        shots: prev.shots.map((s, idx) =>
          idx === i ? { ...s, status: 'generating' } : s
        ),
      }))

      try {
        // Build prompt with style
        let prompt = shot.prompt
        if (story.style) {
          prompt = `${prompt}, ${story.style} style`
        }

        // Get character IDs for cameo
        const cameoIds = shot.characterRefs.length > 0 ? shot.characterRefs : undefined

        // Generate video
        const result = await api.generateVideo({
          token_id: selectedTokenId,
          prompt,
          duration: shot.duration,
          aspect_ratio: story.orientation === 'landscape' ? '16:9' : '9:16',
          model: 'sora',
          cameo_ids: cameoIds,
        })

        // Poll for completion
        const videoUrl = await pollGeneration(result.generation_id, selectedTokenId)

        if (videoUrl) {
          // Update shot with result
          setStory(prev => ({
            ...prev,
            shots: prev.shots.map((s, idx) =>
              idx === i ? { ...s, status: 'completed', resultUrl: videoUrl } : s
            ),
          }))
          results.push({ url: videoUrl, shotId: shot.id })
        } else {
          throw new Error('生成超时')
        }
      } catch (err: any) {
        // Update shot status to failed
        setStory(prev => ({
          ...prev,
          shots: prev.shots.map((s, idx) =>
            idx === i ? { ...s, status: 'failed' } : s
          ),
        }))
        toast.error(`镜头 ${i + 1} 生成失败: ${err.message}`)
      }
    }

    setIsGenerating(false)
    setGeneratingIndex(null)

    if (results.length === story.shots.length) {
      toast.success('所有镜头生成完成!')
      onGenerationComplete?.(results)
    } else if (results.length > 0) {
      toast.info(`${results.length}/${story.shots.length} 个镜头生成成功`)
      onGenerationComplete?.(results)
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

        await new Promise(resolve => setTimeout(resolve, 5000))
        attempts++
      } catch (err) {
        attempts++
        if (attempts >= maxAttempts) {
          return null
        }
        await new Promise(resolve => setTimeout(resolve, 5000))
      }
    }

    return null
  }

  // Calculate total duration
  const totalDuration = story.shots.reduce((sum, shot) => sum + shot.duration, 0)
  const completedShots = story.shots.filter(s => s.status === 'completed').length

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-4">
          <div>
            <input
              type="text"
              value={story.title}
              onChange={(e) => setStory(prev => ({ ...prev, title: e.target.value }))}
              className="text-lg font-semibold text-[var(--text-primary)] bg-transparent border-none focus:outline-none"
              placeholder="故事标题"
            />
            <div className="flex items-center gap-3 mt-1 text-xs text-[var(--text-muted)]">
              <span className="flex items-center gap-1">
                <Film className="w-3 h-3" />
                {story.shots.length} 镜头
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {totalDuration}s
              </span>
              {completedShots > 0 && (
                <span className="text-green-500">
                  {completedShots}/{story.shots.length} 已完成
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Token Selector */}
          <select
            value={selectedTokenId || ''}
            onChange={(e) => setSelectedTokenId(Number(e.target.value))}
            className="h-8 px-2 text-xs bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-md text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
          >
            {activeTokens.map((token) => (
              <option key={token.id} value={token.id}>
                {token.email || token.name || `Token #${token.id}`}
              </option>
            ))}
          </select>

          {/* Template Button */}
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="h-8 px-3 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-tertiary)] hover:bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md transition-colors"
          >
            模板库
          </button>

          {/* Generate Button */}
          <button
            onClick={generateAll}
            disabled={isGenerating || story.shots.length === 0}
            className="h-8 px-4 text-xs text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] rounded-md transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                生成中 ({generatingIndex !== null ? generatingIndex + 1 : 0}/{story.shots.length})
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                生成全部
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Settings */}
        <div className="w-64 border-r border-[var(--border)] p-4 overflow-y-auto space-y-4">
          {/* Orientation */}
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2">
              画面比例
            </label>
            <div className="flex gap-2">
              {ORIENTATIONS.map((o) => (
                <button
                  key={o.id}
                  onClick={() => setStory(prev => ({ ...prev, orientation: o.id as 'landscape' | 'portrait' }))}
                  className={`flex-1 h-8 text-xs rounded-md transition-colors ${
                    story.orientation === o.id
                      ? 'bg-[var(--accent)] text-white'
                      : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {o.name}
                </button>
              ))}
            </div>
          </div>

          {/* Style */}
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2">
              视觉风格
            </label>
            <StyleSelectorCompact
              selectedId={story.style}
              onSelect={(id) => setStory(prev => ({ ...prev, style: id }))}
            />
          </div>

          {/* Characters */}
          <CharacterPicker
            tokens={tokens}
            selectedIds={selectedCharacterIds}
            onSelectionChange={setSelectedCharacterIds}
            maxSelect={3}
          />
        </div>

        {/* Center Panel - Shot Editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Template Library (Overlay) */}
          {showTemplates && (
            <div className="absolute inset-0 z-20 bg-[var(--bg-primary)]/95 p-6 overflow-y-auto">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                    选择模板
                  </h3>
                  <button
                    onClick={() => setShowTemplates(false)}
                    className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  >
                    关闭
                  </button>
                </div>
                <TemplateLibrary onSelect={applyTemplate} />
              </div>
            </div>
          )}

          {/* Shot List */}
          <div className="flex-1 p-4 overflow-y-auto">
            {story.shots.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)]">
                <Film className="w-12 h-12 mb-4 opacity-50" />
                <p className="text-sm font-medium">开始创建你的故事</p>
                <p className="text-xs mt-1">添加镜头或选择模板开始</p>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={addShot}
                    className="h-9 px-4 text-sm text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] rounded-md transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    添加镜头
                  </button>
                  <button
                    onClick={() => setShowTemplates(true)}
                    className="h-9 px-4 text-sm text-[var(--text-secondary)] bg-[var(--bg-tertiary)] hover:bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md transition-colors"
                  >
                    选择模板
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {story.shots.map((shot, index) => (
                  <ShotCard
                    key={shot.id}
                    shot={shot}
                    index={index}
                    characters={characters}
                    onUpdate={(updated) => updateShot(index, updated)}
                    onDelete={() => deleteShot(index)}
                    isGenerating={generatingIndex === index}
                  />
                ))}

                {/* Add Shot Button */}
                <button
                  onClick={addShot}
                  disabled={isGenerating}
                  className="w-full h-12 border-2 border-dashed border-[var(--border)] hover:border-[var(--accent)] rounded-lg text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  添加镜头
                </button>
              </div>
            )}
          </div>

          {/* Timeline */}
          {story.shots.length > 0 && (
            <div className="border-t border-[var(--border)] p-3">
              <div className="flex items-center gap-2">
                {/* Navigation */}
                <button
                  onClick={() => setSelectedShotIndex(Math.max(0, selectedShotIndex - 1))}
                  disabled={selectedShotIndex === 0}
                  className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Shot Previews */}
                <div className="flex-1 flex gap-2 overflow-x-auto py-1 scrollbar-hide">
                  {story.shots.map((shot, index) => (
                    <ShotPreview
                      key={shot.id}
                      shot={shot}
                      index={index}
                      isActive={selectedShotIndex === index}
                      onClick={() => setSelectedShotIndex(index)}
                    />
                  ))}
                </div>

                {/* Navigation */}
                <button
                  onClick={() => setSelectedShotIndex(Math.min(story.shots.length - 1, selectedShotIndex + 1))}
                  disabled={selectedShotIndex === story.shots.length - 1}
                  className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-30"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
