import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthLayout } from '../components/auth/AuthLayout';
import { LoginForm } from '../components/auth/LoginForm';
import { RegisterForm } from '../components/auth/RegisterForm';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isRegister, setIsRegister] = useState(false);
  const [sharedEmail, setSharedEmail] = useState('');

  const handleSuccess = () => {
    const from = location.state?.from || '/';
    navigate(from, { replace: true });
  };

  return (
    <AuthLayout 
      title={isRegister ? 'Crear tu cuenta' : 'Te damos la bienvenida'} 
      subtitle={isRegister ? 'Únicate a HogArtes hoy mismo.' : 'Iniciá sesión para continuar.'}
    >
      <div 
        style={{ 
          animation: 'fadeIn 0.3s ease-in-out' 
        }}
        key={isRegister ? 'register' : 'login'}
      >
        {isRegister ? (
          <RegisterForm 
            onSwitchMode={() => setIsRegister(false)} 
            sharedEmail={sharedEmail}
            setSharedEmail={setSharedEmail}
          />
        ) : (
          <LoginForm 
            onSwitchMode={() => setIsRegister(true)} 
            onSuccess={handleSuccess} 
            sharedEmail={sharedEmail}
            setSharedEmail={setSharedEmail}
          />
        )}
      </div>
    </AuthLayout>
  );
}
