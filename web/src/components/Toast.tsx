import { useToastStore } from '../store'

export function Toast() {
  const { toasts, removeToast } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          onClick={() => removeToast(toast.id)}
          className="toast-enter px-4 py-2.5 rounded-[12px] text-sm font-medium cursor-pointer text-white"
          style={{
            background: toast.type === 'success' ? 'rgba(22, 163, 74, 0.75)' : 
                       toast.type === 'error' ? 'rgba(220, 38, 38, 0.75)' : 
                       'rgba(37, 99, 235, 0.75)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
          }}
        >
          {toast.message}
        </div>
      ))}
    </div>
  )
}

export function useToast() {
  const addToast = useToastStore((s) => s.addToast)
  return {
    success: (msg: string) => addToast(msg, 'success'),
    error: (msg: string) => addToast(msg, 'error'),
    info: (msg: string) => addToast(msg, 'info'),
  }
}
