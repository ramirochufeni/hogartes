import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, PlusCircle, User, Menu, X, Settings, ShieldCheck, ChevronDown, ChevronUp, ChevronRight, Package, Bell, MessageSquare, Star, Info, AlertTriangle } from 'lucide-react';

import { mockClientNotifications, mockProviderNotifications, mockAdminNotifications } from '../../lib/mockNotifications';
import type { NotificationRole, NotificationType } from '../../lib/mockNotifications';
import { fetchApi } from '../../lib/api';
import type { Category } from '../../lib/types';
import { useAuth } from '../../context/AuthContext';

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const activeRole = (user?.role as NotificationRole) || 'CLIENT';

  const adminToken = localStorage.getItem('adminToken');
  const isImpersonating = !!adminToken;

  const handleStopImpersonation = () => {
    const originalToken = localStorage.getItem('adminToken');
    if (originalToken) {
      localStorage.setItem('hogartes_token', originalToken);
      localStorage.removeItem('adminToken');
      window.location.href = '/panel-admin/usuarios';
    }
  };

  const [isCategoriesHovered, setIsCategoriesHovered] = useState(false);
  const [isMobileCategoriesOpen, setIsMobileCategoriesOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchApi('/catalog/categories')
      .then(({ data }) => setCategories(data))
      .catch(() => setCategories([]));
  }, []);

  // Real unread messages badge: poll every 30s when authenticated
  useEffect(() => {
    if (!isAuthenticated) { setUnreadMessages(0); return; }
    const fetchUnread = () => {
      fetchApi('/conversations/unread-count')
        .then(({ data }) => setUnreadMessages(typeof data?.count === 'number' ? data.count : 0))
        .catch(() => setUnreadMessages(0));
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const closeMenu = () => {
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
    setIsNotificationsOpen(false);
    setIsCategoriesHovered(false);
  };

  const toggleMenu = () => {
    if (!isMobileMenuOpen) closeMenu();
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    closeMenu();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    navigate(`/explorar${params.toString() ? `?${params.toString()}` : ''}`);
    setSearchQuery('');
  };

  const getNotificationsList = (role: NotificationRole) => {
    switch (role) {
      case 'CLIENT': return mockClientNotifications;
      case 'PROVIDER': return mockProviderNotifications;
      case 'ADMIN': return mockAdminNotifications;
      default: return [];
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'message': return <MessageSquare size={16} />;
      case 'review': return <Star size={16} />;
      case 'subscription': return <Package size={16} />;
      case 'alert': return <AlertTriangle size={16} />;
      case 'system': return <Info size={16} />;
      default: return <Bell size={16} />;
    }
  };

  const getNotificationIconColor = (type: NotificationType) => {
    switch (type) {
      case 'message': return 'var(--color-primary)';
      case 'review': return 'var(--color-secondary)';
      case 'subscription': return '#8b5cf6';
      case 'alert': return '#ef4444';
      case 'system': return '#3b82f6';
      default: return 'var(--color-text-muted)';
    }
  };

  const currentNotifications = getNotificationsList(activeRole);
  const unreadCount = currentNotifications.filter(n => !n.isRead).length;

  return (
    <header style={{
      backgroundColor: 'var(--color-surface)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: 'var(--shadow-sm)',
      borderBottom: '1px solid var(--color-border)'
    }}>
      {isImpersonating && (
        <div style={{ backgroundColor: '#ef4444', color: 'white', padding: '0.5rem', textAlign: 'center', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
          <span>⚠️ MODO ADMIN: Estás actuando como {user?.name || 'otro usuario'}</span>
          <button onClick={handleStopImpersonation} style={{ backgroundColor: 'white', color: '#ef4444', border: 'none', padding: '0.2rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Volver al Admin
          </button>
        </div>
      )}
      <div className="container">

        {/* Superior Row - Desktop Layout */}
        <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', justifyItems: 'space-between', paddingTop: '1rem', paddingBottom: '0.75rem', gap: '2rem' }}>

          <Link to="/" onClick={closeMenu} className="flex-center" style={{ gap: '0.5rem', flexShrink: 0 }}>
            <div style={{ width: '42px', height: '42px', backgroundColor: 'var(--color-primary)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.25rem' }}>
              H
            </div>
            <span className="text-h3" style={{ color: 'var(--color-primary)', fontSize: '1.5rem' }}>Hog<span style={{ color: 'var(--color-secondary)' }}>Artes</span></span>
          </Link>

          <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: '600px', display: 'flex', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
            <input
              type="text"
              placeholder="Buscar servicios, categorías o profesionales..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ flex: 1, padding: '0.75rem 1rem', border: 'none', outline: 'none', backgroundColor: 'transparent', fontSize: '1rem' }}
            />
            <button type="submit" style={{ padding: '0 1.25rem', backgroundColor: 'var(--color-bg)', borderLeft: '1px solid var(--color-border)', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
              <Search size={20} />
            </button>
          </form>

          {/* Acciones Right Desktop */}
          <div className="flex-center" style={{ gap: '1.25rem', flexShrink: 0, marginLeft: 'auto' }}>

            {activeRole === 'PROVIDER' && (
              <Link to="/publicar" className="flex-center text-hover-primary" style={{ gap: '0.5rem', fontWeight: 500, color: 'var(--color-primary)' }}>
                <PlusCircle size={18} />
                Publicar
              </Link>
            )}

            <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--color-border)' }}></div>

            {isAuthenticated ? (
              <div className="flex-center" style={{ gap: '1.25rem' }}>

                {/* Messages Icon */}
                <Link
                  to="/mensajes"
                  className="text-hover-primary flex-center"
                  style={{ position: 'relative', color: 'var(--color-text-main)' }}
                  onClick={() => setUnreadMessages(0)}
                >
                  <MessageSquare size={22} />
                  {unreadMessages > 0 && (
                    <span style={{
                      position: 'absolute', top: '-6px', right: '-8px',
                      backgroundColor: '#ef4444', color: 'white',
                      fontSize: '0.6rem', fontWeight: 'bold',
                      minWidth: '16px', height: '16px',
                      borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      padding: '0 2px'
                    }}>
                      {unreadMessages > 9 ? '9+' : unreadMessages}
                    </span>
                  )}
                </Link>

                {/* Notifications Bell */}
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => { setIsNotificationsOpen(!isNotificationsOpen); setIsDropdownOpen(false); setIsCategoriesHovered(false); }}
                    className="text-hover-primary flex-center"
                    style={{ position: 'relative', color: 'var(--color-text-main)' }}
                  >
                    <Bell size={22} />
                    {unreadCount > 0 && (
                      <span style={{ position: 'absolute', top: '-6px', right: '-8px', backgroundColor: '#ef4444', color: 'white', fontSize: '0.65rem', fontWeight: 'bold', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown Panel */}
                  {isNotificationsOpen && (
                    <div className="card" style={{ position: 'absolute', top: '150%', right: '-40px', width: '320px', padding: 0, display: 'flex', flexDirection: 'column', zIndex: 100, boxShadow: 'var(--shadow-lg)', overflow: 'hidden' }}>
                      <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600 }}>Notificaciones</span>
                        <button style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 500 }}>Marcar leídas</button>
                      </div>

                      <div style={{ padding: '0.5rem 1rem', display: 'flex', gap: '0.5rem', backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
                        <div style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-primary)', color: 'white', fontWeight: 500 }}>
                          {activeRole === 'CLIENT' ? 'Cliente' : activeRole === 'PROVIDER' ? 'Suscriptor' : 'Admin'}
                        </div>
                      </div>

                      <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                        {currentNotifications.length === 0 ? (
                          <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                            <Bell size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.3 }} />
                            <p style={{ fontSize: '0.875rem' }}>Todavía no tenés notificaciones.</p>
                          </div>
                        ) : (
                          currentNotifications.map(notif => (
                            <div key={notif.id} onClick={() => navigate(notif.link || '#!')} style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)', display: 'flex', gap: '0.75rem', backgroundColor: notif.isRead ? 'transparent' : 'var(--color-primary-light)', opacity: notif.isRead ? 1 : 0.9, transition: 'background-color 0.2s', cursor: 'pointer' }} className="card-hover-bg">
                              <div style={{ color: getNotificationIconColor(notif.type), marginTop: '0.1rem', backgroundColor: 'var(--color-bg)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                {getNotificationIcon(notif.type)}
                              </div>
                              <div style={{ flex: 1 }}>
                                <p style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--color-text-main)', marginBottom: '0.1rem', lineHeight: 1.2 }}>{notif.title}</p>
                                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.3 }}>{notif.message}</p>
                                <span style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.25rem', display: 'block' }}>{notif.timestamp}</span>
                              </div>
                              {!notif.isRead && (
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', flexShrink: 0, marginTop: '0.3rem' }} />
                              )}
                            </div>
                          ))
                        )}
                      </div>

                      <div style={{ padding: '0.75rem', textAlign: 'center', borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
                        <button onClick={closeMenu} style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-primary)' }}>
                          Ver todas las notificaciones
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--color-border)' }}></div>

                {/* Profile menu */}
                <div style={{ position: 'relative' }}>
                  <button
                    className="flex-center text-hover-primary"
                    onClick={() => { setIsDropdownOpen(!isDropdownOpen); setIsNotificationsOpen(false); setIsCategoriesHovered(false); }}
                    style={{ gap: '0.5rem', fontWeight: 500, color: 'var(--color-text-main)', border: 'none', background: 'none' }}
                  >
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <User size={16} />
                    </div>
                    Mi Cuenta
                    <ChevronDown size={14} />
                  </button>

                  {isDropdownOpen && (
                    <div className="card" style={{ position: 'absolute', top: '120%', right: 0, minWidth: '220px', padding: '0.5rem', display: 'flex', flexDirection: 'column', zIndex: 100, boxShadow: 'var(--shadow-lg)' }}>
                      <div style={{ padding: '0.75rem', borderBottom: '1px solid var(--color-border)', marginBottom: '0.5rem' }}>
                        <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user?.name}</p>
                        <p className="text-muted" style={{ fontSize: '0.8rem' }}>{activeRole === 'PROVIDER' ? 'Suscriptor' : activeRole === 'ADMIN' ? 'Administrador' : 'Cliente'}</p>
                      </div>
                      {activeRole === 'CLIENT' && (
                        <button onClick={() => { navigate('/registro-proveedor'); closeMenu(); }} className="btn-primary flex-center" style={{ padding: '0.75rem', gap: '0.75rem', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', marginBottom: '0.5rem', fontSize: '0.9rem', width: '100%' }}>
                          <PlusCircle size={18} /> Convertirme en Suscriptor
                        </button>
                      )}

                      {activeRole === 'PROVIDER' && (
                        <>
                          <Link to="/panel-prestador" onClick={closeMenu} className="btn-outline flex-center" style={{ justifyContent: 'flex-start', border: 'none', padding: '0.75rem', gap: '0.75rem', borderRadius: 'var(--radius-md)', color: 'var(--color-text-main)' }}>
                            <Settings size={18} color="var(--color-text-muted)" /> Mi Panel
                          </Link>
                          <Link to="/panel-prestador/plan" onClick={closeMenu} className="btn-outline flex-center" style={{ justifyContent: 'flex-start', border: 'none', padding: '0.75rem', gap: '0.75rem', borderRadius: 'var(--radius-md)', color: 'var(--color-text-main)' }}>
                            <Package size={18} color="var(--color-text-muted)" /> Mi Suscripción
                          </Link>
                        </>
                      )}

                      {activeRole === 'ADMIN' && (
                        <Link to="/panel-admin" onClick={closeMenu} className="btn-outline flex-center" style={{ justifyContent: 'flex-start', border: 'none', padding: '0.75rem', gap: '0.75rem', borderRadius: 'var(--radius-md)', color: 'var(--color-text-main)' }}>
                          <ShieldCheck size={18} color="var(--color-text-muted)" /> Admin Backend
                        </Link>
                      )}

                      <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '0.5rem 0' }}></div>
                      <button onClick={() => { logout(); navigate('/'); closeMenu(); }} style={{ textAlign: 'left', width: '100%', padding: '0.75rem', color: '#ef4444', background: 'none', border: 'none', fontWeight: 500, cursor: 'pointer', borderRadius: 'var(--radius-md)' }} className="card-hover-bg">
                        Cerrar sesión
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Link to="/login" className="flex-center text-hover-primary" style={{ gap: '0.5rem', fontWeight: 500, color: 'var(--color-text-main)' }}>
                <User size={18} />
                Ingresar
              </Link>
            )}
          </div>
        </div>

        {/* Categories Bar Bottom Row - Desktop Only */}
        <div className="hide-mobile" style={{ padding: '0.5rem 0', borderTop: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '1.5rem', position: 'relative' }}>

          <div
            onMouseEnter={() => setIsCategoriesHovered(true)}
            onMouseLeave={() => setIsCategoriesHovered(false)}
            style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}
          >
            <button className="flex-center text-hover-primary" style={{ gap: '0.4rem', fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-main)', paddingRight: '1rem', borderRight: '1px solid var(--color-border)' }}>
              <Menu size={18} /> Categorías <ChevronDown size={14} />
            </button>

            {/* Megamenu Panel - Simplificado */}
            {isCategoriesHovered && (
              <div
                className="card"
                style={{
                  position: 'absolute', top: '100%', left: 0, width: '600px',
                  padding: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.25rem 1rem',
                  zIndex: 100, boxShadow: 'var(--shadow-xl)', border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)'
                }}
              >
                {categories.map(category => (
                  <Link key={category.id} to={`/explorar?categoryId=${category.id}`} onClick={closeMenu} style={{ display: 'block', padding: '0.5rem', borderRadius: 'var(--radius-md)', fontWeight: 500, fontSize: '0.9rem', color: 'var(--color-text-main)', transition: 'background-color 0.2s' }} className="text-hover-primary card-hover-bg">
                    {category.name}
                  </Link>
                ))}

                {/* Explore All Footer */}
                <div style={{ gridColumn: '1 / -1', borderTop: '1px solid var(--color-border)', paddingTop: '1rem', marginTop: '0.5rem', textAlign: 'center' }}>
                  <Link to="/explorar" onClick={closeMenu} className="text-hover-primary" style={{ fontWeight: 600, color: 'var(--color-primary)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    Explorar todas las categorías y oficios <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link to="/explorar" style={{ fontSize: '0.9rem', color: 'var(--color-text-main)', fontWeight: 500 }} className="text-hover-primary">Explorar Servicios</Link>
          <Link to="/planes" style={{ fontSize: '0.9rem', color: 'var(--color-text-main)', fontWeight: 500 }} className="text-hover-primary">Planes de Suscripción</Link>
          <Link to="/noticias" style={{ fontSize: '0.9rem', color: 'var(--color-text-main)', fontWeight: 500 }} className="text-hover-primary">Centro de Noticias</Link>
        </div>


        {/* Mobile Layout */}
        <div className="show-mobile-only" style={{ padding: '0.75rem 0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Logo and Fast Actions Row */}
          <div className="flex-between">
            <Link to="/" onClick={closeMenu} className="flex-center" style={{ gap: '0.5rem' }}>
              <div style={{ width: '32px', height: '32px', backgroundColor: 'var(--color-primary)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>
                H
              </div>
              <span className="text-h3" style={{ color: 'var(--color-primary)', fontSize: '1.25rem' }}>Hog<span style={{ color: 'var(--color-secondary)' }}>Artes</span></span>
            </Link>

            <div className="flex-center" style={{ gap: '1rem' }}>
              {isAuthenticated && (
                <>
                  <Link to="/mensajes" onClick={closeMenu} className="text-hover-primary flex-center" style={{ position: 'relative', color: 'var(--color-text-main)' }}>
                    <MessageSquare size={20} />
                    <span style={{ position: 'absolute', top: '-1px', right: '-3px', backgroundColor: 'var(--color-secondary)', width: '8px', height: '8px', borderRadius: '50%' }}></span>
                  </Link>

                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => { setIsNotificationsOpen(!isNotificationsOpen); setIsMobileMenuOpen(false); }}
                      className="text-hover-primary flex-center"
                      style={{ position: 'relative', color: 'var(--color-text-main)' }}
                    >
                      <Bell size={20} />
                      {unreadCount > 0 && (
                        <span style={{ position: 'absolute', top: '-6px', right: '-6px', backgroundColor: '#ef4444', color: 'white', fontSize: '0.6rem', fontWeight: 'bold', width: '14px', height: '14px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {unreadCount}
                        </span>
                      )}
                    </button>
                    {/* Panel Mobile Notification */}
                    {isNotificationsOpen && (
                      <div style={{ position: 'absolute', top: '150%', right: '-30px', width: '300px', backgroundColor: 'var(--color-surface)', zIndex: 100, boxShadow: 'var(--shadow-lg)', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 600 }}>Notificaciones</span>
                          <button onClick={() => setIsNotificationsOpen(false)}><X size={18} /></button>
                        </div>
                        <div style={{ padding: '0.5rem 1rem', display: 'flex', gap: '0.5rem', backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', overflowX: 'auto' }}>
                          <div style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-primary)', color: 'white', fontWeight: 500, whiteSpace: 'nowrap' }}>
                            {activeRole === 'CLIENT' ? 'Cliente' : activeRole === 'PROVIDER' ? 'Suscriptor' : 'Admin'}
                          </div>
                        </div>
                        <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                          {currentNotifications.length === 0 ? (
                            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                              <Bell size={28} style={{ margin: '0 auto 0.5rem', opacity: 0.3 }} />
                              <p style={{ fontSize: '0.875rem' }}>Todavía no tenés notificaciones.</p>
                            </div>
                          ) : (
                            currentNotifications.map(notif => (
                              <div key={notif.id} onClick={() => navigate(notif.link || '#!')} style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)', display: 'flex', gap: '0.5rem', backgroundColor: notif.isRead ? 'transparent' : 'var(--color-primary-light)' }}>
                                <div style={{ color: getNotificationIconColor(notif.type), marginTop: '0.2rem' }}>
                                  {getNotificationIcon(notif.type)}
                                </div>
                                <div style={{ flex: 1 }}>
                                  <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>{notif.title}</p>
                                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{notif.message}</p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              <button onClick={toggleMenu} style={{ padding: '0.25rem' }} aria-label="Toggle menu">
                {isMobileMenuOpen ? <X size={26} color="var(--color-text-main)" /> : <Menu size={26} color="var(--color-text-main)" />}
              </button>
            </div>
          </div>

          {/* Search Row */}
          <form onSubmit={handleSearch} style={{ display: 'flex', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
            <input
              type="text"
              placeholder="Buscar servicios..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ flex: 1, padding: '0.6rem 1rem', border: 'none', outline: 'none', backgroundColor: 'transparent', fontSize: '0.95rem' }}
            />
            <button type="submit" style={{ padding: '0 1rem', backgroundColor: 'var(--color-bg)', borderLeft: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
              <Search size={18} />
            </button>
          </form>

        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="show-mobile-only" style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', padding: '1.5rem', boxShadow: 'var(--shadow-md)', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>

          {isAuthenticated && (
            <div style={{ padding: '1rem', backgroundColor: 'var(--color-primary-light)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={20} />
              </div>
              <div>
                <p style={{ fontWeight: 600, color: 'var(--color-primary-hover)' }}>{user?.name}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-primary)' }}>{activeRole === 'PROVIDER' ? 'Suscriptor' : activeRole === 'ADMIN' ? 'Admin' : 'Cliente'}</p>
              </div>
            </div>
          )}

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>

            {/* Mobile Categories Accordion */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
              <button
                onClick={() => setIsMobileCategoriesOpen(!isMobileCategoriesOpen)}
                className="flex-between"
                style={{ width: '100%', fontWeight: 500, color: 'var(--color-text-main)', fontSize: '1.125rem', padding: '0.5rem 0', border: 'none', background: 'none' }}
              >
                <div className="flex-center" style={{ gap: '0.75rem' }}>
                  <Menu size={20} /> Categorías
                </div>
                {isMobileCategoriesOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>

              {isMobileCategoriesOpen && (
                <div style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                  {categories.map(category => (
                    <Link key={category.id} to={`/explorar?categoryId=${category.id}`} onClick={closeMenu} style={{ fontWeight: 500, color: 'var(--color-text-main)', fontSize: '0.95rem', padding: '0.5rem 0' }} className="text-hover-primary">
                      {category.name}
                    </Link>
                  ))}

                  <Link to="/explorar" onClick={closeMenu} className="btn-outline flex-center" style={{ padding: '0.6rem', marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--color-primary)', borderColor: 'var(--color-primary-light)' }}>
                    Ver Todas las Categorías <ChevronRight size={16} />
                  </Link>
                </div>
              )}
            </div>

            <Link to="/explorar" onClick={closeMenu} className="flex-center" style={{ justifyContent: 'flex-start', padding: '0.5rem 0', gap: '0.75rem', fontWeight: 500, color: 'var(--color-text-main)', fontSize: '1.125rem' }}>
              <Search size={20} /> Explorar Servicios
            </Link>
            <Link to="/planes" onClick={closeMenu} className="flex-center" style={{ justifyContent: 'flex-start', padding: '0.5rem 0', gap: '0.75rem', fontWeight: 500, color: 'var(--color-text-main)', fontSize: '1.125rem' }}>
              <Package size={20} /> Planes
            </Link>
            <Link to="/noticias" onClick={closeMenu} className="flex-center" style={{ justifyContent: 'flex-start', padding: '0.5rem 0', gap: '0.75rem', fontWeight: 500, color: 'var(--color-text-main)', fontSize: '1.125rem' }}>
              <Info size={20} /> Noticias y Novedades
            </Link>

            <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '0.5rem 0' }}></div>

            {isAuthenticated ? (
              <>
                {activeRole === 'CLIENT' && (
                  <button onClick={() => { navigate('/registro-proveedor'); closeMenu(); }} className="flex-center" style={{ width: '100%', justifyContent: 'flex-start', padding: '0.5rem 0', gap: '0.75rem', fontWeight: 500, color: 'var(--color-primary)', fontSize: '1.125rem', border: 'none', background: 'none', cursor: 'pointer' }}>
                    <PlusCircle size={20} /> Convertirme en Suscriptor
                  </button>
                )}

                {activeRole === 'PROVIDER' && (
                  <>
                    <Link to="/publicar" onClick={closeMenu} className="flex-center" style={{ justifyContent: 'flex-start', padding: '0.5rem 0', gap: '0.75rem', fontWeight: 500, color: 'var(--color-primary)', fontSize: '1.125rem' }}>
                      <PlusCircle size={20} /> Publicar Nuevo Servicio
                    </Link>
                    <Link to="/panel-prestador" onClick={closeMenu} className="flex-center" style={{ justifyContent: 'flex-start', padding: '0.5rem 0', gap: '0.75rem', fontWeight: 500, color: 'var(--color-text-main)', fontSize: '1.125rem' }}>
                      <Settings size={20} /> Mi Panel Suscriptor
                    </Link>
                    <Link to="/panel-prestador/plan" onClick={closeMenu} className="flex-center" style={{ justifyContent: 'flex-start', padding: '0.5rem 0', gap: '0.75rem', fontWeight: 500, color: 'var(--color-text-main)', fontSize: '1.125rem' }}>
                      <Package size={20} /> Mi Suscripción
                    </Link>
                  </>
                )}

                {activeRole === 'ADMIN' && (
                  <Link to="/panel-admin" onClick={closeMenu} className="flex-center" style={{ justifyContent: 'flex-start', padding: '0.5rem 0', gap: '0.75rem', fontWeight: 500, color: 'var(--color-text-main)', fontSize: '1.125rem' }}>
                    <ShieldCheck size={20} /> Administración Global
                  </Link>
                )}
                <button onClick={() => { logout(); navigate('/'); closeMenu(); }} style={{ textAlign: 'left', padding: '1rem 0', color: '#ef4444', fontWeight: 500, fontSize: '1.125rem', border: 'none', background: 'none', width: '100%', cursor: 'pointer' }}>
                  Cerrar sesión
                </button>
              </>
            ) : (
              <Link to="/login" onClick={closeMenu} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', marginTop: '1rem' }}>
                <User size={20} /> Ingresar / Registrarse
              </Link>
            )}

          </nav>
        </div>
      )}
    </header>
  );
}
