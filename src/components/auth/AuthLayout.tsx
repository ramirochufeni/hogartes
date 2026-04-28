import React from 'react';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ title, subtitle, children }) => {
  return (
    <div className="container flex-center" style={{ minHeight: 'calc(100vh - 70px)', padding: '2rem 1.25rem', backgroundColor: '#f8fafc' }}>
      <div 
        className="card" 
        style={{ 
          maxWidth: '450px', 
          width: '100%', 
          padding: '2.5rem 2rem', 
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
          borderRadius: '16px',
          borderTop: '4px solid var(--color-primary)'
        }}
      >
        <h1 className="text-h2" style={{ textAlign: 'center', marginBottom: '0.5rem', color: 'var(--color-primary)' }}>
          {title}
        </h1>
        <p className="text-muted" style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '1rem' }}>
          {subtitle}
        </p>

        {children}
      </div>
    </div>
  );
};
