import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { api } from '../api'
import { useToast } from './Toast'

interface Props {
  tokenIds: number[]
  onClose: () => void
  onSuccess: () => void
}

export function BatchProxyModal({ tokenIds, onClose, onSuccess }: Props) {
  const [proxyUrl, setProxyUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.batchUpdateProxy(tokenIds, proxyUrl.trim())
      toast.success(res.message)
      onSuccess()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md bg-[var(--bg-secondary)] rounded-lg border border-[var(--border)] shadow-xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
          <h3 className="text-sm font-medium text-[var(--text-primary)]">批量修改代理</h3>
          <button onClick={onClose} className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <p className="text-xs text-[var(--text-muted)]">
            将为选中的 <span className="text-[var(--accent)]">{tokenIds.length}</span> 个 Token 设置代理
          </p>

          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
              代理地址
            </label>
            <input
              type="text"
              value={proxyUrl}
              onChange={(e) => setProxyUrl(e.target.value)}
              className="w-full h-9 px-3 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
              placeholder="留空则清除代理，如 http://127.0.0.1:7890"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-9 bg-[var(--bg-tertiary)] hover:bg-[var(--border)] text-[var(--text-secondary)] text-sm font-medium rounded-md transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 h-9 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? '修改中...' : '确认修改'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
