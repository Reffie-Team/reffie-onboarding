import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Toast from '@/components/layout/Toast';
import TopBar from '@/components/layout/TopBar';
import Dashboard from '@/pages/Dashboard';
import AccountDetail from '@/pages/AccountDetail';

export default function App() {
  return (
    // Toast wraps everything so useToast() works in any child
    <Toast>
      <div className="min-h-screen bg-page">
        <TopBar />
        <Routes>
          <Route path="/"              element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard"     element={<Dashboard />} />
          <Route path="/accounts/:id"  element={<AccountDetail />} />
          <Route path="*"              element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </Toast>
  );
}
