import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import DashboardLayout from '../components/Layouts/DashboardLayout';
import Dashboard from '../pages/Dashboard';
import Files from '../pages/Files';
import Settings from '../pages/Settings';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <DashboardLayout>
        <Route path="/" element={<Dashboard />} />
        <Route path="/files" element={<Files />} />
        <Route path="/settings" element={<Settings />} />
      </DashboardLayout>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;
