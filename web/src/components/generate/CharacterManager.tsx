import { useState, useEffect } from 'react'
import { Plus, RefreshCw, Search, User, Loader2 } from 'lucide-react'
import { api, type CharacterData, type TokenData } from '../../api'
import { useToast } from '../Toast'
import { CharacterCard } from './CharacterCard'
import { CreateCharacterModal } from './CreateCharacterModal'

interface CharacterManagerProps {
  tokens: TokenData[]
  onSelectCharacter?: (character: CharacterData) => void
  selectedCharacterId?: string
}

export function CharacterManager({
  tokens,
  onSelectCharacter,
  selectedCharacterId,
}: CharacterManagerProps) {
  const [characters, setCharacters] = useState<CharacterData[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshingId, setRefreshingId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const toast = useToast()

  // Load characters on mount
  useEffect(() => {
    loadCharacters()
  }, [])

  const loadCharacters = async () => {
    setLoading(true)
    try {
      const result = await api.getCharacters()
      setCharacters(result.characters || [])
    } catch (err: any) {
      toast.error(err.message || '加载角色失败')
    } finally {
      setLoading(false)
    }
  }

  const handleRefreshStatus = async (id: number) => {
    setRefreshingId(id)
    try {
      const result = await api.getCameoStatus(id)
      setCharacters(prev =>
        prev.map(c => c.id === id ? result.character : c)
      )
      if (result.character.status === 'finalized') {
        toast.success('角色处理完成')
      }
    } catch (err: any) {
      toast.error(err.message || '刷新状态失败')
    } finally {
      setRefreshingId(null)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除此角色吗？')) return

    try {
      await api.deleteCharacter(id)
      setCharacters(prev => prev.filter(c => c.id !== id))
      toast.success('角色已删除')
    } catch (err: any) {
      toast.error(err.message || '删除失败')
    }
  }

  const handleSync = async () => {
    const activeTokens = tokens.filter(t => t.is_active && !t.is_expired)
    if (activeTokens.length === 0) {
      toast.error('没有可用的 Token')
      return
    }

    setSyncing(true)
    let totalSynced = 0

    try {
      for (const token of activeTokens) {
        const result = await api.syncCharacters(token.id)
        totalSynced += result.synced
      }

      if (totalSynced > 0) {
        toast.success(`同步了 ${totalSynced} 个角色`)
        loadCharacters()
      } else {
        toast.info('没有新角色需要同步')
      }
    } catch (err: any) {
      toast.error(err.message || '同步失败')
    } finally {
      setSyncing(false)
    }
  }

  const filteredCharacters = characters.filter(c =>
    searchQuery === '' ||
    c.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.display_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const finalizedCharacters = filteredCharacters.filter(c => c.status === 'finalized')
  const processingCharacters = filteredCharacters.filter(c => c.status === 'processing')
  const failedCharacters = filteredCharacters.filter(c => c.status === 'failed')

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-[var(--text-primary)]">
          角色管理
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="glass-btn h-8 px-3 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            同步
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="glass-btn-primary h-8 px-3 text-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            创建角色
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索角色..."
          className="glass-input w-full h-9 pl-9 pr-3 text-sm text-[var(--text-primary)]"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
        </div>
      ) : characters.length === 0 ? (
        <div className="text-center py-12">
          <div className="glass-card w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-[var(--text-muted)]" />
          </div>
          <p className="text-sm font-medium text-[var(--text-primary)]">
            暂无角色
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            创建角色以在视频中保持角色一致性
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="glass-btn-primary mt-4 h-9 px-4 text-sm inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            创建第一个角色
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Processing Characters */}
          {processingCharacters.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-[var(--text-muted)] mb-2 flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                处理中 ({processingCharacters.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {processingCharacters.map((character) => (
                  <CharacterCard
                    key={character.id}
                    character={character}
                    onRefreshStatus={() => handleRefreshStatus(character.id)}
                    onDelete={() => handleDelete(character.id)}
                    isLoading={refreshingId === character.id}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Finalized Characters */}
          {finalizedCharacters.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-[var(--text-muted)] mb-2">
                可用角色 ({finalizedCharacters.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {finalizedCharacters.map((character) => (
                  <CharacterCard
                    key={character.id}
                    character={character}
                    onDelete={() => handleDelete(character.id)}
                    onSelect={onSelectCharacter ? () => onSelectCharacter(character) : undefined}
                    isSelected={selectedCharacterId === character.character_id}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Failed Characters */}
          {failedCharacters.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-red-400 mb-2">
                处理失败 ({failedCharacters.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {failedCharacters.map((character) => (
                  <CharacterCard
                    key={character.id}
                    character={character}
                    onDelete={() => handleDelete(character.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {filteredCharacters.length === 0 && searchQuery && (
            <div className="text-center py-8 text-[var(--text-muted)]">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">没有找到匹配的角色</p>
            </div>
          )}
        </div>
      )}

      {/* Create Modal */}
      <CreateCharacterModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={loadCharacters}
        tokens={tokens}
      />
    </div>
  )
}

// Compact character picker for use in generation forms
interface CharacterPickerProps {
  tokens?: TokenData[]
  selectedIds: string[]
  onSelectionChange: (ids: string[]) => void
  maxSelect?: number
}

export function CharacterPicker({
  selectedIds,
  onSelectionChange,
  maxSelect = 3,
}: CharacterPickerProps) {
  const [characters, setCharacters] = useState<CharacterData[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)
  const toast = useToast()

  useEffect(() => {
    loadCharacters()
  }, [])

  const loadCharacters = async () => {
    try {
      const result = await api.getCharacters()
      setCharacters((result.characters || []).filter(c => c.status === 'finalized'))
    } catch (err) {
      // Silently fail
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = (characterId: string) => {
    if (selectedIds.includes(characterId)) {
      onSelectionChange(selectedIds.filter(id => id !== characterId))
    } else if (selectedIds.length < maxSelect) {
      onSelectionChange([...selectedIds, characterId])
    } else {
      toast.error(`最多只能选择 ${maxSelect} 个角色`)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
        <Loader2 className="w-3 h-3 animate-spin" />
        加载角色...
      </div>
    )
  }

  if (characters.length === 0) {
    return null
  }

  const selectedCharacters = characters.filter(c => selectedIds.includes(c.character_id))
  const displayCharacters = expanded ? characters : characters.slice(0, 4)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-[var(--text-secondary)]">
          角色一致性
        </label>
        {selectedIds.length > 0 && (
          <button
            onClick={() => onSelectionChange([])}
            className="text-xs text-[var(--text-muted)] hover:text-[var(--accent)]"
          >
            清除
          </button>
        )}
      </div>

      {/* Selected Characters Preview */}
      {selectedCharacters.length > 0 && (
        <div className="glass-card flex items-center gap-2 p-2">
          <div className="flex -space-x-2">
            {selectedCharacters.map((c) => (
              <div
                key={c.id}
                className="w-8 h-8 rounded-full border-2 border-white/30 overflow-hidden"
              >
                {c.profile_url ? (
                  <img src={c.profile_url} alt={c.display_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                    <User className="w-4 h-4 text-[var(--text-muted)]" />
                  </div>
                )}
              </div>
            ))}
          </div>
          <span className="text-xs text-[var(--text-secondary)]">
            {selectedCharacters.map(c => `@${c.username}`).join(', ')}
          </span>
        </div>
      )}

      {/* Character Grid */}
      <div className="grid grid-cols-4 gap-2">
        {displayCharacters.map((character) => (
          <button
            key={character.id}
            onClick={() => handleToggle(character.character_id)}
            className={`
              glass-card flex flex-col items-center p-2 transition-all
              ${selectedIds.includes(character.character_id)
                ? 'border-[var(--accent)] bg-[var(--accent)]/10'
                : 'hover:border-[var(--text-muted)]'
              }
            `}
          >
            <div className="w-10 h-10 rounded-full overflow-hidden mb-1">
              {character.profile_url ? (
                <img
                  src={character.profile_url}
                  alt={character.display_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-white/40 backdrop-blur-sm flex items-center justify-center">
                  <User className="w-5 h-5 text-[var(--text-muted)]" />
                </div>
              )}
            </div>
            <span className="text-[10px] text-[var(--text-secondary)] truncate w-full text-center">
              @{character.username}
            </span>
          </button>
        ))}
      </div>

      {/* Show More */}
      {characters.length > 4 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-[var(--accent)] hover:underline"
        >
          {expanded ? '收起' : `显示全部 (${characters.length})`}
        </button>
      )}
    </div>
  )
}
