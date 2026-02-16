import { useState } from 'react'
import { Trash2, Eye, X, StopCircle } from 'lucide-react'
import { useLogStore } from '../store'
import { api } from '../api'
import type { LogEntry } from '../api'
import { useToast } from './Toast'

interface Props {
  onRefresh: () => void
}

export function LogsPanel({ onRefresh }: Props) {
  const { logs, loading } = useLogStore()
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null)
  const toast = useToast()

  const handleClearLogs = async () => {
    if (!confirm('确定要清空所有日志吗？此操作不可恢复！')) return
    try {
      await api.clearLogs()
      toast.success('日志已清空')
      onRefresh()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const handleCancelTask = async (taskId: string) => {
    if (!confirm('确定要终止这个任务吗？')) return
    try {
      await api.cancelTask(taskId)
      toast.success('任务已终止')
      onRefresh()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN')
  }

  const getStatusClass = (log: LogEntry) => {
    if (log.status_code === -1) return 'bg-blue-500/20 text-blue-400'
    if (log.status_code === 200) return 'bg-green-500/20 text-green-400'
    return 'bg-red-500/20 text-red-400'
  }

  const getStatusText = (log: LogEntry) => {
    if (log.status_code === -1) return '处理中'
    return String(log.status_code)
  }

  const renderProgress = (log: LogEntry) => {
    if (log.status_code === -1 && log.task_status === 'processing') {
      const progress = log.progress || 0
      return (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-white/30 backdrop-blur-sm rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs text-blue-400">{progress.toFixed(0)}%</span>
        </div>
      )
    }
    if (log.task_status === 'failed') {
      return <span className="text-xs text-red-400">失败</span>
    }
    if (log.task_status === 'completed' && log.status_code === 200) {
      return <span className="text-xs text-green-400">已完成</span>
    }
    return <span className="text-xs text-[var(--text-muted)]">-</span>
  }

  if (loading) {
    return (
      <div className="bg-white/40 backdrop-blur-md rounded-[16px] border border-white/30 p-8 text-center text-[var(--text-muted)] text-sm">
        加载中...
      </div>
    )
  }

  return (
    <>
      <div className="glass-card">
        <div className="px-4 py-3 border-b border-white/20 flex items-center justify-between">
          <h2 className="text-sm font-medium text-[var(--text-primary)]">请求日志</h2>
          <button
            onClick={handleClearLogs}
            className="h-7 px-2.5 text-xs text-red-500 hover:bg-red-500/10 rounded-[12px] transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            清空日志
          </button>
        </div>

        {logs.length === 0 ? (
          <div className="p-8 text-center text-[var(--text-muted)] text-sm">
            暂无日志
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/20 text-[var(--text-muted)]">
                  <th className="h-9 px-3 text-left font-medium">操作</th>
                  <th className="h-9 px-3 text-left font-medium">Token</th>
                  <th className="h-9 px-3 text-left font-medium">状态码</th>
                  <th className="h-9 px-3 text-left font-medium">进度</th>
                  <th className="h-9 px-3 text-left font-medium">耗时</th>
                  <th className="h-9 px-3 text-left font-medium">时间</th>
                  <th className="h-9 px-3 text-right font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/20 transition-colors">
                    <td className="h-10 px-3 text-[var(--text-primary)]">{log.operation}</td>
                    <td className="h-10 px-3 text-xs text-[var(--text-secondary)]">
                      {log.token_email || '未知'}
                    </td>
                    <td className="h-10 px-3">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-[12px] text-xs font-medium ${getStatusClass(log)}`}>
                        {getStatusText(log)}
                      </span>
                    </td>
                    <td className="h-10 px-3 w-32">{renderProgress(log)}</td>
                    <td className="h-10 px-3 text-xs text-[var(--text-secondary)]">
                      {log.duration === -1 ? '处理中' : `${log.duration.toFixed(2)}秒`}
                    </td>
                    <td className="h-10 px-3 text-xs text-[var(--text-muted)]">
                      {formatDate(log.created_at)}
                    </td>
                    <td className="h-10 px-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="p-1.5 text-blue-500 hover:bg-blue-500/10 rounded-[12px] transition-colors"
                          title="查看详情"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {log.status_code === -1 && log.task_id && (
                          <button
                            onClick={() => handleCancelTask(log.task_id!)}
                            className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-[12px] transition-colors"
                            title="终止任务"
                          >
                            <StopCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="glass-overlay fixed inset-0 z-50 flex items-center justify-center">
          <div className="glass-modal w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/20 sticky top-0 bg-white/30">
              <h3 className="text-sm font-medium text-[var(--text-primary)]">日志详情</h3>
              <button onClick={() => setSelectedLog(null)} className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-[12px]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-[var(--text-muted)]">操作:</span>{' '}
                  <span className="text-[var(--text-primary)]">{selectedLog.operation}</span>
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">状态码:</span>{' '}
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded-[12px] text-xs font-medium ${getStatusClass(selectedLog)}`}>
                    {getStatusText(selectedLog)}
                  </span>
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">耗时:</span>{' '}
                  <span className="text-[var(--text-primary)]">
                    {selectedLog.duration === -1 ? '处理中' : `${selectedLog.duration.toFixed(2)}秒`}
                  </span>
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">时间:</span>{' '}
                  <span className="text-[var(--text-primary)]">{formatDate(selectedLog.created_at)}</span>
                </div>
              </div>

              {/* Response */}
              {selectedLog.response_body && (
                <div>
                  <h4 className="text-xs font-medium text-[var(--text-secondary)] mb-2">响应内容</h4>
                  <pre className="p-3 bg-white/30 backdrop-blur-sm rounded-[12px] text-xs text-[var(--text-primary)] overflow-x-auto whitespace-pre-wrap break-all">
                    {(() => {
                      try {
                        return JSON.stringify(JSON.parse(selectedLog.response_body), null, 2)
                      } catch {
                        return selectedLog.response_body
                      }
                    })()}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
