import { useEffect, useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import { ProductCard } from '@/components/catalog/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/ProductCardSkeleton';
import { ProductTypeBadge } from '@/components/ui/StatusBadge';
import { useStore } from '@/context/StoreContext';
import { createBrandedFallbackImage, formatCurrency } from '@/lib/format';
import type { Product } from '@/types/ecommerce';

interface FeaturedProductCarouselProps {
  products: Product[];
  isLoading: boolean;
}

type RailTab = 'featured' | 'estandar' | 'servicio' | 'all';

function useCardsPerPage(): number {
  const [cardsPerPage, setCardsPerPage] = useState<number>(() => {
    if (typeof window === 'undefined') return 4;
    if (window.innerWidth >= 1280) return 4;
    if (window.innerWidth >= 768) return 2;
    return 1;
  });

  useEffect(() => {
    const update = () => {
      if (window.innerWidth >= 1280) setCardsPerPage(4);
      else if (window.innerWidth >= 768) setCardsPerPage(2);
      else setCardsPerPage(1);
    };
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return cardsPerPage;
}

export function FeaturedProductCarousel({
  products,
  isLoading,
}: FeaturedProductCarouselProps) {
  const { addToCart, openProductDetail } = useStore();
  const cardsPerPage = useCardsPerPage();

  const [activeTab, setActiveTab] = useState<RailTab>('featured');
  const [viewMode, setViewMode] = useState<'carousel' | 'grid'>('carousel');
  const [pageIndex, setPageIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [compareItems, setCompareItems] = useState<Product[]>([]);
  const [compareModalOpen, setCompareModalOpen] = useState(false);

  const filteredList = useMemo(() => {
    const activeOnly = products.filter((p) => p.isActive);
    if (activeTab === 'featured') {
      return activeOnly.filter((p) => p.isFeatured);
    }
    if (activeTab === 'estandar') {
      return activeOnly.filter((p) => p.type === 'ESTANDAR');
    }
    if (activeTab === 'servicio') {
      return activeOnly.filter((p) => p.type === 'SERVICIO');
    }
    return activeOnly;
  }, [products, activeTab]);

  const totalPages = Math.max(1, Math.ceil(filteredList.length / cardsPerPage));
  const safePageIndex = Math.min(pageIndex, totalPages - 1);

  useEffect(() => {
    setPageIndex(0);
  }, [activeTab, cardsPerPage]);

  useEffect(() => {
    if (!autoAdvance || isHovered || viewMode !== 'carousel' || totalPages <= 1) {
      return;
    }
    const timer = window.setInterval(() => {
      setDirection(1);
      setPageIndex((prev) => (prev + 1) % totalPages);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [autoAdvance, isHovered, viewMode, totalPages]);

  const visibleSlice = useMemo(() => {
    const start = safePageIndex * cardsPerPage;
    return filteredList.slice(start, start + cardsPerPage);
  }, [filteredList, safePageIndex, cardsPerPage]);

  const goNextPage = () => {
    setDirection(1);
    setPageIndex((prev) => (prev + 1) % totalPages);
  };

  const goPrevPage = () => {
    setDirection(-1);
    setPageIndex((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const handleToggleCompare = (product: Product) => {
    setCompareItems((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) {
        return prev.filter((item) => item.id !== product.id);
      }
      if (prev.length >= 3) {
        toast.info('Puedes comparar hasta 3 ítems simultáneamente');
        return prev;
      }
      toast.success(`"${product.name}" añadido al comparador`);
      return [...prev, product];
    });
  };

  const tabs: { id: RailTab; label: string; icon: string }[] = [
    { id: 'featured', label: 'Destacados VIP', icon: 'solar:star-bold' },
    { id: 'estandar', label: 'Candy Bar & Productos', icon: 'solar:cup-hot-bold' },
    {
      id: 'servicio',
      label: 'Salas & Eventos',
      icon: 'solar:clapperboard-play-bold',
    },
    { id: 'all', label: 'Todo Cine Small', icon: 'solar:layers-bold' },
  ];

  return (
    <section
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8"
    >
      {/* Cabecera interactiva del carrusel */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
            <Icon icon="solar:star-bold" className="h-4 w-4" />
            Carrusel Interactivo Cine Small
          </span>
          <h2 className="mt-1 font-heading text-2xl font-extrabold text-[#0A192F] sm:text-3xl">
            Productos y Servicios Destacados
          </h2>
          <p className="mt-1.5 text-sm text-[#475569]">
            Desliza, cambia fotos desde cada tarjeta o compara hasta 3 opciones
            lado a lado.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setAutoAdvance((a) => !a)}
            className={`inline-flex h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-bold transition-colors ${
              autoAdvance
                ? 'border-[#D4AF37] bg-[#FEF3C7]/60 text-[#92400E]'
                : 'border-[#E2E8F0] bg-white text-[#475569] hover:border-[#D4AF37] hover:text-[#0A192F]'
            }`}
          >
            <Icon
              icon={autoAdvance ? 'solar:pause-bold' : 'solar:play-bold'}
              className="h-3.5 w-3.5 text-[#D4AF37]"
            />
            <span>{autoAdvance ? 'Auto activo' : 'Auto-deslizar'}</span>
          </button>

          <div className="inline-flex rounded-xl border border-[#E2E8F0] bg-white p-0.5 shadow-xs">
            <button
              type="button"
              onClick={() => setViewMode('carousel')}
              className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-bold transition-colors ${
                viewMode === 'carousel'
                  ? 'bg-[#0A192F] text-[#D4AF37]'
                  : 'text-[#475569] hover:text-[#0A192F]'
              }`}
            >
              <Icon icon="solar:slider-horizontal-bold" className="h-4 w-4" />
              <span>Carrusel</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-bold transition-colors ${
                viewMode === 'grid'
                  ? 'bg-[#0A192F] text-[#D4AF37]'
                  : 'text-[#475569] hover:text-[#0A192F]'
              }`}
            >
              <Icon icon="solar:widget-4-bold" className="h-4 w-4" />
              <span>Cuadrícula</span>
            </button>
          </div>

          <Link
            to="/catalogo"
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-4 text-xs font-bold text-[#0A192F] shadow-xs transition-colors duration-200 hover:border-[#D4AF37] hover:bg-[#FEF3C7]/30"
          >
            <span>Ver todo</span>
            <Icon icon="solar:arrow-right-bold" className="h-4 w-4 text-[#D4AF37]" />
          </Link>
        </div>
      </div>

      {/* Pestañas de filtrado rápido + controles de paginación del carrusel */}
      <div className="mt-6 flex flex-col justify-between gap-3 border-b border-[#E2E8F0] pb-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition-colors duration-200 ${
                  active
                    ? 'bg-[#0A192F] text-[#D4AF37] shadow-xs'
                    : 'border border-[#E2E8F0] bg-white text-[#475569] hover:border-[#D4AF37] hover:text-[#0A192F]'
                }`}
              >
                <Icon icon={tab.icon} className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {viewMode === 'carousel' && totalPages > 1 && (
          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <span className="text-xs font-semibold text-[#475569] tabular-nums">
              Página {safePageIndex + 1} de {totalPages}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={goPrevPage}
                aria-label="Página anterior del carrusel"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E2E8F0] bg-white text-[#0A192F] shadow-xs transition-colors hover:border-[#D4AF37] hover:bg-[#D4AF37]"
              >
                <Icon icon="solar:alt-arrow-left-bold" className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={goNextPage}
                aria-label="Siguiente página del carrusel"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E2E8F0] bg-white text-[#0A192F] shadow-xs transition-colors hover:border-[#D4AF37] hover:bg-[#D4AF37]"
              >
                <Icon icon="solar:alt-arrow-right-bold" className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Pista del Carrusel / Cuadrícula */}
      <div className="relative mt-6">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <ProductCardSkeleton key={idx} />
            ))}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {filteredList.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                showFeaturedRibbon
                isCompared={compareItems.some((c) => c.id === product.id)}
                onToggleCompare={handleToggleCompare}
              />
            ))}
          </div>
        ) : (
          <>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`${activeTab}-${safePageIndex}-${cardsPerPage}`}
                initial={{ opacity: 0, x: direction > 0 ? 40 : -40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction > 0 ? -40 : 40 }}
                transition={{ duration: 0.24, ease: 'easeOut' }}
                drag={totalPages > 1 ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.18}
                onDragEnd={(_, info) => {
                  if (totalPages <= 1) return;
                  if (info.offset.x < -55) goNextPage();
                  if (info.offset.x > 55) goPrevPage();
                }}
                className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4"
              >
                {visibleSlice.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    showFeaturedRibbon
                    isCompared={compareItems.some((c) => c.id === product.id)}
                    onToggleCompare={handleToggleCompare}
                  />
                ))}
              </motion.div>
            </AnimatePresence>

            {/* Indicadores inferiores de página */}
            {totalPages > 1 && (
              <div className="mt-7 flex items-center justify-center gap-2">
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const active = idx === safePageIndex;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setDirection(idx >= safePageIndex ? 1 : -1);
                        setPageIndex(idx);
                      }}
                      aria-label={`Ir a página ${idx + 1}`}
                      className={`h-2.5 rounded-full transition-all duration-200 ${
                        active
                          ? 'w-8 bg-[#D4AF37]'
                          : 'w-2.5 bg-slate-300 hover:bg-[#0A192F]/50'
                      }`}
                    />
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Barra flotante de comparación (cuando hay ítems seleccionados) */}
      <AnimatePresence>
        {compareItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="mt-8 flex flex-col justify-between gap-4 rounded-2xl border border-[#D4AF37] bg-[#0A192F] p-4 text-white shadow-xl sm:flex-row sm:items-center sm:px-6"
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D4AF37] px-3 py-1 text-xs font-extrabold text-[#0A192F] tabular-nums">
                <Icon icon="solar:scale-bold" className="h-4 w-4" />
                Comparador ({compareItems.length}/3)
              </span>
              <div className="flex flex-wrap gap-2">
                {compareItems.map((item) => (
                  <span
                    key={item.id}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#1E3A5F] bg-[#112240] px-3 py-1 text-xs font-medium text-white"
                  >
                    <span className="max-w-[160px] truncate">{item.name}</span>
                    <button
                      type="button"
                      onClick={() => handleToggleCompare(item)}
                      aria-label={`Quitar ${item.name}`}
                      className="text-slate-400 hover:text-[#EF4444]"
                    >
                      <Icon icon="solar:close-circle-bold" className="h-4 w-4" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCompareItems([])}
                className="rounded-xl border border-[#1E3A5F] px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white"
              >
                Limpiar
              </button>
              <Button
                onPress={() => setCompareModalOpen(true)}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-[#D4AF37] px-5 text-xs font-extrabold text-[#0A192F] hover:bg-[#E5C158]"
              >
                <Icon icon="solar:eye-bold" className="h-4 w-4" />
                <span>Comparar ahora</span>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de comparación lado a lado */}
      <AnimatePresence>
        {compareModalOpen && compareItems.length > 0 && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Comparación de productos y servicios"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCompareModalOpen(false)}
              className="fixed inset-0 bg-[#0A192F]/80 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              className="relative z-10 max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between bg-[#0A192F] px-5 py-4 text-white">
                <div className="flex items-center gap-2">
                  <Icon
                    icon="solar:scale-bold"
                    className="h-5 w-5 text-[#D4AF37]"
                  />
                  <h3 className="font-heading text-base font-bold">
                    Comparación Lado a Lado ({compareItems.length} opciones)
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setCompareModalOpen(false)}
                  aria-label="Cerrar comparador"
                  className="rounded-lg bg-[#112240] p-1.5 text-slate-200 hover:bg-[#D4AF37] hover:text-[#0A192F]"
                >
                  <Icon icon="solar:close-circle-bold" className="h-5 w-5" />
                </button>
              </div>

              <div className="overflow-x-auto p-5">
                <div
                  className="grid min-w-[640px] gap-4"
                  style={{
                    gridTemplateColumns: `repeat(${compareItems.length}, minmax(0, 1fr))`,
                  }}
                >
                  {compareItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4"
                    >
                      <div className="aspect-[4/3] overflow-hidden rounded-xl bg-[#0A192F]">
                        <img
                          src={
                            item.images[0] ||
                            createBrandedFallbackImage(item.name, item.category)
                          }
                          alt={item.name}
                          onError={(e) => {
                            e.currentTarget.src = createBrandedFallbackImage(
                              item.name,
                              item.category
                            );
                          }}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-2">
                        <ProductTypeBadge type={item.type} />
                        <span className="text-[11px] font-bold uppercase text-[#475569]">
                          {item.category}
                        </span>
                      </div>

                      <h4
                        onClick={() => {
                          setCompareModalOpen(false);
                          openProductDetail(item);
                        }}
                        className="mt-2 cursor-pointer font-heading text-sm font-extrabold text-[#0A192F] hover:text-[#D4AF37]"
                      >
                        {item.name}
                      </h4>

                      <p className="mt-2 font-heading text-xl font-extrabold text-[#0A192F] tabular-nums">
                        {formatCurrency(item.price)}
                      </p>

                      <dl className="mt-3 flex-1 space-y-2 border-t border-[#E2E8F0] pt-3 text-xs">
                        {Object.entries(item.specs).map(([k, v]) => (
                          <div key={k} className="flex justify-between gap-2">
                            <dt className="text-[#475569]">{k}:</dt>
                            <dd className="text-right font-semibold text-[#0F172A]">
                              {v}
                            </dd>
                          </div>
                        ))}
                      </dl>

                      <Button
                        onPress={() => {
                          addToCart(item, 1);
                          setCompareModalOpen(false);
                        }}
                        className="mt-4 flex h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-[#D4AF37] text-xs font-extrabold text-[#0A192F] hover:bg-[#E5C158]"
                      >
                        <Icon icon="solar:cart-plus-bold" className="h-4 w-4" />
                        <span>Agregar al carrito</span>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

