import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import { ProductTypeBadge } from '@/components/ui/StatusBadge';
import { useStore } from '@/context/StoreContext';
import {
  createBrandedFallbackImage,
  formatCurrency,
  stripOrderHash,
} from '@/lib/format';
import type { Order, Product, ProductCategory } from '@/types/ecommerce';

interface HeroShowcaseCarouselProps {
  products: Product[];
  orders: Order[];
}

interface HeroSlideConfig {
  id: string;
  badge: string;
  eyebrow: string;
  headline: string;
  highlight: string;
  description: string;
  ctaLabel: string;
  category: ProductCategory;
  productId: string;
  icon: string;
  dockTitle: string;
  dockSubtitle: string;
}

const HERO_SLIDES: HeroSlideConfig[] = [
  {
    id: 'slide-salas-vip',
    badge: 'Experiencia Micro-Cine VIP',
    eyebrow: 'Alquiler de Salas Privadas',
    headline: 'Tu propia sala de cine 4K',
    highlight: 'con butacas reclinables VIP',
    description:
      'Disfruta estrenos, maratones o funciones privadas con tus amigos o familia sin extraños. Pantalla láser de 180", sonido Dolby y atención personalizada en cinesmall.com.',
    ctaLabel: 'Reservar Sala VIP',
    category: 'Alquileres',
    productId: 'prod-1',
    icon: 'solar:clapperboard-play-bold',
    dockTitle: 'Salas Privadas VIP',
    dockSubtitle: 'Hasta 12 personas',
  },
  {
    id: 'slide-candy-bar',
    badge: 'Candy Bar Oficial Cine Small',
    eyebrow: 'Pipocas, Nachos & Coleccionables',
    headline: 'Combos recién hechos y',
    highlight: 'baldes edición de estreno',
    description:
      'Pide tus pipocas con mantequilla dorada, nachos con queso caliente y baldes metálicos coleccionables para retirar en sala o recibir por delivery en casa.',
    ctaLabel: 'Ver Candy Bar',
    category: 'Productos',
    productId: 'prod-2',
    icon: 'solar:cup-hot-bold',
    dockTitle: 'Candy Bar',
    dockSubtitle: 'Combos y coleccionables',
  },
  {
    id: 'slide-cumpleanos',
    badge: 'Celebraciones de Película',
    eyebrow: 'Cumpleaños, Citas & Eventos',
    headline: 'Festeja tu cumpleaños en',
    highlight: 'pantalla gigante exclusiva',
    description:
      'Paquetes completos con sala privada para hasta 20 invitados, combos individuales de pipocas y refrescos, y saludo personalizado proyectado en pantalla.',
    ctaLabel: 'Ver Paquetes',
    category: 'Servicios',
    productId: 'prod-3',
    icon: 'solar:ticket-sale-bold',
    dockTitle: 'Cumpleaños Cine',
    dockSubtitle: 'Funciones exclusivas',
  },
  {
    id: 'slide-gamer',
    badge: 'Gaming & Deportes en Vivo',
    eyebrow: 'Sala Gamer 180" & Cine en Casa',
    headline: 'Tus torneos y finales en',
    highlight: 'pantalla gigante con audio estadio',
    description:
      'Alquila nuestra sala gamer con PS5 y baja latencia para jugar con tus amigos o ver la gran final. También lleva proyectores y packs de pipocas a tu hogar.',
    ctaLabel: 'Explorar Sala Gamer',
    category: 'Alquileres',
    productId: 'prod-6',
    icon: 'solar:gamepad-bold',
    dockTitle: 'Sala Gamer 4K',
    dockSubtitle: 'Gaming & partidos',
  },
];

const AUTOPLAY_MS = 6500;

