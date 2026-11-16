import { Icon } from '@iconify/react';
import type { OrderStatus, PaymentStatus, ProductType } from '@/types/ecommerce';

export function ProductTypeBadge({ type }: { type: ProductType }) {
  if (type === 'SERVICIO') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-[#D4AF37] bg-[#FEF3C7] px-2.5 py-0.5 text-[11px] font-semibold text-[#92400E] shadow-xs">
        <Icon icon="solar:calendar-mark-bold" className="h-3.5 w-3.5" />
        Servicio / Alquiler
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#112240] px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-xs">
      <Icon icon="solar:box-bold" className="h-3.5 w-3.5 text-[#D4AF37]" />
      Producto Estándar
    </span>
  );
}

const PAYMENT_STATUS_CONFIG: Record<
  PaymentStatus,
  { label: string; bg: string; text: string; border: string; icon: string }
> = {
  PENDIENTE: {
    label: 'Pago Pendiente',
    bg: 'bg-[#F59E0B]/12',
    text: 'text-[#B45309]',
    border: 'border-[#F59E0B]/40',
    icon: 'solar:clock-circle-bold',
  },
  COMPROBANTE_ENVIADO: {
    label: 'Comprobante en Revisión',
    bg: 'bg-[#F59E0B]/15',
    text: 'text-[#B45309]',
    border: 'border-[#F59E0B]/50',
    icon: 'solar:document-check-bold',
  },
  PAGADO: {
    label: 'Pagado / Verificado',
    bg: 'bg-[#10B981]/12',
    text: 'text-[#047857]',
    border: 'border-[#10B981]/40',
    icon: 'solar:check-circle-bold',
  },
  RECHAZADO: {
    label: 'Pago Rechazado',
    bg: 'bg-[#EF4444]/12',
    text: 'text-[#B91C1C]',
    border: 'border-[#EF4444]/40',
    icon: 'solar:close-circle-bold',
  },
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const cfg = PAYMENT_STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      <Icon icon={cfg.icon} className="h-4 w-4 shrink-0" />
      {cfg.label}
    </span>
  );
}

const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; bg: string; text: string; border: string; icon: string }
> = {
  PENDIENTE: {
    label: 'Pendiente',
    bg: 'bg-[#F59E0B]/12',
    text: 'text-[#B45309]',
    border: 'border-[#F59E0B]/40',
    icon: 'solar:hourglass-bold',
  },
  VERIFICADO: {
    label: 'Verificado por Admin',
    bg: 'bg-[#10B981]/12',
    text: 'text-[#047857]',
    border: 'border-[#10B981]/40',
    icon: 'solar:shield-check-bold',
  },
  ENVIADO_COMPLETADO: {
    label: 'Enviado / Completado',
    bg: 'bg-[#10B981]/15',
    text: 'text-[#047857]',
    border: 'border-[#10B981]/50',
    icon: 'solar:box-minimalistic-bold',
  },
  CANCELADO: {
    label: 'Cancelado',
    bg: 'bg-[#EF4444]/12',
    text: 'text-[#B91C1C]',
    border: 'border-[#EF4444]/40',
    icon: 'solar:close-square-bold',
  },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const cfg = ORDER_STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      <Icon icon={cfg.icon} className="h-4 w-4 shrink-0" />
      {cfg.label}
    </span>
  );
}

