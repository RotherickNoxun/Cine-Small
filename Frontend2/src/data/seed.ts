import type {
  AdminNotification,
  CategoryItem,
  Order,
  Product,
  StoreSettings,
} from '@/types/ecommerce';

export const SEED_CATEGORIES: CategoryItem[] = [
  {
    id: 'cat-alquileres',
    name: 'Alquileres',
    description:
      'Salas de cine privadas VIP para películas, parejas, grupos y noches gamer en pantalla gigante.',
    icon: 'solar:clapperboard-play-bold-duotone',
    tagline: 'Reserva tu sala',
    createdAt: '2026-10-01T10:00:00.000Z',
  },
  {
    id: 'cat-productos',
    name: 'Productos',
    description:
      'Candy Bar oficial: combos de pipocas con mantequilla, nachos, bebidas y baldes coleccionables.',
    icon: 'solar:cup-hot-bold-duotone',
    tagline: 'Candy Bar & Merch',
    createdAt: '2026-10-01T10:00:00.000Z',
  },
  {
    id: 'cat-servicios',
    name: 'Servicios',
    description:
      'Paquetes de cumpleaños en el cine, funciones privadas para eventos, aniversarios y proyecciones.',
    icon: 'solar:ticket-sale-bold-duotone',
    tagline: 'Eventos de película',
    createdAt: '2026-10-01T10:00:00.000Z',
  },
  {
    id: 'cat-materiales',
    name: 'Materiales',
    description:
      'Insumos de confitería gourmet para casa, packs de pipocas, sazonadores y lentes 3D.',
    icon: 'solar:glasses-bold-duotone',
    tagline: 'Cine en casa',
    createdAt: '2026-10-01T10:00:00.000Z',
  },
  {
    id: 'cat-equipamiento',
    name: 'Equipamiento',
    description:
      'Mini proyectores Smart Full HD edición Cine Small y pantallas portátiles para llevar el cine contigo.',
    icon: 'solar:tv-bold-duotone',
    tagline: 'Edición Home',
    createdAt: '2026-10-01T10:00:00.000Z',
  },
];

