import { useState, useRef } from 'react'
import { X, Loader2, Upload } from 'lucide-react'
import { api } from '../api'
import { useToast } from './Toast'

interface Props {
  onClose: () => void
  onSuccess: () => void
}

export function ImportTokenModal({ onClose, onSuccess }: Props) {
  const [mode, setMode] = useState<'at' | 'offline' | 'st' | 'rt'>('at')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any[] | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const toast = useToast()

  const modeHints: Record<string, string> = {
    at: '使用 AT 更新账号状态（订阅信息、Sora2 次数等）',
    offline: '离线导入，不更新账号状态，动态字段显示为 -',
    st: '自动将 ST 转换为 AT，然后更新账号状态',
    rt: '自动将 RT 转换为 AT（并刷新 RT），然后更新账号状态',
  }

  const handleImport = async () => {
    const file = fileRef.current?.files?.[0]
    if (!file) {
      toast.error('请选择文件')
      return
    }
    if (!file.name.endsWith('.json')) {
      toast.error('请选择 JSON 文件')
      return
    }

    try {
      const content = await file.text()
      const data = JSON.parse(content)
      if (!Array.isArray(data)) {
        toast.error('JSON 格式错误：应为数组')
        return
      }
      if (data.length === 0) {
        toast.error('JSON 文件为空')
        return
      }

      // Validate required fields
      for (const item of data) {
        if (!item.email) {
          toast.error('导入数据缺少必填字段: email')
          return
        }
        if ((mode === 'offline' || mode === 'at') && !item.access_token) {
          toast.error(`${item.email} 缺少必填字段: access_token`)
          return
        }
        if (mode === 'st' && !item.session_token) {
          toast.error(`${item.email} 缺少必填字段: session_token`)
          return
        }
        if (mode === 'rt' && !item.refresh_token) {
          toast.error(`${item.email} 缺少必填字段: refresh_token`)
          return
        }
      }

      setLoading(true)
      const res = await api.importTokens(data, mode)
      if (res.success) {
        setResults(res.results || [])
        toast.success(`导入完成：新增 ${res.added}，更新 ${res.updated}，失败 ${res.failed}`)
        if (res.failed === 0) {
          setTimeout(onSuccess, 1500)
        }
      } else {
        toast.error('导入失败')
      }
    } catch (err: any) {
      toast.error(err.message || '导入失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[var(--bg-secondary)] rounded-lg border border-[var(--border)] shadow-xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] sticky top-0 bg-[var(--bg-secondary)]">
          <h3 className="text-sm font-medium text-[var(--text-primary)]">导入 Token</h3>
          <button onClick={onClose} className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Mode Select */}
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
              导入模式
            </label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as any)}
              className="w-full h-9 px-3 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)]"
            >
              <option value="at">AT 模式</option>
              <option value="offline">离线模式</option>
              <option value="st">ST 模式</option>
              <option value="rt">RT 模式</option>
            </select>
            <p className="text-xs text-[var(--text-muted)] mt-1">{modeHints[mode]}</p>
          </div>

          {/* File Input */}
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
              选择文件
            </label>
            <input
              ref={fileRef}
              type="file"
              accept=".json"
              className="w-full text-sm text-[var(--text-secondary)] file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:bg-[var(--bg-tertiary)] file:text-[var(--text-primary)] hover:file:bg-[var(--border)]"
            />
          </div>

          {/* Results */}
          {results && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              <h4 className="text-xs font-medium text-[var(--text-secondary)]">导入结果</h4>
              {results.map((r, i) => (
                <div
                  key={i}
                  className={`p-2 rounded text-xs ${
                    r.success
                      ? r.status === 'added'
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-blue-500/10 text-blue-400'
                      : 'bg-red-500/10 text-red-400'
                  }`}
                >
                  <div className="flex justify-between">
                    <span>{r.email}</span>
                    <span>{r.status === 'added' ? '新增' : r.status === 'updated' ? '更新' : '失败'}</span>
                  </div>
                  {r.error && <div className="mt-1 text-red-400">{r.error}</div>}
                </div>
              ))}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-9 bg-[var(--bg-tertiary)] hover:bg-[var(--border)] text-[var(--text-secondary)] text-sm font-medium rounded-md transition-colors"
            >
              {results ? '关闭' : '取消'}
            </button>
            {!results && (
              <button
                onClick={handleImport}
                disabled={loading}
                className="flex-1 h-9 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {loading ? '导入中...' : '导入'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
