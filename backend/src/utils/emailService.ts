import https from 'https';

// ---------------------------------------------------------------------------
// Configuración de Brevo (variables de entorno)
// ---------------------------------------------------------------------------
const BREVO_API_KEY    = process.env.BREVO_API_KEY    || '';
const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || '';
const BREVO_SENDER_NAME  = process.env.BREVO_SENDER_NAME  || 'HogArtes';
const FRONTEND_URL     = process.env.FRONTEND_URL     || 'http://localhost:5173';

// ---------------------------------------------------------------------------
// Helper interno: realiza el POST a la API transaccional de Brevo
// ---------------------------------------------------------------------------
async function sendBrevoEmail(payload: {
  subject: string;
  htmlContent: string;
  textContent: string;
  toEmail: string;
  toName: string;
}): Promise<void> {
  if (!BREVO_API_KEY) {
    console.error('[emailService] BREVO_API_KEY no configurada. El correo no será enviado.');
    return;
  }
  if (!BREVO_SENDER_EMAIL) {
    console.error('[emailService] BREVO_SENDER_EMAIL no configurada. El correo no será enviado.');
    return;
  }

  const body = JSON.stringify({
    sender:      { name: BREVO_SENDER_NAME, email: BREVO_SENDER_EMAIL },
    to:          [{ email: payload.toEmail, name: payload.toName }],
    subject:     payload.subject,
    htmlContent: payload.htmlContent,
    textContent: payload.textContent,
  });

  return new Promise<void>((resolve) => {
    const options: https.RequestOptions = {
      hostname: 'api.brevo.com',
      port:     443,
      path:     '/v3/smtp/email',
      method:   'POST',
      headers: {
        'accept':       'application/json',
        'api-key':      BREVO_API_KEY,
        'content-type': 'application/json',
        'content-length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`[emailService] ✓ Correo enviado a ${payload.toEmail} (${res.statusCode})`);
        } else {
          console.error(
            `[emailService] ✗ Error al enviar correo a ${payload.toEmail}. ` +
            `Status: ${res.statusCode} — Respuesta: ${data}`
          );
        }
        resolve();
      });
    });

    req.on('error', (err) => {
      console.error(`[emailService] ✗ Error de red al contactar Brevo: ${err.message}`);
      resolve();
    });

    req.write(body);
    req.end();
  });
}

// ---------------------------------------------------------------------------
// Plantilla base de HogArtes
// ---------------------------------------------------------------------------
function buildEmailTemplate(title: string, bodyHtml: string): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0"
               style="background:#ffffff;border-radius:12px;overflow:hidden;
                      box-shadow:0 4px 20px rgba(0,0,0,0.08);max-width:100%;">
          <!-- Encabezado -->
          <tr>
            <td style="background:linear-gradient(135deg,#7c3aed,#a855f7);
                       padding:36px 40px;text-align:center;">
              <h1 style="margin:0;color:#fff;font-size:26px;font-weight:700;
                         letter-spacing:-0.5px;">HogArtes</h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">
                Tu plataforma de servicios para el hogar
              </p>
            </td>
          </tr>
          <!-- Cuerpo -->
          <tr>
            <td style="padding:40px 40px 32px;">
              ${bodyHtml}
            </td>
          </tr>
          <!-- Pie -->
          <tr>
            <td style="background:#f9f9fb;padding:24px 40px;border-top:1px solid #ececf0;
                       text-align:center;">
              <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.6;">
                Este correo fue enviado automáticamente por HogArtes.<br/>
                Si no realizaste esta acción, podés ignorar este mensaje.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();
}

// ---------------------------------------------------------------------------
// Botón de acción reutilizable
// ---------------------------------------------------------------------------
function buildActionButton(label: string, url: string): string {
  return `
<div style="text-align:center;margin:28px 0 20px;">
  <a href="${url}"
     style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#a855f7);
            color:#fff;text-decoration:none;font-weight:600;font-size:15px;
            padding:14px 36px;border-radius:8px;
            box-shadow:0 4px 14px rgba(124,58,237,0.35);">
    ${label}
  </a>
</div>
<p style="text-align:center;margin:0;font-size:12px;color:#9ca3af;">
  O copiá y pegá este enlace en tu navegador:<br/>
  <a href="${url}" style="color:#7c3aed;word-break:break-all;">${url}</a>
</p>
`.trim();
}

