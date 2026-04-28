import { Link } from 'react-router-dom';
import { MessageCircle, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer style={{ backgroundColor: 'white', borderTop: '1px solid var(--color-border)', padding: '3rem 0 1.5rem', marginTop: 'auto' }}>
      <div className="container">
        <div className="grid-4" style={{ marginBottom: '2rem' }}>
          
          {/* Brand */}
          <div>
            <Link to="/" className="flex-center" style={{ gap: '0.5rem', justifyContent: 'flex-start', marginBottom: '1rem' }}>
              <span className="text-h3" style={{ color: 'var(--color-primary)' }}>Hog<span style={{ color: 'var(--color-secondary)' }}>Artes</span></span>
            </Link>
            <p className="text-muted" style={{ marginBottom: '1rem' }}>
              La plataforma moderna para conectar con los mejores profesionales y servicios para tu hogar y empresa.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 style={{ marginBottom: '1rem', fontWeight: 600 }}>Plataforma</h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li><Link to="/explorar" className="text-muted text-hover-primary">Buscar Servicios</Link></li>
              <li><Link to="/publicar" className="text-muted text-hover-primary">Ofrecer Servicios</Link></li>
              <li><Link to="/login" className="text-muted text-hover-primary">Ingresar / Registrarse</Link></li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 style={{ marginBottom: '1rem', fontWeight: 600 }}>Contacto</h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem' }}>
                <Mail size={16} className="text-muted" />
                <a href="mailto:hogartesvt@gmail.com" className="text-muted">hogartesvt@gmail.com</a>
              </li>
              <li className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem' }}>
                <MessageCircle size={16} className="text-muted" />
                <a href="#" className="text-muted">WhatsApp</a>
              </li>
              <li className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem', marginTop: '0.5rem' }}>
                <a href="#" className="text-muted">Facebook</a>
                <span className="text-muted">•</span>
                <a href="#" className="text-muted">Instagram</a>
              </li>
            </ul>
          </div>

          {/* Soporte */}
          <div>
            <h4 style={{ marginBottom: '1rem', fontWeight: 600 }}>Soporte</h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem' }}>
                <Mail size={16} className="text-muted" />
                <a href="mailto:soportehogartes@gmail.com" className="text-muted">soportehogartes@gmail.com</a>
              </li>
              <li><Link to="/terminos" className="text-muted text-hover-primary">Términos y Condiciones</Link></li>
              <li><Link to="/privacidad" className="text-muted text-hover-primary">Políticas de Privacidad</Link></li>
            </ul>
          </div>

        </div>

        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem', textAlign: 'center' }}>
          <p className="text-muted" style={{ fontSize: '0.875rem' }}>
            &copy; {new Date().getFullYear()} HogArtes. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
