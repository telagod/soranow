export function GeneratePanel() {
  return (
    <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border)] overflow-hidden">
      <iframe
        src="/generate"
        className="w-full border-0"
        style={{ height: '800px' }}
        title="生成面板"
      />
    </div>
  )
}
