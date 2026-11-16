import { Icon } from '@iconify/react';
import type { Order } from '@/types/ecommerce';

interface OrderTimelineProps {
  order: Order;
}

export function OrderTimeline({ order }: OrderTimelineProps) {
  const isCancelledOrRejected =
    order.paymentStatus === 'RECHAZADO' || order.orderStatus === 'CANCELADO';

  const step1Done = true;
  const step2Done =
    order.paymentStatus === 'COMPROBANTE_ENVIADO' ||
    order.paymentStatus === 'PAGADO';
  const step3Done =
    order.paymentStatus === 'PAGADO' ||
    order.orderStatus === 'VERIFICADO' ||
    order.orderStatus === 'ENVIADO_COMPLETADO';
  const step4Done = order.orderStatus === 'ENVIADO_COMPLETADO';

  const steps = [
    {
      num: 1,
      title: 'Pedido Registrado',
      subtitle: 'Código único generado',
      done: step1Done,
      active: !step2Done && !isCancelledOrRejected,
      icon: 'solar:clipboard-check-bold',
    },
    {
      num: 2,
      title: 'Pago QR / Comprobante',
      subtitle:
        order.paymentStatus === 'COMPROBANTE_ENVIADO'
          ? 'Comprobante enviado'
          : step2Done
            ? 'Pago recibido'
            : 'Esperando pago o voucher',
      done: step2Done,
      active: step1Done && !step2Done && !isCancelledOrRejected,
      icon: 'solar:qr-code-bold',
    },
    {
      num: 3,
      title: 'Verificado por Admin',
      subtitle: step3Done ? 'Pago confirmado' : 'Validación comercial',
      done: step3Done,
      active: step2Done && !step3Done && !isCancelledOrRejected,
      icon: 'solar:shield-check-bold',
    },
    {
      num: 4,
      title: 'Enviado / Completado',
      subtitle: step4Done ? 'Entregado o ejecutado' : 'Despacho / Coordinación',
      done: step4Done,
      active: step3Done && !step4Done && !isCancelledOrRejected,
      icon: 'solar:box-minimalistic-bold',
    },
  ];

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-[#0A192F]">
          Estado de Verificación en Tiempo Real
        </h2>
        {isCancelledOrRejected && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EF4444]/12 px-3 py-1 text-xs font-bold text-[#B91C1C]">
            <Icon icon="solar:danger-triangle-bold" className="h-4 w-4" />
            Atención requerida: {order.paymentStatus === 'RECHAZADO' ? 'Comprobante rechazado' : 'Pedido cancelado'}
          </span>
        )}
      </div>

      <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => {
          const ringClass = step.done
            ? 'border-[#10B981] bg-[#10B981] text-white'
            : step.active
              ? 'border-[#D4AF37] bg-[#FEF3C7] text-[#92400E] ring-4 ring-[#D4AF37]/20'
              : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#475569]';

          return (
            <li
              key={step.num}
              className={`relative flex items-start gap-3 rounded-xl border p-3.5 transition-all duration-200 ${
                step.done
                  ? 'border-[#10B981]/35 bg-[#10B981]/5'
                  : step.active
                    ? 'border-[#D4AF37] bg-[#FEF3C7]/35'
                    : 'border-[#E2E8F0] bg-[#F8FAFC]/60'
              }`}
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${ringClass}`}
              >
                {step.done ? (
                  <Icon icon="solar:check-read-bold" className="h-4 w-4" />
                ) : (
                  <Icon icon={step.icon} className="h-4 w-4" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#475569] tabular-nums">
                  Paso {index + 1}
                </p>
                <p className="font-heading text-sm font-bold text-[#0A192F]">
                  {step.title}
                </p>
                <p className="mt-0.5 text-xs text-[#475569]">{step.subtitle}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

