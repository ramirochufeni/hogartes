import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck } from 'lucide-react';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { adminLogin } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await adminLogin({ email, password });
      navigate('/panel-admin');
    } catch (err: any) {
      setError(err.message || 'Error de autenticación.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '2.5rem', backgroundColor: '#1e293b', border: '1px solid #334155', color: 'white', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <div style={{ backgroundColor: 'var(--color-primary)', width: '50px', height: '50px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={28} color="white" />
          </div>
        </div>
        
        <h1 style={{ textAlign: 'center', color: 'white', marginBottom: '0.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
          Acceso Administrativo
        </h1>
        <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '2rem', fontSize: '0.9rem' }}>
          Portal exclusivo para gestión de HogArtes
        </p>

        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input 
            type="email" 
            placeholder="Correo corporativo" 
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid #334155', backgroundColor: '#0f172a', color: 'white', outline: 'none' }} 
          />
          <input 
            type="password" 
            placeholder="Clave de acceso" 
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid #334155', backgroundColor: '#0f172a', color: 'white', outline: 'none' }} 
          />

          <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '0.85rem', marginTop: '1rem', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: isLoading ? 'not-allowed' : 'pointer', transition: 'background-color 0.2s' }}>
            {isLoading ? 'Verificando...' : 'Ingresar al Sistema'}
          </button>
        </form>
        
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}>
             Volver al sitio público
          </button>
        </div>
      </div>
    </div>
  );
}
