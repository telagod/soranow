import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from './pages/Login'
import { ManagePage } from './pages/Manage'
import { Toast } from './components/Toast'
import { useAuthStore } from './store'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/manage"
          element={
            <PrivateRoute>
              <ManagePage />
            </PrivateRoute>
          }
        />
        <Route path="/" element={<Navigate to="/manage" replace />} />
        <Route path="*" element={<Navigate to="/manage" replace />} />
      </Routes>
      <Toast />
    </BrowserRouter>
  )
}

export default App
