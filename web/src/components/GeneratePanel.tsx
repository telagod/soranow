import { useState } from 'react'
import { Loader2, Image, Video, Sparkles } from 'lucide-react'
import { useToast } from './Toast'

type GenerationType = 'image' | 'video'

interface GenerationResult {
  type: GenerationType
  url: string
  prompt: string
  model: string
  timestamp: number
}

export function GeneratePanel() {
  const [prompt, setPrompt] = useState('')
  const [type, setType] = useState<GenerationType>('image')
  const [model, setModel] = useState('gpt-image')
  const [generating, setGenerating] = useState(false)
  const [results, setResults] = useState<GenerationResult[]>([])
  const [apiKey, setApiKey] = useState('')
  const [baseUrl, setBaseUrl] = useState(window.location.origin)
  const toast = useToast()

  const imageModels = [
    { id: 'gpt-image', name: 'GPT Image (1:1)' },
    { id: 'gpt-image-landscape', name: 'GPT Image (横向)' },
    { id: 'gpt-image-portrait', name: 'GPT Image (纵向)' },
  ]

  const videoModels = [
    { id: 'sora2-landscape-10s', name: 'Sora2 横向 10s' },
    { id: 'sora2-landscape-15s', name: 'Sora2 横向 15s' },
    { id: 'sora2-landscape-25s', name: 'Sora2 横向 25s' },
    { id: 'sora2-portrait-10s', name: 'Sora2 纵向 10s' },
    { id: 'sora2-portrait-15s', name: 'Sora2 纵向 15s' },
    { id: 'sora2-portrait-25s', name: 'Sora2 纵向 25s' },
    { id: 'sora2pro-landscape-10s', name: 'Sora2 Pro 横向 10s' },
    { id: 'sora2pro-landscape-15s', name: 'Sora2 Pro 横向 15s' },
    { id: 'sora2pro-portrait-10s', name: 'Sora2 Pro 纵向 10s' },
    { id: 'sora2pro-portrait-15s', name: 'Sora2 Pro 纵向 15s' },
  ]

  const handleTypeChange = (newType: GenerationType) => {
    setType(newType)
    setModel(newType === 'image' ? 'gpt-image' : 'sora2-landscape-15s')
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('请输入提示词')
      return
    }
    if (!apiKey.trim()) {
      toast.error('请输入 API Key')
      return
    }

    setGenerating(true)
    try {
      const response = await fetch(`${baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          stream: false,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || `HTTP ${response.status}`)
      }

      const data = await response.json()
      const content = data.choices?.[0]?.message?.content || ''

      // Extract URL from markdown
      const urlMatch = content.match(/!\[.*?\]\((https?:\/\/[^\)]+)\)/)
      if (urlMatch) {
        setResults(prev => [{
          type,
          url: urlMatch[1],
          prompt,
          model,
          timestamp: Date.now(),
        }, ...prev])
        toast.success('生成成功')
      } else {
        toast.error('未能获取生成结果')
      }
    } catch (err: any) {
      toast.error(err.message || '生成失败')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Left Panel - Controls */}
      <div className="lg:col-span-1 space-y-4">
        {/* API Settings */}
        <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border)] p-4">
          <h3 className="text-sm font-medium text-[var(--text-primary)] mb-3">API 设置</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Base URL</label>
              <input
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                className="w-full h-9 px-3 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] font-mono"
                placeholder="https://your-api.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full h-9 px-3 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] font-mono"
                placeholder="sk-..."
              />
            </div>
          </div>
        </div>

        {/* Generation Settings */}
        <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border)] p-4">
          <h3 className="text-sm font-medium text-[var(--text-primary)] mb-3">生成设置</h3>
          <div className="space-y-3">
            {/* Type Toggle */}
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">类型</label>
              <div className="flex gap-2">
                <button
                  onClick={() => handleTypeChange('image')}
                  className={`flex-1 h-9 flex items-center justify-center gap-1.5 rounded-md text-sm font-medium transition-colors ${
                    type === 'image'
                      ? 'bg-[var(--accent)] text-white'
                      : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Image className="w-4 h-4" />
                  图片
                </button>
                <button
                  onClick={() => handleTypeChange('video')}
                  className={`flex-1 h-9 flex items-center justify-center gap-1.5 rounded-md text-sm font-medium transition-colors ${
                    type === 'video'
                      ? 'bg-[var(--accent)] text-white'
                      : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Video className="w-4 h-4" />
                  视频
                </button>
              </div>
            </div>

            {/* Model Select */}
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">模型</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full h-9 px-3 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
              >
                {(type === 'image' ? imageModels : videoModels).map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            {/* Prompt */}
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">提示词</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] resize-none"
                placeholder="描述你想要生成的内容..."
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={generating || !prompt.trim() || !apiKey.trim()}
              className="w-full h-10 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  开始生成
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel - Results */}
      <div className="lg:col-span-2">
        <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border)] p-4 min-h-[500px]">
          <h3 className="text-sm font-medium text-[var(--text-primary)] mb-3">生成结果</h3>

          {results.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-[var(--text-muted)]">
              <Sparkles className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm">暂无生成结果</p>
              <p className="text-xs mt-1">输入提示词开始生成</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map((result, index) => (
                <div key={index} className="bg-[var(--bg-tertiary)] rounded-lg overflow-hidden border border-[var(--border)]">
                  {result.type === 'image' ? (
                    <img
                      src={result.url}
                      alt={result.prompt}
                      className="w-full aspect-square object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <video
                      src={result.url}
                      controls
                      className="w-full aspect-video"
                    />
                  )}
                  <div className="p-3">
                    <p className="text-xs text-[var(--text-secondary)] line-clamp-2" title={result.prompt}>
                      {result.prompt}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-[var(--text-muted)]">{result.model}</span>
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[var(--accent)] hover:underline"
                      >
                        下载
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
