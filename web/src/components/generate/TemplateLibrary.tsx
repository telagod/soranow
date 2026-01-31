import { useState } from 'react'
import { Search, Clock, Film, ChevronRight } from 'lucide-react'
import { TEMPLATES, TEMPLATE_CATEGORIES, type Template, type TemplateCategory } from './templates'

interface TemplateLibraryProps {
  onSelect: (template: Template) => void
  selectedId?: string
}

export function TemplateLibrary({ onSelect, selectedId }: TemplateLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all')

  const filteredTemplates = TEMPLATES.filter(template => {
    const matchesSearch = searchQuery === '' ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const categories = Object.entries(TEMPLATE_CATEGORIES) as [TemplateCategory, string][]

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索模板..."
          className="w-full h-9 pl-9 pr-3 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
            selectedCategory === 'all'
              ? 'bg-[var(--accent)] text-white'
              : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          全部
        </button>
        {categories.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSelectedCategory(key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
              selectedCategory === key
                ? 'bg-[var(--accent)] text-white'
                : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-1">
        {filteredTemplates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            isSelected={selectedId === template.id}
            onClick={() => onSelect(template)}
          />
        ))}
        {filteredTemplates.length === 0 && (
          <div className="col-span-2 py-8 text-center text-[var(--text-muted)]">
            <Film className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">没有找到匹配的模板</p>
          </div>
        )}
      </div>
    </div>
  )
}

interface TemplateCardProps {
  template: Template
  isSelected: boolean
  onClick: () => void
}

function TemplateCard({ template, isSelected, onClick }: TemplateCardProps) {
  const totalDuration = template.shots.reduce((sum, shot) => sum + shot.duration, 0)

  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left p-3 rounded-lg border transition-all
        ${isSelected
          ? 'border-[var(--accent)] bg-[var(--accent)]/10'
          : 'border-[var(--border)] bg-[var(--bg-tertiary)] hover:border-[var(--text-muted)]'
        }
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-[var(--text-primary)] truncate">
            {template.name}
          </h4>
          <p className="text-xs text-[var(--text-muted)] mt-0.5 line-clamp-2">
            {template.description}
          </p>
        </div>
        <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-colors ${
          isSelected ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'
        }`} />
      </div>

      <div className="flex items-center gap-3 mt-2 text-xs text-[var(--text-secondary)]">
        <span className="flex items-center gap-1">
          <Film className="w-3 h-3" />
          {template.shots.length} 镜头
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {totalDuration}s
        </span>
        {template.style && (
          <span className="px-1.5 py-0.5 bg-[var(--bg-secondary)] rounded text-[10px]">
            {template.style}
          </span>
        )}
      </div>
    </button>
  )
}

// Compact template selector for quick access
interface TemplateQuickSelectProps {
  onSelect: (template: Template) => void
  category?: TemplateCategory
}

export function TemplateQuickSelect({ onSelect, category }: TemplateQuickSelectProps) {
  const templates = category
    ? TEMPLATES.filter(t => t.category === category)
    : TEMPLATES.slice(0, 6) // Show first 6 templates

  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-[var(--text-secondary)]">
        快速选择模板
      </label>
      <div className="flex flex-wrap gap-2">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelect(template)}
            className="px-2 py-1 text-xs bg-[var(--bg-tertiary)] border border-[var(--border)] rounded hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
          >
            {template.name}
          </button>
        ))}
      </div>
    </div>
  )
}
