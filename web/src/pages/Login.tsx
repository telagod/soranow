import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, User, Loader2 } from 'lucide-react'
import { api } from '../api'
import { useAuthStore } from '../store'
import { useToast } from '../components/Toast'

export function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const toast = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username) {
      toast.error('请输入用户名')
      return
    }
    setLoading(true)
    try {
      const data = await api.login(username, password)
      setAuth(data.token, data.username)
      toast.success('登录成功')
      navigate('/manage')
    } catch (err: any) {
      toast.error(err.message || '登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">SoraNow</h1>
          <p className="text-sm text-[var(--text-primary)] mt-1">管理控制台</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card rounded-[16px]">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text-primary)] mb-1.5">
                用户名
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-primary)]" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="glass-input w-full h-9 pl-9 pr-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                  placeholder="admin"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-primary)] mb-1.5">
                密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-primary)]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="glass-input w-full h-9 pl-9 pr-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="glass-btn w-full h-9 text-[var(--text-primary)] text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2 rounded-[12px]"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? '登录中...' : '登录'}
            </button>
          </div>
        </form>

        <p className="text-center text-xs text-[var(--text-primary)] mt-4">
          默认账号: admin / 空密码
        </p>
      </div>
    </div>
  )
}
