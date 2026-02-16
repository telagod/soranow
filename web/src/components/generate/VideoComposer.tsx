import { useState, useRef, useEffect } from 'react'
import { Film, Download, Loader2, AlertCircle, CheckCircle, X } from 'lucide-react'

interface VideoSegment {
  id: string
  url: string
  duration: number
  prompt?: string
}

interface VideoComposerProps {
  segments: VideoSegment[]
  onClose: () => void
  title?: string
}

export function VideoComposer({ segments, onClose, title = '合成视频' }: VideoComposerProps) {
  const [isComposing, setIsComposing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressText, setProgressText] = useState('')
  const [composedUrl, setComposedUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false)
  const [useNativeCompose, setUseNativeCompose] = useState(false)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ffmpegRef = useRef<any>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Check if ffmpeg.wasm is available
  useEffect(() => {
    checkFfmpegAvailability()
  }, [])

  const checkFfmpegAvailability = async () => {
    try {
      // Try to dynamically import ffmpeg
      // @ts-ignore - ffmpeg.wasm may not be installed
      const ffmpegModule = await import('@ffmpeg/ffmpeg')
      const ffmpeg = new ffmpegModule.FFmpeg()
      ffmpegRef.current = ffmpeg

      // Try to load ffmpeg
      // @ts-ignore - ffmpeg.wasm may not be installed
      const utilModule = await import('@ffmpeg/util')
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd'

      await ffmpeg.load({
        coreURL: await utilModule.toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await utilModule.toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      })

      setFfmpegLoaded(true)
    } catch (err) {
      console.warn('ffmpeg.wasm not available, using fallback mode')
      setUseNativeCompose(true)
    }
  }

  // Compose videos using ffmpeg.wasm
  const composeWithFfmpeg = async () => {
    if (!ffmpegRef.current) {
      throw new Error('FFmpeg not loaded')
    }

    const ffmpeg = ffmpegRef.current

    setProgressText('下载视频片段...')

    // Download all video segments
    for (let i = 0; i < segments.length; i++) {
      setProgress((i / segments.length) * 30)
      setProgressText(`下载视频 ${i + 1}/${segments.length}...`)

      try {
        const response = await fetch(segments[i].url)
        const data = await response.arrayBuffer()
        await ffmpeg.writeFile(`input${i}.mp4`, new Uint8Array(data))
      } catch (err) {
        throw new Error(`下载视频 ${i + 1} 失败`)
      }
    }

    setProgress(30)
    setProgressText('准备合成...')

    // Create concat file
    const concatContent = segments.map((_, i) => `file 'input${i}.mp4'`).join('\n')
    await ffmpeg.writeFile('concat.txt', concatContent)

    setProgress(40)
    setProgressText('合成视频中...')

    // Set up progress handler
    ffmpeg.on('progress', ({ progress: p }: { progress: number }) => {
      setProgress(40 + p * 50)
    })

    // Execute ffmpeg concat
    await ffmpeg.exec([
      '-f', 'concat',
      '-safe', '0',
      '-i', 'concat.txt',
      '-c', 'copy',
      'output.mp4'
    ])

    setProgress(90)
    setProgressText('生成文件...')

    // Read output file
    const data = await ffmpeg.readFile('output.mp4')
    const blob = new Blob([data], { type: 'video/mp4' })
    const url = URL.createObjectURL(blob)

    setProgress(100)
    return url
  }

  // Fallback: Create a playlist-style preview (no actual composition)
  const createPlaylistPreview = async () => {
    setProgressText('准备视频预览...')
    setProgress(50)

    // In fallback mode, we just return the first video URL
    // and provide download links for all segments
    await new Promise(resolve => setTimeout(resolve, 500))

    setProgress(100)
    return segments[0]?.url || null
  }

  // Start composition
  const handleCompose = async () => {
    setIsComposing(true)
    setError(null)
    setProgress(0)

    try {
      let url: string | null

      if (ffmpegLoaded && !useNativeCompose) {
        url = await composeWithFfmpeg()
      } else {
        url = await createPlaylistPreview()
      }

      setComposedUrl(url)
      setProgressText('完成!')
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '合成失败'
      setError(errorMessage)
    } finally {
      setIsComposing(false)
    }
  }

  // Download composed video
  const handleDownload = () => {
    if (!composedUrl) return

    const a = document.createElement('a')
    a.href = composedUrl
    a.download = `${title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')}.mp4`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  // Download all segments as zip (fallback)
  const handleDownloadAll = async () => {
    // Download each segment individually
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i]
      const a = document.createElement('a')
      a.href = segment.url
      a.download = `${title}_${i + 1}.mp4`
      a.target = '_blank'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)

      // Small delay between downloads
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  // Calculate total duration
  const totalDuration = segments.reduce((sum, s) => sum + s.duration, 0)

  return (
    <div className="glass-overlay fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="glass-modal w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="glass-header flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Film className="w-5 h-5 text-[var(--accent)]" />
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                视频合成器
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                {segments.length} 个片段 · 总时长 {totalDuration}s
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
          {/* FFmpeg Status */}
          <div className={`
            flex items-center gap-2 px-3 py-2 rounded-[12px] text-sm
            ${ffmpegLoaded ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}
          `}>
            {ffmpegLoaded ? (
              <>
                <CheckCircle className="w-4 h-4" />
                浏览器端合成已就绪
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4" />
                {useNativeCompose ? '使用备用模式（分段下载）' : '正在加载合成引擎...'}
              </>
            )}
          </div>

          {/* Segment List */}
          <div>
            <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-2">
              视频片段
            </h3>
            <div className="glass-list space-y-2">
              {segments.map((segment, index) => (
                <div
                  key={segment.id}
                  className="glass-item flex items-center gap-3 p-2"
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-12 rounded overflow-hidden bg-black flex-shrink-0">
                    <video
                      src={segment.url}
                      className="w-full h-full object-cover"
                      muted
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      片段 {index + 1}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] truncate">
                      {segment.prompt || `${segment.duration}s`}
                    </p>
                  </div>

                  {/* Duration */}
                  <span className="text-xs text-[var(--text-secondary)] px-2 py-1 bg-white/40 backdrop-blur-md rounded">
                    {segment.duration}s
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Progress */}
          {isComposing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--text-secondary)]">{progressText}</span>
                <span className="text-[var(--text-muted)]">{Math.round(progress)}%</span>
              </div>
              <div className="glass-progress h-2 rounded-full overflow-hidden">
                <div
                  className="glass-progress-bar h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 text-red-500 rounded-[12px] text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* Preview */}
          {composedUrl && (
            <div>
              <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-2">
                {ffmpegLoaded ? '合成结果' : '预览'}
              </h3>
              <div className="rounded-[16px] overflow-hidden border border-white/30 bg-black">
                <video
                  ref={videoRef}
                  src={composedUrl}
                  controls
                  className="w-full aspect-video"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="glass-footer flex items-center justify-end gap-2 p-4">
          {!composedUrl ? (
            <>
              <button
                onClick={onClose}
                className="glass-btn px-4 h-9 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleCompose}
                disabled={isComposing || segments.length === 0}
                className="glass-btn-primary px-4 h-9 text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isComposing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    合成中...
                  </>
                ) : (
                  <>
                    <Film className="w-4 h-4" />
                    开始合成
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              {!ffmpegLoaded && (
                <button
                  onClick={handleDownloadAll}
                  className="glass-btn px-4 h-9 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  分段下载
                </button>
              )}
              <button
                onClick={handleDownload}
                className="glass-btn-primary px-4 h-9 text-white text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                {ffmpegLoaded ? '下载合成视频' : '下载第一段'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// Hook for using video composer
export function useVideoComposer() {
  const [isOpen, setIsOpen] = useState(false)
  const [segments, setSegments] = useState<VideoSegment[]>([])
  const [title, setTitle] = useState('')

  const open = (videoSegments: VideoSegment[], videoTitle?: string) => {
    setSegments(videoSegments)
    setTitle(videoTitle || '合成视频')
    setIsOpen(true)
  }

  const close = () => {
    setIsOpen(false)
    setSegments([])
  }

  const ComposerModal = () => {
    if (!isOpen) return null
    return (
      <VideoComposer
        segments={segments}
        title={title}
        onClose={close}
      />
    )
  }

  return {
    open,
    close,
    ComposerModal,
    isOpen,
  }
}
