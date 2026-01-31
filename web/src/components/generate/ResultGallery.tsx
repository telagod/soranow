import { useState } from 'react'
import { Download, ExternalLink, Trash2, Image, Video, X, Maximize2, Clock } from 'lucide-react'

export interface GenerationResult {
  id: string
  type: 'image' | 'video'
  url: string
  prompt: string
  model: string
  style?: string
  duration?: number
  timestamp: number
}

interface ResultGalleryProps {
  results: GenerationResult[]
  onDelete?: (id: string) => void
  onClear?: () => void
}

export function ResultGallery({ results, onDelete, onClear }: ResultGalleryProps) {
  const [selectedResult, setSelectedResult] = useState<GenerationResult | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-[var(--text-muted)]">
        <div className="w-16 h-16 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center mb-4">
          <Image className="w-8 h-8 opacity-50" />
        </div>
        <p className="text-sm font-medium">暂无生成结果</p>
        <p className="text-xs mt-1">输入提示词开始生成</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--text-secondary)]">
          {results.length} 个结果
        </span>
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex bg-[var(--bg-tertiary)] rounded-md p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-[var(--bg-secondary)]' : ''}`}
              title="网格视图"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 16 16">
                <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zm8 0A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm-8 8A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm8 0A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3z"/>
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-[var(--bg-secondary)]' : ''}`}
              title="列表视图"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/>
              </svg>
            </button>
          </div>
          {onClear && (
            <button
              onClick={onClear}
              className="text-xs text-[var(--text-muted)] hover:text-red-500 transition-colors"
            >
              清空
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {results.map((result) => (
            <ResultCard
              key={result.id}
              result={result}
              onView={() => setSelectedResult(result)}
              onDelete={onDelete ? () => onDelete(result.id) : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {results.map((result) => (
            <ResultListItem
              key={result.id}
              result={result}
              onView={() => setSelectedResult(result)}
              onDelete={onDelete ? () => onDelete(result.id) : undefined}
            />
          ))}
        </div>
      )}

      {/* Lightbox */}
      {selectedResult && (
        <ResultLightbox
          result={selectedResult}
          onClose={() => setSelectedResult(null)}
        />
      )}
    </div>
  )
}

interface ResultCardProps {
  result: GenerationResult
  onView: () => void
  onDelete?: () => void
}

function ResultCard({ result, onView, onDelete }: ResultCardProps) {
  return (
    <div className="group relative bg-[var(--bg-tertiary)] rounded-lg overflow-hidden border border-[var(--border)]">
      {/* Media */}
      <div className="aspect-square relative cursor-pointer" onClick={onView}>
        {result.type === 'image' ? (
          <img
            src={result.url}
            alt={result.prompt}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <video
            src={result.url}
            className="w-full h-full object-cover"
            muted
            loop
            onMouseEnter={(e) => e.currentTarget.play()}
            onMouseLeave={(e) => {
              e.currentTarget.pause()
              e.currentTarget.currentTime = 0
            }}
          />
        )}

        {/* Type Badge */}
        <div className="absolute top-2 left-2">
          <span className={`
            inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium
            ${result.type === 'video' ? 'bg-purple-500/80' : 'bg-blue-500/80'} text-white
          `}>
            {result.type === 'video' ? <Video className="w-3 h-3" /> : <Image className="w-3 h-3" />}
            {result.type === 'video' ? '视频' : '图片'}
          </span>
        </div>

        {/* Duration Badge (for videos) */}
        {result.type === 'video' && result.duration && (
          <div className="absolute bottom-2 right-2">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-black/60 text-white">
              <Clock className="w-3 h-3" />
              {result.duration}s
            </span>
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Maximize2 className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Info */}
      <div className="p-2">
        <p className="text-xs text-[var(--text-secondary)] line-clamp-2" title={result.prompt}>
          {result.prompt}
        </p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[10px] text-[var(--text-muted)]">{result.model}</span>
          <div className="flex items-center gap-1">
            <a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
              title="下载"
              onClick={(e) => e.stopPropagation()}
            >
              <Download className="w-3.5 h-3.5" />
            </a>
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                }}
                className="p-1 text-[var(--text-muted)] hover:text-red-500 transition-colors"
                title="删除"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

interface ResultListItemProps {
  result: GenerationResult
  onView: () => void
  onDelete?: () => void
}

function ResultListItem({ result, onView, onDelete }: ResultListItemProps) {
  const timeAgo = getTimeAgo(result.timestamp)

  return (
    <div className="flex items-center gap-3 p-2 bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border)]">
      {/* Thumbnail */}
      <div
        className="w-16 h-16 flex-shrink-0 rounded overflow-hidden cursor-pointer"
        onClick={onView}
      >
        {result.type === 'image' ? (
          <img
            src={result.url}
            alt={result.prompt}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <video
            src={result.url}
            className="w-full h-full object-cover"
            muted
          />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[var(--text-primary)] line-clamp-1">{result.prompt}</p>
        <div className="flex items-center gap-2 mt-1 text-xs text-[var(--text-muted)]">
          <span className={`
            inline-flex items-center gap-1 px-1.5 py-0.5 rounded
            ${result.type === 'video' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}
          `}>
            {result.type === 'video' ? <Video className="w-3 h-3" /> : <Image className="w-3 h-3" />}
            {result.type === 'video' ? '视频' : '图片'}
          </span>
          <span>{result.model}</span>
          <span>{timeAgo}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <a
          href={result.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
          title="在新窗口打开"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
        <a
          href={result.url}
          download
          className="p-2 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
          title="下载"
        >
          <Download className="w-4 h-4" />
        </a>
        {onDelete && (
          <button
            onClick={onDelete}
            className="p-2 text-[var(--text-muted)] hover:text-red-500 transition-colors"
            title="删除"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}

interface ResultLightboxProps {
  result: GenerationResult
  onClose: () => void
}

function ResultLightbox({ result, onClose }: ResultLightboxProps) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Media */}
      <div
        className="max-w-4xl max-h-[80vh] relative"
        onClick={(e) => e.stopPropagation()}
      >
        {result.type === 'image' ? (
          <img
            src={result.url}
            alt={result.prompt}
            className="max-w-full max-h-[80vh] object-contain rounded-lg"
          />
        ) : (
          <video
            src={result.url}
            controls
            autoPlay
            className="max-w-full max-h-[80vh] rounded-lg"
          />
        )}

        {/* Info Bar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent rounded-b-lg">
          <p className="text-white text-sm line-clamp-2">{result.prompt}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-white/60 text-xs">{result.model}</span>
            <a
              href={result.url}
              download
              className="flex items-center gap-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded text-white text-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              下载
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper function
function getTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)

  if (seconds < 60) return '刚刚'
  if (seconds < 3600) return `${Math.floor(seconds / 60)} 分钟前`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} 小时前`
  return `${Math.floor(seconds / 86400)} 天前`
}
