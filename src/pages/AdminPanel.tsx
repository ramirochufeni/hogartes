import { Link, Route, Routes, useLocation } from 'react-router-dom';
import { Users, LayoutDashboard, Briefcase, Activity, ShieldCheck, Tag, Settings, CreditCard, FileText, Edit, Trash2, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function AdminPanel() {
  const location = useLocation();
  const { user, isLoading } = useAuth();

  // Guard secundario (el primario es ProtectedRoute en App.tsx).
  // Evita cualquier render parcial si de algún modo se llega aquí sin ser ADMIN.
  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem', color: 'var(--color-text-muted)' }}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
        <p>Verificando acceso...</p>
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
        <ShieldCheck size={40} color="#ef4444" />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Acceso denegado</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>Esta sección es exclusiva para administradores.</p>
      </div>
    );
  }

  const isCurrent = (path: string) => {
    return location.pathname.endsWith(path) || (path === '' && location.pathname === '/panel-admin');
  };

  const navLinkStyle = (path: string) => `btn ${isCurrent(path) ? 'btn-primary' : 'btn-outline'} flex-center`;
  const linkFlexStyle = { justifyContent: 'flex-start', border: 'none', padding: '0.75rem 1rem', gap: '0.75rem' };

  return (
    <div className="container" style={{ padding: '2rem 1.25rem', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
      
      {/* Sidebar Navigation */}
      <aside style={{ flex: '1 1 250px', maxWidth: '300px' }}>
        <div className="card" style={{ padding: '1rem', position: 'sticky', top: '90px' }}>
          <h3 className="text-h3" style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--color-primary)' }}>Centro de Control</h3>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <Link to="/panel-admin" className={navLinkStyle('')} style={linkFlexStyle}>
              <LayoutDashboard size={18} /> Dashboard
            </Link>
            <Link to="/panel-admin/usuarios" className={navLinkStyle('usuarios')} style={linkFlexStyle}>
              <Users size={18} /> Usuarios
            </Link>
            <Link to="/panel-admin/prestadores" className={navLinkStyle('prestadores')} style={linkFlexStyle}>
              <Briefcase size={18} /> Prestadores
            </Link>
            <Link to="/panel-admin/todos-prestadores" className={navLinkStyle('todos-prestadores')} style={linkFlexStyle}>
              <Users size={18} /> Base de Prestadores
            </Link>
            <Link to="/panel-admin/servicios" className={navLinkStyle('servicios')} style={linkFlexStyle}>
              <Activity size={18} /> Servicios
            </Link>
            <Link to="/panel-admin/noticias" className={navLinkStyle('noticias')} style={linkFlexStyle}>
              <FileText size={18} /> Noticias
            </Link>
            <Link to="/panel-admin/mensajes" className={navLinkStyle('mensajes')} style={linkFlexStyle}>
              <Activity size={18} /> Reporte Mensajes
            </Link>
            <Link to="/panel-admin/suscripciones" className={navLinkStyle('suscripciones')} style={linkFlexStyle}>
              <CreditCard size={18} /> Suscripciones
            </Link>
            <Link to="/panel-admin/colaboradores" className={navLinkStyle('colaboradores')} style={linkFlexStyle}>
              <ShieldCheck size={18} /> Colaboradores
            </Link>
            <div style={{ margin: '1rem 0', borderTop: '1px solid var(--color-border)' }}></div>
            <Link to="/panel-admin/categorias" className={navLinkStyle('categorias')} style={linkFlexStyle}>
              <Tag size={18} /> Categorías
            </Link>
            <Link to="/panel-admin/configuracion" className={navLinkStyle('configuracion')} style={linkFlexStyle}>
              <Settings size={18} /> Configuración
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{ flex: '3 1 600px', minWidth: 0 }}>
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/usuarios" element={<AdminUsuarios />} />
          <Route path="/prestadores" element={<AdminPrestadores />} />
          <Route path="/todos-prestadores" element={<AdminTodosLosPrestadores />} />
          <Route path="/servicios" element={<AdminServicios />} />
          <Route path="/noticias" element={<AdminNoticias />} />
          <Route path="/mensajes" element={<AdminReporteMensajes />} />
          <Route path="/suscripciones" element={<AdminSuscripciones />} />
          <Route path="/colaboradores" element={<AdminColaboradores />} />
          <Route path="/categorias" element={<AdminCategorias />} />
          <Route path="/configuracion" element={<AdminConfiguracion />} />
        </Routes>
      </div>
    </div>
  );
}

