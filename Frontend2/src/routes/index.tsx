import { useMemo, useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from '@/components/ui/AdminBadges';
import { OrderAuditDrawer } from '@/components/orders/OrderAuditDrawer';
import {
  useAdminNotifications,
  useMarkAllNotificationsRead,
  useOrders,
  useProducts,
  useSimulateIncomingReceipt,
} from '@/hooks/useAdminStore';
import { formatCurrency, formatDateShort } from '@/lib/format';
import type { Order } from '@/types/ecommerce';

export const Route = createFileRoute('/')({
  component: DashboardHomePage,
});

function DashboardHomePage() {
  const { data: orders = [] } = useOrders();
  const { data: products = [] } = useProducts();
  const { data: notifications = [] } = useAdminNotifications();
  const markAllRead = useMarkAllNotificationsRead();
  const simulateReceipt = useSimulateIncomingReceipt();

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const selectedOrder = useMemo<Order | null>(
    () => orders.find((o) => o.id === selectedOrderId) ?? null,
    [orders, selectedOrderId]
  );

  const kpis = useMemo(() => {
    const pendingOrders = orders.filter(
      (o) => o.orderStatus === 'PENDIENTE'
    ).length;

    const receiptsToVerify = orders.filter(
      (o) => o.paymentStatus === 'COMPROBANTE_ENVIADO'
    ).length;

    const paidOrShipping = orders.filter(
      (o) =>
        o.orderStatus === 'VERIFICADO' ||
        o.orderStatus === 'ENVIADO_COMPLETADO' ||
        o.paymentStatus === 'PAGADO'
    ).length;

    const confirmedRevenue = orders
      .filter(
        (o) =>
          o.paymentStatus === 'PAGADO' ||
          o.orderStatus === 'VERIFICADO' ||
          o.orderStatus === 'ENVIADO_COMPLETADO'
      )
      .reduce((sum, o) => sum + o.total, 0);

    return {
      pendingOrders,
      receiptsToVerify,
      paidOrShipping,
      confirmedRevenue,
    };
  }, [orders]);

  const chartData = useMemo(() => {
    const map = [
      {
        name: 'Sin comprobante',
        monto: orders
          .filter((o) => o.paymentStatus === 'PENDIENTE')
          .reduce((s, o) => s + o.total, 0),
        color: '#64748B',
      },
      {
        name: 'Por verificar',
        monto: orders
          .filter((o) => o.paymentStatus === 'COMPROBANTE_ENVIADO')
          .reduce((s, o) => s + o.total, 0),
        color: '#F59E0B',
      },
      {
        name: 'Aprobados / Pagados',
        monto: orders
          .filter((o) => o.paymentStatus === 'PAGADO')
          .reduce((s, o) => s + o.total, 0),
        color: '#10B981',
      },
      {
        name: 'Rechazados',
        monto: orders
          .filter((o) => o.paymentStatus === 'RECHAZADO')
          .reduce((s, o) => s + o.total, 0),
        color: '#EF4444',
      },
    ];
    return map;
  }, [orders]);

  const latestOrders = useMemo(
    () =>
      [...orders]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 6),
    [orders]
  );

  const activeCatalogCount = useMemo(
    () => products.filter((p) => p.isActive).length,
    [products]
  );

  const handleSimulateReceipt = async () => {
    const created = await simulateReceipt.mutateAsync();
    toast.success(`Nuevo comprobante recibido en ${created.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Banner Ejecutivo Superior */}
      <section className="bg-admin-header flex flex-col justify-between gap-4 rounded-2xl p-6 text-white shadow-sm sm:flex-row sm:items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D4AF37]/50 bg-[#112240] px-3 py-1 text-[11px] font-bold text-[#D4AF37]">
            <Icon icon="solar:shield-star-bold" className="h-3.5 w-3.5" />
            Panel de Control SaaS · Cine Small Admin
          </span>
          <h2 className="mt-2 font-heading text-2xl font-extrabold tracking-tight">
            Resumen Operativo de Ventas QR y Catálogo
          </h2>
          <p className="mt-1 text-xs text-slate-300">
            Supervisa transferencias QR, aprueba comprobantes y gestiona{' '}
            <strong className="text-white tabular-nums">
              {activeCatalogCount}
            </strong>{' '}
            ofertas publicadas en tiempo real.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link
            to="/pedidos"
            search={{ orderId: undefined }}
            className="inline-flex items-center gap-2 rounded-xl bg-[#D4AF37] px-4 py-2.5 text-xs font-extrabold text-[#0A192F] transition hover:bg-[#E5C158]"
          >
            <Icon icon="solar:qr-code-bold" className="h-4 w-4" />
            <span>Auditar Pagos QR</span>
          </Link>
          <button
            type="button"
            onClick={handleSimulateReceipt}
            className="inline-flex items-center gap-2 rounded-xl border border-[#D4AF37]/50 bg-[#112240] px-4 py-2.5 text-xs font-bold text-white transition hover:border-[#D4AF37] hover:text-[#D4AF37]"
          >
            <Icon icon="solar:bell-bing-bold" className="h-4 w-4 text-[#D4AF37]" />
            <span>Simular Nuevo Comprobante</span>
          </button>
        </div>
      </section>

      {/* 4 Tarjetas KPI Principales con borde superior dorado/azul */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-[#E2E8F0] border-t-4 border-t-[#0A192F] bg-white p-5 shadow-xs">
          <div className="flex items-start justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#475569]">
              Pedidos Pendientes
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0A192F]/10 text-[#0A192F]">
              <Icon icon="solar:clock-circle-bold-duotone" className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 font-heading text-3xl font-extrabold text-[#0A192F] tabular-nums">
            {kpis.pendingOrders}
          </p>
          <p className="mt-1 text-xs text-[#475569]">
            Requieren atención y seguimiento
          </p>
        </article>

        <article className="rounded-2xl border border-[#E2E8F0] border-t-4 border-t-[#D4AF37] bg-white p-5 shadow-xs">
          <div className="flex items-start justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#475569]">
              Comprobantes por Verificar
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FEF3C7] text-[#B5952F]">
              <Icon icon="solar:document-text-bold-duotone" className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 font-heading text-3xl font-extrabold text-[#B5952F] tabular-nums">
            {kpis.receiptsToVerify}
          </p>
          <p className="mt-1 text-xs text-[#475569]">
            Pagos QR pendientes de aprobación
          </p>
        </article>

        <article className="rounded-2xl border border-[#E2E8F0] border-t-4 border-t-[#112240] bg-white p-5 shadow-xs">
          <div className="flex items-start justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#475569]">
              Pagados / En Envío
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#112240]/10 text-[#112240]">
              <Icon icon="solar:box-check-bold-duotone" className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 font-heading text-3xl font-extrabold text-[#112240] tabular-nums">
            {kpis.paidOrShipping}
          </p>
          <p className="mt-1 text-xs text-[#475569]">
            Pedidos pagados o despachados
          </p>
        </article>

        <article className="rounded-2xl border border-[#E2E8F0] border-t-4 border-t-[#D4AF37] bg-white p-5 shadow-xs">
          <div className="flex items-start justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#475569]">
              Ingresos Totales Confirmados
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#10B981]/15 text-[#047857]">
              <Icon icon="solar:wallet-money-bold-duotone" className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 font-heading text-3xl font-extrabold text-[#10B981] tabular-nums">
            {formatCurrency(kpis.confirmedRevenue)}
          </p>
          <p className="mt-1 text-xs text-[#475569]">
            Suma de pedidos en estado Pagado/Enviado
          </p>
        </article>
      </section>

      {/* Gráfico + Alertas del Vendedor */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Gráfico Recharts */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="font-heading text-sm font-extrabold uppercase tracking-wider text-[#0A192F]">
                Distribución Financiera por Auditoría QR (Bs.)
              </h3>
              <p className="text-xs text-[#475569]">
                Montos consolidados según estado de comprobante
              </p>
            </div>
            <span className="rounded-lg bg-[#F8FAFC] px-2.5 py-1 text-xs font-bold text-[#0A192F] tabular-nums">
              {orders.length} pedidos totales
            </span>
          </div>
          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value))}
                />
                <Bar dataKey="monto" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alertas de Notificaciones del Vendedor */}
        <div className="flex flex-col rounded-2xl border border-[#E2E8F0] bg-white shadow-xs">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-4">
            <h3 className="flex items-center gap-2 font-heading text-sm font-extrabold uppercase tracking-wider text-[#0A192F]">
              <Icon icon="solar:bell-bing-bold" className="h-4 w-4 text-[#D4AF37]" />
              <span>Alertas del Vendedor</span>
            </h3>
            <button
              type="button"
              onClick={() => markAllRead.mutate()}
              className="text-xs font-bold text-[#0A192F] hover:text-[#D4AF37]"
            >
              Marcar leídas
            </button>
          </div>
          <div className="flex-1 divide-y divide-[#E2E8F0] overflow-y-auto max-h-72">
            {notifications.length === 0 ? (
              <p className="p-5 text-center text-xs text-[#475569]">
                Sin alertas nuevas por el momento.
              </p>
            ) : (
              notifications.slice(0, 6).map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => setSelectedOrderId(n.orderId)}
                  className={`block w-full px-5 py-3.5 text-left transition hover:bg-[#F8FAFC] ${
                    n.isRead ? 'opacity-75' : 'bg-[#FEF3C7]/25'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-extrabold text-[#0A192F]">
                      {n.title}
                    </span>
                    {!n.isRead && (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-[#D4AF37]" />
                    )}
                  </div>
                  <p className="mt-1 text-xs text-[#475569]">{n.message}</p>
                  <p className="mt-1 text-[10px] font-semibold text-slate-400 tabular-nums">
                    {formatDateShort(n.createdAt)}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Lista rápida de Últimos Pedidos Recibidos */}
      <section className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] px-5 py-4">
          <div>
            <h3 className="font-heading text-sm font-extrabold uppercase tracking-wider text-[#0A192F]">
              Últimos Pedidos Recibidos
            </h3>
            <p className="text-xs text-[#475569]">
              Haz clic en cualquier fila para auditar comprobante o aprobar pago QR
            </p>
          </div>
          <Link
            to="/pedidos"
            search={{ orderId: undefined }}
            className="inline-flex items-center gap-1 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1.5 text-xs font-bold text-[#0A192F] hover:border-[#D4AF37]"
          >
            <span>Ver todos los pedidos</span>
            <Icon icon="solar:arrow-right-linear" className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-[#E2E8F0]">
          {latestOrders.map((order) => (
            <div
              key={order.id}
              className="flex flex-col justify-between gap-3 px-5 py-4 transition hover:bg-[#F8FAFC] sm:flex-row sm:items-center"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-heading text-sm font-extrabold text-[#0A192F] tabular-nums">
                    {order.id}
                  </span>
                  <PaymentStatusBadge status={order.paymentStatus} />
                  <OrderStatusBadge status={order.orderStatus} />
                </div>
                <p className="truncate text-sm font-semibold text-[#0F172A]">
                  {order.customerName}{' '}
                  <span className="text-xs font-normal text-[#475569] tabular-nums">
                    · {order.items.length} ítem(s) ·{' '}
                    {formatDateShort(order.createdAt)}
                  </span>
                </p>
              </div>

              <div className="flex items-center justify-between gap-3 sm:justify-end">
                <span className="font-heading text-base font-extrabold text-[#0A192F] tabular-nums">
                  {formatCurrency(order.total)}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedOrderId(order.id)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#0A192F] px-3.5 py-2 text-xs font-bold text-[#D4AF37] transition hover:bg-[#112240]"
                >
                  <Icon icon="solar:eye-bold" className="h-3.5 w-3.5" />
                  <span>Gestionar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <OrderAuditDrawer
        order={selectedOrder}
        onClose={() => setSelectedOrderId(null)}
      />
    </div>
  );
}

