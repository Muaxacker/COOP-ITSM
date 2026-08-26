import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './components/AuthProvider';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute, GuestRoute } from './routes/ProtectedRoute';
import { useAuth } from './hooks/useAuth';

// Auth
import { LoginPage } from './pages/auth/LoginPage';

// Customer
import { CustomerDashboard } from './pages/customer/CustomerDashboard';
import { CreateRequestPage } from './pages/customer/CreateRequestPage';
import { MyRequestsPage } from './pages/customer/MyRequestsPage';
import { RequestDetailsPage } from './pages/customer/RequestDetailsPage';

// Officer
import { OfficerDashboard } from './pages/officer/OfficerDashboard';
import { RequestQueuePage } from './pages/officer/RequestQueuePage';
import { CaseManagementPage } from './pages/officer/CaseManagementPage';

// Manager
import { ManagerDashboard } from './pages/manager/ManagerDashboard';
import { AllRequestsPage } from './pages/manager/AllRequestsPage';
import { AttentionPage } from './pages/manager/AttentionPage';

// Admin
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { ServiceRulesPage } from './pages/admin/ServiceRulesPage';

// Shared
import { NotificationsPage } from './pages/NotificationsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

// Smart dashboard redirect based on role
function DashboardRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'CUSTOMER': return <CustomerDashboard />;
    case 'OFFICER':  return <OfficerDashboard />;
    case 'MANAGER':  return <ManagerDashboard />;
    case 'ADMIN':    return <AdminDashboard />;
    default:         return <Navigate to="/login" replace />;
  }
}

// Requests page — officer sees queue, manager/admin see all, customer sees own
function RequestsRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'CUSTOMER': return <MyRequestsPage />;
    case 'OFFICER':  return <RequestQueuePage />;
    case 'MANAGER':
    case 'ADMIN':    return <AllRequestsPage />;
    default:         return <Navigate to="/dashboard" replace />;
  }
}

// Request detail — officer sees CaseManagementPage, others see RequestDetailsPage
function RequestDetailRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'OFFICER':
    case 'MANAGER':
    case 'ADMIN': return <CaseManagementPage />;
    default:      return <RequestDetailsPage />;
  }
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />

      {/* Protected — all authenticated users */}
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />
        <Route path="/requests" element={<ProtectedRoute><RequestsRedirect /></ProtectedRoute>} />
        <Route path="/requests/new" element={<ProtectedRoute allowedRoles={['CUSTOMER']}><CreateRequestPage /></ProtectedRoute>} />
        <Route path="/requests/:id" element={<ProtectedRoute><RequestDetailRedirect /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />

        {/* Manager-only */}
        <Route path="/attention" element={<ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}><AttentionPage /></ProtectedRoute>} />

        {/* Admin-only */}
        <Route path="/users" element={<ProtectedRoute allowedRoles={['ADMIN']}><UserManagementPage /></ProtectedRoute>} />
        <Route path="/service-rules" element={<ProtectedRoute allowedRoles={['ADMIN']}><ServiceRulesPage /></ProtectedRoute>} />
      </Route>

      {/* Default redirects */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: '10px',
                background: '#172B4D',
                color: '#fff',
                fontSize: '13px',
              },
              success: { iconTheme: { primary: '#16A34A', secondary: '#fff' } },
              error: { iconTheme: { primary: '#DC2626', secondary: '#fff' } },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
