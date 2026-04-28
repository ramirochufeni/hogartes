import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2, ArrowLeft } from 'lucide-react';
import { AuthLayout } from '../../components/auth/AuthLayout';

export default function OlvidePassword() {
  const { requestPasswordReset } = useAuth();
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Por favor indica tu correo electrónico.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await requestPasswordReset(email);
      setSuccess(true);
    } catch (err: any) {
      // By design we always show success, but fallback just in case
      setError(err.message || 'Error al solicitar recuperación.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Recuperar contraseña" subtitle="Ingresá tu correo asociado a la cuenta.">
      {success ? (
        <div style={{ textAlign: 'center' }}>
          <div style={{ padding: '1.5rem', backgroundColor: '#ecfdf5', borderRadius: '8px', marginBottom: '1.5rem' }}>
            <h3 style={{ color: '#065f46', marginBottom: '0.5rem' }}>Correo enviado</h3>
            <p style={{ color: '#065f46', fontSize: '0.9rem' }}>
              Si existe una cuenta asociada a <strong>{email}</strong>, te hemos enviado un correo con instrucciones.
            </p>
          </div>
          <Link to="/login" className="btn btn-outline flex-center" style={{ width: '100%', textDecoration: 'none', justifyContent: 'center', gap: '0.5rem' }}>
            <ArrowLeft size={18} />
            Volver a inicio de sesión
          </Link>
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
              Correo electrónico
            </label>
            <input
              type="email"
              placeholder="ejemplo@correo.com"
              value={email}
              onChange={e => {
                setEmail(e.target.value);
                setError('');
              }}
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
            {isLoading ? 'Enviando...' : 'Enviar instrucciones'}
          </button>

          <Link to="/login" className="btn-link" style={{ textAlign: 'center', display: 'block', marginTop: '1rem', color: 'var(--color-text-muted)' }}>
            Volver
          </Link>
        </form>
      )}
    </AuthLayout>
  );
}