export const SEED_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Alquiler de Sala de Cine Privada VIP (Hasta 12 Personas · 3 Horas)',
    slug: 'alquiler-sala-cine-privada-vip-12',
    category: 'Alquileres',
    type: 'SERVICIO',
    price: 350,
    shortDescription:
      'Sala exclusiva con pantalla gigante 4K, sonido Dolby envolvente, butacas reclinables y película a elección.',
    fullDescription:
      'Disfruta la magia del cine sin interrupciones ni extraños en nuestra Sala Privada VIP. Cuenta con proyección láser 4K de 180 pulgadas, sistema de sonido envolvente, 12 butacas reclinables de cuero con mesas individuales, climatización y acceso a estrenos digitales, Blu-ray 4K o tus plataformas favoritas.',
    images: [
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=900&q=80',
    ],
    isFeatured: true,
    isActive: true,
    serviceModalities: {
      duration: '3 horas de función privada (incluye bienvenida y recepción)',
      availability: 'Todos los días en horarios de 11:00 a 23:30',
      coverage: 'Complejo Cine Small · Salas VIP 1, 2 y 3',
      includes: [
        'Sala privada exclusiva hasta 12 personas',
        'Proyección 4K + Sonido Envolvente',
        'Asistencia de anfitrión en sala',
        'Posibilidad de reproducir película o presentación',
      ],
    },
    specs: {
      Capacidad: 'Hasta 12 personas cómodamente',
      Pantalla: 'Láser 4K UHD 180 pulgadas',
      Audio: 'Surround Cinema 7.1 Dolby',
      Modalidad: 'Reserva de sala por bloque horario',
    },
  },
  {
    id: 'prod-2',
    name: 'Mega Combo Pareja Candy Bar (2 Pipocas Grandes + 2 Refrescos + Nachos)',
    slug: 'mega-combo-pareja-candy-bar',
    category: 'Productos',
    type: 'ESTANDAR',
    price: 95,
    shortDescription:
      'Palomitas recién reventadas con mantequilla dorada de cine, 2 vasos grandes y nachos con queso caliente.',
    fullDescription:
      'El clásico infaltable de Cine Small preparado al momento antes de tu función o listo para delivery directo a tu casa. Incluye dos baldes grandes de pipocas crujientes (saladas con mantequilla o acarameladas), dos bebidas frías de 32 oz y una bandeja de nachos con doble salsa cheddar tibia.',
    images: [
      'https://images.unsplash.com/photo-1585647347483-22b66260dfff?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1578849278619-e73505e9610f?auto=format&fit=crop&w=900&q=80',
    ],
    isFeatured: true,
    isActive: true,
    stock: 45,
    specs: {
      Pipocas: '2 × Grandes (Salada o Caramelo)',
      Bebidas: '2 × Refrescos 32 oz (con hielo)',
      SnackExtra: 'Nachos crujientes + Queso cheddar',
      Entrega: 'En sala VIP o retiro/delivery expreso',
    },
  },
  {
    id: 'prod-3',
    name: 'Paquete Cumpleaños de Película en Sala Exclusiva (Hasta 20 Invitados)',
    slug: 'paquete-cumpleanos-cine-exclusivo',
    category: 'Servicios',
    type: 'SERVICIO',
    price: 890,
    shortDescription:
      '3 horas de sala privada, película a elección, 20 combos de pipocas + bebida y saludo en pantalla gigante.',
    fullDescription:
      'Celebra un cumpleaños inolvidable dentro de tu propio cine. Reservamos una sala completa para ti y hasta 20 invitados con proyección de la película favorita del cumpleañero, mensaje o video sorpresa proyectado en pantalla gigante antes de iniciar, 20 combos individuales de pipocas medianas con refresco y mesa decorada en el lobby VIP.',
    images: [
      'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=900&q=80',
    ],
    isFeatured: true,
    isActive: true,
    serviceModalities: {
      duration: '3 horas completas (2h película + 1h celebración y fotos)',
      availability: 'Viernes, Sábados, Domingos y feriados previa reserva',
      coverage: 'Salas Premier Cine Small + Zona Lounge de torta',
      includes: [
        'Sala privada para hasta 20 personas',
        '20 Combos individuales (Pipoca + Refresco)',
        'Saludo personalizado en pantalla gigante',
        'Anfitrión dedicado y mesa para torta',
      ],
    },
    specs: {
      Invitados: 'Hasta 20 personas incluidas',
      Confitería: '20 Combos Candy Bar incluidos',
      Personalización: 'Video o placa de saludo en pantalla',
      Modalidad: 'Evento privado todo incluido',
    },
  },
  {
    id: 'prod-4',
    name: 'Noche Romántica VIP: Sala Privada para Parejas + Combo Gourmet',
    slug: 'noche-romantica-vip-parejas',
    category: 'Alquileres',
    type: 'SERVICIO',
    price: 240,
    shortDescription:
      'Función exclusiva solo para dos en sillón Love-Seat reclinable VIP, iluminación cálida y combo dulce/salado.',
    fullDescription:
      'Sorprende a tu pareja con una sala de cine entera solo para ustedes dos. Disfruten de nuestra película romántica o estreno digital favorito desde un cómodo Love-Seat doble reclinable con manta suave, iluminación ambiental tenue dorada, balde grande de pipocas mixtas, dos bebidas y chocolates artesanales.',
    images: [
      'https://images.unsplash.com/photo-1595769816263-9b910be24d5f?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=900&q=80',
    ],
    isFeatured: true,
    isActive: true,
    serviceModalities: {
      duration: '2 horas 30 minutos de función privada para 2 personas',
      availability: 'Todos los días (turnos tarde y noche)',
      coverage: 'Suite Micro-Cine VIP Cine Small',
      includes: [
        'Sala privada 100% exclusiva para la pareja',
        'Sillón Love-Seat reclinable + mantas',
        'Combo Pipocas Mix + 2 Bebidas + Bombones',
        'Mensaje de dedicatoria opcional al inicio',
      ],
    },
    specs: {
      Asistentes: 'Exclusivo 2 personas (Pareja)',
      Confort: 'Love-Seat reclinable eléctrico',
      Gastronomía: 'Pipocas, bebidas y chocolates incl.',
      Modalidad: 'Reserva romántica privada',
    },
  },
  {
    id: 'prod-5',
    name: 'Balde Metálico Coleccionable Edición Estreno + 2 Vasos Térmicos',
    slug: 'balde-metalico-coleccionable-estreno',
    category: 'Productos',
    type: 'ESTANDAR',
    price: 145,
    shortDescription:
      'Edición limitada de colección Cine Small en acabado negro y dorado, incluye recarga llena de pipocas.',
    fullDescription:
      'Llévate a casa el set de colección oficial de Cine Small: un balde metálico de gran capacidad (4.5 Litros) con relieve cinematográfico dorado y dos vasos térmicos reutilizables con tapa antiderrame y sorbete metálico. Se entrega lleno de pipocas recién preparadas y bebidas a elección si retiras en complejo.',
    images: [
      'https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1585647347483-22b66260dfff?auto=format&fit=crop&w=900&q=80',
    ],
    isFeatured: true,
    isActive: true,
    stock: 22,
    specs: {
      Capacidad: 'Balde 4.5 L + 2 Vasos 24 oz',
      Material: 'Acero esmaltado libre de BPA',
      Edición: 'Colección Limitada 2026 Cine Small',
      Beneficio: '20% desc. en futuras recargas en sala',
    },
  },
  {
    id: 'prod-6',
    name: 'Alquiler de Sala Gamer & Partidos en Pantalla Gigante (3 Horas)',
    slug: 'alquiler-sala-gamer-partidos-pantalla-gigante',
    category: 'Alquileres',
    type: 'SERVICIO',
    price: 320,
    shortDescription:
      'Conecta tu PS5 o disfruta finales deportivas en pantalla 4K de 180" con baja latencia y sonido estadio.',
    fullDescription:
      'Alquila nuestra sala equipada con conexión HDMI 2.1 de baja latencia (120Hz), consola PS5 disponible con 4 mandos, Wi-Fi simétrico dedicado y butacas VIP para hasta 10 personas.',
    images: [
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=900&q=80',
    ],
    isFeatured: true,
    isActive: true,
    serviceModalities: {
      duration: '3 horas continuas de sala gamer / deportiva',
      availability: 'Lunes a Domingo (horarios sujetos a cartelera)',
      coverage: 'Sala Gamer Cine Small · Hasta 10 jugadores/amigos',
      includes: [
        'Proyección 4K Baja Latencia en 180"',
        'PS5 con 4 mandos (o conecta tu propia consola)',
        'Transmisión deportiva en vivo disponible',
        'Audio envolvente calibrado para gaming/fútbol',
      ],
    },
    specs: {
      Capacidad: 'Hasta 10 amigos en butacas VIP',
      Latencia: 'Modo Gaming < 12 ms / HDMI 2.1',
      Consola: 'PS5 + 4 mandos DualSense incluidos',
      Modalidad: 'Alquiler por sesión de 3 horas',
    },
  },
  {
    id: 'prod-7',
    name: 'Combo Familiar Premier (4 Pipocas + 4 Bebidas + 2 Hot Dogs + Chocolates)',
    slug: 'combo-familiar-premier-candy-bar',
    category: 'Productos',
    type: 'ESTANDAR',
    price: 165,
    shortDescription:
      'El festín completo de Candy Bar para disfrutar en familia en nuestras salas o pedir a domicilio.',
    fullDescription:
      'Incluye 4 cajas medianas de pipocas recién hechas (puedes combinar saladas y acarameladas), 4 gaseosas o jugos de 22 oz, 2 hot dogs gourmet con salsas a elección y 2 tabletas de chocolate de cine.',
    images: [
      'https://images.unsplash.com/photo-1578849278619-e73505e9610f?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1585647347483-22b66260dfff?auto=format&fit=crop&w=900&q=80',
    ],
    isFeatured: false,
    isActive: true,
    stock: 30,
    specs: {
      Porciones: 'Ideal para 4 personas',
      Pipocas: '4 × Medianas (Salada / Caramelo)',
      Comida: '2 × Hot Dogs Gourmet + 2 Chocolates',
      Entrega: 'En sala o delivery térmico sellado',
    },
  },
  {
    id: 'prod-8',
    name: 'Pack Cine en Casa: 12 Bolsas Pipocas Gourmet + Sazonador Mantequilla',
    slug: 'pack-cine-en-casa-pipocas-sazonador',
    category: 'Materiales',
    type: 'ESTANDAR',
    price: 75,
    shortDescription:
      'Prepara el auténtico sabor de las pipocas de Cine Small en casa con grano seleccionado y sal dorada.',
    fullDescription:
      'El pack contiene 12 porciones selladas de maíz tipo Butterfly de alta expansión, frasco de sal fina con saborizante original a mantequilla de cine y 6 cajas plegables con el diseño clásico de Cine Small.',
    images: [
      'https://images.unsplash.com/photo-1585647347483-22b66260dfff?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?auto=format&fit=crop&w=900&q=80',
    ],
    isFeatured: false,
    isActive: true,
    stock: 50,
    specs: {
      Contenido: '12 porciones de maíz + Sazonador 200g',
      Accesorios: '6 cajas cartón edición Cine Small',
      Rendimiento: '12 tandas de pipocas tamaño grande',
      Conservación: 'Empaque hermético larga duración',
    },
  },
  {
    id: 'prod-9',
    name: 'Pack Familiar 4 Lentes 3D Polarizados Cinema Premier Reutilizables',
    slug: 'pack-4-lentes-3d-polarizados-cinema',
    category: 'Materiales',
    type: 'ESTANDAR',
    price: 60,
    shortDescription:
      'Lentes 3D pasivos ligeros de alta claridad óptica con estuche individual para salas y TV 3D.',
    fullDescription:
      'Set de 4 lentes 3D polarizados circulares (3 tallas adulto y 1 talla junior) con filtro anti-rayaduras y máxima transmisión luminosa.',
    images: [
      'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=900&q=80',
    ],
    isFeatured: false,
    isActive: true,
    stock: 38,
    specs: {
      Cantidad: '4 Lentes (3 Adulto + 1 Niño)',
      Tecnología: 'Polarización circular pasiva RealD',
      Incluye: '4 fundas de microfibra limpia-lentes',
      Compatibilidad: 'Salas 3D pasivas y TV/Proyectores',
    },
  },
  {
    id: 'prod-10',
    name: 'Mini Proyector Smart Full HD Cine Small Home Edition + Pantalla 100"',
    slug: 'mini-proyector-smart-cine-small-home',
    category: 'Equipamiento',
    type: 'ESTANDAR',
    price: 1290,
    shortDescription:
      'Arma tu propio micro-cine portátil en casa o patio con Android TV integrado, Wi-Fi y tela plegable.',
    fullDescription:
      'Proyector compacto Full HD 1080p nativo con enfoque automático, corrección trapezoidal, parlantes estéreo integrados, conectividad Wi-Fi/Bluetooth y pantalla portátil anti-arrugas de 100 pulgadas incluida.',
    images: [
      'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=900&q=80',
    ],
    isFeatured: false,
    isActive: true,
    stock: 8,
    specs: {
      Resolución: 'Full HD 1080p (soporta entrada 4K)',
      TamañoImagen: '40" a 150" (Pantalla 100" incluida)',
      Sistema: 'Smart TV + Wi-Fi 6 + Bluetooth 5.2',
      Garantía: '12 meses oficial Cine Small',
    },
  },
];

