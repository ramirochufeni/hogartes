import { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';
import { AuthLayout } from '../../components/auth/AuthLayout';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Falta el token de seguridad. Accedé desde el enlace de tu correo.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword({ token, newPassword: password });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'El enlace es inválido o ha expirado.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthLayout title="Enlace inválido" subtitle="Falta el código de seguridad.">
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <p className="text-muted" style={{ marginBottom: '1.5rem' }}>No podés cambiar tu contraseña sin un enlace válido.</p>
          <Link to="/olvide-mi-contrasena" className="btn btn-primary" style={{ textDecoration: 'none' }}>
            Solicitar nuevo enlace
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Restablecer contraseña" subtitle="Ingresá una contraseña nueva y segura.">
      {success ? (
        <div style={{ textAlign: 'center', padding: '1rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <CheckCircle size={56} color="#10b981" />
          <h2 className="text-h3" style={{ color: '#10b981' }}>¡Contraseña actualizada!</h2>
          <p className="text-muted">Redirigiendo al inicio de sesión...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {error && (
            <div style={{ padding: '0.875rem', backgroundColor: '#fef2f2', color: '#b91c1c', border: '1px solid #fca5a5', borderRadius: '8px', fontSize: '0.875rem', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-primary)' }}>
              Nueva contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="6+ caracteres"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                disabled={isLoading}
                style={{ 
                  width: '100%', padding: '0.875rem 2.8rem 0.875rem 1rem', borderRadius: '8px', 
                  border: `1px solid var(--color-border)`,
                  fontSize: '1rem', outline: 'none', transition: 'all 0.2s', backgroundColor: isLoading ? '#f3f4f6' : 'white'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                style={{
                  position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: isLoading ? 'default' : 'pointer', color: 'var(--color-text-muted)',
                  display: 'flex', alignItems: 'center', padding: '0.25rem'
                }}
                aria-label={showPassword ? 'Ocultar' : 'Mostrar'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-primary)' }}>
              Confirmar contraseña
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Confirmar"
              value={confirmPassword}
              onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
              disabled={isLoading}
              style={{ 
                width: '100%', padding: '0.875rem 1rem', borderRadius: '8px', 
                border: `1px solid var(--color-border)`,
                fontSize: '1rem', outline: 'none', transition: 'all 0.2s', backgroundColor: isLoading ? '#f3f4f6' : 'white'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary flex-center"
            style={{ width: '100%', padding: '0.875rem', fontSize: '1.05rem', marginTop: '0.5rem', borderRadius: '8px', justifyContent: 'center', gap: '0.5rem' }}
          >
            {isLoading && <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />}
            {isLoading ? 'Guardando...' : 'Cambiar contraseña'}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
