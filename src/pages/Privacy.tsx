export default function Privacy() {
  return (
    <div className="container" style={{ padding: '3rem 1.25rem', maxWidth: '860px' }}>
      <div className="card" style={{ padding: '2.5rem' }}>

        {/* Header */}
        <div style={{ borderBottom: '2px solid var(--color-primary)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
          <span style={{ color: 'var(--color-secondary)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
            HOGARTES.com.ar
          </span>
          <h1 className="text-h2" style={{ marginTop: '0.5rem', marginBottom: '0.5rem', color: 'var(--color-text-main)' }}>
            Política de Privacidad
          </h1>
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>
            Última actualización: Abril 2025
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          <section>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ background: 'var(--color-primary)', color: 'white', borderRadius: '50%', width: 24, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', flexShrink: 0 }}>1</span>
              Introducción y aceptación
            </h2>
            <p className="text-muted text-body" style={{ lineHeight: 1.7 }}>
              HOGARTES y HOGARTES.com.ar (en adelante, el "Portal" o "Sitio Web") respetan la privacidad de todos los Usuarios. Al aceptar esta Política, el "USUARIO" declara haber leído el contenido y presta su conformidad para suministrar su información personal y para que HOGARTES la administre, gestione y proteja.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ background: 'var(--color-primary)', color: 'white', borderRadius: '50%', width: 24, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', flexShrink: 0 }}>2</span>
              Registro y uso de información personal
            </h2>
            <p className="text-muted text-body" style={{ lineHeight: 1.7 }}>
              Al registrarse, los Usuarios otorgan pleno consentimiento y aceptación de esta Política y de los Términos y Condiciones. Es un requisito indispensable para acceder y utilizar los servicios e información del sitio.
            </p>
            <p className="text-muted text-body" style={{ lineHeight: 1.7, marginTop: '0.75rem' }}>
              Toda información suministrada por el Usuario se considerará fidedigna y podrá incorporarse a la base de datos de HOGARTES. La información administrada por HOGARTES y/o empresas contratantes o aliados comerciales será utilizada para efectuar gestiones pertinentes para el desarrollo del objeto social y/o comercial y cumplir obligaciones contractuales.
            </p>
            <p className="text-muted text-body" style={{ lineHeight: 1.7, marginTop: '0.75rem' }}>
              <strong>Declaración del Usuario:</strong> la información personal brindada es correcta, completa, exacta, cierta y actual.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ background: 'var(--color-primary)', color: 'white', borderRadius: '50%', width: 24, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', flexShrink: 0 }}>3</span>
              Finalidad del tratamiento
            </h2>
            <p className="text-muted text-body" style={{ lineHeight: 1.7 }}>
              Los servicios del sitio permiten recopilar información personal para crear postulaciones de servicios. Asimismo, los Usuarios podrán registrarse y contratar servicios ofrecidos por Usuarios Postulantes.
            </p>
            <p className="text-muted text-body" style={{ lineHeight: 1.7, marginTop: '0.75rem' }}>
              HOGARTES podrá desarrollar relaciones comerciales generales o dirigidas personalmente a Usuarios, tendientes a mejorar su experiencia. Todo dato suministrado por el Usuario y recopilado en las bases de datos luego de su registro es de propiedad de HOGARTES.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ background: 'var(--color-primary)', color: 'white', borderRadius: '50%', width: 24, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', flexShrink: 0 }}>4</span>
              Cesión/transferencia de información a terceros
            </h2>
            <p className="text-muted text-body" style={{ lineHeight: 1.7 }}>
              HOGARTES podrá transferir la Información Personal de Usuarios a empresas contratantes con el titular del sitio web, conforme normativa vigente (incluida transferencia internacional cuando corresponda).
            </p>
            <p className="text-muted text-body" style={{ lineHeight: 1.7, marginTop: '0.75rem' }}>
              El Usuario autoriza que su información personal sea compartida con los clientes de HOGARTES, prestando consentimiento libre, previo, expreso, incondicionado e informado, de acuerdo a esta Política y a los Términos y Condiciones.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ background: 'var(--color-primary)', color: 'white', borderRadius: '50%', width: 24, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', flexShrink: 0 }}>5</span>
              Correo electrónico y comunicaciones
            </h2>
            <p className="text-muted text-body" style={{ lineHeight: 1.7 }}>
              Mediante su registración, el Usuario autoriza a que HOGARTES le envíe correos institucionales vinculados a contenidos del sitio, servicios prestados, estado de cuenta, comunicaciones, notificaciones, publicidades y actualizaciones.
            </p>
            <p className="text-muted text-body" style={{ lineHeight: 1.7, marginTop: '0.75rem' }}>
              También podrán enviarse correos publicitarios sobre productos, promociones y servicios del sitio y/o terceros asociados, salvo que el Usuario manifieste expresamente que no desea recibirlos mediante los procesos previstos.
            </p>
            <p className="text-muted text-body" style={{ lineHeight: 1.7, marginTop: '0.75rem' }}>
              Canal único de baja: <a href="mailto:baja@hogartes.com.ar" style={{ color: 'var(--color-primary)' }}>baja@hogartes.com.ar</a>
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ background: 'var(--color-primary)', color: 'white', borderRadius: '50%', width: 24, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', flexShrink: 0 }}>6</span>
              Uso de cookies
            </h2>
            <p className="text-muted text-body" style={{ lineHeight: 1.7 }}>
              Las cookies ayudan a guardar preferencias de navegación, mejorar el servicio, optimizar búsquedas y fortalecer sistemas de seguridad.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ background: 'var(--color-primary)', color: 'white', borderRadius: '50%', width: 24, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', flexShrink: 0 }}>7</span>
              Consentimiento para compartir información
            </h2>
            <p className="text-muted text-body" style={{ lineHeight: 1.7 }}>
              Para ejecutar los servicios, HOGARTES podrá compartir total o parcialmente la información con:
            </p>
            <ul style={{ marginTop: '0.75rem', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {[
                'Clientes de HOGARTES con quienes el Usuario desee vincularse mediante publicación, postulación o contratación.',
                'Entidades gubernamentales y/o judiciales.',
                'Proveedores de hosting del sitio web.',
                'Entidades de pagos electrónicos con las que opere HOGARTES, como intermediario.',
              ].map((item, i) => (
                <li key={i} className="text-muted" style={{ lineHeight: 1.6, fontSize: '0.95rem' }}>{item}</li>
              ))}
            </ul>
            <p className="text-muted text-body" style={{ lineHeight: 1.7, marginTop: '0.75rem' }}>
              En caso de transferencia de activos de una firma contratante de servicios de HOGARTES, el Usuario autoriza la transferencia de datos, comunicándose oportunamente si correspondiera.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ background: 'var(--color-primary)', color: 'white', borderRadius: '50%', width: 24, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', flexShrink: 0 }}>8</span>
              Protección de la información
            </h2>
            <p className="text-muted text-body" style={{ lineHeight: 1.7 }}>
              HOGARTES resguarda la información personal bajo procedimientos de seguridad utilizados en la industria, manteniéndolos actualizados y cumpliendo estándares de confidencialidad y seguridad conforme leyes argentinas. Aun adoptando mecanismos de protección, podrían existir contingencias. En esos casos, HOGARTES procederá conforme a las leyes de la República Argentina.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ background: 'var(--color-primary)', color: 'white', borderRadius: '50%', width: 24, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', flexShrink: 0 }}>9</span>
              Derechos del usuario
            </h2>
            <p className="text-muted text-body" style={{ lineHeight: 1.7 }}>
              El Usuario puede modificar, eliminar o actualizar su información personal cuando lo desee. También puede solicitar a HOGARTES la rectificación, actualización o supresión de datos inexactos o incompletos en la base de datos, sin cargo.
            </p>
            <p className="text-muted text-body" style={{ lineHeight: 1.7, marginTop: '0.75rem' }}>
              La baja de comunicaciones y/o plataforma se gestiona por: <a href="mailto:baja@hogartes.com.ar" style={{ color: 'var(--color-primary)' }}>baja@hogartes.com.ar</a>
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ background: 'var(--color-primary)', color: 'white', borderRadius: '50%', width: 24, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', flexShrink: 0 }}>10</span>
              Cambios en la Política
            </h2>
            <p className="text-muted text-body" style={{ lineHeight: 1.7 }}>
              HOGARTES podrá informar cambios en la Política de Privacidad y en Términos y Condiciones, reservándose el derecho de modificar y actualizar periódicamente. La versión vigente se publicará en este Sitio Web. Es obligación del Usuario revisar regularmente esta sección para conocer cambios.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ background: 'var(--color-primary)', color: 'white', borderRadius: '50%', width: 24, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', flexShrink: 0 }}>11</span>
              Ley aplicable, jurisdicción y autoridad de control
            </h2>
            <p className="text-muted text-body" style={{ lineHeight: 1.7 }}>
              La presente Política se rige por las leyes de la República Argentina. El Usuario se somete a la jurisdicción de los Tribunales de Justicia Ordinaria con asiento en la Ciudad de Venado Tuerto, Departamento General López, Provincia de Santa Fe.
            </p>
            <p className="text-muted text-body" style={{ lineHeight: 1.7, marginTop: '0.75rem' }}>
              La Agencia de Acceso a la Información Pública (órgano de control de la Ley Nº 25.326) atiende denuncias y reclamos por incumplimientos en protección de datos personales.
            </p>
            <p className="text-muted text-body" style={{ lineHeight: 1.7, marginTop: '0.75rem' }}>
              El titular responsable del sitio web y quienes intervengan en el tratamiento de datos están obligados al secreto profesional (art. 9 Ley 25.326), aun finalizada la relación.
            </p>
          </section>

        </div>

        {/* Footer legal note */}
        <div style={{ marginTop: '3rem', padding: '1.25rem', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--color-primary)' }}>
          <p className="text-muted" style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
            <strong>Titular:</strong> GERMAN GERARDO FLAMINI — CUIT 20-31317086-2 — Basualdo N° 1618 dpto 3, Venado Tuerto, Santa Fe, Argentina.<br />
            <strong>Contacto de baja:</strong> <a href="mailto:baja@hogartes.com.ar" style={{ color: 'var(--color-primary)' }}>baja@hogartes.com.ar</a>
          </p>
        </div>

      </div>
    </div>
  );
}
