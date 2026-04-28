import { RequestHandler } from 'express';
import { AuthRequest } from '../middlewares/auth';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}
import prisma from '../config/db';

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

const hasContactDataCompleted = (profile: any) => {
  return Boolean(
    profile.publicUsername &&
    profile.phone &&
    profile.contactEmail &&
    profile.city &&
    profile.province &&
    profile.bio
  );
};
import { deleteFileIfExists } from '../utils/fileHelper';

export const getServices: RequestHandler = async (req, res, next) => {
  try {
    const { q, location, categoryId, subcategoryId } = req.query as Record<string, string | undefined>;

    // Construir el where dinámicamente para MySQL
    const where: any = {
      isActive: true,
      // Solo mostrar servicios cuyo prestador tenga suscripción activa, esté verificado y NO esté eliminado (soft delete)
      provider: {
        verificationStatus: 'VERIFIED',
        subscription: { status: 'ACTIVE', expiresAt: { gt: new Date() } },
        user: { isDeleted: false }
      },
    };

    // Filtro por texto libre: busca en título, nombre de subrubro, nombre de categoría
    if (q && q.trim()) {
      where.OR = [
        { title: { contains: q.trim() } },
        { subcategory: { name: { contains: q.trim() } } },
        { subcategory: { category: { name: { contains: q.trim() } } } },
      ];
    }

    // Filtro por ubicación: busca en ciudad o provincia del provider
    if (location && location.trim()) {
      where.provider = {
        ...where.provider,
        OR: [
          { city: { contains: location.trim() } },
          { province: { contains: location.trim() } },
        ],
      };
    }

    // Filtro por categoría (por ID de categoría → a través de subcategory.categoryId)
    if (categoryId && categoryId.trim()) {
      if (!subcategoryId) {
        where.subcategory = { ...where.subcategory, categoryId: categoryId.trim() };
      }
    }

    // Filtro por subrubro exacto
    if (subcategoryId && subcategoryId.trim()) {
      where.subcategoryId = subcategoryId.trim();
    }

    const service = await prisma.service.findMany({
      where,
      include: {
        provider: { include: { user: true } },
        subcategory: { include: { category: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(service);
  } catch (error: any) {
    console.error('Error en getServices:', error);
    res.status(500).json({ error: 'Error al listar servicios' });
  }
};

export const deleteService: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.id;

    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!id) {
      res.status(400).json({ error: 'ID de servicio inválido' });
      return;
    }

    // Verificar que el prestador existe
    const providerProfile = await prisma.providerprofile.findUnique({ where: { userId } });
    if (!providerProfile) {
      res.status(404).json({ error: 'Perfil de prestador no encontrado' });
      return;
    }

    // Verificar que el servicio pertenece a este prestador
    const existing = await prisma.service.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Servicio no encontrado' });
      return;
    }
    if (existing.providerId !== providerProfile.id) {
      res.status(403).json({ error: 'No tenés permiso para eliminar este servicio' });
      return;
    }

    // Eliminar archivos físicos ANTES de borrar el registro de BD.
    // Los errores de archivo son capturados internamente y nunca bloquean el flujo.
    await deleteFileIfExists(existing.coverImage);
    await deleteFileIfExists(existing.videoUrl);

    await prisma.service.delete({ where: { id } });

    res.status(200).json({ message: 'Servicio eliminado correctamente' });
  } catch (error: any) {
    console.error('Error en deleteService:', error);
    res.status(500).json({ error: 'Error interno al eliminar el servicio' });
  }
};

export const createService: RequestHandler = async (req, res, next) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.id;
    const { title, description, subcategoryId, price, coverImage, videoUrl } = req.body;

    const providerProfile = await prisma.providerprofile.findUnique({
      where: { userId },
      include: { subscription: true, service: true }
    });

    if (!providerProfile) {
      res.status(404).json({ error: 'Perfil de prestador no encontrado' });
      return;
    }

    // 1. Validar Suscripción Activa
    const sub = providerProfile.subscription;
    if (!sub || sub.status !== 'ACTIVE' || new Date(sub.expiresAt) < new Date()) {
      res.status(403).json({ 
        error: 'No tienes una suscripción activa. Debes contratar un plan para publicar servicios.' 
      });
      return;
    }

    // 2. Validar Datos Fiscales y de Contacto
    const fiscalComplete = hasFiscalDataCompleted(providerProfile);
    const contactComplete = hasContactDataCompleted(providerProfile);

    if (!fiscalComplete && !contactComplete) {
      res.status(403).json({ error: 'PROFILE_DATA_INCOMPLETE', message: 'Faltan datos fiscales y de contacto.' });
      return;
    }
    if (!fiscalComplete) {
      res.status(403).json({ error: 'FISCAL_DATA_INCOMPLETE', message: 'Faltan datos fiscales.' });
      return;
    }
    if (!contactComplete) {
      res.status(403).json({ error: 'CONTACT_DATA_INCOMPLETE', message: 'Faltan datos de contacto y ubicación.' });
      return;
    }

    // Opcional: Validar que el administrador lo haya verificado (si aplica según tu flujo)
    if (providerProfile.verificationStatus !== 'VERIFIED') {
      res.status(403).json({ 
        error: 'Tu perfil aún no fue verificado por un administrador. Solo los perfiles verificados pueden publicar.' 
      });
      return;
    }

    // 3. Validar Cupo de acuerdo al Plan
    const limit = 1;
    if (providerProfile.service.length >= limit) {
      res.status(403).json({ 
        error: `Has alcanzado el límite total de publicaciones permitido (${limit} servicio).` 
      });
      return;
    }

    const newService = await prisma.service.create({
      data: {
        id: generateId(),
        title,
        description,
        price,
        providerId: providerProfile.id,
        subcategoryId,
        coverImage,
        videoUrl: videoUrl || null,
        updatedAt: new Date()
      }
    });

    res.status(201).json({ message: 'Servicio creado exitosamente', service: newService });

  } catch (error: any) {
    console.error('Error creando servicio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getMyServices: RequestHandler = async (req, res, next) => {
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

    const service = await prisma.service.findMany({
      where: { providerId: providerProfile.id },
      include: {
        subcategory: { include: { category: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(service);
  } catch (error: any) {
    res.status(500).json({ error: 'Error al listar tus servicios' });
  }
};

export const getServiceById: RequestHandler = async (req, res, next) => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!id) {
      res.status(400).json({ error: 'ID de servicio inválido' });
      return;
    }

    const service = await prisma.service.findFirst({
      where: { 
        id,
        provider: { user: { isDeleted: false } }
      },
      include: {
        provider: { 
          select: { 
            id: true, phone: true, contactEmail: true, bio: true, city: true, province: true, publicUsername: true, verificationStatus: true,
            userId: true,
            user: { select: { name: true, email: true } } 
          } 
        },
        subcategory: { include: { category: true } }
      }
    });

    if (!service) {
      res.status(404).json({ error: 'Servicio no encontrado' });
      return;
    }

    res.status(200).json(service);
  } catch (error: any) {
    res.status(500).json({ error: 'Error al cargar el servicio' });
  }
};

export const updateService: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.id;

    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!id) {
      res.status(400).json({ error: 'ID de servicio inválido' });
      return;
    }

    // Obtener el perfil del prestador
    const providerProfile = await prisma.providerprofile.findUnique({ where: { userId } });
    if (!providerProfile) {
      res.status(404).json({ error: 'Perfil de prestador no encontrado' });
      return;
    }

    // Verificar que el servicio pertenece a este prestador
    const existing = await prisma.service.findUnique({ where: { id: id as string } });
    if (!existing) {
      res.status(404).json({ error: 'Servicio no encontrado' });
      return;
    }
    if (existing.providerId !== providerProfile.id) {
      res.status(403).json({ error: 'No tenés permiso para editar este servicio' });
      return;
    }

    const { title, description, subcategoryId, price, coverImage, videoUrl } = req.body;

    const updateData: {
      title?: string;
      description?: string;
      subcategoryId?: string;
      price?: number | null;
      coverImage?: string | null;
      videoUrl?: string | null;
    } = {};

    if (title !== undefined) {
      const t = typeof title === 'string' ? title.trim() : '';
      if (t.length > 0) updateData.title = t;
    }
    if (description !== undefined) {
      const d = typeof description === 'string' ? description.trim() : '';
      if (d.length > 0) updateData.description = d;
    }
    // NOTA: Se ha bloqueado la edición de subcategoryId por reglas de negocio.
    if (price !== undefined) {
      updateData.price = price !== null && price !== '' ? Number(price) : null;
    }
    if (coverImage !== undefined) {
      updateData.coverImage = typeof coverImage === 'string' && coverImage.trim().length > 0 ? coverImage.trim() : null;
    }
    if (videoUrl !== undefined) {
      updateData.videoUrl = typeof videoUrl === 'string' && videoUrl.trim().length > 0 ? videoUrl.trim() : null;
    }

    const updated = await prisma.service.update({
      where: { id: id as string },
      data: updateData,
      include: {
        subcategory: { include: { category: true } }
      }
    });

    res.status(200).json({ message: 'Servicio actualizado correctamente', service: updated });
  } catch (error: any) {
    console.error('Error en updateService:', error);
    res.status(500).json({ error: 'Error interno al actualizar el servicio' });
  }
};

