import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import FeedPage from './pages/FeedPage';
import ProfilePage from './pages/ProfilePage';
import EssayPage from './pages/EssayPage';
import SearchPage from './pages/SearchPage';
import AlertsPage from './pages/AlertsPage';
import MoviePage from './pages/MoviePage';
import PostPage from './pages/PostPage';
import EditorPage from './pages/EditorPage';
import EditProfilePage from './pages/EditProfilePage';
import FollowPage from './pages/FollowPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<FeedPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/essay/:id" element={<EssayPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/movie/:id" element={<MoviePage />} />
        <Route path="/post/:kind/:id" element={<PostPage />} />
        <Route path="/editor" element={<EditorPage />} />
        <Route path="/edit-profile" element={<EditProfilePage />} />
        <Route path="/follow" element={<FollowPage />} />
      </Route>
    </Routes>
  );
}
