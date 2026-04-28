import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

const catalog = [
  {
    name: 'Construcción y Mantenimiento',
    subcategories: [
      'Aberturas (Aluminio / PVC / Madera)',
      'Albañilería',
      'Carpintería y Muebles a medida',
      'Climatización y Refrigeración (Aires Acondicionados)',
      'Construcción en Seco (Durlock-Yeso / Steel Frame)',
      'Construcción Industrializada y Modular',
      'Construcción Tradicional',
      'Corralón y Provisión de Materiales',
      'Diseño y Decoración de Interiores',
      'Electricista (Domiciliario e Industrial)',
      'Gasista',
      'Herrería y Metalurgia',
      'Hormigón Elaborado y Prefabricados',
      'Impermeabilización y Techos',
      'Montaje de Estructuras (Casas Prefabricadas, Galpones, Silos)',
      'Perforaciones y Movimiento de Suelos',
      'Pintura (Obra y Mantenimiento)',
      'Pisos, Revestimientos y Cerámicos',
      'Plomería',
      'Tapiales (Premoldeados) y Cerramientos'
    ]
  },
  {
    name: 'Servicios Personales y Estética',
    subcategories: [
      'Bienestar y Relajación',
      'Cosmetología y Cuidado de la piel',
      'Cuidado de manos y pies',
      'Depilación',
      'Estética Ornamental',
      'Maquillaje',
      'Mantenimiento Físico (Personal Trainer)',
      'Modificación Corporal (Tatuajes)',
      'Peluquería de la mujer',
      'Peluquero / Barbero'
    ]
  },
  {
    name: 'Servicios Automotriz y Mecánicos',
    subcategories: [
      'Alineación y Balanceo',
      'Cerrajería de vehículos',
      'Chapa y Pintura Automotor',
      'Compra y Venta de Autos nuevos y usados',
      'Concesionaria',
      'Detailing automotor',
      'Electromecánica',
      'Gestor del Automotor',
      'Gomería (Autos y Motos)',
      'Lavadero de Autos',
      'Lubricentro',
      'Mecánica de Autos',
      'Mecánica de Motos',
      'Mecánica de Máquinas Pesadas',
      'Tapicería Automotor',
      'Diagnóstico Electrónico Vehicular',
      'Electricidad Automotor',
      'Escapes y Sistemas de Emisión',
      'Suspensión, Tren delantero y Amortiguación',
      'Instalación de accesorios automotores (Alarma, Audio, GPS)',
      'Cambio y reparación de cristales automotores',
      'Servicio de Grúa y Remolque Vehicular',
      'Venta de Repuestos y Autopartes'
    ]
  },
  {
    name: 'Servicio Domiciliario y Limpieza',
    subcategories: [
      'Cerrajería Domiciliaria',
      'Control de Plagas y Fumigación',
      'Desmalezado',
      'Jardinería y Paisajismo',
      'Limpieza de Casas',
      'Limpieza de tanques de agua',
      'Limpieza de vidrios y frentes (comercios, edificios)',
      'Limpieza y Desinfección',
      'Mantenimiento de Piletas'
    ]
  },
  {
    name: 'Tecnología y Comunicación',
    subcategories: [
      'Analista en Sistemas',
      'Community Manager',
      'Diseñador Gráfico',
      'Especialista en E-Commerce',
      'Influencer',
      'Ingeniero en Sistemas',
      'Instalador de alarmas y cámaras de seguridad',
      'Programador',
      'Servicio Técnico en Computación',
      'Técnico informático',
      'Desarrollo y mantenimiento de sitios web',
      'Soporte técnico en redes y conectividad'
    ]
  },
  {
    name: 'Fletes y Acarreos',
    subcategories: [
      'Fletes de Larga Distancia',
      'Fletes Locales',
      'Mudanzas Locales y Zonales',
      'Acarreos y TRASLADOS MENORES',
      'Carga y descarga de mercaderías'
    ]
  },
  {
    name: 'Terapias Complementarias',
    subcategories: [
      'Acupuntura',
      'Biodanza',
      'Biodecodificación',
      'Constelaciones',
      'Meditación',
      'Reiki',
      'Yoga',
      'Masajes Terapéuticos',
      'Terapias Holísticas integrales'
    ]
  },
  {
    name: 'Inmobiliario',
    subcategories: [
      'Agrimensor',
      'Compra y venta de terrenos y casas',
      'Desarrollador',
      'Estudio de Arquitectura',
      'Inmobiliaria',
      'Venta en pozo',
      'Administración de propiedades',
      'Tasaciones inmobiliarias'
    ]
  },
  {
    name: 'Servicios Profesionales',
    subcategories: [
      'Abogados',
      'Arquitectos',
      'Asesores y consultores profesionales',
      'Psicólogos',
      'Veterinarios',
      'Productor y Asesor de Seguros',
      'Contadores Públicos',
      'Escribanos',
      'Ingenieros (Civil, Industrial, Electromecánico, etc.)',
      'Médicos',
      'Odontólogos',
      'Kinesiólogos y Fisioterapeutas',
      'Nutricionistas',
      'Psicopedagogos',
      'Trabajadores Sociales',
      'Martilleros y Corredores Públicos',
      'Profesionales de Recursos Humanos'
    ]
  },
  {
    name: 'Varios',
    subcategories: [
      'Clases',
      'Coaching de equipos',
      'Coaching Ontológico',
      'Talleres',
      'Tatuador',
      'Turismo',
      'Viajes',
      'Capacitación y Formación General',
      'Organización de Eventos',
      'Cursos'
    ]
  },
  {
    name: 'Alquileres temporales / varios',
    subcategories: [
      'Alquiler de baños químicos',
      'Alquiler de disfraces',
      'Alquiler de herramientas',
      'Alquiler de inflables',
      'Alquiler de obrador',
      'Alquiler de quintas para eventos',
      'Alquiler de salón para eventos',
      'Alquiler de sonido',
      'Alquiler de carpas y mobiliario para eventos',
      'Alquiler de equipamiento para obras y construcción',
      'Alquileres de montacargas'
    ]
  }
];

