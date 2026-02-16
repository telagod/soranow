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
    <div className="glass-overlay fixed inset-0 z-50 flex items-center justify-center">
      <div className="glass-modal glass-animate-in w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="glass-header flex items-center justify-between px-4 py-3 sticky top-0 backdrop-blur-md">
          <h3 className="text-sm font-medium text-[var(--text-primary)]">编辑 Token</h3>
          <button onClick={onClose} className="glass-btn p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Token Info */}
          <div className="text-xs text-[var(--text-muted)] bg-white/30 backdrop-blur-sm rounded-[12px] p-3">
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
              className="glass-input w-full px-3 py-2 resize-none font-mono rounded-[12px]"
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
                className="glass-input flex-1 h-9 px-3 font-mono rounded-[12px]"
              />
              <button
                type="button"
                onClick={handleConvertST}
                disabled={converting}
                className="glass-btn h-9 px-3 text-white disabled:opacity-50 flex items-center gap-1 rounded-[12px]"
                style={{ background: 'var(--btn-purple)' }}
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
                className="glass-input flex-1 h-9 px-3 font-mono rounded-[12px]"
              />
              <button
                type="button"
                onClick={handleConvertRT}
                disabled={converting}
                className="glass-btn h-9 px-3 text-white disabled:opacity-50 flex items-center gap-1 rounded-[12px]"
                style={{ background: 'var(--btn-purple)' }}
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
              className="glass-input w-full h-9 px-3 font-mono rounded-[12px]"
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
              className="glass-input w-full h-9 px-3 rounded-[12px]"
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
              className="glass-input w-full h-9 px-3 rounded-[12px]"
            />
          </div>

          {/* Toggles */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-white/30 backdrop-blur-sm"
              />
              <span className="text-sm text-[var(--text-primary)]">启用 Token</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={imageEnabled}
                onChange={(e) => setImageEnabled(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-white/30 backdrop-blur-sm"
              />
              <span className="text-sm text-[var(--text-primary)]">启用图片生成</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={videoEnabled}
                onChange={(e) => setVideoEnabled(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-white/30 backdrop-blur-sm"
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
                className="glass-input w-full h-9 px-3 rounded-[12px]"
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
                className="glass-input w-full h-9 px-3 rounded-[12px]"
              />
            </div>
          </div>
          <p className="text-xs text-[var(--text-muted)]">-1 表示无限制</p>

          {/* Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="glass-btn flex-1 h-9 rounded-[12px]"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="glass-btn-primary flex-1 h-9 disabled:opacity-50 flex items-center justify-center gap-2"
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
