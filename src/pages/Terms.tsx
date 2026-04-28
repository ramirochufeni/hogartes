export default function Terms() {
  return (
    <div className="container" style={{ padding: '3rem 1.25rem', maxWidth: '860px' }}>
      <div className="card" style={{ padding: '2.5rem' }}>

        {/* Header */}
        <div style={{ borderBottom: '2px solid var(--color-primary)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
          <span style={{ color: 'var(--color-secondary)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
            HOGARTES.com.ar
          </span>
          <h1 className="text-h2" style={{ marginTop: '0.5rem', marginBottom: '0.5rem', color: 'var(--color-text-main)' }}>
            Términos y Condiciones
          </h1>
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>
            Última actualización: Abril 2025
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          <section>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ background: 'var(--color-primary)', color: 'white', borderRadius: '50%', width: 24, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', flexShrink: 0 }}>1</span>
              Introducción y marco legal
            </h2>
            <p className="text-muted text-body" style={{ lineHeight: 1.7 }}>
              Los Términos y Condiciones de uso del presente Portal y/o Sitio Web se regirán por las pautas establecidas en estos apartados. De manera supletoria se aplicará la normativa de las leyes N° 25.326 relativa a la Protección de Datos Personales, la Ley N° 24.766 sobre Confidencialidad de la Información, y la normativa del Código Civil y Comercial de la Nación Argentina.
            </p>
            <p className="text-muted text-body" style={{ lineHeight: 1.7, marginTop: '0.75rem' }}>
              Al registrarse y/o utilizar el sitio, el Usuario declara haber leído, comprendido y aceptado estos Términos y Condiciones en forma plena, total y sin reservas.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ background: 'var(--color-primary)', color: 'white', borderRadius: '50%', width: 24, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', flexShrink: 0 }}>2</span>
              Partes intervinientes
            </h2>
            <p className="text-muted text-body" style={{ lineHeight: 1.7 }}>
              Las partes que intervendrán en el presente Sitio Web serán:
            </p>
            <ul style={{ marginTop: '0.75rem', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <li className="text-muted" style={{ lineHeight: 1.6, fontSize: '0.95rem' }}><strong>El TITULAR:</strong> en adelante "HOGARTES", administrador y prestador del servicio del Portal Web.</li>
              <li className="text-muted" style={{ lineHeight: 1.6, fontSize: '0.95rem' }}><strong>Los USUARIOS:</strong> "Usuario Particular", "Usuario Postulante" o "Usuario Empresa".</li>
              <li className="text-muted" style={{ lineHeight: 1.6, fontSize: '0.95rem' }}><strong>Usuarios Particulares:</strong> se suscriben para acceder a la información de los postulantes.</li>
              <li className="text-muted" style={{ lineHeight: 1.6, fontSize: '0.95rem' }}><strong>Usuarios Postulantes:</strong> ofrecen servicios profesionales u oficios dentro de la página.</li>
              <li className="text-muted" style={{ lineHeight: 1.6, fontSize: '0.95rem' }}><strong>Usuarios Empresas:</strong> consultan y/o contratan servicios ofrecidos por Usuarios Postulantes.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ background: 'var(--color-primary)', color: 'white', borderRadius: '50%', width: 24, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', flexShrink: 0 }}>3</span>
              Finalidad de la plataforma
            </h2>
            <p className="text-muted text-body" style={{ lineHeight: 1.7 }}>
              La plataforma HOGARTES tiene por finalidad conectar a usuarios que necesitan diferentes servicios con prestadores independientes, emprendedores y profesionales de distintos rubros y oficios, brindando un espacio virtual seguro, organizado y confiable para la contratación de trabajos.
            </p>
            <p className="text-muted text-body" style={{ lineHeight: 1.7, marginTop: '0.75rem' }}>
              Su propósito es facilitar la búsqueda, comparación y contacto entre ambas partes, ofreciendo herramientas de visibilidad, comunicación, geolocalización, gestión y reputación. El TITULAR administra y controla la totalidad de los servicios ofrecidos en el Sitio Web. La parte USUARIA es quien utiliza los servicios del sitio y/o contrata servicios ofrecidos en el portal.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ background: 'var(--color-primary)', color: 'white', borderRadius: '50%', width: 24, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', flexShrink: 0 }}>4</span>
              Modificaciones al portal
            </h2>
            <p className="text-muted text-body" style={{ lineHeight: 1.7 }}>
              HOGARTES se reserva el derecho de modificar de manera unilateral, total o parcialmente, estos Términos y Condiciones en cualquier momento. En caso de modificarse, se podrá notificar al Usuario mediante correo electrónico registrado, con validez como notificación suficiente en los términos del Art. 75 del Código Civil y Comercial de la Nación. Si el Usuario continúa utilizando el sitio, se considerará notificado y aceptará implícitamente los nuevos términos.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ background: 'var(--color-primary)', color: 'white', borderRadius: '50%', width: 24, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', flexShrink: 0 }}>5</span>
              Suspensiones o bajas
            </h2>
            <p className="text-muted text-body" style={{ lineHeight: 1.7 }}>
              HOGARTES se reserva el derecho de suspender o dar de baja unilateral e inmediatamente a cualquier Usuario que, a su exclusivo criterio, no cumpla con los estándares definidos en estos Términos y Condiciones, sin que ello genere derecho a resarcimiento o reclamo alguno. Estos términos no limitan las garantías no renunciables ni los derechos de defensa del consumidor.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ background: 'var(--color-primary)', color: 'white', borderRadius: '50%', width: 24, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', flexShrink: 0 }}>6</span>
              Registros y permisos de uso
            </h2>
            <p className="text-muted text-body" style={{ lineHeight: 1.7 }}>
              El Usuario al registrarse consiente el uso de sus datos personales para fines comerciales, publicidad, marketing, comunicaciones, promociones y sorteos.
            </p>
            <p className="text-muted text-body" style={{ lineHeight: 1.7, marginTop: '0.75rem' }}>
              El acceso al sitio <strong>NO</strong> exige suscripción previa. La utilización de los servicios ofrecidos <strong>SÍ</strong> requiere suscripción y/o registro.
            </p>
            <ul style={{ marginTop: '0.75rem', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <li className="text-muted" style={{ lineHeight: 1.6, fontSize: '0.95rem' }}><strong>Usuario Particular y Usuario Empresa:</strong> registran datos personales y acceden a visualizar ofrecimientos publicados.</li>
              <li className="text-muted" style={{ lineHeight: 1.6, fontSize: '0.95rem' }}><strong>Usuario Postulante:</strong> registra datos personales y servicios ofrecidos (profesión/actividad) para que otros usuarios consulten y/o contraten.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ background: 'var(--color-primary)', color: 'white', borderRadius: '50%', width: 24, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', flexShrink: 0 }}>7</span>
              Contenido protegido y uso prohibido
            </h2>
            <p className="text-muted text-body" style={{ lineHeight: 1.7 }}>
              Todo el sitio, diseños, base de datos, información, promociones, logos, imágenes, marcas, software, comentarios y publicaciones están protegidos por las leyes aplicables de la República Argentina. El contenido es propiedad exclusiva de HOGARTES.
            </p>
            <p className="text-muted text-body" style={{ lineHeight: 1.7, marginTop: '0.75rem' }}>
              Se prohíbe copiar o adaptar el código (fuente u objeto), descompilar, realizar ingeniería inversa o actuar de forma maliciosa. Conductas terminantemente prohibidas:
            </p>
            <ul style={{ marginTop: '0.75rem', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {[
                'Lenguaje vulgar, discriminatorio, ofensivo, falaz u obsceno.',
                'Mensajes o imágenes agraviantes, difamatorias, injuriosas, pornográficas, violentas o incitantes a conductas ilícitas.',
                'Agravios a otros usuarios o a la moral y buenas costumbres.',
                'Violación (directa o indirecta) de propiedad industrial/intelectual y derecho de autor.',
                'Acciones que causen o puedan causar daños a HOGARTES o terceros.',
                'Publicar datos personales sin consentimiento (Ley N° 25.326).',
                'Propaganda comercial y/o política no autorizada.',
                'Uso por menores de edad (se prohíbe el registro/uso a quienes no tengan mayoría de edad).',
              ].map((item, i) => (
                <li key={i} className="text-muted" style={{ lineHeight: 1.6, fontSize: '0.95rem' }}>{item}</li>
              ))}
            </ul>
            <p className="text-muted text-body" style={{ lineHeight: 1.7, marginTop: '0.75rem' }}>
              Cada Usuario es responsable por sus manifestaciones, dichos, opiniones y carga de información.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ background: 'var(--color-primary)', color: 'white', borderRadius: '50%', width: 24, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', flexShrink: 0 }}>8</span>
              Datos personales y responsabilidad del usuario
            </h2>
            <p className="text-muted text-body" style={{ lineHeight: 1.7 }}>
              Cada Usuario podrá generarse una sola cuenta. Cada Usuario es único y exclusivo, responsable de sus manifestaciones. Al utilizar los servicios, el Usuario declara y garantiza que es mayor de edad y plenamente capaz, y que toda la información aportada es veraz, completa y exacta.
            </p>
            <p className="text-muted text-body" style={{ lineHeight: 1.7, marginTop: '0.75rem' }}>
              El uso del sitio, servicios y contenidos se realiza por exclusiva voluntad y bajo responsabilidad del Usuario.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ background: 'var(--color-primary)', color: 'white', borderRadius: '50%', width: 24, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', flexShrink: 0 }}>9</span>
              Vínculos con otros sitios web y exención de responsabilidad
            </h2>
            <p className="text-muted text-body" style={{ lineHeight: 1.7 }}>
              El sitio puede contener vínculos a otros sitios de Internet. HOGARTES no respalda, controla ni administra sus contenidos y/o servicios. El acceso es bajo exclusiva decisión y responsabilidad del Usuario.
            </p>
            <p className="text-muted text-body" style={{ lineHeight: 1.7, marginTop: '0.75rem' }}>
              HOGARTES es un mero intermediario, ajeno a relaciones futuras entre Usuarios. Los contactos, entrevistas y/o contratos entre usuarios (dentro o fuera del portal) no generan responsabilidad para HOGARTES. HOGARTES no es ni será empleador, ni formará parte de contratos laborales o contractuales entre usuarios.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ background: 'var(--color-primary)', color: 'white', borderRadius: '50%', width: 24, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', flexShrink: 0 }}>10</span>
              Misceláneas, contacto y jurisdicción
            </h2>
            <p className="text-muted text-body" style={{ lineHeight: 1.7 }}>
              HOGARTES es de titularidad exclusiva del Sr. GERMAN GERARDO FLAMINI; CUIT 20-31317086-2; con domicilio legal en calle Basualdo N° 1618 dpto 3, Ciudad de Venado Tuerto, Departamento General López, Provincia de Santa Fe, República Argentina.
            </p>
            <p className="text-muted text-body" style={{ lineHeight: 1.7, marginTop: '0.75rem' }}>
              Canal único y seguro para que Usuarios Postulantes soliciten baja gratuita: <a href="mailto:baja@hogartes.com.ar" style={{ color: 'var(--color-primary)' }}>baja@hogartes.com.ar</a>
            </p>
            <p className="text-muted text-body" style={{ lineHeight: 1.7, marginTop: '0.75rem' }}>
              Estos Términos se rigen por las leyes de la República Argentina. Ante litigios, las partes se someten a la jurisdicción de los Tribunales de la Justicia Ordinaria con asiento en la Ciudad de Venado Tuerto, Provincia de Santa Fe, con renuncia a cualquier otro fuero.
            </p>
          </section>

        </div>

        {/* Footer legal note */}
        <div style={{ marginTop: '3rem', padding: '1.25rem', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--color-primary)' }}>
          <p className="text-muted" style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
            <strong>Titular:</strong> GERMAN GERARDO FLAMINI — CUIT 20-31317086-2 — Basualdo N° 1618 dpto 3, Venado Tuerto, Santa Fe, Argentina.<br />
            <strong>Baja gratuita:</strong> <a href="mailto:baja@hogartes.com.ar" style={{ color: 'var(--color-primary)' }}>baja@hogartes.com.ar</a>
          </p>
        </div>

      </div>
    </div>
  );
}
