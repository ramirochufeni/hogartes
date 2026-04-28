import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, User, Building, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ProviderOnboarding() {
  const { onboardProvider } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    // Account
    publicUsername: '',
    contactEmail: '',
    phone: '',
    bio: '',
    // Legal
    legalName: '',
    documentNumber: '',
    civilStatus: 'Soltero/a',
    // Fiscal
    cuit: '',
    fiscalCondition: 'Monotributista',
    fiscalAddress: '',
    iibb: '',
    // Location
    province: '',
    city: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await onboardProvider(formData);
      // onboardProvider escribe el token nuevo en localStorage (setToken) y actualiza el
      // estado de React (setUser) antes de retornar. El ProviderPanel tiene un guard
      // que espera role === 'PROVIDER' antes de montar sus sub-componentes, por lo que
      // no es necesario ningún setTimeout ni reload.
      navigate('/panel-prestador');
    } catch (err: any) {
      setError(err.message || 'Se produjo un error al guardar tu perfil.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1.25rem', maxWidth: '800px' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 className="text-h1" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Alta de Prestador</h1>
        <p className="text-muted text-body">
          Completá los datos solicitados para estructurar tu perfil profesional en HogArtes. Estos datos serán verificados.
        </p>
      </div>

      {error && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', padding: '1rem', borderRadius: 'var(--radius-md)', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Sección: Cuenta y Perfil Público */}
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem', marginBottom: '1rem', fontSize: '1.25rem', color: 'var(--color-primary)' }}>
            <User size={20} /> Perfil Público y Contacto
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.4rem' }}>Nombre de usuario público *</label>
              <input type="text" name="publicUsername" value={formData.publicUsername} onChange={handleChange} required className="card" style={{ width: '100%', padding: '0.75rem', boxShadow: 'none', border: '1px solid var(--color-border)' }} placeholder="Ej: reparaciones_juan" />
              <small className="text-muted" style={{ display: 'block', marginTop: '0.25rem', fontSize: '0.8rem' }}>Este será el identificador único visible para todos.</small>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.4rem' }}>Teléfono móvil *</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} required className="card" style={{ width: '100%', padding: '0.75rem', boxShadow: 'none', border: '1px solid var(--color-border)' }} placeholder="Tu teléfono" />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.4rem' }}>Email de contacto (Opcional)</label>
              <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} className="card" style={{ width: '100%', padding: '0.75rem', boxShadow: 'none', border: '1px solid var(--color-border)' }} placeholder="Email alternativo" />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.4rem' }}>Provincia</label>
              <input type="text" name="province" value={formData.province} onChange={handleChange} required className="card" style={{ width: '100%', padding: '0.75rem', boxShadow: 'none', border: '1px solid var(--color-border)' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.4rem' }}>Localidad / Ciudad</label>
              <input type="text" name="city" value={formData.city} onChange={handleChange} required className="card" style={{ width: '100%', padding: '0.75rem', boxShadow: 'none', border: '1px solid var(--color-border)' }} />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.4rem' }}>Breve descripción (Bio)</label>
              <textarea name="bio" value={formData.bio} onChange={handleChange} rows={3} className="card" style={{ width: '100%', padding: '0.75rem', boxShadow: 'none', border: '1px solid var(--color-border)' }} placeholder="Contale a tus clientes sobre tu experiencia..."></textarea>
            </div>
          </div>
        </div>

        {/* Sección: Identificación Legal */}
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem', marginBottom: '1rem', fontSize: '1.25rem', color: 'var(--color-primary)' }}>
            <ShieldCheck size={20} /> Información Legal (Privada)
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.4rem' }}>Nombre y apellido completo conforme DNI *</label>
              <input type="text" name="legalName" value={formData.legalName} onChange={handleChange} required className="card" style={{ width: '100%', padding: '0.75rem', boxShadow: 'none', border: '1px solid var(--color-border)' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.4rem' }}>Documento de Identidad (DNI) *</label>
              <input type="text" name="documentNumber" value={formData.documentNumber} onChange={handleChange} required className="card" style={{ width: '100%', padding: '0.75rem', boxShadow: 'none', border: '1px solid var(--color-border)' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.4rem' }}>Estado Civil *</label>
              <select name="civilStatus" value={formData.civilStatus} onChange={handleChange} required className="card" style={{ width: '100%', padding: '0.75rem', boxShadow: 'none', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)' }}>
                <option value="Soltero/a">Soltero/a</option>
                <option value="Casado/a">Casado/a</option>
                <option value="Divorciado/a">Divorciado/a</option>
                <option value="Viudo/a">Viudo/a</option>
                <option value="Unión convivencial">Unión convivencial</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sección: Fiscal y Tributaria */}
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem', marginBottom: '1rem', fontSize: '1.25rem', color: 'var(--color-primary)' }}>
            <Building size={20} /> Datos Fiscales (Privado)
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.4rem' }}>Número de CUIT/CUIL *</label>
              <input type="text" name="cuit" value={formData.cuit} onChange={handleChange} required className="card" style={{ width: '100%', padding: '0.75rem', boxShadow: 'none', border: '1px solid var(--color-border)' }} placeholder="Sin guiones" />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.4rem' }}>Condición Fiscal *</label>
              <select name="fiscalCondition" value={formData.fiscalCondition} onChange={handleChange} required className="card" style={{ width: '100%', padding: '0.75rem', boxShadow: 'none', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)' }}>
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
              <input type="text" name="fiscalAddress" value={formData.fiscalAddress} onChange={handleChange} required className="card" style={{ width: '100%', padding: '0.75rem', boxShadow: 'none', border: '1px solid var(--color-border)' }} placeholder="Calle, Número, Piso, Dpto, Localidad" />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.4rem' }}>Nº Inscripción Ingresos Brutos (IIBB) *</label>
              <input type="text" name="iibb" value={formData.iibb} onChange={handleChange} required className="card" style={{ width: '100%', padding: '0.75rem', boxShadow: 'none', border: '1px solid var(--color-border)' }} />
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem', marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" disabled={isLoading} className="btn btn-primary flex-center" style={{ gap: '0.5rem', fontSize: '1.1rem', padding: '0.875rem 2rem' }}>
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <ShieldCheck size={20} />}
            Confirmar y Habilitar Perfil
          </button>
        </div>
        <p className="text-muted" style={{ fontSize: '0.8rem', textAlign: 'center' }}>
          Al enviar, aceptas los términos de servicio comercial de HogArtes. Tu privacidad está protegida.
        </p>
      </form>
    </div>
  );
}
