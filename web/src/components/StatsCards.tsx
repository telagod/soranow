import { useStatsStore } from '../store'
import { Database, Activity, Image, Video, AlertCircle } from 'lucide-react'

export function StatsCards() {
  const stats = useStatsStore((s) => s.stats)

  const cards = [
    {
      label: 'Token 总数',
      value: stats?.total_tokens ?? '-',
      icon: Database,
      color: 'text-[var(--text-primary)]',
    },
    {
      label: '活跃 Token',
      value: stats?.active_tokens ?? '-',
      icon: Activity,
      color: 'text-green-500',
    },
    {
      label: '图片 (今日/总)',
      value: stats ? `${stats.today_images}/${stats.total_images}` : '-',
      icon: Image,
      color: 'text-blue-500',
    },
    {
      label: '视频 (今日/总)',
      value: stats ? `${stats.today_videos}/${stats.total_videos}` : '-',
      icon: Video,
      color: 'text-purple-500',
    },
    {
      label: '错误 (今日/总)',
      value: stats ? `${stats.today_errors}/${stats.total_errors}` : '-',
      icon: AlertCircle,
      color: 'text-red-500',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {cards.map((card, index) => (
        <div
          key={card.label}
          className="glass-card glass-animate-in"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="flex items-center gap-2 mb-1">
            <card.icon className={`w-4 h-4 ${card.color}`} />
            <span className="text-xs text-[var(--text-muted)]">{card.label}</span>
          </div>
          <div className={`text-lg font-semibold ${card.color}`}>{card.value}</div>
        </div>
      ))}
    </div>
  )
}
