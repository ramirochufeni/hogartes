import { Filter, Search, MapPin, X, ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchApi } from '../lib/api';
import type { Category, Service } from '../lib/types';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function buildQueryString(filters: Record<string, string>): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v && v.trim()) params.set(k, v.trim());
  });
  return params.toString();
}

// ─────────────────────────────────────────────
// Chip de filtro activo
// ─────────────────────────────────────────────
function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
        backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)',
        borderRadius: 'var(--radius-full)', padding: '0.3rem 0.75rem',
        fontSize: '0.8rem', fontWeight: 600, border: '1px solid var(--color-primary)',
      }}
    >
      {label}
      <button
        onClick={onRemove}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1, color: 'inherit' }}
        aria-label={`Quitar filtro ${label}`}
      >
        <X size={13} />
      </button>
    </span>
  );
}

// ─────────────────────────────────────────────
// Skeleton loader
// ─────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1.25rem' }}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-border)', flexShrink: 0, animation: 'pulse 1.5s infinite' }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: 16, backgroundColor: 'var(--color-border)', borderRadius: 4, marginBottom: 8, animation: 'pulse 1.5s infinite' }} />
          <div style={{ height: 12, width: '60%', backgroundColor: 'var(--color-border)', borderRadius: 4, animation: 'pulse 1.5s infinite' }} />
        </div>
      </div>
      <div style={{ height: 48, backgroundColor: 'var(--color-border)', borderRadius: 4, animation: 'pulse 1.5s infinite' }} />
      <div style={{ height: 24, backgroundColor: 'var(--color-border)', borderRadius: 4, animation: 'pulse 1.5s infinite' }} />
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────
export default function Explorer() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Inicializar filtros desde URL
  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    location: searchParams.get('location') || '',
    categoryId: searchParams.get('categoryId') || searchParams.get('categoria') || '',
    subcategoryId: searchParams.get('subcategoryId') || '',
  });

  // Estado de fetch
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Para debounce: guardamos el timer
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Subcategorías disponibles según categoryId seleccionado
  const selectedCategory = categories.find(c => c.id === filters.categoryId);
  const subcategories = selectedCategory?.subcategories ?? [];

  // ── Cargar categorías una sola vez
  useEffect(() => {
    fetchApi('/catalog/categories')
      .then(({ data }) => setCategories(data))
      .catch(console.error);
  }, []);

  // ── Fetch de servicios cuando cambian los filtros (con debounce en q y location)
  const fetchServices = useCallback(async (f: typeof filters) => {
    setLoading(true);
    try {
      const qs = buildQueryString({
        q: f.q,
        location: f.location,
        categoryId: f.categoryId,
        subcategoryId: f.subcategoryId,
      });
      const { data } = await fetchApi(`/services${qs ? `?${qs}` : ''}`);
      setServices(data);
    } catch (err) {
      console.error('Error cargando servicios:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cada vez que filters cambia → debounce y fetch
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchServices(filters);
      // Sincronizar URL
      const params: Record<string, string> = {};
      if (filters.q)            params.q = filters.q;
      if (filters.location)     params.location = filters.location;
      if (filters.categoryId)   params.categoryId = filters.categoryId;
      if (filters.subcategoryId) params.subcategoryId = filters.subcategoryId;
      setSearchParams(params, { replace: true });
    }, 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [filters, fetchServices, setSearchParams]);

  // ── Helpers para chips de filtros activos
  const activeChips: { label: string; key: keyof typeof filters }[] = [];
  if (filters.q)            activeChips.push({ label: `"${filters.q}"`, key: 'q' });
  if (filters.location)     activeChips.push({ label: `📍 ${filters.location}`, key: 'location' });
  if (filters.categoryId)   activeChips.push({ label: `Categoría: ${selectedCategory?.name ?? filters.categoryId}`, key: 'categoryId' });
  if (filters.subcategoryId) {
    const subName = subcategories.find(s => s.id === filters.subcategoryId)?.name ?? filters.subcategoryId;
    activeChips.push({ label: `Subrubro: ${subName}`, key: 'subcategoryId' });
  }

  const removeChip = (key: keyof typeof filters) => {
    setFilters(prev => ({
      ...prev,
      [key]: '',
      ...(key === 'categoryId' ? { subcategoryId: '' } : {}),
    }));
  };

  const clearAll = () => setFilters({ q: '', location: '', categoryId: '', subcategoryId: '' });

  // ── Sidebar filter panel (reutilizable en desktop y mobile)
  const FilterPanel = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Búsqueda texto */}
      <div>
        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-text-muted)' }}>
          Búsqueda
        </label>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', boxShadow: 'none' }}>
          <Search size={16} color="var(--color-text-muted)" style={{ flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Palabra clave..."
            value={filters.q}
            onChange={e => setFilters(prev => ({ ...prev, q: e.target.value }))}
            style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '0.9rem' }}
          />
          {filters.q && (
            <button onClick={() => setFilters(prev => ({ ...prev, q: '' }))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--color-text-muted)' }}>
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Ubicación */}
      <div>
        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-text-muted)' }}>
          Ubicación
        </label>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', boxShadow: 'none' }}>
          <MapPin size={16} color="var(--color-text-muted)" style={{ flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Ciudad o Provincia..."
            value={filters.location}
            onChange={e => setFilters(prev => ({ ...prev, location: e.target.value }))}
            style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '0.9rem' }}
          />
          {filters.location && (
            <button onClick={() => setFilters(prev => ({ ...prev, location: '' }))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--color-text-muted)' }}>
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Categoría */}
      <div>
        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-text-muted)' }}>
          Categoría
        </label>
        <select
          value={filters.categoryId}
          onChange={e => setFilters(prev => ({ ...prev, categoryId: e.target.value, subcategoryId: '' }))}
          className="card"
          style={{ width: '100%', padding: '0.55rem 0.75rem', boxShadow: 'none', backgroundColor: 'transparent', fontSize: '0.9rem' }}
        >
          <option value="">Todas las categorías</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Subrubro (depende de categoría) */}
      {subcategories.length > 0 && (
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-text-muted)' }}>
            Subrubro
          </label>
          <select
            value={filters.subcategoryId}
            onChange={e => setFilters(prev => ({ ...prev, subcategoryId: e.target.value }))}
            className="card"
            style={{ width: '100%', padding: '0.55rem 0.75rem', boxShadow: 'none', backgroundColor: 'transparent', fontSize: '0.9rem' }}
          >
            <option value="">Todos los subrubros</option>
            {subcategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      )}

      {/* Limpiar */}
      {activeChips.length > 0 && (
        <button
          onClick={clearAll}
          className="btn btn-outline"
          style={{ width: '100%', fontSize: '0.85rem', padding: '0.6rem' }}
        >
          Limpiar todos los filtros
        </button>
      )}
    </div>
  );

  // ── Helper para texto del servicio
  const getLocationText = (svc: Service) => {
    const city = svc.provider?.city;
    const province = svc.provider?.province;
    if (!city && !province) return null;
    return [city, province].filter(Boolean).join(', ');
  };

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: 'calc(100vh - 70px)' }}>
      <div className="container" style={{ padding: '2rem 1.25rem' }}>

        {/* ── Header de la página ── */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 className="text-h2" style={{ marginBottom: '0.25rem' }}>Explorar Servicios</h1>
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>
            {loading ? 'Buscando...' : `${services.length} resultado${services.length !== 1 ? 's' : ''} encontrado${services.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* ── Botón filtros mobile ── */}
        <div className="show-mobile-only" style={{ marginBottom: '1rem' }}>
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="btn btn-outline"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            <SlidersHorizontal size={18} />
            {showMobileFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
            {activeChips.length > 0 && (
              <span style={{ backgroundColor: 'var(--color-primary)', color: 'white', borderRadius: '999px', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>
                {activeChips.length}
              </span>
            )}
            {showMobileFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showMobileFilters && (
            <div className="card" style={{ marginTop: '0.75rem', padding: '1.25rem' }}>
              {FilterPanel}
            </div>
          )}
        </div>

        {/* ── Chips de filtros activos ── */}
        {activeChips.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Filtros activos:</span>
            {activeChips.map(chip => (
              <FilterChip key={chip.key} label={chip.label} onRemove={() => removeChip(chip.key)} />
            ))}
            <button onClick={clearAll} style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
              Limpiar todo
            </button>
          </div>
        )}

        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>

          {/* ── Sidebar desktop ── */}
          <aside style={{ width: '260px', flexShrink: 0 }} className="hide-mobile">
            <div className="card" style={{ position: 'sticky', top: '90px', padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--color-primary)', fontWeight: 700 }}>
                <Filter size={18} /> Filtros
              </div>
              {FilterPanel}
            </div>
          </aside>

          {/* ── Grid de resultados ── */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {loading ? (
              <div className="grid-2">
                {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : services.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <Search size={48} style={{ margin: '0 auto 1.5rem', color: 'var(--color-text-muted)', opacity: 0.4 }} />
                <h3 className="text-h3" style={{ marginBottom: '0.75rem' }}>
                  {activeChips.length > 0 ? 'No hay resultados para estos filtros' : 'No hay servicios disponibles'}
                </h3>
                <p className="text-muted" style={{ marginBottom: '1.5rem', maxWidth: 400, margin: '0 auto 1.5rem' }}>
                  {activeChips.length > 0
                    ? 'Probá con otros términos de búsqueda o ajustá los filtros.'
                    : 'Todavía no hay servicios publicados en la plataforma.'}
                </p>
                {activeChips.length > 0 && (
                  <button onClick={clearAll} className="btn btn-primary">Ver todos los servicios</button>
                )}
              </div>
            ) : (
              <div className="grid-2">
                {services.map(svc => {
                  const locationText = getLocationText(svc);
                  const catName = svc.subcategory?.category?.name;
                  const subName = svc.subcategory?.name;
                  const providerName = svc.provider?.user?.name || 'Prestador';
                  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(providerName)}&background=random&size=56`;

                  return (
                    <Link
                      to={`/servicio/${svc.id}`}
                      key={svc.id}
                      className="card card-hover"
                      style={{ display: 'flex', flexDirection: 'column', textDecoration: 'none', transition: 'transform 0.15s, box-shadow 0.15s' }}
                    >
                      {/* Imagen de portada */}
                      {svc.coverImage && (
                        <div style={{ width: '100%', height: 140, marginBottom: '1rem', borderRadius: 'var(--radius-md)', overflow: 'hidden', flexShrink: 0 }}>
                          <img
                            src={`http://localhost:5000${svc.coverImage}`}
                            alt={svc.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                          />
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <img
                          src={avatarUrl}
                          alt={providerName}
                          style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0, objectFit: 'cover' }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.15rem', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {svc.title}
                          </h3>
                          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>
                            {providerName}
                          </p>
                        </div>
                      </div>

                      {svc.description && (
                        <p className="text-muted" style={{ fontSize: '0.875rem', flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '1rem', lineHeight: 1.5 }}>
                          {svc.description}
                        </p>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginTop: 'auto' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                          {catName && <span className="badge badge-gray" style={{ fontSize: '0.75rem' }}>{catName}</span>}
                          {subName && <span className="badge badge-blue" style={{ fontSize: '0.75rem' }}>{subName}</span>}
                        </div>
                        {locationText && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                            <MapPin size={12} /> {locationText}
                          </span>
                        )}
                      </div>

                      <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)', textAlign: 'right' }}>
                        <span style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.875rem' }}>Ver perfil →</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
