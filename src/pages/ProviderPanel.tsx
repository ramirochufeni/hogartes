import { Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, AlertTriangle, CheckCircle, User, Briefcase, Star, Loader2, Edit2, X, Trash2, ShieldCheck, FileText } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { fetchApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import type { Service, ProviderMeResponse } from '../lib/types';

// ==========================================
// PROVIDER PANEL — Root Layout
// ==========================================
export default function ProviderPanel() {
  const location = useLocation();
  const { user, isLoading } = useAuth();

  // Guard: si el AuthContext todavía no reflejó el rol PROVIDER
  // (puede ocurrir en el primer render post-onboarding antes del commit de setUser)
  // mostramos un loader en lugar de disparar requests al backend con el token viejo.
  if (isLoading || !user || (user.role !== 'PROVIDER' && user.role !== 'ADMIN')) {
    return (
      <div className="container flex-center" style={{ minHeight: '50vh' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--color-text-muted)' }}>
          <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
          <p>Verificando acceso...</p>
        </div>
      </div>
    );
  }

  const isCurrent = (path: string) => {
    if (path === '') {
      return location.pathname === '/panel-prestador' || location.pathname === '/panel-prestador/';
    }
    return location.pathname.endsWith('/' + path);
  };

  return (
    <div className="container" style={{ padding: '2rem 1.25rem', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
      
      {/* Sidebar Navigation */}
      <aside style={{ flex: '1 1 220px', maxWidth: '270px' }}>
        <div className="card" style={{ padding: '1rem', position: 'sticky', top: '90px' }}>
          <h3 className="text-h3" style={{ fontSize: '1.1rem', marginBottom: '1.25rem', color: 'var(--color-primary)' }}>
            Panel del Suscriptor
          </h3>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <Link
              to="/panel-prestador"
              className={`btn ${isCurrent('') ? 'btn-primary' : 'btn-outline'}`}
              style={{ justifyContent: 'flex-start', border: 'none', padding: '0.75rem 1rem', gap: '0.6rem' }}
            >
              <Star size={16} /> Resumen
            </Link>
            <Link
              to="/panel-prestador/perfil"
              className={`btn ${isCurrent('perfil') ? 'btn-primary' : 'btn-outline'}`}
              style={{ justifyContent: 'flex-start', border: 'none', padding: '0.75rem 1rem', gap: '0.6rem' }}
            >
              <User size={16} /> Mi perfil
            </Link>
            <Link
              to="/panel-prestador/servicios"
              className={`btn ${isCurrent('servicios') ? 'btn-primary' : 'btn-outline'}`}
              style={{ justifyContent: 'flex-start', border: 'none', padding: '0.75rem 1rem', gap: '0.6rem' }}
            >
              <Briefcase size={16} /> Mis servicios
            </Link>
            <Link
              to="/panel-prestador/datos-fiscales"
              className={`btn ${isCurrent('datos-fiscales') ? 'btn-primary' : 'btn-outline'}`}
              style={{ justifyContent: 'flex-start', border: 'none', padding: '0.75rem 1rem', gap: '0.6rem' }}
            >
              <ShieldCheck size={16} /> Datos Fiscales
            </Link>
            <Link
              to="/panel-prestador/plan"
              className={`btn ${isCurrent('plan') ? 'btn-secondary' : 'btn-outline'}`}
              style={{
                justifyContent: 'flex-start', border: 'none', padding: '0.75rem 1rem', gap: '0.6rem',
                marginTop: '1rem', borderTop: '1px solid var(--color-border)'
              }}
            >
              <CreditCard size={16} /> Mi Suscripción
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{ flex: '3 1 600px', minWidth: 0 }}>
        <Routes>
          <Route path="/" element={<ProviderDashboard />} />
          <Route path="/perfil" element={<ProviderProfileEdit />} />
          <Route path="/servicios" element={<ProviderServices />} />
          <Route path="/plan" element={<PlanManager />} />
          <Route path="/datos-fiscales" element={<ProviderFiscalData />} />
          <Route path="*" element={<ProviderDashboard />} />
        </Routes>
      </div>
    </div>
  );
}

// ==========================================
// HOOK: Carga datos del prestador (reusable)
// ==========================================
function useProviderMe() {
  const [data, setData] = useState<ProviderMeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: resp } = await fetchApi('/provider/me');
      setData(resp as ProviderMeResponse);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los datos del perfil');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, reload: load };
}

// ==========================================
// LOADING & ERROR HELPERS
// ==========================================
function LoadingCard() {
  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--color-text-muted)' }}>
      <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
      <span>Cargando datos...</span>
    </div>
  );
}

function ErrorCard({ message }: { message: string }) {
  return (
    <div className="card" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', color: '#ef4444', borderColor: '#fca5a5' }}>
      <AlertTriangle size={20} />
      <span>{message}</span>
    </div>
  );
}

// ==========================================
// PLAN DISPLAY HELPERS
// ==========================================
function planLabel(planType: string | undefined): string {
  if (planType === 'MONTHLY') return 'Plan Mensual';
  if (planType === 'QUARTERLY') return 'Plan Trimestral';
  if (planType === 'SEMESTER') return 'Plan Semestral';
  if (planType === 'YEARLY') return 'Plan Anual';
  
  // Backwards compatibility during transition
  if (planType === 'DOUBLE') return 'Plan Doble';
  if (planType === 'BASIC') return 'Plan Básico';
  return 'Sin plan';
}

function planLimit(planType: string | undefined): number {
  return planType ? 1 : 0;
}

function statusLabel(status: string | undefined): string {
  if (status === 'ACTIVE') return 'Activo';
  if (status === 'EXPIRED') return 'Vencido';
  if (status === 'CANCELLED') return 'Cancelado';
  return 'Sin estado';
}