// ---------------------------------------------
// VISTAS INTERNAS DEL PANEL
// ---------------------------------------------

function AdminDashboard() {
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    fetchApi('/admin/metrics').then(res => setMetrics(res.data)).catch(console.error);
  }, []);

  if (!metrics) {
    return <div className="card" style={{ height: '300px', animation: 'pulse 1.5s infinite' }}></div>;
  }

  return (
    <div>
      <h1 className="text-h2" style={{ marginBottom: '1.5rem' }}>Resumen de la Plataforma</h1>
      
      <div className="grid-3" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <p className="text-muted" style={{ marginBottom: '0.5rem', fontWeight: 500 }}>Usuarios Totales</p>
          <h3 className="text-h1" style={{ fontSize: '2.5rem' }}>{metrics.totalUsers}</h3>
        </div>
        <div className="card">
          <p className="text-muted" style={{ marginBottom: '0.5rem', fontWeight: 500 }}>Prestadores Activos</p>
          <h3 className="text-h1" style={{ fontSize: '2.5rem' }}>{metrics.activeProviders}</h3>
        </div>
        <div className="card" style={{ backgroundColor: 'var(--color-primary-light)', borderColor: 'var(--color-primary-light)' }}>
          <p style={{ color: 'var(--color-primary)', marginBottom: '0.5rem', fontWeight: 500 }}>Suscripciones Activas</p>
          <h3 className="text-h1" style={{ fontSize: '2.5rem', color: 'var(--color-primary-hover)' }}>{metrics.activeSubscriptions}</h3>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 className="text-h3" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Alertas del Sistema</h3>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {metrics.pendingProviders > 0 && (
            <li className="flex-center" style={{ justifyContent: 'flex-start', gap: '1rem', padding: '1rem', backgroundColor: '#fffbeb', color: '#b45309', borderRadius: 'var(--radius-md)' }}>
              <strong>{metrics.pendingProviders} Prestadores</strong> aguardan revisión de identidad.
              <Link to="/panel-admin/prestadores" className="btn btn-outline" style={{ marginLeft: 'auto', padding: '0.25rem 0.75rem', borderColor: '#b45309', color: '#b45309' }}>Revisar</Link>
            </li>
          )}
          {metrics.pendingProviders === 0 && (
            <p className="text-muted">No hay alertas urgentes pendientes.</p>
          )}
        </ul>
      </div>
    </div>
  );
}

