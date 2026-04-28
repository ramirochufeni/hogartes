import { RequestHandler } from 'express';
import { AuthRequest } from '../middlewares/auth';
import prisma from '../config/db';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import jwt from 'jsonwebtoken';

// Instancia de MercadoPago (usar credenciales de test en dev)
const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || 'TEST-8291404179313589-041802-bd9ac6e83d81b4f4c22fbca131f422b4-177303023' });

const hasFiscalDataCompleted = (profile: any) => {
  return Boolean(
    profile.legalName &&
    profile.documentNumber &&
    profile.civilStatus &&
    profile.cuit &&
    profile.fiscalCondition &&
    profile.fiscalAddress &&
    profile.iibb
  );
};

/**
/**
 * POST /api/provider/profile
 * Alta de perfil de proveedor (recibe form onboarding completo)
 */
export const createProviderProfile: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }

    const {
      legalName, documentNumber, civilStatus,
      cuit, fiscalCondition, fiscalAddress, iibb,
      publicUsername, contactEmail, phone, bio, province, city
    } = req.body;

    // Strict Validations
    if (!legalName || !documentNumber || !cuit || !civilStatus || !fiscalCondition || !fiscalAddress || !iibb || !publicUsername || !phone) {
      res.status(400).json({ error: 'Todos los campos obligatorios deben ser completados.' });
      return;
    }

    // Basic format validations
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (contactEmail && !emailRegex.test(contactEmail)) {
      res.status(400).json({ error: 'Email de contacto inválido.' });
      return;
    }

    if (!/^\d+$/.test(documentNumber)) {
      res.status(400).json({ error: 'El documento debe contener solo números.' });
      return;
    }

    if (!/^\d{11}$/.test(cuit.replace(/\D/g, ''))) {
      res.status(400).json({ error: 'Formato CUIT/CUIL inválido.' });
      return;
    }

    // Check unique publicUsername
    const existingUsername = await prisma.providerprofile.findFirst({
      where: { publicUsername: publicUsername.trim(), NOT: { userId } }
    });
    if (existingUsername) {
      res.status(400).json({ error: 'El nombre de usuario público ya está en uso.' });
      return;
    }

    // Upsert ProviderProfile
    const profile = await prisma.providerprofile.create({
      data: {
        id: generateId(),
        userId,
        legalName,
        documentNumber,
        civilStatus,
        cuit: cuit.replace(/\D/g, ''),
        fiscalCondition,
        fiscalAddress,
        iibb,
        publicUsername: publicUsername.trim(),
        contactEmail,
        phone,
        bio,
        province,
        city,
        verificationStatus: 'PENDING',
        updatedAt: new Date()
      }
    });

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: 'PROVIDER' }
    });

    // Emite nuevo JWT con el rol actualizado
    const token = jwt.sign(
      { id: updatedUser.id, email: updatedUser.email, role: updatedUser.role },
      process.env.JWT_SECRET || 'secret-for-dev',
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Perfil de prestador creado exitosamente',
      token,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        isEmailVerified: updatedUser.isEmailVerified
      },
      profile
    });
  } catch (error) {
    console.error('Error en createProviderProfile:', error);
    res.status(500).json({ error: 'Error interno al crear el perfil' });
  }
};

/**
 * GET /api/provider/public/:username
 * Devuelve información filtrada y pública del prestador.
 */
export const getPublicProvider: RequestHandler = async (req, res) => {
  try {
    const rawUsername = req.params.username;
    const username = Array.isArray(rawUsername) ? rawUsername[0] : rawUsername;

    if (!username || username === 'null' || username === 'undefined') {
      res.status(400).json({ error: 'Username inválido' });
      return;
    }

    const profile = await prisma.providerprofile.findFirst({
      where: { publicUsername: username },
      include: {
        user: {
          select: { name: true }
        },
        service: {
          where: { isActive: true },
          include: {
            subcategory: {
              include: { category: true }
            }
          }
        }
      }
    });

    if (!profile) {
      res.status(404).json({ error: 'Prestador no encontrado' });
      return;
    }

    res.status(200).json({
      publicUsername: profile.publicUsername,
      phone: profile.phone,
      contactEmail: profile.contactEmail,
      bio: profile.bio,
      city: profile.city,
      province: profile.province,
      fallbackName: profile.user?.name ?? null,
      services: profile.service ?? []
    });
  } catch (error) {
    console.error('Error en getPublicProvider:', error);
    res.status(500).json({ error: 'Error al buscar prestador público' });
  }
};

