import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { useLanguage } from './context/LanguageContext';
import ProtectedRoute from './components/ui/ProtectedRoute';
import CommandPalette from './components/ui/CommandPalette';
import Spinner from './components/ui/Spinner';
import Login from './pages/Login/Login';

/* ── Code-splitting بالمسارات ──
  كل صفحة تبقى chunk مستقل يُحمّل عند الزيارة فقط.
  قبل كده: bundle واحد ~1MB (recharts + leaflet + 18 صفحة معًا).
  Login يفضل eager لأنه أول شاشة يراها المستخدم. */
const FullPageFallback = () => {
  const { t } = useLanguage();
  return <Spinner size="lg" label={t('common.loading')} fullPage />;
};

const Register = lazy(() => import('./pages/Register/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword/ForgotPassword'));
const UserLogin = lazy(() => import('./pages/UserLogin/UserLogin'));
const PartnerLogin = lazy(() => import('./pages/PartnerLogin/PartnerLogin'));
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const Machines = lazy(() => import('./pages/Machines/Machines'));
const Users = lazy(() => import('./pages/Users/Users'));
const Transactions = lazy(() => import('./pages/Transactions/Transactions'));
const Pricing = lazy(() => import('./pages/Pricing/Pricing'));
const Partners = lazy(() => import('./pages/Partners/Partners'));
const Leaderboard = lazy(() => import('./pages/Leaderboard/Leaderboard'));
const Achievements = lazy(() => import('./pages/Achievements/Achievements'));
const Notifications = lazy(() => import('./pages/Notifications/Notifications'));
const Issues = lazy(() => import('./pages/Issues/Issues'));
const Reports = lazy(() => import('./pages/Reports/Reports'));
const OpsDashboard = lazy(() => import('./pages/OpsDashboard/OpsDashboard'));
const PartnerPortal = lazy(() => import('./pages/PartnerPortal/PartnerPortal'));
const Coupons = lazy(() => import('./pages/Coupons/Coupons'));
const AuditLogs = lazy(() => import('./pages/AuditLogs/AuditLogs'));
const Deposit = lazy(() => import('./pages/Deposit/Deposit'));

/* ── بوابة المواطن ── */
const MyWallet = lazy(() => import('./pages/Citizen/MyWallet'));
const MyHistory = lazy(() => import('./pages/Citizen/MyHistory'));
const MyCoupons = lazy(() => import('./pages/Citizen/MyCoupons'));
const MyProfile = lazy(() => import('./pages/Citizen/MyProfile'));

/* ── 404 ── */
const NotFound = lazy(() => import('./pages/NotFound/NotFound'));

/** الصفحة الرئيسية توجه كل دور لبوابته */
function HomeRedirect() {
  const { role } = useAuth();
  if (role === 'user') return <Navigate to="/my-wallet" replace />;
  if (role === 'partner') return <Navigate to="/partner-portal" replace />;
  return <Navigate to="/dashboard" replace />;
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Suspense fallback={<FullPageFallback />}>
            <Routes>
                  <Route path="/" element={<HomeRedirect />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />

                  {/* دخول المواطن — بوابة المواطن */}
                  <Route path="/user-login" element={<UserLogin />} />
                  {/* دخول الشريك — بوابة الشركاء */}
                  <Route path="/partner-login" element={<PartnerLogin />} />

                  {/* صفحة الإيداع العامة (PWA) — بدون تسجيل دخول */}
                  <Route path="/deposit" element={<Deposit />} />

                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute roles={['superAdmin', 'operationsManager']}>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/machines"
                    element={
                      <ProtectedRoute roles={['superAdmin', 'operationsManager']}>
                        <Machines />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/users"
                    element={
                      <ProtectedRoute roles={['superAdmin', 'operationsManager']}>
                        <Users />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/transactions"
                    element={
                      <ProtectedRoute roles={['superAdmin', 'operationsManager']}>
                        <Transactions />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/pricing"
                    element={
                      <ProtectedRoute roles={['superAdmin', 'operationsManager']}>
                        <Pricing />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/partners"
                    element={
                      <ProtectedRoute roles={['superAdmin', 'operationsManager']}>
                        <Partners />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/leaderboard"
                    element={
                      <ProtectedRoute roles={['superAdmin', 'operationsManager']}>
                        <Leaderboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/achievements"
                    element={
                      <ProtectedRoute roles={['superAdmin', 'operationsManager']}>
                        <Achievements />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/notifications"
                    element={
                      <ProtectedRoute roles={['superAdmin', 'operationsManager']}>
                        <Notifications />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/issues"
                    element={
                      <ProtectedRoute roles={['superAdmin', 'operationsManager']}>
                        <Issues />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/reports"
                    element={
                      <ProtectedRoute roles={['superAdmin', 'operationsManager']}>
                        <Reports />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/ops-dashboard"
                    element={
                      <ProtectedRoute roles={['superAdmin', 'operationsManager']}>
                        <OpsDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/partner-portal"
                    element={
                      <ProtectedRoute roles={['superAdmin', 'operationsManager', 'partner']}>
                        <PartnerPortal />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/coupons"
                    element={
                      <ProtectedRoute roles={['superAdmin', 'operationsManager']}>
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

                  {/* ═══ بوابة المواطن — role=user ═══ */}
                  <Route
                    path="/my-wallet"
                    element={
                      <ProtectedRoute roles={['user']}>
                        <MyWallet />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/my-history"
                    element={
                      <ProtectedRoute roles={['user']}>
                        <MyHistory />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/my-coupons"
                    element={
                      <ProtectedRoute roles={['user']}>
                        <MyCoupons />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/my-profile"
                    element={
                      <ProtectedRoute roles={['user']}>
                        <MyProfile />
                      </ProtectedRoute>
                    }
                  />

                  {/* 404 — أي مسار غير معروف */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
              <CommandPalette />
            </BrowserRouter>
          </ToastProvider>
        </AuthProvider>
  );
}

export default App;
