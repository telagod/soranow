import { useState, useRef } from 'react'
import { X, Loader2, Upload, FileText, FileJson } from 'lucide-react'
import { api } from '../api'
import { useToast } from './Toast'

interface Props {
  onClose: () => void
  onSuccess: () => void
}

type ImportFormat = 'text' | 'json'

export function ImportTokenModal({ onClose, onSuccess }: Props) {
  const [format, setFormat] = useState<ImportFormat>('text')
  const [mode, setMode] = useState<'at' | 'offline' | 'st' | 'rt'>('rt')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any[] | null>(null)
  const [textContent, setTextContent] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const toast = useToast()

  const modeHints: Record<string, string> = {
    at: '使用 AT 更新账号状态（订阅信息、Sora2 次数等）',
    offline: '离线导入，不更新账号状态，动态字段显示为 -',
    st: '自动将 ST 转换为 AT，然后更新账号状态',
    rt: '自动将 RT 转换为 AT（并刷新 RT），然后更新账号状态',
  }

  const handleImport = async () => {
    if (format === 'text') {
      // Text format import
      const content = textContent.trim()
      if (!content) {
        toast.error('请输入或粘贴 Token 内容')
        return
      }

      try {
        setLoading(true)
        const res = await api.importTokensText(content, mode)
        if (res.success) {
          setResults(res.results || [])
          toast.success(res.message || `导入完成：新增 ${res.added}，更新 ${res.updated}，失败 ${res.failed}`)
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
    } else {
      // JSON format import
      const file = fileRef.current?.files?.[0]
      if (!file) {
        toast.error('请选择文件')
        return
      }
      if (!file.name.endsWith('.json') && !file.name.endsWith('.txt')) {
        toast.error('请选择 JSON 或 TXT 文件')
        return
      }

      try {
        const content = await file.text()

        // Try to parse as JSON first
        let data: any[]
        try {
          data = JSON.parse(content)
          if (!Array.isArray(data)) {
            toast.error('JSON 格式错误：应为数组')
            return
          }
        } catch {
          // If not JSON, treat as text format
          setLoading(true)
          const res = await api.importTokensText(content, mode)
          if (res.success) {
            setResults(res.results || [])
            toast.success(res.message || `导入完成：新增 ${res.added}，更新 ${res.updated}，失败 ${res.failed}`)
            if (res.failed === 0) {
              setTimeout(onSuccess, 1500)
            }
          } else {
            toast.error('导入失败')
          }
          setLoading(false)
          return
        }

        if (data.length === 0) {
          toast.error('文件内容为空')
          return
        }

        // Validate required fields for JSON
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
          toast.success(res.message || `导入完成：新增 ${res.added}，更新 ${res.updated}，失败 ${res.failed}`)
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
  }

  const handleFileSelect = async () => {
    const file = fileRef.current?.files?.[0]
    if (file && format === 'text') {
      const content = await file.text()
      setTextContent(content)
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
          {/* Format Select */}
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
              导入格式
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFormat('text')}
                className={`flex-1 h-9 flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors ${
                  format === 'text'
                    ? 'bg-[var(--accent)] text-white'
                    : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--border)]'
                }`}
              >
                <FileText className="w-4 h-4" />
                文本格式
              </button>
              <button
                type="button"
                onClick={() => setFormat('json')}
                className={`flex-1 h-9 flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors ${
                  format === 'json'
                    ? 'bg-[var(--accent)] text-white'
                    : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--border)]'
                }`}
              >
                <FileJson className="w-4 h-4" />
                JSON 格式
              </button>
            </div>
          </div>

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
              <option value="rt">RT 模式（推荐）</option>
              <option value="at">AT 模式</option>
              <option value="offline">离线模式</option>
              <option value="st">ST 模式</option>
            </select>
            <p className="text-xs text-[var(--text-muted)] mt-1">{modeHints[mode]}</p>
          </div>

          {/* Text Input or File Input */}
          {format === 'text' ? (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-[var(--text-secondary)]">
                  Token 内容
                </label>
                <label className="text-xs text-[var(--accent)] cursor-pointer hover:underline">
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".txt,.json"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  从文件导入
                </label>
              </div>
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder={`每行一个，格式：邮箱----密码----RefreshToken\n例如：\nuser@example.com----password123----rt_xxxxx\nuser2@example.com----pass456----rt_yyyyy`}
                className="w-full h-40 px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none font-mono"
              />
              <p className="text-xs text-[var(--text-muted)] mt-1">
                支持格式：邮箱----密码----RT 或 邮箱----RT 或 纯RT
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                选择文件
              </label>
              <input
                ref={fileRef}
                type="file"
                accept=".json,.txt"
                className="w-full text-sm text-[var(--text-secondary)] file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:bg-[var(--bg-tertiary)] file:text-[var(--text-primary)] hover:file:bg-[var(--border)]"
              />
              <p className="text-xs text-[var(--text-muted)] mt-1">
                支持 JSON 数组格式或文本格式
              </p>
            </div>
          )}

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
                    <span className="truncate max-w-[200px]">{r.email}</span>
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