function AdminUsuarios() {
  const [users, setUsers] = useState<any[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchApi('/admin/users').then(res => setUsers(res.data)).catch(console.error);
  }, []);

  const handleImpersonate = async (id: string) => {
    try {
      const res = await fetchApi(`/admin/users/${id}/impersonate`, { method: 'POST' });
      localStorage.setItem('adminToken', localStorage.getItem('hogartes_token') || '');
      localStorage.setItem('hogartes_token', res.data.token);
      window.location.href = '/panel-prestador'; // Cambiar a la vista principal
    } catch(err: any) {
      alert(err.message || 'Error al iniciar sesión como usuario');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await fetchApi(`/admin/users/${deleteTarget}`, { method: 'DELETE' });
      // Reload from server to reflect accurate state
      const res = await fetchApi('/admin/users');
      setUsers(res.data);
      setDeleteTarget(null);
    } catch(err: any) {
      alert(err.message || 'Error al eliminar usuario');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <h1 className="text-h2" style={{ marginBottom: '1.5rem' }}>Gestión de Usuarios</h1>
      <div className="card">
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
              <th style={{ padding: '1rem 0', fontWeight: 600 }}>ID</th>
              <th style={{ padding: '1rem 0', fontWeight: 600 }}>Nombre</th>
              <th style={{ padding: '1rem 0', fontWeight: 600 }}>Email</th>
              <th style={{ padding: '1rem 0', fontWeight: 600 }}>Rol / Estado</th>
              <th style={{ padding: '1rem 0', fontWeight: 600 }}>Registro</th>
              <th style={{ padding: '1rem 0', fontWeight: 600 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: '1rem 0' }}>Cargando o sin usuarios...</td></tr>
            ) : (
              users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--color-border)', opacity: u.isDeleted ? 0.5 : 1 }}>
                  <td style={{ padding: '1rem 0', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{u.id.slice(0,8)}...</td>
                  <td style={{ padding: '1rem 0' }}>{u.name}</td>
                  <td style={{ padding: '1rem 0', color: 'var(--color-text-muted)' }}>{u.email}</td>
                  <td style={{ padding: '1rem 0' }}>
                    <span className="badge badge-gray">{u.role}</span>
                    {u.isDeleted && <span className="badge" style={{ backgroundColor: '#fef2f2', color: '#ef4444', marginLeft: '0.5rem' }}>Eliminado</span>}
                  </td>
                  <td style={{ padding: '1rem 0' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '1rem 0', display: 'flex', gap: '0.5rem' }}>
                    <button disabled={u.isDeleted} onClick={() => handleImpersonate(u.id)} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>Entrar</button>
                    <button disabled={u.isDeleted} onClick={(e) => { e.stopPropagation(); setDeleteTarget(u.id); }} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', color: '#ef4444', borderColor: '#ef4444' }}>Eliminar</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {deleteTarget && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Confirmar Eliminación</h3>
            <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-muted)' }}>¿Estás seguro de querer desactivar/eliminar lógicamente este usuario?</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button disabled={isDeleting} onClick={() => setDeleteTarget(null)} className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>Cancelar</button>
              <button disabled={isDeleting} onClick={handleDeleteConfirm} className="btn btn-primary" style={{ padding: '0.5rem 1rem', backgroundColor: '#ef4444', borderColor: '#ef4444' }}>
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminPrestadores() {
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPending = () => {
    setLoading(true);
    fetchApi('/admin/providers/pending')
      .then(res => setPending(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadPending(); }, []);

  const handleUpdate = async (id: string, status: 'VERIFIED' | 'REJECTED') => {
    try {
      if(!window.confirm(`¿Estás seguro de querer ${status === 'VERIFIED' ? 'APROBAR' : 'RECHAZAR'} a este prestador?`)) return;
      await fetchApi(`/admin/providers/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ verificationStatus: status })
      });
      loadPending();
    } catch(err) {
      console.error(err);
      alert('Hubo un error al actualizar el estado.');
    }
  };

  return (
    <div>
      <h1 className="text-h2" style={{ marginBottom: '1.5rem' }}>Verificación de Prestadores (Pendientes)</h1>
      <div className="card">
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
              <th style={{ padding: '1rem 0', fontWeight: 600 }}>Titular / Comercio</th>
              <th style={{ padding: '1rem 0', fontWeight: 600 }}>Contacto</th>
              <th style={{ padding: '1rem 0', fontWeight: 600 }}>Télefono</th>
              <th style={{ padding: '1rem 0', fontWeight: 600 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
               <tr><td colSpan={4} style={{ padding: '1rem 0' }}>Cargando...</td></tr>
            ) : pending.length === 0 ? (
               <tr><td colSpan={4} style={{ padding: '1rem 0' }}>No hay perfiles pendientes de revisión.</td></tr>
            ) : (
               pending.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '1rem 0' }}>
                    <strong>{p.user?.name || 'Vacio'}</strong>
                  </td>
                  <td style={{ padding: '1rem 0', color: 'var(--color-text-muted)' }}>{p.user?.email}</td>
                  <td style={{ padding: '1rem 0' }}>{p.phone || 'No especificado'}</td>
                  <td style={{ padding: '1rem 0', display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => handleUpdate(p.id, 'VERIFIED')} className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', borderColor: '#10b981', color: '#10b981' }}>Aprobar</button>
                    <button onClick={() => handleUpdate(p.id, 'REJECTED')} className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', borderColor: '#ef4444', color: '#ef4444' }}>Rechazar</button>
                  </td>
                </tr>
               ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminServicios() {
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    fetchApi('/admin/services').then(res => setServices(res.data)).catch(console.error);
  }, []);

  return (
    <div>
      <h1 className="text-h2" style={{ marginBottom: '1.5rem' }}>Publicaciones y Servicios</h1>
      <div className="card">
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
              <th style={{ padding: '1rem 0', fontWeight: 600 }}>Publicación</th>
              <th style={{ padding: '1rem 0', fontWeight: 600 }}>Prestador</th>
              <th style={{ padding: '1rem 0', fontWeight: 600 }}>Categoría</th>
              <th style={{ padding: '1rem 0', fontWeight: 600 }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {services.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: '1rem 0' }}>No hay servicios cargados.</td></tr>
            ) : (
              services.map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '1rem 0' }}>{s.title}</td>
                  <td style={{ padding: '1rem 0', color: 'var(--color-text-muted)' }}>{s.provider?.user?.name || 'User'}</td>
                  <td style={{ padding: '1rem 0', color: 'var(--color-text-muted)' }}>{s.subcategory?.category?.name || '-'}</td>
                  <td style={{ padding: '1rem 0' }}>
                    {(() => {
                      const sub = s.provider?.subscription;
                      const hasActiveSub = sub?.status === 'ACTIVE' && new Date(sub.expiresAt) > new Date();
                      if (!s.isActive) return <span className="badge badge-gray">Inactivo (Manual)</span>;
                      if (!hasActiveSub) return <span className="badge" style={{ backgroundColor: '#fef2f2', color: '#ef4444' }}>Oculto (Sub. Inactiva)</span>;
                      return <span className="badge badge-blue">Activo</span>;
                    })()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminSuscripciones() {
  const [subs, setSubs] = useState<any[]>([]);

  useEffect(() => {
    fetchApi('/admin/subscriptions').then(res => setSubs(res.data)).catch(console.error);
  }, []);

  return (
    <div>
      <h1 className="text-h2" style={{ marginBottom: '1.5rem' }}>Facturación y Planes</h1>
      <div className="card">
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
              <th style={{ padding: '1rem 0', fontWeight: 600 }}>Prestador</th>
              <th style={{ padding: '1rem 0', fontWeight: 600 }}>Plan</th>
              <th style={{ padding: '1rem 0', fontWeight: 600 }}>Renovación</th>
              <th style={{ padding: '1rem 0', fontWeight: 600 }}>Estado de Pago</th>
            </tr>
          </thead>
          <tbody>
            {subs.length === 0 ? (
               <tr><td colSpan={4} style={{ padding: '1rem 0' }}>No hay suscripciones registradas.</td></tr>
            ) : (
               subs.map(sb => (
                <tr key={sb.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '1rem 0' }}>{sb.provider?.user?.name || '-'}</td>
                  <td style={{ padding: '1rem 0', fontWeight: 500, color: ['DOUBLE', 'SEMESTER', 'YEARLY'].includes(sb.planType) ? 'var(--color-secondary)' : 'inherit' }}>
                    {sb.planType === 'MONTHLY' ? 'Plan Mensual' : sb.planType === 'QUARTERLY' ? 'Plan Trimestral' : sb.planType === 'SEMESTER' ? 'Plan Semestral' : sb.planType === 'YEARLY' ? 'Plan Anual' : `Plan ${sb.planType}`}
                  </td>
                  <td style={{ padding: '1rem 0' }}>{new Date(sb.expiresAt).toLocaleDateString()}</td>
                  <td style={{ padding: '1rem 0' }}>
                    <span className={`badge ${sb.status === 'ACTIVE' ? 'badge-blue' : ''}`} style={sb.status !== 'ACTIVE' ? { backgroundColor: '#fef2f2', color: '#ef4444' } : {}}>
                      {sb.status === 'ACTIVE' ? 'Al día (Activo)' : 'Vencido / Cancelado'}
                    </span>
                  </td>
                </tr>
               ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminColaboradores() {
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', code: '' });

  const loadCollaborators = () => fetchApi('/admin/collaborators').then(res => setCollaborators(res.data)).catch(console.error);

  useEffect(() => { loadCollaborators(); }, []);

  const handleCreate = async () => {
    if(!form.name || !form.code) return alert('Campos incompletos');
    try {
      await fetchApi('/admin/collaborators', { method: 'POST', body: JSON.stringify(form) });
      setForm({ name: '', code: '' });
      setShowForm(false);
      loadCollaborators();
    } catch {
      alert('Error al crear colaborador (el código podría estar en uso)');
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await fetchApi(`/admin/collaborators/${id}/status`, { 
        method: 'PATCH', 
        body: JSON.stringify({ isActive: !currentStatus }) 
      });
      loadCollaborators();
    } catch {
      alert('Error al actualizar el estado del colaborador');
    }
  };

  const totalSubscriptions = collaborators.reduce((acc, c) => acc + (c._count?.subscriptions || 0), 0);

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <h1 className="text-h2">Red de Colaboradores</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">{showForm ? 'Cancelar' : 'Nuevo Colaborador'}</button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '2rem', backgroundColor: 'var(--color-bg)' }}>
          <h3 className="text-h3" style={{ marginBottom: '1rem', fontSize: '1.125rem' }}>Alta de Colaborador</h3>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <input type="text" placeholder="Nombre completo" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="card" style={{ flex: 1, padding: '0.75rem', boxShadow: 'none' }} />
            <input type="text" placeholder="Código Único (Ej: JUAN001)" value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} className="card" style={{ flex: 1, padding: '0.75rem', boxShadow: 'none' }} />
            <button onClick={handleCreate} className="btn btn-secondary">Guardar Colaborador</button>
          </div>
        </div>
      )}
      
      <div className="grid-3" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <p className="text-muted" style={{ marginBottom: '0.5rem', fontWeight: 500 }}>Colaboradores Registrados</p>
          <h3 className="text-h1" style={{ fontSize: '2rem' }}>{collaborators.length}</h3>
        </div>
        <div className="card" style={{ backgroundColor: 'var(--color-primary-light)', borderColor: 'var(--color-primary-light)' }}>
          <p style={{ color: 'var(--color-primary)', marginBottom: '0.5rem', fontWeight: 500 }}>Suscripciones Atraídas (Total)</p>
          <h3 className="text-h1" style={{ fontSize: '2rem', color: 'var(--color-primary-hover)' }}>{totalSubscriptions}</h3>
        </div>
      </div>

      <div className="card">
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
              <th style={{ padding: '1rem 0', fontWeight: 600 }}>Colaborador</th>
              <th style={{ padding: '1rem 0', fontWeight: 600 }}>Código</th>
              <th style={{ padding: '1rem 0', fontWeight: 600 }}>Suscripciones Asoc.</th>
              <th style={{ padding: '1rem 0', fontWeight: 600 }}>Estado</th>
              <th style={{ padding: '1rem 0', fontWeight: 600 }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {collaborators.length === 0 ? (
               <tr><td colSpan={5} style={{ padding: '1rem 0' }}>No hay colaboradores registrados.</td></tr>
            ) : (
               collaborators.map(c => (
                 <tr key={c.id} style={{ borderBottom: '1px solid var(--color-border)', verticalAlign: 'top' }}>
                   <td style={{ padding: '1rem 0' }}>{c.name}</td>
                   <td style={{ padding: '1rem 0', fontWeight: 600, color: 'var(--color-primary)' }}>{c.code}</td>
                   <td style={{ padding: '1rem 0' }}>
                     <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{c._count?.subscriptions || 0} totales</div>
                     {c.subscriptions && c.subscriptions.length > 0 && (
                       <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem' }}>
                         {c.subscriptions.map((sub: any) => (
                           <li key={sub.id} style={{ marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px dotted var(--color-border)' }}>
                             <strong>{sub.provider?.user?.name || 'Usuario desconocido'}</strong> 
                             <span style={{ color: 'var(--color-text-muted)', marginLeft: '4px' }}>({sub.provider?.user?.email || 'sin email'})</span>
                             <div style={{ marginTop: '2px', color: 'var(--color-primary)' }}>
                               Plan {sub.planType.replace('MONTHLY', 'Mensual').replace('QUARTERLY', 'Trimestral').replace('SEMESTER', 'Semestral').replace('YEARLY', 'Anual')} - Vence: {new Date(sub.expiresAt).toLocaleDateString('es-AR')}
                             </div>
                           </li>
                         ))}
                       </ul>
                     )}
                   </td>
                   <td style={{ padding: '1rem 0' }}>
                     <span className={`badge ${c.isActive ? 'badge-blue' : 'badge-gray'}`}>
                       {c.isActive ? 'Activo' : 'Inactivo'}
                     </span>
                   </td>
                   <td style={{ padding: '1rem 0' }}>
                     <button onClick={() => toggleStatus(c.id, c.isActive)} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>
                       {c.isActive ? 'Desactivar' : 'Activar'}
                     </button>
                   </td>
                 </tr>
               ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminCategorias() {
  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <h1 className="text-h2">Taxonomías y Categorías</h1>
        <button className="btn btn-primary">Nueva regla</button>
      </div>
      <div className="card text-center" style={{ padding: '4rem 2rem' }}>
        <Tag size={48} color="var(--color-text-muted)" style={{ margin: '0 auto 1rem' }} />
        <h3 className="text-h3" style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Estructura principal</h3>
        <p className="text-muted">La edición visual de subrubros estará habilitada para el administrador en la próxima actualización del motor de base de datos.</p>
      </div>
    </div>
  );
}

function AdminConfiguracion() {
  return (
    <div>
      <h1 className="text-h2" style={{ marginBottom: '1.5rem' }}>Configuración Global</h1>
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        <div>
          <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem' }}>Estado de la plataforma</label>
          <select className="card" style={{ width: '100%', maxWidth: '300px', padding: '0.75rem', boxShadow: 'none' }}>
            <option>Operativa</option>
            <option>Mantenimiento programado</option>
          </select>
        </div>

        <hr style={{ borderTop: '1px solid var(--color-border)', margin: '1rem 0' }} />

        <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Guardar Cambios Base</button>
      </div>
    </div>
  );
}

function AdminNoticias() {
  const [news, setNews] = useState<any[]>([]);
  const [draft, setDraft] = useState({ title: '', content: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editingNews, setEditingNews] = useState<any | null>(null);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editSaving, setEditSaving] = useState(false);

  const loadNews = () => fetchApi('/admin/news').then(res => setNews(res.data)).catch(console.error);

  useEffect(() => { loadNews(); }, []);

  const handleCreate = async () => {
    if(!draft.title || !draft.content) return alert('Completá título y cuerpo');
    try {
      let imageUrl = null;
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        const uploadRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/upload`, {
          method: 'POST',
          body: formData
        });
        const uploadData = await uploadRes.json();
        imageUrl = uploadData.url;
      }

      await fetchApi('/admin/news', {
        method: 'POST',
        body: JSON.stringify({ ...draft, status: 'PUBLISHED', imageUrl })
      });
      setDraft({ title: '', content: '' });
      setImageFile(null);
      loadNews();
    } catch(err) {
      alert('Error creando noticia o subiendo imagen');
    }
  };

  const handleDelete = async (id: string) => {
    if(!window.confirm('¿Borrar definitivamente?')) return;
    try {
      await fetchApi(`/admin/news/${id}`, { method: 'DELETE' });
      loadNews();
    } catch(err) {
      alert('Error al borrar');
    }
  };

  const startEdit = (n: any) => {
    setEditingNews({ id: n.id, title: n.title, content: n.content, imageUrl: n.imageUrl || '' });
    setEditImageFile(null);
  };

  const cancelEdit = () => {
    setEditingNews(null);
    setEditImageFile(null);
  };

  const handleEditSave = async () => {
    if (!editingNews) return;
    if (!editingNews.title || !editingNews.content) return alert('Completá título y cuerpo');
    setEditSaving(true);
    try {
      let imageUrl = editingNews.imageUrl || null;

      if (editImageFile) {
        const formData = new FormData();
        formData.append('image', editImageFile);
        const uploadRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/upload`, {
          method: 'POST',
          body: formData
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || 'Error al subir imagen');
        imageUrl = uploadData.url;
      }

      await fetchApi(`/admin/news/${editingNews.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: editingNews.title,
          content: editingNews.content,
          status: 'PUBLISHED',
          imageUrl
        })
      });
      setEditingNews(null);
      setEditImageFile(null);
      loadNews();
    } catch(err: any) {
      alert(err.message || 'Error al guardar la noticia');
    } finally {
      setEditSaving(false);
    }
  };

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <h1 className="text-h2">Blog y Noticias</h1>
      </div>

      {/* Formulario de edición inline */}
      {editingNews && (
        <div className="card" style={{ marginBottom: '2rem', border: '2px solid var(--color-primary)', backgroundColor: 'var(--color-bg)' }}>
          <div className="flex-between" style={{ marginBottom: '1rem' }}>
            <h3 className="text-h3" style={{ fontSize: '1.125rem', color: 'var(--color-primary)' }}>Editando noticia</h3>
            <button onClick={cancelEdit} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '1.25rem' }}>✕</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              type="text"
              placeholder="Título de la Noticia"
              value={editingNews.title}
              onChange={e => setEditingNews({ ...editingNews, title: e.target.value })}
              className="card" style={{ width: '100%', padding: '0.75rem', boxShadow: 'none' }}
            />
            <textarea
              placeholder="Cuerpo del texto..."
              value={editingNews.content}
              onChange={e => setEditingNews({ ...editingNews, content: e.target.value })}
              className="card" rows={4} style={{ width: '100%', padding: '0.75rem', boxShadow: 'none' }}
            />
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                Imagen de portada (dejar vacío para mantener la actual)
              </label>
              {editingNews.imageUrl && !editImageFile && (
                <div style={{ marginBottom: '0.5rem' }}>
                  <img src={`http://localhost:5000${editingNews.imageUrl}`} alt="Imagen actual"
                    style={{ height: '80px', borderRadius: '8px', objectFit: 'cover' }} />
                  <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Imagen actual</p>
                </div>
              )}
              <input type="file" accept="image/*" onChange={e => setEditImageFile(e.target.files?.[0] || null)} />
              {editImageFile && <span className="text-muted" style={{ marginLeft: '1rem', fontSize: '0.875rem' }}>{editImageFile.name}</span>}
            </div>
            <div className="flex-center" style={{ justifyContent: 'flex-end', gap: '1rem' }}>
              <button onClick={cancelEdit} className="btn btn-outline" style={{ padding: '0.5rem 1rem' }} disabled={editSaving}>Cancelar</button>
              <button onClick={handleEditSave} className="btn btn-primary" style={{ padding: '0.5rem 1rem' }} disabled={editSaving}>
                {editSaving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Formulario nueva noticia */}
      {!editingNews && (
        <div className="card" style={{ marginBottom: '2rem', backgroundColor: 'var(--color-bg)' }}>
          <h3 className="text-h3" style={{ marginBottom: '1rem', fontSize: '1.125rem', color: 'var(--color-primary)' }}>Escribir Nueva Publicación</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              type="text"
              placeholder="Título de la Noticia"
              value={draft.title}
              onChange={e => setDraft({ ...draft, title: e.target.value })}
              className="card" style={{ width: '100%', padding: '0.75rem', boxShadow: 'none' }}
            />
            <textarea
              placeholder="Cuerpo del texto..."
              value={draft.content}
              onChange={e => setDraft({ ...draft, content: e.target.value })}
              className="card" rows={3} style={{ width: '100%', padding: '0.75rem', boxShadow: 'none' }}
            />
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Imagen de Portada (Opcional)</label>
              <input type="file" onChange={e => setImageFile(e.target.files?.[0] || null)} />
              {imageFile && <span className="text-muted" style={{ marginLeft: '1rem', fontSize: '0.875rem' }}>{imageFile.name} (Lista para publicar)</span>}
            </div>
            <div className="flex-center" style={{ justifyContent: 'flex-end', gap: '1rem' }}>
              <button onClick={() => { setDraft({ title: '', content: '' }); setImageFile(null); }} className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>Cancelar</button>
              <button onClick={handleCreate} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>Publicar Inmediato</button>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <h3 className="text-h3" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Artículos Publicados</h3>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
              <th style={{ padding: '1rem 0', fontWeight: 600 }}>Título</th>
              <th style={{ padding: '1rem 0', fontWeight: 600 }}>Fecha</th>
              <th style={{ padding: '1rem 0', fontWeight: 600 }}>Estado</th>
              <th style={{ padding: '1rem 0', fontWeight: 600 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {news.length === 0 ? (
               <tr><td colSpan={4} style={{ padding: '1rem 0' }}>Aún no has publicado noticias.</td></tr>
            ) : (
               news.map(n => (
                 <tr key={n.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                   <td style={{ padding: '1rem 0', maxWidth: '250px' }}>
                      <div style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.title}</div>
                   </td>
                   <td style={{ padding: '1rem 0', color: 'var(--color-text-muted)' }}>{new Date(n.createdAt).toLocaleDateString()}</td>
                   <td style={{ padding: '1rem 0' }}>
                      <span className="badge badge-blue">{n.status === 'PUBLISHED' ? 'Pública' : 'Borrador'}</span>
                   </td>
                   <td style={{ padding: '1rem 0', display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => startEdit(n)} className="btn flex-center" style={{ padding: '0.5rem', backgroundColor: '#eff6ff', color: '#2563eb', border: 'none' }}><Edit size={16} /></button>
                      <button onClick={() => handleDelete(n.id)} className="btn flex-center" style={{ padding: '0.5rem', backgroundColor: '#fef2f2', color: '#ef4444', border: 'none' }}><Trash2 size={16} /></button>
                   </td>
                 </tr>
               ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminTodosLosPrestadores() {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchApi('/admin/providers')
      .then(res => setProviders(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statusColor = (s: string) => {
    if (s === 'VERIFIED') return { bg: '#d1fae5', color: '#065f46' };
    if (s === 'REJECTED') return { bg: '#fef2f2', color: '#b91c1c' };
    return { bg: '#fef3c7', color: '#b45309' };
  };
  const statusLabel = (s: string) => s === 'VERIFIED' ? 'Verificado' : s === 'REJECTED' ? 'Rechazado' : 'Pendiente';

  const Field = ({ label, value }: { label: string; value?: string | null }) => (
    <div>
      <p style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-text-muted)', marginBottom: '0.1rem' }}>{label}</p>
      <p style={{ fontSize: '0.9rem', color: value ? 'var(--color-text-main)' : 'var(--color-text-muted)', fontStyle: value ? 'normal' : 'italic', margin: 0 }}>
        {value || '—'}
      </p>
    </div>
  );

  return (
    <div>
      <h1 className="text-h2" style={{ marginBottom: '0.5rem' }}>Base de Prestadores</h1>
      <p className="text-muted" style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        Formularios completos de onboarding. Datos sensibles visibles solo desde el panel admin.
      </p>

      {loading ? (
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-text-muted)' }}>
          <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> Cargando prestadores...
        </div>
      ) : providers.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
          <p className="text-muted">No hay prestadores registrados aún.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {providers.map(p => {
            const isOpen = expandedId === p.id;
            const sc = statusColor(p.verificationStatus);
            return (
              <div key={p.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <button
                  onClick={() => setExpandedId(isOpen ? null : p.id)}
                  style={{
                    width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem',
                    textAlign: 'left', flexWrap: 'wrap'
                  }}
                >
                  <div style={{ flex: 1, minWidth: '180px' }}>
                    <p style={{ fontWeight: 600, margin: 0 }}>{p.user?.name || '—'}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>{p.user?.email}</p>
                    {p.publicUsername && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-primary)', margin: 0, marginTop: '2px' }}>@{p.publicUsername}</p>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span style={{ padding: '2px 10px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 600, backgroundColor: sc.bg, color: sc.color }}>
                      {statusLabel(p.verificationStatus)}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                      {p._count?.services || 0} servicio(s)
                    </span>
                    {p.subscription && (
                      <span className="badge badge-blue" style={{ fontSize: '0.75rem' }}>
                        {p.subscription.planType} · {p.subscription.status}
                      </span>
                    )}
                  </div>
                  <div style={{ marginLeft: 'auto', color: 'var(--color-text-muted)' }}>
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </button>

                {isOpen && (
                  <div style={{ borderTop: '1px solid var(--color-border)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', backgroundColor: 'var(--color-bg)' }}>
                    <div>
                      <p style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
                        Cuenta y Contacto Público
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '0.75rem' }}>
                        <Field label="Usuario público" value={p.publicUsername} />
                        <Field label="Teléfono" value={p.phone} />
                        <Field label="Email de contacto" value={p.contactEmail} />
                        <Field label="Ciudad" value={p.city} />
                        <Field label="Provincia" value={p.province} />
                        <Field label="Bio" value={p.bio} />
                      </div>
                    </div>

                    <div>
                      <p style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
                        Información Legal (Privada)
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '0.75rem' }}>
                        <Field label="Nombre legal (DNI)" value={p.legalName} />
                        <Field label="N° Documento" value={p.documentNumber} />
                        <Field label="Estado civil" value={p.civilStatus} />
                      </div>
                    </div>

                    <div>
                      <p style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
                        Datos Fiscales (Privados)
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '0.75rem' }}>
                        <Field label="CUIT/CUIL" value={p.cuit} />
                        <Field label="Condición fiscal" value={p.fiscalCondition} />
                        <Field label="Domicilio fiscal" value={p.fiscalAddress} />
                        <Field label="IIBB" value={p.iibb} />
                      </div>
                    </div>

                    <p style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', marginTop: '-0.5rem' }}>
                      Registrado: {new Date(p.createdAt).toLocaleDateString('es-AR')} · ID: {p.id}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AdminReporteMensajes() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi('/admin/reports/messages')
      .then(res => setReports(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-h2" style={{ marginBottom: '1.5rem' }}>Reporte de Mensajes</h1>
      <div className="card">
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
              <th style={{ padding: '1rem 0', fontWeight: 600 }}>Mes (Año-Mes)</th>
              <th style={{ padding: '1rem 0', fontWeight: 600 }}>Total Mensajes</th>
              <th style={{ padding: '1rem 0', fontWeight: 600 }}>Mensajes No Leídos</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} style={{ padding: '1rem 0' }}>Cargando...</td></tr>
            ) : reports.length === 0 ? (
              <tr><td colSpan={3} style={{ padding: '1rem 0' }}>No hay datos de mensajes.</td></tr>
            ) : (
              reports.map(r => (
                <tr key={r.month} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '1rem 0', fontWeight: 500 }}>{r.month}</td>
                  <td style={{ padding: '1rem 0' }}>{r.total}</td>
                  <td style={{ padding: '1rem 0' }}>
                    <span className={`badge ${r.unread > 0 ? 'badge-blue' : 'badge-gray'}`} style={r.unread > 0 ? { backgroundColor: '#fef2f2', color: '#ef4444' } : {}}>
                      {r.unread}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
