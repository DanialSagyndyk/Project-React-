import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import TrailsPage from './pages/TrailsPage';
import TrailDetailPage from './pages/TrailDetailPage';
import NewTrailPage from './pages/NewTrailPage';
import NotFoundPage from './pages/NotFoundPage';

// App only defines routes; each page owns its own state.
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<TrailsPage />} />
        <Route path="trails/:id" element={<TrailDetailPage />} />
        <Route path="new" element={<NewTrailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
