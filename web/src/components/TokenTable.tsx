import { useState } from 'react'
import { Trash2, Power, PowerOff, Edit2, TestTube, Copy } from 'lucide-react'
import { useTokenStore } from '../store'
import type { Token } from '../store'
import { api } from '../api'
import { useToast } from './Toast'
import { EditTokenModal } from './EditTokenModal'

interface Props {
  onRefresh: () => void
}

export function TokenTable({ onRefresh }: Props) {
  const { loading, selectedIds, toggleSelect, selectAll, clearSelection, filteredTokens } = useTokenStore()
  const tokens = filteredTokens()
  const [editToken, setEditToken] = useState<Token | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const toast = useToast()

  const totalPages = Math.ceil(tokens.length / pageSize)
  const paginatedTokens = tokens.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const formatExpiry = (exp?: string) => {
    if (!exp) return '-'
    const d = new Date(exp)
    const now = new Date()
    const diff = d.getTime() - now.getTime()
    const dateStr = d.toLocaleDateString('zh-CN')
    const isExpired = diff < 0
    const isNearExpiry = diff > 0 && diff < 7 * 24 * 60 * 60 * 1000
    return (
      <span className={isExpired ? 'text-red-500' : isNearExpiry ? 'text-yellow-500' : ''}>
        {dateStr}
      </span>
    )
  }

  const formatPlanType = (type?: string) => {
    const map: Record<string, string> = {
      chatgpt_team: 'Team',
      chatgpt_plus: 'Plus',
      chatgpt_pro: 'Pro',
      chatgpt_free: 'Free',
    }
    return map[type || ''] || type || '-'
  }

  const copyClientId = (clientId: string) => {
    navigator.clipboard.writeText(clientId)
    toast.success('已复制 Client ID')
  }

  const handleTest = async (token: Token) => {
    toast.info('正在测试 Token...')
    try {
      const res = await api.testToken(token.id)
      if (res.success) {
        let msg = `Token 有效！用户: ${res.email || '未知'}`
        if (res.sora2_supported) {
          const remaining = (res.sora2_total_count || 0) - (res.sora2_redeemed_count || 0)
          msg += `\nSora2: 支持 (${remaining}/${res.sora2_total_count})`
        }
        toast.success(msg)
        onRefresh()
      } else {
        toast.error(`Token 无效: ${res.message || '未知错误'}`)
      }
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const handleToggle = async (token: Token) => {
    try {
      await api.updateToken(token.id, { is_active: !token.is_active })
      toast.success(token.is_active ? 'Token 已禁用' : 'Token 已启用')
      onRefresh()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个 Token 吗？')) return
    try {
      await api.deleteToken(id)
      toast.success('删除成功')
      onRefresh()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const isAllSelected = paginatedTokens.length > 0 && paginatedTokens.every((t) => selectedIds.has(t.id))

  const handleSelectAll = () => {
    if (isAllSelected) {
      clearSelection()
    } else {
      selectAll()
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-[var(--text-muted)] text-sm">
        加载中...
      </div>
    )
  }

  if (tokens.length === 0) {
    return (
      <div className="p-8 text-center text-[var(--text-muted)] text-sm">
        暂无 Token，点击右上角"新增"添加
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto glass-card !p-0 !rounded-xl">
        <table className="w-full text-sm">
          <thead className="glass-toolbar">
            <tr className="text-[var(--text-muted)]">
              <th className="h-9 px-3 text-left font-medium">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  className="w-3.5 h-3.5 rounded border-white/30 bg-white/30"
                />
              </th>
              <th className="h-9 px-3 text-left font-medium">邮箱</th>
              <th className="h-9 px-3 text-left font-medium">状态</th>
              <th className="h-9 px-3 text-left font-medium">Client ID</th>
              <th className="h-9 px-3 text-left font-medium">过期时间</th>
              <th className="h-9 px-3 text-left font-medium">类型</th>
              <th className="h-9 px-3 text-left font-medium">可用次数</th>
              <th className="h-9 px-3 text-left font-medium">图片</th>
              <th className="h-9 px-3 text-left font-medium">视频</th>
              <th className="h-9 px-3 text-left font-medium">错误</th>
              <th className="h-9 px-3 text-left font-medium">备注</th>
              <th className="h-9 px-3 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {paginatedTokens.map((token) => (
              <tr key={token.id} className="hover:bg-white/10 transition-colors">
                <td className="h-10 px-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(token.id)}
                    onChange={() => toggleSelect(token.id)}
                    className="w-3.5 h-3.5 rounded border-white/30 bg-white/30"
                  />
                </td>
                <td className="h-10 px-3 text-[var(--text-primary)]">
                  {token.email}
                </td>
                <td className="h-10 px-3">
                  <span
                    className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium border border-white/20 backdrop-blur-sm ${
                      token.is_expired
                        ? 'bg-white/10 text-[var(--text-muted)]'
                        : token.is_active
                        ? 'bg-green-500/15 text-green-400'
                        : 'bg-red-500/15 text-red-400'
                    }`}
                  >
                    {token.is_expired ? '已过期' : token.is_active ? '活跃' : '禁用'}
                  </span>
                </td>
                <td className="h-10 px-3">
                  {token.client_id ? (
                    <button
                      onClick={() => copyClientId(token.client_id!)}
                      className="text-xs font-mono text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center gap-1"
                      title={token.client_id}
                    >
                      {token.client_id.substring(0, 8)}...
                      <Copy className="w-3 h-3" />
                    </button>
                  ) : (
                    <span className="text-[var(--text-muted)]">-</span>
                  )}
                </td>
                <td className="h-10 px-3 text-xs text-[var(--text-secondary)]">
                  {formatExpiry(token.expiry_time)}
                </td>
                <td className="h-10 px-3">
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs text-blue-400 bg-blue-500/15 border border-white/20 backdrop-blur-sm" title={token.plan_title || ''}>
                    {formatPlanType(token.plan_type)}
                  </span>
                </td>
                <td className="h-10 px-3 text-[var(--text-secondary)]">
                  {token.sora2_remaining_count !== undefined ? token.sora2_remaining_count : '-'}
                </td>
                <td className="h-10 px-3 text-[var(--text-secondary)]">
                  {token.image_enabled ? token.total_image_count : '-'}
                </td>
                <td className="h-10 px-3 text-[var(--text-secondary)]">
                  {token.video_enabled ? token.total_video_count : '-'}
                </td>
                <td className="h-10 px-3 text-[var(--text-secondary)]">
                  {token.total_error_count || 0}
                </td>
                <td className="h-10 px-3 text-xs text-[var(--text-muted)] max-w-[100px] truncate" title={token.remark || ''}>
                  {token.remark || '-'}
                </td>
                <td className="h-10 px-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => handleTest(token)}
                      className="p-1.5 text-blue-500 hover:bg-blue-500/10 rounded transition-colors"
                      title="测试"
                    >
                      <TestTube className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setEditToken(token)}
                      className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/20 rounded transition-colors"
                      title="编辑"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleToggle(token)}
                      className={`p-1.5 rounded transition-colors ${
                        token.is_active
                          ? 'text-yellow-500 hover:bg-yellow-500/10'
                          : 'text-green-500 hover:bg-green-500/10'
                      }`}
                      title={token.is_active ? '禁用' : '启用'}
                    >
                      {token.is_active ? (
                        <PowerOff className="w-3.5 h-3.5" />
                      ) : (
                        <Power className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(token.id)}
                      className="p-1.5 text-red-500 hover:bg-red-500/10 rounded transition-colors"
                      title="删除"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-white/20 glass-toolbar rounded-b-xl">
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--text-muted)]">每页</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value))
              setCurrentPage(1)
            }}
            className="glass-input h-7 px-2 text-xs text-[var(--text-secondary)] rounded-[12px]"
          >
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={200}>200</option>
          </select>
          <span className="text-xs text-[var(--text-muted)]">共 {tokens.length} 条</span>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="glass-btn h-7 px-2 text-xs text-[var(--text-secondary)] disabled:opacity-50 rounded-[12px]"
            >
              首页
            </button>
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="glass-btn h-7 px-2 text-xs text-[var(--text-secondary)] disabled:opacity-50 rounded-[12px]"
            >
              上一页
            </button>
            <span className="text-xs text-[var(--text-muted)] px-2">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="glass-btn h-7 px-2 text-xs text-[var(--text-secondary)] disabled:opacity-50 rounded-[12px]"
            >
              下一页
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="glass-btn h-7 px-2 text-xs text-[var(--text-secondary)] disabled:opacity-50 rounded-[12px]"
            >
              末页
            </button>
          </div>
        )}
      </div>

      {editToken && (
        <EditTokenModal
          token={editToken}
          onClose={() => setEditToken(null)}
          onSuccess={() => {
            setEditToken(null)
            onRefresh()
          }}
        />
      )}
    </>
  )
}