function createReceiptVoucherSvg(
  title: string,
  subtitle: string,
  orderLine: string,
  customerLine: string,
  refLine: string,
  accentColor: string
): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420" viewBox="0 0 640 420">
    <rect width="640" height="420" fill="#F8FAFC"/>
    <rect x="28" y="28" width="584" height="364" rx="18" fill="#FFFFFF" stroke="${accentColor}" stroke-width="2.5"/>
    <rect x="28" y="28" width="584" height="68" rx="18" fill="#0A192F"/>
    <text x="320" y="69" text-anchor="middle" fill="#D4AF37" font-family="sans-serif" font-size="18" font-weight="800" letter-spacing="1.5">CINE SMALL S.R.L. · COMPROBANTE QR</text>
    <text x="320" y="136" text-anchor="middle" fill="#0F172A" font-family="sans-serif" font-size="22" font-weight="800">${title}</text>
    <text x="320" y="172" text-anchor="middle" fill="${accentColor}" font-family="sans-serif" font-size="17" font-weight="700">${subtitle}</text>
    <line x1="80" y1="204" x2="560" y2="204" stroke="#E2E8F0" stroke-width="1.5"/>
    <text x="320" y="242" text-anchor="middle" fill="#475569" font-family="sans-serif" font-size="15">${orderLine}</text>
    <text x="320" y="276" text-anchor="middle" fill="#475569" font-family="sans-serif" font-size="15">${customerLine}</text>
    <text x="320" y="324" text-anchor="middle" fill="#64748B" font-family="sans-serif" font-size="13">${refLine}</text>
    <rect x="210" y="346" width="220" height="28" rx="14" fill="${accentColor}" fill-opacity="0.14"/>
    <text x="320" y="365" text-anchor="middle" fill="${accentColor}" font-family="sans-serif" font-size="12" font-weight="700">VERIFICACIÓN DIGITAL QR SIMPLE</text>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function createDefaultBankQrSvg(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320">
    <rect width="320" height="320" rx="20" fill="#FFFFFF"/>
    <rect x="12" y="12" width="296" height="296" rx="14" fill="none" stroke="#D4AF37" stroke-width="3"/>
    <g fill="#0A192F">
      <rect x="34" y="34" width="66" height="66" rx="8"/>
      <rect x="44" y="44" width="46" height="46" rx="4" fill="#FFFFFF"/>
      <rect x="54" y="54" width="26" height="26" rx="3" fill="#0A192F"/>
      <rect x="220" y="34" width="66" height="66" rx="8"/>
      <rect x="230" y="44" width="46" height="46" rx="4" fill="#FFFFFF"/>
      <rect x="240" y="54" width="26" height="26" rx="3" fill="#0A192F"/>
      <rect x="34" y="220" width="66" height="66" rx="8"/>
      <rect x="44" y="230" width="46" height="46" rx="4" fill="#FFFFFF"/>
      <rect x="54" y="240" width="26" height="26" rx="3" fill="#0A192F"/>
      <rect x="116" y="40" width="14" height="14"/>
      <rect x="144" y="40" width="28" height="14"/>
      <rect x="186" y="40" width="14" height="28"/>
      <rect x="116" y="68" width="28" height="14"/>
      <rect x="158" y="68" width="14" height="28"/>
      <rect x="40" y="116" width="28" height="14"/>
      <rect x="82" y="116" width="14" height="42"/>
      <rect x="116" y="116" width="88" height="88" rx="14" fill="#112240" stroke="#D4AF37" stroke-width="3"/>
      <text x="160" y="156" text-anchor="middle" fill="#D4AF37" font-family="sans-serif" font-size="14" font-weight="800">CINE</text>
      <text x="160" y="176" text-anchor="middle" fill="#FFFFFF" font-family="sans-serif" font-size="13" font-weight="800">SMALL</text>
      <rect x="220" y="116" width="28" height="14"/>
      <rect x="262" y="116" width="24" height="42"/>
      <rect x="40" y="144" width="14" height="42"/>
      <rect x="68" y="172" width="28" height="28"/>
      <rect x="220" y="158" width="28" height="28"/>
      <rect x="262" y="172" width="24" height="28"/>
      <rect x="116" y="220" width="28" height="28"/>
      <rect x="158" y="220" width="14" height="14"/>
      <rect x="186" y="220" width="42" height="14"/>
      <rect x="242" y="220" width="44" height="28"/>
      <rect x="116" y="262" width="14" height="24"/>
      <rect x="144" y="248" width="42" height="38"/>
      <rect x="200" y="262" width="28" height="24"/>
      <rect x="242" y="262" width="44" height="24"/>
    </g>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export const SEED_ORDERS: Order[] = [
  {
    id: '#CS-2026-001',
    createdAt: '2026-11-10T19:15:00.000Z',
    customerName: 'Valeria Mendoza Rojas',
    customerPhone: '71234567',
    address: 'Complejo Cine Small · Sala Privada VIP 1 (Función 20:00)',
    notes: 'Película seleccionada: Interestelar 4K. Pipocas mitad saladas y mitad caramelo.',
    items: [
      {
        productId: 'prod-1',
        name: 'Alquiler de Sala de Cine Privada VIP (Hasta 12 Personas · 3 Horas)',
        type: 'SERVICIO',
        category: 'Alquileres',
        price: 350,
        quantity: 1,
        image: SEED_PRODUCTS[0].images[0],
      },
      {
        productId: 'prod-2',
        name: 'Mega Combo Pareja Candy Bar (2 Pipocas Grandes + 2 Refrescos + Nachos)',
        type: 'ESTANDAR',
        category: 'Productos',
        price: 95,
        quantity: 2,
        image: SEED_PRODUCTS[1].images[0],
      },
    ],
    subtotal: 540,
    total: 540,
    paymentStatus: 'PAGADO',
    orderStatus: 'ENVIADO_COMPLETADO',
    receipt: {
      fileName: 'comprobante_sala_vip_cs2026001.svg',
      fileType: 'image/svg+xml',
      fileSize: 284512,
      previewUrl: createReceiptVoucherSvg(
        'TRANSFERENCIA QR APROBADA',
        'Bs. 540,00 · PAGO CONFIRMADO',
        'Orden #CS-2026-001 · Sala Privada VIP + Candy Bar',
        'Titular: Valeria Mendoza Rojas · Cel: 71234567',
        'Operación Banco Nacional #994820194',
        '#10B981'
      ),
      uploadedAt: '2026-11-10T19:20:00.000Z',
    },
  },
  {
    id: '#CS-2026-002',
    createdAt: '2026-11-12T18:10:00.000Z',
    customerName: 'Carlos Eduardo Torrico',
    customerPhone: '76543210',
    address: 'Complejo Cine Small · Sala Premier Cumpleaños (Sábado 16:00)',
    notes: 'Cumpleaños de Mateo (10 años). Proyectar saludo de bienvenida antes de la película.',
    items: [
      {
        productId: 'prod-3',
        name: 'Paquete Cumpleaños de Película en Sala Exclusiva (Hasta 20 Invitados)',
        type: 'SERVICIO',
        category: 'Servicios',
        price: 890,
        quantity: 1,
        image: SEED_PRODUCTS[2].images[0],
      },
    ],
    subtotal: 890,
    total: 890,
    paymentStatus: 'COMPROBANTE_ENVIADO',
    orderStatus: 'PENDIENTE',
    receipt: {
      fileName: 'transferencia_qr_cumpleanos_cs2026002.svg',
      fileType: 'image/svg+xml',
      fileSize: 196400,
      previewUrl: createReceiptVoucherSvg(
        'VOUCHER QR POR VERIFICAR',
        'Bs. 890,00 · PENDIENTE DE AUDITORÍA',
        'Orden #CS-2026-002 · Cumpleaños de Película (20 Invitados)',
        'Cliente: Carlos Eduardo Torrico · Cel: 76543210',
        'Ref. Transferencia QR Simple #88231405',
        '#F59E0B'
      ),
      uploadedAt: '2026-11-12T18:18:00.000Z',
    },
  },
  {
    id: '#CS-2026-003',
    createdAt: '2026-11-13T11:45:00.000Z',
    customerName: 'Lucía Fernanda Arce',
    customerPhone: '69871234',
    address: 'Av. Cristo Redentor Km 4, Condominio Las Palmas Casa 14 (Delivery)',
    notes: 'Enviar balde coleccionable y pack de pipocas hoy por la tarde.',
    items: [
      {
        productId: 'prod-5',
        name: 'Balde Metálico Coleccionable Edición Estreno + 2 Vasos Térmicos',
        type: 'ESTANDAR',
        category: 'Productos',
        price: 145,
        quantity: 1,
        image: SEED_PRODUCTS[4].images[0],
      },
      {
        productId: 'prod-8',
        name: 'Pack Cine en Casa: 12 Bolsas Pipocas Gourmet + Sazonador Mantequilla',
        type: 'ESTANDAR',
        category: 'Materiales',
        price: 75,
        quantity: 2,
        image: SEED_PRODUCTS[7].images[0],
      },
    ],
    subtotal: 295,
    total: 295,
    paymentStatus: 'PENDIENTE',
    orderStatus: 'PENDIENTE',
  },
  {
    id: '#CS-2026-004',
    createdAt: '2026-11-13T14:05:00.000Z',
    customerName: 'Rodrigo Salvatierra Gutiérrez',
    customerPhone: '77418520',
    address: 'Equipetrol Calle 8 Este #240, Torre Empresarial Piso 3',
    notes: 'Entrega coordinada para noche de estreno en proyector portátil.',
    items: [
      {
        productId: 'prod-10',
        name: 'Mini Proyector Smart Full HD Cine Small Home Edition + Pantalla 100"',
        type: 'ESTANDAR',
        category: 'Equipamiento',
        price: 1290,
        quantity: 1,
        image: SEED_PRODUCTS[9].images[0],
      },
    ],
    subtotal: 1290,
    total: 1290,
    paymentStatus: 'PAGADO',
    orderStatus: 'VERIFICADO',
    receipt: {
      fileName: 'pago_qr_proyector_cs2026004.svg',
      fileType: 'image/svg+xml',
      fileSize: 221900,
      previewUrl: createReceiptVoucherSvg(
        'PAGO QR VERIFICADO',
        'Bs. 1.290,00 · LISTO PARA DESPACHO',
        'Orden #CS-2026-004 · Mini Proyector Smart Full HD',
        'Cliente: Rodrigo Salvatierra · Cel: 77418520',
        'Ref. Banco Nacional #77120491',
        '#10B981'
      ),
      uploadedAt: '2026-11-13T14:12:00.000Z',
    },
  },
];

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  qrImageUrl: createDefaultBankQrSvg(),
  bankName: 'Banco Nacional Premier (QR Simple)',
  accountHolder: 'Cine Small S.R.L.',
  accountNumber: '100-4829104-29',
  nit: '384920019',
  currencyLabel: 'Bolivianos (Bs.)',
  sellerWhatsapp: '59170012345',
  publicStoreUrl: 'http://localhost:5173',
  socialLinks: {
    facebook: 'https://facebook.com/cinesmall',
    instagram: 'https://instagram.com/cinesmall',
    tiktok: 'https://tiktok.com/@cinesmall',
    x: 'https://x.com/cinesmall',
  },
  updatedAt: '2026-11-13T10:00:00.000Z',
};

export const SEED_NOTIFICATIONS: AdminNotification[] = [
  {
    id: 'notif-1',
    orderId: '#CS-2026-002',
    title: 'Nuevo comprobante recibido en #CS-2026-002',
    message:
      'Carlos Eduardo Torrico adjuntó voucher QR por Bs. 890,00 pendiente de verificación.',
    kind: 'RECEIPT',
    isRead: false,
    createdAt: '2026-11-12T18:18:00.000Z',
  },
  {
    id: 'notif-2',
    orderId: '#CS-2026-003',
    title: 'Nuevo pedido registrado #CS-2026-003',
    message:
      'Lucía Fernanda Arce registró un pedido por Bs. 295,00 (comprobante pendiente).',
    kind: 'NEW_ORDER',
    isRead: false,
    createdAt: '2026-11-13T11:45:00.000Z',
  },
];

