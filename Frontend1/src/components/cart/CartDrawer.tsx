import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { AnimatePresence, motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProductTypeBadge } from '@/components/ui/StatusBadge';
import { useStore } from '@/context/StoreContext';
import { useCreateOrder } from '@/hooks/useEcommerce';
import {
  createBrandedFallbackImage,
  formatCurrency,
  stripOrderHash,
} from '@/lib/format';

const checkoutSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(3, 'Ingresa tu nombre completo (mínimo 3 caracteres).'),
  customerPhone: z
    .string()
    .trim()
    .regex(
      /^\d{7,15}$/,
      'Ingresa un número de teléfono o WhatsApp válido (solo dígitos, 7 a 15 números).'
    ),
  address: z
    .string()
    .trim()
    .min(8, 'Ingresa la dirección de entrega o ubicación del servicio.'),
  notes: z.string().trim().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export function CartDrawer() {
  const navigate = useNavigate();
  const {
    cart,
    totalItems,
    subtotal,
    isCartOpen,
    closeCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
  } = useStore();
  const createOrder = useCreateOrder();
  const [failedThumbs, setFailedThumbs] = useState<Record<string, boolean>>({});

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    mode: 'onChange',
    defaultValues: {
      customerName: '',
      customerPhone: '',
      address: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (!isCartOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isCartOpen, closeCart]);

  const onSubmit = async (values: CheckoutFormValues) => {
    if (cart.length === 0) return;

    const order = await createOrder.mutateAsync({
      customerName: values.customerName,
      customerPhone: values.customerPhone,
      address: values.address,
      notes: values.notes,
      items: cart.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        type: item.product.type,
        category: item.product.category,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.images[0] || '',
      })),
    });

    clearCart();
    reset();
    closeCart();

    toast.success(`Pedido ${order.id} registrado correctamente`, {
      description: 'Redirigiendo a la pasarela de pago por QR...',
    });

    navigate({
      to: '/pago/$orderId',
      params: { orderId: stripOrderHash(order.id) },
    });
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          role="dialog"
          aria-modal="true"
          aria-label="Carrito de compras y checkout"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeCart}
            className="fixed inset-0 bg-[#0A192F]/70 backdrop-blur-xs"
          />

          {/* Panel deslizable */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="relative z-10 flex h-full w-full max-w-lg flex-col bg-[#F8FAFC] shadow-2xl"
          >
            {/* Header del Drawer */}
            <div className="flex items-center justify-between border-b border-[#112240] bg-[#0A192F] px-5 py-4 text-white">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#112240] text-[#D4AF37]">
                  <Icon icon="solar:bag-4-bold" className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-heading text-base font-bold leading-tight">
                    Tu Carrito y Pedido
                  </h2>
                  <p className="text-xs text-slate-300 tabular-nums">
                    {totalItems} {totalItems === 1 ? 'ítem seleccionado' : 'ítems seleccionados'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeCart}
                aria-label="Cerrar carrito"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#112240] text-slate-200 transition-colors hover:bg-[#D4AF37] hover:text-[#0A192F]"
              >
                <Icon icon="solar:close-circle-bold" className="h-5 w-5" />
              </button>
            </div>

            {/* Contenido */}
            <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
              {cart.length === 0 ? (
                <EmptyState
                  variant="cart"
                  title="Tu carrito está vacío"
                  description="Explora nuestro catálogo de equipamiento, materiales, productos físicos y servicios especializados para armar tu pedido."
                  actionLabel="Explorar Catálogo"
                  onAction={() => {
                    closeCart();
                    navigate({ to: '/catalogo' });
                  }}
                />
              ) : (
                <div className="space-y-6">
                  {/* Lista de ítems */}
                  <ul className="space-y-3">
                    {cart.map(({ product, quantity }) => (
                      <li
                        key={product.id}
                        className="flex gap-3.5 rounded-2xl border border-[#E2E8F0] bg-white p-3.5 shadow-xs"
                      >
                        <img
                          src={
                            failedThumbs[product.id]
                              ? createBrandedFallbackImage(
                                  product.name,
                                  product.category
                                )
                              : product.images[0] ||
                                createBrandedFallbackImage(
                                  product.name,
                                  product.category
                                )
                          }
                          alt={product.name}
                          onError={() =>
                            setFailedThumbs((prev) => ({
                              ...prev,
                              [product.id]: true,
                            }))
                          }
                          className="h-20 w-24 shrink-0 rounded-xl border border-[#E2E8F0] object-cover"
                        />
                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="line-clamp-2 font-heading text-sm font-bold text-[#0F172A]">
                              {product.name}
                            </h3>
                            <button
                              type="button"
                              onClick={() => removeFromCart(product.id)}
                              aria-label={`Eliminar ${product.name}`}
                              className="shrink-0 rounded-lg p-1 text-[#475569] transition-colors hover:bg-[#EF4444]/10 hover:text-[#EF4444]"
                            >
                              <Icon
                                icon="solar:trash-bin-trash-bold"
                                className="h-4 w-4"
                              />
                            </button>
                          </div>

                          <div className="mt-1 flex items-center gap-2">
                            <ProductTypeBadge type={product.type} />
                            <span className="text-xs text-[#475569] tabular-nums">
                              {formatCurrency(product.price)} c/u
                            </span>
                          </div>

                          <div className="mt-3 flex items-center justify-between">
                            <div className="inline-flex items-center rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]">
                              <button
                                type="button"
                                onClick={() =>
                                  updateCartQuantity(product.id, quantity - 1)
                                }
                                aria-label="Restar unidad"
                                className="flex h-7 w-7 items-center justify-center text-[#0A192F] hover:bg-white"
                              >
                                <Icon icon="solar:minus-square-bold" className="h-4 w-4" />
                              </button>
                              <span className="w-8 text-center text-xs font-bold text-[#0F172A] tabular-nums">
                                {quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  updateCartQuantity(product.id, quantity + 1)
                                }
                                aria-label="Sumar unidad"
                                className="flex h-7 w-7 items-center justify-center text-[#0A192F] hover:bg-white"
                              >
                                <Icon icon="solar:add-square-bold" className="h-4 w-4" />
                              </button>
                            </div>

                            <span className="font-heading text-sm font-extrabold text-[#0A192F] tabular-nums">
                              {formatCurrency(product.price * quantity)}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {/* Resumen de Totales */}
                  <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-xs">
                    <div className="flex items-center justify-between text-sm text-[#475569]">
                      <span>Subtotal ({totalItems} ítems)</span>
                      <span className="font-semibold text-[#0F172A] tabular-nums">
                        {formatCurrency(subtotal)}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm text-[#475569]">
                      <span>Gestión de Reserva / Logística</span>
                      <span className="font-semibold text-[#10B981]">
                        Incluido / A coordinar
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-[#E2E8F0] pt-3">
                      <span className="font-heading text-base font-bold text-[#0A192F]">
                        Total General
                      </span>
                      <span className="font-heading text-xl font-extrabold text-[#0A192F] tabular-nums">
                        {formatCurrency(subtotal)}
                      </span>
                    </div>
                  </div>

                  {/* Formulario de Datos del Cliente */}
                  <form
                    id="checkout-order-form"
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-4 rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-xs sm:p-5"
                    noValidate
                  >
                    <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
                      <Icon
                        icon="solar:user-id-bold"
                        className="h-5 w-5 text-[#D4AF37]"
                      />
                      <div>
                        <h3 className="font-heading text-sm font-bold text-[#0A192F]">
                          Datos del Cliente para Registro
                        </h3>
                        <p className="text-xs text-[#475569]">
                          Completa tus datos para generar tu código de pedido y QR
                        </p>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="checkout-name"
                        className="mb-1 block text-xs font-semibold text-[#0F172A]"
                      >
                        Nombre completo *
                      </label>
                      <input
                        id="checkout-name"
                        type="text"
                        placeholder="Ej. Valeria Mendoza Rojas"
                        {...register('customerName')}
                        className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5 text-sm text-[#0F172A] outline-none transition-colors focus:border-[#D4AF37] focus:bg-white"
                      />
                      {errors.customerName && (
                        <p className="mt-1 text-xs font-medium text-[#EF4444]">
                          {errors.customerName.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="checkout-phone"
                        className="mb-1 block text-xs font-semibold text-[#0F172A]"
                      >
                        Teléfono / WhatsApp (solo dígitos) *
                      </label>
                      <input
                        id="checkout-phone"
                        type="tel"
                        inputMode="numeric"
                        placeholder="Ej. 71234567"
                        {...register('customerPhone')}
                        className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5 text-sm text-[#0F172A] tabular-nums outline-none transition-colors focus:border-[#D4AF37] focus:bg-white"
                      />
                      {errors.customerPhone && (
                        <p className="mt-1 text-xs font-medium text-[#EF4444]">
                          {errors.customerPhone.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="checkout-address"
                        className="mb-1 block text-xs font-semibold text-[#0F172A]"
                      >
                        Dirección completa de entrega o ubicación del servicio *
                      </label>
                      <input
                        id="checkout-address"
                        type="text"
                        placeholder="Av. / Calle, Nro, Zona o Salón de evento"
                        {...register('address')}
                        className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5 text-sm text-[#0F172A] outline-none transition-colors focus:border-[#D4AF37] focus:bg-white"
                      />
                      {errors.address && (
                        <p className="mt-1 text-xs font-medium text-[#EF4444]">
                          {errors.address.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="checkout-notes"
                        className="mb-1 block text-xs font-semibold text-[#0F172A]"
                      >
                        Referencia o notas adicionales (opcional)
                      </label>
                      <textarea
                        id="checkout-notes"
                        rows={2}
                        placeholder="Horario preferido, piso/oficina o detalles del evento..."
                        {...register('notes')}
                        className="w-full resize-none rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2 text-sm text-[#0F172A] outline-none transition-colors focus:border-[#D4AF37] focus:bg-white"
                      />
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Footer fijo de confirmación */}
            {cart.length > 0 && (
              <div className="border-t border-[#E2E8F0] bg-white px-5 py-4 shadow-lg">
                <Button
                  type="submit"
                  form="checkout-order-form"
                  isDisabled={isSubmitting || createOrder.isPending}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#D4AF37] px-6 text-sm font-extrabold text-[#0A192F] shadow-md transition-colors duration-200 hover:bg-[#E5C158] active:bg-[#B5952F] disabled:opacity-60"
                >
                  <Icon icon="solar:qr-code-bold" className="h-5 w-5" />
                  <span>
                    {isSubmitting || createOrder.isPending
                      ? 'Registrando pedido...'
                      : `Confirmar Pedido · ${formatCurrency(subtotal)}`}
                  </span>
                </Button>
                <p className="mt-2 text-center text-[11px] text-[#475569]">
                  Al confirmar, generaremos tu código único y accederás al pago por QR.
                </p>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