async function main() {
  console.log('🌱 Ejecutando HogArtes Database Seeder...');

  // 1. ELIMINAR CUALQUIER MOCK
  console.log('🧹 Limpiando categorías MOCK de pruebas...');

  // Buscar categoría de MOCK y sus dependencias
  const mockCat = await prisma.category.findUnique({
    where: { name: 'Servicios MOCK' }
  });

  if (mockCat) {
    // Eliminar posibles servicios hijos asociados a subrubros de esta categoría MOCK
    const mockSubcategories = await prisma.subcategory.findMany({
      where: { categoryId: mockCat.id }
    });

    for (const sub of mockSubcategories) {
      // Eliminar servicios atados a la subcategoria MOCK
      await prisma.service.deleteMany({
        where: { subcategoryId: sub.id }
      });
    }

    // Luego eliminar los subrubros
    await prisma.subcategory.deleteMany({
      where: { categoryId: mockCat.id }
    });

    // Y finalmente eliminar la categoría
    await prisma.category.delete({
      where: { id: mockCat.id }
    });

    console.log('✅ Categoría "Servicios MOCK" eliminada correctamente.');
  }

  // 2. UPSERT DE CATALOGO OFICIAL
  console.log('🔄 Sincronizando catálogo oficial de Masterlist...');
  for (const cat of catalog) {
    // Intenta crear o encontrar la categoría base
    const dbCategory = await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: {
        id: randomUUID(),
        name: cat.name,
        updatedAt: new Date(),
      }
    });

    // Y ahora crear o asegurar los subrubros para evitar el borrado relacional riesgoso
    // Upsert individual evita que los ya seleccionados por servicios de terceros se borren/creen
    let subCount = 0;
    for (const subName of cat.subcategories) {
      // Para upsert local usando multiples campos en prisma (si no hay restriccion @@unique combinada)
      // Usaremos findFirst en su defecto para validarlo con su categoryId específico.
      const existingSub = await prisma.subcategory.findFirst({
        where: { name: subName, categoryId: dbCategory.id }
      });

      if (!existingSub) {
        await prisma.subcategory.create({
          data: {
            id: randomUUID(),
            name: subName,
            categoryId: dbCategory.id,
            updatedAt: new Date(),
          }
        });
        subCount++;
      }
    }
    console.log(`- Categoría "${cat.name}": OK (${subCount} nuevos subrubros)`);
  }

  console.log('✅ Catálogo entero configurado exitosamente.');
}

main()
  .catch((e) => {
    console.error('❌ FATAL ERROR SEEDING DB:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
