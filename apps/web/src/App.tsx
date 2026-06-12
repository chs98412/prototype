import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import AuthCallbackPage from './pages/AuthCallbackPage'
import FeedPage from './pages/FeedPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<FeedPage />} />
      </Route>
    </Routes>
  )
}
