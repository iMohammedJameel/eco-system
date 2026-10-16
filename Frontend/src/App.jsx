import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ui/ProtectedRoute';
import CommandPalette from './components/ui/CommandPalette';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import Dashboard from './pages/Dashboard/Dashboard';
import Machines from './pages/Machines/Machines';
import Users from './pages/Users/Users';
import Transactions from './pages/Transactions/Transactions';
import Pricing from './pages/Pricing/Pricing';
import Partners from './pages/Partners/Partners';
import Leaderboard from './pages/Leaderboard/Leaderboard';
import Achievements from './pages/Achievements/Achievements';
import Notifications from './pages/Notifications/Notifications';
import Issues from './pages/Issues/Issues';
import Reports from './pages/Reports/Reports';
import OpsDashboard from './pages/OpsDashboard/OpsDashboard';
import PartnerPortal from './pages/PartnerPortal/PartnerPortal';
import Coupons from './pages/Coupons/Coupons';
import AuditLogs from './pages/AuditLogs/AuditLogs';
import Deposit from './pages/Deposit/Deposit';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* صفحة الإيداع العامة (PWA) — بدون تسجيل دخول */}
            <Route path="/deposit" element={<Deposit />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/machines"
              element={
                <ProtectedRoute>
                  <Machines />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <Users />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transactions"
              element={
                <ProtectedRoute>
                  <Transactions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pricing"
              element={
                <ProtectedRoute>
                  <Pricing />
                </ProtectedRoute>
              }
            />
            <Route
              path="/partners"
              element={
                <ProtectedRoute>
                  <Partners />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leaderboard"
              element={
                <ProtectedRoute>
                  <Leaderboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/achievements"
              element={
                <ProtectedRoute>
                  <Achievements />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/issues"
              element={
                <ProtectedRoute>
                  <Issues />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ops-dashboard"
              element={
                <ProtectedRoute>
                  <OpsDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/partner-portal"
              element={
                <ProtectedRoute>
                  <PartnerPortal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/coupons"
              element={
                <ProtectedRoute>
                  <Coupons />
                </ProtectedRoute>
              }
            />
            <Route
              path="/audit-logs"
              element={
                <ProtectedRoute roles={['superAdmin']}>
                  <AuditLogs />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          <CommandPalette />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
