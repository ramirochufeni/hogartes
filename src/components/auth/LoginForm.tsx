import React, { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

interface LoginFormProps {
  onSwitchMode: () => void;
  onSuccess: () => void;
  sharedEmail: string;
  setSharedEmail: (email: string) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchMode, onSuccess, sharedEmail, setSharedEmail }) => {
  const { login, loginWithGoogle, resendVerification } = useAuth();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const validate = () => {
    const newErrors: any = {};
    if (!sharedEmail) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/\S+@\S+\.\S+/.test(sharedEmail)) {
      newErrors.email = 'El formato del correo es inválido';
    }
    
    if (!password) {
      newErrors.password = 'La contraseña es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsLoading(true);
    setErrors({});
    try {
      await login({ email: sharedEmail, password });
      onSuccess();
    } catch (err: any) {
      if (err.message === 'unverified_email') {
        setUnverifiedEmail(true);
        setErrors({ general: 'Tu cuenta no está verificada. Revisá tu correo electrónico para activarla.' });
      } else {
        setErrors({ general: err.message || 'Ocurrió un error. Verificá tus credenciales.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setResendSuccess('');
    setErrors({});
    try {
      await resendVerification(sharedEmail);
      setResendSuccess('¡Te enviamos un nuevo enlace a tu correo!');
    } catch (err: any) {
      setErrors({ general: err.message || 'Error al reenviar el correo.' });
    } finally {
      setIsResending(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSharedEmail(e.target.value);
    setUnverifiedEmail(false);
    setResendSuccess('');
    if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
    if (errors.general) setErrors(prev => ({ ...prev, general: undefined }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setUnverifiedEmail(false);
    setResendSuccess('');
    if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
    if (errors.general) setErrors(prev => ({ ...prev, general: undefined }));
  };

  const handleGoogleAuth = async (credentialResponse: any) => {
    if (credentialResponse.credential) {
      setIsLoading(true);
      setErrors({});
      try {
        await loginWithGoogle(credentialResponse.credential);
        onSuccess();
      } catch (err: any) {
        setErrors({ general: err.message || 'Error al autenticar con Google.' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGoogleError = () => {
    setErrors({ general: 'La conexión con Google fue cancelada o falló.' });
  };

  return (
    <div>
      <div style={{ width: '100%', pointerEvents: isLoading ? 'none' : 'auto', opacity: isLoading ? 0.7 : 1 }}>
        <GoogleLogin
          onSuccess={handleGoogleAuth}
          onError={handleGoogleError}
          theme="outline"
          size="large"
          text="signin_with"
          logo_alignment="center"
          width="100%"
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0' }}>
        <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }}></div>
        <span style={{ padding: '0 1rem', color: 'var(--color-text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>o ingresá con tu email</span>
        <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }}></div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {resendSuccess && (
          <div style={{ padding: '0.875rem', backgroundColor: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', borderRadius: '8px', fontSize: '0.875rem', textAlign: 'center' }}>
            {resendSuccess}
          </div>
        )}

        {errors.general && (
          <div style={{ padding: '0.875rem', backgroundColor: '#fef2f2', color: '#b91c1c', border: '1px solid #fca5a5', borderRadius: '8px', fontSize: '0.875rem', textAlign: 'center' }}>
            {errors.general}
            {unverifiedEmail && (
              <div style={{ marginTop: '0.75rem' }}>
                <button 
                  type="button" 
                  onClick={handleResend}
                  disabled={isResending}
                  className="btn btn-primary btn-sm flex-center" 
                  style={{ width: '100%', padding: '0.75rem', fontSize: '0.9rem', justifyContent: 'center', gap: '0.5rem' }}
                >
                  {isResending && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
                  {isResending ? 'Reenviando...' : 'Reenviar enlace de verificación'}
                </button>
              </div>
            )}
          </div>
        )}

        <div>
          <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-primary)' }}>
            Correo electrónico
          </label>
          <input
            ref={emailRef}
            type="email"
            placeholder="ejemplo@correo.com"
            value={sharedEmail}
            onChange={handleEmailChange}
            disabled={isLoading}
            style={{ 
              width: '100%', 
              padding: '0.875rem 1rem', 
              borderRadius: '8px', 
              border: `1px solid ${errors.email ? '#ef4444' : 'var(--color-border)'}`,
              fontSize: '1rem',
              outline: 'none',
              transition: 'all 0.2s',
              backgroundColor: isLoading ? '#f3f4f6' : 'white',
              boxShadow: errors.email ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : 'none'
            }}
          />
          {errors.email && <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', fontWeight: 500 }}>{errors.email}</div>}
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-primary)' }}>
            Contraseña
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Ingresá tu contraseña"
              value={password}
              onChange={handlePasswordChange}
              disabled={isLoading}
              style={{ 
                width: '100%', 
                padding: '0.875rem 3rem 0.875rem 1rem', 
                borderRadius: '8px', 
                border: `1px solid ${errors.password ? '#ef4444' : 'var(--color-border)'}`,
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.2s',
                backgroundColor: isLoading ? '#f3f4f6' : 'white',
                boxShadow: errors.password ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : 'none'
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: isLoading ? 'default' : 'pointer',
                color: 'var(--color-text-muted)',
                display: 'flex',
                alignItems: 'center',
                padding: '0.25rem',
              }}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', fontWeight: 500 }}>{errors.password}</div>}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-0.5rem' }}>
          <Link 
            to="/olvide-mi-contrasena"
            className="btn-link" 
            style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'none' }}
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary flex-center"
          style={{ width: '100%', padding: '0.875rem', fontSize: '1.05rem', marginTop: '0.5rem', borderRadius: '8px', justifyContent: 'center', gap: '0.5rem' }}
        >
          {isLoading && <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />}
          {isLoading ? 'Iniciando...' : 'Iniciar sesión'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <button type="button" className="btn-link" style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '0.85rem' }}>
          ¿No podés acceder a tu cuenta?
        </button>
        <div>
          ¿No tenés cuenta?{' '}
          <button 
            type="button" 
            onClick={onSwitchMode}
            disabled={isLoading}
            className="btn-link" 
            style={{ fontWeight: 600, color: 'var(--color-secondary)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', padding: 0 }}
          >
            Registrate
          </button>
        </div>
      </div>
    </div>
  );
};
