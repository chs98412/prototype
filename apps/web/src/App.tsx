import { Routes, Route } from 'react-router-dom'
import FeedPage from './pages/FeedPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<FeedPage />} />
    </Routes>
  )
}
