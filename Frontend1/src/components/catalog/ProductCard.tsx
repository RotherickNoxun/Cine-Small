import { useState } from 'react';
import { Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import { ProductTypeBadge } from '@/components/ui/StatusBadge';
import { useStore } from '@/context/StoreContext';
import { createBrandedFallbackImage, formatCurrency } from '@/lib/format';
import type { Product } from '@/types/ecommerce';

interface ProductCardProps {
  product: Product;
  showFeaturedRibbon?: boolean;
  isCompared?: boolean;
  onToggleCompare?: (product: Product) => void;
}

export function ProductCard({
  product,
  showFeaturedRibbon = true,
  isCompared = false,
  onToggleCompare,
}: ProductCardProps) {
  const { addToCart, openProductDetail } = useStore();
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [failedByIdx, setFailedByIdx] = useState<Record<number, boolean>>({});

  const imageCount = product.images.length;
  const safeIdx = activeImageIdx < imageCount ? activeImageIdx : 0;

  const displayImage = failedByIdx[safeIdx]
    ? createBrandedFallbackImage(product.name, product.category)
    : product.images[safeIdx] ||
      createBrandedFallbackImage(product.name, product.category);

  const cycleImage = (e: React.MouseEvent, delta: number) => {
    e.stopPropagation();
    if (imageCount <= 1) return;
    setActiveImageIdx((prev) => (prev + delta + imageCount) % imageCount);
  };

  return (
    <article
      className={`group flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl ${
        isCompared
          ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/30'
          : 'border-[#E2E8F0] hover:border-[#D4AF37]/70'
      }`}
    >
      {/* Imagen 4:3 con scrub multi-imagen y zoom suave */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => openProductDetail(product)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openProductDetail(product);
          }
        }}
        className="relative aspect-[4/3] w-full cursor-pointer overflow-hidden bg-[#0A192F]"
        aria-label={`Ver detalle de ${product.name}`}
      >
        <img
          src={displayImage}
          alt={`${product.name} vista ${safeIdx + 1}`}
          loading="lazy"
          onError={() =>
            setFailedByIdx((prev) => ({ ...prev, [safeIdx]: true }))
          }
          className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0A192F]/65 via-transparent to-[#0A192F]/25" />

        {/* Badge superior tipo */}
        <div className="absolute top-3 left-3 z-10">
          <ProductTypeBadge type={product.type} />
        </div>

        {/* Cintillo dorado Destacado */}
        {showFeaturedRibbon && product.isFeatured && (
          <div className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 rounded-full bg-[#D4AF37] px-2.5 py-0.5 text-[11px] font-bold text-[#0A192F] shadow-sm">
            <Icon icon="solar:star-bold" className="h-3.5 w-3.5" />
            Destacado
          </div>
        )}

        {/* Controles rápidos de galería sobre la imagen */}
        {imageCount > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => cycleImage(e, -1)}
              aria-label="Imagen anterior"
              className="absolute top-1/2 left-2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-[#0A192F]/75 text-white opacity-0 backdrop-blur-xs transition-all duration-200 hover:bg-[#D4AF37] hover:text-[#0A192F] group-hover:opacity-100"
            >
              <Icon icon="solar:alt-arrow-left-bold" className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={(e) => cycleImage(e, 1)}
              aria-label="Siguiente imagen"
              className="absolute top-1/2 right-2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-[#0A192F]/75 text-white opacity-0 backdrop-blur-xs transition-all duration-200 hover:bg-[#D4AF37] hover:text-[#0A192F] group-hover:opacity-100"
            >
              <Icon icon="solar:alt-arrow-right-bold" className="h-4 w-4" />
            </button>

            <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 rounded-full bg-[#0A192F]/70 px-2 py-1 backdrop-blur-xs">
              {product.images.map((imgUrl, idx) => (
                <button
                  key={imgUrl + idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIdx(idx);
                  }}
                  onMouseEnter={() => setActiveImageIdx(idx)}
                  aria-label={`Ver foto ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-200 ${
                    safeIdx === idx
                      ? 'w-4 bg-[#D4AF37]'
                      : 'w-1.5 bg-white/60 hover:bg-white'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        <div className="absolute right-3 bottom-3 z-10 flex items-center gap-1.5">
          {onToggleCompare && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleCompare(product);
              }}
              aria-label={
                isCompared ? 'Quitar de comparación' : 'Comparar ítem'
              }
              title={isCompared ? 'Quitar de comparación' : 'Comparar'}
              className={`inline-flex h-7 items-center gap-1 rounded-lg px-2 text-[11px] font-bold backdrop-blur-xs transition-colors duration-200 ${
                isCompared
                  ? 'bg-[#D4AF37] text-[#0A192F]'
                  : 'bg-[#0A192F]/80 text-white hover:bg-[#D4AF37] hover:text-[#0A192F]'
              }`}
            >
              <Icon icon="solar:scale-bold" className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">
                {isCompared ? 'Comparando' : 'Comparar'}
              </span>
            </button>
          )}

          <span className="inline-flex items-center gap-1 rounded-lg bg-[#0A192F]/80 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-xs transition-colors duration-200 group-hover:bg-[#D4AF37] group-hover:text-[#0A192F]">
            <Icon icon="solar:eye-bold" className="h-3.5 w-3.5" />
            Ver detalle
          </span>
        </div>
      </div>

      {/* Cuerpo de la tarjeta */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#475569]">
            {product.category}
          </span>
          {product.type === 'SERVICIO' ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#10B981]">
              <Icon icon="solar:verified-check-bold" className="h-3.5 w-3.5" />
              Agenda abierta
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0F172A] tabular-nums">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  (product.stock ?? 0) > 8 ? 'bg-[#10B981]' : 'bg-[#F59E0B]'
                }`}
              />
              {product.stock ?? 10} disp.
            </span>
          )}
        </div>

        <h3
          onClick={() => openProductDetail(product)}
          className="mt-1 line-clamp-2 cursor-pointer font-heading text-base font-bold leading-snug text-[#0F172A] transition-colors duration-200 group-hover:text-[#112240]"
        >
          {product.name}
        </h3>

        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-[#475569]">
          {product.shortDescription}
        </p>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-[#E2E8F0] pt-4">
          <div>
            <span className="block text-[11px] font-medium text-[#475569]">
              {product.type === 'SERVICIO' ? 'Tarifa desde' : 'Precio'}
            </span>
            <span className="font-heading text-lg font-extrabold text-[#0A192F] tabular-nums">
              {formatCurrency(product.price)}
            </span>
          </div>

          <Button
            onPress={() => addToCart(product, 1)}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[#D4AF37] px-3.5 text-xs font-bold text-[#0A192F] shadow-xs transition-colors duration-200 hover:bg-[#E5C158] active:bg-[#B5952F]"
          >
            <Icon icon="solar:cart-plus-bold" className="h-4 w-4 shrink-0" />
            <span>Agregar al carrito</span>
          </Button>
        </div>
      </div>
    </article>
  );
}
