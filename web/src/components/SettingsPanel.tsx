import { useState, useEffect } from 'react'
import { Loader2, Save, TestTube, Eye, EyeOff } from 'lucide-react'
import { api } from '../api'
import { useToast } from './Toast'
import { useAuthStore } from '../store'

export function SettingsPanel() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testingProxy, setTestingProxy] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const toast = useToast()
  const logout = useAuthStore((s) => s.logout)

  // Security
  const [adminUsername, setAdminUsername] = useState('')
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [newApiKey, setNewApiKey] = useState('')

  // Proxy
  const [proxyEnabled, setProxyEnabled] = useState(false)
  const [proxyUrl, setProxyUrl] = useState('')
  const [proxyTestUrl, setProxyTestUrl] = useState('https://sora.chatgpt.com')
  const [proxyStatus, setProxyStatus] = useState<{ msg: string; type: 'success' | 'error' | 'muted' } | null>(null)

  // Cache
  const [cacheEnabled, setCacheEnabled] = useState(false)
  const [cacheTimeout, setCacheTimeout] = useState(7200)
  const [cacheBaseUrl, setCacheBaseUrl] = useState('')

  // Timeout
  const [imageTimeout, setImageTimeout] = useState(300)
  const [videoTimeout, setVideoTimeout] = useState(1500)

  // Error handling
  const [errorBanThreshold, setErrorBanThreshold] = useState(3)
  const [taskRetryEnabled, setTaskRetryEnabled] = useState(false)
  const [taskMaxRetries, setTaskMaxRetries] = useState(3)
  const [autoDisable401, setAutoDisable401] = useState(false)

  // Watermark
  const [watermarkEnabled, setWatermarkEnabled] = useState(false)
  const [watermarkParseMethod, setWatermarkParseMethod] = useState('third_party')
  const [watermarkParseUrl, setWatermarkParseUrl] = useState('')
  const [watermarkParseToken, setWatermarkParseToken] = useState('')
  const [watermarkFallback, setWatermarkFallback] = useState(true)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    setLoading(true)
    try {
      const config = await api.getConfig()
      setAdminUsername(config.admin_username || '')
      setApiKey(config.api_key || '')
      setProxyEnabled(config.proxy_enabled || false)
      setProxyUrl(config.proxy_url || '')
      setCacheEnabled(config.cache_enabled || false)
      setCacheTimeout(config.cache_timeout || 7200)
      setCacheBaseUrl(config.cache_base_url || '')
      setImageTimeout(config.image_timeout || 300)
      setVideoTimeout(config.video_timeout || 1500)
      setErrorBanThreshold(config.error_ban_threshold || 3)
      setTaskRetryEnabled(config.task_retry_enabled || false)
      setTaskMaxRetries(config.task_max_retries || 3)
      setAutoDisable401(config.auto_disable_401 || false)
      setWatermarkEnabled(config.watermark_free_enabled || false)
      setWatermarkParseMethod(config.watermark_parse_method || 'third_party')
      setWatermarkParseUrl(config.watermark_parse_url || '')
      setWatermarkParseToken(config.watermark_parse_token || '')
      setWatermarkFallback(config.watermark_fallback !== false)
    } catch (err: any) {
      toast.error(err.message || '加载配置失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveConfig = async () => {
    setSaving(true)
    try {
      await api.updateConfig({
        admin_username: adminUsername,
        proxy_enabled: proxyEnabled,
        proxy_url: proxyUrl,
        cache_enabled: cacheEnabled,
        cache_timeout: cacheTimeout,
        cache_base_url: cacheBaseUrl,
        image_timeout: imageTimeout,
        video_timeout: videoTimeout,
        error_ban_threshold: errorBanThreshold,
        task_retry_enabled: taskRetryEnabled,
        task_max_retries: taskMaxRetries,
        auto_disable_401: autoDisable401,
        watermark_free_enabled: watermarkEnabled,
        watermark_parse_method: watermarkParseMethod,
        watermark_parse_url: watermarkParseUrl,
        watermark_parse_token: watermarkParseToken,
        watermark_fallback: watermarkFallback,
      })
      toast.success('配置保存成功')
    } catch (err: any) {
      toast.error(err.message || '保存失败')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdatePassword = async () => {
    if (!newPassword) {
      toast.error('请输入新密码')
      return
    }
    if (newPassword.length < 4) {
      toast.error('新密码至少 4 个字符')
      return
    }
    try {
      await api.updatePassword(oldPassword || '', newPassword, adminUsername || undefined)
      toast.success('密码修改成功，请重新登录')
      setTimeout(() => {
        logout()
        window.location.href = '/login'
      }, 2000)
    } catch (err: any) {
      toast.error(err.message || '修改失败')
    }
  }

  const handleUpdateApiKey = async () => {
    if (!newApiKey) {
      toast.error('请输入新的 API Key')
      return
    }
    if (newApiKey.length < 6) {
      toast.error('API Key 至少 6 个字符')
      return
    }
    if (!confirm('确定要更新 API Key 吗？更新后需要通知所有客户端使用新密钥。')) return
    try {
      await api.updateAPIKey(newApiKey)
      toast.success('API Key 更新成功')
      setApiKey(newApiKey)
      setNewApiKey('')
    } catch (err: any) {
      toast.error(err.message || '更新失败')
    }
  }

  const handleTestProxy = async () => {
    if (!proxyEnabled || !proxyUrl) {
      setProxyStatus({ msg: '代理未启用或地址为空', type: 'error' })
      return
    }
    setTestingProxy(true)
    setProxyStatus({ msg: '正在测试代理连接...', type: 'muted' })
    try {
      const res = await api.testProxy(proxyTestUrl)
      if (res.success) {
        setProxyStatus({ msg: `✓ ${res.message || '代理可用'}`, type: 'success' })
      } else {
        setProxyStatus({ msg: `✗ ${res.message || '代理不可用'}`, type: 'error' })
      }
    } catch (err: any) {
      setProxyStatus({ msg: `✗ ${err.message}`, type: 'error' })
    } finally {
      setTestingProxy(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-[var(--text-muted)] text-sm">
        加载中...
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Security */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border)] p-4">
          <h3 className="text-sm font-medium text-[var(--text-primary)] mb-4">安全配置</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">管理员用户名</label>
              <input
                type="text"
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                className="w-full h-9 px-3 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">旧密码</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full h-9 px-3 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                placeholder="输入旧密码"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">新密码</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full h-9 px-3 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                placeholder="输入新密码"
              />
            </div>
            <button
              onClick={handleUpdatePassword}
              className="w-full h-9 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-medium rounded-md transition-colors"
            >
              修改密码
            </button>
          </div>
        </div>

        <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border)] p-4">
          <h3 className="text-sm font-medium text-[var(--text-primary)] mb-4">API 密钥配置</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">当前 API Key</label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  readOnly
                  className="w-full h-9 px-3 pr-10 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-muted)] font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">新 API Key</label>
              <input
                type="text"
                value={newApiKey}
                onChange={(e) => setNewApiKey(e.target.value)}
                className="w-full h-9 px-3 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                placeholder="输入新的 API Key"
              />
            </div>
            <button
              onClick={handleUpdateApiKey}
              className="w-full h-9 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-medium rounded-md transition-colors"
            >
              更新 API Key
            </button>
          </div>
        </div>
      </div>

      {/* Proxy */}
      <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border)] p-4">
        <h3 className="text-sm font-medium text-[var(--text-primary)] mb-4">代理配置</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={proxyEnabled}
              onChange={(e) => setProxyEnabled(e.target.checked)}
              className="w-4 h-4 rounded border-[var(--border)] bg-[var(--bg-tertiary)]"
            />
            <span className="text-sm text-[var(--text-primary)]">启用代理</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">代理地址</label>
              <input
                type="text"
                value={proxyUrl}
                onChange={(e) => setProxyUrl(e.target.value)}
                className="w-full h-9 px-3 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
                placeholder="http://127.0.0.1:7890"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">测试域名</label>
              <input
                type="text"
                value={proxyTestUrl}
                onChange={(e) => setProxyTestUrl(e.target.value)}
                className="w-full h-9 px-3 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
          </div>
          <button
            onClick={handleTestProxy}
            disabled={testingProxy}
            className="h-8 px-3 bg-[var(--bg-tertiary)] hover:bg-[var(--border)] text-[var(--text-secondary)] text-xs rounded transition-colors flex items-center gap-1 disabled:opacity-50"
          >
            {testingProxy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <TestTube className="w-3.5 h-3.5" />}
            测试代理
          </button>
          {proxyStatus && (
            <p className={`text-xs ${proxyStatus.type === 'success' ? 'text-green-500' : proxyStatus.type === 'error' ? 'text-red-500' : 'text-[var(--text-muted)]'}`}>
              {proxyStatus.msg}
            </p>
          )}
        </div>
      </div>

      {/* Cache & Timeout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border)] p-4">
          <h3 className="text-sm font-medium text-[var(--text-primary)] mb-4">缓存配置</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={cacheEnabled}
                onChange={(e) => setCacheEnabled(e.target.checked)}
                className="w-4 h-4 rounded border-[var(--border)] bg-[var(--bg-tertiary)]"
              />
              <span className="text-sm text-[var(--text-primary)]">启用缓存</span>
            </label>
            {cacheEnabled && (
              <>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">缓存超时 (秒)</label>
                  <input
                    type="number"
                    value={cacheTimeout}
                    onChange={(e) => setCacheTimeout(parseInt(e.target.value) || 7200)}
                    className="w-full h-9 px-3 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  />
                  <p className="text-xs text-[var(--text-muted)] mt-1">-1 表示永不删除</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">缓存访问域名</label>
                  <input
                    type="text"
                    value={cacheBaseUrl}
                    onChange={(e) => setCacheBaseUrl(e.target.value)}
                    className="w-full h-9 px-3 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
                    placeholder="留空使用服务器地址"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border)] p-4">
          <h3 className="text-sm font-medium text-[var(--text-primary)] mb-4">超时配置</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">图片生成超时 (秒)</label>
              <input
                type="number"
                value={imageTimeout}
                onChange={(e) => setImageTimeout(parseInt(e.target.value) || 300)}
                className="w-full h-9 px-3 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">视频生成超时 (秒)</label>
              <input
                type="number"
                value={videoTimeout}
                onChange={(e) => setVideoTimeout(parseInt(e.target.value) || 1500)}
                className="w-full h-9 px-3 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Error Handling */}
      <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border)] p-4">
        <h3 className="text-sm font-medium text-[var(--text-primary)] mb-4">错误处理配置</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">错误封禁阈值</label>
            <input
              type="number"
              value={errorBanThreshold}
              onChange={(e) => setErrorBanThreshold(parseInt(e.target.value) || 3)}
              className="w-full h-9 px-3 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
            />
            <p className="text-xs text-[var(--text-muted)] mt-1">连续错误达到此次数后自动禁用 Token</p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={taskRetryEnabled}
              onChange={(e) => setTaskRetryEnabled(e.target.checked)}
              className="w-4 h-4 rounded border-[var(--border)] bg-[var(--bg-tertiary)]"
            />
            <span className="text-sm text-[var(--text-primary)]">启用任务失败重试</span>
          </label>
          {taskRetryEnabled && (
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">最大重试次数</label>
              <input
                type="number"
                value={taskMaxRetries}
                onChange={(e) => setTaskMaxRetries(parseInt(e.target.value) || 3)}
                min={1}
                max={10}
                className="w-full h-9 px-3 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
          )}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoDisable401}
              onChange={(e) => setAutoDisable401(e.target.checked)}
              className="w-4 h-4 rounded border-[var(--border)] bg-[var(--bg-tertiary)]"
            />
            <span className="text-sm text-[var(--text-primary)]">401 错误自动禁用 Token</span>
          </label>
        </div>
      </div>

      {/* Watermark */}
      <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border)] p-4">
        <h3 className="text-sm font-medium text-[var(--text-primary)] mb-4">无水印模式配置</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={watermarkEnabled}
              onChange={(e) => setWatermarkEnabled(e.target.checked)}
              className="w-4 h-4 rounded border-[var(--border)] bg-[var(--bg-tertiary)]"
            />
            <span className="text-sm text-[var(--text-primary)]">开启无水印模式</span>
          </label>
          <p className="text-xs text-[var(--text-muted)]">开启后生成的视频将会被发布到 Sora 平台并提取返回无水印的视频</p>

          {watermarkEnabled && (
            <>
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">解析方式</label>
                <select
                  value={watermarkParseMethod}
                  onChange={(e) => setWatermarkParseMethod(e.target.value)}
                  className="w-full h-9 px-3 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)]"
                >
                  <option value="third_party">第三方解析</option>
                  <option value="custom">自定义解析接口</option>
                </select>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={watermarkFallback}
                  onChange={(e) => setWatermarkFallback(e.target.checked)}
                  className="w-4 h-4 rounded border-[var(--border)] bg-[var(--bg-tertiary)]"
                />
                <span className="text-sm text-[var(--text-primary)]">去水印失败后自动回退</span>
              </label>

              {watermarkParseMethod === 'custom' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">解析服务器地址</label>
                    <input
                      type="text"
                      value={watermarkParseUrl}
                      onChange={(e) => setWatermarkParseUrl(e.target.value)}
                      className="w-full h-9 px-3 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
                      placeholder="http://example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">访问密钥</label>
                    <input
                      type="password"
                      value={watermarkParseToken}
                      onChange={(e) => setWatermarkParseToken(e.target.value)}
                      className="w-full h-9 px-3 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
                      placeholder="输入访问密钥"
                    />
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveConfig}
          disabled={saving}
          className="h-9 px-4 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? '保存中...' : '保存配置'}
        </button>
      </div>
    </div>
  )
}
