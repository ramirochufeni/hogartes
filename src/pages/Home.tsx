import {
  Search, MapPin, ArrowRight, Hammer, Sparkles, Car, ShieldCheck, Monitor, Truck,
  HeartPulse, Home as HomeIcon, Briefcase, Calendar, LayoutGrid, CheckCircle,
  ChevronDown, ChevronUp, UserPlus, LogIn, Tag, Package, Star
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { fetchApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import type { Category } from '../lib/types';

// ─────────────────────────────────────────────
// Icono por categoría
// ─────────────────────────────────────────────
const getCategoryIcon = (name: string, size = 28) => {
  const n = name.toLowerCase();
  if (n.includes('construc') || n.includes('alba')) return <Hammer size={size} />;
  if (n.includes('estét') || n.includes('personal')) return <Sparkles size={size} />;
  if (n.includes('autom') || n.includes('mecán')) return <Car size={size} />;
  if (n.includes('limpieza') || n.includes('domicil')) return <ShieldCheck size={size} />;
  if (n.includes('tecnol') || n.includes('comunicac')) return <Monitor size={size} />;
  if (n.includes('flete') || n.includes('mudanza')) return <Truck size={size} />;
  if (n.includes('terap') || n.includes('bienestar')) return <HeartPulse size={size} />;
  if (n.includes('inmob')) return <HomeIcon size={size} />;
  if (n.includes('profesional')) return <Briefcase size={size} />;
  if (n.includes('evento') || n.includes('alquiler')) return <Calendar size={size} />;
  return <LayoutGrid size={size} />;
};

// ─────────────────────────────────────────────
// Card de categoría con hover overlay (desktop)
// y acordeón en mobile
// ─────────────────────────────────────────────
function CategoryCard({ cat, navigate }: { cat: Category; navigate: (path: string) => void }) {
  const [expanded, setExpanded] = useState(false);   // para mobile
  const [hovered, setHovered] = useState(false);      // para desktop

  return (
    <div
      style={{ position: 'relative' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Card base */}
      <div
        className="card"
        style={{
          cursor: 'pointer',
          display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
          padding: '1.75rem', border: '1px solid var(--color-border)',
          backgroundColor: hovered ? 'var(--color-primary-light)' : 'white',
          transition: 'background-color 0.2s, box-shadow 0.2s',
          boxShadow: hovered ? 'var(--shadow-md)' : undefined,
        }}
        onClick={() => setExpanded(!expanded)}   // toggle mobile
      >
        <div style={{
          backgroundColor: hovered ? 'var(--color-primary)' : 'var(--color-bg)',
          color: hovered ? 'white' : 'var(--color-primary)',
          padding: '0.875rem', borderRadius: 'var(--radius-md)',
          marginBottom: '1.25rem', transition: 'background-color 0.2s, color 0.2s',
        }}>
          {getCategoryIcon(cat.name)}
        </div>
        <h3 className="text-h3" style={{ fontSize: '1.05rem', marginBottom: '0.4rem', lineHeight: 1.3 }}>
          {cat.name}
        </h3>
        <p className="text-muted" style={{ fontSize: '0.8rem', margin: 0 }}>
          {cat.subcategories?.length || 0} subrubros
        </p>

        {/* Indicador mobile */}
        <div className="show-mobile-only" style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--color-text-muted)' }}>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* ── OVERLAY desktop (hover) ── */}
      {hovered && (
        <div
          className="hide-mobile card"
          style={{
            position: 'absolute', top: 0, left: 0, right: 0, zIndex: 30,
            padding: '1.25rem', boxShadow: 'var(--shadow-xl)',
            border: '1px solid var(--color-primary)',
            backgroundColor: 'white', borderRadius: 'var(--radius-md)',
            minHeight: '100%',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <div style={{ backgroundColor: 'var(--color-primary)', color: 'white', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
              {getCategoryIcon(cat.name, 20)}
            </div>
            <h4 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-primary)', margin: 0 }}>{cat.name}</h4>
          </div>

          {cat.subcategories && cat.subcategories.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              {cat.subcategories.slice(0, 6).map(sub => (
                <li key={sub.id} style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: 'var(--color-primary)', flexShrink: 0, opacity: 0.5 }} />
                  {sub.name}
                </li>
              ))}
              {cat.subcategories.length > 6 && (
                <li style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                  + {cat.subcategories.length - 6} más
                </li>
              )}
            </ul>
          ) : (
            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
              Sin subrubros registrados
            </p>
          )}

          <button
            onClick={e => { e.stopPropagation(); navigate(`/explorar?categoryId=${cat.id}`); }}
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem', padding: '0.6rem 1rem' }}
          >
            Ver servicios de {cat.name} <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* ── ACORDEÓN mobile (tap) ── */}
      {expanded && (
        <div className="show-mobile-only card" style={{ marginTop: '0.5rem', padding: '1rem', border: '1px solid var(--color-primary-light)' }}>
          {cat.subcategories && cat.subcategories.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              {cat.subcategories.map(sub => (
                <li key={sub.id} style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: 'var(--color-primary)', flexShrink: 0, opacity: 0.5 }} />
                  {sub.name}
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>Sin subrubros registrados</p>
          )}
          <button
            onClick={() => navigate(`/explorar?categoryId=${cat.id}`)}
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem', padding: '0.6rem 1rem' }}
          >
            Ver servicios de {cat.name} <ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Página principal Home
// ─────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [searchQ, setSearchQ] = useState('');
  const [searchLocation, setSearchLocation] = useState('');

  const handleBecomeProvider = () => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (user?.role === 'CLIENT') {
      navigate('/panel-prestador');
    } else if (user?.role === 'PROVIDER') {
      navigate('/panel-prestador');
    } else {
      navigate('/login');
    }
  };

  useEffect(() => {
    fetchApi('/catalog/categories')
      .then(({ data }) => setCategories(data))
      .catch(console.error)
      .finally(() => setLoadingCats(false));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQ.trim())        params.set('q', searchQ.trim());
    if (searchLocation.trim()) params.set('location', searchLocation.trim());
    navigate(`/explorar${params.toString() ? `?${params.toString()}` : ''}`);
  };

  return (
    <div>
      {/* ═══════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════ */}
      <section className="bg-gradient-primary" style={{ color: 'white', padding: '8rem 1.25rem 10rem', position: 'relative', overflow: 'hidden' }}>
        <div className="container" style={{ maxWidth: '850px', position: 'relative', zIndex: 10, textAlign: 'center' }}>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(255,255,255,0.15)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', backdropFilter: 'blur(10px)', marginBottom: '1.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
            <Sparkles size={16} color="var(--color-secondary)" />
            <span>La plataforma líder en servicios locales</span>
          </div>

          <h1 className="text-h1" style={{ marginBottom: '1.5rem', color: 'white', fontSize: '3rem', fontWeight: 800, lineHeight: 1.15, textShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            Encontrá los mejores expertos para tu hogar o empresa
          </h1>
          <p style={{ fontSize: '1.25rem', marginBottom: '3.5rem', opacity: 0.9, maxWidth: '650px', margin: '0 auto 3.5rem', lineHeight: 1.6 }}>
            Buscá profesionales verificados, explorá perfiles y contactá directamente, rápido y sin intermediarios.
          </p>

          {/* Buscador principal */}
          <form onSubmit={handleSearch}>
            <div
              className="card glass flex-center"
              style={{ padding: '0.5rem', gap: 0, flexWrap: 'nowrap', borderRadius: 'var(--radius-full)', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.3)', backgroundColor: 'rgba(255,255,255,0.95)' }}
            >
              <div className="flex-center" style={{ flex: 1.5, padding: '0.5rem 1.5rem', justifyContent: 'flex-start', borderRight: '1px solid var(--color-border)' }}>
                <Search size={22} color="var(--color-primary)" style={{ flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder="¿Qué servicio estás buscando?"
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                  style={{ border: 'none', outline: 'none', padding: '0.5rem 0.75rem', width: '100%', color: 'var(--color-text-main)', fontSize: '1.05rem', backgroundColor: 'transparent' }}
                />
              </div>

              <div className="flex-center hide-mobile" style={{ flex: 1, padding: '0.5rem 1.5rem', justifyContent: 'flex-start' }}>
                <MapPin size={22} color="var(--color-primary)" style={{ flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder="Ciudad o Provincia"
                  value={searchLocation}
                  onChange={e => setSearchLocation(e.target.value)}
                  style={{ border: 'none', outline: 'none', padding: '0.5rem 0.75rem', width: '100%', color: 'var(--color-text-main)', fontSize: '1.05rem', backgroundColor: 'transparent' }}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ padding: '1.125rem 2.5rem', borderRadius: 'var(--radius-full)', fontSize: '1.125rem', fontWeight: 600, boxShadow: 'var(--shadow-md)', margin: '0.25rem' }}
              >
                Buscar
              </button>
            </div>
          </form>

          <div style={{ marginTop: '2rem', display: 'flex', gap: '2rem', justifyContent: 'center', opacity: 0.8, fontSize: '0.875rem' }}>
            <span className="flex-center" style={{ gap: '0.5rem' }}><CheckCircle size={16} /> Búsqueda gratuita</span>
            <span className="flex-center hide-mobile" style={{ gap: '0.5rem' }}><CheckCircle size={16} /> Profesionales destacados</span>
            <span className="flex-center hide-mobile" style={{ gap: '0.5rem' }}><CheckCircle size={16} /> Contacto directo</span>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CATEGORÍAS
      ═══════════════════════════════════════════ */}
      <section className="container" style={{ padding: '6rem 1.25rem', marginTop: '-3rem', position: 'relative', zIndex: 20 }}>
        <div className="flex-between" style={{ marginBottom: '3rem', alignItems: 'flex-end' }}>
          <div>
            <span style={{ color: 'var(--color-secondary)', fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Directorio completo
            </span>
            <h2 className="text-h2" style={{ marginTop: '0.5rem', fontSize: '2.25rem' }}>Explorá por categorías</h2>
          </div>
          <Link
            to="/explorar"
            className="flex-center text-hover-primary hide-mobile"
            style={{ color: 'var(--color-primary)', fontWeight: 600, gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-primary-light)' }}
          >
            Ver todas <ArrowRight size={18} />
          </Link>
        </div>

        <div className="grid-4">
          {loadingCats ? (
            Array(8).fill(0).map((_, i) => (
              <div key={i} className="card" style={{ height: '200px', backgroundColor: 'var(--color-bg)', animation: 'pulse 1.5s infinite' }} />
            ))
          ) : (
            categories.slice(0, 8).map(cat => (
              <CategoryCard key={cat.id} cat={cat} navigate={navigate} />
            ))
          )}
        </div>

        <div className="show-mobile-only" style={{ marginTop: '2rem', textAlign: 'center' }}>
          <Link to="/explorar" className="btn btn-outline" style={{ width: '100%' }}>Ver todas las categorías</Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          BLOQUE "IMPULSÁ TU NEGOCIO" — STEPPER REAL
      ═══════════════════════════════════════════ */}
      <section style={{ backgroundColor: 'var(--color-bg)', padding: '6rem 1.25rem', position: 'relative' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span className="badge badge-orange" style={{ marginBottom: '1rem' }}>Para prestadores</span>
            <h2 className="text-h2" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Impulsá tu negocio hoy</h2>
            <p className="text-muted" style={{ fontSize: '1.125rem', maxWidth: 600, margin: '0 auto' }}>
              En pocos pasos vas a poder publicar tus servicios y conectar con miles de clientes.
            </p>
          </div>

          {/* Stepper de 5 pasos */}
          <div style={{ position: 'relative', maxWidth: 860, margin: '0 auto 4rem' }}>

            {/* Línea conector (desktop) */}
            <div
              className="hide-mobile"
              style={{
                position: 'absolute', top: 30, left: '10%', right: '10%', height: 2,
                background: 'linear-gradient(to right, var(--color-primary), var(--color-secondary))',
                zIndex: 0, opacity: 0.25
              }}
            />

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
              {[
                {
                  n: 1, icon: <UserPlus size={22} />, title: 'Crear cuenta',
                  desc: 'Registrate gratis en HogArtes como usuario cliente.',
                  color: 'var(--color-primary)',
                },
                {
                  n: 2, icon: <LogIn size={22} />, title: 'Iniciar sesión',
                  desc: 'Ingresá con tus credenciales en la plataforma.',
                  color: 'var(--color-primary)',
                },
                {
                  n: 3, icon: <Tag size={22} />, title: 'Ir a "Mi Cuenta"',
                  desc: 'Hacé clic en "Convertirme en Prestador" desde el menú, o también haciendo click acá abajo.',
                  color: 'var(--color-secondary)',
                },
                {
                  n: 4, icon: <Package size={22} />, title: 'Elegir un plan',
                  desc: 'Contratá el plan que mejor se adapte a tu volumen.',
                  color: 'var(--color-secondary)',
                },
                {
                  n: 5, icon: <Star size={22} />, title: 'Publicar servicio',
                  desc: 'Completá tu perfil y publicá tu primer servicio.',
                  color: '#8b5cf6',
                },
              ].map(step => (
                <div
                  key={step.n}
                  className="card"
                  style={{
                    flex: '1 1 148px', maxWidth: 160, textAlign: 'center',
                    padding: '1.5rem 1rem', backgroundColor: 'white',
                    borderTop: `3px solid ${step.color}`,
                  }}
                >
                  <div style={{
                    width: 56, height: 56, borderRadius: '50%',
                    backgroundColor: step.color, color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 1rem', flexShrink: 0,
                    boxShadow: `0 4px 14px ${step.color}44`,
                  }}>
                    {step.icon}
                  </div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', color: step.color, marginBottom: '0.4rem' }}>
                    Paso {step.n}
                  </div>
                  <h4 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.5rem', color: 'var(--color-text-main)' }}>
                    {step.title}
                  </h4>
                  <p className="text-muted" style={{ fontSize: '0.8rem', lineHeight: 1.4 }}>
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                to="/login"
                className="btn btn-primary"
                style={{ padding: '1.25rem 2.5rem', fontSize: '1.125rem', borderRadius: 'var(--radius-full)', boxShadow: 'var(--shadow-md)', display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}
              >
                <UserPlus size={20} /> Crear mi cuenta profesional
              </Link>
              <button
                onClick={handleBecomeProvider}
                className="btn btn-outline"
                style={{ padding: '1.25rem 2.5rem', fontSize: '1.125rem', borderRadius: 'var(--radius-full)', boxShadow: 'var(--shadow-md)', display: 'inline-flex', alignItems: 'center', gap: '0.75rem', borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
              >
                <Tag size={20} /> Convertite en proveedor
              </button>
            </div>
            <p className="text-muted" style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
              Registro gratuito. Luego podrás elegir tu plan de suscripción.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
