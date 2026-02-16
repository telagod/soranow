import { useState, useEffect } from 'react'
import { Plus, Download, Upload, RefreshCw, ChevronDown, Check, Power, Trash2, Globe } from 'lucide-react'
import { api } from '../api'
import { useTokenStore } from '../store'
import { useToast } from './Toast'
import { StatsCards } from './StatsCards'
import { TokenTable } from './TokenTable'
import { AddTokenModal } from './AddTokenModal'
import { ImportTokenModal } from './ImportTokenModal'
import { BatchProxyModal } from './BatchProxyModal'

interface Props {
  onRefresh: () => void
}

export function TokenPanel({ onRefresh }: Props) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showBatchProxyModal, setShowBatchProxyModal] = useState(false)
  const [showBatchMenu, setShowBatchMenu] = useState(false)
  const [atAutoRefresh, setAtAutoRefresh] = useState(false)
  const { tokens, selectedIds, statusFilter, setStatusFilter, clearSelection } = useTokenStore()
  const toast = useToast()

  // Load AT auto refresh config on mount
  useEffect(() => {
    api.getTokenRefreshConfig().then((res) => {
      setAtAutoRefresh(res.config?.at_auto_refresh_enabled || false)
    }).catch(() => {})
  }, [])

  const handleTokenAdded = () => {
    setShowAddModal(false)
    onRefresh()
  }

  const handleImportComplete = () => {
    setShowImportModal(false)
    onRefresh()
  }

  const handleExport = () => {
    if (tokens.length === 0) {
      toast.error('没有 Token 可导出')
      return
    }
    const exportData = tokens.map((t) => ({
      email: t.email,
      access_token: t.token,
      session_token: t.session_token || null,
      refresh_token: t.refresh_token || null,
      client_id: t.client_id || null,
      proxy_url: t.proxy_url || null,
      remark: t.remark || null,
      is_active: t.is_active,
      image_enabled: t.image_enabled !== false,
      video_enabled: t.video_enabled !== false,
      image_concurrency: t.image_concurrency || -1,
      video_concurrency: t.video_concurrency || -1,
    }))
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tokens_${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`已导出 ${tokens.length} 个 Token`)
  }

  const handleAtAutoRefreshToggle = async () => {
    try {
      await api.updateTokenRefreshConfig(!atAutoRefresh)
      setAtAutoRefresh(!atAutoRefresh)
      toast.success(atAutoRefresh ? 'AT 自动刷新已禁用' : 'AT 自动刷新已启用')
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const handleBatchTestUpdate = async () => {
    if (selectedIds.size === 0) {
      toast.info('请先选择要测试的 Token')
      return
    }
    if (!confirm(`确定要测试更新选中的 ${selectedIds.size} 个 Token 吗？`)) return
    setShowBatchMenu(false)
    toast.info('正在测试更新...')
    try {
      const res = await api.batchTestUpdate(Array.from(selectedIds))
      toast.success(res.message)
      clearSelection()
      onRefresh()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const handleBatchEnable = async () => {
    if (selectedIds.size === 0) {
      toast.info('请先选择要启用的 Token')
      return
    }
    if (!confirm(`确定要启用选中的 ${selectedIds.size} 个 Token 吗？`)) return
    setShowBatchMenu(false)
    try {
      const res = await api.batchEnableAll(Array.from(selectedIds))
      toast.success(res.message)
      clearSelection()
      onRefresh()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const handleBatchDisable = async () => {
    if (selectedIds.size === 0) {
      toast.info('请先选择要禁用的 Token')
      return
    }
    if (!confirm(`确定要禁用选中的 ${selectedIds.size} 个 Token 吗？`)) return
    setShowBatchMenu(false)
    try {
      const res = await api.batchDisableSelected(Array.from(selectedIds))
      toast.success(res.message)
      clearSelection()
      onRefresh()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const handleBatchDeleteDisabled = async () => {
    if (selectedIds.size === 0) {
      toast.info('请先选择 Token')
      return
    }
    const disabledCount = Array.from(selectedIds).filter((id) => {
      const token = tokens.find((t) => t.id === id)
      return token && !token.is_active
    }).length
    if (disabledCount === 0) {
      toast.info('选中的 Token 中没有禁用的')
      return
    }
    if (!confirm(`确定要删除选中的 ${disabledCount} 个禁用 Token 吗？`)) return
    setShowBatchMenu(false)
    try {
      const res = await api.batchDeleteDisabled(Array.from(selectedIds))
      toast.success(res.message)
      clearSelection()
      onRefresh()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const handleBatchDeleteSelected = async () => {
    if (selectedIds.size === 0) {
      toast.info('请先选择要删除的 Token')
      return
    }
    if (!confirm(`确定要删除选中的 ${selectedIds.size} 个 Token 吗？此操作不可恢复！`)) return
    if (!confirm('再次确认：删除后无法恢复，确定继续？')) return
    setShowBatchMenu(false)
    try {
      const res = await api.batchDeleteSelected(Array.from(selectedIds))
      toast.success(res.message)
      clearSelection()
      onRefresh()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const handleBatchProxy = () => {
    if (selectedIds.size === 0) {
      toast.info('请先选择要修改代理的 Token')
      return
    }
    setShowBatchMenu(false)
    setShowBatchProxyModal(true)
  }

  const handleBatchProxyComplete = () => {
    setShowBatchProxyModal(false)
    clearSelection()
    onRefresh()
  }

  return (
    <div className="space-y-4">
      <StatsCards />

      <div className="glass-card">
        <div className="glass-toolbar px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-medium text-[var(--text-primary)]">Token 列表</h2>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="h-7 px-2 text-xs bg-white/30 backdrop-blur-sm border border-white/30 rounded text-[var(--text-secondary)]"
            >
              <option value="all">全部</option>
              <option value="active">活跃</option>
              <option value="disabled">禁用</option>
              <option value="expired">已过期</option>
            </select>

            {/* AT Auto Refresh Toggle */}
            <label className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] cursor-pointer" title="Token 距离过期 <24h 时自动刷新">
              <input
                type="checkbox"
                checked={atAutoRefresh}
                onChange={handleAtAutoRefreshToggle}
                className="w-3.5 h-3.5 rounded border-white/30 bg-white/30 backdrop-blur-sm"
              />
              自动刷新 AT
            </label>
          </div>

          <div className="flex items-center gap-2">
            {/* Batch Operations */}
            <div className="relative">
              <button
                onClick={() => setShowBatchMenu(!showBatchMenu)}
                className="glass-btn h-7 px-2.5 text-xs text-white rounded flex items-center gap-1"
                style={{ background: 'var(--btn-primary)' }}
              >
                <Check className="w-3.5 h-3.5" />
                批量操作
                <ChevronDown className="w-3 h-3" />
              </button>
              {showBatchMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowBatchMenu(false)} />
                  <div className="glass-card absolute right-0 top-full mt-1 w-40 z-20">
                    <button onClick={handleBatchTestUpdate} className="w-full px-3 py-1.5 text-xs text-left text-[var(--text-secondary)] hover:bg-white/30 backdrop-blur-sm flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5" /> 测试更新
                    </button>
                    <button onClick={handleBatchEnable} className="w-full px-3 py-1.5 text-xs text-left text-[var(--text-secondary)] hover:bg-white/30 backdrop-blur-sm flex items-center gap-2">
                      <Power className="w-3.5 h-3.5 text-green-500" /> 批量启用
                    </button>
                    <button onClick={handleBatchDisable} className="w-full px-3 py-1.5 text-xs text-left text-[var(--text-secondary)] hover:bg-white/30 backdrop-blur-sm flex items-center gap-2">
                      <Power className="w-3.5 h-3.5 text-yellow-500" /> 批量禁用
                    </button>
                    <button onClick={handleBatchDeleteDisabled} className="w-full px-3 py-1.5 text-xs text-left text-[var(--text-secondary)] hover:bg-white/30 backdrop-blur-sm flex items-center gap-2">
                      <Trash2 className="w-3.5 h-3.5 text-red-500" /> 清理禁用
                    </button>
                    <button onClick={handleBatchDeleteSelected} className="w-full px-3 py-1.5 text-xs text-left text-[var(--text-secondary)] hover:bg-white/30 backdrop-blur-sm flex items-center gap-2">
                      <Trash2 className="w-3.5 h-3.5 text-red-500" /> 删除选中
                    </button>
                    <button onClick={handleBatchProxy} className="w-full px-3 py-1.5 text-xs text-left text-[var(--text-secondary)] hover:bg-white/30 backdrop-blur-sm flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 text-blue-500" /> 修改代理
                    </button>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={handleExport}
              className="glass-btn h-7 px-2.5 text-xs text-white rounded flex items-center gap-1"
              style={{ background: 'var(--btn-info)' }}
            >
              <Download className="w-3.5 h-3.5" />
              导出
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="glass-btn h-7 px-2.5 text-xs text-white rounded flex items-center gap-1"
              style={{ background: 'var(--btn-success)' }}
            >
              <Upload className="w-3.5 h-3.5" />
              导入
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="glass-btn h-7 px-2.5 text-xs text-white rounded flex items-center gap-1"
              style={{ background: 'var(--btn-warning)' }}
            >
              <Plus className="w-3.5 h-3.5" />
              新增
            </button>
          </div>
        </div>

        <TokenTable onRefresh={onRefresh} />
      </div>

      {showAddModal && (
        <AddTokenModal onClose={() => setShowAddModal(false)} onSuccess={handleTokenAdded} />
      )}
      {showImportModal && (
        <ImportTokenModal onClose={() => setShowImportModal(false)} onSuccess={handleImportComplete} />
      )}
      {showBatchProxyModal && (
        <BatchProxyModal
          tokenIds={Array.from(selectedIds)}
          onClose={() => setShowBatchProxyModal(false)}
          onSuccess={handleBatchProxyComplete}
        />
      )}
    </div>
  )
}
