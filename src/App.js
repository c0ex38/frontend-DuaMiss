import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Suspense } from 'react';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import ErrorBoundary from './components/ErrorBoundary';
import Toast from './components/Toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { LoadingSpinner } from './components/LoadingComponents';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <div className="transition-colors duration-300">
          <SpeedInsights />
          <Router>
            <Suspense fallback={
              <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-900 flex items-center justify-center">
                <LoadingSpinner size="lg" />
              </div>
            }>
              <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  }
                />
              </Routes>
            </Suspense>
          </Router>
          <Toast />
        </div>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
