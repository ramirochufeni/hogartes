import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Explorer from './pages/Explorer';
import ProviderProfile from './pages/ProviderProfile';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import PublishService from './pages/PublishService';
import ProviderPanel from './pages/ProviderPanel';
import ProviderOnboarding from './pages/ProviderOnboarding';
import AdminPanel from './pages/AdminPanel';
import Messages from './pages/Messages';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Plans from './pages/Plans';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';

// Auth Pages
import VerifyEmail from './pages/auth/VerifyEmail';
import OlvidePassword from './pages/auth/OlvidePassword';
import ResetPassword from './pages/auth/ResetPassword';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            {/* ─── Rutas públicas ─────────────────────────────── */}
            <Route path="/" element={<Home />} />
            <Route path="/explorar" element={<Explorer />} />
            <Route path="/servicio/:id" element={<ProviderProfile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/verificar-cuenta" element={<VerifyEmail />} />
            <Route path="/olvide-mi-contrasena" element={<OlvidePassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/terminos" element={<Terms />} />
            <Route path="/privacidad" element={<Privacy />} />
            <Route path="/noticias" element={<News />} />
            <Route path="/noticias/:id" element={<NewsDetail />} />

            {/* ─── Rutas para usuarios autenticados (CLIENT+) ─── */}
            <Route path="/mensajes" element={<Messages />} />

            {/* ─── Rutas solo PROVIDER ────────────────────────── */}
            <Route
              path="/planes"
              element={
                <ProtectedRoute allowedRoles={['PROVIDER', 'ADMIN']}>
                  <Plans />
                </ProtectedRoute>
              }
            />
            <Route
              path="/publicar"
              element={
                <ProtectedRoute allowedRoles={['PROVIDER', 'ADMIN']}>
                  <PublishService />
                </ProtectedRoute>
              }
            />
            <Route
              path="/registro-proveedor"
              element={
                <ProtectedRoute allowedRoles={['CLIENT', 'PROVIDER', 'ADMIN']}>
                  <ProviderOnboarding />
                </ProtectedRoute>
              }
            />
            <Route
              path="/panel-prestador/*"
              element={
                <ProtectedRoute allowedRoles={['PROVIDER', 'ADMIN']}>
                  <ProviderPanel />
                </ProtectedRoute>
              }
            />

            {/* ─── Rutas solo ADMIN ───────────────────────────── */}
            <Route
              path="/panel-admin/*"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']} unauthorizedRedirectTo="/">
                  <AdminPanel />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
