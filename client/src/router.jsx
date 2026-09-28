import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage';
import ComparisonPage from './pages/ComparisonPage';
import ValidationPage from './pages/ValidationPage';
import HistoryPage from './pages/HistoryPage';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/upload" element={<UploadPage />} />
      <Route path="/comparison" element={<ComparisonPage />} />
      <Route path="/validation" element={<ValidationPage />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
