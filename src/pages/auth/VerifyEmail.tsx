import { useEffect, useRef, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { AuthLayout } from '../../components/auth/AuthLayout';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { verifyEmail } = useAuth();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  // Guard: asegura que la llamada a la API ocurra una sola vez,
  // incluso bajo React StrictMode (que monta el componente dos veces en dev).
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return; // segunda pasada de StrictMode → ignorar
    hasRun.current = true;

    if (!token) {
      setStatus('error');
      setErrorMessage('Enlace inválido o incompleto.');
      return;
    }

    let isMounted = true; // evita actualizar estado si el componente se desmontó

    const processVerification = async () => {
      try {
        await verifyEmail(token);
        if (isMounted) setStatus('success');
      } catch (err: any) {
        // Solo mostramos error si la verificación NO fue exitosa previamente.
        if (isMounted) {
          setStatus((prev) => {
            if (prev === 'success') return 'success'; // no sobreescribir un éxito
            setErrorMessage(err.message || 'El enlace es inválido o ha expirado.');
            return 'error';
          });
        }
      }
    };

    processVerification();

    return () => {
      isMounted = false;
    };
  }, [token, verifyEmail]);

  return (
    <AuthLayout title="Verificación de cuenta" subtitle="Activando tu perfil de HogArtes">
      <div style={{ textAlign: 'center', padding: '1rem 0' }}>
        {status === 'loading' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <Loader2 size={48} color="var(--color-primary)" style={{ animation: 'spin 1s linear infinite' }} />
            <p>Verificando tu cuenta, por favor esperá...</p>
          </div>
        )}

        {status === 'success' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <CheckCircle size={56} color="#10b981" />
            <h2 className="text-h3" style={{ color: '#10b981' }}>Cuenta verificada correctamente</h2>
            <p className="text-muted" style={{ marginBottom: '1.5rem' }}>Ya podés iniciar sesión normalmente.</p>
            <Link to="/login" className="btn btn-primary" style={{ width: '100%', textDecoration: 'none' }}>
              Ir a Iniciar Sesión
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <XCircle size={56} color="#ef4444" />
            <h2 className="text-h3" style={{ color: '#ef4444' }}>Verificación fallida</h2>
            <p className="text-muted" style={{ marginBottom: '1.5rem' }}>{errorMessage}</p>
            <Link to="/login" className="btn btn-outline" style={{ width: '100%', textDecoration: 'none' }}>
              Volver al Login
            </Link>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}
