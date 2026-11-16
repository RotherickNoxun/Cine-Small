import { useEffect, useState } from 'react';
import { Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
import {
  OrderStatusBadge,
  PaymentStatusBadge,
  ProductTypeBadge,
} from '@/components/ui/AdminBadges';
import {
  useApproveOrderPayment,
  useAttachOrderReceipt,
  useRejectOrderPayment,
  useUpdateOrderWorkflow,
} from '@/hooks/useAdminStore';
import {
  buildCustomerWhatsAppLink,
  formatCurrency,
  formatDateShort,
  formatFileSize,
} from '@/lib/format';
import type { Order, OrderStatus } from '@/types/ecommerce';

interface OrderAuditDrawerProps {
  order: Order | null;
  onClose: () => void;
}

export function OrderAuditDrawer({ order, onClose }: OrderAuditDrawerProps) {
  const approvePayment = useApproveOrderPayment();
  const rejectPayment = useRejectOrderPayment();
  const updateWorkflow = useUpdateOrderWorkflow();
  const attachReceipt = useAttachOrderReceipt();

  const [selectedWorkflow, setSelectedWorkflow] =
    useState<OrderStatus>('PENDIENTE');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState<number>(1);

  useEffect(() => {
    if (order) {
      setSelectedWorkflow(order.orderStatus);
      setRejectReason(order.rejectionReason ?? '');
      setShowRejectBox(false);
      setLightboxOpen(false);
      setZoomScale(1);
    }
  }, [order]);

  if (!order) return null;

  const whatsappContactLink = buildCustomerWhatsAppLink(
    order.customerPhone,
    `Hola ${order.customerName}, te escribimos desde Cine Small Admin sobre tu pedido ${order.id} por ${formatCurrency(order.total)}.`
  );

  const handleApprovePayment = async () => {
    await approvePayment.mutateAsync(order.id);
    setSelectedWorkflow(
      order.orderStatus === 'ENVIADO_COMPLETADO'
        ? 'ENVIADO_COMPLETADO'
        : 'VERIFICADO'
    );
    toast.success(
      `Pago de ${order.id} APROBADO. Estado actualizado a Pagado.`
    );
  };

  const handleRejectPayment = async () => {
    await rejectPayment.mutateAsync({
      orderId: order.id,
      reason: rejectReason,
    });
    setSelectedWorkflow('PENDIENTE');
    setShowRejectBox(false);
    toast.error(`Comprobante de ${order.id} marcado como RECHAZADO.`);
  };

  const handleSaveWorkflow = async () => {
    await updateWorkflow.mutateAsync({
      orderId: order.id,
      orderStatus: selectedWorkflow,
    });
    toast.success(`Flujo del pedido ${order.id} guardado correctamente.`);
  };

  const handleManualReceiptAttach = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('El archivo supera el máximo permitido de 5 MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result === 'string') {
        await attachReceipt.mutateAsync({
          orderId: order.id,
          fileName: file.name,
          fileType: file.type || 'image/png',
          fileSize: file.size,
          previewUrl: reader.result,
        });
        toast.success(`Comprobante adjuntado en ${order.id}`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadReceipt = () => {
    if (!order.receipt) return;
    const link = document.createElement('a');
    link.href = order.receipt.previewUrl;
    link.download = order.receipt.fileName;
    link.click();
  };

  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0A192F]/70 backdrop-blur-xs"
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="relative z-10 flex h-full w-full max-w-2xl flex-col bg-[#F1F5F9] shadow-2xl"
          >
            {/* Header Drawer */}
            <div className="flex items-center justify-between border-b border-[#1E3A5F] bg-[#0A192F] px-5 py-4 text-white">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-heading text-lg font-extrabold text-[#D4AF37] tabular-nums">
                    {order.id}
                  </span>
                  <PaymentStatusBadge status={order.paymentStatus} />
                  <OrderStatusBadge status={order.orderStatus} />
                </div>
                <p className="mt-1 text-xs text-slate-300 tabular-nums">
                  Registrado el {formatDateShort(order.createdAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar panel de auditoría"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#112240] text-slate-300 transition hover:bg-[#D4AF37] hover:text-[#0A192F]"
              >
                <Icon icon="solar:close-circle-bold" className="h-5 w-5" />
              </button>
            </div>

            {/* Contenido en 4 Bloques */}
            <div className="flex-1 space-y-5 overflow-y-auto p-5">
              {/* BLOQUE 1: Datos del Cliente */}
              <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3">
                  <h3 className="flex items-center gap-2 font-heading text-sm font-extrabold uppercase tracking-wider text-[#0A192F]">
                    <Icon
                      icon="solar:user-id-bold-duotone"
                      className="h-5 w-5 text-[#D4AF37]"
                    />
                    <span>1. Datos del Cliente</span>
                  </h3>
                  <a
                    href={whatsappContactLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#10B981] px-3 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#059669]"
                  >
                    <Icon icon="ic:baseline-whatsapp" className="h-4 w-4" />
                    <span>Contactar por WhatsApp</span>
                  </a>
                </div>
                <dl className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-semibold text-[#475569]">
                      Nombre completo
                    </dt>
                    <dd className="font-bold text-[#0F172A]">
                      {order.customerName}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold text-[#475569]">
                      Teléfono / WhatsApp
                    </dt>
                    <dd className="font-bold text-[#0A192F] tabular-nums">
                      {order.customerPhone}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-xs font-semibold text-[#475569]">
                      Dirección de entrega / Ubicación de servicio
                    </dt>
                    <dd className="font-medium text-[#0F172A]">
                      {order.address}
                    </dd>
                  </div>
                  {order.notes && (
                    <div className="rounded-xl bg-[#F8FAFC] p-3 sm:col-span-2">
                      <dt className="text-xs font-bold text-[#475569]">
                        Notas y referencias del cliente
                      </dt>
                      <dd className="mt-0.5 text-xs text-[#0F172A]">
                        {order.notes}
                      </dd>
                    </div>
                  )}
                </dl>
              </section>

              {/* BLOQUE 2: Desglose del Pedido */}
              <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs">
                <h3 className="flex items-center gap-2 border-b border-[#E2E8F0] pb-3 font-heading text-sm font-extrabold uppercase tracking-wider text-[#0A192F]">
                  <Icon
                    icon="solar:bag-check-bold-duotone"
                    className="h-5 w-5 text-[#D4AF37]"
                  />
                  <span>2. Desglose del Pedido ({order.items.length})</span>
                </h3>
                <div className="mt-3 divide-y divide-[#E2E8F0]">
                  {order.items.map((item) => (
                    <div
                      key={`${item.productId}-${item.name}`}
                      className="flex items-center gap-3 py-3"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-12 w-12 shrink-0 rounded-xl border border-[#E2E8F0] object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <ProductTypeBadge type={item.type} />
                          <span className="text-[11px] font-semibold text-[#475569]">
                            {item.category}
                          </span>
                        </div>
                        <p className="mt-1 truncate text-sm font-bold text-[#0F172A]">
                          {item.name}
                        </p>
                        <p className="text-xs text-[#475569] tabular-nums">
                          {item.quantity} × {formatCurrency(item.price)}
                        </p>
                      </div>
                      <span className="font-heading text-sm font-extrabold text-[#0A192F] tabular-nums">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between rounded-xl bg-[#0A192F] px-4 py-3 text-white">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Total del Pedido
                  </span>
                  <span className="font-heading text-xl font-extrabold text-[#D4AF37] tabular-nums">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </section>

              {/* BLOQUE 3: Auditoría de Pago QR y Comprobante */}
              <section className="rounded-2xl border-2 border-[#D4AF37]/40 bg-white p-5 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3">
                  <h3 className="flex items-center gap-2 font-heading text-sm font-extrabold uppercase tracking-wider text-[#0A192F]">
                    <Icon
                      icon="solar:qr-code-bold-duotone"
                      className="h-5 w-5 text-[#D4AF37]"
                    />
                    <span>3. Auditoría de Pago QR y Comprobante</span>
                  </h3>
                  <PaymentStatusBadge status={order.paymentStatus} />
                </div>

                {order.rejectionReason && (
                  <div className="mt-3 rounded-xl border border-[#EF4444]/30 bg-[#EF4444]/10 p-3 text-xs text-[#B91C1C]">
                    <strong className="font-bold">Motivo de rechazo:</strong>{' '}
                    {order.rejectionReason}
                  </div>
                )}

                {order.receipt ? (
                  <div className="mt-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#F8FAFC] px-3 py-2 text-xs">
                      <div className="min-w-0">
                        <p className="truncate font-bold text-[#0F172A]">
                          {order.receipt.fileName}
                        </p>
                        <p className="text-[#475569] tabular-nums">
                          {formatFileSize(order.receipt.fileSize)} · Subido el{' '}
                          {formatDateShort(order.receipt.uploadedAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setLightboxOpen(true)}
                          className="inline-flex items-center gap-1 rounded-lg bg-[#0A192F] px-2.5 py-1.5 text-xs font-bold text-[#D4AF37] transition hover:bg-[#112240]"
                        >
                          <Icon
                            icon="solar:magnifer-zoom-in-bold"
                            className="h-3.5 w-3.5"
                          />
                          <span>Ampliar / Zoom</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleDownloadReceipt}
                          className="inline-flex items-center gap-1 rounded-lg border border-[#E2E8F0] bg-white px-2.5 py-1.5 text-xs font-bold text-[#0F172A] transition hover:bg-[#F8FAFC]"
                        >
                          <Icon
                            icon="solar:download-minimalistic-bold"
                            className="h-3.5 w-3.5"
                          />
                          <span>Descargar</span>
                        </button>
                      </div>
                    </div>

                    {order.receipt.fileType === 'application/pdf' ? (
                      <iframe
                        src={order.receipt.previewUrl}
                        title={order.receipt.fileName}
                        className="h-72 w-full rounded-xl border border-[#E2E8F0]"
                      />
                    ) : (
                      <div
                        onClick={() => setLightboxOpen(true)}
                        className="group relative cursor-zoom-in overflow-hidden rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-2"
                      >
                        <img
                          src={order.receipt.previewUrl}
                          alt={order.receipt.fileName}
                          className="mx-auto max-h-64 rounded-lg object-contain transition duration-200 group-hover:scale-[1.01]"
                        />
                        <span className="absolute right-3 bottom-3 rounded-lg bg-[#0A192F]/85 px-2.5 py-1 text-[11px] font-bold text-white">
                          Clic para ampliar
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-4">
                    <div className="flex items-start gap-3">
                      <Icon
                        icon="solar:info-circle-bold-duotone"
                        className="mt-0.5 h-6 w-6 shrink-0 text-[#F59E0B]"
                      />
                      <div className="space-y-1 text-xs text-[#475569]">
                        <p className="font-bold text-[#0F172A]">
                          Comprobante pendiente (opcional)
                        </p>
                        <p>
                          El cliente aún no subió archivo desde la tienda pública.
                          Si ya verificaste el abono en la cuenta bancaria de Cine
                          Small, puedes aprobar el pago manualmente o adjuntar un
                          respaldo aquí.
                        </p>
                        <label className="mt-2 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#D4AF37] bg-[#FEF3C7]/60 px-3 py-1.5 font-bold text-[#92400E] hover:bg-[#D4AF37] hover:text-[#0A192F]">
                          <Icon icon="solar:upload-bold" className="h-3.5 w-3.5" />
                          <span>Adjuntar respaldo bancario</span>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleManualReceiptAttach}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Decisiones Administrativas */}
                <div className="mt-4 space-y-3 border-t border-[#E2E8F0] pt-4">
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    <Button
                      onPress={handleApprovePayment}
                      className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#10B981] px-4 text-xs font-extrabold text-white shadow-xs transition hover:bg-[#059669]"
                    >
                      <Icon
                        icon="solar:check-circle-bold"
                        className="h-4 w-4 shrink-0"
                      />
                      <span>Aprobar Pago y Marcar como Pagado</span>
                    </Button>

                    <Button
                      onPress={() => setShowRejectBox((v) => !v)}
                      className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#EF4444] px-4 text-xs font-extrabold text-white shadow-xs transition hover:bg-[#DC2626]"
                    >
                      <Icon
                        icon="solar:close-circle-bold"
                        className="h-4 w-4 shrink-0"
                      />
                      <span>Rechazar Comprobante</span>
                    </Button>
                  </div>

                  {showRejectBox && (
                    <div className="rounded-xl border border-[#EF4444]/30 bg-[#FEF2F2] p-3.5">
                      <label className="block text-xs font-bold text-[#991B1B]">
                        Motivo del rechazo (opcional, visible al auditar)
                      </label>
                      <textarea
                        rows={2}
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Ej. Monto transferido incompleto o captura ilegible..."
                        className="mt-1.5 w-full rounded-xl border border-[#FECACA] bg-white p-2.5 text-xs text-[#0F172A] outline-none focus:border-[#EF4444]"
                      />
                      <div className="mt-2 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowRejectBox(false)}
                          className="rounded-lg px-3 py-1.5 text-xs font-bold text-[#475569] hover:bg-white"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={handleRejectPayment}
                          className="rounded-lg bg-[#EF4444] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#DC2626]"
                        >
                          Confirmar Rechazo
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* BLOQUE 4: Control de Flujo de Pedido */}
              <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs">
                <h3 className="flex items-center gap-2 border-b border-[#E2E8F0] pb-3 font-heading text-sm font-extrabold uppercase tracking-wider text-[#0A192F]">
                  <Icon
                    icon="solar:delivery-bold-duotone"
                    className="h-5 w-5 text-[#D4AF37]"
                  />
                  <span>4. Control de Flujo del Pedido</span>
                </h3>
                <p className="mt-2 text-xs text-[#475569]">
                  Los cambios se sincronizan en tiempo real con la pantalla de
                  seguimiento del cliente.
                </p>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <select
                    aria-label="Seleccionar estado del flujo del pedido"
                    value={selectedWorkflow}
                    onChange={(e) =>
                      setSelectedWorkflow(e.target.value as OrderStatus)
                    }
                    className="h-11 flex-1 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-sm font-bold text-[#0A192F] outline-none focus:border-[#D4AF37]"
                  >
                    <option value="PENDIENTE">Pendiente</option>
                    <option value="VERIFICADO">Pagado</option>
                    <option value="ENVIADO_COMPLETADO">Enviado</option>
                    <option value="CANCELADO">Cancelado</option>
                  </select>
                  <Button
                    onPress={handleSaveWorkflow}
                    className="h-11 rounded-xl bg-[#D4AF37] px-5 text-xs font-extrabold text-[#0A192F] hover:bg-[#E5C158]"
                  >
                    Guardar Estado de Pedido
                  </Button>
                </div>
              </section>
            </div>
          </motion.aside>
        </div>
      </AnimatePresence>

      {/* Lightbox de Ampliación / Zoom del Comprobante */}
      {lightboxOpen && order.receipt && (
        <div
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 z-[60] flex flex-col bg-[#0A192F]/95 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="mx-auto flex w-full max-w-5xl items-center justify-between rounded-t-2xl bg-[#112240] px-4 py-3 text-white"
          >
            <div className="min-w-0">
              <p className="truncate font-heading text-sm font-bold text-[#D4AF37]">
                {order.id} · {order.receipt.fileName}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setZoomScale((z) => Math.max(0.75, Number((z - 0.25).toFixed(2))))
                }
                className="rounded-lg bg-[#0A192F] px-2.5 py-1 text-xs font-bold hover:text-[#D4AF37]"
              >
                - Zoom
              </button>
              <span className="text-xs font-bold tabular-nums">
                {Math.round(zoomScale * 100)}%
              </span>
              <button
                type="button"
                onClick={() =>
                  setZoomScale((z) => Math.min(2.5, Number((z + 0.25).toFixed(2))))
                }
                className="rounded-lg bg-[#0A192F] px-2.5 py-1 text-xs font-bold hover:text-[#D4AF37]"
              >
                + Zoom
              </button>
              <button
                type="button"
                onClick={handleDownloadReceipt}
                className="rounded-lg bg-[#D4AF37] px-3 py-1 text-xs font-extrabold text-[#0A192F]"
              >
                Descargar
              </button>
              <button
                type="button"
                onClick={() => setLightboxOpen(false)}
                className="ml-2 text-slate-300 hover:text-white"
              >
                <Icon icon="solar:close-circle-bold" className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div
            onClick={(e) => e.stopPropagation()}
            className="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center overflow-auto rounded-b-2xl bg-[#060F1D] p-6"
          >
            <img
              src={order.receipt.previewUrl}
              alt={order.receipt.fileName}
              style={{ transform: `scale(${zoomScale})` }}
              className="max-h-[78vh] rounded-xl object-contain transition-transform duration-150"
            />
          </div>
        </div>
      )}
    </>
  );
}

