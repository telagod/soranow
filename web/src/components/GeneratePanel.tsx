import { useState, useEffect } from 'react'
import { Sparkles, Film, User } from 'lucide-react'
import { api, type TokenData } from '../api'
import { useToast } from './Toast'
import { QuickGenerate } from './generate/QuickGenerate'
import { StoryEditor } from './generate/StoryEditor'
import { CharacterManager } from './generate/CharacterManager'
import { ResultGallery, type GenerationResult } from './generate/ResultGallery'

type TabType = 'quick' | 'story' | 'characters'

export function GeneratePanel() {
  const [activeTab, setActiveTab] = useState<TabType>('quick')
  const [tokens, setTokens] = useState<TokenData[]>([])
  const [results, setResults] = useState<GenerationResult[]>([])
  const [loading, setLoading] = useState(true)
  const toast = useToast()

  // Load tokens on mount
  useEffect(() => {
    loadTokens()
  }, [])

  // Load saved results from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('generation_results')
    if (saved) {
      try {
        setResults(JSON.parse(saved))
      } catch {
        // Ignore parse errors
      }
    }
  }, [])

  // Save results to localStorage
  useEffect(() => {
    if (results.length > 0) {
      localStorage.setItem('generation_results', JSON.stringify(results.slice(0, 50))) // Keep last 50
    }
  }, [results])

  const loadTokens = async () => {
    try {
      const data = await api.getTokens()
      setTokens(data.tokens || [])
    } catch (err: any) {
      toast.error(err.message || '加载 Token 失败')
    } finally {
      setLoading(false)
    }
  }

  const handleResult = (result: GenerationResult) => {
    setResults(prev => [result, ...prev])
  }

  const handleDeleteResult = (id: string) => {
    setResults(prev => prev.filter(r => r.id !== id))
  }

  const handleClearResults = () => {
    if (confirm('确定要清空所有生成结果吗？')) {
      setResults([])
      localStorage.removeItem('generation_results')
    }
  }

  const handleStoryComplete = (storyResults: { url: string; shotId: string }[]) => {
    // Add story results to gallery
    storyResults.forEach((r, index) => {
      handleResult({
        id: r.shotId,
        type: 'video',
        url: r.url,
        prompt: `故事镜头 ${index + 1}`,
        model: 'Sora',
        timestamp: Date.now(),
      })
    })
  }

  const tabs = [
    { id: 'quick' as TabType, label: '快速生成', icon: Sparkles },
    { id: 'story' as TabType, label: '故事模式', icon: Film },
    { id: 'characters' as TabType, label: '角色管理', icon: User },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]" />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Tab Navigation */}
      <div className="flex items-center gap-1 p-2 bg-[var(--bg-secondary)] border-b border-[var(--border)]">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${activeTab === tab.id
                  ? 'bg-[var(--accent)] text-white'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'quick' && (
          <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-0">
            {/* Left Panel - Quick Generate */}
            <div className="lg:col-span-1 p-4 overflow-y-auto border-r border-[var(--border)] bg-[var(--bg-secondary)]">
              <QuickGenerate tokens={tokens} onResult={handleResult} />
            </div>

            {/* Right Panel - Results */}
            <div className="lg:col-span-2 p-4 overflow-y-auto">
              <ResultGallery
                results={results}
                onDelete={handleDeleteResult}
                onClear={handleClearResults}
              />
            </div>
          </div>
        )}

        {activeTab === 'story' && (
          <div className="h-full bg-[var(--bg-secondary)]">
            <StoryEditor
              tokens={tokens}
              onGenerationComplete={handleStoryComplete}
            />
          </div>
        )}

        {activeTab === 'characters' && (
          <div className="h-full p-4 overflow-y-auto bg-[var(--bg-secondary)]">
            <CharacterManager tokens={tokens} />
          </div>
        )}
      </div>
    </div>
  )
}