/**
 * GET /api/provider/me
 * Devuelve el perfil completo del prestador logueado con su suscripción y conteo de servicios.
 */
export const getProviderMe: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.id;

    const providerProfile = await prisma.providerprofile.findUnique({
      where: { userId },
      include: {
        user: {
          select: { name: true, email: true }
        },
        subscription: {
          select: {
            planType: true,
            status: true,
            expiresAt: true,
            collaborator: {
              select: { code: true }
            }
          }
        },
        service: {
          select: { id: true }
        },
        transaction: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    if (!providerProfile) {
      res.status(404).json({ error: 'Perfil de prestador no encontrado' });
      return;
    }

    // Devolvemos el profile entero para que el front pueda repopular forms
    res.status(200).json({
      profile: providerProfile,
      subscription: providerProfile.subscription ?? null,
      servicesCount: providerProfile.service.length,
      transactions: providerProfile.transaction
    });
  } catch (error) {
    console.error('Error en getProviderMe:', error);
    res.status(500).json({ error: 'Error interno al cargar el perfil' });
  }
};

/**
 * PATCH /api/provider/me
 * Actualiza phone, city, province (y bio si se envía) del prestador logueado.
 */
export const updateProviderMe: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.id;

    const existing = await prisma.providerprofile.findUnique({ where: { userId } });
    if (!existing) {
      res.status(404).json({ error: 'Perfil de prestador no encontrado' });
      return;
    }

    const {
      phone, city, province, bio,
      legalName, documentNumber, civilStatus,
      cuit, fiscalCondition, fiscalAddress, iibb,
      publicUsername, contactEmail
    } = req.body;

    // Optional Check uniqueness for publicUsername if modifying
    if (publicUsername && publicUsername.trim() !== '') {
      const existingUsername = await prisma.providerprofile.findFirst({
        where: { publicUsername: publicUsername.trim(), NOT: { userId } }
      });
      if (existingUsername) {
        res.status(400).json({ error: 'El nombre de usuario público ya está en uso.' });
        return;
      }
    }

    // Build update object
    const updateData: any = {};

    [
      'phone', 'city', 'province', 'bio', 'publicUsername', 'contactEmail'
    ].forEach(k => {
      if (req.body[k] !== undefined) {
        const val = req.body[k];
        updateData[k] = typeof val === 'string' && val.trim() !== '' ? val.trim() : null;
      }
    });

    const updated = await prisma.providerprofile.update({
      where: { userId },
      data: updateData,
      include: {
        user: { select: { name: true, email: true } },
        subscription: {
          select: { planType: true, status: true, expiresAt: true }
        }
      }
    });

    res.status(200).json({
      message: 'Perfil actualizado correctamente',
      profile: updated
    });
  } catch (error) {
    console.error('Error en updateProviderMe:', error);
    res.status(500).json({ error: 'Error interno al actualizar el perfil' });
  }
};

/**
 * POST /api/provider/fiscal-data
 * Guarda los datos fiscales por única vez.
 */
export const setFiscalData: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.id;

    const existing = await prisma.providerprofile.findUnique({ where: { userId } });
    if (!existing) {
      res.status(404).json({ error: 'Perfil de prestador no encontrado' });
      return;
    }

    if (hasFiscalDataCompleted(existing)) {
      res.status(403).json({ error: 'Los datos fiscales ya han sido cargados y no pueden ser modificados.' });
      return;
    }

    const { legalName, documentNumber, civilStatus, cuit, fiscalCondition, fiscalAddress, iibb } = req.body;

    if (!legalName || !documentNumber || !civilStatus || !cuit || !fiscalCondition || !fiscalAddress || !iibb) {
      res.status(400).json({ error: 'Todos los datos fiscales son obligatorios.' });
      return;
    }

    const updated = await prisma.providerprofile.update({
      where: { userId },
      data: {
        legalName: legalName.trim(),
        documentNumber: documentNumber.trim(),
        civilStatus,
        cuit: cuit.replace(/\D/g, ''),
        fiscalCondition,
        fiscalAddress: fiscalAddress.trim(),
        iibb: iibb.trim()
      }
    });

    res.status(200).json({ message: 'Datos fiscales guardados correctamente', profile: updated });
  } catch (error) {
    console.error('Error en setFiscalData:', error);
    res.status(500).json({ error: 'Error interno al guardar los datos fiscales' });
  }
};

