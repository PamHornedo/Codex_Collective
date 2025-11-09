import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useBooksStore } from './store/books';
import { useUserStore } from './store/user';
import { useFeedStore } from './store/feed';

import {
  LoginPage,
  DashboardPage,
  BrowsePage,
  MyBooksPage,
  BookDetailsPage,
  FeedPage,
} from './pages';

function App() {
  // Initialize all stores on app mount (proper React way - prevents infinite loops)
  useEffect(() => {
    useUserStore.getState().loadUser();
    useBooksStore.getState().loadBooks();
    useFeedStore.getState().loadFeed();
  }, []);

  // Use basename only in production for GitHub Pages
  const basename = import.meta.env.PROD ? '/Codex_Collective' : '/';

  return (
    <ErrorBoundary>
      <BrowserRouter basename={basename}>
      <Routes>
        {/* Public route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <DashboardPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/browse"
          element={
            <ProtectedRoute>
              <Layout>
                <BrowsePage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-books"
          element={
            <ProtectedRoute>
              <Layout>
                <MyBooksPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/book/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <BookDetailsPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/feed"
          element={
            <ProtectedRoute>
              <Layout>
                <FeedPage />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App

