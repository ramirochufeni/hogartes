import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth, type Role } from '../../context/AuthContext';

interface ProtectedRouteProps {
  /** Roles que tienen permitido acceder a esta ruta. */
  allowedRoles: Role[];
  /** Ruta a la que redirigir si no hay sesión (default: '/login'). */
  redirectTo?: string;
  /** Ruta a la que redirigir si hay sesión pero el rol no coincide (default: '/'). */
  unauthorizedRedirectTo?: string;
  children: React.ReactNode;
}

/**
 * ProtectedRoute — Protección de rutas por rol.
 *
 * Comportamiento:
 * - Mientras isLoading: muestra spinner de pantalla completa (no renderiza children).
 * - Sin sesión: redirige a `redirectTo` (default '/login').
 * - Con sesión pero rol incorrecto: redirige a `unauthorizedRedirectTo` (default '/').
 * - Con sesión y rol correcto: renderiza children.
 *
 * Esta es la única barrera de routing del frontend.
 * La autorización real sigue siendo responsabilidad del backend.
 */
export function ProtectedRoute({
  allowedRoles,
  redirectTo = '/login',
  unauthorizedRedirectTo = '/',
  children,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  // Mientras el AuthContext aún valida el token contra el backend, no renderizamos nada.
  // Esto evita cualquier flash de contenido sensible antes de conocer el rol real.
  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: '1rem',
          color: 'var(--color-text-muted)',
        }}
      >
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ fontSize: '0.9rem' }}>Verificando acceso...</p>
      </div>
    );
  }

  // Sin sesión → login
  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Rol incorrecto → raíz (o ruta personalizada)
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={unauthorizedRedirectTo} replace />;
  }

  // Acceso concedido
  return <>{children}</>;
}
