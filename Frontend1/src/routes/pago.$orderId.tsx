import { useState } from 'react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import { OrderPdfButton } from '@/components/payment/OrderPdfButton';
import { OrderTimeline } from '@/components/payment/OrderTimeline';
import { QrPaymentModule } from '@/components/payment/QrPaymentModule';
import { ReceiptUploadModule } from '@/components/payment/ReceiptUploadModule';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  OrderStatusBadge,
  PaymentStatusBadge,
  ProductTypeBadge,
} from '@/components/ui/StatusBadge';
import {
  useOrder,
  useOrders,
  useUpdateOrderStatus,
} from '@/hooks/useEcommerce';
import {
  buildWhatsAppLink,
  createBrandedFallbackImage,
  formatCurrency,
  formatDateShort,
  stripOrderHash,
} from '@/lib/format';

export const Route = createFileRoute('/pago/$orderId')({
  component: PaymentGatewayPage,
});

function PaymentGatewayPage() {
  const { orderId } = Route.useParams();
  const navigate = useNavigate();
  const { data: order, isLoading } = useOrder(orderId);
  const { data: allOrders = [] } = useOrders();
  const updateStatus = useUpdateOrderStatus();

  const [summaryOpen, setSummaryOpen] = useState(true);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="h-44 animate-pulse rounded-2xl bg-slate-200" />
        <div className="mt-6 h-32 animate-pulse rounded-2xl bg-slate-200" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <EmptyState
          variant="order"
          title={`No encontramos el pedido "${orderId}"`}
          description="Verifica el código ingresado o selecciona uno de los pedidos registrados en el sistema."
          actionLabel="Explorar Catálogo"
          onAction={() => navigate({ to: '/catalogo' })}
        />
        {allOrders.length > 0 && (
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {allOrders.map((o) => (
              <Link
                key={o.id}
                to="/pago/$orderId"
                params={{ orderId: stripOrderHash(o.id) }}
                className="rounded-xl border border-[#E2E8F0] bg-white px-4 py-2 text-xs font-bold text-[#0A192F] tabular-nums hover:border-[#D4AF37]"
              >
                {o.id}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  const hasReceipt = Boolean(order.receipt);
  const whatsappMessage = [
    `Hola Cine Small (cinesmall.com), notifico mi pago por QR:`,
    `• Pedido: ${order.id}`,
    `• Cliente: ${order.customerName}`,
    `• Monto total: ${formatCurrency(order.total)}`,
    `• Comprobante en web: ${
      hasReceipt
        ? `Sí, comprobante adjuntado (${order.receipt?.fileName})`
        : 'No adjuntado en la web (lo envío por este chat)'
    }`,
  ].join('\n');

  const whatsappNotifyUrl = buildWhatsAppLink(whatsappMessage);

  return (
    <div className="min-h-[80vh] pb-16">
      {/* Barra superior de pedidos activos */}
      <div className="border-b border-[#E2E8F0] bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2.5 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#475569]">
              Pedidos activos:
            </span>
            {allOrders.slice(0, 6).map((ord) => {
              const active =
                stripOrderHash(ord.id).toUpperCase() ===
                stripOrderHash(order.id).toUpperCase();
              return (
                <Link
                  key={ord.id}
                  to="/pago/$orderId"
                  params={{ orderId: stripOrderHash(ord.id) }}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold tabular-nums transition-colors ${
                    active
                      ? 'bg-[#0A192F] text-[#D4AF37]'
                      : 'bg-[#F8FAFC] text-[#475569] hover:bg-[#FEF3C7] hover:text-[#0A192F]'
                  }`}
                >
                  {ord.id}
                </Link>
              );
            })}
          </div>
          <Link
            to="/admin"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#475569] hover:text-[#0A192F]"
          >
            <Icon icon="solar:shield-user-bold" className="h-4 w-4 text-[#D4AF37]" />
            <span>Ir al Panel Admin</span>
          </Link>
        </div>
      </div>

      {/* Encabezado de Confirmación */}
      <section className="bg-hero-radial py-8 text-white sm:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D4AF37] px-3 py-1 text-xs font-extrabold text-[#0A192F] tabular-nums">
                  <Icon icon="solar:check-circle-bold" className="h-4 w-4" />
                  Pedido {order.id}
                </span>
                <span className="text-xs text-slate-300 tabular-nums">
                  Registrado: {formatDateShort(order.createdAt)}
                </span>
              </div>

              <h1 className="mt-3 font-heading text-2xl font-extrabold sm:text-3xl">
                Pasarela de Pago QR y Verificación
              </h1>
              <p className="mt-1.5 text-sm text-slate-300">
                Cliente: <strong className="text-white">{order.customerName}</strong>{' '}
                · Tel:{' '}
                <span className="font-semibold text-white tabular-nums">
                  {order.customerPhone}
                </span>{' '}
                · {order.address}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="rounded-xl bg-white/95 px-2.5 py-1.5 shadow-sm">
                <PaymentStatusBadge status={order.paymentStatus} />
              </div>
              <div className="rounded-xl bg-white/95 px-2.5 py-1.5 shadow-sm">
                <OrderStatusBadge status={order.orderStatus} />
              </div>
              <OrderPdfButton order={order} />
            </div>
          </div>

          {/* Resumen desplegable de lo comprado */}
          <div className="mt-6 overflow-hidden rounded-2xl border border-[#1E3A5F] bg-[#112240]/90">
            <button
              type="button"
              onClick={() => setSummaryOpen((prev) => !prev)}
              className="flex w-full items-center justify-between px-5 py-3.5 text-left transition-colors hover:bg-[#162C50]"
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  icon="solar:bag-check-bold"
                  className="h-5 w-5 text-[#D4AF37]"
                />
                <span className="font-heading text-sm font-bold text-white">
                  Resumen del Pedido ({order.items.length}{' '}
                  {order.items.length === 1 ? 'ítem' : 'ítems'})
                </span>
                <span className="font-heading text-sm font-extrabold text-[#D4AF37] tabular-nums">
                  · Total: {formatCurrency(order.total)}
                </span>
              </div>
              <Icon
                icon={
                  summaryOpen
                    ? 'solar:alt-arrow-up-bold'
                    : 'solar:alt-arrow-down-bold'
                }
                className="h-5 w-5 text-slate-300"
              />
            </button>

            {summaryOpen && (
              <div className="border-t border-[#1E3A5F] bg-[#0A192F]/60 px-5 py-4">
                <ul className="divide-y divide-[#1E3A5F]">
                  {order.items.map((item) => (
                    <li
                      key={item.productId}
                      className="flex flex-col justify-between gap-3 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            item.image ||
                            createBrandedFallbackImage(item.name, item.category)
                          }
                          alt={item.name}
                          onError={(e) => {
                            e.currentTarget.src = createBrandedFallbackImage(
                              item.name,
                              item.category
                            );
                          }}
                          className="h-12 w-16 shrink-0 rounded-lg border border-[#1E3A5F] object-cover"
                        />
                        <div>
                          <p className="text-sm font-bold text-white">
                            {item.name}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <ProductTypeBadge type={item.type} />
                            <span className="text-xs text-slate-300 tabular-nums">
                              {item.quantity} × {formatCurrency(item.price)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className="font-heading text-sm font-extrabold text-[#D4AF37] tabular-nums">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>
                {order.notes && (
                  <p className="mt-3 rounded-xl border border-[#1E3A5F] bg-[#112240] px-3.5 py-2 text-xs text-slate-300">
                    <strong className="text-[#D4AF37]">Notas:</strong>{' '}
                    {order.notes}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Contenido Principal */}
      <div className="mx-auto max-w-7xl space-y-6 px-4 pt-8 sm:px-6 lg:px-8">
        {/* Stepper / Timeline visual */}
        <OrderTimeline order={order} />

        {/* Módulos Centrales: QR + Subida de Comprobante */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <QrPaymentModule order={order} />
          <ReceiptUploadModule order={order} />
        </div>

        {/* Flujo de Notificación al Vendedor por WhatsApp */}
        <section className="rounded-2xl border border-[#10B981]/35 bg-gradient-to-r from-[#0A192F] to-[#112240] p-6 text-white shadow-lg">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#10B981]/20 px-3 py-1 text-xs font-bold text-[#10B981]">
                <Icon icon="ic:baseline-whatsapp" className="h-4 w-4" />
                Notificación Instantánea al Vendedor
              </span>
              <h2 className="mt-2 font-heading text-xl font-extrabold sm:text-2xl">
                ¿Ya realizaste la transferencia por QR?
              </h2>
              <p className="mt-1.5 text-sm text-slate-300">
                Envía automáticamente los datos de tu pedido{' '}
                <strong className="text-[#D4AF37] tabular-nums">
                  {order.id}
                </strong>{' '}
                por WhatsApp con el monto exacto (
                <span className="font-semibold text-white tabular-nums">
                  {formatCurrency(order.total)}
                </span>
                ) y la confirmación de comprobante{' '}
                {hasReceipt ? '(ya adjuntado en la web)' : '(pendiente de envío)'}.
              </p>
            </div>

            <a
              href={whatsappNotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-13 shrink-0 items-center justify-center gap-2.5 rounded-xl bg-[#10B981] px-6 text-sm font-extrabold text-white shadow-lg transition-all duration-200 hover:scale-[1.01] hover:bg-[#059669]"
            >
              <Icon icon="ic:baseline-whatsapp" className="h-6 w-6" />
              <span>Notificar Pago al Vendedor por WhatsApp</span>
            </a>
          </div>
        </section>

        {/* Simulador rápido para demostración en vivo */}
        <section className="rounded-2xl border border-dashed border-[#CBD5E1] bg-white p-5">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h3 className="font-heading text-sm font-bold text-[#0A192F]">
                Sincronización en Tiempo Real con Panel Administrativo
              </h3>
              <p className="mt-0.5 text-xs text-[#475569]">
                Prueba actualizar los pasos 3 y 4 aquí o directamente desde el{' '}
                <Link
                  to="/admin"
                  className="font-bold text-[#0A192F] underline decoration-[#D4AF37]"
                >
                  Portal Administrativo
                </Link>
                .
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                onPress={async () => {
                  await updateStatus.mutateAsync({
                    orderId: order.id,
                    paymentStatus: 'PAGADO',
                    orderStatus: 'VERIFICADO',
                  });
                  toast.success(`Pedido ${order.id} verificado por Admin`);
                }}
                className="rounded-xl bg-[#10B981] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#059669]"
              >
                Simular Paso 3: Verificar Pago
              </Button>
              <Button
                onPress={async () => {
                  await updateStatus.mutateAsync({
                    orderId: order.id,
                    paymentStatus: 'PAGADO',
                    orderStatus: 'ENVIADO_COMPLETADO',
                  });
                  toast.success(`Pedido ${order.id} marcado como Enviado / Completado`);
                }}
                className="rounded-xl bg-[#0A192F] px-3.5 py-2 text-xs font-bold text-[#D4AF37] hover:bg-[#112240]"
              >
                Simular Paso 4: Enviado / Completado
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

