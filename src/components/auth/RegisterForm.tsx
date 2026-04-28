import React, { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

interface RegisterFormProps {
  onSwitchMode: () => void;
  sharedEmail: string;
  setSharedEmail: (email: string) => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchMode, sharedEmail, setSharedEmail }) => {
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; confirmPassword?: string; terms?: string; general?: string }>({});
  
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  const [successMessage, setSuccessMessage] = useState('');

  const validate = () => {
    const newErrors: any = {};
    if (!name.trim()) newErrors.name = 'El nombre es requerido';
    
    if (!sharedEmail) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/\S+@\S+\.\S+/.test(sharedEmail)) {
      newErrors.email = 'El formato del correo es inválido';
    }
    
    if (!password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (!acceptedTerms) {
      newErrors.terms = 'Debés aceptar los términos para continuar';
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
      await register({ name, email: sharedEmail, password });
      setSuccessMessage('¡Cuenta creada correctamente! Te enviamos un correo con un enlace para verificar tu cuenta. Revisá tu bandeja de entrada (y la de spam por las dudas).');
    } catch (err: any) {
      setErrors({ general: err.message || 'Ocurrió un error al crear la cuenta.' });
      setIsLoading(false);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
    if (errors.general) setErrors(prev => ({ ...prev, general: undefined }));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSharedEmail(e.target.value);
    if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
    if (errors.general) setErrors(prev => ({ ...prev, general: undefined }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
    if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: undefined }));
    if (errors.general) setErrors(prev => ({ ...prev, general: undefined }));
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: undefined }));
    if (errors.general) setErrors(prev => ({ ...prev, general: undefined }));
  };

  const handleTermsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAcceptedTerms(e.target.checked);
    if (errors.terms) setErrors(prev => ({ ...prev, terms: undefined }));
    if (errors.general) setErrors(prev => ({ ...prev, general: undefined }));
  };

  const handleGoogleAuth = async (credentialResponse: any) => {
    if (credentialResponse.credential) {
      setIsLoading(true);
      setErrors({});
      try {
        await loginWithGoogle(credentialResponse.credential);
        navigate('/');
      } catch (err: any) {
        setErrors({ general: err.message || 'Error al autenticar o registrar con Google.' });
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
          text="signup_with"
          logo_alignment="center"
          width="100%"
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0' }}>
        <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }}></div>
        <span style={{ padding: '0 1rem', color: 'var(--color-text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>o creá tu cuenta con email</span>
        <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }}></div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {successMessage && (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div style={{ padding: '1.5rem', backgroundColor: '#ecfdf5', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <h3 style={{ color: '#065f46', marginBottom: '0.5rem', fontSize: '1.2rem' }}>¡Verificá tu correo!</h3>
              <p style={{ color: '#065f46', fontSize: '1rem', lineHeight: 1.5 }}>
                {successMessage}
              </p>
            </div>
            <button 
              type="button" 
              onClick={onSwitchMode}
              className="btn btn-primary" 
              style={{ width: '100%', padding: '0.875rem' }}
            >
              Ir a Iniciar sesión
            </button>
          </div>
        )}
        
        {!successMessage && (
          <>
            {errors.general && (
              <div style={{ padding: '0.875rem', backgroundColor: '#fef2f2', color: '#b91c1c', border: '1px solid #fca5a5', borderRadius: '8px', fontSize: '0.875rem', textAlign: 'center' }}>
                {errors.general}
              </div>
            )}

        <div>
          <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-primary)' }}>
            Nombre completo
          </label>
          <input
            ref={nameRef}
            type="text"
            placeholder="Ej. Juan Pérez"
            value={name}
            onChange={handleNameChange}
            disabled={isLoading}
            style={{ 
              width: '100%', padding: '0.875rem 1rem', borderRadius: '8px', 
              border: `1px solid ${errors.name ? '#ef4444' : 'var(--color-border)'}`,
              fontSize: '1rem', outline: 'none', transition: 'all 0.2s', backgroundColor: isLoading ? '#f3f4f6' : 'white', boxShadow: errors.name ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : 'none'
            }}
          />
          {errors.name && <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', fontWeight: 500 }}>{errors.name}</div>}
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-primary)' }}>
            Correo electrónico
          </label>
          <input
            type="email"
            placeholder="ejemplo@correo.com"
            value={sharedEmail}
            onChange={handleEmailChange}
            disabled={isLoading}
            style={{ 
              width: '100%', padding: '0.875rem 1rem', borderRadius: '8px', 
              border: `1px solid ${errors.email ? '#ef4444' : 'var(--color-border)'}`,
              fontSize: '1rem', outline: 'none', transition: 'all 0.2s', backgroundColor: isLoading ? '#f3f4f6' : 'white', boxShadow: errors.email ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : 'none'
            }}
          />
          {errors.email && <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', fontWeight: 500 }}>{errors.email}</div>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-primary)' }}>
              Contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="6+ caracteres"
                value={password}
                onChange={handlePasswordChange}
                disabled={isLoading}
                style={{ 
                  width: '100%', padding: '0.875rem 2.8rem 0.875rem 1rem', borderRadius: '8px', 
                  border: `1px solid ${errors.password ? '#ef4444' : 'var(--color-border)'}`,
                  fontSize: '1rem', outline: 'none', transition: 'all 0.2s', backgroundColor: isLoading ? '#f3f4f6' : 'white', boxShadow: errors.password ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : 'none'
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
            {errors.password && <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', fontWeight: 500, lineHeight: 1.2 }}>{errors.password}</div>}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-primary)' }}>
              Confirmar
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Confirmar"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              disabled={isLoading}
              style={{ 
                width: '100%', padding: '0.875rem 1rem', borderRadius: '8px', 
                border: `1px solid ${errors.confirmPassword ? '#ef4444' : 'var(--color-border)'}`,
                fontSize: '1rem', outline: 'none', transition: 'all 0.2s', backgroundColor: isLoading ? '#f3f4f6' : 'white', boxShadow: errors.confirmPassword ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : 'none'
              }}
            />
            {errors.confirmPassword && <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', fontWeight: 500, lineHeight: 1.2 }}>{errors.confirmPassword}</div>}
          </div>
        </div>

        <div style={{ marginTop: '0.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: isLoading ? 'default' : 'pointer' }}>
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={handleTermsChange}
              disabled={isLoading}
              style={{ marginTop: '3px', accentColor: 'var(--color-primary)', width: '16px', height: '16px', cursor: isLoading ? 'default' : 'pointer' }}
            />
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
              Acepto los <Link to="/terminos" target="_blank" className="link" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Términos y Condiciones</Link> y la <Link to="/privacidad" target="_blank" className="link" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Política de Privacidad</Link>
            </span>
          </label>
          {errors.terms && <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', fontWeight: 500, marginLeft: '1.5rem' }}>{errors.terms}</div>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-secondary flex-center"
          style={{ width: '100%', padding: '0.875rem', fontSize: '1.05rem', marginTop: '0.5rem', borderRadius: '8px', justifyContent: 'center', gap: '0.5rem' }}
        >
          {isLoading && <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />}
          {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>
          </>
        )}
      </form>

      {!successMessage && (
        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>
          ¿Ya tenés cuenta?{' '}
          <button 
            type="button" 
            onClick={onSwitchMode}
            disabled={isLoading}
            className="btn-link" 
            style={{ fontWeight: 600, color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', padding: 0 }}
          >
            Iniciá sesión
          </button>
        </div>
      )}
    </div>
  );
};
