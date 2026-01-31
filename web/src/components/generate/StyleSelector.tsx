import { STYLE_PRESETS } from './styles'

interface StyleSelectorProps {
  selectedId?: string
  onSelect: (styleId: string | undefined) => void
  disabled?: boolean
}

export function StyleSelector({ selectedId, onSelect, disabled }: StyleSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-[var(--text-secondary)]">
        风格预设
      </label>
      <div className="grid grid-cols-5 gap-2">
        {STYLE_PRESETS.map((style) => (
          <button
            key={style.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(selectedId === style.id ? undefined : style.id)}
            className={`
              flex flex-col items-center justify-center p-2 rounded-lg border transition-all
              ${selectedId === style.id
                ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--text-primary)]'
                : 'border-[var(--border)] bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            title={style.description}
          >
            <span className="text-xl mb-1">{style.icon}</span>
            <span className="text-xs font-medium truncate w-full text-center">{style.name}</span>
          </button>
        ))}
      </div>
      {selectedId && (
        <p className="text-xs text-[var(--text-muted)]">
          {STYLE_PRESETS.find(s => s.id === selectedId)?.description}
        </p>
      )}
    </div>
  )
}

// Compact version for inline use
interface StyleSelectorCompactProps {
  selectedId?: string
  onSelect: (styleId: string | undefined) => void
  disabled?: boolean
}

export function StyleSelectorCompact({ selectedId, onSelect, disabled }: StyleSelectorCompactProps) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-xs font-medium text-[var(--text-secondary)] whitespace-nowrap">
        风格:
      </label>
      <select
        value={selectedId || ''}
        onChange={(e) => onSelect(e.target.value || undefined)}
        disabled={disabled}
        className="flex-1 h-8 px-2 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] disabled:opacity-50"
      >
        <option value="">无风格</option>
        {STYLE_PRESETS.map((style) => (
          <option key={style.id} value={style.id}>
            {style.icon} {style.name}
          </option>
        ))}
      </select>
    </div>
  )
}
