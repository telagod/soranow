import { useState } from 'react'
import { GripVertical, Trash2, Clock, ChevronDown, ChevronUp, User, Plus } from 'lucide-react'
import type { CharacterData } from '../../api'

export interface Shot {
  id: string
  duration: number
  prompt: string
  characterRefs: string[]
  imageRef?: string
  status?: 'pending' | 'generating' | 'completed' | 'failed'
  resultUrl?: string
}

interface ShotCardProps {
  shot: Shot
  index: number
  characters: CharacterData[]
  onUpdate: (shot: Shot) => void
  onDelete: () => void
  onDragStart?: () => void
  onDragEnd?: () => void
  isDragging?: boolean
  isGenerating?: boolean
}

export function ShotCard({
  shot,
  index,
  characters,
  onUpdate,
  onDelete,
  onDragStart,
  onDragEnd,
  isDragging,
  isGenerating,
}: ShotCardProps) {
  const [expanded, setExpanded] = useState(true)
  const [showCharacterPicker, setShowCharacterPicker] = useState(false)

  const handlePromptChange = (prompt: string) => {
    onUpdate({ ...shot, prompt })
  }

  const handleDurationChange = (duration: number) => {
    onUpdate({ ...shot, duration: Math.max(5, Math.min(25, duration)) })
  }

  const handleAddCharacter = (characterId: string) => {
    if (!shot.characterRefs.includes(characterId)) {
      onUpdate({ ...shot, characterRefs: [...shot.characterRefs, characterId] })
    }
    setShowCharacterPicker(false)
  }

  const handleRemoveCharacter = (characterId: string) => {
    onUpdate({
      ...shot,
      characterRefs: shot.characterRefs.filter(id => id !== characterId),
    })
  }

  const getStatusColor = () => {
    switch (shot.status) {
      case 'generating':
        return 'border-yellow-500 bg-yellow-500/5'
      case 'completed':
        return 'border-green-500 bg-green-500/5'
      case 'failed':
        return 'border-red-500 bg-red-500/5'
      default:
        return 'border-[var(--border)]'
    }
  }

  const referencedCharacters = characters.filter(c =>
    shot.characterRefs.includes(c.character_id)
  )

  const availableCharacters = characters.filter(
    c => c.status === 'finalized' && !shot.characterRefs.includes(c.character_id)
  )

  return (
    <div
      className={`
        rounded-lg border transition-all
        ${getStatusColor()}
        ${isDragging ? 'opacity-50 scale-95' : ''}
        ${isGenerating ? 'animate-pulse' : ''}
      `}
      draggable={!!onDragStart}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      {/* Header */}
      <div className="flex items-center gap-2 p-3 border-b border-[var(--border)]">
        {/* Drag Handle */}
        {onDragStart && (
          <div className="cursor-grab active:cursor-grabbing text-[var(--text-muted)] hover:text-[var(--text-secondary)]">
            <GripVertical className="w-4 h-4" />
          </div>
        )}

        {/* Shot Number */}
        <div className="w-6 h-6 rounded bg-[var(--bg-tertiary)] flex items-center justify-center text-xs font-medium text-[var(--text-secondary)]">
          {index + 1}
        </div>

        {/* Duration */}
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          <input
            type="number"
            value={shot.duration}
            onChange={(e) => handleDurationChange(parseInt(e.target.value) || 5)}
            min={5}
            max={25}
            className="w-12 h-6 px-1 text-xs text-center bg-[var(--bg-tertiary)] border border-[var(--border)] rounded focus:outline-none focus:border-[var(--accent)]"
          />
          <span className="text-xs text-[var(--text-muted)]">秒</span>
        </div>

        {/* Status Badge */}
        {shot.status && shot.status !== 'pending' && (
          <span className={`
            px-1.5 py-0.5 rounded text-[10px] font-medium
            ${shot.status === 'generating' ? 'bg-yellow-500/20 text-yellow-500' : ''}
            ${shot.status === 'completed' ? 'bg-green-500/20 text-green-500' : ''}
            ${shot.status === 'failed' ? 'bg-red-500/20 text-red-500' : ''}
          `}>
            {shot.status === 'generating' && '生成中...'}
            {shot.status === 'completed' && '已完成'}
            {shot.status === 'failed' && '失败'}
          </span>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Expand/Collapse */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {/* Delete */}
        <button
          onClick={onDelete}
          disabled={isGenerating}
          className="p-1 text-[var(--text-muted)] hover:text-red-500 transition-colors disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      {expanded && (
        <div className="p-3 space-y-3">
          {/* Prompt */}
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              镜头描述
            </label>
            <textarea
              value={shot.prompt}
              onChange={(e) => handlePromptChange(e.target.value)}
              placeholder="描述这个镜头的内容..."
              rows={3}
              disabled={isGenerating}
              className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] resize-none disabled:opacity-50"
            />
          </div>

          {/* Character References */}
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              角色引用
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {referencedCharacters.map((character) => (
                <div
                  key={character.id}
                  className="flex items-center gap-1.5 px-2 py-1 bg-[var(--accent)]/10 border border-[var(--accent)]/30 rounded-full"
                >
                  <div className="w-5 h-5 rounded-full overflow-hidden bg-[var(--bg-secondary)]">
                    {character.profile_url ? (
                      <img
                        src={character.profile_url}
                        alt={character.display_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-3 h-3 text-[var(--text-muted)]" />
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-[var(--accent)]">@{character.username}</span>
                  <button
                    onClick={() => handleRemoveCharacter(character.character_id)}
                    disabled={isGenerating}
                    className="text-[var(--accent)] hover:text-red-500 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {/* Add Character Button */}
              {availableCharacters.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setShowCharacterPicker(!showCharacterPicker)}
                    disabled={isGenerating}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-[var(--text-muted)] hover:text-[var(--accent)] border border-dashed border-[var(--border)] hover:border-[var(--accent)] rounded-full transition-colors disabled:opacity-50"
                  >
                    <Plus className="w-3 h-3" />
                    添加角色
                  </button>

                  {/* Character Picker Dropdown */}
                  {showCharacterPicker && (
                    <div className="absolute top-full left-0 mt-1 z-10 w-48 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg shadow-lg overflow-hidden">
                      {availableCharacters.map((character) => (
                        <button
                          key={character.id}
                          onClick={() => handleAddCharacter(character.character_id)}
                          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[var(--bg-tertiary)] transition-colors"
                        >
                          <div className="w-6 h-6 rounded-full overflow-hidden bg-[var(--bg-tertiary)]">
                            {character.profile_url ? (
                              <img
                                src={character.profile_url}
                                alt={character.display_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <User className="w-3 h-3 text-[var(--text-muted)]" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 text-left">
                            <p className="text-xs font-medium text-[var(--text-primary)] truncate">
                              {character.display_name}
                            </p>
                            <p className="text-[10px] text-[var(--text-muted)]">
                              @{character.username}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {referencedCharacters.length === 0 && availableCharacters.length === 0 && (
                <span className="text-xs text-[var(--text-muted)]">
                  暂无可用角色
                </span>
              )}
            </div>
            <p className="text-[10px] text-[var(--text-muted)] mt-1">
              在描述中使用 @username 引用角色以保持一致性
            </p>
          </div>

          {/* Image Reference (optional) */}
          {shot.imageRef && (
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                参考图片
              </label>
              <div className="w-20 h-20 rounded-lg overflow-hidden border border-[var(--border)]">
                <img
                  src={shot.imageRef}
                  alt="Reference"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Result Preview */}
          {shot.status === 'completed' && shot.resultUrl && (
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                生成结果
              </label>
              <div className="w-full aspect-video rounded-lg overflow-hidden border border-green-500/30 bg-black">
                <video
                  src={shot.resultUrl}
                  controls
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Compact shot preview for timeline
interface ShotPreviewProps {
  shot: Shot
  index: number
  isActive: boolean
  onClick: () => void
}

export function ShotPreview({ shot, index, isActive, onClick }: ShotPreviewProps) {
  const getStatusBg = () => {
    switch (shot.status) {
      case 'generating':
        return 'bg-yellow-500'
      case 'completed':
        return 'bg-green-500'
      case 'failed':
        return 'bg-red-500'
      default:
        return 'bg-[var(--bg-tertiary)]'
    }
  }

  return (
    <button
      onClick={onClick}
      className={`
        relative flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden border-2 transition-all
        ${isActive ? 'border-[var(--accent)] ring-2 ring-[var(--accent)]/30' : 'border-[var(--border)]'}
        ${shot.status === 'generating' ? 'animate-pulse' : ''}
      `}
    >
      {/* Background */}
      {shot.resultUrl ? (
        <video
          src={shot.resultUrl}
          className="w-full h-full object-cover"
          muted
        />
      ) : shot.imageRef ? (
        <img
          src={shot.imageRef}
          alt=""
          className="w-full h-full object-cover"
        />
      ) : (
        <div className={`w-full h-full ${getStatusBg()}`} />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center">
        <span className="text-white text-xs font-medium">镜头 {index + 1}</span>
        <span className="text-white/70 text-[10px]">{shot.duration}s</span>
      </div>

      {/* Status Indicator */}
      {shot.status && shot.status !== 'pending' && (
        <div className={`
          absolute top-1 right-1 w-2 h-2 rounded-full
          ${shot.status === 'generating' ? 'bg-yellow-500 animate-pulse' : ''}
          ${shot.status === 'completed' ? 'bg-green-500' : ''}
          ${shot.status === 'failed' ? 'bg-red-500' : ''}
        `} />
      )}
    </button>
  )
}
