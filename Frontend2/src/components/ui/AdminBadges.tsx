import { Icon } from '@iconify/react';
import type { OrderStatus, PaymentStatus, ProductType } from '@/types/ecommerce';

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const styles: Record<
    PaymentStatus,
    { label: string; classes: string; icon: string }
  > = {
    PENDIENTE: {
      label: 'Sin comprobante',
      classes: 'border-slate-300 bg-slate-100 text-slate-700',
      icon: 'solar:clock-circle-bold',
    },
    COMPROBANTE_ENVIADO: {
      label: 'Comprobante por verificar',
      classes: 'border-[#F59E0B]/40 bg-[#FEF3C7] text-[#92400E]',
      icon: 'solar:document-add-bold',
    },
    PAGADO: {
      label: 'Pago aprobado',
      classes: 'border-[#10B981]/35 bg-[#10B981]/15 text-[#047857]',
      icon: 'solar:check-circle-bold',
    },
    RECHAZADO: {
      label: 'Rechazado',
      classes: 'border-[#EF4444]/35 bg-[#EF4444]/15 text-[#B91C1C]',
      icon: 'solar:close-circle-bold',
    },
  };

  const current = styles[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold whitespace-nowrap ${current.classes}`}
    >
      <Icon icon={current.icon} className="h-3.5 w-3.5 shrink-0" />
      <span>{current.label}</span>
    </span>
  );
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const styles: Record<OrderStatus, { label: string; classes: string }> = {
    PENDIENTE: {
      label: 'Pendiente',
      classes: 'border-[#F59E0B]/40 bg-[#FEF3C7]/70 text-[#92400E]',
    },
    VERIFICADO: {
      label: 'Pagado',
      classes: 'border-[#0A192F]/20 bg-[#0A192F]/10 text-[#0A192F]',
    },
    ENVIADO_COMPLETADO: {
      label: 'Enviado',
      classes: 'border-[#10B981]/35 bg-[#10B981]/15 text-[#047857]',
    },
    CANCELADO: {
      label: 'Cancelado',
      classes: 'border-[#EF4444]/35 bg-[#EF4444]/15 text-[#B91C1C]',
    },
  };

  const current = styles[status];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold whitespace-nowrap ${current.classes}`}
    >
      {current.label}
    </span>
  );
}

export function ProductTypeBadge({ type }: { type: ProductType }) {
  if (type === 'SERVICIO') {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-[#D4AF37] bg-[#FEF3C7] px-2 py-0.5 text-[11px] font-bold text-[#92400E] whitespace-nowrap">
        <Icon icon="solar:calendar-mark-bold" className="h-3 w-3" />
        <span>Servicio</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-[#112240] px-2 py-0.5 text-[11px] font-bold text-white whitespace-nowrap">
      <Icon icon="solar:box-bold" className="h-3 w-3 text-[#D4AF37]" />
      <span>Estándar</span>
    </span>
  );
}

