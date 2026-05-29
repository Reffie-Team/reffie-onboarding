import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';

import Toast from '@/components/layout/Toast';
import TopBar from '@/components/layout/TopBar';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Dashboard from '@/pages/Dashboard';
import AccountDetail from '@/pages/AccountDetail';
import Login from '@/pages/Login';

// Layout wrapper: TopBar + route outlet. Used by all non-login routes.
function AppLayout() {
  return (
    <div className="min-h-screen bg-page">
      <TopBar />
      <Outlet />
    </div>
  );
}

export default function App() {
  return (
    // Toast wraps everything so useToast() works in any child
    <Toast>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* App shell — TopBar visible on all routes below */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/dashboard"
            element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
          />
          <Route
            path="/accounts/:id"
            element={<ProtectedRoute><AccountDetail /></ProtectedRoute>}
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Toast>
  );
}
