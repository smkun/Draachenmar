import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { CategoryPage } from './pages/CategoryPage';
import { DeitiesPage } from './pages/DeitiesPage';
import { EnhancedDetailPage } from './pages/EnhancedDetailPage';
import { SearchPage } from './pages/SearchPage';
import { AdminPage } from './pages/AdminPage';
import { ChapterPage } from './pages/ChapterPage';
import { ThemeProvider } from './contexts/ThemeContext';

// Legacy redirect component for dynamic routes
function LegacyRedirect({ from, to }: { from: string; to: string }) {
  const params = useParams();
  const redirectPath = Object.keys(params).reduce((path, key) => {
    return path.replace(`:${key}`, params[key] || '');
  }, to);
  return <Navigate to={redirectPath} replace />;
}

function App() {
  return (
    <ThemeProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/chapter/:chapter" element={<ChapterPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/pantheons" element={<DeitiesPage />} />
          {/* Legacy redirects for old URLs */}
          <Route path="/characters" element={<Navigate to="/people" replace />} />
          <Route path="/characters/:id" element={<LegacyRedirect from="/characters/:id" to="/people/:id" />} />
          <Route path="/locations" element={<Navigate to="/places" replace />} />
          <Route path="/locations/:id" element={<LegacyRedirect from="/locations/:id" to="/places/:id" />} />
          <Route path="/deities" element={<Navigate to="/pantheons" replace />} />
          <Route path="/deities/:id" element={<LegacyRedirect from="/deities/:id" to="/pantheons/:id" />} />
          <Route path="/:category" element={<CategoryPage />} />
          <Route path="/:category/:id" element={<EnhancedDetailPage />} />
        </Routes>
      </Layout>
    </ThemeProvider>
  );
}

export default App;