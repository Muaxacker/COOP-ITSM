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

// Branch User
import { BranchDashboard } from './pages/branch/BranchDashboard';
import { CreateIncidentPage } from './pages/branch/CreateIncidentPage';
import { MyIncidentsPage } from './pages/branch/MyIncidentsPage';
import { BranchIncidentDetailsPage } from './pages/branch/BranchIncidentDetailsPage';
import { PrintableWorkOrderPage } from './pages/branch/PrintableWorkOrderPage';

// IT Supervisor
import { SupervisorDashboard } from './pages/supervisor/SupervisorDashboard';
import { AllIncidentsPage } from './pages/supervisor/AllIncidentsPage';
import { SupervisorReportsPage } from './pages/supervisor/SupervisorReportsPage';

// IT Technician
import { TechnicianDashboard } from './pages/technician/TechnicianDashboard';
import { TechnicianIncidentPage } from './pages/technician/TechnicianIncidentPage';

// System Admin
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { BranchManagementPage } from './pages/admin/BranchManagementPage';
import { DivisionCategoryPage } from './pages/admin/DivisionCategoryPage';
import { AuditLogPage } from './pages/admin/AuditLogPage';

// Shared
import { NotificationsPage } from './pages/NotificationsPage';
import { ProfilePage } from './pages/ProfilePage';

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
    case 'BRANCH_USER':
      return <BranchDashboard />;
    case 'IT_SUPERVISOR':
      return <SupervisorDashboard />;
    case 'TECHNICIAN':
      return <TechnicianDashboard />;
    case 'ADMIN':
      return <AdminDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
}

// Incidents list redirect based on role
function IncidentsRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'BRANCH_USER':
      return <MyIncidentsPage />;
    case 'TECHNICIAN':
      return <TechnicianDashboard />;
    case 'IT_SUPERVISOR':
    case 'ADMIN':
      return <AllIncidentsPage />;
    default:
      return <Navigate to="/dashboard" replace />;
  }
}

// Incident detail router: Technician workbench vs Branch/Supervisor view
function IncidentDetailRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'TECHNICIAN') {
    return <TechnicianIncidentPage />;
  }
  return <BranchIncidentDetailsPage />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route
        path="/login"
        element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        }
      />

      {/* Protected Layout */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardRedirect />
            </ProtectedRoute>
          }
        />
        <Route
          path="/incidents"
          element={
            <ProtectedRoute>
              <IncidentsRedirect />
            </ProtectedRoute>
          }
        />
        <Route
          path="/incidents/new"
          element={
            <ProtectedRoute allowedRoles={['BRANCH_USER', 'ADMIN']}>
              <CreateIncidentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/incidents/:id"
          element={
            <ProtectedRoute>
              <IncidentDetailRedirect />
            </ProtectedRoute>
          }
        />

        {/* Operational Analytics (Supervisor & Admin) */}
        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={['IT_SUPERVISOR', 'ADMIN']}>
              <SupervisorReportsPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Management */}
        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <UserManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/branches"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <BranchManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/divisions"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DivisionCategoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/audit-logs"
          element={
            <ProtectedRoute allowedRoles={['IT_SUPERVISOR', 'ADMIN']}>
              <AuditLogPage />
            </ProtectedRoute>
          }
        />

        {/* User Profile & Security */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Notifications (All Roles) */}
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Standalone Printable Official Banking Work Order */}
      <Route
        path="/incidents/:id/print"
        element={
          <ProtectedRoute>
            <PrintableWorkOrderPage />
          </ProtectedRoute>
        }
      />

      {/* Fallback Redirects */}
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
                background: '#0b2545',
                color: '#fff',
                borderRadius: '8px',
                fontSize: '13px',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
