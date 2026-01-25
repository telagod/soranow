import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, RefreshCw, Database, Settings, FileText, Sparkles } from 'lucide-react'
import { api } from '../api'
import { useAuthStore, useTokenStore, useStatsStore, useLogStore } from '../store'
import { useToast } from '../components/Toast'
import { TokenPanel } from '../components/TokenPanel'
import { SettingsPanel } from '../components/SettingsPanel'
import { LogsPanel } from '../components/LogsPanel'
import { GeneratePanel } from '../components/GeneratePanel'

type Tab = 'tokens' | 'settings' | 'logs' | 'generate'

export function ManagePage() {
  const [tab, setTab] = useState<Tab>('tokens')
  const [refreshing, setRefreshing] = useState(false)
  const navigate = useNavigate()
  const { logout, isAuthenticated } = useAuthStore()
  const { setTokens, setLoading } = useTokenStore()
  const { setStats } = useStatsStore()
  const { setLogs, setLoading: setLogsLoading } = useLogStore()
  const toast = useToast()

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login')
      return
    }
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [tokensRes, statsRes] = await Promise.all([
        api.getTokens(),
        api.getStats(),
      ])
      setTokens(tokensRes.tokens || tokensRes || [])
      setStats(statsRes)
    } catch (err: any) {
      toast.error(err.message || '加载数据失败')
    } finally {
      setLoading(false)
    }
  }

  const loadLogs = async () => {
    setLogsLoading(true)
    try {
      const res = await api.getLogs(100)
      // Handle both array and object response formats
      const logs = Array.isArray(res) ? res : (res as any)?.logs || []
      setLogs(logs)
    } catch (err: any) {
      // API might not exist, just set empty logs
      setLogs([])
      console.warn('Logs API not available:', err.message)
    } finally {
      setLogsLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    if (tab === 'logs') {
      await loadLogs()
    } else {
      await loadData()
    }
    setRefreshing(false)
    toast.success('刷新成功')
  }

  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      logout()
      navigate('/login')
    }
  }

  const handleTabChange = (newTab: Tab) => {
    setTab(newTab)
    if (newTab === 'logs') {
      loadLogs()
    }
  }

  const tabs = [
    { id: 'tokens' as Tab, label: 'Token 管理', icon: Database },
    { id: 'settings' as Tab, label: '系统配置', icon: Settings },
    { id: 'logs' as Tab, label: '请求日志', icon: FileText },
    { id: 'generate' as Tab, label: '生成面板', icon: Sparkles },
  ]

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[var(--bg-secondary)] border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 h-12 flex items-center justify-between">
          <h1 className="text-base font-semibold text-[var(--text-primary)]">Sora2API</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="h-7 px-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded transition-colors flex items-center gap-1"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              刷新
            </button>
            <button
              onClick={handleLogout}
              className="h-7 px-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded transition-colors flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              退出
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-[var(--bg-secondary)] border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => handleTabChange(t.id)}
                className={`h-10 px-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                  tab === t.id
                    ? 'border-[var(--accent)] text-[var(--text-primary)]'
                    : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                }`}
              >
                <t.icon className="w-4 h-4" />
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-4">
        {tab === 'tokens' && <TokenPanel onRefresh={loadData} />}
        {tab === 'settings' && <SettingsPanel />}
        {tab === 'logs' && <LogsPanel onRefresh={loadLogs} />}
        {tab === 'generate' && <GeneratePanel />}
      </main>
    </div>
  )
}
