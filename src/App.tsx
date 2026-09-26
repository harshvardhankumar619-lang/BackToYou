import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import CampusFindDock from '@/components/navigation/CampusFindDock';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminRoute from '@/components/AdminRoute';
import LandingPage from '@/pages/LandingPage';
import AuthPage from '@/pages/AuthPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import Dashboard from '@/pages/Dashboard';
import ItemListPage from '@/pages/ItemListPage';
import ItemDetailPage from '@/pages/ItemDetailPage';
import ReportItemPage from '@/pages/ReportItemPage';
import ProfilePage from '@/pages/ProfilePage';
import MyReportsPage from '@/pages/MyReportsPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1 pb-24">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<AuthPage initialTab="login" />} />
              <Route path="/register" element={<AuthPage initialTab="register" />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route
                path="/dashboard"
                element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
              />
              <Route
                path="/browse"
                element={<ProtectedRoute><ItemListPage /></ProtectedRoute>}
              />
              <Route
                path="/lost-items"
                element={<ProtectedRoute><ItemListPage initialType="lost" /></ProtectedRoute>}
              />
              <Route
                path="/found-items"
                element={<ProtectedRoute><ItemListPage initialType="found" /></ProtectedRoute>}
              />
              <Route
                path="/item/:type/:id"
                element={<ProtectedRoute><ItemDetailPage /></ProtectedRoute>}
              />
              <Route
                path="/report/lost"
                element={<ProtectedRoute><ReportItemPage type="lost" /></ProtectedRoute>}
              />
              <Route
                path="/report/found"
                element={<ProtectedRoute><ReportItemPage type="found" /></ProtectedRoute>}
              />
              <Route
                path="/profile"
                element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}
              />
              <Route
                path="/my-reports"
                element={<ProtectedRoute><MyReportsPage /></ProtectedRoute>}
              />
              <Route
                path="/admin/*"
                element={<AdminRoute><div className="min-h-screen flex items-center justify-center bg-slate-50"><p className="text-slate-400">Admin panel coming soon.</p></div></AdminRoute>}
              />
            </Routes>
          </main>
          <footer className="bg-slate-800 text-slate-400 py-6 text-center text-sm">
            <p>BackToYou — Lost &amp; Found for CMRIT Students</p>
          </footer>
          <CampusFindDock />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
