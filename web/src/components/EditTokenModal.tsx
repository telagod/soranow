import { useState } from 'react'
import { X, Loader2, RefreshCw } from 'lucide-react'
import type { Token } from '../store'
import { api } from '../api'
import { useToast } from './Toast'

interface Props {
  token: Token
  onClose: () => void
  onSuccess: () => void
}

export function EditTokenModal({ token, onClose, onSuccess }: Props) {
  const [at, setAt] = useState(token.token || '')
  const [st, setSt] = useState(token.session_token || '')
  const [rt, setRt] = useState(token.refresh_token || '')
  const [clientId, setClientId] = useState(token.client_id || '')
  const [proxyUrl, setProxyUrl] = useState(token.proxy_url || '')
  const [remark, setRemark] = useState(token.remark || '')
  const [isActive, setIsActive] = useState(token.is_active)
  const [imageEnabled, setImageEnabled] = useState(token.image_enabled)
  const [videoEnabled, setVideoEnabled] = useState(token.video_enabled)
  const [imageConcurrency, setImageConcurrency] = useState(String(token.image_concurrency || -1))
  const [videoConcurrency, setVideoConcurrency] = useState(String(token.video_concurrency || -1))
  const [loading, setLoading] = useState(false)
  const [converting, setConverting] = useState(false)
  const toast = useToast()

  const handleConvertST = async () => {
    if (!st.trim()) {
      toast.error('请先输入 Session Token')
      return
    }
    setConverting(true)
    try {
      const res = await api.convertST2AT(st.trim())
      if (res.success && res.access_token) {
        setAt(res.access_token)
        toast.success('ST 转换成功，AT 已填入')
      } else {
        toast.error(res.message || '转换失败')
      }
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setConverting(false)
    }
  }

  const handleConvertRT = async () => {
    if (!rt.trim()) {
      toast.error('请先输入 Refresh Token')
      return
    }
    setConverting(true)
    try {
      const res = await api.convertRT2AT(rt.trim(), clientId.trim() || undefined)
      if (res.success && res.access_token) {
        setAt(res.access_token)
        if (res.refresh_token) {
          setRt(res.refresh_token)
          toast.success('RT 转换成功，AT 和新 RT 已填入')
        } else {
          toast.success('RT 转换成功，AT 已填入')
        }
      } else {
        toast.error(res.message || '转换失败')
      }
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setConverting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!at.trim()) {
      toast.error('请输入 Access Token')
      return
    }

    setLoading(true)
    try {
      await api.updateToken(token.id, {
        token: at.trim(),
        session_token: st.trim() || undefined,
        refresh_token: rt.trim() || undefined,
        client_id: clientId.trim() || undefined,
        proxy_url: proxyUrl.trim(),
        remark: remark.trim() || undefined,
        is_active: isActive,
        image_enabled: imageEnabled,
        video_enabled: videoEnabled,
        image_concurrency: parseInt(imageConcurrency) || -1,
        video_concurrency: parseInt(videoConcurrency) || -1,
      })
      toast.success('Token 更新成功')
      onSuccess()
    } catch (err: any) {
      toast.error(err.message || '更新失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[var(--bg-secondary)] rounded-lg border border-[var(--border)] shadow-xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] sticky top-0 bg-[var(--bg-secondary)]">
          <h3 className="text-sm font-medium text-[var(--text-primary)]">编辑 Token</h3>
          <button onClick={onClose} className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Token Info */}
          <div className="text-xs text-[var(--text-muted)] bg-[var(--bg-tertiary)] rounded-md p-3">
            <div><span className="text-[var(--text-secondary)]">邮箱:</span> {token.email}</div>
            <div className="mt-1"><span className="text-[var(--text-secondary)]">类型:</span> {token.plan_type || '-'}</div>
          </div>

          {/* Access Token */}
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
              Access Token <span className="text-red-500">*</span>
            </label>
            <textarea
              value={at}
              onChange={(e) => setAt(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] resize-none font-mono"
            />
          </div>

          {/* Session Token */}
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
              Session Token (ST)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={st}
                onChange={(e) => setSt(e.target.value)}
                className="flex-1 h-9 px-3 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] font-mono"
              />
              <button
                type="button"
                onClick={handleConvertST}
                disabled={converting}
                className="h-9 px-3 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded transition-colors flex items-center gap-1 disabled:opacity-50"
              >
                {converting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                ST→AT
              </button>
            </div>
          </div>

          {/* Refresh Token */}
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
              Refresh Token (RT)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={rt}
                onChange={(e) => setRt(e.target.value)}
                className="flex-1 h-9 px-3 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] font-mono"
              />
              <button
                type="button"
                onClick={handleConvertRT}
                disabled={converting}
                className="h-9 px-3 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded transition-colors flex items-center gap-1 disabled:opacity-50"
              >
                {converting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                RT→AT
              </button>
            </div>
          </div>

          {/* Client ID */}
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
              Client ID
            </label>
            <input
              type="text"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full h-9 px-3 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] font-mono focus:outline-none focus:border-[var(--accent)]"
            />
          </div>

          {/* Proxy URL */}
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
              代理地址
            </label>
            <input
              type="text"
              value={proxyUrl}
              onChange={(e) => setProxyUrl(e.target.value)}
              className="w-full h-9 px-3 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
              placeholder="如 http://127.0.0.1:7890"
            />
          </div>

          {/* Remark */}
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
              备注
            </label>
            <input
              type="text"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              className="w-full h-9 px-3 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
            />
          </div>

          {/* Toggles */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded border-[var(--border)] bg-[var(--bg-tertiary)]"
              />
              <span className="text-sm text-[var(--text-primary)]">启用 Token</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={imageEnabled}
                onChange={(e) => setImageEnabled(e.target.checked)}
                className="w-4 h-4 rounded border-[var(--border)] bg-[var(--bg-tertiary)]"
              />
              <span className="text-sm text-[var(--text-primary)]">启用图片生成</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={videoEnabled}
                onChange={(e) => setVideoEnabled(e.target.checked)}
                className="w-4 h-4 rounded border-[var(--border)] bg-[var(--bg-tertiary)]"
              />
              <span className="text-sm text-[var(--text-primary)]">启用视频生成</span>
            </label>
          </div>

          {/* Concurrency */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                图片并发数
              </label>
              <input
                type="number"
                value={imageConcurrency}
                onChange={(e) => setImageConcurrency(e.target.value)}
                className="w-full h-9 px-3 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                视频并发数
              </label>
              <input
                type="number"
                value={videoConcurrency}
                onChange={(e) => setVideoConcurrency(e.target.value)}
                className="w-full h-9 px-3 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
          </div>
          <p className="text-xs text-[var(--text-muted)]">-1 表示无限制</p>

          {/* Buttons */}
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
              {loading ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