// ==========================================
// SUB-PANEL: DASHBOARD RESUMEN
// ==========================================
function ProviderDashboard() {
  const { data, loading, error, reload } = useProviderMe();
  const navigate = useNavigate();

  const [lastTransaction, setLastTransaction] = useState<any>(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{ status: string; message: string } | null>(null);

  useEffect(() => {
    fetchApi('/provider/last-transaction')
      .then(({ data: txData }) => setLastTransaction(txData.transaction))
      .catch(() => setLastTransaction(null));
  }, []);

  const handleVerifyPayment = async () => {
    if (!lastTransaction) return;
    setVerifying(true);
    setVerifyResult(null);
    try {
      const { data: result } = await fetchApi(`/provider/transactions/${lastTransaction.id}/verify`, { method: 'POST' });
      setVerifyResult(result);
      if (result.status === 'APPROVED') {
        await reload();
        setLastTransaction((prev: any) => ({ ...prev, status: 'APPROVED' }));
      }
    } catch (err: any) {
      setVerifyResult({ status: 'ERROR', message: err.message || 'Error al verificar el pago' });
    } finally {
      setVerifying(false);
    }
  };

  if (loading) return <LoadingCard />;
  if (error) return <ErrorCard message={error} />;
  if (!data) return <ErrorCard message="No se pudieron cargar los datos." />;

  const { profile, subscription, servicesCount } = data;
  const limit = planLimit(subscription?.planType);
  const available = Math.max(0, limit - servicesCount);
  const progressPercent = limit > 0 ? Math.min(100, (servicesCount / limit) * 100) : 0;
  const fiscalComplete = Boolean(profile.legalName && profile.documentNumber && profile.cuit && profile.fiscalCondition && (profile as any).fiscalAddress && (profile as any).iibb && (profile as any).civilStatus);
  const contactComplete = Boolean(profile.publicUsername && profile.phone && profile.contactEmail && profile.city && profile.province && profile.bio);
  const hasOnboarding = fiscalComplete && contactComplete;

  const hasPendingTransaction = lastTransaction && lastTransaction.status === 'PENDING';

  return (
    <div>
      <h1 className="text-h2" style={{ marginBottom: '1.5rem' }}>
        Bienvenido, {profile.user.name || 'Suscriptor'}
      </h1>

      {/* Banner: pago pendiente de verificación */}
      {hasPendingTransaction && !verifyResult && (
        <div style={{
          backgroundColor: '#fffbeb',
          border: '1px solid #fcd34d',
          borderLeft: '4px solid #f59e0b',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertTriangle size={20} color="#f59e0b" style={{ flexShrink: 0 }} />
            <div>
              <p style={{ fontWeight: 600, color: '#92400e', marginBottom: '0.2rem' }}>
                Tu pago se está procesando o ya fue realizado.
              </p>
              <p style={{ fontSize: '0.875rem', color: '#b45309' }}>
                Si ya pagaste, podés verificarlo para activar tu suscripción.
              </p>
            </div>
          </div>
          <button
            className="btn btn-primary"
            onClick={handleVerifyPayment}
            disabled={verifying}
            style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            {verifying
              ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Verificando...</>
              : '✓ Verificar pago'
            }
          </button>
        </div>
      )}

      {/* Resultado de la verificación */}
      {verifyResult && (
        <div style={{
          backgroundColor: verifyResult.status === 'APPROVED' ? '#f0fdf4' : verifyResult.status === 'REJECTED' ? '#fef2f2' : '#eff6ff',
          border: `1px solid ${verifyResult.status === 'APPROVED' ? '#86efac' : verifyResult.status === 'REJECTED' ? '#fca5a5' : '#bfdbfe'}`,
          borderLeft: `4px solid ${verifyResult.status === 'APPROVED' ? '#22c55e' : verifyResult.status === 'REJECTED' ? '#ef4444' : '#3b82f6'}`,
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <CheckCircle size={20} color={verifyResult.status === 'APPROVED' ? '#22c55e' : verifyResult.status === 'REJECTED' ? '#ef4444' : '#3b82f6'} />
          <div>
            <p style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>
              {verifyResult.status === 'APPROVED' ? '¡Suscripción activada!' : verifyResult.status === 'REJECTED' ? 'Pago rechazado' : 'Procesando...'}
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{verifyResult.message}</p>
          </div>
        </div>
      )}

      {/* Cards de resumen */}
      <div className="grid-3" style={{ marginBottom: '2rem' }}>
        {/* Plan */}
        <div className="card" style={{ borderTop: '4px solid var(--color-primary)' }}>
          <p className="text-muted" style={{ marginBottom: '0.5rem', fontWeight: 500 }}>Plan Actual</p>
          <h3 className="text-h3" style={{ fontSize: '1.4rem', color: 'var(--color-primary)' }}>
            {planLabel(subscription?.planType)}
          </h3>
          {subscription ? (
            <span
              className="badge"
              style={{
                marginTop: '0.5rem',
                backgroundColor: subscription.status === 'ACTIVE' ? 'var(--color-primary-light, #e0f2fe)' : '#fef2f2',
                color: subscription.status === 'ACTIVE' ? 'var(--color-primary)' : '#ef4444',
              }}
            >
              {statusLabel(subscription.status)}
            </span>
          ) : (
            <span className="badge" style={{ marginTop: '0.5rem', backgroundColor: '#f3f4f6', color: '#6b7280' }}>
              Sin suscripción
            </span>
          )}
        </div>

        {/* Servicios / cupo */}
        <div className="card">
          <p className="text-muted" style={{ marginBottom: '0.5rem', fontWeight: 500 }}>Servicios publicados</p>
          <h3 className="text-h3" style={{ fontSize: '2rem' }}>
            {servicesCount}
            <span style={{ fontSize: '1rem', color: 'var(--color-text-muted)', marginLeft: '0.4rem' }}>
              / {limit}
            </span>
          </h3>
          <div style={{ marginTop: '0.75rem', width: '100%', height: '8px', backgroundColor: 'var(--color-border)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
            <div style={{
              width: `${progressPercent}%`, height: '100%',
              backgroundColor: progressPercent >= 100 ? 'var(--color-secondary)' : 'var(--color-primary)',
              transition: 'width 0.5s ease'
            }} />
          </div>
          <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.4rem' }}>
            {available > 0 ? `Podés publicar ${available} servicio(s) más` : 'Límite alcanzado'}
          </p>
        </div>

        {/* Verificación */}
        <div className="card">
          <p className="text-muted" style={{ marginBottom: '0.5rem', fontWeight: 500 }}>Estado de cuenta</p>
          <h3 className="text-h3" style={{ fontSize: '1.1rem' }}>
            {profile.verificationStatus === 'VERIFIED' ? '✓ Verificado' : profile.verificationStatus === 'REJECTED' ? '✗ Rechazado' : 'En revisión'}
          </h3>
          <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
            {profile.verificationStatus === 'VERIFIED' ? 'Tu perfil está activo' : profile.verificationStatus === 'REJECTED' ? 'Contactá soporte' : 'Verificación pendiente'}
          </p>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="card">
        <div className="flex-between" style={{ marginBottom: '1rem' }}>
          <h3 className="text-h3" style={{ fontSize: '1.15rem' }}>Acciones rápidas</h3>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {available > 0 ? (
            hasOnboarding ? (
              <Link to="/publicar" className="btn btn-primary">
                + Publicar nuevo servicio
              </Link>
            ) : (
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {!fiscalComplete && (
                  <Link to="/panel-prestador/datos-fiscales" className="btn btn-primary">
                    Completar datos fiscales
                  </Link>
                )}
                {!contactComplete && (
                  <Link to="/panel-prestador/perfil" className="btn btn-secondary">
                    Completar perfil para publicar
                  </Link>
                )}
              </div>
            )
          ) : (
            <button
              className="btn btn-secondary"
              onClick={() => navigate('/panel-prestador/plan')}
            >
              Mejorar plan para publicar más
            </button>
          )}
          <Link to="/panel-prestador/perfil" className="btn btn-outline">Editar mi perfil</Link>
          <Link to="/panel-prestador/servicios" className="btn btn-outline">Ver mis servicios</Link>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// SUB-PANEL: MI PERFIL (EDITABLE)
// ==========================================
function ProviderProfileEdit() {
  const { data, loading, error, reload } = useProviderMe();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [form, setForm] = useState({ 
    phone: '', city: '', province: '', bio: '', publicUsername: '', contactEmail: '' 
  });

  // Inicializar form cuando llegan los datos
  useEffect(() => {
    if (data) {
      setForm({
        phone: data.profile.phone ?? '',
        city: data.profile.city ?? '',
        province: data.profile.province ?? '',
        bio: data.profile.bio ?? '',
        publicUsername: data.profile.publicUsername ?? '',
        contactEmail: data.profile.contactEmail ?? ''
      });
    }
  }, [data]);

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      await fetchApi('/provider/me', {
        method: 'PATCH',
        data: {
          phone: form.phone || null,
          city: form.city || null,
          province: form.province || null,
          bio: form.bio || null,
          publicUsername: form.publicUsername || null,
          contactEmail: form.contactEmail || null
        }
      });
      setSaveSuccess(true);
      setEditing(false);
      reload();
    } catch (err: any) {
      setSaveError(err.message || 'Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (data) {
      setForm({
        phone: data.profile.phone ?? '',
        city: data.profile.city ?? '',
        province: data.profile.province ?? '',
        bio: data.profile.bio ?? '',
        publicUsername: data.profile.publicUsername ?? '',
        contactEmail: data.profile.contactEmail ?? ''
      });
    }
    setEditing(false);
    setSaveError(null);
  };

  if (loading) return <LoadingCard />;
  if (error) return <ErrorCard message={error} />;
  if (!data) return <ErrorCard message="No se pudieron cargar los datos del perfil." />;

  const { profile } = data;

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 className="text-h2">Mi Perfil</h1>
        {!editing && (
          <button className="btn btn-primary" onClick={() => { setEditing(true); setSaveSuccess(false); }}>
            Editar perfil
          </button>
        )}
      </div>

      {saveSuccess && (
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', backgroundColor: '#f0fdf4', color: '#16a34a', marginBottom: '1rem' }}>
          <CheckCircle size={18} /> Perfil actualizado correctamente.
        </div>
      )}

      {saveError && <ErrorCard message={saveError} />}

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="flex-between" style={{ marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 className="text-h3" style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)' }}>
            Información de la cuenta y Fiscal
          </h3>
          {Boolean(profile.legalName && profile.documentNumber && profile.cuit && profile.fiscalCondition && profile.fiscalAddress && profile.iibb && profile.civilStatus) ? (
            <span className="badge" style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}>
              ✓ Datos fiscales cargados
            </span>
          ) : (
            <Link to="/panel-prestador/datos-fiscales" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
              Agregar datos fiscales
            </Link>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
          <ProfileField label="Nombre completo" value={profile.user.name} editable={false} />
          <ProfileField label="Correo electrónico" value={profile.user.email} editable={false} />
          <ProfileField label="Nombre/Identidad Legal" value={profile.legalName} editable={false} fallback="No provisto" />
          <ProfileField label="Documento (DNI)" value={profile.documentNumber} editable={false} fallback="No provisto" />
          <ProfileField label="CUIT/CUIL" value={profile.cuit} editable={false} fallback="No provisto" />
          <ProfileField label="Condición Fiscal" value={profile.fiscalCondition} editable={false} fallback="No provisto" />
          <ProfileField
            label="Estado de verificación"
            value={
              profile.verificationStatus === 'VERIFIED' ? '✓ Verificado'
              : profile.verificationStatus === 'REJECTED' ? '✗ Rechazado'
              : '⏳ Pendiente de verificación'
            }
            editable={false}
          />
        </div>
      </div>

      <div className="card">
        <h3 className="text-h3" style={{ fontSize: '1.1rem', marginBottom: '1.25rem', color: 'var(--color-text-muted)' }}>
          Datos de contacto y ubicación
        </h3>

        {editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.875rem', fontWeight: 500 }}>
                  Nombre de Usuario Público
                </label>
                <input
                  className="input"
                  type="text"
                  placeholder="Ej: juan_reparaciones"
                  value={form.publicUsername}
                  onChange={e => setForm(f => ({ ...f, publicUsername: e.target.value }))}
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.875rem', fontWeight: 500 }}>
                  Email de contacto (Publico)
                </label>
                <input
                  className="input"
                  type="email"
                  placeholder="Email secundario"
                  value={form.contactEmail}
                  onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))}
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.875rem', fontWeight: 500 }}>
                  Teléfono
                </label>
                <input
                  className="input"
                  type="tel"
                  placeholder="Ej: 011-1234-5678"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.875rem', fontWeight: 500 }}>
                  Ciudad
                </label>
                <input
                  className="input"
                  type="text"
                  placeholder="Ej: Buenos Aires"
                  value={form.city}
                  onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.875rem', fontWeight: 500 }}>
                  Provincia
                </label>
                <input
                  className="input"
                  type="text"
                  placeholder="Ej: Buenos Aires"
                  value={form.province}
                  onChange={e => setForm(f => ({ ...f, province: e.target.value }))}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.875rem', fontWeight: 500 }}>
                Bio / Descripción
              </label>
              <textarea
                className="input"
                placeholder="Contá algo sobre vos y tus servicios..."
                value={form.bio}
                onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                rows={4}
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={saving}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                {saving && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
              <button className="btn btn-outline" onClick={handleCancel} disabled={saving}>
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
            <ProfileField label="Usuario Público" value={profile.publicUsername} fallback="No configurado" />
            <ProfileField label="Teléfono" value={profile.phone} fallback="No especificado" />
            <ProfileField label="Email de Contacto" value={profile.contactEmail} fallback="No especificado" />
            <ProfileField label="Ciudad" value={profile.city} fallback="Ubicación no especificada" />
            <ProfileField label="Provincia" value={profile.province} fallback="Ubicación no especificada" />
            {profile.bio && (
              <div style={{ gridColumn: '1 / -1' }}>
                <ProfileField label="Bio" value={profile.bio} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ProfileField({
  label, value, fallback, editable = true
}: {
  label: string;
  value: string | null | undefined;
  fallback?: string;
  editable?: boolean;
}) {
  const display = value?.trim() || fallback || '—';
  return (
    <div>
      <p style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-text-muted)', marginBottom: '0.2rem' }}>
        {label}
      </p>
      <p style={{ fontWeight: editable ? 400 : 600, color: value?.trim() ? 'var(--color-text-main)' : 'var(--color-text-muted)' }}>
        {display}
      </p>
    </div>
  );
}

// ==========================================
// SUB-PANEL: MIS SERVICIOS
// ==========================================
function ProviderServices() {
  const { data: providerData } = useProviderMe();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [editForm, setEditForm] = useState({
    title: '', description: '', category: '', subcategoryId: '', coverImage: ''
  });
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState(false);

  const loadServices = async () => {
    try {
      const { data } = await fetchApi('/services/me/services');
      setServices(data as Service[]);
    } catch (err: any) {
      setError(err.message || 'Error al cargar tus servicios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
    fetchApi('/catalog/categories').then(({ data }) => setCategories(data)).catch(console.error);
  }, []);

  const startEdit = (svc: Service) => {
    setEditingId(svc.id);
    setEditError(null);
    setEditSuccess(false);
    setEditImageFile(null);
    const currentCatId = svc.subcategory?.category?.id || '';
    setEditForm({
      title: svc.title,
      description: svc.description,
      category: currentCatId,
      subcategoryId: svc.subcategoryId || '',
      coverImage: svc.coverImage || ''
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditError(null);
    setEditImageFile(null);
  };

  const handleEditSave = async (svcId: string) => {
    setEditSaving(true);
    setEditError(null);
    try {
      let coverImageUrl = editForm.coverImage || undefined;

      if (editImageFile) {
        const formData = new FormData();
        formData.append('image', editImageFile);
        const uploadRes = await fetch('http://localhost:5000/api/upload', { method: 'POST', body: formData });
        const uploadJson = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadJson.error || 'Error al subir imagen');
        coverImageUrl = uploadJson.url;
      }

      await fetchApi(`/services/${svcId}`, {
        method: 'PATCH',
        data: {
          title: editForm.title.trim() || undefined,
          description: editForm.description.trim() || undefined,
          subcategoryId: editForm.subcategoryId || undefined,
          coverImage: coverImageUrl || undefined,
        }
      });

      setEditSuccess(true);
      setEditingId(null);
      setEditImageFile(null);
      await loadServices();
    } catch (err: any) {
      setEditError(err.message || 'Error al guardar los cambios');
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async (svcId: string) => {
    if (!window.confirm('¿Seguro que querés eliminar este servicio? Esta acción no se puede deshacer.')) return;
    setDeletingId(svcId);
    try {
      await fetchApi(`/services/${svcId}`, { method: 'DELETE' });
      await loadServices();
    } catch (err: any) {
      alert(err.message || 'Error al eliminar el servicio');
    } finally {
      setDeletingId(null);
    }
  };

  const selectedCat = categories.find(c => c.id === editForm.category);
  const editSubcategories = selectedCat ? selectedCat.subcategories : [];

  // Calcular si puede publicar desde el panel
  const sub = providerData?.subscription;
  const isSubExpired = !sub || sub.status !== 'ACTIVE' || new Date(sub.expiresAt) < new Date();
  const currentPlanLimit = sub?.planType ? 1 : 0;
  const canPublishMore = !isSubExpired && services.length < currentPlanLimit;

  if (loading) return <LoadingCard />;
  if (error) return <ErrorCard message={error} />;

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 className="text-h2">Mis Servicios</h1>
        {canPublishMore ? (
          <Link to="/publicar" className="btn btn-primary">+ Publicar nuevo</Link>
        ) : isSubExpired ? (
          <Link to="/planes" className="btn btn-secondary" style={{ gap: '0.5rem' }}>
            <CreditCard size={16} /> Renovar plan
          </Link>
        ) : (
          <Link to="/planes" className="btn btn-outline" title="Límite alcanzado">
            Mejorar plan para publicar más
          </Link>
        )}
      </div>

      {isSubExpired && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '1rem', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', border: '1px solid #fca5a5' }}>
          <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
          <p style={{ margin: 0, lineHeight: 1.6 }}>
            <strong>Tu suscripción está vencida.</strong> Tus servicios no son visibles públicamente. Podés eliminarlos, pero no editarlos ni publicar nuevos hasta renovar.
          </p>
        </div>
      )}

      {editSuccess && (
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', backgroundColor: '#f0fdf4', color: '#16a34a', marginBottom: '1rem' }}>
          <CheckCircle size={18} /> Servicio actualizado correctamente.
        </div>
      )}

      {services.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
          <Briefcase size={40} style={{ margin: '0 auto 1rem', color: 'var(--color-text-muted)' }} />
          <p className="text-muted" style={{ marginBottom: '1rem' }}>Aún no publicaste ningún servicio.</p>
          <Link to="/publicar" className="btn btn-primary">Publicar mi primer servicio</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {services.map(svc => (
            <div key={svc.id}>
              {/* Vista normal */}
              {editingId !== svc.id && (
                <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                    {svc.coverImage ? (
                      <img src={`http://localhost:5000${svc.coverImage}`} alt={svc.title}
                        style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: 'var(--radius-md)', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Briefcase size={22} color="var(--color-text-muted)" />
                      </div>
                    )}
                    <div>
                      <p style={{ fontWeight: 600, marginBottom: '0.2rem' }}>{svc.title}</p>
                      <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                        {svc.subcategory?.category?.name || 'Sin categoría'}{svc.subcategory?.name ? ` › ${svc.subcategory.name}` : ''}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                    <span className={`badge ${svc.isActive ? 'badge-blue' : 'badge-gray'}`}>
                      {svc.isActive ? 'Activo' : 'Pausado'}
                    </span>
                    {!isSubExpired && (
                      <button
                        onClick={() => startEdit(svc)}
                        className="btn btn-outline"
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                      >
                        <Edit2 size={14} /> Editar
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(svc.id)}
                      disabled={deletingId === svc.id}
                      className="btn btn-outline"
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#ef4444', borderColor: '#fca5a5' }}
                    >
                      {deletingId === svc.id ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={14} />}
                      {deletingId === svc.id ? 'Eliminando...' : 'Eliminar'}
                    </button>
                    <Link to={`/servicio/${svc.id}`} className="text-muted" style={{ fontSize: '0.875rem', textDecoration: 'underline' }}>
                      Ver detalle
                    </Link>
                  </div>
                </div>
              )}

              {/* Formulario de edición inline */}
              {editingId === svc.id && (
                <div className="card" style={{ border: '2px solid var(--color-primary)' }}>
                  <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
                    <h3 className="text-h3" style={{ fontSize: '1.1rem', color: 'var(--color-primary)' }}>Editando: {svc.title}</h3>
                    <button onClick={cancelEdit} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                      <X size={20} />
                    </button>
                  </div>

                  {editError && <ErrorCard message={editError} />}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.875rem', fontWeight: 500 }}>Título *</label>
                      <input className="input" type="text" value={editForm.title}
                        onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                        style={{ width: '100%' }} />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.875rem', fontWeight: 500 }}>Descripción</label>
                      <textarea className="input" rows={4} value={editForm.description}
                        onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                        style={{ width: '100%', resize: 'vertical' }} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.875rem', fontWeight: 500 }}>Categoría</label>
                        <select className="input" value={editForm.category}
                          disabled
                          style={{ width: '100%', backgroundColor: 'transparent', opacity: 0.6, cursor: 'not-allowed' }}>
                          <option value="">Seleccionar categoría</option>
                          {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.875rem', fontWeight: 500 }}>Subrubro</label>
                        <select className="input" value={editForm.subcategoryId}
                          disabled
                          style={{ width: '100%', backgroundColor: 'transparent', opacity: 0.6, cursor: 'not-allowed' }}>
                          <option value="">Seleccionar subrubro</option>
                          {editSubcategories.map((sub: any) => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
                        </select>
                        <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem' }}>La categoría no se puede modificar por seguridad.</p>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.875rem', fontWeight: 500 }}>
                        Nueva imagen de portada (opcional)
                      </label>
                      {svc.coverImage && !editImageFile && (
                        <div style={{ marginBottom: '0.5rem' }}>
                          <img src={`http://localhost:5000${svc.coverImage}`} alt="Imagen actual"
                            style={{ height: '80px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }} />
                          <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Imagen actual</p>
                        </div>
                      )}
                      <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp"
                        onChange={e => setEditImageFile(e.target.files?.[0] || null)} />
                      {editImageFile && <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>{editImageFile.name} seleccionado</p>}
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem' }}>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleEditSave(svc.id)}
                        disabled={editSaving}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                      >
                        {editSaving && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
                        {editSaving ? 'Guardando...' : 'Guardar cambios'}
                      </button>
                      <button className="btn btn-outline" onClick={cancelEdit} disabled={editSaving}>Cancelar</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==========================================
// SUB-PANEL: MI SUSCRIPCIÓN
// ==========================================
function PlanManager() {
  const navigate = useNavigate();
  const location = useLocation();

  // Estado local separado para poder forzar un reload al volver del checkout
  const [providerData, setProviderData] = useState<ProviderMeResponse | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [lastTx, setLastTx] = useState<any | null>(null);
  const [verifying, setVerifying] = useState(false);

  const queryParams = new URLSearchParams(location.search);
  const paymentStatus = queryParams.get('payment') as 'success' | 'pending' | 'failure' | null;

  // Carga inicial + posibilidad de re-cargar
  const loadData = useCallback(async () => {
    setDataLoading(true);
    setDataError(null);
    try {
      const [meRes, txRes] = await Promise.all([
        fetchApi('/provider/me'),
        fetchApi('/provider/last-transaction').catch(() => ({ data: { transaction: null } }))
      ]);
      setProviderData(meRes.data as ProviderMeResponse);
      setLastTx(txRes.data?.transaction ?? null);
    } catch (err: any) {
      setDataError(err.message || 'Error al cargar los datos de suscripción');
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Cuando el usuario vuelve de MP con success/pending,
  // esperamos 3 s y hacemos un segundo fetch para capturar webhooks rápidos.
  useEffect(() => {
    if (paymentStatus === 'success' || paymentStatus === 'pending') {
      setVerifying(true);
      const timer = setTimeout(async () => {
        await loadData();
        setVerifying(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [paymentStatus, loadData]);

  if (dataLoading) return <LoadingCard />;
  if (dataError) return <ErrorCard message={dataError} />;
  if (!providerData) return <ErrorCard message="No se pudieron cargar los datos de suscripción." />;

  const { subscription, servicesCount } = providerData;
  const isSubActive = subscription?.status === 'ACTIVE';

  // --- BANNER DE RETORNO DESDE MERCADO PAGO ---
  // La lógica correcta: el URL param indica qué dijo MP, pero el estado REAL
  // lo determina el backend (webhook actualiza la BD, no el frontend).
  const renderPaymentBanner = () => {
    if (!paymentStatus) return null;

    if (paymentStatus === 'failure') {
      return (
        <div style={{ padding: '1rem', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', border: '1px solid #fca5a5', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ margin: 0, fontWeight: 600 }}>El pago no pudo completarse</h4>
            <p style={{ margin: '4px 0 0', fontSize: '0.9rem' }}>
              Hubo un problema procesando tu pago o fue cancelado. Por favor, intentá suscribirte nuevamente.
            </p>
            <button
              className="btn btn-outline"
              style={{ marginTop: '0.75rem', borderColor: '#fca5a5', color: '#b91c1c', fontSize: '0.85rem', padding: '0.35rem 0.85rem' }}
              onClick={() => navigate('/planes')}
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      );
    }

    // success o pending: mostramos estado real según la BD
    if (verifying) {
      return (
        <div style={{ padding: '1rem', backgroundColor: '#f0f9ff', color: '#0369a1', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', border: '1px solid #7dd3fc', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Loader2 size={20} style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }} />
          <div>
            <h4 style={{ margin: 0, fontWeight: 600 }}>Verificando tu pago…</h4>
            <p style={{ margin: '4px 0 0', fontSize: '0.9rem' }}>Estamos confirmando el estado con Mercado Pago, aguardá un momento.</p>
          </div>
        </div>
      );
    }

    const txStatus = lastTx?.status;

    if (isSubActive && txStatus === 'APPROVED') {
      return (
        <div style={{ padding: '1rem', backgroundColor: '#d1fae5', color: '#065f46', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', border: '1px solid #10b981', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <CheckCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ margin: 0, fontWeight: 600 }}>¡Pago acreditado correctamente!</h4>
            <p style={{ margin: '4px 0 0', fontSize: '0.9rem' }}>Tu suscripción está activa. Ya podés publicar tus servicios.</p>
          </div>
        </div>
      );
    }

    if (txStatus === 'APPROVED' && !isSubActive) {
      // Aprobado pero la suscripción no refleja ACTIVE todavía (raro, pero defensivo)
      return (
        <div style={{ padding: '1rem', backgroundColor: '#fef3c7', color: '#92400e', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', border: '1px solid #fbbf24', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ margin: 0, fontWeight: 600 }}>Pago aprobado — activando suscripción</h4>
            <p style={{ margin: '4px 0 0', fontSize: '0.9rem' }}>
              El pago fue aprobado. La suscripción se activará en instantes.{' '}
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b45309', fontWeight: 600, textDecoration: 'underline', padding: 0, fontSize: 'inherit' }}
                onClick={loadData}
              >
                Actualizar estado
              </button>
            </p>
          </div>
        </div>
      );
    }

    // pending o success pero todavía PENDING en la BD
    return (
      <div style={{ padding: '1rem', backgroundColor: '#fef3c7', color: '#b45309', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', border: '1px solid #f59e0b', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
        <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h4 style={{ margin: 0, fontWeight: 600 }}>Pago pendiente de acreditación</h4>
          <p style={{ margin: '4px 0 0', fontSize: '0.9rem' }}>
            Tu pago está siendo procesado. La suscripción se activará automáticamente cuando Mercado Pago confirme el pago.{' '}
            <button
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#92400e', fontWeight: 600, textDecoration: 'underline', padding: 0, fontSize: 'inherit' }}
              onClick={loadData}
            >
              Verificar ahora
            </button>
          </p>
        </div>
      </div>
    );
  };

  // Sin suscripción y volviendo de MP: mostrar solo el banner + opción de ir a planes
  if (!subscription && (paymentStatus === 'pending' || paymentStatus === 'success')) {
    return (
      <div>
        <h1 className="text-h2" style={{ marginBottom: '1.5rem' }}>Mi Suscripción</h1>
        {renderPaymentBanner()}
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
          <CreditCard size={40} style={{ margin: '0 auto 1rem', color: 'var(--color-text-muted)' }} />
          <h3 className="text-h3" style={{ marginBottom: '0.75rem' }}>Suscripción en proceso</h3>
          <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
            Tu suscripción aparecerá aquí en cuanto se acredite el pago.
          </p>
          <button className="btn btn-outline" onClick={loadData}>
            Actualizar estado
          </button>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div>
        <h1 className="text-h2" style={{ marginBottom: '1.5rem' }}>Mi Suscripción</h1>
        {paymentStatus === 'failure' && renderPaymentBanner()}
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
          <CreditCard size={40} style={{ margin: '0 auto 1rem', color: 'var(--color-text-muted)' }} />
          <h3 className="text-h3" style={{ marginBottom: '0.75rem' }}>Aún no tenés una suscripción activa</h3>
          <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
            Para publicar servicios, necesitás contratar un plan.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/planes')}>
            Ver planes disponibles
          </button>
        </div>
      </div>
    );
  }

  const limit = planLimit(subscription.planType);
  const available = Math.max(0, limit - servicesCount);
  const progressPercent = limit > 0 ? Math.min(100, (servicesCount / limit) * 100) : 0;

  const expiresDate = new Date(subscription.expiresAt).toLocaleDateString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });

  return (
    <div>
      <h1 className="text-h2" style={{ marginBottom: '1.5rem' }}>Mi Suscripción</h1>

      {renderPaymentBanner()}

      {/* Card principal */}
      <div className="card" style={{ marginBottom: '2rem', borderTop: `4px solid ${subscription.status === 'ACTIVE' ? 'var(--color-primary)' : '#ef4444'}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
              <h2 className="text-h2" style={{ fontSize: '1.75rem' }}>
                {planLabel(subscription.planType)}
              </h2>
              {subscription.status === 'ACTIVE' && (
                <span className="badge badge-blue" style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle size={13} /> Activa
                </span>
              )}
              {subscription.status === 'EXPIRED' && (
                <span className="badge" style={{ backgroundColor: '#fef2f2', color: '#ef4444', border: '1px solid #fca5a5', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertTriangle size={13} /> Vencida
                </span>
              )}
              {subscription.status === 'CANCELLED' && (
                <span className="badge" style={{ backgroundColor: '#f3f4f6', color: '#6b7280', fontSize: '0.875rem' }}>
                  Cancelada
                </span>
              )}
            </div>

            <p className="text-muted" style={{ fontSize: '1rem', marginBottom: '1.25rem' }}>
              {subscription.status === 'ACTIVE' ? 'Vence el' : 'Venció el'}: <strong>{expiresDate}</strong>
            </p>

            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              <div>
                <span className="text-muted" style={{ fontSize: '0.8rem' }}>Tipo de plan</span>
                <p style={{ fontWeight: 600, marginTop: '0.1rem' }}>{planLabel(subscription.planType)}</p>
              </div>
              <div>
                <span className="text-muted" style={{ fontSize: '0.8rem' }}>Cupo máximo</span>
                <p style={{ fontWeight: 600, marginTop: '0.1rem' }}>{limit} servicio{limit !== 1 ? 's' : ''}</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: '180px' }}>
            <button onClick={() => navigate('/planes')} className="btn btn-secondary" style={{ padding: '0.75rem 1.5rem' }}>
              Cambiar de Plan
            </button>
            <button onClick={loadData} className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
              Actualizar estado
            </button>
          </div>
        </div>
      </div>

      {/* Consumo de publicaciones */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 className="text-h3" style={{ fontSize: '1.15rem', marginBottom: '1.25rem' }}>
          Consumo de publicaciones
        </h3>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontWeight: 500 }}>
            {servicesCount} {servicesCount === 1 ? 'servicio publicado' : 'servicios publicados'}
          </span>
          <span className="text-muted">Límite: {limit}</span>
        </div>

        <div style={{ width: '100%', height: '12px', backgroundColor: 'var(--color-border)', borderRadius: 'var(--radius-full)', overflow: 'hidden', marginBottom: '1.25rem' }}>
          <div style={{
            width: `${progressPercent}%`, height: '100%',
            backgroundColor: progressPercent >= 100 ? 'var(--color-secondary)' : 'var(--color-primary)',
            transition: 'width 0.5s ease'
          }} />
        </div>

        {available === 0 ? (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '1rem', backgroundColor: '#fff7ed', color: '#c2410c', borderRadius: 'var(--radius-md)' }}>
            <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            <p style={{ margin: 0, fontWeight: 500 }}>
              Alcanzaste el límite de publicaciones de tu plan.
              {subscription.planType === 'BASIC' && ' Pasá al Plan Doble para publicar hasta 2 servicios.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-text-muted)' }}>
            <CheckCircle size={20} color="var(--color-primary)" />
            <p style={{ margin: 0 }}>Podés publicar {available} servicio{available !== 1 ? 's' : ''} más.</p>
          </div>
        )}
      </div>

      {/* Alerta si vencida */}
      {subscription.status === 'EXPIRED' && (
        <div className="card" style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <AlertTriangle color="#ef4444" size={24} style={{ marginTop: '0.25rem', flexShrink: 0 }} />
          <div>
            <h4 style={{ color: '#b91c1c', fontSize: '1.1rem', marginBottom: '0.4rem', fontWeight: 600 }}>
              Tu suscripción está vencida
            </h4>
            <p style={{ color: '#ef4444', lineHeight: 1.6 }}>
              Tus servicios no son visibles públicamente. Renová tu plan para reactivarlos.
            </p>
            <button className="btn btn-primary" style={{ marginTop: '1rem', backgroundColor: '#ef4444' }} onClick={() => navigate('/planes')}>
              Renovar plan
            </button>
          </div>
        </div>
      )}

      {/* Historial de transacciones */}
      {providerData.transactions && providerData.transactions.length > 0 && (
        <div className="card" style={{ marginTop: '2rem' }}>
          <h3 className="text-h3" style={{ fontSize: '1.15rem', marginBottom: '1.25rem' }}>
            Últimas transacciones
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                  <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>Fecha</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>Plan</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>Monto</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {providerData.transactions.map((tx: any) => (
                  <tr key={tx.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '0.75rem 0.5rem', color: 'var(--color-text-muted)' }}>
                      {new Date(tx.createdAt).toLocaleDateString('es-AR')}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 500 }}>
                      {planLabel(tx.planType)}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      ${Number(tx.amount).toLocaleString('es-AR')}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      {tx.status === 'APPROVED' && <span style={{ color: '#10b981', fontWeight: 500 }}>Aprobado</span>}
                      {tx.status === 'PENDING' && <span style={{ color: '#f59e0b', fontWeight: 500 }}>Pendiente</span>}
                      {(tx.status === 'REJECTED' || tx.status === 'CANCELLED') && <span style={{ color: '#ef4444', fontWeight: 500 }}>Rechazado</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// SUB-PANEL: DATOS FISCALES (Un Solo Uso)
// ==========================================
function ProviderFiscalData() {
  const { data, loading, error, reload } = useProviderMe();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    legalName: '',
    documentNumber: '',
    civilStatus: 'Soltero/a',
    cuit: '',
    fiscalCondition: 'Monotributista',
    fiscalAddress: '',
    iibb: ''
  });

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (data?.profile) {
      const p = data.profile;
      // Pre-poblar si el backend devolviera algun borrador, 
      // pero por regla esto está bloqueado si ya está completo.
      setForm({
        legalName: p.legalName || '',
        documentNumber: p.documentNumber || '',
        civilStatus: p.civilStatus || 'Soltero/a',
        cuit: p.cuit || '',
        fiscalCondition: p.fiscalCondition || 'Monotributista',
        fiscalAddress: p.fiscalAddress || '',
        iibb: p.iibb || ''
      });
    }
  }, [data]);

  const hasOnboarding = Boolean(
    data?.profile?.legalName && data?.profile?.documentNumber && data?.profile?.cuit &&
    data?.profile?.fiscalCondition && data?.profile?.fiscalAddress && data?.profile?.iibb && data?.profile?.civilStatus
  );

  if (loading) return <LoadingCard />;
  if (error) return <ErrorCard message={error} />;
  if (!data) return <ErrorCard message="No se pudieron cargar los datos del perfil." />;

  if (hasOnboarding) {
    return (
      <div className="container flex-center" style={{ minHeight: '50vh' }}>
        <div className="card text-center" style={{ maxWidth: '500px', borderTop: '4px solid #10b981' }}>
          <CheckCircle size={48} color="#10b981" style={{ margin: '0 auto 1.25rem' }} />
          <h2 className="text-h2" style={{ marginBottom: '0.75rem' }}>Datos Fiscales Completos</h2>
          <p className="text-muted" style={{ marginBottom: '1.5rem' }}>Tus datos fiscales ya han sido registrados y no pueden ser modificados. Si encontrás un error, contactá a soporte.</p>
          <button className="btn btn-primary" onClick={() => navigate('/panel-prestador/perfil')}>Volver a Mi Perfil</button>
        </div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSaveError(null);
  };

  const handleConfirmSubmit = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      await fetchApi('/provider/fiscal-data', {
        method: 'POST',
        data: form
      });
      setShowConfirm(false);
      reload();
      navigate('/panel-prestador/perfil');
    } catch (err: any) {
      setSaveError(err.message || 'Error al guardar los datos fiscales');
      setShowConfirm(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="text-h2" style={{ marginBottom: '0.5rem' }}>Carga de Datos Fiscales</h1>
        <p className="text-muted">Por favor, completá los siguientes datos legales para facturación y seguridad. <strong>Esta acción se realiza por única vez y no podrá editarse.</strong></p>
      </div>

      {saveError && <ErrorCard message={saveError} />}

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 className="text-h3" style={{ fontSize: '1.1rem', marginBottom: '1.25rem', color: 'var(--color-primary)' }}>
          <ShieldCheck size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.4rem' }} />
          Información Legal (Privada)
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.4rem' }}>Nombre y apellido completo conforme DNI *</label>
            <input type="text" name="legalName" value={form.legalName} onChange={handleChange} required className="input" style={{ width: '100%' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.4rem' }}>Documento de Identidad (DNI) *</label>
            <input type="text" name="documentNumber" value={form.documentNumber} onChange={handleChange} required className="input" style={{ width: '100%' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.4rem' }}>Estado Civil *</label>
            <select name="civilStatus" value={form.civilStatus} onChange={handleChange} required className="input" style={{ width: '100%', backgroundColor: 'var(--color-bg)' }}>
              <option value="Soltero/a">Soltero/a</option>
              <option value="Casado/a">Casado/a</option>
              <option value="Divorciado/a">Divorciado/a</option>
              <option value="Viudo/a">Viudo/a</option>
              <option value="Unión convivencial">Unión convivencial</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
        </div>

        <h3 className="text-h3" style={{ fontSize: '1.1rem', marginBottom: '1.25rem', color: 'var(--color-primary)', borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
          <FileText size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.4rem' }} />
          Datos Fiscales (Privado)
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.4rem' }}>Número de CUIT/CUIL *</label>
            <input type="text" name="cuit" value={form.cuit} onChange={handleChange} required className="input" style={{ width: '100%' }} placeholder="Sin guiones" />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.4rem' }}>Condición Fiscal *</label>
            <select name="fiscalCondition" value={form.fiscalCondition} onChange={handleChange} required className="input" style={{ width: '100%', backgroundColor: 'var(--color-bg)' }}>
              <option value="Responsable Inscripto">Responsable Inscripto</option>
              <option value="Monotributista">Monotributista</option>
              <option value="Exento">Exento</option>
              <option value="Consumidor Final">Consumidor Final</option>
              <option value="No Responsable">No Responsable</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.4rem' }}>Domicilio Fiscal Completo *</label>
            <input type="text" name="fiscalAddress" value={form.fiscalAddress} onChange={handleChange} required className="input" style={{ width: '100%' }} placeholder="Calle, Número, Piso, Dpto, Localidad" />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.4rem' }}>Nº Inscripción Ingresos Brutos (IIBB) *</label>
            <input type="text" name="iibb" value={form.iibb} onChange={handleChange} required className="input" style={{ width: '100%' }} />
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem', marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button type="button" className="btn btn-outline" onClick={() => navigate('/panel-prestador')}>Cancelar</button>
          <button 
            type="button" 
            className="btn btn-primary" 
            disabled={!form.legalName || !form.documentNumber || !form.cuit || !form.fiscalCondition || !form.fiscalAddress || !form.iibb}
            onClick={() => setShowConfirm(true)}
          >
            Continuar
          </button>
        </div>
      </div>

      {/* Modal de Confirmación */}
      {showConfirm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', animation: 'fadeIn 0.2s ease-out' }}>
            <AlertTriangle size={48} color="#f59e0b" style={{ margin: '0 auto 1.25rem' }} />
            <h2 className="text-h2" style={{ marginBottom: '1rem' }}>¿Confirmás tus datos?</h2>
            <p className="text-muted" style={{ marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Revisalos bien antes de continuar. Una vez enviados, <strong>no podrán modificarse</strong> desde el panel.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn btn-outline" onClick={() => setShowConfirm(false)} disabled={saving}>
                Revisar de nuevo
              </button>
              <button className="btn btn-primary flex-center" onClick={handleConfirmSubmit} disabled={saving} style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}>
                {saving ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                Sí, confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