/**
 * GET /api/provider/last-transaction
 * Devuelve la transacción más reciente del prestador (solo lectura, sin activar nada)
 */
export const getLastTransaction: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.id;

    const providerProfile = await prisma.providerprofile.findUnique({
      where: { userId }
    });

    if (!providerProfile) {
      res.status(404).json({ error: 'Perfil de prestador no encontrado' });
      return;
    }

    const lastTransaction = await prisma.transaction.findFirst({
      where: { providerId: providerProfile.id },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ transaction: lastTransaction ?? null });
  } catch (error) {
    console.error('Error en getLastTransaction:', error);
    res.status(500).json({ error: 'Error interno al cargar la transacción' });
  }
};

/**
 * POST /api/provider/subscribe/checkout
 * Crea la preferencia de Mercado Pago y registra la transacción
 */
export const subscribeCheckout: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.id;
    const { planType, collaboratorCode } = req.body;

    const validPlans = ['BASIC', 'DOUBLE', 'MONTHLY', 'QUARTERLY', 'SEMESTER', 'YEARLY'];
    if (!validPlans.includes(planType)) {
      res.status(400).json({ error: 'Plan inválido' });
      return;
    }

    let collaboratorId: string | undefined = undefined;
    if (collaboratorCode) {
      const colCode = String(collaboratorCode).trim().toUpperCase();
      const collaborator = await prisma.collaborator.findUnique({
        where: { code: colCode }
      });

      if (!collaborator || !collaborator.isActive) {
        res.status(400).json({ error: 'El código de colaborador ingresado no es válido o está inactivo' });
        return;
      }

      collaboratorId = collaborator.id;
    }

    const providerProfile = await prisma.providerprofile.findUnique({
      where: { userId },
      include: {
        subscription: true
      }
    });

    if (!providerProfile) {
      res.status(404).json({ error: 'Perfil de prestador no encontrado' });
      return;
    }

    const existingSub = providerProfile.subscription;

    // Mantener colaborador si ya existe
    if (existingSub && existingSub.collaboratorId) {
      collaboratorId = existingSub.collaboratorId;
    }

    let price = 40000;
    let title = 'Suscripción Mensual';
    if (planType === 'QUARTERLY') { price = 90000; title = 'Suscripción Trimestral'; }
    if (planType === 'SEMESTER') { price = 115000; title = 'Suscripción Semestral'; }
    if (planType === 'YEARLY') { price = 240000; title = 'Suscripción Anual'; }

    // Generar Transacción PENDING
    const transaction = await prisma.transaction.create({
      data: {
        id: generateId(),
        providerId: providerProfile.id,
        planType,
        status: 'PENDING',
        amount: price,
        collaboratorId: collaboratorId || null,
        updatedAt: new Date()
      }
    });

    const preference = new Preference(client);

    // Front URL (App url)
    const APP_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
    // Webhook URL
    const WEBHOOK_URL = process.env.MP_WEBHOOK_URL || 'https://hogartes-web.local/api/webhooks/mercadopago';

    const result = await preference.create({
      body: {
        items: [
          {
            id: planType,
            title,
            quantity: 1,
            unit_price: price,
            currency_id: 'ARS'
          }
        ],
        back_urls: {
          success: `${APP_URL}/panel-prestador/plan?payment=success`,
          pending: `${APP_URL}/panel-prestador/plan?payment=pending`,
          failure: `${APP_URL}/panel-prestador/plan?payment=failure`
        },
        //  auto_return: 'approved',
        notification_url: WEBHOOK_URL,
        external_reference: transaction.id
      }
    });

    // Save preference ID
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { mpPreferenceId: result.id }
    });

    res.status(200).json({
      init_point: result.init_point,
      sandbox_init_point: result.sandbox_init_point,
      preferenceId: result.id
    });
  } catch (error) {
    console.error('Error en subscribeCheckout:', error);
    res.status(500).json({ error: 'Error al procesar el checkout' });
  }
};
