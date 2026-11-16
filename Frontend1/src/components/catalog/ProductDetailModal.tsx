import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import { ProductTypeBadge } from '@/components/ui/StatusBadge';
import { useStore } from '@/context/StoreContext';
import { createBrandedFallbackImage, formatCurrency } from '@/lib/format';

export function ProductDetailModal() {
  const { selectedProduct, closeProductDetail, addToCart } = useStore();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});

  useEffect(() => {
    setActiveImageIndex(0);
    setQuantity(1);
    setFailedImages({});
  }, [selectedProduct?.id]);

  useEffect(() => {
    if (!selectedProduct) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeProductDetail();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedProduct, closeProductDetail]);

  return (
    <AnimatePresence>
      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-modal-title"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeProductDetail}
            className="fixed inset-0 bg-[#0A192F]/75 backdrop-blur-xs"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.22 }}
            className="relative z-10 flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-2xl"
          >
            {/* Header bar */}
            <div className="flex items-center justify-between border-b border-[#E2E8F0] bg-[#0A192F] px-5 py-3.5 text-white">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                <span className="text-[#D4AF37] font-semibold">
                  {selectedProduct.category}
                </span>
                <span>•</span>
                <span>cinesmall.com</span>
              </div>
              <button
                type="button"
                onClick={closeProductDetail}
                aria-label="Cerrar detalle"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#112240] text-slate-200 transition-colors duration-200 hover:bg-[#D4AF37] hover:text-[#0A192F]"
              >
                <Icon icon="solar:close-circle-bold" className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="grid grid-cols-1 gap-6 overflow-y-auto p-5 sm:p-7 md:grid-cols-12">
              {/* Galería */}
              <div className="md:col-span-6">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-[#E2E8F0] bg-[#0A192F]">
                  <img
                    src={
                      failedImages[activeImageIndex]
                        ? createBrandedFallbackImage(
                            selectedProduct.name,
                            selectedProduct.category
                          )
                        : selectedProduct.images[activeImageIndex] ||
                          createBrandedFallbackImage(
                            selectedProduct.name,
                            selectedProduct.category
                          )
                    }
                    alt={`${selectedProduct.name} - vista ${activeImageIndex + 1}`}
                    onError={() =>
                      setFailedImages((prev) => ({
                        ...prev,
                        [activeImageIndex]: true,
                      }))
                    }
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    <ProductTypeBadge type={selectedProduct.type} />
                    {selectedProduct.isFeatured && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#D4AF37] px-2.5 py-0.5 text-[11px] font-bold text-[#0A192F]">
                        <Icon icon="solar:star-bold" className="h-3.5 w-3.5" />
                        Destacado
                      </span>
                    )}
                  </div>
                </div>

                {selectedProduct.images.length > 1 && (
                  <div className="mt-3 flex gap-3">
                    {selectedProduct.images.map((imgUrl, idx) => (
                      <button
                        key={imgUrl + idx}
                        type="button"
                        onClick={() => setActiveImageIndex(idx)}
                        className={`relative aspect-[4/3] w-20 overflow-hidden rounded-lg border-2 transition-all duration-200 ${
                          activeImageIndex === idx
                            ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/30'
                            : 'border-[#E2E8F0] opacity-75 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={
                            failedImages[idx]
                              ? createBrandedFallbackImage(
                                  selectedProduct.name,
                                  selectedProduct.category
                                )
                              : imgUrl
                          }
                          alt={`Miniatura ${idx + 1}`}
                          onError={() =>
                            setFailedImages((prev) => ({ ...prev, [idx]: true }))
                          }
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Especificaciones Técnicas */}
                <div className="mt-5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                  <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-[#0A192F]">
                    Especificaciones Técnicas
                  </h4>
                  <dl className="mt-3 space-y-2 text-sm">
                    {Object.entries(selectedProduct.specs).map(([key, val]) => (
                      <div
                        key={key}
                        className="flex items-start justify-between gap-4 border-b border-[#E2E8F0]/70 pb-1.5 last:border-b-0 last:pb-0"
                      >
                        <dt className="font-medium text-[#475569]">{key}</dt>
                        <dd className="text-right font-semibold text-[#0F172A]">
                          {val}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>

              {/* Detalles y Acciones */}
              <div className="flex flex-col md:col-span-6">
                <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                  {selectedProduct.category} ·{' '}
                  {selectedProduct.type === 'SERVICIO'
                    ? 'Servicio / Reserva'
                    : 'Producto Físico'}
                </span>

                <h2
                  id="product-modal-title"
                  className="mt-1.5 font-heading text-2xl font-extrabold leading-tight text-[#0A192F]"
                >
                  {selectedProduct.name}
                </h2>

                <div className="mt-4 flex items-baseline gap-3">
                  <span className="font-heading text-3xl font-extrabold text-[#0A192F] tabular-nums">
                    {formatCurrency(selectedProduct.price)}
                  </span>
                  <span className="text-xs font-medium text-[#475569]">
                    {selectedProduct.type === 'SERVICIO'
                      ? 'Por jornada / servicio coordinado'
                      : 'Precio unitario (IVA incl.)'}
                  </span>
                </div>

                {/* Descripción completa sin recortes */}
                <div className="mt-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#475569]">
                    Descripción Detallada
                  </h4>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#0F172A]">
                    {selectedProduct.fullDescription}
                  </p>
                </div>

                {/* Información diferenciada por tipo */}
                {selectedProduct.type === 'SERVICIO' &&
                selectedProduct.serviceModalities ? (
                  <div className="mt-5 rounded-xl border border-[#D4AF37]/40 bg-[#FEF3C7]/35 p-4">
                    <div className="flex items-center gap-2 font-heading text-xs font-bold uppercase tracking-wider text-[#92400E]">
                      <Icon
                        icon="solar:calendar-check-bold"
                        className="h-4 w-4 text-[#D4AF37]"
                      />
                      Modalidad y Disponibilidad del Servicio
                    </div>
                    <ul className="mt-2.5 space-y-1.5 text-xs text-[#0F172A]">
                      <li>
                        <strong>Duración:</strong>{' '}
                        {selectedProduct.serviceModalities.duration}
                      </li>
                      <li>
                        <strong>Disponibilidad:</strong>{' '}
                        {selectedProduct.serviceModalities.availability}
                      </li>
                      <li>
                        <strong>Cobertura:</strong>{' '}
                        {selectedProduct.serviceModalities.coverage}
                      </li>
                    </ul>
                    <div className="mt-3 border-t border-[#D4AF37]/30 pt-2.5">
                      <span className="text-[11px] font-bold uppercase text-[#92400E]">
                        Incluye:
                      </span>
                      <ul className="mt-1.5 grid grid-cols-1 gap-1 sm:grid-cols-2">
                        {selectedProduct.serviceModalities.includes.map((inc) => (
                          <li
                            key={inc}
                            className="flex items-start gap-1.5 text-xs text-[#0F172A]"
                          >
                            <Icon
                              icon="solar:check-circle-bold"
                              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#10B981]"
                            />
                            <span>{inc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5 font-semibold text-[#0A192F]">
                        <Icon
                          icon="solar:box-check-bold"
                          className="h-4 w-4 text-[#10B981]"
                        />
                        Disponibilidad inmediata
                      </span>
                      <span className="font-bold text-[#0F172A] tabular-nums">
                        {selectedProduct.stock ?? 10} unidades en stock
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-[#475569]">
                      Despacho programado a domicilio o retiro directo en punto
                      autorizado Cine Small.
                    </p>
                  </div>
                )}

                {/* Selector de cantidad + CTA Dorado */}
                <div className="mt-auto pt-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="flex items-center justify-between rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-2 py-1 sm:w-36">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        aria-label="Disminuir cantidad"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-[#0A192F] transition-colors hover:bg-white"
                      >
                        <Icon icon="solar:minus-circle-bold" className="h-5 w-5" />
                      </button>
                      <span className="font-heading text-base font-bold text-[#0F172A] tabular-nums">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => q + 1)}
                        aria-label="Aumentar cantidad"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-[#0A192F] transition-colors hover:bg-white"
                      >
                        <Icon icon="solar:add-circle-bold" className="h-5 w-5" />
                      </button>
                    </div>

                    <Button
                      onPress={() => {
                        addToCart(selectedProduct, quantity);
                        closeProductDetail();
                      }}
                      className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#D4AF37] px-6 text-sm font-extrabold text-[#0A192F] shadow-md transition-colors duration-200 hover:bg-[#E5C158] active:bg-[#B5952F]"
                    >
                      <Icon icon="solar:cart-plus-bold" className="h-5 w-5" />
                      <span>
                        Agregar al carrito ·{' '}
                        {formatCurrency(selectedProduct.price * quantity)}
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

