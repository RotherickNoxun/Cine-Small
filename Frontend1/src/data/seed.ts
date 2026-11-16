import type { Movie, Order, Product, ProductCategory } from '@/types/ecommerce';

export const STORE_CATEGORIES: {
  name: ProductCategory;
  description: string;
  icon: string;
  tagline: string;
}[] = [
  {
    name: 'Alquileres',
    description:
      'Salas de cine privadas VIP para películas, parejas, grupos y noches gamer en pantalla gigante.',
    icon: 'solar:clapperboard-play-bold-duotone',
    tagline: 'Reserva tu sala',
  },
  {
    name: 'Productos',
    description:
      'Candy Bar oficial: combos de pipocas con mantequilla, nachos, bebidas y baldes coleccionables.',
    icon: 'solar:cup-hot-bold-duotone',
    tagline: 'Candy Bar & Merch',
  },
  {
    name: 'Servicios',
    description:
      'Paquetes de cumpleaños en el cine, funciones privadas para eventos, aniversarios y proyecciones.',
    icon: 'solar:ticket-sale-bold-duotone',
    tagline: 'Eventos de película',
  },
  {
    name: 'Materiales',
    description:
      'Insumos de confitería gourmet para casa, packs de pipocas, sazonadores y lentes 3D.',
    icon: 'solar:glasses-bold-duotone',
    tagline: 'Cine en casa',
  },
  {
    name: 'Equipamiento',
    description:
      'Mini proyectores Smart Full HD edición Cine Small y pantallas portátiles para llevar el cine contigo.',
    icon: 'solar:tv-bold-duotone',
    tagline: 'Edición Home',
  },
];

export const BANK_ACCOUNT_INFO = {
  bankName: 'Banco Nacional Premier (QR Simple)',
  holder: 'Cine Small S.R.L.',
  accountNumber: '100-4829104-29',
  nit: '384920019',
  currency: 'Bolivianos (Bs.)',
  domain: 'cinesmall.com',
};

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
      '¿Imaginas jugar torneos de FIFA, Mario Kart, Tekken o ver la final de Champions en una pantalla gigante de cine con tus amigos? Alquila nuestra sala equipada con conexión HDMI 2.1 de baja latencia (120Hz), consola PS5 disponible con 4 mandos, Wi-Fi simétrico dedicado y butacas VIP para hasta 10 personas.',
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
      'Pensado para compartir en familia o noches de maratón de películas. Incluye 4 cajas medianas de pipocas recién hechas (puedes combinar saladas y acarameladas), 4 gaseosas o jugos de 22 oz, 2 hot dogs gourmet con salsas a elección y 2 tabletas de chocolate de cine.',
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
      'Nuestra fórmula secreta de confitería ahora disponible para tus noches de película en casa. El pack contiene 12 porciones selladas de maíz tipo Butterfly de alta expansión, frasco de sal fina con saborizante original a mantequilla de cine y 6 cajas plegables con el diseño clásico de Cine Small.',
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
      'Set de 4 lentes 3D polarizados circulares (3 tallas adulto y 1 talla junior) con filtro anti-rayaduras y máxima transmisión luminosa para no perder detalle en escenas oscuras. Ideales para traer a todas tus funciones 3D en Cine Small o usar en proyectores compatibles.',
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
      'Diseñado para llevar la experiencia Cine Small a tu sala, terraza o viaje. Proyector compacto Full HD 1080p nativo con enfoque automático, corrección trapezoidal, parlantes estéreo integrados, conectividad Wi-Fi/Bluetooth para tus apps de streaming y pantalla portátil anti-arrugas de 100 pulgadas incluida.',
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
      fileName: 'comprobante_sala_vip_cs2026001.png',
      fileType: 'image/png',
      fileSize: 284512,
      previewUrl:
        'data:image/svg+xml;charset=UTF-8,' +
        encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="320" viewBox="0 0 480 320">
            <rect width="480" height="320" fill="#F8FAFC"/>
            <rect x="24" y="24" width="432" height="272" rx="14" fill="#FFFFFF" stroke="#10B981" stroke-width="2"/>
            <text x="240" y="72" text-anchor="middle" fill="#0A192F" font-family="sans-serif" font-size="20" font-weight="700">COMPROBANTE QR VERIFICADO</text>
            <text x="240" y="112" text-anchor="middle" fill="#10B981" font-family="sans-serif" font-size="16" font-weight="700">RESERVA PAGADA - Bs. 540,00</text>
            <text x="240" y="160" text-anchor="middle" fill="#475569" font-family="sans-serif" font-size="14">Pedido: #CS-2026-001 · Sala Privada VIP</text>
            <text x="240" y="190" text-anchor="middle" fill="#475569" font-family="sans-serif" font-size="14">Titular: Valeria Mendoza Rojas</text>
            <text x="240" y="230" text-anchor="middle" fill="#94A3B8" font-family="sans-serif" font-size="12">Ref. Operación #994820194</text>
          </svg>`
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
      fileName: 'transferencia_qr_cumpleanos.png',
      fileType: 'image/png',
      fileSize: 196400,
      previewUrl:
        'data:image/svg+xml;charset=UTF-8,' +
        encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="320" viewBox="0 0 480 320">
            <rect width="480" height="320" fill="#F8FAFC"/>
            <rect x="24" y="24" width="432" height="272" rx="14" fill="#FFFFFF" stroke="#F59E0B" stroke-width="2"/>
            <text x="240" y="72" text-anchor="middle" fill="#0A192F" font-family="sans-serif" font-size="20" font-weight="700">VOUCHER DE TRANSFERENCIA QR</text>
            <text x="240" y="112" text-anchor="middle" fill="#F59E0B" font-family="sans-serif" font-size="16" font-weight="700">EN REVISIÓN - Bs. 890,00</text>
            <text x="240" y="160" text-anchor="middle" fill="#475569" font-family="sans-serif" font-size="14">Pedido: #CS-2026-002 · Cumpleaños en Cine</text>
            <text x="240" y="190" text-anchor="middle" fill="#475569" font-family="sans-serif" font-size="14">Cliente: Carlos Eduardo Torrico</text>
            <text x="240" y="230" text-anchor="middle" fill="#94A3B8" font-family="sans-serif" font-size="12">Banco Destino: Cine Small S.R.L.</text>
          </svg>`
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
];