export function HeroShowcaseCarousel({
  products,
  orders,
}: HeroShowcaseCarouselProps) {
  const navigate = useNavigate();
  const { addToCart, openProductDetail } = useStore();

  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [lookupCode, setLookupCode] = useState('');
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const slidesWithProducts = useMemo(() => {
    return HERO_SLIDES.map((slide, index) => {
      const matched =
        products.find((p) => p.id === slide.productId) ??
        products.find((p) => p.category === slide.category && p.isActive) ??
        products[index % Math.max(1, products.length)];
      return {
        ...slide,
        product: matched,
      };
    });
  }, [products]);

  const totalSlides = slidesWithProducts.length;
  const activeSlide = slidesWithProducts[activeIndex] ?? slidesWithProducts[0];

  const goToSlide = useCallback(
    (nextIndex: number) => {
      const normalized = (nextIndex + totalSlides) % totalSlides;
      setDirection(nextIndex >= activeIndex ? 1 : -1);
      setActiveIndex(normalized);
    },
    [activeIndex, totalSlides]
  );

  const handleNext = useCallback(() => {
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const handlePrev = useCallback(() => {
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  useEffect(() => {
    if (isPaused || isHovered) return;
    const timer = window.setInterval(() => {
      setDirection(1);
      setActiveIndex((prev) => (prev + 1) % totalSlides);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [isPaused, isHovered, totalSlides, activeIndex]);

  const handleOrderLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = stripOrderHash(lookupCode.trim().toUpperCase());
    if (!cleaned) return;
    navigate({
      to: '/pago/$orderId',
      params: { orderId: cleaned },
    });
  };

  const spotlightProduct = activeSlide.product;
  const spotlightSpecs = spotlightProduct
    ? Object.entries(spotlightProduct.specs).slice(0, 2)
    : [];

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Vitrina principal Cine Small"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') handleNext();
        if (e.key === 'ArrowLeft') handlePrev();
      }}
      className="relative overflow-hidden bg-hero-radial text-white"
    >
      {/* Fondo ambiental sutil */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-28 -right-24 h-96 w-96 rounded-full bg-[#D4AF37]/12 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-[#1E3A5F]/45 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 pt-8 pb-8 sm:px-6 sm:pt-12 sm:pb-10 lg:px-8 lg:pt-14">
        {/* Controles superiores de reproducción y contador */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/45 bg-[#112240]/90 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
            <Icon icon="solar:crown-star-bold" className="h-4 w-4" />
            <span>cinesmall.com · Vitrina Premier</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-lg border border-[#1E3A5F] bg-[#112240] px-2.5 py-1 text-xs font-bold text-slate-200 tabular-nums">
              {activeIndex + 1} / {totalSlides}
            </span>
            <button
              type="button"
              onClick={() => setIsPaused((p) => !p)}
              aria-label={isPaused ? 'Reanudar carrusel' : 'Pausar carrusel'}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#1E3A5F] bg-[#112240] px-2.5 text-xs font-semibold text-slate-200 transition-colors hover:border-[#D4AF37] hover:text-[#D4AF37]"
            >
              <Icon
                icon={isPaused ? 'solar:play-bold' : 'solar:pause-bold'}
                className="h-3.5 w-3.5 text-[#D4AF37]"
              />
              <span className="hidden sm:inline">
                {isPaused ? 'Reanudar' : 'Auto'}
              </span>
            </button>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Diapositiva anterior"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#1E3A5F] bg-[#112240] text-white transition-colors hover:border-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A192F]"
            >
              <Icon icon="solar:alt-arrow-left-bold" className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Siguiente diapositiva"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#1E3A5F] bg-[#112240] text-white transition-colors hover:border-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A192F]"
            >
              <Icon icon="solar:alt-arrow-right-bold" className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Escenario principal interactivo (drag + AnimatePresence) */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeSlide.id}
            initial={{ opacity: 0, x: direction > 0 ? 32 : -32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -32 : 32 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={(_, info) => {
              if (info.offset.x < -60) handleNext();
              if (info.offset.x > 60) handlePrev();
            }}
            className="grid cursor-grab grid-cols-1 items-center gap-8 active:cursor-grabbing lg:grid-cols-12"
          >
            {/* Columna Narrativa y CTAs */}
            <div className="lg:col-span-7">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D4AF37]/15 px-3 py-1 text-xs font-bold text-[#D4AF37] ring-1 ring-[#D4AF37]/40">
                <Icon icon={activeSlide.icon} className="h-3.5 w-3.5" />
                {activeSlide.badge}
              </span>

              <p className="mt-3 text-xs font-bold uppercase tracking-widest text-slate-300">
                {activeSlide.eyebrow}
              </p>

              <h1 className="mt-2 font-heading text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
                {activeSlide.headline}{' '}
                <span className="text-[#D4AF37]">{activeSlide.highlight}</span>
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
                {activeSlide.description}
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  to="/catalogo"
                  search={{ category: activeSlide.category }}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#D4AF37] px-7 text-sm font-extrabold text-[#0A192F] shadow-lg transition-all duration-200 hover:bg-[#E5C158] active:bg-[#B5952F]"
                >
                  <Icon icon="solar:shop-2-bold" className="h-5 w-5" />
                  <span>{activeSlide.ctaLabel}</span>
                </Link>

                <Link
                  to="/catalogo"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/50 bg-white/5 px-6 text-sm font-bold text-white transition-all duration-200 hover:border-[#D4AF37] hover:bg-white/10 hover:text-[#D4AF37]"
                >
                  <span>Explorar Catálogo</span>
                </Link>

                <a
                  href="#contacto"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#1E3A5F] bg-[#112240]/80 px-5 text-sm font-bold text-slate-200 transition-all duration-200 hover:border-[#D4AF37] hover:text-[#D4AF37]"
                >
                  <Icon icon="solar:chat-round-line-bold" className="h-5 w-5" />
                  <span>Contáctanos</span>
                </a>
              </div>
            </div>

            {/* Columna Tarjeta Spotlight del Slide */}
            {spotlightProduct && (
              <div className="lg:col-span-5">
                <div className="overflow-hidden rounded-2xl border border-[#D4AF37]/45 bg-[#112240]/95 shadow-2xl">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => openProductDetail(spotlightProduct)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openProductDetail(spotlightProduct);
                      }
                    }}
                    className="group relative aspect-[4/3] w-full cursor-pointer overflow-hidden bg-[#0A192F]"
                  >
                    <img
                      src={
                        failedImages[spotlightProduct.id]
                          ? createBrandedFallbackImage(
                              spotlightProduct.name,
                              spotlightProduct.category
                            )
                          : spotlightProduct.images[0] ||
                            createBrandedFallbackImage(
                              spotlightProduct.name,
                              spotlightProduct.category
                            )
                      }
                      alt={spotlightProduct.name}
                      onError={() =>
                        setFailedImages((prev) => ({
                          ...prev,
                          [spotlightProduct.id]: true,
                        }))
                      }
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0A192F] via-transparent to-[#0A192F]/35" />

                    <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                      <ProductTypeBadge type={spotlightProduct.type} />
                    </div>
                    <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-[#D4AF37] px-2.5 py-0.5 text-[11px] font-extrabold text-[#0A192F] shadow-sm">
                      <Icon icon="solar:star-bold" className="h-3.5 w-3.5" />
                      Spotlight
                    </span>

                    <div className="absolute right-3 bottom-3 left-3 flex items-end justify-between gap-2">
                      <span className="rounded-lg bg-[#0A192F]/85 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#D4AF37] backdrop-blur-xs">
                        {spotlightProduct.category}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-lg bg-white/95 px-2.5 py-1 text-[11px] font-bold text-[#0A192F] shadow-sm">
                        <Icon icon="solar:eye-bold" className="h-3.5 w-3.5" />
                        Vista rápida
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <h2
                      onClick={() => openProductDetail(spotlightProduct)}
                      className="line-clamp-1 cursor-pointer font-heading text-lg font-extrabold text-white transition-colors hover:text-[#D4AF37]"
                    >
                      {spotlightProduct.name}
                    </h2>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-300">
                      {spotlightProduct.shortDescription}
                    </p>

                    {spotlightSpecs.length > 0 && (
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {spotlightSpecs.map(([k, v]) => (
                          <div
                            key={k}
                            className="rounded-xl border border-[#1E3A5F] bg-[#0A192F]/80 px-3 py-2"
                          >
                            <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                              {k}
                            </span>
                            <span className="line-clamp-1 text-xs font-bold text-white">
                              {v}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#1E3A5F] pt-4">
                      <div>
                        <span className="block text-[11px] text-slate-300">
                          {spotlightProduct.type === 'SERVICIO'
                            ? 'Tarifa desde'
                            : 'Precio Premier'}
                        </span>
                        <span className="font-heading text-2xl font-extrabold text-[#D4AF37] tabular-nums">
                          {formatCurrency(spotlightProduct.price)}
                        </span>
                      </div>

                      <Button
                        onPress={() => addToCart(spotlightProduct, 1)}
                        className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#D4AF37] px-4 text-xs font-extrabold text-[#0A192F] shadow-md transition-colors hover:bg-[#E5C158] active:bg-[#B5952F]"
                      >
                        <Icon icon="solar:cart-plus-bold" className="h-4 w-4" />
                        <span>Agregar al carrito</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Dock selector de campañas con barra de progreso */}
        <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {slidesWithProducts.map((slide, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={slide.id}
                type="button"
                onClick={() => goToSlide(idx)}
                className={`group relative overflow-hidden rounded-xl border p-3 text-left transition-all duration-200 ${
                  isActive
                    ? 'border-[#D4AF37] bg-[#112240] shadow-md'
                    : 'border-[#1E3A5F] bg-[#0A192F]/70 hover:border-[#D4AF37]/50 hover:bg-[#112240]/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                      isActive
                        ? 'bg-[#D4AF37] text-[#0A192F]'
                        : 'bg-[#112240] text-[#D4AF37]'
                    }`}
                  >
                    <Icon icon={slide.icon} className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p
                      className={`truncate font-heading text-xs font-bold ${
                        isActive ? 'text-[#D4AF37]' : 'text-white'
                      }`}
                    >
                      {slide.dockTitle}
                    </p>
                    <p className="truncate text-[11px] text-slate-300">
                      {slide.dockSubtitle}
                    </p>
                  </div>
                </div>

                {/* Barra de progreso animada */}
                <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-[#1E3A5F]">
                  {isActive && (
                    <motion.div
                      key={`${activeIndex}-${isPaused || isHovered}`}
                      initial={{ width: '0%' }}
                      animate={{
                        width: isPaused || isHovered ? '35%' : '100%',
                      }}
                      transition={{
                        duration:
                          isPaused || isHovered ? 0.3 : AUTOPLAY_MS / 1000,
                        ease: 'linear',
                      }}
                      className="h-full rounded-full bg-[#D4AF37]"
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Barra compacta de seguimiento rápido de pedidos QR */}
        <div className="mt-6 flex flex-col justify-between gap-4 rounded-2xl border border-[#1E3A5F] bg-[#112240]/85 px-4 py-3.5 backdrop-blur-xs lg:flex-row lg:items-center">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D4AF37]">
              <Icon icon="solar:qr-code-bold" className="h-4 w-4" />
              Seguimiento QR rápido:
            </span>
            {orders.slice(0, 3).map((ord) => (
              <Link
                key={ord.id}
                to="/pago/$orderId"
                params={{ orderId: stripOrderHash(ord.id) }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#1E3A5F] bg-[#0A192F] px-2.5 py-1 text-[11px] font-semibold text-white transition-colors hover:border-[#D4AF37] hover:text-[#D4AF37]"
              >
                <span className="font-bold text-[#D4AF37] tabular-nums">
                  {ord.id}
                </span>
                <span className="hidden text-slate-300 sm:inline">
                  · {ord.paymentStatus.replace('_', ' ')}
                </span>
              </Link>
            ))}
          </div>

          <form
            onSubmit={handleOrderLookup}
            className="flex items-center gap-2 sm:w-72"
          >
            <input
              type="text"
              value={lookupCode}
              onChange={(e) => setLookupCode(e.target.value)}
              placeholder="Buscar código #CS-2026-..."
              aria-label="Código de pedido para consultar"
              className="h-9 flex-1 rounded-xl border border-[#1E3A5F] bg-[#0A192F] px-3 text-xs text-white placeholder-slate-400 tabular-nums outline-none focus:border-[#D4AF37]"
            />
            <button
              type="submit"
              className="inline-flex h-9 items-center gap-1 rounded-xl bg-[#D4AF37] px-3.5 text-xs font-extrabold text-[#0A192F] transition-colors hover:bg-[#E5C158]"
            >
              <span>Ver</span>
              <Icon icon="solar:arrow-right-bold" className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