// ---------------------------------------------------------------------------
// sendVerificationEmail
// Envía el correo de verificación de cuenta al nuevo usuario.
// Nunca lanza excepciones — los errores se loguean internamente.
// ---------------------------------------------------------------------------
export async function sendVerificationEmail(
  toEmail: string,
  toName: string,
  verificationToken: string
): Promise<void> {
  try {
    const verificationUrl = `${FRONTEND_URL}/verificar-cuenta?token=${verificationToken}`;

    const bodyHtml = `
      <h2 style="margin:0 0 12px;color:#1f2937;font-size:22px;font-weight:700;">
        ¡Bienvenido/a a HogArtes, ${toName}! 🎉
      </h2>
      <p style="margin:0 0 20px;color:#4b5563;font-size:15px;line-height:1.7;">
        Gracias por registrarte. Para activar tu cuenta y empezar a disfrutar
        de todos los beneficios de HogArtes, verificá tu dirección de correo
        haciendo clic en el botón a continuación.
      </p>
      ${buildActionButton('Verificar mi cuenta', verificationUrl)}
      <p style="margin:24px 0 0;color:#6b7280;font-size:13px;line-height:1.6;">
        Este enlace es válido por <strong>24 horas</strong>. Pasado ese tiempo,
        podés solicitar un nuevo enlace desde la pantalla de inicio de sesión.
      </p>
    `;

    const textContent =
      `¡Bienvenido/a a HogArtes, ${toName}!\n\n` +
      `Verificá tu cuenta accediendo al siguiente enlace:\n${verificationUrl}\n\n` +
      `Este enlace expira en 24 horas.`;

    await sendBrevoEmail({
      subject:     'Verificá tu cuenta en HogArtes',
      htmlContent: buildEmailTemplate('Verificá tu cuenta en HogArtes', bodyHtml),
      textContent,
      toEmail,
      toName,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[emailService] Error inesperado en sendVerificationEmail: ${message}`);
  }
}

// ---------------------------------------------------------------------------
// sendPasswordResetEmail
// Envía el correo de recuperación de contraseña.
// Nunca lanza excepciones — los errores se loguean internamente.
// ---------------------------------------------------------------------------
export async function sendPasswordResetEmail(
  toEmail: string,
  toName: string,
  resetToken: string
): Promise<void> {
  try {
    const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}`;

    const bodyHtml = `
      <h2 style="margin:0 0 12px;color:#1f2937;font-size:22px;font-weight:700;">
        Restablecé tu contraseña
      </h2>
      <p style="margin:0 0 8px;color:#4b5563;font-size:15px;line-height:1.7;">
        Hola <strong>${toName}</strong>, recibimos una solicitud para restablecer
        la contraseña de tu cuenta en HogArtes.
      </p>
      <p style="margin:0 0 20px;color:#4b5563;font-size:15px;line-height:1.7;">
        Hacé clic en el botón de abajo para elegir una nueva contraseña.
        Si <strong>no realizaste esta solicitud</strong>, simplemente ignorá este correo —
        tu contraseña actual permanecerá sin cambios.
      </p>
      ${buildActionButton('Restablecer contraseña', resetUrl)}
      <p style="margin:24px 0 0;color:#6b7280;font-size:13px;line-height:1.6;">
        Este enlace es válido por <strong>1 hora</strong>. Pasado ese tiempo,
        deberás solicitar un nuevo enlace desde la pantalla de inicio de sesión.
      </p>
    `;

    const textContent =
      `Hola ${toName},\n\n` +
      `Recibimos una solicitud para restablecer tu contraseña en HogArtes.\n\n` +
      `Hacé clic en el siguiente enlace para elegir una nueva contraseña:\n${resetUrl}\n\n` +
      `Este enlace expira en 1 hora.\n\n` +
      `Si no realizaste esta solicitud, ignorá este correo.`;

    await sendBrevoEmail({
      subject:     'Restablecé tu contraseña en HogArtes',
      htmlContent: buildEmailTemplate('Restablecé tu contraseña en HogArtes', bodyHtml),
      textContent,
      toEmail,
      toName,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[emailService] Error inesperado en sendPasswordResetEmail: ${message}`);
  }
}
