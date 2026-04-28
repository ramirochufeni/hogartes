import { useState, useEffect } from 'react';
import { Camera, AlertCircle, Save, AlertTriangle, ArrowRight, CreditCard, Trash2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchApi } from '../lib/api';
import type { Category } from '../lib/types';

export default function PublishService() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // --- Pre-check: límite de publicaciones y estado del plan ---
  const [providerCheck, setProviderCheck] = useState<{
    loading: boolean;
    canPublish: boolean;
    reason: 'limit' | 'expired' | 'no_subscription' | 'not_verified' | 'fiscal_incomplete' | 'contact_incomplete' | 'profile_incomplete' | null;
    servicesCount: number;
    limit: number;
    planLabel: string;
  }>({ loading: true, canPublish: false, reason: null, servicesCount: 0, limit: 1, planLabel: '' });

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'PROVIDER') return;
    fetchApi('/provider/me')
      .then(({ data }) => {
        const { subscription, servicesCount } = data;
        if (!subscription) {
          setProviderCheck({ loading: false, canPublish: false, reason: 'no_subscription', servicesCount: 0, limit: 1, planLabel: '' });
          return;
        }
        const isExpired = subscription.status !== 'ACTIVE' || new Date(subscription.expiresAt) < new Date();
        const limit = 1;
        let planLabel = 'Plan ' + subscription.planType;
        if (subscription.planType === 'MONTHLY') planLabel = 'Plan Mensual';
        if (subscription.planType === 'QUARTERLY') planLabel = 'Plan Trimestral';
        if (subscription.planType === 'SEMESTER') planLabel = 'Plan Semestral';
        if (subscription.planType === 'YEARLY') planLabel = 'Plan Anual';
        if (subscription.planType === 'BASIC') planLabel = 'Plan Básico';
        if (subscription.planType === 'DOUBLE') planLabel = 'Plan Doble';


        if (isExpired) {
          setProviderCheck({ loading: false, canPublish: false, reason: 'expired', servicesCount, limit, planLabel });
          return;
        }

        const { profile } = data;
        const fiscalComplete = Boolean(
          profile?.legalName && profile?.documentNumber && profile?.civilStatus &&
          profile?.cuit && profile?.fiscalCondition && profile?.fiscalAddress && profile?.iibb
        );
        const contactComplete = Boolean(
          profile?.publicUsername && profile?.phone && profile?.contactEmail &&
          profile?.city && profile?.province && profile?.bio
        );

        if (!fiscalComplete && !contactComplete) {
          setProviderCheck({ loading: false, canPublish: false, reason: 'profile_incomplete', servicesCount, limit, planLabel });
          return;
        }
        if (!fiscalComplete) {
          setProviderCheck({ loading: false, canPublish: false, reason: 'fiscal_incomplete', servicesCount, limit, planLabel });
          return;
        }
        if (!contactComplete) {
          setProviderCheck({ loading: false, canPublish: false, reason: 'contact_incomplete', servicesCount, limit, planLabel });
          return;
        }
        if (servicesCount >= limit) {
          setProviderCheck({ loading: false, canPublish: false, reason: 'limit', servicesCount, limit, planLabel });
          return;
        }
        setProviderCheck({ loading: false, canPublish: true, reason: null, servicesCount, limit, planLabel });
      })
      .catch(() => {
        setProviderCheck({ loading: false, canPublish: true, reason: null, servicesCount: 0, limit: 1, planLabel: '' });
      });
  }, [isAuthenticated, user]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [videoUploading, setVideoUploading] = useState(false);

  // Solo campos que realmente se persisten en la base de datos
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    subcategory: '',
    description: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchApi('/catalog/categories')
      .then(({ data }) => setCategories(data))
      .catch((err) => {
        console.error('Error cargando categorías:', err);
        setServerError('No se pudieron cargar las categorías.');
      });
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      if (name === 'category') {
        return { ...prev, category: value, subcategory: '' };
      }
      return { ...prev, [name]: value };
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }

    if (name === 'category' && errors.subcategory) {
      setErrors((prev) => ({ ...prev, subcategory: '' }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const VIDEO_MAX_MB = 50;
  const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVideoError(null);
    const file = e.target.files?.[0] || null;
    if (!file) { setVideoFile(null); return; }
    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      setVideoError('Formato no permitido. Usá MP4, WebM o MOV.');
      e.target.value = '';
      return;
    }
    if (file.size > VIDEO_MAX_MB * 1024 * 1024) {
      setVideoError(`El video supera el límite de ${VIDEO_MAX_MB}MB.`);
      e.target.value = '';
      return;
    }
    setVideoFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const newErrors: { [key: string]: string } = {};
    if (!formData.title.trim()) newErrors.title = 'El título es obligatorio';
    if (!formData.category) newErrors.category = 'Debes seleccionar una categoría';
    if (!formData.subcategory) newErrors.subcategory = 'Debes seleccionar un subrubro';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      // Subir imagen si existe
      let coverImage: string | null = null;
      if (imageFile) {
        const fd = new FormData();
        fd.append('image', imageFile);
        const r = await fetch(`${import.meta.env.VITE_API_URL}/api/upload`, { method: 'POST', body: fd });
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || 'Error al subir la imagen');
        coverImage = j.url;
      }

      // Subir video si existe
      let videoUrl: string | null = null;
      if (videoFile) {
        setVideoUploading(true);
        const fd = new FormData();
        fd.append('video', videoFile);
        const r = await fetch('http://localhost:5000/api/upload/video', { method: 'POST', body: fd });
        const j = await r.json();
        setVideoUploading(false);
        if (!r.ok) throw new Error(j.error || 'Error al subir el video');
        videoUrl = j.url;
      }

      await fetchApi('/services/create', {
        method: 'POST',
        data: {
          title: formData.title,
          description: formData.description,
          subcategoryId: formData.subcategory,
          coverImage,
          videoUrl
        }
      });

      alert('Publicación guardada con éxito.');
      navigate('/explorar');
    } catch (err: any) {
      setVideoUploading(false);
      setServerError(err.message || 'Error al publicar el servicio');
    } finally {
      setIsSubmitting(false);
    }
  };

  const safeCategories = Array.isArray(categories) ? categories : [];
  const selectedCat = safeCategories.find(c => c.id === formData.category);
  const subcategories = (selectedCat as any)?.subcategory ?? (selectedCat as any)?.subcategories ?? [];

  // --- Pantalla: no autenticado ---
  if (!isAuthenticated) {
    return (
      <div className="container flex-center" style={{ minHeight: 'calc(100vh - 70px)', padding: '2rem 1.25rem' }}>
        <div className="card text-center" style={{ maxWidth: '600px', padding: '3rem 2rem' }}>
          <div style={{ width: '80px', height: '80px', margin: '0 auto 1.5rem', backgroundColor: 'var(--color-bg)', borderRadius: '50%', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertCircle size={40} />
          </div>
          <h1 className="text-h2" style={{ fontSize: '2rem', marginBottom: '1rem' }}>Iniciá sesión para publicar</h1>
          <p className="text-muted" style={{ fontSize: '1.125rem', marginBottom: '2rem' }}>
            Necesitás registrarte y contar con una cuenta de prestador activo para poder ofrecer tus servicios en la plataforma.
          </p>
          <button onClick={() => navigate('/login')} className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.125rem', width: '100%', justifyContent: 'center' }}>
            Ir a Iniciar Sesión <ArrowRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  // --- Pantalla: cargando check del plan ---
  if (providerCheck.loading) {
    return (
      <div className="container flex-center" style={{ minHeight: 'calc(100vh - 70px)', padding: '2rem 1.25rem' }}>
        <p className="text-muted">Verificando tu plan...</p>
      </div>
    );
  }

  // --- Pantalla: plan vencido ---
  if (!providerCheck.canPublish && providerCheck.reason === 'expired') {
    return (
      <div className="container flex-center" style={{ minHeight: 'calc(100vh - 70px)', padding: '2rem 1.25rem' }}>
        <div className="card" style={{ maxWidth: '540px', width: '100%', padding: '2.5rem', textAlign: 'center', borderTop: '4px solid #ef4444' }}>
          <AlertTriangle size={48} color="#ef4444" style={{ margin: '0 auto 1.25rem' }} />
          <h2 className="text-h2" style={{ marginBottom: '0.75rem', color: '#b91c1c', fontSize: '1.6rem' }}>Tu suscripción está vencida</h2>
          <p className="text-muted" style={{ marginBottom: '1.5rem', lineHeight: 1.7 }}>
            Tu {providerCheck.planLabel} venció. Tus servicios existentes no son visibles públicamente y no podés publicar nuevos hasta renovar.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/planes" className="btn btn-primary" style={{ gap: '0.5rem' }}>
              <CreditCard size={18} /> Renovar plan
            </Link>
            <Link to="/panel-prestador/servicios" className="btn btn-outline">Ver mis servicios</Link>
          </div>
        </div>
      </div>
    );
  }

  // --- Pantalla: sin suscripción ---
  if (!providerCheck.canPublish && providerCheck.reason === 'no_subscription') {
    return (
      <div className="container flex-center" style={{ minHeight: 'calc(100vh - 70px)', padding: '2rem 1.25rem' }}>
        <div className="card" style={{ maxWidth: '540px', width: '100%', padding: '2.5rem', textAlign: 'center' }}>
          <CreditCard size={48} color="var(--color-text-muted)" style={{ margin: '0 auto 1.25rem' }} />
          <h2 className="text-h2" style={{ marginBottom: '0.75rem' }}>Sin suscripción activa</h2>
          <p className="text-muted" style={{ marginBottom: '1.5rem' }}>Para publicar servicios necesitás contratar un plan.</p>
          <Link to="/planes" className="btn btn-primary">Ver planes disponibles</Link>
        </div>
      </div>
    );
  }

  // --- Pantalla: faltan ambos datos ---
  if (!providerCheck.canPublish && providerCheck.reason === 'profile_incomplete') {
    return (
      <div className="container flex-center" style={{ minHeight: 'calc(100vh - 70px)', padding: '2rem 1.25rem' }}>
        <div className="card" style={{ maxWidth: '540px', width: '100%', padding: '2.5rem', textAlign: 'center', borderTop: '4px solid var(--color-primary)' }}>
          <AlertCircle size={48} color="var(--color-primary)" style={{ margin: '0 auto 1.25rem' }} />
          <h2 className="text-h2" style={{ marginBottom: '0.75rem' }}>Faltan datos fiscales y de contacto</h2>
          <p className="text-muted" style={{ marginBottom: '1.5rem' }}>Tenés una suscripción activa, pero necesitás completar tus datos fiscales y tu información pública para poder publicar servicios en la plataforma.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/panel-prestador/datos-fiscales" className="btn btn-primary">Completar datos fiscales</Link>
            <Link to="/panel-prestador/perfil" className="btn btn-outline">Editar mi perfil</Link>
          </div>
        </div>
      </div>
    );
  }

  // --- Pantalla: sin datos fiscales ---
  if (!providerCheck.canPublish && providerCheck.reason === 'fiscal_incomplete') {
    return (
      <div className="container flex-center" style={{ minHeight: 'calc(100vh - 70px)', padding: '2rem 1.25rem' }}>
        <div className="card" style={{ maxWidth: '540px', width: '100%', padding: '2.5rem', textAlign: 'center', borderTop: '4px solid var(--color-primary)' }}>
          <AlertCircle size={48} color="var(--color-primary)" style={{ margin: '0 auto 1.25rem' }} />
          <h2 className="text-h2" style={{ marginBottom: '0.75rem' }}>Faltan tus datos fiscales</h2>
          <p className="text-muted" style={{ marginBottom: '1.5rem' }}>Tenés una suscripción activa, pero necesitás completar tus datos fiscales para poder publicar servicios en la plataforma.</p>
          <Link to="/panel-prestador/datos-fiscales" className="btn btn-primary">Completar datos fiscales</Link>
        </div>
      </div>
    );
  }

  // --- Pantalla: sin datos de contacto ---
  if (!providerCheck.canPublish && providerCheck.reason === 'contact_incomplete') {
    return (
      <div className="container flex-center" style={{ minHeight: 'calc(100vh - 70px)', padding: '2rem 1.25rem' }}>
        <div className="card" style={{ maxWidth: '540px', width: '100%', padding: '2.5rem', textAlign: 'center', borderTop: '4px solid var(--color-primary)' }}>
          <AlertCircle size={48} color="var(--color-primary)" style={{ margin: '0 auto 1.25rem' }} />
          <h2 className="text-h2" style={{ marginBottom: '0.75rem' }}>Faltan tus datos de contacto y ubicación</h2>
          <p className="text-muted" style={{ marginBottom: '1.5rem' }}>Completá tu teléfono, usuario público, email de contacto, ciudad, provincia y bio para poder publicar.</p>
          <Link to="/panel-prestador/perfil" className="btn btn-primary">Editar mi perfil</Link>
        </div>
      </div>
    );
  }

  // --- Pantalla: límite alcanzado ---
  if (!providerCheck.canPublish && providerCheck.reason === 'limit') {
    return (
      <div className="container flex-center" style={{ minHeight: 'calc(100vh - 70px)', padding: '2rem 1.25rem' }}>
        <div className="card" style={{ maxWidth: '600px', width: '100%', padding: '2.5rem', textAlign: 'center', borderTop: '4px solid var(--color-secondary)' }}>
          <Trash2 size={48} color="var(--color-secondary)" style={{ margin: '0 auto 1.25rem' }} />
          <h2 className="text-h2" style={{ marginBottom: '0.75rem', fontSize: '1.6rem' }}>
            Alcanzaste el límite de tu {providerCheck.planLabel}
          </h2>
          <p className="text-muted" style={{ marginBottom: '0.75rem', lineHeight: 1.7 }}>
            Tenés <strong>{providerCheck.servicesCount}</strong> de <strong>{providerCheck.limit}</strong> servicio{providerCheck.limit !== 1 ? 's' : ''} publicado{providerCheck.limit !== 1 ? 's' : ''}.
            Para subir uno nuevo, primero eliminá alguno desde tu panel o upgradeá de plan.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1.5rem' }}>
            <Link to="/panel-prestador/servicios" className="btn btn-primary">Ir a mis servicios</Link>
            <Link to="/planes" className="btn btn-outline">Ver planes</Link>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div style={{ backgroundColor: 'var(--color-bg)', padding: '3rem 1.25rem' }}>
      <div className="container" style={{ maxWidth: '850px' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 className="text-h1" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            Crear Publicación
          </h1>
          <p className="text-muted" style={{ fontSize: '1.125rem' }}>
            Completá los datos de tu servicio para que los clientes te encuentren.
          </p>
        </div>

        {serverError && (
          <div
            style={{
              backgroundColor: '#fef2f2',
              padding: '1rem 1.5rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.5rem',
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'flex-start',
              border: '1px solid #ef4444'
            }}
          >
            <AlertTriangle color="#ef4444" style={{ marginTop: '0.2rem', flexShrink: 0 }} />
            <p style={{ color: '#b91c1c', fontWeight: 500, margin: 0, lineHeight: '1.4' }}>{serverError}</p>
          </div>
        )}

        <div
          style={{
            backgroundColor: 'var(--color-primary-light)',
            padding: '1rem 1.5rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '2.5rem',
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'center'
          }}
        >
          <AlertCircle color="var(--color-primary)" />
          <p style={{ color: 'var(--color-primary-hover)', fontWeight: 500, margin: 0 }}>
            Tu plan y cupo disponibles serán validados automáticamente al publicar.{' '}
            Los datos de contacto (teléfono, ciudad, provincia) se gestionan desde{' '}
            <strong>Mi Perfil</strong> en el panel del prestador.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* SECCIÓN 1: Título */}
          <div className="card" style={{ padding: '2rem' }}>
            <h2
              className="text-h3"
              style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}
            >
              1. Información Básica
            </h2>

            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>
                Título del servicio <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Ej: Instalación de aires acondicionados"
                className="card"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  boxShadow: 'none',
                  border: errors.title ? '1px solid red' : '1px solid var(--color-border)'
                }}
              />
              {errors.title && (
                <span style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>
                  {errors.title}
                </span>
              )}
            </div>
          </div>

          {/* SECCIÓN 2: Categoría y Descripción */}
          <div className="card" style={{ padding: '2rem' }}>
            <h2
              className="text-h3"
              style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}
            >
              2. Categoría y Descripción
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="grid-2">
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>
                    Categoría Principal <span style={{ color: 'red' }}>*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="card"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      boxShadow: 'none',
                      backgroundColor: 'transparent',
                      border: errors.category ? '1px solid red' : '1px solid var(--color-border)'
                    }}
                  >
                    <option value="">Selecciona una categoría</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <span style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>
                      {errors.category}
                    </span>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>
                    Subrubro <span style={{ color: 'red' }}>*</span>
                  </label>
                  <select
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={handleInputChange}
                    className="card"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      boxShadow: 'none',
                      backgroundColor: 'transparent',
                      border: errors.subcategory ? '1px solid red' : '1px solid var(--color-border)'
                    }}
                    disabled={!formData.category}
                  >
                    <option value="">Selecciona un subrubro</option>
                    {subcategories.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                  {errors.subcategory && (
                    <span style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>
                      {errors.subcategory}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Descripción detallada del servicio
                </label>
                <textarea
                  rows={5}
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Explica con detalle qué trabajos realizas, si tenés matrícula, horarios, etc..."
                  className="card"
                  style={{ width: '100%', padding: '0.75rem 1rem', boxShadow: 'none' }}
                />
              </div>


            </div>
          </div>

          {/* SECCIÓN 3: Imagen de portada */}
          <div className="card" style={{ padding: '2rem' }}>
            <h2
              className="text-h3"
              style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}
            >
              3. Imagen de Portada
            </h2>

            <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
              Subí una imagen representativa de tu servicio. Será la foto principal de tu publicación.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: '1rem'
              }}
            >
              <label
                style={{
                  aspectRatio: '1',
                  backgroundColor: 'var(--color-bg)',
                  border: '2px dashed var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--color-text-muted)'
                }}
              >
                <Camera size={28} style={{ marginBottom: '0.5rem' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>Elegir imagen</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
              </label>

              {imagePreview && (
                <div
                  style={{
                    aspectRatio: '1',
                    backgroundColor: '#e5e7eb',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    position: 'relative'
                  }}
                >
                  <img
                    src={imagePreview}
                    alt="Vista previa"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (imagePreview) {
                        URL.revokeObjectURL(imagePreview);
                      }
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    style={{
                      position: 'absolute',
                      top: '0.25rem',
                      right: '0.25rem',
                      backgroundColor: 'rgba(0,0,0,0.6)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '999px',
                      width: '24px',
                      height: '24px',
                      cursor: 'pointer'
                    }}
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* SECCIÓN 4: Video demostrativo (opcional) */}
          <div className="card" style={{ padding: '2rem' }}>
            <h2
              className="text-h3"
              style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem', marginBottom: '1rem' }}
            >
              4. Video demostrativo <span style={{ fontSize: '0.85rem', fontWeight: 400, color: 'var(--color-text-muted)' }}>(Opcional)</span>
            </h2>
            <p className="text-muted" style={{ marginBottom: '1.25rem', fontSize: '0.9rem' }}>
              Podés agregar un video corto mostrando tu trabajo. Formatos aceptados: MP4, WebM, MOV. Máximo {VIDEO_MAX_MB}MB.
            </p>

            <label style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.75rem 1rem', border: '2px dashed var(--color-border)',
              borderRadius: 'var(--radius-md)', cursor: 'pointer',
              backgroundColor: 'var(--color-bg)', color: 'var(--color-text-muted)',
              transition: 'border-color 0.2s'
            }}>
              <span style={{ fontSize: '1.5rem' }}>🎬</span>
              <div>
                <p style={{ margin: 0, fontWeight: 500, color: 'var(--color-text-main)', fontSize: '0.9rem' }}>
                  {videoFile ? videoFile.name : 'Elegir video...'}
                </p>
                {videoFile && (
                  <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    {(videoFile.size / (1024 * 1024)).toFixed(1)}MB — listo para subir
                  </p>
                )}
                {!videoFile && (
                  <p style={{ margin: 0, fontSize: '0.78rem', marginTop: '2px' }}>MP4, WebM o MOV hasta {VIDEO_MAX_MB}MB</p>
                )}
              </div>
              <input type="file" accept="video/mp4,video/webm,video/quicktime"
                onChange={handleVideoChange} style={{ display: 'none' }} />
            </label>

            {videoError && (
              <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                ⚠ {videoError}
              </p>
            )}

            {videoFile && (
              <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button type="button" onClick={() => setVideoFile(null)}
                  className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem', color: '#ef4444', borderColor: '#fca5a5' }}>
                  Quitar video
                </button>
                {videoUploading && <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Subiendo video...</span>}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0' }}>
            <p className="text-muted" style={{ fontSize: '0.875rem' }}>* Campos obligatorios</p>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{
                padding: '1.25rem 3rem',
                fontSize: '1.125rem',
                boxShadow: 'var(--shadow-md)',
                opacity: isSubmitting ? 0.7 : 1
              }}
            >
              <Save size={20} />
              {isSubmitting ? 'Publicando...' : 'Publicar Servicio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}