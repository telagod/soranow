import { User, Trash2, RefreshCw, Check, Clock, AlertCircle, Copy } from 'lucide-react'
import type { CharacterData } from '../../api'

interface CharacterCardProps {
  character: CharacterData
  onDelete?: () => void
  onRefreshStatus?: () => void
  onSelect?: () => void
  isSelected?: boolean
  isLoading?: boolean
  compact?: boolean
}

export function CharacterCard({
  character,
  onDelete,
  onRefreshStatus,
  onSelect,
  isSelected,
  isLoading,
  compact,
}: CharacterCardProps) {
  const statusConfig = {
    processing: {
      icon: Clock,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      label: '处理中',
    },
    finalized: {
      icon: Check,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      label: '已完成',
    },
    failed: {
      icon: AlertCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      label: '失败',
    },
  }

  const status = statusConfig[character.status] || statusConfig.processing
  const StatusIcon = status.icon

  const copyUsername = () => {
    navigator.clipboard.writeText(`@${character.username}`)
  }

  if (compact) {
    return (
      <button
        onClick={onSelect}
        disabled={character.status !== 'finalized'}
        className={`
          glass-card flex items-center gap-2 p-2 rounded-[12px] transition-all w-full text-left
          ${isSelected
            ? 'border-[var(--accent)] bg-[var(--accent)]/10'
            : 'hover:border-[var(--text-muted)]'
          }
          ${character.status !== 'finalized' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full overflow-hidden bg-[var(--glass-bg-light)] flex-shrink-0">
          {character.profile_url ? (
            <img
              src={character.profile_url}
              alt={character.display_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User className="w-4 h-4 text-[var(--text-muted)]" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--text-primary)] truncate">
            {character.display_name}
          </p>
          <p className="text-xs text-[var(--text-muted)] truncate">
            @{character.username}
          </p>
        </div>

        {/* Status */}
        {character.status !== 'finalized' && (
          <StatusIcon className={`w-4 h-4 ${status.color}`} />
        )}
      </button>
    )
  }

  return (
    <div
      className={`
        glass-card rounded-[16px] overflow-hidden transition-all
        ${isSelected
          ? 'border-[var(--accent)] ring-1 ring-[var(--accent)]'
          : ''
        }
        ${onSelect && character.status === 'finalized' ? 'cursor-pointer hover:border-[var(--text-muted)]' : ''}
      `}
      onClick={onSelect && character.status === 'finalized' ? onSelect : undefined}
    >
      {/* Header */}
      <div className="p-3 flex items-start gap-3">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full overflow-hidden bg-[var(--glass-bg-light)] flex-shrink-0">
          {character.profile_url ? (
            <img
              src={character.profile_url}
              alt={character.display_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User className="w-6 h-6 text-[var(--text-muted)]" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium text-[var(--text-primary)] truncate">
              {character.display_name}
            </h4>
            <span className={`
              inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium
              ${status.bgColor} ${status.color}
            `}>
              <StatusIcon className="w-3 h-3" />
              {status.label}
            </span>
          </div>

          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs text-[var(--text-muted)]">@{character.username}</span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                copyUsername()
              }}
              className="p-0.5 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
              title="复制用户名"
            >
              <Copy className="w-3 h-3" />
            </button>
          </div>

          {character.instruction_set && (
            <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">
              {character.instruction_set}
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-3 py-2 bg-[var(--glass-bg)] border-t border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <span className={`
            px-1.5 py-0.5 rounded
            ${character.visibility === 'public' ? 'bg-green-500/10 text-green-500' : 'bg-white/10 text-[var(--text-muted)]'}
          `}>
            {character.visibility === 'public' ? '公开' : '私有'}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {character.status === 'processing' && onRefreshStatus && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onRefreshStatus()
              }}
              disabled={isLoading}
              className="p-1.5 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors disabled:opacity-50"
              title="刷新状态"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              className="p-1.5 text-[var(--text-muted)] hover:text-red-500 transition-colors"
              title="删除角色"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {character.status === 'failed' && character.error_message && (
        <div className="px-3 py-2 bg-red-500/10 border-t border-red-500/20">
          <p className="text-xs text-red-400">{character.error_message}</p>
        </div>
      )}
    </div>
  )
}

// Character selector for use in prompts
interface CharacterSelectorProps {
  characters: CharacterData[]
  selectedIds: string[]
  onToggle: (characterId: string) => void
  maxSelect?: number
}

export function CharacterSelector({
  characters,
  selectedIds,
  onToggle,
  maxSelect = 3,
}: CharacterSelectorProps) {
  const finalizedCharacters = characters.filter(c => c.status === 'finalized')

  if (finalizedCharacters.length === 0) {
    return (
      <div className="text-center py-4 text-[var(--text-muted)]">
        <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">暂无可用角色</p>
        <p className="text-xs mt-1">请先创建角色</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-[var(--text-secondary)]">
          选择角色 (最多 {maxSelect} 个)
        </label>
        <span className="text-xs text-[var(--text-muted)]">
          {selectedIds.length}/{maxSelect}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {finalizedCharacters.map((character) => {
          const isSelected = selectedIds.includes(character.character_id)
          const isDisabled = !isSelected && selectedIds.length >= maxSelect

          return (
            <CharacterCard
              key={character.id}
              character={character}
              isSelected={isSelected}
              onSelect={isDisabled ? undefined : () => onToggle(character.character_id)}
              compact
            />
          )
        })}
      </div>
    </div>
  )
}
