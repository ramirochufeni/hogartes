import { useState, useEffect } from 'react';
import { Check, CreditCard, Loader2 } from 'lucide-react';
import { fetchApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';

type PlanDuration = 'MONTHLY' | 'QUARTERLY' | 'SEMESTER' | 'YEARLY';

interface PlanDetail {
  id: PlanDuration;
  name: string;
  price: string;
  durationText: string;
  savings?: string;
  isPopular?: boolean;
}

export default function Plans() {
  const { user, isAuthenticated } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<PlanDuration | null>(null);
  const [subscribing, setSubscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collaboratorCode, setCollaboratorCode] = useState('');
  const [hasLockedCollaborator, setHasLockedCollaborator] = useState(false);

  useEffect(() => {
    // Solo consultamos el perfil si el usuario ya tiene role PROVIDER.
    // Evita un 401/404 durante el onboarding o cuando visita la página como CLIENT.
    if (!isAuthenticated || user?.role !== 'PROVIDER') return;
    fetchApi('/provider/me')
      .then(res => {
        if (res.data?.subscription?.collaborator?.code) {
          setCollaboratorCode(res.data.subscription.collaborator.code);
          setHasLockedCollaborator(true);
        }
      })
      .catch(console.error);
  }, [isAuthenticated, user?.role]);

  const plans: PlanDetail[] = [
    {
      id: 'MONTHLY',
      name: 'Plan Mensual',
      price: '40.000',
      durationText: '/ 1 mes',
    },
    {
      id: 'QUARTERLY',
      name: 'Plan Trimestral',
      price: '90.000',
      durationText: '/ 3 meses',
      savings: 'Ahorrás $30.000',
    },
    {
      id: 'SEMESTER',
      name: 'Plan Semestral',
      price: '115.000',
      durationText: '/ 6 meses',
      savings: 'Ahorrás $125.000',
      isPopular: true,
    },
    {
      id: 'YEARLY',
      name: 'Plan Anual',
      price: '240.000',
      durationText: '/ 12 meses',
      savings: 'Ahorrás $240.000',
    }
  ];

  const handleConfirmPurchase = async () => {
    // Guard: el endpoint /provider/subscribe/checkout requiere requireProvider.
    // Verificamos el rol en el contexto antes de hacer la request.
    if (!isAuthenticated || user?.role !== 'PROVIDER') {
      setError('Necesitás completar el alta de prestador antes de suscribirte.');
      return;
    }
    setSubscribing(true);
    setError(null);
    try {
      const res = await fetchApi('/provider/subscribe/checkout', {
        method: 'POST',
        data: { planType: selectedPlan, collaboratorCode: collaboratorCode.trim() || undefined }
      });
      // Redirect to MercadoPago
      if (res.data?.init_point) {
        window.location.href = res.data.init_point;
      } else {
        throw new Error('No se recibió el enlace de pago.');
      }
    } catch (err: any) {
      setError(err.message || 'Error al procesar la suscripción. Intentá nuevamente.');
      setSubscribing(false);
    }
  };

  const plan = selectedPlan ? plans.find(p => p.id === selectedPlan) : null;

  return (
    <div style={{ backgroundColor: '#f8fafc', padding: '5rem 1.25rem', minHeight: 'calc(100vh - 70px)', position: 'relative' }}>
      
      {/* MODAL DE CHECKOUT */}
      {plan && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', 
          zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' 
        }}>
          <div className="card" style={{ 
            width: '100%', maxWidth: '600px', backgroundColor: 'var(--color-bg)', 
            padding: '2.5rem', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            maxHeight: '90vh', overflowY: 'auto'
          }}>
            <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
              <h1 className="text-h2" style={{ fontSize: '1.75rem', margin: 0 }}>Confirmar Suscripción</h1>
              <button onClick={() => { setSelectedPlan(null); setError(null); }} className="btn" style={{ padding: '0.5rem', color: 'var(--color-text-muted)' }}>
                ✕
              </button>
            </div>
            
            <p className="text-muted" style={{ marginBottom: '2rem', fontSize: '1rem' }}>
              Estás a un paso de potenciar tu perfil profesional.
            </p>
            
            {error && (
              <div style={{ padding: '1rem', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', border: '1px solid #fca5a5' }}>
                {error}
              </div>
            )}

            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', marginBottom: '2rem' }}>
              <div className="flex-between" style={{ marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
                <span style={{ fontWeight: 600, fontSize: '1.125rem' }}>Servicio contratado</span>
                <span style={{ fontWeight: 600, fontSize: '1.125rem', color: 'var(--color-primary)' }}>{plan.name}</span>
              </div>
              <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                <span className="text-muted">Inicio estimado</span>
                <span style={{ fontWeight: 500, color: 'var(--color-secondary)' }}>Al acreditarse el pago</span>
              </div>
              <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                <span className="text-muted">Duración del plan</span>
                <span style={{ fontWeight: 500 }}>{plan.durationText.replace('/ ', '')}</span>
              </div>
              
              <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)', marginBottom: '0.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-primary)' }}>
                  ¿Tenés un código de colaborador? (opcional)
                </label>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
                  Ingresá el código del colaborador que te vendió la suscripción. Si no fue por medio de ninguno, dejalo vacío.
                </p>
                <input 
                  type="text" 
                  value={collaboratorCode} 
                  onChange={(e) => setCollaboratorCode(e.target.value)} 
                  placeholder="Ej: JUAN001" 
                  disabled={hasLockedCollaborator}
                  style={{ 
                    width: '100%', 
                    padding: '0.75rem', 
                    borderRadius: 'var(--radius-sm)', 
                    border: '1px solid var(--color-border)', 
                    textTransform: 'uppercase',
                    backgroundColor: hasLockedCollaborator ? '#f3f4f6' : 'white',
                    color: hasLockedCollaborator ? '#6b7280' : 'inherit',
                    cursor: hasLockedCollaborator ? 'not-allowed' : 'text'
                  }}
                />
                {hasLockedCollaborator && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-primary)', marginTop: '0.4rem', fontWeight: 500 }}>
                    <Check size={12} style={{ display: 'inline', marginRight: '4px' }} />
                    Ya tenés un colaborador asociado a tu cuenta.
                  </p>
                )}
              </div>

              <div className="flex-between" style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 600, fontSize: '1.25rem' }}>Total a pagar</span>
                </div>
                <span style={{ fontWeight: 800, fontSize: '1.75rem', color: 'var(--color-secondary)' }}>${plan.price}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
              <button 
                onClick={handleConfirmPurchase} 
                disabled={subscribing}
                className="btn btn-primary flex-center" 
                style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', justifyContent: 'center', gap: '0.75rem', backgroundColor: '#009ee3', borderColor: '#009ee3', color: 'white', borderRadius: '8px' }}
              >
                {subscribing ? <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} /> : <CreditCard size={24} />}
                {subscribing ? 'Procesando...' : 'Pagar con Mercado Pago'}
              </button>
              <button 
                onClick={() => { setSelectedPlan(null); setError(null); }} 
                className="btn btn-outline" 
                style={{ width: '100%', padding: '0.75rem', justifyContent: 'center' }}
                disabled={subscribing}
              >
                Cancelar
              </button>
            </div>
            
          </div>
        </div>
      )}

      <div className="container" style={{ maxWidth: '1200px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h1 className="text-h1" style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>Elegí el plan para hacer crecer tu negocio</h1>
          <p className="text-muted" style={{ fontSize: '1.25rem', maxWidth: '700px', margin: '0 auto' }}>
            HogArtes conecta diariamente a miles de clientes con profesionales como vos. Seleccioná un plan y empezá a publicitar tus servicios hoy mismo.
          </p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', 
          gap: '2rem', 
          alignItems: 'stretch' 
        }}>
          
          {plans.map((p) => (
            <div key={p.id} className="card" style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              padding: '2.5rem 1.5rem', 
              border: p.isPopular ? '2px solid var(--color-secondary)' : '1px solid var(--color-border)', 
              backgroundColor: 'white',
              position: 'relative',
              borderRadius: '16px',
              boxShadow: p.isPopular ? '0 20px 25px -5px rgba(255,106,0,0.1)' : '0 10px 15px -3px rgba(0,0,0,0.05)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              cursor: 'pointer',
              transform: 'translateY(0)'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-10px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {p.isPopular && (
                <div style={{ 
                  position: 'absolute', 
                  top: '-14px', 
                  left: '50%', 
                  transform: 'translateX(-50%)', 
                  backgroundColor: 'var(--color-secondary)', 
                  color: 'white', 
                  padding: '4px 20px', 
                  borderRadius: '20px', 
                  fontSize: '0.85rem', 
                  fontWeight: 700, 
                  letterSpacing: '1px', 
                  boxShadow: '0 4px 6px -1px rgba(255,106,0,0.4)',
                  whiteSpace: 'nowrap'
                }}>
                  MEJOR VALOR
                </div>
              )}

              <h2 className="text-h2" style={{ fontSize: '1.6rem', marginBottom: '0.5rem', color: p.isPopular ? 'var(--color-secondary)' : 'var(--color-primary)' }}>
                {p.name}
              </h2>
              
              <div style={{ minHeight: '30px', marginBottom: '1.5rem' }}>
                {p.savings ? (
                  <span style={{ 
                    color: '#10b981', 
                    fontWeight: 700, 
                    fontSize: '0.95rem',
                    backgroundColor: '#d1fae5',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    display: 'inline-block'
                  }}>
                    {p.savings}
                  </span>
                ) : (
                  <span style={{ opacity: 0 }}>.</span>
                )}
              </div>
              
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginBottom: '2rem' }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 600 }}>$</span>
                <span style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1, color: 'var(--color-text-main)' }}>{p.price}</span>
                <span className="text-muted" style={{ fontSize: '0.95rem', marginLeft: '0.25rem' }}>{p.durationText}</span>
              </div>

              <button 
                onClick={() => setSelectedPlan(p.id)} 
                className={`btn ${p.isPopular ? 'btn-secondary' : 'btn-outline'}`} 
                style={{ 
                  width: '100%', 
                  padding: '1rem', 
                  fontSize: '1.1rem', 
                  marginBottom: '2.5rem', 
                  borderColor: p.isPopular ? 'transparent' : 'var(--color-primary)', 
                  color: p.isPopular ? 'white' : 'var(--color-primary)',
                  boxShadow: p.isPopular ? '0 8px 15px -3px rgba(255,106,0,0.3)' : 'none'
                }}>
                Elegir plan
              </button>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: 'auto' }}>
                <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.75rem' }}>
                  <Check size={20} color={p.isPopular ? "var(--color-secondary)" : "var(--color-primary)"} />
                  <span style={{ fontSize: '1rem', fontWeight: 600 }}>Publicá hasta 2 servicios</span>
                </div>
                <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.75rem' }}>
                  <Check size={20} color={p.isPopular ? "var(--color-secondary)" : "var(--color-primary)"} />
                  <span style={{ fontSize: '1rem' }}>Perfil comercial destacado</span>
                </div>
                <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.75rem' }}>
                  <Check size={20} color={p.isPopular ? "var(--color-secondary)" : "var(--color-primary)"} />
                  <span style={{ fontSize: '1rem' }}>Aparición en búsquedas</span>
                </div>
                <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.75rem' }}>
                  <Check size={20} color={p.isPopular ? "var(--color-secondary)" : "var(--color-primary)"} />
                  <span style={{ fontSize: '1rem' }}>Contacto directo con clientes</span>
                </div>
              </div>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}