export const SEED_MOVIES: Movie[] = [
  {
    id: 'mov-1',
    title: 'Horizonte Cuántico: Odisea 4K',
    genre: 'Ciencia Ficción / Aventura',
    duration: '2h 38m',
    rating: 'B-12',
    score: '9.5',
    status: 'ESTRENO',
    director: 'Mateo Valdivia',
    synopsis:
      'Una tripulación de exploración espacial descubre un portal gravitacional que reescribe la historia humana. Diseñada para disfrutarse en proyección Láser 4K y sonido envolvente.',
    posterUrl:
      'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=700&q=80',
    backdropUrl:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    isActive: true,
    isFeatured: true,
    showtimes: [
      {
        id: 'st-101',
        time: '15:30',
        room: 'Sala Premier 1',
        format: '2D',
        language: 'DOBLADA',
        ticketPrice: 45,
        occupiedSeats: ['C4', 'C5', 'D3', 'D4'],
      },
      {
        id: 'st-102',
        time: '18:45',
        room: 'Sala VIP Láser',
        format: '4K LÁSER VIP',
        language: 'SUBTITULADA',
        ticketPrice: 65,
        occupiedSeats: ['B4', 'B5', 'F3', 'F4', 'D5'],
      },
      {
        id: 'st-103',
        time: '21:30',
        room: 'Sala VIP Láser',
        format: '3D',
        language: 'SUBTITULADA',
        ticketPrice: 55,
        occupiedSeats: ['C3', 'C4', 'E6'],
      },
    ],
  },
  {
    id: 'mov-2',
    title: 'El Último Guardián del Imperio',
    genre: 'Acción / Épica Histórica',
    duration: '2h 22m',
    rating: 'B-12',
    score: '9.1',
    status: 'EN_CARTELERA',
    director: 'Sofía Alarcón',
    synopsis:
      'Un estratega legendario regresa del exilio para defender la ciudadela dorada frente al asedio más grande del siglo.',
    posterUrl:
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=700&q=80',
    backdropUrl:
      'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80',
    isActive: true,
    isFeatured: true,
    showtimes: [
      {
        id: 'st-201',
        time: '16:15',
        room: 'Sala 2',
        format: '2D',
        language: 'DOBLADA',
        ticketPrice: 45,
        occupiedSeats: ['A3', 'B4', 'C5'],
      },
      {
        id: 'st-202',
        time: '19:30',
        room: 'Sala VIP Láser',
        format: '4K LÁSER VIP',
        language: 'SUBTITULADA',
        ticketPrice: 65,
        occupiedSeats: ['D4', 'D5', 'F5', 'F6'],
      },
    ],
  },
  {
    id: 'mov-3',
    title: 'Aventura en el Reino de Cristal',
    genre: 'Animación / Familiar',
    duration: '1h 48m',
    rating: 'ATP',
    score: '9.3',
    status: 'EN_CARTELERA',
    director: 'Lucas Santamaría',
    synopsis:
      'Dos hermanos y un pequeño dragón luminoso cruzan valles mágicos para devolverle el color al bosque antes del solsticio.',
    posterUrl:
      'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?auto=format&fit=crop&w=700&q=80',
    backdropUrl:
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
    isActive: true,
    isFeatured: false,
    showtimes: [
      {
        id: 'st-301',
        time: '14:00',
        room: 'Sala Familiar 3',
        format: '2D',
        language: 'DOBLADA',
        ticketPrice: 40,
        occupiedSeats: ['B3', 'B4', 'B5', 'C4'],
      },
      {
        id: 'st-302',
        time: '16:30',
        room: 'Sala Familiar 3',
        format: '3D',
        language: 'DOBLADA',
        ticketPrice: 50,
        occupiedSeats: ['D4', 'D5', 'D6'],
      },
      {
        id: 'st-303',
        time: '18:50',
        room: 'Sala 2',
        format: '2D',
        language: 'DOBLADA',
        ticketPrice: 40,
        occupiedSeats: ['C5'],
      },
    ],
  },
  {
    id: 'mov-4',
    title: 'Susurros en la Sala 7',
    genre: 'Terror / Suspenso',
    duration: '1h 56m',
    rating: 'C-15',
    score: '8.8',
    status: 'ESTRENO',
    director: 'Damián Riquelme',
    synopsis:
      'Un proyeccionista nocturno restaura un rollo de cinta sin catalogar y libera una historia que nunca debió proyectarse al público.',
    posterUrl:
      'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=700&q=80',
    backdropUrl:
      'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=1200&q=80',
    isActive: true,
    isFeatured: true,
    showtimes: [
      {
        id: 'st-401',
        time: '20:15',
        room: 'Sala Nocturna 2',
        format: '2D',
        language: 'SUBTITULADA',
        ticketPrice: 48,
        occupiedSeats: ['D4', 'D5', 'E4'],
      },
      {
        id: 'st-402',
        time: '22:45',
        room: 'Sala VIP Láser',
        format: '4K LÁSER VIP',
        language: 'SUBTITULADA',
        ticketPrice: 65,
        occupiedSeats: ['F3', 'F4', 'C4', 'C5'],
      },
    ],
  },
  {
    id: 'mov-5',
    title: 'Medianoche en París y Tokio',
    genre: 'Romance / Drama',
    duration: '2h 05m',
    rating: 'B-12',
    score: '8.9',
    status: 'EN_CARTELERA',
    director: 'Elena Kurosawa',
    synopsis:
      'Dos músicos desconocidos intercambian sus cuadernos de partituras por error en un aeropuerto y pactan reencontrarse un año después.',
    posterUrl:
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=700&q=80',
    backdropUrl:
      'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80',
    isActive: true,
    isFeatured: false,
    showtimes: [
      {
        id: 'st-501',
        time: '17:45',
        room: 'Sala Boutique 1',
        format: '2D',
        language: 'SUBTITULADA',
        ticketPrice: 45,
        occupiedSeats: ['E4', 'E5'],
      },
      {
        id: 'st-502',
        time: '20:30',
        room: 'Sala Boutique 1',
        format: '4K LÁSER VIP',
        language: 'SUBTITULADA',
        ticketPrice: 65,
        occupiedSeats: ['F5', 'F6'],
      },
    ],
  },
  {
    id: 'mov-6',
    title: 'Velocidad Límite: Circuito Nocturno',
    genre: 'Acción / Automovilismo',
    duration: '2h 14m',
    rating: 'B-12',
    score: '9.2',
    status: 'PREVENTA',
    director: 'Andrés Castellanos',
    synopsis:
      'Preventa exclusiva de medianoche. Un piloto de resistencia arriesga su última temporada en el circuito urbano más exigente de Asia.',
    posterUrl:
      'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=700&q=80',
    backdropUrl:
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80',
    isActive: true,
    isFeatured: true,
    showtimes: [
      {
        id: 'st-601',
        time: '19:00',
        room: 'Sala VIP Láser',
        format: '4K LÁSER VIP',
        language: 'DOBLADA',
        ticketPrice: 70,
        occupiedSeats: ['C4', 'C5', 'D4', 'D5', 'F1', 'F2'],
      },
      {
        id: 'st-602',
        time: '22:00',
        room: 'Sala VIP Láser',
        format: '3D',
        language: 'SUBTITULADA',
        ticketPrice: 60,
        occupiedSeats: ['B4', 'B5', 'D6'],
      },
    ],
  },
];
